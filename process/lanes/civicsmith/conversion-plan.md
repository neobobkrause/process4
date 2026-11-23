# Civicsmith's conversion plan: outline

Length: 194 lines. Last section: "6. Open, and who settles it".

**Status: outline, by PROCESS civicsmith lane #1, 20 Nov 2026. Nothing here is decided by the owner,
built or run.** It is the product's conversion plan that design part 0 §1 and part 10 §2 item 2 name.
It rests on the research in `research/` and changes no rule of Process4; where it and the design
differ, the design rules. Steps that wait on the owner are named in section 6.
"Inference" marks what no record shows.

## 1. What the plan aims at

- Civicsmith's development runs under Process4 from its own repository, with no second codebase
  kept alive beside it (good practice: research/conversion-best-practice.md §2, the 90-percent stall).
- The first tranche is small and is the proof that Process4 works on real code: merges by the tool,
  the notice on real interfaces, one partial internal walk, one development deployment to Cloudflare,
  and one journey walked there (PROCESS's standing recommendation; design part 10 §3).
- No product behaviour changes in the conversion itself. Behaviour changes come as tranche work.

## 2. What the owner has told the lane, and what the reading found

- The repository is `neobobkrause/civicsmith-copy` (the owner, 21 Nov 2026; `believeinoakland/civicsmith2`
  is an unmodified copy of it). No work is in flight. The founding documents are in it. The problems to
  resolve first are, in his words, "related to cyclic references within modules and other source code
  issues that have made it difficult to close a round without addressing".
- The read-only session's report (`research/civicsmith-copy-reading.md`, 21 Nov 2026) found:
  - no cycles between modules; `build/modules.json` already keeps Process4's order rule, 178 modules;
  - four file cycles, each inside one module;
  - the problems that held rounds were size, files many jobs touch, and slow, flaky or hanging test runs;
  - no Process3 traces; the previous process, neoProcess, was removed on 1 Nov 2026;
  - the copy holds `main` only. The paused tranche T53 (2,030 commits on `tranche/T53`) and the `coord`
    branch are not in it. Settled: The owner's decision of 22 Nov 2026, exactly as typed (relayed by PROCESS #6): "With regard to The paused tranche T53, decision: Start from main as it is. T53 stays where it is as history, and anything worth keeping comes back as Process4 work." Conversion starts from civicsmith-copy's main.

## 3. The owner's acts, for an existing repository

Design part 7 §4's ten acts as corrected on the owner's "Decision: B" of 20 Nov 2026 (process4
PR 104, main 7b42e37), read for civicsmith. Bracketed numbers are the lane's points to PROCESS
(`process-points.md`).

1. **Sessions' GitHub account (acts 1, 2, 5).** Give the sessions' account write access to civicsmith's
   repository, and install Claude's GitHub App on it. The process repository is done already.
2. **The earlier process's leftovers (act 3) [2].** neoProcess's workflows went on 1 Nov; its records
   stay in `build/` as the product's history. The product's own four workflows (`regression`,
   `deploy-test`, `release-sign`, `container-images`) stay; none runs on a pull request. The
   `deploy-test` workflow uses a Cloudflare token; the deploy token for Process4's own deployments goes in the cloud environment (act 6); the product may keep its own
   secrets [Withdrawn 23 Nov 2026: act 3 no longer says "no repository secrets"; the owner's decision B, entry "A product's repository may hold secrets" in process/design-decisions-2.md. A product's own secrets are its own matter.] No
   required check is named for this copy (`build/GRANTS.md` records rulesets only on the original
   `civicsmith` organisation), so act 10 adds `module-tests` with nothing to replace.
3. **Branch rule (act 4).** No deleting and no overwriting on every branch, no one excepted.
4. **Environment check (act 6) [7].** A session reads the cloud environment the sessions will run under
   and confirms its permissions-management settings name civicsmith's repository. PROCESS
   measured (20 Nov 2026) that they trust `neobobkrause/*`, which covers
   `neobobkrause/civicsmith-copy`; the check is still made at setup (part 7 §5), and a change, if one
   is needed, waits for the owner's click. The deploy token for the development Cloudflare account
   is entered then.
5. **The set-up session (act 8) [1, 3].** One plain session the owner starts on civicsmith's repository
   for this act alone, in this order (part 7 §4 act 8; part 6 §2):
   - drafts civicsmith's approvals for the owner, as no coordinator exists yet, and places his approved
     text, with the forbidden commands, in a pull request into main that he lands by his click;
   - writes civicsmith's first Process4 files by pull request into main: `process.json` naming the
     Process4 version, the module list (section 4), the required-run workflow, the forbidden-commands
     copy;
   - then makes the tranche branch, named `p4-tranche` (as in PROCESS's approvals draft; it stays clear
     of the earlier `tranche/T*` branches), from main's newest commit; main already holds the earlier processes' history,
     which act 8 now covers (the trial's fault was a branch with history of its own).
   **Blocked as things stand.** civicsmith-copy's present approvals (1 Nov 2026) count changing
   `CLAUDE.md` or `.claude/settings.json` as changing permission settings, which they forbid, and the
   removal commit says "Bob commits the new one himself". So the set-up session may not place the new
   text, even in a pull request. Sent to PROCESS (`process-points.md`, point 10). At the owner's request
   PROCESS drafted civicsmith-copy's `CLAUDE.md` and `.claude/settings.json` (Process4's deny list, the
   Node 26 start-up hook kept beside it) for him to paste and merge himself
   (process/research/approvals-draft-civicsmith-copy-21nov.md).
6. **Registry.** The owner tells PROCESS civicsmith's ROOT once it starts, so PROCESS can reach it
   (build text 5 §4).
7. **Start ROOT (act 9),** on civicsmith's repository alone, the tranche branch, Auto mode, a plain
   prompt. ROOT makes the shared state's issue (`state write --create`; build text 5 §1).
8. **Required check (act 10) [2].** Once `module-tests` has reported once, main and the tranche branch
   take changes by pull request only with it passing, replacing `gate` (act 10 as corrected). The
   trial did act 10 before act 9.

## 4. The conversion work, before the first tranche's jobs

Done by act 8's set-up session where part 7 §4 names it (`process.json`, the module list, the workflow,
the forbidden-commands copy), and by ARCH after ROOT starts for the rest. The sources are in
`research/civicsmith-copy-reading.md`.

- **The module list: converted, not redrawn.** `build/modules.json` already keeps Process4's rule. Its
  178 entries become `process/modules/order.txt` in the same order, and one entry file each (build text
  2 §3): `paths` → `files`, `tests` → `tests`, `uses` → `uses`. The interface files go in `public`.
  Three undeclared uses, all from test files, are declared: `pdf-worker` → `pdf-pixels`, `pdf-worker` →
  `image-codecs`, `installer` → `runtime-limits`. Layers become positions in the order; nothing else
  changes. Every one of the 17,914 tracked files gets exactly one owner, including `build/`, `docs/` and
  `release/`.
- **Tests that reach a later module: found and settled before the first tranche.** The owner's words to PROCESS, 22 Nov 2026 (conversation, relayed by PROCESS #6): "Something to note in civicsmith-copy that needs to be fixed... There are 4 modules that T53 under process3 was stopped while working on. Beyond the problems that process3 had, one thing that was being struggled with is that the tests for some modules referred to other modules that were later in the order. So there are cyclic references among the 4. That needs to be identified and fixed, otherwise process4 runs the risk of similarly getting stuck."
  The first reading found no module importing a later one, but it counted relative imports only, and
  T53's branch is not in the copy. The second reading (item 12) lists every reference from a module's
  tests to a module at the same or a later position, of every kind, and the cycles they make. The lane
  sorts each finding into one of four kinds, with grounds, for civicsmith's ARCH to decide: a test that
  exercises several modules and belongs in the latest of them; a shared test helper or fixture that
  belongs in an earlier module and its public files; two modules whose boundary is wrong (design part
  2 §8, an architecture bug: the module list or the interface is corrected); or an order that can
  simply be changed. The set-up session converts the list as it stands on main, reshaping nothing,
  and writes each such reference into `process/waiting-for-arch.md` (ARCH does not exist before ROOT
  starts). **ARCH, once started, corrects the list or places the work before any job opens on those
  modules, so that no module's tests reach a later module**; the four T53 modules stay out of the first
  tranche's slice until that is so. The four file cycles
  inside single modules stay as they are; Process4 orders modules, not files.
- **Generated and shared files have one owner each.** `bio-plane/src/setup-words/rows.mjs` (generated,
  26,994 lines), the bundles in `release/`, `bio-plane/package.json` and the `wrangler.jsonc` files each
  belong to one module. Only that module's job regenerates or edits them. Under neoProcess these caused
  merge conflicts (K5304, T42). Under Process4 a module has at most one open job ("a module is ready when
  it has work and no open job", build text 1b, `next-job`). Inference: owning each such file in one module
  turns those conflicts into that module's queue.
- **The process config.** `tranche_branch` "p4-tranche". `node` "26.10.0". `lock_files`: the nine package locks. `test_command`: one
  command that tells packages apart. civicsmith already has one, `node .github/scripts/module-tests.mjs`,
  which needs a form that takes a list of test files (build text 2 §7: "a product whose modules need
  different commands must give one command that tells them apart"). bio-plane's preload of
  `test/platform-sqlite.mjs` goes inside that command. `walks_folder`, `walk` and `deploy` come from the
  product's existing commands (section 2 of the report). `hosting.development_account` is the
  development Cloudflare account, never the token.
- **Requirements files from `build/requirements/`.** 179 files are converted into the form of build text
  2 §4, one for each module. A requirement is `[met]` only where a test shows it and `[not yet met]`
  otherwise. Each file stays under 60,000 bytes; ARCH splits a module whose file would not.
- **The ranking page** (design part 5 §6) from `requirements/README.md`, which already ranks civicsmith's
  canon:
  - mission: the Roadmap §§1–12;
  - principles: the core values, the operational principles, the UX principles in `UI-KICKOFF.md`, and
    the three rules that are law;
  - standards: the construct and detail documents, and `CORPUS-STANDARD.md`;
  - requirements: `BIO_Design_Requirements_v2.md` and the module requirements files;
  - design decisions: `docs/development/DECISIONS.md` and `build/rulings-active.md`.
- **The owner's decision record.** The coordinator starts `process/decisions-owner.md`. The DEC and K
  records stay where they are as history, and the ranking page names `rulings-active.md`.
- **The walks' documents.** The UX lane turns `docs/development/ux-substrate/` into the Screens document
  and the journeys, one page each, with an index (build text 3 §2): 91 screens, 23 wizard scripts and 32
  journeys. The `journey-check` module and `screens/check_walk.mjs` stay product code. How each journey's
  steps become walk steps is the UX lane's and ARCH's work.
- **Language reader.** `.mjs` throughout, the one form tried (TypeScript 5.6.3 reading plain
  JavaScript). Its scale is not proven: about 1,000 source files and 3,700 test files.

## 5. The first tranche: the proof

- **Why Process4 fits these problems.** The owner's words at K4164 and K4272 name what Process4's notice
  and related-test scope are for. A module is told only when an interface it uses changes. A job's
  required run covers only the tests related to what it changed. Neither has run on real code (build text
  5 §§6–7). The first tranche is where that is shown.
- **Scope.** A thin slice: a few modules early in the order, and one journey through them. Where it can,
  it avoids the modules with known flaky or hanging tests and suites over ten minutes, and the four
  modules T53 was working on until no module's tests reach a later module. The journey is one
  that needs no AI account.
- **A candidate slice, from the third reading (`later-module-tests.md`; the lane decides nothing, ARCH
  chooses).** Only setup-words (1) is touched by no reference at all: test-support's text walk reads
  every module from 2 on. Modules on no cycle even when every reference is counted: setup-words,
  runtime-limits, court-citations, subresources, agent-model, op-capabilities, interface-assets, site.
  Modules whose own tests reach no later module and that sit on no cycle through code that runs (outside
  the report's 151-module set), early in the order: civil-time (4), calc-grammar (5), connection-grammar
  (6), runtime-limits (8), court-citations (11), id-spaces (12), subresources (13), ooxml, csv-reader
  (15), text-chain (20), site-profiles (21), docprofile (22), legistar-reader (24), court-doctypes,
  image-codecs (28), image-cover (30), member-roster (36). These are the lane's candidate slice for ARCH.
  Two cautions: a later module's walk or plane-booting test still runs their code, so a change to one of
  them can fail a later module's test until groups 1 and 2 of the list are settled; and
  connection-grammar is among the modules the draft T52/T53 requirements name.
- **Known risks, placed as work, not as new checks.**
  - **Flaky tests.** Process4 counts every failed run. At the third, ARCH replaces the job; at the fifth,
    the module is blocked (part 4 §10). A flaky test spends those runs without a fault in the job. The
    known flakes go to waiting work against their modules as the first tranche opens: admission,
    attestation R9, calculations R19, control-plane e2e, capture-sources `browserrender`, and
    agent-worker `requirements.test.mjs`. Those modules stay out of the first slice.
  - **Hanging tests.** `newgroup-bundle-fresh` never exits, and bundler `ascii.test.mjs` orphans
    workerd. Under the required run's 45-minute limit either fails the run. Both go to waiting work the
    same way.
  - **Long suites.** Big suites take 11–13 minutes, affordances 9.6. A scoped run fits the 45 minutes. A
    mechanical edit across many modules runs whole suites and may not fit (build text 1 §5); its time is
    unmeasured.
  - **Size limits.** The plane bundle is 27.3 of its 32 MiB limit, and a large PDF hits the 128 MB
    Durable Object limit. These are product requirements for ARCH to place. A deployment in the first
    tranche may meet them.
- **What it must show.** Jobs merge through the tool under the checker. A notice reaches a real user
  module. A scoped run stays well under the whole suite. One partial internal walk is made, one
  development deployment, and the journey walked on it.
- **Then.** Later tranches widen in module order. The size problems (modules past 4,000 lines,
  `rows.mjs`, duplicated code, tests that check English text) are product work ARCH places, tranche by
  tranche.

## 6. Open, and who settles it

| Matter | Who settles |
|---|---|
| civicsmith-copy's approvals forbid a session to place new ones (point 10) | Settled: PROCESS drafted them; the owner landed both files himself on 22 Nov 2026 (his word; read back by the second reading, item 11) |
| The paused T53 work and the `coord` branch | Settled 22 Nov 2026, the owner's words: "With regard to The paused tranche T53, decision: Start from main as it is. T53 stays where it is as history, and anything worth keeping comes back as Process4 work." |
| Whether civicsmith-copy, not the original `civicsmith/civicsmith`, is where development continues | The owner (he named civicsmith-copy) |
| The test command's form for a list of files | The set-up session and ARCH |
| Whether the reader and notice follow 178 modules and 4,700 files | Shown in the first tranche |
| Walks, deployment and release by sessions on Cloudflare | Shown in the first tranche (design part 10 §3) |
