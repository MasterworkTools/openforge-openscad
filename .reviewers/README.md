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
- `npm run lint` is clean on main. Any lint error is a finding.
- Production hosting is moving into tofu (openforge_openscad-1ur): the bucket
  in `terraform/`, deployed by the workflow on push to main.
  `terraform-reviewer` owns `terraform/**` and `.github/workflows/**`.

## How the pack runs

Each reviewer runs on its own and reports without coordination. Silence is
not an endorsement.

`general-reviewer` runs on every PR, every round. The starters are not
loaded. `code-reviewer` is covered by `general-reviewer`, and
`silent-failure-hunter` by `wasm-worker-build-reviewer` (worker errors,
scripts) and `react-ts-reviewer` (async loads). `pr-test-analyzer` is
covered by `customizer-parser-reviewer`, the only area with tests. The
others would be noise on a fork this size.
