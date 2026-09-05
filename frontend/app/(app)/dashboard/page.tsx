'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DayRingSection, TodaySummaryCards } from '@/components/dashboard/TodaySummaryCards';
import { TaskList } from '@/features/tasks/TaskList';
import { useToday } from '@/components/dashboard/TodaySummaryCards';

export default function DashboardPage() {
  const today = useToday();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl">Today</h1>
        <p className="text-sm text-muted">Your whole day, in one place.</p>
      </div>

      <TodaySummaryCards />

      <Card>
        <CardHeader>
          <CardTitle>Your day</CardTitle>
        </CardHeader>
        <CardContent>
          <DayRingSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList plannedFor={today} />
        </CardContent>
      </Card>
    </div>
  );
}
