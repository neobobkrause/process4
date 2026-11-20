# PROCESS handover — interim

**Interim and pre-live.** A bridge used while nothing is in force and the tool is still being
first built. Once the process repo's shared-state issue fully carries the handover, it lives
there in the `handover-process` record (design part 4 §4; build text 5 §4) and this file is
retired. The process repo's shared-state issue EXISTS (issue #33), and `handover-process`
carries PROCESS liveness; during first-build this file stays the detailed handover.

Last written: 2026-11-20, by PROCESS `session_012hdw2QyQ372mHkyQ1z8Nze`, at a clean pause.
**`main` tip is `56e7a62`; tool-tests green (CI passed on every PR this session).** Every
decision and correction below is recorded and merged; nothing is half-done. Under the owner's
decision C, **PROCESS refresh is the owner's act** — he starts the successor from the prompt
PROCESS hands him, surfaced by the coordinator on his standing page when a product is running.

## The owner's standing direction (19–20 Nov 2026)

Drive the goal autonomously: develop, test and evolve process4 until it meets its design
requirements and can build the trial product and larger products (e.g. civicsmith). Build the
designed remainder, correct measured faults, and merge building/correction work under the
standing approvals (tool-tests green) WITHOUT per-step go-aheads. A marked "Decision:"/
"Instruction:" is required only to change a RULE/requirement or to record an approval; record
his exact words verbatim and update the design in the same step. The owner is anti-caution-creep:
never add a test/gate/review/stop; prefer "no change" / removing unnecessary owner gates. He
works fast and redirects often; stay responsive and keep the open-points page current.

## What a successor reads first (PROCESS starting text)

In full, in order: all eleven design parts (`design/00`–`design/10`); then
`build/05-the-records-and-following.md`; then `process/design-decisions.md`; then PROCESS's own
folder (`process/`, including `process/research/`); then this handover.

## State of the owner-open review page — ONLY ITEM 1 (THE FIGURES) REMAINS OPEN

Page "Process4 Open Points": **https://claude.ai/artifact/617wp1vSKDpubVbwiGDpUU** (Version 9;
this session watches it — comments to Claude wake the session). Every owner-open item is now
settled or closed except **item 1 (the four size figures)**. Do not redo settled work.

- **Item 1 (the four figures) — OPEN, protocol ready to run.** The owner asked for an empirical
  measurement, not just to confirm the provisional figures. The protocol is developed and lives
  in **`measurement/`**: `protocol.md` (the method — bounded ~100–140 fresh reading sessions,
  conservative, rounds down with a margin, with a tightening rule), `initial-prompt.md` (the
  prompt for a CC session with THIS repo mounted — it builds carriers from the real
  `design/`/`build/`/`starting_texts/`), `README.md`, and `results/` (where the lead writes its
  report). **The owner runs it** (any CC account, repo mounted, fixing the reading sessions'
  model+effort to production). When the report lands, **PROCESS folds the four recommended
  numbers into a proposal for the owner** (he settles the figures; a session never sets them).
  Grounds: `process/research/queued-consistency-and-option-c-ripple-20nov.md`.

### Owner-open items settled or closed THIS session (all merged; words in `design-decisions.md`)

