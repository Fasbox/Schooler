import type { ActivityStatus, ActivityType, Importance } from './index.js';

export interface PriorityInput {
  due_date: string;
  due_time?: string | null;
  status: ActivityStatus;
  importance: Importance;
  percentage?: number | null;
  type: ActivityType;
}

const importanceScore: Record<Importance, number> = { LOW: 5, MEDIUM: 15, HIGH: 30 };
const typeScore: Record<ActivityType, number> = { STUDY: 0, TASK: 2, QUIZ: 5, PROJECT: 8, EXAM: 10 };

export function bogotaDeadline(activity: Pick<PriorityInput, 'due_date' | 'due_time'>) {
  const time = activity.due_time ? activity.due_time.slice(0, 5) : '23:59';
  return new Date(`${activity.due_date}T${time}:00-05:00`);
}

export function isActivityOverdue(activity: Pick<PriorityInput, 'due_date' | 'due_time' | 'status'>, now = new Date()) {
  if (activity.status === 'COMPLETED' || activity.status === 'CANCELLED') return false;
  return bogotaDeadline(activity).getTime() < now.getTime();
}

export function effectiveActivityStatus(activity: PriorityInput, now = new Date()): ActivityStatus {
  return isActivityOverdue(activity, now) ? 'OVERDUE' : activity.status;
}

export function calculatePriority(activity: PriorityInput, now = new Date()) {
  if (activity.status === 'COMPLETED' || activity.status === 'CANCELLED') return -1000;
  const hours = (bogotaDeadline(activity).getTime() - now.getTime()) / 3_600_000;
  let proximity = 0;
  if (hours < 0) proximity = 100;
  else if (hours <= 24) proximity = 70;
  else if (hours <= 72) proximity = 50;
  else if (hours <= 168) proximity = 30;
  else if (hours <= 336) proximity = 15;
  const weight = activity.percentage ? Math.min(activity.percentage, 40) : 0;
  const highImpactBoost = (activity.percentage ?? 0) >= 15 ? 10 : 0;
  return proximity + importanceScore[activity.importance]! + weight + highImpactBoost + typeScore[activity.type]!;
}
