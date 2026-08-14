-- Schooler: esquema inicial (Fase 2)
-- Ejecutar completo en Supabase SQL Editor o con `supabase db push`.

create extension if not exists pgcrypto;

create type public.academic_period_status as enum ('current', 'archived', 'future');
create type public.subject_status as enum ('active', 'archived', 'trashed');
create type public.class_modality as enum ('virtual', 'presencial');
create type public.activity_type as enum ('TASK', 'EXAM', 'QUIZ', 'PROJECT', 'STUDY');
create type public.activity_status as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');
create type public.importance_level as enum ('LOW', 'MEDIUM', 'HIGH');
create type public.notification_type as enum ('REMINDER', 'DAILY_SUMMARY', 'OVERDUE', 'SYSTEM');

create table public.academic_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  year integer not null check (year between 2000 and 2200),
  semester smallint not null check (semester in (1, 2)),
  status public.academic_period_status not null default 'future',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, semester)
);

create unique index academic_periods_one_current_per_user
  on public.academic_periods (user_id) where status = 'current';

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  academic_period_id uuid not null references public.academic_periods(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 120),
  professor text check (professor is null or char_length(professor) <= 120),
  professor_email text check (professor_email is null or char_length(professor_email) <= 254),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  status public.subject_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index subjects_period_status_idx on public.subjects (user_id, academic_period_id, status);

create table public.subject_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subject_id uuid not null,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  modality public.class_modality not null,
  classroom text check (classroom is null or char_length(classroom) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subject_schedules_subject_fk foreign key (subject_id, user_id)
    references public.subjects(id, user_id) on delete cascade,
  constraint schedule_time_order check (end_time > start_time)
);

create index subject_schedules_subject_weekday_idx on public.subject_schedules (subject_id, weekday);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subject_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text,
  personal_notes text,
  due_date date not null,
  due_time time,
  type public.activity_type not null,
  status public.activity_status not null default 'PENDING',
  importance public.importance_level not null default 'MEDIUM',
  percentage numeric(5,2) check (percentage is null or percentage > 0 and percentage <= 100),
  grade numeric(3,2) check (grade is null or grade between 0 and 5),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_subject_fk foreign key (subject_id, user_id)
    references public.subjects(id, user_id) on delete restrict,
  constraint study_has_no_academic_values check (type <> 'STUDY' or (percentage is null and grade is null)),
  constraint grade_requires_percentage check (grade is null or percentage is not null)
);

create index activities_open_due_idx on public.activities (user_id, due_date, due_time)
  where deleted_at is null and status in ('PENDING', 'IN_PROGRESS', 'OVERDUE');
create index activities_subject_idx on public.activities (subject_id) where deleted_at is null;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  activity_id uuid references public.activities(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  message text not null check (char_length(trim(message)) > 0),
  type public.notification_type not null,
  scheduled_for timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  deduplication_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, deduplication_key)
);

create index notifications_inbox_idx on public.notifications (user_id, read_at, created_at desc);
create index notifications_pending_idx on public.notifications (scheduled_for)
  where delivered_at is null;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger academic_periods_updated_at before update on public.academic_periods
  for each row execute function public.set_updated_at();
create trigger subjects_updated_at before update on public.subjects
  for each row execute function public.set_updated_at();
create trigger subject_schedules_updated_at before update on public.subject_schedules
  for each row execute function public.set_updated_at();
create trigger activities_updated_at before update on public.activities
  for each row execute function public.set_updated_at();
create trigger push_subscriptions_updated_at before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

-- Bloqueo transaccional por materia para evitar carreras al validar el total.
create or replace function public.enforce_activity_percentage_limit()
returns trigger language plpgsql set search_path = '' as $$
declare
  total_percentage numeric;
begin
  if new.type = 'STUDY' or new.percentage is null or new.deleted_at is not null then
    return new;
  end if;

  perform 1 from public.subjects where id = new.subject_id for update;
  select coalesce(sum(percentage), 0)
    into total_percentage
    from public.activities
   where subject_id = new.subject_id
     and deleted_at is null
     and type <> 'STUDY'
     and id <> new.id;

  if total_percentage + new.percentage > 100 then
    raise exception using
      errcode = '23514',
      message = 'La suma de porcentajes evaluables no puede superar el 100%.';
  end if;
  return new;
end;
$$;

create trigger activities_percentage_limit
  before insert or update of subject_id, percentage, type, deleted_at on public.activities
  for each row execute function public.enforce_activity_percentage_limit();

-- Valida que una materia pertenezca al mismo usuario que su periodo.
create or replace function public.enforce_subject_period_owner()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from public.academic_periods
    where id = new.academic_period_id and user_id = new.user_id
  ) then
    raise exception using errcode = '23503', message = 'El periodo no pertenece al usuario.';
  end if;
  return new;
end;
$$;

create trigger subjects_period_owner before insert or update of academic_period_id, user_id on public.subjects
  for each row execute function public.enforce_subject_period_owner();

alter table public.academic_periods enable row level security;
alter table public.subjects enable row level security;
alter table public.subject_schedules enable row level security;
alter table public.activities enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;

create policy academic_periods_owner_all on public.academic_periods
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy subjects_owner_all on public.subjects
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy subject_schedules_owner_all on public.subject_schedules
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy activities_owner_all on public.activities
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy notifications_owner_select on public.notifications
  for select to authenticated using ((select auth.uid()) = user_id);
create policy notifications_owner_update on public.notifications
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy push_subscriptions_owner_all on public.push_subscriptions
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on public.academic_periods, public.subjects,
  public.subject_schedules, public.activities, public.push_subscriptions to authenticated;
grant select, update on public.notifications to authenticated;

comment on column public.subject_schedules.weekday is 'ISO weekday: lunes=1, domingo=7';
comment on column public.notifications.deduplication_key is 'Clave estable para procesamiento idempotente';
