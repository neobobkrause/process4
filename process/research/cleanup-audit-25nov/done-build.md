# Build-text cleanup: what was done for each finding of `build.md`

Branch `work/cleanup-build`, from `origin/main` at `580a7e8`. Each build text was rewritten in place, with the design
(`design/`) as the reference and the owner's decisions (`process/decisions-index.md`) for the current rule. No rule's
substance and no tool behaviour was changed; `tool/`, `design/`, `starting_texts/` and the decision records were not
touched. Dated decision clauses were dropped where they only recorded history; a statement that the tool still reads an
older form was kept (an `uses` field in a waiting-work entry; a block naming a notice only in its `work` line; a job
branch `job/<module>/<n>`; a config that still holds `lock_files`).

Bytes before → after: 01 17,799 → 18,079; 01b 22,151 → 21,147; 02 15,266 → 15,556; 02b 11,162 → 11,575;
03 20,922 → 20,827; 04 14,857 → 15,028; 05 23,346 → 23,178; 06 10,388 → 10,348. Every one is under 24,000. Each
"Length: N lines" line was set to `wc -l`.

## The 34 findings

1. **Done.** 01b command 11 now says once: "A user it cannot follow fully is told as build text 5, section 6 says." Both
   older sentences are gone.
2. **Done.** The garbled sentence is rewritten as its own sub-point, "How it reads, in stages": which later modules are
   read (the list), then how (several to a reading, the after side only where ..., kinds worked out once).
3. **Done.** Command 11 is split into sub-points (what it reads; how it reads; who is told; a told user with an open job;
   with no open job; no repeats; limits) with no dated clause; it points to part 2, sections 3 and 7.
4. **Done.** The 01b preamble now says no command adds a check, gate, review or stop beyond those the design names:
   `test` on the head brought up to the base, `ready` and `merge` reading the test record (part 2, sections 3 and 6),
   and `merge` waiting for the used modules' open jobs (part 2, section 8).
5. **Done.** Command 6: the two refusals are sub-points citing part 2, sections 6 and 8, and "Apart from the notice
   count, whether the required run has passed is GitHub's rule, which the tool does not repeat."
6. **Done.** How a pull request is named (number; `--branch` or the current branch: its open pull request, or where none
   is open its newest in any state; a detached job names `--branch` or the number) is stated once in the 01b preamble
   for `ready`, `close`, `results` and `test`, as `prOf` in `tool/p4.mjs` does it for all four. Command 4 keeps only the
   ready-already/merged/closed case.
7. **Done.** Command 27: "Except on a pull request into main or from a `drop/` branch, where the base branch holds commits
   the head lacks it first merges ..."
8. **Done (text); tool left.** "The run's entry" now says what uses them: `run scope` and `run tests` print and run a
   scope by hand, the tool's own tests use them (`tool/test/scope.test.mjs`, `related.test.mjs`), the workflow neither.
   Removing them is a tool change, left for PROCESS.
9. **Done.** The version-move rule (two pull requests where `shims/module-tests.yml` differs) moved to build text 2,
   section 7, the `process` field; command 25 points there.
10. **Done.** The slot rule stays in 01b command 9; build text 5, section 2 "Slots in use" is a bare cross-reference.
11. **Done.** "the owner's decision" appears 0 times in 01b (24 before); provenance is now design-part pointers.
12. **Done.** 01 §5 "Where the tests run" states the base merge and push (not into main or from a `drop/` branch) and the
    no-clean-merge case, as 01b command 27 and design part 2 §3 say. The old "the job merges the base in first" under
    "The scope" is gone.
13. **Done.** The permission table's `test` row adds "where the base has moved, first merging it in and pushing to the
    session's own branch". A `drop` row was added too (it was in no row).
14. **Done.** The scope steps are renumbered 1–7; cross-references updated: 01b command 24 (step 5), command 26 (step 4),
    01 §7 and §8.2 (step 7).
15. **Done.** "one case for each step".
16. **Done.** Stage 1 gets `test`, `run verdict` and scope steps 1, 2, 3 and 6; stage 4 step 5 and `related`; stage 6
    step 7, `drop` and step 4.
17. **Done.** The dated opening, the "Removed by the update" bullet and "as before" are gone; one line points to design
    part 2, section 6.
18. **Done.** §1 says the paths are the earlier process's (process3's `tool/`), names this tool's home where a piece moved
    (`mergePR` in `tool/lib/github.mjs`, `runModules` and `decideScope` in `tool/lib/scope.mjs`,
    `shims/module-tests.yml`, `NO_TOKENS` in `tool/lib/util.mjs`), and says the up-to-date merge and a record comment
    came back in another form. Also corrected: the mark-ready route no longer tries `gh pr ready` (GraphQL), as
    `tool/lib/github.mjs` says.
19. **Done.** 01's status is 01b's ("built and its own tests pass, ... not run in a process in force"); the design is
    `design/`. The same stale path was fixed in the headers of 02, 03, 04 and 05.
