# Banco de pruebas local de A Posto

Arranca la web real (`next dev`, puerto 3100) contra simuladores **locales** de Supabase (:54321) y Anthropic (:54322).
No usa producción, ni claves reales, ni Internet. Sirve para reproducir los hallazgos y verificar sus correcciones.

```bash
npm ci                                   # una vez, en la raíz del repositorio
bugbounty-lab/labs/a-posto-harness/start.sh
curl http://127.0.0.1:54321/__state       # saldo, libro de créditos y llamadas a la IA
curl -X POST 'http://127.0.0.1:54321/__reset?credits=1'
```
⚠️ En modo desarrollo, la primera petición a cada ruta la compila: precaliéntala antes de medir.
