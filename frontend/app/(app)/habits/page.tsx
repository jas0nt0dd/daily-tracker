'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HabitForm } from '@/features/habits/HabitForm';
import { HabitGrid } from '@/features/habits/HabitGrid';

export default function HabitsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Habits</h1>

      <Card>
        <CardHeader>
          <CardTitle>New habit</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitForm />
        </CardContent>
      </Card>

      <HabitGrid />
    </div>
  );
}
