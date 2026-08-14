import { Router } from 'express';
import { env } from '../../config/env.js';
import { HttpError } from '../../lib/http-error.js';
import { processNotifications } from './notification-processor.service.js';

export const notificationProcessorRouter = Router();
notificationProcessorRouter.post('/', async (req, res) => {
  if (!env.CRON_SECRET) throw new HttpError(503, 'CRON_NOT_CONFIGURED', 'CRON_SECRET no está configurado.');
  if (req.header('x-cron-secret') !== env.CRON_SECRET) throw new HttpError(401, 'INVALID_CRON_SECRET', 'Credencial de procesamiento inválida.');
  res.json(await processNotifications());
});
