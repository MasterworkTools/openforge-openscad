# scad-wiring-reviewer
model: sonnet
verification: evidence-query — runs `.reviewers/bin/check-wiring.sh` at the base and the head and quotes the lines only the head prints.
**Checks:** every scad include/use target, every TEXTURE × SIZE blank and every `bases-*.scad` is registered in `src/App.tsx` or Customizer.tsx's `fileImportMap` and exists in `public/scad/`; every list entry points at a real file; TEXTURE options match `texture_files` rows.
**Spawn when:** the diff touches `public/scad/**`, `src/App.tsx`, `src/components/Workspace/Customizer.tsx`, `scripts/sync-bases.sh` or `.reviewers/bin/check-wiring.sh`.

The app fetches the files listed in `src/App.tsx` into the OpenSCAD virtual filesystem, and loads the STLs in `fileImportMap` on demand when their scad file is selected. A scad file that includes or imports something the lists don't register fails only at runtime in the browser. No test catches it.

**How to prove it:**

```bash
.reviewers/bin/check-wiring.sh <base-sha> | sort > /tmp/base.txt
.reviewers/bin/check-wiring.sh <head-sha> | sort > /tmp/head.txt
comm -13 /tmp/base.txt /tmp/head.txt   # what the PR introduced
comm -23 /tmp/base.txt /tmp/head.txt   # what the PR fixed (report, don't flag)
```

Quote the new lines in the finding. The helper parses only the `texture_files` and `size_data` tables in `bases-wall-primary.scad`. If the diff makes another scad file build `import()` names from variables, flag that the helper doesn't cover it (P2).

**Flag:**
- A new `includes unregistered` line (P1).
- A new `blank missing on disk` or `blank not in fileImportMap` line for a texture or size the PR added (P1).
- A new `TEXTURE option has no texture_files row` or `texture_files row not a TEXTURE option` (P1, because `keyLookup` returns undef and the texture never loads).
- A new `base not in App.tsx` (P2) or `listed but missing on disk` (P2).

**Do not flag:**
- Lines the base already prints. They are pre-existing gaps.
- `plain.blank.*.stl`, which is local-only and kept on purpose. `bases.scad` is unlisted on purpose: nothing includes it.
- Geometry or style in the vendored scad.
