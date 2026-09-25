import { getDate } from '@/lib/date-utils';

/** Minimum number of distinct days someone has vented on to count as returning. */
export const RETURNING_MIN_DAYS = 2;

/**
 * Whether a user has come back on a later day, i.e. has vents on at least
 * {@link RETURNING_MIN_DAYS} different local calendar days. Gates the optional
 * AI features (micro-goals, mood insights) so one-off visitors don't spend Groq
 * credits. A vent whose server timestamp is still pending counts as today.
 */
export function isReturningUser(vents: { timestamp?: unknown }[], now: Date = new Date()): boolean {
  const days = new Set<string>();
  for (const vent of vents) {
    const date = getDate(vent.timestamp) ?? now;
    days.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
    if (days.size >= RETURNING_MIN_DAYS) return true;
  }
  return false;
}
