# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 25 Nov 2026 ~02:35Z, by **PROCESS #12** (`session_018Bhcecv58XoNb6DvxuYkM3`), at a natural pause: nothing half
done, everything merged. Your successor is **PROCESS #13**: read the generation in `handover-process` (12), name yourself
`PROCESS #13` with set-session-title (your own session id), record generation 13 and your session there (the file must start
with the JSON block; keep the registry as it stands), and message each ROOT in the registry your address. Read your own fill
(`get_session`, `context_usage`; it reads 0 mid-turn, so judge by the work done). Refresh at the first natural pause after
50 percent. Never `git add -A`; add paths by name.

**Your reading:** the design, build text 5, the three decision files, `process/README.md`, `process/research/README.md` (the
index), `process/lanes/civicsmith/README.md`, and this handover. Open a research file, or give it to a worker, when a
question needs it.

**The record of decisions is now three files:** `design-decisions-3.md` (started 25 Nov) takes each new subject. Read
all three. The owner's PROCESS start prompt names them.

## START HERE

**Nothing is being built. One thing waits for the owner, on his page:** typing in civicsmith's coordinator session
`Instruction: move civicsmith to the latest Process4 version`, which brings civicsmith today's three decisions (below). He
asked to hold the move until the notice tool was fixed; it is (pull request 264). After the move, the page tells him ARCH
can: re-run `notify 1350` (test-support's optional parameter; should now tell no one, so the 121 told checks he paused, on
his instruction typed in coordinator #7's session, can be withdrawn from waiting work by ARCH); re-run `notify 1339` and
`1340` to recover the notices lost when the waiting-work write was refused; and run the notices ARCH #15 still owed (18,
listed in civicsmith's `handover-arch`). Watch for the first `notify` on civicsmith after the move: its time, memory, and
how many `<!-- process4-notice -->` comments it writes (about 100 on the made-up product; GitHub's write rate is untried).

**Done by PROCESS #12, 25 Nov (all merged; entries in `design-decisions-2.md`, last three):**
- Merging goes on while a notice is worked out (decision B; PR 255): ARCH starts `notify` in the background and keeps
  merging; a user merged first gets a told job. Text only (ARCH rule 2, design part 2 §§3, 7, build 1b cmd 11).
- A job's tests run on its branch brought up to the tranche (decision B, his "Yes, B covered the stale-branch item too";
  PR 256): `p4 test` merges the base into the job branch and pushes first (`bringBaseIn`, `tool/lib/testrun.mjs`).
- The notice after an early provider's merge (decision B; PR 264): the kinds a file declares worked out once per side and
  kept, users read 20 to a program, the after side only where needed (1,507 s to 37 s on a made-up 200-module product,
  answers identical); a not-followed user told only of a change that tells users (17 of 150 proof answers re-recorded,
  all notices for nothing); reasons written as `<!-- process4-notice -->` comments on the merged pull request, waiting work
  names the notice, `open --module` reads them; GitHub's words on a refused write. The owner's uses-file idea was built and
  tested by the worker: same answers, little gain (an early merge makes every file stale); kept in the research.
- The owner's page condensed to what waits; old "Done" items dropped (history is in the record and git).

**Known limits left:** a job block gathering several large notices could pass a comment's size; a told job above the slot
number with dozens told (ARCH started them at 8; information on the page in the research, no change proposed); the
refactoring tranche draws in modules through job-reported flaws (by the rules; the owner told, no change asked).

**Registry (in `handover-process`):** process3-probes ROOT #8 `session_018Bhcefa2wforoAh5zomFNh` (quiet); civicsmith ROOT #7
`session_018BhceePQhUJcXt8W2pZGxx`, coordinator #7 `session_018BhcefEpYUAwGpc5yDxSCS`, ARCH #15 handed over at 02:08Z to
ARCH #16 (address in civicsmith's roles record; ask the coordinator).

**Still to put to the owner, one at a time, when quiet:** who merges a product's set-up pull request into main (lane point
11); civicsmith's installer takes no token, so the install and update before a release are his own Cloudflare sign-in.
The read-only check count on civicsmith stays optional on his page.

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
