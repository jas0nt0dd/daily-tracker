'use client';
import { CheckCircle2, ListChecks } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { addDaysIso, todayInTimezone } from '@/lib/dates/timezone';
import { useHabits, useHabitLogs, useToggleHabitToday } from './api';

const DAYS_SHOWN = 21;

export function HabitGrid() {
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: logs, isLoading: logsLoading } = useHabitLogs(DAYS_SHOWN);
  const toggleToday = useToggleHabitToday();
  const today = todayInTimezone();

  if (habitsLoading || logsLoading) return <div className="h-32 animate-pulse rounded-md bg-surface-muted" />;

  if (!habits || habits.length === 0) {
    return <EmptyState icon={ListChecks} title="No habits yet" description="Add a habit to start tracking a daily streak." />;
  }

  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDaysIso(today, -(DAYS_SHOWN - 1 - i)));

  return (
    <div className="flex flex-col gap-4">
      {habits.map((habit) => {
        const habitLogs = new Set((logs ?? []).filter((l) => l.habit_id === habit.id).map((l) => l.log_date));
        const loggedToday = habitLogs.has(today);
        const streak = (() => {
          let count = 0;
          for (let i = days.length - 1; i >= 0; i--) {
            const day = days[i];
            if (day && habitLogs.has(day)) count += 1;
            else break;
          }
          return count;
        })();

        return (
          <Card key={habit.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{habit.name}</p>
                  <p className="text-xs text-muted">{streak > 0 ? `${streak}-day streak` : 'No current streak'}</p>
                </div>
                <button
                  onClick={() => toggleToday.mutate({ habitId: habit.id, currentlyLogged: loggedToday })}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium transition-colors',
                    loggedToday ? 'border-success bg-success/10 text-success' : 'hover:bg-surface-muted',
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" /> {loggedToday ? 'Done today' : 'Mark today'}
                </button>
              </div>
              <div className="flex gap-1">
                {days.map((d) => (
                  <div
                    key={d}
                    title={d}
                    className={cn('h-4 flex-1 rounded-sm', habitLogs.has(d) ? 'bg-day' : 'bg-surface-muted')}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
