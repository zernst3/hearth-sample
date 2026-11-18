import { PLATFORM_FEE_PCT } from './config';

export function bookingTotalCents(
  priceCents: number,
  hours: number,
  feePct = PLATFORM_FEE_PCT,
): number {
  const subtotal = priceCents * hours;
  return Math.round(subtotal + (subtotal * feePct) / 100);
}
