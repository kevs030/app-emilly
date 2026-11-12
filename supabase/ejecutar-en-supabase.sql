-- Emilly: archivo único para pegar en Supabase → SQL Editor → Run.
-- Reúne las migraciones 0002 y 0003. Se puede ejecutar más de una vez.

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

-- Emilly — fase 2: trámites con progreso real, recordatorios, memoria personal y analítica
-- Principios: cada persona solo ve y toca lo suyo (RLS), límites de tamaño en la base de datos,
-- el progreso se calcula contando filas reales, y la analítica de uso exige consentimiento.
-- Se puede ejecutar más de una vez sin romper nada.

-- ───────────────────────── Trámites en curso ─────────────────────────
create table if not exists public.procedures (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  guide_slug text not null check (guide_slug ~ '^[a-z0-9-]{2,60}$'),
  status text not null default 'active' check (status in ('active', 'done')),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, guide_slug)
);

-- Una fila = un paso o documento que la persona marcó como hecho. Sin fila = pendiente.
create table if not exists public.procedure_items (
  procedure_id bigint not null references public.procedures (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('step', 'document')),
  idx smallint not null check (idx between 0 and 99),
  done_at timestamptz not null default now(),
  primary key (procedure_id, kind, idx)
);

-- ───────────────────────── Recordatorios que define la persona ─────────────────────────
create table if not exists public.reminders (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  procedure_id bigint references public.procedures (id) on delete set null,
  title text not null check (char_length(title) between 2 and 120),
  due_date date not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reminders_user_due on public.reminders (user_id, due_date) where not done;

-- ───────────────────────── Memoria personal ─────────────────────────
-- `source` distingue lo que dijo la persona de lo que sugiere la IA.
-- Una sugerencia de la IA no cuenta como dato hasta que la persona la confirma.
create table if not exists public.user_facts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null check (key ~ '^[a-z_]{2,40}$'),
  value text not null check (char_length(value) between 1 and 300),
  source text not null default 'user' check (source in ('user', 'ai_suggestion')),
  confirmed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, key, value),
  check (source = 'ai_suggestion' or confirmed)
);

-- Historial de interacciones: sirve para «continuar donde lo dejaste» y para personalizar.
-- Solo guarda el tipo de acción y una referencia corta (por ejemplo, el nombre de la guía).
create table if not exists public.activity (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('guide_view', 'procedure_start', 'procedure_done', 'item_done', 'item_undone', 'document_open', 'reminder_add', 'reminder_done')),
  ref text check (char_length(ref) <= 80),
  created_at timestamptz not null default now()
);
create index if not exists activity_user_time on public.activity (user_id, created_at desc);

-- ───────────────────────── Analítica de uso (solo con consentimiento) ─────────────────────────
create table if not exists public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android', 'web')),
  started_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  active_seconds integer not null default 0 check (active_seconds between 0 and 86400)
);
create index if not exists app_sessions_user on public.app_sessions (user_id, started_at desc);

-- ───────────────────────── Seguridad: RLS en todo ─────────────────────────
alter table public.procedures enable row level security;
alter table public.procedure_items enable row level security;
alter table public.reminders enable row level security;
alter table public.user_facts enable row level security;
alter table public.activity enable row level security;
alter table public.app_sessions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['procedures', 'procedure_items', 'reminders', 'user_facts', 'activity', 'app_sessions'] loop
    execute format('drop policy if exists "%s: solo lo propio" on public.%I', t, t);
    execute format(
      'create policy "%s: solo lo propio" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t, t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Un paso solo se puede marcar en un trámite propio.
drop policy if exists "procedure_items: solo lo propio" on public.procedure_items;
create policy "procedure_items: solo lo propio" on public.procedure_items for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid())
              and exists (select 1 from public.procedures p where p.id = procedure_id and p.user_id = (select auth.uid())));

-- Privilegios por columna: la app no puede fijar user_id, fechas ni tiempos a mano.
grant select, delete on public.procedures, public.procedure_items, public.reminders, public.user_facts, public.activity, public.app_sessions to authenticated;
grant insert (guide_slug) on public.procedures to authenticated;
grant update (status) on public.procedures to authenticated;
grant insert (procedure_id, kind, idx) on public.procedure_items to authenticated;
grant insert (procedure_id, title, due_date) on public.reminders to authenticated;
grant update (title, due_date, done) on public.reminders to authenticated;
grant insert (key, value) on public.user_facts to authenticated;
grant update (confirmed) on public.user_facts to authenticated;
grant insert (type, ref) on public.activity to authenticated;
-- app_sessions: sin insert ni update directos; solo mediante las funciones de abajo.

-- ───────────────────────── Reglas automáticas ─────────────────────────
-- Fechas del trámite: las pone la base de datos, no la app.
create or replace function public.procedures_touch() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'done' and old.status <> 'done' then new.completed_at := now(); end if;
  if new.status = 'active' then new.completed_at := null; end if;
  return new;
end;
$$;
drop trigger if exists procedures_touch on public.procedures;
create trigger procedures_touch before update on public.procedures for each row execute function public.procedures_touch();

