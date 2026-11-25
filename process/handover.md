# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 25 Nov 2026 ~00:10Z, by **PROCESS #11** (`session_018Bhced64Q8m7tFKd8HUrQ6`), at the owner's word
("refresh"), at a natural pause: nothing half done, everything merged. Your successor is **PROCESS #12**: read the generation
in `handover-process` (11), name yourself `PROCESS #12` with set-session-title (your own session id), record generation 12
and your session there (the file must start with the JSON block; keep the registry as it stands), and message each ROOT in
the registry your address. Read your own fill (`get_session`, `context_usage`; it reads 0 mid-turn, so judge by the work
done). Refresh at the first natural pause after 50 percent. Never `git add -A`; add paths by name (helpers' worktrees under
`.claude/worktrees/` are excluded locally in `.git/info/exclude`, a file a fresh container will not have).

**Your reading:** the design, build text 5, the two decision files, `process/README.md`, `process/research/README.md` (the
index), `process/lanes/civicsmith/README.md`, and this handover. Open a research file, or give it to a worker, when a
question needs it.

## START HERE

**Nothing is being built. The question to civicsmith coordinator #7 is answered (25 Nov ~00:11Z, read from its records):**
the round record holds scope `{ tranche t2, holds: capture R115, R116; control-plane R74, R139, R140 }`, checked by
coordinator #6 before it cleared the stop. capture #1 (PR 1337) and control-plane #4 (PR 1338) carry only those; control-plane's
block lists 14 others under `not_this_tranche`, so D works as built. Every other job is placed work: test-support (1340),
office-readers (1343), reading-pipeline (1344) are "flaw from ARCH" for refactoring step 3 (test moves); record-grammar
(1339) is a flaw capture reported (its BundleInput comment omits fields; capture is recorded blocked by it); promotion (1345),
and inquiry-grammar and ratification waiting, are flaws record-grammar's job reported, from `check` refusals on their code.
No process fault, no refusal.

**FIRST, the more pressing: a process fault at 00:47Z, not yet put to the owner:** `notify` after record-grammar's merge (third
of 204 modules) ran 38 minutes and 8 GB without a notice on civicsmith; ARCH #15 holds six merges while it runs. Research in
`process/research/notify-slow-early-provider-25nov.md` (questions, no options yet). Also there: the refactoring tranche
drawing in modules through placed flaws (ten more jobs by 00:44Z): tell the owner plainly.

**Then:** a process fault arrived at 00:21Z, not yet put to the owner:** `p4 test` ran civicsmith provenance #1's tests on its
branch as pushed, without the tranche's newer commits, and the first run failed. It is PROCESS #11's own choice in the
update. Research and options in `process/research/test-on-stale-branch-25nov.md`: find what failed on PR 1346 (ask
coordinator #7), then put the options to the owner.

**One thing for the owner, put to him by PROCESS #11 as information, no change proposed:** flaws a job reports are always
work under D (as the owner chose), and here they come from `check` refusals of code older than the tranche, so they pull
modules into the refactoring tranche one after another (record-grammar, then promotion, inquiry-grammar, ratification).
Watch whether the chain grows; if it does and he wants it held, that is a new fault to research (e.g. ARCH placing such a
flaw as waiting for a later tranche). Seen too, by design: `p4 results` on a draft job shows "no test record" while
`module-tests` reads passed (a draft passes at once; `ready` needs the record); provenance's round entry open with no pull
request yet (the known quirk).

**Done by PROCESS #11, 24-25 Nov (all merged; entries in `design-decisions-2.md`, last three):**
- The update (decision "the update plan as laid out"): pull requests 233, 234 — tests once in the job (`p4 test`, the test
  record, `run verdict`), notices to running jobs, merge waits, slots, the check mended, three fold-ins. Trial on
  process3-probes ran cleanly (`process/research/update-trial-process3-probes-24nov.md`).
- The order of a move whose workflow changes: two pull requests, version first (decision B, 242).
- A tranche's scope recorded by ARCH in the round record (decision D, 246; `scopeOf`/`workOf`/`finished` in
  `tool/lib/round.mjs`, `open` writes `not_this_tranche`; job's rule 1, ARCH's rule 6). Checked with civicsmith ARCH #13 before
  the owner decided (`held-requirements-23nov.md`).
- civicsmith moved to the update and to D (its sessions on 231cc45); its coordinator cleared the halt (as ARCH #14's summary reads; the owner's
  words are in civicsmith's own record, not seen here); civicsmith tranche t2 (the refactoring) is running, ARCH #15.

**Registry (in `handover-process`):** process3-probes ROOT #8 `session_018Bhcefa2wforoAh5zomFNh` (coordinator #4
`session_018Bhcedx7Rp4XRCUFihCwvp`; quiet, every requirement met); civicsmith ROOT #7 `session_018BhceePQhUJcXt8W2pZGxx`
(started by the owner 24 Nov ~23:48Z, a restart that reset the depth), coordinator #7 `session_018BhcefEpYUAwGpc5yDxSCS`,
ARCH #15 `session_018BhceeJmQKXN6gKvE9QViZ`.

**On the owner's page, still waiting:** nothing of his but optional: the read-only check count on civicsmith (brief
`process/research/civicsmith-check-count-brief-24nov.md`, which names the old version 0eec86f). Archive PROCESS #11 once
PROCESS #12 runs.

**Known limits, written in the texts:** `merge` does not wait on an import the scan cannot follow; the check does not read
`require.resolve`, `#imports` or `createRequire(...)('<path>')`; not shown yet: a test run near two hours, a told job's related
scope, a told job above the slot number, the re-run `p4 test` asks for. Seen with no change: `next-job` leaves a round entry's
`pull_request` null until ARCH reconciles it.

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
