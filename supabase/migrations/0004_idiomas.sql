-- A posto — idiomas de la app: español, italiano, inglés, francés, árabe, rumano, albanés, ucraniano y bengalí.
-- Amplía la lista de idiomas que puede guardar el perfil. Se puede ejecutar más de una vez.
alter table public.profiles drop constraint if exists profiles_preferred_language_check;
alter table public.profiles add constraint profiles_preferred_language_check
  check (preferred_language in ('es', 'it', 'en', 'fr', 'ar', 'ro', 'sq', 'uk', 'bn'));
