const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Stripe payment flow reads payment state from the transaction ledger', () => {
  const checkout = fs.readFileSync('src/app/api/stripe/create-checkout-session/route.ts', 'utf8');
  const processing = fs.readFileSync('lib/helpers/processStripePayment.ts', 'utf8');
  const applicationsRoute = fs.readFileSync('src/app/api/applications/route.ts', 'utf8');
  const applicationsHelper = fs.readFileSync('lib/helpers/applicationsAPI.ts', 'utf8');
  const verification = fs.readFileSync('src/app/api/stripe/verify-session/route.ts', 'utf8');
  const summary = fs.readFileSync('src/app/apply/ApplicationSummary.tsx', 'utf8');

  assert.doesNotMatch(checkout, /users[^`]*paymentStatus|"paymentStatus"/s);
  assert.match(checkout, /application_transactions/);
  assert.match(checkout, /LOWER\(t\."status"::text\)\s*=\s*'success'/i);
  assert.doesNotMatch(processing, /UPDATE\s+public\.users\s+SET\s+"paymentStatus"/i);
  assert.match(processing, /INSERT INTO public\.application_transactions/);
  assert.match(applicationsRoute, /application_transactions/);
  assert.match(applicationsRoute, /paymentStatus/);
  assert.match(applicationsHelper, /paymentStatus\?:\s*"success"\s*\|\s*"pending"/);
  assert.match(applicationsHelper, /details\.paymentStatus\s*=\s*application\.paymentStatus/);
  assert.match(verification, /paymentStatus:\s*isPaid\s*\?\s*"success"\s*:\s*"pending"/);
  assert.match(summary, /disabled=\{isPaid\s*\|\|\s*showPayment\}/);
});
