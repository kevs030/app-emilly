# 11. Auditoría de A Posto y plan de ejecución

Fecha: 16/11/2026. Evidencias: lectura del repositorio, recorrido automático de la web en producción (31 páginas, vista móvil) e inspección de la base de datos con el conector de Supabase (solo lectura).

## A. Qué es hoy el proyecto

| Capa | Tecnología | Estado |
|---|---|---|
| Web pública y panel admin | Next.js 16, React 19, TypeScript, Tailwind 4 | En producción en Vercel |
| App móvil | React + Vite + Capacitor 8 (`mobile/`), proyectos iOS y Android generados | Compila; **nunca se ha probado en un teléfono ni contra el servidor real** |
| Base de datos y cuentas | Supabase, PostgreSQL 17, región `eu-north-1` (Estocolmo, UE) | 13 tablas, todas con seguridad por fila |
| IA | API de Claude, modelo económico, llamada solo desde el servidor | Programada; **0 preguntas registradas en producción** |
| Contenido | `src/content/` compartido por web y app | 7 guías, 4 ayudas, 12 formularios oficiales, 7 vídeos |
| Pruebas automáticas y CI | — | **No existen** (0 archivos de prueba, 0 flujos de CI) |

Tamaño: unas 9.300 líneas de código propio. Uso real: 1 cuenta (la del administrador), 0 publicaciones, 0 trámites guardados.

## B. Hallazgos

### B1. Arquitectura: funciones repartidas entre dos interfaces
Es el problema principal. La web y la app son dos interfaces distintas y **ninguna lo tiene todo**:

| Función | Web | App móvil |
|---|---|---|
| Guías y formularios | Sí | Sí |
| Panel personal, progreso, recordatorios, memoria | **No** | Sí |
| Mapa, foro, vídeos, contactos, ayudas | Sí | **No** |
| Asistente con voz | Sí | Sin voz |
| Registro con contraseña y teléfono | **No** (solo enlace por correo) | Sí |
| 9 idiomas | **No** (3) | Sí |

Cada función nueva del plan habría que hacerla dos veces. **Decisión:** la app (`mobile/`) pasa a ser la interfaz única del producto personal, y se publica también como aplicación web. La web Next.js queda para lo público (guías indexables, descarga, privacidad), el panel de administración y la API. No se sustituye ninguna tecnología ni se borra nada: las pantallas de la web se van llevando a la app por fases.

### B2. Funciones a medias o sin verificar
| Punto | Situación |
|---|---|
| Asistente de IA | Nunca usado en producción. No está confirmado que la clave funcione |
| Mapa nacional | En la prueba se quedó en «Cargando puntos…». Los servidores de OpenStreetMap rechazan peticiones de centros de datos. Sin confirmar en un navegador real |
| Acceso por teléfono | Interfaz lista; Supabase sin proveedor de SMS |
| Correos de registro | El correo por defecto de Supabase solo envía al equipo. Nadie externo puede registrarse hoy |
| Compras y anuncios con recompensa | Solo el aviso «Próximamente» |
| Anuncios propios | Sistema hecho, 0 anuncios |
| Conversaciones del asistente | No se guardan; no hay historial |
| Notificaciones | No existen |
| Documentos del usuario, OCR, traductor | No existen (0 espacios de almacenamiento) |
| Simulador de ayudas | No existe (solo fichas informativas) |
| Buscador global | No existe |
| Calendario | Solo recordatorios con fecha en la app; sin editar ni posponer |
| Expediente | Faltan situación laboral, familiar, de residencia y datos económicos |

### B3. Seguridad (lo que hay que corregir)
| Gravedad | Hallazgo | Corrección |
|---|---|---|
| Media | 10 funciones internas de la base de datos (disparadores) se pueden invocar desde la API pública. PostgreSQL rechaza la llamada, así que hoy no hay fuga, pero no deben estar expuestas | Migración `0006`: retirar el permiso de ejecución |
| Media | Protección de contraseñas filtradas desactivada | Activarla en Supabase → Authentication |
| Media | Sin CAPTCHA en el registro: se pueden crear cuentas en masa para conseguir preguntas gratis | Activar Turnstile en Supabase |
| Baja | El límite de peticiones del servidor vive en memoria: en Vercel no se comparte entre instancias | Pasarlo a la base de datos |
| Baja | 6 claves externas sin índice | Migración `0006` |
| Info | El reembolso automático de créditos no funciona sin la clave de servidor en Vercel | Añadir `SUPABASE_SERVICE_ROLE_KEY` |

