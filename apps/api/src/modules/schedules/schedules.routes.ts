import { Router } from 'express';
import { HttpError } from '../../lib/http-error.js';
import { createUserClient } from '../../lib/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createSchedule, deleteSchedule, updateSchedule } from './schedules.repository.js';
import { createScheduleSchema, scheduleIdSchema, updateScheduleSchema } from './schedules.schema.js';

export const schedulesRouter = Router();
schedulesRouter.use(authenticate);
schedulesRouter.post('/', async (req, res) => res.status(201).json({ schedule: await createSchedule(createUserClient(req.auth.token), req.auth.userId, createScheduleSchema.parse(req.body)) }));
schedulesRouter.put('/:id', async (req, res) => {
  const schedule = await updateSchedule(createUserClient(req.auth.token), scheduleIdSchema.parse(req.params.id), updateScheduleSchema.parse(req.body));
  if (!schedule) throw new HttpError(404, 'NOT_FOUND', 'Horario no encontrado.');
  res.json({ schedule });
});
schedulesRouter.delete('/:id', async (req, res) => {
  if (!(await deleteSchedule(createUserClient(req.auth.token), scheduleIdSchema.parse(req.params.id)))) throw new HttpError(404, 'NOT_FOUND', 'Horario no encontrado.');
  res.status(204).send();
});
