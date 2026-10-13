'use client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Lightbulb } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import { addDaysIso, localInputToUtcIso, todayInTimezone } from '@/lib/dates/timezone';
import { formatCurrency } from '@/lib/utils/currency';
import { formatMinutes } from '@/lib/utils/time';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

interface WeeklyInsights {
  weekStart: string;
  money: { total: number };
  time: Record<string, number>;
  tasks: { completed: number; postponed: number; removed: number };
  sleep: { avgMinutes: number | null };
  comparisons: string[];
}

function useWeeklyInsights() {
  const { user } = useUser();
  const { profile } = useProfile();
  const supabase = createClient();
  const timezone = profile?.timezone;
  const today = todayInTimezone(timezone);
  const weekStartDay = profile?.week_start_day ?? 1;
  const dayOfWeek = new Date(`${today}T00:00:00Z`).getUTCDay();
  const weekStart = addDaysIso(today, -((dayOfWeek - weekStartDay + 7) % 7));
  const previousWeekStart = addDaysIso(weekStart, -7);
  const nextWeekStart = addDaysIso(weekStart, 7);
  const weekStartInstant = localInputToUtcIso(`${weekStart}T00:00`, timezone);
  const previousWeekStartInstant = localInputToUtcIso(`${previousWeekStart}T00:00`, timezone);
  const nextWeekStartInstant = localInputToUtcIso(`${nextWeekStart}T00:00`, timezone);

  return useQuery({
    queryKey: ['weekly_insights', user?.id, weekStart],
    queryFn: async (): Promise<WeeklyInsights> => {
      const [expensesThis, expensesLast, timeThis, tasksThis, sleepThis] = await Promise.all([
        supabase
          .from('expenses')
          .select('amount, expense_date')
          .eq('user_id', user!.id)
          .gte('expense_date', weekStart)
          .lt('expense_date', nextWeekStart)
          .is('deleted_at', null),
        supabase
          .from('expenses')
          .select('amount, expense_date')
          .eq('user_id', user!.id)
          .gte('expense_date', previousWeekStart)
          .lt('expense_date', weekStart)
          .is('deleted_at', null),
        supabase
          .from('time_entries')
          .select('duration_minutes, time_categories(name)')
          .eq('user_id', user!.id)
          .gte('entry_date', weekStart)
          .lt('entry_date', nextWeekStart)
          .is('deleted_at', null),
        supabase
          .from('tasks')
          .select('status')
          .eq('user_id', user!.id)
          .gte('created_at', weekStartInstant)
          .lt('created_at', nextWeekStartInstant),
        supabase
          .from('sleep_entries')
          .select('duration_minutes')
          .eq('user_id', user!.id)
          .gte('sleep_start', weekStartInstant)
          .lt('sleep_start', nextWeekStartInstant)
          .is('deleted_at', null),
      ]);

      const queryError = expensesThis.error ?? expensesLast.error ?? timeThis.error ?? tasksThis.error ?? sleepThis.error;
      if (queryError) throw queryError;

      const thisWeekTotal = (expensesThis.data ?? []).reduce((sum, expense) => sum + Number(expense.amount), 0);
      const lastWeekTotal = (expensesLast.data ?? []).reduce((sum, expense) => sum + Number(expense.amount), 0);
      const time: Record<string, number> = {};
      for (const row of timeThis.data ?? []) {
        const categoryName = (row as unknown as { time_categories?: { name: string } | null }).time_categories?.name ?? 'Uncategorized';
        time[categoryName] = (time[categoryName] ?? 0) + Number(row.duration_minutes);
      }

      const tasks = { completed: 0, postponed: 0, removed: 0 };
      for (const task of tasksThis.data ?? []) {
        if (task.status === 'completed') tasks.completed += 1;
        if (task.status === 'postponed') tasks.postponed += 1;
        if (task.status === 'removed') tasks.removed += 1;
      }

      const sleepDurations = (sleepThis.data ?? []).map((entry) => Number(entry.duration_minutes));
      const avgMinutes = sleepDurations.length
        ? sleepDurations.reduce((total, duration) => total + duration, 0) / sleepDurations.length
        : null;
      const comparisons: string[] = [];
      const daysWithExpenses = new Set((expensesLast.data ?? []).map((expense) => expense.expense_date)).size;
      if (daysWithExpenses >= 4 && lastWeekTotal > 0) {
        const percentChange = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
        if (Math.abs(percentChange) >= 5) {
          comparisons.push(`Spending is ${percentChange > 0 ? 'up' : 'down'} ${Math.abs(percentChange)}% compared to last week.`);
        }
      }

      return {
        weekStart,
        money: { total: thisWeekTotal },
        time,
        tasks,
        sleep: { avgMinutes },
        comparisons,
      };
    },
    enabled: !!user,
  });
}

export function WeeklyInsightsPanel() {
  const { data, isLoading, error, refetch, isFetching } = useWeeklyInsights();

  if (isLoading) return <div className="h-48 animate-pulse rounded-md bg-surface-muted" />;

  if (error) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Insights unavailable"
        description={error instanceof Error ? error.message : 'The Insights request failed. Check the backend service and try again.'}
        actionLabel={isFetching ? 'Retrying...' : 'Try again'}
        onAction={() => refetch()}
      />
    );
  }

  if (!data) return null;

  const topCategories = Object.entries(data.time)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      {data.comparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-day" /> This week vs. last
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-sm">
              {data.comparisons.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Spent this week</p>
            <p className="mt-1 font-display text-xl">{formatCurrency(data.money.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Tasks completed</p>
            <p className="mt-1 font-display text-xl">{data.tasks.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Avg sleep</p>
            <p className="mt-1 font-display text-xl">{data.sleep.avgMinutes ? formatMinutes(data.sleep.avgMinutes) : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Postponed / removed</p>
            <p className="mt-1 font-display text-xl">
              {data.tasks.postponed} / {data.tasks.removed}
            </p>
          </CardContent>
        </Card>
      </div>

      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where your time went</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {topCategories.map(([name, minutes]) => (
                <li key={name} className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-muted">{formatMinutes(minutes)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
