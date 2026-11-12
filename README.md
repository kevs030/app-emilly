# A posto

Ayuda a las personas migrantes en Italia a ponerse en regla: qué trámite hacer, qué documentos preparar, adónde ir y qué les falta.

## Qué hay en este repositorio

| Carpeta | Qué es | Dónde funciona |
|---|---|---|
| `mobile/` | **La app** para iPhone y Android (React + Capacitor) | En el teléfono, descargada de las tiendas |
| `src/` | **La web** pública y el panel de administración (Next.js) | En Vercel |
| `src/content/` | **El contenido** verificado: guías, ayudas, formularios | Lo usan la app y la web |
| `supabase/` | **La base de datos**: tablas y reglas de seguridad | En Supabase (UE) |
| `docs/` | Análisis y plan del proyecto | — |

La app y la web comparten la misma base de datos y el mismo contenido. Lo que se corrige en una guía cambia en las dos.

## Por dónde empezar

- **¿Qué me falta configurar?** → [`docs/08-pasos-pendientes.md`](docs/08-pasos-pendientes.md)
- **¿Cómo veo la app en mi ordenador o en mi teléfono?** → [`mobile/README.md`](mobile/README.md)
- **¿Cuál es el plan y qué está hecho?** → [`docs/07-plan-app-movil.md`](docs/07-plan-app-movil.md)
- **¿Cómo cambio el texto de una guía?** → edita `src/content/guides.ts` y actualiza su fecha `lastVerified`.

## Comandos

| Para | Comando |
|---|---|
| Ver la web en el ordenador | `npm install` y luego `npm run dev` |
| Ver la app en el ordenador | `cd mobile`, `npm install` y luego `npm run dev` |
| Abrir la app en Xcode (iPhone) | `cd mobile` y luego `npm run ios` |
| Abrir la app en Android Studio | `cd mobile` y luego `npm run android` |
| Revisar que el contenido no esté caducado | `npm run check:freshness` |

## Idiomas

- **App:** español, italiano, inglés, francés, árabe, rumano, albanés, ucraniano y bengalí. Los textos están en `mobile/src/lib/strings.ts` y `mobile/src/lib/locales/`.
- **Guías (contenido legal):** español, italiano e inglés. En los demás idiomas la app muestra la versión más cercana y lo avisa, hasta tener traducciones revisadas por una persona.
- **Web:** español, italiano e inglés.

## Administración

`/admin` en la web solo existe para cuentas con rol `admin`. Para dar ese rol a otra cuenta, en el editor SQL de Supabase:
`update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'correo@ejemplo.com');`
