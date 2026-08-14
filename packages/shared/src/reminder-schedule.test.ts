import { describe, expect, it } from 'vitest';
import { buildReminderSchedule } from './reminder-schedule';

describe('programación de recordatorios', () => {
  const activity = { due_date: '2026-08-21', due_time: '10:00' };
  it('crea recordatorios 7, 3 y 1 día antes', () => {
    const result = buildReminderSchedule('abc', activity, new Date('2026-08-01T00:00:00Z'));
    expect(result.map((item) => item.daysBefore)).toEqual([7, 3, 1]);
    expect(result[0]?.scheduledFor).toBe('2026-08-14T15:00:00.000Z');
  });
  it('produce claves idempotentes estables', () => {
    const first = buildReminderSchedule('abc', activity, new Date('2026-08-01T00:00:00Z'));
    const second = buildReminderSchedule('abc', activity, new Date('2026-08-01T00:00:00Z'));
    expect(first.map((item) => item.deduplicationKey)).toEqual(second.map((item) => item.deduplicationKey));
    expect(new Set(first.map((item) => item.deduplicationKey)).size).toBe(3);
  });
  it('no programa momentos que ya pasaron', () => {
    expect(buildReminderSchedule('abc', activity, new Date('2026-08-20T16:00:00Z'))).toHaveLength(0);
  });
});
