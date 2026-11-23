-- A Posto — estadísticas de uso (solo con consentimiento) y panel de uso para administración.
-- Se puede ejecutar más de una vez sin romper nada.

-- Pantallas abiertas: solo la ruta (sin datos personales: los números de la ruta se sustituyen por «:id»).
create table if not exists public.screen_views (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  path text not null check (char_length(path) between 1 and 80),
  created_at timestamptz not null default now()
);
create index if not exists screen_views_time on public.screen_views (created_at desc);
create index if not exists screen_views_user on public.screen_views (user_id, created_at desc);
alter table public.screen_views enable row level security;
revoke all on public.screen_views from anon, authenticated;

-- La app registra una pantalla solo si la persona aceptó las estadísticas. Máximo 500 al día por persona.
create or replace function public.log_screen(p_path text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or p_path is null or char_length(p_path) > 80 then return; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and consent_analytics) then return; end if;
  if (select count(*) from public.screen_views where user_id = auth.uid() and created_at > now() - interval '1 day') >= 500 then return; end if;
  insert into public.screen_views (user_id, path) values (auth.uid(), p_path);
end;
$$;
revoke execute on function public.log_screen(text) from public, anon;
grant execute on function public.log_screen(text) to authenticated;

-- Si la persona retira el consentimiento, también se borran sus pantallas.
create or replace function public.analytics_consent_cleanup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.consent_analytics and not new.consent_analytics then
    delete from public.app_sessions where user_id = new.id;
    delete from public.screen_views where user_id = new.id;
  end if;
  return new;
end;
$$;

-- Panel de uso: SOLO totales y SOLO de quien aceptó las estadísticas. Nunca nombres ni correos.
create or replace function public.admin_usage() returns json
language plpgsql stable security definer set search_path = '' as $$
declare consented uuid[];
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select coalesce(array_agg(id), '{}') into consented from public.profiles where consent_analytics;
  return json_build_object(
    'users', (select count(*) from auth.users where email_confirmed_at is not null or phone_confirmed_at is not null),
    'consented', cardinality(consented),
    'active_7d', (select count(distinct user_id) from public.app_sessions where started_at > now() - interval '7 days'),
    'active_30d', (select count(distinct user_id) from public.app_sessions where started_at > now() - interval '30 days'),
    'sessions_7d', (select count(*) from public.app_sessions where started_at > now() - interval '7 days'),
    'avg_session_min', (select round(coalesce(avg(active_seconds), 0) / 60.0, 1) from public.app_sessions where started_at > now() - interval '30 days' and active_seconds > 0),
    'returning_30d', (select count(*) from (select user_id from public.app_sessions where started_at > now() - interval '30 days' group by user_id having count(distinct started_at::date) >= 2) r),
    'platforms', (select coalesce(json_object_agg(platform, n), '{}') from (select platform, count(*) n from public.app_sessions where started_at > now() - interval '30 days' group by platform) p),
    'daily', (select coalesce(json_agg(d order by d.day), '[]') from (
        select g.day::date as day, count(distinct s.user_id) as users, round(coalesce(sum(s.active_seconds), 0) / 60.0) as minutes
        from generate_series(current_date - 13, current_date, interval '1 day') g(day)
        left join public.app_sessions s on s.started_at::date = g.day::date
        group by g.day) d),
    'screens', (select coalesce(json_agg(x), '[]') from (
        select path, count(*) as views, count(distinct user_id) as users from public.screen_views
        where created_at > now() - interval '30 days' group by path order by count(*) desc limit 15) x),
    'guides', (select coalesce(json_agg(x), '[]') from (
        select ref as guide,
               count(*) filter (where type = 'guide_view') as views,
               count(*) filter (where type = 'procedure_start') as started,
               count(*) filter (where type = 'procedure_done') as finished
        from public.activity where ref is not null and user_id = any(consented) and created_at > now() - interval '90 days'
        group by ref order by count(*) desc limit 15) x)
  );
end;
$$;
revoke execute on function public.admin_usage() from public, anon;
grant execute on function public.admin_usage() to authenticated;
