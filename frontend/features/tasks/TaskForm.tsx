'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormValues } from '@/lib/validation/task';
import { useAddTask } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { todayInTimezone } from '@/lib/dates/timezone';

export function TaskForm({ plannedFor, onSuccess }: { plannedFor?: string; onSuccess?: () => void }) {
  const addTask = useAddTask();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'medium', planned_for: plannedFor ?? todayInTimezone() },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addTask.mutateAsync(values);
      toast({ title: 'Task added', variant: 'success' });
      reset({ priority: 'medium', planned_for: plannedFor ?? todayInTimezone() });
      onSuccess?.();
    } catch {
      toast({ title: 'Could not add task', description: 'Please try again.', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Finish quarterly report" {...register('title')} />
        {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Priority</Label>
          <Select defaultValue="medium" onValueChange={(v) => setValue('priority', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due_at">Due (optional)</Label>
          <Input id="due_at" type="datetime-local" {...register('due_at')} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Notes (optional)</Label>
        <Textarea id="description" placeholder="Any extra detail" {...register('description')} />
      </div>

      <Button type="submit" variant="accent" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Adding...' : 'Add task'}
      </Button>
    </form>
  );
}
