import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listMessages } from '@/lib/data/messages';

export async function GET(req: Request) {
  const bookingId = new URL(req.url).searchParams.get('bookingId') as string;
  try {
    const messages = await listMessages(bookingId);
    return NextResponse.json({ ok: true, messages });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const { bookingId, body, seq } = await req.json();
  const { data, error } = await supabase
    .from('messages')
    .insert({ booking_id: bookingId, sender_id: user.id, body, seq })
    .select('*')
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message });
  return NextResponse.json({ ok: true, message: data });
}
