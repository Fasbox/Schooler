import { describe, expect, it } from 'vitest';
import { calculateGradeSummary, simulateGrade } from './grade-calculations';

describe('cálculos de notas', () => {
  it('diferencia peso planeado y evaluado', () => {
    const result = calculateGradeSummary([{ percentage: 20, grade: 4 }, { percentage: 25, grade: null }, { percentage: null, grade: null }]);
    expect(result.plannedWeight).toBe(45); expect(result.evaluatedWeight).toBe(20); expect(result.remainingWeight).toBe(80);
  });
  it('calcula promedio evaluado y acumulado ponderado', () => {
    const result = calculateGradeSummary([{ percentage: 20, grade: 4 }, { percentage: 30, grade: 3 }]);
    expect(result.evaluatedAverage).toBe(3.4); expect(result.weightedAccumulated).toBe(1.7);
  });
  it('maneja cero por ciento evaluado', () => {
    const result = calculateGradeSummary([]);
    expect(result.evaluatedAverage).toBeNull(); expect(result.passing).toEqual({ status: 'required', value: 3 });
  });
  it('detecta un objetivo asegurado', () => {
    const result = calculateGradeSummary([{ percentage: 80, grade: 4 }]);
    expect(result.passing.status).toBe('secured');
  });
  it('detecta un objetivo imposible', () => {
    const result = calculateGradeSummary([{ percentage: 80, grade: 2 }]);
    expect(result.target.status).toBe('impossible');
  });
  it('maneja el 100 por ciento evaluado', () => {
    const result = calculateGradeSummary([{ percentage: 100, grade: 3.5 }]);
    expect(result.remainingWeight).toBe(0); expect(result.passing.status).toBe('secured'); expect(result.target.status).toBe('impossible');
  });
  it('ignora estudio aunque reciba datos inválidos externos', () => {
    expect(calculateGradeSummary([{ type: 'STUDY', percentage: 50, grade: 5 }]).plannedWeight).toBe(0);
  });
  it('conserva pero no contabiliza actividades canceladas', () => {
    expect(calculateGradeSummary([{ status: 'CANCELLED', percentage: 30, grade: 5 }]).plannedWeight).toBe(0);
  });
  it('simula sin modificar las entradas originales', () => {
    const entries = [{ percentage: 20, grade: 4 }];
    const result = simulateGrade(entries, 5, 20);
    expect(entries).toHaveLength(1); expect(result.evaluatedWeight).toBe(40); expect(result.weightedAccumulated).toBe(1.8);
  });
});
