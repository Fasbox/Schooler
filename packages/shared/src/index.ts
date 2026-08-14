export const TIMEZONE = 'America/Bogota';
export const PASSING_GRADE = 3;
export const TARGET_GRADE = 4;
export const MAX_GRADE = 5;
export const EXAM_WEIGHT = 20;
export const HIGH_IMPACT_THRESHOLD = 15;

export const activityTypes = ['TASK', 'EXAM', 'QUIZ', 'PROJECT', 'STUDY'] as const;
export const activityStatuses = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED',
] as const;
export const importanceLevels = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type ActivityType = (typeof activityTypes)[number];
export type ActivityStatus = (typeof activityStatuses)[number];
export type Importance = (typeof importanceLevels)[number];

export interface HealthResponse {
  status: 'ok';
  service: 'schooler-api';
  timestamp: string;
}

export const periodStatuses = ['current', 'archived', 'future'] as const;
export const subjectStatuses = ['active', 'archived', 'trashed'] as const;
export const modalities = ['virtual', 'presencial'] as const;
export const subjectColors = ['#818CF8', '#22D3EE', '#F472B6', '#FBBF24', '#34D399', '#FB7185', '#A78BFA', '#60A5FA'] as const;

export type PeriodStatus = (typeof periodStatuses)[number];
export type SubjectStatus = (typeof subjectStatuses)[number];
export type Modality = (typeof modalities)[number];

export interface AcademicPeriod {
  id: string;
  year: number;
  semester: 1 | 2;
  status: PeriodStatus;
  created_at: string;
  updated_at: string;
}

export interface SubjectSchedule {
  id: string;
  subject_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  modality: Modality;
  classroom: string | null;
}

export interface Subject {
  id: string;
  academic_period_id: string;
  name: string;
  professor: string | null;
  professor_email: string | null;
  color: string;
  status: SubjectStatus;
  created_at: string;
  updated_at: string;
  subject_schedules?: SubjectSchedule[];
}

export interface Activity {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  personal_notes: string | null;
  due_date: string;
  due_time: string | null;
  type: ActivityType;
  status: ActivityStatus;
  importance: Importance;
  percentage: number | null;
  grade: number | null;
  created_at: string;
  updated_at: string;
  subject?: Pick<Subject, 'id' | 'name' | 'color'>;
  effective_status?: ActivityStatus;
  priority_score?: number;
}

export { bogotaDeadline, calculatePriority, effectiveActivityStatus, isActivityOverdue } from './activity-priority.js';
export type { PriorityInput } from './activity-priority.js';
export { findCurrentClass, findNextClass, getBogotaContext, greetingForBogota } from './dashboard-time.js';
export type { BogotaContext, WeeklyClass } from './dashboard-time.js';
export { calculateGradeSummary, requiredGrade, simulateGrade } from './grade-calculations.js';
export type { GradeEntry, GradeSummary, RequiredGrade } from './grade-calculations.js';
export { buildReminderSchedule } from './reminder-schedule.js';
export type { ReminderMoment } from './reminder-schedule.js';
