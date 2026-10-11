'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { localDateLabel, todayInTimezone } from '@/lib/dates/timezone';

export function TopBar() {
  const { profile } = useProfile();
  const { user } = useUser();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const { error } = await createClient().auth.signOut();
    if (error) {
      setSigningOut(false);
      return;
    }
    router.replace('/login');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-5">
      <div>
        <p className="text-sm text-muted">{localDateLabel(todayInTimezone(profile?.timezone))}</p>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden max-w-56 truncate text-sm text-muted sm:block">{user?.email}</span>
        <Button type="button" variant="outline" size="sm" onClick={signOut} disabled={signingOut}>
          <LogOut aria-hidden="true" className="h-4 w-4" />
          <span>{signingOut ? 'Signing out' : 'Sign out'}</span>
        </Button>
      </div>
    </header>
  );
}
