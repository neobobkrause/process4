# PROCESS handover

Written 25 Nov 2026 ~20:55Z by **PROCESS #16** (`session_018Bhcee8zHEFYs9oDczEFEK`) at its refresh point (past 50 percent),
at a natural pause: no worker running, everything pushed. Your successor is **PROCESS #17**: read the generation in
`handover-process` (16), name yourself `PROCESS #17` with set-session-title, record generation 17 and your session there
(keep the registry), and message each ROOT in the registry your address. Your fill (`get_session`, `context_usage`) reads
0 until your first turn ends, then is real; refresh at the first natural pause after 50 percent. Never `git add -A`; put
`.claude/worktrees/` in `.git/info/exclude`. The first `git fetch origin main` once returned a stale tip: fetch twice and
compare with `git ls-remote origin main`.

**Your reading** (the owner's decision (ii)): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, and this handover. On `work/decision-c` there is also
`build/README.md`, the index of the build texts' sections, which PROCESS reads in full once it reaches main.

## START HERE: decision C and the facility decision are built on `work/decision-c` (head 3338a4c); not yet on main

The owner's words, in PROCESS #16's session, 25 Nov: "Decision: C, the full standard, with the first pass of 8; build the
conversion job, the notification tool, and the tool that keeps each module's uses file current on every module job."
(18:51Z) and "Decision: use the simplification: the tool carries Node's and workerd's facility classification; ARCH names
the boundary modules and classifies the packages its product uses." (20:26Z). Both are recorded in `design-decisions-2.md`
("Who a change tells") on that branch. Also his standing instruction: "It's important that this process4 change be done
properly. This shouldn't result in any contradictions. All changes should try to properly evolve existing elements of the
process rather than piling more on top." And: "changes only happen based on my decisions, but the way in which those
decisions are implemented can result in duplication, contradictions, and ambiguity without my involvement" — correct
those yourself; bring him only what would change a rule.

**State of `work/decision-c`** (all one branch; main untouched so main never holds a design its tool contradicts):
- Record: six entries rewritten in place (Who a change tells; How `notify` reads the product; How a notice reaches a user;
  The round item 2; A job's tests item 3; What the check refuses item 3; A tranche ends item 3); 3B retired.
- Design parts 0, 2, 3, 4, 5, 6, 10 evolved; build texts 01, 01b, 02, 02b, new 02c (the coding standard and uses file),
  03, 04, 05, new `build/README.md`; job.md, arch.md, starting_texts/00-index.md. A tidy study (research
  `tidy-25nov.md`) fixed 25 contradictions and folded duplicates; reading sets now job 166,734 and ARCH 167,721 of 175,000.
- Tool: `cd tool && npm test` 224/224. Reference reader under the standard (`lib/notice/refs.mjs`), uses-file writer at
  every `push` and `test` (`lib/usesfile.mjs`, `lib/usescmd.mjs`), `p4 uses`, the means M1–M9 (`lib/notice/means.mjs`),
  `notify` as a lookup, merge wait and related tests from uses files, the conversion kind and its report at `ready`,
  `push --meaning`, the tool's own facility classification (`lib/notice/facilities.json`, nothing defaults to in),
  uses files rewritten on a module-list change, a facility-list change, or a version move. Research:
  `uses-metadata-25nov/conversion-sites.md` (every assignability site of TypeScript 5.6.3, all covered).
- Proof (150 changes + 13 found breaks; uses files by the real writer): 112 needed, 958 told, 846 told without need,
  0 missed. The over-telling is the proof product's code not keeping the standard (places told of every change).

**Next, in order:**
1. **The owner's open question on false positives** (asked ~20:50Z, unanswered): he requires no misses AND no false
   positives. PROCESS #16 told him (a) needless notices from unconverted places end with conversion (he agreed); (b) after
   conversion two kinds remain: A, a user of exactly the changed item whose use is unaffected — inherent (undecidable;
   his own rule "any change to either a provider's domain or range necessitates that its users be retested" calls for
   telling it), asked whether he accepts A; B1–B5, tool imprecision: member-level granularity (a type's or class's
   change matched to uses of its other members, `X.*`), equivalent type rewrites, over-approximated computed facts,
   ARCH-named meanings telling pass-through users, unconfirmed accepts-more. His later question (~20:58Z): "Why can't a
   job that adds a new field or parameter that doesn't break existing calls recognize that that kind of change doesn't
   require that any users be notified?" Answer given: a new optional parameter the checker confirms already tells no one
   (his rule); a new field handed back can break only users of the whole value (spread, keys, serialize, whole-value
   comparison), so the tool, not the job, tells only those — add this to B1. B1, B4 fully; B2 very likely (unverified);
   B5 mostly; B3 only partly. Then (~21:05Z): "Can the coding standard recognize the difference between using a record
   by fields (and be resilient when a field isn't found in a record), and identify when a user uses a record wholly so
   that the provider knows who to notify for that reason and who not to?" Answered yes: field reads (`Quote.total`,
   type read) vs whole-value uses (pass on, spread, keys/values, JSON, clone, whole comparison) are recorded per use
   and certain under R1 and R17; a field added tells only whole-value users; removed/changed/made-optional tells its
   readers and whole-value users. Today `notify` matches `X` to `X.*`: build the member-level match first. A further
   idea, NOT studied and to be put to him before building (it touches "no test of users before a provider's change
   merges", though it is a type check, not a test run): re-type-check each user's places against the provider's new
   declarations and tell only users whose uses fail — removes type-level case A, not meaning changes. He was told PROCESS would tighten B1–B5 now
   (changes no rule) and re-measure the proof on a CONVERTED copy of its modules to count A and B apart, unless he says
   otherwise. Do that (workers in worktrees from `work/decision-c`), and get his answer on A.
2. A fresh-eyes check that tool and texts agree (give a worker the code and texts, not conclusions), then ONE pull
   request `work/decision-c` → main, merged once `tool-tests` passes (his decisions are the approving words; quote them
   in the PR body).
3. Then design Part D: trial on process3-probes (needs a fresh ROOT from him: choice 5), civicsmith's move on his
   instruction at its coordinator, first pass (ARCH records a scope of the first 8 modules; ARCH writes the facility list
   of boundary modules and packages first), his review.

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
