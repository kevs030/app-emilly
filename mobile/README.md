# Emilly — app móvil (iOS y Android)

App nativa hecha con React + TypeScript + Vite + Capacitor. Los archivos van **empaquetados dentro de la app**; no carga la web remota. Comparte base de datos (Supabase), reglas de seguridad y contenido verificado con la web (`../src/content`).

## Probar en el ordenador
```bash
cd mobile
npm install
npm run dev
```
Abre la dirección que aparece (normalmente http://localhost:5173) y reduce la ventana al tamaño de un móvil.

## Abrir en el iPhone (necesita Mac con Xcode)
```bash
cd mobile
npm run ios
```
Se abre Xcode. Elige tu iPhone o un simulador y pulsa ▶. La primera vez, en *Signing & Capabilities*, elige tu equipo de Apple.

## Abrir en Android (necesita Android Studio)
```bash
cd mobile
npm run android
```
Se abre Android Studio. Elige un dispositivo y pulsa ▶.

## Después de cambiar código
```bash
npm run sync
```
Compila y copia los archivos nuevos a los proyectos nativos.

## Configuración pendiente en Supabase (panel)
1. **Authentication → URL Configuration → Redirect URLs:** añadir `com.emilly.app://auth/**` (enlaces de los correos hacia la app) y `http://localhost:5173/**` (pruebas).
2. **Authentication → Emails → SMTP:** configurar un servicio de correo propio (por ejemplo, Resend). Sin él, Supabase solo envía correos a los miembros del equipo.
3. **Authentication → Sign In / Providers → Phone:** activar con un proveedor de SMS (por ejemplo, Twilio). Hasta entonces, la pestaña «Teléfono» muestra un aviso.
4. **Authentication → Attack Protection:** activar CAPTCHA y la protección de contraseñas filtradas.
5. **Authentication → Sign In / Providers → Email:** longitud mínima de contraseña 10.

## Estructura
```
src/lib/       cliente de Supabase (sesión cifrada en el teléfono), validación, textos, idioma
src/auth/      sesión, perfil, enlaces profundos y ciclo de vida de la app
src/ui/        piezas del sistema de diseño
src/screens/   pantallas
src/styles.css tokens de diseño (paleta cálida) y clases comunes
android/ ios/  proyectos nativos generados por Capacitor
```

## Identificador de la app
`com.emilly.app` (en `capacitor.config.ts`). Se puede cambiar hasta la primera subida a las tiendas; después, no.
