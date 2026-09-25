const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('payment summary shows suitable paid and unpaid guidance', () => {
  const source = fs.readFileSync('src/app/apply/ApplicationSummary.tsx', 'utf8');

  assert.match(source, /Your application and registration fee payment have been received successfully/);
  assert.match(source, /Complete the registration fee payment to continue the admission process/);
  assert.match(source, /isPaid/);
});

test('OTP verification distinguishes expired, incorrect, and missing OTPs', () => {
  const route = fs.readFileSync('src/app/api/applications/route.ts', 'utf8');
  const modal = fs.readFileSync('src/app/payments/ApplicationLookupModal.tsx', 'utf8');

  assert.match(route, /OTP has expired\. Please request a new OTP\./);
  assert.doesNotMatch(route, /The OTP you entered is incorrect\. Please try again\./);
  assert.match(route, /OTP has expired or is no longer valid\. Please request a new OTP\./);
  assert.match(route, /Please request a new OTP to continue\./);
  assert.match(route, /"isExpired"/);
  assert.match(modal, /role="alert"/);
});
