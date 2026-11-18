import { createClient } from '../supabase/server';
import type { Listing } from '../types';

const LISTING_SELECT = '*, seller:profiles(id, display_name), photos:listing_photos(url)';

export async function listListings(page: number, pageSize: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Listing[];
}

export async function getListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as Listing | null;
}
