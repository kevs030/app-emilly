-- A posto — esquema inicial
-- Principios: RLS en TODAS las tablas, privilegios por columna (nadie puede
-- cambiarse el rol ni des-ocultar un post), límites de longitud en la base de datos
-- y límites de velocidad contra spam. La app solo usa la clave pública (anon).

-- ───────────────────────── Perfiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 2 and 40),
  country_of_origin text check (char_length(country_of_origin) <= 60),
  city text check (char_length(city) <= 60),
  permit_type text check (permit_type in ('lavoro', 'famiglia', 'studio', 'protezione', 'lungo_periodo', 'attesa_occupazione', 'altro', 'nessuno')),
  permit_expiry date,
  has_children boolean,
  preferred_language text not null default 'es' check (preferred_language in ('es', 'en', 'it')),
  consent_personalization boolean not null default false,
  consent_analytics boolean not null default false,
  consent_updated_at timestamptz,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: leer el propio" on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles: editar el propio" on public.profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Privilegios por columna: el usuario NO puede tocar `role` ni `id`.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, country_of_origin, city, permit_type, permit_expiry, has_children,
              preferred_language, consent_personalization, consent_analytics, consent_updated_at)
  on public.profiles to authenticated;

-- Crear el perfil automáticamente al registrarse.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_moderator() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('moderator', 'admin'));
$$;

-- Derecho al olvido (art. 17 RGPD): el usuario borra su cuenta y todos sus datos.
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from anon, public;
grant execute on function public.delete_my_account() to authenticated;

-- ───────────────────────── Foro ─────────────────────────
create table public.forum_posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  category text not null check (category in ('permesso', 'lavoro', 'casa', 'salute', 'famiglia', 'bonus', 'cittadinanza', 'altro')),
  title text not null check (char_length(title) between 5 and 140),
  body text not null check (char_length(body) between 10 and 5000),
  lang text not null default 'es' check (lang in ('es', 'en', 'it')),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on public.forum_posts (created_at desc) where not hidden;

create table public.forum_comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.forum_posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 2 and 3000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.forum_comments (post_id, created_at);

create table public.forum_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  post_id bigint references public.forum_posts (id) on delete cascade,
  comment_id bigint references public.forum_comments (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, comment_id) = 1),
  unique nulls not distinct (reporter_id, post_id, comment_id)
);

alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_reports enable row level security;

-- Lectura: lo visible para todos; lo oculto solo para su autor y moderadores.
create policy "posts: leer" on public.forum_posts for select
  using (not hidden or author_id = (select auth.uid()) or (select public.is_moderator()));
create policy "posts: crear" on public.forum_posts for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "posts: editar los propios" on public.forum_posts for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "posts: borrar los propios o moderar" on public.forum_posts for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.is_moderator()));

create policy "comments: leer" on public.forum_comments for select
  using (not hidden or author_id = (select auth.uid()) or (select public.is_moderator()));
create policy "comments: crear" on public.forum_comments for insert to authenticated
  with check (author_id = (select auth.uid())
              and exists (select 1 from public.forum_posts p where p.id = post_id and not p.hidden));
create policy "comments: borrar los propios o moderar" on public.forum_comments for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.is_moderator()));

create policy "reports: crear" on public.forum_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "reports: moderadores leen" on public.forum_reports for select to authenticated
  using ((select public.is_moderator()));

-- Privilegios por columna: nadie puede fijar `hidden` ni `author_name` desde la app.
revoke insert, update on public.forum_posts, public.forum_comments, public.forum_reports from anon, authenticated;
grant insert (author_id, category, title, body, lang) on public.forum_posts to authenticated;
grant update (title, body, category, updated_at) on public.forum_posts to authenticated;
grant insert (post_id, author_id, body) on public.forum_comments to authenticated;
grant insert (reporter_id, post_id, comment_id, reason) on public.forum_reports to authenticated;

-- Autor y límites contra spam (se aplican en la base de datos, no se pueden saltar desde el cliente).
create function public.forum_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare recent int;
begin
  new.author_id := auth.uid();
  select coalesce(display_name, 'Usuario') into new.author_name from public.profiles where id = auth.uid();
  new.author_name := coalesce(new.author_name, 'Usuario');
  if tg_table_name = 'forum_posts' then
    select count(*) into recent from public.forum_posts where author_id = auth.uid() and created_at > now() - interval '1 hour';
    if recent >= 5 then raise exception 'rate_limited'; end if;
  else
    select count(*) into recent from public.forum_comments where author_id = auth.uid() and created_at > now() - interval '1 hour';
    if recent >= 30 then raise exception 'rate_limited'; end if;
  end if;
  return new;
end;
$$;
create trigger posts_before_insert before insert on public.forum_posts for each row execute function public.forum_before_insert();
create trigger comments_before_insert before insert on public.forum_comments for each row execute function public.forum_before_insert();

-- Ocultar automáticamente tras 3 denuncias distintas, a la espera de moderación.
create function public.forum_auto_hide() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.reporter_id := auth.uid();
  if new.post_id is not null and (select count(*) from public.forum_reports where post_id = new.post_id) >= 2 then
    update public.forum_posts set hidden = true where id = new.post_id;
  elsif new.comment_id is not null and (select count(*) from public.forum_reports where comment_id = new.comment_id) >= 2 then
    update public.forum_comments set hidden = true where id = new.comment_id;
  end if;
  return new;
end;
$$;
create trigger reports_auto_hide before insert on public.forum_reports for each row execute function public.forum_auto_hide();

-- Moderación (solo moderadores/admin).
create function public.moderate(p_post_id bigint, p_comment_id bigint, p_hidden boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_moderator() then raise exception 'forbidden'; end if;
  if p_post_id is not null then update public.forum_posts set hidden = p_hidden where id = p_post_id; end if;
  if p_comment_id is not null then update public.forum_comments set hidden = p_hidden where id = p_comment_id; end if;
end;
$$;
revoke execute on function public.moderate(bigint, bigint, boolean) from anon, public;
grant execute on function public.moderate(bigint, bigint, boolean) to authenticated;
