import { z } from 'zod';

export const WORKOUT_TYPES = [
  'gym', 'running', 'walking', 'cycling', 'sports', 'home_workout', 'yoga', 'mobility', 'other',
] as const;

export const workoutSchema = z.object({
  workout_type: z.enum(WORKOUT_TYPES),
  started_at: z.string().min(1, 'Enter a start time'),
  duration_minutes: z.coerce.number().positive('Duration must be greater than zero'),
  intensity: z.enum(['low', 'moderate', 'high']).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>;

export const workoutExerciseSchema = z.object({
  exercise_name: z.string().min(1, 'Name the exercise'),
  sets: z.coerce.number().positive().optional().nullable(),
  reps: z.coerce.number().positive().optional().nullable(),
  weight: z.coerce.number().nonnegative().optional().nullable(),
  distance: z.coerce.number().nonnegative().optional().nullable(),
  duration_seconds: z.coerce.number().positive().optional().nullable(),
});
