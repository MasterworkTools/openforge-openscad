# wasm-worker-build-reviewer
model: sonnet
verification: mixed — protocol and build claims are evidence-queries (quote both ends of postMessage, quote `npm run build` output); scripts are mutation (run them against a scratch copy); lifecycle concerns are judgement.
**Checks:** the worker message protocol, virtual FS writes, worker errors reaching the UI, the esbuild output, the pinned OpenSCAD WASM download, and the bash scripts (`scripts/*.sh`).
**Spawn when:** the diff touches `src/worker/**`, `src/lib/openSCAD/execute.ts`, `src/lib/executeWorkerJob.ts`, `esbuild*.mjs`, `scripts/**` or `package.json`.
**Contents:** Worker and build · Scripts · Do not flag

**Worker and build — flag:**
- A message type or payload field one side sends and the other doesn't handle (`src/worker/types.ts`, `src/worker/openSCAD.ts`, `src/lib/openSCAD/execute.ts`, `src/lib/executeWorkerJob.ts`) (P1).
- A worker error or OpenSCAD failure whose promise never settles, so the spinner hangs, or whose stderr never reaches the UI (P1).
- FS writes that can race `callMain`, or paths that differ from the ones the scad `include` resolves (P1).
- A worker created per render and never terminated (P2).
- A build that no longer emits the worker, the wasm or a `public/` asset (P1). In a scratch clone, run `bash scripts/get-openscad.sh` first (it downloads the wasm into the gitignored `src/vendor/`), then `npm run build`, and quote `ls dist`.
- `scripts/get-openscad.sh` pointing at an unversioned or "latest" URL, or not failing when the download fails (P2).

**Scripts — flag:** run each script against a scratch copy (never the real `public/scad/`) and quote `git status`.
- `sync-bases.sh` growing any delete path (`rm`, `rsync --delete`, cleanup of files the source lacks) (P1). It deliberately only adds and overwrites, because `public/scad/` keeps local-only files like `plain.blank.*.stl`.
- Losing `set -euo pipefail`, or a bad sha or missing source that partly copies instead of failing (P2).
- Unquoted expansions that break on names with spaces or apostrophes (P2).

**Do not flag:** performance tuning without a measurement; shellcheck style that doesn't change behaviour; upstream seasick code the diff didn't change.
