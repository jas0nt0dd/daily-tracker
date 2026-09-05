'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { addDaysIso, todayInTimezone } from '@/lib/dates/timezone';
import type { HabitFormValues } from '@/lib/validation/habit';

export function useHabits() {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('habits').select('*').eq('user_id', user!.id).eq('active', true).order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

/** Fetches the last N days of logs for every active habit, keyed by habit_id -> log_date -> completed_count, for the streak grid. */
export function useHabitLogs(days = 21) {
  const { user } = useUser();
  const supabase = createClient();
  const since = addDaysIso(todayInTimezone(), -days);

  return useQuery({
    queryKey: ['habit_logs', user?.id, since],
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_logs').select('*').eq('user_id', user!.id).gte('log_date', since);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddHabit() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: HabitFormValues) => {
      const { error } = await supabase.from('habits').insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });
}

export function useToggleHabitToday() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const today = todayInTimezone();

  return useMutation({
    mutationFn: async ({ habitId, currentlyLogged }: { habitId: string; currentlyLogged: boolean }) => {
      if (currentlyLogged) {
        const { error } = await supabase.from('habit_logs').delete().eq('user_id', user!.id).eq('habit_id', habitId).eq('log_date', today);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_logs')
          .upsert({ user_id: user!.id, habit_id: habitId, log_date: today, completed_count: 1 }, { onConflict: 'user_id,habit_id,log_date' });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habit_logs'] }),
  });
}
