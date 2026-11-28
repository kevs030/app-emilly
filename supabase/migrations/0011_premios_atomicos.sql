-- A Posto — premios por anuncio sin condición de carrera (auditoría del 28-11-2026).
-- Antes: el servidor contaba los premios de las últimas 24 h y DESPUÉS concedía uno nuevo, en dos pasos.
-- Varias peticiones a la vez veían «quedan premios» y se concedían todas (6 de 6 con un límite de 3).
-- Ahora: contar y conceder ocurren dentro de una sola transacción, con un bloqueo por cuenta.
-- No borra ni cambia datos. Se puede ejecutar más de una vez.

create or replace function public.claim_ad_reward(p_user uuid, p_ref text, p_daily_limit integer) returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer; balance integer;
begin
  if p_user is null or p_ref is null or p_daily_limit < 1 then raise exception 'invalid arguments'; end if;
  -- Un solo cobro a la vez por cuenta: el segundo espera a que termine el primero y ya ve su premio.
  perform pg_advisory_xact_lock(hashtextextended('ad_reward:' || p_user::text, 0));
  select count(*) into n from public.ai_credit_ledger
    where user_id = p_user and reason = 'ad_reward' and created_at > now() - interval '24 hours';
  if n >= p_daily_limit then return -1; end if; -- límite diario alcanzado
  begin
    insert into public.ai_credit_ledger (user_id, delta, reason, ref) values (p_user, 1, 'ad_reward', p_ref);
  exception when unique_violation then
    return -2; -- este justificante ya se cobró
  end;
  insert into public.ai_wallets (user_id, credits) values (p_user, 1)
  on conflict (user_id) do update set credits = public.ai_wallets.credits + 1, updated_at = now()
  returning credits into balance;
  return balance;
end;
$$;

-- Solo el servidor (service_role) puede llamarla: la app no puede darse premios.
revoke execute on function public.claim_ad_reward(uuid, text, integer) from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.claim_ad_reward(uuid, text, integer) to service_role;
  end if;
end $$;
