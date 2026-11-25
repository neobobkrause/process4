# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 25 Nov 2026 ~07:05Z, brought up to date ~13:15Z on the owner's word ("refresh"), by **PROCESS #13** (`session_018BhcedHCN78Xtr7XLu33G2`), at its fill level (49 percent),
at a natural pause: nothing half done, everything merged. Your successor is **PROCESS #14**: read the generation in
`handover-process` (13), name yourself `PROCESS #14` with set-session-title (your own session id), record generation 14 and
your session there (the file must start with the JSON block; keep the registry as it stands), and message each ROOT in the
registry your address. Read your own fill (`get_session`, `context_usage`). Refresh at the first natural pause after 50
percent. Never `git add -A`; add paths by name. The owner archives PROCESS #13 himself (a step on his page).

**Your reading:** the design, build text 5, the three decision files (`design-decisions.md`, `-2.md`, `-3.md`; new subjects
go in `-3.md`), `process/README.md`, `process/research/README.md` (the index), `process/lanes/civicsmith/README.md`, and this
handover. Open a research file, or give it to a worker, when a question needs it.

## START HERE: two choices wait for the owner, on his page

**Also urgent (10:40Z), choice 6 on his page:** civicsmith's waiting-work record passed GitHub's comment limit; every queued
`notify` loses its placements for modules with no open job (`process/research/waiting-work-record-size-25nov.md`). Recommended
6B: a record spans several comments; entries drop old `uses`; `open --module` cuts a job block as `notify` does (filings
1669 and following 1674 opened with no job block, 12:55Z and 13:07Z; each holds a slot and its users' merges wait). ARCH holds
the notify queue meanwhile. Also on choice 2: ARCH defers jobs' first comments (its standing rule #24), which the extraction
job reported as conflicting with job rule 2; 2C+ removes the cause.

**Urgent first (09:05Z):** civicsmith `notify 1404`, a comments-only change, told ~150 (nearly all not followed fully) on
55db8e4, which lacks 3B; ~70 old merges wait in ARCH #22's notify queue. On the owner's page, top: (1) his hold on
notice-only checks until civicsmith moves (his instruction in civicsmith's coordinator session); (2) choice 2 (2C+);
(3) the move. Pushed to his phone. If he decides 2C+, build it at once (below).

**Choice 2 — a module's first comments tell users** (research: `process/research/notify-1356-still-197-25nov.md`, its last
two sections; prototype `process/research/first-comments-2c-25nov/prototype.diff`, switch `P4_OWNCODE`). Options on his page:
2A no change; 2C a first `@throws`/`@bound` on an entry whose own code is unchanged tells no one; **2C+ (recommended)** 2C, and
on such an entry no declaration backstop and an "accepts more" not put to the checker; 2D any difference on unchanged code
(not recommended: silences 13 recorded bound changes, misses a change inside a helper). On his word: build from the
prototype (drop the switch), replay the proof (1 answer, Z19, re-recorded with its reason), update design part 2 §7 (a
module with no comments yet / an unknown kind becoming stated), build text 2b §6's table, record in `-3.md`. Found along the
way, not put: rule 52 cannot confirm a class with a `#private` field; class members never list `@throws`; whether the 1B
`unbracket` fix covers an optional constructor parameter (`constructor_?:`) — check.

**Choice 5 — the depth limit** (`process/research/depth-limit-watcher-25nov.md`): a session at depth 8 cannot start sessions
or arm wakes; the warning "two levels away" comes one takeover late. 5A no change; **5B (recommended)** warn three levels
away and make no planned takeover at depth 6 (the fresh-ROOT start goes on the owner's page instead); 5C the second half
only. Text only: design part 4 §6, part 7 §1's row, `starting_texts/root.md` rule 6 (and watcher text if it names depth),
starting-texts index sizes. process3-probes needs a fresh ROOT from the owner now (on its coordinator's page).

**After choice 2**, the owner moves civicsmith with one line in its coordinator's session: "Instruction: move civicsmith to the
latest Process4 version" (on his page). civicsmith is on 55db8e4; since then main has 1B, 3B, 4B.

## Done by PROCESS #13, 25 Nov (all merged; entries in `design-decisions-3.md`)

- 1B (PR 275): `open --module` writes `notices`; the repeat check reads work lines in any state; `unbracket` keeps a parameter
  list's brackets; a notice prints raises/channel/may-be-missing where they differ.
- 4B (PR 282): one name exported by two interface files for two things is two entries, `<file>:<name>`.
- 3B (PR 283): a user not followed fully is told of a changed function/method/value/class member only where its files name it
  or it reaches the provider unreadably (`tool/lib/notice/narrow.mjs`); 8 proof answers re-recorded (`reports`).
- Research merged: 1356's split (first `@throws`/`@bound` on unchanged code), the narrowing measured, same-name entries,
  first comments (2C/2C+/2D), the depth limit. The starting-texts index sizes were re-measured (they had gone stale).
- Lesson: the permission checker refused a commit that changed `build/` before the owner's marked decision. Build, design
  and starting texts change only in the pull request that carries out his decision; keep a correction as a patch in
  research until then.

**Registry (in `handover-process`):** process3-probes ROOT #10 `session_018BhcedCGhhS8i8Lridx8te` (depth 7; its watcher #12 at
depth 8 cannot arm its wake); civicsmith ROOT #9 `session_018BhcefUXKE8xvUkaa9XjGi`. civicsmith coordinator #9
`session_018BhcedNDzSLiPUv54snhat`; ARCH #19 (ask the coordinator); process3-probes coordinator #4
`session_018Bhcedx7Rp4XRCUFihCwvp`.

**Still to put to the owner, one at a time, when quiet:** who merges a product's set-up pull request into main (lane point
11); civicsmith's installer takes no token, so the install and update before a release are his own Cloudflare sign-in.
Small, information only: a re-run of `notify` leaves an earlier run's entries for modules it no longer tells; an owner's hold
on notice-only checks is not a standing note `next-job` can pass over.

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry, two products: read it in `handover-process` (START HERE above gives each product's sessions as of
   25 Nov ~07:00Z). Message each ROOT your session and generation; ROOTs refresh, so confirm the live one in the account's
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
