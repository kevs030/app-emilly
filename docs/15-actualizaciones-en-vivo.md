# Actualizaciones en vivo de la app

La app de Android se actualiza sola, sin descargar un APK nuevo, para casi todos los cambios
(pantallas, textos, guías, traducciones, imágenes, arreglos).

## Cómo funciona
1. Cada vez que se publica la web (`npm run build` en Vercel), `scripts/build-app-update.mjs` compila la app
   y deja en la web:
   - `/app-update/bundle-<huella>.zip`: los archivos de la app.
   - `/app-update/latest.json`: la huella del último paquete, su comprobación SHA-256 y la versión nativa mínima.
2. La app, al abrirse o al volver a ella (como mucho cada 30 minutos), lee `latest.json`.
   Si la huella es distinta de la suya, descarga el paquete en segundo plano, comprueba el SHA-256
   y lo aplica **la próxima vez que se abra**.
3. Si un paquete nuevo fallara al arrancar, la app vuelve sola a la versión anterior.

Todo se aloja en nuestra web. No se usan servidores de terceros ni se envían estadísticas
(complemento `@capgo/capacitor-updater` en modo manual, con `statsUrl` vacío).

## Cuándo SÍ hace falta un APK nuevo
Permisos nuevos, complementos nativos (por ejemplo AdMob), el icono o el nombre de la app. Entonces:
1. Sube `versionCode` y `versionName` en `mobile/android/app/build.gradle`.
2. Copia esos dos valores en `mobile/live-update.json` y pon `minNative` igual al `versionCode` nuevo.
3. Compila: `node scripts/build-app-update.mjs`, luego `cd mobile && npx cap sync android` y `./gradlew assembleRelease`
   firmando con la llave de A Posto. Copia el APK a `public/a-posto.apk` y actualiza la huella en `src/config/app.ts`.
4. Publica. Las apps antiguas dejan de recibir paquetes y muestran «Hay una versión nueva de A Posto · Descargar».

## Importante
- La huella se calcula sobre las FUENTES de la app (lista `SOURCES` en el script), no sobre el resultado compilado,
  para que sea la misma en Vercel y en cualquier ordenador. Si la app empieza a usar otro archivo compartido de `src/`,
  añádelo a `SOURCES`.
- Las personas con la versión 1.0.1 o anterior deben instalar una vez la 1.1.0: es la primera con actualizaciones en vivo.
