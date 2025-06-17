#!/usr/bin/env python3
"""
inline_and_diff.py

1. List all source files for a given type, and create a map of <file_path>: <file_content> (input.json).
2. Apply inline translation to each file and write it to inlined_translation_file.json.
3. Compare the diff of input.json and inlined_translation_file.json, writing unified diffs to a diffs/ directory.

Usage:
python inline_and_diff.py --type components
python inline_and_diff.py --type services
"""

from __future__ import annotations
import argparse
import difflib
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List

# --------------------------- CLI & paths --------------------------- #

parser = argparse.ArgumentParser(
    description="Inline translations and write diffs for Angular files.")
parser.add_argument('--type', required=True, choices=['components', 'services', 'pipes', 'directives'],
                    help='File category to process')
parser.add_argument('--skip-diff', action='store_true', help='Only inline, do not generate diff output')
args = parser.parse_args()

type_name: str = args.type

base_dir = Path(f"src/scripts/i18n/{type_name}")
base_dir.mkdir(parents=True, exist_ok=True)

# ---------------------- 1. List source files  ---------------------- #
SUFFIX_MAP = {
    "components": [".component.ts", ".component.html"],
    "services": [".service.ts"],
    "pipes": [".pipe.ts"],
    "directives": [".directive.ts"],
}

def find_files(root_dir: str, suffixes: List[str]) -> List[str]:
    matches: List[str] = []
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if any(filename.endswith(suf) for suf in suffixes):
                matches.append(os.path.join(dirpath, filename))
    return matches

# Mobile app has a single src/app structure
root = "src/app"
suffixes = SUFFIX_MAP[type_name]
all_files = []
if os.path.exists(root):
    all_files.extend(find_files(root, suffixes))

input_map = {file_path: Path(file_path).read_text(encoding='utf-8') for file_path in all_files}
input_json_path = base_dir / 'input.json'
with open(input_json_path, 'w', encoding='utf-8') as f:
    json.dump(input_map, f, ensure_ascii=False, indent=2)
print(f"Wrote {len(input_map)} files to {input_json_path}")

# ---------------------- 2. Inline translation  --------------------- #
# Load translation JSON (en.json)
en_json_path = Path('src/assets/i18n/en.json')
if not en_json_path.exists():
    sys.exit(f"Translation file not found: {en_json_path}")
with open(en_json_path, 'r', encoding='utf-8') as f:
    translations: Dict = json.load(f)

def get_translation(key: str, tree: Dict):
    cur = tree
    for part in key.split('.'):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur

def kebab_to_camel(s: str) -> str:
    parts = s.split('-')
    return parts[0] + ''.join(w.capitalize() for w in parts[1:])

def extract_top_level_key(path: str):
    m = re.search(r'/([^/]+)/\1\.component\.(ts|html)$', path)
    if not m:
        m = re.search(r'/((?:feature-|ui-)?[a-z0-9-]+)\.component\.(ts|html)$', path)
    if m:
        kebab = m.group(1)
    else:
        m = re.search(r'/([^/]+)/\1\.(service|pipe|directive)\.ts$', path)
        if not m:
            m = re.search(r'/((?:feature-|ui-)?[a-z0-9-]+)\.(service|pipe|directive)\.ts$', path)
        if not m:
            return None
        kebab = m.group(1)
    if kebab.startswith('feature-'):
        kebab = kebab[len('feature-'):]
    if kebab.startswith('ui-'):
        kebab = kebab[len('ui-'):]
    return kebab_to_camel(kebab)

interpolation_re = re.compile(r"\{\{\s*(['\"])([\w.]+)\1\s*\|\s*transloco\s*\}\}")
html_bind_re = re.compile(r"(['\"])([\w.]+)\1\s*\|\s*transloco")
ts_call_re = re.compile(r"(?:\w+\.)?translocoService\.translate\(\s*(['\"])([\w.]+)\1\s*(?:,\s*\{([^}]*)\})?\s*\)")
attr_binding_redundant_quotes = re.compile(r'(\[[\w-]+\])="\'([^\']*)\'"')
str_double_quote_re = re.compile(r':\s*"([^"]*?)"')

def replace_in_file(path: str, content: str) -> str:
    matched_key = extract_top_level_key(path)
    if matched_key is None:
        return content
    if type_name in {'services', 'pipes', 'directives'}:
        group = type_name
        if group not in translations or matched_key not in translations[group]:
            return content
        key_prefix = f"{group}.{matched_key}."
    else:
        if matched_key not in translations:
            return content
        key_prefix = f"{matched_key}."
    def _interpolation(m):
        key = m.group(2)
        if key.startswith(key_prefix):
            val = get_translation(key, translations)
            if isinstance(val, str):
                return val
        return m.group(0)
    def _html(m):
        key = m.group(2)
        if key.startswith(key_prefix):
            val = get_translation(key, translations)
            if isinstance(val, str):
                return f"'{val}'"
        return m.group(0)
    def _ts(m):
        key = m.group(2)
        params_str = m.group(3)
        if key.startswith(key_prefix):
            val = get_translation(key, translations)
            if isinstance(val, str):
                if params_str:
                    params = [p.strip() for p in params_str.split(',')]
                    for p in params:
                        val = val.replace('{{' + p + '}}', f'${{{p}}}')
                    return f"`{val}`"
                return f"'{val}'"
        return m.group(0)
    new = interpolation_re.sub(_interpolation, content)
    new = html_bind_re.sub(_html, new)
    new = ts_call_re.sub(_ts, new)
    if path.endswith(('.ts', '.js')):
        new = str_double_quote_re.sub(lambda m: f": '{m.group(1)}'", new)
    new = attr_binding_redundant_quotes.sub(r'\1="\2"', new)
    return new

inlined_map = {p: replace_in_file(p, c) for p, c in input_map.items()}
inlined_json_path = base_dir / 'inlined_translation_file.json'
with open(inlined_json_path, 'w', encoding='utf-8') as f:
    json.dump(inlined_map, f, ensure_ascii=False, indent=2)
print(f"Wrote inlined translations to {inlined_json_path}")

# ---------------------- 3. Diff output  ---------------------------- #
if args.skip_diff:
    sys.exit(0)

diffs_dir = base_dir / 'diffs'
diffs_dir.mkdir(exist_ok=True)
diff_count = 0
for file_path, old_content in input_map.items():
    new_content = inlined_map.get(file_path)
    if new_content is None or old_content == new_content:
        continue
    diff_lines = list(
        difflib.unified_diff(
            old_content.splitlines(),
            new_content.splitlines(),
            fromfile='before',
            tofile='after',
            lineterm=''
        )
    )
    if not diff_lines:
        continue
    safe_name = file_path.replace('/', '__').replace('\\', '__') + '.diff'
    diff_path = diffs_dir / safe_name
    with open(diff_path, 'w', encoding='utf-8') as df:
        df.write('\n'.join(diff_lines))
    diff_count += 1
print(f"Generated diff for {diff_count} file(s) → {diffs_dir}/") 