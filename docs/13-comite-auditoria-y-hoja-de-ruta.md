# A Posto — Auditoría del comité y hoja de ruta (17-11-2026)

Cuatro perfiles revisan la app **sobre el código real** (rama de desarrollo) y la normativa vigente:

| Perfil | Enfoque |
|---|---|
| **A. Arquitectura, ligereza y privacidad** | teléfonos baratos, pocos datos móviles, GDPR, cero rastro |
| **B. Accesibilidad y offline-first** | sin conexión, idiomas, baja alfabetización, glosario burocrático |
| **C. Micro-aprendizaje y retención** | pasos cortos, checklists, recordatorios que bajan la ansiedad |
| **D. Datos cívicos y normativa** | fuentes oficiales, datos fechados, cero desinformación |

**Stack actual:** web Next.js en Vercel + app React/Vite empaquetada con Capacitor 8 (Android/iOS) y servida también en `/app` + Supabase (Postgres, Auth, Storage) + asistente de IA vía API propia. **Recomendación: mantener el stack.** Rehacerlo en Flutter o React Native no resuelve ninguno de los riesgos de abajo y costaría meses; los problemas son de *arquitectura de datos y de producto*, no de framework.

---

## FASE 1 — Auditoría y diagnóstico

### Riesgos críticos (resolver antes de abrir al público)

| # | Riesgo | Evidencia en el código | Perfil |
|---|---|---|---|
| 1 | **La nube guarda quién no tiene permiso.** `profiles.permit_type = "nessuno"` queda junto al correo o teléfono en Supabase. Una filtración, un acceso indebido o un requerimiento convertiría la base en una lista de personas en situación irregular. | `mobile/src/screens/MyFile.tsx`, `Start.tsx` → `saveProfile({ permit_type })`; `src/app/api/assistant/route.ts` | A, D |
| 2 | **Registro obligatorio para leer guías.** Tras el último cambio, la portada exige cuenta para todo. Quien tiene miedo no deja correo ni teléfono, y pierde justo la información que más necesita (salud con STP, derechos). Contradice el objetivo «sin miedo». | `mobile/src/App.tsx` (`Private` envuelve guías, ayudas y mapa) | A, B |
| 3 | **Documentos de identidad en la nube sin cifrado de extremo a extremo.** Se suben tal cual al bucket `documents`; solo están cifrados en reposo por el proveedor. | `mobile/src/lib/documents.ts` | A |
| 4 | **Falta la evaluación de impacto (DPIA, art. 35 GDPR).** Hay personas vulnerables, datos que revelan la situación migratoria, IA y documentos de identidad: es casi seguro que es obligatoria. | `docs/08-pasos-pendientes.md` la marca como pendiente | A, D |
| 5 | **Línea con el asesoramiento legal.** La ley forense (L. 247/2012, art. 2 c. 6) atribuye a los abogados la consulta legal «continua, sistemática y organizada»; su alcance se discute. Una guía general es información; un asistente que dice «en tu caso debes…» se acerca a la consulta. | Avisos ya presentes (`disclaimer`, `docDisclaimer`); el asistente recibe el perfil si hay consentimiento | D |

### Riesgos técnicos

| Riesgo | Dato medido | Impacto en la calle |
|---|---|---|
| **Paquete inicial pesado** | Un solo JS de **1,06 MB (322 KB comprimido)**. Leaflet (mapa) va dentro aunque no se abra el mapa. | En un Android de 100 € con 3G, 5–10 s de pantalla en blanco la primera vez. |
| **La app web no funciona sin conexión** | `public/sw.js` solo guarda `/_next/static/`, iconos y logo. **No guarda `/app/assets/`**: la app instalada desde la web no abre sin red. | Sin datos en el metro o en la cola de la Questura = no hay app. |
| **Los datos personales no se guardan en el teléfono** | Trámites, recordatorios y expediente se leen de Supabase en cada apertura. | Sin conexión se ve «no disponible» justo cuando hace falta la lista de documentos. |
| **El contenido legal va dentro del código** | `src/content/guides.ts` se compila en la app. | En la app nativa, una cifra cambiada exige publicar una versión nueva en las tiendas. |

### Riesgos de experiencia de usuario

