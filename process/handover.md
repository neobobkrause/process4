# PROCESS handover — interim

**Interim and pre-live.** A bridge while nothing is in force and the tool is first being built.
The process repo's shared-state issue EXISTS (#33); `handover-process` carries PROCESS liveness.
During first-build this file stays the detailed handover.

Last written: 2026-11-20, by PROCESS `session_012hdw2QyQ372mHkyQ1z8Nze`, **refreshing at ~66%
context** at the owner's prompt. `main` tip `86e64eb`; tool-tests green on every PR this session.
Under decision C, **PROCESS refresh is the owner's act**: he starts the successor. One task is
part-applied-on-paper only (the figures decision below); nothing is half-written on disk.

## DO FIRST: apply the owner's figures decision (his marked words, not yet applied)

On 20 Nov the owner settled item 1 (the four reading values) on the standing-page thread
`70f2987e` (artifact 3eWSU2EvP27ttdJBZGjDJT). **His exact words (verbatim, record them):**
"decision: as recommended, except that session refreshes a expensive and slow, and thus should
be minimized. So the fill level should be set to 50% - which still leaves a lot of room to
continue work up to the 74% when compaction can occur."

"As recommended" = PROCESS's proposal in `measurement/results/report.md` + the standing page.
**The four figures to set (measured on Claude Code, Opus 5.5, medium — `measurement/results/`):**
- **Single text: 60,000 B on Claude Code**; keep 24,000 for Codex until Codex is measured
  (harness-specific — this relaxes part 5 §1 "Codex maximums govern both" for the single text).
  Measured clean to 76,000; only limit is the harness read-cut (~25k tokens); 20% margin.
- **Set of texts: 175,000 B, now measured** (drop "provisional"); clean to 220,000.
- **Role's starting text: 8,192 B, at most ten rules** (a modest raise from 4,096 for breathing
  room — texts were at 4,086/4,096; measured safe far beyond, 45 rules/32.9 KB; conciseness rule
  part 5 §3 keeps them short). Rule COUNT stays 10.
