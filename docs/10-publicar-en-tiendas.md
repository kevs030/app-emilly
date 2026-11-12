# 10. Publicar A posto en Google Play y en el App Store

La app es nativa (Capacitor): sus archivos van empaquetados dentro. No es un acceso directo web.
Todo se hace desde un Mac, en la carpeta `mobile/`. Identificador de la app: `com.aposto.app`.

## 0. Preparar el Mac (una sola vez)
1. Instala **Node.js** (versión LTS) desde nodejs.org.
2. Instala **Xcode** desde el App Store del Mac y ábrelo una vez para que termine de instalarse.
3. Instala **Android Studio** desde developer.android.com/studio y ábrelo una vez (instala el SDK de Android).
4. Descarga el proyecto e instala sus dependencias:

```bash
git clone https://github.com/kevs030/app-emilly.git
```

```bash
cd app-emilly/mobile && npm install
```

## 1. Android: archivo .AAB firmado para Google Play

### 1.1 Crear tu clave de firma (una sola vez)
```bash
cd android && keytool -genkeypair -v -keystore aposto-upload.jks -alias aposto -keyalg RSA -keysize 2048 -validity 10000
```
Te pide una contraseña y tus datos. **Guarda el archivo `aposto-upload.jks` y la contraseña en un lugar seguro** (gestor de contraseñas y una copia fuera del ordenador). No se sube a GitHub.

### 1.2 Decirle al proyecto dónde está la clave
```bash
cp keystore.properties.example keystore.properties
```
Abre `mobile/android/keystore.properties` y rellena `storePassword` y `keyPassword` con tu contraseña. Tampoco se sube a GitHub.

### 1.3 Generar el .AAB
Desde `mobile/`:
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

```bash
npm run android:bundle
```
Resultado: `mobile/android/app/build/outputs/bundle/release/app-release.aab`. Ese es el archivo que se sube a Google Play Console.

Si falla con «SDK location not found», abre una vez el proyecto con `npm run android` (Android Studio crea el archivo que falta) y repite.

### 1.4 Subirlo
1. play.google.com/console → **Crear aplicación** → nombre «A posto», tipo App, gratuita.
2. Acepta **Play App Signing** (Google guarda la clave final; la tuya es la «clave de subida»).
3. **Pruebas → Prueba interna → Crear versión** → sube el `.aab`.
4. Rellena la ficha: ver el checklist del punto 3.
5. Las cuentas personales nuevas deben pasar una **prueba cerrada con 12 testers durante 14 días** antes de poder publicar en producción.

### 1.5 En cada actualización
En `mobile/android/app/build.gradle` sube `versionCode` (1 → 2 → 3…) y, si quieres, `versionName`. Luego repite 1.3.

### 1.6 El APK para descarga directa desde la web
```bash
npm run android:apk
```
Resultado: `mobile/android/app/build/outputs/apk/release/app-release.apk`.

Importante: Google Play firma la app con **su** clave y este APK va firmado con **la tuya**. Android trata las dos como apps distintas: quien instale el APK de la web no podrá pasar a la versión de Google Play sin desinstalar antes. Para que sean compatibles, publica en la web el APK que firma Google: Play Console → **Explorador de app bundles** → **Descargas** → «APK universal firmado».

Huella para publicar junto al enlace:
```bash
shasum -a 256 android/app/build/outputs/apk/release/app-release.apk
```
Sube el APK a **GitHub → Releases** del repositorio y copia el enlace, la versión y la huella en `src/config/app.ts`.

## 2. iPhone: compilar, firmar y subir a App Store Connect

### Requisitos
- Mac con Xcode actualizado.
- Cuenta del **Apple Developer Program** (99 USD al año) con la misma Apple ID iniciada en Xcode (Xcode → Settings → Accounts).

### 2.1 Abrir el proyecto
Desde `mobile/`:
```bash
npm run ios
```
Compila la app y abre Xcode.

### 2.2 Firma
En Xcode: proyecto **App** → pestaña **Signing & Capabilities** → marca **Automatically manage signing** y elige tu **Team**. Xcode crea el certificado y el perfil.

### 2.3 Crear la ficha en App Store Connect
appstoreconnect.apple.com → **Apps** → **+** → Nueva app: plataforma iOS, nombre «A posto», idioma principal, Bundle ID `com.aposto.app`, SKU `aposto`.

### 2.4 Archivar y subir (esto genera y firma el .IPA)
1. Arriba en Xcode, elige el destino **Any iOS Device (arm64)**.
2. Menú **Product → Archive**.
3. Se abre el **Organizer** → **Distribute App** → **App Store Connect** → **Upload**. Xcode firma el `.ipa` y lo sube.
4. En 10–30 minutos aparece en App Store Connect → **TestFlight**. Instálala en tu iPhone con la app TestFlight para probarla.
5. Cuando esté lista: pestaña **App Store** → elige la compilación → **Enviar a revisión**.

