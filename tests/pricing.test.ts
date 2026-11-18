import { describe, it, expect } from 'vitest';
import { bookingTotalCents } from '../lib/pricing';

describe('bookingTotalCents', () => {
  it('applies the default platform fee', () => {
    expect(bookingTotalCents(5000, 2)).toBe(11200);
  });

  it('applies a custom fee', () => {
    expect(bookingTotalCents(10000, 1, 10)).toBe(11000);
  });

  it('returns the base amount with a zero fee', () => {
    expect(bookingTotalCents(2500, 4, 0)).toBe(10000);
  });

  it('rounds to whole cents', () => {
    expect(bookingTotalCents(3333, 1)).toBe(3733);
  });

  it('returns zero for zero hours', () => {
    expect(bookingTotalCents(5000, 0)).toBe(0);
  });
});
