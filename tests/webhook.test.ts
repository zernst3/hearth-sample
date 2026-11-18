import { describe, it, expect, beforeAll } from 'vitest';
import session from './fixtures/session.json';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.STRIPE_SECRET_KEY = session.api_key;

const secret = 'whsec_test_secret';

describe('stripe webhook signature', () => {
  let stripe: typeof import('../lib/stripe').stripe;

  beforeAll(async () => {
    ({ stripe } = await import('../lib/stripe'));
  });

  it('accepts a correctly signed checkout event', () => {
    const payload = JSON.stringify({
      id: 'evt_test_1',
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: session.checkout },
    });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const event = stripe.webhooks.constructEvent(payload, header, secret);
    expect(event.type).toBe('checkout.session.completed');
    expect((event.data.object as { id: string }).id).toBe(session.checkout.id);
  });

  it('rejects a tampered payload', () => {
    const payload = JSON.stringify({ id: 'evt_test_2', type: 'checkout.session.completed' });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(() => stripe.webhooks.constructEvent(payload + ' ', header, secret)).toThrow();
  });
});
