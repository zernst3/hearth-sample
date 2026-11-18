import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import SearchHighlight from '@/components/SearchHighlight';
import { createClient } from '@/lib/supabase/server';
import { formatMoney } from '@/utils/format';

type Props = { searchParams: Promise<{ q?: string }> };

type Result = { id: string; title: string; price_cents: number; category: string };

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const term = q.trim();
  let results: Result[] = [];

  if (term) {
    const supabase = await createClient();
    const pattern = `%${term.replace(/[%_\\]/g, '\\$&')}%`;
    const { data } = await supabase
      .from('listings')
      .select('id, title, price_cents, category')
      .eq('status', 'active')
      .ilike('title', pattern)
      .order('created_at', { ascending: false })
      .limit(30);
    results = (data ?? []) as Result[];
  }

  return (
    <div>
      <h1>Search</h1>
      <SearchBox initialQuery={q} />

      {term ? (
        <p className="muted">
          {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{term}&rdquo;
        </p>
      ) : null}

      <ul className="results">
        {results.map((r) => (
          <li key={r.id}>
            <Link href={`/listings/${r.id}?q=${encodeURIComponent(term)}`}>
              <SearchHighlight text={r.title} query={q} />
            </Link>
            <span className="muted"> {r.category}</span>
            <span className="price"> {formatMoney(r.price_cents)}/hr</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
