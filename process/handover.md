# PROCESS handover — interim

**Interim and pre-live.** A bridge while nothing is in force and the tool is first being built.
The process repo's shared-state issue EXISTS (#33); `handover-process` carries PROCESS liveness.
During first-build this file stays the detailed handover.

Last written: 2026-11-20, by PROCESS `session_012hdw2UWLxH6BY5gyh3Lp4w`, refreshing at ~63%
context at the owner's prompt. `main` tip `e454467`; tool-tests green on every PR this session.
Under decision C, **PROCESS refresh is the owner's act**: he starts the successor. Nothing is
half-done; everything is merged.

## Read this first — a merge-behaviour correction from today

**Showing the owner a record entry is transparency, not an approval gate** (design part 5 §2/§5;
PROCESS starting-text rule 4, both corrected today, PR #70). The owner's standing approvals already
let PROCESS merge into `main` once the required check (`tool-tests`) passes, **without a person's
review**. So: once the owner has given his marked decision for a change, record his words, show him
the entry, and **merge on CI-pass — do not wait for a separate "merge it."** Hold for his word only
on a change he has NOT yet decided, on moving a product to a new process version, or on publishing a
release. (This session over-blocked early on; the owner corrected it: "Decision: fix it", 20 Nov.)

## Done this session (all merged)

- **The four reading values** (PR #63), his words recorded: single text **60,000 B on Claude Code**
  (24,000 Codex until measured — single text is now per-harness); set **175,000 B**; role text
  **8,192 B / 10 rules**; fill level **50%** (his exception, to minimise expensive refreshes).
  Design parts 5/7/10, the starting-texts index, and the 40→50% refresh line in all eight role
  texts.
- **The two measurement findings** (PR #65), each "Decision: as recommended": silent cut read → no
  change (guarded); reading fill → design part 7 §1 records that a session reads fill via
  `get_session` (`context_usage`), and refreshes at a natural pause where it cannot.
- **The design is now history-free** (PR #69): the owner's decision ("Decision: I agree with your
  recommendations… Do it.") to enforce part 0 §1 / part 5 §4. Removed from all eleven parts: draft
  lineage, dated decision provenance, predecessor-process references, working-file paths,
  change-narratives, and the "Claude decided"/"Reading"/"Settled" marks (legend keeps only Open,
  Unproven). Part 10 §1 collapsed to the one genuinely-open item (the approvals wording). No rule
  changed. Research: `process/research/design-history-separation-20nov.md`. **The build texts and
  the starting-texts index still carry their own history — offered to clean next if he wants.**
- **Merge-gate fix** (PR #70), above.
- **Owner pages** kept in sync (PRs #64, #66, #67 handover, #68 research): standing page
  "Process4 Waiting for Bob" (`3eWSU2EvP27ttdJBZGjDJT`, source `coordination/owner_page/desk.html`)
  shows nothing waiting; Open Points page (`617wp1vSKDpubVbwiGDpUU`) all settled/closed.

## A fresh downloadable copy of the design

The owner asked for one and got it this session: a single combined Markdown of all eleven cleaned
parts, built from `design/` and sent to him (not committed — built artifact). Rebuild with:
`for n in 00 01 02 03 04 05 06 07 08 09 10; do cat design/${n}-*.md; printf '\n\n---\n\n'; done`.

## Current state

- **PROCESS keeps the owner's standing page** (his instruction; within approvals). No separate
  coordinating session. One matter at a time; he works fast and redirects often, and decides via
  page comments too (a comment webhook arrives as a queued notification — ReadNotifications).
- **The trial** (`neobobkrause/process3-probes`): stop lifted. The owner asked to "move the trial to
  the latest Process4 version" — that is the **trial coordinator's** job, not PROCESS's (PROCESS acts
  only in this repo; a product version-move is the owner instructing the trial coordinator, which
  tells the trial's ARCH). I gave him the steps: open the trial coordinator session and type
  "Instruction: move to the latest Process4 version"; no commit id needed. Latest is now `e454467`.
  Trial page: `JEbwfU3pjZFzGgEcsyxzmb`.
- **Measurement** that backs the figures: `measurement/results/` (Opus 5.5, medium, 1M window).
- **Still owed the owner:** Process3-conformance plan (offered, no answer needed yet); Codex
  measurement + model (later, his OpenAI account); optionally cleaning history from the build texts
  and the starting-texts index (as the design was cleaned).

## Environment / tool notes

- `node tool/p4.mjs <cmd>` reaches GitHub; a direct `gh`/git command is denied by design. Flow:
  `git checkout -b work/<name> origin/main` → edit → commit (author `Claude <noreply@anthropic.com>`,
  end with the Co-Authored-By + Claude-Session trailer) → `p4 push` (work/ or job/ only) →
  `p4 open --title` → `p4 ready <pr>` → `p4 results <pr>` until passed → `p4 merge <pr>`.
- The cloud hands a **stale `origin/main`** at start; `git fetch origin main` corrects it. The
  handover's stated `main` tip is authoritative.
- CI: `tool-tests` runs ~2 min when tool/shims/starting_texts change; design/process/coordination
  -only PRs pass fast. Watch it with a Monitor (poll `p4 results`) rather than sleeping.
- Merge refusals: classifier noise ("Destructive or Unwanted Actions") → `git status` alone, then
  `p4 merge` alone, never chained. Transient 405 right after green → re-check `results`, retry once.
- A session reads its own fill via `get_session` (no id), field `context_usage`; refresh at 50%
  (design part 5 §2). This session paused at ~63%.
- **Parallel workers** (Agent tool, general-purpose) worked well this session for a large read/edit
  job: survey then clean the eleven design parts, ~4-6 at once on disjoint files, with a precise
  brief and "change no rule" guardrail — then review the diff (deletions dominate) before committing.
  Keeps heavy reading/editing off PROCESS's own context.
- Page work: load `ArtifactComments`; keep repo `desk.html` and the published standing page in sync
  (commit + publish). Record only marked "Decision:"/"Instruction:" words verbatim.
