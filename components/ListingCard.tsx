import Link from 'next/link';
import { formatMoney } from '@/utils/format';
import type { Listing } from '@/lib/types';

type CardListing = Listing & {
  photos?: { url: string }[] | null;
  seller?: { id: string; display_name: string | null } | null;
};

export default function ListingCard({ listing }: { listing: CardListing }) {
  const photo = listing.photos?.[0]?.url;
  return (
    <article className="card">
      {photo ? <img src={photo} alt={listing.title} /> : null}
      <div className="body">
        <h3>
          <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
        </h3>
        <p className="muted">{listing.seller?.display_name ?? 'Local seller'}</p>
        <p className="price">{formatMoney(listing.price_cents)} / hour</p>
      </div>
    </article>
  );
}
