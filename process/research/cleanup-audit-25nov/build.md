# Cleanup audit, 25 Nov 2026: the build texts

Read-only audit for PROCESS. Window: base `3b80c61` to HEAD (`b680b2b`), `git diff 3b80c61 HEAD -- build/`. Fifteen commits touched four build texts: `01-the-tool-and-the-required-run.md` (+44/-), `01b-the-commands.md` (+28/-), `02b-the-comment-and-the-listing.md` (+8/-), `05-the-records-and-following.md` (+33/-). Each was read in full at HEAD, with design part 2 in full and part 4 sections 4, 10 and 11. The other build texts (02, 03, 04, 06) were searched for wording the window made stale. Tool names were checked with `grep` in `tool/`, `shims/` and `.github/workflows/`.

The kinds used below: **appended** (added beside a statement instead of replacing it, or a parenthetical patch); **duplicate** (one rule stated twice); **contradiction** (two texts, or a text and the design, disagree); **stale** (true before the window, false now); **history-buildup** (dated decisions or measurement narrative that hides the rule); **mismatch-with-tool**; **new-gate** (a test, gate, review or stop that was added).

## Headers

Every "Length: N lines. Last section: ..." line is accurate at HEAD: 01 117 / "8. Not settled here"; 01b 44 / "4. The commands"; 02b 125 / "6. An interface listing"; 05 227 / "8. Unproven, and not settled here"; 02 179, 04 143 and 06 161 are also accurate. 03 has no such line (outside the window). Sizes: 01b grew from 14,620 to 22,151 bytes and 05 is 23,346 bytes, both close to the 24,000-byte limit their preambles cite. Command 11 of 01b is a single line of 4,463 characters (2,572 at the base).

## What was done well

- The design (parts 2 and 4) was rewritten in place with no dated clauses. The build texts were not.
- 02b §6 last bullet (02b:125) was rewritten in place to point at build text 5 §6, and the old "told on any change to the provider's listing" was removed there.
- 02b:95 (same name, two files) was rewritten in place.
- 05 §5's heading became "three comments", and its old "Costs: a notice ... waits in waiting work" was deleted, not contradicted.
- 05's waiting-work example was updated (the `uses` field was dropped).
- 01 §5 removed the two-part run and said what was removed.
- Every tool name checked exists and matches: `decideScope` (`tool/lib/scope.mjs`, `testrun.mjs`), `run verdict`/`run scope`/`run tests` (`tool/p4.mjs`), `tool/lib/testrecord.mjs`, `tool/lib/noticecomments.mjs` (`NOTICE_LIMIT = 60000`, parts `{from, merged, part, users}`), `tool/lib/notice/narrow.mjs`, `git merge-tree` and the plain merge in `testrun.mjs`, the messages `commit first`, `push first`, `no pass recorded for`, `a notice reached ... after its tests ran`, `waits for`, `not_this_tranche`, "first six, then `and N more`" (`notice/notice.mjs`), and `shims/module-tests.yml` with one job, `module-tests`, and `timeout-minutes: 10`.

## Findings

### Build text 1b (the commands)

