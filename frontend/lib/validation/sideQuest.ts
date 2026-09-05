import { z } from 'zod';

export const sideQuestSchema = z.object({
  title: z.string().min(1, 'Give it a title'),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  status: z.enum(['planned', 'active', 'paused', 'completed', 'abandoned']).default('planned'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  progress_percent: z.coerce.number().min(0).max(100).default(0),
  start_date: z.string().optional().nullable(),
  target_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type SideQuestFormValues = z.infer<typeof sideQuestSchema>;

export const milestoneSchema = z.object({
  title: z.string().min(1, 'Name the milestone'),
  due_date: z.string().optional().nullable(),
});
