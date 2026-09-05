'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';

export function useExpenseCategories() {
  const { user } = useUser();
  const supabase = createClient();
  return useQuery({
    queryKey: ['expense_categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
}

export function useTimeCategories() {
  const { user } = useUser();
  const supabase = createClient();
  return useQuery({
    queryKey: ['time_categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_categories').select('*').eq('user_id', user!.id).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
}
