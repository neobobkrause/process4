# PROCESS handover — interim

**Interim and pre-live.** A bridge used while nothing is in force and the tool is still being
first built. Once the process repo's shared-state issue fully carries the handover, it lives
there in the `handover-process` record (design part 4 §4; build text 5 §4) and this file is
retired. The process repo's shared-state issue now EXISTS (issue #33), and `handover-process`
carries PROCESS liveness; during first-build this file stays the detailed handover.

Last written: 2026-11-20, by PROCESS `session_012hdw2R18xbdETqTENSyT1M`, at the owner's
instruction to refresh at ~80% context. **`main` tip is `fc2644b`; tool 105/105.** A clean
pause: every decision below is recorded and merged; nothing is half-done. Under the owner's
decision C, **PROCESS refresh is the owner's act** — he starts the successor from the prompt
PROCESS hands him (below), surfaced by the coordinator on his standing page when a product is
running.

## The owner's standing direction (19–20 Nov 2026)

Drive the goal autonomously: develop, test and evolve process4 until it meets its design
requirements and can build the trial product and larger products (e.g. civicsmith). Build the
designed remainder, correct measured faults, and merge building/correction work under the
standing approvals (tool-tests green) WITHOUT per-step go-aheads. A marked "Decision:"/
"Instruction:" is required only to change a RULE/requirement or to record an approval; record
his exact words verbatim and update the design in the same step. The owner is anti-caution-creep:
the process must leave HIM the balance of time/resources/quality, not decide it for him; never
add a test/gate/review/stop; prefer "no change" / removing unnecessary owner gates.

## What a successor reads first (PROCESS starting text)

In full, in order: all eleven design parts (`design/00`–`design/10`); then
`build/05-the-records-and-following.md`; then `process/design-decisions.md`; then PROCESS's own
folder (`process/`, including `process/research/`); then this handover.

## This session's work (20 Nov) — all recorded and merged to `main`

The owner's agenda (A owner-open review doc; B verification sweep; C shared-state issue) is DONE,
option C (the ROOT-refresh fault) is fixed, and the owner then settled most owner-open items
live via comments on the review page.

- **Option C — PROCESS refresh (PR #32).** The OWNER starts and refreshes PROCESS, not ROOT
  (his "Decision: option C (for now)"). ROOT's cross-repo start of PROCESS was never proven and a
  sibling cross-repo lifecycle act (ROOT archiving the process-repo PROCESS session) was refused
  twice even post-decision-B; so owner-start is the designed path. Decision B's other
  clarifications (non-substantive re-attempt; role→address resolution; successor registration)
  stand for every other cross-repo act. Grounds:
  `process/research/root-refresh-of-process-failed-again-19nov.md`.
- **Verification sweep (agenda B) — PR #34.** Six workers; **process4 is sound** (tool 105/105,
  all commands/records/texts conform). Findings in `process/research/verification-sweep-19nov.md`.
  Four cheap consistency fixes done in #34. **STILL QUEUED (corrections, no rule change; each
  build text must be read in full first):** (a) build/01b — update `ready`/`results`/`close`
  command specs to show `--branch`/current-branch default; (b) **process.md** — add "interrupt"
  to its lane acts (needs a small offsetting trim; see size note); (c) **00-index.md** — refresh
  stale raw-byte and "as filled" tables and line count. NOTE: build/04 and build/06's old
  PROCESS-refresh references were effectively superseded by option C — re-check and reconcile them.
- **Shared-state issue (agenda C) — done.** Created process repo issue **#33**
  (`state write --create --process`); `handover-process` carries PROCESS liveness.
- **Owner-open review (agenda A) — the "Process4 Open Points" page:**
  **https://claude.ai/artifact/617wp1vSKDpubVbwiGDpUU** (this session watches it; comments to
  Claude wake this session). The owner settled items on it by marked comments; each settlement
  was recorded verbatim in `design-decisions.md`, applied to the design, and merged. **The page's
  "settled" markers were synced for items 1, 2, 4, 5, 6, 7, 9.1; NOT yet for item 3, item 8, the
  rest of item 9, or item 11 — sync them in one pass.**

### Owner-open items — settled this session (all merged, words in `design-decisions.md`)

