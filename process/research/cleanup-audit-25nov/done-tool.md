# Cleanup of the tool, done (25 Nov 2026)

The tool's part of the cleanup the owner chose on 25 Nov 2026 ("Decision: B, (ii)"), from the 9-item list in `tool.md` here, as PROCESS's brief named it (its items 1 to 5). Branch `work/cleanup-tool`. The tool's code (`tool/p4.mjs`, `tool/lib/**`): 170 lines added, 212 removed. Its tests: 76 added, 47 removed. One build text line changed.

## Item by item

1. **One reason-fitting function.** `fitReasons({ held, reasons, fits, whole })` in `tool/lib/noticecomments.mjs` is the one rule. It tries, in order: the reasons whole; the reasons without their before and after (`cutReason`); one "not followed" reason in their place, which runs the whole module's tests; and that one reason with the earlier reasons (`held`) cut too. Where none fits, it returns the one reason alone. It never fails. `noticeParts` (one reason at a time, as before) and `notify`'s `toOpenJobs` (the notice in a job block) both use it. Their old separate step lists, and `noticeParts`'s `fail(...)`, are gone. Lines are not shortened: a reason's `lines` choose the related tests, so a shortened list could miss one. The cut goes straight to the whole-module reason, as build text 1b, command 11 says. The two behaviour corrections, each with a test that fails on the old code and passes now:
   - (a) **Design part 6, section 5.** One user's reason too large for a notice comment, even without its before and after, used to make the whole `notify` fail. Now it becomes one "not followed" reason that runs that module's whole tests. Test: `one user's reason too large for a comment even without its words is cut to one reason that runs the whole module, not refused` (`tool/test/notify.test.mjs`).
   - (b) **Design part 2, section 7.** A job block too full to take even the one-reason form used to be left as it was, and the notice waited for the next job. Now the notice always goes in at once: its work line, `notice_seq` + 1, `notices`, and its reasons cut. Where the block is full, its earlier uses are first cut, then left out, and the one reason says so. The block stays under 60,000 characters. Test: `a job block too full even for one reason still takes the notice at once: its earlier uses give way` (same file).
   No other wording changed. The existing "too many for the job block" reason is word for word as before.
2. **One "needs no test record" rule, and one job-block reader.**
   - `recordNeed(scope, jobBlock)` in `tool/lib/testrecord.mjs`: no record is needed only where the scope is nothing and no notice reached the job. `ready`, `results` and `run verdict` all use it. `jobWaits` now uses `recordsOf` and the shared `noticeAfterTests`, which `recordStands` uses too.
   - The verdict is the one place whose behaviour follows from this. A job that a notice reached, with no module file changed, used to pass the required run at once while `ready` refused it. Now the verdict needs its record too, as `merge` already did (design part 2, section 6). A draft is still judged without its notices, so a draft passes at once as before (build text 1, section 5, step 2). Test: `the verdict needs a record where a notice reached the job, as ready does, even with no module file changed; a draft passes at once` (`tool/test/testrun.test.mjs`).
   - `jobBlockOf(comments)` in `tool/lib/round.mjs` replaces the six copies: `notify`'s `blockOf` and `relatedCmd`, `recordsOf`, `printJob`, `jobWaits`, and `readView`.
   - `decideScope`'s `related: false` is kept. Dropping it would change a told job with no module file changed.
3. **Dead code.**
   - Removed: `pickNext` (round.mjs); narrow.mjs's unused exports (`NARROWED`, `namesOf`, `kindOf` are now file-private, and `makeNarrow` returns `{ telling }`); relatedCmd's "the required run passes at once" line and its "step 3" wording; the two `/^drop\//` copies, which now use `DROP`; the stale `HELP.notify` line.
   - `run scope`, `run tests` and `runTests` are removed. `shims/module-tests.yml` calls only `run verdict`, and the shim's tests use neither. The `run scope` test is removed. The tests that used `runTests` only to run modules now call `runModules`, which `p4 test` uses (scope.test.mjs, related.test.mjs), and their summary-only assertions are dropped.
   - The line in `build/01b-the-commands.md` that named the two commands now names `run verdict` alone.
   - `lock_files` and the older data forms the tool still reads are left as they were.
4. **`declaredUses` (check.mjs).** The run of every test was traced. Only the plain "no import seen" note is ever reached. The carrier and unread branches, and the out-of-stack branch, are not reached by any test. So the expensive tail is cut: every declared use with no import seen now gets that one "cannot tell" note, in the same words. `check`'s output on every existing test is unchanged. On a product, a declared use made only by a call by name through a carrier now prints that "cannot tell" note where it printed none. It is never a refusal.
5. **Comments.** The decision-history comments in the tool are rewritten to say what the code does, with the design part and section or the build text command. Files: notify, noticecomments, testrun, testrecord, commands, round, uses, github, util, p4, and in notice/: check, notice, narrow, staged, listing.

## Tests

| | before | after |
|---|---|---|
| `npm test` (whole suite) | 164 tests, 164 pass | 166 tests, 166 pass |
| notice-proof.test.mjs (the 150 recorded answers) | 10 pass | 10 pass, answers unchanged |
| notify.test.mjs | 32 pass | 34 pass (+2 corrections) |
| testrun.test.mjs | 16 pass | 17 pass (+1 verdict rule) |
| related.test.mjs | 12 pass | 11 pass (`run scope` test removed) |
| scope.test.mjs | 10 pass | 10 pass |
| commands / round / p4 / drop | 25 / 12 / 8 / 6 pass | the same |

## Left

- `open` copies several notices' reasons into a new job block without `fitReasons`. A very large sum could still pass what GitHub takes for one comment. Applying the rule there would be a further behaviour change, which the brief did not include.
- Stale wording that the brief did not name, kept because tests match it:
  - `decideScope`'s "its related list is empty: it passes at once" (scope.mjs).
  - relatedCmd's "the required run runs its whole module" for an ordinary job.
- Build text 1, section 5 says the verdict "passes when the steps below give nothing". With the notice clause, that is now true only where no notice reached the job. That text is PROCESS's to align.
- Not done, as the brief said: one resolver for imports by the product's own name; one home for "read the code after the change"; the declaration backstop. Also not done: the old-form reads (audit item 9).
