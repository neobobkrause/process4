# A dropped tranche cannot be carried out

Written by PROCESS #10, 24 Nov 2026. A process fault from civicsmith ARCH #11, passed on unchanged by coordinator #4 at
16:45Z. The owner had typed in the coordinator's session, 24 Nov: "Decision: drop tranche t1. The refactor starts from
main's code as it is; keep the requirements, the module list, the decision records and the lanes' design work."

ARCH's words: "The design lets the owner choose to drop a tranche (part 3, section 5) but gives no way to carry the drop
out. A drop must restore the product's code on the tranche branch to main's, and the only route onto that branch is a pull
request whose required run passes. A non-job pull request runs every touched module whole, which for civicsmith's t1 is
over 500 product files across about a dozen top-level folders, plane among them, beyond the 45-minute limit, and main's
code fails `check` in several modules (setup-words 551, record-grammar 59 disagreements, measured by the set-up session).
So a dropped tranche cannot be carried out under the process as it stands." Its options: A, PROCESS designs it (e.g. a
revert the owner alone merges past the required run); B, no revert, each module's first refactor job first puts its code
and tests back to main's.

## What is confirmed

- Design part 3, section 5 names dropping and says nothing of how. Part 3, section 1: one lasting tranche branch, never
  deleted or overwritten (part 6, section 3). So the drop must reach the tranche branch by a pull request.
- `tool/lib/scope.mjs` lines 29-65: a non-job branch that changes module files runs each touched module whole, `check`
  first (lines 59-65). So ARCH's reading is right: a restoring pull request runs every module t1 touched, plane among
  them, with the 45-minute limit and main's `check` complaints.
- The design already lets code cross between the two branches with no test: the tranche's pull request into main runs
  none (part 3, section 5; `scope.mjs` line 29). A drop is that crossing the other way: main's code back onto the
  tranche branch.
- Not read: whether the owner's branch rule on civicsmith-copy lets him merge past the required run (act 10 makes the rule;
  whether administrators are included is not recorded).

## Options

- **A. No change** (ARCH's B). Each module's next job first puts its files back to main's, then does its work. Costs: a
  module t1 changed that gets no job keeps t1's code, so the tranche, and later main, carries a mix unless ARCH places
  "restore" work on every such module; each restore runs `check` and the module's whole tests, plane's with the 45-minute
  limit. The owner's drop is carried out piecemeal and late.
- **B. The owner merges a restoring pull request past the required run, by his click.** No tool change, if his branch rule
  allows him to (not known). He would be landing hundreds of files he cannot read, with nothing to show they are only
  main's.
- **C. A drop is the tranche's merge in reverse (recommended).** ARCH runs one tool command that makes a branch `drop/<tranche>`
  from the tranche branch, puts back main's version of every module code and test file the tranche changed, and nothing
  else (requirements files, the module list, the records, the process config and the lanes' folders stay), and opens the
  pull request. The required run passes at once on such a branch when every file it changes is byte-for-byte main's, and
  says so; anything else on that branch runs as a non-job branch. None of the tests runs, as on the tranche's own pull
  request into main. ARCH merges it by the tool. Then ARCH closes the tranche's open jobs unmerged, clears the round and
  waiting-work records, and writes "not yet met" on each requirement whose met mark came from the dropped tranche (its own
  requirement-text pull request). No notice is sent: every module goes back together to main's code, which is consistent.
  `check` complaints in main's code are met by each module's next job, as for any module brought under Process4. It
  removes a test run that had no reason (design part 2, section 6: "a test runs only when there is a fully informed
  reason"); it adds no test, gate, review or stop. Changes: design part 3 section 5; the tool (`scope.mjs`, a new command
  in `commands.mjs`, tests); build texts 1 and 1b; ARCH's starting text. civicsmith gets it by its move to the latest
  version (the scope is decided by the tool at the tranche branch's version; the workflow copy is unchanged; to confirm
  when built).

## Interactions

With the group of 23 Nov (`change-group-23nov.md`): under change 1 GitHub runs no tests, and the drop's run is the
seconds-long reading; C's rule moves into the tool's `merge` (a drop branch whose files are all main's needs no recorded
pass). With the 45-minute limit: C runs no tests, so the limit does not touch it.

## Not known

Whether civicsmith's approvals let ARCH open and merge such a pull request (they allow merges into the tranche branch by the
tool); how many requirement marks t1 set; whether t1 changed files outside every module that the owner wants back too.
