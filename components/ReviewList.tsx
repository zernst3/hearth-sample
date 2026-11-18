import type { Review } from '@/lib/types';

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="muted">No reviews yet.</p>;
  }
  return (
    <ul className="messages">
      {reviews.map((review) => (
        <li key={review.id}>
          <strong>{'★'.repeat(review.rating)}</strong>
          <p>{review.body_md}</p>
        </li>
      ))}
    </ul>
  );
}
