#!/bin/bash
# Print one line per scad/JS wiring problem at a git ref (default HEAD); exits 0 unless git fails.
# Diff the output at the base and the head to see what a PR introduced.
# Usage: .reviewers/bin/check-wiring.sh [ref]   (from anywhere inside the repo)
set -euo pipefail

REF=${1:-HEAD}
SCAD=public/scad
cd "$(git rev-parse --show-toplevel)"
show() { git show "$REF:$1"; }
lines() { grep "$@" || true; }
files=$(git ls-tree --name-only "$REF" "$SCAD/" | xargs -r -n1 basename)
app=$(show src/App.tsx | lines -oE "/scad/[^'\"]*" | sed 's|/scad/||')
stls=$(show src/components/Workspace/Customizer.tsx | lines -oE "url: *['\"]/scad/[^'\"]*" | sed -E "s|url: *['\"]/scad/||")

for f in $app $stls; do
  grep -qxF "$f" <<<"$files" || echo "listed but missing on disk: $f"
done

# ponytail: line-based; an include inside a /* */ block or a second include on one line is misread
for f in $(lines -E '\.scad$' <<<"$files"); do
  for inc in $(show "$SCAD/$f" | lines -oE '^\s*(include|use)\s*<[^>]+>' | sed -E 's/.*<\s*(.*[^ ])\s*>/\1/'); do
    grep -qxF "$inc" <<<"$app" || echo "$f includes unregistered: $inc"
  done
done

for f in $(lines -E '^bases-.*\.scad$' <<<"$files"); do
  grep -qxF "$f" <<<"$app" || echo "base not in App.tsx: $f"
done

# ponytail: parses only bases-wall-primary.scad's texture_files/size_data tables; extend if another scad builds import names
if ! git cat-file -e "$REF:$SCAD/bases-wall-primary.scad" 2>/dev/null; then
  echo "no $SCAD/bases-wall-primary.scad at $REF: texture checks skipped"
  exit 0
fi
wp=$(show "$SCAD/bases-wall-primary.scad")
table() { sed -n "/^$1/,/^\]/p" <<<"$wp"; }
textures=$(table texture_files | lines -oE '\[\s*"[^"]*",\s*"[^"]*"' | sed -E 's/.*,\s*"(.*)"/\1/' | lines -vx plain)
sizes=$(table size_data | lines -oE '"[A-Z]+"\s*\]' | lines -oE '[A-Z]+')
labels=$(table texture_files | lines -oE '\[\s*"[^"]*"' | sed -E 's/\[\s*"//; s/"$//')
options=$(lines -E '^TEXTURE\s*=' <<<"$wp" | sed -E 's/.*\[(.*)\].*/\1/' | tr ',' '\n' | sed -E 's/^\s+|\s+$//g')
[ -n "$textures" ] && [ -n "$sizes" ] && [ -n "$options" ] || echo "bases-wall-primary.scad: TEXTURE, texture_files or size_data not found; texture checks incomplete"
while read -r o; do [ -z "$o" ] || grep -qxF "$o" <<<"$labels" || echo "TEXTURE option has no texture_files row: $o"; done <<<"$options"
while read -r l; do [ -z "$l" ] || grep -qxF "$l" <<<"$options" || echo "texture_files row not a TEXTURE option: $l"; done <<<"$labels"
for t in $textures; do
  for s in $sizes; do
    b="$t.blank.$s.stl"
    grep -qxF "$b" <<<"$files" || echo "blank missing on disk: $b"
    grep -qxF "$b" <<<"$stls" || echo "blank not in fileImportMap: $b"
  done
done
