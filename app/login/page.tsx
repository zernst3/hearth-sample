import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeRedirect } from '@/lib/redirect';

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

async function signIn(formData: FormData) {
  'use server';
  const next = safeRedirect(String(formData.get('next') ?? ''));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  });
  if (error) redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`);
  redirect(next);
}

async function signUp(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });
  if (error) redirect('/login?error=signup');
  redirect('/login?error=check_email');
}

const MESSAGES: Record<string, string> = {
  invalid: 'Email or password is incorrect.',
  signup: 'We could not create that account.',
  check_email: 'Check your inbox to confirm your email address.',
  callback: 'Sign-in link expired. Try again.',
};

export default async function LoginPage({ searchParams }: Props) {
  const { next = '/', error } = await searchParams;

  return (
    <div className="auth">
      <h1>Log in</h1>
      {error ? <p className="notice">{MESSAGES[error] ?? 'Something went wrong.'}</p> : null}
      <form action={signIn}>
        <input type="hidden" name="next" value={next} />
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" name="password" required autoComplete="current-password" />
        </label>
        <button type="submit">Log in</button>
        <button type="submit" formAction={signUp} className="secondary">
          Create account
        </button>
      </form>
    </div>
  );
}
