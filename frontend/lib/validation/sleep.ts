import { z } from 'zod';

export const sleepEntrySchema = z
  .object({
    sleep_start: z.string().datetime({ offset: true, message: 'Enter a valid sleep start time' }),
    sleep_end: z.string().datetime({ offset: true, message: 'Enter a valid wake time' }),
    quality: z.coerce.number().min(1).max(5).optional(),
    notes: z.string().max(1000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.sleep_start && data.sleep_end && new Date(data.sleep_end) <= new Date(data.sleep_start)) {
      ctx.addIssue({ code: 'custom', path: ['sleep_end'], message: 'Wake time must be after sleep start' });
    }
    if (data.sleep_start && data.sleep_end) {
      const hours = (new Date(data.sleep_end).getTime() - new Date(data.sleep_start).getTime()) / 3_600_000;
      if (hours > 24) {
        ctx.addIssue({ code: 'custom', path: ['sleep_end'], message: 'A single sleep session cannot exceed 24 hours' });
      }
    }
  });

export type SleepEntryFormValues = z.infer<typeof sleepEntrySchema>;