- **Idiomas reales vs. prometidos:** la interfaz está en 9 idiomas, pero **las guías solo en español, italiano e inglés**. Quien usa árabe o bengalí lee las guías en inglés. Faltan además idiomas de comunidades grandes en Italia (chino, urdu/panyabí, tagalo, wolof, tigriña). Las 6 traducciones automáticas no las ha revisado ninguna persona nativa.
- **Texto denso:** las guías son correctas pero largas. Para baja alfabetización faltan audio, iconos por paso y frases cortas.
- **Vocabulario:** *Questura, Prefettura, Sportello Unico, marca da bollo, cedolino, ISEE* aparecen sin un glosario que se pueda tocar.

### Lo que ya está bien (no tocar)

- Aviso de IA conforme al **AI Act art. 50** (en vigor desde el 2-8-2026): «Hablas con una inteligencia artificial».
- Perfil compartido con la IA **solo con consentimiento** (`consent_personalization`).
- Analítica **opcional**: mide tiempo activo, nunca contenido.
- Sesión cifrada en el teléfono (Keychain/Keystore); huella sin guardar contraseñas.
- Cada guía tiene fuentes y `lastVerified`, y existe `npm run check:freshness`.
- Edad mínima de 14 años, acorde con el consentimiento digital en Italia.

---

## FASE 2 — Información reciente verificada

Archivo listo para la base de datos: **`docs/datos/normativa-italia-2026-11.json`**
(7 fichas estáticas + 15 datos dinámicos, cada uno con fuente, fecha y nivel de confianza).

### Novedades que la app debe reflejar

| Tema | Dato | Confianza | ¿Está en la app? |
|---|---|---|---|
| Decreto Flussi 2026 | Click days ya pasados: 12-1 (agrícola), 9-2 (turismo), 16-2 (no estacional), 18-2 (asistencia familiar). Envíos hasta el **31-12-2026**. | Oficial | Parcial: la guía no da las fechas → **añadir**. |
| Decreto Flussi 2027 | Fechas **no publicadas**. Revisar cada semana. | Oficial | → mostrar «pendiente» |
| DL 146/2025 | Plazo del *nulla osta* de reagrupación: **150 días** (antes 90). Asistencia familiar fuera de cupo: 10.000/año 2026-2028. | Oficial | No → **guía nueva** |
| Conto di base | **Derecho** a cuenta básica con residencia legal, también con el recibo del permiso; **gratis con ISEE < 11.600 €**. La Banca d'Italia ordenó quitar obstáculos (5-8-2026; adaptación hasta 30-11-2026). | Oficial | No → **guía nueva, alto impacto** |
| Costes del permiso | 16 € timbre + 30,46 € recibo + 40/50/100 € contribución + 30 € envío ≈ **116–176 €** | Secundaria | Sí, coincide |
| STP / ENI | 6 meses renovable; **ir a la sanidad no genera denuncia** (art. 35 TUI). | Oficial | Sí |
| Ciudadanía | L. 74/2025 limita el *ius sanguinis*; naturalización: 10 años + B1 + ingresos. | Secundaria | Sí; confirmar umbral |
| Patronati | Trámites de permiso normalmente gratis (L. 152/2001). | Secundaria | Parcial |

**Lagunas honestas:** no encontré una fuente oficial sobre la gratuidad de los CAF para el ISEE, ni el texto final de la ley de conversión del DL 146/2025 sobre vivienda e ingresos para la reagrupación. Quedan marcados como `todo` en el JSON.

### Modelo de datos propuesto (Supabase)

```sql
create table facts (
  id text primary key,                 -- 'fee.marca_da_bollo_permesso'
  kind text not null,                  -- static | fee | date | quota | threshold | deadline
  scope text not null default 'national', -- national | region:03 | comune:F205
  value jsonb,                         -- número, objeto o lista
  body jsonb,                          -- {es, it, en, ...} para los estáticos
  status text default 'active',        -- active | past | pending_official
  confidence text not null,            -- official | secondary
  sources jsonb not null,              -- [{title, url, official}]
  last_verified date not null,
  review_every_days int not null,
  version int not null default 1,
  reviewed_by text                     -- quién lo comprobó (dos personas para 'official')
);
-- Lectura pública (sin datos personales). Escritura solo para el rol editor.
```

La app descarga un **paquete versionado** (`facts@<version>.json`, unos pocos KB comprimido) y lo guarda en el teléfono; las guías leen las cifras de ahí en lugar de tenerlas escritas en el código.

---

## FASE 3 — Top 5 mejoras de alto impacto

### 1. Modo sin cuenta + datos sensibles solo en el teléfono

