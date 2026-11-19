# Research: close/ready/results fail from a job's detached checkout (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Source: a trial process fault, passed
unchanged along the design's path (the invoice job → ARCH → the coordinator → PROCESS;
design part 6, section 6), on the trial repository `neobobkrause/process3-probes`, found by
the invoice job in round 5 (pull request 361, product then on process4 `c6dec02`). The
owner asked that it reach PROCESS. Measured: it happened. Verified against the tool and the
job starting text at `process4` `main`.

## The fault, as reported

The invoice job (a told job that found nothing to change) ran, from a detached checkout,
`p4 close --branch job/invoice/8 --nothing-to-change "..."` and got back "no open pull
request for the current branch HEAD; name it by its number". `close` ignored `--branch`,
though `p4 open --branch job/invoice/8` accepted it. Naming the number (361) worked, so the
round went on. ARCH's note: a job session starts on the tranche branch, as the design says
(part 4, section 2), so a job's checkout begins **detached** unless the job checks out its
own branch — and a told job that finds nothing to change makes no commit, so it never does.

## Root cause

Round-4 fix C (the decision "Naming the pull request for a job's commands") made `ready`,
`results` and `close` default to "the current branch's one open pull request" when no
number is given. Its code (`prOf` in `tool/p4.mjs`) resolves the branch with
`git rev-parse --abbrev-ref HEAD`, which returns `HEAD` on a detached checkout; nothing is
found and it fails. The comment even says "which a job runs from its own branch" — but
that assumption is false for a told job that never checks out its branch. And unlike `open`
(which took `--branch` for exactly this, "fault o"), `close`/`ready`/`results` ignored
`--branch`. So fix C's convenience (close without looking up the number) does not reach the
job's actual starting state.

## Options (each corrects or clarifies; none adds a test, gate, review or stop — rule 2)

- **A — No change.** The job names the pull request number, as the trial did. Cost: it
  contradicts fix C's own intent (close/ready/results without the number), the job text
  names the bare forms, and every told-nothing-to-change job stumbles once. Measured cost,
  so not the default here (rule 6 applies to findings with nothing measured; this is
  measured).
- **B — (recommended) Make `close`/`ready`/`results` accept `--branch`, like `open`.**
  `prOf` uses `--branch <b>` when given (even on a detached checkout), else the current
  branch; on a detached checkout with neither a number nor `--branch`, it fails with a
  clear line naming both. The job text names `--branch <branch>` (the job knows its branch,
  filled in) on those commands. This corrects fix C's implementation to work from the job's
  real detached checkout and makes the three commands consistent with `open`. A tool
  correction plus a job-text line; no rule changes.
- **C — The job checks out its branch first.** Then the current-branch default works, and
  `push` works too. Cost: an extra step for a case B solves more simply, and a
  never-committed told job gains a needless checkout. B is preferred; C is a fallback.

## Recommendation

**B.** A measured fault; the fix is a pure correction that restores fix C's intent and
mirrors `open`'s existing `--branch` handling. It touches `tool/p4.mjs` (prOf + HELP), a
tool test, `starting_texts/job.md`, and the "Naming the pull request for a job's commands"
entry's rule-as-it-stands (rewritten in place, shown to the owner once; his quoted words
unchanged).
