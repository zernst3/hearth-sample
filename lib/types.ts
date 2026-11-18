export type Profile = {
  id: string;
  role: 'buyer' | 'seller' | 'admin';
  display_name: string | null;
  email: string | null;
  phone: string | null;
  stripe_account_id: string | null;
  created_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description_md: string | null;
  price_cents: number;
  category: string;
  metadata: Record<string, unknown> | null;
  status: string;
  created_at: string;
  seller?: { id: string; display_name: string | null } | null;
  photos?: { url: string }[] | null;
};

export type Slot = {
  id: string;
  listing_id: string;
  slot_start: string;
  slot_end: string;
  is_booked: boolean;
};

export type Booking = {
  id: string;
  buyer_id: string;
  listing_id: string;
  slot_id: string;
  hours: number;
  price_cents: number;
  status: 'pending' | 'paid' | 'confirmed' | 'cancelled';
  document_url: string | null;
  created_at: string;
  listing?: {
    id: string;
    title: string;
    seller?: { id: string; display_name: string | null } | null;
  } | null;
};

export type Message = {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  seq: number;
  created_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  author_id: string;
  rating: number;
  body_md: string | null;
};

export type Payment = {
  id: string;
  booking_id: string;
  profile_id: string;
  stripe_session_id: string | null;
  amount_cents: number;
  card_last4: string | null;
  created_at: string;
};
