import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { apiError } from '@/lib/errors';
import { listingInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';

const sql = postgres(process.env.DATABASE_URL!, { max: 5 });

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  try {
    const rows = await sql`
      select id, title, price_cents, category
      from public.listings
      where status = 'active' and title ilike ${'%' + q + '%'}
      order by created_at desc
      limit 50
    `;
    return NextResponse.json({ listings: rows });
  } catch {
    return apiError(500, 'query_failed', 'Could not load listings');
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError(401, 'unauthorized', 'Sign in to create a listing');

  const parsed = listingInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError(400, 'invalid_input', parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const { title, description, priceCents, category } = parsed.data;
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title,
      description_md: description,
      price_cents: priceCents,
      category,
      status: 'active',
    })
    .select('id')
    .single();
  if (error) return apiError(500, 'insert_failed', 'Could not create listing');

  return NextResponse.json({ id: data.id }, { status: 201 });
}