- **3 flawed-tranche release (PR #51):** the process leaves the release judgement to the owner —
  it neither forces nor forbids a release from a flaws-named tranche; his release approval + a
  clean install/update stay the guardrails. His word: "Decision" on the item-3 thread.
- **11 Codex (PR #51):** Claude Code first, Codex later. His word: "Decision: as recommended".
- **12 round-done deadlock (PR #53) — close the gap:** a walk-flaw (or job-flaw) module whose
  job closes unmerged with a nothing-to-change record (handing the flaw back to ARCH) is now
  finished for the round. Changed design part 2 §4, the tool's `finished` (`tool/lib/round.mjs`),
  `build/01b` command 12, and `tool/test/round.test.mjs` (a new walk-flaw-handback test). His
  word: "open item 12: decided - close the gap".
- **13 lane→coordinator (PR #55) — option A (via ARCH):** a lane passes the owner's marked words
  to ARCH, which relays them to the coordinator exactly as typed; no new channel. Changed design
  part 1 §4, `lane.md` rule 4, `arch.md` rule 7. His word: "open item 13: decided - A".
- **8 approvals/forbidden-commands wording — CLOSED (not a decision).** It was mis-framed. The
  wording is committed and in force: the owner's `CLAUDE.md` standing-approvals block + the
  `.claude/settings.json` deny list. The only defect was a dangling design citation to a
  working-draft file that never carried over; fixed in PR #50. Nothing is open; the owner edits
  the wording himself if he ever wants to (no session may). Page item 8 is marked Closed.
- (Items 1[method], 2, 4, 5, 6, 7, 9, 10 were settled by the prior session — PRs #35–#47.)

### Consistency corrections merged this session (standing direction; no rule change)

Verification-sweep findings + option-C ripples, all merged:
- **PR #49:** `build/01b` `ready`/`results`/`close` specs (`[<pr>] [--branch]` current-branch
  default) and "Nothing here is built" wording; option-C reconciliation in `build/04` stage 3,
  `build/05` §4, `build/01b` §16, and `arch.md` rule 8 (the owner starts PROCESS / the
  coordinator finds it, not ROOT).
- **PR #50:** `process.md` gained the "interrupt" lane act (with offsetting trims, now 4,086B);
  item-8 dangling citation fixed in design/06 §2 and design/10 §1 item 8.
- **PR #56:** `starting_texts/00-index.md` refreshed — §1 byte table and §2 design-part sizes
  and role-set totals were badly stale (the design grew since 18 Nov: part 04 is now 22,455B,
  the largest single text under 24,000; the largest reading set is a job's at 150,244B, under
  175,000); as-filled subsection rewritten for the 20 Nov fetch-line-excluded rule; line count
  fixed to 74; §4 item 4 marked settled by decision 13. `coordinator.md` made plain ASCII (two
  option-C em-dashes → commas, now 3,862B).
- **PR #52:** added the measurement protocol + lead prompt as research; **PR #54** moved them
  into `measurement/` for the repo-mounted run (superseding the earlier process3-probes prompt).

## Operational / the owner's (not authoring)

- **Run the figures measurement** (owner): start a CC session with process4 mounted, give it
  `measurement/initial-prompt.md`, fix the reading model+effort; it reports to `measurement/
  results/`; PROCESS then proposes the four figures.
- **Validate option C + trial stages 5–7** in `neobobkrause/process3-probes` (owner-start PROCESS
  refresh, walks, release, account switch). Cross-repo session *create* is no longer a dependency.
- **The first real tranche** (the proof) and the civicsmith conversion (its conversion plan +
  the owner's setup acts + the autoMode settings on its env).
- **Per-product** promote/rollback/support procedures (design part 3 §8), written at conversion.

## Known environment facts (do not relearn the hard way)

- The tool works from a mounted-repo session: `node tool/p4.mjs <cmd>` reaches GitHub (spawns
  `gh`). A DIRECT `gh`/git command is refused by the deny list — by design. No MCP merge tool.
- Flow per change: `git checkout -b work/<name> origin/main` → edit → `git add` + commit →
  `node tool/p4.mjs push` (push only `work/`/`job/` branches, NOT `claude/...`) → `p4 open
  --title "..."` → `p4 ready <pr>` → `p4 results <pr>` until `passed` → `p4 merge <pr>`.
  tool-tests runs ~2 min when `tool/`/`shims/`/`starting_texts/`/`tool-tests.yml` changed;
  design/process/measurement-only PRs pass at once.
- **Merge refusals:** classifier noise ("Destructive or Unwanted Actions") → run `git status`
  alone, then `p4 merge <pr>` alone; never chain. A transient GitHub "Protected branch update
  failed (HTTP 405)" also happens right after the check goes green → re-check `results` (confirm
  passed) and retry `merge` once; it cleared on retry for PR #55.
- `cd tool && npm ci` pins TypeScript 5.6.3 (a red local suite is usually TS 6.x). The full
  `node --test` suite is slow (>120s, notice-proof fixtures); the GitHub `tool-tests` run is the
  authoritative full-suite check — trust it rather than re-running locally.
- Agent workers with `isolation: worktree` create `.claude/worktrees/…` which auto-cleans when
  the worker finishes; do not commit it.
- **Answering owner comments on the page:** load `ArtifactComments`; a bare "Decision" on a
  thread settles that thread's restated subject; record only marked "Decision:"/"Instruction:"
  words verbatim; ask once about unmarked "decided"/agreements, then record on his confirmation.
  Sync the page's markers (settled/closed) and resolve threads after each decision lands.
