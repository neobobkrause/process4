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

## Later in the same conversation (23 Nov, before PROCESS #9's refresh)

The owner's comments on the summary, and where they leave each change (still not a decision):

- **The interface check** (`p4 check`) runs no tests and no product code: it reads the module's code and tests and finds a
  declared use that does not match the imports (and a declared later use), a structured comment that contradicts the
  code, and code that contradicts a provider's stated interface. Under change 1 it runs once with the job's tests.
- **Long modules: taken out of change 1 for now.** His words: "Let's not break long modules into pieces quite yet ...
  we'll refresh and dive into the long modules problem." Until solved, a module whose tests run past a session's 30
  minutes for one command cannot record a pass in the job; plane (about 44 minutes on GitHub; ARCH has its job aiming for
  about 30) may need the 45-minute stopgap (`module-tests-timeout-23nov.md`, option B).
- **"Marking ready runs nothing":** `ready` checks for the tool's recorded pass for the current commit; with one it marks
  ready, without one it marks nothing and says to run the tests. No test runs from `ready`.
- **Change 3 and what a job knows it uses.** The check is exact only for imports by path (the owner's decision of 22
  Nov records the limit). civicsmith's tests also reach other modules by starting the whole product (62 test files in
  21 modules), reading other modules' files, and running other modules' programs; none is an import. So "own providers"
  is not yet reliable: PROCESS #9's suggestion for now is change 3 as "wait for every earlier open job", narrowed to
  providers once uses are reliable. Not yet agreed by the owner.
- **The owner's questions to research after the refresh** (his words: "Isn't it the case that references to provider
  services has syntax like 'provider.function'? So can the tool just look for those references to identify all
  references? If a module reads another module's files directly, that the first module is a user of the second, right?
  So those are second level references that the module being read should already know about, right?"): PROCESS #9's
  short answer: calls are by imported name, already followed; started programs and file reads carry only path strings,
  which a cheap scan for paths into another module's folder might catch; a file read is a direct (first-level) use the
  reader must declare; starting the whole product is the true second-level case. To research: making module tests reach
  other modules only through imports (tests that start the whole product belong to the walks), or making the check see
  paths; and long modules.
