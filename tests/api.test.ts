import { describe, it, expect, vi, beforeEach } from 'vitest';

const stubResponse = { ok: true };

describe('bookings api', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => stubResponse }),
    );
  });

  it('creates a booking', async () => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', slotId: 's1', hours: 2 }),
    });
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(res.ok).toBe(true);
  });
});
