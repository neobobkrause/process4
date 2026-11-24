# The update: what to build (for PROCESS #11)

Written by PROCESS #10, 24 Nov 2026, after the owner typed in PROCESS #10's session, 24 Nov 2026 ~19:30Z:
"Decision: the update plan as laid out". "As laid out" is PROCESS #10's last full statement of the plan in that session,
whose content is `update-plan-24nov.md` with change 6 moved to a later step (the owner's words just before: "Agreed, move
change 6 to the later step. With that, please lay out the process4 change plan for one final read through before approving
it."). It includes change 3's wait, which rule 2 of PROCESS's starting text needs his explicit word for; PROCESS #10 said
so to him before he typed the decision.

Not yet done: the record entry, the design changes, the build. Rule 4: the entry and the design go in the same pull request
as the build (one pull request for the decision). Merge on his decision once the required check passes.

## The decision, as laid out (what to build)

1. **Tests once, in the job.**
   - New command `p4 test [--branch <b>|<pr>]`, run by the job (and by ARCH's session for a non-job pull request that
     changes module code or tests: each touched module whole). It works out the scope exactly as `decideScope`
     (tool/lib/scope.mjs) does today for that pull request (whole module; related files for a told job; nothing where no
     module file changed), runs `check` and then the tests in scope in the session, and writes ONE record comment on the
     pull request, hidden mark `<!-- process4-test-record -->`, rewritten in place: `{ "commit": <head sha>, "notice_seq":
     <the job block's notice_seq at the time, 0 if none>, "scope": ..., "files": [...], "passed": n, "failed": n, "result":
     "pass"|"fail", "written": <UTC> }`. It keeps, in the record, a count of fail results across runs (`fails_total`), which
     replaces GitHub's failed-run count for `failed-runs` (third fail: ARCH replaces the session; fifth: blocked; design
     part 4, section 10).
   - The job's session starts `p4 test` as ONE background command with a timeout of up to 2 hours (Bash
     `run_in_background`, `timeout` 7,200,000), and waits for it within its turn (Monitor or short waits). A command a
     worker starts ends with the worker, so the job's own session starts it. (`long-modules-23nov.md`.)
   - `ready` runs nothing: it marks ready only where the record's `commit` is the head and `notice_seq` equals the job
     block's; otherwise it prints that the tests must be run with `p4 test`, and marks nothing.
   - `shims/module-tests.yml`: the required check `module-tests` keeps its name but only reads the record for the head
     commit (read-only token, no product code, seconds): passes when `result` is pass for that commit, or when the scope is
     'nothing' (into main, draft, no module file changed, a drop whose files are all main's); fails otherwise, saying "no
     pass recorded for <sha>; run p4 test". `p4 test`, after writing a pass, asks GitHub to re-run that head's latest
     `module-tests` run (REST `POST /repos/{o}/{r}/actions/runs/{id}/rerun`), so a run that started before the record
     passes. The process repository's own `tool-tests.yml` is unchanged.
   - A pull request that changes no module code or tests needs no record (scope 'nothing'), as today.
   - A test file the module list gives to another module, unchanged, is not run for the move (no module file changed);
     it runs at the new owner's next job.
   - Removes: part two of the workflow (installing and running tests on GitHub), the 45-minute limit, the second run.
     The design's "module tests run in two parts, so that product code under test holds no access token" (part 2, section
     6) goes; the owner's words 24 Nov: "Tests are code. They don't even reference the environment's secret values."
2. **Notices to running jobs.** `notify` (tool/lib/notify.mjs, notices.mjs), for a told user whose job pull request is
   open: adds the notice's work and `uses` to that job's block (ARCH's session is the block's one writer; the block is no
   longer written only once: build text 5, section 5), increments its `notice_seq`, and prints the job to message; ARCH
   messages it. A pass record with an older `notice_seq` no longer counts (`ready`, the workflow, `merge`). The job reads
   its block, deals with the change, runs `p4 test` (its scope widens to the related files of the new uses as well), and is
   ready again. A user with no open job: waiting work and a told job, as today.
3. **Merging after the modules a job uses.** `merge <pr>` for a job pull request: where a job pull request is open (not
   recorded blocked) for a module this module uses directly or through others, it prints `waits for <module> (pull request
   <n>)` and merges nothing, exit 0. "Uses" = the modules it imports, followed file to file as the staged scan reads them
   (tool/lib/notice/staged.mjs), plus its declared `uses`, closed transitively over earlier modules. `merge` also refuses a
   job pull request whose pass record is stale (`notice_seq` behind), saying to run `p4 test`. ARCH merges when the waited
   job has merged. Needs the owner's explicit word: given.
4. **Slots.** `next-job`: new jobs (requirements, flaws) start, earliest first, only while running jobs are below the slot
   number. After a provider's interface change, a told user with no open job whose module is earlier in the order than
   the latest running job's starts at once, above the slot number; a later one waits its turn (round.mjs; build text 5,
   "Slots in use").
5. **The check mended.** `check` (tool/lib/notice/check.mjs, `importsOf` ~515-528, ~546): reads `require('<path>')` and
   imports by the product's own package name (as staged.mjs does); a declared use with no import it can see is "cannot
   tell", no longer refused (~569-591). Measure on civicsmith before it moves (a read-only run there; how many refusals
   this adds is not known: `module-uses-23nov.md`).
- **Fold-ins** (each with its research file): a "not followed fully" reason keeps the first six places and "and N more"
  (`notice-reason-size-23nov.md`); a class member's own `@bound` goes into its listing (`class-member-bound-23nov.md`,
  `tool/lib/notice/listing.mjs` ~172-173); refusal (b) counts only the comment on the receiving side of a "cannot be
  assigned" complaint (`check-names-wrong-provider-23nov.md`). The notice changes must give the same whole reports on the
  proof's 150 recorded changes (as PR 205's replay did); any changed answer written down with its reason.

Not built: change 6 (later step: declared uses in line with real uses); held requirements (still on his page).

## Texts to change in the same pull request

Design part 2 (sections 3, 4, 6, 7, 9), part 4 (sections 10, 11), part 6 (section 5), part 7 (section 1: "the time a
session can run one thing" is 2 hours for a background command, not about thirty minutes; foreground 10 minutes), part 10
(section 3 and the trial list); build texts 1 (sections 5, 6), 1b (commands 2, 4, 6, 9, 11, 14, 15, 18 and a new `test`),
5 (section 5: the job block's `notice_seq`, written more than once; the new record); starting texts `job.md` (run `p4
test` in the background, wait, `ready`; deal with a notice that arrives), `arch.md` (merge waits; message a told running
job; test a non-job pull request); `starting_texts/00-index.md` sizes; each text's Length line.

## Then

1. Trial on process3-probes (the owner said yes): one ordinary job, one job told while its job is open, one merge that
   waits. Through its coordinator (move line typed by the owner in its session, as for civicsmith).
2. A read-only run on civicsmith counting the check's new refusals.
3. civicsmith moves on the owner's line; its `.github/workflows/module-tests.yml` replaced from `shims/` by one pull
   request (ARCH where civicsmith's approvals allow, else the owner's click).
4. Afterwards, the owner's page: the 45-minute and draft-run items are no longer needed (withdraw them); the refusal (b),
   class bound and notice-size items are built here.
