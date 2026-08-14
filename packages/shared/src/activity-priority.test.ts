import { describe, expect, it } from 'vitest';
import { calculatePriority, effectiveActivityStatus, isActivityOverdue } from './activity-priority';

const now = new Date('2026-08-14T15:00:00Z');
const base = { due_date: '2026-08-15', due_time: '10:00', status: 'PENDING' as const, importance: 'MEDIUM' as const, percentage: 5, type: 'TASK' as const };

describe('estado vencido', () => {
  it('marca vencida una actividad abierta pasada', () => expect(isActivityOverdue({ ...base, due_date: '2026-08-13' }, now)).toBe(true));
  it('conserva completadas aunque la fecha haya pasado', () => expect(effectiveActivityStatus({ ...base, status: 'COMPLETED', due_date: '2026-08-13' }, now)).toBe('COMPLETED'));
  it('usa fin del día de Bogotá cuando no existe hora', () => expect(isActivityOverdue({ ...base, due_date: '2026-08-14', due_time: null }, now)).toBe(false));
});

describe('prioridad automática', () => {
  it('prioriza vencidas sobre futuras', () => {
    expect(calculatePriority({ ...base, due_date: '2026-08-13' }, now)).toBeGreaterThan(
      calculatePriority({ ...base, due_date: '2026-08-25' }, now),
    );
  });
  it('prioriza importancia alta', () => {
    expect(calculatePriority({ ...base, importance: 'HIGH' }, now)).toBeGreaterThan(
      calculatePriority({ ...base, importance: 'LOW' }, now),
    );
  });
  it('da visibilidad adicional al alto impacto', () => {
    expect(calculatePriority({ ...base, percentage: 20 }, now)).toBeGreaterThan(
      calculatePriority({ ...base, percentage: 5 }, now),
    );
  });
  it('envía completadas al final', () => expect(calculatePriority({ ...base, status: 'COMPLETED' }, now)).toBe(-1000));
});
