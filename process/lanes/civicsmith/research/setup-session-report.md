# civicsmith's set-up session (act 8): its report (22 Nov 2026)

Length: 70 lines. Last section: "3. What the lane takes from it".

Source: the report sent by message to the lane on 22 Nov 2026 by the set-up session
session_018BhcecbrWWH3xBs3py4NQW on `neobobkrause/civicsmith-copy`, from `setup-session-brief.md` at
process4 `eeb35f3`. Shortened here. Done through step 8; ROOT not started.

## 1. What it did

- **Step 0.** `origin/main` = `16de7665` ("Fix JSON formatting in settings.json"). `.claude/settings.json`
  there: valid JSON, 25 lines, 19 deny entries, no `hooks` part; byte-for-byte `shims/claude-settings.json`.
  The owner's fix is read back.
- **Step 1.** Process copy at process4 main `eeb35f372b6ede18d22e66cc5f9b091d0eec635a` (PR 155);
  `f4e3596` is an ancestor; `p4 latest-version` agrees. This is `process.commit`.
- **Step 2.** Deny list: **same** as `shims/claude-settings.json`.
- **Steps 3–5.** First files: civicsmith-copy PR **#1119** (branch `claude/sweet-carson-pmj1tr`, the
  harness's name), 183 new files, no product file changed, no test moved. `module-tests` passed at once
  ("Scope: nothing, because the pull request is into the main branch"). **The owner merged #1119 himself**
  (merge `e123992bdf0881debc79bf8ddb4842809b0f1a35`, 18:36:09Z): civicsmith-copy's approvals let sessions
  merge into p4-tranche, and p4-tranche into main, but not a working branch into main, and the deny list
  blocks the other merge routes.
  - `process.json`: process4 address, version "4.0.0", commit `eeb35f37…`; `tranche_branch` p4-tranche;
    node 26.10.0; nine lock files; slots 8/8; lanes ux at `process/lanes/ux/`; hosting cloudflare
    `20b533579290b9b93168345edd3b7f72`; `walks_folder` `process/lanes/ux/walks/`; `process_folder`
    `process/`; reader typescript 5.6.3 over `**/*.mjs`.
  - `test_command`: `node --import ./bio-plane/test/platform-sqlite.mjs --test` (what
    `.github/scripts/module-tests.mjs` runs per module; tried on one civil-time test file, 4 of 4 passed,
    Node 22). pdf-worker's own `npm test` adds `--test-force-exit --test-concurrency=1`; this does not.
  - `walk`/`deploy`: nearest existing commands; none takes a copy's name except `deploy.mjs`; seed and
    remove "none: …"; gaps in `process/waiting-for-arch.md` §5.
  - Module list: 178 entries in order, five fields each; three uses added (pdf-worker → pdf-pixels,
    image-codecs; installer → runtime-limits). `public` derived (no such field in `build/modules.json`):
    each module's files that others import by literal relative path; plane, stewards and journey-check
    have none. Loaded by the tool's own `loadModules`/`ownerOf`.
  - Workflow `module-tests.yml` identical to `shims/module-tests.yml`; the product's four unchanged.
  - `process/decisions-owner.md`: the T53 entry, his words exactly.
  - `process/waiting-for-arch.md`: the thirteen groups, the pointer, the longest-path note.
- **Step 6.** Hook pull request **#1120** (https://github.com/neobobkrause/civicsmith-copy/pull/1120),
  ready, **not merged**: only `.claude/settings.json`, +12 lines, JSON-equal to `4e428915`'s hooks part.
  `.claude/hooks/session-start.sh` is on main: in a cloud session it installs Node 26.10.0 into
  `/opt/node26`, sets `NODE_USE_ENV_PROXY=1`, runs `npm ci` in seven packages when stale, installs
  openssh-client.
- **Step 7.** `p4-tranche` = `e123992b` (main's tip), made by GitHub's create-branch call with the owner's
  approval.
- **Uses not earlier in the order:** none. **Files with no owner:** 12,701 of 17,914 were `not_product`
  in `build/modules.json`; each was given a module for now (bundler: `release/`, `bio-plane/dist/`, three
  workflows; test-support: `.github/scripts/`, `regression.yml`, `.claude/hooks/`; plane: deploy docs;
  installer: `INSTALLER.md`; journey-check: `docs/`, `requirements/`, `build/`, root files). Left to no
  module, as the process's own files: `CLAUDE.md`, `.claude/settings.json`,
  `.claude/rules/standing-safety.md`, `process.json`, `process/`, `module-tests.yml`. For ARCH:
  `build/tools/test/words-convert.test.mjs` is owned as a file, not a test; `release/` and
  `bio-plane/dist/` hold committed built files (design part 2 §6).

## 2. Found beyond the brief

- **`check` fails on the code as it stands.** Tried once with the pinned tool on the first two modules:
  setup-words 551 disagreements (518 in the vendored `bio-plane/src/setup-words/vendor/acorn.mjs`, 33 in
  its tests); record-grammar 59 (22 code, 37 tests). All "(a) a comment disagrees with this module's
  code/tests". The required run runs `check` before a module's tests, so these modules' first jobs fail
  until settled. The other 176 not tried. In `waiting-for-arch.md` §4.
- A literal-import scan agrees with the third reading: one import of a later module (queue →
  op-declarations, group 3); earlier but undeclared: queue → op-grades; journey-check → ten modules.

## 3. What the lane takes from it

1. Action 8 is done; the owner's last step of it is merging #1120 on its page. Action 9 (the merge rule)
   can be done now: `module-tests` has reported on main.
2. The `check` result on the first two modules is information for PROCESS (whether the structured-comment
   check should read a vendored third-party file is a process question) and work for ARCH.