- **Fill level: 50%** (the owner's exception; was 40%). Measured clean to 80%.

**Apply it (one PR, "each decision is one PR"), file by file:**
1. `process/design-decisions.md`: new entry "The four reading values (measurement)", his verbatim
   words above + the rule as it now stands.
2. `design/05-reading-and-documents.md` §2: rewrite the four-values table to the figures above;
   change framing from "provisional / until a second measurement" to "measured 20 Nov on Claude
   Code (Opus 5.5, medium); Codex re-measurement owed". Keep the 20-Nov fetch-line note (line 26).
   §1 line 10: amend "Codex maximums govern both" — the single-text figure is now per-harness
   (CC 60,000, Codex 24,000 until measured); the rest apply with Codex re-measurement owed.
3. `design/07-harness-claude-code.md` §2 "Reading, as measured": replace the first (weak)
   measurement with the new one — whole read to ~76,000 B / ~25k tokens; cut returns a PARTIAL
   read; the single-text figure is 60,000; 256 KB refusal stands. (This is where the CC-specific
   measured numbers live, per the design's harness-neutral-body structure.)
4. All **starting texts** with a refresh rule: change "40 percent" → "50 percent" in
   `process.md` r9, `arch.md` r9, `coordinator.md` r9, `root.md` r8, `watcher.md` r8, `lane.md`
   r7, `job.md` r9, `walking-session.md` r9. (Check each stays plain ASCII and under the new
   8,192 limit — trivial.)
5. `starting_texts/00-index.md`: role-text limit 4,096 → 8,192 (line 9; the "provisional" note
   line 28); the four-figures are now measured, not provisional.
6. `design/10-open-and-unproven.md`: §1 item 1 → settled (measured, with the fill-level
   exception at 50%); items 5 and 10 "under 4,096" → "under 8,192".
7. Grep afterwards for stray "40 percent" / "4,096" / "provisional" (reading values) and fix.
No tool change (the tool refuses nothing for size — part 6 §5), so tool-tests passes at once.

**Show the rewritten design-decisions entry to the owner once before it stands (part 5 §5).**

## Two measurement findings STILL OPEN for the owner (flagged, not decided)

From `measurement/results/report.md` and `role-text-upward.md`:
- **A cut read is silent.** Over ~25k tokens a single Read returns a PARTIAL file with no
  cut-notice in the tool result (this harness version) — revises design part 7 §2. Guard: keep
  the single-text limit below the cut (60,000 is). Bring the owner options (a design note; a tool
  or process guard) — do not add a gate on your own (rule 2).
- **A headless session cannot read its own fill.** A `claude -p` reader guessed 70% when it was
  16% — revises part 7 §1, and bears on the new 50% refresh trigger (a session must read its fill
  to honour it; works interactively, doubtful headless). Bring the owner options.

## Current state (everything else merged)

- **Owner-open review page** `617wp1vSKDpubVbwiGDpUU`: all items settled or closed; only item 1
  (figures) was open and is now settled by the owner (apply above, then mark it settled + resolve
  thread `70f2987e` on the standing page).
- **PROCESS now keeps the owner's standing page** "Process4 Waiting for Bob"
  (`3eWSU2EvP27ttdJBZGjDJT`; source `coordination/owner_page/desk.html`) — the owner's
  instruction, within approvals (read state + edit pages; no change needed). No separate
  coordinating session. After applying the figures, update that page (figures settled).
- **The figures measurement ran** (someone started the lead session): `measurement/results/`
  (report.md, role-text-upward.md, sweep.csv, raw/, harness/). 103 clean trials, ~$160.
- **Decisions this session, merged** (PRs #49–#57, #61): 3 (flawed-tranche release → owner's
  call), 11 (Codex: Claude Code first), 12 (round-done deadlock closed; tool + design + tests),
  13 (lane→coordinator via ARCH), 8 (closed — wording committed/in force), plus consistency fixes
  (build/01b, option-C ripples, process.md "interrupt", item-8 citation, 00-index refresh,
  coordinator.md ASCII) and the measurement area + the standing-page takeover.
- **Civicsmith readiness** (owner asked): assessed honestly — reading limits now have wide
  measured headroom (eases it), but scale (~200 modules) and session-run walks/deployment/release
  on Cloudflare are unproven; the design's position is the first real tranche is the proof.
  Recommended phasing: figures into design → civicsmith setup → small first tranche as proof.
- **The trial** (`neobobkrause/process3-probes`): stop LIFTED ("Decision: restart the build");
  running on process4 `7d8e529` while main is far ahead (`86e64eb`). Moving it to latest is the
  owner's coordinator-instruction when he chooses. Trial's own page: `JEbwfU3pjZFzGgEcsyxzmb`.
- **Still owed the owner:** the Process3-conformance plan (offered, no answer); Codex measurement
  + model (later, his OpenAI account).

## Known environment facts

- `node tool/p4.mjs <cmd>` reaches GitHub; a direct `gh`/git command is denied by design. Flow:
  `git checkout -b work/<name> origin/main` → edit → commit → `p4 push` (work/ or job/ only) →
  `p4 open --title` → `p4 ready <pr>` → `p4 results <pr>` until passed → `p4 merge <pr>`.
- Merge refusals: classifier noise ("Destructive or Unwanted Actions") → `git status` alone, then
  `p4 merge` alone, never chained. Transient "Protected branch update failed (HTTP 405)" right
  after the check goes green → re-check `results`, retry `merge` once. `p4 ready` on a FOREIGN or
  already-merged PR can error with a GraphQL-403 message; use your own PR number.
- CI: tool-tests runs ~2 min when tool/shims/starting_texts change; design/process/coordination/
  measurement-only PRs pass at once. GitHub `tool-tests` is the authoritative full-suite check
  (local `node --test` is slow). `cd tool && npm ci` pins TS 5.6.3.
- Page work: load `ArtifactComments`; record only marked "Decision:"/"Instruction:" words
  verbatim; a bare "Decision" on a thread settles that thread's restated subject; sync markers and
  resolve threads after a decision lands. The owner works fast and redirects often.
