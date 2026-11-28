#!/usr/bin/env bash
# Verifica las correcciones de los hallazgos 1 y 2 contra el banco de pruebas local (start.sh ya arrancado).
# Uso: verify.sh            → todas las pruebas
#      verify.sh fallback   → solo las de anuncios, para cuando MOCK_NO_ATOMIC=1 (migración 0011 sin aplicar)
set -uo pipefail
WEB=http://127.0.0.1:3100; DB=http://127.0.0.1:54321
H=(-H "authorization: Bearer token-de-prueba" -H "content-type: application/json")
Q='{"messages":[{"role":"user","content":"Hola"}]}'
FAILS=0
state() { curl -s $DB/__state; }
count() { state | jq "[.ledger[]|select(.reason==\"$1\")]|length"; }
check() { # $1 descripción, $2 obtenido, $3 esperado
  if [ "$2" = "$3" ]; then echo "  ✅ PASA  $1 (=$2)"; else echo "  ❌ FALLA $1: obtenido $2, esperado $3"; FAILS=$((FAILS+1)); fi
}
reset() { curl -s -X POST "$DB/__reset?credits=$1&ai=${2:-ok}" >/dev/null; }

# Precalentar las rutas (en desarrollo, la primera petición compila y falsea las medidas).
reset 50; curl -s -m 30 -o /dev/null -X POST $WEB/api/assistant "${H[@]}" -d "$Q"; curl -s -o /dev/null -X POST $WEB/api/ads "${H[@]}" -d '{"action":"status"}'

ads_test() { # $1 = secuencial|paralelo
  reset 0; T=()
  for i in 1 2 3 4 5 6; do T+=("$(curl -s -X POST $WEB/api/ads "${H[@]}" -d '{"action":"start"}' | jq -r .token)"); done
  sleep 16
  for t in "${T[@]}"; do
    if [ "$1" = paralelo ]; then curl -s -o /dev/null -X POST $WEB/api/ads "${H[@]}" -d "{\"action\":\"claim\",\"token\":\"$t\"}" &
    else curl -s -o /dev/null -X POST $WEB/api/ads "${H[@]}" -d "{\"action\":\"claim\",\"token\":\"$t\"}"; fi
  done; wait
  check "Anuncios, 6 cobros en $1: premios concedidos" "$(count ad_reward)" 3
}

if [ "${1:-}" != fallback ]; then
  echo "Hallazgo 1 — reembolsos"
  reset 3; curl -s -m 30 -o /dev/null -X POST $WEB/api/assistant "${H[@]}" -d "$Q"
  check "Control: pregunta completa gasta 1 crédito" "$(state | jq .wallet)" 2
  check "Control: sin reembolso" "$(count refund)" 0

  reset 3; for i in 1 2 3 4 5; do curl -s -m 1 -o /dev/null -X POST $WEB/api/assistant "${H[@]}" -d "$Q"; sleep 1.5; done; sleep 4
  check "Ataque: 5 cancelaciones con 3 créditos → saldo" "$(state | jq .wallet)" 0
  check "Ataque: reembolsos" "$(count refund)" 0
  check "Ataque: llamadas a la IA (las 2 últimas ya sin crédito)" "$(state | jq .anthropic.requests)" 3

  reset 3 fail; curl -s -m 30 -o /dev/null -X POST $WEB/api/assistant "${H[@]}" -d "$Q"; sleep 1
  check "Fallo real de la IA: se reembolsa (saldo vuelve a 3)" "$(state | jq .wallet)" 3
  check "Fallo real de la IA: exactamente 1 reembolso" "$(count refund)" 1
  check "Fallo real de la IA: referencia única refund:<id>" "$(state | jq -r '[.ledger[]|select(.reason=="refund")][0].ref|startswith("refund:")')" true
fi

echo "Hallazgo 2 — premios por anuncio"
ads_test secuencial
if [ "${1:-}" = fallback ]; then
  echo "  (modo sin migración 0011: solo se comprueba que los anuncios siguen funcionando; la carrera sigue abierta hasta aplicarla)"
else
  ads_test paralelo
  ads_test paralelo
fi

echo; [ $FAILS -eq 0 ] && echo "RESULTADO: todas las pruebas pasan" || echo "RESULTADO: $FAILS prueba(s) fallan"
exit $FAILS
