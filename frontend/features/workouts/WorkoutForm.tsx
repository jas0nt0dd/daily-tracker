'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workoutSchema, type WorkoutFormValues, WORKOUT_TYPES } from '@/lib/validation/workout';
import { useAddWorkout } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { localInputToUtcIso } from '@/lib/dates/timezone';

const LABELS: Record<(typeof WORKOUT_TYPES)[number], string> = {
  gym: 'Gym', running: 'Running', walking: 'Walking', cycling: 'Cycling', sports: 'Sports',
  home_workout: 'Home workout', yoga: 'Yoga', mobility: 'Mobility', other: 'Other',
};

export function WorkoutForm({ onSuccess }: { onSuccess?: () => void }) {
  const addWorkout = useAddWorkout();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutFormValues>({ resolver: zodResolver(workoutSchema), defaultValues: { workout_type: 'gym' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addWorkout.mutateAsync(values);
      toast({ title: 'Workout logged', variant: 'success' });
      reset({ workout_type: 'gym' });
      onSuccess?.();
    } catch {
      toast({ title: 'Could not log workout', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <Select defaultValue="gym" onValueChange={(v) => setValue('workout_type', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORKOUT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input id="duration_minutes" type="number" inputMode="numeric" placeholder="45" {...register('duration_minutes')} />
          {errors.duration_minutes && <p className="text-xs text-error">{errors.duration_minutes.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="started_at">When</Label>
          <Input id="started_at" type="datetime-local" onChange={(e) => setValue('started_at', localInputToUtcIso(e.target.value))} />
          {errors.started_at && <p className="text-xs text-error">{errors.started_at.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Intensity</Label>
          <Select onValueChange={(v) => setValue('intensity', v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" placeholder="How did it feel?" {...register('notes')} />
      </div>

      <Button type="submit" variant="accent" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Logging...' : 'Log workout'}
      </Button>
    </form>
  );
}
