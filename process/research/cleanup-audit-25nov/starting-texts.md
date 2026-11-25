# Cleanup audit, 25 Nov 2026: the starting texts and the required-run shim

Read-only audit for PROCESS. Scope: `starting_texts/*.md` at HEAD (4437ecf), read in full, and
`git diff 3b80c61..HEAD -- starting_texts/ shims/` (11 commits, 24-25 Nov). Measured with `wc -c` / `wc -l`;
as-filled sizes computed by filling a 40-character product name, a 40-character commit id, a module, branch and
pull-request address, and dropping the fetch line. Design read: parts 02, 03, 04, 05 in full; 01 and 06 where cited.

Changed in the window: `arch.md` (4 commits), `job.md` (2), `00-index.md` (9), `shims/module-tests.yml` (1).
The other six texts did not change.

## Growth in the window

| Text | Bytes 23 Nov | Bytes now | Rule lines touched | How |
|---|---|---|---|---|
| `arch.md` | 4,268 | 5,197 (+929, +22%) | acts line; rules 1, 2, 6 | acts: two commands added in place. Rules 1, 2, 6: every change appended; nothing removed. Rule 6 went 400 -> 920 chars across three separate commits (scope clause, drop sentence, workflow-copy clause). Rule 2 went 276 -> 543. |
| `job.md` | 3,688 | 4,366 (+678, +18%) | acts lines; rules 1, 6, 7 | acts: rewritten in place (good). Rule 6: rewritten in place but 107 -> 388 chars, mostly describing what the tool does. Rule 1: two sentences prepended. Rule 7: one clause changed in place, one new sentence inserted (352 -> 567). |

Verdict on the owner's worry: confirmed for `arch.md` and `job.md`. Each of the window's five design decisions that
touched a session's behaviour was added as a new clause or sentence on an existing numbered line; no existing wording
was shortened, replaced by a pointer, or removed to make room. The numbered-line count stays at ten only because new
rules ride on old lines.

## Per text

### root.md: 4,296 bytes, 9 rule lines, about 4,470 as filled (unchanged in the window)
- root.md:28, ambiguity / design gap. "first archive every session named in the roles and lanes records". The roles record also holds PROCESS (design part 4, section 4 table; its `process` field), and ROOT must not touch PROCESS (rule 5). Design part 4, section 7 has the same wording. Fix: "...named in the roles and lanes records but PROCESS, ..." (and the same three words in part 4, section 7).
- root.md:23, conciseness. "(the coordinator reads `process` to find PROCESS; part 6, section 7)" is a reason, not an act. Fix: drop the parenthesis.
- Every command named exists in `p4 --help`. No history.

### watcher.md: 3,115 bytes, 9 rule lines, about 3,160 as filled (unchanged)
- No finding beyond the shared refusal line (below). Agrees with part 4, sections 5, 6.

