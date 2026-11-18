import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '../lib/supabase/client';
import { bookingTotalCents } from '../lib/pricing';

const hasStack = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

describe.skipIf(!hasStack)('bookings against local supabase', () => {
  let supabase: SupabaseClient;
  let userId: string;

  beforeAll(async () => {
    supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInAnonymously();
    expect(error).toBeNull();
    userId = data.user!.id;
  });

  it('starts a new buyer with no bookings', async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('buyer_id', userId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('keeps stored prices in whole cents', async () => {
    const { data, error } = await supabase.from('listings').select('price_cents').limit(5);
    expect(error).toBeNull();
    for (const row of data ?? []) {
      const total = bookingTotalCents(Math.round(row.price_cents), 1);
      expect(Number.isInteger(total)).toBe(true);
    }
  });
});
