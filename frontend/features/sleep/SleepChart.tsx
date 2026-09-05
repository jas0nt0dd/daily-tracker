'use client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Trash2, Moon } from 'lucide-react';
import { formatMinutes } from '@/lib/utils/time';
import { localDateTimeLabel } from '@/lib/dates/timezone';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useRecentSleep, useDeleteSleepEntry } from './api';
import { useProfile } from '@/hooks/useProfile';

export function SleepChart() {
  const { data: entries, isLoading } = useRecentSleep(14);
  const { profile } = useProfile();

  if (isLoading) return <div className="h-56 animate-pulse rounded-md bg-surface-muted" />;
  if (!entries || entries.length === 0) {
    return <EmptyState icon={Moon} title="No sleep logged yet" description="Log tonight's sleep to start seeing trends." />;
  }

  const chartData = [...entries]
    .reverse()
    .map((e) => ({ date: format(new Date(e.sleep_start), 'MMM d'), hours: Math.round((Number(e.duration_minutes) / 60) * 10) / 10 }));

  const targetHours = (profile?.daily_sleep_target_minutes ?? 480) / 60;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted))" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted))" width={32} unit="h" />
          <Tooltip formatter={(v: number) => `${v}h`} cursor={{ fill: 'hsl(var(--surface-muted))' }} />
          <ReferenceLine y={targetHours} stroke="hsl(var(--night))" strokeDasharray="4 4" />
          <Bar dataKey="hours" fill="hsl(var(--night))" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SleepList() {
  const { data: entries, isLoading } = useRecentSleep(14);
  const deleteEntry = useDeleteSleepEntry();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) return null;

  return (
    <ul className="flex flex-col divide-y divide-border">
      {entries.map((e) => (
        <li key={e.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {localDateTimeLabel(e.sleep_start)} → {localDateTimeLabel(e.sleep_end)}
            </p>
            {e.quality && <p className="text-xs text-muted">Quality {e.quality}/5</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-sm font-medium">{formatMinutes(e.duration_minutes)}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete sleep entry"
              onClick={() => deleteEntry.mutate(e.id)}
              className="h-8 w-8 text-muted hover:text-error"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
