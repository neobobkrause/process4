# `p4 test` runs on the job's branch as pushed, not on its merge into the tranche (25 Nov 2026)

Recorded by PROCESS #11 at its refresh, for PROCESS #12 to research and put to the owner. A process fault from civicsmith,
met by provenance #1 (PR 1346), passed via ARCH #15 and coordinator #7 at 00:20Z, unchanged:

> "For you, about the tool: p4 test judged the job branch as it stood, without the tranche's newer commits. It did not
> judge the branch as GitHub would merge it into the tranche, as design part 2, section 6 says. That is what made the
> first run fail. This is written once; I am not working round it."

## What is known

- This is PROCESS #11's own technical choice in the update of 24 Nov (pull request 233; recorded in the research index
  line for `update-build-spec-24nov.md`): `p4 test` runs the tests in the session's own checkout at the pull request's
  head commit (where its installed dependencies are), while the SCOPE is decided on the merge of the head into the base's
  newest tip. Design part 2, section 3 now reads "A job's module tests run at its pull request's head, in scope as GitHub
  would merge it into the tranche branch at that moment"; before the update GitHub ran them on the merged result. The job
  reads that as section 6's requirement; the text is ambiguous, and the behaviour changed from before.
- Consequence: a job branched before newer tranche merges tests code that lacks them; a test can fail (as here) or pass
  where the merged result would not. Not yet known: what exactly failed on PR 1346, and whether a second run passed after
  the job brought the tranche in.

## First options, as PROCESS #11 left them (superseded by "Options" below)

- A. No change: the job merges the tranche branch into its own before `p4 test` (as it may already do), said in its text.
- B. `p4 test` refuses to run, plainly, where the tranche branch has commits the head lacks ("merge <tranche> in first"),
  so the record is always made on what GitHub would merge. Text and a small tool change.
- C. `p4 test` runs the tests on the merged result itself (a temporary worktree of the merge, with the product's
  dependencies installed there or linked from the checkout). Faithful to the earlier behaviour; costlier, and the
  dependency step on civicsmith is unmeasured.
B may be read as a new stop; it only moves an existing step (bringing the tranche in) before the record. Weigh against rule 2.

## What PROCESS #12 found (25 Nov ~01:20Z, from provenance #1's own session record)

- What failed: the first `p4 test` on PR 1346 (00:11Z) failed only in `check`: a test of provenance passed a field
  (`sha512`) that record-grammar's stated interface did not list. record-grammar's own job (PR 1339) had already stated
  it and merged into `p4-tranche`; the job branch lacked that merge. No test failed on its own merits.
- What the job did: it made a temporary merged worktree to confirm, then merged `p4-tranche` into its branch with a plain
  merge (no history rewritten), pushed, and ran `p4 test` again: 201 passed, 0 failed, about 30 seconds (00:12:25 to
  00:12:58). Ready at 96b7c4a251.
- Cost measured: one wasted run, and one failed run counted in the record's `fails_total`, which brings a fresh session at
  the third failed run and a block at the fifth (design part 4, section 10). On a module whose tests take most of two
  hours, the wasted run would take that long.
- Not seen, possible: the reverse, a pass on a stale head where the merged result would fail. A provider's interface
  change reaches an open job by the notice, and `merge` waits for jobs of modules a job uses, so what is left is a change
  that does not alter a listing; GitHub refuses a merge that does not apply cleanly.
- What the design says: part 2, section 3: "A job's module tests run at its pull request's head, in scope as GitHub would
  merge it into the tranche branch at that moment." So the tool does what the design says (head; scope on the merge). The
  job read "in scope" as the code. The fault is in the rule, not in the tool's following of it: the head can lack what
  the tranche already holds.
- The tool already makes the merged result for the scope (`scopeForPR` in `tool/lib/testrun.mjs`: `git merge-tree` into
  a temporary worktree) and throws it away.

## Options

- **A. No change.** A job that fails for want of the tranche's newer commits merges the tranche in and runs again, as
  provenance did. Costs a run, and a failed run counted toward replacement and blocking.
- **B. `p4 test` brings the tranche in first (recommended).** Where the tranche branch has commits the head lacks, `p4
  test` merges the tranche into the job's branch with a plain merge commit, pushes it, and runs the tests on that new
  head; the record then stands for code that holds the tranche as it is at that moment. Where the merge conflicts, it says
  so and runs nothing; such a branch could not merge into the tranche either, so this adds no stop. The design's
  sentence becomes "A job's module tests run at its pull request's head, which `p4 test` first brings up to the tranche
  branch's newest commit". A small tool change (`testCmd`), with a test; build text 1b command (test), build text 5 §5
  unchanged in form. It removes wasted and falsely counted runs; it adds no test, gate, review or stop.
- **C. `p4 test` runs the tests on the merged result** in its temporary worktree, leaving the branch as it is (as GitHub
  did before the update). Needs the product's installed packages in that worktree (provenance linked them by hand, which
  worked there); a failure there cannot be seen in the job's own checkout until the job merges the tranche in, so the job
  would usually end up doing B by hand.

Interaction with the other open matter (`notify` slow after an early provider's merge): none found. B moves a job's head
forward; `merge` reads uses at the tranche tip and the job's head, and `notify` reads before and after a merge by its
first parent, both unaffected.
