"""Módulo 7 — Report Generator (generador de informes).

Crea un hallazgo nuevo o convierte findings/<programa>/<id>/finding.json en un
informe Markdown (report.md) listo para REVISAR. Nunca envía nada a ninguna
plataforma: el envío lo hace siempre una persona.

Uso:
  python3 modules/report_generator.py new <programa> "<título>"
  python3 modules/report_generator.py build findings/<programa>/<id>/finding.json
"""
from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

from common import FINDINGS_DIR, PROGRAMS_DIR, TEMPLATES_DIR, find_secrets, load_json, save_json, slug
from risk_classifier import score, severity

ESTADOS = ("candidato", "en-validacion", "confirmado", "descartado", "reportado")


def cmd_new(program: str, title: str) -> None:
    base = FINDINGS_DIR / slug(program)
    n = len([p for p in base.glob("*") if p.is_dir()]) + 1 if base.exists() else 1
    fid = f"{date.today():%Y%m%d}-{n:02d}-{slug(title)[:40]}"
    dest = base / fid / "finding.json"
    save_json(dest, load_json(TEMPLATES_DIR / "finding.example.json") | {
        "id": fid, "title": title, "program": program, "created": date.today().isoformat(),
    })
    (dest.parent / "evidence").mkdir(exist_ok=True)
    print(f"Hallazgo creado: {dest.relative_to(FINDINGS_DIR.parent)}")


def validate(f: dict) -> list[str]:
    errors = []
    if f.get("status") not in ESTADOS:
        errors.append(f"status debe ser uno de {ESTADOS}")
    if f.get("status") in ("confirmado", "reportado"):
        if not f.get("evidence"):
            errors.append("No se puede marcar como confirmado sin evidencia.")
        if len(f.get("steps_to_reproduce", [])) < 2:
            errors.append("Un hallazgo confirmado necesita pasos de reproducción completos.")
        if not f.get("impact_demonstrated"):
            errors.append("Falta el impacto DEMOSTRADO (no supuesto).")
        if not f.get("validation", {}).get("own_accounts_only"):
            errors.append("Confirma que solo usaste cuentas/datos propios (validation.own_accounts_only).")
        scope = PROGRAMS_DIR / slug(f.get("program", "")) / "scope.json"
        if not scope.exists() or not load_json(scope).get("verified_by_human"):
            errors.append("El programa no tiene ficha de alcance verificada.")
    return errors


def bullet(items) -> str:
    return "\n".join(f"- {i}" for i in items) if items else "_(pendiente)_"


def numbered(items) -> str:
    return "\n".join(f"{n}. {i}" for n, i in enumerate(items, 1)) if items else "_(pendiente)_"


def cmd_build(path: Path) -> None:
    f = load_json(path)
    errors = validate(f)
    if errors:
        print("⛔ No genero el informe:")
        print("\n".join(f"  - {e}" for e in errors))
        sys.exit(1)
    vec = f.get("cvss_vector", "")
    try:
        s = score(vec)
        sev = f"{severity(s)} (CVSS 3.1 {s} — `{vec}`)"
    except (ValueError, KeyError):
        sev = "_(sin vector CVSS válido)_"
    aviso = "" if f["status"] in ("confirmado", "reportado") else (
        f"> ⚠️ **Estado: {f['status'].upper()}** — NO es una vulnerabilidad confirmada. "
        "No enviar hasta validarla.\n\n")
    tpl = (TEMPLATES_DIR / "report.md").read_text(encoding="utf-8")
    out = tpl.format(
        aviso=aviso,
        title=f["title"], id=f["id"], status=f["status"], program=f["program"],
        policy=f.get("policy_reference", "_(pendiente)_"),
        asset=f.get("asset", "_(pendiente)_"), vuln_class=f.get("vuln_class", "_(pendiente)_"),
        severity=sev, summary=f.get("summary", "_(pendiente)_"),
        steps=numbered(f.get("steps_to_reproduce", [])),
        evidence=bullet(f.get("evidence", [])),
        impact=f.get("impact_demonstrated") or "_(pendiente: describe solo lo demostrado)_",
        false_positives=bullet(f.get("possible_false_positives", [])),
        remediation=f.get("remediation", "_(pendiente)_"),
        fix_verification=numbered(f.get("fix_verification", [])),
        references=bullet(f.get("references", [])),
        date=date.today().isoformat(),
    )
    leaks = find_secrets(out)
    if leaks:
        print("⛔ El informe parece contener credenciales/tokens. Censúralos antes:")
        print("\n".join(f"  - {l}" for l in leaks))
        sys.exit(1)
    dest = path.parent / "report.md"
    dest.write_text(out, encoding="utf-8")
    print(f"✅ Informe generado: {dest}")


def main() -> None:
    if len(sys.argv) == 4 and sys.argv[1] == "new":
        cmd_new(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 3 and sys.argv[1] == "build":
        cmd_build(Path(sys.argv[2]))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
