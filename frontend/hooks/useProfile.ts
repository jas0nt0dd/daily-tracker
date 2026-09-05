'use client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await supabase.from('profiles').update(patch).eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
  });

  return { profile: query.data, isLoading: query.isLoading, error: query.error, updateProfile: update };
}
