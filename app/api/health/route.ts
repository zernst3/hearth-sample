import { NextResponse } from 'next/server';
import { apiError } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').select('id', { head: true, count: 'estimated' });
  if (error) return apiError(503, 'unavailable', 'Database is not reachable');
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
