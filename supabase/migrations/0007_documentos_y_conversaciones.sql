-- 0007 · Documentos privados y conversaciones del asistente.
-- Se puede ejecutar más de una vez. No borra ni modifica datos existentes.

-- ───────────────────────── Mis documentos ─────────────────────────
-- La tabla guarda la ficha; el archivo vive en un almacén PRIVADO (nunca público).
create table if not exists public.documents (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  kind text not null default 'altro' check (kind in ('permesso', 'identita', 'fiscale', 'salute', 'lavoro', 'casa', 'lettera', 'altro')),
  storage_path text not null unique check (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$'),
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  size_bytes integer not null check (size_bytes between 1 and 8388608),
  expires_on date,
  note text check (char_length(note) <= 500),
  analysis text check (char_length(analysis) <= 20000),
  analysis_lang text check (analysis_lang ~ '^[a-z]{2}$'),
  created_at timestamptz not null default now()
);
create index if not exists documents_user_idx on public.documents (user_id, created_at desc);
alter table public.documents enable row level security;

drop policy if exists "documents: solo lo propio" on public.documents;
create policy "documents: solo lo propio" on public.documents for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and storage_path like (select auth.uid())::text || '/%');

revoke all on public.documents from anon, authenticated;
grant select, delete on public.documents to authenticated;
grant insert (title, kind, storage_path, mime, size_bytes, expires_on, note) on public.documents to authenticated;
grant update (title, kind, expires_on, note, analysis, analysis_lang) on public.documents to authenticated;

drop trigger if exists documents_cap on public.documents;
create trigger documents_cap before insert on public.documents for each row execute function public.enforce_row_cap('60');

-- Almacén privado: 8 MB por archivo, solo imágenes y PDF.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Cada persona solo ve, sube y borra archivos dentro de su propia carpeta (su identificador).
drop policy if exists "documents: leer los propios" on storage.objects;
create policy "documents: leer los propios" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "documents: subir los propios" on storage.objects;
create policy "documents: subir los propios" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "documents: borrar los propios" on storage.objects;
create policy "documents: borrar los propios" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ───────────────────────── Conversaciones del asistente ─────────────────────────
create table if not exists public.ai_conversations (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_conversations_user_idx on public.ai_conversations (user_id, updated_at desc);

create table if not exists public.ai_messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  created_at timestamptz not null default now()
);
create index if not exists ai_messages_conversation_idx on public.ai_messages (conversation_id, id);
create index if not exists ai_messages_user_idx on public.ai_messages (user_id);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "ai_conversations: solo lo propio" on public.ai_conversations;
create policy "ai_conversations: solo lo propio" on public.ai_conversations for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "ai_messages: solo lo propio" on public.ai_messages;
create policy "ai_messages: solo lo propio" on public.ai_messages for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid())
              and exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

revoke all on public.ai_conversations, public.ai_messages from anon, authenticated;
grant select, delete on public.ai_conversations, public.ai_messages to authenticated;
grant insert (title) on public.ai_conversations to authenticated;
grant update (title) on public.ai_conversations to authenticated;
grant insert (conversation_id, role, content) on public.ai_messages to authenticated;

drop trigger if exists ai_conversations_cap on public.ai_conversations;
create trigger ai_conversations_cap before insert on public.ai_conversations for each row execute function public.enforce_row_cap('30');
drop trigger if exists ai_messages_cap on public.ai_messages;
create trigger ai_messages_cap before insert on public.ai_messages for each row execute function public.enforce_row_cap('1000');

create or replace function public.ai_conversation_touch() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.ai_conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;
revoke execute on function public.ai_conversation_touch() from public, anon, authenticated;
drop trigger if exists ai_messages_touch on public.ai_messages;
create trigger ai_messages_touch after insert on public.ai_messages for each row execute function public.ai_conversation_touch();

-- ───────────────────────── Portabilidad (art. 20 RGPD) ─────────────────────────
-- La descarga de datos incluye ahora las fichas de documentos y las conversaciones.
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
    'forum_comments', (select coalesce(json_agg(x), '[]'::json) from public.forum_comments x where x.author_id = uid),
    'documents', (select coalesce(json_agg(x), '[]'::json) from public.documents x where x.user_id = uid),
    'assistant_conversations', (select coalesce(json_agg(x), '[]'::json) from public.ai_conversations x where x.user_id = uid),
    'assistant_messages', (select coalesce(json_agg(x), '[]'::json) from public.ai_messages x where x.user_id = uid)
  );
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;
