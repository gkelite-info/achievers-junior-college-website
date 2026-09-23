const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function load(file, dependencies = {}, overrides = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const internals = file === 'src/app/api/applications/route.ts' ? ['validateApplicationFile', 'createApplicationNumber', 'canAccessApplication', 'grantApplicationAccess', 'persistApplication', 'deleteStoredApplication'] : [];
  const assignments = Object.keys(overrides).map(name => name + ' = overrides[' + JSON.stringify(name) + '];').join('\n');
  const expose = internals.length ? 'Object.assign(exports, {' + internals.join(',') + '});' : '';
  new Function('exports', 'require', 'overrides', source + '\n' + assignments + '\n' + expose)(exports, (name) => {
    if (name === 'server-only') return {};
    if (name in dependencies) return dependencies[name];
    if (name === '@/lib/db') return { pool: {} };
    if (name === '@/app/apply/validation') return {};
    return require(name);
  }, overrides);
  return exports;
}

const storage = load('src/app/api/applications/route.ts');

test('file validation rejects renamed contents, mismatched MIME types, empty and oversized files', async () => {
  await assert.rejects(storage.validateApplicationFile(new File(['not a jpeg'], 'photo.jpg', { type: 'image/jpeg' }), 'profileImage'), /contents/);
  await assert.rejects(storage.validateApplicationFile(new File(['%PDF-1.7'], 'marks.pdf', { type: 'image/png' }), 'classXCertificate'), /PDF/);
  await assert.rejects(storage.validateApplicationFile(new File([], 'empty.pdf'), 'classXCertificate'), /5 MB/);
  await assert.rejects(storage.validateApplicationFile(new File([new Uint8Array(5242881)], 'large.jpg'), 'profileImage'), /5 MB/);
  await storage.validateApplicationFile(new File([new Uint8Array([255, 216, 255, 224])], 'photo.jpeg', { type: 'image/jpeg' }), 'profileImage');
  await storage.validateApplicationFile(new File(['%PDF-1.7'], 'marks.pdf', { type: 'application/pdf' }), 'classXCertificate');
});

test('application access cookie is scoped to one application and rejects tampering and expiry', () => {
  const previous = process.env.APPLICATION_COOKIE_SECRET;
  process.env.APPLICATION_COOKIE_SECRET = 'test-secret-not-used-outside-tests';
  try {
    const access = load('src/app/api/applications/route.ts');
    const retryToken = '12345678-abcd-4abc-8abc-123456789abc';
    const number = access.createApplicationNumber(retryToken);
    assert.equal(access.createApplicationNumber(retryToken), number);
    assert.notEqual(access.createApplicationNumber('87654321-abcd-4abc-8abc-123456789abc'), number);
    // Revealing the retry token in the public number would allow unauthorized replays.
    assert.equal(number.includes(retryToken.replaceAll('-', '').toUpperCase()), false);
    const cookies = new Map();
    access.grantApplicationAccess({
      cookies: {
        set: (name, value, options) => {
          assert.equal(options.httpOnly, true);
          cookies.set(name, { value });
        }
      }
    }, 'AJC-1');
    const request = { cookies: { get: (name) => cookies.get(name) } };
    assert.equal(access.canAccessApplication(request, 'AJC-1'), true);
    assert.equal(access.canAccessApplication(request, 'AJC-2'), false);
    const [name, cookie] = [...cookies][0];
    cookies.set(name, { value: cookie.value.slice(0, -1) + (cookie.value.endsWith('0') ? '1' : '0') });
    assert.equal(access.canAccessApplication(request, 'AJC-1'), false);
    cookies.set(name, { value: '1.' + cookie.value.split('.')[1] });
    assert.equal(access.canAccessApplication(request, 'AJC-1'), false);
  } finally {
    if (previous === undefined) delete process.env.APPLICATION_COOKIE_SECRET;
    else process.env.APPLICATION_COOKIE_SECRET = previous;
  }
});

