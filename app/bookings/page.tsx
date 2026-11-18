import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listBookingsFor } from '@/lib/data/bookings';
import { formatPrice, fmtDate } from '@/lib/format';
import type { Booking } from '@/lib/types';

function StatusPill({ status }: { status: Booking['status'] }) {
  return <span className={`pill pill-${status}`}>{status}</span>;
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <li className="row">
      <div>
        <Link href={`/bookings/${booking.id}`}>{booking.listing?.title ?? 'Service'}</Link>
        <p className="muted">
          with {booking.listing?.seller?.display_name ?? 'seller'} &middot; booked{' '}
          {fmtDate(booking.created_at)}
        </p>
      </div>
      <div className="right">
        <span>{formatPrice(booking.price_cents)}</span>
        <StatusPill status={booking.status} />
      </div>
    </li>
  );
}

function BookingGroup({ title, items }: { title: string; items: Booking[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2>{title}</h2>
      <ul className="list">
        {items.map((b) => (
          <BookingRow key={b.id} booking={b} />
        ))}
      </ul>
    </section>
  );
}

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/bookings');

  const bookings = await listBookingsFor(user.id);
  const active = bookings.filter((b) => b.status === 'pending' || b.status === 'paid');
  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  return (
    <div>
      <h1>Your bookings</h1>
      <BookingGroup title="Awaiting confirmation" items={active} />
      <BookingGroup title="Confirmed" items={confirmed} />
      <BookingGroup title="Cancelled" items={cancelled} />
      {bookings.length === 0 ? (
        <p className="muted">
          No bookings yet. <Link href="/listings">Find a service</Link>.
        </p>
      ) : null}
    </div>
  );
}
