import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Give the task a title'),
  description: z.string().max(2000).optional().nullable(),
  due_at: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().max(60).optional().nullable(),
  estimated_minutes: z.coerce.number().positive().optional().nullable(),
  planned_for: z.string().optional().nullable(),
  reminder_at: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const POSTPONE_REASONS = [
  'Not enough time',
  'Waiting for someone',
  'Low priority',
  'Unexpected work',
  'Personal issue',
  'Need more information',
  'Other',
] as const;

export const postponeSchema = z.object({
  new_due_date: z.string().min(1, 'Pick a new due date'),
  reason: z.string().min(1, 'Select or enter a reason'),
});

export const removeSchema = z.object({
  reason: z.string().min(1, 'Select or enter a reason'),
});
