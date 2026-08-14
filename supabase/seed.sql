-- Ejecuta este archivo DESPUÉS de crear tu usuario manualmente.
-- Reemplaza TU_CORREO por el email exacto del usuario de Authentication.
do $$
declare
  owner_id uuid;
  period_id uuid;
  nosql_id uuid;
  algebra_id uuid;
  calculo_id uuid;
  fisica_id uuid;
  movil_id uuid;
begin
  select id into owner_id from auth.users where email = 'TU_CORREO';
  if owner_id is null then
    raise exception 'No existe un usuario con el correo indicado.';
  end if;

  insert into public.academic_periods (user_id, year, semester, status)
  values (owner_id, 2026, 2, 'current')
  on conflict (user_id, year, semester) do update set status = excluded.status
  returning id into period_id;

  insert into public.subjects (user_id, academic_period_id, name, color) values
    (owner_id, period_id, 'NoSQL', '#818CF8') returning id into nosql_id;
  insert into public.subjects (user_id, academic_period_id, name, color) values
    (owner_id, period_id, 'Álgebra Lineal', '#22D3EE') returning id into algebra_id;
  insert into public.subjects (user_id, academic_period_id, name, color) values
    (owner_id, period_id, 'Cálculo II', '#F472B6') returning id into calculo_id;
  insert into public.subjects (user_id, academic_period_id, name, color) values
    (owner_id, period_id, 'Física II', '#FBBF24') returning id into fisica_id;
  insert into public.subjects (user_id, academic_period_id, name, color) values
    (owner_id, period_id, 'Móvil', '#34D399') returning id into movil_id;

  insert into public.subject_schedules (user_id, subject_id, weekday, start_time, end_time, modality) values
    (owner_id, nosql_id, 1, '18:00', '21:00', 'virtual'),
    (owner_id, algebra_id, 2, '12:00', '14:00', 'virtual'),
    (owner_id, algebra_id, 4, '12:00', '14:00', 'presencial'),
    (owner_id, calculo_id, 2, '14:00', '16:00', 'virtual'),
    (owner_id, calculo_id, 4, '14:00', '16:00', 'presencial'),
    (owner_id, fisica_id, 3, '06:00', '08:00', 'presencial'),
    (owner_id, fisica_id, 5, '06:00', '08:00', 'presencial'),
    (owner_id, movil_id, 4, '06:00', '07:00', 'virtual'),
    (owner_id, movil_id, 6, '06:00', '08:00', 'presencial');
end $$;
