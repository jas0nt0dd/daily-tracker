'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import type { WorkoutFormValues } from '@/lib/validation/workout';

export function useWorkouts(limit = 20) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['workouts', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user!.id)
        .is('deleted_at', null)
        .order('started_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useWeeklyWorkoutSummary(weekStartIso: string) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['workout_weekly_summary', user?.id, weekStartIso],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_weekly_summary')
        .select('*')
        .eq('user_id', user!.id)
        .eq('week_start', weekStartIso)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddWorkout() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: WorkoutFormValues) => {
      const { error } = await supabase.from('workouts').insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout_weekly_summary'] });
    },
  });
}

export function useDeleteWorkout() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workouts').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  });
}
