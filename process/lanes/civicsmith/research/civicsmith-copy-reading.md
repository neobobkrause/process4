# civicsmith-copy: what it holds (the read-only session's report, 21 Nov 2026)

Length: 150 lines. Last section: "9. What the report means for the plan (the lane's reading)".

Source: the report of the read-only session the owner started on `neobobkrause/civicsmith-copy` with
`../reading-brief.md`, pasted by the owner into the lane's session on 21 Nov 2026. Sections 1 to 8 are that
report, shortened but not reworded where quoted; the session read files only. Its own note on what it changed:
"my first import-analysis script wrote five output files ... into the repository folder. They were
untracked, I moved them to the scratchpad straight away, and `git status` is clean again." Section 9 is the
lane's.

**Limits of the copy.** It has only `main` and the reading session's branch. "The paused tranche T53 and
its 2,030 commits on `tranche/T53` are not here, and neither is the `coord` branch. The last ruling here is
K5420 (T52 closing). Bob's K5791 is visible only where build/onboarding/merge-hold.md quotes it."

## 1. Founding documents

- Index of what binds: `requirements/README.md` (approved by the owner 25 Sep 2026).
- Mission: `docs/architecture/BIO_Complete_Roadmap_v5.md` §§1–12 (preamble; four core values, first "Our
  government is held accountable only when we are paying sustained attention."; eight operational
  principles, e.g. "Show your work. Always.").
- Requirements: `docs/architecture/BIO_Design_Requirements_v2.md`, fifteen; "the system fails if any one
  is broken" (e.g. "Fully distributed. No hierarchy, no headquarters, no central authority"; "No single
  point of failure.").
- What it does: `docs/architecture/BIO_Functional_Architecture_v3.md`, `docs/architecture/BIO_System_Design.md`.
- Audiences: `docs/development/UI-KICKOFF.md` "Who this is for" (the member, "a community activist, not a
  technologist"; the reviewer; the project manager; the admin; the public); `BIO_Publication_v0_1.md` §6;
  `bio-plane/INSTALLER.md` ("community activists who will not open a terminal under any circumstances").
- UX principles: `docs/development/UI-KICKOFF.md`, "Bob's UX principles (stated 2026-07-28, verbatim,
  standing)", e.g. "Minimum visible complexity".
- Rules that are law: the privacy fence, append-only records, "Refusals teach."
- Standards and design detail: ~15 construct documents in `docs/architecture/`, ~22 in `docs/development/`;
  `docs/architecture/CORPUS-STANDARD.md`.
- Per-module requirements: `build/requirements/`, 179 files.
- The owner's rulings: product rulings DEC-n in `docs/development/DECISIONS.md` and `build/rulings-product/`;
  all rulings K1–K5420 one line each in `build/rulings.md`; those in force in `build/rulings-active.md`.

## 2. Languages and tools

- JavaScript ES modules (`.mjs`), ~99%: 4,781 files, ~1.1 M lines (~433k source, ~656k tests). Six `.js`
  mockups only; no TypeScript. Also 38 Python files (~21k lines), 5 shell, 1 Rust (`sheet-worker/engine`).
- npm; no root `package.json`; 11 packages (bio-plane, newgroup, site, stewards, pdf-worker, ocr-worker,
  sheet-worker, file-scanner, agent-runner, agent-worker, `bio-plane/src/journey-check`), 9 with a lock file.
- Per package `npm test` (`node --test …`; bio-plane preloads `test/platform-sqlite.mjs`), `npm run build`
  (esbuild), `npm run dev` (`wrangler dev`), `npm run deploy`. Every module's tests:
  `node .github/scripts/module-tests.mjs`, which reads `build/modules.json`.
- Node v26.10.0, pinned (node 22 rejects regular-expression syntax the code uses).

## 3. Size and shape

- `build/modules.json`: 178 modules, each `id`, `layer` (1–11), `paths`, `tests`, `uses`; strict order
  (a module uses only modules before it).
