'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Slot } from '@/lib/types';

export function useSlots(listingId: string, filter: { from: string; to: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    setLoading(true);
    supabase
      .from('slots')
      .select('*')
      .eq('listing_id', listingId)
      .gte('slot_start', filter.from)
      .lte('slot_start', filter.to)
      .order('slot_start')
      .then(({ data }) => {
        setSlots((data as Slot[]) ?? []);
        setLoading(false);
      });
  }, [listingId, { from: filter.from, to: filter.to }]);

  return { slots, loading };
}
