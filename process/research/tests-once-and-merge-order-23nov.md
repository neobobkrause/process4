# Tests run once in the job; notices to running jobs; merging in order; slots

Written by PROCESS #9, 23 Nov 2026, from its conversation with the owner that day (not yet a decision). The changes as
agreed in conversation, for his decision; grounds are the faults in `draft-run-passes-ready-pr-23nov.md` and
`module-tests-timeout-23nov.md`, and his words below.

His words (conversation, 23 Nov): "my interest is in running a test only as much as is minimally necessary to confirm
that the test passes"; "a test should not be running multiple times, that's just a waste"; "a job marks itself ready once
it's already passed its tests. So at that point there's no need to run the tests again"; "There's no reason for a job not
to get the [notice] immediately"; on merging in order: "the round would keep track of which of the running jobs was
earliest in the order, and wait until that job merged"; "Yes, earlier jobs might mean only a module's own providers"; on
slots: "if the number of currently running jobs is greater than or equal to the maximum slot count, then the current slot
count has to drop below the max in order for the round to open new jobs"; "if a provider's interface changes, the only
jobs that are started when the provider merges are those users who are earlier in the order than the latest in the order
job currently running."

## 1. A job's tests run once, in the job, by the tool; GitHub runs no tests

- The job runs its tests through a tool command; the tool picks what runs (whole module for an ordinary job; the related
  test files for a told job), runs the declared-uses check and the two approved refusals, and writes the result on the
  pull request against the exact commit. A failure is fixed in the job, which runs again.
- The tool runs a large module's tests in pieces (a file or a few at a time), each inside a session's 30-minute limit on
  one command (design part 7), and records the whole.
- `ready` runs nothing: it marks ready only where a recorded pass exists for the current commit.
- GitHub: (a) the required check becomes a seconds-long check that a recorded pass exists for the head commit, so the
  branch rule still refuses a merge with none; or (b) no workflow at all; the owner removes the required check from the
  branch rule by a click, and the tool's `merge` refuses a pull request with no recorded pass.
- Removes: the run that passed with no tests, `ready` starting no run, long runs cancelled, the 45-minute limit, the
  second run of every job's tests. The two-part run and its no-token rule (design part 2, section 6) go with GitHub's run.
- Changes: design part 2 sections 3, 6, 7 and 9; part 4 section 11; part 6 section 5; part 7; build texts 1, 1b, 5; the
  job's starting text; the tool; `shims/module-tests.yml` (a) or its removal (b); process4's own `tool-tests.yml` (the
  tool's tests run by PROCESS before pushing, already the rule).

## 2. A notice reaches a running job at once

- When a provider's merge changes its interface, a user module whose job is open gets the notice added to its job's work
  on the pull request (by the tool, in ARCH's session), and ARCH messages the job. The job deals with it before it is
  ready; a job that was ready and waiting goes back to work, runs the related tests, and is ready again.
- Changes: design part 2 section 7 ("nothing is passed to the open job" removed); build text 5 section 5 (the job block
  is no longer written only once); the tool (`notify`); ARCH's and the job's starting texts.

## 3. Jobs merge in order of their providers

- A ready job merges only when no job of a module it uses (one of its own providers) is still open. A blocked job does
  not hold others; if it later merges after some of its users, those users get told jobs.
- Rule 2 of PROCESS's starting text: this adds a wait before a merge, which only the owner's explicit approval allows.
- Changes: design part 2 section 3, part 4; the tool (`merge` or `next-job`); ARCH's starting text.

## 4. Slots

- Planned jobs start earliest in the order first while the running jobs are below the slot number.
- After a provider's interface change: users with an open job get the notice in it (2); users with no job that are earlier
  in the order than the latest running job get told jobs at once, even above the slot number; later users wait their turn.
- New planned jobs start only once the running jobs are below the slot number again.
- Changes: design part 2 section 5; build text 5; the tool (`next-job`, `notify`).

## Not known

How often a real job changes its provider's interface; how much waiting in order costs against the told jobs it saves;
how long plane's tests take in a session; whether civicsmith's approvals let a session change its workflow copy (1a).
