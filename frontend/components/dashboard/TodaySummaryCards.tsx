'use client';
import { useQuery } from '@tanstack/react-query';
import { Wallet, ListTodo, Dumbbell, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import { getDayOverview, getDailyTimeSummary } from '@/lib/analytics/queries';
import { formatCurrency } from '@/lib/utils/currency';
import { formatMinutes } from '@/lib/utils/time';
import { todayInTimezone } from '@/lib/dates/timezone';
import { Card, CardContent } from '@/components/ui/card';
import { DayRing } from './DayRing';

export function useToday() {
  const { profile } = useProfile();
  return todayInTimezone(profile?.timezone);
}

export function DayRingSection() {
  const { user } = useUser();
  const today = useToday();
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ['daily_time_summary', user?.id, today],
    queryFn: () => getDailyTimeSummary(supabase, user!.id, today),
    enabled: !!user,
  });

  if (isLoading || !data) return <div className="h-56 animate-pulse rounded-md bg-surface-muted" />;

  const sleepSegment = data.byCategory.find((c) => c.category === 'Sleep');

  return <DayRing segments={data.byCategory} sleepMinutes={sleepSegment?.minutes ?? 0} />;
}

export function TodaySummaryCards() {
  const { user } = useUser();
  const { profile } = useProfile();
  const today = useToday();
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ['day_overview', user?.id, today],
    queryFn: () => getDayOverview(supabase, user!.id, today),
    enabled: !!user,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Spent today', value: formatCurrency(Number(data.expenses_total), profile?.currency), icon: Wallet },
    { label: 'Tasks done', value: `${data.tasks_completed} / ${data.tasks_planned}`, icon: ListTodo },
    { label: 'Workout', value: data.workout_minutes ? formatMinutes(Number(data.workout_minutes)) : 'Rest day', icon: Dumbbell },
    { label: 'Last sleep', value: data.sleep_minutes ? formatMinutes(Number(data.sleep_minutes)) : '—', icon: Moon },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex flex-col gap-2 p-4">
            <Icon className="h-4 w-4 text-day" />
            <p className="font-display text-lg">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
