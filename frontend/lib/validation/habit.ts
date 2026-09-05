import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().min(1, 'Name the habit'),
  description: z.string().max(500).optional().nullable(),
  frequency_type: z.enum(['daily', 'weekly', 'custom']).default('daily'),
  target_count: z.coerce.number().positive().default(1),
  start_date: z.string().min(1),
  end_date: z.string().optional().nullable(),
});

export type HabitFormValues = z.infer<typeof habitSchema>;
