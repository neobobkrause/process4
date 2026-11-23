# A run that saw a draft passes a ready pull request with no tests run

Written by PROCESS #9, 23 Nov 2026, past its refresh point; left for PROCESS #10. A process fault written by civicsmith
screens-people #1, via ARCH #9 and coordinator #4, 08:50Z:

> "on PR 1228 the job pushed 7e7365bd and ran `p4 ready` at once (ready-mark 08:44:36). Two module-tests runs started a
> second apart (08:44:38, 08:44:39). The workflow's concurrency cancelled the ready_for_review run (45141084502) and kept
> the other (45141085294), which read the PR as still a draft and passed with SCOPE {"scope":"nothing","why":"the pull
> request is a draft"}, so no test ran. `p4 results` reports that run as "passed: module-tests on 7e7365bde2" without its
> scope, so ARCH cannot tell from `results` that nothing ran, and GitHub's rule would let the merge through. ARCH has not
> merged 1228 and has told the job to run `p4 ready` again."

The same happened in this repository, unnoticed until now: PROCESS #9's PR 205 (a tool change) merged while its ready run
of `tool-tests` was still in progress (handover, "Observation"); the run passed afterwards. Both workflows take the draft
state from the event that started the run (`DRAFT: ${{ github.event.pull_request.draft }}`, `shims/module-tests.yml` line
78; `.github/workflows/tool-tests.yml` line 25) and pass at once on a draft; and a push followed at once by `ready` starts
two runs in one concurrency group, where the later-started one may be the push's, which saw a draft.

So the required check can pass with no test run on a ready pull request, and a merge can follow. This breaks the rule the
required run exists for (design part 2, sections 3 and 6: a job's module tests run on GitHub when it is marked ready).

## Options

- **A. No change.** Merges can happen with no test run whenever a push and `ready` come close together.
- **B. The run reads the pull request's draft state when it runs, not from the event (recommended).** Part one already
  holds a read-only token and reads the job block through GitHub's REST interface; it reads `draft` the same way, so a run
  that starts after the ready-mark runs the tests whatever event started it. Same change in `tool-tests.yml` here. And
  `results` prints the run's scope line, so ARCH sees "nothing ran". A product receives the workflow change by a pull
  request into its tranche branch with its next version move (its committed copy of `shims/module-tests.yml`), so the
  move must carry the workflow copy too; PROCESS #10 to check how a version move updates the product's copy.
- **C. `p4 merge` will not merge on a passing run whose scope says the pull request was a draft,** and says to run
  `ready` again. Tool only, reaches a product by the move line; it guards the merge rather than curing the run.

## A second part, 08:53Z

From civicsmith screens-entry #1 and answer-envelope #1, via ARCH #9 and coordinator #4: "after the draft-seeing run,
`p4 ready` on a PR that is already ready starts no run at all, though it prints "the required run has been asked for".
ARCH's course: the job takes the moved tranche in, so a real push starts a run that reads the PR as ready." So once a
draft-seeing run has passed a ready pull request, `ready` cannot repair it (GitHub sends no ready_for_review event for a
pull request already ready), and `ready`'s message claims what did not happen. Option B (the run reads the live draft
state) removes the cause; a fix to `ready`'s message (say no run was started where the pull request was already ready)
belongs with whichever option is chosen.

## A third part, 13:51Z: long runs cancelled (cause corrected at 15:10Z: the job's 45-minute limit, `module-tests-timeout-23nov.md`, not edits)

From civicsmith plane #1 (PR 1259), via ARCH #11 and coordinator #4, unchanged in its substance: "Two of PR 1259's
whole-module runs were cancelled partway, about 30 to 40 minutes in: run 45172042267 on 8fb5e0ed and run 45179857787 on
3fb0b7d3. The second time neither my branch nor p4-tranche had moved, and I made no act on the pull request while it ran.
`.github/workflows/module-tests.yml` runs on `pull_request` types including `edited` and `converted_to_draft`, with
`concurrency: module-tests-<PR number>, cancel-in-progress: true`, so any edit to the pull request's title or body, or a
draft/ready toggle, by any session or the tool, starts a run that cancels the one in progress. `p4 results` then reported
"no run that was not cancelled yet", so the newer run, if there was one, ended cancelled too. ... A whole-module run of
plane takes about an hour." (Its blocked record by store-assembly: under the tool as built it ends when store-assembly
merged after it; civicsmith has not yet moved to the version with `push --unblocked`.)

The same workflow facts as above: the run is started by events that change nothing to test (`edited`, and draft toggles),
and each new run cancels the one in progress. Not known: which event fired (the job cannot see the pull request's
events). It bears on the owner's 23 Nov point that a test should run once: each cancelled hour-long run is paid for and
thrown away. A fix belongs with option B: the run starts only on events that change what is tested (a push, the ready
mark, a reopen), so an edit to a title or body starts nothing and cancels nothing.
