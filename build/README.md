# The build texts: the index

Length: 88 lines. Last section: "Build text 6".

PROCESS reads this index in full and reads a build text, or gives it to a worker, when a question touches it; it reads a
text in full before it changes it (design part 5, section 3). One line for each text and each section. Keep it current
with each change.

## Build text 1

`01-the-tool-and-the-required-run.md`: the tool and the required run (section 4 is in 1b).
- 1. What the tool is made of.
- 2. Where the tool lives (the repository's folders), its language and one dependency, how a product names its version, the fetch line, what the tool reads from the product.
- 3. Signing in on a session and on GitHub's machines, write limits, and the act the permission checker sees for each command.
- 5. A pull request's tests run once by `p4 test`, the test record, the required run `module-tests` and its verdict, the seven steps that decide the scope.
- 6. The tool's own tests: what they cover, when they run (`tool-tests`), never on a product's work.
- 7. Build order by trial stage, and who builds the tool.
- 8. Not settled: a private process repository, the mechanical edit's scope, the approvals' wording, Codex.

## Build text 1b

`01b-the-commands.md`: section 4 of build text 1.
- 4. Every command, numbered 1 to 28 (`branch` to `uses`), what each reads, writes and prints, and the required run's `run verdict`.

## Build text 2

`02-the-forms.md`: the forms of the files the design names (sections 5 and 6 in 2b, 10 in 2c).
- 1. The notice's proof the forms come from, and what it did not prove.
- 2. Where everything is: `process.json`, the process folder, each form's place and writer.
- 3. The module list: the order file, each module's entry (`name`, `files`, `tests`, `public`), how the order is read.
- 4. A module's requirements file: one line each, permanent numbers, `[met]`, who changes which part, the screen or journey ending.
- 7. The process config, field by field.
- 8. The ranking page, the owner's and ARCH's decision records, and a job's three comments.
- 9. Not settled: the proof's forms, another language, messages between running parts, a decision record past the maximum.

## Build text 2b

`02b-the-comment-and-the-listing.md`: sections 5 and 6 of build text 2.
- 5. A structured comment: JSDoc forms, `@bound`, which kind code checks or builds, the operations table, calls by name, the other marks.
- 6. An interface listing, entries and their names (a message's kind with its channel), comparing means, the words a change gets and who each tells.

## Build text 2c

`02c-the-coding-standard.md`: section 10 of build text 2.
- 10. The coding standard (a reference; S1 to S13; R1 to R22, no R9; the checker's settings), the facility list, how each rule is read, the conversion and its table, the uses file's form (its `mock` uses, `packages` and `takesIn`).

## Build text 3

`03-the-walks.md`: how a walk is made (sections begin at 2).
- 2. Areas: the documents as pages, how ARCH names a round's areas.
- 3. Steps: a step's form and home, who writes it, a walk measured against the document.
- 4. The internal walk, its two commands, one area as one command.
- 5. The external walk: one copy per walking session, journeys that use AI, how many walkers.
- 6. The walk issue, the comment's form, a flaw's and an observation's form, how ARCH turns a flaw into work.
- 7. When a walk is without flaws, and what the tool needs from it.
- 8. What to try first in the trial repository.

## Build text 4

`04-the-trial.md`: the order of building and trying.
- 1. The rule of the order: the most doubtful first.
- 2. What the owner gives before stage 0, and who builds.
- 3. Stages 0 to 7: what each builds, what it tries, and what breaks if it fails.
- 4. What each stage asks of the owner; act 10's branch ruleset.
- 5. What the trial cannot show.

## Build text 5

`05-the-records-and-following.md`: the records, and what the tool follows.
- 1. The shared-state issue: label, marks, finding, reading, writing, a failed write, one writer each.
- 2. The eight records and their JSON forms (roles with `process`, lanes, wakes, stop, standing notes, round with scope, waiting work, handover with `generation`).
- 3. What ends each kind of standing note.
- 4. The process's repository: its three records and the `products` registry.
- 5. The comments on pull requests: the job block, the job's record (the notices that need no change among it), the conversion's report, the declaration (meaning, and items recorded as the same), the test record and the heads it stands for, the notice comments.
- 6. How the tool works out the means (the closure's order, the implicit members, a module that keeps no state) and who is told, from the uses files' fields.
- 7. How the tool makes a told job's related tests.
- 8. Unproven, and not settled.

## Build text 6

`06-the-account-switch.md`: the account switch.
- 1. What a switch is; PROCESS and its products under one account.
- 2. What carries over, and what changes.
- 3. The owner's acts, in order, before ROOT, the settings check among them.
- 4. The sessions' side: the one way back.
- 5. What is read to show it lost no work.
- 6. Where this sits with the owner.
- 7. Unproven, and not settled.