**Qué es y por qué importa.** Guías, ayudas, mapa, glosario y STP se usan **sin registrarse**. La cuenta queda para lo que la necesita (sincronizar entre teléfonos, comunidad, asistente con créditos). El tipo de permiso, la caducidad, los hijos y los documentos se guardan **por defecto solo en el teléfono**. Así una persona sin papeles puede usar A Posto sin dejar rastro en ningún servidor.

**Arquitectura.**
- Rutas públicas en `App.tsx`: `/guides`, `/benefits`, `/map`, `/search`, `/glossary`. La portada pasa a decir «Entrar» o «Seguir sin cuenta».
- Almacén local cifrado: `@capacitor-community/sqlite` con SQLCipher en el móvil e IndexedDB en la web. La clave va en Keystore/Keychain (ya existe `@aparajita/capacitor-secure-storage`).
- Migración: copiar `permit_type`, `permit_expiry` y `has_children` al dispositivo, dejarlos en `null` en `profiles` y quitar `"nessuno"` del servidor. Nunca enviar al servidor nada que revele la irregularidad.
- Sincronización opcional y **cifrada de extremo a extremo** (WebCrypto AES-GCM; el servidor solo ve bloques cifrados).
- Documentos: cifrar en el teléfono antes de subirlos, o no subirlos (modo «solo en este teléfono» por defecto).
- Registro mínimo: Supabase Auth anónimo para lo que necesite un identificador, sin correo.
- **Antes de abrir al público:** DPIA firmada y contrato de tratamiento con el proveedor de IA (sin retención de datos; región UE o cláusulas tipo).

**Consejo del ingeniero (A, estilo Koum/Durov).** «El dato más seguro es el que nunca recogiste. Si una base de datos puede responder a la pregunta "¿quién no tiene papeles?", el problema ya es de diseño, no de seguridad. Haz que el servidor *no pueda* saberlo.»

### 2. Offline-first real y app ligera

**Qué es y por qué importa.** La app abre en menos de 2 s en un Android barato y funciona entera sin conexión: guías, checklists, recordatorios, glosario y direcciones de oficinas de *tu* ciudad. La red se usa solo para el asistente, la comunidad y las actualizaciones.

**Arquitectura.**
- **Dividir el paquete:** `React.lazy` para el mapa (Leaflet), el escáner, el simulador y la comunidad. Objetivo: **< 150 KB comprimido** al arrancar (hoy 322 KB). Vigilarlo en CI con `size-limit`.
- **Service Worker para `/app/`:** precache del «app shell» con Workbox (`vite-plugin-pwa`, `injectManifest`), `CacheFirst` para `/app/assets/*` (nombres con hash) y `NetworkFirst` con respaldo para el paquete de contenidos. Nunca guardar en caché `/api/` ni datos de sesión (regla que ya existe).
- **Paquetes de contenido** por idioma y región (`content-es-national@v42.json.br`, `content-es-comune-F205@v7.json.br`): descarga diferencial con `ETag`/versión y guardado en SQLite/IndexedDB. Así las cifras cambian **sin publicar en las tiendas**.
- **Mapas:** sin teselas en línea por defecto. Lista de oficinas con dirección y botón «Abrir en Maps». Mapa solo bajo demanda.
- **Ahorro de datos:** imágenes WebP/AVIF ≤ 60 KB, fuentes del sistema y un interruptor «Modo ahorro» que no descarga imágenes.
- **Medir en un aparato real:** Lighthouse con CPU ×4 y «Slow 4G» en CI. Objetivo: Time to Interactive < 3,5 s.

**Consejo del ingeniero (B, estilo Integreat).** «Diseña para el peor momento: batería al 5 %, sin datos y delante del funcionario. Si la lista de documentos no está en el teléfono *antes* de llegar a la ventanilla, no sirve.»

### 3. Motor de vencimientos + checklists micro-paso

**Qué es y por qué importa.** El mayor miedo es «se me pasa la fecha». La app calcula las fechas clave a partir de lo que guardó la persona (vencimiento del permiso, cita en la Questura, *cedolino*). Avisa con antelación, sin conexión, y convierte cada trámite en pasos de 1 minuto con un checklist de documentos que se va completando.

