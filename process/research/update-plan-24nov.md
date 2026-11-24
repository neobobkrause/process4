# The plan for the Process4 update: tests once, notices that reach their users, and the rest

Written by PROCESS #10, 24 Nov 2026, at the owner's request ("present that plan for updating process4 so that tests are
run only once, providers properly notify users, and the other requirements we set for this update"). It builds on
`tests-once-and-merge-order-23nov.md` (the four changes agreed in conversation with PROCESS #9), `change-group-23nov.md`,
`long-modules-23nov.md`, `module-uses-23nov.md`, and the faults still open on his page. Not yet read: the civicsmith
refactoring plan another lane wrote; item 6 below assumes it keeps module tests to imports.

## The requirements this update serves (his words, 23 Nov)

- "running a test only as much as is minimally necessary to confirm that the test passes"; "a test should not be running
  multiple times"; "a job marks itself ready once it's already passed its tests".
- "There's no reason for a job not to get the [notice] immediately."
- Merging in order: "the round would keep track of which of the running jobs was earliest in the order, and wait until that
  job merged"; "earlier jobs might mean only a module's own providers".
- Slots: new jobs only below the slot number; told jobs earlier than the latest running job start at once.
- "Fixing this so that tests are more targeted users of earlier modules (and only earlier modules)".
- Never add tests, gates or reviews.

## The six changes

1. **A job's tests run once, in the job.** A new tool command, `p4 test`, run by the job: `check`, then the tests in scope
   (whole module for an ordinary job, the related files for a told job, as today's scope rules pick them), as one
   background command of the job's own session, up to 2 hours. It writes a record on the pull request: the commit, the
   scope, the files run, the counts, pass or fail. `ready` runs nothing: it marks ready only where a pass record exists for
   the head commit, otherwise it says to run `p4 test`. GitHub's required check `module-tests` stays by name but only reads
   that record for the head commit, in seconds; so the branch rule still refuses a merge with no pass, and the owner
   changes no setting. Removes: the 45-minute limit,
   the run that passed with no tests, every second run of a job's tests, the two-part run. Held by text: the job writes its
   own pass record, as it writes its own tests. A module whose tests take more than 2 hours is ARCH's to split.
   A pull request that is not a job's: one that changes module code or tests (a mechanical edit) is tested by ARCH's
   session with the same command, each touched module whole; one that changes no module code or tests (requirement text,
   the module list, process files) needs no pass, as today. A test file the module list gives to another module, unchanged,
   is not run again for the move; it runs at the new owner's next job.
2. **A notice reaches a running job at once.** When a provider merges with a changed interface, `notify` adds the notice to
   each user's open job (its work and uses on the pull request, written by ARCH's session) and ARCH messages the job. A pass
   record made before the notice no longer counts; the job deals with the notice, runs `p4 test` (its related tests), and is
   ready again. A user with no open job gets its told job as today.
3. **A ready job merges once no job is open among the modules it uses,** directly or through others: the modules it
   imports, as the notice reads them, and the modules it declares. `merge` says which job it waits for and merges nothing; ARCH merges it when that one has merged and the
   notice, if any, is dealt with. A blocked job holds no one. This adds a wait, so it needs his explicit word (rule 2). It
   is exactly as good as the notice's own reading of uses: a use made by a path and not declared is missed by both, as
   today, until item 6 holds. On civicsmith it is not exact while the refactoring runs (the refactoring plan counts 1,279
   pairs of modules using each other undeclared, none by import).
4. **Slots.** New jobs start, earliest in the order first, only while running jobs are below the slot number. After a
   provider's interface change, users with no open job that are earlier in the order than the latest running job start
   their told jobs at once, above the slot number; later ones wait their turn.
5. **The check mended in two places.** It also reads `require(...)` and the product's own package name, as the notice
   already does; and a declared use the check cannot see (made by a file path) is "cannot tell", no longer refused.
6. **A module's code and tests reach only earlier modules, and every reach is seen or declared.** A module reaches another
   by importing it; where it must read another module's file or run its program by path, it declares that module. A test
   that starts the whole product belongs to the latest module it reaches, or to the walks. Held by the job's and ARCH's
   texts (the check sees imports only; a declared use made by path is "cannot tell" under item 5, and the notice tells such
   a user on any change of that provider, design part 2, section 7, decision 2). With it, a module's imports and
   declarations cover its real uses, so 3 holds and no user is missed. The civicsmith refactoring carries it out there;
   ARCH can measure it with the lane's dependency script, as a measurement, not a check.

**Folded in, because they touch the same parts of the tool** (each was already put to him, recommended):
- the notice's "not followed fully" reason kept to six places and a count, so a notice is never lost for size;
- a class method's own written limit counted in its listing, so a changed limit tells its users;
- refusal (b) counts only the comment on the side that receives a value.

**Not part of this update:** ARCH holding requirements out of a tranche (option C on his page) stands on its own.

## What the refactoring plan check changed (`refactor-plan-check-24nov.md`)

- Item 1 now says what is tested for a pull request that is not a job's, and that a test moved to another owner is not run
  again for the move.
- Item 3 reads uses as the notice does (imports) plus declarations, not declarations alone, and says it is not exact on
  civicsmith while the refactoring runs.
- Item 6 is stated as the refactoring plan states it (only earlier modules), with a path reach declared.
- For civicsmith, not Process4 (passed to its coordinator as information): the plan's step 3 leaves a moved test in two
  places until the part's next job, so it would run twice; it keeps runs under 45 minutes, where the update allows 2 hours;
  some reaches to later parts remain (the launcher's build files, the word-table generator, the bundler's computed import).
- Not known: how many refusals item 5 adds on civicsmith; one read-only run there measures it before civicsmith moves.
  After the refactoring's step 7, one change to the door may tell its 19 screens parts at once (items 2 and 4).

## What goes away now

With t1 dropped, civicsmith runs no jobs until the refactoring starts. So the two stopgaps on his page (raising the
45-minute limit; the guard against the draft run) are not needed if this update lands first: item 1 removes both causes.

## Order of building, and how civicsmith gets it

1. The tool and texts in Process4, one pull request per recorded decision as usual, tool tests run where the tool changes;
   the notice changes replay the proof's 150 changes and must give the same answers, any changed one written down.
2. A trial on the trial product (process3-probes): one ordinary job, one told job reached while its job is open, one merge
   that waits, so the new path has run once before civicsmith uses it. The owner agreed to it, 24 Nov.
3. civicsmith moves by the owner's one line in its coordinator's session; its workflow copy is replaced from
   `shims/module-tests.yml` by one pull request (ARCH opens it where civicsmith's approvals allow; otherwise the owner lands
   it with a click).

## Not known

- Whether a background command goes on running while the job's session waits between turns; the job therefore waits for
  it inside its turn.
- Whether the refactoring plan keeps every module test to imports (item 6), and when it starts.
- How much item 3's waiting costs against the told jobs it saves.
- Whether civicsmith's approvals let a session change its workflow copy.

## The owner's comments, 24 Nov (conversation)

- On 1's line about secret values: "Tests are code. They don't even reference the environment's secret values. So your
  concerns about that are a non-issue." The line is removed; the job's tests run as the job's session runs them today.
- "Yes to a trial-product run before returning to civicsmith."
- The refactoring plan (https://claude.ai/artifact/HA4xENnaXEjX8cx4SQeAoL) is checked against this plan by a worker:
  `refactor-plan-check-24nov.md`.

## The owner's framing, 24 Nov (conversation, not a decision)

"The plan for updating process4 that we're considering here is an incremental step. So is the civicsmith refactoring plan.
Another big change that will be researched is whether it's possible (and how) to update module and test code so that all
references to other modules is done in a way that the provider's list of users is much more accurate than is currently
possible. The goal is to bring declared uses in line with real uses. But that will be a different step explored after
these changes to process4 and after the civicsmith refactoring."

PROCESS #10's reading, put to him: item 6 belongs to that later step. The order rule it restates is already in the design
(part 2, section 1), and its new part (every reach by path declared) is the later step's subject. So this step would be
items 1 to 5 with the three folded-in fixes; item 3 stays as good as the notice's own reading of uses until the later step.
