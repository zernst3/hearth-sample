import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatMoney, formatDate } from '@/utils/format';

async function refund(formData: FormData) {
  'use server';
  const bookingId = String(formData.get('bookingId'));
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_refund', { booking: bookingId });
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') redirect('/');

  const admin = createAdminClient();
  const { data: bookings } = await admin
    .from('bookings')
    .select('id, status, price_cents, created_at, listing:listings(title)')
    .order('created_at', { ascending: false })
    .limit(50);
  const { count: profileCount } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  return (
    <div>
      <h1>Admin</h1>
      <p className="muted">{profileCount ?? 0} registered users</p>

      <table className="table">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Listing</th>
            <th>Total</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(bookings ?? []).map((b: any) => (
            <tr key={b.id}>
              <td>{b.id.slice(0, 8)}</td>
              <td>{b.listing?.title}</td>
              <td>{formatMoney(b.price_cents)}</td>
              <td>{b.status}</td>
              <td>{formatDate(b.created_at)}</td>
              <td>
                {b.status !== 'cancelled' ? (
                  <form action={refund}>
                    <input type="hidden" name="bookingId" value={b.id} />
                    <button type="submit">Refund</button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
