-- PENDIENTE — NO APLICAR SIN EL «SÍ» DEL PROPIETARIO.
-- A Posto — seguridad (auditoría del 17-11-2026). Se puede ejecutar más de una vez.
-- No borra datos. Añade dos tablas y cambia una función.
--
-- 1. Límite de peticiones compartido entre todos los servidores de Vercel (hoy cada servidor cuenta por su cuenta).
-- 2. Clics de anuncios sin inflar: una cuenta cuenta como mucho 1 clic por anuncio y día; los clics sin
--    cuenta se cuentan aparte («anon_clicks», no verificados) para que el informe al anunciante sea honesto.

begin;

-- 1. Límite de peticiones (ventana fija). Solo lo usa el servidor con la clave de servidor.
create table if not exists public.rate_limits (
  key text not null check (char_length(key) <= 200),
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security; -- sin políticas: nadie la lee desde la app
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.rate_hit(p_key text, p_limit integer, p_window_seconds integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n integer;
begin
  insert into public.rate_limits (key, window_start, hits) values (left(p_key, 200), w, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into n;
  -- Limpieza ocasional de ventanas viejas (1 de cada 100 llamadas).
  if random() < 0.01 then delete from public.rate_limits where window_start < now() - interval '1 day'; end if;
  return n <= p_limit;
end;
$$;
revoke execute on function public.rate_hit(text, integer, integer) from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.rate_hit(text, integer, integer) to service_role;
  end if;
end $$;

-- 2. Clics de anuncios.
alter table public.sponsors add column if not exists anon_clicks bigint not null default 0;

create table if not exists public.sponsor_clicks (
  sponsor_id bigint not null references public.sponsors (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  primary key (sponsor_id, user_id, day)
);
alter table public.sponsor_clicks enable row level security; -- sin políticas: solo la función escribe
revoke all on public.sponsor_clicks from anon, authenticated;

create or replace function public.sponsor_click(p_id bigint) returns text
language plpgsql security definer set search_path = '' as $$
declare target text; uid uuid := auth.uid(); n integer;
begin
  select url into target from public.sponsors where id = p_id and active;
  if target is null then return null; end if;
  if uid is null then
    update public.sponsors set anon_clicks = anon_clicks + 1 where id = p_id;
  else
    insert into public.sponsor_clicks (sponsor_id, user_id) values (p_id, uid) on conflict do nothing;
    get diagnostics n = row_count;
    if n > 0 then update public.sponsors set clicks = clicks + 1 where id = p_id; end if;
  end if;
  return target;
end;
$$;
revoke execute on function public.sponsor_click(bigint) from public;
grant execute on function public.sponsor_click(bigint) to anon, authenticated;

commit;
