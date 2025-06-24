#!/usr/bin/env python3
"""list_source_files.py
Unified utility for building an `input.json` that maps file-paths → file-contents for the i18n pipeline.
It supersedes:
  • list_component_files.py
  • list_translatable_files.py

Usage examples
--------------
# List all component TS & HTML files
python list_source_files.py --types components

# List pipe & directive source files
python list_source_files.py --types pipes,directives

# List services, pipes *and* directives
python list_source_files.py --types services,pipes,directives

This leaves the JSON structure unchanged so downstream scripts (i18n-extraction.py, etc.) work untouched.
"""

import argparse
import json
import os
from pathlib import Path
from typing import List, Dict

# -------------------------------- helpers -------------------------------- #

SUFFIX_MAP: Dict[str, List[str]] = {
    "components": [".component.ts", ".component.html"],
    "services": [".service.ts"],
    "pipes": [".pipe.ts"],
    "directives": [".directive.ts"],
}

ALL_TYPES = ",".join(SUFFIX_MAP.keys())


def find_files(root_dir: str, suffixes: List[str]) -> List[str]:
    """Recursively walk *root_dir* and return absolute paths ending with any of *suffixes*."""
    matches: List[str] = []
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if any(filename.endswith(suf) for suf in suffixes):
                matches.append(os.path.join(dirpath, filename))
    return matches


def gather_source_files(types: List[str]) -> Dict[str, str]:
    """Return mapping of file_path → content for the requested types."""
    # Build list of suffixes we care about.
    suffixes: List[str] = []
    for t in types:
        suffixes.extend(SUFFIX_MAP[t])

    # Mobile app has a single src/app structure
    root = "src/app"

    files: Dict[str, str] = {}
    if os.path.exists(root):
        for file_path in find_files(root, suffixes):
            with open(file_path, "r", encoding="utf-8") as f:
                files[file_path] = f.read()
    return files


# ------------------------------- main cli -------------------------------- #

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Create an input.json containing file-paths and their contents "
            "for the i18n extraction pipeline."
        )
    )
    parser.add_argument(
        "--types",
        required=True,
        help=f"Comma-separated list of file categories to include. Available: {ALL_TYPES}",
    )
    args = parser.parse_args()

    types_requested = [t.strip() for t in args.types.split(",") if t.strip()]

    unknown = [t for t in types_requested if t not in SUFFIX_MAP]
    if unknown:
        raise SystemExit(f"Unknown type(s): {', '.join(unknown)}. Valid values: {ALL_TYPES}")

    files_map = gather_source_files(types_requested)

    # Decide output dir – each primary type gets its own pluralised folder
    plural_map = {
        "components": "components",
        "services": "services",
        "pipes": "pipes",
        "directives": "directives",
    }

    if len(types_requested) == 1:
        # Single category →  e.g. components
        folder = plural_map[types_requested[0]]
        out_dir = Path(f"src/scripts/i18n/{folder}")
    else:
        # Multiple categories – join their plural forms to keep uniqueness
        joined = "-".join(sorted(plural_map[t] for t in types_requested))
        out_dir = Path(f"src/scripts/i18n/{joined}")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "input.json"
    with open(out_path, "w", encoding="utf-8") as out_f:
        json.dump(files_map, out_f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(files_map)} files → {out_path}") 