20. **Done.** 05 §7: "`related <pr>` prints, for each file in the list, which of these put it there, and the files left
    out; the test record's `why` gives the counts. An empty list is a pass with no files." (`p4 test` itself prints only
    the scope's `why`; `related` prints the per-file reasons, `tool/p4.mjs`.)
21. **Done.** The notice comments have their own paragraph at the end of 05 §5 (mark, form, writer, where), whose heading
    is now "The comments on pull requests: a job's three, and the notice's". The narrative is gone; the older-entry
    `uses` rule is kept as one sentence in §2. 01b commands 3 and 11 point to §5.
22. **Done.** The job-block example shows `notice_seq` and `notices`; the older-block rule is kept as the bullet's last
    sentence (the tool still reads it: `tool/lib/notify.mjs`).
23. **Done.** The round example shows `scope`; its paragraph follows the field list.
24. **Done.** Costs is stated under the current rule, unmeasured on a real product, with a pointer to the owner's
    decision record for the measures; the pre-3B and decision-B counts were removed.
25. **Done.** The rule is three bullets (kinds; functions and members only where named or reached unreadably; nothing that
    tells no one) and one source line (design part 2, section 7, point 2; `tool/lib/notice/narrow.mjs`).
26. **Done.** 05 header: built, not run in a process in force; the test record's hold on `ready` and `merge` is the
    design's (part 2, section 6). §8.1 says the forms are built and records what is known of comment size: GitHub's own
    pages were not read; on a product GitHub refused a waiting-work record that repeated a notice's uses (its reason not
    kept); the tool keeps notice comments and a job block under 60,000 characters.
27. **Done.** "Uses are read ... before the change; for the narrowing of a user not followed fully, below, names are read
    on both sides."
28. **Done.** Both "(the owner's decision of 24 Nov 2026)" dropped from 02b §5; "decision 3" is now "point 3".
29. **Done.** 02b §6 has a bullet "Describing is not changing" stating the design's rule ("anything" before, stated after,
    tells no one), with `known` and `knownDecl` in `tool/lib/notice/notice.mjs`; "decision 7" is now "point 7".
30. **Done.** 02 §2 table and §8: three comments, the job block, the job's record and the test record.
31. **Done.** `lock_files` is out of the config example; the `node` bullet says a config that still holds `lock_files` is
    read without fault and nothing uses it (only `tool/lib/config.mjs` gives it a default). Removing the default is a
    tool change, left.
32. **Done by removal.** The trial-only line is gone from 02 §7 (item 5 of the brief, below).
33. **Done.** 04 stage 1 builds `test` and `run verdict` with the named scope steps; its item 3 runs `test` before marking
    ready; its "Breaks" names the in-session tests and a required run that only reads the record. Stage 4 item 2: `test`
    runs only the related tests and the required run passes on its record. Item 4: a notice to an open job reaches it at
    once, is added to the job block, ARCH tells the job, and the job runs its tests again before it can merge.
34. **Done.** 06 §2 lists the test record with the job block and record.

## The design cleanup's items left for the build texts

- **Trial item 9 ("none run").** Dropped, as a correction to agree with design part 2 §9 (ARCH's session tests the
  mechanical edit): 04 stage 6 item 1 now asks only the form with the touched modules' tests run; 02 §7's trial-only
  config line is removed; 01 §5 step 7 and §8.2 no longer mention it.
- **"decision 2" → "point 2"** in 05 §6: done (and 02b's "decision 3" and "decision 7").
- **01b command 18, "since a use by path is not read"**: now "since a use that no import shows cannot be seen".

## Also corrected (a text breaking a rule the design states)

- 01b command 16 said "the coordinator reads PROCESS's record so"; design part 6 §7 and part 7 §3 say a product's session
  cannot read it and the coordinator finds PROCESS in its own roles record. Rewritten to say so, pointing to 05 §4. 04
  stage 3 item 5 had the same claim; it now says the coordinator finds the live PROCESS in the product's own roles record.
- 05 §4 lost its dated decision clause and its "This supersedes ..." migration note; the rule is unchanged.
- Dated clauses dropped in 03 (two), 04 (one) and 06 (two), kept as "(the owner's decision)" where a choice needs a source.

## Left for PROCESS

- **The tool still reads the trial-only line.** `decideScope` in `tool/lib/scope.mjs` still honours
  `trial.mechanical_edit_tests: "none"`, and its comment cites "build text 1, section 5, step 5; build text 2, section 7".
  The texts no longer name it; removing it (and renumbering the comment to step 7) is for the tool cleanup.
- **`run scope`, `run tests`** and the `lock_files` default: tool code nothing in a product uses; for the tool cleanup.
- **The design disagrees with itself** on the cross-repository read: part 4 §11 ("Where the record is in another
  repository, it reads it with the tool's `state read --repository`") against part 6 §7 and part 7 §3 (refused; the
  coordinator never reads it there). Not touched here.
- **04's status line** still says "Nothing here has run" while stage 0 records a run on 19 Nov; left, since whether later
  stages ran is not known here.
- **Starting texts** were not read for wording that cites old build-text step numbers; a `grep` found none.
- `design/00-index.md` measures were not changed; PROCESS re-measures after.
