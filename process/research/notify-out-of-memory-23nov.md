# `p4 notify` runs out of memory on civicsmith

Written by PROCESS #9, 23 Nov 2026. A process fault from civicsmith ARCH #8, passed on unchanged by civicsmith
coordinator #4 at 05:31Z:

> "`p4 notify 1161` (0eec86f tool, civicsmith-copy, a merge that changed only process/ files) crashed with a JavaScript
> heap out-of-memory error (node's default heap, on a machine with 15 GB free). Run once more with node
> --max-old-space-size=12000 it finished: 'The merge changed no module's files. Nobody is told.' Every merge's notify on
> this 204-module product will likely meet the same crash at the default heap."

## Why (read in the tool at 0eec86f)

`notifyCmd` (`tool/lib/notify.mjs`) writes out the product before and after the merge, then calls `analyse` on each
(`tool/lib/notice/notice.mjs`): one whole TypeScript program over every code file, every module's listing and every
module's uses, twice. Only after both does it ask which modules' files the merge changed (`changedModules`), and that
question needs only the module list and the file list. So a merge that changes no module's files (requirement text, the
module list, a lane's folder, process files) still reads the whole product twice. On civicsmith (204 modules) that
needs more than node's default heap (about 8 GB on a 16 GB session machine, measured here) and finished within 12 GB.

A job's merge does change a module's files, and then the whole reading is needed by the method as built (a provider's
users are every later module). So that case needs the memory too: not measured yet, expected the same.

## Options

- **A. No change.** Every notify on civicsmith crashes; ARCH has no text that lets it raise the memory itself, so each
  merge's notice is lost or the fault comes back each time.
- **B. Two repairs (recommended).** (1) `notify` first works out the changed modules from the module list and the
  changed file names alone, and stops at once, reading no code, when none changed: the same answer, without the
  reading. (2) The commands that read code (`listing`, `notify`, `check`) give themselves a memory allowance of most of
  the machine's memory, the way ARCH's rerun did, instead of node's default. Removes a crash; adds no test, gate, review
  or stop. A product gets it by moving to the latest version.
- **C. Repair (1) only.** Fixes merges that change no module; every job merge still crashes.

## Not known

- Whether a job merge's notify on civicsmith fits in the memory a session machine has (16 GB here). Seen first at its
  first job merge.
- Whether `check` inside a module's tests on GitHub's machines meets the same limit: it reads one module and its
  providers, not the whole product twice; no crash reported.

## Outcome

The owner chose B, 23 Nov 2026 ("Decision: B", a comment on his page). Built with a test of a merge that changes only a
process file and a test of the memory flag. Entry "The tool's code reading on a large product" in `design-decisions-2.md`.

## Measured after decision B: a job merge does not fit in 12 GB

civicsmith ARCH #8, passed on by coordinator #4 at 05:44Z: "On PR 1153 (test-support's job, merged at 359f66e) it ran
out of heap even at --max-old-space-size=12000 (FATAL ERROR: Ineffective mark-compacts near heap limit; machine has
15 GB). So no notice can be sent for any merge that changes a module's files; merges 1152 (setup-words) and 1154
(bundler) are also un-notified. ARCH goes on merging jobs that pass, and records each merge whose notice is owed."

So decision B's second repair (three quarters of the machine's memory, about 12 GB) is not enough for a job merge on
civicsmith. Why, read in the tool: `notifyCmd` holds three TypeScript programs at once at its peak: the whole product
before the merge (`analyse(treeB)`, kept in `B.program`), the whole product after (`A.program`), and, inside
`makeConfirm`, a third over every module's public files on both sides. `notice` itself uses only the listings and the
uses `analyse` returns, not the programs (`B.program`/`A.program` are read only by `check`).

### Options

- **A. No change.** Notices are not sent on civicsmith; the design accepts a missed notice (part 2, section 7: a missed
  user is caught by its own tests at its next job, or by a walk). ARCH records each owed notice.
- **B. Read one side at a time (recommended).** `notify` reads the product before the merge, keeps only its listings
  and uses, lets that reading go, then reads the product after: the peak is one whole-product reading instead of two
  (plus the smaller reading of public files when "accepts more" is asked). Same answers. Not known until it runs on
  civicsmith: whether one reading fits in 12 GB; ARCH can then send the owed notices for 1152 to 1154 by running
  `notify` on each.
- **C. B, and where it still cannot fit, `notify` says plainly that it could not read the product and tells nobody**,
  so ARCH records the notice owed instead of meeting a crash. A failure message only; adds no stop.

## The owner's question, 23 Nov: is the tool designed well for its purpose?

His words (conversation): "The huge need for memory by this tool leaves me wondering if the tool is properly designed
for the purpose it serves. Is there a more efficient design for this tool that can meet all requirements?"

What the notice must do (design part 2, section 7; build text 5, section 6): for each module a merge changed, compare its
interface listing before and after; if they differ, tell the later modules that use a changed entry, with the places;
count a user the tool cannot follow as using everything; read uses from the users' code as it stood before the change;
confirm "accepts more" with the type checker.

What it does now: it type-checks the whole product twice (every module's listing and every module's uses, before and
after), then a third program, whatever changed. Most of that is never used:

- The "after" side needs only the changed module's listing, not every module's listing and uses.
- Most job merges change a module's insides, not its listing; then nobody is told, and no user needs reading at all.
- When a listing does change, only later modules that can reach the changed module need reading: those whose imports,
  followed from file to file, lead to its files (directly or through another module), those that call by name where it
  publishes operations or tables, and those with an import the tool cannot resolve (counted in, as "cannot follow").
  An import graph is read from the files' text without the type checker, quickly and in little memory.

A staged design, the same rules:

1. Which modules changed: from the changed file names (built, decision B).
2. For each, its listing before and after, each from a program of that module's files and what they import. Equal:
   nobody is told, stop.
3. Otherwise, the candidate users from the import graph (above, erring toward inclusion), and each candidate's uses read
   from a program of that candidate's files and what they import, on the "before" side, one candidate at a time.

Memory then grows with the largest module and what it imports, not with the product; time falls the same way. Same
answers expected; the acceptance check exists: the tool's replay of the proof's 150 recorded changes
(`tool/test/notice-proof.test.mjs`, `fixtures/notice-proof/expected.json`) must give the same answers. `check` already
reads one module and its providers this way (`ownProgram` in `tool/lib/notice/check.mjs`).

Not known: the memory of one module's reading on civicsmith (a late module imports much); whether every one of the 150
answers holds without a deliberate change to `expected.json` (any change is written there with its reason, as before).
Cost: a rewrite of the notice's reading (`notice.mjs`, `usage.mjs`, `listing.mjs` callers, `notify.mjs`), a few hundred
lines, built and checked against the replay before anything merges.

**Option D (recommended, replacing B and C):** the staged reading, with C's plain message kept for a reading that still
cannot fit.
