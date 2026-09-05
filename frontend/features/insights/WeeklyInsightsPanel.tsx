'use client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Lightbulb } from 'lucide-react';
import { callBackend } from '@/lib/api/backend';
import { useUser } from '@/hooks/useUser';
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
  return useQuery({
    queryKey: ['weekly_insights', user?.id],
    queryFn: () => callBackend<WeeklyInsights>('/api/insights/weekly'),
    enabled: !!user,
  });
}

export function WeeklyInsightsPanel() {
  const { data, isLoading, error } = useWeeklyInsights();

  if (isLoading) return <div className="h-48 animate-pulse rounded-md bg-surface-muted" />;

  if (error) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Insights unavailable"
        description="Couldn't reach the backend service. Check that it's running and NEXT_PUBLIC_API_URL is set correctly."
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
