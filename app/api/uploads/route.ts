import { NextResponse } from 'next/server';
import { apiError } from '@/lib/errors';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError(401, 'unauthorized', 'Sign in to upload photos');

  const form = await req.formData();
  const file = form.get('file') as File;
  const listingId = String(form.get('listingId'));

  const key = `${listingId}/${file.name}`;
  const { error } = await supabase.storage
    .from('listing-photos')
    .upload(key, file, { upsert: true });
  if (error) return apiError(500, 'upload_failed', 'Upload failed');

  const { data } = supabase.storage.from('listing-photos').getPublicUrl(key);
  await supabase.from('listing_photos').insert({ listing_id: listingId, url: data.publicUrl });

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
