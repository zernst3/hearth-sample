import { createClient } from 'npm:@supabase/supabase-js@2'

type Row = {
  id: string
  buyer: { email: string | null } | null
  listing: { title: string } | null
  slot: { slot_start: string } | null
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('JOB_SECRET')
  if (!secret || req.headers.get('x-job-secret') !== secret) {
    return new Response('forbidden', { status: 403 })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data, error } = await admin
    .from('bookings')
    .select('id, buyer:profiles(email), listing:listings(title), slot:slots(slot_start)')
    .eq('status', 'confirmed')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const now = Date.now()
  const windowEnd = now + 24 * 60 * 60 * 1000
  const upcoming = (data as unknown as Row[]).filter((row) => {
    if (!row.slot) return false
    const start = new Date(row.slot.slot_start).getTime()
    return start > now && start <= windowEnd && !!row.buyer?.email
  })

  let sent = 0
  for (const row of upcoming) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hearth <reminders@hearth.example>',
        to: row.buyer!.email,
        subject: `Reminder: ${row.listing?.title ?? 'your booking'} is tomorrow`,
        html: `<p>Your booking starts at ${row.slot!.slot_start}.</p>`,
      }),
    })
    if (res.ok) sent += 1
  }

  return new Response(JSON.stringify({ checked: upcoming.length, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
