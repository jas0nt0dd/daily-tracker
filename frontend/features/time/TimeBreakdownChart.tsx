'use client';
import { formatMinutes, TOTAL_MINUTES_PER_DAY } from '@/lib/utils/time';
import { useDailyTimeBreakdown } from './api';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock } from 'lucide-react';

const PALETTE = ['#B8862B', '#4C5FD5', '#7A8B99', '#8C6A2A', '#5B6ABF', '#C9A05C', '#6C7A89', '#A88A4A'];

export function TimeBreakdownChart({ date }: { date: string }) {
  const { data, isLoading } = useDailyTimeBreakdown(date);

  if (isLoading) return <div className="h-10 animate-pulse rounded-full bg-surface-muted" />;

  const rows = (data ?? []).filter((r) => Number(r.total_minutes) > 0);
  const tracked = rows.reduce((s, r) => s + Number(r.total_minutes), 0);

  if (rows.length === 0) {
    return <EmptyState icon={Clock} title="No time logged yet today" description="Log an activity to see your day's breakdown." />;
  }

  const untracked = Math.max(0, TOTAL_MINUTES_PER_DAY - tracked);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-8 w-full overflow-hidden rounded-full bg-surface-muted">
        {rows.map((r, i) => (
          <div
            key={r.category_name ?? i}
            style={{ width: `${(Number(r.total_minutes) / TOTAL_MINUTES_PER_DAY) * 100}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
            title={`${r.category_name}: ${formatMinutes(Number(r.total_minutes))}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
        {rows.map((r, i) => (
          <li key={r.category_name ?? i} className="flex items-center gap-2 truncate">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="truncate">{r.category_name ?? 'Uncategorized'}</span>
            <span className="ml-auto shrink-0 text-muted">{formatMinutes(Number(r.total_minutes))}</span>
          </li>
        ))}
        {untracked > 0 && (
          <li className="flex items-center gap-2 truncate text-muted">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-border" />
            <span className="truncate">Untracked</span>
            <span className="ml-auto shrink-0">{formatMinutes(untracked)}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
