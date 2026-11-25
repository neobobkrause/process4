# The record of the owner's decisions about the Process4 design, second file

PROCESS is the only writer of this record (design part 5, section 5). It continues `design-decisions.md`, which says how
the record works; both files are read through `decisions-index.md`. This file holds the subjects on jobs and the round, the
notice and the walks, and the newest subjects; it takes each new subject until it nears 60,000 bytes.

## Entries

### Subject: The form of a job's branch

**The rule as it now stands.** A job's branch is `job/<module>.<n>`, `<n>` its job number: one flat name under `job/`. The
tool still reads the earlier form `job/<module>/<n>` as a job's branch, so earlier jobs and their numbers count, and the
trial's history carries on. The name still begins `job/`, so a product receives the change by moving to the latest version
(design part 6, section 7). The old branches stay as history. The design names no branch form (build texts 1, 1b, 2 and 5;
`tool/lib/round.mjs`).

Why: GitHub cannot hold `job/<module>/<n>` beside a branch `job/<module>` kept from a product's earlier process ("directory
file conflict"), so most of civicsmith's modules could have no job branch. Option B of three (A no change, the owner deletes
the old branches; B a branch form that cannot meet them; C skip such modules). Researched in
`process/research/job-branch-name-collides-23nov.md`.

**The owner's words.** "Decision: Change the job branch's form as recommended (B)" — 23 November 2026.

### Subject: A job's commands: naming the pull request, and `ready`

**The rule as it now stands.**

1. **Naming the pull request.** `test`, `ready`, `results` and `close` take the pull request number, or the branch named with
   `--branch <b>`, or — when neither is given — default to the current branch's one open pull request (a job has exactly
   one); `merge`, `failed-runs` and `notify` require the number. A job starts on a detached checkout of the tranche branch
   (design part 4, section 2), where the current branch reads `HEAD` and the default cannot resolve the pull request, so
   these accept `--branch` as `open` does; a told job that finds nothing to change names `--branch <its branch>` or the
   number.
2. **`ready`** runs nothing: it marks a pull request ready only where a pass is recorded for its head after every notice, or
   where nothing needs testing (the subject "A job's tests, the test record and the required check"). On a pull request that
   is ready already, merged or closed, it says so plainly and marks nothing; `--branch` finds the branch's newest pull request
   in any state where none is open. The tool marks a pull request ready only by the route sessions can reach, and where
   GitHub refuses it ends with GitHub's own words; there is no fallback through `gh pr ready`, which uses GitHub's GraphQL
   interface and is refused to every session (build text 1b, command 4; `tool/lib/commands.mjs`, `tool/lib/github.mjs`,
   `prOf` in `tool/p4.mjs`).

Why: fix C of round 4 added the current-branch default, which a job's detached checkout could not resolve, so a told job
could not close (researched in `process/research/close-detached-checkout-19nov.md`); a second `ready` after a merge answered
with two misleading errors (option B of two: A no change; B say plainly, drop the fallback; researched in
`process/research/ready-on-ready-pr-25nov.md`).

**The owner's words.** On fix C: "Decision: adopt the round-4 fixes B, A and C in PR #14" — 19 November 2026.
On `ready` where there is nothing to mark: "Decision: Mark-ready: as recommended" — 25 November 2026 (in PROCESS #12's session).

### Subject: The round: slots, merge order, blocked jobs and a flaw handed back

**The rule as it now stands.**

1. **Slots.** New jobs start, earliest in the order first, only while the product's slots in use (its open jobs not
   recorded blocked, and its live walking sessions) are below the slot number. After a provider's interface change, a
   module with a notice waiting and no open job, earlier in the order than the latest running job's module, starts its told
   job at once, above the slot number; a later one waits its turn. After a merge ARCH refills the slot in the same turn
   (design part 2, sections 3 and 5).
2. **Merge order.** A ready job merges once no job is open among the modules it uses: the providers its uses file names,
   read at the tranche's newest commit and at the job's head, and theirs in turn; a module with no uses file yet waits on
   the earlier modules it imports. `merge` says which job it waits for and merges nothing; ARCH merges once that job has
   merged. A blocked job holds no one. `merge` also refuses a job whose tests ran before its latest notice (design part 2,
   sections 3 and 8). The reading of uses by following imports (the update of 24 November) is retired by decision C of 25
   November (the subject "Who a change tells").
