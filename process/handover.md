# PROCESS handover — interim

**Interim and pre-live.** A bridge while nothing is in force and the tool is first being built.
The process repo's shared-state issue EXISTS (#33); `handover-process` carries PROCESS liveness.
During first-build this file stays the detailed handover.

Last written: 2026-11-20, by PROCESS `session_012hdw2Use8KHcTuQ4WjvjL6`, refreshing at ~51%
context at a natural pause. `main` tip `9f5a9f7`; tool-tests green on every PR this session.
Under decision C, **PROCESS refresh is the owner's act**: he starts the successor. Nothing is
half-done; everything is merged.

## Read this first — merge behaviour

**Showing the owner a record entry is transparency, not an approval gate** (design part 5 §2/§5;
PROCESS rule 4). The owner's standing approvals let PROCESS merge into `main` once `tool-tests`
passes, without a person's review. So: once the owner gives a marked decision, record his words,
show him the entry, and **merge on CI-pass — do not wait for a separate "merge it."** Hold only on
a change he has NOT decided, on moving a product to a new version, or on publishing a release.
Faithful-to-settled corrections (making a text match an already-settled decision; no rule change)
merge the same way, under his standing direction.

## Done this session (all merged, in order)

- **#72** research note for the naming change.
- **#73** faithful-to-settled correction: two stale "owner approves/proposes a tranche" references
  (arch.md rule 6; a decisions-record parenthetical) brought into line with "Decision: Remove the
  owner's tranche-approval" (reaffirmed 20 Nov).
- **#74 Standardized session names** (owner: job name + whole change "as recommended", 20 Nov):
  `PROCESS #N`; `<product> <role> #N`; a job `<product> <module> #<n>` (its job number); a walking
  session `<product> walk #<number>`. Generation = a role's session count, kept in its handover
  record, surviving a cold restart. Mechanism in design part 7 §1 (set-session-title; handover-
  keeping roles and owner-started ROOT/PROCESS self-name; ARCH names jobs/walkers); convention in
  part 4 §11; Codex "Not known" in part 8; `generation` in build text 5. **No tool change.**
  set-session-title by a role session is marked unproven (part 7 §3) — trial proves it.
- **#75** standing page: naming settled; dropped Process3-conformance and Codex (owner said no
  need for both here).
- **#76** research note for the coordinator/PROCESS-discovery fault.
- **#77 Coordinator finds the live PROCESS (owner: "Decision: option C", 20 Nov).** The fault: a
  refreshed coordinator ran `state read handover-process --repository <process repo>` (decision C)
  and got **HTTP 403** — a session is scoped to its own repo; a `gh api` read of another repo's
  issue is refused (measured both ways; public too; plain `git` clone still works). Option C: the
  coordinator reads PROCESS from its **own product's roles record `process` field** (local). ROOT
  writes it from a message PROCESS sends on start; PROCESS knows which ROOT to message from a
  `products` registry in its own `handover-process` (seeded by the owner once per product); ROOT
  re-announces to PROCESS on its own start. Fallback: coordinator surfaces to the owner if the
  field is none/stale. Owner-start of PROCESS (decision C 19 Nov) is unchanged; only its cross-repo
  read is superseded. **No tool change.** Research:
  `process/research/coordinator-cannot-read-process-liveness-20nov.md`.

## Current state

- **PROCESS keeps the owner's standing page** (his instruction; within approvals). No separate
  coordinating session on the process side. He works fast, redirects often, and decides via page
  comments too (a comment webhook arrives as a queued notification — ReadNotifications).
- **Standing page** "Process4 Waiting for Bob" (`3eWSU2EvP27ttdJBZGjDJT`, source
  `coordination/owner_page/desk.html`): nothing owed, nothing pending (both cancelled items
  dropped). Keep repo desk.html and the published page in sync (commit + publish via Artifact).
- **Nothing waiting for the owner's decision** right now.

## Open operational follow-ups for the TRIAL (the owner's / the trial's, not PROCESS's)

These let the trial actually use option C; PROCESS acts only in this repo, so flag them, don't do
them:
1. **Move the trial to the latest Process4 version** (owner tells the trial coordinator "move to
   the latest Process4 version"; latest is now `9f5a9f7`), so its sessions refresh onto the fix.
2. **Seed PROCESS's `products` registry once** with the trial's ROOT session, so PROCESS announces
   itself (build text 5 §4; design part 4 §5).
3. **The trial coordinator (`session_012hdw2TiGHJ2cGSkBVR1fRc`) is blocked** asking "which session
   is PROCESS (A: 14:06 session; B: none)" — neither is right; the live PROCESS is this session's
   successor. PROCESS may message a product's coordinator (standing approvals), so the owner can
   have PROCESS tell it the live PROCESS to unblock it — a one-off, offered, not yet taken up.

## Still owed the owner, later

- Optionally cleaning history from the **build texts and the starting-texts index** (the design
  itself was cleaned; these still carry their own history). Offer only.
- (Process3-conformance and Codex are **dropped** per the owner, 20 Nov — do not re-offer.)

## Environment / tool notes

- `node tool/p4.mjs <cmd>` reaches GitHub; a direct `gh`/git command is denied by design. Flow:
  `git checkout -b work/<name> origin/main` → edit → commit (author `Claude <noreply@anthropic.com>`,
  end with the Co-Authored-By + Claude-Session trailer) → `p4 push` → `p4 open --title` →
  `p4 ready <pr>` (opens draft; must ready before merge) → `p4 results <pr>` until passed →
  `p4 merge <pr>`.
- The cloud hands a **stale `origin/main`** at start; `git fetch origin main` corrects it.
- CI `tool-tests` runs ~2 min when tool/shims/starting_texts change; design/process/coordination
  -only PRs pass fast. Watch with a Monitor polling `p4 results`, not sleeping.
- **Cross-repo reality (measured, design part 7 §3):** a `gh api` read of another repo's state is
  refused (403); cross-repo **messaging** works; cross-repo session create/archive is refused.
  Build cross-repo coordination on messaging + each session's own-repo state only.
- A session reads its own fill via `get_session` (no id), field `context_usage`; refresh at 50%.
- **Governing-text bookkeeping:** every design part / build text states "Length: N lines" = `wc -l`
  at its top; update it when you add/remove lines. The starting-texts index (`00-index.md`) carries
  per-text byte figures and combined reading sums — re-measure and update them whenever a design
  part, build text or starting text changes size (they feed the 175,000 set-max check). Starting
  texts: ≤8,192 bytes, ≤10 numbered rules.
- Parallel workers (Agent, general-purpose) help for large read/edit jobs on disjoint files, with a
  precise brief and a "change no rule" guardrail; review the diff before committing.
