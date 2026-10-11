'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'sign-in' | 'sign-up';

export default function LoginPage() {
  const router = useRouter();
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && !data.user.is_anonymous) router.replace('/dashboard');
    });
  }, [router, supabaseConfigured]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (!supabaseConfigured) {
        throw new Error('Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.');
      }
      const supabase = createClient();
      if (mode === 'sign-in') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.replace('/dashboard');
        router.refresh();
        return;
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.is_anonymous) {
        const { data, error: updateError } = await supabase.auth.updateUser({ email, password });
        if (updateError) throw updateError;
        if (data.user.is_anonymous) {
          setMessage('Check your email to finish linking this account. Keep using this device until you can sign in with your new credentials.');
          return;
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage('Check your email to confirm your account, then sign in here.');
          return;
        }
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (cause) {
      if (cause instanceof TypeError && cause.message.toLowerCase().includes('fetch')) {
        setError('Could not reach Supabase. Check the project URL and network access, then try again.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Unable to authenticate. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-7 shadow-sm sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-wide text-day">Daily Life OS</p>
        <h1 className="mt-3 font-display text-3xl">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Sign in with the same account on each device to access your personal data.
        </p>
        {!supabaseConfigured && (
          <p className="mt-4 rounded-md border border-error/30 bg-error/5 p-3 text-sm leading-5 text-error" role="alert">
            Supabase is not configured for this app. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the frontend environment, then redeploy.
          </p>
        )}

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="email">Email</label>
            <input
              autoComplete="email"
              className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-day"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="password">Password</label>
            <input
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-day"
              id="password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error && <p className="text-sm text-error" role="alert">{error}</p>}
          {message && <p className="text-sm text-success" role="status">{message}</p>}
          <button
            className="h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:cursor-wait disabled:opacity-60 dark:bg-day dark:text-day-foreground"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === 'sign-in' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            className="font-semibold text-day underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError('');
              setMessage('');
            }}
            type="button"
          >
            {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
        {mode === 'sign-up' && (
          <p className="mt-4 text-center text-xs leading-5 text-muted">
            To keep data already on this device, create your account here first.
          </p>
        )}
      </section>
    </main>
  );
}