3. **A blocked job.** A job stopped by another module records that it is blocked and its slot is freed; when that module
   merges, the job is ready again. Where ARCH ends the block by its own decision instead (a change to the module list, the
   order or a boundary, design part 2, section 8) and tells the job to go on, the job pushes with `--unblocked "<why>"`,
   which rewrites its own record to say it goes on; the round then shows it open and its slot used. The job is still the
   record's one writer (design part 2, section 3; part 4, section 11; build text 1b, command 2; build text 5, section 5; the
   job's starting text).
4. **A flaw handed back.** A module carrying a walk flaw, or a flaw another module's job reported, is finished by a merge;
   or, when its job finds that nothing in the module needs changing, by its job recording that in its pull request and
   closing it unmerged, which hands the flaw back to ARCH. ARCH re-places the flaw against another module, or gives it to the
   UX lane where the document is wrong; the module that handed it back is finished for the round, and the re-placed flaw is
   the other module's work. A flaw handed back twice becomes a design question (design part 2, section 4; part 4, section
   10; the tool's `finished` in `tool/lib/round.mjs`; build text 1b, command 12).

Why: the merge wait and the slot rule came with the update of 24 November 2026, the wait added on his explicit word (the
subject "A job's tests, the test record and the required check"); the tool read blocks ARCH had ended as blocked and their
slots as free, and ARCH filled slots by hand (option B of two: A no change; B `push --unblocked`; researched in
`process/research/blocked-record-not-cleared-23nov.md`); and the verification sweep found that a module whose job handed a
walk flaw back reached neither "finished" nor a next job, so `round-done` would hang once walks run.

**The owner's words.** On the round-done gap: "open item 12: decided - close the gap" — 20 November 2026.
On a block ARCH ended: "Decision: B" — 23 November 2026 (a comment on his page, on option B).

### Subject: A job's tests, the test record and the required check

**The rule as it now stands.**

1. **The required check** is `module-tests` on a product and `tool-tests` on the process's repository; the tool chooses it
   per repository (`requiredCheck`). On a product, `module-tests` only reads the test record, in seconds, and runs no
   product code. It reports on every pull request and passes at once where no module's code or tests changed, and on the
   tranche's own pull request into main (design part 2, sections 6 and 9).
2. **A job's tests run once, in the job.** The job runs `p4 test` in its own session, as one background command of up to two
   hours, and waits for it within its turn. `p4 test` first brings the branch up to its base's newest commit: where the
   tranche branch holds commits the head lacks, it merges the tranche into the checkout with a plain merge commit (never a
   rebase), pushes it, and runs the tests there; where the two do not merge cleanly, it changes nothing, runs nothing, and
   says to merge the tranche in first. A pull request into main, and a drop's, are left as they are. It then runs `check`
   and the tests in scope, and writes one test record on the pull request, naming the head it tested: the commit, the
   notice count, the scope, the files, the counts, pass or fail, and the fails across every run (design part 2, sections 3
   and 6; build text 1b, command 27; `bringBaseIn` in `tool/lib/testrun.mjs`).
3. **The scope.** The tool decides it: the whole module for an ordinary job; the related test files for a told job; nothing
   where no running code changed, as for a conversion that only states types in comments or marks data files (the
   owner's words under "Who a change tells"). For a told job, its own edits count among "the changed parts", so what it
   touches is re-tested; the related tests are those holding the places its uses file names for the changed items, or
   reaching them, chosen a whole test file at a time; and where the tool cannot follow a told module's code inside it, or
   the module has no uses file yet, that module's whole tests run (design part 2, section 7). Unproven: that the tool can
   trace a use to the tests that reach it.
4. **Failed runs.** The count that brings a fresh session (the third failed run) and a block (the fifth) is read from the
   record (design part 4, section 10).
5. **A pull request that is not a job's** and changes module code or tests is tested the same way by ARCH's session, each
   touched module whole. A test file the module list gives to another module, unchanged, is not run for the move. A module
   whose tests take more than two hours is ARCH's to split (design part 2, section 6).

Removed by the update of 24 November 2026: the run on GitHub's machines in two parts, its 45-minute limit, the second run
of a job's tests, and the rule that product code under test holds no access token. Unproven: all of the update, until the
trial on the trial product. A later step he named, not part of it: bringing declared uses in line with real uses.

Why: His requirements of 23 Nov, in his words: "running a test only as much as is minimally necessary to confirm that the
test passes"; "a test should not be running multiple times"; "a job marks itself ready once it's already passed its
tests"; "There's no reason for a job not to get the [notice] immediately"; and that the round wait for the earliest
running job a job depends on. The required run's 45-minute limit had cancelled tests that passed. A test at a head that
lacked the tranche's newest merges failed falsely and counted toward the failed runs (option B of three: A no change; B the
tool brings the tranche in first; C test a temporary merged copy). The required check's name was fix A of round 4.
Researched in `process/research/update-plan-24nov.md` and `update-build-spec-24nov.md`, with the files they name, and
`process/research/test-on-stale-branch-25nov.md`.

