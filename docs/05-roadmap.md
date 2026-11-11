# 5. Hoja de ruta

## Fase 0 — Hecho (11/11/2026)
- App web adaptada a móvil, en español, inglés e italiano.
- 6 guías paso a paso con fuentes, 4 ayudas, 7 videos, directorio de contactos verificados y avisos contra estafas.
- Asistente con IA sobre una base de conocimiento verificada, con aviso de IA y límites de uso.
- Mapa de oficinas (Questura, Agenzia delle Entrate, Correos, Patronato, ASL, Comune, Prefectura).
- Cuentas por código de correo o SMS. Perfil con consentimiento y "tus próximos pasos" personalizados.
- Foro con categorías, denuncias, ocultación automática y límites contra spam.
- Base de datos con RLS, probada con ataques.
- Análisis de mercado, legal, de seguridad y de contenido.

## Fase 1 — Lanzamiento privado (2–4 semanas)
1. Conectar GitHub, Supabase y Vercel, y poner las claves (README).
2. Revisión legal: DPIA, política de privacidad y términos de uso.
3. Lista de control de seguridad (docs/03): CAPTCHA, limitador compartido y región UE.
4. Probar con 20–50 migrantes reales (grupos de confianza, asociaciones, Patronatos) y medir:
   - qué preguntan al asistente;
   - qué guías faltan;
   - si entienden los pasos.
5. Revisión semanal del contenido (docs/04).

## Fase 2 — Crecimiento (1–3 meses)
- Más idiomas: árabe, panyabí/hindi, bengalí, portugués y francés. El asistente ya responde en cualquier idioma.
- Avisos por correo y notificaciones: "tu permiso vence en 60 días".
- App instalable (PWA) y, después, versión para tiendas.
- Directorio de abogados, dentistas y médicos **verificados**.
- Videos propios en español e inglés + canal de TikTok y YouTube para atraer usuarios.
- Analítica con consentimiento (PostHog UE) para saber qué pantallas ayudan de verdad.

## Fase 3 — Modelo de aprendizaje
- Hoy la personalización usa **reglas transparentes** (`src/lib/next-steps.ts`). Es lo correcto al empezar: es explicable, no necesita datos masivos y cumple el RGPD.
- Con datos **anónimos y con consentimiento**, y con varios miles de usuarios:
  - recomendar la siguiente guía según el recorrido de personas con un perfil parecido;
  - detectar preguntas frecuentes sin respuesta → nuevas guías;
  - detectar temas nuevos (por ejemplo, un cambio de ley) por el aumento de preguntas.
- Siempre con evaluación de impacto actualizada y sin decisiones automatizadas con efectos jurídicos.

## Monetización (a decidir más adelante; límites en docs/02, punto 7)
1. **Gratis para el migrante** en lo básico. Es la promesa de la marca.
2. **B2B / institucional:**
   - licencias para Comunes, cooperativas, Patronatos y empresas que contratan con el Decreto Flussi;
   - convocatorias públicas (Fondo FAMI de la UE).
3. **Directorio profesional verificado** con **cuota fija** mensual. Sin comisión por cliente.
4. **Premium opcional:** recordatorios avanzados, listas de documentos personalizadas y guarda segura de documentos (requiere más seguridad).
5. Publicidad muy filtrada, solo de servicios útiles y legales, o directamente ninguna.
