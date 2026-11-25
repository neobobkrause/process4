# PROCESS handover

Written 25 Nov 2026 ~23:40Z by **PROCESS #17** (`session_018Bhcec7gbFKBzcgnG5iqoh`), a safety rewrite while running (not
yet at its refresh point; fill ~28 percent). If you are its successor, you are **PROCESS #18**: read the generation in
`handover-process` (17), name yourself `PROCESS #18` with set-session-title, record generation 18 and your session there
(keep the registry), and message each ROOT in the registry your address. Your fill (`get_session`, `context_usage`) reads
0 until your first turn ends, then is real. Never `git add -A`; put `.claude/worktrees/` in `.git/info/exclude`.

**Your reading** (the owner's decision (ii)): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, and this handover. On `work/decision-c` there is also
`build/README.md`, the index of the build texts' sections, which PROCESS reads in full once it reaches main.

## START HERE: the design of who is told is written; the tool and texts are being built to it

Branch `work/decision-c-design` (from `work/decision-c` 27b2be9; head a17447b or later) holds the design part 2 §7–8
rewritten on the owner's request (his words, 25 Nov ~22:55Z, in `precision-26nov/README.md`): who knows that an interface
changes, by cause; what the tool compares (domain and range in his 14 Nov definitions, verified in process3 at 2a43eb5);
what is and is not a change; who uses what (uses file, with `takesIn`, `mock`, `packages`); exactly who is told; the
insides only; what a told module does. Checked by a fresh worker (`design-check.md` on `work/decision-c-design-check`,
28 findings, all answered). His page for reading it: https://claude.ai/artifact/42z6GsY6bEZQ6ZVuXFSioZ (source
`md2html.py` in PROCESS's scratchpad: regenerate from the design if it changes).

His decisions recorded on that branch ("Who a change tells", item 3 and words at its end): "Decision: remove the rule
that accepting more tells no one; any change to what a provider accepts tells its users." (25 Nov 23:07Z); his answers
on a job's record of same domain and range and a told job that changes nothing, recorded on his "yes" (~23:11Z). Two
lines are PROCESS's, shown to him: an open job whose notice needs nothing keeps its pass; the mechanical-edit exception.

He said "Go ahead and build it" (~23:35Z); PROCESS asked once whether to record it as his approval: unanswered.

**Building now** (two workers; names fixed between them: `push --same <item> "<why>"`, `push --notice-nothing "<why>"`,
`close --nothing-to-change` pushing a rewritten uses file; uses file `mock`, `packages`, `takesIn`):
- `work/decision-c-tool`: the tool (list in `precision-26nov/design-to-build.md`, F3 as a lookup through `takesIn`).
- `work/decision-c-texts`: build texts (5 §6–7 cut to the how) and starting texts; reading sets ≤ 175,000.

**Next:** join both onto `work/decision-c-design`; a fresh-eyes check that tool, texts and design agree (code and texts,
not conclusions); then ONE pull request to main from that branch, its body quoting his decisions and approving words;
merge once `tool-tests` passes. Do not re-run the proof's measurement (his words): reason from the texts.

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
