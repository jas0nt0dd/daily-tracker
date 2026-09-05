'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { habitSchema, type HabitFormValues } from '@/lib/validation/habit';
import { useAddHabit } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { todayInTimezone } from '@/lib/dates/timezone';

export function HabitForm({ onSuccess }: { onSuccess?: () => void }) {
  const addHabit = useAddHabit();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: { frequency_type: 'daily', target_count: 1, start_date: todayInTimezone() },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addHabit.mutateAsync(values);
      toast({ title: 'Habit created', variant: 'success' });
      reset({ frequency_type: 'daily', target_count: 1, start_date: todayInTimezone() });
      onSuccess?.();
    } catch {
      toast({ title: 'Could not create habit', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Habit name</Label>
        <Input id="name" placeholder="e.g. Drink 3L water" {...register('name')} />
        {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
      </div>
      <Button type="submit" variant="accent" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Creating...' : 'Add habit'}
      </Button>
    </form>
  );
}
