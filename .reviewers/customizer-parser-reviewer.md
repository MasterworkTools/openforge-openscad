# customizer-parser-reviewer
model: sonnet
verification: mutation — runs the parser on the scad the PR changes, or on a fixture with the new annotation shape, and quotes the parsed controls; never trusts a snapshot alone.
**Checks:** `src/lib/openSCAD/parseParameter.ts` turns every annotation form the shipped scad uses into the right control: options, ranges, steps, groups, types. Also checks that its snapshot tests pin each change.
**Spawn when:** the diff touches `src/lib/openSCAD/parseParameter.ts`, `tests/openSCADparseParameters.test.ts`, `tests/fixtures/**` or `tests/__snapshots__/**`, or changes a customizer annotation line in `public/scad/**` (a `// [...]` option list, a `//<number>` step, or a `/* [Group] */` header).
**Contents:** Forms the shipped scad uses · How to prove it · Flag · Do not flag

The UI has no hand-written controls. Customizer.tsx renders whatever `parseParameter.ts` extracts from the comments in the selected scad file, so a parser miss silently removes or mistypes an option.

**Forms the shipped scad uses** (grep `public/scad/` to confirm before relying on this list):
- `NAME = "x"; // [a, b, c]` and `// [value:Label, ...]`, with labels that contain spaces, apostrophes (`Necromancer's Ossuary`), hyphens, parentheses and inch marks.
- `NAME = 6; // [1,2,3]` numeric options; `NAME = 2.6; //.01` step; `// [min:max]` and `// [min:step:max]` ranges.
- `/* [Group] */` headers and `/* [Hidden] */`; parsing stops at the first module.

**How to prove it:**

Run `npx jest tests/openSCADparseParameters.test.ts`. For a sync PR, parse each changed scad file in a scratch clone (`git clone --shared`, symlink `node_modules`): copy it into `tests/fixtures/openSCAD/` there, run jest, and quote the controls from the new snapshot. Never add a fixture to the real working tree. `npx ts-node` works only if ts-node is already installed; it isn't a dependency, so don't let npx download it.

**Flag:**
- A shipped scad parameter that parses wrong at the head: a lost control, the wrong type, wrong or truncated options, or a missing step (P1).
- A parser change that no fixture pins (P2).
- A snapshot update with no matching code or fixture change, or one larger than the change explains (P2: snapshot churn hides regressions).

**Do not flag:** OpenSCAD customizer features no scad here uses, or the parser's internal style when its output is right.
