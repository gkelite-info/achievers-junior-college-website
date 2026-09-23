const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function loadHelper(fetchImpl) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('lib/helpers/applicationsAPI.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('exports', 'require', 'fetch', source)(exports, () => ({
    supabase: { from: () => ({ insert: async () => ({ error: new Error('Database unavailable') }) }) },
  }), fetchImpl);
  return exports;
}

test('a failed save rejects instead of returning an invented successful application', async () => {
  const helper = loadHelper(async () => new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 503 }));
  await assert.rejects(helper.saveApplication({ firstName: 'Test' }), /Database unavailable/);
});

test('saving sends the original files as multipart data and uses the database response', async () => {
  const photo = new File([new Uint8Array([255, 216, 255])], 'photo.jpg', { type: 'image/jpeg' });
  const certificate = new File(['%PDF-1.7'], 'marks.pdf', { type: 'application/pdf' });
  const helper = loadHelper(async (url, options) => {
    assert.equal(url, '/api/applications');
    assert.ok(options.body instanceof FormData);
    assert.equal(options.body.get('profileImage'), photo);
    assert.equal(options.body.get('classXCertificate'), certificate);
    assert.equal(JSON.parse(options.body.get('payload')).firstName, 'Test');
    return Response.json({ application: { user: { userId: 41, applicationNumber: 'AJC-41' }, education: { educationId: 52, userId: 41 } } });
  });
  const result = await helper.saveApplication({ firstName: 'Test', profileImage: photo, classXCertificate: certificate });
  assert.equal(result.user.userId, 41);
  assert.equal(result.education.userId, 41);
});

test('a malformed successful HTTP response is not treated as a saved application', async () => {
  const helper = loadHelper(async () => Response.json({}));
  await assert.rejects(helper.saveApplication({ firstName: 'Test' }), /confirm/i);
});

test('create generates a retry ID and update targets the specified existing application', async () => {
  const calls = [];
  const helper = loadHelper(async (_url, options) => {
    calls.push({ method: options.method, payload: JSON.parse(options.body.get('payload')) });
    return Response.json({ application: { user: { applicationNumber: 'AJC-41' }, education: null } });
  });
  assert.equal(typeof helper.createApplication, 'function', 'CRUD helper must expose createApplication');
  await helper.createApplication({ firstName: 'Test' });
  await helper.updateApplication('AJC-41', { firstName: 'Updated' });
  assert.equal(calls[0].method, 'POST');
  assert.match(calls[0].payload.submissionId, /^[a-f0-9-]{36}$/);
  assert.equal(calls[0].payload.applicationNumber, undefined);
  assert.equal(calls[1].method, 'PUT');
  assert.equal(calls[1].payload.applicationNumber, 'AJC-41');
});

test('delete sends the application number and requires confirmed deletion', async () => {
  const helper = loadHelper(async (url, options) => {
    assert.equal(url, '/api/applications');
    assert.equal(options.method, 'DELETE');
    assert.deepEqual(JSON.parse(options.body), { applicationNumber: 'AJC-41' });
    return Response.json({ deleted: true, applicationNumber: 'AJC-41' });
  });
  assert.equal(typeof helper.deleteApplication, 'function', 'CRUD helper must expose deleteApplication');
  assert.deepEqual(await helper.deleteApplication(' AJC-41 '), { deleted: true, applicationNumber: 'AJC-41' });
  const failed = loadHelper(async () => Response.json({ error: 'Access denied' }, { status: 403 }));
  await assert.rejects(failed.deleteApplication('AJC-41'), /Access denied/);
  const unconfirmed = loadHelper(async () => Response.json({}));
  await assert.rejects(unconfirmed.deleteApplication('AJC-41'), /confirm/i);
});
