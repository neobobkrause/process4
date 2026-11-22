# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 22 Nov 2026 ~23:25Z, by **PROCESS #8** (`session_018BhcecJ8tf5Z9JtZZCD7Pz`), at its refresh point:
about 50 percent fill, a natural pause, nothing half done, everything merged (main after pull request 186). You, the
successor, are **PROCESS #9**: read generation 8 in `handover-process`, name yourself `PROCESS #9` with
set-session-title (pass your own session id), record generation 9 and your session there (the file must start with the
JSON block), and message both ROOTs your address. Read your own fill (`get_session`, `context_usage`) after every owner
turn; it can read 0 while a turn is open. Refresh at the first natural pause after 50 percent (the owner's decision B of
22 Nov). Never `git add -A`; add paths by name.

**Your reading, as decided 22 Nov (research through an index):** the design, build text 5, the two decision files, your
folder's `README.md`, `process/research/README.md` (the index; one line per file) and `process/lanes/civicsmith/README.md`,
and this handover. Open a research file, or give it to a worker, only when a question needs it. Keep the index current:
one line for each new research file.

**PROCESS #8 did, all merged:** took over from #7 (archived); the civicsmith check re-run arrived (177 of 204 modules pass;
217 comment-based refusals in 27 modules; the exclude list for vendored and built files; research
`check-on-real-code-22nov.md`); civicsmith moved to 641fec3 (all sessions on it, jobs held at slot number 0). Three faults
from civicsmith researched and put to the owner; he chose B for all three ("decision:B", then "Decision: all as you've
recommended"); built in pull request 185: refresh at the first pause after 50 percent; whoever archives a session removes
its scheduled wake; research read through an index (entries in `design-decisions-2.md`; research files named in the
index). civicsmith's coordinator was told all of it as information.

**Waiting for the owner (on his page):** his line in civicsmith coordinator #2's session, "Instruction: move civicsmith to
the latest Process4 version", so civicsmith gets the three decisions. The stale wake `trig_012wRs9PsVduMaQfyeTdsQpL`
("civicsmith watcher hourly wake", bound to archived watcher #1) goes then, or by his own delete. Information given him,
not his to decide here: two old Process3 scheduled tasks ("sweep" hourly, "watcher" daily) still run.

**Open, not yet put to him:** PROCESS's own reading set with the decision record is about 211,000 bytes, over 175,000 but
under the 220,000 measured (noted in the entry "Research is read through an index"); no change recommended. Not answered
yet: the trial's ROOT #7 has not confirmed recording PROCESS #8 (civicsmith's did).

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry, two products. Message each ROOT your session and generation (titles in the
   account's session list; ROOTs refresh, so confirm the live one there):
   - `process3-probes` (the trial): ROOT #7 `session_018Bhceg1d5SVx54aCGkzRe3`; coordinator #3
     `session_018BhceeRZwDtL5rXcx3Mp5q`. Quiet, not stopped, every requirement met.
   - `civicsmith` (repository neobobkrause/civicsmith-copy, branch `p4-tranche`, process copy `641fec3`):
     **civicsmith ROOT #2** `session_018BhcedH2Cu33ATGjYeJE8v` (from 23:04Z); coordinator #2
     `session_018BhceejEKQ1qWjGNt2T2xr`; ARCH #6 `session_018BhcecPFUPKp25SZCCoVXF`; its shared-state issue is 1122.
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
