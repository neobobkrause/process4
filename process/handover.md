# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 25 Nov 2026 ~04:12Z, by **PROCESS #12** (`session_018Bhcecv58XoNb6DvxuYkM3`), at the owner's word ("refresh"),
at a natural pause: nothing half done, everything merged. Your successor is **PROCESS #13**: read the generation in
`handover-process` (12), name yourself `PROCESS #13` with set-session-title (your own session id), record generation 13 and
your session there (the file must start with the JSON block; keep the registry as it stands), and message each ROOT in the
registry your address. Read your own fill (`get_session`, `context_usage`; it reads 0 mid-turn, so judge by the work done).
Refresh at the first natural pause after 50 percent. Never `git add -A`; add paths by name.

**Your reading:** the design, build text 5, the three decision files (`design-decisions.md`, `-2.md`, `-3.md`; new subjects
go in `-3.md`), `process/README.md`, `process/research/README.md` (the index), `process/lanes/civicsmith/README.md`, and this
handover. Open a research file, or give it to a worker, when a question needs it.

## START HERE

**civicsmith is on Process4 55db8e4** (all of 25 Nov's decisions, below). Its sessions: ROOT #9
`session_018BhcefUXKE8xvUkaa9XjGi`, coordinator #9 `session_018BhcedNDzSLiPUv54snhat`, ARCH #18 `session_018BhceeSF76m9wXoZivYidA`.
The owner lifted his hold on notice-only checks (04:07Z, typed in ARCH's session), so about 150 notice-only told jobs run
8 at a time (about $1.75 each; most will close with nothing to change) and the refactoring tranche t2's round goes on to
its walks. ARCH #18 was told (via coordinator #9) it may clear a merge's own old waiting-work entries before re-running
`notify` for 1356, 1339, 1340, 1350 under the new rules.

**First, for the owner: the narrowing of decision 2** (not yet researched; the brief is at the end of
`process/research/notify-rerun-repeats-25nov.md`). test-support's merge 1350 tells about 125 modules because registerDeclared
really changed (a new error kind) and about 120 modules the tool cannot follow fully "count as using everything"; only about
5 call it. Give the brief to a worker, then put the options to him with numbers (A no change; B the narrowing). It changes
his decision 2. Watch also: the first `notify` times on civicsmith after 55db8e4, and how many 1356 tells now.

**Two small gaps (information, no options put):** a re-run of `notify` leaves an earlier run's entries for modules it no
longer tells; an owner's hold on notice-only checks is not a standing note `next-job` can pass over (moot now).

**Done by PROCESS #12, 25 Nov (all merged; entries in `design-decisions-2.md`, last three, and `design-decisions-3.md`):**
- Merging goes on while a notice is worked out (B; PR 255). A job's tests run on its branch brought up to the tranche
  (B; PR 256, `bringBaseIn`).
- The notice after an early provider's merge (B; PR 264): plain kinds worked out once per side, users read 20 to a program,
  the after side only where needed (1,507 s to 37 s on a made-up product); a not-followed user told only of a change that
  tells users; reasons as `<!-- process4-notice -->` comments on the merged pull request, waiting work names the notice.
- `ready` says plainly where there is nothing to mark (PR 267). The record's third file begun.
- The notice, second group (B; PR 271): an unknown kind ("anything") becoming stated tells no one (`known`, `knownDecl` in
  `notice.mjs`); job blocks kept under 60,000 characters; a job merged while its block was written is put back and gets
  a told job; GitHub's full refusal words; no repeated notice to a job of any state that carried it.
- The owner's uses-file idea was built and tested by a worker: same answers, little gain once the speed fix is in.

**Registry (in `handover-process`):** process3-probes ROOT #9 `session_018BhceeYSvKdwxWhuQiuUck` (quiet); civicsmith ROOT #9 as
above.

**Still to put to the owner, one at a time, when quiet:** who merges a product's set-up pull request into main (lane point
11); civicsmith's installer takes no token, so the install and update before a release are his own Cloudflare sign-in. The
read-only check count on civicsmith stays optional on his page. Archive PROCESS #12 once PROCESS #13 runs.

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry, two products: read it in `handover-process` (START HERE above gives each product's sessions as of
   25 Nov ~00:10Z). Message each ROOT your session and generation; ROOTs refresh, so confirm the live one in the account's
   session list. civicsmith is repository neobobkrause/civicsmith-copy, branch `p4-tranche`, shared-state issue 1122.
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
