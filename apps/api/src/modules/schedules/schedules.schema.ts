import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida.');
const scheduleFields = {
  weekday: z.number().int().min(1).max(7),
  start_time: time,
  end_time: time,
  modality: z.enum(['virtual', 'presencial']),
  classroom: z.string().trim().max(120).optional().transform((value) => value || null),
};
export const createScheduleSchema = z.object({ subject_id: z.uuid(), ...scheduleFields }).refine((value) => value.end_time > value.start_time, { message: 'La hora final debe ser posterior a la inicial.', path: ['end_time'] });
export const updateScheduleSchema = z.object(scheduleFields).refine((value) => value.end_time > value.start_time, { message: 'La hora final debe ser posterior a la inicial.', path: ['end_time'] });
export const scheduleIdSchema = z.uuid();