### coordinator.md: 4,636 bytes, 10 rule lines, about 4,650 as filled (unchanged)
- coordinator.md:28, states the design differently, and stale. Rule 7 cites "the short account design part 3, section 4 names" and then restates it as a different list: it adds "areas not walked, modules blocked", omits "flaws carried over", and omits the scope, which part 3, section 1 (decision D, 24 Nov) now says the account names. Fix: cite only: "After each round give him the account part 3, sections 1 and 4 name, from what ARCH tells you. Nothing waits on it." (and, at design, gather the scope into section 4's list).
- coordinator.md:27, rule 6 joins holds, stop and version move under "only on his word": closely related, acceptable.

### arch.md: 5,197 bytes, 10 rule lines, about 5,290 as filled (the largest after PROCESS's)
- arch.md:23, jammed, accretion, over-long (920 chars, 4 single rules). Rule 6 now carries five subjects: tranche open/scope, tranche end and report, a dropped tranche, release publishing, a version move. Part 4, section 11 allows "closely related rules" on a line; these are not. Fix: split into "Tranche" (scope, end, drop) and "Release and version" and shorten each to a pointer (below), freeing a line by merging rules 3 and 5 (both "placing and ordering work").
- arch.md:23, repeats the design. The version-move clause ("where the new version's `shims/module-tests.yml` differs from the product's copy, replace the copy by a second pull request after that one merges") restates part 6, section 7 almost word for word; the drop clause ("`drop`, `ready`, `merge`; close its open jobs; clear the round and waiting work; mark 'not yet met'...") restates part 3, section 5; the scope clause carries a record-form detail ("(`scope`: the tranche and the requirements or whole modules it holds; build text 5, section 2)"). Fix: "Carry out a dropped tranche (part 3, section 5) and a move to a new version (part 6, section 7) as the design says."
- arch.md:13, missing act. A version move may require ARCH to "replace the copy" of the product's `.github/workflows/module-tests.yml` (rule 6; part 6, section 7), but the "Write ..." act list does not name that file, and a session declines an act its text does not name (part 4, section 11). Fix: add "the required-run workflow copied from your copy's `shims/`" to the write list. (Design part 2, section 1's list of the process's named files also lacks the workflow file.)
- arch.md:19, ambiguity and narrower than the design. "where it says it waits for a job of a module this one uses, merge it once that job has merged": "it" reads as the job, but it is `merge` that prints "waits for <module>"; and the design's condition is "once no job is open among the modules it uses" (part 2, section 8; a closed or blocked job also releases it). Fix: "where `merge` says it waits, merge again once it no longer waits."
- arch.md:19, accretion and tool description. "Start `notify` for each merge as its own background command (up to two hours) and go on merging meanwhile; when it ends, message each running job it names (the notice is in its block)." The tool already prints "message the job of ...". Fix: "Run `notify` for each merge in the background, keep merging, and act on what it prints."
- arch.md:18, rule 1 appended "(each touched module whole, as one background command of up to two hours)": the scope is the tool's, the two hours is harness (part 7). Fix: "...test it with `p4 test` before `ready`."
- arch.md:12, acts line: rewritten in place correctly (`test`, `drop` added). All commands exist.
- arch.md:6, 10: nothing in ARCH's text authorises deferring a job's first comments; see job.md rule 2 below.
- Style: `` `<copy>` `` in backticks here, bare `<copy>` in the other texts.

### process.md: 6,179 bytes, 10 rule lines, 6,179 counted (binding text; unchanged)
- process.md:12-20, missing acts. PROCESS takes acts its text does not name: it keeps the owner's page of choices on claude.ai, pushes notifications to his phone, and subscribes to pull-request activity (all three in CLAUDE.md's approvals and in `process/handover.md`, "on his page", "Pushed to his phone"). The text says only "What waits for the owner you pass to the coordinator" (line 30). Fix: either name them ("Keep a page of what waits for the owner and notify his phone; subscribe to this repository's pull requests' activity") or stop doing them; with two products "the coordinator" is undefined (index section 4, item 3).
- process.md:18-19 with lane.md, does not fit. PROCESS starts its lanes "with their text's `<product>` as PROCESS", but `lane.md` says "ARCH, which started you and replaces you" (lane.md:6), reads "the product's ranking page", and names none of the onboarding lane's acts (its page for the owner, the brief; part 6, section 8). In practice the onboarding lane ran on a hand-written prompt (handover, "the lane prompt PROCESS #6 used is the first message of lane #2's session"). Fix: give `lane.md` a `<starter>` blank (ARCH or PROCESS), or write a short PROCESS-lane text.
- process.md:29, jammed (5 single rules): who changes tool and texts; where tool tests run; harness separation; starting-text size. Fix: move the tool-test sentence to the act at line 17 (which already says it) and drop the duplicate; split the rest.
- process.md:30, jammed: refusals plus "What waits for the owner you pass to the coordinator", which belongs with rule 9 or the acts.
- process.md:26, repeats the design. "shown to him once, for transparency, not as an approval gate: merge the change on his marked decision once the required check passes, without waiting for a further approval; rewrite the entry if he later objects" is part 5, section 5 nearly verbatim. Fix: "Keep the design and the record as part 5, sections 4 and 5 say."
- process.md:20, conciseness: "(a product's state cannot be read across repositories, but a message is not refused; part 6, section 7)" is a reason. Drop.

### lane.md: 3,722 bytes, 8 rule lines, about 3,740 as filled (unchanged)
- lane.md:6, see process.md above (a PROCESS lane is told ARCH directs it).
- Otherwise agrees with part 4, section 3 and part 1, section 4.

