# PROCESS handover

Written 26 Nov 2026 ~00:40Z by **PROCESS #17** (`session_018Bhcec7gbFKBzcgnG5iqoh`), a safety rewrite while running (near its refresh point; fill ~46 percent). If you are its successor, you are **PROCESS #18**: read the generation in
`handover-process` (17), name yourself `PROCESS #18` with set-session-title, record generation 18 and your session there
(keep the registry), and message each ROOT in the registry your address. Your fill (`get_session`, `context_usage`) reads
0 until your first turn ends, then is real. Never `git add -A`; put `.claude/worktrees/` in `.git/info/exclude`.

**Your reading** (the owner's decision (ii)): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, and this handover. On `work/decision-c` there is also
`build/README.md`, the index of the build texts' sections, which PROCESS reads in full once it reaches main.

## START HERE: `work/decision-c-design` holds the design, tool and texts; final checks running

Branch `work/decision-c-design` (head 6626d3e or later) = decision C + facility decision + the design of who is told
(part 2 §6–8, rewritten on his request of 25 Nov ~22:55Z) + the tool and texts built to it + a footprint reduction.
His decisions recorded there (`design-decisions-2.md` "Who a change tells" item 3 and words at its end;
`design-decisions.md` "The reading values"): accepting more tells users (23:07Z); a job's `same` record and a told job
that changes nothing runs no test (~23:11Z, on his "yes"); his 14 Nov domain/range words (verified in process3 2a43eb5);
"Decision: 0" (26 Nov ~00:00Z): part 2 stays whole while no product runs on Codex. His words: "You don't need a decision
to build it, though you do need a decision when we decide to use it." — so merging to main is on his recorded decisions;
a product moves only on his instruction at its coordinator. "The need for rigor and accuracy must survive any footprint
reduction." His page for reading part 2 §7–8: https://claude.ai/artifact/42z6GsY6bEZQ6ZVuXFSioZ (regenerate with
`md2html.py`, kept in research `precision-26nov/` if the scratchpad is gone — else rewrite it).

Done: design check (28 findings) and final check (13; five misses fixed: a middle module's own items changing with a
provider's are declared by its told job, which then merges; re-exports; order faults without a uses file; new name
through `export *`; conversion tells real changes); one writer per record (the job writes only its record; the required
run reads it: `shims/module-tests.yml`); scope ignores comments/layout; footprint: 98 cuts (10,226 bytes); sets: job
168,933, ARCH 169,040, PROCESS 162,072 (before texts3). Tool 266/266. Original proof 112/958/846/0.

Running at 00:40Z 26 Nov: `work/decision-c-texts3` (texts for the tool's new flags: `push --notice <n>`, `run verdict
--job-record`, test record `modules`, `message`, new change words) and `work/decision-c-cutcheck` (verifies each cut lost
nothing: `cut-check.md`). Next: restore anything a cut lost; join texts3; run `npm test`; then ONE pull request
`work/decision-c-design` → main, body quoting his decisions; merge once `tool-tests` passes; update his page (the "Being
built" card and the waiting items) and notify his phone. Then Part D (trial on process3-probes needs a fresh ROOT from
him; civicsmith moves only on his instruction at its coordinator).

Later, for him, one at a time: a job reads ~31,600 bytes it never acts on (footprint study item 4: a reading-set change);
the idle-compaction choice; choice 5; the two tidy questions; who keeps his standing page.

The design document for him: https://claude.ai/artifact/FtqUWACJcaoWi9KZmubkAk (Claude Doc `789cbf2d-…`, body node
`3212463b-6df3`, rev 92). He asked it to state only the design (no options, no history); keep it so. Its title in his
list still reads "…for your decision": only he can rename it in a browser.

## Also waiting for him (on his page "Process4 Waiting for Bob")

- **Idle compaction** (research `arch-compacted-fill-unread-25nov.md`): civicsmith ARCH #26 was compacted while idle 76
  minutes at 43 percent (harness notice: "turn off with "idleCompaction": false in settings.json"). Options 0, A (the
  environment's setup script also writes `"idleCompaction": false`; propose by the harness's approval prompt), B
  (correct part 7 §1: the fill is real after a session's first turn; tell civicsmith's coordinator ARCH's "fill
  unreadable" note is wrong), C both (recommended). Undecided.
- Two open items from the tidy study (`tidy-25nov.md` §5): which branch an urgent fix is built on, against "one lasting
  tranche branch" (#20); and whether the design's status line should still say nothing has run (#21). For him.
- Choice 5 (depth limit, 5B recommended) undecided; process3-probes needs a fresh ROOT from him. Choice 6 (waiting work
  in parts) waited until who-is-told was settled (his words: "That's not a decision, it's a reality."); decision C settles
  it, and the design document (C5) says the split is still needed: put it back to him once decision C has landed.
- Later, one at a time (from PROCESS #14): who keeps his one standing page; the unproven two-hour background command; a
  job's reading set (now 166,734 of 175,000 on `work/decision-c`, so no longer pressing).

## civicsmith

- The owner typed at civicsmith's coordinator #9 (25 Nov ~16:55Z): "1. Decision: drop tranche t2, the refactoring
  tranche, so that civicsmith returns to a clean state. The refactoring restarts from its plan once the provider/user fix
  is in and confirmed as correct." Carried out (coordinator #9, 18:37Z): PRs 1680 (606 files back to main's, 18 removed) and 1681 (14
  requirements back to not yet met); round and waiting work emptied; no tranche open until the fix is confirmed. Leftovers
  ARCH named: some declared-uses lists trimmed by t2 may not match main's imports; seven requirement files' wording fixes
  were matched to t2's code. His page says so. civicsmith's hold stands. Its facts: `civicsmith-state.md`.
- Coordinator #9: `session_018BhcedNDzSLiPUv54snhat`.

## Lessons

- Do not keep re-running measurements on the proof as evidence (his words, 25 Nov ~22:45Z, in `precision-26nov/README.md`):
  they rarely reflect the real workflow, cost tokens and time, and convince you of conclusions later found wrong. Reason
  from the texts and the workflow context; measure only when he asks.

- Judge a false result in the process's context (his words above): ask why the change is made and who knows. A measurement
  that replays changes as if no role or job acted overstates misses; never bring him backups for duties another role holds.
  A worker's widening can open a miss (the callback confirmation): check each against `misses.md` before joining.

- The owner wants load-bearing designs: "every reference means every reference". Never claim certainty with exceptions;
  separate a hidden reference from a bug; settle by study of the language, not sampling.
- Record his conversation words exactly in the research (`design.md` §6); ask once before recording anything as his
  decision.
- Workers survive a session restart; list `subagents/` in full (a `tail` hid them once, and duplicates were launched).
- Docs: one section per call; read with `sinceRev` before editing; never retype his edits.
- Workers: run the tool's tests only as `cd tool && npm test` or by file.
- Two workers building halves of the tool need named ownership of files, one shared data form (build text 2c), and one
  of them to join both; a study worker with fresh eyes found 25 contradictions the builders missed. Check a worker's
  defaults for silent misses (the facility classification first defaulted to "in").
- The design document states only the design: no options, no history, no "as today" (his words, 25 Nov).

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
