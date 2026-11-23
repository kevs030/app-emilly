# 16. Correos con código de 6 cifras (registro y contraseña)

La app ya acepta el código: en «Revisa tu correo» (registro) y en «¿Olvidaste tu contraseña?».
Para que el correo **incluya** el código hay que cambiar dos plantillas en Supabase (5 minutos).

## 1. Longitud del código
Supabase → **Authentication** → **Sign In / Providers** → **Email** → **Email OTP Length**: `6` → **Save**.

## 2. Plantilla «Confirm signup»
Supabase → **Authentication** → **Emails** → pestaña **Templates** → **Confirm signup**.
- Subject: `Tu código de A Posto: {{ .Token }}`
- Body (pégalo entero):
```html
<h2>Confirma tu correo en A Posto</h2>
<p>Tu código es:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Escríbelo en la app, en la pantalla «Revisa tu correo». Caduca en 1 hora.</p>
<p style="background:#FBF1EC;border-radius:8px;padding:10px;font-size:14px"><strong>🔒 No compartas este código con nadie.</strong> A Posto nunca te lo pedirá: ni por teléfono, ni por WhatsApp, ni por correo.</p>
<p>También puedes pulsar aquí: <a href="{{ .ConfirmationURL }}">Confirmar mi correo</a></p>
<p style="color:#746A60;font-size:13px">Si no creaste una cuenta en A Posto, ignora este correo. ¿Dudas? Escríbenos a support.aposto@gmail.com</p>
```
Pulsa **Save changes**.

## 3. Plantilla «Reset password»
Misma pestaña → **Reset password**.
- Subject: `Cambia tu contraseña de A Posto: {{ .Token }}`
- Body:
```html
<h2>Cambiar tu contraseña de A Posto</h2>
<p>Tu código es:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p style="background:#FBF1EC;border-radius:8px;padding:10px;font-size:14px"><strong>🔒 No compartas este código con nadie.</strong> A Posto nunca te lo pedirá: ni por teléfono, ni por WhatsApp, ni por correo.</p>
<p>Escríbelo en la app. O pulsa este botón, que abre una página de la web (funciona en Safari y Chrome):</p>
<p><a href="{{ .ConfirmationURL }}">Crear una contraseña nueva</a></p>
<p style="color:#746A60;font-size:13px">Si no lo pediste tú, ignora este correo: tu contraseña no cambia. ¿Dudas? Escríbenos a support.aposto@gmail.com</p>
```
Pulsa **Save changes**.

## 4. Direcciones permitidas
Supabase → **Authentication** → **URL Configuration** → **Redirect URLs** → **Add URL**:
- `https://www.apostoapp.app/**`
- `https://apostoapp.app/**`

## Por qué
- El enlace de «cambiar contraseña» antes intentaba abrir la app con una dirección interna (`com.aposto.app://`).
  En el iPhone (Safari) no se abría y en Chrome se quedaba en negro. Ahora lleva a
  `apostoapp.app/nueva-contrasena`, que funciona en cualquier navegador.
- El código evita los problemas de los enlaces: los que caducan, los que Gmail abre antes que la persona
  y los que se abren en un navegador distinto.
