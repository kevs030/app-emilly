# Vídeos paso a paso por idioma

Estructura: `public/videos/<idioma>/<sección>.mp4` y su portada `<sección>.jpg`.

- Idiomas: es, it, en, fr, ar, ro, sq, uk, bn
- Secciones: `tessera-sanitaria`, `codice-fiscale`, `articolo-31`
- Sin subtítulos: la narración va en el idioma de la carpeta.
- `manifest.json` indica qué vídeos existen. La app solo intenta reproducir los marcados con `true`;
  los demás muestran «El vídeo en tu idioma está en preparación».
- Guiones listos para grabar o generar con IA: `scripts-videos/<idioma>/<sección>.md` (`npm run gen:video-scripts`).
