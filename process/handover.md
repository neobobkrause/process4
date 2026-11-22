# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 22 Nov 2026 ~19:45Z, by **PROCESS #7** (`session_018BhceeMdoMMNuimU91cPnD`), running, not at
a refresh point. Read your own fill (`get_session`, `context_usage`) after every owner turn; note that it can
read 0 while a turn is open, so judge by what you have read as well. You, the successor, are **PROCESS #8**:
read generation 7 in `handover-process`, name yourself `PROCESS #8` with set-session-title (pass your own
session id), and record generation 8 and your session there (the file must start with the JSON block).

PROCESS #7 so far: named itself, wrote generation 7, messaged both ROOTs (19:40Z); researched both civicsmith
faults (research files below, PR 167); put them to the owner as one group on his page (PR 168): **1A/1B/1C**
(copy not read-only; recommended 1B, drop `chmod -R a-w` from the fetch line and say the copy is kept apart
by rule) and **2A/2B/2C** (lanes record; recommended 2B, write the claim with `"session": null`, then fill
the address once; one condition in `laneRefusal`). Both change the tool, so one version; civicsmith moves
only on his "move civicsmith to the latest Process4 version" in its coordinator's session. Nothing built yet.
**All three decided by the owner on his page (22 Nov ~20:52-20:54Z), all built and merged:** 1B (PR 172), 2B (PR 174),
3B with D (`language_reader.exclude`) and E (non-recursive walks) (PR 176, main `a20b33a`). Entries in
`design-decisions-2.md`; proof decision T14 re-recorded in `tool/test/fixtures/notice-proof/expected.json`.
Action 9 done on his word. **Waiting:** the owner types the re-run prompt (on his page) into "Process4 civicsmith
setup session"; its report comes to PROCESS #7 by message. When it arrives: if the check now passes most modules,
tell the owner civicsmith can move (his line in civicsmith's coordinator's session: "Instruction: move civicsmith
to the latest Process4 version"), and tell ARCH (via the coordinator, as information) that `language_reader.exclude`
exists for its vendored and built files and that its lanes-record placeholder can now be fixed in one write. If
many still fail, research the remaining kinds before proposing anything (rule 6). Known residue: TypeScript's own
recursion overflows at ~4,000 terms inside one function; `check` reports that file "cannot tell", listing and
notify are not guarded.

**Decided and built: 1B** ("Decision: 1B, as recommended", page comment 20:51Z; PR 172; entry "Each session's copy of the process" in `design-decisions-2.md`). Still open with the owner: 2 and 3. civicsmith has not moved; suggest one move once 2 and 3 are built.

**The check measurement arrived at 19:24Z** (PROCESS #6 forwarded it unchanged): `check` refuses 176 of 178
civicsmith modules, passes none, times out on bundler, crashes on pdf-worker; 74,271 complaints. Researched in
`process/research/check-on-real-code-22nov.md` (PR 170): the tool labels every strict-reader diagnostic as one of
the two approved refusals. Put to the owner as **choice 3**: 3A no change; **3B recommended**, refuse only where a
comment states what is contradicted or code crosses a provider's stated interface (fault D's old option D); 3C
refuse only on changed lines; with D (skip vendored/built files the config names) and E (mend the
`listing.mjs:232` stack overflow) under any option. civicsmith's coordinator was told (information). When the owner
chooses 1, 2 and 3, build them as one tool change (run only the tool tests that cover it: state, util, notify,
notice-proof), record his words in `design-decisions-2.md`, update the design and build texts in the same step,
then tell him the one line for civicsmith's coordinator. 3B needs one more read-only run on civicsmith to measure
what remains; ask the owner for it after it is built.

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry, two products. Message each ROOT your session and generation (titles in the
   account's session list; ROOTs refresh, so confirm the live one there):
   - `process3-probes` (the trial): ROOT #7 `session_018Bhceg1d5SVx54aCGkzRe3`; coordinator #3
     `session_018BhceeRZwDtL5rXcx3Mp5q`. Quiet, not stopped, every requirement met.
   - `civicsmith` (repository neobobkrause/civicsmith-copy, branch `p4-tranche`, process copy `eeb35f3`):
     **civicsmith ROOT #1** `session_018BhcegAmzjwNWYL3hiKonG`, started by the owner 22 Nov 19:00Z; its
     shared-state issue is 1122. It recorded PROCESS #6 in its roles record, so it must hear from you.
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

## Waiting to arrive (addressed to PROCESS #6's session; ask for them again under your address)

- **The check measurement** (arrived 19:24Z; see the top). The owner pasted a read-only run of `check` over civicsmith's 178 modules
  into the set-up session (`session_018BhcecbrWWH3xBs3py4NQW`, "Process4 civicsmith setup session") at
  ~18:44Z. Its report was to come by message to PROCESS #6 and had not come by 19:10Z. PROCESS #6, if
  still open, forwards it to you and does nothing else. If it does not come, ask the owner to type in
  that session: send the report to PROCESS's new session. Research and the options to weigh:
  `process/research/check-on-real-code-22nov.md` (first two modules failed: setup-words 551, 518 of them
  in a vendored file; record-grammar 59; the tool cannot leave a file out of the reader). **This is the
  main open risk.** Bring the owner the result with options; PROCESS #6 told him its recommendation that
  no job opens on civicsmith before then, and told ROOT #1 the same as information.
- **civicsmith ROOT #1 answered (19:05Z), nothing more to wait for there.** Addresses, in civicsmith's roles
  record: watcher `session_018Bhcegprx34rVCBgDhMe58`; ARCH `session_018BhcedYrhngyxRofUgU39S`; coordinator
  `session_018BhcefXVtmctn1hrCaXdZU`. `p4-tranche` carries the hook: ROOT started from `d3cb895b` (the
  merge of civicsmith-copy pull request 1121, main into p4-tranche), so **Action 9a is done**. PROCESS
  #6's information about the check measurement was passed unchanged to ARCH and the coordinator.
- **Both faults below are now researched (PROCESS #7) and put to the owner as choices 1 and 2 on his page.**
- **A second process fault arrived at 19:12Z**, recorded unchanged in
  `process/research/fault-lanes-record-before-start-22nov.md`: the lanes record cannot be written before a
  lane starts and then name its session, because the tool refuses the second write; civicsmith's record
  holds a placeholder as the live ux lane, and ARCH keeps the real address in its handover. Not
  researched. Two faults now wait for research and options, with the check measurement.
- **A process fault arrived from civicsmith's coordinator at 19:08Z** and is recorded unchanged in
  `process/research/fault-fetch-copy-not-read-only-22nov.md`: the fetch line's `chmod -R a-w` does not make
  the process copy read-only, because cloud sessions run as root. Not researched; research it and put
  options to the owner. The coordinator has put PROCESS's hold-jobs recommendation to the owner as a
  question on civicsmith's standing page.

## With the owner (nothing marked is unrecorded)

- Not confirmed by him: **Action 9** (the branch rule on main and `p4-tranche`: pull request required,
  `module-tests` required), on the lane's page. Ask once. Action 9a is done (above).
- To put to him, one at a time, after the measurement (research recorded, no options put yet):
  1. civicsmith's own workflows hold repository secrets (Docker Hub; a Cloudflare token for `deploy-test`)
     that act 3 ("no repository secrets") removes; `release-sign` uses an environment secret behind a
     required reviewer. Options: an environment with a required reviewer; the push moves into the
     session-run release ceremony; an exception to act 3.
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
