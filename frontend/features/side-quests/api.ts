'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import type { SideQuestFormValues } from '@/lib/validation/sideQuest';

export function useSideQuests() {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['side_quests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('side_quests')
        .select('*, side_quest_milestones(*)')
        .eq('user_id', user!.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddSideQuest() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: SideQuestFormValues) => {
      const { error } = await supabase.from('side_quests').insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['side_quests'] }),
  });
}

export function useUpdateSideQuest() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<SideQuestFormValues> }) => {
      const patch: Record<string, unknown> = { ...values };
      if (values.status === 'completed') patch.completed_at = new Date().toISOString();
      const { error } = await supabase.from('side_quests').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['side_quests'] }),
  });
}

export function useAddMilestone() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sideQuestId, title, dueDate }: { sideQuestId: string; title: string; dueDate?: string | null }) => {
      const { error } = await supabase
        .from('side_quest_milestones')
        .insert({ side_quest_id: sideQuestId, user_id: user!.id, title, due_date: dueDate });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['side_quests'] }),
  });
}

export function useToggleMilestone() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('side_quest_milestones')
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['side_quests'] }),
  });
}
