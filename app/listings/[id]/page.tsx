import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, fmtDate } from '@/lib/format';
import BookingForm from '@/components/BookingForm';
import ChatPanel from '@/components/ChatPanel';
import ListingCard from '@/components/ListingCard';
import PhotoUploader from '@/components/PhotoUploader';
import ProfileCard from '@/components/ProfileCard';
import ReviewList from '@/components/ReviewList';
import SearchHighlight from '@/components/SearchHighlight';
import SellerStats from '@/components/SellerStats';
import TotalBadge from '@/components/TotalBadge';
import type { Listing, Profile, Review, Slot } from '@/lib/types';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; hours?: string; day?: string }>;
};

type Db = Awaited<ReturnType<typeof createClient>>;

type Photo = { url: string; position: number | null };

type ListingDetail = Listing & { photos: Photo[] };

type ReviewRow = Review & {
  author?: { display_name: string | null } | null;
};

type DayGroup = {
  day: string;
  label: string;
  slots: Slot[];
};

type RatingSummaryData = {
  count: number;
  average: number;
  histogram: number[];
};

type Viewer = {
  id: string;
  email: string | null;
} | null;

const HOURS_OPTIONS = [1, 2, 3, 4, 6, 8];
const DEFAULT_HOURS = 2;
const SLOT_LIMIT = 60;
const RELATED_LIMIT = 3;
const REVIEW_LIMIT = 20;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function chatEnabled() {
  return (process.env.NEXT_PUBLIC_FLAGS ?? '').split(',').includes('chat_v2');
}

