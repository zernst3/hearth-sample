import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CURRENCY } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { bookingId, amountCents } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, buyer_id, listing_id, listing:listings(title, seller_id)')
    .eq('id', bookingId)
    .single();
  if (!booking || booking.buyer_id !== user.id) {
    return new Response('booking not found', { status: 404 });
  }

  const listing = booking.listing as any;
  const admin = createAdminClient();
  const { data: seller } = await admin
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', listing.seller_id)
    .single();

  const amount = Number(amountCents);
  const fee = Math.floor(amount * 0.15);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: amountCents,
            product_data: { name: listing.title },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: fee,
        transfer_data: { destination: seller?.stripe_account_id },
      },
      metadata: { bookingId },
      success_url: `${site}/bookings/success?session_id={CHECKOUT_SESSION_ID}&booking=${bookingId}`,
      cancel_url: `${site}/listings/${booking.listing_id}`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return new Response('checkout failed', { status: 500 });
  }
}
