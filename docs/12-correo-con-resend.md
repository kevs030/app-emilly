# Correo de verificación con Resend — pasos exactos

Objetivo: que **cualquier persona** que se registre reciba el correo para confirmar su cuenta
y el de «olvidé mi contraseña». Hoy Supabase usa su correo de pruebas, que solo envía a los
miembros del equipo y muy pocos correos por hora.

Nunca pegues claves en el chat ni en el repositorio: solo en las pantallas de Resend y Supabase.

---

## Paso 0 — Un dominio propio (obligatorio para Resend)

Resend solo envía a cualquier destinatario desde un dominio verificado. `app-emilly.vercel.app`
no sirve, porque es de Vercel y no se pueden añadir registros DNS.

1. Compra un dominio (de 10 a 20 € al año aprox.), por ejemplo en Cloudflare, Namecheap o Aruba.
   Ideas: `aposto.app`, `apostoapp.it`, `a-posto.it`. Comprueba que esté libre.
2. Guarda el acceso al panel del dominio: ahí añadirás los registros DNS del paso 1.

(Más adelante el mismo dominio puede apuntar a la web en Vercel.)

## Paso 1 — Verificar el dominio en Resend

1. Entra en https://resend.com → menú izquierdo **Domains** → botón **Add Domain**.
2. Escribe tu dominio. En **Region** elige **Ireland (eu-west-1)**: los datos se quedan en la UE.
3. Pulsa **Add**. Resend muestra 3 o 4 registros DNS (tipo **MX** y **TXT**, nombres como
   `send` y `resend._domainkey`).
4. En otra pestaña, abre el panel de tu dominio → **DNS** → añade **cada** registro copiando
   *Type*, *Name* y *Value* tal cual.
5. Vuelve a Resend → **Verify DNS Records**. Puede tardar de minutos a unas horas.
   Espera a que el dominio diga **Verified** en verde.

## Paso 2 — Crear la clave para Supabase

1. Resend → menú izquierdo **API Keys** → **Create API Key**.
2. Name: `Supabase A Posto`. Permission: **Sending access**. Domain: tu dominio.
3. Pulsa **Add**. **Copia la clave** (empieza por `re_`). Solo se muestra una vez.
   No la pegues en el chat.

## Paso 3 — Conectar Resend en Supabase

1. https://supabase.com/dashboard → proyecto de A Posto.
2. Menú izquierdo **Authentication** → **Emails** → pestaña **SMTP Settings**.
3. Activa **Enable Custom SMTP** y rellena:
   - **Sender email:** `no-reply@TU-DOMINIO`
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
2. Debe llegar un correo de `no-reply@TU-DOMINIO` en menos de un minuto (mira también en Spam).
3. Pulsa el botón: la cuenta queda confirmada y la app entra.
4. Si no llega: Resend → **Emails** muestra cada envío y su error; Supabase →
   **Logs** → **Auth** muestra si Supabase intentó enviarlo.

Cuando esto funcione, avisa: se revisa el flujo completo en la vista previa antes de publicar.
