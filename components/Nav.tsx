import Link from 'next/link';

type NavUser = { id: string; email?: string | null } | null;

export default function Nav({ user }: { user: NavUser }) {
  return (
    <nav className="nav">
      <Link href="/" className="brand">Hearth</Link>
      <Link href="/listings">Browse</Link>
      <Link href="/search">Search</Link>
      {user ? (
        <>
          <Link href="/bookings">My bookings</Link>
          <Link href="/sell">Sell</Link>
          <span className="muted">{user.email}</span>
          <Link href="/logout">Log out</Link>
        </>
      ) : (
        <Link href="/login">Log in</Link>
      )}
    </nav>
  );
}
