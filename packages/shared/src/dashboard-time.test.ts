import { describe, expect, it } from 'vitest';
import { findCurrentClass, findNextClass, getBogotaContext, type WeeklyClass } from './dashboard-time';

const classes: WeeklyClass[] = [{ id: '1', subject_id: 's1', weekday: 5, start_time: '09:00', end_time: '11:00', modality: 'virtual', classroom: null, subject: { id: 's1', name: 'Física', color: '#ffffff' } }];

describe('contexto America/Bogota', () => {
  it('distingue hoy y mañana cerca de medianoche UTC', () => {
    const context = getBogotaContext(new Date('2026-08-15T02:00:00Z'));
    expect(context.date).toBe('2026-08-14');
    expect(context.tomorrow).toBe('2026-08-15');
    expect(context.afterFive).toBe(true);
  });
  it('detecta una clase en curso', () => expect(findCurrentClass(classes, new Date('2026-08-14T15:00:00Z'))?.id).toBe('1'));
  it('encuentra la próxima recurrencia después de terminar la clase', () => expect(findNextClass(classes, new Date('2026-08-14T17:00:00Z'))?.minutes_until).toBeGreaterThan(6 * 24 * 60));
});
