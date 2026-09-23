const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function load(file) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('exports', source)(exports);
  return exports;
}
const store = load('src/app/apply/applicationPreviewStore.ts');
const { findApplication } = load('src/app/payments/applicationLookup.ts');
function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const student = { firstName: 'Test', lastName: 'Student', phone: '9000000007', dateOfBirth: '2010-06-18', classXSchool: 'School', classIXSchool: 'Old field' };

test('save now, reload later, and match the saved application', () => {
  const db = storage();
  const saved = store.savePreviewApplication(student, db);
  assert.ok(saved.applicationId.startsWith('AJC-2026-') || saved.applicationId.startsWith('AJC-INTER-') || saved.applicationId.startsWith('AJC-DEMO-'));
  assert.equal(saved.paymentStatus, 'pending');
  assert.equal(saved.classIXSchool, undefined);
  const records = store.getPreviewApplications([], db);
  assert.equal(findApplication(records, saved.applicationId, saved.phone, saved.dateOfBirth).firstName, 'Test');
  assert.equal(findApplication(records, saved.applicationId, '9000000008', saved.dateOfBirth), undefined);
  assert.equal(findApplication(records, saved.applicationId, saved.phone, '2011-06-18'), undefined);
  assert.equal(findApplication(records, '', saved.phone, saved.dateOfBirth), undefined);
});

test('demo payment persists; repeat payment and later edits retain the receipt', () => {
  const db = storage();
  const saved = store.savePreviewApplication(student, db);
  const paid = store.markPreviewPaid(saved, db);
  assert.equal(paid.paymentStatus, 'paid_demo');
  assert.ok(paid.paymentReference.startsWith('DEMO-'));
  assert.equal(store.markPreviewPaid(saved, db).paymentReference, paid.paymentReference);
  const edited = store.savePreviewApplication({ ...saved, firstName: 'Edited' }, db);
  assert.equal(edited.paymentReference, paid.paymentReference);
  assert.equal(edited.paymentStatus, 'paid_demo');
  assert.equal(store.getPreviewApplications([], db).length, 1);
});

test('local records override static samples and storage failures are surfaced', () => {
  const db = storage();
  const sample = { ...student, applicationId: 'SAMPLE-1' };
  store.markPreviewPaid(sample, db);
  assert.equal(store.getPreviewApplications([sample], db)[0].paymentStatus, 'paid_demo');
  assert.throws(() => store.savePreviewApplication(student, { getItem: () => null, setItem: () => { throw Error('Storage full'); } }));
});
