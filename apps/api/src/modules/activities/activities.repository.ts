import type { Activity } from '@schooler/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import { assertDatabaseResult } from '../../lib/http-error.js';

const fields = 'id,subject_id,title,description,personal_notes,due_date,due_time,type,status,importance,percentage,grade,created_at,updated_at,subject:subjects!activities_subject_fk(id,name,color)';
export async function listActivities(db: SupabaseClient, query: { subjectId?: string; type?: string; importance?: string; dateFrom?: string; dateTo?: string }) {
  let request = db.from('activities').select(fields).is('deleted_at', null);
  if (query.subjectId) request = request.eq('subject_id', query.subjectId);
  if (query.type) request = request.eq('type', query.type);
  if (query.importance) request = request.eq('importance', query.importance);
  if (query.dateFrom) request = request.gte('due_date', query.dateFrom);
  if (query.dateTo) request = request.lte('due_date', query.dateTo);
  const { data, error } = await request;
  assertDatabaseResult(error);
  return data as unknown as Activity[];
}
export async function createActivity(db: SupabaseClient, userId: string, input: Record<string, unknown>) {
  const { data, error } = await db.from('activities').insert({ ...input, user_id: userId }).select(fields).single();
  assertDatabaseResult(error); return data as unknown as Activity;
}
export async function updateActivity(db: SupabaseClient, id: string, input: Record<string, unknown>) {
  const { data, error } = await db.from('activities').update(input).eq('id', id).is('deleted_at', null).select(fields).maybeSingle();
  assertDatabaseResult(error); return data as unknown as Activity | null;
}
export async function trashActivity(db: SupabaseClient, id: string) {
  const { data, error } = await db.from('activities').update({ deleted_at: new Date().toISOString() }).eq('id', id).is('deleted_at', null).select('id').maybeSingle();
  assertDatabaseResult(error); return Boolean(data);
}
