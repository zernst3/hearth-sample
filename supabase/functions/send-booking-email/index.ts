import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function corsHeaders(req: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': req.headers.get('origin') ?? '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function json(req: Request, status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }

  const body = await req.json()
  console.log('request', { headers: Object.fromEntries(req.headers), body })

  const { booking_id, to } = body as { booking_id: string; to: string }
  if (!booking_id || !to) {
    return json(req, 400, { error: 'booking_id and to are required' })
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, hours, price_cents, status, listing:listings(title)')
    .eq('id', booking_id)
    .single()

  if (error || !booking) {
    return json(req, 404, { error: 'booking not found' })
  }

  const listing = booking.listing as unknown as { title: string } | null
  const total = (booking.price_cents / 100).toFixed(2)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Hearth <bookings@hearth.example>',
      to,
      subject: `Your booking: ${listing?.title ?? 'Hearth service'}`,
      html: `<p>Booking ${booking.id} is ${booking.status}.</p><p>${booking.hours}h, total $${total}</p>`,
    }),
  })

  if (!res.ok) {
    return json(req, 502, { error: 'email provider rejected the request' })
  }
  return json(req, 200, { sent: true })
})