### job.md: 4,366 bytes, 10 rule lines, about 4,580 as filled
- job.md:18, the reported conflict. Rule 2 ("If the module has no structured comments yet, add them first, as a step of their own") agrees with design part 2, section 7 ("The first thing its job does is add the structured comments, as a step of their own ... That step sends no notice"). `arch.md` has no rule to defer first comments: the deferral is civicsmith ARCH #24's own standing rule #24, which is a process change ARCH's rule 10 forbids. The cause is that "a step of their own" cannot be seen by the tool. `notify` compares the merge's first parent with the merge (build text 1b, command 11), so a first-comments step inside a mixed pull request is invisible, and the comments tell users. A comments-only change on jurisdictions told ~150 (research `notify-1356-still-197-25nov.md`). Fix: no text change on its own. Decide choice 2 (2C+) or say what "a step of their own" is (its own pull request?), then reword rule 2 and part 2, section 7 to match what the tool can honour. Until then the rule cannot be kept as written.
- job.md:22, rewritten in place but over-long; harness detail in a shared text. "with a timeout of 7,200,000 ms (two hours), never in a worker" is a Claude Code tool parameter (part 7's table); part 4, section 11 says "up to the time a session can run one thing". "It runs `check` and the tests in scope once and writes the test record on your pull request" describes the tool. Fix: "To complete: `push`; run `p4 test --branch <branch>` as one background command of your own session (not a worker), up to the time your harness gives one command, and wait for it in your turn. On a fail, fix, push and run it again; on a pass, `ready --branch <branch>` and send ARCH one message."
- job.md:22-23, missing act / stale against the tool. Decision B of 25 Nov (3f07a1b, "A job's tests run on its branch brought up to the tranche") changed only `00-index.md`. `p4 test` now merges the tranche into the branch and pushes it, and where the merge is not clean it "says to merge the base in first". The text names no act for merging the tranche branch into the job's branch. Fix: add to the acts: "merge the tranche branch into yours when `p4 test` says to".
- job.md:23, accretion (567 chars). It covers the told job's scope, a notice that arrives while the job is open, nothing-to-change, and the walk-flaw hand-back. "`related` lists the tests that relate, and `p4 test` runs only those" and "a pass recorded before it no longer counts" describe the tool, and `ready` enforces the second. Fix: "A told job checks only the changed parts. A notice ARCH sends while you are open is added to your block: deal with it and run `p4 test` again. Where nothing needs changing (a notice, or a walk flaw of any kind of job), run no test and `close --branch <branch> --nothing-to-change "<why>"`; that hands a flaw back to ARCH (part 2, section 4)." Also: line 23 omits `"<why>"`, which the acts line has.
- job.md:17, accretion. Two sentences prepended ("Your work is what your job block names. Requirements not yet met ... (`not_this_tranche`) wait for a later tranche: leave them.") onto a rule about file ownership. Fix: "Your work is what your job block names; leave the rest." `not_this_tranche` is a field name the block shows itself.
- job.md:25, jammed. Rule 9 joins refusals, process faults, the fill level and "do not end your turn". In every other text the fill level is its own rule. Fix: free a line by joining rules 4 and 5 (both "what a test or a use must match") and give the fill level its own line.
- job.md:13, acts: rewritten in place correctly (`test`, `ready --branch`). All commands exist.

### walking-session.md: 3,622 bytes, 10 rule lines, about 3,610 as filled (unchanged)
- walking-session.md:25, repeats design part 5, section 1 ("Act only on what you have read in full or measured"), which every role reads. Keep or drop; low.
- Agrees with part 3, sections 2-3 and part 4, section 11.

### Shared line in all eight texts
- e.g. job.md:25, states the design differently. "A refused act is never reworded or handed on; three refusals in a row stop you" omits design part 1, section 6 and part 6, section 4's clean re-attempt of a non-substantive refusal (a malformed command, or one the checker allowed before). Read literally, it forbids re-issuing a malformed command cleanly. Fix: "...never reworded or handed on, except the clean re-attempt part 6, section 4 allows; ..." (or rely on the design and accept the stricter text).

## 00-index.md: measured
- All eight byte figures, all "Length: N lines" headers, the eleven design-part sizes, the four build-text sizes, all eleven-part sum (126,890), the 07-08 difference (8,743), and all eight set sums are exact (my sums: 102,786; 102,786; 133,066; 156,616; 150,236; 113,819 / 134,741; 169,383; 82,639 / 85,267). All files ASCII.
- 00-index.md:32, wrong. "part 04 (23,036) and build text 03 (20,922) are the largest single texts": build text 05 is 23,346, the largest.
- 00-index.md:26-28, wrong arithmetic. "each has about 198 bytes more real headroom than its file size suggests" and "`root.md` and `coordinator.md`, the next tightest, count at roughly 4,296 and 4,438". The files hold the 12-byte blank `<fetch line>`, not the line, so leaving the line out gains nothing over file size; filling names adds bytes. As filled: ARCH about 5,290 (the next tightest, not root/coordinator), coordinator about 4,650, job about 4,580, root about 4,470. The fetch line `fetchLine()` makes is about 170-175 bytes, not 198. All still far under 8,192.
- 00-index.md:11, stale. "Whether the limit is on the numbered lines or on the single rules is open with the owner (design part 10, section 1, item 10)": part 10, section 1 has one item. Part 4, section 11 settles it (numbered lines; "a line may hold closely related rules"). The "Single rules" column is then history; drop it. (My recount: job 36, arch 29, coordinator 31; within the stated "few".)
- 00-index.md:47, margin. A job's set is 169,383, 5,617 under 175,000; it was 160,076 on 24 Nov (+9,307 in a day: part 02 +3,202, build 05 +4,100). At this rate the next few decisions breach the set maximum for jobs. Bring to the owner before the next design growth (part 5, section 3).
- 00-index.md:1, 5, stale history. "first draft", "Status: proposed. Nothing here is in force. No draft has been put before the permission checker": civicsmith runs on these texts. Section 3 (the earlier process) and the decision dates are history.
- 00-index.md:69, 74, stale. Section 4 item 2 is answered by part 2, section 4 (close with nothing-to-change hands the flaw back), and item 7 by part 4, section 11.

## shims/module-tests.yml
- Within part 2, section 6. The two-job shape (scope, then the product's tests with the product's dependencies) became one job that runs no test, no product code and no product install: it clones the pinned tool, `npm ci` in `tool/` only, reads the job block (job branches only) and the test record with the read-only token, and runs `p4 run verdict`, which works out the scope from the checked-out files and reads the record. The scope reading is what "passes at once when no module's code or tests changed" (part 2, section 9) needs. Nothing added beyond reading. Permissions not widened (`contents: read`), no `pull_request_target`, and the required check's name `module-tests` is kept (the removed job, `scope`, was not the required check).
- module-tests.yml:23-24, cruft: the job-level `permissions: contents: read` repeats the workflow-level one (lines 14-15).
- module-tests.yml:88, cruft: `unset GH_TOKEN GITHUB_TOKEN ACTIONS_RUNTIME_TOKEN ...` is left from part two's isolation; this step is given no token and runs no product code. Harmless.
- module-tests.yml:59, comment inexact: "the first of each is taken" describes the tool's parsing; the `jq` writes every matching comment.
- Tool, not shim: `run tests` ("the required run no longer uses it") and `run scope` remain in `p4 --help`. No text names them. A candidate for removal.

## Verdict

1. Accretion: yes, in both changed texts. ARCH rule 6 (920 chars, five subjects) and job rules 7 and 9 are the clearest; the window added about 1,600 bytes and removed none. Three rules now carry unrelated rules to stay at ten (arch 6, job 9, process 7), against part 4, section 11's "closely related".
2. Agreement: the texts agree with the design on the reported first-comments conflict. job.md rule 2 is the design's own rule, and ARCH's deferral is a product-side improvisation. The rule cannot be kept because the tool cannot see "a step of their own" inside one pull request. Real disagreements: coordinator rule 7's account list; ARCH's missing write act for the workflow copy; job.md missing the merge-the-tranche-in act after decision B (25 Nov); PROCESS's unnamed page, notification and subscription acts; lane.md unfit for PROCESS's lanes; ROOT's restart archiving PROCESS by the letter; the refusal line omitting the clean re-attempt.
3. Conciseness: the texts carry no history. Both texts repeat the design verbatim and describe the tool in several places (arch 6, process 4, job 6-7), and job.md carries a Claude Code parameter.
4. Stale commands: none. Every `p4` command named exists.
5. Index: every byte figure and set sum is exact. Its prose has five errors or stale claims: the largest text, the headroom and next-tightest arithmetic, the "open with the owner" count, "Status: proposed", and two section 4 items.
6. Shim: clean. It only reads, apart from two harmless leftovers.
