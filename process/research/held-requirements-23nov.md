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
