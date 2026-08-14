import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';

export const authRouter = Router();

authRouter.get('/me', authenticate, (req, res) => {
  res.json({ user: req.auth });
});
