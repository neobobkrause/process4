# Research: round-4 trial faults and the B/A/C fixes (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Source: the owner pasted the trial
coordinator's current "Faults in the process" list (5 items) on 19 Nov. Verified
against the tool and texts at `process4` `main` (`02db068`). Each finding judged by
the rule: correct what is broken, minimally; add no test, gate, review or stop to
the process.

## The owner's five pasted faults — status

1. **`close`/`ready` want the PR number; recurs ("not fixed at 6be2618"; invoice
   hit it again; units hit it with `ready`).** Open. Earlier I called this "no
   change"; that was wrong — it recurs and costs each told job a step, and tax's
   first required run failed on it. **Fix C** (below).
2. **The new `check` fails tests that pass wrong types on purpose** (units, tax
   had to retype refusal tests; tax's run failed on the check, not behaviour).
   New and more serious. **Fault D** — needs research and an owner decision,
   because it changes how the two approved refusals behave and the design says the
   check reads test files (design part 2, section 59). Not fixed here.
3. **ROOT cannot start PROCESS (cross-repo).** Addressed by the approvals the
   owner merged (File A = PR #12; File B in `process3-probes`). Pending
   confirmation when ROOT next tries; unproven ground. No tool/text change.
4. **Coordinator can't write a relayed standing-note instruction.** This is the
   fault earlier numbered 7. Fixed in PR #13, merged to `main`. The trial gets it
   on moving onto `02db068`.
5. **Job text names the ranking page, not the ARCH decisions record.** Earlier
   numbered 8. Fixed in PR #13, merged. The trial gets it on moving onto
   `02db068`.

So of the five, two were already fixed (merged), one is addressed by the
approvals edits, and two remain: C (fixed here) and D (to research).

## The fixes prepared here (B, A, C)

Grouped and considered together (design part 6, section 7). None adds a test,
gate, review or stop to the process.

### B — PROCESS starting-text clarification (`starting_texts/process.md`, rule 8)

Cause: the first PROCESS session (this one) told the owner it could not merge,
from a single refused **direct** `gh` command, without testing the tool's own path
(`node tool/p4.mjs`), which works. Correction: one clause in rule 8 — the tool
reaches GitHub through `node`, so a refused direct `gh`/git command is expected,
not the tool being blocked; verify an act with the tool before reporting it cannot
be done. A clarification, not a new rule (still ten rules, 4,090 bytes).

### A — the required check's name is repo-aware (`config.mjs`, `round.mjs`, `commands.mjs`)

Cause: the tool hard-coded the required check as the product's `module-tests`, so
`results`/`failed-runs`/`ready` misreported on the process repo's own pull
requests (whose check is `tool-tests`) — which reinforced B's mistake. Fix: a
`requiredCheck(root)` helper — `tool-tests` when the repo holds the tool
(`tool/p4.mjs`), else `module-tests` — used by `ready`, `results` and
`failed-runs`; `failedRuns` takes the name as a parameter. `merge` is unaffected
(it never read the check name; it relies on GitHub's branch protection), so
merging already worked. Low impact, but the tool should report its own repo's
check correctly.

### C — `ready`/`results`/`close` default to the job's one open pull request (`p4.mjs`)

Cause: the job starting text's bare forms (`ready`, `close --nothing-to-change`)
don't carry the PR number the tool required, so each told job stumbled once. Fix:
when no number is given, these three resolve the one open pull request of the
current branch (a job has exactly one). `merge`, `failed-runs` and `notify` still
require a number (ARCH runs them, not from the job's branch).

Tests: 85/85 pass, including three new tests for A (check name per repo) and C
(`ready`/`close` with no number).

## Still to settle with the owner

- His approving words for B, A and C, recorded in `process/design-decisions.md`
  (exact, dated), in the same step as the merge.
- **Fault D** — I will research it and bring options; it changes an approved
  refusal, so the choice is his.
- Whether to take HELP wording updates for the now-optional `<pr>` (cosmetic; left
  as-is for now).
