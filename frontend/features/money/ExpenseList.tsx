'use client';
import { Wallet, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { localDateLabel } from '@/lib/dates/timezone';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExpenses, useDeleteExpense } from './api';

export function ExpenseList({ from, to }: { from: string; to: string }) {
  const { data: expenses, isLoading } = useExpenses({ from, to });
  const deleteExpense = useDeleteExpense();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No expenses in this range"
        description="Expenses you log will show up here, grouped by day."
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {expenses.map((e: any) => (
        <li key={e.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{e.description || e.merchant || e.expense_categories?.name || 'Expense'}</p>
            <p className="text-xs text-muted">
              {localDateLabel(e.expense_date)}
              {e.expense_categories?.name && ` · ${e.expense_categories.name}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap font-display text-base">{formatCurrency(Number(e.amount), e.currency)}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete expense"
              onClick={() => deleteExpense.mutate(e.id)}
              className="h-8 w-8 text-muted hover:text-error"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
