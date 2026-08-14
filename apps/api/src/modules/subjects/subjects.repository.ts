import type { Subject } from '@schooler/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import { assertDatabaseResult } from '../../lib/http-error.js';
import { pickSubjectColor } from './subjects.service.js';

const fields = 'id,academic_period_id,name,professor,professor_email,color,status,created_at,updated_at,subject_schedules(id,subject_id,weekday,start_time,end_time,modality,classroom)';
export async function listSubjects(db: SupabaseClient, periodId?: string, includeArchived = false) {
  let query = db.from('subjects').select(fields).neq('status', 'trashed').order('name');
  if (periodId) query = query.eq('academic_period_id', periodId);
  if (!includeArchived) query = query.eq('status', 'active');
  const { data, error } = await query;
  assertDatabaseResult(error);
  return data as unknown as Subject[];
}
export async function createSubject(db: SupabaseClient, userId: string, input: { academic_period_id: string; name: string; professor?: string | null; professor_email?: string | null }) {
  const { data: colors, error: colorsError } = await db.from('subjects').select('color').eq('academic_period_id', input.academic_period_id);
  assertDatabaseResult(colorsError);
  const { data, error } = await db.from('subjects').insert({ ...input, user_id: userId, color: pickSubjectColor((colors ?? []).map((row) => row.color as string)) }).select(fields).single();
  assertDatabaseResult(error);
  return data as unknown as Subject;
}
export async function updateSubject(db: SupabaseClient, id: string, input: Record<string, unknown>) {
  const { data, error } = await db.from('subjects').update(input).eq('id', id).select(fields).maybeSingle();
  assertDatabaseResult(error);
  return data as unknown as Subject | null;
}