-- Marcar o desmarcar un paso actualiza la fecha del trámite (para «continuar donde lo dejaste»).
create or replace function public.procedure_items_touch() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.procedures set updated_at = now() where id = coalesce(new.procedure_id, old.procedure_id);
  return coalesce(new, old);
end;
$$;
drop trigger if exists procedure_items_touch on public.procedure_items;
create trigger procedure_items_touch after insert or delete on public.procedure_items for each row execute function public.procedure_items_touch();

-- Límites por persona, contra abusos: 40 trámites, 200 recordatorios, 200 datos de memoria.
create or replace function public.enforce_row_cap() returns trigger
language plpgsql security definer set search_path = '' as $$
declare n bigint;
begin
  execute format('select count(*) from public.%I where user_id = $1', tg_table_name) into n using auth.uid();
  if n >= tg_argv[0]::bigint then raise exception 'limit_reached'; end if;
  return new;
end;
$$;
drop trigger if exists procedures_cap on public.procedures;
create trigger procedures_cap before insert on public.procedures for each row execute function public.enforce_row_cap('40');
drop trigger if exists reminders_cap on public.reminders;
create trigger reminders_cap before insert on public.reminders for each row execute function public.enforce_row_cap('200');
drop trigger if exists user_facts_cap on public.user_facts;
create trigger user_facts_cap before insert on public.user_facts for each row execute function public.enforce_row_cap('200');

-- El historial conserva solo las últimas 300 acciones de cada persona.
create or replace function public.activity_prune() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.activity
  where user_id = new.user_id
    and id < (select id from public.activity where user_id = new.user_id order by id desc offset 299 limit 1);
  return new;
end;
$$;
drop trigger if exists activity_prune on public.activity;
create trigger activity_prune after insert on public.activity for each row execute function public.activity_prune();

-- ───────────────────────── Analítica: sesiones y tiempo activo ─────────────────────────
-- Solo se registra si la persona aceptó las estadísticas (profiles.consent_analytics).
create or replace function public.session_start(p_platform text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare sid uuid;
begin
  if auth.uid() is null then return null; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and consent_analytics) then return null; end if;
  -- Como mucho 50 sesiones nuevas al día por persona.
  if (select count(*) from public.app_sessions where user_id = auth.uid() and started_at > now() - interval '1 day') >= 50 then return null; end if;
  insert into public.app_sessions (user_id, platform) values (auth.uid(), p_platform) returning id into sid;
  return sid;
end;
$$;

-- La app avisa cada cierto tiempo de cuántos segundos ACTIVOS han pasado (sin contar inactividad).
-- El servidor no acepta más segundos de los que realmente han transcurrido.
create or replace function public.session_heartbeat(p_session uuid, p_active_seconds integer) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.app_sessions
  set active_seconds = least(86400, active_seconds + greatest(0, least(p_active_seconds, 90,
        ceil(extract(epoch from now() - last_active_at))::integer))),
      last_active_at = now()
  where id = p_session and user_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and consent_analytics);
end;
$$;

-- Si la persona retira el consentimiento, se borran sus estadísticas.
create or replace function public.analytics_consent_cleanup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.consent_analytics and not new.consent_analytics then
    delete from public.app_sessions where user_id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists analytics_consent_cleanup on public.profiles;
create trigger analytics_consent_cleanup after update of consent_analytics on public.profiles
  for each row execute function public.analytics_consent_cleanup();

-- ───────────────────────── Derechos de la persona ─────────────────────────
-- Exportar todos mis datos (art. 15 y 20 RGPD).
create or replace function public.export_my_data() returns json
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  return json_build_object(
    'exported_at', now(),
    'profile', (select to_json(p) from public.profiles p where p.id = uid),
    'procedures', (select coalesce(json_agg(x), '[]'::json) from public.procedures x where x.user_id = uid),
    'procedure_items', (select coalesce(json_agg(x), '[]'::json) from public.procedure_items x where x.user_id = uid),
    'reminders', (select coalesce(json_agg(x), '[]'::json) from public.reminders x where x.user_id = uid),
    'memory', (select coalesce(json_agg(x), '[]'::json) from public.user_facts x where x.user_id = uid),
    'activity', (select coalesce(json_agg(x), '[]'::json) from public.activity x where x.user_id = uid),
    'usage_sessions', (select coalesce(json_agg(x), '[]'::json) from public.app_sessions x where x.user_id = uid),
    'forum_posts', (select coalesce(json_agg(x), '[]'::json) from public.forum_posts x where x.author_id = uid),
    'forum_comments', (select coalesce(json_agg(x), '[]'::json) from public.forum_comments x where x.author_id = uid)
  );
end;
$$;

-- Mis totales de uso, para mostrarlos con transparencia.
create or replace function public.my_usage() returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'sessions', count(*),
    'active_minutes', coalesce(sum(active_seconds), 0) / 60
  ) from public.app_sessions where user_id = auth.uid();
$$;

revoke execute on function public.session_start(text), public.session_heartbeat(uuid, integer), public.export_my_data(), public.my_usage() from public, anon;
grant execute on function public.session_start(text), public.session_heartbeat(uuid, integer), public.export_my_data(), public.my_usage() to authenticated;
