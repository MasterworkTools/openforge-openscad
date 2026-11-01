# Configuration notes

Neither Gemini Code Assist nor Cursor Bugbot is installed on this repository.
The agent pack is the whole review, so the loop must not trigger either bot or
wait for one.

# Guidelines

## The repo

A fork of seasick/openscad-web-gui: React/TypeScript + MUI, with OpenSCAD
compiled to WASM running in a web worker. It serves the OpenForge base
generators in `public/scad/`.

- `public/scad/` is vendored from MasterworkTools/openforge-bases by
  `scripts/sync-bases.sh <sha>`. No reviewer reviews scad source, except
  `scad-wiring-reviewer` for wiring and `customizer-parser-reviewer` for the
  customizer annotations the UI is built from.
- CI runs lint and test only on pushes to main, never on PRs. A reviewer that
  needs lint, test or build output runs it and quotes it.
- `npm run lint` was already red on main when this roster landed
  (openforge_openscad-6vc). Only new errors are findings.
- The site is deployed by hand to S3/CloudFront. The workflow's GitHub Pages
  job is dead (openforge_openscad-33m). Nobody flags a missing deploy step.

## How the pack runs

Each reviewer runs on its own and reports without coordination. Silence is
not an endorsement.

`general-reviewer` runs on every PR, every round. The starters are not
loaded. `code-reviewer` is covered by `general-reviewer`, and
`silent-failure-hunter` by `wasm-worker-build-reviewer` (worker errors,
scripts) and `react-ts-reviewer` (async loads). `pr-test-analyzer` is
covered by `customizer-parser-reviewer`, the only area with tests. The
others would be noise on a fork this size.
