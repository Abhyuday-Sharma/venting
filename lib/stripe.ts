import Stripe from 'stripe';

let stripe: Stripe | null = null;

// Only initialize Stripe if the secret key is available
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
        typescript: true,
    });
} else {
    // In a server environment, this warning will appear in the logs
    console.warn('STRIPE_SECRET_KEY is not set. Stripe integration will be disabled.');
}

export { stripe };
