import Stripe from 'stripe';

// Vérifier si nous sommes en mode build
const isBuild = process.env.NODE_ENV === 'production' && !process.env.STRIPE_SECRET_KEY;

// Si nous sommes en build, utiliser une clé factice
const stripeSecretKey = isBuild 
  ? 'sk_test_dummy_for_build'
  : process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export default stripe; 