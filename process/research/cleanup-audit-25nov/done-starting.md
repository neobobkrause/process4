# Starting-texts cleanup: what was done for each finding of `starting-texts.md`

Branch `work/cleanup-starting`, from main at 580a7e8 (after the design cleanup). Changed: the eight role texts and
`starting_texts/00-index.md`. `shims/module-tests.yml` is unchanged (below). No rule's substance changed beyond what the
design states. The tool's tests were run on the branch (`npm test` in `tool/`): 164 pass, 0 fail.

## Sizes and rule counts, before -> after

"As filled": a 40-character product name and commit id, a module, branch and pull-request address, a lane's folder and
page, an external walking session's names; the fetch line left out. PROCESS has no blank, so its count is its file size.

| Text | Bytes | As filled | Numbered rules | Lines |
|---|---|---|---|---|
| `root.md` | 4,296 -> 4,292 | 4,469 -> 4,465 | 9 -> 9 | 36 -> 36 |
| `watcher.md` | 3,115 -> 3,167 | 3,196 -> 3,248 | 9 -> 9 | 28 -> 28 |
| `coordinator.md` | 4,636 -> 4,548 | 4,686 -> 4,598 | 10 -> 10 | 31 -> 31 |
| `arch.md` | 5,197 -> 4,809 | 5,307 -> 4,919 | 10 -> 10 | 27 -> 27 |
| `process.md` | 6,186 -> 6,014 | 6,186 -> 6,014 | 10 -> 10 | 32 -> 34 |
| `lane.md` | 3,722 -> 4,104 | 3,792 -> 4,205 | 8 -> 8 | 27 -> 28 |
| `job.md` | 4,366 -> 4,264 | 4,529 -> 4,427 | 10 -> 10 | 26 -> 26 |
| `walking-session.md` | 3,622 -> 3,674 | 3,542 -> 3,594 | 10 -> 10 | 28 -> 28 |
| `00-index.md` | 10,881 -> 9,275 | | | 74 -> 68 |

Every text's top "Length: N lines" matches `wc -l`. Watcher, walking session and lane grew only by the shared refusal
clause (+52 each); lane also by "your starter" and the onboarding act.

## Each finding

**root.md**
- :28 restart archives PROCESS -> **Done.** "every session named in the roles and lanes records but PROCESS, and every
  open job's session" (part 4, section 5; part 7, section 3).
- :23 reason in an act -> **Done.** Parenthesis dropped.

**coordinator.md**
- :28 account list differs from part 3, section 4 -> **Done.** "the short account design part 3, section 4 names, and
  the modules blocked (part 2, section 4), from what ARCH tells you." The restated list is gone; "areas not walked" (in
  no design section) went with it; "modules blocked" is kept because part 2, section 4 names it in the account.
- :27 rule 6 -> left (the audit found it acceptable).

