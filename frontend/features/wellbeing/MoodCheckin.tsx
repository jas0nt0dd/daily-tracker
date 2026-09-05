'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { wellbeingSchema, type WellbeingFormValues } from '@/lib/validation/wellbeing';
import { useTodayWellbeing, useUpsertWellbeing } from './api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { todayInTimezone } from '@/lib/dates/timezone';
import { cn } from '@/lib/utils/cn';

const DIMENSIONS: { key: 'mood' | 'energy' | 'stress'; label: string; lowLabel: string; highLabel: string }[] = [
  { key: 'mood', label: 'Mood', lowLabel: 'Low', highLabel: 'Great' },
  { key: 'energy', label: 'Energy', lowLabel: 'Drained', highLabel: 'Energized' },
  { key: 'stress', label: 'Stress', lowLabel: 'Calm', highLabel: 'Overwhelmed' },
];

export function MoodCheckin() {
  const { data: existing } = useTodayWellbeing();
  const upsert = useUpsertWellbeing();
  const { toast } = useToast();

  const { setValue, watch, handleSubmit, reset } = useForm<WellbeingFormValues>({
    resolver: zodResolver(wellbeingSchema),
    defaultValues: { log_date: todayInTimezone(), mood: 3, energy: 3, stress: 3 },
  });

  useEffect(() => {
    if (existing) {
      reset({
        log_date: existing.log_date,
        mood: existing.mood ?? 3,
        energy: existing.energy ?? 3,
        stress: existing.stress ?? 3,
        notes: existing.notes ?? '',
      });
    }
  }, [existing, reset]);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await upsert.mutateAsync(data);
      toast({ title: 'Check-in saved', variant: 'success' });
    } catch {
      toast({ title: 'Could not save check-in', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {DIMENSIONS.map((dim) => (
        <div key={dim.key}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">{dim.label}</span>
            <span className="text-muted">
              {dim.lowLabel} – {dim.highLabel}
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setValue(dim.key, n)}
                className={cn(
                  'h-9 flex-1 rounded-md border border-border text-sm font-medium transition-colors',
                  values[dim.key] === n ? 'border-day bg-day text-day-foreground' : 'hover:bg-surface-muted',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Textarea placeholder="Anything on your mind? (optional)" onChange={(e) => setValue('notes', e.target.value)} defaultValue={existing?.notes ?? ''} />
      <Button type="submit" variant="accent" disabled={upsert.isPending}>
        {upsert.isPending ? 'Saving...' : existing ? 'Update check-in' : 'Save check-in'}
      </Button>
    </form>
  );
}
