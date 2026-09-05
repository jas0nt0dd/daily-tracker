'use client';
import { WeeklyInsightsPanel } from '@/features/insights/WeeklyInsightsPanel';

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl">Insights</h1>
        <p className="text-sm text-muted">Only shown when there's enough data behind it — no guesses dressed up as trends.</p>
      </div>
      <WeeklyInsightsPanel />
    </div>
  );
}
