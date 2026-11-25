# PROCESS handover

Written 25 Nov 2026 ~22:50Z by **PROCESS #17** (`session_018Bhcec7gbFKBzcgnG5iqoh`), a safety rewrite while running (not
yet at its refresh point; fill ~28 percent). If you are its successor, you are **PROCESS #18**: read the generation in
`handover-process` (17), name yourself `PROCESS #18` with set-session-title, record generation 18 and your session there
(keep the registry), and message each ROOT in the registry your address. Your fill (`get_session`, `context_usage`) reads
0 until your first turn ends, then is real. Never `git add -A`; put `.claude/worktrees/` in `.git/info/exclude`.

**Your reading** (the owner's decision (ii)): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, and this handover. On `work/decision-c` there is also
`build/README.md`, the index of the build texts' sections, which PROCESS reads in full once it reaches main.

## START HERE: `work/decision-c` (head 27b2be9) holds decision C, the facility decision, and the precision work

His decisions (in `design-decisions-2.md` "Who a change tells" on that branch): "Decision: C, the full standard, with the
first pass of 8; build the conversion job, the notification tool, and the tool that keeps each module's uses file current
on every module job." (25 Nov 18:51Z) and "Decision: use the simplification: the tool carries Node's and workerd's facility
classification; ARCH names the boundary modules and classifies the packages its product uses." (20:26Z). His standing
instruction: do it properly, no contradictions, evolve existing elements; correct implementation duplication/ambiguity
yourself, bring him only what changes a rule.

**Done by PROCESS #17 on `work/decision-c`** (all by workers; research `process/research/precision-26nov/`, on main):
- Member-by-member telling (uses file marks each use `member`/`whole`/`handed back`/`none`; a member added tells whole-value
  users only; a handle's changed method also tells whole-value holders, which closed X03); a named meaning not told to a
  pure hand-back user.
- What changed made exact where the language decides (equivalent rewrites by the checker; errors caught; channels);
  accepts-more confirmed more widely BUT never where a user's function may be handed more arguments (that confirmation
  was unsafe and is closed on every path).
- Tool faults: a program started by a literal path is in its starter's closure (channels only), `env`/`argv`/`stdin`
  read; a relabelled copy of another module's kind is an S4 place and its readers are told.
- 242/242 tests. Original proof 112/958/846/0. Converted proof (`measure.mjs`): 108 needed, 388 told, 288 without need, 8
  missed (5 meter framing, 2 same-kind swaps, X01).

**The owner's way of judging findings (his words, 25 Nov ~22:30Z, recorded in `precision-26nov/README.md`):** report a
false result only where "neither roles, jobs, nor tools can recognize the change"; every change has a cause (requirement,
walk flaw, notice, the job's own failed test), interface changes go through ARCH (design 2 §8), meanings are named by ARCH
and declared by the job. PROCESS asked once whether to record it as a decision: unanswered. Under it PROCESS told him: no
unrecognizable miss once correction 2 is made (X01 is recognized but rule 7 discards what the tool sees); the 5 meter and 2
swap misses are covered by the meter's interface tests and ARCH/the job's declaration.

**Next, in order:**
1. His answer on **correction 2** (on his page): a confirmed "accepts more" still tells users whose uses file records
   handing the function on, or that build their own value of the accepted kind (`misses.md` P3). Corrections 1 (P1B) and
   3 (P4) were withdrawn under his way of judging. If he decides, record his words, build P3, re-measure.
2. A worker (`work/decision-c-needless`) classifies the ~100 non-A needless notices by his test into: tool imprecision
   (narrow it), the job knows but cannot inform (declarations only add — a design question for him), no element can know.
   Bring him only what his test leaves.
3. Then a fresh-eyes check that tool and texts agree (give a worker the code and texts, not conclusions), and ONE pull
   request `work/decision-c` → main, merged once `tool-tests` passes (quote his decisions in the PR body).
4. Then Part D: trial on process3-probes (needs a fresh ROOT from him: choice 5), civicsmith's move on his instruction at
   its coordinator, the first pass of 8, his review.

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
