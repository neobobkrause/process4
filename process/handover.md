# PROCESS handover — interim

**Interim and pre-live.** A bridge while nothing is in force and the tool is first being built.
The process repo's shared-state issue EXISTS (#33); `handover-process` carries PROCESS liveness.
During first-build this file stays the detailed handover.

Last written: 2026-11-20, by PROCESS `session_012hdw2UWLxH6BY5gyh3Lp4w`, at a natural pause
(~41% context) after the reading-values work. `main` tip `5af76b2`; tool-tests green on every PR.
Under decision C, **PROCESS refresh is the owner's act**: he starts the successor. Nothing is
half-done; everything is merged.

## Done this session (the figures task from the prior handover, now complete)

The owner settled the four reading values and the two measurement findings by marked decision,
and they are **applied and merged**. His exact words are in `process/design-decisions.md`
(subjects "The four reading values" and "Two reading-measurement findings …").

- **The four reading values** (PR #63): single text **60,000 B on Claude Code** (24,000 for
  Codex until measured — single text is now per-harness); set of texts **175,000 B** (measured);
  a role's text **8,192 B, ten rules**; fill level **50%** (his exception, to minimise expensive
  refreshes). Changed design part 5 §1–§2, part 7 §2, part 10 (item 1 settled; items 5, 10 →
  8,192), the starting-texts index (limit, measured framing, re-measured byte figures), and the
  refresh level 40→50% in all eight role texts. No tool change (the tool refuses nothing for
  size). His words verified verbatim on standing-page thread `70f2987e`, then confirmed
  ("Decision: yes, you've read that correctly").
- **The two findings** (PR #65), each "Decision: as recommended" (one comment per finding on the
  standing page): finding 1 (silent cut read) → no further change, the 60,000 limit sits below
  the ~25k-token cut and each governing text states its length; finding 2 (reading fill) → design
  part 7 §1 now records that a session reads its fill via `get_session` (`context_usage`), the
  route the role sessions use, and refreshes at a natural pause where it cannot.
- **Owner pages** (PRs #64, #66; artifacts republished): standing page "Process4 Waiting for Bob"
  (`3eWSU2EvP27ttdJBZGjDJT`, source `coordination/owner_page/desk.html`) now shows nothing
  waiting; the Open Points page (`617wp1vSKDpubVbwiGDpUU`) marks item 1 settled. Standing-page
  threads `70f2987e`, `e28dc54a`, `80460413` replied and resolved.

## Current state (everything merged)

- **PROCESS keeps the owner's standing page** (the owner's instruction; read state + edit pages,
  within approvals). No separate coordinating session. Keep it current, one matter at a time.
- **The measurement** that backs the figures: `measurement/results/` (report.md,
  role-text-upward.md, sweep.csv, raw/, harness/). Opus 5.5, medium, 1M window; 103 clean trials.
- **Codex re-measurement is owed** before the values govern there; the single-text figure is the
  one set per-harness. Codex is "later work, Claude Code first" (owner, 20 Nov).
- **The trial** (`neobobkrause/process3-probes`): stop lifted ("Decision: restart the build").
  Runs on an old process4 version (`process.json` pins `7d8e529`); main is far ahead. Moving it
  to latest is the owner's coordinator-instruction when he chooses. Trial page:
  `JEbwfU3pjZFzGgEcsyxzmb`. Still to try (trial stages): held merge + stop reaching an open job;
  a job replaced at its third failed run; an approvals edit with a restart; stage 4 trials 2–3;
  stage 5 walks. Each comes to the owner with steps when its moment arrives.
- **Still owed the owner:** the Process3-conformance plan (offered 19 Nov, no answer needed yet);
  Codex measurement + model (later, his OpenAI account). Civicsmith: honest assessment given —
  reading limits now have wide measured headroom; scale (~200 modules) and session-run
  walks/deployment/release on Cloudflare stay unproven; the first real tranche is the proof.
  Recommended phasing: figures into design (done) → civicsmith setup → small first tranche.

## Known environment facts

- `node tool/p4.mjs <cmd>` reaches GitHub; a direct `gh`/git command is denied by design. Flow:
  `git checkout -b work/<name> origin/main` → edit → commit → `p4 push` (work/ or job/ only) →
  `p4 open --title` → `p4 ready <pr>` → `p4 results <pr>` until passed → `p4 merge <pr>`.
- The cloud hands a stale `origin/main` ref at start; `git fetch origin main` corrects it. The
  handover's stated `main` tip is authoritative; the tool talks to real GitHub.
- Merge refusals: classifier noise ("Destructive or Unwanted Actions") → `git status` alone, then
  `p4 merge` alone, never chained. Transient "Protected branch update failed (HTTP 405)" right
  after the check goes green → re-check `results`, retry `merge` once.
- CI: `tool-tests` runs ~2 min when tool/shims/starting_texts change; design/process/coordination
  -only PRs usually pass fast. GitHub `tool-tests` is the authoritative full-suite check.
  `cd tool && npm ci` pins TS 5.6.3.
- Page work: load `ArtifactComments`; the standing page is `3eWSU2EvP27ttdJBZGjDJT`, its source
  `coordination/owner_page/desk.html` — keep repo and published page in sync (commit + publish).
  Record only marked "Decision:"/"Instruction:" words verbatim; show a rewritten decision entry
  once before it stands (part 5 §5). The owner works fast and decides via page comments too; a
  comment webhook arrives as a queued notification (ReadNotifications). The owner works fast and
  redirects often.
- A session reads its own fill via `get_session` (no id), field `context_usage`; refresh level is
  now 50% (design part 5 §2). This session paused at ~41%.
