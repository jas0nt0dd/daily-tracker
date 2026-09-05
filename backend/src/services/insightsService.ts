import type { SupabaseClient } from '@supabase/supabase-js';

const MIN_DAYS_FOR_COMPARISON = 4; // avoid comparing weeks built on too little data

export interface WeeklyInsights {
  weekStart: string;
  money: { total: number };
  time: Record<string, number>; // category -> minutes
  tasks: { completed: number; postponed: number; removed: number };
  sleep: { avgMinutes: number | null };
  habits: { completionRate: number | null };
  sideQuests: { minutesInvested: number };
  comparisons: string[];
}

function startOfWeekISO(daysAgo = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo - d.getUTCDay());
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/**
 * Builds this week's summary plus week-over-week comparisons, but only emits
 * a comparison sentence when both weeks have enough underlying data — never
 * fabricate a trend from noise (see DATA QUALITY / INSIGHTS in the spec).
 */
export async function getWeeklyInsights(client: SupabaseClient, userId: string): Promise<WeeklyInsights> {
  const thisWeekStart = startOfWeekISO(0);
  const lastWeekStart = startOfWeekISO(7);

  const [expensesThis, expensesLast, timeThis, tasksThis, sleepThis, sideQuestLinksThis] = await Promise.all([
    client.from('expenses').select('amount').eq('user_id', userId).gte('expense_date', thisWeekStart).is('deleted_at', null),
    client
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('expense_date', lastWeekStart)
      .lt('expense_date', thisWeekStart)
      .is('deleted_at', null),
    client
      .from('category_time_breakdown')
      .select('category_name, total_minutes, entry_date')
      .eq('user_id', userId)
      .gte('entry_date', thisWeekStart),
    client.from('tasks').select('status').eq('user_id', userId).gte('created_at', thisWeekStart),
    client.from('sleep_entries').select('duration_minutes').eq('user_id', userId).gte('sleep_start', thisWeekStart).is('deleted_at', null),
    client.from('time_entries').select('duration_minutes, category_id').eq('user_id', userId).gte('entry_date', thisWeekStart),
  ]);

  const totalThis = (expensesThis.data ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  const totalLast = (expensesLast.data ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

  const time: Record<string, number> = {};
  for (const row of timeThis.data ?? []) {
    const key = row.category_name ?? 'Uncategorized';
    time[key] = (time[key] ?? 0) + Number(row.total_minutes);
  }

  const tasks = { completed: 0, postponed: 0, removed: 0 };
  for (const t of tasksThis.data ?? []) {
    if (t.status === 'completed') tasks.completed += 1;
    if (t.status === 'postponed') tasks.postponed += 1;
    if (t.status === 'removed') tasks.removed += 1;
  }

  const sleepDurations = (sleepThis.data ?? []).map((s) => Number(s.duration_minutes));
  const avgMinutes = sleepDurations.length > 0 ? sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length : null;

  const comparisons: string[] = [];
  const hasEnoughLastWeekData = (expensesLast.data ?? []).length >= MIN_DAYS_FOR_COMPARISON;
  if (hasEnoughLastWeekData && totalLast > 0) {
    const pctChange = Math.round(((totalThis - totalLast) / totalLast) * 100);
    if (Math.abs(pctChange) >= 5) {
      comparisons.push(
        `Spending is ${pctChange > 0 ? 'up' : 'down'} ${Math.abs(pctChange)}% compared to last week.`,
      );
    }
  }

  return {
    weekStart: thisWeekStart,
    money: { total: totalThis },
    time,
    tasks,
    sleep: { avgMinutes },
    habits: { completionRate: null }, // computed in the route from habit_completion_summary view when available
    sideQuests: { minutesInvested: 0 },
    comparisons,
  };
}

export async function getMonthlyInsights(client: SupabaseClient, userId: string, monthStart: string) {
  const { data: expenseSummary } = await client
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('month', monthStart)
    .maybeSingle();

  const { data: categoryBreakdown } = await client
    .from('category_expense_breakdown')
    .select('*')
    .eq('user_id', userId)
    .eq('month', monthStart);

  return {
    month: monthStart,
    money: {
      total: Number(expenseSummary?.total_amount ?? 0),
      average: Number(expenseSummary?.avg_amount ?? 0),
      categories: categoryBreakdown ?? [],
    },
  };
}
