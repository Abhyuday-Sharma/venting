import { describe, it, expect } from 'vitest';
import { isReturningUser } from './engagement';

const at = (iso: string) => ({ timestamp: new Date(iso).getTime() });
const NOW = new Date('2026-09-24T15:00:00');

describe('isReturningUser', () => {
  it('is false with no vents', () => {
    expect(isReturningUser([], NOW)).toBe(false);
  });

  it('is false for several vents on the same day', () => {
    expect(isReturningUser([at('2026-09-24T09:00:00'), at('2026-09-24T11:30:00'), at('2026-09-24T14:00:00')], NOW)).toBe(false);
  });

  it('is true once vents span two different days', () => {
    expect(isReturningUser([at('2026-09-24T09:00:00'), at('2026-09-20T22:00:00')], NOW)).toBe(true);
  });

  it('counts a vent with a pending server timestamp as today', () => {
    expect(isReturningUser([{ timestamp: null }, at('2026-09-24T08:00:00')], NOW)).toBe(false);
    expect(isReturningUser([{ timestamp: null }, at('2026-09-23T08:00:00')], NOW)).toBe(true);
  });

  it('reads raw {seconds, nanoseconds} timestamps', () => {
    const raw = (iso: string) => ({ timestamp: { seconds: Math.floor(new Date(iso).getTime() / 1000), nanoseconds: 0 } });
    expect(isReturningUser([raw('2026-09-24T09:00:00'), raw('2026-09-22T09:00:00')], NOW)).toBe(true);
  });
});