**arch.md**
- :23 rule 6, five subjects -> **Done.** Split into rule 5 (tranche: open, scope, end and report, a drop "as part 3,
  section 5 says") and rule 6 (on his word: a stop, a release, a version move "as part 6, section 7 says"). The line
  freed by joining the stop (from old rule 5) to the release and version move, all three "on his word"; old rule 5's
  placing of notices and flaws joined the round rule (4). Rule 3 (interfaces) kept on its own.
- :23 restates the design (drop, version-move copy, scope record form) -> **Done.** Pointers to part 3 §5, part 6 §7 and
  part 2 §3 instead.
- :13 missing write act -> **Done.** The write list adds "at a move to a new version, the product's copy of the
  required-run workflow from your copy's `shims/`".
- :19 merge wait ambiguous and narrower than the design -> **Done.** "where `merge` says it waits, merge again once it
  no longer waits" (part 2, section 8).
- :19 `notify` described -> **Done.** "Run `notify` for each merge as its own background command, keep merging
  meanwhile, and act on what it prints."
- :18 rule 1 scope and two hours -> **Done.** "which you test with `p4 test`, as one background command of your own,
  before `ready`" (no harness figure).
- `` `<copy>` `` style -> **Done**, bare `<copy>` as in the other texts.

**process.md**
- :12-20 missing acts -> **Done.** New act line: "Keep pages and documents of Process4 on claude.ai, the owner's page of
  what you put to him among them, and notify his phone. Subscribe to, and unsubscribe from, activity on this repository's
  pull requests." (the owner's approvals in CLAUDE.md name all three).
- :30 "what waits for the owner you pass to the coordinator" -> moved, unchanged in substance, to the act line that
  messages a product's coordinator ("and pass the coordinator what waits for the owner, for his standing page").
- :29 rule 7 jammed -> **Done.** The tool-tests sentences dropped (the act at line 17 keeps PROCESS's own instruction;
  part 6 §5 and the workflow hold the rest). Rule 7 now holds only how PROCESS changes the tool and texts: its own
  process change, harness separation, the size limit.
- :26 rule 4 repeats part 5 §5 -> **Done.** "Keep the design document and the record of his design decisions as part 5,
  sections 4 and 5 say", with the two points in a few words; "his exact dated words are never edited" kept.
- :20 reason -> **Done.** Parenthesis dropped.

**lane.md (and process.md:18-19)**
- :6 a PROCESS lane told ARCH directs it -> **Done** without a new blank: "Your starter, which started you and replaces
  you: ARCH for a product's lane, PROCESS where <product> is PROCESS" (PROCESS already fills `<product>` as PROCESS).
  The starter now replaces ARCH where the directing session is meant: answer and message, a process fault, the refresh
  ask, and where a marked message of the owner is passed ("in a product, ARCH relays it to the coordinator").
  Rules 1, 3 and 5 still name ARCH: they are about a product's work.
- Onboarding lane's acts unnamed -> **Done**: "An onboarding lane of PROCESS: keep the product's page of what waits for
  the owner, and write in your folder the product's conversion plan and the brief for the session that sets it up
  (part 6, section 8)."

**job.md**
- :18 rule 2 (first comments) -> **not changed**, as instructed (choice 2 pending with the owner).
- :22 harness figure and tool description -> **Done.** "run `p4 test --branch <branch>` yourself as one background
  command, never in a worker, with the longest time your harness gives one command (your harness's part), and wait for
  it within your turn." The 7,200,000 ms figure is gone; part 7 §1 holds "two hours".
- :22-23 missing act -> **Done.** Acts: "Merge the tranche branch into your branch where `p4 test` says to merge it in
  first." (build text 1b, command 27; part 2, section 3).
- :23 rule 7 accretion -> **Done.** Tool descriptions dropped ("`p4 test` runs only those", "a pass recorded before it no
  longer counts", the detached-checkout parenthesis); `"<why>"` added to the close command; "which hands a flaw back to
  ARCH (part 2, section 4)" added; "whatever your kind, a walk flaw that needs no change here goes back to ARCH" kept.
- :17 rule 1 accretion -> **Done.** "Your work is what your job block names; leave the requirements it does not name."
- :25 rule 9 jammed -> **Done.** The fill level has its own line (9). The line was freed by joining old rules 3 and 4
  (both on writing tests and steps), not 4 and 5 as the audit suggested: declared uses (now 4) is a different subject.

**walking-session.md**
- :25 repeats part 5 §1 -> kept (low; the audit left it open).

**Shared refusal line, all eight texts** -> **Done.** "A refused act is never reworded or handed on, save the clean
re-attempt part 6, section 4 allows; three refusals in a row stop you." Every role reads part 6.

**00-index.md**
- :32 largest single text -> **Done**: build text 05 (23,346), then part 04 (22,943).
- :26-28 headroom arithmetic -> **Done.** Rewritten: the files hold only the 12-byte blank, filling adds bytes, the
  fetch line is about 170 bytes; a measured "As filled" column; binding text `process.md` 6,014, next `arch.md` ~4,919.
- :11 rule count "open with the owner" -> **Done.** Stated as part 4, section 11 settles it; the "Single rules" column
  dropped.
- :1, 5 "first draft", "Status: proposed", dates -> **Done.** Replaced by one line on what the texts are; the
  20 Nov dates and the 4,096 -> 8,192 history removed from section 1. Section 3 (the earlier process's evidence) kept,
  "drafts" read "texts".
- :69, 74 section 4 items 2 and 7 -> **Done**, removed (answered by part 2 §4 and part 4 §11); item 4 removed too (it
  only stated its own answer). New item 5: what an onboarding lane reads of its product.
- Figures: every byte figure, rule count, line count and set sum re-measured with `wc -c` at this branch. All set sums
  were exact; PROCESS's row is now the design plus its three indexes, 150,015 (README 1,943; decisions index 5,860;
  research index 14,917), its handover record unmeasured.

**shims/module-tests.yml** -> **left unchanged.**
- The job-level `permissions: contents: read` cannot be removed without changing the tool: `tool/test/related.test.mjs`
  line 224 asserts exactly two permissions blocks, so removing one fails the required run here. It changes nothing the
  workflow does, but removing it needs that test changed in the same pull request (outside this task).
- The `unset GH_TOKEN GITHUB_TOKEN ACTIONS_RUNTIME_TOKEN ACTIONS_ID_TOKEN_REQUEST_TOKEN` line is a no-op (the step is
  given no token; the runtime token is not exported to `run` steps; no id-token permission). Removing it alone was not
  done: any change to the shim makes every product's copy differ, costing each a second pull request at its next version
  move (part 6, section 7), for no change in behaviour. Better done together with the permissions block and the test.
- :59 comment "the first of each is taken" -> left: it describes the tool's parsing, which is what it says.

## Left for PROCESS

1. **Design part 4, sections 7 and 11 ("ROOT's start")** still say a restarted ROOT archives "every session still named
   in the roles and lanes records"; `root.md` now says "but PROCESS". The design's three words are owed (design is outside
   this task).
2. **The job's first comments (rule 2)**: unchanged; choice 2 with the owner.
3. **The job's set margin**: 170,164 bytes, about 4,800 under the 175,000 set maximum; grew 9,307 in a day. For the owner
   before the next design growth (part 5, section 3).
4. **PROCESS's own page vs. the coordinator's standing page.** Part 1, section 5 says the coordinator keeps the one
   standing page and PROCESS passes it what is its to show; PROCESS's text now also names its own claude.ai page and
   notifications (as the owner's approvals allow). The design names no such page for PROCESS; whether part 1 §5 or
   part 6 §7 should say so is for PROCESS. With two products, which coordinator is still open (index section 4, item 2).
5. **A PROCESS lane's rules 1, 3 and 4** speak of ARCH and a product's work; they are vacuous for a PROCESS lane, not
   wrong. A lane of PROCESS reading "the product's ranking page" is open (index section 4, item 5).
6. **Part 7, section 1** gives "two hours" for a background command; `job.md` now points there for the timeout instead
   of carrying "7,200,000 ms". If sessions miss setting the timeout, part 7 is where the parameter belongs.
7. **The shim's two leftovers** and the test that pins two permissions blocks (above): for the tool's cleanup.
8. **`run tests` and `run scope`** remain in `p4 --help` though no text names them (audit, tool side).
