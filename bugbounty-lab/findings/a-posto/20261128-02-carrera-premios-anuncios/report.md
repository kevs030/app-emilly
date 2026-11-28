> ⚠️ **Estado: CANDIDATO** — NO es una vulnerabilidad confirmada. No enviar hasta validarla.

# Condición de carrera en el cobro de premios por anuncio: se puede superar el límite de 3 al día

| Campo | Valor |
|---|---|
| ID interno | `20261128-02-carrera-premios-anuncios` |
| Estado | candidato |
| Programa | a-posto |
| Política aplicable | App propia — programs/a-posto/scope.json (análisis estático del repositorio) |
| Activo afectado | POST /api/ads {action:'claim'} (src/app/api/ads/route.ts, src/lib/ads-server.ts) |
| Tipo | Business Logic / Race condition (TOCTOU) |
| Severidad estimada | Baja (CVSS 3.1 3.1 — `CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N`) |

## Resumen

La ruta comprueba `rewardsLeft()` (cuenta filas 'ad_reward' de 24 h) y DESPUÉS llama a grantReward(). Las dos operaciones no son atómicas. Cada justificante tiene un nonce distinto, así que el índice único (reason, ref) no impide cobrar varios justificantes distintos a la vez. Si se piden N justificantes con 'start' (permitido mientras left>0) y se cobran todos en paralelo pasados 15 s, todas las peticiones pueden ver left>0 antes de que se inserte ninguna, y se superaría el límite DAILY_LIMIT=3 (hasta ~20 por minuto según el límite de peticiones).

## Pasos de reproducción

1. (Fase 2, SOLO en local con una cuenta de prueba propia.)
2. Con la cuenta A (0 premios hoy), llamar 6 veces a {action:'start'} y guardar los 6 justificantes.
3. Esperar 16 s y enviar los 6 {action:'claim'} a la vez (p. ej. 6 curl en paralelo con `&`).
4. Contar en ai_credit_ledger las filas 'ad_reward' de la cuenta A: si hay más de 3, el fallo está confirmado.

## Evidencia

_(pendiente)_

## Impacto demostrado

_(pendiente: describe solo lo demostrado)_

## Posibles falsos positivos (revisados)

- Que la latencia real serialice las peticiones y no se produzca la carrera (probar varias veces antes de descartarlo).

## Solución recomendada

Hacer la comprobación y la inserción en la misma transacción dentro de la base de datos: una función `claim_ad_reward(p_user, p_ref)` que bloquee la fila del monedero (`select … for update` en ai_wallets) o use `pg_advisory_xact_lock(hashtext(p_user::text))`, cuente los premios de 24 h y solo entonces inserte.

## Cómo verificar la corrección

1. Repetir el paso 3: deben concederse exactamente 3 premios y el resto deben responder daily_limit.

## Referencias

- OWASP API6: Unrestricted Access to Sensitive Business Flows
- PortSwigger: Race conditions

---
_Borrador generado el 2026-11-28. Revisión humana obligatoria antes de enviarlo a la plataforma oficial._
