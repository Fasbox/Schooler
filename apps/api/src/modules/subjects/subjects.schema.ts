import { z } from 'zod';

const optionalText = (max: number) => z.union([z.string().trim().max(max), z.literal('')]).optional().transform((value) => value || null);
export const subjectIdSchema = z.uuid();
export const createSubjectSchema = z.object({
  academic_period_id: z.uuid(),
  name: z.string().trim().min(1).max(120),
  professor: optionalText(120),
  professor_email: z.union([z.email(), z.literal('')]).optional().transform((value) => value || null),
});
export const updateSubjectSchema = createSubjectSchema.omit({ academic_period_id: true }).partial();
