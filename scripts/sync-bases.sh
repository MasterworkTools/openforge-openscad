#!/bin/bash
# Copy the scad files and wall-base blanks from openforge-bases at a pinned commit.
# Usage: scripts/sync-bases.sh <sha> [path to openforge-bases checkout]
set -euo pipefail

SHA=${1:?usage: sync-bases.sh <sha> [openforge-bases dir]}
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
BASES_DIR=${2:-$SCRIPT_DIR/../../openforge-bases}
SCAD_DIR=$SCRIPT_DIR/../public/scad

git -C "$BASES_DIR" fetch -q origin
git -C "$BASES_DIR" ls-tree --name-only "$SHA" | grep -E '\.scad$|\.blank\.[A-Z]+\.stl$' |
  while read -r f; do
    git -C "$BASES_DIR" show "$SHA:$f" > "$SCAD_DIR/$f"
  done
