import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import SessionStore from '@/components/SessionStore';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Hearth',
  description: 'Book trusted local services from people in your neighborhood.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <SessionStore>
          <Nav user={user ? { id: user.id, email: user.email } : null} />
          <main className="container">{children}</main>
        </SessionStore>
      </body>
    </html>
  );
}
