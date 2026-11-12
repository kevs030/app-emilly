-- Emilly — panel de administración y espacios publicitarios propios
-- Se puede ejecutar más de una vez sin romper nada.

-- ───────────────────────── Administración ─────────────────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
-- La usan las políticas RLS, también para visitantes sin cuenta (para ellos devuelve false).
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Cifras para el panel (solo admin).
create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return json_build_object(
    'users', (select count(*) from auth.users where email_confirmed_at is not null or phone_confirmed_at is not null),
    'users_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'
                 and (email_confirmed_at is not null or phone_confirmed_at is not null)),
    'personalized', (select count(*) from public.profiles where consent_personalization),
    'posts', (select count(*) from public.forum_posts),
    'comments', (select count(*) from public.forum_comments),
    'hidden', (select count(*) from public.forum_posts where hidden) + (select count(*) from public.forum_comments where hidden),
    'reports', (select count(*) from public.forum_reports),
    'sponsor_clicks', (select coalesce(sum(clicks), 0) from public.sponsors)
  );
end;
$$;

-- Los moderadores pueden cerrar denuncias ya revisadas.
drop policy if exists "reports: moderadores borran" on public.forum_reports;
create policy "reports: moderadores borran" on public.forum_reports for delete to authenticated
  using ((select public.is_moderator()));
grant delete on public.forum_reports to authenticated;

-- ───────────────────────── Patrocinios (publicidad propia) ─────────────────────────
-- Anuncios de texto, vendidos directamente, sin cookies ni rastreo de terceros.
create table if not exists public.sponsors (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 3 and 60),
  body text not null check (char_length(body) between 10 and 160),
  cta text not null default 'Más información' check (char_length(cta) between 2 and 30),
  url text not null check (url ~ '^https://[^\s]+$' and char_length(url) <= 300),
  placement text not null default 'all' check (placement in ('all', 'home', 'guias', 'foro')),
  active boolean not null default true,
  clicks bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sponsors enable row level security;

drop policy if exists "sponsors: leer activos" on public.sponsors;
create policy "sponsors: leer activos" on public.sponsors for select
  using (active or (select public.is_admin()));
drop policy if exists "sponsors: admin crea" on public.sponsors;
create policy "sponsors: admin crea" on public.sponsors for insert to authenticated
  with check ((select public.is_admin()));
drop policy if exists "sponsors: admin edita" on public.sponsors;
create policy "sponsors: admin edita" on public.sponsors for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "sponsors: admin borra" on public.sponsors;
create policy "sponsors: admin borra" on public.sponsors for delete to authenticated
  using ((select public.is_admin()));

revoke all on public.sponsors from anon, authenticated;
grant select on public.sponsors to anon, authenticated;
grant insert (title, body, cta, url, placement, active) on public.sponsors to authenticated;
grant update (title, body, cta, url, placement, active) on public.sponsors to authenticated;
grant delete on public.sponsors to authenticated;

-- Cuenta un clic y devuelve la URL de destino (la URL sale de la base de datos, no del visitante).
create or replace function public.sponsor_click(p_id bigint) returns text
language plpgsql security definer set search_path = '' as $$
declare target text;
begin
  update public.sponsors set clicks = clicks + 1 where id = p_id and active returning url into target;
  return target;
end;
$$;
revoke execute on function public.sponsor_click(bigint) from public;
grant execute on function public.sponsor_click(bigint) to anon, authenticated;

revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- ───────────────────────── Primer administrador ─────────────────────────
-- Si todavía no hay ningún admin, lo es la cuenta confirmada más antigua (la del fundador).
update public.profiles set role = 'admin'
where not exists (select 1 from public.profiles where role = 'admin')
  and id = (select id from auth.users
            where email_confirmed_at is not null or phone_confirmed_at is not null
            order by created_at asc limit 1);
