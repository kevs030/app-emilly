# 1. Capacidades del equipo y arquitectura

## 1.1 Qué hay en este equipo (analizado el 2026-11-28)

Esta sesión de Claude Code corre en un **contenedor en la nube**, no en tu computadora.

| Recurso | Estado | Comentario |
|---|---|---|
| Sistema | Ubuntu 24.04, 4 CPU, 15 GB RAM | De sobra para análisis estático e informes |
| Python 3.13, Node 22, Git, curl, jq | ✅ Instalados | Los módulos del laboratorio usan solo Python estándar |
| Chromium + Playwright | ✅ Instalados | Útil para revisar flujos web propios de forma controlada |
| Docker | ⚠️ Solo el cliente | El servicio (daemon) no está arrancado: no podemos montar laboratorios con contenedores aquí |
| Nmap, OWASP ZAP, Burp, Semgrep, Gitleaks… | ❌ No instalados | Se instalan solo si hacen falta y con tu aprobación |
| Red | 🔒 Limitada | Solo salen conexiones a una lista de dominios permitidos (tu app, Vercel, registros de paquetes, GitHub). **No podemos tocar ninguna empresa sin añadir su dominio, y eso te pide aprobación.** Es una protección extra. |
| Búsqueda web | ✅ | Para leer políticas y documentación públicas |
| Persistencia | ⚠️ Temporal | El contenedor se borra tras un tiempo inactivo. Todo lo importante se guarda en Git. |
| GitHub | ✅ Solo `kevs030/app-emilly` | |

### Qué hace bien Claude Code aquí

- Leer y razonar sobre código fuente (análisis estático manual asistido).
- Leer políticas de programas, extraer el alcance y convertirlo en reglas comprobables.
- Diseñar casos de prueba, revisar la evidencia que tú captures y detectar falsos positivos.
- Calcular la severidad (CVSS), redactar informes y proponer correcciones.

### Qué conviene hacer en TU computadora

- Las pruebas manuales con **Burp Suite Community** o **OWASP ZAP**, que son programas con ventana y necesitan tu navegador y tus cuentas de prueba.
- Cualquier interacción con cuentas reales: tus contraseñas nunca deben pasar por aquí.

**Arquitectura de bajo coste:** Claude Code en la nube hace de cerebro (análisis, alcance, informes). Tu PC hace de manos (Burp/ZAP con tus cuentas de prueba). Git hace de memoria compartida. Coste: 0 €.

## 1.2 Arquitectura por módulos

```
          ┌──────────────────┐
          │ 1 Program Finder │  lista pública → candidatos (sin verificar)
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ 2 Scope Validator│  ficha verificada por ti → permitido / BLOQUEADO
          └────────┬─────────┘
                   ▼
   ┌───────────────────────────────┐
   │ 3 Security Analyzer           │  checklists + análisis estático + tráfico que TÚ capturas
   └────────┬──────────────────────┘
            ▼
   ┌───────────────────────────────┐
   │ 4 Vulnerability Validator     │  reproducir con cuentas propias, descartar falsos positivos
   └────────┬──────────────────────┘
            ▼
   ┌──────────────┐   ┌──────────────────────┐
   │5 Risk        │──▶│6 Remediation         │
   │  Classifier  │   │  Assistant           │
   └──────┬───────┘   └──────────┬───────────┘
          ▼                      ▼
        ┌─────────────────────────────┐      ┌────────────────────┐
        │ 7 Report Generator          │─────▶│ 8 Research Dashboard│
        └─────────────────────────────┘      └────────────────────┘
                     │
                     ▼
          TÚ revisas y envías en la plataforma oficial
```

| Módulo | Dónde está | Tipo |
|---|---|---|
| 1. Program Finder | `modules/program_finder.py` | Script |
| 2. Scope Validator | `modules/scope_validator.py` + `programs/<programa>/scope.json` | Script; bloquea por defecto |
| 3. Security Analyzer | `checklists/` + Claude Code | Metodología + razonamiento |
| 4. Vulnerability Validator | `checklists/00-validacion.md` + el estado del hallazgo | Metodología + reglas del generador |
| 5. Risk Classifier | `modules/risk_classifier.py` | Script (CVSS 3.1 oficial) |
| 6. Remediation Assistant | sección "Solución" de cada checklist + Claude Code | Metodología |
| 7. Report Generator | `modules/report_generator.py` + `templates/` | Script; rechaza "confirmado" sin evidencia |
| 8. Research Dashboard | `modules/dashboard.py` → `DASHBOARD.md` | Script |

### Dónde se guarda cada cosa

```
bugbounty-lab/
├── programs/<programa>/scope.json     alcance y reglas copiados de la política oficial
├── findings/<programa>/<id>/
│   ├── finding.json                   datos del hallazgo
│   ├── report.md                      informe generado
│   └── evidence/                      capturas (NO se suben a Git)
├── checklists/                        qué probar por tipo de fallo
├── templates/                         plantillas de hallazgo e informe
├── data/                              lista pública descargada (no se sube)
└── DASHBOARD.md                       panel generado
```

**Nunca se guardan** contraseñas, cookies, tokens ni datos de terceros. El generador de informes bloquea el texto que parezca una credencial, y `.gitignore` excluye la evidencia cruda.
