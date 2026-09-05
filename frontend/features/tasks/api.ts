'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import type { TaskFormValues } from '@/lib/validation/task';

export function useTasks(filter: { status?: string; planned_for?: string } = {}) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['tasks', user?.id, filter.status, filter.planned_for],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').eq('user_id', user!.id);
      if (filter.status) query = query.eq('status', filter.status);
      if (filter.planned_for) query = query.eq('planned_for', filter.planned_for);
      const { data, error } = await query.order('due_at', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTaskHistory(taskId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['task_events', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_events')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
}

export function useAddTask() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const { error } = await supabase.from('tasks').insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useCompleteTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function usePostponeTask() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newDueDate, reason }: { id: string; newDueDate: string; reason: string }) => {
      // The task stays "pending" (it's still active, just rescheduled) — status
      // doesn't change, so the DB trigger won't auto-log an event. We record
      // the postpone explicitly instead, preserving the reason for later review.
      const { error } = await supabase
        .from('tasks')
        .update({ postponed_until: newDueDate, due_at: newDueDate, current_reason: reason })
        .eq('id', id);
      if (error) throw error;

      const { error: eventError } = await supabase.from('task_events').insert({
        task_id: id,
        user_id: user!.id,
        event_type: 'postponed',
        from_status: 'pending',
        to_status: 'pending',
        reason,
      });
      if (eventError) throw eventError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useRemoveTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.from('tasks').update({ status: 'removed', current_reason: reason }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

/** Assigns a task to tomorrow's plan (used by the evening "plan tomorrow" flow). */
export function usePlanForDate() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase.from('tasks').update({ planned_for: date }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
