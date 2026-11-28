-- Ofertas de trabajo por ciudad, descargadas cada mañana de Adzuna por /api/jobs/refresh.
-- Copia temporal de anuncios públicos (no datos de usuarios): se borran a los 14 días.
-- Lectura pública; escritura solo con la clave de servidor (sin políticas de escritura).
create table if not exists public.job_offers (
  id text primary key,
  city text not null,
  title text not null,
  company text,
  area text,
  contract_type text,
  contract_time text,
  category text,
  url text not null check (url like 'https://%'),
  posted_at timestamptz not null,
  fetched_at timestamptz not null default now()
);
create index if not exists job_offers_city_posted on public.job_offers (city, posted_at desc);
alter table public.job_offers enable row level security;
drop policy if exists "job_offers: lectura pública" on public.job_offers;
create policy "job_offers: lectura pública" on public.job_offers for select to anon, authenticated using (true);
revoke insert, update, delete on public.job_offers from anon, authenticated;
