# 14. Seguridad — lista de 20 puntos (revisión del 17-11-2026)

Revisado sobre el código, el historial de Git y la base de datos real (informe de seguridad de Supabase, solo lectura).

**Leyenda:** ✅ hecho · 🔧 arreglado en esta revisión · ⏳ preparado, falta tu paso · 👤 lo haces tú en un panel

| # | Punto | Estado | Detalle |
|---|---|---|---|
| 1 | Ocultar API keys | ✅ | Las claves secretas (Anthropic, clave de servidor de Supabase) solo existen en Vercel. El código solo lleva la clave pública. |
| 2 | Limpiar secretos de Git | ✅ 🔧 | Revisado **todo el historial**: ningún secreto. `.env*`, `*.keystore`, `*.jks` y `keystore.properties` están ignorados. Arreglado: `mobile/.gitignore` ahora ignora todos los `.env*`. |
| 3 | Key pública para la DB | ✅ | La app usa la clave `sb_publishable_…`, pensada para ser pública. La seguridad la ponen las reglas de la base. |
| 4 | Row-level security | ✅ | Activada en **todas** las tablas (confirmado en la base real). |
| 5 | Encriptar datos sensibles | ✅ | Situación migratoria y documentos: solo en el teléfono, cifrados (Keychain/Keystore y AES-GCM). Contraseñas: las cifra Supabase. Conexiones: HTTPS obligatorio (HSTS). |
| 6 | Forzar autenticación | ✅ | Pantallas personales y rutas del servidor exigen sesión; el servidor comprueba el token en cada petición. |
| 7 | Restringir acceso a registros | ✅ | Cada tabla personal solo deja ver y tocar las filas propias (`user_id = auth.uid()`). |
| 8 | Bloquear manipulación de campos | ✅ | Permisos por columna: nadie puede cambiar `role` (hacerse administrador), ni sus créditos, ni campos internos. Las funciones especiales comprueban quién llama. |
| 9 | Proteger cookies de sesión | ✅ | Cookies `Secure` + `SameSite=Lax` (patrón oficial de Supabase). No son `HttpOnly` porque el navegador las necesita; el riesgo de robo por scripts lo frena la política de contenido (CSP). |
| 10 | Hashear contraseñas | ✅ 👤 | Supabase las guarda con bcrypt. 👤 Activar la **protección de contraseñas filtradas** (ver abajo). |
| 11 | Rate limiting | ✅ ⏳ | Límites en todas las rutas del servidor. 🔧 Ahora compartidos entre todos los servidores de Vercel cuando apliques la migración `supabase/pendientes/0009_seguridad.sql`; hasta entonces, por servidor. |
| 12 | Protección contra bots | ⏳ 👤 | 🔧 CAPTCHA de Cloudflare Turnstile listo en registro, acceso, teléfono y recuperación (app y web), **apagado** hasta poner la clave. |
| 13 | Validar inputs | ✅ | Todas las rutas del servidor validan con `zod` (tipos, longitudes, formatos); la base añade sus propias comprobaciones. |
| 14 | Cerrar CORS | ✅ | Las rutas privadas solo responden a la app (lista cerrada de orígenes). Solo `/api/points` (datos públicos del mapa) está abierta. |
| 15 | Headers de seguridad | ✅ | CSP, HSTS (2 años), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, sin cabecera `X-Powered-By`. |
| 16 | Backups automáticos | 👤 | Depende del plan de Supabase (ver abajo). |
| 17 | Tope de gasto en IA | ✅ 🔧 👤 | Por cuenta: créditos. 🔧 Nuevo tope global de 1000 preguntas cada 24 h (`AI_DAILY_QUESTION_LIMIT`) y respuestas más cortas (máx. 8000 tokens). 👤 Poner un tope mensual en Anthropic. |
| 18 | Auditar dependencias | ✅ 🔧 | Producción: 0 vulnerabilidades. Herramientas de desarrollo: 10 moderadas, corregidas con `npm audit fix` (0 ahora). |
| 19 | Errores sin datos internos | ✅ 🔧 | Las rutas responden con códigos cortos (`invalid_request`, `not_ready`…). 🔧 `/api/points` ya no muestra los servidores internos que fallaron. |
| 20 | Admin y debug fuera de producción | ✅ 🔧 | `/admin` devuelve «no encontrado» a quien no es administrador. Sin `console.log` ni rutas de prueba. 🔧 `/api/health` ya solo dice «ok» al público; el detalle de configuración solo lo ve una cuenta administradora. |