Lo que está bien: seguridad por fila en las 13 tablas, privilegios por columna, sin claves secretas en el código ni en el paquete de la app, cabeceras de seguridad y CSP en la web, validación de formularios en servidor, rutas privadas que redirigen, panel admin que responde 404 a quien no es admin.

### B4. Calidad y diseño
- **Sin pruebas automáticas ni CI.** Todo lo comprobado hasta ahora fue con guiones manuales que no viven en el repositorio.
- **Objetivos táctiles pequeños** en la web: los enlaces del menú superior miden menos de 32 px de alto en móvil.
- La web no tiene estados vacíos ni buscador; la app sí cuida estados de carga y error.
- Traducciones a 6 idiomas sin revisar por hablantes nativos. Guías solo en 3 idiomas.
- Datos legales incompletos: falta el nombre del responsable y el correo de contacto.

### B5. Rendimiento
Sin problemas a esta escala. La web genera todas las páginas en cada visita (lee el idioma de una cookie); cuando haya tráfico convendrá servir las guías como páginas estáticas por idioma.

## C. Plan priorizado

Se trabaja en la rama `desarrollo`. Nada pasa a producción ni a la base de datos real sin autorización.

| Orden | Bloque | Fases del encargo | Por qué va aquí |
|---|---|---|---|
| **0** | Corregir seguridad (migración 0006), pruebas automáticas y CI | 10, 13 | Base para no romper nada al crecer |
| **1** | Interfaz única: inicio con accesos reales, buscador global, ayudas y citas en la app | 1, 12 | Elimina la duplicación antes de añadir funciones |
| **2** | Expediente personal ampliado, con historial y privacidad | 2 | Lo necesitan el simulador y el asistente |
| **3** | Gestor de trámites: nombre oficial, organismo, guardar, lista de tareas, «consultar con IA» | 3 | Núcleo del producto |
| **4** | Asistente contextual: historial de conversaciones, memoria configurable, borrado | 4 | Requiere el expediente |
| **5** | Calendario y notificaciones locales (sin servidor); correo y push después | 6 | Refuerza el valor diario y la revisión de Apple |
| **6** | Simulador de ayudas con fuentes de INPS | 7 | Requiere el expediente económico |
| **7** | Documentos: cámara, PDF, almacenamiento privado, explicación y traducción con IA | 5 | Requiere almacenamiento y créditos; es lo más delicado en privacidad |
| **8** | Mapa con datos propios actualizados por un proceso programado; más categorías | 8 | Hoy depende de servidores que nos bloquean |
| **9** | Comunidad dentro de la app: búsqueda, respuestas, etiquetas, bloqueo de usuarios | 9 | Exigido por Apple si hay contenido de usuarios |
| **10** | Panel admin: usuarios, contenidos, estadísticas, errores | 11 | Crece con lo anterior |

### Lo que depende de terceros (no se puede programar sin ello)
| Necesidad | Bloquea |
|---|---|
| Servicio de correo propio y dominio | Registro de cualquier persona; recordatorios por correo |
| Proveedor de SMS | Acceso por teléfono; recordatorios por SMS |
| Cuentas de Apple y Google, compilar en un Mac | Publicación, compras, anuncios con recompensa |
| Proyecto de Firebase | Notificaciones push remotas |
| Nombre del responsable y correo de contacto | Política de privacidad y fichas de las tiendas |
| Revisión legal (DPIA, privacidad, condiciones) | Lanzamiento, sobre todo con documentos |

### Reglas que se mantienen
- No se inventan plazos, importes ni requisitos: cada dato lleva fuente y fecha.
- Ningún botón sin función real. Lo que no esté construido no aparece.
- El simulador de ayudas orienta; no promete derechos.
- El asistente no se presenta como abogado ni como institución.

