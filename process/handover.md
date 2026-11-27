# PROCESS handover

Written 27 Nov 2026 ~04:35Z by **PROCESS #20** (`session_012hdw2RBptiC6jL4mXfRBgf`), on the new Claude account, at a
natural pause (no worker running, everything merged). If you are its successor, you are **PROCESS #21**: read the
generation in `handover-process` (20), name yourself `PROCESS #21` with set-session-title, record generation 21 and your
session there, and keep the registry. Your fill (`get_session`, `context_usage`) is real after your first turn ends.
Never `git add -A` at the root; `.claude/worktrees/` is in `.git/info/exclude`. In `tool/`, check TypeScript is 5.6.3
(`npm ci` if not) before tests.

**Your reading:** the design in full (every file of `design/`, the parts 00 to 10 and their lettered companions), then
`process/README.md`, `process/decisions-index.md`, `process/research/README.md`, `process/lanes/civicsmith/README.md`,
`build/README.md`, and this handover.

**The owner's page** on this account: https://claude.ai/artifact/3eWSU2EvP27ttdJBZGjDJT (pinned; source
`coordination/owner_page/desk.html`; publish with the Artifact tool and land each source change by its own small pull
request). He also answers there by comments sent to Claude: read them with ArtifactComments, reply in the thread. A
marked decision typed there by him ("the user (owner)") is his typed word.

## START HERE: waiting for the owner

- **A and B** (`process/research/symbol-member-names-27nov.md`), put to him ~04:30Z; pdf-pixels is STOPPED on B.
  A: a member keyed by a well-known symbol is named by TypeScript's shifting `__@name@id` in listings and uses files
  (name it `[Symbol.name]`; read old names as such). B: owner lookups take `declarations[0]`; esbuild's `interface URL {}`
  under pdf-worker/ made the host's URL a later module's (refs.mjs `packageOf` ~75 and other `declarations[0]` uses): a
  symbol any host description declares is the host's; a package declaration never makes a symbol a product module's.
  Then C (same file, ~05:19Z, not stopping work): H misses R1/S4 resting on a missing global (workerd Response,
  Request); N lacks workerd's Fetch kinds; a union of typed arrays' method read as unclassified. Put A, B, C as one.
  On his word: brief a worker (worktree) to build them in `tool/` with tests; merge with the record entry (subject "The
  tool's reading of a product under the standard" in `design-decisions-2.md`), research, `changes` record; then put on his
  page the line for civicsmith's coordinator: `Instruction: move civicsmith to the latest Process4 version, now`.
- Older items still on his page (not urgent): ROOT C is superseded by D (done); "fill unreadable" B; two tidy
  questions; option C (Node from published types; not recommended now); the coordinator-vs-PROCESS page question; the
  two-hour background command.

## Done in PROCESS #20 (each merged on the owner's words; record, research and `changes` written)

- Account switch: registry; ROOT messaged; page moved to this account's pinned page.
- A, G1, G2, H, J, N (8b9fa8d): no module told before its conversion merges, its conversion clears its waiting notices;
  write spacing and header-aware retry; a host gap never refuses and its notes are not kept; reading faults; Node and
  workerd features added.
- D (244fbee): ROOT is not taken over for a version move; at a move it refreshes ARCH, the coordinator and the watcher
  from the new copy. Seen working: civicsmith ROOT #13 kept ROOT through the 02:24Z move.
- C & D (ab72c8a): design and build texts split into lettered companions keeping section numbers; each role reads whole
  files; 73 pieces of history removed; a job 117,561 bytes, ARCH 167,439. PROCESS's research index cut to ~12 KB.
- K1–K5 + "support all published limits, and add no restriction GitHub doesn't name as a limit" + margin A, about 95%
  (84c82df): role shares in one table (`tool/lib/pace.mjs`), `P4_ROLE` in each starting text's p4 line.

## Registry and products

- civicsmith (`neobobkrause/civicsmith-copy`, tranche `p4-tranche`) on Process4 7916c03 (newest but for texts since);
  ROOT #13 `session_012hdw2TD9pzVePLYLJy1SfE`; coordinator #16 `session_012hdw2S6GJTs5q2r99QFT6G`; ARCH #34. Converting
  all modules; it has also run ordinary bug-fix jobs. The owner asked how to skip walks for this housekeeping tranche; he
  was given a marked decision to type at the coordinator (ARCH names no area for a conversion; a round with none has no
  walk or deployment), and told that bug fixes change behaviour and would still be walked unless he says "conversions
  only".
- process3-probes: no ROOT on this account (registry root null).
- No live lane.

## Flow

`git fetch origin main`, `git checkout -B work/<name> origin/main`, edit, commit (author `Claude
<noreply@anthropic.com>`, trailers), `node tool/p4.mjs push`, `open --title`, `ready <n>`, then `merge <n>` (retry while
the check runs). An `open` can wait minutes now (the tool waits out GitHub's refusals and its shares): run it in the
background. Keep the `changes` record's JSON valid (`state read changes`, edit, `state write changes --from`).

## Lessons

- Weigh development velocity in every choice; caution is a cost. The owner wants every published GitHub limit honoured
  and nothing more (process3's extra limits slowed it).
- Follow a choice through to what it makes each role do at civicsmith's size before proposing it.
- His marked words only; when unmarked words shape a build, ask once whether to record them as a decision.
- Workers in worktrees build tool changes well with a precise brief; verify their numbers (a job's hourly share of 6 would
  have stalled jobs; set to 10).
