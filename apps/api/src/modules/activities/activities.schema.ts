import { z } from 'zod';

const nullableText = z.union([z.string().trim(), z.null()]).optional().transform((value) => value || null);
const nullableNumber = z.union([z.number(), z.null()]).optional().transform((value) => value ?? null);
export const activityIdSchema = z.uuid();
export const activityInputSchema = z.object({
  subject_id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  description: nullableText,
  personal_notes: nullableText,
  due_date: z.iso.date(),
  due_time: z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), z.literal(''), z.null()]).optional().transform((value) => value || null),
  type: z.enum(['TASK', 'EXAM', 'QUIZ', 'PROJECT', 'STUDY']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  percentage: nullableNumber.pipe(z.number().positive().max(100).nullable()),
  grade: nullableNumber.pipe(z.number().min(0).max(5).nullable()),
});
export const updateActivitySchema = activityInputSchema.partial();
export const activityQuerySchema = z.object({
  subjectId: z.uuid().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).optional(),
  type: z.enum(['TASK', 'EXAM', 'QUIZ', 'PROJECT', 'STUDY']).optional(),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
  sort: z.enum(['priority', 'due', 'importance', 'subject']).default('priority'),
});
