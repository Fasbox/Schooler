import { z } from 'zod';

export const periodIdSchema = z.uuid();
export const createPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2200),
  semester: z.union([z.literal(1), z.literal(2)]),
  status: z.enum(['current', 'future']).default('future'),
});
