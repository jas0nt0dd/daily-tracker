'use client';
import { useState } from 'react';
import { Check, Clock, X, ListTodo } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { localDateTimeLabel } from '@/lib/dates/timezone';
import { useTasks, useCompleteTask } from './api';
import { PostponeDialog } from './PostponeDialog';
import { RemoveTaskDialog } from './RemoveTaskDialog';

const PRIORITY_VARIANT: Record<string, 'day' | 'warning' | 'error'> = { low: 'day', medium: 'warning', high: 'error' };

export function TaskList({ plannedFor, status }: { plannedFor?: string; status?: string }) {
  const { data: tasks, isLoading } = useTasks({ planned_for: plannedFor, status });
  const completeTask = useCompleteTask();
  const [postponeId, setPostponeId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const visible = (tasks ?? []).filter((t) => t.status !== 'removed');

  if (visible.length === 0) {
    return <EmptyState icon={ListTodo} title="Nothing planned" description="Add a task to get started with today." />;
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-border">
        {visible.map((task) => (
          <li key={task.id} className="flex items-start gap-3 py-3">
            <div className="pt-0.5">
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={(checked) => checked && completeTask.mutate(task.id)}
                aria-label={`Mark "${task.title}" complete`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${task.status === 'completed' ? 'text-muted line-through' : ''}`}>
                {task.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
                {task.due_at && <span className="text-xs text-muted">Due {localDateTimeLabel(task.due_at)}</span>}
                {task.status === 'postponed' && <Badge variant="warning">Postponed</Badge>}
              </div>
            </div>
            {task.status !== 'completed' && (
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Postpone" onClick={() => setPostponeId(task.id)}>
                  <Clock className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-error" aria-label="Remove" onClick={() => setRemoveId(task.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {task.status === 'completed' && <Check className="mt-1 h-4 w-4 shrink-0 text-success" />}
          </li>
        ))}
      </ul>

      {postponeId && <PostponeDialog taskId={postponeId} open={!!postponeId} onOpenChange={(v) => !v && setPostponeId(null)} />}
      {removeId && <RemoveTaskDialog taskId={removeId} open={!!removeId} onOpenChange={(v) => !v && setRemoveId(null)} />}
    </>
  );
}
