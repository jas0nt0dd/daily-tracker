'use client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MoodCheckin } from '@/features/wellbeing/MoodCheckin';
import { useRecentWellbeing } from '@/features/wellbeing/api';
import { EmptyState } from '@/components/ui/empty-state';
import { HeartPulse } from 'lucide-react';

function WellbeingTrend() {
  const { data, isLoading } = useRecentWellbeing(14);

  if (isLoading) return <div className="h-56 animate-pulse rounded-md bg-surface-muted" />;
  if (!data || data.length === 0) {
    return <EmptyState icon={HeartPulse} title="No check-ins yet" description="Your mood, energy, and stress trends will appear here." />;
  }

  const chartData = data.map((d) => ({ date: format(new Date(d.log_date), 'MMM d'), Mood: d.mood, Energy: d.energy, Stress: d.stress }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted))" />
          <YAxis domain={[1, 5]} tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted))" width={24} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Mood" stroke="hsl(var(--day))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Energy" stroke="hsl(var(--night))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Stress" stroke="hsl(var(--error))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function WellbeingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Wellbeing</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Today's check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodCheckin />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <WellbeingTrend />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
