# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 24 Nov 2026 ~20:20Z, by **PROCESS #11** (`session_018Bhced64Q8m7tFKd8HUrQ6`), at a natural pause, nothing
half done, everything merged. Your successor is **PROCESS #12**: read the generation in `handover-process` (11), name
yourself `PROCESS #12` with set-session-title (your own session id), record generation 12 and your session there (the file
must start with the JSON block), and message each ROOT in the registry your address. Read your own fill (`get_session`,
`context_usage`; it reads 0 mid-turn, so judge by the work done) after every owner turn. Refresh at the first natural
pause after 50 percent. Never `git add -A`; add paths by name (helpers' worktrees under `.claude/worktrees/` are excluded
locally in `.git/info/exclude`).

**Your reading:** the design, build text 5, the two decision files, `process/README.md`, `process/research/README.md` (the
index), `process/lanes/civicsmith/README.md`, and this handover. Open a research file, or give it to a worker, when a
question needs it.

## START HERE: the update is built; its trial on process3-probes waits for the owner's two lines

The owner's "Decision: the update plan as laid out" (24 Nov) is recorded (`design-decisions-2.md`, last entry) and built:
pull request 233 (tool, workflow `shims/module-tests.yml`, design parts 2, 4, 6, 7, 10, build texts 1, 1b, 2b, 5, the job's
and ARCH's starting texts, the index) and 234 (`results` says when no test record is needed). The tool's full suite passed
on GitHub. What it does, in one place: build text 1 section 5 and build text 1b commands 4, 6, 9, 11, 14, 15, 18, 27; the
record forms in build text 5 section 5; `tool/lib/testrecord.mjs`, `testrun.mjs`, `uses.mjs`.

Next, in order:
1. **Done: the trial on process3-probes** ran cleanly (`process/research/update-trial-process3-probes-24nov.md`); its
   ROOT is now #8 (`session_018Bhcefa2wforoAh5zomFNh`), coordinator #4 (`session_018Bhcedx7Rp4XRCUFihCwvp`), ARCH #4;
   the registry in `handover-process` says so.
2. **A read-only count on civicsmith** of the check's refusals, old version against new: the brief is
   `process/research/civicsmith-check-count-brief-24nov.md`, on the owner's page. Information only, not a gate: the owner
   may move civicsmith first (told so 24 Nov); if he does, name the old commit in the brief before it is run.
3. **civicsmith moves** on the owner's line in its coordinator session; its workflow copy replaced the same way.

Known limits of the build (written in the texts): `merge` does not wait on an import the scan cannot follow (a computed
one); the check does not read `require.resolve`, `#imports` or `createRequire(...)('<path>')`; refusal (b)'s receiving-side
rule covers complaints 2322 and 2345 only. Not known: whether a background command goes on while a session waits between
turns (the job waits within its turn); the re-run call and the verdict on real GitHub.

**Done by PROCESS #11 (all merged):** the update (233, 234); the owner's page (231, 232, 235): the 45-minute and draft-run
items withdrawn as covered by the update, PROCESS #8, #9 and #10 archived by the owner. civicsmith ROOT #4 recorded PROCESS
#11 (19:38Z); process3-probes ROOT #7 was messaged, no reply seen.

**On the owner's page, still waiting:** the trial's two lines; held requirements (option C recommended).

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry, two products. Message each ROOT your session and generation (titles in the
   account's session list; ROOTs refresh, so confirm the live one there):
   - `process3-probes` (the trial): ROOT #7 `session_018Bhceg1d5SVx54aCGkzRe3`; coordinator #3
     `session_018BhceeRZwDtL5rXcx3Mp5q`. Quiet, not stopped, every requirement met.
   - `civicsmith` (repository neobobkrause/civicsmith-copy, branch `p4-tranche`): **civicsmith ROOT #4**
     `session_018BhceeqiFSaXdPrichfP66` (from 23 Nov ~05:15Z); coordinator #4 `session_018BhcedBfypmJzpjT9Drkdq`;
     ARCH #11 `session_018BhcegATtrs3QurPbq6bMb`; its shared-state issue is 1122. Tranche t1 dropped by the owner 24 Nov;
     a refactoring (the "Civicsmith layers" plan) comes next, after this update.
4. **No live lane.** The civicsmith onboarding lane ended when ROOT started (design part 6 section 8); its
   last session (lane #2, `session_018BhceeTQKM67dJhV5dBPyh`) is archived; `lanes` says so. Its folder,
   `process/lanes/civicsmith/`, stays: conversion plan, the three readings, `later-module-tests.md`,
   `setup-session-brief.md`, `tokens.md`, `process-points.md`. Its page (a Claude Doc, read with the
   Claude Docs connector): https://claude.ai/artifact/HyRJShix1qLvC4LCu2pH8R. To start a lane for another
   product: write it in `lanes`, `create_session` (repository process4, main, the lane prompt PROCESS #6
   used is the first message of lane #2's session), tag `process4-product:PROCESS`.
5. Keep the owner's page **"Process4 Waiting for Bob"**: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy
   (source `coordination/owner_page/desk.html`; publish the file with the Artifact tool and keep both in
   sync, each change to the source by its own small pull request). Comments on it wake PROCESS; read them
   with ArtifactComments, reply and resolve.

## With the owner (nothing marked is unrecorded)

- Action 9 (civicsmith's branch rule) is done on his word (page comment, 22 Nov 20:54Z).
- To put to him, one at a time, now that the measurement is in (research recorded, no options put yet):
  1. (Closed 23 Nov by PROCESS #9: act 3's "no repository secrets" was removed on the owner's decision B; a
     product's own secrets are its own matter.)
  2. Who merges a product's set-up pull request into main (design part 7 section 4 act 8 does not say;
     civicsmith's approvals did not allow the session, so he merged #1119). Lane point 11.
  3. For his release page, no design change asked: civicsmith's installer takes no token, so the install
     and update before a release are his own Cloudflare sign-in.
- The trial's coordinator holds two optional matters for him (main's forbidden-commands file; whether to
  try a told job that changes code, and the walks).

## Decided and built by PROCESS #6 on 22 Nov (all merged; entries in `process/design-decisions-2.md`
## unless said)

- The onboarding lane: PROCESS starts one per joining product; it talks directly to PROCESS, keeps the
  product's "waiting for Bob" page with status and fully detailed steps, starts with GitHub, and ends when
  ROOT starts; the product is read by read-only sessions the owner starts; settings are his clicks; no
  GitHub token where sessions act through Claude's GitHub connection (design part 6 section 8; part 1
  sections 3 and 5; part 7 section 4).
- A product's token is made once with every permission its development will need (part 1 section 3).
- Production signing keys stay in the sessions' environment (entry "Publishing a release" in
  `process/design-decisions.md`, rewritten in place; parts 1, 3, 7, 9).
- The tool's tests run only where the tool is changed; `tool-tests` passes at once on a draft and on a pull
  request that changes no file of the tool (`tool/`, `shims/`, `starting_texts/job.md`,
  `starting_texts/walking-session.md`, the workflow). **Run no tool tests by hand unless you changed a
  tool, and then only the test files that cover it.**
- The declared-uses check refuses a declared use of a module that is not before this one (tool
  `check`; part 2 sections 1 and 6; build texts 1b and 2). Limit: it sees only imports by path.
- Research with no change: tests on civicsmith reach later modules by means the tool cannot see
  (`process/research/tests-referring-to-later-modules-22nov.md`); the order rule rests there on ARCH's
  module list.
- The decisions record is two files, both read, each under 60,000 bytes; new entries go in the second.

## Environment / tool notes

- `node tool/p4.mjs <cmd>`; direct `gh` is denied by design. Flow: `git fetch origin main`, then
  `git checkout -B work/<name> origin/main` → edit → commit (author `Claude <noreply@anthropic.com>`,
  Co-Authored-By + Claude-Session trailers) → `p4 push` → `p4 open --title` → `p4 ready` → wait about
  40 s → `p4 merge <number>` (it needs the number). GitHub refuses the merge while the ready run is still
  queued or in progress ("Required status check ... is queued"); wait and merge again, that is not a
  refusal to work round. `p4 push` takes only `work/` and `job/` branches.
- design/, build/, starting_texts/ change only on the owner's marked decision ("Decision:" or
  "Instruction:"); an unmarked request is asked about once. His decisions may arrive as page comments.
- Bookkeeping on any size change: each design part and build text states "Length: N lines";
  `starting_texts/00-index.md` carries byte figures and set sums.
- How the owner wants to be spoken to: plain words, short, bottom line first; clicks with full addresses
  and exact button labels; one matter at a time. He does not open files or assemble a file from parts:
  any text he pastes is given whole, in one block. Say what is proven and what is only reported.
- A read-only session's local `main` can be stale: briefs begin with `git fetch origin` and name the
  commit read.