function repository({ failEducation = false, failSecondUpload = false, failCommitAcknowledgement = false, idType = 'integer', existing = null } = {}) {
  let transaction = [];
  let committed = [];
  let releases = 0;
  const removed = [];
  const events = [];
  const client = {
    release() { releases++; },
    async query(sql, args) {
      events.push(sql);
      if (sql === 'BEGIN') { transaction = []; return {}; }
      if (sql === 'ROLLBACK') { transaction = []; return {}; }
      if (sql === 'COMMIT') {
        committed = [...transaction];
        if (failCommitAcknowledgement) throw new Error('connection lost after commit');
        return {};
      }
      if (sql.includes('pg_advisory_xact_lock')) return {};
      if (sql.startsWith('SELECT *, to_char')) return { rows: existing ? [existing.user] : [] };
      if (sql.startsWith('SELECT * FROM public.user_education')) return { rows: existing?.education ? [existing.education] : [] };
      if (sql.includes('information_schema.columns')) return { rows: [{ data_type: idType }] };
      if (sql.startsWith('INSERT INTO')) {
        const isUser = sql.includes('public."users"');
        if (!isUser && failEducation) throw new Error('education insert failed');
        const columns = [...sql.slice(sql.indexOf('('), sql.indexOf(')')).matchAll(/"([^"]+)"/g)].map(match => match[1]);
        const record = Object.fromEntries(columns.slice(0, args.length).map((name, i) => [name, args[i]]));
        record[isUser ? 'userId' : 'educationId'] ??= isUser ? 41 : 52;
        transaction.push(record);
        return { rows: [record] };
      }
      if (sql.startsWith('UPDATE')) {
        const isUser = sql.includes('public."users"');
        const columns = [...sql.matchAll(/"([^"]+)" = \$\d+/g)].map(match => match[1]);
        const record = { ...(isUser ? existing.user : existing.education) };
        columns.forEach((name, i) => { record[name] = args[i]; });
        transaction.push(record);
        return { rows: [record] };
      }
      throw new Error('Unexpected SQL in test: ' + sql);
    },
  };
  const helper = load('src/app/api/applications/route.ts', {
    '@/lib/db': { pool: { connect: async () => client } },
  }, {
    uploadApplicationFile: async (_file, number, kind) => {
      if (kind === 'classXCertificate' && failSecondUpload) throw new Error('certificate upload failed');
      return `${number}/${kind}-new`;
    },
    removeApplicationFiles: async paths => { removed.push(...paths); },
    withApplicationAttachments: async result => result,
  });
  return { ...helper, removed, events, committed: () => committed, releases: () => releases };
}

const payload = {
  firstName: 'Test', dateOfBirth: '2010-05-15', profileImage: new File(['image'], 'photo.jpg'),
  classXCertificate: new File(['pdf'], 'marks.pdf'), classXSchool: 'Test School', classXBoard: 'SSC',
};

test('education failure rolls back personal details and removes both newly uploaded documents', async () => {
  const repo = repository({ failEducation: true });
  await assert.rejects(repo.persistApplication(payload, 'AJC-1'), /education insert failed/);
  assert.deepEqual(repo.committed(), []);
  assert.ok(repo.events.includes('ROLLBACK'));
  assert.deepEqual(repo.removed, ['AJC-1/profileImage-new', 'AJC-1/classXCertificate-new']);
  assert.equal(repo.releases(), 1);
});

test('second upload failure removes the first file and commits no database rows', async () => {
  const repo = repository({ failSecondUpload: true });
  await assert.rejects(repo.persistApplication(payload, 'AJC-1'), /certificate upload failed/);
  assert.deepEqual(repo.committed(), []);
  assert.deepEqual(repo.removed, ['AJC-1/profileImage-new']);
});

test('lost commit acknowledgement never deletes files potentially referenced by committed records', async () => {
  const repo = repository({ failCommitAcknowledgement: true });
  await assert.rejects(repo.persistApplication(payload, 'AJC-1'), /connection lost/);
  assert.equal(repo.committed().length, 2);
  assert.deepEqual(repo.removed, []);
});

test('saving with integer IDs links education to the ID returned by the database', async () => {
  const repo = repository();
  const result = await repo.persistApplication(payload, 'AJC-1');
  assert.equal(result.user.userId, 41);
  assert.equal(result.education.educationId, 52);
  assert.equal(result.education.userId, 41);
  assert.equal(result.user.registrationFee, 500);
  assert.equal(result.user.submissionTime, null);
  assert.equal(repo.committed().length, 2);
  assert.deepEqual(repo.removed, []);
});

