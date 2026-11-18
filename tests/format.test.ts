import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate } from '../utils/format';

describe('format helpers', () => {
  it('formats', () => {
    formatMoney(1234);
  });

  it('includes the year in formatted dates', () => {
    expect(formatDate('2025-03-01T12:00:00Z')).toContain('2025');
  });
});
