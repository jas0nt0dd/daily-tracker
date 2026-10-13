'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DayRingSection, TodaySummaryCards } from '@/components/dashboard/TodaySummaryCards';
import { TaskList } from '@/features/tasks/TaskList';
import { SideQuestList } from '@/features/side-quests/SideQuestCard';
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

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl">Side quests</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/side-quests">
              View all <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <SideQuestList dashboard />
      </section>
    </div>
  );
}