function parseHours(raw: string | undefined) {
  const n = Number(raw);
  if (!Number.isInteger(n) || !HOURS_OPTIONS.includes(n)) return DEFAULT_HOURS;
  return n;
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getUTCDay()]} ${fmtDate(iso)}`;
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function groupSlotsByDay(slots: Slot[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const slot of slots) {
    const key = dayKey(slot.slot_start);
    const existing = groups.get(key);
    if (existing) {
      existing.slots.push(slot);
    } else {
      groups.set(key, { day: key, label: dayLabel(slot.slot_start), slots: [slot] });
    }
  }
  return Array.from(groups.values());
}

function summarizeReviews(reviews: ReviewRow[]): RatingSummaryData {
  const histogram = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of reviews) {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    histogram[idx] += 1;
    sum += r.rating;
  }
  const count = reviews.length;
  return { count, average: count ? sum / count : 0, histogram };
}

function priceBreakdown(priceCents: number, hours: number) {
  const subtotal = priceCents * hours;
  const total = Math.ceil(priceCents * hours * 1.12);
  return { subtotal, fee: total - subtotal, total };
}

async function loadListing(supabase: Db, id: string): Promise<ListingDetail | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, photos:listing_photos(url, position)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const photos = ((data as any).photos ?? []) as Photo[];
  photos.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return { ...(data as any), photos } as ListingDetail;
}

async function loadSeller(supabase: Db, sellerId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', sellerId).maybeSingle();
  return (data as Profile | null) ?? null;
}

async function loadSlots(supabase: Db, listingId: string): Promise<Slot[]> {
  const { data } = await supabase
    .from('slots')
    .select('*')
    .eq('listing_id', listingId)
    .eq('is_booked', false)
    .gte('slot_start', new Date().toISOString())
    .order('slot_start', { ascending: true })
    .limit(SLOT_LIMIT);
  return (data ?? []) as Slot[];
}

async function loadReviews(supabase: Db, listingId: string): Promise<ReviewRow[]> {
  const { data } = await supabase
    .from('reviews')
    .select('id, booking_id, author_id, rating, body_md, booking:bookings!inner(listing_id)')
    .eq('booking.listing_id', listingId)
    .order('id', { ascending: false })
    .limit(REVIEW_LIMIT);
  return (data ?? []) as unknown as ReviewRow[];
}

async function loadViewerBooking(supabase: Db, listingId: string, userId: string) {
  const { data } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('listing_id', listingId)
    .eq('buyer_id', userId)
    .in('status', ['paid', 'confirmed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { id: string; status: string } | null;
}

async function loadRelated(supabase: Db, listing: Listing): Promise<Listing[]> {
  const { data } = await supabase
    .from('listings')
    .select('*, seller:profiles(id, display_name), photos:listing_photos(url)')
    .eq('category', listing.category)
    .eq('status', 'active')
    .neq('id', listing.id)
    .limit(RELATED_LIMIT);
  return (data ?? []) as unknown as Listing[];
}

function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  if (photos.length === 0) {
    return <div className="gallery gallery-empty">No photos yet</div>;
  }
  const [hero, ...rest] = photos;
  return (
    <div className="gallery">
      <img className="gallery-hero" src={hero.url} alt={title} />
      {rest.length > 0 ? (
        <ul className="gallery-thumbs">
          {rest.slice(0, 4).map((p) => (
            <li key={p.url}>
              <img src={p.url} alt={`${title} photo`} loading="lazy" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  );
}

function RatingSummary({ summary }: { summary: RatingSummaryData }) {
  if (summary.count === 0) {
    return <p className="muted">No reviews yet.</p>;
  }
  return (
    <div className="rating-summary">
      <div className="rating-headline">
        <strong>{summary.average.toFixed(1)}</strong>
        <Stars value={summary.average} />
        <span className="muted">
          ({summary.count} review{summary.count === 1 ? '' : 's'})
        </span>
      </div>
    </div>
  );
}

function PriceSummary({ listing, hours }: { listing: Listing; hours: number }) {
  const { subtotal, fee, total } = priceBreakdown(listing.price_cents, hours);
  return (
    <section className="panel price-panel">
      <h2>Pricing</h2>
      <p className="price-headline">
        {formatPrice(listing.price_cents)} <span className="muted">per hour</span>
      </p>
      <dl className="breakdown">
        <dt>
          {hours} hour{hours === 1 ? '' : 's'}
        </dt>
        <dd>{formatPrice(subtotal)}</dd>
        <dt>Service fee</dt>
        <dd>{formatPrice(fee)}</dd>
        <dt>Estimated total</dt>
        <dd>
          <strong>{formatPrice(total)}</strong>
        </dd>
      </dl>
      <TotalBadge priceCents={listing.price_cents} hours={hours} />
    </section>
  );
}

function AvailabilityList({ groups, selectedDay }: { groups: DayGroup[]; selectedDay?: string }) {
  if (groups.length === 0) {
    return (
      <section className="panel">
        <h2>Availability</h2>
        <p className="muted">No open times right now. Check back soon.</p>
      </section>
    );
  }
  const visible = selectedDay ? groups.filter((g) => g.day === selectedDay) : groups.slice(0, 3);
  return (
    <section className="panel availability">
      <h2>Availability</h2>
      {visible.map((g) => (
        <div key={g.day} className="day">
          <h3>{g.label}</h3>
          <ul className="times">
            {g.slots.map((s) => (
              <li key={s.id}>
                {timeLabel(s.slot_start)} &ndash; {timeLabel(s.slot_end)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function OwnerTools({ listing, slotCount }: { listing: Listing; slotCount: number }) {
  return (
    <section className="panel owner-tools">
      <h2>Manage this listing</h2>
      <p className="muted">
        {slotCount} open slot{slotCount === 1 ? '' : 's'} &middot; status {listing.status}
      </p>
      <PhotoUploader listingId={listing.id} />
      <p>
        <Link href={`/sell?edit=${listing.id}`}>Edit details</Link>
      </p>
    </section>
  );
}

function Facts({ listing }: { listing: Listing }) {
  const meta = (listing.metadata ?? {}) as Record<string, unknown>;
  const serviceArea = typeof meta.service_area === 'string' ? meta.service_area : null;
  return (
    <dl className="facts">
      <dt>Category</dt>
      <dd>{listing.category}</dd>
      <dt>Listed</dt>
      <dd>{fmtDate(listing.created_at)}</dd>
      {serviceArea ? (
        <>
          <dt>Service area</dt>
          <dd>{serviceArea}</dd>
        </>
      ) : null}
    </dl>
  );
}

function Description({ listing, q }: { listing: Listing; q: string }) {
  const text = listing.description_md ?? '';
  if (!text) return <p className="muted">The seller has not added a description yet.</p>;
  return (
    <div className="prose">
      {q ? (
        <SearchHighlight text={text} query={q} />
      ) : (
        text.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
      )}
    </div>
  );
}

function ChatSection({
  booking,
  viewer,
  seller,
}: {
  booking: { id: string; status: string } | null;
  viewer: Viewer;
  seller: Profile | null;
}) {
  if (!chatEnabled()) return null;
  if (!viewer) {
    return (
      <section className="panel">
        <h2>Message the seller</h2>
        <p className="muted">
          <Link href="/login">Log in</Link> to chat once you have booked.
        </p>
      </section>
    );
  }
  if (!booking) {
    return (
      <section className="panel">
        <h2>Message {seller?.display_name ?? 'the seller'}</h2>
        <p className="muted">Chat opens after your booking is paid.</p>
      </section>
    );
  }
  return (
    <section className="panel">
      <h2>Message {seller?.display_name ?? 'the seller'}</h2>
      <ChatPanel bookingId={booking.id} userId={viewer.id} />
    </section>
  );
}

function RelatedSection({ items }: { items: Listing[] }) {
  if (items.length === 0) return null;
  return (
    <section className="related">
      <h2>More in this category</h2>
      <div className="grid">
        {items.map((item) => (
          <ListingCard key={item.id} listing={item} />
        ))}
      </div>
    </section>
  );
}

export default async function ListingPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { q = '', hours: rawHours, day } = await searchParams;
  const hours = parseHours(rawHours);

  const supabase = await createClient();
  const listing = await loadListing(supabase, id);
  if (!listing || listing.status === 'archived') notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewer: Viewer = user ? { id: user.id, email: user.email ?? null } : null;
  const isOwner = viewer?.id === listing.seller_id;

  const [seller, slots, reviews, related] = await Promise.all([
    loadSeller(supabase, listing.seller_id),
    loadSlots(supabase, listing.id),
    loadReviews(supabase, listing.id),
    loadRelated(supabase, listing),
  ]);

  const viewerBooking = viewer && !isOwner ? await loadViewerBooking(supabase, listing.id, viewer.id) : null;
  const groups = groupSlotsByDay(slots);
  const summary = summarizeReviews(reviews);
  const canBook = !isOwner && slots.length > 0 && listing.status === 'active';

  return (
    <article className="listing-detail">
      <header className="listing-header">
        <h1>{listing.title}</h1>
        <p className="muted">
          {summary.count > 0 ? (
            <>
              <Stars value={summary.average} /> {summary.average.toFixed(1)} &middot;{' '}
            </>
          ) : null}
          {formatPrice(listing.price_cents)} / hour
        </p>
      </header>

      <div className="listing-layout">
        <div className="listing-main">
          <Gallery photos={listing.photos} title={listing.title} />

          <section className="panel">
            <h2>About this service</h2>
            <Description listing={listing} q={q} />
            <Facts listing={listing} />
          </section>

          <AvailabilityList groups={groups} selectedDay={day} />

          <section className="panel reviews">
            <h2>Reviews</h2>
            <RatingSummary summary={summary} />
            <ReviewList reviews={reviews} />
          </section>

          <ChatSection booking={viewerBooking} viewer={viewer} seller={seller} />
        </div>

        <aside className="listing-side">
          <PriceSummary listing={listing} hours={hours} />

          {canBook ? (
            <section className="panel">
              <h2>Book a time</h2>
              <BookingForm listing={listing} slots={slots} />
            </section>
          ) : null}

          {!canBook && !isOwner ? (
            <section className="panel">
              <h2>Book a time</h2>
              <p className="muted">This service is not taking bookings at the moment.</p>
            </section>
          ) : null}

          {isOwner ? <OwnerTools listing={listing} slotCount={slots.length} /> : null}

          {seller ? (
            <section className="panel">
              <h2>Your seller</h2>
              <ProfileCard profile={seller} />
              <SellerStats sellerId={seller.id} />
            </section>
          ) : null}
        </aside>
      </div>

      <RelatedSection items={related} />
    </article>
  );
}
