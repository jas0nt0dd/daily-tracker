'use client';
import { useProfile } from '@/hooks/useProfile';
import { localDateLabel, todayInTimezone } from '@/lib/dates/timezone';

export function TopBar() {
  const { profile } = useProfile();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-5">
      <div>
        <p className="text-sm text-muted">{localDateLabel(todayInTimezone(profile?.timezone))}</p>
      </div>
    </header>
  );
}
