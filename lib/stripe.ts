import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is missing. Please set the environment variable.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  typescript: true,
  appInfo: {
    name: 'Achievers Junior College',
    version: '0.1.0'
  }
});