**The owner's words.** On the required check's name (fix A): "Decision: adopt the round-4 fixes B, A and C in PR #14" — 19 November 2026.
On a told job's tests, the three readings: "Decision: as recommended" — 20 November 2026.
On the update: "Decision: the update plan as laid out" — 24 November 2026 (in PROCESS #10's session, on the plan
`process/research/update-plan-24nov.md` with its item 6 moved to a later step: "Agreed, move change 6 to the later step.
With that, please lay out the process4 change plan for one final read through before approving it."). On the second line
of item 1: "Tests are code. They don't even reference the environment's secret values. So your concerns about that are a
non-issue." — 24 November 2026 (conversation).
On bringing the branch up to the tranche (option B): "Decision: B, as recommended" — 25 November 2026 (in PROCESS #12's session). PROCESS first recorded
those words for the entry "Merging goes on while a notice is worked out" and asked whether they also answered this item;
his answer, the same day: "Yes, B covered the stale-branch item too" — 25 November 2026.

### Subject: When the tool's own tests run

**The rule as it now stands.** The tool's tests run only where the tool is changed. Before pushing, PROCESS runs only the
tests of the tool it changed, and none where no tool changed. In the process's repository the required run `tool-tests`
still reports on every pull request, because GitHub requires it; it runs the tests only on a ready pull request that changes
a file of the tool, and passes at once on a draft and on any other pull request. A file of the tool is anything under
`tool/` or `shims/`, the two starting texts the tool fills in (a job's and a walking session's), and the workflow itself
(`.github/workflows/tool-tests.yml`; design part 6, section 5; build text 1, section 6; PROCESS's starting text, its acts
and rule 7).

Why: PROCESS ran the whole suite before pushing a change of texts, the workflow counted every starting text as a file of
the tool, and the suite ran twice on a pull request that changed the tool (as a draft and again when ready).

**The owner's words.** "Decision: github should not be run tool tests on every pull request to the
process4 repository. PROCESS  should never run tool tests before pushing except the tests for a tool
that has been changed." — 22 November 2026.

### Subject: What the check refuses

**The rule as it now stands.** `check` is part of a module's tests, run by `p4 test` before the tests in scope.

1. **Two refusals, and no other.** It refuses a structured comment of the module that disagrees with the module's code
   (refusal (a)), and the module's code where it disagrees with a provider's stated interface in its public files (refusal
   (b)); for a value handed across, refusal (b) counts only the comment on the side that receives it. It refuses a type
   disagreement only when what it contradicts is stated by a structured comment: a disagreement on plain code that no
   structured comment states is "cannot tell" and never refused (design part 2, section 6; build text 1b, command 18; build
   text 2b, section 5).
2. **Error-condition tests.** A wrong-typed value a test passes on purpose inside an error assertion (`assert.throws`,
   `assert.rejects` and their kin), to show that an error condition is "properly identified and communicated", is neither
   refusal: the tool reads it as "cannot tell".
3. **Declared uses.** A module's declared uses are the providers its uses file names, which the tool writes from the
   module's code and tests under the coding standard (the subject "Who a change tells"). The check refuses a use of a
   module that is not before this one in the order. A place outside the standard that may refer to a later module is
   "cannot tell". A job cannot settle a needed use of a later module in its own files: it reports to ARCH and is recorded
   blocked, other work goes on, and ARCH corrects the order, the module list or the boundary (design part 2, sections 1, 3,
   6 and 8; build text 2c). The reading of declared uses from imports (the update of 24 November) is replaced by decision
   C of 25 November.
4. **What the reader leaves out.** The process config's `language_reader.exclude` names files the reader leaves out
   (vendored copies, committed built bundles), which no module then owns, checks or lists (build text 2, section 7). A file
   the language's own reader cannot walk is "cannot tell"; the tool's walks over a file do not overflow the stack on a very
   long expression.

Why: `check` reported every type disagreement in a module's files, failing correct error-condition tests (fault D; option B
of four, which flipped one of the proof's 48 recorded refusing decisions, P09; researched in
`process/research/faultD-check-wrong-type-tests-19nov.md`). Nothing in the tool compared declared uses with the order
(option B of three: A no change; B the existing check refuses it; C the tool tells ARCH and refuses nothing; it makes an
existing check refuse one more thing, on his word; researched in
`process/research/tests-referring-to-later-modules-22nov.md`). On civicsmith's real code `check` refused nearly every module,
mostly on plain uncommented code (option 3B of three: 3A no change; 3B refuse only what a comment states; 3C refuse only
changed lines; the proof's T14 re-recorded; researched in `process/research/check-on-real-code-22nov.md`). The update of 24
November mended the declared-uses reading (`require`, the product's own name); decision C of 25 November
replaced that reading with the uses file.

**The owner's words.** On fault D: "Decision: B" — 19 November 2026.
On a declared use of a later module: "decision: option B, as recommended" — 22 November 2026.
On refusing only what a comment states: "Decision: 3B, as recommended" — 22 November 2026 (a comment on his standing page, on
option 3B; PROCESS read "as recommended" as including the two smaller repairs recommended beside it, and said
so to him on the same thread).

### Subject: Who a change tells

**The rule as it now stands.** The notice's rules are in design part 2, section 7; these are the owner's decisions on them.

1. **Who uses what** is worked out by the tool from each module's code and tests, kept to the coding standard (S1 to S13,
   R1 to R22 and the type checker's settings, build text 2c), and recorded in the module's uses file at every push of its
   jobs and in every change ARCH makes to it. Who is told is a lookup of the changed items in the later modules' uses
   files, directly or through a middle module that passes the item on. A place outside the standard is told of every
   change of the modules it may refer to until a job converts it; a module with no uses file yet, of every change of an
   earlier module it imports. A module's first job under the standard is its conversion. Whether each facility of Node
   and workerd stays inside the program or reaches outside it is fixed in the tool; ARCH names the product's boundary
   modules and classifies the packages it uses, in its facility list. This replaces the rule that the
   tool infers uses from plain code and that no list is kept by hand (design part 2, section 7, rule 1), and retires
   decision 3B (below): no module is told only because the tool cannot follow it.
2. **What changed** is each item's means, worked out before and after the merge: its stated types, expanded through every
   type they name; its named types and read-only arguments; and, from its code over a closure that follows calls and data
   within the module, the errors that can leave it, plain data or a class instance, `this`, the arguments it writes into,
   the channels and settings it reads or writes, and whether it answers at once or later. A type error in the item counts
   as a change. So does an item whose meaning ARCH names in the work it places, or the job declares in its pull request,
   and a changed marked bound line. Whether an item still gives the same answers is not asked; an accidental change of
   meaning is a bug in the provider, caught first by its own tests.
3. **Describing is not changing.** An item's first means, at its conversion, tells no one; nor does a new item, or an item
   that only accepts more, as the type checker confirms. This carries decision 2 of 25 November (an unknown kind becoming
   known tells no one) and its union case (decision 1B).
4. **An item's name.** An item is named by its name within its module. Where two of a module's interface files export one
   name for two different things, each is an item of its own named `<file>:<name>`, the file as the module list writes it;
   the same thing exported again from a second file stays one item (decision 4B; build text 2b, section 6).
5. **The reason printed.** A notice names each changed item the module uses, how it was found (its means, ARCH's work, the
   job's declaration), the one-line why, and the places from the module's uses file: file, line, and for tests the test
   case's name.

Retired: decision 3B of 25 November (a user the tool cannot follow fully told only where its files name the entry), and
the rule it narrowed, that such a user is told of every change that tells any user; both rested on inferring uses.

Why: the tool inferred uses from plain JavaScript and told every module it could not follow; after one merge 197 modules
were told, 194 only for that. It compared written descriptions, so a job that changed code and left its comment told no
one: on the proof, 45 needed modules were missed under every earlier option, and 13 more real breaks the proof never
listed. The owner asked for a fix built "directly from a deep understanding of JS's specific means by which a reference is
made", load-bearing, and recorded by rewriting the existing entries. Options: 0 no change; A a file each job writes, with
no standard; B the standard without the rules on types; C the full standard, with a first pass of 8 real modules
(recommended). Researched in `process/research/uses-metadata-25nov.md` and `process/research/uses-metadata-25nov/`
(the design document, https://claude.ai/artifact/FtqUWACJcaoWi9KZmubkAk, revision 58; `study-references.md`,
`study-changes.md`, `every-reference.md`, `standard.md`, `proof.md`); the earlier fixes in
`process/research/not-followed-told-everything-25nov.md`, `notify-1356-anything-to-stated-25nov.md`,
`notify-1356-still-197-25nov.md`, `same-name-entries-25nov.md`, `notify-rerun-repeats-25nov.md` and
`narrowing-decision-2-25nov/`, and `who-is-told-25nov.md`.

**The owner's words.** All 25 November 2026; the early provider's three fixes and the unknown kind's three are under "How
`notify` reads the product" and "How a notice reaches a user".
On the union case and the reason printed: "Decision: 1b" — 25 November 2026 (a comment on his standing page, on option 1B).
On one name exported twice: "Decision:4b" — 25 November 2026 (a comment on his standing page, on option 4B).
On a user the tool cannot follow fully: "Decision: 3b" — 25 November 2026 (a comment on his standing page, on option 3B);
retired by the decision below.
On how the fix is to be found (conversation, in PROCESS #15's session; all his words of that day are in
`process/research/uses-metadata-25nov/design.md`, section 6): "It's important that the tool that identifies provider uses
be rigorous so that we have a very high level of confidence that no references are being missed." — 25 November 2026.
"Every reference means every reference, not every reference except a bounch of others" — 25 November 2026. "There's no
need for the module jobs to run tests when no code is being run. That needs to be in the instructions given at the top of
these jobs." — 25 November 2026.
On the design: "Decision: C, the full standard, with the first pass of 8; build the conversion job, the notification
tool, and the tool that keeps each module's uses file current on every module job." — 25 November 2026, 18:51 UTC (in
PROCESS #16's session, on the design document above).
On who classifies host facilities: "Decision: use the simplification: the tool carries Node's and workerd's facility
classification; ARCH names the boundary modules and classifies the packages its product uses." — 25 November 2026, 20:26
UTC (in PROCESS #16's session, on the options: no change, ARCH keeps the whole list per product; or this simplification).

### Subject: How `notify` reads the product

**The rule as it now stands.** `notify` reads only what a merge can affect, and no user's code (build text 1b, command 11).

1. It works out which modules a merge changed from the two module lists and the changed file names alone, before reading
   any code; where none changed it says so and reads nothing.
2. For each changed module it works out each item's means before and after (design part 2, section 7), from that
   module's files and its providers' stated types, over the closure within the module. It adds the items ARCH's placed
   work names and the job declares.
3. It then reads the later modules' uses files, a lookup with no code read, and tells the modules that name a changed
   item; and, for any change to the module's files, whether or not an item changed, those with a place outside the
   standard that may refer to it or an order fault naming it, and those with no uses file yet that import it (the subject "Who a change tells").
4. The commands that read a product's code (`listing`, `notify`, `check`) run with a memory allowance of three quarters of
   the machine's memory where node's default is less. Where a reading still does not fit, `notify` says so plainly, tells
   nobody, and names the notice owed, instead of crashing.

The staged reading of the later modules' code (decision D of 23 November, and the early provider's first fix of 25
November) is retired by decision C of 25 November (the subject "Who a change tells"): the users' files replace it.

Why: on civicsmith (204 modules) `notify` ran out of memory, at 12 GB too, reading and type-checking the whole product for
every merge; after an early provider's merge it took most of an hour and once took down ARCH's machine. The first repair was
option B of three (A no change; B both repairs; C the first only); the staged reading, option D of four (A no change; B read
one side at a time; C B with a plain message; D read only what a merge can affect); the early provider's fixes, option B of
three (A no change; B the three fixes: this reading, who is told, no notice lost; C fixes 1 and 3 only). The owner's
uses-file idea (a file per module written at its job) was built and tested: same answers, little gain once kinds are worked
out once. Researched in `process/research/notify-out-of-memory-23nov.md` and
`process/research/notify-slow-early-provider-25nov.md`.

**The owner's words.** On the first repair: "Decision: B" — 23 November 2026 (a comment on his page, on option B).
On reading only what a merge can affect: "The huge need for memory by this tool leaves me wondering if the tool is properly designed for
the purpose it serves. Is there a more efficient design for this tool that can meet all requirements?" — 23 November
2026 (conversation). "Decision: D" — 23 November 2026 (a comment on his page, on option D).
On the early provider's merge (the three fixes): "Before we bring civicsmith over to the latest version, there seems to be a question about the
amount of time it takes for the tool that notifies users that a provider has changed. This tool seems to take a VERY long
time - unreasonably long. Research this to understand what we can do to make the tool go as fast as it can while doing
the task correctly." — 25 November 2026 (conversation). "We know it's slow. We also know from looking at the code why it's
slow. What we need to figure out is how to meet the tool's requirements much faster than how it does it now." — 25
November 2026 (conversation). "Decision: B, as recommended" — 25 November 2026 (in PROCESS #12's session, on the options
for this item).

### Subject: How a notice reaches a user

**The rule as it now stands.**

1. **Merging goes on.** After a merge, ARCH refills the slot in the same turn and starts `notify` for that merge as its own
   background command of up to two hours, and goes on merging other ready jobs meanwhile (design part 2, section 3; ARCH's
   starting text, rule 2).
2. **A user whose job is open when `notify` ends** gets the notice at once: it goes into the job's block (its work and uses;
   the block's notice count rises), ARCH messages the job, and a pass recorded before it no longer counts; the job deals
   with the notice, runs `p4 test` again, and is ready again (design part 2, section 7). The notice keeps the block under
   60,000 characters: its reasons lose their before and after where needed, and where that is not enough they become one
   reason that runs the whole module's tests. Where the job's pull request merged or closed while its block was written, the
   block is put back and the user is treated as having no open job.
3. **A user with no open job**, one that merged before the notice was worked out among them, gets a told job, its next job.
   The reasons are written once on the merged provider's pull request, in `<!-- process4-notice -->` comments each under
   60,000 characters, as many as needed; the waiting-work entry names only the module, the provider and the merged pull
   request; `open --module` copies the reasons into the job block and writes the block's `notices` (build text 5, sections
   2 and 5; build text 1b, commands 3 and 11). A reason keeps its first six places and a count, so a notice is never lost for
   its size; the places come from the told module's uses file.
4. **No repeats.** A told user whose job pull request, open, merged or closed, already names the notice in its block, in its
   `notices` or its work line, is skipped.
5. **A refused write** to GitHub ends with GitHub's own words, its message and errors included (`tool/lib/notify.mjs`,
   `noticecomments.mjs`, `util.mjs`).

The cost: a user merged meanwhile may need a small told job afterwards; until then its merged code has not been judged
against the provider's change, as for any user whose job was not open.

Why: ARCH held nine ready jobs while `notify` ran most of an hour, because the design promised an open job its notice
before it merged (option B of three: A no change; B merging goes on; C only make `notify` faster); a waiting-work write was
refused for its size, losing notices; a notice reached a job merged the same moment; and re-runs repeated notices and opened
duplicate told jobs. The waiting-work record and a starting job's block outgrowing one comment is choice 6, which waits
(the subject "Cleaning up Process4 before further improvements"). Researched in
`process/research/merges-held-for-notify-25nov.md`, `process/research/waiting-work-too-large-25nov.md`,
`process/research/notify-1356-anything-to-stated-25nov.md` and `process/research/notify-rerun-repeats-25nov.md`.

**The owner's words.** On merging while a notice is worked out: "You say that that holding is ARCH's own choice, but process4 must have instructed it to do so.
This is just wasted time. We need to figure out what the process is telling ARCH that's making it wait and fix that." —
25 November 2026 (conversation, in PROCESS #12's session). "Decision: B, as recommended" — 25 November 2026 (in PROCESS
#12's session, right after the options for this item were put to him; PROCESS read it as this item, and asked him
whether it also answers the other item on his page, the stale-branch test, which also recommends B; he said yes, the entry
"A job's tests run on its branch brought up to the tranche").
On an unknown kind becoming known, nothing lost to size or a race, and no repeats: "Decision: B, as recommended" — 25 November 2026 (in PROCESS #12's session, on the three fixes put
to him together).

### Subject: The walks' five matters

**The rule as it now stands.** (Build text `03-the-walks.md`; design part 3, section 3. The labels 9.1 to 9.5 are the items' numbers when put to him; each now lives where its own references say.)

1. **Which list of journeys counts (9.1).** The UX design lane maintains the product's list of journeys; that list is the
   one the walks use, and the owner does not approve it per tranche. The form of the two documents stays as build text 3,
   section 2 decides (a page per screen group and per journey, with an index) (design part 3, section 3; part 4, section 3).
2. **AI journeys (9.2 and 9.3).** A step of a journey that uses AI is judged as a module test is judged — a different but
   still valid answer does not fail it — and the "what must be present" wording its `expects` line carries is set per
   journey by the UX design lane (build text 3, section 5). When no AI account is connected to the development deployment,
   journeys that use AI are recorded not walked, and a tranche may still end with them so recorded (option A); each is named
   not walked in the account after the round.
3. **A flaw set aside by ARCH (9.4).** ARCH may rule that a walker's entry is none of the three flaw kinds and set it aside,
   with the reason named in the account after the round, so the owner can see and overrule it (option a; build text 3,
   section 6, outcome 3).
4. **Parts walked by hand (9.5).** A walking session walks by hand — operates the running product in its browser, in its own
   words — whatever a screen or journey page describes that no written step covers; a walk is measured against the
   document, not only against its written steps (option a; build text 3, section 3). This catches a missing or weakened step.

**The owner's words.** On 9.1: "Decision: the UX design lane maintains the list of journeys. That's the list to use, and I don't need to approve that list after a tranche." — 20 November 2026.
On 9.2: "Decision: agreed, except that the “what must be present” wording is set per journey by the UX design lane." — 20 November 2026. On 9.3: "Decision: A" — 20 November 2026.
On 9.4: "Decision: as recommended" — 20 November 2026.
On 9.5: "Decision: as recommended" — 20 November 2026.

### Subject: Cleaning up Process4 before further improvements

**The rule as it now stands.** Before any further improvement, Process4's texts and tool are cleaned up, changing no rule and
no behaviour, except where a text or the tool breaks a rule the design already states. Each area is done in place: the
record of decisions regrouped by subject, one entry per subject with every one of the owner's dated words kept beneath it;
the design's findings rewritten each in its home section, tool detail moved to the build texts; the build texts rewritten
in place, their dated clauses left to this record; the starting texts re-split by subject, every act a session takes named,
each under 8,192 bytes and ten rules; and the tool's duplicate code made one. Each change is named to the owner. It adds no
test, gate, review or stop. Option B of three (A no change; B clean up first; C the texts only). Researched in
`process/research/cleanup-audit-25nov/`.

Choice 6 (the waiting-work record and a starting job's block outgrowing one comment) waits, on the owner's suggestion, until
the way the tool decides which modules are told of a change is corrected: "I think that the reason that the length of
notices are overflowing is because the process for determining which modules need to be told when an earlier module changes
is broken." — 25 November 2026 (conversation).

**The owner's words.** "Decision: B, (ii)" — 25 November 2026 (in PROCESS #14's session; B of the cleanup options).

### Subject: What PROCESS reads in full

**The rule as it now stands.** PROCESS reads in full, before acting, its starting text, the design (parts 00 to 10) and its
handover record. It reads the record of the owner's decisions, the build texts and its research through their indexes (`decisions-index.md`, `build/README.md`, `research/README.md`), one line
for each entry or file, and opens an entry or a file, or gives it to a worker, when a question touches it. The design states
every decision as it now stands, so it is the governing statement; the record keeps the owner's exact dated words and the
reasons (design part 5, section 3; part 6, section 7; PROCESS's starting text). It brings PROCESS's reading set from about
300,000 bytes to under the 175,000-byte set maximum. It removes reading; it adds no test, gate, review or stop. Option (ii)
of two ((i) no change). Researched in `process/research/cleanup-audit-25nov/README.md`.

**The owner's words.** "Decision: B, (ii)" — 25 November 2026 (in PROCESS #14's session; (ii) of the choice on what PROCESS
reads).
