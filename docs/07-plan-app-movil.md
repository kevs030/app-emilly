# 7. Auditoría del proyecto y plan para la app móvil nativa (iOS y Android)

Fecha: 12/11/2026. Estado: **propuesta pendiente de aprobación**. No se ha cambiado nada de producción.

## A. Auditoría del proyecto actual

| Punto | Estado actual |
|---|---|
| Estructura | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4. Un solo proyecto en `src/`. |
| Rutas | 19 pantallas y 4 rutas de servidor (`/api/assistant`, `/api/points`, `/auth/confirm`, `/r/[id]`). |
| Componentes | 12 componentes de cliente (chat con voz, mapa, formularios). El resto son componentes de servidor. |
| Despliegue | Vercel, región Frankfurt, publicación automática desde la rama `main` de GitHub. |
| Backend | No hay un backend separado: son las rutas y acciones de servidor de Next.js. |
| Base de datos | Supabase (PostgreSQL, UE). Tablas: `profiles`, `forum_posts`, `forum_comments`, `forum_reports`. Seguridad por fila (RLS) probada con ataques. La migración `0002` (panel admin y anuncios) **todavía no está ejecutada**. |
| Autenticación | Enlace por correo (funciona). Pestaña de teléfono lista pero apagada: Supabase no tiene proveedor de SMS. No hay contraseña ni recuperación. |
| Asistente de IA | Programado, pero **no funciona en producción**: falta la clave `ANTHROPIC_API_KEY` en Vercel. Llama directamente a un proveedor; no hay capa independiente. |
| Memoria del usuario | Solo el perfil (país, ciudad, tipo de permiso, vencimiento, hijos) con consentimiento. No se guardan conversaciones, progreso ni tareas. |
| Documentos del usuario | No existe. Solo hay enlaces a formularios oficiales. |
| Notificaciones | No existe. |
| Analítica | No existe (solo la casilla de consentimiento). |
| Compatibilidad móvil | Web adaptada a móvil y PWA instalable. No hay proyecto nativo. |
| Sistema de diseño | Tokens de color en `globals.css` y clases comunes (`card`, `btn`, `input`, `chip`). Paleta verde azulada. |

### Qué se puede reutilizar
- **Base de datos y seguridad** (esquema, RLS, límites contra spam, borrado de cuenta): entera.
- **Contenido verificado** (`src/content/`: guías, ayudas, formularios, vídeos, contactos) y su revisión semanal: entero.
- **Lógica**: traducciones (`i18n.ts`), próximos pasos (`next-steps.ts`), consultas del mapa (`overpass.ts`), reglas del asistente.
- **Componentes de cliente**: chat con voz, mapa, formularios. Se adaptan con cambios pequeños.
- **Sistema de diseño**: se conserva la estructura; solo cambian los valores de los tokens.

### Qué no encaja con la app nativa, y por qué
1. **Las pantallas son componentes de servidor.** Leen cookies y la base de datos en el servidor de Vercel. Capacitor exige que la app vaya **empaquetada dentro del teléfono**, y ahí no hay servidor. Tampoco funcionan las acciones de servidor (`"use server"`) ni `proxy.ts`.
2. **La sesión va en cookies del servidor** (`@supabase/ssr`). En la app nativa la sesión debe guardarse en el almacenamiento seguro del teléfono.
3. **`/api/assistant` identifica al usuario por cookie.** Desde la app hay que identificarlo con un token en la cabecera y permitir el origen de Capacitor (CORS).

## B. Arquitectura propuesta

```
┌──────────────── App móvil (nueva) ────────────────┐      ┌──────── Web (la actual) ────────┐
│ React + TypeScript + Vite + Capacitor             │      │ Next.js en Vercel               │
│ Empaquetada en el teléfono (iOS y Android)        │      │ Página pública + panel admin    │
│ Push, cámara, archivos, enlaces profundos         │      │ + API central (/api/*)          │
└──────────────┬───────────────────┬────────────────┘      └───────────────┬─────────────────┘
               │ supabase-js (RLS) │ HTTPS + token                         │
               ▼                   ▼                                       ▼
        ┌──────────────── Supabase (UE) ────────────────┐         Proveedor de IA
        │ Auth · PostgreSQL · Storage privado · Edge Fn │      (detrás de una capa propia)
        └───────────────────────────────────────────────┘
```

**Decisión principal:** crear la app móvil como un proyecto **React + Vite + Capacitor** en la carpeta `mobile/`, y conservar el proyecto Next.js como web pública, panel de administración y API central.

Por qué no convertir el proyecto Next.js directamente:
- La exportación estática de Next.js no admite acciones de servidor, rutas dinámicas de servidor ni cookies. Habría que reescribir casi todas las pantallas igualmente, y además se perdería la web actual.
- Con dos frentes que comparten base de datos y contenido, la web sigue funcionando mientras se construye la app.

Código compartido: `src/content/` y la lógica común pasan a una carpeta `shared/` que usan los dos proyectos.

No se añaden microservicios. El backend es Supabase más las rutas de Vercel que ya existen.

