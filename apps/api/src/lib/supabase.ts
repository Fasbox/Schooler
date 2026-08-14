import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export function createUserClient(token: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAdminClient() {
  if (!env.SUPABASE_SECRET_KEY) throw new Error('SUPABASE_SECRET_KEY no está configurada.');
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
