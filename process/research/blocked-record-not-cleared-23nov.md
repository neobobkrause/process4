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

## Options

- **A. No change (recommended unless the second case is measured).** The record ends by the blocking module's merge, as
  built; nothing has been seen to go wrong.
- **B. `push --unblocked`** rewrites the job's record to say it goes on, for the second case.