## Registro de entregas

### Entrega 1 — Bloque 0 (seguridad y pruebas) y Fase 1 (navegación) · 16/11/2026 · rama `desarrollo`

**Archivos nuevos:** `supabase/migrations/0006_endurecimiento.sql`, `.github/workflows/ci.yml`, `mobile/vitest.config.ts`, `mobile/tests/logic.test.ts`, `mobile/tests/content.test.ts`, `mobile/tests/e2e/mock.cjs`, `mobile/tests/e2e/fase1.cjs`, `mobile/src/lib/progress.ts`, `mobile/src/lib/search.ts`, `mobile/src/screens/Search.tsx`, `mobile/src/screens/Benefits.tsx`, `mobile/src/screens/Appointments.tsx`.
**Archivos modificados:** `mobile/src/App.tsx` (3 rutas), `mobile/src/screens/Home.tsx` (buscador y accesos), `mobile/src/lib/personal.tsx` (usa la cuenta de progreso probada), `mobile/src/lib/strings.ts` y los 6 archivos de `locales/` (21 textos nuevos en 9 idiomas), `mobile/package.json`, `mobile/tsconfig.json`.

**Funciona (probado):** buscador global de trámites, ayudas y formularios (sin acentos, por nombre italiano o del idioma de la persona); pantalla de ayudas con fuente y fecha; pantalla de citas y fechas (añadir, marcar hecha, borrar); 7 accesos en el inicio, todos con destino real.
**Pendiente de la Fase 1:** «Mis documentos», «Traductor de documentos» y «Notificaciones» no aparecen porque todavía no existen (fases 5 y 6). «Oficinas cercanas» y «Comunidad» abren la web; pasarán dentro de la app en las fases 8 y 9.

**Pruebas ejecutadas:**
- Lógica (`npm test` en `mobile/`): 21 de 21 correctas — progreso, validación de acceso, buscador, integridad del contenido y de las 9 traducciones.
- Navegador con servidor simulado (`npm run test:e2e`): 19 de 19 correctas — cada acceso abre su pantalla, botones ≥ 44 px, sin desbordamiento, buscador, ayudas, alta y cierre de una cita, árabe de derecha a izquierda, sin errores.
- Migración 0006 en base de datos local: se aplica dos veces sin error, los disparadores siguen funcionando y las llamadas directas a funciones internas dan «permission denied».
- Tipos y compilación de la app y de la web: sin errores.

**No probado:** nada de esto contra el servidor real ni en un teléfono; la revisión automática de GitHub hasta ver su primer resultado.
**Riesgos:** las traducciones nuevas a francés, árabe, rumano, albanés, ucraniano y bengalí no las ha revisado un hablante nativo.
**No hecho a propósito:** la migración 0006 no está aplicada en producción y nada se ha publicado (requiere autorización).

### Entrega 2 — Fases 2 a 9 · 16/11/2026 · rama `desarrollo`

**Diagnóstico del asistente («no está activo»):** la base de datos está bien (la función de créditos existe y la cuenta tiene saldo). El servidor responde 503 antes de gastar nada porque el despliegue actual no ve la clave `ANTHROPIC_API_KEY`: o no está guardada con ese nombre exacto, o se guardó después del último despliegue (Vercel solo aplica las variables en despliegues nuevos). Se añade `/api/health`, que dice sin secretos si la clave está configurada.

**Base de datos (sin aplicar en producción):** `supabase/migrations/0007_documentos_y_conversaciones.sql` — tabla `documents`, almacén privado `documents` (8 MB, solo imágenes y PDF, cada persona solo su carpeta), tablas `ai_conversations` y `ai_messages`, y la descarga de datos ampliada.

**Servidor (web):** `src/lib/ai-server.ts` (piezas comunes de IA), `src/app/api/document/route.ts` (lector de documentos: OCR, explicación y traducción; 1 crédito), `src/app/api/health/route.ts`, `src/app/api/assistant/route.ts` (usa las piezas comunes), `src/app/api/points/route.ts` (accesible desde la app), `src/content/legal.ts` (política de privacidad: documentos, lector, avisos, ubicación, conversaciones guardadas).