1. **01b §4 command 11 `notify` (01b:23). Contradiction, duplicate, stale.** The same item still says "a user not followed fully is told on any change to the listing (build text 5, section 6)". Later it says "A user it cannot follow fully is told only of a change that tells any user (build text 5, section 6)". Neither statement is the rule now in force: under decision 3B (`b680b2b`), build text 5 §6 and design 2 §7 decision 2 tell such a user of a changed function or value only where it may use it. `b680b2b` updated 02b and 05 but not 01b. *Fix:* delete both sentences and leave one: "A user it cannot follow fully is told as build text 5, section 6 says."
2. **01b §4 command 11 (01b:23). Appended (garbled sentence).** "only the later modules that can reach it are read, several to a reading (the owner's decision B of 25 Nov 2026), on the before side, and on the after side only where ...; the kinds a file declares are worked out once ...: those whose imports, followed file to file, lead to it, ..." Clauses were spliced in before the colon, so the list "those whose imports ..." now hangs off "kept across those readings". *Fix:* rewrite as two sentences: which modules are read (the list), then how they are read (several to a reading, the after side only where ..., kinds worked out once).
3. **01b §4 command 11 (01b:23). History-buildup.** It holds five dated decisions (23 Nov twice, D of 23 Nov, 24 Nov, B of 25 Nov three times) in one 4,463-character line. It also mixes three things: the run, the open-job path and the waiting-work path. *Fix:* split it into short sub-points (what it reads; who is told; open job; no open job; limits) and keep one provenance line at the end.
4. **01b §4 preamble (01b:11). Contradiction / new-gate.** "No command refuses for size, and none adds a check, gate, review or stop." The window added `ready` refusing without a standing test record (exit 1); `merge` refusing where the notice count is above the record's; `merge` holding while a used module has an open job; and `test` refusing a dirty or unpushed checkout. Design 2 §3 step 7 and §6 approve all of these, but the preamble now reads as false. *Fix:* "none adds a check, gate, review or stop beyond those the design names (part 2, sections 3, 6 and 8)."
5. **01b §4 command 6 `merge` (01b:18). New-gate (design-approved), stale sentence.** It adds the notice-count refusal and the wait for used modules' open jobs, and then keeps the older "GitHub's rule decides whether the required run has passed; the tool repeats none of it." The tool now repeats part of the verdict's notice-count test. *Fix:* "Apart from the notice count, GitHub's rule decides ..." or drop the clause.
6. **01b §4 command 4 `ready` (01b:16). Appended, duplicate.** A 25 Nov patch was inserted at the front ("Where the pull request is ready already, merged or closed, says so ...; `--branch` finds the branch's newest pull request in any state where none is open"). The older sentence later in the same item, "The pull request is named by its number, by `--branch <b>`, or, with neither, the current branch's one open pull request", still stands, so two statements of how `--branch` resolves sit in one item. *Fix:* merge them into one "named by" sentence, with the any-state lookup in it.
7. **01b §4 command 27 `test` (01b:42). Appended (a rule hidden in provenance).** "(the owner's decision B of 25 Nov 2026; not for a pull request into main or a drop's)". An exception to the rule sits inside the provenance parenthesis. *Fix:* "Except for a pull request into main or a `drop/` branch, where the base holds commits ...".
8. **01b §4 "The run's entry" (01b:44). Stale / dead.** "`run scope` and `run tests` remain, unused by the workflow." Two commands are kept that nothing in the design calls. *Fix:* remove them from the tool and the text in a later change, or say what still uses them (the tool's own tests).
9. **01b §4 command 25 `latest-version` (01b:38). Appended (misplaced).** A rule about how ARCH carries out a version move (two pull requests when the shim changes; decision B of 24 Nov) is attached to a read-only command. *Fix:* move it to build text 2 §7 (the process config's `process` field) or to ARCH's text, and keep a pointer here.
10. **01b §4 command 9 `next-job` (01b:21) and 05 §2 "Slots in use" (05:103). Duplicate.** The above-the-slot-number rule is stated in full in 01b and again, appended, in 05 §2. *Fix:* keep it in 01b command 9 and leave a bare cross-reference in 05.
11. **01b, whole file. History-buildup.** "the owner's decision" appears 24 times, against 11 at the base. *Fix:* keep provenance only where it explains a non-obvious choice, and drop "(the owner's decision of <date>)" from plain statements of behaviour, which design rules anyway.

### Build text 1 (the tool and the required run)

12. **01 §5 "Where the tests run" (01:61–62). Contradiction (not updated).** "The session's checkout must be clean and at the pull request's head commit, so the tests run on what was pushed" and "A merge conflict fails plainly: the job merges the base in first." Commit `3f07a1b` (decision B, 25 Nov: `p4 test` merges the base's newest commit into the branch and pushes it) changed only 01b command 27. 01 §5, which "rules" for the run, omits the merge and push. Design 2 §3 states it. *Fix:* rewrite the bullet: "`p4 test` first brings the head up to the base's newest commit by a plain merge and pushes it (not into main or a drop); where that does not merge cleanly it runs nothing and says to merge the base in."
13. **01 §3 table, row `test` (01:48). Stale / mismatch-with-tool.** The judged act reads "Running ... tests ..., writing the test record ..., and asking GitHub to run the required run again". It omits that `test` now makes a merge commit and pushes to the branch (`testrun.mjs:96`), an act the permission checker must judge. *Fix:* add "and, where the base has moved, merging it in and pushing to the session's own branch".
14. **01 §5 scope steps "1a." and "2a." (01:75, 01:77). Appended.** Steps were inserted with letter suffixes instead of renumbering. "1a." also breaks the Markdown list. *Fix:* renumber 1–7 and update the cross-references (01b command 26 cites "step 2a"; 02:132 cites "step 5").
15. **01 §6 "What they cover" (01:90). Stale.** "the scope rule, one case for each of the five steps" now applies to seven steps. *Fix:* "one case for each step".
16. **01 §7 build order (01:100, 103, 105). Stale.** Stage 1 is "the workflow with scopes 1, 2 and 4", and stages 4 and 6 name "scope 3" and "Scope 5". `test`, `run verdict` and `drop` are placed in no stage. *Fix:* stage 1 gets `test`, `run verdict` and the scopes; place `drop`.
17. **01 §5 opening and "Removed by the update" (01:59, 01:70). History-buildup.** "Since the owner's decision of 24 Nov 2026 ("the update plan as laid out") ...", a "Removed by the update:" bullet, and "as before" (01:63) narrate the change instead of stating the rule. *Fix:* delete the "Removed" bullet and "as before", and keep one provenance line.
18. **01 §1 "Carries over" / "Dropped" (01:13–21). Stale / mismatch-with-tool.** "The earlier tool is the one in this repository at `tool/`" names `tool/p3.mjs`, `mergePR in tool/lib/merge.mjs`, `tool/lib/gate.mjs`, `tool/lib/suite.mjs` and `shims/process-gate.yml`. None of these exist now (`mergePR` is in `tool/lib/github.mjs`). "Dropped: ... merge bringing the branch up to date ... waiting for a second run; the run's comment on the pull request" is now half reversed: `test` brings the branch up to date and asks for a second run, and a test-record comment exists. *Fix:* say these paths are the earlier process's (process3), and note that the up-to-date merge and a record comment came back in another form.
19. **01 header (01:5). Stale.** "Nothing here is built and nothing here has run". 01b:5 says the tool is built and its tests pass, and design 4 §11 says "The tool is built." The design path `process4/definition/process4_definition_v7/` is also stale (it is now `design/`). *Fix:* use 01b's status sentence and point to `design/`.

### Build text 5 (the records and following)

20. **05 §7 (05:218). Contradiction.** "The run's summary gives, for each file run, which of these put it in the list ... An empty list passes at once and says so." The required run no longer makes the related list (01:69), and 01 step 3 now says "An empty list is a pass with no files". *Fix:* "`p4 test`'s output and the test record's `why` give ...; an empty list is a pass with no files."
21. **05 §2 "Waiting work" (05:82). History-buildup, appended.** It holds a rationale narrative ("decision B of 25 Nov 2026: one notice of an early provider told nearly every later module, and the record ... passed the size a comment holds") and a migration patch ("an older entry that still carries `uses` is used as it is"). It also introduces a new carrier, the `<!-- process4-notice -->` comments on the provider's merged pull request, which is listed neither among the records (§1–§2) nor among a job's comments (§5). *Fix:* give the notice comments a short paragraph of their own (in §5 or a new §5a, with their mark, form and writer) and drop the narrative.
22. **05 §5 `notice_seq` bullet (05:141). Appended / history-buildup.** "a block written before that names a notice in its `work` line, which also counts" is a migration rule for blocks written in the last day. The job-block example (05:133) shows no `notice_seq` or `notices`. *Fix:* add both fields to the example, and move the backward-compatibility rule to a note, or drop it once no such block remains.
23. **05 §2 "Round" (05:71). Appended.** The tranche `scope` paragraph was put in front of the existing `state` description, and the round example (05:74) has no `scope`. *Fix:* add `scope` to the example and put the paragraph after the field list.
24. **05 §6 "Costs" (05:199). History-buildup, stale.** "(17 of the 150 recorded answers lost such a notice with decision B of 25 Nov 2026, each written in the proof's expected answers)" is a measurement narrative. The "54 of 111 notices for nothing" cost predates 3B's narrowing, which cuts cause-2 notices further. *Fix:* state the cost under the current rule, or mark the figures as before 3B. Move the counts to research.
25. **05 §6 "Not followed fully" (05:192). History-buildup.** One paragraph holds three dated decisions (24 Nov, 3B of 25 Nov, B of 25 Nov) and a code path. The rule itself is right and matches design 2 §7 decision 2. *Fix:* keep the rule and give one provenance line after it.
26. **05 header and §8.1 (05:5, 05:224). Stale.** "Nothing here is built and nothing here has run", "no test, check, gate, review or stop", and "Every form in sections 1 to 5: nothing is built". `testrecord.mjs`, `noticecomments.mjs` and `state.mjs` exist, and the test record gates `ready` and `merge` (design-approved). §8.1 also says the comment size was "not verified" while 05:82 cites a notice that passed it. *Fix:* "built, not run in a process in force". Say the record's gating is the design's (part 2, section 6). Record what is known about comment size.
27. **05 §6 "Who is a user" (05:175) and 05:192. Minor contradiction.** "Uses are read ... as they stood before the change" against "U's files, before or after, name that entry". *Fix:* "Uses are read before the change; for the narrowing in this section, names are read on both sides."

### Build text 2b (the structured comment and the listing)

28. **02b §5 (02b:35, 02b:37). Appended.** Each paragraph ends with an added dated sentence (class members' `@bound`; the receiving side). Acceptable, but provenance is in the sentence. *Fix:* drop "(the owner's decision of 24 Nov 2026)".
29. **02b §6 "Comparing" table and "Accepts more" (02b:102–122). Stale / omission.** The design's new rule in part 2 §7 ("anything" before and a stated kind after tells no one), added in the window and cited by 01b command 11, is missing from the comparison it governs. 02b:122 still says the proven tool counted a new "anything" as accepting more, without saying the design now handles that case differently. *Fix:* add one bullet under the table that states the rule.

### Other build texts the window made stale (not changed in the window)

30. **02 §3 table and §8 (02:37, 02:171). Stale.** "Two comments on the job's own pull request": now three (the test record). *Fix:* "three comments ... the job block, the job's record and the test record".
31. **02 §7 `lock_files` (02:124). Stale / mismatch-with-tool.** "the lock files the required run installs the product's dependencies from". The required run installs nothing now, and the tool reads `lock_files` only as a default (`config.mjs:24`). *Fix:* remove the field or say what reads it.
32. **02 §7 trial line (02:132). Stale.** "asks the required run to run no test on a mechanical edit". The required run runs no tests; `scope.mjs:80` makes `p4 test` run none. *Fix:* "asks `p4 test` to run no test ...".
33. **04 §3 stage 1 and item list (04:50, 04:94, 04:96). Stale / contradiction with the design.** "the required run with three of its five scopes"; "the required run holds to the related tests"; and "A notice to a module whose job is open waits and becomes work for its next job". The last directly contradicts design 2 §7 and 01b command 11: the notice now reaches the open job at once. *Fix:* rewrite the three trial items for the in-session test and the notice that reaches an open job.
34. **06 (06:49). Stale.** It lists the job block and record but not the test record among what an account switch must keep. *Fix:* add the test record.

## Counts by kind

A finding with two kinds is counted under each.

| Kind | Count |
|---|---|
| appended | 10 (2, 6, 7, 9, 14, 21, 22, 23, 28, and 1's duplicate patch) |
| duplicate | 3 (1, 6, 10) |
| contradiction | 6 (1, 4, 12, 20, 27, 33) |
| stale | 15 (1, 5, 8, 13, 15, 16, 18, 19, 24, 26, 29, 30, 31, 32, 34) |
| history-buildup | 8 (3, 11, 17, 21, 22, 24, 25, 28) |
| mismatch-with-tool | 3 (13, 18, 31); every function and file the window named exists |
| new-gate | 2 (4, 5): the `ready` refusal, the `merge` notice-count refusal and the merge wait for used modules' open jobs. All are design-approved (part 2, sections 3, 6 and 8); none is a gate the design lacks |

## Verdict

The owner's worry is borne out for 01b and 05, and partly for 01:

- **01b and 05 add more than they replace.** Most edits in the window were made by inserting a clause, often with "(the owner's decision X of <date>)", into an existing long item instead of rewriting it. In 01b command 11 this left the old rule ("told on any change to the listing") beside the new one, and neither is current after 3B. It also garbled one sentence.
- **Updates reached 1b but not 1.** The tests-on-the-updated-branch decision (`3f07a1b`) changed 01b only. The text that rules for the run, 01 §5, still describes the older behaviour, and the permission table does not name the new push.
- **The ripple was not followed.** Old wording survives in 02, 04 and 05 §7: "the run's summary", "two comments", "lock files the required run installs", and "a notice to an open job waits", which contradicts the design.
- **Provenance has become running history.** 01b went from 11 to 24 dated decision clauses and 05 from 1 to 7, with measurement and migration narratives.

The tool matches the texts wherever they name it, and no gate was added that the design does not approve. A cleanup pass that rewrites 01b commands 4, 6 and 11, 01 §5 and 05 §§2, 5, 6 and 7 in place, and fixes the stale lines in 02, 04 and 06, would resolve all findings without changing behaviour. Files 01b and 05 should also be brought back from the 24,000-byte edge.
