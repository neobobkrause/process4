# PROCESS handover

Written 26 Nov 2026 ~19:45Z by **PROCESS #19** (`session_018Bhcec84vDYoFHq35xmbGS`), at a natural pause (no worker running,
everything merged), because **the owner is moving Process4 and civicsmith to another Claude account** (this account's
quota is nearly spent). If you are its successor, you are **PROCESS #20**: read the generation in `handover-process` (19),
name yourself `PROCESS #20` with set-session-title, record generation 20 and your session there, and keep the registry.
Your fill (`get_session`, `context_usage`) is real after your first turn ends. Never `git add -A`; put
`.claude/worktrees/` in `.git/info/exclude`. In `tool/`, check TypeScript is 5.6.3 (`npm ci` if not) before tests.

**Your reading** (the owner's decision (ii)): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, `build/README.md`, and this handover.

## START HERE: the account switch (build text 6)

The ROOT addresses in the registry are the OLD account's and cannot be reached from the new one (sessions are scoped to
one account). The owner starts each product's ROOT in the new account (civicsmith first; ROOT's own start message to
PROCESS goes to the old PROCESS and is lost). So on your start: list this account's sessions (`list_sessions`) and find
each product's live ROOT by its name (`civicsmith ROOT #<n>`, `process3-probes ROOT #<n>`); write those addresses into
the registry; message each ROOT your address so it records you in its roles record's `process` field. If a ROOT is not
yet started, say so on the owner's page and wait for it. A ROOT that messages you its address: update the registry.

civicsmith (`neobobkrause/civicsmith-copy`, tranche branch `p4-tranche`) was converting all modules (the owner's
instruction at its coordinator: every module in order, conversions only) on Process4 72c177e. Its ARCH was pushing the
move to db9d6e5 (main, holding everything below) when the switch began. If the move did not merge, the owner repeats
"Instruction: move civicsmith to the latest Process4 version" at the new coordinator; on the new version a move rewrites no
uses files.

## Done in PROCESS #19 (all merged on the owner's words; each in the record and `changes`)

- A conversion's merge tells no one (10164fb).
- Tool corrections, "Decision: A": a type error gone is no change; notices carry only changed parts, in parts; R15 by union
  member; R19 real assignments only; `process.versions`, `mock.property`, `mock.timers.setTime` (70022da).
- Only a change of an item's stated types or bounds tells; a started program's start arguments and output are its
  interface; new errors, values within the type, side effects, test prerequisites do not (3231d0a). ARCH names and jobs
  declare a change of meaning or of an error a user relies on.
- Development velocity: a working principle (design part 1 §6) and a known weakness (§7) (4bef9b5).
- A uses file names its tool version as information only; rewritten only when its module's code or tests change, or a
  module-list move; earlier versions' files read as written; no notes on unknown Node features (ee2091f). An R14 place
  refers to no product module and tells no one, in any file (66d3d87).
- The speed fix for uses-file rewrites: shared parsed files, up to four readers, files identical (f12d152).

## Open, not yet put to the owner

- civicsmith's first-pass figures (`first-pass-figures-26nov.md`): ~95% of places converted; tests replacing a host global
  (clock, fetch, Date) have no form in the standard (three modules); "data owners come later in the order". The owner
  said to stop measuring and let the conversion run show; bring only what the run reports.
- Older items on his page: C for ROOT's depth; correcting "fill unreadable" (B); two tidy questions; option C (Node from
  published types, sized in `rules-r15-r19-host-26nov.md`).
- A started program's standard input is not counted in its interface (`types-and-bounds-only-26nov.md`); left, nothing
  measured behind it.

## Registry and start checks

1. Environment: the owner moves it to the new account himself (`autoMode`, `idleCompaction` false, secrets).
2. `node tool/p4.mjs state read handover-process`. Old-account registry at handover: civicsmith ROOT #11
   `session_018BhcegXRx9wyHus76AsBKB`; process3-probes ROOT #15 `session_018Bhcec9ah8YVo8Rcu5w2yz` — both unreachable now.
3. No live lane. His page: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy (source `coordination/owner_page/desk.html`;
   publish with the Artifact tool; land each source change by its own small pull request). Under a new account the page
   may not be editable by you; if not, publish a new page and give him the link.
4. Flow: `git fetch origin main`, `git checkout -B work/<name> origin/main`, edit, commit (author
   `Claude <noreply@anthropic.com>`, trailers), `p4 push`, `p4 open --title`, `p4 ready <n>`, then `p4 merge <n>` (retry
   while the check runs). Keep the `changes` record's JSON valid.

## Lessons (the durable ones are now in design part 1 §6–7)

- Weigh development velocity in every choice; caution is a cost. Do not propose measuring or testing before acting; the
  real run reports what matters. He was angered, rightly, by proposals to measure, by an hour-long rewrite nobody foresaw,
  and by false positives defended as "safe".
- Follow a choice through to what it makes each role do at civicsmith's size, before proposing it.
- His marked words only; when one "Decision: A" could answer two open questions, apply it to the one just put and ask
  about the other.
