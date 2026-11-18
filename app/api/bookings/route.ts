import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json();

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        buyer_id: user.id,
        listing_id: body.listingId,
        slot_id: body.slotId,
        hours: body.hours,
        price_cents: body.amountCents,
        status: 'pending',
      })
      .select('id')
      .single();
    if (error) throw error;

    const admin = createAdminClient();
    const payment = await admin.from('payments').insert({
      booking_id: booking.id,
      profile_id: user.id,
      amount_cents: body.amountCents,
      status: 'pending',
    });
    if (payment.error) throw payment.error;

    const slot = await admin.from('slots').update({ is_booked: true }).eq('id', body.slotId);
    if (slot.error) throw slot.error;

    return NextResponse.json({ message: 'created', id: booking.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
