#!/bin/bash
# Print one line per scad/JS wiring problem at a git ref (default HEAD); always exits 0.
# Diff the output at the base and the head to see what a PR introduced.
# Usage: .reviewers/bin/check-wiring.sh [ref]
set -euo pipefail

REF=${1:-HEAD}
SCAD=public/scad
show() { git show "$REF:$1"; }
files=$(git ls-tree --name-only "$REF" "$SCAD/" | xargs -n1 basename)
app=$(show src/App.tsx | grep -o "/scad/[^']*" | sed 's|/scad/||')
stls=$(show src/components/Workspace/Customizer.tsx | grep -o "url: '/scad/[^']*" | sed "s|url: '/scad/||")

for f in $app $stls; do
  grep -qxF "$f" <<<"$files" || echo "listed but missing on disk: $f"
done

for f in $(grep -E '\.scad$' <<<"$files"); do
  for inc in $(show "$SCAD/$f" | grep -oE '^\s*(include|use)\s*<[^>]+>' | sed -E 's/.*<(.*)>/\1/'); do
    grep -qxF "$inc" <<<"$app" || echo "$f includes unregistered: $inc"
  done
done

for f in $(grep -E '^bases-.*\.scad$' <<<"$files"); do
  grep -qxF "$f" <<<"$app" || echo "base not in App.tsx: $f"
done

# ponytail: parses only bases-wall-primary.scad's texture_files/size_data tables; extend if another scad builds import names
wp=$(show "$SCAD/bases-wall-primary.scad")
textures=$(sed -n '/^texture_files/,/^\]/p' <<<"$wp" | grep -oE '\[\s*"[^"]*",\s*"[^"]*"' | sed -E 's/.*,\s*"(.*)"/\1/' | grep -vx plain)
sizes=$(sed -n '/^size_data/,/^\]/p' <<<"$wp" | grep -oE '"[A-Z]+"\s*\]' | grep -oE '[A-Z]+')
labels=$(sed -n '/^texture_files/,/^\]/p' <<<"$wp" | grep -oE '\[\s*"[^"]*"' | sed -E 's/\[\s*"//; s/"$//')
options=$(grep -E '^TEXTURE\s*=' <<<"$wp" | sed -E 's/.*\[(.*)\].*/\1/' | tr ',' '\n' | sed -E 's/^\s+|\s+$//g')
while read -r o; do grep -qxF "$o" <<<"$labels" || echo "TEXTURE option has no texture_files row: $o"; done <<<"$options"
while read -r l; do grep -qxF "$l" <<<"$options" || echo "texture_files row not a TEXTURE option: $l"; done <<<"$labels"
for t in $textures; do
  for s in $sizes; do
    b="$t.blank.$s.stl"
    grep -qxF "$b" <<<"$files" || echo "blank missing on disk: $b"
    grep -qxF "$b" <<<"$stls" || echo "blank not in fileImportMap: $b"
  done
done
exit 0
