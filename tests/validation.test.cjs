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

const { formatName, formatTitleCase, formatSchoolOrBoard, formatDigitsOnly } = load('src/app/apply/validation.ts');

test('formatName converts small letters to capital, keeps dots and spaces, strips digits and special characters', () => {
  assert.equal(formatName('john'), 'John');
  assert.equal(formatName('john doe'), 'John Doe');
  assert.equal(formatName('k.raju'), 'K.Raju');
  assert.equal(formatName('k. raju'), 'K. Raju');
  assert.equal(formatName('a.b. c'), 'A.B. C');
  assert.equal(formatName('john123!@#'), 'John');
  assert.equal(formatName('mary  jane'), 'Mary Jane');
});

test('formatTitleCase capitalizes first letter and after space, strips numbers and special chars', () => {
  assert.equal(formatTitleCase('telangana'), 'Telangana');
  assert.equal(formatTitleCase('andhra pradesh'), 'Andhra Pradesh');
  assert.equal(formatTitleCase('new delhi123!'), 'New Delhi');
});

test('formatSchoolOrBoard capitalizes start and after space/dot, strips numbers and symbols', () => {
  assert.equal(formatSchoolOrBoard('achievers high school'), 'Achievers High School');
  assert.equal(formatSchoolOrBoard('state board'), 'State Board');
  assert.equal(formatSchoolOrBoard('st. mary school'), 'St. Mary School');
  assert.equal(formatSchoolOrBoard('cbse 123!'), 'Cbse ');
});

test('formatDigitsOnly extracts digits and limits length', () => {
  assert.equal(formatDigitsOnly('9876543210123', 10), '9876543210');
  assert.equal(formatDigitsOnly('2024abc!', 4), '2024');
  assert.equal(formatDigitsOnly('85%', 2), '85');
  assert.equal(formatDigitsOnly('100', 2), '10');
});

test('validates First Name, Last Name, Father and Mother Name capitalization and character constraints', () => {
  // Lowercase first letter should fail
  assert.ok(validateApplication({ ...validApplicant, firstName: 'ramu' }, undefined, dummyFiles).firstName);
  assert.ok(validateApplication({ ...validApplicant, lastName: 'kumar' }, undefined, dummyFiles).lastName);
  assert.ok(validateApplication({ ...validApplicant, fatherName: 'raju' }, undefined, dummyFiles).fatherName);
  assert.ok(validateApplication({ ...validApplicant, motherName: 'rani' }, undefined, dummyFiles).motherName);

  // Digits and special characters should fail
  assert.ok(validateApplication({ ...validApplicant, firstName: 'Ramu123' }, undefined, dummyFiles).firstName);
  assert.ok(validateApplication({ ...validApplicant, lastName: 'Kumar@' }, undefined, dummyFiles).lastName);
  assert.ok(validateApplication({ ...validApplicant, fatherName: 'Raju#' }, undefined, dummyFiles).fatherName);

  // Lowercase after space should fail
  assert.ok(validateApplication({ ...validApplicant, firstName: 'Ramu kumar' }, undefined, dummyFiles).firstName);

  // Dots and spaces with capital letters are valid
  assert.equal(validateApplication({ ...validApplicant, firstName: 'K. Ramu' }, undefined, dummyFiles).firstName, undefined);
  assert.equal(validateApplication({ ...validApplicant, lastName: 'K.' }, undefined, dummyFiles).lastName, undefined);
  assert.equal(validateApplication({ ...validApplicant, fatherName: 'P. Raju Kumar' }, undefined, dummyFiles).fatherName, undefined);
});

test('validates State and City capitalization and no special characters', () => {
  assert.ok(validateApplication({ ...validApplicant, state: 'telangana' }, undefined, dummyFiles).state);
  assert.ok(validateApplication({ ...validApplicant, state: 'Andhra pradesh' }, undefined, dummyFiles).state);
  assert.ok(validateApplication({ ...validApplicant, state: 'Telangana123' }, undefined, dummyFiles).state);
  assert.equal(validateApplication({ ...validApplicant, state: 'Andhra Pradesh' }, undefined, dummyFiles).state, undefined);

  assert.ok(validateApplication({ ...validApplicant, city: 'kamareddy' }, undefined, dummyFiles).city);
  assert.ok(validateApplication({ ...validApplicant, city: 'New delhi' }, undefined, dummyFiles).city);
  assert.equal(validateApplication({ ...validApplicant, city: 'New Delhi' }, undefined, dummyFiles).city, undefined);
});

test('validates School Name and Board capitalization and no integers', () => {
  assert.ok(validateApplication({ ...validApplicant, classXSchool: 'achievers high' }, undefined, dummyFiles).classXSchool);
  assert.ok(validateApplication({ ...validApplicant, classXSchool: 'Achievers 123' }, undefined, dummyFiles).classXSchool);
  assert.ok(validateApplication({ ...validApplicant, classXSchool: 'Achievers high school' }, undefined, dummyFiles).classXSchool);
  assert.equal(validateApplication({ ...validApplicant, classXSchool: 'St. Mary High School' }, undefined, dummyFiles).classXSchool, undefined);

  assert.ok(validateApplication({ ...validApplicant, classXBoard: 'state board' }, undefined, dummyFiles).classXBoard);
  assert.ok(validateApplication({ ...validApplicant, classXBoard: 'State board' }, undefined, dummyFiles).classXBoard);
  assert.ok(validateApplication({ ...validApplicant, classXBoard: 'CBSE 12' }, undefined, dummyFiles).classXBoard);
  assert.equal(validateApplication({ ...validApplicant, classXBoard: 'State Board' }, undefined, dummyFiles).classXBoard, undefined);
});

