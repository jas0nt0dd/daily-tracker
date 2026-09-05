import type { SupabaseClient } from '@supabase/supabase-js';

const EXPORT_TABLES = [
  'expenses',
  'time_entries',
  'sleep_entries',
  'tasks',
  'workouts',
  'workout_exercises',
  'side_quests',
  'side_quest_milestones',
  'habits',
  'habit_logs',
  'wellbeing_logs',
] as const;

export interface ExportBundle {
  generatedAt: string;
  data: Record<string, unknown[]>;
}

/**
 * Pulls every user-owned table via the user-scoped client (RLS-enforced,
 * not the admin client) so an export can never leak another user's rows
 * even if this function were called with the wrong id by mistake.
 */
export async function buildExportBundle(client: SupabaseClient, userId: string): Promise<ExportBundle> {
  const data: Record<string, unknown[]> = {};

  for (const table of EXPORT_TABLES) {
    const { data: rows, error } = await client.from(table).select('*').eq('user_id', userId);
    if (error) throw new Error(`Failed exporting ${table}: ${error.message}`);
    data[table] = rows ?? [];
  }

  return { generatedAt: new Date().toISOString(), data };
}

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Produces one CSV section per table, concatenated with headers. */
export function bundleToCsv(bundle: ExportBundle): string {
  const sections: string[] = [];

  for (const [table, rows] of Object.entries(bundle.data)) {
    sections.push(`# ${table}`);
    if (rows.length === 0) {
      sections.push('(no rows)');
      sections.push('');
      continue;
    }
    const columns = Object.keys(rows[0] as Record<string, unknown>);
    sections.push(columns.join(','));
    for (const row of rows) {
      sections.push(columns.map((c) => toCsvValue((row as Record<string, unknown>)[c])).join(','));
    }
    sections.push('');
  }

  return sections.join('\n');
}
