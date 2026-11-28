#!/usr/bin/env bash
# Arranca los simuladores y la web de A Posto en local, apuntando SOLO a ellos.
# Ninguna variable apunta a producción. Las "claves" son valores falsos de prueba.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
LOGS="${LOGS:-$HERE/logs}"; mkdir -p "$LOGS"

env MOCK_NO_ATOMIC="${MOCK_NO_ATOMIC:-0}" node "$HERE/mocks.mjs" >"$LOGS/mocks.log" 2>&1 &
echo $! >"$LOGS/mocks.pid"

cd "$REPO"
env NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_FALSA_SOLO_LOCAL \
    SUPABASE_SERVICE_ROLE_KEY=FALSA_SOLO_LOCAL \
    ANTHROPIC_API_KEY=sk-ant-FALSA-SOLO-LOCAL \
    ANTHROPIC_BASE_URL=http://127.0.0.1:54322 \
    NO_PROXY=127.0.0.1,localhost no_proxy=127.0.0.1,localhost \
    NEXT_TELEMETRY_DISABLED=1 \
    npx next dev -p 3100 >"$LOGS/next.log" 2>&1 &
echo $! >"$LOGS/next.pid"
echo "Web local en http://127.0.0.1:3100 (registros en $LOGS)"
