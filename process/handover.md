# PROCESS handover

Written 25 Nov 2026 ~15:00Z by **PROCESS #14** (`session_018BhcedkyhzaVi28AAStM22`) at its refresh point (past 50 percent),
at a natural pause: nothing half done, everything merged. Your successor is **PROCESS #15**: read the generation in
`handover-process` (14), name yourself `PROCESS #15` with set-session-title, record generation 15 and your session there
(the file starts with the JSON block; keep the registry), and message each ROOT in the registry your address. Read your
fill (`get_session`, `context_usage`); refresh at the first natural pause after 50 percent. Never `git add -A`.

**Your reading** (the owner's decision (ii), 25 Nov): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, and this handover. Open a decision entry, a build text
or a research file, or give it to a worker, when a question touches it. A new decision rewrites its subject's entry in
`design-decisions.md` or `-2.md` in place; a new subject goes where there is room, and in the index.

## START HERE: design the owner's proposal — each module records the providers it uses

After the research below, the owner proposed (conversation, 25 Nov) that every module keep a file of the providers it and
its tests use, written by a job that understands the code and kept current by every job, so finding users is a lookup:
`process/research/uses-metadata-25nov.md` (his words in full, and PROCESS #14's first analysis). He wants a fix "rigorously
understood" to fix the problems seen and those known but not yet seen, not another patch. PROCESS #14 told him option C is
set aside while this is designed. Design it in full with workers (the list at the end of that file), record it, and put it
to him with options; nothing is built before his marked decision. It reverses his own rule in design part 2 §7 point 1
("No list is kept by hand"): say so plainly.

## Also waiting: a process fault from civicsmith (15:05Z)

civicsmith ARCH #26 was compacted without asking for a refresh; its fill read 0 from inside. Recorded, not researched:
`process/research/arch-compacted-fill-unread-25nov.md`. Research it and put options to the owner, "no change" among them.

## Earlier: the research it follows

**Who is told after a change** (`process/research/who-is-told-25nov.md`, sections 3–5; prototype
`who-is-told-25nov/proto.diff`, scratch, against b798e6a). The owner asked for this research himself. Options 0 (no
change), A (2C+ alone — this is choice 2), B (mend coding faults F3, F4, F6, F7 and the own-name miss, plus an order rule:
an unreadable import in a module before the provider cannot reach it), **C (A and B; recommended)**, D (C, and narrow what a
not-followed user is told of a changed kind; decide only after a civicsmith measurement). On his word for C: build from the
prototype (proof: 2 answers change, Z19 and T10, re-record each with its reason); design part 2 §7 (describing unchanged
code is not a change; the order rule sentence), build texts 2b §6 and 5 §6; record it (rewriting the notice subjects in
place); then the read-only civicsmith measurement (brief in the research, §5) before civicsmith moves.
**Before building C, explain one number to him:** the proof table shows "needed and missed: 45" under every option,
including today's. The research does not explain it. Find out (likely the proof's `needs` counting changes the design
accepts missing, or internal changes) and tell him plainly whether any are real misses.

## Done by PROCESS #14, 25 Nov (all merged)

- Start: named, generation 14, both ROOTs told and confirmed (civicsmith ROOT #9, process3-probes ROOT #10).
- The owner asked whether 36 hours of changes were made properly. Audit: `process/research/cleanup-audit-25nov/` (five
  areas; README has the summary). Changes had been appended beside old rules, not rewritten. He chose **B, (ii)**.
- (ii): PROCESS reads the design in full and the record, build texts and research through indexes (PR 298).
- B, the cleanup, changing no rule: the record regrouped, 66 entries → 32 subjects in two files, all 78 owner
  quotations verified verbatim (PR 301); the design's 26 findings (PRs 300, 302, 305); the build texts' 34 (PR 304); the
  starting texts (PR 303); the tool (PR 309: one size-fitting function `fitReasons`, one record rule `recordNeed`, one
  job-block reader `jobBlockOf`, dead code and `run tests`/`run scope` removed; two corrections to agree with the design:
  notify never fails for size, and a full job block still takes its notice at once; 166/166 tests, proof unchanged).
  `done-*.md` in the audit folder lists each change.
- Choice 6 (waiting-work record in parts; `waiting-work-record-size-25nov/6b.patch`) **waits** until who-is-told is
  corrected: the owner's words, "We're just going to wait. That's not a decision, it's a reality." Do not record it as a
  decision. When it comes back: rebuild 6B on `fitReasons` (`open` still copies reasons without it).
- Choice 5 (depth limit, 5B recommended) is on his page, undecided; process3-probes needs a fresh ROOT from him.
- Told civicsmith's coordinator #9 (`session_018BhcedNDzSLiPUv54snhat`) that choice 6 waits and no move is due.

## To put to him, one at a time, after who-is-told (found by the cleanup; each would change a rule or a claim)

1. Design part 1 §5 says the coordinator keeps his one standing page; PROCESS keeps its own page "Process4 Waiting for
   Bob" too (its starting text now names it). Settle which.
2. Part 7 §1 says a background command may run two hours; only a 30-minute cut of a command moved to the background was
   ever measured. Mark it unproven, or measure.
3. A job's reading set is 170,742 bytes of 175,000 before the product's own files.
Left small: `scope.mjs` and `relatedCmd` keep two stale messages that tests match; build text 4's trial line in `scope.mjs`.

## Lessons

- Rewrite a rule where it lives, and search every text for the old wording, in the same change. Never append beside it.
- Never call a change "the next step" before the owner's marked decision; say "proposed".
- Workers: run the tool's tests only as `cd tool && npm test` or by file. A bare `node --test` in `tool/` runs fixtures
  and hangs on the proof product's worker. Check a worker's progress before telling the owner it is fine.
- Worker checkouts live under `.claude/worktrees/` (excluded locally in `.git/info/exclude`).

## Start checks

1. Environment BioDefault, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33. Registry: process3-probes ROOT #10 `session_018BhcedCGhhS8i8Lridx8te`;
   civicsmith ROOT #9 `session_018BhcefUXKE8xvUkaa9XjGi` (repository neobobkrause/civicsmith-copy, branch `p4-tranche`).
3. No live lane. The owner's page: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy (source
   `coordination/owner_page/desk.html`; publish with the Artifact tool and land each source change by its own small pull
   request). Comments on it wake PROCESS; read them with ArtifactComments, reply and resolve.
4. Flow: `git fetch origin main`, `git checkout -B work/<name> origin/main`, edit, commit (author
   `Claude <noreply@anthropic.com>`, trailers), `p4 push`, `p4 open --title`, `p4 ready <n>`, then `p4 merge <n>` once the
   required run has passed (retry while it is queued). design/, build/, starting_texts/ change only in the pull request that
   carries out his marked decision.
5. How he wants to be spoken to: plain words, short, bottom line first; one matter at a time; say what is proven and
   what is not; check before you claim progress.