### Hallazgo extra (arreglado, falta aplicar)
**Clics de anuncios inflables:** cualquiera podía llamar sin límite a la función que cuenta clics y engordar la cifra de un anunciante. Con la migración 0009, una cuenta cuenta como mucho 1 clic por anuncio y día, y los clics sin cuenta van aparte (`anon_clicks`, no verificados). Para facturar, usa los clics verificados y las visualizaciones con premio.

### Avisos del informe de Supabase que son intencionados
Las funciones `spend_ai_credit`, `delete_my_account`, `export_my_data`, `my_usage`, `session_*`, `admin_stats`, `moderate`, `is_admin`, `is_moderator` y `sponsor_click` pueden llamarse desde la app **a propósito**; cada una comprueba dentro quién llama (la propia cuenta, administrador o moderador).

---

## Lo que tienes que hacer tú (clics exactos)

### A. Supabase — contraseñas filtradas (punto 10)
Supabase → tu proyecto → **Authentication** → **Sign In / Providers** → **Email** → activa **Prevent use of leaked passwords** y pon **Minimum password length: 12** → **Save**. (La protección de contraseñas filtradas puede requerir el plan Pro.)

### B. Tope de gasto en Anthropic (punto 17)
https://console.anthropic.com → **Settings** → **Limits** → pon un **límite de gasto mensual** (por ejemplo, 20 $) y un aviso por correo al 50 %.

### C. Migración de seguridad (puntos 11 y anuncios)
Cuando digas **«sí, aplica la 0009»**, la aplico. No borra datos.

### D. CAPTCHA contra bots (punto 12) — en este orden
1. Cloudflare → **Turnstile** → **Add widget** → nombre `A Posto` → dominios: `app-emilly.vercel.app` (y tu dominio nuevo) → modo **Managed** → **Create**. Copia la **Site Key** (pública) y la **Secret Key** (secreta).
2. Vercel → proyecto → **Settings** → **Environment Variables**: añade `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `VITE_TURNSTILE_SITE_KEY` con la **Site Key**. Vuelve a desplegar.
3. **Después**, Supabase → **Authentication** → **Attack Protection** → **Enable CAPTCHA protection** → proveedor **Turnstile** → pega la **Secret Key** → **Save**.
   Si haces el paso 3 antes que el 2, nadie podrá entrar.

### E. Backups (punto 16)
El plan gratuito de Supabase no garantiza copias que puedas restaurar tú. Con el plan **Pro** hay copias diarias de 7 días (Database → Backups). Recomendado antes de abrir al público. Alternativa sin coste: una exportación manual semanal desde **Database** → **Backups** o con `supabase db dump` en tu ordenador; guárdala cifrada y fuera de GitHub (contiene datos personales).

### F. Variables en Vercel que intervienen en la seguridad
| Variable | Tipo | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | secreta | Asistente y lector de documentos |
| `SUPABASE_SERVICE_ROLE_KEY` | secreta | Premios por anuncio, reembolsos, tope global de IA y límite compartido |
| `AI_DAILY_QUESTION_LIMIT` | normal (opcional) | Tope global de preguntas en 24 h; por defecto 1000 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `VITE_TURNSTILE_SITE_KEY` | pública | CAPTCHA |

### Mejora futura (no urgente)
La CSP de la web permite scripts en línea (`'unsafe-inline'`) porque Next.js lo necesita sin configuración extra. Se puede endurecer con *nonces* por petición; conviene hacerlo antes de un lanzamiento grande.
