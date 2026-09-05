'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { timeEntrySchema, type TimeEntryFormValues } from '@/lib/validation/timeEntry';
import { useTimeCategories } from '@/hooks/useCategories';
import { useAddTimeEntry } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { todayInTimezone, localInputToUtcIso } from '@/lib/dates/timezone';

export function TimeEntryForm({ date, onSuccess }: { date?: string; onSuccess?: () => void }) {
  const { data: categories } = useTimeCategories();
  const addEntry = useAddTimeEntry();
  const { toast } = useToast();
  const [mode, setMode] = useState<'duration' | 'range'>('duration');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: { entry_date: date ?? todayInTimezone(), mode: 'duration' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addEntry.mutateAsync(values);
      toast({ title: 'Time entry logged', variant: 'success' });
      reset({ entry_date: values.entry_date, mode });
      onSuccess?.();
    } catch {
      toast({ title: 'Could not log time', description: 'Please try again.', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity_name">What were you doing?</Label>
        <Input id="activity_name" placeholder="e.g. Deep work on report" {...register('activity_name')} />
        {errors.activity_name && <p className="text-xs text-error">{errors.activity_name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <Select onValueChange={(v) => setValue('category_id', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as 'duration' | 'range');
          setValue('mode', v as 'duration' | 'range');
        }}
      >
        <TabsList>
          <TabsTrigger value="duration">Duration</TabsTrigger>
          <TabsTrigger value="range">Start &amp; end</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'duration' ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input id="duration_minutes" type="number" inputMode="numeric" placeholder="60" {...register('duration_minutes')} />
          {errors.duration_minutes && <p className="text-xs text-error">{errors.duration_minutes.message}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start_at">Start</Label>
            <Input
              id="start_at"
              type="datetime-local"
              onChange={(e) => setValue('start_at', localInputToUtcIso(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end_at">End</Label>
            <Input id="end_at" type="datetime-local" onChange={(e) => setValue('end_at', localInputToUtcIso(e.target.value))} />
            {errors.end_at && <p className="text-xs text-error">{errors.end_at.message}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="entry_date">Date</Label>
        <Input id="entry_date" type="date" {...register('entry_date')} />
      </div>

      <Button type="submit" variant="accent" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Logging...' : 'Log time'}
      </Button>
    </form>
  );
}
