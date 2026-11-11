# 3. Arquitectura y seguridad

## Tecnologías
| Pieza | Tecnología | Por qué |
|---|---|---|
| Web y app (adaptada a móvil) | Next.js 16 + TypeScript + Tailwind | Una sola base de código. Se puede convertir en app instalable (PWA) |
| Cuentas, base de datos y foro | Supabase (Postgres + Auth) | Seguridad a nivel de fila (RLS), acceso sin contraseña con enlace por correo, región UE |
| Asistente | Claude API (`claude-opus-5-5`) con *streaming* | Responde en cualquier idioma, sobre una base de conocimiento verificada |
| Mapas | Leaflet + OpenStreetMap (Nominatim) | Gratis y sin clave. En producción, cambiar a un proveedor con SLA |
| Videos | Reproductor oficial de YouTube (`youtube-nocookie`) | Respeta los derechos de autor y la privacidad |
| Hosting | Vercel (región UE) | Se publica sola en cada `git push` |
| Analítica (más adelante) | PostHog UE, solo con consentimiento | Ya existe la casilla de consentimiento en el perfil |

## Mapa del código
```
src/content/        ← información verificada (guías, ayudas, videos, contactos) con fuentes y fechas
src/app/            ← páginas: inicio, guias, ayudas, asistente, mapa, videos, contactos, foro, perfil, entrar, privacidad
src/app/api/assistant/route.ts ← API del asistente (validación + límite de peticiones + streaming)
src/lib/assistant-prompt.ts    ← reglas del asistente (información sí, asesoramiento no)
src/lib/next-steps.ts          ← motor de personalización ("tus próximos pasos")
supabase/migrations/0001_init.sql ← base de datos con RLS
scripts/check-freshness.ts     ← revisión semanal de contenido y enlaces
```

## Seguridad: lo que ya está hecho
**Cuentas**
- Sin contraseñas: enlace de un solo uso por correo (`/auth/confirm`, solo redirige a rutas internas). Así no hay contraseñas que robar ni reutilizar.
- Las sesiones van en cookies seguras gestionadas por `@supabase/ssr` y se refrescan en `src/proxy.ts`.

**Base de datos (la barrera principal)**
- **RLS en todas las tablas:** cada persona solo puede leer y editar lo suyo.
- **Privilegios por columna:** el usuario **no puede** cambiar su `role` ni fijar `hidden` o `author_name`.
- El autor de cada mensaje lo fija la base de datos, así que no se puede suplantar a nadie.
- **Límites contra spam en la base de datos:** 5 posts y 30 comentarios por hora.
- Los contenidos se **ocultan solos tras 3 denuncias** de personas distintas, a la espera de moderación.
- La moderación se hace con la función `moderate()`, que solo pueden usar moderadores.
- **Derecho al olvido:** `delete_my_account()` borra la cuenta y todo su contenido.
- La app solo usa la clave pública (anon). **La clave `service_role` nunca está en el código.**

**Aplicación**
- **Validación con zod** en todas las acciones del servidor y en la API: tipos, longitudes y listas de valores permitidos.
- **XSS:** los textos del foro se muestran como texto plano (React escapa todo y no se usa `dangerouslySetInnerHTML`).
- **Cabeceras de seguridad** (`next.config.ts`): CSP estricta, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
- **CSRF:** las Server Actions de Next.js comprueban el origen de la petición, y la CSP limita `form-action` a nuestro propio sitio.

**Asistente**
- Límite de 20 preguntas cada 10 minutos por IP.
- Mensajes de 4.000 caracteres como máximo y 30 mensajes por conversación.
- La clave de la IA solo existe en el servidor.
- Reglas contra usos indebidos: no ayuda a falsificar documentos y no pide datos sensibles.

## Pruebas de seguridad hechas (11/11/2026)
Se ejecutó la migración en PostgreSQL 16 simulando Supabase y se lanzaron estos ataques. **Todos se bloquearon:**

| Ataque | Resultado |
|---|---|
| Usuario intenta hacerse admin | ❌ `permission denied` |
| Leer el perfil de otro usuario | 0 filas |
| Publicar haciéndose pasar por otro | El autor se corrige automáticamente al real |
| Publicar con `hidden` o `author_name` falso | ❌ `permission denied` |
| Editar o borrar posts ajenos | 0 filas afectadas |
| Usar la función de moderación sin serlo | ❌ `forbidden` |
| Denunciar dos veces lo mismo | ❌ restricción única |
| Leer denuncias sin ser moderador | 0 filas |
| Des-ocultar el propio post denunciado | ❌ `permission denied` |
| Publicar sin cuenta | ❌ `permission denied` |
| Spam: 6 posts en una hora | ❌ `rate_limited` |
| Borrar cuenta | Usuario y posts eliminados |

También se probó la API del asistente: rechaza peticiones mal formadas o enormes (400) y bloquea el exceso de peticiones (429).

## Pendiente antes del lanzamiento (lista de control)
- [ ] Activar **CAPTCHA** (Cloudflare Turnstile) en Supabase Auth para frenar bots al registrarse.
- [ ] Cambiar el limitador del asistente a uno **compartido** (Upstash Redis): en Vercel hay varias instancias y el limitador en memoria no basta.
- [ ] Configurar un SMTP propio (por ejemplo, Resend): el correo gratuito de Supabase solo envía a miembros del equipo y pocos correos por hora. Con SMTP propio se puede volver al código de 6 dígitos y personalizar el correo. Acceso por SMS: más adelante (Twilio u otro).
- [ ] Región **UE** en Supabase y Vercel. Copias de seguridad diarias.
- [ ] Panel de moderación, para revisar las denuncias y la función `moderate()`.
- [ ] Revisión de dependencias semanal (`npm audit`, Dependabot) y prueba de penetración externa antes de crecer.
- [ ] Aviso de edad (14 años o más) en el registro.
