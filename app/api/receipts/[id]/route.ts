import { NextResponse } from 'next/server';
import { apiError } from '@/lib/errors';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError(401, 'unauthorized', 'Sign in to view receipts');

  const { data: booking } = await supabase.from('bookings').select('id').eq('id', id).maybeSingle();
  if (!booking) return apiError(404, 'not_found', 'Booking not found');

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from('booking-docs')
    .createSignedUrl(`receipts/${id}.pdf`, 300);
  if (error || !data) return apiError(404, 'not_found', 'Receipt is not available yet');

  return NextResponse.redirect(data.signedUrl);
}
