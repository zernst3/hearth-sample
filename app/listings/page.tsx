import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { listListings } from '@/lib/data/listings';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PAGE_SIZE } from '@/lib/config';

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ListingsPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const supabase = await createClient();

  const listings = await listListings(page, DEFAULT_PAGE_SIZE);

  const cards = [];
  for (const l of listings) {
    const { data: seller } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', l.seller_id)
      .maybeSingle();
    const { data: photos } = await supabase
      .from('listing_photos')
      .select('url')
      .eq('listing_id', l.id)
      .order('position');
    cards.push({ ...l, seller: seller ?? l.seller ?? null, photos: photos ?? [] });
  }

  return (
    <div>
      <h1>All services</h1>
      <div className="grid">
        {cards.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {cards.length === 0 ? <p className="muted">Nothing on this page.</p> : null}

      <nav className="pager">
        {page > 1 ? <Link href={`/listings?page=${page - 1}`}>Previous</Link> : <span />}
        {listings.length === DEFAULT_PAGE_SIZE ? (
          <Link href={`/listings?page=${page + 1}`}>Next</Link>
        ) : null}
      </nav>
    </div>
  );
}
