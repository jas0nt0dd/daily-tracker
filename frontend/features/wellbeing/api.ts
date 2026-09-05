'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { addDaysIso, todayInTimezone } from '@/lib/dates/timezone';
import type { WellbeingFormValues } from '@/lib/validation/wellbeing';

export function useTodayWellbeing() {
  const { user } = useUser();
  const supabase = createClient();
  const today = todayInTimezone();

  return useQuery({
    queryKey: ['wellbeing_logs', user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wellbeing_logs')
        .select('*')
        .eq('user_id', user!.id)
        .eq('log_date', today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRecentWellbeing(days = 14) {
  const { user } = useUser();
  const supabase = createClient();
  const since = addDaysIso(todayInTimezone(), -days);

  return useQuery({
    queryKey: ['wellbeing_logs_recent', user?.id, since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wellbeing_logs')
        .select('*')
        .eq('user_id', user!.id)
        .gte('log_date', since)
        .order('log_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpsertWellbeing() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: WellbeingFormValues) => {
      const { error } = await supabase
        .from('wellbeing_logs')
        .upsert({ ...values, user_id: user!.id }, { onConflict: 'user_id,log_date' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wellbeing_logs'] }),
  });
}
