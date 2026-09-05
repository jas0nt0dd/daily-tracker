'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import { EmptyState } from '@/components/ui/empty-state';
import { PieChart as PieIcon } from 'lucide-react';
import { useCategoryBreakdown } from './api';

// Distinct-enough hues around the "day" accent so the chart reads as one
// family rather than a rainbow of unrelated category colors.
const PALETTE = ['#B8862B', '#C77D2E', '#D4A24C', '#8C6A2A', '#E0B96B', '#9C7B3C', '#A88A4A', '#C9A05C'];

export function CategoryDonut({ monthStartIso }: { monthStartIso: string }) {
  const { data, isLoading } = useCategoryBreakdown(monthStartIso);

  if (isLoading) return <div className="h-56 animate-pulse rounded-md bg-surface-muted" />;

  const rows = (data ?? []).filter((r) => Number(r.total_amount) > 0);
  if (rows.length === 0) {
    return <EmptyState icon={PieIcon} title="No spending yet this month" description="Your category breakdown will appear here." />;
  }

  const total = rows.reduce((s, r) => s + Number(r.total_amount), 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="total_amount" nameKey="category_name" innerRadius={55} outerRadius={80} paddingAngle={2}>
              {rows.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex w-full flex-col gap-2 text-sm">
        {rows.slice(0, 8).map((r, i) => (
          <li key={r.category_name ?? i} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
              <span className="truncate">{r.category_name ?? 'Uncategorized'}</span>
            </span>
            <span className="whitespace-nowrap text-muted">
              {formatCurrency(Number(r.total_amount))} · {Math.round((Number(r.total_amount) / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
