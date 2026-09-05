'use client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { format, subMonths } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import { useMonthlyTrend, useBudgets } from './api';
import { Progress } from '@/components/ui/progress';

function lastNMonths(n: number): string[] {
  return Array.from({ length: n }, (_, i) => format(subMonths(new Date(), n - 1 - i), 'yyyy-MM-01'));
}

export function MonthlyTrendChart() {
  const months = lastNMonths(6);
  const { data, isLoading } = useMonthlyTrend(months);

  if (isLoading) return <div className="h-64 animate-pulse rounded-md bg-surface-muted" />;

  const chartData = months.map((m) => {
    const row = data?.find((d) => d.month === m);
    return { month: format(new Date(m), 'MMM'), total: Number(row?.total_amount ?? 0) };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted))" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted))" width={48} />
          <Tooltip formatter={(v: number) => formatCurrency(v)} cursor={{ fill: 'hsl(var(--surface-muted))' }} />
          <Bar dataKey="total" fill="hsl(var(--day))" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetBars({ monthTotalsByCategory }: { monthTotalsByCategory: Record<string, number> }) {
  const { data: budgets, isLoading } = useBudgets();

  if (isLoading) return <div className="h-24 animate-pulse rounded-md bg-surface-muted" />;
  if (!budgets || budgets.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {budgets.map((b: any) => {
        const spent = b.category_id ? monthTotalsByCategory[b.expense_categories?.name] ?? 0 : Object.values(monthTotalsByCategory).reduce((s, v) => s + v, 0);
        const pct = Math.min(100, Math.round((spent / Number(b.amount)) * 100));
        const overBudget = spent > Number(b.amount);
        return (
          <div key={b.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{b.name}</span>
              <span className={overBudget ? 'text-error' : 'text-muted'}>
                {formatCurrency(spent)} / {formatCurrency(Number(b.amount))}
              </span>
            </div>
            <Progress value={pct} indicatorClassName={overBudget ? 'bg-error' : undefined} />
          </div>
        );
      })}
    </div>
  );
}
