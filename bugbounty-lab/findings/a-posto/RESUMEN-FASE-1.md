# A Posto — Fase 1: análisis estático (2026-11-28)

**Alcance:** solo el código del repositorio `kevs030/app-emilly` (web Next.js, rutas de API, migraciones de Supabase y app móvil).
**Pruebas activas:** ninguna. No se envió ninguna petición a producción.
**Autorización:** el propietario confirmó en el chat que la web y la app son suyas.

> El código del repositorio puede no coincidir con lo que está en producción (p. ej. migraciones sin aplicar). Esto se comprobará en la Fase 2.

## Hallazgos candidatos (sin confirmar)

| # | Hallazgo | Tipo | Severidad estimada | Estado |
|---|---|---|---|---|
| 1 | [Reembolso de créditos al cancelar la petición → preguntas gratis y agotamiento del tope diario global](20261128-01-reembolso-por-cancelacion/report.md) | Lógica de negocio / consumo de recursos | Media (4.3) | candidato |
| 2 | [Condición de carrera en premios por anuncio → más de 3 al día](20261128-02-carrera-premios-anuncios/report.md) | Lógica de negocio / race condition | Baja (3.1) | candidato |
| 3 | [Cifrado local parcial de «Mis documentos» en el móvil](20261128-03-cifrado-local-parcial/report.md) | Móvil / almacenamiento inseguro | Media (4.1), riesgo real bajo | candidato |

## Observaciones menores (endurecimiento, sin informe propio)

- **Ocultación del foro por denuncias:** con 3 cuentas cualquiera puede ocultar cualquier publicación (`forum_auto_hide`). Es una decisión de diseño razonable, pero se puede abusar para censurar. Idea: dar más peso a las cuentas antiguas o exigir correo confirmado para denunciar.
- **El tope diario global de IA «falla abierto»:** si `aiBudgetOk()` no puede consultar la base, deja pasar. Es una decisión consciente (documentada en el código). Vigilarlo en los registros.
- **Historial del chat lo envía el cliente:** 1 crédito permite hasta 30 mensajes × 4.000 caracteres de entrada, y el cliente puede inventar respuestas «assistant». Solo afecta a su propia conversación; el coste por pregunta es acotado.
- **Actualizaciones en vivo de la app (Capgo):** el `checksum` viene del mismo manifiesto que el paquete, así que protege contra corrupción, no contra quien controle el servidor. Si alguien comprometiera la cuenta de Vercel, podría enviar código a todas las apps instaladas. Recomendación: activar la firma o el cifrado de extremo a extremo de Capgo con una clave que no esté en Vercel.
- **`reminders.procedure_id`** se puede apuntar al trámite de otra persona (no hay comprobación de dueño, a diferencia de `procedure_items`). No filtra datos, pero conviene añadir la misma comprobación.
- **`documents.analysis`** lo puede escribir el propio usuario (falsear el análisis de su propio documento). Solo le afecta a él.

## Lo que está bien hecho (y no hay que tocar)

- RLS activado en las 19 tablas, con políticas «solo lo propio» y **permisos por columna** (nadie puede cambiarse el rol, ocultar o mostrar posts, ni darse créditos).
- Créditos de IA: gasto atómico en la base de datos y suma solo desde el servidor, con referencia única contra los dobles cobros.
- Panel de administración: cada acción comprueba el rol en el servidor **y** la base lo vuelve a comprobar.
- Sin XSS aparente: React escapa todo, no hay `dangerouslySetInnerHTML` y los enlaces del chat solo admiten `https://`.
- Sin secretos en el repositorio: solo la clave publicable de Supabase, que es pública por diseño.
- Móvil: `allowBackup="false"`, sesión en SecureStorage (Keystore/Keychain) y CORS restringido a los orígenes de la app.
- `/api/health` no da pistas de configuración salvo a un admin.

## Propuesta para la Fase 2 (requiere tu aprobación, prueba por prueba)

1. **Asesor de seguridad de Supabase (solo lectura):** consultar los avisos de seguridad del proyecto `emuyxcrtkfqizavslwfj` para confirmar que producción coincide con el repositorio. No modifica nada.
2. **Reproducir los hallazgos 1 y 2 en LOCAL** (`npm run dev`), contra una **rama de Supabase** y con dos cuentas de prueba propias. Nada en producción.
3. **Hallazgo 3** en un emulador Android con un documento inventado.
