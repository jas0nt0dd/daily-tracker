'use client';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useTasks, usePlanForDate } from './api';
import { addDaysIso, todayInTimezone, localDateLabel } from '@/lib/dates/timezone';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

/** The evening "plan tomorrow" flow: pull in unplanned pending tasks, or add new ones, all targeted at tomorrow's date. */
export function TomorrowPlanner() {
  const tomorrow = addDaysIso(todayInTimezone(), 1);
  const { data: unplanned } = useTasks({ status: 'pending' });
  const planForDate = usePlanForDate();

  const candidates = (unplanned ?? []).filter((t) => t.planned_for !== tomorrow);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-day" /> Plan for {localDateLabel(tomorrow)}
          </CardTitle>
          <CardDescription>Already planned:</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskList plannedFor={tomorrow} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a task for tomorrow</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm plannedFor={tomorrow} />
        </CardContent>
      </Card>

      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pull in existing pending tasks</CardTitle>
            <CardDescription>These aren't scheduled for tomorrow yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {candidates.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate text-sm">{t.title}</span>
                  <Button size="sm" variant="outline" onClick={() => planForDate.mutate({ id: t.id, date: tomorrow })}>
                    Add to tomorrow
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {candidates.length === 0 && (!unplanned || unplanned.length === 0) && (
        <EmptyState icon={CalendarClock} title="All caught up" description="No unplanned pending tasks left." />
      )}
    </div>
  );
}
