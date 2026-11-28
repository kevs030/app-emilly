# A Posto — Auditoría: Fase 1 (análisis estático) y Fase 2 A+B (2026-11-28)

**Alcance:** solo el código del repositorio `kevs030/app-emilly` (web Next.js, rutas de API, migraciones de Supabase y app móvil).
**Pruebas activas:** ninguna. No se envió ninguna petición a producción.
**Autorización:** el propietario confirmó en el chat que la web y la app son suyas.

> El código del repositorio puede no coincidir con lo que está en producción (p. ej. migraciones sin aplicar). Esto se comprobará en la Fase 2.

## Hallazgos candidatos (sin confirmar)

| # | Hallazgo | Tipo | Severidad estimada | Estado |
|---|---|---|---|---|
| 1 | [Reembolso de créditos al cancelar la petición → preguntas gratis y agotamiento del tope diario global](20261128-01-reembolso-por-cancelacion/report.md) | Lógica de negocio / consumo de recursos | Media (4.3) | ✅ **confirmado en local** (falta comprobarlo en Vercel) |
| 2 | [Condición de carrera en premios por anuncio → más de 3 al día](20261128-02-carrera-premios-anuncios/report.md) | Lógica de negocio / race condition | Baja (3.1) | ✅ **confirmado en local** |
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

## Fase 2-A — Asesor de seguridad de Supabase (solo lectura, producción)

Hecho con consultas de solo lectura (`begin read only … rollback`) sobre la estructura, sin leer datos de usuarios.

- ✅ Las 20 tablas de producción tienen RLS. Las políticas y permisos clave coinciden con el repositorio: nadie puede ejecutar `grant_ai_credits` ni `rate_hit`, y nadie puede cambiar `profiles.role`.
- ⚠️ **Permisos sobrantes TRUNCATE, TRIGGER y REFERENCES para `anon` y `authenticated`** en `profiles`, `forum_posts`, `forum_comments`, `forum_reports` y `job_offers`. TRUNCATE vacía la tabla y **se salta RLS**. No se puede usar a través de la API de Supabase (PostgREST no ofrece TRUNCATE), así que no es explotable hoy, pero es un permiso peligroso que sobra. Corrección:
  ```sql
  revoke truncate, trigger, references on public.profiles, public.forum_posts, public.forum_comments,
    public.forum_reports, public.job_offers from anon, authenticated;
  ```
- ⚠️ **Protección contra contraseñas filtradas desactivada** (Auth). Actívala en Supabase → Authentication → Settings, si tu plan lo permite: https://supabase.com/docs/guides/auth/password-security
- ℹ️ Los avisos sobre funciones `SECURITY DEFINER` ejecutables (`is_admin`, `spend_ai_credit`, `admin_stats`…) son **intencionados**: todas comprueban dentro quién llama. Y las 3 tablas «RLS sin políticas» (`rate_limits`, `screen_views`, `sponsor_clicks`) también: solo las usa el servidor.
- ⚠️ **Producción y repositorio no coinciden:** en producción están la tabla `job_offers` y las migraciones `0010_ofertas_empleo` y `cerrar_rls_auto_enable`, que no están en ninguna rama de GitHub. Conviene guardarlas en `supabase/migrations/`.

## Fase 2-B — Reproducción en local

Con el **servidor real de la web** (`next dev`) conectado a simuladores locales de Supabase y Anthropic (`labs/a-posto-harness/`). Sin producción, sin claves reales y sin coste. Detalles y evidencia en cada informe.

- **Hallazgo 1:** una cuenta con **1 crédito** lanzó 5 peticiones a la IA sin gastar nada y agotó el tope diario global → la siguiente pregunta de cualquier usuario recibe **HTTP 503**.
- **Hallazgo 2:** en orden, el límite funciona (3 premios); con 6 cobros en paralelo se concedieron **6 de 6**, dos veces seguidas.
- Se descartó un **falso negativo**: tras reiniciar el servidor, la primera petición se cortaba mientras se compilaba la ruta.

## Siguiente paso propuesto (requiere tu aprobación)

1. **Corregir** los hallazgos 1 y 2 y los permisos TRUNCATE, y volver a pasar el banco de pruebas para verificar las correcciones.
2. Comprobar el hallazgo 1 en un despliegue **de vista previa** de Vercel (no producción), para saber si allí también ocurre.

## Propuesta original de la Fase 2

1. **Asesor de seguridad de Supabase (solo lectura):** consultar los avisos de seguridad del proyecto `emuyxcrtkfqizavslwfj` para confirmar que producción coincide con el repositorio. No modifica nada.
2. **Reproducir los hallazgos 1 y 2 en LOCAL** (`npm run dev`), contra una **rama de Supabase** y con dos cuentas de prueba propias. Nada en producción.
3. **Hallazgo 3** en un emulador Android con un documento inventado.
