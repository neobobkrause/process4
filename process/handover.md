# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 23 Nov 2026 ~06:35Z, by **PROCESS #9** (`session_018Bhcedhv9kRXZcX6PWLMdJ`), mid-session (a checkpoint,
not yet its refresh). The successor is **PROCESS #10**: read the generation in `handover-process` (9), name yourself
`PROCESS #10` with set-session-title (your own session id), record generation 10 and your session there (the file must
start with the JSON block), and message each ROOT in the registry your address. Read your own fill (`get_session`,
`context_usage`) after every owner turn; it can read 0 while a turn is open. Refresh at the first natural pause after 50
percent. Never `git add -A`; add paths by name.

**Your reading:** the design, build text 5, the two decision files, `process/README.md`, `process/research/README.md` (the
index; one line per file), `process/lanes/civicsmith/README.md`, and this handover. Open a research file, or give it to a
worker, only when a question needs it.

**PROCESS #9 did, all merged (entries in `design-decisions-2.md`, research in the index):**
- Job branches are `job/<module>.<n>` (decision B, PR 192): civicsmith-copy's 207 flat `job/<module>` branches blocked
  `job/<module>/<n>`.
- A product's repository may hold secrets: act 3 lost "no repository secrets" (decision B, PR 195); a worker found act 3
  the only source; session-written texts carry withdrawal notes.
- `notify`: no code read when no module changed, and code-reading commands get 3/4 of machine memory (decision B, PR 199);
  then, after a job merge still ran out at 12 GB and the owner asked whether the tool was well designed, a staged reading
  of only what a merge can affect, with a plain "could not read ... notice owed" message (decision D, PR 205; built by a
  worker; the 150-change proof replay gives identical reports).
- `push --unblocked "<why>"`: a job whose block ARCH ended by its own decision says it goes on (decision B, PR 204; one
  line added to `starting_texts/job.md`).
- The owner's instruction (typed in this session, 23 Nov ~06:00Z): "Instruction: When the fixes are in and the new version
  of process4 is ready, tell the civicsmith coordinator to bring civicsmith up to the latest version". Done: civicsmith
  coordinator #4 (`session_018BhcedBfypmJzpjT9Drkdq`) was sent his exact words at ~06:30Z, main 4ef702c. Follow up: did
  civicsmith move, and does a job merge's `notify` now fit (ARCH owes notices for 1152-1154 and later)? If the
  coordinator says he must type the move line himself, put it on his page.

**Waiting for the owner (on his page):** archiving the PROCESS #8 session (`session_018BhcecJ8tf5Z9JtZZCD7Pz`), his click.
The repository-secrets question of 22 Nov is withdrawn (it rested on the removed rule).

**Observation, nothing measured failing (rule 6, no change):** PR 205 merged while its ready run of `tool-tests` still
showed in progress; that run then passed. Earlier merges were refused while the run was in progress. Possibly the draft
run's at-once pass satisfied the required check. Watch for it; a failing tool change could merge this way.

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry, two products. Message each ROOT your session and generation (titles in the
   account's session list; ROOTs refresh, so confirm the live one there):
   - `process3-probes` (the trial): ROOT #7 `session_018Bhceg1d5SVx54aCGkzRe3`; coordinator #3
     `session_018BhceeRZwDtL5rXcx3Mp5q`. Quiet, not stopped, every requirement met.
   - `civicsmith` (repository neobobkrause/civicsmith-copy, branch `p4-tranche`): **civicsmith ROOT #4**
     `session_018BhceeqiFSaXdPrichfP66` (from 23 Nov ~05:15Z); coordinator #4 `session_018BhcedBfypmJzpjT9Drkdq`;
     ARCH `session_018BhcedtuSwkeuCxhbrNGwr` (generation not read); its shared-state issue is 1122. Jobs are running.
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
