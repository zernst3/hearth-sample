import Stripe from 'npm:stripe@17'
import postgres from 'npm:postgres@3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()
const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { max: 1 })

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('missing signature', { status: 400 })
  }

  const payload = await req.text()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider,
    )
  } catch (err) {
    return new Response(`signature check failed: ${(err as Error).message}`, { status: 400 })
  }

  const inserted = await sql`
    insert into internal.webhook_events (id)
    values (${event.id})
    on conflict do nothing
    returning id
  `
  if (inserted.length === 0) {
    return new Response(JSON.stringify({ received: true, replayed: true }), { status: 200 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_id

    if (bookingId) {
      await sql`update public.bookings set status = 'paid' where id = ${bookingId}`
      await sql`
        insert into public.payments (booking_id, profile_id, stripe_session_id, amount_cents, status)
        select b.id, b.buyer_id, ${session.id}, ${session.amount_total ?? 0}, 'paid'
        from public.bookings b
        where b.id = ${bookingId}
        on conflict (stripe_session_id) do nothing
      `
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
