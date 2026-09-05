'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { minutesBetween } from '@/lib/utils/time';
import type { TimeEntryFormValues } from '@/lib/validation/timeEntry';

export function useTimeEntries(date: string) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['time_entries', user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, time_categories(name, icon)')
        .eq('user_id', user!.id)
        .eq('entry_date', date)
        .is('deleted_at', null)
        .order('start_at', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDailyTimeBreakdown(date: string) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['category_time_breakdown', user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_time_breakdown')
        .select('*')
        .eq('user_id', user!.id)
        .eq('entry_date', date);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddTimeEntry() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TimeEntryFormValues) => {
      const duration =
        values.mode === 'range' && values.start_at && values.end_at
          ? minutesBetween(values.start_at, values.end_at)
          : values.duration_minutes!;

      const { error } = await supabase.from('time_entries').insert({
        user_id: user!.id,
        activity_name: values.activity_name,
        category_id: values.category_id,
        entry_date: values.entry_date,
        duration_minutes: duration,
        start_at: values.mode === 'range' ? values.start_at : null,
        end_at: values.mode === 'range' ? values.end_at : null,
        notes: values.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      queryClient.invalidateQueries({ queryKey: ['category_time_breakdown'] });
    },
  });
}

export function useDeleteTimeEntry() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('time_entries').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['time_entries'] }),
  });
}