| Necesidad | Solución |
|---|---|
| Registro por correo y contraseña, verificación y recuperación | Supabase Auth. Requiere un servicio de correo propio (por ejemplo, Resend). |
| Registro por teléfono con código SMS | Supabase Auth + proveedor de SMS (por ejemplo, Twilio). Caducidad y reintentos los limita Supabase; se añade CAPTCHA y límite por IP. |
| Unir correo y teléfono en una cuenta | `updateUser` de Supabase, solo tras verificar el segundo dato. Evita cuentas duplicadas. |
| Memoria personal | Tablas nuevas con RLS (ver C). Cada dato lleva su origen: «confirmado por el usuario» o «sugerido por la IA». |
| Documentos privados | Supabase Storage, bucket privado, una carpeta por usuario, enlaces firmados temporales. |
| Notificaciones push | `@capacitor/push-notifications` + Firebase (Android) y APNs (iOS). Envío desde una función programada. |
| Asistente | Capa propia `ai/` con una interfaz única; el proveedor se elige por configuración. |
| OCR y explicación de documentos | El modelo de IA lee la imagen. Lo extraído se muestra al usuario y **solo se guarda si lo confirma**. |

## C. Tablas nuevas (todas con RLS: cada persona solo ve lo suyo)

- `user_facts`: memoria de perfil y personalización. Campos clave: `source` (`user` / `ai_suggestion`), `confirmed`.
- `conversations`, `messages`: historial del asistente, con resumen por conversación.
- `procedures`, `procedure_steps`: trámites en curso y pasos. **El progreso se calcula contando pasos completados**, nunca lo inventa la IA.
- `reminders`: vencimientos y citas que define el usuario.
- `documents`: metadatos de archivos (el archivo va en Storage).
- `device_tokens`, `notification_prefs`: dispositivos, categorías y horario preferido.
- `sessions`, `events`: analítica. Tiempo activo con umbral de inactividad; sin teclas, sin contenido de documentos ni de conversaciones.
- `audit_log`: accesos y cambios sensibles.
- Funciones: exportar mis datos y borrar mis datos (la de borrado ya existe y se amplía).

## D. Diseño

Se sustituyen los tokens por la paleta cálida indicada (crema `#F7F2EA`, beige `#EDE2D3`, terracota `#C77B59`, marrón `#795548`, salvia `#91A58B`, verde suave `#DCE6D8`, texto `#34312E`).

Un ajuste necesario por accesibilidad: el texto blanco sobre terracota `#C77B59` no llega al contraste mínimo (queda cerca de 3,2:1 y hacen falta 4,5:1). Propuesta: botones principales en un terracota más oscuro (alrededor de `#A65D3D`) o en marrón `#795548`, y usar `#C77B59` para acentos, iconos y fondos.

## E. Fases

Cada fase termina con: qué cambió, archivos tocados, pruebas ejecutadas y cómo comprobarlo.

| Fase | Contenido | Lo que necesito de ti |
|---|---|---|
| **1. Base** | Carpeta `shared/`, proyecto `mobile/`, sistema de diseño cálido, registro por correo+contraseña y por teléfono, vínculo de cuentas, perfil gradual, API con token | Ejecutar SQL en Supabase; cuentas de correo (Resend) y SMS (Twilio) |
| **2. Experiencia personal** | Panel personal, trámites y pasos, progreso real, memoria, analítica con tiempo activo, «continuar donde lo dejaste» | Ejecutar SQL |
| **3. Asistente** | Capa de IA independiente, contexto del usuario, fuentes oficiales, separación entre dato oficial, dato del usuario e interpretación | Clave del proveedor de IA en Vercel |
| **4. Documentos y avisos** | Subida, cámara, carpetas, explicación, borradores, exportar PDF, recordatorios, push | Proyecto de Firebase |
| **5. App nativa** | Capacitor iOS y Android, iconos, pantalla de inicio, permisos, enlaces profundos, TestFlight y prueba interna | Cuentas de desarrollador y compilar en tu Mac |

## F. Lo que no puedo hacer desde aquí

- **Compilar y firmar la app de iOS**: exige un Mac con Xcode. Tú tienes Mac; yo preparo el proyecto y te doy los pasos.
- **Subir a las tiendas**: se hace con tus cuentas de Apple y Google.
- **Tocar los paneles de Supabase y Vercel**: mis accesos por token no funcionan en esta sesión. Los pasos de panel los haces tú con mis instrucciones.

## G. Costes y cuentas (orientativos, confirma el precio vigente)

| Concepto | Coste |
|---|---|
| Apple Developer Program | 99 USD al año |
| Google Play Console | 25 USD, pago único |
| SMS (Twilio u otro) | Por mensaje; a Italia, del orden de céntimos por SMS |
| Correo (Resend u otro) | Plan gratuito suficiente al empezar |
| Firebase (push) | Gratis |
| Vercel Pro | Unos 20 USD al mes, obligatorio si hay uso comercial |
| Supabase Pro | Unos 25 USD al mes, recomendable antes del lanzamiento (copias de seguridad) |
| Proveedor de IA | Según uso |

## H. Revisión de las tiendas (no se puede garantizar la aprobación)

