'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import type { ExpenseFormValues } from '@/lib/validation/expense';

export function useExpenses(params: { from: string; to: string }) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['expenses', user?.id, params.from, params.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, expense_categories(name, icon)')
        .eq('user_id', user!.id)
        .gte('expense_date', params.from)
        .lte('expense_date', params.to)
        .is('deleted_at', null)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCategoryBreakdown(monthStartIso: string) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['category_expense_breakdown', user?.id, monthStartIso],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_expense_breakdown')
        .select('*')
        .eq('user_id', user!.id)
        .eq('month', monthStartIso)
        .order('total_amount', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useMonthlyTrend(months: string[]) {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['monthly_expense_summary', user?.id, months.join(',')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_expense_summary')
        .select('*')
        .eq('user_id', user!.id)
        .in('month', months)
        .order('month', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useBudgets() {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('budgets').select('*, expense_categories(name)').eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddExpense() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      const { error } = await supabase.from('expenses').insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['category_expense_breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_expense_summary'] });
    },
  });
}

export function useUpdateExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<ExpenseFormValues> }) => {
      const { error } = await supabase.from('expenses').update(values).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

/** Soft delete: sets deleted_at rather than removing the row, preserving historical analytics integrity. */
export function useDeleteExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
