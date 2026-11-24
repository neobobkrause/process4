# Moving a product to a version whose required-run workflow changed (24 Nov 2026)

Written by PROCESS #11. A process fault from civicsmith ARCH #12, passed on unchanged by civicsmith coordinator #4 (~21:58Z):

> "Moving civicsmith from Process4 0eec86f to ac962e7 by one pull request (process.json and the new shims/module-tests.yml
> together) fails the required run: the new workflow fetches the tool at the version the BASE's process.json names
> (0eec86f), which has no `run verdict`, so the step exits 1 (run 45494899972). It passed as two pull requests in order:
> process.json first (old workflow, PR 1318), then the workflow copy (PR 1319). Design part 6 section 7 and ARCH's rule 6
> describe the move as one pull request setting the process config; the workflow replacement that a version change can
> carry is not ordered anywhere."

Nothing waits on it: civicsmith is moved. process3-probes made the same move in two pull requests (394 replaced the
workflow) without meeting it.

## The nature of it

The required run deliberately judges a pull request with the tool at the version the BASE names (build text 1, section
5), so a pull request cannot move the version that judges it. A move whose new version also changes the workflow copy
(as the update of 24 Nov did: the new workflow calls `run verdict`, which only the new tool has) therefore cannot land as
one pull request: the new workflow runs the old tool. In two pull requests in order — the process config first, judged by
the old workflow and old tool; then the workflow copy, judged by the new workflow and the new tool the base now names —
each passes. The texts (design part 6, section 7; ARCH's rule 6; build text 1b, command 25) say "the process config by
pull request" and nothing of the workflow copy, which the update's texts left to "replaced from `shims/`". So it is an
implementation error in the texts: measured once, recovered by ARCH, costing one failed run.

## Options

- **A. No change.** ARCH found the order itself; the next product or the next workflow change may meet it again.
- **B. Say the order (recommended).** Where the new version's `shims/module-tests.yml` differs from the product's copy,
  the move is two pull requests in order: the process config first, merged; then the workflow copy. One clause in design
  part 6, section 7, ARCH's rule 6 and build text 1b, command 25. Text only; no tool change; adds no test, gate, review or
  stop. Products receive it with their next move.
