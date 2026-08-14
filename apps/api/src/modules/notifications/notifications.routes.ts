import { Router } from 'express';
import { HttpError } from '../../lib/http-error.js';
import { createUserClient } from '../../lib/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { deletePushSubscription, listNotifications, markAllRead, markNotificationRead, savePushSubscription } from './notifications.repository.js';
import { notificationIdSchema, pushSubscriptionSchema } from './notifications.schema.js';
import { processNotifications } from './notification-processor.service.js';

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);
notificationsRouter.get('/', async (req, res) => {
  const notifications = await listNotifications(createUserClient(req.auth.token));
  res.json({ notifications, unread: notifications.filter((item) => item.read_at == null).length });
});
notificationsRouter.post('/process', async (req, res) => res.json(await processNotifications(new Date(), req.auth.userId)));
notificationsRouter.patch('/read-all', async (req, res) => { await markAllRead(createUserClient(req.auth.token)); res.status(204).send(); });
notificationsRouter.patch('/:id/read', async (req, res) => {
  if (!(await markNotificationRead(createUserClient(req.auth.token), notificationIdSchema.parse(req.params.id)))) throw new HttpError(404, 'NOT_FOUND', 'Notificación no encontrada.');
  res.status(204).send();
});
notificationsRouter.post('/push-subscriptions', async (req, res) => { await savePushSubscription(createUserClient(req.auth.token), req.auth.userId, pushSubscriptionSchema.parse(req.body)); res.status(204).send(); });
notificationsRouter.delete('/push-subscriptions', async (req, res) => { const input = pushSubscriptionSchema.pick({ endpoint: true }).parse(req.body); await deletePushSubscription(createUserClient(req.auth.token), input.endpoint); res.status(204).send(); });
