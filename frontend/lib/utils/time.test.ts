import { describe, expect, it } from 'vitest';
import { minutesBetween, formatMinutes } from './time';
import { localDateLabel } from '../dates/timezone';
import { timeEntrySchema } from '../validation/timeEntry';
import { sleepEntrySchema } from '../validation/sleep';

describe('time calculations and validation', () => {
  it('calculates elapsed whole minutes and clamps reversed intervals', () => {
    expect(minutesBetween('2026-10-10T08:00:00.000Z', '2026-10-10T09:15:30.000Z')).toBe(76);
    expect(minutesBetween('2026-10-10T09:00:00.000Z', '2026-10-10T08:00:00.000Z')).toBe(0);
  });

  it('formats minute totals without a zero-hour component', () => {
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(480)).toBe('8h');
    expect(formatMinutes(510)).toBe('8h 30m');
  });

  it('keeps a calendar date label stable across profile timezones', () => {
    expect(localDateLabel('2026-10-10', 'Pacific/Honolulu')).toBe('Saturday, October 10');
    expect(localDateLabel('2026-10-10', 'Asia/Kolkata')).toBe('Saturday, October 10');
  });

  it('rejects invalid ranges and fractional minute durations', () => {
    const base = { activity_name: 'Work', entry_date: '2026-10-10', mode: 'range' as const };
    expect(timeEntrySchema.safeParse({ ...base, start_at: '2026-10-10T10:00:00.000Z', end_at: '2026-10-10T09:00:00.000Z' }).success).toBe(false);
    expect(timeEntrySchema.safeParse({ ...base, mode: 'duration', duration_minutes: 1.5 }).success).toBe(false);
  });

  it('rejects malformed sleep timestamps', () => {
    expect(sleepEntrySchema.safeParse({ sleep_start: 'not-a-date', sleep_end: 'also-not-a-date' }).success).toBe(false);
  });
});