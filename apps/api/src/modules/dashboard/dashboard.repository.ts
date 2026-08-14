import type { Activity, Subject, WeeklyClass } from '@schooler/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import { assertDatabaseResult } from '../../lib/http-error.js';

export async function loadDashboardData(db: SupabaseClient) {
  const { data: period, error: periodError } = await db.from('academic_periods').select('id,year,semester').eq('status', 'current').maybeSingle();
  assertDatabaseResult(periodError);
  if (!period) return { period: null, subjects: [], classes: [], activities: [] };
  const { data: subjectsData, error: subjectsError } = await db.from('subjects').select('id,academic_period_id,name,professor,professor_email,color,status,created_at,updated_at,subject_schedules(id,subject_id,weekday,start_time,end_time,modality,classroom)').eq('academic_period_id', period.id).eq('status', 'active').order('name');
  assertDatabaseResult(subjectsError);
  const subjects = (subjectsData ?? []) as unknown as Subject[];
  const classes: WeeklyClass[] = subjects.flatMap((subject) => (subject.subject_schedules ?? []).map((schedule) => ({ ...schedule, subject: { id: subject.id, name: subject.name, color: subject.color } })));
  if (subjects.length === 0) return { period, subjects, classes, activities: [] };
  const { data: activities, error: activitiesError } = await db.from('activities').select('id,subject_id,title,description,personal_notes,due_date,due_time,type,status,importance,percentage,grade,created_at,updated_at,subject:subjects!activities_subject_fk(id,name,color)').in('subject_id', subjects.map((subject) => subject.id)).is('deleted_at', null);
  assertDatabaseResult(activitiesError);
  return { period, subjects, classes, activities: activities as unknown as Activity[] };
}
