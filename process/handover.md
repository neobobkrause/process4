# PROCESS handover

Written 25 Nov 2026 ~18:50Z by **PROCESS #15** (`session_018Bhcef6v3MqKry2Wh57iiK`) at its refresh point (past 50 percent),
at a natural pause: nothing half done, everything merged. Your successor is **PROCESS #16**: read the generation in
`handover-process` (15), name yourself `PROCESS #16` with set-session-title, record generation 16 and your session there
(the record starts with the JSON block; keep the registry), and message each ROOT in the registry your address. Your fill
(`get_session`, `context_usage`) reads 0 until your first turn ends, then is real (written at each turn's end); refresh at
the first natural pause after 50 percent. Never `git add -A`.

**Your reading** (the owner's decision (ii), 25 Nov): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, and this handover. Open a decision entry, a build text
or a research file, or give it to a worker, when a question touches it.

## START HERE: the owner is reviewing the design for "who uses what"; wait for his marked decision

The design document, for his review and comments: **"Process4: who uses what — the design for your decision"**,
https://claude.ai/artifact/FtqUWACJcaoWi9KZmubkAk (a Claude Docs doc; doc id `789cbf2d-7c33-4d7f-9248-31ac8a329a51`, its
one tab's body node `3212463b-6df3`; edit with the Claude_Docs tools; read with `sinceRev` from rev 47, PROCESS #15's
last write). His standing page links to it. Comments on it may arrive; answer each in its thread with a doc comment.

What it holds (he asked for it in this shape, 25 Nov): Part A the coding standard for references to earlier modules
(S1–S13, R1–R12, and from the studies R14–R22); Part B the conversion job (identify every reference, standard or not;
convert; the metadata file `process/modules/<module>.uses.json` with reference, type, route and place incl. code/test and
the test case's name); Part C the notification tool (users told on a change of **means**, decided by the tool with
certainty; a change of **meaning** under the same types declared by the job, and named by ARCH's work order — both
duties called out at his request; an accidental change of meaning is a provider bug caught by its own tests); Part D the
plan (record, texts, tool, proof, trial on process3-probes, civicsmith's move, first pass of 8 real modules, his review);
E what it replaces in his rulings; F options 0/A/B/C, C recommended; G civicsmith now; H not proven; "Is it
load-bearing?" (yes, on two premises: the checker works as documented; Node's descriptions are accurate).

Grounds, all in `process/research/uses-metadata-25nov/`: `design.md` (PROCESS's design and **all the owner's words of 25
Nov, exact, in §6** — conversation, none marked), `every-reference.md`, `standard.md`, `changes.md`, `proof.md`,
`means.md`, `tool-map.md`, `texts.md`, `civicsmith-state.md`, `study-references.md` (the reference side from the
language: R14–R22), `study-changes.md` (the change side: the means is decidable; "unchanged" reduces to the halting
problem; the sound within-module dependence rule, control and data; the 118 needed users classified).

Note: `design.md` §2–§5 is an earlier stage; the document is the current statement. On his decision, fold the document
into the design and texts.

**On his "Decision:"** (rule 3): record his exact words, **rewriting in place** the existing entries in
`design-decisions-2.md` — "Who a change tells", "How `notify` reads the product", "How a notice reaches a user", the
merge wait in "The round" — retiring the replaced rulings (3B of 25 Nov morning; the told job's third reading of 20 Nov;
the merge wait's reading of 24 Nov) with their dates; no new entries beside them (his instruction). Design part 2 §7
point 1 ("No list is kept by hand") is replaced. Then Part D, in order. Nothing is built before his decision. He asked
for the first pass to use the finished tool on 8 real modules whose files are kept once confirmed — no throwaway sample.

## Also waiting for him (on his page "Process4 Waiting for Bob")

- **Idle compaction** (research `arch-compacted-fill-unread-25nov.md`): civicsmith ARCH #26 was compacted while idle 76
  minutes at 43 percent (harness notice: "turn off with "idleCompaction": false in settings.json"). Options 0, A (the
  environment's setup script also writes `"idleCompaction": false`; propose by the harness's approval prompt), B
  (correct part 7 §1: the fill is real after a session's first turn; tell civicsmith's coordinator ARCH's "fill
  unreadable" note is wrong), C both (recommended). Undecided.
- Choice 5 (depth limit, 5B recommended) undecided; process3-probes needs a fresh ROOT from him. Choice 6 (waiting work
  in parts) waits until who-is-told is settled (his words: "That's not a decision, it's a reality.").
- Later, one at a time (from PROCESS #14): who keeps his one standing page; the unproven two-hour background command; a
  job's reading set at 170,742 of 175,000.

## civicsmith

- The owner typed at civicsmith's coordinator #9 (25 Nov ~16:55Z): "1. Decision: drop tranche t2, the refactoring
  tranche, so that civicsmith returns to a clean state. The refactoring restarts from its plan once the provider/user fix
  is in and confirmed as correct." ARCH #27 (`session_018Bhcedh1q7Nb2FASGrj4Pq`) is carrying it out; confirm with the
  coordinator, then update his page. civicsmith's hold stands. Its facts: `civicsmith-state.md`.
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
