"""Módulo 2 — Scope Validator (validador de alcance).

Regla de oro: TODO está prohibido salvo lo que el programa autoriza
explícitamente. Si la ficha no está verificada por una persona, se bloquea todo.

Uso:
  python3 modules/scope_validator.py <programa> <url-o-host>
  python3 modules/scope_validator.py mi-app https://api.ejemplo.com/v1/users

Código de salida: 0 = dentro del alcance, 1 = BLOQUEADO.
"""
from __future__ import annotations

import fnmatch
import sys
from urllib.parse import urlparse

from common import PROGRAMS_DIR, load_json, slug


def host_of(target: str) -> str:
    if "://" not in target:
        target = "https://" + target
    return (urlparse(target).hostname or "").lower().rstrip(".")


def matches(host: str, pattern: str) -> bool:
    """'*.ejemplo.com' cubre subdominios, NO el dominio raíz (como en la mayoría de programas)."""
    pattern = pattern.lower().strip()
    if "://" in pattern:
        pattern = host_of(pattern)
    if pattern.startswith("*."):
        return host.endswith(pattern[1:]) and host != pattern[2:]
    return fnmatch.fnmatch(host, pattern)


def check(program: str, target: str) -> tuple[bool, str]:
    path = PROGRAMS_DIR / slug(program) / "scope.json"
    if not path.exists():
        return False, f"No existe la ficha {path}. Sin ficha no hay autorización."
    scope = load_json(path)
    if not scope.get("verified_by_human"):
        return False, ("La ficha no está verificada por una persona (verified_by_human=false). "
                       "Lee la política oficial y complétala antes de probar nada.")
    host = host_of(target)
    if not host:
        return False, "No pude interpretar el objetivo."
    for item in scope.get("out_of_scope", []):
        if matches(host, item["asset"]):
            return False, f"FUERA DE ALCANCE: {host} coincide con exclusión '{item['asset']}'."
    for item in scope.get("in_scope", []):
        if matches(host, item["asset"]):
            note = item.get("notes", "")
            return True, (f"DENTRO DEL ALCANCE: {host} coincide con '{item['asset']}' "
                          f"({item.get('type', 'web')}). {note}".strip())
    return False, f"BLOQUEADO: {host} no aparece en el alcance autorizado de '{scope['program']}'."


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    ok, msg = check(sys.argv[1], sys.argv[2])
    print(("✅ " if ok else "⛔ ") + msg)
    if ok:
        rules = load_json(PROGRAMS_DIR / slug(sys.argv[1]) / "scope.json").get("rules", {})
        print("Recuerda las reglas del programa:")
        for k, v in rules.items():
            if v not in (None, "", [], {}):
                print(f"  - {k}: {v}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