- 17,914 tracked files: 1,011 module source files, 3,680 test or probe files, 96 other scripts, 7 committed
  bundles in `release/` (the plane bundle 28 MB).

## 4. The process it carries now

- No Process3 traces. Commit `4e428915` (1 Nov) removed the previous process, neoProcess (its CLAUDE.md
  shim, skills, hooks, and `gate.yml`, `prune.yml`, `prune-branches.yml`). Its records stay in `build/`
  (`rulings.md`, `plan/`, `jobs/T*/`, `GRANTS.md`, `grants.json`, `onboarding/`, `manifest.md`); older
  ledgers in `docs/archive/ledgers/`.
- Four workflows, the product's own: `regression` (by hand), `deploy-test` (by hand or push to
  `deploy-test/*`; uses a Cloudflare token), `release-sign` (by hand), `container-images` (push to
  `dist/cut-*`).
- `CLAUDE.md`: the owner's approvals of 1 Nov. Forbidden among others: changing permission or repository
  settings. "Changing `CLAUDE.md` or `settings.json` counts as changing permission settings, so it is
  forbidden. The removal commit notes 'Bob commits the new one himself.'"
- `.claude/settings.json`: a deny list (force-push, `--force-with-lease`, `--mirror`, deleting remote
  branches, pushing to `main`, `reset --hard`, `clean -fd`, `stash drop`, `rebase`, `commit --amend`, `tag`,
  `branch -D`) and a session-start hook.
- `.claude/rules/standing-safety.md`: never force-push; never rewrite `main`; never delete
  `snapshot/pre-refactor-2026-09-25`; never print a secret; one Cloudflare account only, plus a rehearsal
  account for the new-team rehearsal.
- Required checks: none named. `build/GRANTS.md` records rulesets on the original `civicsmith`
  organisation; nothing records them for this copy.

## 5. Screens and journeys

- `docs/development/ux-substrate/`, 133 files; 91 screens in `screens/registry.json`; 23 wizard scripts in
  `screens/library.json`; 32 journeys in `screens/mock-journeys.js` (27 settled in `journeys.html`, 28–32
  added by DEC-201, 245, 286, 294, 420).
- Walk tools: `screens/check_walk.mjs` walks the mockups; real-product walks are the
  `bio-plane/src/journey-check/` module, records in `build/plan/walk-T51-*` (about nine re-walks).

## 6. Hosting

- Ten `wrangler.jsonc`, all pinned to one Cloudflare account. A Worker with a Durable Object store and R2
  buckets. Deploy scripts in `bio-plane/scripts/`; notes in `bio-plane/DEPLOY.md`, `DEPLOY-DASHBOARD.md`,
  `SETUP.md`. `release/RELEASE.json` 0.87.0, signed.
- Installer `newgroup/`: a Worker wizard, OAuth into the group's own Cloudflare account; refuses accounts
  without Workers Paid; installs and verifies. Updater: the same wizard with `keep_bindings`.

## 7. Import cycles

- 4,802 files parsed, 17,839 relative imports. **Between modules: no cycles and no strongly connected
  groups. No module imports one listed after it; the declared `uses` graph has no cycle.**
- Three undeclared module imports, all from test files: `pdf-worker` → `pdf-pixels`; `pdf-worker` →
  `image-codecs`; `installer` → `runtime-limits` (dynamic, `newgroup/test/steps/g83-location.test.mjs:182`).
- Four file cycles, each inside one module, each an index re-exporting a file that imports back from the
  index: `bio-plane/src/docx.mjs` ↔ `formats-xlsx.mjs`; `attestation/index.mjs` ↔ `ops.mjs`;
  `acquisition/index.mjs` ↔ `unpack.mjs`; `affordances.mjs` → `affordances/facts.mjs`, `door.mjs` → back.
