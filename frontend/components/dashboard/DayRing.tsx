'use client';
import { formatMinutes, TOTAL_MINUTES_PER_DAY } from '@/lib/utils/time';

interface Segment {
  label: string;
  minutes: number;
  color: string;
}

const RADIUS = 90;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Renders the day as a ring of arcs, one per category, in a fixed clockwise
 * order starting at 12 o'clock. Untracked time is rendered as a faint gap
 * rather than silently omitted, so the ring always visually accounts for a
 * full 24 hours.
 */
export function DayRing({ segments, sleepMinutes }: { segments: { category: string; minutes: number }[]; sleepMinutes: number }) {
  const PALETTE = ['#B8862B', '#C77D2E', '#D4A24C', '#8C6A2A', '#E0B96B', '#9C7B3C'];

  const tracked: Segment[] = [
    ...(sleepMinutes > 0 ? [{ label: 'Sleep', minutes: sleepMinutes, color: 'hsl(var(--night))' }] : []),
    ...segments
      .filter((s) => s.category !== 'Sleep' && s.minutes > 0)
      .map((s, i) => ({ label: s.category, minutes: s.minutes, color: PALETTE[i % PALETTE.length] ?? '#B8862B' })),
  ];

  const trackedTotal = tracked.reduce((sum, s) => sum + s.minutes, 0);
  const untracked = Math.max(0, TOTAL_MINUTES_PER_DAY - trackedTotal);
  const allSegments = untracked > 0 ? [...tracked, { label: 'Untracked', minutes: untracked, color: 'hsl(var(--surface-muted))' }] : tracked;

  let cumulative = 0;
  const arcs = allSegments.map((seg) => {
    const fraction = seg.minutes / TOTAL_MINUTES_PER_DAY;
    const dash = fraction * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const offset = -((cumulative / TOTAL_MINUTES_PER_DAY) * CIRCUMFERENCE);
    cumulative += seg.minutes;
    return { ...seg, dash, gap, offset };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative h-56 w-56 shrink-0">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="hsl(var(--surface-muted))" strokeWidth={STROKE} />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl">{formatMinutes(trackedTotal)}</span>
          <span className="text-xs text-muted">tracked today</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2 text-sm">
        {allSegments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="truncate">{seg.label}</span>
            </span>
            <span className="whitespace-nowrap text-muted">{formatMinutes(seg.minutes)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
