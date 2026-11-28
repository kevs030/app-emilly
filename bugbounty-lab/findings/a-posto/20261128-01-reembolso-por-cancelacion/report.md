# Reembolso de créditos de IA al cancelar la petición: preguntas gratis ilimitadas y agotamiento del tope diario global

| Campo | Valor |
|---|---|
| ID interno | `20261128-01-reembolso-por-cancelacion` |
| Estado | confirmado |
| Programa | a-posto |
| Política aplicable | App propia — programs/a-posto/scope.json (análisis estático del repositorio) |
| Activo afectado | POST /api/assistant y POST /api/document (src/lib/ai-server.ts → streamAnswer/refund) |
| Tipo | Business Logic / Uncontrolled resource consumption (OWASP API4/API6) |
| Severidad estimada | Media (CVSS 3.1 4.3 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L`) |

## Resumen

streamAnswer() devuelve 1 crédito (refund) cuando la llamada a la IA falla antes de enviar texto (`if (!sent) await refund(userId)`). Si el cliente cierra la conexión, ReadableStream.cancel() llama a stream.abort(); el bucle `for await` lanza APIUserAbortError, cae en el catch con sent=false y se ejecuta el reembolso. Como el modelo usa razonamiento adaptativo, el primer texto puede tardar varios segundos: cancelar en ese intervalo hace que el crédito vuelva siempre. Además, aiBudgetOk() cuenta las filas 'question' del libro y el reembolso no las anula, así que una sola cuenta gratuita con 1 crédito podría agotar en bucle el tope global (AI_DAILY_QUESTION_LIMIT, 1000 por defecto) y dejar el asistente sin servicio para todos, generando coste en la API de Anthropic.

## Pasos de reproducción

1. Arrancar el banco de pruebas: bugbounty-lab/labs/a-posto-harness (Next.js real en local + simuladores de Supabase y Anthropic; sin producción, sin claves reales) → `labs/a-posto-harness/start.sh` (tope global opcional: AI_DAILY_QUESTION_LIMIT=5).
2. Precalentar la ruta con una petición completa (en modo desarrollo la primera petición compila la ruta y falsea el resultado).
3. Poner la cuenta A con 1 crédito: `curl -X POST 'http://127.0.0.1:54321/__reset?credits=1'`.
4. Enviar 5 veces `curl -m 1 -X POST http://127.0.0.1:3100/api/assistant -H 'authorization: Bearer <token de prueba>' -d '{"messages":[{"role":"user","content":"Hola"}]}'` (se corta a 1 s, antes del primer texto).
5. Ver el estado: `curl http://127.0.0.1:54321/__state` → saldo, filas 'question' y 'refund', peticiones a la IA.
6. Hacer una pregunta normal: responde 503 {"reason":"daily_budget"}.

## Evidencia

- Control (pregunta completa): saldo 3→2, 1 'question', 0 'refund' → el cobro normal funciona.
- Ataque con 3 créditos: 5 peticiones cortadas → 5 llamadas a la IA (abortedByClient=5), 5 'question', 5 'refund', saldo final 3.
- Ataque con 1 crédito y AI_DAILY_QUESTION_LIMIT=5: saldo final 1, 5 'question', 5 'refund'; la siguiente pregunta legítima → HTTP 503 daily_budget.
- Registro del servidor: 5 × `ai_error error_unknown Request was aborted.` (evidence/next-local.log, no se sube a Git).
- Falso negativo descartado: tras reiniciar, la 1.ª petición se cortó durante la compilación y llegó a completarse (consumió el crédito sin reembolso); con la ruta ya compilada el fallo se reproduce siempre.

## Impacto demostrado

En local, una cuenta con 1 solo crédito obtuvo 5 respuestas de IA iniciadas sin gastar créditos y agotó el tope diario global, dejando el asistente y el lector de documentos (que comparten tope) en HTTP 503 para todos los usuarios. Cada intento también genera coste real en la API del proveedor (tokens de entrada y de razonamiento hasta el corte).

## Posibles falsos positivos (revisados)

- NO VERIFICADO EN PRODUCCIÓN: se confirmó con `next dev` en local. Falta comprobar que Vercel también propaga la desconexión del cliente a ReadableStream.cancel(); si no la propagara, el fallo no existiría allí. Comprobarlo en un despliegue de vista previa (preview), no en producción.
- Descartado: que la clase del error importe. El catch reembolsa ante cualquier error si aún no se envió texto.

## Solución recomendada

1) No reembolsar cuando el error es APIUserAbortError (cancelación del cliente): `if (!sent && !(err instanceof Anthropic.APIUserAbortError)) await refund(userId)`. 2) Reembolsar con una referencia única por petición (p. ej. `refund:<uuid de la petición>`) para que el índice único impida dobles reembolsos. 3) Que aiBudgetOk() reste los reembolsos o cuente el coste real, y añadir un tope diario por cuenta.

## Cómo verificar la corrección

1. Repetir los pasos 3–5: el saldo debe bajar 1 por petición cancelada y no debe aparecer ningún 'refund'.
2. Simular un error real del proveedor (clave inválida en local): debe seguir reembolsando una sola vez.

## Referencias

- OWASP API Security Top 10 2023 — API4: Unrestricted Resource Consumption
- OWASP API6: Unrestricted Access to Sensitive Business Flows

---
_Borrador generado el 2026-11-28. Revisión humana obligatoria antes de enviarlo a la plataforma oficial._
