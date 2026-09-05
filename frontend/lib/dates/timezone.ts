import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date as YYYY-MM-DD in the given IANA timezone — NOT the
 * server's UTC date. This must be used for every "today" calculation
 * (dashboard, sleep, tasks, aggregates) per the product spec's timezone
 * handling requirements.
 */
export function todayInTimezone(timezone = DEFAULT_TIMEZONE): string {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
}

export function localDateLabel(dateIso: string, timezone = DEFAULT_TIMEZONE): string {
  const zoned = toZonedTime(`${dateIso}T00:00:00`, timezone);
  return format(zoned, 'EEEE, MMMM d');
}

export function localTimeLabel(instant: string | Date, timezone = DEFAULT_TIMEZONE): string {
  return formatInTimeZone(instant, timezone, 'h:mm a');
}

export function localDateTimeLabel(instant: string | Date, timezone = DEFAULT_TIMEZONE): string {
  return formatInTimeZone(instant, timezone, 'MMM d, h:mm a');
}

/** Converts a local "YYYY-MM-DDTHH:mm" input (from a <input type=datetime-local>) to a UTC ISO instant. */
export function localInputToUtcIso(localValue: string, timezone = DEFAULT_TIMEZONE): string {
  return fromZonedTime(localValue, timezone).toISOString();
}

/** Converts a UTC ISO instant to the "YYYY-MM-DDTHH:mm" shape a datetime-local input expects. */
export function utcIsoToLocalInput(iso: string, timezone = DEFAULT_TIMEZONE): string {
  return formatInTimeZone(iso, timezone, "yyyy-MM-dd'T'HH:mm");
}

export function addDaysIso(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