**Arquitectura.**
- Reglas declarativas en el paquete de datos (no en el código). Ejemplo: `{ "trigger": "permit_expiry", "offsets_days": [-90, -60, -30, -7], "action": "guide:permesso-di-soggiorno" }`. Ya existe `lib/plan.ts`, que se amplía.
- Avisos locales con `@capacitor/local-notifications` (ya instalado), programados en el teléfono. El servidor no sabe cuándo vence tu permiso.
- Checklist por guía con estado `falta | lo tengo | entregado` y foto opcional guardada solo en el teléfono. Al terminar, la tarjeta «Muéstralo en la ventanilla» lista lo que llevas en italiano.
- Micro-lecciones: cada paso con un título de 6–8 palabras, 1 icono, 1 frase y «¿Por qué?» desplegable. Progreso visible (ya existe la barra), **sin rachas ni presión**: celebrar los logros, no castigar los días sin uso.
- Seguimiento del recibo: guardar el número del *cedolino* y recordar consultar el estado en el portal de la Polizia di Stato cada X días.

**Consejo del ingeniero (C, estilo von Ahn / N'zi).** «La gamificación aquí no es para enganchar, es para *quitar ansiedad*. Cada pantalla debe terminar con "ya sabes cuál es el siguiente paso y cuándo". Mide el éxito por trámites completados, no por minutos dentro de la app.»

### 4. Fábrica de datos verificados con alertas de cambios

**Qué es y por qué importa.** Las normas cambian, como muestra el DL 146/2025, y los fraudes del Decreto Flussi viven de la desinformación. Cada cifra que ve la persona lleva su fuente oficial, la fecha en que se comprobó y un aviso si está pendiente de confirmar.

**Arquitectura.**
- Tabla `facts` (modelo de la Fase 2) con versiones, `confidence` y `reviewed_by`. **Doble revisión** para pasar algo a `official`.
- Vigilancia automática: un trabajo semanal (GitHub Actions o Supabase cron) descarga las páginas oficiales de las fuentes (Ministero dell'Interno, Lavoro, Polizia di Stato, Banca d'Italia, Gazzetta Ufficiale), guarda un *hash* del texto y abre una incidencia si cambia. Amplía el `check:freshness` actual, que hoy solo mira la fecha y si el enlace responde.
- La IA ayuda pero no decide: resume el cambio y propone el JSON; una persona aprueba.
- En la interfaz, junto a cada cifra: «Verificado el 17-11-2026 · Fuente: Banca d'Italia» y una etiqueta «Pendiente de confirmar» para `secondary`.
- Capa regional: `scope = comune:F205` para lo que cambia por ciudad (horarios del Centro ISI, Questura con cita obligatoria, Comuni que rellenan el kit).
- Alianzas de datos: ASGI, Patronati, Integrazione Migranti (portal del Ministerio). Pedir permiso para enlazar o reutilizar.

**Consejo del ingeniero (D, estilo Mygrants / Gionfriddo).** «Una cifra sin fecha es un rumor. Publica menos, pero que cada dato tenga fuente oficial y fecha, y di claramente lo que *no* sabes. Con el decreto flussi, la mejor función antifraude es repetir: "la solicitud la hace el empleador; nadie puede venderte un cupo".»

### 5. Glosario burocrático + modo «Muéstralo en la ventanilla»

**Qué es y por qué importa.** Cada término italiano (*Questura, Prefettura, marca da bollo, cedolino, nulla osta, ISEE, residenza, STP*) se puede tocar en cualquier texto para ver una explicación de 1 línea en tu idioma, su pronunciación y un icono. El modo ventanilla muestra en grande una frase en italiano para enseñar al funcionario, con la traducción debajo («Vengo a ritirare il permesso di soggiorno. Ecco la ricevuta.»).

**Arquitectura.**
- `glossary@vN.json` dentro del paquete offline: `{ term, ipa, icon, short: {es, ar, bn…}, long, related_guides }`.
- Detección automática en el texto: al mostrar una guía, se envuelven los términos conocidos en un botón. Lista cerrada, sin IA, instantáneo y sin conexión.
- Audio: pronunciaciones italianas **generadas una sola vez** (ElevenLabs, ya conectado), comprimidas en Opus de ~8 KB por término y descargadas con el paquete del idioma. Lectura en voz alta de los pasos con el TTS del sistema (`@capacitor-community/text-to-speech`), gratis y sin conexión.
- Frases de ventanilla por trámite (10–15 por guía), en pantalla completa, con el brillo al máximo y la pantalla siempre encendida.
- Idiomas: priorizar la traducción **revisada por personas nativas** de las guías a árabe, bengalí, ucraniano y francés. Añadir urdu, chino y tagalo según los datos de uso (que solo se recogen con consentimiento).

**Consejo del ingeniero (B, estilo Tarjimly).** «La barrera no es solo el idioma, es la *palabra exacta* que dice el funcionario. Si la persona reconoce "cedolino" cuando lo oye, ya ha ganado la mitad del trámite.»

---

## Orden recomendado

| Semana | Trabajo | Por qué primero |
|---|---|---|
| 1 | **Mejora 1** (modo sin cuenta + datos sensibles en el teléfono) y borrador de la DPIA | Riesgo legal y de confianza; cambia el modelo de datos |
| 2 | **Mejora 2** (paquete dividido + Service Worker de `/app`) | Medible, rápido, y sin ello lo demás no llega offline |
| 3–4 | **Mejora 4** (tabla `facts` + paquete de datos) y guías nuevas: *conto di base* y reagrupación | Los datos dinámicos salen del código |
| 5–6 | **Mejora 3** (motor de vencimientos + checklists) | Se apoya en 1, 2 y 4 |
| 7–8 | **Mejora 5** (glosario + ventanilla + audio) | Se apoya en el paquete offline |

**Decisiones que corresponden al propietario:** (1) aceptar que guías y ayudas sean públicas sin cuenta; (2) contratar la DPIA con una persona experta en protección de datos; (3) presupuesto para revisión nativa de traducciones.

## Fuentes consultadas (17-11-2026)

- Ministero dell'Interno — indicaciones operativas Flussi 2026: https://prefettura.interno.gov.it/sites/default/files/48/2026-01/indicazioni-operative-istanze-decreto-flussi-2026.pdf
- Confcooperative — fechas Flussi 2026: https://www.terredemilia.confcooperative.it/Opportunit%C3%A0/Circolari/decreto-flussi-2026-date-presentazione-domande
- Integrazione Migranti — DL 146/2025 convertido: https://integrazionemigranti.gov.it/it-it/Ricerca-news/Dettaglio-news/id/4510/Convertito-il-DL-1462025-flussi-e-immigrazione-ecco-cosa-prevede
- Prefettura di Chieti — reagrupación familiar: https://prefettura.interno.gov.it/it/prefetture/chieti/ricongiungimento-familiare
- CGIL — análisis del DL 146/2025: https://www.cgil.it/ci-occupiamo-di/immigrazione/immigrazione-cgil-e-inca-sintesi-e-analisi-delle-novita-introdotte-dallapprovazione-del-dl-146-2025-u9589zoh
- Banca d'Italia — conto di base: https://economiapertutti.bancaditalia.it/notizie-e-rubriche/notizie/il-conto-di-base-a-chi-rivolto-e-quando-pu-essere-gratuito/
- Banca d'Italia — orientaciones de Vigilancia (PDF): https://www.bancaditalia.it/compiti/vigilanza/normativa/orientamenti-vigilanza/Conto-di-pagamento-con-caratteristiche-di-base-Orientamenti-di-Vigilanza-sul-comportamento-degli-intermediari.pdf
- CIR — nuevas orientaciones (sept. 2026): https://cir-rifugiati.org/2026/09/18/conto-di-base-nuovi-orientamenti-della-banca-ditalia-per-rimuovere-gli-ostacoli-allaccesso
- ASL Roma 1 — STP/ENI: https://www.aslroma1.it/assistenza-sanitaria-ai-cittadini-extracomunitari
- Regione Liguria — asistencia a extranjeros: https://www.alisa.liguria.it/organizzazione/direzione-sanitaria/assistenza-stranieri-in-italia.html
- Costes del permiso 2026 (secundaria): https://www.ssconsform.it/2026/03/17/costi-permesso-di-soggiorno-2026/
- Poste Italiane — kit postal: https://www.poste.it/prodotti/guida-rilascio-e-rinnovo-permesso-di-soggiorno.html
- Patronato ACLI — ciudadanía: https://www.patronato.acli.it/cittadinanza-italiana/
- EPASA-ITACO — Patronato y migraciones: https://adcives.epasa-itaco.it/opuscoli_pdf/opuscolo_migrazioni.pdf
- Ley 247/2012 art. 2 (comentario): https://www.studiocataldi.it/articoli/13044-riforma-forense-attivita-stragiudiziale-anche-per-i-giuristi-d-impresa.asp y https://www.diritto.it/?p=46936
- AI Act art. 50: https://www.milanofinanza.it/news/ai-act-dal-2-agosto-2026-entrano-in-vigore-gli-obblighi-di-trasparenza-per-i-chatbot-ecco-cosa-202607311152178104
