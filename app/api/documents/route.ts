import { NextResponse } from 'next/server';
import { apiError } from '@/lib/errors';
import { MAX_UPLOAD_BYTES } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError(401, 'unauthorized', 'Sign in to attach documents');

  const form = await req.formData();
  const file = form.get('file');
  const bookingId = String(form.get('bookingId') ?? '');
  if (!(file instanceof File) || !bookingId) {
    return apiError(400, 'invalid_input', 'A file and bookingId are required');
  }
  if (file.size > MAX_UPLOAD_BYTES) return apiError(413, 'too_large', 'File is too large');
  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiError(415, 'unsupported_type', 'Only PDF, PNG and JPEG files are accepted');
  }

  const key = `${user.id}/${crypto.randomUUID()}`;
  const { error } = await supabase.storage
    .from('booking-docs')
    .upload(key, file, { contentType: file.type });
  if (error) return apiError(500, 'upload_failed', 'Upload failed');

  const { data: signed } = await supabase.storage
    .from('booking-docs')
    .createSignedUrl(key, 60 * 60 * 24 * 3650);
  if (!signed) return apiError(500, 'sign_failed', 'Could not prepare the document link');

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ document_url: signed.signedUrl })
    .eq('id', bookingId);
  if (updateError) return apiError(500, 'save_failed', 'Could not attach the document');

  return NextResponse.json({ url: signed.signedUrl }, { status: 201 });
}
