'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, type ExpenseFormValues } from '@/lib/validation/expense';
import { useExpenseCategories } from '@/hooks/useCategories';
import { useAddExpense } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { todayInTimezone } from '@/lib/dates/timezone';

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'netbanking', 'other'] as const;

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: categories } = useExpenseCategories();
  const addExpense = useAddExpense();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { expense_date: todayInTimezone(), currency: 'INR' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addExpense.mutateAsync(values);
      toast({ title: 'Expense added', variant: 'success' });
      reset({ expense_date: values.expense_date, currency: 'INR' });
      onSuccess?.();
    } catch (err) {
      toast({ title: 'Could not add expense', description: 'Please try again.', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" inputMode="decimal" placeholder="0.00" {...register('amount')} />
          {errors.amount && <p className="text-xs text-error">{errors.amount.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expense_date">Date</Label>
          <Input id="expense_date" type="date" {...register('expense_date')} />
          {errors.expense_date && <p className="text-xs text-error">{errors.expense_date.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <Select onValueChange={(v) => setValue('category_id', v)} defaultValue={watch('category_id') ?? undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="merchant">Merchant (optional)</Label>
          <Input id="merchant" placeholder="e.g. Blue Tokai" {...register('merchant')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Payment method</Label>
          <Select onValueChange={(v) => setValue('payment_method', v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === 'upi' ? 'UPI' : m.charAt(0).toUpperCase() + m.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" placeholder="What was this for?" {...register('description')} />
      </div>

      <Button type="submit" variant="accent" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Adding...' : 'Add expense'}
      </Button>
    </form>
  );
}
