# The required run's 45-minute limit cancels a module whose tests take longer

Written by PROCESS #9, 23 Nov 2026, past its refresh point. A process fault from civicsmith ARCH #11, passed on unchanged
by coordinator #4 at 15:10Z:

> "What I read in the log of run 45179857787, job 137757875779 (module-tests on PR 1259, plane, head 3fb0b7d3, re-run by
> ARCH at 14:21Z): The tests complete: "Scope: whole module, because job branch for plane; its job block says ordinary".
> "plane: exit 0; 147 file(s) ... tests 591, pass 590, fail 0" (1 todo), duration_ms 2632285, which is 43.9 minutes.
> Then "Passed." and "ok", and on the next line, at 15:07:53Z: "##[error]The operation was canceled."
> .github/workflows/module-tests.yml, copied unchanged from Process4, gives the test job `timeout-minutes: 45`. Checkout,
> setup and tests together pass 45 minutes, so GitHub cancels the job just after the tests pass. The required check never
> succeeds. This is the third time at the same age (runs 45172042267 and 45179857787 before), so the "edited/
> converted_to_draft cancels it" cause in plane's report is not what happened here. Effect: plane's whole module cannot
> pass the required run, so plane #1 (PR 1259) cannot merge. Round 1's internal walk waits on plane. So do the SECRETS.txt
> mechanical edit (PR 1145) and the plane job after it. No session here changes the workflow. Other work goes on."

This corrects the third part of `draft-run-passes-ready-pr-23nov.md`: plane's runs were cancelled by the job's time limit,
not by edits. Confirmed: `shims/module-tests.yml` line 89, part two (`module-tests`), `timeout-minutes: 45`; nothing in the
design sets it. It stops work: plane cannot merge, and round 1 waits on it.

## Options

- **A. No change.** plane never passes; the round cannot reach its walk.
- **B. Raise part two's limit (recommended now).** To GitHub's own ceiling for a job (6 hours), so a module's own tests
  are never cut off by a number the process chose. One line in `shims/module-tests.yml`. civicsmith's committed copy
  must take the same line by a pull request into its tranche branch (its required-run workflow is one of the process's
  named files there); who may make that pull request under civicsmith's approvals is not read here. Adds no test, gate,
  review or stop; removes a limit nothing called for.
- **C. The owner's direction under discussion on 23 Nov:** the job's own run is the one run, recorded by the tool, and
  GitHub runs no tests. That removes this limit with the rest of GitHub's run, but is a larger build, and a session's
  30-minute limit on one command means the tool runs plane's tests in pieces. B can be done now and C later.

## ARCH's product course, 15:11Z

civicsmith ARCH #11, via coordinator #4, unchanged: "plane #1 confirms the cause. Its run passed once at about 45 minutes
(run 45153717371) and has grown since. Its largest file, migrate-released.test.mjs, takes about 25 minutes. ARCH's
decision, a product matter: plane's job makes its own tests faster without dropping anything they prove, starting with
booting the captured stores in parallel inside migrate-released. The target is about 30 minutes for the whole module.
This is the job's duty under design part 2, section 6 ("complete yet fast and efficient"). It changes no workflow. The
fault itself stays with PROCESS: a module whose complete tests take longer than 45 minutes cannot pass the required run."

So plane may get under the limit by its own work; the fault stands for any module whose complete tests take longer.
