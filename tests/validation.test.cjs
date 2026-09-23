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

const { validateApplication } = load('src/app/apply/validation.ts');

const validApplicant = {
  applicationFor: 'Intermediate First Year',
  course: 'MEC',
  firstName: 'Ramu',
  lastName: 'Kumar',
  fatherName: 'Raju',
  motherName: 'Rani',
  gender: 'Male',
  dateOfBirth: '2009-05-15',
  nationality: 'Indian',
  category: 'OBC',
  address: 'H.No 1-23, Gandhi Nagar, Kamareddy',
  state: 'Telangana',
  city: 'Kamareddy',
  pinCode: '503111',
  phone: '9876543210',
  email: 'ramu.kumar@example.com',
  classXSchool: 'Achievers High School',
  classXBoard: 'State Board',
  classXYear: '2024',
  classXPercentage: '88.5',
  classXMedium: 'English',
};

const dummyFiles = {
  profileImage: { name: 'photo.jpg', type: 'image/jpeg', size: 1024 * 50 },
  classXCertificate: { name: 'cert.pdf', type: 'application/pdf', size: 1024 * 100 },
};

test('valid application passes all validations with zero errors', () => {
  const errors = validateApplication(validApplicant, undefined, dummyFiles);
  assert.deepEqual(errors, {});
});

test('detects missing required fields when empty', () => {
  const errors = validateApplication({});
  assert.ok(errors.applicationFor);
  assert.ok(errors.course);
  assert.ok(errors.firstName);
  assert.ok(errors.lastName);
  assert.ok(errors.fatherName);
  assert.ok(errors.motherName);
  assert.ok(errors.gender);
  assert.ok(errors.dateOfBirth);
  assert.ok(errors.nationality);
  assert.ok(errors.category);
  assert.ok(errors.address);
  assert.ok(errors.state);
  assert.ok(errors.city);
  assert.ok(errors.pinCode);
  assert.ok(errors.phone);
  assert.ok(errors.email);
  assert.ok(errors.profileImage);
  assert.ok(errors.classXSchool);
  assert.ok(errors.classXBoard);
  assert.ok(errors.classXYear);
  assert.ok(errors.classXPercentage);
  assert.ok(errors.classXMedium);
  assert.ok(errors.classXCertificate);
});

test('validates phone format (must be 10 digits starting with 6-9)', () => {
  const invalid1 = validateApplication({ ...validApplicant, phone: '12345' }, undefined, dummyFiles);
  assert.ok(invalid1.phone);
  const invalid2 = validateApplication({ ...validApplicant, phone: '0987654321' }, undefined, dummyFiles);
  assert.ok(invalid2.phone);
  const valid = validateApplication({ ...validApplicant, phone: '9876543210' }, undefined, dummyFiles);
  assert.equal(valid.phone, undefined);
});

test('validates email format', () => {
  const invalid = validateApplication({ ...validApplicant, email: 'not-an-email' }, undefined, dummyFiles);
  assert.ok(invalid.email);
  const valid = validateApplication({ ...validApplicant, email: 'test.student@domain.co.in' }, undefined, dummyFiles);
  assert.equal(valid.email, undefined);
});

test('validates pin code (6 digits, non-zero start)', () => {
  const invalid1 = validateApplication({ ...validApplicant, pinCode: '012345' }, undefined, dummyFiles);
  assert.ok(invalid1.pinCode);
  const invalid2 = validateApplication({ ...validApplicant, pinCode: '5001' }, undefined, dummyFiles);
  assert.ok(invalid2.pinCode);
  const valid = validateApplication({ ...validApplicant, pinCode: '500001' }, undefined, dummyFiles);
  assert.equal(valid.pinCode, undefined);
});

test('validates Class X percentage range (0 - 100)', () => {
  const invalid1 = validateApplication({ ...validApplicant, classXPercentage: '105' }, undefined, dummyFiles);
  assert.ok(invalid1.classXPercentage);
  const invalid2 = validateApplication({ ...validApplicant, classXPercentage: '-5' }, undefined, dummyFiles);
  assert.ok(invalid2.classXPercentage);
  const valid = validateApplication({ ...validApplicant, classXPercentage: '92.4' }, undefined, dummyFiles);
  assert.equal(valid.classXPercentage, undefined);
});