**App — archivos nuevos:** `lib/ai.ts`, `lib/image.ts`, `lib/analysis.ts`, `lib/documents.ts`, `lib/notify.ts`, `lib/simulator.ts`, `lib/forum.ts`, `ui/DocReader.tsx`, `ui/Switch.tsx`, `ui/NotifySync.tsx`, `ui/MonthCalendar.tsx`, `screens/Documents.tsx`, `screens/Scan.tsx`, `screens/Notifications.tsx`, `screens/MyFile.tsx`, `screens/ChatHistory.tsx`, `screens/Simulator.tsx`, `screens/OfficesMap.tsx`, `screens/Community.tsx`.
**App — modificados:** `App.tsx`, `screens/Home.tsx` (12 accesos), `screens/Assistant.tsx` (historial), `screens/Appointments.tsx` (calendario), `screens/Benefits.tsx`, `screens/Profile.tsx` (borrar cuenta retira antes los archivos), `auth/AuthProvider.tsx`, textos (148 nuevos × 9 idiomas), permisos de Android e iOS (ubicación, cámara, avisos), `index.html` (política de contenido para el mapa).

| Fase | Qué funciona | Pendiente |
|---|---|---|
| 2 Expediente | Situación opcional (país, ciudad, permiso, caducidad, hijos), resumen, consentimiento para usarla en el asistente | — |
| 3 Trámites | Ya existía: empezar, pasos, documentos, terminar, recordatorios | Notas por trámite |
| 4 Asistente | Conversaciones guardadas, historial, abrir y borrar | Que la clave esté activa en Vercel |
| 5 Documentos y traductor | Guardar foto/PDF en almacén privado, ver con enlace de 1 minuto, borrar; leer, explicar y traducir con confirmación previa | PDF no se leen con IA (solo fotos) |
| 6 Calendario y avisos | Calendario mensual, centro de avisos, avisos locales en el teléfono con consentimiento y sin contenido por defecto | Avisos «push» desde servidor (no hacen falta para las citas) |
| 7 Simulador | 7 preguntas, resultado orientativo basado solo en requisitos publicados; nada se guarda | Más ayudas cuando se añadan al contenido |
| 8 Mapa | Dentro de la app: categorías, buscar ciudad, cerca de mí, las 6 más cercanas, cómo llegar | Verlo con datos reales (ver «No probado») |
| 9 Comunidad | Dentro de la app: leer, preguntar, responder, denunciar, borrar lo propio | Tema «lugares de ayuda» |
| 10 Seguridad | Pruebas de ataque de las tablas nuevas; sin claves en la app | Aplicar 0006 y 0007; activar protección de contraseñas filtradas y CAPTCHA en Supabase |
| 11 Panel admin | Sin cambios (el de la web sigue funcionando) | Estadísticas de documentos e IA |

**Pruebas ejecutadas:**
- Lógica: 34 de 34 (se añaden simulador, plan de avisos y lectura de documentos).
- Navegador con servidor simulado: 24 de 24 (fase 1) y 36 de 36 (fases 2–9).
- Migración 0007 en base de datos local: se aplica dos veces sin error; 8 intentos de ataque rechazados (carpeta ajena, cuenta ajena, tipo de archivo, conversación ajena, función interna, anónimo) y la descarga de datos incluye lo nuevo.
- Web: tipos, estilo y compilación correctos. Búsqueda de claves secretas en la app compilada: ninguna.

**No probado (no se puede desde aquí):** el lector de documentos y el asistente contra la IA real (falta la clave activa); el almacén de archivos real de Supabase; avisos, cámara y ubicación en un teléfono; el mapa con datos reales de OpenStreetMap.
**Riesgos:** la calidad de lectura de fotos malas es desconocida hasta probar con cartas reales; las 148 traducciones nuevas a 6 idiomas necesitan revisión nativa; guardar documentos de identidad aumenta la responsabilidad legal (conviene la revisión de un profesional de protección de datos antes de abrir al público).
