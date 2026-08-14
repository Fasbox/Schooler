import type { NextFunction, Request, Response } from 'express';
import { supabaseAuth } from '../lib/supabase.js';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Debes iniciar sesión.' });
    return;
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'INVALID_TOKEN', message: 'La sesión no es válida.' });
    return;
  }

  req.auth = { userId: data.user.id, token, ...(data.user.email ? { email: data.user.email } : {}) };
  next();
}
