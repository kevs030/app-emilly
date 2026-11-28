> ⚠️ **Estado: CANDIDATO** — NO es una vulnerabilidad confirmada. No enviar hasta validarla.

# Reembolso de créditos de IA al cancelar la petición: preguntas gratis ilimitadas y agotamiento del tope diario global

| Campo | Valor |
|---|---|
| ID interno | `20261128-01-reembolso-por-cancelacion` |
| Estado | candidato |
| Programa | a-posto |
| Política aplicable | App propia — programs/a-posto/scope.json (análisis estático del repositorio) |
| Activo afectado | POST /api/assistant y POST /api/document (src/lib/ai-server.ts → streamAnswer/refund) |
| Tipo | Business Logic / Uncontrolled resource consumption (OWASP API4/API6) |
| Severidad estimada | Media (CVSS 3.1 4.3 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L`) |

## Resumen

streamAnswer() devuelve 1 crédito (refund) cuando la llamada a la IA falla antes de enviar texto (`if (!sent) await refund(userId)`). Si el cliente cierra la conexión, ReadableStream.cancel() llama a stream.abort(); el bucle `for await` lanza APIUserAbortError, cae en el catch con sent=false y se ejecuta el reembolso. Como el modelo usa razonamiento adaptativo, el primer texto puede tardar varios segundos: cancelar en ese intervalo hace que el crédito vuelva siempre. Además, aiBudgetOk() cuenta las filas 'question' del libro y el reembolso no las anula, así que una sola cuenta gratuita con 1 crédito podría agotar en bucle el tope global (AI_DAILY_QUESTION_LIMIT, 1000 por defecto) y dejar el asistente sin servicio para todos, generando coste en la API de Anthropic.

## Pasos de reproducción

1. (Fase 2, SOLO en local con `npm run dev` y una cuenta de prueba propia con SUPABASE_SERVICE_ROLE_KEY de un proyecto/rama de prueba.)
2. Anotar el saldo de la cuenta A en ai_wallets y el número de filas reason='question' de las últimas 24 h.
3. Enviar POST /api/assistant con un mensaje válido y cerrar la conexión 1–2 s después, antes de recibir texto (p. ej. `curl --max-time 2`).
4. Comprobar en ai_credit_ledger si aparece un movimiento 'refund' (+1) y si el saldo vuelve al valor inicial.
5. Repetir 3 veces y comprobar que el contador de 'question' sube mientras el saldo no baja.

## Evidencia

_(pendiente)_

## Impacto demostrado

_(pendiente: describe solo lo demostrado)_

## Posibles falsos positivos (revisados)

- Que Next.js/Vercel no propague la desconexión del cliente a ReadableStream.cancel() (entonces no habría aborto ni reembolso).
- Que la respuesta empiece a llegar antes de poder cancelar (sent=true).

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
