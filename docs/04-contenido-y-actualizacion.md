# 4. Contenido y actualización semanal (para no desinformar)

## Regla de oro
**Nada se publica sin fuente, y nada se queda sin revisar más de 7 días.**
- Cada guía, ayuda y contacto tiene un campo `lastVerified`.
- Si pasan más de 7 días sin revisión, la app muestra un aviso amarillo: "Esta información lleva más de 7 días sin revisarse".
- El script `npm run check:freshness` lista lo que está caducado y comprueba que los enlaces de las fuentes siguen funcionando.

## Ciclo semanal (por ejemplo, cada lunes)
1. **Fuentes oficiales** (prioridad máxima):
   - [INPS – noticias y circulares](https://www.inps.it/)
   - [Integrazione Migranti](https://integrazionemigranti.gov.it/)
   - [Ministerio del Interior](https://www.interno.gov.it/)
   - [Polizia di Stato / Questure](https://questure.poliziadistato.it/)
   - [Ministerio de Trabajo](https://www.lavoro.gov.it/)
   - Gazzetta Ufficiale y Normattiva
2. **Fuentes de apoyo:** ASGI, patronatos (ENASC, INCA…) y prensa nacional (Il Post, Avvenire). Sirven como alerta, no como fuente final.
3. **Seguimiento de redes** (temas, no personas):
   - YouTube: búsqueda de los temas más vistos de la semana (ya se hizo así en el análisis inicial);
   - TikTok e Instagram: herramientas que usan las API autorizadas para ver **temas en tendencia** (sin guardar datos personales);
   - denuncias de bulos que envían los usuarios desde la app.
4. **Actualizar:** se cambia el contenido en `src/content/`, se pone la nueva fecha en `lastVerified` y se publica (git push → Vercel).
5. **Alertas:** si cambia algo importante (por ejemplo, un nuevo requisito de un bono), se avisa en la portada.

## Automatización propuesta
- Una **tarea programada semanal** de Claude: lee las fuentes oficiales, compara con el contenido, propone cambios con su fuente y deja un *pull request* en GitHub. **Una persona lo revisa y lo aprueba** antes de publicarlo. La IA no publica sola información legal.
- Requisito: tener el repositorio en GitHub (ver README).

## Videos
- Hay 7 videos cargados: 5 de **canales oficiales** (INPS y Agenzia delle Entrate) y 2 de comunidad, marcados como "no oficial", incluido uno en español.
- Los subtítulos se activan en el idioma del usuario cuando YouTube los ofrece.
- Pendiente: buscar videos oficiales de la Polizia di Stato y del Ministerio del Interior. Y, sobre todo, **producir videos propios** en español e inglés (ver análisis legal, punto 5).

## Contenido que falta verificar con más detalle
- Guía de residencia (Comune): los requisitos cambian según el Comune; hay que añadir la página oficial de los Comunes principales.
- Ciudadanía: falta el enlace directo al portal de solicitud y el importe actual de la tasa.
- ADI: confirmar el umbral de ISEE vigente en la web del INPS.
- Directorio: añadir Patronatos y CAF por ciudad, y abogados y dentistas **verificados** con su consentimiento.