- **1 size limits:** the 4,096-byte role-text limit is measured against a role's instructions
  proper, leaving the one mechanical fetch line out of the count (PR #35). The four size FIGURES
  themselves remain provisional (still open — see below).
- **2 how a tranche ends:** no change to the testing/walk policy; no end-of-tranche sweep (PR #36).
- **4 publishing a release:** Process4 builds+tests the installer (fresh install AND upgrade on a
  dev account); on the owner's approval ARCH publishes by placing the installer at the
  distribution point using a release token; a production secret may be used via a secret-management
  facility to produce the installer; **no session directly holds a production key**; installs/updates
  on real sites are user-initiated. "Successful" = finishes with no error and the site starts
  (PRs #38, #39).
- **6 terminology + told-job tests:** "provider"/"user" defined (PR #37); the three told-job test
  readings confirmed (PR #41).
- **7 the smaller readings:** confirmed as recommended; each inline "Reading" flipped to settled
  in parts 0–6 (PR #42).
- **9 the five walk matters:** 9.1 UX lane maintains the journey list, no per-tranche owner
  approval (PR #43); 9.2 AI step judged as a module test, "what must be present" set per journey by
  the UX lane (PR #44); 9.3 option A — a tranche may end with AI journeys recorded not walked
  (PR #44); 9.4 option a — ARCH may set a walker's entry aside as no flaw, reason in the account
  (PR #45); 9.5 option a — the session walks by hand what no step covers (PR #47).
- **Tranche-approval REMOVED (PR #46):** a tranche opens because the product has work to do
  (changed requirements, lane issues, flaws, notices); ARCH decides its scope; no owner proposal
  or approval before a tranche. The owner directs continuously via the coordinator/lanes/marked
  instructions and still approves releases.

### Owner-open items — STILL OPEN (awaiting the owner's marked word)

- **3 a tranche merged with its flaws named:** PROCESS reframed the recommendation to **leave the
  release judgment to the owner** (no process prohibition on releasing from a flaws-named tranche;
  the real guardrails — his release approval + a clean install/update — stay). Awaiting his marked
  decision. (Design part 3 §5 still has the old "Reading" that no release follows until a later
  clean tranche — flip it when he decides.)
- **8 his standing approvals and forbidden commands wording:** the file the design/page cite
  (`process4/working/design_work_18nov/owner_acts_and_approvals.md`) is **missing from the public
  process3 repo** (confirmed by cloning it). The real, in-force text is the owner's committed
  `CLAUDE.md` standing-approvals block + `.claude/settings.json` deny list. This item is the owner's
  to author (no session writes/relays the approvals). Options put to him: (a) confirm the committed
  wording as settled and PROCESS fixes the dangling citation; (b) he revises. Awaiting his word.
  **Fix the dangling citation (design part 6 §2 and part 10 §1 item 8) either way.**
- **1 (the figures):** confirm the four provisional size figures, and what the two measured ones
  become after a second measurement. (The measurement METHOD is settled; the figures are not.)
- **11 Codex:** everything design part 8 marks not known, from the owner's OpenAI account, plus
  which Codex model. Recommendation: proceed on Claude Code, Codex later. Awaiting his word.
- **10 "at most ten rules":** already settled (no action).

### Two verification findings that are the owner's to settle (bring options; may be rule changes)

- **Round-done deadlock (VW3 GAP 1):** a walk-flaw-only module whose job closes unmerged can hang
  round-done (design part 2 §4 sanctions the scenario but gives the module no path to finished/
  dropped). Needs a design clarification + small tool correction.
- **Lane→coordinator channel (VW4-1):** `lane.md` rule 4 has a lane pass the owner's marked words
  to the coordinator, but its acts grant no such channel and the design routes lane traffic through
  ARCH. Resolve by routing via ARCH or granting the channel. (Related to the lane readings.)

## Operational / the owner's (not authoring)

- **Validate option C + stages 5–7 in the trial** (`neobobkrause/process3-probes`): the owner tells
  the coordinator "move to the latest Process4 version"; a fresh ROOT/coordinator load option C;
  then the owner-start PROCESS refresh, the walks, the release and the account switch can be
  exercised (trial items). Cross-repo session *create* is no longer a dependency.
- **The first real tranche** (the proof) and the civicsmith conversion (its conversion plan + the
  owner's setup acts + the autoMode settings on its env).
- **Per-product** promote/rollback/support procedures (design part 3 §8), written at conversion.

## Size note (role starting texts)

Measured with a realistic 40-char commit fill and `<copy>` left literal (how the tool fills):
`process.md` 4,091, `coordinator.md` 4,078, `root.md` 3,770 — all under 4,096. **Thin margins.**
Adding "interrupt" to process.md (queued fix) needs an offsetting trim. Per the owner's decision
(PR #35), measure against the role's instructions proper, leaving the fetch line out of the count —
so the real headroom is larger for fetch-line-carrying texts; measure with literal replacement, not
`sed`.

## Known environment facts (do not relearn the hard way)

- The tool works from this session: `node tool/p4.mjs <cmd>` reaches GitHub (spawns `gh` as a
  child). Only a DIRECT `gh`/git command is refused by the deny list — by design, not the tool
  being blocked. No MCP merge tool; use `p4 merge <pr>`.
- Flow for each change: branch from main (`git checkout -b work/<name> origin/main`) → edit →
  `git add` + commit → `node tool/p4.mjs push` (push only `work/`/`job/` branches, NOT
  `claude/...`) → `p4 open --title "..."` → `p4 ready <pr>` → `p4 results <pr>` until `passed` →
  `p4 merge <pr>`. tool-tests runs ~2 min when tool/shims/starting_texts/tool-tests.yml changed;
  design/process-only PRs pass at once but a queued run can briefly refuse the merge ("required
  status check ... is queued/in progress") — wait and retry, not a permission refusal.
- **Classifier noise (decision B in action):** `p4 merge` is sometimes refused as "Destructive or
  Unwanted Actions". Recovery: run `git status` alone, then `p4 merge <pr>` alone. Never chain
  p4/git acts.
- `cd tool && npm ci` pins TypeScript 5.6.3; a red suite locally is usually TS 6.x, not a real break.
- Answering owner comments on the page: load `ArtifactComments`; read the thread, reply (plain,
  ≤4096B), and `resolve` once applied. A bare "Decision" on a thread settles that thread's subject;
  if ambiguous, confirm the object before recording. Record only marked "Decision:"/"Instruction:"
  words; ask once about plain agreements.