**Apple**
- 4.2 (funcionalidad mínima): rechaza apps que son una web envuelta. Por eso van push, cámara, documentos y panel personal.
- 5.1.1: borrado de cuenta dentro de la app (ya existe) y permisos con explicación clara.
- 1.2 (contenido de usuarios, por el foro): hacen falta denuncia (existe), **bloqueo de usuarios** y condiciones de uso (faltan).
- Etiquetas de privacidad y, por tratar datos delicados, política de privacidad revisada.

**Google**
- Formulario de seguridad de datos y URL pública para pedir el borrado de la cuenta.
- Las cuentas personales nuevas deben hacer una prueba cerrada con **12 testers durante 14 días** antes de publicar.
- Apps con información de trámites públicos: indicar la fuente oficial y que no hay afiliación con el Gobierno (ya está en «Quiénes somos»).

## I. Privacidad

- La app tratará datos delicados (situación migratoria, documentos, familia). Con documentos y memoria personal, una **evaluación de impacto (DPIA) es casi seguro obligatoria** antes del lanzamiento.
- Tener cifrado y RLS no equivale a cumplir el RGPD: hace falta revisión legal.
- Las notificaciones push no mostrarán datos personales por defecto.
- Las conversaciones y documentos no se usan para entrenar modelos externos. Hay que confirmar las condiciones del proveedor de IA y firmar su acuerdo de tratamiento de datos.

## J. Pendientes heredados

- Migración `0002` sin ejecutar (panel admin y anuncios).
- Clave del asistente sin configurar en Vercel.
- El mapa nacional no está probado con datos reales.
- Trabajo a medias en la rama `wip/art-31`: guía del art. 31 terminada; sección de bancos y «lugares de ayuda» del foro sin hacer.

## K. Avance

### Etapa 1.1 (12/11/2026) — hecha
- Proyecto `mobile/` (React + TypeScript + Vite + Capacitor 8) con proyectos nativos `android/` e `ios/` generados.
- Sistema de diseño cálido (`mobile/src/styles.css`). Botones en terracota oscuro `#A65D3D` por contraste.
- Registro y acceso por correo + contraseña, verificación por correo, recuperación y nueva contraseña.
- Registro y acceso por teléfono con código SMS: selector de país, reenvío bloqueado 60 s, máximo 5 intentos por código. Queda apagado hasta activar un proveedor de SMS en Supabase.
- Vincular correo y teléfono a la misma cuenta desde el perfil.
- Sesión cifrada en el teléfono (Keychain / Keystore), enlaces profundos `com.emilly.app://auth/...`, botón atrás de Android, aviso sin conexión.
- Perfil gradual: solo se pide el nombre, y solo si falta.
- Guías y formularios oficiales, leídos del contenido compartido con la web.
- **Decisión:** el contenido compartido se queda en `src/content/` y la app lo importa con un alias, en vez de moverlo a `shared/`. Así no se toca la web en producción.
- **Aplazado a la fase 3:** la API con token para el asistente, porque el asistente aún no está en la app.

Pruebas: 16 comprobaciones automáticas en navegador con el servidor simulado (registro, contraseña débil, acceso erróneo, sesión que persiste, cierre de sesión, rutas privadas, recuperación, teléfono no válido, bloqueo tras 5 códigos). No se ha probado contra el servidor real ni en un teléfono.

### Fase 2 (12/11/2026) — hecha en la app; falta ejecutar el SQL en Supabase
- Migración `0003_experiencia_personal.sql`: trámites, pasos hechos, recordatorios, memoria (`user_facts`), historial (`activity`) y sesiones de uso. Todo con RLS y privilegios por columna.
- **Progreso real:** una fila por cada paso o documento marcado. El porcentaje es filas hechas entre total de la guía. Terminar un trámite exige todos los pasos marcados y la confirmación de la persona.
- **Panel personal:** saludo, «continuar donde lo dejaste» con el siguiente paso, trámites con barra de progreso, recordatorios, intereses elegidos por la persona, recomendaciones explicadas y actividad reciente.
- **Memoria:** cada dato lleva su origen. Lo que sugiera la IA (fase 3) queda marcado como no confirmado hasta que la persona lo acepte; la base de datos impide que la app lo dé por confirmado.
- **Analítica con consentimiento:** sesiones y tiempo activo. Un tramo solo cuenta si la app está visible y hubo interacción en los últimos 60 s. El servidor recorta valores mayores que el tiempo transcurrido. Retirar el consentimiento borra los datos.
- **Mis datos y privacidad:** ver memoria e historial, borrar, descargar todo en un archivo, activar o desactivar estadísticas.
- Si la migración no está ejecutada, la app muestra un aviso y las guías siguen funcionando.
- **No incluido todavía:** registro de auditoría (irá con los documentos, fase 4) y panel de métricas agregadas para el administrador.

Pruebas: 23 comprobaciones de base de datos en PostgreSQL local (acceso cruzado entre usuarios, falsear fechas, tiempos o datos «confirmados», límites, exportación) y 20 comprobaciones de la app en navegador con servidor simulado. Sin probar contra el servidor real ni en un teléfono.
