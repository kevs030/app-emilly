# Diseño: sección «Empleo» (buscar trabajo) en la app

Fecha: 2026-11-28 · Estado: pendiente de aprobación del propietario

## Por qué

El propietario lleva la app solo. Un usuario preguntó en Comunidad por «empresas que contratan personal extranjero»
y la app no tenía información para responderle: la guía de trabajo explica derechos, no cómo buscar empleo.
Objetivo: que cada usuario vea **ofertas reales de su ciudad, nuevas cada día**, para que encuentre trabajo más
fácilmente y tenga un motivo para volver a la app a diario. Y que, además, sirva de base fiable para el futuro
agente del foro.

## Objetivos

- Pantalla «Empleo» (diseño **opción B** aprobado: https://claude.ai/artifact/BmtStdt2NcBCqF9T3gjbv5#artboard-OpcionB).
- Ofertas reales por ciudad, actualizadas automáticamente **cada mañana**.
- Guía «Cómo buscar trabajo en Italia» con fuentes oficiales y avisos contra estafas.
- Accesos directos por ciudad a Subito, Indeed, InfoJobs y EURES.

## No objetivos

- Publicar ofertas propias, que las empresas suban ofertas o que el usuario se postule desde la app.
- Copiar anuncios de webs que no lo permiten (Subito, ti-aiuto, Indeed…): **descartado** por condiciones de uso y riesgo legal.
- Notificaciones push de ofertas (posible más adelante).

## Lo que haría que fracase aunque funcione

- Mostrar como «de A Posto» una oferta que resulte una estafa: siempre se indica la fuente y se enlaza al anuncio original.
- Pedir datos personales al usuario para ver ofertas.
- Una pantalla vacía o rota si falla la fuente: debe mostrar «sin ofertas nuevas hoy» y los portales.

## Enfoques considerados

| | Enfoque | Ventajas | Inconvenientes |
|---|---|---|---|
| **A (elegido)** | API oficial y gratuita de **Adzuna** (tiene Italia y búsqueda por ciudad) + botones a portales | Ofertas reales dentro de la app, «nuevas hoy», legal | Necesita cuenta gratuita en Adzuna y una tabla nueva |
| B | Solo botones a portales filtrados por ciudad | Sin claves ni base de datos | El usuario sale de la app; sin «nuevas hoy» |
| C | Copiar ofertas de Subito / ti-aiuto / Indeed | — | Prohibido por sus condiciones, riesgo legal, se rompe |

El propietario eligió A con los botones de B como complemento, y el diseño visual opción B.

## Cómo funciona

**Datos (Supabase, necesita el «sí» del propietario):** tabla nueva `job_offers`
(id, fuente, id en la fuente, ciudad, título, empresa, zona, tipo de contrato, jornada, categoría, enlace,
fecha de publicación, fecha de descarga). Lectura pública; escritura solo desde el servidor.
Las ofertas de más de **14 días** se eliminan solas en cada actualización (es una copia temporal de anuncios
públicos, no datos de usuarios).

**Actualización diaria:** una tarea programada de Vercel (gratuita, una vez al día, ~7:00 hora italiana) llama a
`/api/jobs/refresh`, protegida con `CRON_SECRET`. Pide a Adzuna las ofertas de los últimos días de las
**15 ciudades** de la app (Milano, Roma, Torino, Genova, Bologna, Firenze, Venezia, Verona, Brescia, Bergamo,
Napoli, Bari, Palermo, Cagliari, Perugia) y las guarda sin duplicados.
Claves en Vercel: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `CRON_SECRET` (nunca en el chat ni en el repositorio).

**Pantalla «Empleo» (app):**
- Ciudad: la del perfil; si no hay, la elige el usuario (se recuerda en el teléfono). Funciona **sin cuenta**.
- Buscador por puesto (filtra en el teléfono), contadores «Nuevas hoy · Esta semana · Guardadas».
- «Nuevas hoy» en tarjetas; «Esta semana» en lista. «Ver oferta» abre el anuncio original fuera de la app.
- **Guardar** ofertas: solo en el teléfono, como los documentos (sin datos en el servidor).
- Aviso fijo de fuentes verificadas y «ninguna empresa legal te pedirá dinero», con «Saber más» → la guía.
- Mención «Ofertas de Adzuna», que sus condiciones exigen.
- Sin ofertas o sin conexión: mensaje claro y los portales.
- Portales: Subito, Indeed, InfoJobs y EURES, abiertos con la ciudad ya aplicada (enlaces comprobados al construir).

**Inicio:** tarjeta «12 nuevas ofertas hoy en Milano» que lleva a «Empleo» (sin número si no hay datos).

**Guía «Cómo buscar trabajo en Italia»:** documentos necesarios; Centro per l'Impiego; agencias autorizadas
(enlace a la lista oficial del Ministerio); EURES; asesoramiento gratuito (Patronatos/sindicatos); estafas;
Decreto Flussi para quien está fuera. En los 9 idiomas de la app, como el resto de guías, con fuentes oficiales.

**Publicidad:** sin anuncios en esta pantalla (es una herramienta de ayuda).

**Pruebas:** unitarias (limpieza de datos de Adzuna, ciudad, filtros) y de pantalla (e2e con Adzuna simulado:
ofertas, vacío, error, guardar, búsqueda, enlaces).

## Decisiones tomadas por Claude (revisables)

- Guardar 14 días de ofertas; actualizar a las ~7:00.
- Las 15 ciudades actuales de la app; otras ciudades se añaden a la lista más adelante.
- Ofertas guardadas solo en el teléfono.
- Sin publicidad en «Empleo».
- La pantalla está en la app (Android e iPhone); la web solo enlaza a ella.

## Pasos del propietario

1. Crear la cuenta gratuita de desarrollador en Adzuna y poner `ADZUNA_APP_ID` y `ADZUNA_APP_KEY` en Vercel.
2. Dar el «sí» para crear la tabla `job_offers` en la base de datos.
3. Escribir «publica» cuando esté probado.
