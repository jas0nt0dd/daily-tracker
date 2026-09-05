'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TimeEntryForm } from '@/features/time/TimeEntryForm';
import { TimeList } from '@/features/time/TimeList';
import { TimeBreakdownChart } from '@/features/time/TimeBreakdownChart';
import { todayInTimezone } from '@/lib/dates/timezone';

export default function TimePage() {
  const today = todayInTimezone();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Time</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Log time</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeEntryForm date={today} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeBreakdownChart date={today} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's entries</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeList date={today} />
        </CardContent>
      </Card>
    </div>
  );
}
