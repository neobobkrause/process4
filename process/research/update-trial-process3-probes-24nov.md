# The update's trial on process3-probes, 24 Nov 2026

Written by PROCESS #11 from process3-probes ARCH #4's account (its session's last result, ~21:43Z) and coordinator #4's
answer to PROCESS (~21:47Z; mechanics read from the repository, tool behaviour relayed from ARCH in its words). The owner
started it by two lines in the coordinator's session and reported "trial completed successfully".

## What ran, on Process4 6b47107

- The move: every session refreshed onto the new version; the workflow copy `.github/workflows/module-tests.yml` replaced
  from `shims/module-tests.yml` (PR 394) before the jobs ran, byte for byte.
- Two made-up requirements: tax gained an exempt flag (PR 398, job tax #7); invoice a tax-rate label (PR 399, job invoice #14).
- Each job ran `p4 test`; each pull request carries a `process4-test-record` comment that stands at its head (tax: 27
  passed, whole module, notice 0; invoice: 29 passed, whole module, notice 1). GitHub's `module-tests` ran as the new one
  job, `run verdict`, a few seconds, no tests on GitHub; the scope-nothing pull requests 396 and 397 passed at once.
- Merge that waits: `p4 merge 399` while tax's job was open printed `waits for tax (pull request 398)` and merged nothing.
- Told while open: `notify 398` told exactly invoice and added the notice to its open job's block; the job found nothing
  to change, ran `p4 test` again (record rewritten at notice 1), and then merged.
- No process fault, no refusal by the permission checker, no unexpected tool error.

## Seen, and no change (nothing measured against them)

1. invoice's test helpers (`errorOf(() => ...)`, values of unknown kind in its test file) made it "not followed fully" for
   tax, so it is told on any change to tax's listing (build text 5, section 6, cause 2). By design; the reason was cut at
   six places with "and 14 more", the fold-in working as built.
2. `next-job` writes the round entry with `"pull_request": null`, and `open --module` does not write the number back; ARCH
   reconciled it by hand at round close. It affected nothing: merge, round-done and the wait read GitHub's own pull
   requests. Rule 6: no change by default.

## Proven by it, and not

Proven once, on a small product: the test record path end to end, the verdict on real GitHub, the merge wait, a notice
reaching an open job. Not shown: the re-run `p4 test` asks for after a pass (not reported either way); a test run near two
hours; a told job's related scope (both jobs were ordinary, whole module); a told job starting above the slot number; the
mended check on real code with `require` or own-name imports (civicsmith's read-only count, brief beside this file).
