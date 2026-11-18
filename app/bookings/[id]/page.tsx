import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import ChatPanel from '@/components/ChatPanel';
import MessageList from '@/components/MessageList';
import { createClient } from '@/lib/supabase/server';
import { getBooking } from '@/lib/data/bookings';
import { listMessages } from '@/lib/data/messages';
import { formatPrice, fmtDate } from '@/lib/format';

type Props = { params: Promise<{ id: string }> };

function chatEnabled() {
  return (process.env.NEXT_PUBLIC_FLAGS ?? '').split(',').includes('chat_v2');
}

export default async function BookingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/bookings/${id}`);

  const booking = await getBooking(id);
  if (!booking) notFound();

  const messages = await listMessages(id);

  return (
    <div>
      <p>
        <Link href="/bookings">&larr; All bookings</Link>
      </p>
      <h1>{booking.listing?.title ?? 'Booking'}</h1>
      <dl className="facts">
        <dt>Status</dt>
        <dd>{booking.status}</dd>
        <dt>Total</dt>
        <dd>{formatPrice(booking.price_cents)}</dd>
        <dt>Hours</dt>
        <dd>{booking.hours}</dd>
        <dt>Booked</dt>
        <dd>{fmtDate(booking.created_at)}</dd>
      </dl>

      {booking.document_url ? (
        <p>
          <a href={booking.document_url} target="_blank" rel="noreferrer">
            View attached document
          </a>
        </p>
      ) : null}

      {chatEnabled() ? (
        <section>
          <h2>Messages</h2>
          <MessageList messages={messages} />
          <ChatPanel bookingId={booking.id} userId={user.id} />
        </section>
      ) : null}
    </div>
  );
}
