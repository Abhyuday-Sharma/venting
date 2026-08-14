import { describe, it, expect } from 'vitest';
import { getDate, toMillis } from './date-utils';

const ISO = '2026-08-10T12:00:00.000Z';
const MS = Date.parse(ISO);

/** Stand-in for a hydrated Firestore Timestamp. */
const timestampLike = (ms: number) => ({
  seconds: Math.floor(ms / 1000),
  nanoseconds: (ms % 1000) * 1e6,
  toDate: () => new Date(ms),
  toMillis: () => ms,
});

/** Stand-in for a Timestamp that crossed a server/client boundary as plain JSON. */
const rawTimestamp = (ms: number) => ({
  seconds: Math.floor(ms / 1000),
  nanoseconds: (ms % 1000) * 1e6,
});

describe('getDate', () => {
  it('passes a valid Date through', () => {
    const d = new Date(MS);
    expect(getDate(d)).toBe(d);
  });

  it('unwraps a Timestamp via toDate()', () => {
    expect(getDate(timestampLike(MS))?.toISOString()).toBe(ISO);
  });

  it('reconstructs a raw {seconds, nanoseconds} timestamp', () => {
    expect(getDate(rawTimestamp(MS))?.toISOString()).toBe(ISO);
  });

  it('accepts epoch milliseconds and ISO strings', () => {
    expect(getDate(MS)?.toISOString()).toBe(ISO);
    expect(getDate(ISO)?.toISOString()).toBe(ISO);
  });

  it('defaults nanoseconds to zero when absent', () => {
    expect(getDate({ seconds: 1000 })?.getTime()).toBe(1_000_000);
  });

  it('returns null for missing, invalid, or unparseable values', () => {
    expect(getDate(null)).toBeNull();
    expect(getDate(undefined)).toBeNull();
    expect(getDate(new Date('nope'))).toBeNull();
    expect(getDate('not a date')).toBeNull();
    expect(getDate({})).toBeNull();
  });

  it('falls back past a throwing toDate() to the raw seconds field', () => {
    const hostile = {
      seconds: Math.floor(MS / 1000),
      nanoseconds: 0,
      toDate: () => {
        throw new Error('detached from Firestore');
      },
    };
    expect(getDate(hostile)?.getTime()).toBe(Math.floor(MS / 1000) * 1000);
  });
});

describe('toMillis', () => {
  it('reads each supported timestamp shape', () => {
    expect(toMillis(timestampLike(MS))).toBe(MS);
    expect(toMillis(rawTimestamp(MS))).toBe(MS);
    expect(toMillis(MS)).toBe(MS);
    expect(toMillis(ISO)).toBe(MS);
    expect(toMillis(new Date(MS))).toBe(MS);
  });

  it('returns 0 for missing, invalid, or unparseable values', () => {
    expect(toMillis(null)).toBe(0);
    expect(toMillis(undefined)).toBe(0);
    expect(toMillis('not a date')).toBe(0);
    expect(toMillis(new Date('nope'))).toBe(0);
    expect(toMillis({})).toBe(0);
  });

  it('agrees with getDate for a given timestamp', () => {
    expect(toMillis(timestampLike(MS))).toBe(getDate(timestampLike(MS))?.getTime());
  });

  it('sorts newest-first correctly, which is what the feed relies on', () => {
    const older = rawTimestamp(MS - 60_000);
    const newer = timestampLike(MS);
    expect([older, newer].sort((a, b) => toMillis(b) - toMillis(a))[0]).toBe(newer);
  });
});
