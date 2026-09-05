'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SleepEntryForm } from '@/features/sleep/SleepEntryForm';
import { SleepChart, SleepList } from '@/features/sleep/SleepChart';

export default function SleepPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Sleep</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Log sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepEntryForm />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Last 14 nights</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepList />
        </CardContent>
      </Card>
    </div>
  );
}