- The records show cycles were met and designed around, never left to block a round (e.g. K752).
- The reporter: "at the import level, the coupling Bob describes shows up as size, files many jobs touch,
  and slow, broad test runs, not as import cycles".

## 8. Other recorded problems that slowed or stopped rounds

- **Module size:** modules passing 4,000 lines and split mid-plan (publication 4,625, split five times;
  agent-worker 7,510; file-scanner 4,756; others). Today `bio-plane/src/setup-words/rows.mjs` is 26,994
  lines, `pdfstructure.mjs` 5,766. The old `store.mjs` (~19,600 lines) breakup ran T13–T19.
- **Files many jobs touch:** `build/modules.json` conflict (T42); `bio-plane/package.json` and
  `wrangler.jsonc` touched by two sessions at once; generated `rows.mjs` blocked merges until regenerated
  (K5304); the plane bundle went stale at every merge.
- **Flaky tests:** admission, attestation R9, calculations R19, control-plane e2e, capture-sources
  `browserrender`; load flakes with six suites on 4 cores; a test red in batch, green alone (T52-102).
- **Slow or hanging runs:** big suites 11–13 min; affordances alone 9.6 (K4272); `newgroup-bundle-fresh`
  never exits; bundler `ascii.test.mjs` orphaned workerd and stopped a run after 9 of 176 modules (K4828);
  journey-check past 900 s; a whole-suite run takes "days" (K5339).
- **Tests that check English text** rather than the word key; 89 fixture findings held (K5313).
- **Memory and size limits:** a 1,354-page PDF kills the 128 MB Durable Object; the plane idles at 86 MB;
  the plane bundle is 27.3 of its 32 MiB limit; doctypes uses 109–379 MB on one file.
- **Schema split** (roster schema missing from the plane; `migrate-released` red every release, T38).
- **Duplicated code** kept identical by hand (`MEMBER_ROLES`, case-authoring helpers, docprofile/doctypes).
- **Failed walks and build defects:** a local walk failed 120 of 208 steps (K4145); a walk cancelled at its
  40-minute limit; ~nine T51 re-walks; 0.86.0 lacked its cron entry (G90); the regression run hung 120 min
  installing Chromium; DEC-449/450 held (they turn file-safety R24 red); `site/` not installed in the
  regression run.
- The owner's words, as the report quotes them: K4164 "You must keep in mind the long-term goals: a source
  tree that isn't fragile so that a small change doesn't result in multiple modules at multiple layers
  needing to be rebuilt. An architecturally clean source tree. A means of rigorously and efficiently
  identifying bugs and elements of the system that don't meet requirements." K4272 "Could it also be true
  that you're just running too many tests when we know the nature of a change isn't going to affect 90% of
  a module's test results?" K5339 "Are you an idiot? That will take DAYS. STOP IT!" K5791 (quoted in
  `build/onboarding/merge-hold.md`) "Don't start the next layer. The development process needs to be fixed
  first."

## 9. What the report means for the plan (the lane's reading)

- The lane's cycle design (one module for each strongly connected group) is not needed: there are none.
  It is withdrawn; the four file cycles sit inside single modules and Process4 does not order files.
- The module list exists and already keeps Process4's order rule: converting `build/modules.json` to
  `process/modules/` is mechanical (178 entries; layers become positions; `paths` → `files`; three
  undeclared test uses to declare).
- The language matches the one reader tried (TypeScript 5.6.3 reading `.mjs`).
- The owner's problems are those Process4's notice and related-test scope were designed for (K4164,
  K4272): a module is told only when an interface it uses changes, and a job's run covers only related
  tests. Both are unproven on real code (build text 5 §7).
- New risks the plan must place: flaky and hanging tests against Process4's failed-run count (part 4 §10);
  test runs near the 45-minute run limit; generated and shared files; civicsmith's present approvals forbid
  a session to change `CLAUDE.md`; the paused T53 work is not on this copy's main.
