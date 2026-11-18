'use client';

import { useEffect } from 'react';
import { bookingTotalCents } from '@/lib/pricing';
import { formatMoney } from '@/utils/format';

export default function TotalBadge({ priceCents, hours }: { priceCents: number; hours: number }) {
  const total = bookingTotalCents(priceCents, hours);

  useEffect(() => {
    document.getElementById('total')!.innerText = formatMoney(total);
  }, [total]);

  return (
    <span className="price">
      Total <span id="total" />
    </span>
  );
}
