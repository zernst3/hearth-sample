import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { listListings } from '@/lib/data/listings';

const CATEGORIES = ['Cleaning', 'Gardening', 'Tutoring', 'Repairs', 'Photography', 'Pet care'];

export default async function HomePage() {
  const featured = await listListings(1, 6);

  return (
    <div className="home">
      <section className="hero">
        <h1>Neighbors who get things done</h1>
        <p className="muted">
          Book vetted local pros by the hour. Pay securely, chat before you commit.
        </p>
        <Link href="/listings" className="btn">
          Browse services
        </Link>
      </section>

      <section>
        <h2>Popular categories</h2>
        <ul className="chips">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link href={`/search?q=${encodeURIComponent(c)}`}>{c}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Fresh this week</h2>
        <div className="grid">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {featured.length === 0 ? <p className="muted">No services listed yet.</p> : null}
      </section>
    </div>
  );
}
