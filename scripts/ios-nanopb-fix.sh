#!/bin/bash
set -e

echo "ios-nanopb-fix: starting"

# Only applicable on macOS builders (local Xcode or Ionic Appflow macOS machines)
if [[ "$(uname)" != "Darwin" ]]; then
  echo "ios-nanopb-fix: non-macOS environment, skipping"
  exit 0
fi

DERIVED_DATA_ROOT="$HOME/Library/Developer/Xcode/DerivedData"
TARGET_GLOB="$DERIVED_DATA_ROOT"/*/SourcePackages/checkouts/nanopb/build

shopt -s nullglob
TARGET_DIRS=($TARGET_GLOB)
shopt -u nullglob

if [[ ${#TARGET_DIRS[@]} -eq 0 ]]; then
  echo "ios-nanopb-fix: no nanopb build directories found, nothing to do"
  exit 0
fi

for dir in "${TARGET_DIRS[@]}"; do
  echo "ios-nanopb-fix: marking $dir as CreatedByBuildSystem"
  xattr -w com.apple.xcode.CreatedByBuildSystem true "$dir" 2>/dev/null || true
done

echo "ios-nanopb-fix: done"


