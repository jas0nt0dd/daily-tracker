'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sleepEntrySchema, type SleepEntryFormValues } from '@/lib/validation/sleep';
import { useAddSleepEntry } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { localInputToUtcIso } from '@/lib/dates/timezone';
import { cn } from '@/lib/utils/cn';

export function SleepEntryForm({ onSuccess }: { onSuccess?: () => void }) {
  const addSleep = useAddSleepEntry();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SleepEntryFormValues>({ resolver: zodResolver(sleepEntrySchema) });

  const quality = watch('quality');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addSleep.mutateAsync(values);
      toast({ title: 'Sleep logged', variant: 'success' });
      reset();
      onSuccess?.();
    } catch {
      toast({ title: 'Could not log sleep', description: 'Please try again.', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sleep_start">Fell asleep</Label>
          <Input id="sleep_start" type="datetime-local" onChange={(e) => setValue('sleep_start', localInputToUtcIso(e.target.value))} />
          {errors.sleep_start && <p className="text-xs text-error">{errors.sleep_start.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sleep_end">Woke up</Label>
          <Input id="sleep_end" type="datetime-local" onChange={(e) => setValue('sleep_end', localInputToUtcIso(e.target.value))} />
          {errors.sleep_end && <p className="text-xs text-error">{errors.sleep_end.message}</p>}
        </div>
      </div>
      <p className="text-xs text-muted">
        Sleeping past midnight is fine — pick the actual calendar dates for each time, e.g. 11:30 PM one night to 6:30 AM the next.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label>Sleep quality</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue('quality', n)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-medium transition-colors',
                quality === n ? 'border-night bg-night text-night-foreground' : 'hover:bg-surface-muted',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" placeholder="Anything that affected your sleep?" {...register('notes')} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-1 bg-night text-night-foreground hover:bg-night/90">
        {isSubmitting ? 'Logging...' : 'Log sleep'}
      </Button>
    </form>
  );
}
