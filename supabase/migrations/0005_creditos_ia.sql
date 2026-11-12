-- A posto — créditos del asistente de IA
-- Cada pregunta al asistente gasta 1 crédito. Al registrarse se regalan 3.
-- Los créditos solo se suman desde el servidor (compras verificadas, anuncios vistos, reembolsos):
-- la app no puede darse créditos a sí misma. Se puede ejecutar más de una vez.

create table if not exists public.ai_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  credits integer not null default 3 check (credits between 0 and 100000),
  updated_at timestamptz not null default now()
);

-- Libro de movimientos: de dónde viene y adónde va cada crédito.
create table if not exists public.ai_credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null check (reason in ('signup', 'question', 'purchase', 'ad_reward', 'refund', 'admin')),
  ref text check (char_length(ref) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists ai_credit_ledger_user on public.ai_credit_ledger (user_id, created_at desc);
-- Una misma compra o un mismo anuncio no se puede cobrar dos veces.
create unique index if not exists ai_credit_ledger_once on public.ai_credit_ledger (reason, ref) where ref is not null;

alter table public.ai_wallets enable row level security;
alter table public.ai_credit_ledger enable row level security;

drop policy if exists "ai_wallets: leer el propio" on public.ai_wallets;
create policy "ai_wallets: leer el propio" on public.ai_wallets for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "ai_credit_ledger: leer el propio" on public.ai_credit_ledger;
create policy "ai_credit_ledger: leer el propio" on public.ai_credit_ledger for select to authenticated using (user_id = (select auth.uid()));

-- Solo lectura para las personas: ni insertar, ni editar, ni borrar.
revoke all on public.ai_wallets, public.ai_credit_ledger from anon, authenticated;
grant select on public.ai_wallets, public.ai_credit_ledger to authenticated;

-- Monedero con 3 créditos de regalo al crear el perfil.
create or replace function public.ai_wallet_create() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.ai_wallets (user_id) values (new.id) on conflict do nothing;
  if found then
    insert into public.ai_credit_ledger (user_id, delta, reason) values (new.id, 3, 'signup');
  end if;
  return new;
end;
$$;
drop trigger if exists ai_wallet_create on public.profiles;
create trigger ai_wallet_create after insert on public.profiles for each row execute function public.ai_wallet_create();

-- Cuentas que ya existían: su monedero con los 3 de regalo.
with created as (
  insert into public.ai_wallets (user_id) select id from public.profiles on conflict do nothing returning user_id
)
insert into public.ai_credit_ledger (user_id, delta, reason) select user_id, 3, 'signup' from created;

-- Gastar 1 crédito. Devuelve los que quedan, o -1 si no había ninguno.
-- Es atómico: dos preguntas a la vez no pueden gastar el mismo crédito.
create or replace function public.spend_ai_credit() returns integer
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); remaining integer;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.ai_wallets set credits = credits - 1, updated_at = now()
  where user_id = uid and credits > 0 returning credits into remaining;
  if remaining is null then return -1; end if;
  insert into public.ai_credit_ledger (user_id, delta, reason) values (uid, -1, 'question');
  return remaining;
end;
$$;
revoke execute on function public.spend_ai_credit() from public, anon;
grant execute on function public.spend_ai_credit() to authenticated;

-- Sumar créditos. SOLO el servidor (service_role): compras verificadas, anuncios vistos o reembolsos.
-- `p_ref` identifica la compra o el anuncio; si se repite, no se suma otra vez y devuelve false.
create or replace function public.grant_ai_credits(p_user uuid, p_amount integer, p_reason text, p_ref text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if p_amount < 1 or p_amount > 1000 then raise exception 'invalid amount'; end if;
  if p_reason not in ('purchase', 'ad_reward', 'refund', 'admin') then raise exception 'invalid reason'; end if;
  begin
    insert into public.ai_credit_ledger (user_id, delta, reason, ref) values (p_user, p_amount, p_reason, p_ref);
  exception when unique_violation then
    return false;
  end;
  insert into public.ai_wallets (user_id, credits) values (p_user, p_amount)
  on conflict (user_id) do update set credits = public.ai_wallets.credits + excluded.credits, updated_at = now();
  return true;
end;
$$;
revoke execute on function public.grant_ai_credits(uuid, integer, text, text) from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.grant_ai_credits(uuid, integer, text, text) to service_role;
  end if;
end $$;

-- La exportación de datos incluye ahora los créditos y sus movimientos.
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
    'ai_credits', (select credits from public.ai_wallets where user_id = uid),
    'ai_credit_movements', (select coalesce(json_agg(x), '[]'::json) from public.ai_credit_ledger x where x.user_id = uid),
    'forum_posts', (select coalesce(json_agg(x), '[]'::json) from public.forum_posts x where x.author_id = uid),
    'forum_comments', (select coalesce(json_agg(x), '[]'::json) from public.forum_comments x where x.author_id = uid)
  );
end;
$$;
