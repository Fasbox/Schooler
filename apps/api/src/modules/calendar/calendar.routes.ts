import { Router } from 'express';
import { createUserClient } from '../../lib/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { loadDashboardData } from '../dashboard/dashboard.repository.js';

export const calendarRouter = Router();
calendarRouter.use(authenticate);
calendarRouter.get('/', async (req, res) => {
  const { period, classes, activities } = await loadDashboardData(createUserClient(req.auth.token));
  res.json({ period, classes, activities });
});
