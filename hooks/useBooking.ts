'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Booking } from '@/lib/types';

export function useBooking(bookingId: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    const controller = new AbortController();
    setLoading(true);
    supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .abortSignal(controller.signal)
      .single()
      .then(({ data, error }) => {
        if (error) return;
        setBooking(data as Booking);
        setLoading(false);
      });
    return () => controller.abort();
  }, [bookingId]);

  return { booking, loading };
}
