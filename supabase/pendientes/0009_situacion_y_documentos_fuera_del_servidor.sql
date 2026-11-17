-- PENDIENTE — NO APLICAR TODAVÍA. Requiere el «sí» del propietario.
--
-- Contexto: desde esta versión, la app guarda la situación migratoria (tipo de permiso, caducidad,
-- hijos) y «Mis documentos» SOLO en el teléfono de cada persona. Al abrir la app, cada cuenta
-- antigua copia sus datos al teléfono y los borra del servidor.
--
-- Cuándo aplicarlo: cuando la versión nueva lleve publicada el tiempo suficiente para que las
-- cuentas activas hayan abierto la app (por ejemplo, 60 días). Antes, comprobar cuántas filas
-- quedan con datos (consulta de abajo). Las cuentas que no hayan abierto la app en ese tiempo
-- perderán esos datos del servidor: avisar en la app y por correo antes de aplicarlo.
--
-- Comprobación previa (solo lectura):
--   select count(*) filter (where permit_type is not null or permit_expiry is not null or has_children is not null) as perfiles_con_situacion,
--          (select count(*) from public.documents) as documentos_en_servidor
--   from public.profiles;

begin;

-- 1. Vaciar y eliminar las columnas de situación migratoria del perfil.
update public.profiles set permit_type = null, permit_expiry = null, has_children = null
  where permit_type is not null or permit_expiry is not null or has_children is not null;
alter table public.profiles drop column if exists permit_type;
alter table public.profiles drop column if exists permit_expiry;
alter table public.profiles drop column if exists has_children;

-- 2. Documentos: el servidor deja de aceptar documentos nuevos.
--    (Los archivos que queden en el bucket «documents» se borran desde el panel de Storage, no con SQL.)
revoke insert on public.documents from authenticated;

commit;

-- Después, cuando el bucket esté vacío y nadie use la tabla:
--   drop table public.documents;
--   y borrar el bucket «documents» en Storage → documents → Delete bucket.
-- Revisar también la función export_my_data y delete_my_account por si nombran estas columnas.
