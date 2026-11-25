# PROCESS handover

Written 25 Nov 2026 ~19:20Z by **PROCESS #16** (`session_018Bhcee8zHEFYs9oDczEFEK`), live, mid-build (an interim update
so a successor can carry on; not a refresh). If you are PROCESS #17: read the generation in `handover-process` (16), name
yourself `PROCESS #17`, record generation 17 and your session there (keep the registry), and message each ROOT in the
registry your address. Your fill (`get_session`, `context_usage`) reads 0 until your first turn ends, then is real; refresh
at the first natural pause after 50 percent. Never `git add -A`; `.claude/worktrees/` goes in `.git/info/exclude`.

**Your reading** (the owner's decision (ii), 25 Nov): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, and this handover. Open a decision entry, a build text
or a research file, or give it to a worker, when a question touches it.

## START HERE: decision C is being built on the integration branch `work/decision-c`

The owner, 25 Nov 18:51 UTC, in PROCESS #16's session: "Decision: C, the full standard, with the first pass of 8; build
the conversion job, the notification tool, and the tool that keeps each module's uses file current on every module job."
And later: "It's important that this process4 change be done properly. This shouldn't result in any contradictions. All
changes should try to properly evolve existing elements of the process rather than piling more on top."

- The design document (https://claude.ai/artifact/FtqUWACJcaoWi9KZmubkAk, a Claude Doc, doc id
  `789cbf2d-7c33-4d7f-9248-31ac8a329a51`, body node `3212463b-6df3`, rev 58) was corrected by PROCESS #16 and is the
  current statement: Parts A (S1–S13, R1–R8, R10–R22, settings), B (conversion job; B7 every module job's uses file
  rewritten by the tool at push), C (the means M1–M9; meaning changes declared by the job and named by ARCH), D (the plan).
- **How it lands:** everything on `work/decision-c` (from main), reaching main as ONE pull request only when design,
  record, build texts, starting texts and tool agree and the tool's tests and the re-recorded proof pass. Main must never
  hold a design that contradicts its tool. Then Part D steps 5 (trial on process3-probes), 6 (civicsmith moves on his
  instruction at its coordinator), 7 (first pass: ARCH records a scope of the first 8 modules), 8 (his review).
- **Done on `work/decision-c`:** the record (entries "Who a change tells", "How `notify` reads the product", "How a notice
  reaches a user", "The round" item 2, "A job's tests" item 3, "What the check refuses" item 3, rewritten in place; 3B
  retired with his words kept); design parts 0, 2 (§§3, 6, 7, 8, 9), 4, 6, 10 evolved in place.
- **Workers (each in its own worktree, branches pushed, nothing merged):** `work/decision-c-texts` (build texts 01, 01b,
  02, new 02c the coding standard, 02b, 03, 04, 05; job.md, arch.md, starting_texts/00-index.md; job set 174,033 and
  ARCH set 174,270 of 175,000 — tight); `work/decision-c-refs` (tool: reference reader under the standard, places outside,
  order faults, copies, facility list, uses file writer at `push`, `p4 uses`, `check` from the uses file, the 27 cases as
  tests); `work/decision-c-means` (tool: means M1–M9 over the within-module closure, meaning declarations, `notify` as a
  lookup, merge wait and related tests from uses files, inference removed, proof re-recorded). Review each against the
  design for contradictions, merge each into `work/decision-c`, then run a fresh-eyes contradiction sweep of everything
  (design, record, build, starting texts, tool) before the one pull request into main.

## Also waiting for him (on his page "Process4 Waiting for Bob")

- **Idle compaction** (research `arch-compacted-fill-unread-25nov.md`): civicsmith ARCH #26 was compacted while idle 76
  minutes at 43 percent (harness notice: "turn off with "idleCompaction": false in settings.json"). Options 0, A (the
  environment's setup script also writes `"idleCompaction": false`; propose by the harness's approval prompt), B
  (correct part 7 §1: the fill is real after a session's first turn; tell civicsmith's coordinator ARCH's "fill
  unreadable" note is wrong), C both (recommended). Undecided.
- Choice 5 (depth limit, 5B recommended) undecided; process3-probes needs a fresh ROOT from him. Choice 6 (waiting work
  in parts) waited until who-is-told was settled (his words: "That's not a decision, it's a reality."); decision C settles
  it, and the design document (C5) says the split is still needed: put it back to him once decision C has landed.
- Later, one at a time (from PROCESS #14): who keeps his one standing page; the unproven two-hour background command; a
  job's reading set, 174,033 of 175,000 on `work/decision-c-texts` (ARCH's 174,270).

## civicsmith

- The owner typed at civicsmith's coordinator #9 (25 Nov ~16:55Z): "1. Decision: drop tranche t2, the refactoring
  tranche, so that civicsmith returns to a clean state. The refactoring restarts from its plan once the provider/user fix
  is in and confirmed as correct." Carried out (coordinator #9, 18:37Z): PRs 1680 (606 files back to main's, 18 removed) and 1681 (14
  requirements back to not yet met); round and waiting work emptied; no tranche open until the fix is confirmed. Leftovers
  ARCH named: some declared-uses lists trimmed by t2 may not match main's imports; seven requirement files' wording fixes
  were matched to t2's code. His page says so. civicsmith's hold stands. Its facts: `civicsmith-state.md`.
- Coordinator #9: `session_018BhcedNDzSLiPUv54snhat`.

## Lessons

- The owner wants load-bearing designs: "every reference means every reference". Never claim certainty with exceptions;
  separate a hidden reference from a bug; settle by study of the language, not sampling.
- Record his conversation words exactly in the research (`design.md` §6); ask once before recording anything as his
  decision.
- Workers survive a session restart; list `subagents/` in full (a `tail` hid them once, and duplicates were launched).
- Docs: one section per call; read with `sinceRev` before editing; never retype his edits.
- Workers: run the tool's tests only as `cd tool && npm test` or by file.

## Start checks

1. Environment BioDefault, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33. Registry: process3-probes ROOT #10 `session_018BhcedCGhhS8i8Lridx8te`;
   civicsmith ROOT #9 `session_018BhcefUXKE8xvUkaa9XjGi` (neobobkrause/civicsmith-copy, branch `p4-tranche`).
3. No live lane. His page: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy (source `coordination/owner_page/desk.html`;
   publish with the Artifact tool; land each source change by its own small pull request).
4. Flow: `git fetch origin main`, `git checkout -B work/<name> origin/main`, edit, commit (author
   `Claude <noreply@anthropic.com>`, trailers), `p4 push`, `p4 open --title`, `p4 ready <n>`, then `p4 merge <n>` once the
   required run has passed (retry while queued).
5. How he wants to be spoken to: plain words, short, bottom line first; say what is proven and what is not.
