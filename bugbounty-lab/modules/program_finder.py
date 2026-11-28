"""Módulo 1 — Program Finder (buscador de programas).

Descarga y filtra la lista pública y comunitaria de programas de bug bounty de
ProjectDiscovery (https://github.com/projectdiscovery/public-bugbounty-programs).

IMPORTANTE: esa lista es un PUNTO DE PARTIDA, no una autorización. Cada
programa debe verificarse en su página oficial (ver docs/03-verificar-politicas.md)
antes de tocar cualquier activo.

Uso:
  python3 modules/program_finder.py update                 # descarga la lista (solo lectura)
  python3 modules/program_finder.py list --bounty --platform hackerone --web
  python3 modules/program_finder.py list --search shop
  python3 modules/program_finder.py stats
  python3 modules/program_finder.py track <nombre>         # crea la ficha programs/<nombre>/scope.json
"""
from __future__ import annotations

import argparse
import sys
import urllib.request
from collections import Counter
from datetime import date
from urllib.parse import urlparse

from common import DATA_DIR, PROGRAMS_DIR, load_json, save_json, slug

SOURCE_URL = (
    "https://raw.githubusercontent.com/projectdiscovery/"
    "public-bugbounty-programs/main/dist/data.json"
)
DATA_FILE = DATA_DIR / "public-programs.json"

PLATFORMS = {
    "hackerone": "hackerone.com",
    "bugcrowd": "bugcrowd.com",
    "intigriti": "intigriti.com",
    "yeswehack": "yeswehack.com",
    "hackenproof": "hackenproof.com",
    "immunefi": "immunefi.com",
}


def platform_of(url: str) -> str:
    host = urlparse(url).hostname or ""
    for name, dom in PLATFORMS.items():
        if host == dom or host.endswith("." + dom):
            return name
    return "propio/otro"


def cmd_update(_args) -> None:
    print(f"Descargando lista pública desde {SOURCE_URL} …")
    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "bugbounty-lab/0.1"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read()
    import json

    data = json.loads(raw)
    data["_descargado"] = date.today().isoformat()
    data["_fuente"] = SOURCE_URL
    save_json(DATA_FILE, data)
    print(f"Guardados {len(data['programs'])} programas en {DATA_FILE.relative_to(DATA_DIR.parent)}")


def load_programs() -> list[dict]:
    if not DATA_FILE.exists():
        sys.exit("No hay datos. Ejecuta primero: python3 modules/program_finder.py update")
    return load_json(DATA_FILE)["programs"]


def filtered(args) -> list[dict]:
    out = []
    for p in load_programs():
        if args.bounty and not p.get("bounty"):
            continue
        if args.platform and platform_of(p["url"]) != args.platform:
            continue
        if args.web and not p.get("domains"):
            continue
        if args.search and args.search.lower() not in p["name"].lower():
            continue
        out.append(p)
    return out


def cmd_list(args) -> None:
    progs = filtered(args)
    print(f"{len(progs)} programas (datos comunitarios, SIN verificar):\n")
    for p in progs[: args.limit]:
        pay = "paga" if p.get("bounty") else "sin pago"
        print(f"- {p['name']:<32} {platform_of(p['url']):<12} {pay:<8} "
              f"dominios:{len(p.get('domains', [])):<4} {p['url']}")
    if len(progs) > args.limit:
        print(f"\n… y {len(progs) - args.limit} más (usa --limit).")


def cmd_stats(_args) -> None:
    progs = load_programs()
    paid = [p for p in progs if p.get("bounty")]
    print(f"Total: {len(progs)}  ·  con recompensa: {len(paid)}")
    print("Programas con recompensa por plataforma:")
    for name, n in Counter(platform_of(p["url"]) for p in paid).most_common():
        print(f"  {name:<14} {n}")


def cmd_track(args) -> None:
    matches = [p for p in load_programs() if p["name"].lower() == args.name.lower()]
    if not matches:
        sys.exit(f"No encontré '{args.name}'. Prueba: list --search {args.name}")
    p = matches[0]
    dest = PROGRAMS_DIR / slug(p["name"]) / "scope.json"
    if dest.exists():
        sys.exit(f"Ya existe {dest}. Edítalo a mano.")
    save_json(dest, {
        "program": p["name"],
        "platform": platform_of(p["url"]),
        "policy_url": p["url"],
        "offers_bounty_segun_lista": bool(p.get("bounty")),
        "dominios_segun_lista_NO_AUTORIZADOS_AUN": p.get("domains", []),
        "verified_by_human": False,
        "verified_on": None,
        "in_scope": [],
        "out_of_scope": [],
        "rules": {
            "max_requests_per_second": None,
            "automated_scanning_allowed": None,
            "required_headers": {},
            "test_accounts_policy": "",
            "prohibited": [],
            "notes": "Copia aquí las reglas EXACTAS de la página oficial.",
        },
        "rewards": {"verificado": False, "detalle": ""},
    })
    print(f"Ficha creada: {dest.relative_to(PROGRAMS_DIR.parent)}")
    print("Siguiente paso: rellena in_scope/out_of_scope/rules desde la página oficial "
          "y pon verified_by_human=true. Mientras no lo hagas, Scope Validator lo bloquea todo.")


def main() -> None:
    ap = argparse.ArgumentParser(description="Buscador de programas públicos de bug bounty")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("update").set_defaults(fn=cmd_update)
    sub.add_parser("stats").set_defaults(fn=cmd_stats)
    lp = sub.add_parser("list")
    lp.add_argument("--bounty", action="store_true", help="solo programas que pagan")
    lp.add_argument("--platform", choices=list(PLATFORMS) + ["propio/otro"])
    lp.add_argument("--web", action="store_true", help="solo programas con dominios listados")
    lp.add_argument("--search")
    lp.add_argument("--limit", type=int, default=30)
    lp.set_defaults(fn=cmd_list)
    tp = sub.add_parser("track")
    tp.add_argument("name")
    tp.set_defaults(fn=cmd_track)
    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
