import { Router } from 'express';
import { HttpError } from '../../lib/http-error.js';
import { createUserClient } from '../../lib/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createActivity, listActivities, trashActivity, updateActivity } from './activities.repository.js';
import { activityIdSchema, activityInputSchema, activityQuerySchema, updateActivitySchema } from './activities.schema.js';
import { enrichAndSortActivities, normalizeActivity } from './activities.service.js';

export const activitiesRouter = Router();
activitiesRouter.use(authenticate);
activitiesRouter.get('/', async (req, res) => {
  const query = activityQuerySchema.parse(req.query);
  const activities = await listActivities(createUserClient(req.auth.token), query);
  res.json({ activities: enrichAndSortActivities(activities, query.status, query.sort) });
});
activitiesRouter.post('/', async (req, res) => {
  const input = normalizeActivity(activityInputSchema.parse(req.body));
  res.status(201).json({ activity: await createActivity(createUserClient(req.auth.token), req.auth.userId, input) });
});
activitiesRouter.patch('/:id', async (req, res) => {
  const input = normalizeActivity(updateActivitySchema.parse(req.body));
  const activity = await updateActivity(createUserClient(req.auth.token), activityIdSchema.parse(req.params.id), input);
  if (!activity) throw new HttpError(404, 'NOT_FOUND', 'Actividad no encontrada.');
  res.json({ activity });
});
activitiesRouter.delete('/:id', async (req, res) => {
  if (!(await trashActivity(createUserClient(req.auth.token), activityIdSchema.parse(req.params.id)))) throw new HttpError(404, 'NOT_FOUND', 'Actividad no encontrada.');
  res.status(204).send();
});
