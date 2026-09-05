import { z } from 'zod';

export const wellbeingSchema = z.object({
  log_date: z.string().min(1),
  mood: z.coerce.number().min(1).max(5),
  energy: z.coerce.number().min(1).max(5),
  stress: z.coerce.number().min(1).max(5),
  notes: z.string().max(1000).optional().nullable(),
});

export type WellbeingFormValues = z.infer<typeof wellbeingSchema>;
