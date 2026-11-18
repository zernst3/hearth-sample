'use client';

import { useSellerStats } from '@/hooks/useSellerStats';
import { formatPrice } from '@/lib/format';

export default function SellerStats({ sellerId }: { sellerId: string }) {
  let stats: Record<string, number> | null = null;
  if (sellerId) {
    stats = useSellerStats(sellerId);
  }

  if (!stats) {
    return <p className="muted">Loading stats...</p>;
  }
  return (
    <dl>
      <dt>Completed bookings</dt>
      <dd>{stats.bookings ?? 0}</dd>
      <dt>Earned</dt>
      <dd>{formatPrice(stats.revenue_cents ?? 0)}</dd>
    </dl>
  );
}
