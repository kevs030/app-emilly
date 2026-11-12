# 8. Pasos pendientes (solo los puede hacer el dueño de las cuentas)

Están ordenados por importancia. Cada uno desbloquea algo concreto.

## 1. Ejecutar el SQL en Supabase — desbloquea el panel personal, el panel admin, los 9 idiomas y los créditos del asistente
Cada vez que el archivo cambie hay que volver a ejecutarlo entero. No pasa nada por repetirlo.
1. Abre `supabase/ejecutar-en-supabase.sql` en GitHub y pulsa el botón de copiar (dos cuadraditos, arriba a la derecha).
2. Abre Supabase → **SQL Editor** → **New query**. Pega y pulsa **Run**.
3. Debe decir *Success*. Se puede ejecutar más de una vez sin problema.

Usa Chrome y no dejes que traduzca la página: el traductor rompe el panel de Supabase.

## 2. Clave del asistente en Vercel — desbloquea el asistente de IA
1. En https://console.anthropic.com → **API Keys** → **Create Key**. Copia la clave (empieza por `sk-ant-`). Hace falta saldo en **Billing**.
2. En Vercel → proyecto → **Settings** → **Environment Variables**.
3. Casilla **Key**: `ANTHROPIC_API_KEY`. Casilla **Value**: la clave. Deja marcados los tres entornos. Pulsa **Save**.
4. **Deployments** → **⋯** en el primero → **Redeploy**.

La clave es secreta: no se envía por chat ni se guarda en GitHub.

En la consola del proveedor, en **Billing → Limits**, fija un gasto máximo mensual desde el primer día.
El asistente funciona con créditos: ver `docs/09-creditos-del-asistente.md`.

## 3. Direcciones permitidas en Supabase — desbloquea los enlaces de los correos en la app
Supabase → **Authentication** → **URL Configuration** → **Redirect URLs** → añadir:
- `com.aposto.app://auth/**`
- `http://localhost:5173/**`

## 4. Correo propio (SMTP) — desbloquea el registro para cualquier persona
Sin esto, Supabase solo envía correos a los miembros del equipo.
1. Crea una cuenta en https://resend.com (plan gratuito) y una **API Key**.
2. Para enviar a cualquier destinatario hay que verificar un dominio propio en Resend (por ejemplo `aposto.it`).
3. Supabase → **Authentication** → **Emails** → **SMTP Settings** → activar *Custom SMTP*:
   - Host `smtp.resend.com`, puerto `465`, usuario `resend`, contraseña: la API Key.
   - Remitente: una dirección del dominio verificado.

## 5. SMS (acceso por teléfono) — desbloquea el registro con número de móvil
1. Crea una cuenta en https://www.twilio.com y verifica tu identidad. Añade saldo.
2. En Twilio → **Verify** → **Services** → **Create new**. Nombre: `A posto`. Copia el **Service SID** (empieza por `VA`).
3. En la portada de la consola de Twilio copia el **Account SID** (empieza por `AC`) y el **Auth Token**.
4. Supabase → **Authentication** → **Sign In / Providers** → **Phone** → activar:
   - *SMS provider*: **Twilio Verify**.
   - Pega Account SID, Auth Token y Service SID. Pulsa **Save**.
5. Supabase → **Authentication** → **Rate Limits**: deja un límite bajo de SMS por hora mientras pruebas.

La pestaña «Teléfono» de la app se activa sola cuando Supabase tiene el proveedor configurado.

Costes: cada SMS se paga. El precio depende del país de destino; consulta la tarifa vigente de Twilio para Italia antes de abrir el registro. La app ya limita reenvíos (60 s) e intentos (5 por código).

## 6. Protección contra abusos
Supabase → **Authentication** → **Attack Protection**: activar CAPTCHA (Cloudflare Turnstile) y la protección de contraseñas filtradas. En **Sign In / Providers → Email**, longitud mínima de contraseña: 10.

## 7. Cuentas para publicar la app
- Apple Developer Program (99 USD al año) y Google Play Console (25 USD una vez).
- Antes de publicar: comprobar que el nombre «A posto» está libre en las dos tiendas y que no es una marca registrada de otro en Italia (base de datos de la UIBM/EUIPO).
- El identificador de la app es `com.aposto.app`. Se puede cambiar hasta la primera subida.

## 8. Antes del lanzamiento público
- Dominio propio.
- Revisión legal: política de privacidad, condiciones de uso y evaluación de impacto (DPIA).
- Revisión por hablantes nativos de las traducciones al francés, árabe, rumano, albanés, ucraniano y bengalí.
- Vercel Pro si hay uso comercial.
