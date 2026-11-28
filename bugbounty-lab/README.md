# AI Bug Bounty Researcher — Laboratorio

Entorno de investigación de vulnerabilidades **ético y autorizado**: busca programas públicos, verifica su alcance, organiza el análisis y genera informes revisables. Nunca envía nada solo y nunca prueba sin autorización.

## Empieza por aquí
1. [Capacidades del equipo y arquitectura](docs/01-capacidades-y-arquitectura.md)
2. [Herramientas gratuitas](docs/02-herramientas.md)
3. [Cómo encontrar programas y verificar su política](docs/03-verificar-politicas.md)
4. [Reglas obligatorias](docs/04-reglas-de-seguridad.md) ← léelas
5. [Plan por etapas](docs/05-plan-por-etapas.md)
6. [Primer objetivo propuesto](docs/06-primer-objetivo.md)

## Comandos (solo Python 3, sin instalar nada)

Ejecútalos desde la carpeta `bugbounty-lab/`.

| Para | Comando |
|---|---|
| Descargar la lista pública de programas | `python3 modules/program_finder.py update` |
| Ver cuántos pagan por plataforma | `python3 modules/program_finder.py stats` |
| Buscar programas que pagan con web | `python3 modules/program_finder.py list --bounty --web --platform hackerone` |
| Crear la ficha de alcance de un programa | `python3 modules/program_finder.py track "Nombre"` |
| Comprobar si un objetivo está en el alcance | `python3 modules/scope_validator.py <programa> <url>` |
| Calcular la severidad | `python3 modules/risk_classifier.py "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N"` |
| Crear un hallazgo | `python3 modules/report_generator.py new <programa> "Título"` |
| Generar su informe | `python3 modules/report_generator.py build findings/<programa>/<id>/finding.json` |
| Actualizar el panel | `python3 modules/dashboard.py` |

## Flujo A→J
A. Descubrir programas (`program_finder`) → B. Leer la política (`docs/03`) → C. Fijar los activos permitidos (`scope.json` + `scope_validator`) → D. Analizar dentro del alcance (`checklists/01`) → E. Anotar anomalías como `candidato` → F. Validar con cuentas propias (`checklists/00`), **con tu aprobación** → G. Calcular la severidad (`risk_classifier`) → H. Proponer la corrección → I. Generar el informe (`report_generator`) → J. **Tú** lo revisas y lo envías en la plataforma oficial.
