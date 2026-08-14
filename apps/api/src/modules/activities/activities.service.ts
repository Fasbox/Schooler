import { calculatePriority, effectiveActivityStatus, EXAM_WEIGHT, type Activity } from '@schooler/shared';
import { HttpError } from '../../lib/http-error.js';

export function normalizeActivity(input: Record<string, unknown>) {
  const normalized = { ...input };
  if (normalized.type === 'EXAM' && normalized.percentage == null) normalized.percentage = EXAM_WEIGHT;
  if (normalized.type === 'STUDY') { normalized.percentage = null; normalized.grade = null; }
  if (normalized.grade != null && Object.hasOwn(normalized, 'percentage') && normalized.percentage == null) throw new HttpError(400, 'GRADE_REQUIRES_PERCENTAGE', 'Para registrar una nota, la actividad debe tener porcentaje.');
  return normalized;
}

export function enrichAndSortActivities(activities: Activity[], status: string | undefined, sort: 'priority' | 'due' | 'importance' | 'subject') {
  const now = new Date();
  const enriched = activities.map((activity) => ({ ...activity, effective_status: effectiveActivityStatus(activity, now), priority_score: calculatePriority(activity, now) }));
  const filtered = status ? enriched.filter((activity) => activity.effective_status === status) : enriched;
  const importance = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
  return filtered.sort((a, b) => {
    if (sort === 'priority') return (b.priority_score ?? 0) - (a.priority_score ?? 0);
    if (sort === 'importance') return importance[b.importance] - importance[a.importance];
    if (sort === 'subject') return (a.subject?.name ?? '').localeCompare(b.subject?.name ?? '');
    return `${a.due_date}${a.due_time ?? '23:59'}`.localeCompare(`${b.due_date}${b.due_time ?? '23:59'}`);
  });
}
