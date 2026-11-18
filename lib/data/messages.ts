import { createClient } from '../supabase/server';
import type { Message } from '../types';

export async function listMessages(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .order('seq', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
}
