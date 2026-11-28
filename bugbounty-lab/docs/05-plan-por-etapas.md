# 5. Plan de implementación por etapas

| Etapa | Objetivo | Entregable | Riesgo legal | Coste |
|---|---|---|---|---|
| **0. Base** ✅ | Estructura, módulos, reglas | Este laboratorio | Ninguno | 0 € |
| **1. Práctica en tu propia app** | Análisis estático de A Posto (código, reglas RLS de Supabase, API, panel de administración) | Hallazgos reales en tu app + correcciones | Ninguno (es tu código) | 0 € |
| **1b. Formación** | Laboratorios de PortSwigger Academy: Access control, IDOR, Authentication, API, Business logic, SSRF, XSS, SQLi | Notas en `labs/` | Ninguno | 0 € |
| **2. Pruebas dinámicas propias** | Instalar Burp Community en tu PC; probar A Posto **en local o en una rama de Supabase** con dos cuentas tuyas | Validación de los hallazgos de la etapa 1 | Ninguno, si no se toca producción | 0 € |
| **3. Primer programa real** | Elegir 3 candidatos, verificar sus políticas juntos y quedarnos con 1 | `programs/<x>/scope.json` verificado | Bajo si se respeta el alcance | 0 € |
| **4. Reconocimiento pasivo** | Mapear la app del programa *usándola como un usuario normal*, con Burp registrando tu tráfico | Mapa de funciones, roles, objetos y endpoints | Bajo | 0 € |
| **5. Investigación dirigida** | Probar IDOR/BOLA, autorización y lógica de negocio con tus cuentas A y B, de forma manual y a bajo ritmo | Hallazgos `candidato` → `confirmado` | Bajo, con aprobación por prueba | 0 € |
| **6. Informe y envío** | Generar el informe, revisarlo juntos y enviarlo tú | Informe en la plataforma | — | 0 € |
| **7. Mejora continua** | Registrar duplicados y rechazos para aprender; seguir 2 o 3 programas a fondo | Panel actualizado | — | 0 € |

## Expectativas honestas
- El primer pago suele tardar **semanas o meses** de práctica. Los duplicados y los informes "informativos" son normales al principio.
- Lo que más paga a principiantes que trabajan a mano: **IDOR/BOLA, control de acceso roto y lógica de negocio** en aplicaciones con cuentas. Por eso los priorizamos.
- Profundizar en un solo programa rinde más que pasar por encima de muchos.
