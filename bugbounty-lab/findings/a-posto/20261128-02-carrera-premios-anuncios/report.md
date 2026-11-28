# Condición de carrera en el cobro de premios por anuncio: se puede superar el límite de 3 al día

| Campo | Valor |
|---|---|
| ID interno | `20261128-02-carrera-premios-anuncios` |
| Estado | confirmado |
| Programa | a-posto |
| Política aplicable | App propia — programs/a-posto/scope.json (análisis estático del repositorio) |
| Activo afectado | POST /api/ads {action:'claim'} (src/app/api/ads/route.ts, src/lib/ads-server.ts) |
| Tipo | Business Logic / Race condition (TOCTOU) |
| Severidad estimada | Baja (CVSS 3.1 3.1 — `CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N`) |

## Resumen

La ruta comprueba `rewardsLeft()` (cuenta filas 'ad_reward' de 24 h) y DESPUÉS llama a grantReward(). Las dos operaciones no son atómicas. Cada justificante tiene un nonce distinto, así que el índice único (reason, ref) no impide cobrar varios justificantes distintos a la vez. Si se piden N justificantes con 'start' (permitido mientras left>0) y se cobran todos en paralelo pasados 15 s, todas las peticiones pueden ver left>0 antes de que se inserte ninguna, y se superaría el límite DAILY_LIMIT=3 (hasta ~20 por minuto según el límite de peticiones).

## Pasos de reproducción

1. Arrancar el banco de pruebas: bugbounty-lab/labs/a-posto-harness (Next.js real en local + simuladores de Supabase y Anthropic; sin producción, sin claves reales) → `labs/a-posto-harness/start.sh`.
2. Reiniciar la cuenta A a 0 premios: `curl -X POST 'http://127.0.0.1:54321/__reset?credits=0'`.
3. Pedir 6 justificantes: 6 × `POST /api/ads {"action":"start"}`.
4. Esperar 16 s (REWARD_SECONDS=15).
5. Cobrar los 6 a la vez: 6 × `POST /api/ads {"action":"claim","token":…}` lanzados en paralelo.
6. Ver el estado: filas 'ad_reward' en /__state.

## Evidencia

- Control secuencial: 3 cobros OK y 3 × daily_limit → 3 premios (el límite funciona en orden).
- Paralelo, intento 1: 6 premios concedidos (límite 3), saldo 6.
- Paralelo, intento 2: 6 premios concedidos (límite 3), saldo 6.

## Impacto demostrado

En local, la cuenta A obtuvo 6 créditos de IA por anuncio en un día con un límite de 3. El tope real lo marca el limitador (20 peticiones/minuto por cuenta en /api/ads): unos 10 premios por ráfaga en lugar de 3. Cada premio es una pregunta a la IA pagada por el propietario.

## Posibles falsos positivos (revisados)

- El simulador de Supabase añade 80 ms por consulta; en producción la latencia es parecida (Vercel ↔ Supabase), pero la ventana de carrera puede variar. El defecto (comprobar y luego insertar sin transacción) existe igualmente en el código.

## Solución recomendada

Hacer la comprobación y la inserción en la misma transacción dentro de la base de datos: una función `claim_ad_reward(p_user, p_ref)` que bloquee la fila del monedero (`select … for update` en ai_wallets) o use `pg_advisory_xact_lock(hashtext(p_user::text))`, cuente los premios de 24 h y solo entonces inserte.

## Cómo verificar la corrección

1. Repetir el paso 3: deben concederse exactamente 3 premios y el resto deben responder daily_limit.

## Referencias

- OWASP API6: Unrestricted Access to Sensitive Business Flows
- PortSwigger: Race conditions

---
_Borrador generado el 2026-11-28. Revisión humana obligatoria antes de enviarlo a la plataforma oficial._
