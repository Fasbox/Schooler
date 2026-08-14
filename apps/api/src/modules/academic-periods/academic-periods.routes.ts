import { Router } from 'express';
import { createUserClient } from '../../lib/supabase.js';
import { HttpError } from '../../lib/http-error.js';
import { authenticate } from '../../middleware/authenticate.js';
import { archivePeriod, createPeriod, listPeriods, setCurrentPeriod } from './academic-periods.repository.js';
import { createPeriodSchema, periodIdSchema } from './academic-periods.schema.js';

export const academicPeriodsRouter = Router();
academicPeriodsRouter.use(authenticate);
academicPeriodsRouter.get('/', async (req, res) => res.json({ periods: await listPeriods(createUserClient(req.auth.token)) }));
academicPeriodsRouter.post('/', async (req, res) => {
  const input = createPeriodSchema.parse(req.body);
  const db = createUserClient(req.auth.token);
  const period = await createPeriod(db, req.auth.userId, { ...input, status: 'future' });
  if (input.status === 'current') await setCurrentPeriod(db, period.id);
  res.status(201).json({ period });
});
academicPeriodsRouter.patch('/:id/current', async (req, res) => {
  const id = periodIdSchema.parse(req.params.id);
  await setCurrentPeriod(createUserClient(req.auth.token), id);
  res.status(204).send();
});
academicPeriodsRouter.patch('/:id/archive', async (req, res) => {
  const id = periodIdSchema.parse(req.params.id);
  if (!(await archivePeriod(createUserClient(req.auth.token), id))) throw new HttpError(404, 'NOT_FOUND', 'Periodo no encontrado.');
  res.status(204).send();
});
