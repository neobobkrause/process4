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

## Options to research and put (none chosen)

- A. No change: the job merges the tranche branch into its own before `p4 test` (as it may already do), said in its text.
- B. `p4 test` refuses to run, plainly, where the tranche branch has commits the head lacks ("merge <tranche> in first"),
  so the record is always made on what GitHub would merge. Text and a small tool change.
- C. `p4 test` runs the tests on the merged result itself (a temporary worktree of the merge, with the product's
  dependencies installed there or linked from the checkout). Faithful to the earlier behaviour; costlier, and the
  dependency step on civicsmith is unmeasured.
B may be read as a new stop; it only moves an existing step (bringing the tranche in) before the record. Weigh against rule 2.
