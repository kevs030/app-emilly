"""Utilidades compartidas por todos los módulos del laboratorio.

Solo usa la biblioteca estándar de Python: no hay que instalar nada.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PROGRAMS_DIR = ROOT / "programs"
FINDINGS_DIR = ROOT / "findings"
TEMPLATES_DIR = ROOT / "templates"

# Patrones que nunca deben guardarse en el proyecto (credenciales, tokens).
SECRET_PATTERNS = [
    re.compile(r"(?i)authorization:\s*bearer\s+[a-z0-9._\-]{16,}"),
    re.compile(r"(?i)\b(api[_-]?key|secret|password|passwd|token)\b\s*[:=]\s*['\"]?[^\s'\"]{8,}"),
    re.compile(r"eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}"),  # JWT
    re.compile(r"\bsk-[a-zA-Z0-9_\-]{20,}"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"(?i)cookie:\s*[^\n]{20,}"),
]


def load_json(path: Path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def find_secrets(text: str) -> list[str]:
    """Devuelve fragmentos que parecen credenciales (para bloquear su guardado)."""
    hits = []
    for pat in SECRET_PATTERNS:
        for m in pat.finditer(text):
            frag = m.group(0)
            hits.append(frag[:12] + "…")
    return hits


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "sin-nombre"
