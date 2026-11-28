"""Módulo 5 — Risk Classifier (clasificador de riesgo) con CVSS v3.1.

Calcula la puntuación base oficial CVSS 3.1 (especificación de FIRST).
La severidad final la decide siempre el programa; esto es una ESTIMACIÓN.

Uso:
  python3 modules/risk_classifier.py "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N"
"""
from __future__ import annotations

import math
import sys

W = {
    "AV": {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.2},
    "AC": {"L": 0.77, "H": 0.44},
    "UI": {"N": 0.85, "R": 0.62},
    "CIA": {"H": 0.56, "L": 0.22, "N": 0.0},
}
PR_U = {"N": 0.85, "L": 0.62, "H": 0.27}
PR_C = {"N": 0.85, "L": 0.68, "H": 0.5}
REQUIRED = ["AV", "AC", "PR", "UI", "S", "C", "I", "A"]

EXPLICACION = {
    "AV": "Vector de ataque (N=Internet, A=red adyacente, L=local, P=físico)",
    "AC": "Complejidad (L=baja, H=alta)",
    "PR": "Privilegios necesarios (N=ninguno, L=usuario normal, H=admin)",
    "UI": "Interacción de la víctima (N=no hace falta, R=la víctima debe hacer algo)",
    "S": "Alcance (U=no cambia, C=afecta a otro componente)",
    "C": "Confidencialidad (H/L/N)",
    "I": "Integridad (H/L/N)",
    "A": "Disponibilidad (H/L/N)",
}


def roundup(x: float) -> float:
    i = round(x * 100000)
    return i / 100000.0 if i % 10000 == 0 else (math.floor(i / 10000) + 1) / 10.0


def parse(vector: str) -> dict[str, str]:
    parts = vector.strip().split("/")
    if parts and parts[0].startswith("CVSS:"):
        parts = parts[1:]
    m = dict(p.split(":", 1) for p in parts if ":" in p)
    missing = [k for k in REQUIRED if k not in m]
    if missing:
        raise ValueError(f"Faltan métricas: {', '.join(missing)}")
    return m


def score(vector: str) -> float:
    m = parse(vector)
    changed = m["S"] == "C"
    iss = 1 - (1 - W["CIA"][m["C"]]) * (1 - W["CIA"][m["I"]]) * (1 - W["CIA"][m["A"]])
    impact = 7.52 * (iss - 0.029) - 3.25 * (iss - 0.02) ** 15 if changed else 6.42 * iss
    pr = (PR_C if changed else PR_U)[m["PR"]]
    expl = 8.22 * W["AV"][m["AV"]] * W["AC"][m["AC"]] * pr * W["UI"][m["UI"]]
    if impact <= 0:
        return 0.0
    total = 1.08 * (impact + expl) if changed else impact + expl
    return roundup(min(total, 10))


def severity(s: float) -> str:
    if s == 0:
        return "Ninguna"
    if s < 4:
        return "Baja"
    if s < 7:
        return "Media"
    if s < 9:
        return "Alta"
    return "Crítica"


def main() -> None:
    if len(sys.argv) != 2:
        print(__doc__)
        for k, v in EXPLICACION.items():
            print(f"  {k}: {v}")
        sys.exit(1)
    s = score(sys.argv[1])
    print(f"Puntuación CVSS 3.1: {s}  →  Severidad estimada: {severity(s)}")


if __name__ == "__main__":
    main()
