# A job's blocked record is not cleared when it goes on

Written by PROCESS #9, 23 Nov 2026. From civicsmith setup-words #1, via ARCH #8 and coordinator #4, 05:44Z: "the blocked
record was not cleared. The `push` without --blocked did not rewrite the job's record; the PR's process4-job-record
comment still says blocked by documents. No command a job may use clears it (push only writes with --blocked; close
--nothing-to-change would close the PR). The tool will read this PR as blocked until the record is rewritten."

## What the tool does (read at main)

The record is never meant to be cleared. `blockOf` (`tool/lib/round.mjs`) reads a blocked record as holding only until
each blocking module has a job merged after the record was written; then the job is "ready again", `next-job` hands it
out once (`restarted`), and from then on the round shows it open (`moduleStates`). So once documents has merged after the
block, the tool does not read setup-words as blocked, whatever the comment still says.

There is one case where the job's point stands: a job that finds it is no longer blocked while the blocking module has
not merged (for example, it found another way). Then the tool reads it blocked until that module merges, and no command
lets the job say otherwise. Not known which case this was; asked of civicsmith's coordinator.

## Measured: the second case, three times

civicsmith ARCH #8's answer, via coordinator #4, 05:53Z: "No: documents had no job merged after setup-words' block.
setup-words went on because ARCH changed the module list (PR 1161, merged 05:19Z), giving words.json to setup-words,
which removed the blocking module from the matter; ARCH then told the job to go on, and it merged as PR 1152. So this is
the case with no command: a block cleared by a list change, not by the blocking module's merge. The same arose on
pdf-worker (PR 1156) and ocr-worker (PR 1157), blocked by release and released by ARCH's rewritten decision (PR 1163);
all three have now merged, so their records no longer hold anything open, and ARCH filled slots by hand meanwhile because
next-job counted those open jobs as free."

So a block can end by ARCH's decision (a list change, a rewritten interface decision), which the design already provides
for (part 2, section 8: ARCH corrects the order, the module list or the boundary). The tool knows only the merge ending.
While such a job works on, the round shows it blocked and `next-job` counts its slot as free, so more jobs start than
the slot number allows; ARCH worked round it by hand.

## Options

- **A. No change.** Each such case leaves the round wrong and the slot count high until the job merges.
- **B. `push --unblocked` (recommended).** When the job goes on, it pushes with `--unblocked`, and the tool rewrites the
  job's own record to say so (`{ "unblocked": "<why>" }`), so the round shows it open and its slot used. One writer
  still: the job. The job's starting text names the new flag beside `--blocked`. Adds no test, gate, review or stop.

## Outcome

The owner chose B, 23 Nov 2026 ("Decision: B", a comment on his page). Built with a test; entry "A job whose block ARCH
ended says it goes on" in `design-decisions-2.md`.
