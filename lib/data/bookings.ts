import { createClient } from '../supabase/server';
import type { Booking } from '../types';

const BOOKING_SELECT = '*, listing:listings(id, title, seller:profiles(id, display_name))';

export async function listBookingsFor(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Booking[];
}

export async function getBooking(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as Booking | null;
}
