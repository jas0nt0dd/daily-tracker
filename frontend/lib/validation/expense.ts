import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Enter an amount' }).positive('Amount must be greater than zero'),
  currency: z.string().default('INR'),
  category_id: z.string().uuid().nullable().optional(),
  expense_date: z.string().min(1, 'Pick a date'),
  expense_time: z.string().optional().nullable(),
  merchant: z.string().max(120).optional().nullable(),
  payment_method: z.enum(['cash', 'card', 'upi', 'netbanking', 'other']).optional().nullable(),
  description: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
