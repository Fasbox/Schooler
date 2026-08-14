import { Router } from 'express';
import { createUserClient } from '../../lib/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { loadDashboardData } from './dashboard.repository.js';
import { buildDashboard } from './dashboard.service.js';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get('/', async (req, res) => {
  const data = await loadDashboardData(createUserClient(req.auth.token));
  res.json(buildDashboard(data));
});
