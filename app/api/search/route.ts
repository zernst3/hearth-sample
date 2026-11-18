import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { apiError } from '@/lib/errors';

const sql = postgres(process.env.DATABASE_URL!, { max: 5 });

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json({ results: [] });

  try {
    const rows = await sql.unsafe(
      `select id, title, price_cents, category
       from public.listings
       where status = 'active' and (title ilike '%${q}%' or category ilike '%${q}%')
       order by created_at desc
       limit 30`,
    );
    return NextResponse.json({ results: rows });
  } catch {
    return apiError(500, 'search_failed', 'Search is unavailable');
  }
}
