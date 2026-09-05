import { z } from 'zod';

// Two input modes are supported: duration-only, or start/end (duration
// auto-calculated). Validated as a discriminated shape so the form can
// switch modes without losing type safety.
export const timeEntrySchema = z
  .object({
    activity_name: z.string().min(1, 'Name the activity'),
    category_id: z.string().uuid().nullable().optional(),
    entry_date: z.string().min(1, 'Pick a date'),
    mode: z.enum(['duration', 'range']),
    duration_minutes: z.coerce.number().positive('Duration must be greater than zero').optional(),
    start_at: z.string().optional(),
    end_at: z.string().optional(),
    notes: z.string().max(1000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'duration' && !data.duration_minutes) {
      ctx.addIssue({ code: 'custom', path: ['duration_minutes'], message: 'Enter a duration' });
    }
    if (data.mode === 'range') {
      if (!data.start_at || !data.end_at) {
        ctx.addIssue({ code: 'custom', path: ['end_at'], message: 'Enter both a start and end time' });
      }
    }
  });

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;
