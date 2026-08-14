import type { SubjectSchedule } from '@schooler/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import { assertDatabaseResult } from '../../lib/http-error.js';

const fields = 'id,subject_id,weekday,start_time,end_time,modality,classroom';
export async function createSchedule(db: SupabaseClient, userId: string, input: Record<string, unknown>) {
  const { data, error } = await db.from('subject_schedules').insert({ ...input, user_id: userId }).select(fields).single();
  assertDatabaseResult(error);
  return data as SubjectSchedule;
}
export async function updateSchedule(db: SupabaseClient, id: string, input: Record<string, unknown>) {
  const { data, error } = await db.from('subject_schedules').update(input).eq('id', id).select(fields).maybeSingle();
  assertDatabaseResult(error);
  return data as SubjectSchedule | null;
}
export async function deleteSchedule(db: SupabaseClient, id: string) {
  const { data, error } = await db.from('subject_schedules').delete().eq('id', id).select('id').maybeSingle();
  assertDatabaseResult(error);
  return Boolean(data);
}
