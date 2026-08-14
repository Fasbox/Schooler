import { supabase } from './supabase';

export class ApiError extends Error {}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new ApiError('Tu sesión terminó. Vuelve a iniciar sesión.');
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}`, ...options.headers },
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json() as { message?: string } & T;
  if (!response.ok) throw new ApiError(body.message ?? 'No fue posible completar la operación.');
  return body;
}
