'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookingTotalCents } from '@/lib/pricing';
import { fmtDate } from '@/lib/format';
import { formatMoney } from '@/utils/format';
import type { Listing, Slot } from '@/lib/types';

export default function BookingForm({ listing, slots }: { listing: Listing; slots: Slot[] }) {
  const router = useRouter();
  const open = slots.filter((s) => !s.is_booked);
  const [slotId, setSlotId] = useState<string>(open[0]?.id ?? '');
  const [hours, setHours] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTotal(bookingTotalCents(listing.price_cents, hours));
  }, [hours]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotId) return setError('Pick a time slot');
    if (!Number.isInteger(hours) || hours < 1 || hours > 12) {
      return setError('Hours must be a whole number from 1 to 12');
    }
    if (!(listing.price_cents > 0)) return setError('This listing has no price');

    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          slotId,
          hours,
          amountCents: total,
        }),
      });
      if (!res.ok) {
        setError('Could not create the booking');
        return;
      }
      router.push('/bookings');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Time slot
        <select value={slotId} onChange={(e) => setSlotId(e.target.value)}>
          {open.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {fmtDate(slot.slot_start)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Hours
        <input
          type="number"
          min={1}
          max={12}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
        />
      </label>
      <p>Total: {formatMoney(total)}</p>
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={busy || open.length === 0}>
        Book and pay
      </button>
    </form>
  );
}
