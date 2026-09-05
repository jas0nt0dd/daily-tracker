'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { addDaysIso, todayInTimezone } from '@/lib/dates/timezone';
import type { SleepEntryFormValues } from '@/lib/validation/sleep';

export function useRecentSleep(days = 14) {
  const { user } = useUser();
  const supabase = createClient();
  const since = addDaysIso(todayInTimezone(), -days);

  return useQuery({
    queryKey: ['sleep_entries', user?.id, since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', user!.id)
        .gte('sleep_start', since)
        .is('deleted_at', null)
        .order('sleep_start', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddSleepEntry() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: SleepEntryFormValues) => {
      const { error } = await supabase.from('sleep_entries').insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sleep_entries'] }),
  });
}

export function useDeleteSleepEntry() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sleep_entries').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sleep_entries'] }),
  });
}
