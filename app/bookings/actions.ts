'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function confirmBooking(id: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { error } = await supabase.rpc('confirm_booking', { booking: id });
  if (error) throw new Error(error.message);

  revalidatePath(`/bookings/${id}`);
  revalidatePath('/bookings');
}

export async function submitReview(bookingId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const rating = Number(formData.get('rating'));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const { error } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    author_id: user.id,
    rating,
    body_md: String(formData.get('body') ?? ''),
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/bookings/${bookingId}`);
}
