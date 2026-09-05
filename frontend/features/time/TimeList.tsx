'use client';
import { Trash2, Clock3 } from 'lucide-react';
import { formatMinutes } from '@/lib/utils/time';
import { localTimeLabel } from '@/lib/dates/timezone';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useTimeEntries, useDeleteTimeEntry } from './api';

export function TimeList({ date }: { date: string }) {
  const { data: entries, isLoading } = useTimeEntries(date);
  const deleteEntry = useDeleteTimeEntry();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return <EmptyState icon={Clock3} title="Nothing logged" description="Time entries for this day will appear here." />;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {entries.map((e: any) => (
        <li key={e.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{e.activity_name}</p>
            <p className="text-xs text-muted">
              {e.time_categories?.name ?? 'Uncategorized'}
              {e.start_at && e.end_at && ` · ${localTimeLabel(e.start_at)} – ${localTimeLabel(e.end_at)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-sm font-medium">{formatMinutes(e.duration_minutes)}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete time entry"
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
