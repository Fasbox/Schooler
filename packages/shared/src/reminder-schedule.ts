import { bogotaDeadline, type PriorityInput } from './activity-priority.js';

export interface ReminderMoment { daysBefore: 7 | 3 | 1; scheduledFor: string; deduplicationKey: string; }

export function buildReminderSchedule(activityId: string, activity: Pick<PriorityInput, 'due_date' | 'due_time'>, now = new Date()): ReminderMoment[] {
  const deadline = bogotaDeadline(activity); const epoch = Math.floor(deadline.getTime() / 1000);
  return ([7, 3, 1] as const).map((daysBefore) => ({ daysBefore, scheduledFor: new Date(deadline.getTime() - daysBefore * 86_400_000).toISOString(), deduplicationKey: `activity:${activityId}:reminder:${daysBefore}:${epoch}` })).filter((item) => new Date(item.scheduledFor) > now);
}
