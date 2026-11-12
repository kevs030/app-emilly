# Emilly — Guía para migrantes en Italia

App web (adaptada a móvil) con:
- trámites paso a paso;
- ayudas;
- asistente con IA;
- mapa de oficinas;
- videos con subtítulos;
- directorio de contactos;
- foro con cuentas seguras.

Idiomas: español, inglés e italiano.

📚 **Análisis completo en [`docs/`](docs/):** mercado, legal, seguridad, contenido y hoja de ruta.

## Ponerla en marcha (local)
```bash
npm install
cp .env.example .env.local   # rellena las claves (ver abajo)
npm run dev                  # http://localhost:3000
```
Sin claves, la app ya funciona en modo lectura: guías, ayudas, mapa, videos y contactos. El asistente necesita `ANTHROPIC_API_KEY`. Las cuentas y el foro necesitan Supabase.

## Claves que necesitas
1. **Supabase** (gratis para empezar):
   - Crea un proyecto en supabase.com en **región UE**.
   - Ve a *SQL Editor* y ejecuta, en orden, `supabase/migrations/0001_init.sql` y `0002_admin_y_patrocinios.sql`. La segunda convierte en administrador a la cuenta confirmada más antigua.
   - En *Authentication → URL Configuration*, pon como *Site URL* la dirección de la web (`https://app-emilly.vercel.app`) y añade `https://app-emilly.vercel.app/**` en *Redirect URLs*.
   - El acceso es con enlace por correo (el correo por defecto de Supabase ya sirve). El correo gratuito de Supabase solo envía a miembros del equipo y pocos correos por hora: para abrir la app al público hay que configurar un SMTP propio (por ejemplo, Resend) en *Authentication → Emails*.
   - En *Authentication → Attack Protection*, activa el CAPTCHA (Turnstile).
   - Copia `Project URL` y la clave `anon` en `.env.local`.
2. **Claude API:** console.anthropic.com → API Keys → `ANTHROPIC_API_KEY`.

## Publicarla (Vercel)
1. Sube este proyecto a un repositorio de GitHub.
2. En vercel.com, pulsa *Add New Project*, elige el repositorio y añade las mismas 3 variables de entorno.
3. Cada `git push` publica la app automáticamente.

## Comandos útiles
| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo local |
| `npm run build` | Compilar para producción |
| `npm run lint` / `npm run typecheck` | Revisar el código |
| `npm run check:freshness` | Revisión semanal: contenido sin verificar y enlaces rotos |

## Panel de administración
`/admin` solo existe para cuentas con rol `admin` (el resto recibe un 404). Desde ahí se ven las cifras, se moderan las denuncias del foro y se gestionan los anuncios. Para dar el rol a otra cuenta: `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'correo@ejemplo.com');`

## Dónde se edita el contenido
Todo está en `src/content/`: `guides.ts`, `bonuses.ts`, `documents.ts` (formularios oficiales), `videos.ts` y `directory.ts`. Cada vez que verifiques algo, actualiza su `lastVerified`.
