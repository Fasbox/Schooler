import { MAX_GRADE, PASSING_GRADE, TARGET_GRADE } from './index.js';

export interface GradeEntry { percentage: number | null; grade: number | null; type?: string; status?: string; }
export interface RequiredGrade { status: 'required' | 'secured' | 'impossible'; value: number | null; }
export interface GradeSummary {
  plannedWeight: number;
  evaluatedWeight: number;
  remainingWeight: number;
  weightedAccumulated: number;
  evaluatedAverage: number | null;
  passing: RequiredGrade;
  target: RequiredGrade;
}

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function requiredGrade(weightedAccumulated: number, remainingWeight: number, objective: number): RequiredGrade {
  if (weightedAccumulated >= objective) return { status: 'secured', value: null };
  if (remainingWeight <= 0) return { status: 'impossible', value: null };
  const value = ((objective - weightedAccumulated) * 100) / remainingWeight;
  if (value <= 0) return { status: 'secured', value: null };
  if (value > MAX_GRADE) return { status: 'impossible', value: null };
  return { status: 'required', value: round(value) };
}

export function calculateGradeSummary(entries: GradeEntry[]): GradeSummary {
  const evaluable = entries.filter((entry) => entry.type !== 'STUDY' && entry.status !== 'CANCELLED' && entry.percentage != null);
  const evaluated = evaluable.filter((entry) => entry.grade != null);
  const plannedWeight = evaluable.reduce((sum, entry) => sum + (entry.percentage ?? 0), 0);
  const evaluatedWeight = evaluated.reduce((sum, entry) => sum + (entry.percentage ?? 0), 0);
  const weightedPoints = evaluated.reduce((sum, entry) => sum + (entry.grade ?? 0) * (entry.percentage ?? 0), 0);
  const weightedAccumulated = weightedPoints / 100;
  const remainingWeight = Math.max(0, 100 - evaluatedWeight);
  return {
    plannedWeight: round(plannedWeight), evaluatedWeight: round(evaluatedWeight), remainingWeight: round(remainingWeight),
    weightedAccumulated: round(weightedAccumulated),
    evaluatedAverage: evaluatedWeight > 0 ? round(weightedPoints / evaluatedWeight) : null,
    passing: requiredGrade(weightedAccumulated, remainingWeight, PASSING_GRADE),
    target: requiredGrade(weightedAccumulated, remainingWeight, TARGET_GRADE),
  };
}

export function simulateGrade(entries: GradeEntry[], hypotheticalGrade: number, hypotheticalPercentage: number) {
  return calculateGradeSummary([...entries, { grade: hypotheticalGrade, percentage: hypotheticalPercentage }]);
}
