-- Cambio atómico del periodo actual. Ejecutar después de 202608140001_initial_schema.sql.
create or replace function public.set_current_academic_period(target_period_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then
    raise exception using errcode = '42501', message = 'Se requiere autenticación.';
  end if;
  if not exists (
    select 1 from public.academic_periods
    where id = target_period_id and user_id = owner_id
  ) then
    raise exception using errcode = 'P0002', message = 'Periodo no encontrado.';
  end if;

  update public.academic_periods
     set status = 'archived'
   where user_id = owner_id and status = 'current' and id <> target_period_id;
  update public.academic_periods
     set status = 'current'
   where id = target_period_id and user_id = owner_id;
end;
$$;

grant execute on function public.set_current_academic_period(uuid) to authenticated;
