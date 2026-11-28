"""Módulo 8 — Research Dashboard (panel de investigación).

Genera DASHBOARD.md con los programas en seguimiento y los hallazgos por estado.

Uso:
  python3 modules/dashboard.py
"""
from __future__ import annotations

from collections import Counter
from datetime import date

from common import FINDINGS_DIR, PROGRAMS_DIR, ROOT, load_json
from report_generator import validate


def main() -> None:
    lines = [f"# Panel de investigación\n\n_Actualizado: {date.today().isoformat()}_\n",
             "## Programas en seguimiento\n",
             "| Programa | Plataforma | Alcance verificado | Activos autorizados | Recompensas verificadas |",
             "|---|---|---|---|---|"]
    for sc in sorted(PROGRAMS_DIR.glob("*/scope.json")):
        s = load_json(sc)
        lines.append(f"| {s['program']} | {s.get('platform', '')} | "
                     f"{'✅ ' + str(s.get('verified_on')) if s.get('verified_by_human') else '⛔ no'} | "
                     f"{len(s.get('in_scope', []))} | "
                     f"{'✅' if s.get('rewards', {}).get('verificado') else '—'} |")
    findings = [load_json(f) for f in sorted(FINDINGS_DIR.glob("*/*/finding.json"))]
    counts = Counter(f["status"] for f in findings)
    lines += ["\n## Hallazgos\n",
              " · ".join(f"**{k}**: {v}" for k, v in counts.items()) or "_Ninguno todavía._", ""]
    if findings:
        lines += ["| ID | Programa | Título | Estado |", "|---|---|---|---|"]
        lines += [f"| `{f['id']}` | {f['program']} | {f['title']} | {f['status']}"
                  f"{' ⚠️ sin validar' if validate(f) else ''} |" for f in findings]
    (ROOT / "DASHBOARD.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"✅ Panel actualizado: {ROOT / 'DASHBOARD.md'}")


if __name__ == "__main__":
    main()
