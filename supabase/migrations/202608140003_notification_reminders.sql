-- Programa recordatorios internos idempotentes al crear o cambiar una actividad.
create or replace function public.schedule_activity_reminders()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  deadline timestamptz;
  offset_days integer;
  notify_at timestamptz;
  subject_name text;
  type_name text;
  urgency text;
  body text;
begin
  delete from public.notifications
   where activity_id = new.id
     and type = 'REMINDER'
     and delivered_at is null;

  if new.deleted_at is not null or new.status in ('COMPLETED', 'CANCELLED') then
    return new;
  end if;

  deadline := (new.due_date + coalesce(new.due_time, time '23:59')) at time zone 'America/Bogota';
  select name into subject_name from public.subjects where id = new.subject_id;
  type_name := case new.type when 'EXAM' then 'parcial' when 'QUIZ' then 'quiz' when 'PROJECT' then 'proyecto' when 'STUDY' then 'sesión de estudio' else 'tarea' end;

  foreach offset_days in array array[7, 3, 1] loop
    notify_at := deadline - make_interval(days => offset_days);
    if notify_at > now() then
      urgency := case offset_days when 1 then 'Urgente' when 3 then 'Importante' else 'Próximamente' end;
      body := case offset_days
        when 1 then 'Mañana tienes ' || type_name || ' de ' || subject_name || '.'
        else 'Tienes ' || type_name || ' de ' || subject_name || ' dentro de ' || offset_days || ' días.'
      end;
      if coalesce(new.percentage, 0) >= 15 then body := body || ' Vale el ' || trim(to_char(new.percentage, 'FM999990.##')) || '%.'; end if;
      insert into public.notifications (user_id, activity_id, subject_id, title, message, type, scheduled_for, deduplication_key)
      values (new.user_id, new.id, new.subject_id, urgency, body, 'REMINDER', notify_at,
        'activity:' || new.id || ':reminder:' || offset_days || ':' || extract(epoch from deadline)::bigint)
      on conflict (user_id, deduplication_key) do nothing;
    end if;
  end loop;
  return new;
end;
$$;

create trigger activities_schedule_reminders
  after insert or update of due_date, due_time, status, percentage, type, deleted_at on public.activities
  for each row execute function public.schedule_activity_reminders();

-- Programa recordatorios para actividades existentes sin modificar sus datos.
update public.activities set due_date = due_date
where deleted_at is null and status not in ('COMPLETED', 'CANCELLED');
