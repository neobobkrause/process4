# Research: the civicsmith lane's nine points on starting an existing product (20 Nov 2026)

Recorded by PROCESS #5 before proposing (rule 3). Source: PROCESS civicsmith lane #1's message of
20 Nov 2026, grounds in `process/lanes/civicsmith/process-points.md` and its research on branch
`work/civicsmith-lane-research`. Checked against the design and build texts at `main`.

## Judged one by one (rule 6: unmeasured findings default to no change)

| # | Point | Measured? | Judgement |
|---|---|---|---|
| 1 | No named actor writes the first Process4 content (process.json, module list, workflow, forbidden-commands copy, `state write --create`) into an existing product | Yes, in effect: the trial needed build text 4's stage-1 session for exactly this | Correct: act 8's plain session also writes that first content, from a branch made from main |
| 2 | Acts 3 and 10 silent on an existing repository's old rules and checks | Yes: the trial's main still required `gate` | Correct: act 10 replaces any earlier required check with `module-tests` |
| 3 | Act 8 meets the product's old approvals; part 6 §2 names the coordinator as drafter, absent at act 8 | Partly (the drafting gap is textual) | Correct: at act 8 the plain session drafts the product's approvals; the unproven placing stays marked unproven |
| 4 | A product started while PROCESS runs is never connected | No | No change: build text 5 §4 has the owner seed a product's ROOT once; that is the route |
| 5 | "Not known: whether act 10 can be done before act 9" | Yes, the trial did it | Record the measured fact |
| 6 | "None of it has been carried out for Process4" | Yes, the trial did acts 1–10 | Record: carried out for the trial; unproven for a real product |
| 7 | autoMode names repositories by owner | No (inference) | No change; a conversion-plan check for the lane |
| 8 | Order against a pending account switch | No; the switch is done | No change |
| 9 | Build text 2 keeps a requirements file under 24,000 bytes; design says 60,000 on Claude Code | Textual contradiction; the design rules | Correct the build line to the design's figure |

## Options for the owner (as one group; none adds a test, gate, review or stop)

- **A — No change.** The lane's conversion plan carries 1–3 as civicsmith's own steps.
- **B — Correct what is measured or contradictory (recommended):** 1, 2, 3, 5, 6, 9 in design part 7 §4,
  part 6 §2 (one clause) and build text 2; no change for 4, 7, 8.
- **C — Only the recordings and the build-line fix:** 5, 6, 9.
