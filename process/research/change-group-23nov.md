# The group of changes put to the owner on 23 Nov (evening)

Written by PROCESS #10, 23 Nov 2026, from `tests-once-and-merge-order-23nov.md` (the four changes agreed in
conversation with PROCESS #9), `long-modules-23nov.md` and `module-uses-23nov.md` (two workers' research, read in full by
PROCESS #10 as summaries and spot-checked), and the open faults on the owner's page. Considered together, as rule 1 of
PROCESS's starting text asks: each change below says what it does to the others. Nothing here is decided.

## What the research changed in the four

- **Long modules no longer block change 1.** The design's "about thirty minutes for one command" (part 7, section 1) is
  the harness's default for a background command, not its ceiling: a background command may be given up to 2 hours
  (Claude Code docs, read 23 Nov; a background command here ran 11 minutes unbroken). plane's 44 minutes on GitHub fits.
  No pieces are needed for a module whose tests finish inside 2 hours. The job session itself starts the command (one a
  worker starts ends with the worker) and waits for it in its turn.
- **Change 3 cannot use "own providers" as the tool now knows them, nor "every earlier open job".** The check sees uses
  made by importing a file by path, and nothing else: not `require`, not the product's own package name (both silently
  missed), and no path string (a file read, a started program, the whole product started). On civicsmith most such reach
  goes to a LATER module (62 test files start plane), which no merge order protects.
- **The owner's "second level" point holds.** What a module reaches through another follows from the module list's
  declared uses, taken to their closure. Only first-level uses need finding.

## The group, as recommended

1. **A job's tests run once, in the job.** The tool's test command (whole module for an ordinary job, the related files for
   a told job, with `check`) runs as one background command of the job's own session, up to 2 hours, and records the pass
   for the exact commit on the pull request. `ready` runs nothing and marks ready only with a pass for the current commit.
   GitHub runs no tests: (a, recommended) the required check becomes a seconds-long reading of that record, so the branch
   rule still refuses a merge with none; or (b) no workflow, the owner removes the required check by a click, the tool's
   merge refuses without a record. Removes: the 45-minute limit, the draft run that passes with no tests, the second run of
   every job's tests, and the two-part run. Held by text: the job writes its own pass record, as it writes its own tests.
   Corrects part 7's time row. Needs civicsmith's committed workflow copy changed by pull request.
2. **A notice reaches a running job at once** (as agreed).
3. **A ready job merges once no open job is left among the modules it uses, directly or through others, by the module
   list's declared uses.** Waits less than "every earlier open job". A use nobody declared is missed, as today (design part
   10, section 6 accepts a failure caused by another module's merge sitting unseen until a walk). This adds a wait: it
   needs the owner's explicit approval (rule 2).
4. **Slots** (as agreed): told jobs earlier than the latest running job start at once above the slot number.
5. **The check's two faults mended.** It reads `require` and the product's own package name as the notice already does
   (this can refuse an undeclared use it missed before; needs his word); and a declared use the check cannot see is
   "cannot tell", not refused (today an honest declaration made by a file read is refused and the job told to remove it).
6. **Module tests reach other modules only through imports.** A test that starts the whole product, reads another module's
   files or runs its program belongs to the latest module it reaches (the module list can give a test file to another
   module without moving it), or to the walks. Held by text (job's and ARCH's texts); ARCH's conversion work on
   civicsmith, which the civicsmith lane already sorted into 13 groups (`process/lanes/civicsmith/later-module-tests.md`).
   With it, 3 becomes safe.

## Now, before the group is built

- **The 45-minute limit:** B (6 hours), one line here and the same line in civicsmith's copy by pull request. Change 1
  later removes it.
- **The draft run that passes with no tests:** change 1 removes it. Until then, C (the tool's merge refuses a run that saw
  a draft) reaches civicsmith by the move alone; B needs civicsmith's workflow copy changed.
- Separate and small, each recommended: refusal (b) counts only the receiving side (`check-names-wrong-provider-23nov.md`,
  B); a class member's own bound (B); a notice reason kept short (B); requirements ARCH holds out of a tranche (C).

## Not known

Whether civicsmith-copy is public (GitHub gives a private repository 2 CPUs, so one test file at a time); plane's time in a
session; whether a background command keeps an idle session machine from pausing once the turn ends (so the job waits in
its turn); whether civicsmith's approvals let a session change its workflow copy; how much a told job saves against the
waits of change 3.
