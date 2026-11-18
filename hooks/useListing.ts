'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Listing } from '@/lib/types';

export function useListing(listingId: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from('listings')
      .select('*, seller:profiles(id, display_name), photos:listing_photos(url)')
      .eq('id', listingId)
      .single()
      .then(({ data }) => {
        setListing(data as Listing | null);
        setLoading(false);
      });
  }, []);

  return { listing, loading };
}
