import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatMoney } from '@/utils/format';

type Props = { searchParams: Promise<{ session_id?: string; booking?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id: sessionId, booking: bookingId } = await searchParams;
  const admin = createAdminClient();
  let total: number | null = null;

  if (sessionId && bookingId) {
    const { data } = await admin
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', bookingId)
      .select('price_cents')
      .maybeSingle();
    total = data?.price_cents ?? null;

    await admin
      .from('payments')
      .update({ stripe_session_id: sessionId })
      .eq('booking_id', bookingId);
  }

  return (
    <div className="success">
      <h1>Payment received</h1>
      {total !== null ? <p>We charged {formatMoney(total)} for your booking.</p> : null}
      <p className="muted">The seller has been notified and will confirm shortly.</p>
      {bookingId ? <Link href={`/bookings/${bookingId}`}>Open booking</Link> : null}
      <Link href="/bookings">All bookings</Link>
    </div>
  );
}
