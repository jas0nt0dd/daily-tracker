import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { TOTAL_MINUTES_PER_DAY } from '@/lib/utils/time';

type Client = SupabaseClient<Database>;

export async function getDailyExpenseSummary(client: Client, userId: string, date: string) {
  const { data, error } = await client
    .from('expenses')
    .select('amount, category_id, expense_categories(name)')
    .eq('user_id', userId)
    .eq('expense_date', date)
    .is('deleted_at', null);
  if (error) throw error;

  const total = (data ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  return { total, count: data?.length ?? 0, expenses: data ?? [] };
}

export async function getMonthlyExpenseSummary(client: Client, userId: string, monthStartIso: string) {
  const { data, error } = await client
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('month', monthStartIso)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface DayTimeBreakdown {
  totalMinutes: number;
  trackedMinutes: number;
  untrackedMinutes: number;
  overflowMinutes: number;
  byCategory: { category: string; minutes: number }[];
}

/**
 * Computes the 24-hour breakdown for the dashboard's day ring. Never assumes
 * what untracked time was, and explicitly surfaces overflow beyond 24h
 * rather than silently clipping it (see DASHBOARD / DATA QUALITY RULES).
 */
export async function getDailyTimeSummary(client: Client, userId: string, date: string): Promise<DayTimeBreakdown> {
  const { data, error } = await client
    .from('time_entries')
    .select('duration_minutes, time_categories(name)')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .is('deleted_at', null);
  if (error) throw error;

  const byCategoryMap = new Map<string, number>();
  let totalMinutes = 0;
  for (const row of data ?? []) {
    const name = (row as any).time_categories?.name ?? 'Other';
    const mins = Number(row.duration_minutes);
    totalMinutes += mins;
    byCategoryMap.set(name, (byCategoryMap.get(name) ?? 0) + mins);
  }

  const trackedMinutes = Math.min(totalMinutes, TOTAL_MINUTES_PER_DAY);
  const overflowMinutes = Math.max(0, totalMinutes - TOTAL_MINUTES_PER_DAY);
  const untrackedMinutes = Math.max(0, TOTAL_MINUTES_PER_DAY - totalMinutes);

  return {
    totalMinutes,
    trackedMinutes,
    untrackedMinutes,
    overflowMinutes,
    byCategory: Array.from(byCategoryMap.entries()).map(([category, minutes]) => ({ category, minutes })),
  };
}

export async function getSleepSummary(client: Client, userId: string, sinceDate: string) {
  const { data, error } = await client
    .from('sleep_entries')
    .select('sleep_start, sleep_end, duration_minutes, quality')
    .eq('user_id', userId)
    .gte('sleep_start', sinceDate)
    .is('deleted_at', null)
    .order('sleep_start', { ascending: true });
  if (error) throw error;

  const entries = data ?? [];
  const avgMinutes = entries.length ? entries.reduce((s, e) => s + Number(e.duration_minutes), 0) / entries.length : null;

  return { entries, avgMinutes };
}

export async function getTaskCompletionSummary(client: Client, userId: string, weekStartIso: string) {
  const { data, error } = await client
    .from('task_completion_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStartIso)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getWorkoutSummary(client: Client, userId: string, weekStartIso: string) {
  const { data, error } = await client
    .from('workout_weekly_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStartIso)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getHabitSummary(client: Client, userId: string, weekStartIso: string) {
  const { data, error } = await client
    .from('habit_completion_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStartIso);
  if (error) throw error;
  return data ?? [];
}

export async function getWellbeingSummary(client: Client, userId: string, sinceDate: string) {
  const { data, error } = await client
    .from('wellbeing_logs')
    .select('log_date, mood, energy, stress')
    .eq('user_id', userId)
    .gte('log_date', sinceDate)
    .order('log_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Single-call day overview backed by the get_day_overview() SQL function, used by the Dashboard + Day view. */
export async function getDayOverview(client: Client, userId: string, date: string) {
  const { data, error } = await client.rpc('get_day_overview', { p_user_id: userId, p_day: date });
  if (error) throw error;
  return data as {
    expenses_total: number;
    time_total_minutes: number;
    tasks_completed: number;
    tasks_planned: number;
    workout_minutes: number;
    sleep_minutes: number;
    wellbeing: { mood: number; energy: number; stress: number } | null;
  };
}
