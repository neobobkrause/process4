# Requirements ARCH holds out of a tranche

Written by PROCESS #9, 23 Nov 2026. A process fault from civicsmith ARCH #8, passed on unchanged by coordinator #4 at
06:28Z:

> "ARCH decides a tranche's scope (design part 3, section 1), and has held some requirements out of tranche t1 by
> decision (inquiry R31; agent-runner R36, R37, R38, R40; agent-worker-routes R111). But a requirement can only be marked
> met or not yet met (part 2, section 2), and the tool counts every '[not yet met]' line as the module's work
> (tool/lib/config.mjs:66, round.mjs). So `next-job` keeps handing out jobs for requirements ARCH has held out, and
> `finished` never counts those modules finished, so the round's jobs can never be done. ARCH's interim course, with no
> change to any form: where a held requirement truly waits on another module's work, the job records itself blocked by
> that module (agent-worker-routes by agent-runner, and agent-runner by agent-worker-routes, the two halves of one loop;
> inquiry by record-grammar), so its slot is freed and round-done counts it; a job is spent each time the blocking module
> merges."

## Confirmed in the tool (main)

`notYetMet` (`tool/lib/config.mjs`) takes every `[not yet met]` line as work; `workOf` (`tool/lib/round.mjs`) adds them to
the module's work; `finished` keeps a module unfinished while any remain; `pickNext` hands its job out again. Nothing in
the design, the forms or the tool lets ARCH say "not in this tranche". The design gives ARCH the scope (part 3, section 1)
but no means to record it.

## Options

- **A. No change.** ARCH's interim course: jobs record themselves blocked by another module to free their slots. It
  spends a job each time that module merges, and records a block that is not one.
- **B. A third mark on a requirement, `[held]`.** ARCH writes it in the requirements file (it already writes the text and
  "not yet met"), by pull request; the tool does not count a held line as work. ARCH puts it back to `[not yet met]`
  when the requirement comes into scope. Visible in the file; each hold or release is a pull request.
- **C. A held list in the round record (recommended).** ARCH, the round record's writer, lists the held requirements
  (`"held": ["inquiry R31", ...]`) by the tool; `workOf` leaves them out, so `next-job` does not hand them out and the
  module can finish. Scope belongs to the tranche, not to the requirement's text; it needs no merge, and it ends with the
  tranche, so held requirements come back as work in the next tranche unless ARCH holds them again. The account after the
  round names them.

Either B or C adds no test, gate, review or stop; each lets ARCH record a decision the design already gives it. Changes:
the tool (`workOf`, and for C the round record's form), design part 2, section 2 or part 3, section 1, build text 5
section 2 (for C), ARCH's starting text (one clause).

## Again, sharper: civicsmith's refactoring tranche (24 Nov 2026, PROCESS #11)

A process fault from civicsmith ARCH #13, passed on unchanged by coordinator #5 (~22:32Z), on Process4 ac962e7:

> "the design says ARCH opens each tranche and decides its scope (part 3, section 1). The tool gives ARCH no way to keep
> work out of a tranche. tool/lib/round.mjs takes a module's work to be every requirement "[not yet met]" at the tranche
> branch's head plus waiting work, and next-job starts the earliest such module with no scope filter. Requirements have
> only two marks, and "module put first" only reorders. civicsmith has 78 requirements not yet met in 29 modules
> (p4-tranche 6c9dba5). The owner wants a tranche holding only the plane-scope refactoring, built and confirmed stable
> before any other work. Under ac962e7, lifting his halt starts all 29 modules' jobs, and a refactoring job at plane or
> control-plane also carries those modules' other requirements. So ARCH cannot carry out a scope decision for this
> tranche. No workaround has been made."

civicsmith's halt is in force, so nothing runs now; but lifting it waits on this. Option C would need ARCH to list 78
held requirements, and to list again each one that lands in the tranche's modules later. A fourth option fits a tranche
defined by what it holds:

- **D. A scope list in the round record (now recommended).** ARCH, the round record's writer, writes what the tranche
  holds: `"scope": ["plane R200", "control-plane R12", "store-assembly"]`, each a requirement (`<module> R<n>`) or a whole
  module (all its requirements not yet met). Where a scope is written, `workOf` counts as work only the requirements it
  names; every other requirement waits, as if held, until the tranche ends. Notices, walk flaws and flaws a job reports
  are always work: they come from the tranche's own changes. No scope written means every requirement, as now. The
  account after the round names the scope. One list either way, written in the words of ARCH's scope decision; it ends
  with the tranche; it needs no merge.

C stays an option where a tranche holds most of the work and leaves out a few. B and C as above; A no change (lifting
the halt starts all 29 modules). Each of B, C, D adds no test, gate, review or stop: it lets ARCH record a decision the
design already gives it. Changes for D: the tool (`workOf`, `finished`, `round-done` reading the round record's `scope`;
a `scope` field written by `state write round`), design part 3, section 1, build text 5 section 2, ARCH's starting text
(one clause).

## civicsmith ARCH #13 on D, step by step (24 Nov 2026, ~22:40Z)

Asked at the owner's word ("Yes, ask civicsmith's ARCH first", 24 Nov); answer passed on unchanged by coordinator #5. In
short (its words where quoted; measured: 78 requirements not yet met in 29 modules; the rest its judgment):

- The eight steps become "roughly 20 to 35 new or reworded requirements, roughly 25 to 40 placed flaws, about 15 or more
  module-list PRs of mine, and no mechanical edit planned". Most of step 3 (about 120 test files to about 20 owners) and
  step 8 is placed work, which D counts whatever the scope says.
- "Can a scope list name all of it? Yes, with four points": entries by requirement (`<module> R<n>`) where a module already
  holds unmet ones (control-plane 15, plane 7, journey-check 16); ARCH rewrites the scope during the tranche as it adds each
  step's requirements, so the tool must read it fresh at each `next-job` and `open`; a split moves requirement lines to a
  new module, so ARCH rewrites the scope in the same act; a met requirement reworded back to not yet met waits unless named.
- "D must reach `open --module` as well as next-job. A job's block must carry only in-scope requirements plus placed work,
  and the job's text must say that the other "[not yet met]" lines in its requirements file are not its work."
- "No step needs a job to change another module's files": step 3 is two merges, ARCH's module-list move, then the new
  owner's job.
- The order between steps is kept by when ARCH writes each step's work, not by the scope.
- Told jobs outside the scope: not measured; "a handful to a few dozen across the tranche"; starting them above the slot
  number "is acceptable to me. They carry only their notice, run only related tests, and are the guard on stability that
  the owner wants."
- "D is the right shape, because the scope belongs to the tranche and ends with it, while C and B would leave marks in the
  requirements files that outlive it."

So D as built must: read `round.scope` afresh in `workOf` (so `next-job`, `open --module`, `finished` and `round-done` all
honour it); write only in-scope requirements into a job block; and the job's starting text says the requirements its block
does not name are not its work. Not given by D, told to the owner: confirming stability before other work starts is his
halt kept on after the refactoring tranche merges (the next tranche opens with everything, and needs no approval of his).
