'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WorkoutForm } from '@/features/workouts/WorkoutForm';
import { WorkoutList, WorkoutWeeklyStats } from '@/features/workouts/WorkoutList';

export default function WorkoutsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Workouts</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Log workout</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutForm />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This week</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutWeeklyStats />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutList />
        </CardContent>
      </Card>
    </div>
  );
}
