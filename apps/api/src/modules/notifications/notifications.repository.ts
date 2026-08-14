import type { SupabaseClient } from '@supabase/supabase-js';
import { assertDatabaseResult } from '../../lib/http-error.js';

export async function listNotifications(db: SupabaseClient) {
  const { data, error } = await db.from('notifications').select('id,title,message,type,created_at,delivered_at,read_at,activity_id,subject_id,subject:subjects(name,color)').not('delivered_at', 'is', null).order('delivered_at', { ascending: false }).limit(100);
  assertDatabaseResult(error); return data ?? [];
}
export async function markNotificationRead(db: SupabaseClient, id: string) {
  const { data, error } = await db.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).select('id').maybeSingle();
  assertDatabaseResult(error); return Boolean(data);
}
export async function markAllRead(db: SupabaseClient) {
  const { error } = await db.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null).not('delivered_at', 'is', null);
  assertDatabaseResult(error);
}
export async function savePushSubscription(db: SupabaseClient, userId: string, input: { endpoint: string; keys: { p256dh: string; auth: string }; user_agent?: string }) {
  const { error } = await db.from('push_subscriptions').upsert({ user_id: userId, endpoint: input.endpoint, p256dh: input.keys.p256dh, auth_key: input.keys.auth, user_agent: input.user_agent }, { onConflict: 'user_id,endpoint' });
  assertDatabaseResult(error);
}
export async function deletePushSubscription(db: SupabaseClient, endpoint: string) {
  const { error } = await db.from('push_subscriptions').delete().eq('endpoint', endpoint);
  assertDatabaseResult(error);
}
