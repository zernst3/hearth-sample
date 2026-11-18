'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function SessionStore({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    const supabase = createBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('sb_token', session.access_token);
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('sb_token');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
