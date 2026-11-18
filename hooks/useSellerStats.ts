'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export function useSellerStats(sellerId: string) {
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserClient();
    supabase.rpc('seller_stats', { seller: sellerId }).then(({ data }) => {
      if (!active) return;
      const row = Array.isArray(data) ? data[0] : data;
      setStats((row as Record<string, number>) ?? {});
    });
    return () => {
      active = false;
    };
  }, [sellerId]);

  return stats;
}