test('legacy UUID IDs remain supported without converting existing tables', async () => {
  const repo = repository({ idType: 'uuid' });
  const result = await repo.persistApplication(payload, 'AJC-1');
  assert.match(result.user.userId, /^[a-f0-9-]{36}$/);
  assert.equal(result.education.userId, result.user.userId);
});

test('editing preserves IDs and payment status and removes only replaced files after commit', async () => {
  const existing = { user: { userId: 41, applicationNumber: 'AJC-1', profileImageRef: 'AJC-1/old-photo', registrationFee: '500.00', applicationStatus: 'Submitted', submissionTime: '2026-09-01' }, education: { educationId: 52, userId: 41, certificateRef: 'AJC-1/old-certificate' } };
  const repo = repository({ existing });
  const result = await repo.persistApplication({ ...payload, applicationNumber: 'AJC-1', classXCertificate: undefined }, 'AJC-1');
  assert.equal(result.user.userId, 41);
  assert.equal(result.education.educationId, 52);
  assert.equal(result.education.certificateRef, 'AJC-1/old-certificate');
  assert.equal(result.user.applicationStatus, 'Submitted');
  assert.deepEqual(repo.removed, ['AJC-1/old-photo']);
  assert.equal(repo.committed().length, 2);
});

test('retrying a successful creation with the same submission ID does not insert or upload again', async () => {
  const existing = { user: { userId: 41, applicationNumber: 'AJC-1' }, education: { educationId: 52, userId: 41 } };
  const repo = repository({ existing });
  const result = await repo.persistApplication(payload, 'AJC-1');
  assert.equal(result.user.userId, 41);
  assert.deepEqual(repo.committed(), []);
  assert.deepEqual(repo.removed, []);
});

test('soft deletion updates both linked records and rolls back if education deletion fails', async () => {
  for (const failEducation of [false, true]) {
    let committed = [];
    let pending = [];
    let released = false;
    const client = {
      release() { released = true; },
      async query(sql, values) {
        if (sql === 'BEGIN') { pending = []; return {}; }
        if (sql === 'ROLLBACK') { pending = []; return {}; }
        if (sql === 'COMMIT') { committed = [...pending]; return {}; }
        if (sql.includes('pg_advisory_xact_lock')) return {};
        assert.match(sql, /is_deleted = true/);
        assert.match(sql, /"isActive" = false/);
        assert.match(sql, /"deletedAt" = COALESCE\("deletedAt", NOW\(\)\)/);
        if (sql.startsWith('UPDATE public.users ')) {
          assert.deepEqual(values, ['AJC-41']);
          pending.push('user');
          return { rows: [{ userId: 41 }] };
        }
        assert.ok(sql.startsWith('UPDATE public.user_education '));
        assert.deepEqual(values, [41]);
        if (failEducation) throw new Error('education delete failed');
        pending.push('education');
        return { rows: [] };
      },
    };
    const helper = load('src/app/api/applications/route.ts', {
      '@/lib/db': { pool: { connect: async () => client } },
    });
    if (failEducation) {
      await assert.rejects(helper.deleteStoredApplication('AJC-41'), /education delete failed/);
      assert.deepEqual(committed, []);
    } else {
      assert.equal(await helper.deleteStoredApplication('AJC-41'), true);
      assert.deepEqual(committed, ['user', 'education']);
    }
    assert.equal(released, true);
  }
});

test('DELETE route refuses unverified applications before performing any database write', async () => {
  const { NextRequest } = require('next/server');
  let wrote = false;
  const route = load('src/app/api/applications/route.ts', {
  }, {
    canAccessApplication: () => false,
    deleteStoredApplication: async () => { wrote = true; return true; },
  });
  const response = await route.DELETE(new NextRequest('http://localhost/api/applications', {
    method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ applicationNumber: 'AJC-41' }),
  }));
  assert.equal(response.status, 403);
  assert.equal(wrote, false);
});
