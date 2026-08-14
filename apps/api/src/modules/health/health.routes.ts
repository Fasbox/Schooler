import { Router } from 'express';
import type { HealthResponse } from '@schooler/shared';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const response: HealthResponse = {
    status: 'ok',
    service: 'schooler-api',
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});
