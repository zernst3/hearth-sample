import { z } from 'zod';

export const bookingInput = z.object({
  listingId: z.string().uuid(),
  slotId: z.string().uuid(),
  hours: z.number().int().min(1).max(12),
});

export const listingInput = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(5000).default(''),
  priceCents: z.number().int().positive().max(1_000_000),
  category: z.string().trim().min(2).max(40),
});

export type BookingInput = z.infer<typeof bookingInput>;
export type ListingInput = z.infer<typeof listingInput>;
