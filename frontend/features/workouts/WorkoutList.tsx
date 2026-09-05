'use client';
import { Dumbbell, Trash2 } from 'lucide-react';
import { formatMinutes } from '@/lib/utils/time';
import { localDateTimeLabel } from '@/lib/dates/timezone';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkouts, useDeleteWorkout, useWeeklyWorkoutSummary } from './api';

export function WorkoutList() {
  const { data: workouts, isLoading } = useWorkouts();
  const deleteWorkout = useDeleteWorkout();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return <EmptyState icon={Dumbbell} title="No workouts logged" description="Log a session to start building your streak." />;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {workouts.map((w) => (
        <li key={w.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium capitalize">{w.workout_type.replace('_', ' ')}</p>
            <p className="text-xs text-muted">{localDateTimeLabel(w.started_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            {w.intensity && <Badge variant="day">{w.intensity}</Badge>}
            <span className="whitespace-nowrap text-sm font-medium">{formatMinutes(w.duration_minutes)}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-error" onClick={() => deleteWorkout.mutate(w.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function startOfWeekIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function WorkoutWeeklyStats() {
  const weekStart = startOfWeekIso();
  const { data: summary, isLoading } = useWeeklyWorkoutSummary(weekStart);

  if (isLoading) return <div className="h-16 animate-pulse rounded-md bg-surface-muted" />;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-md bg-surface-muted p-4">
        <p className="text-2xl font-display">{summary?.workout_count ?? 0}</p>
        <p className="text-sm text-muted">Workouts this week</p>
      </div>
      <div className="rounded-md bg-surface-muted p-4">
        <p className="text-2xl font-display">{formatMinutes(Number(summary?.total_minutes ?? 0))}</p>
        <p className="text-sm text-muted">Time this week</p>
      </div>
    </div>
  );
}
