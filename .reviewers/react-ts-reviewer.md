# react-ts-reviewer
model: sonnet
verification: mixed — lint is an evidence-query (eslint on the changed files at base and head, new errors quoted); hook, state and race findings are judgement unless shown by a test.
**Checks:** new eslint errors, hook dependency mistakes and stale closures, effects that loop or double-fire, async state set after a newer selection or unmount, new `any` or `@ts-ignore`.
**Spawn when:** the diff touches `src/**/*.ts` or `src/**/*.tsx` outside `src/worker/**`, or `.eslintrc*`/`tsconfig.json`. Skip when the only change is entries in a data list (App.tsx's file list, Customizer.tsx's `fileImportMap`); `scad-wiring-reviewer` owns those.

**How to prove lint:**

```bash
git stash -u   # or use a second worktree at the base
npx eslint <changed files> > /tmp/base.txt; git stash pop
npx eslint <changed files> > /tmp/head.txt
diff /tmp/base.txt /tmp/head.txt
```

Main already carries 16 lint errors (openforge_openscad-6vc). Only errors the head adds are findings.

**Flag:**
- A new eslint error (P2).
- A missing or wrong hook dependency that leaves a stale value, especially around preview/render calls and file loading in `Customizer.tsx` and the providers (P2; P1 if it renders the wrong model).
- An effect that sets state it depends on, so it loops or fires twice (P2).
- Async work (file imports, renders) whose result is applied after the user picked something else, so the old result overwrites the new one (P1 if reachable by normal clicking).
- New `any`, `as any` or `@ts-ignore` without a reason (P3).

**Do not flag:** the pre-existing lint errors, MUI styling choices, or upstream seasick code the diff didn't change.
