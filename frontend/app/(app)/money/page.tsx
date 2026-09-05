'use client';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExpenseForm } from '@/features/money/ExpenseForm';
import { ExpenseList } from '@/features/money/ExpenseList';
import { CategoryDonut } from '@/features/money/CategoryDonut';
import { MonthlyTrendChart, BudgetBars } from '@/features/money/MonthlyTrendChart';
import { useCategoryBreakdown } from '@/features/money/api';
import { todayInTimezone, addDaysIso } from '@/lib/dates/timezone';

export default function MoneyPage() {
  const today = todayInTimezone();
  const monthStart = format(new Date(), 'yyyy-MM-01');
  const { data: breakdown } = useCategoryBreakdown(monthStart);

  const monthTotalsByCategory = Object.fromEntries((breakdown ?? []).map((r) => [r.category_name ?? 'Uncategorized', Number(r.total_amount)]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Money</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add expense</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This month by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDonut monthStartIso={monthStart} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending trend</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyTrendChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetBars monthTotalsByCategory={monthTotalsByCategory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseList from={addDaysIso(today, -30)} to={today} />
        </CardContent>
      </Card>
    </div>
  );
}