Si necesitas el archivo `.ipa` suelto: en el paso 3 elige **Custom → App Store Connect → Export**.

### 2.5 En cada actualización
En Xcode → **General**: sube **Build** (1 → 2 → 3…) y, si cambia la versión pública, **Version**. Repite 2.4.

## 3. Checklist obligatorio antes de enviar a revisión

| Requisito | Estado | Dónde está |
|---|---|---|
| Política de privacidad dentro de la app | Hecho | `mobile/src/screens/Privacy.tsx` (enlace en bienvenida, registro y perfil) |
| URL pública de la política de privacidad | Hecho | `/privacidad` en la web. Es la URL que piden las dos tiendas |
| Borrar cuenta y datos desde la app | Hecho | Perfil → «Borrar mi cuenta y mis datos» (`delete_my_account` en la base de datos) |
| URL pública para pedir el borrado (Google) | Hecho | `/eliminar-cuenta` en la web |
| Clave de la IA fuera de la app | Hecho | Solo en Vercel (`ANTHROPIC_API_KEY`). La app llama a `/api/assistant` con el token de la persona |
| Aviso de que se habla con una IA | Hecho | Pantalla del asistente |
| Sin cifrado propio (declaración de exportación de Apple) | Hecho | `ITSAppUsesNonExemptEncryption = false` en `Info.plist` |
| Iconos y pantalla de inicio | Hecho | `npm run assets` los regenera desde `mobile/assets/` |
| Nombre del responsable y correo de contacto | **Falta** | Rellenar `legalName` y `contactEmail` en `src/config/app.ts` |
| Revisión legal de la política de privacidad | **Falta** | Es un borrador fiel al código; debe validarlo un profesional |
| Cuenta de prueba para los revisores | **Falta** | Crea una cuenta con correo y contraseña y ponla en «Notas para la revisión» (Apple la exige si hay login) |
| Capturas de pantalla | **Falta** | Apple: iPhone de 6,9" y 6,5". Google: mínimo 2 capturas de teléfono |
| Cuestionarios de privacidad de las tiendas | **Falta** | Ver 3.1 |
| Clasificación por edades | **Falta** | Cuestionario en cada tienda |
| Condiciones de uso | **Falta** | Recomendables antes de vender paquetes de preguntas |
| Verificar que el nombre «A posto» está libre | **Falta** | En las dos tiendas y como marca en Italia/UE |

### 3.1 Qué declarar en los cuestionarios de datos (según lo que hace el código)
- **Datos de contacto:** correo o teléfono. Finalidad: funcionamiento de la app. Vinculados a la persona.
- **Contenido del usuario:** trámites, pasos marcados, recordatorios; preguntas al asistente (se envían al proveedor de IA, no se guardan).
- **Identificadores:** identificador de usuario.
- **Datos de uso:** solo si la persona lo activa.
- **No** se recoge ubicación precisa, contactos, fotos ni datos financieros. **No** hay seguimiento publicitario ni se venden datos.
- Cuando se añadan compras, anuncios, documentos o notificaciones hay que actualizar estas respuestas.

### 3.2 Comprobar que la clave de la IA no está en la app
Desde `mobile/`, después de `npm run build`:
```bash
grep -rlE "sk-ant-[A-Za-z0-9_-]{20}|sb_secret_[A-Za-z0-9_-]{20}|eyJhbGciOi[A-Za-z0-9_-]{20}" dist
```
No debe devolver nada. La única clave dentro de la app es la «publishable» de Supabase, que es pública por diseño: la seguridad la imponen las reglas de la base de datos.

## 4. Página oficial de descarga
- Está en `/descargar` de la web (`src/app/descargar/page.tsx`), en italiano, español e inglés.
- Los enlaces se rellenan en `src/config/app.ts`: `googlePlayUrl`, `appStoreUrl`, `apkUrl`, `apkVersion`, `apkSha256`. Mientras estén vacíos, la página muestra «Próximamente».
- **Insignias oficiales.** Los botones actuales son genéricos. Google y Apple permiten usar sus insignias oficiales solo con sus archivos y normas:
  - Google Play: play.google.com/intl/es/badges
  - App Store: developer.apple.com/app-store/marketing/guidelines
  Descarga las insignias de esas páginas, guárdalas en `public/` y sustituye el componente `StoreButton`.

## 5. Motivos habituales de rechazo a evitar
- **Apple 4.2 (funcionalidad mínima):** la app debe ofrecer más que una web. Ya tiene cuenta, progreso, recordatorios y asistente; las notificaciones y los documentos lo refuerzan.
- **Apple 5.1.1:** pedir solo los datos necesarios y permitir borrar la cuenta desde la app. Hecho.
- **Información de trámites públicos (las dos tiendas):** decir claramente que la app no es del Gobierno y citar las fuentes oficiales. Está en la app y en la ficha debe repetirse.
- **Compras:** los paquetes de preguntas deben venderse con el sistema de compras de cada tienda.
- No se puede garantizar la aprobación: cada revisión la decide la tienda.
