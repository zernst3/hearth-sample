'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createListing(formData: FormData) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('listings')
    .insert({
      seller_id: String(formData.get('sellerId')),
      title: String(formData.get('title')),
      description_md: String(formData.get('description') ?? ''),
      price_cents: Math.round(Number(formData.get('price')) * 100),
      category: String(formData.get('category')),
      status: 'active',
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  revalidatePath('/listings');
  redirect(`/listings/${data.id}`);
}

export async function updateListing(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: existing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', id)
    .maybeSingle();
  if (!existing || existing.seller_id !== user.id) throw new Error('Not allowed');

  const { error } = await supabase
    .from('listings')
    .update({
      title: String(formData.get('title')),
      description_md: String(formData.get('description') ?? ''),
      price_cents: Math.round(Number(formData.get('price')) * 100),
      category: String(formData.get('category')),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath(`/listings/${id}`);
}
