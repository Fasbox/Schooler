import type { AcademicPeriod } from '@schooler/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import { assertDatabaseResult } from '../../lib/http-error.js';

export async function listPeriods(db: SupabaseClient) {
  const { data, error } = await db.from('academic_periods').select('id,year,semester,status,created_at,updated_at').order('year', { ascending: false }).order('semester', { ascending: false });
  assertDatabaseResult(error);
  return data as AcademicPeriod[];
}

export async function createPeriod(db: SupabaseClient, userId: string, input: { year: number; semester: 1 | 2; status: 'current' | 'future' }) {
  const { data, error } = await db.from('academic_periods').insert({ ...input, user_id: userId }).select('id,year,semester,status,created_at,updated_at').single();
  assertDatabaseResult(error);
  return data as AcademicPeriod;
}

export async function setCurrentPeriod(db: SupabaseClient, periodId: string) {
  const { error } = await db.rpc('set_current_academic_period', { target_period_id: periodId });
  assertDatabaseResult(error);
}

export async function archivePeriod(db: SupabaseClient, periodId: string) {
  const { data, error } = await db.from('academic_periods').update({ status: 'archived' }).eq('id', periodId).select('id').maybeSingle();
  assertDatabaseResult(error);
  return Boolean(data);
}
