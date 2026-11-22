# Points sent to PROCESS by the civicsmith lane

Length: 63 lines. Last section: "Sent 22 Nov 2026".

Each point is a place where a Process4 text is silent or out of date for moving an existing product.
The lane changes no Process4 text; PROCESS decides. None adds a test, check, gate, review or stop.
Grounds are in `research/starting-a-product.md` §5 (A1–A8) and `research/process4-for-a-product.md`.

## Sent 20 Nov 2026

1. **First Process4 content in an existing product has no named actor.** Part 7 §4 act 8 makes the
   tranche branch; nothing names who writes `process.json`, the module list, the required-run workflow
   and the forbidden-commands copy, or who runs `state write --create`, though ROOT's prompt needs
   `process.json` (A1).
2. **An existing repository's old rules.** Acts 3 and 10 are silent on old rulesets, required checks,
   workflows and secrets. Measured: the trial's main still required Process3's `gate`, which blocked the
   merge into main (research/tranche-unrelated-to-main-20nov.md) (A2).
3. **Act 8 meets the product's existing approvals.** Civicsmith's Process3 `CLAUDE.md` may forbid a
   session placing the new text; part 6 §2 marks this unproven and gives no route that keeps to "never
   edits a file" (part 1 §3). And part 6 §2 says the coordinator drafts a product's approvals, but at act
   8 no coordinator exists (A3, A3b).
4. **Registry when a product starts while PROCESS runs.** starting_texts/process.md line 20 seeds the
   registry only on PROCESS's start; root.md line 23 messages PROCESS only if `roles.process` names one.
   A new product's ROOT and a running PROCESS never meet unless the owner tells PROCESS (A4).
5. **Part 7 §4, "Not known: whether act 10 can be done before act 9"** — the trial did act 10 before
   act 9 (coordination/trial/setup_log_19nov.md lines 15, 22). Recording a measured fact (A5).
6. **Part 7 §4, "Unproven: none of it has been carried out for Process4"** — the trial carried out
   acts 1–10; "for a real product" is what remains unproven (A6).
7. **`autoMode` names repositories by owner.** If civicsmith's repository is not under the owner named in
   the environment's block, the check of part 7 §5 must catch it. Inference until the address is known (A7).
8. **Order against the pending account switch.** Part 7 §4 and build text 6 do not say whether a new
   product starts before or after a pending switch (A8).
9. **Requirements-file maximum.** build/02-the-forms.md line 98 says 24,000 bytes; design part 5 §2 sets
   the single-text maximum at 60,000 bytes on Claude Code (24,000 on Codex). The design rules (part 0 §5);
   the build line is out of date for Claude Code.

## PROCESS's judgement, 20 Nov 2026

PROCESS #5 judged the nine (`process/research/civicsmith-lane-points-20nov.md`) and puts them to the
owner as one group: correct 1, 2, 3, 5, 6, 9 (its recommended option B); no change for 4 (the owner
seeds a product's ROOT into PROCESS's registry once, build text 5 §4), 7 (carried as a check in the
conversion plan) and 8 (the account switch is done). Nothing for the lane to do until he chooses.

## Sent 21 Nov 2026

10. **A product whose approvals forbid placing new ones.** civicsmith-copy's approvals (1 Nov 2026)
    count changing `CLAUDE.md` or `.claude/settings.json` as changing permission settings, which they
    forbid; the commit that removed the earlier process says "Bob commits the new one himself"
    (research/civicsmith-copy-reading.md §4). Part 7 §4 act 8 has the set-up session place the
    approved text in a pull request the owner lands by his click; part 6 §2 marks that placing
    unproven. Here it is not unproven but forbidden by the product's own text. Part 1 §3 says no act
    asks the owner to edit a file. No route in the texts reaches civicsmith's first Process4 approvals.
    Measured from the product's text, not from a refusal.

## Sent 22 Nov 2026

11. **Who merges act 8's first-files pull request into main.** Design part 7 §4 act 8 has the set-up
    session write the first Process4 files "by pull request into main", and says nothing of who merges
    it. civicsmith-copy's approvals let sessions merge into the tranche branch, and the tranche branch
    into main, but not a working branch into main, and its deny list blocks the other merge routes. So
    the set-up session could not merge it; the owner merged civicsmith-copy #1119 by his click on
    22 Nov 2026 (research/setup-session-report.md §1). Measured on civicsmith, not from a refusal.
    PROCESS puts options to the owner after civicsmith starts.
