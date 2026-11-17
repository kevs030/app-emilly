# Correo de verificación con Resend — pasos exactos

Objetivo: que **cualquier persona** que se registre reciba el correo para confirmar su cuenta
y el de «olvidé mi contraseña». Hoy Supabase usa su correo de pruebas, que solo envía a los
miembros del equipo y muy pocos correos por hora.

Nunca pegues claves en el chat ni en el repositorio: solo en las pantallas de Resend y Supabase.

> **Dominio de A Posto: `apostoapp.app`** (comprado en Cloudflare). Subdominio de correo en Resend: `mail.apostoapp.app`.
> Remitente: `no-reply@mail.apostoapp.app` · Nombre: `A Posto`.

---

## Paso 0 — Comprar un dominio propio (obligatorio para Resend)

Resend **no vende dominios**: hay que comprarlo en un registrador. Recomendado: **Cloudflare**,
porque cobra el precio de coste, sin recargos, y Resend configura sus registros con un solo botón.
`app-emilly.vercel.app` no sirve, porque es de Vercel.

1. Entra en https://dash.cloudflare.com/sign-up y crea una cuenta gratuita (o inicia sesión).
2. Menú izquierdo **Domain Registration** → **Register Domains**.
3. Escribe el nombre que quieres (por ejemplo `aposto`) → **Search**. Aparece cada terminación
   (.app, .com, .eu…) con su precio por año. Si la que quieres no sale, Cloudflare no la vende:
   elige otra o cómprala en otro registrador (por ejemplo, Aruba para `.it`).
4. Pulsa **Purchase** en la que elijas → datos de contacto → tarjeta → **Complete purchase**.
   Deja activada la renovación automática.

## Paso 1 — Verificar el dominio en Resend

Resend recomienda usar un **subdominio** para el correo, por ejemplo `mail.TU-DOMINIO`. Así, la
reputación del correo no afecta al dominio principal.

1. Entra en https://resend.com → menú izquierdo **Domains** → **Add Domain**.
2. Escribe `mail.TU-DOMINIO`. En **Region** elige **Ireland (eu-west-1)**: los datos quedan en la UE.
3. Pulsa **Add**.
4. Si el dominio está en Cloudflare: pulsa **Sign in to Cloudflare** → **Authorize**. Resend crea
   los registros solo y el dominio queda verificado en pocos minutos.
5. Si está en otro registrador: copia cada registro (**MX** `send`, **TXT** SPF y **TXT**
   `resend._domainkey`) en el panel DNS del registrador y pulsa **Verify DNS Records**.
6. Espera a que el dominio diga **Verified** en verde.

## Paso 2 — Crear la clave para Supabase

1. Resend → menú izquierdo **API Keys** → **Create API Key**.
2. Name: `Supabase A Posto`. Permission: **Sending access**. Domain: tu dominio.
3. Pulsa **Add**. **Copia la clave** (empieza por `re_`). Solo se muestra una vez.
   No la pegues en el chat.

## Paso 3 — Conectar Resend en Supabase

1. https://supabase.com/dashboard → proyecto de A Posto.
2. Menú izquierdo **Authentication** → **Emails** → pestaña **SMTP Settings**.
3. Activa **Enable Custom SMTP** y rellena:
   - **Sender email:** `no-reply@mail.apostoapp.app`
   - **Sender name:** `A Posto`
   - **Host:** `smtp.resend.com`
   - **Port number:** `465`
   - **Minimum interval between emails:** `60` (segundos)
   - **Username:** `resend`
   - **Password:** la clave `re_…` del paso 2
4. Pulsa **Save changes**.

## Paso 4 — Límite de correos por hora

1. **Authentication** → **Rate Limits**.
2. **Rate limit for sending emails:** pon `30` por hora para empezar → **Save changes**.

## Paso 5 — Direcciones a las que vuelven los enlaces del correo

1. **Authentication** → **URL Configuration**.
2. **Site URL:** `https://app-emilly.vercel.app`
3. **Redirect URLs** → **Add URL**, una por una (si ya existen, no las repitas):
   - `https://app-emilly.vercel.app/**`
   - `https://app-emilly.vercel.app/app/**` (la app dentro de la web)
   - `com.aposto.app://auth/**` (la app instalada en el teléfono)
4. **Save**.

## Paso 6 — Correo en el idioma de la persona (opcional, recomendado)

**Authentication** → **Emails** → pestaña **Templates** → **Confirm signup**:

- **Subject:** `Confirma tu cuenta de A Posto · Conferma il tuo account · Confirm your account`
- **Body:** (copiar tal cual)

```html
<h2>A Posto</h2>
<p>Pulsa el botón para confirmar tu cuenta.<br>
Premi il pulsante per confermare il tuo account.<br>
Tap the button to confirm your account.</p>
<p><a href="{{ .ConfirmationURL }}" style="background:#A65D3D;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none">Confirmar · Conferma · Confirm</a></p>
<p style="color:#777">Si no has creado una cuenta, ignora este correo.</p>
```

Haz lo mismo en **Reset Password** cambiando el texto por «Crear una nueva contraseña».

## Paso 7 — Probar

1. Abre la app y crea una cuenta con un correo **que no sea del equipo** (por ejemplo, uno personal nuevo).
2. Debe llegar un correo de `no-reply@mail.apostoapp.app` en menos de un minuto (mira también en Spam).
3. Pulsa el botón: la cuenta queda confirmada y la app entra.
4. Si no llega: Resend → **Emails** muestra cada envío y su error; Supabase →
   **Logs** → **Auth** muestra si Supabase intentó enviarlo.

Cuando esto funcione, avisa: se revisa el flujo completo en la vista previa antes de publicar.
