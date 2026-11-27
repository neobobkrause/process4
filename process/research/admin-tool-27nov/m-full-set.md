# Part M: the owner's criterion, and the full set (27 Nov 2026, PROCESS #21)

The owner, 27 Nov (conversation): "Why are you suggesting that some would only be later on my word? Why aren't you
recommending them for inclusion now? Are you only looking for opportunities that address a known failure? Because I'm hoping
to expand the set of load-bearing opportunity to include every aspect of the development process that this tool could
support reliably and that would be at least as efficient/fast as the AI-based function it would replace."

## Why part L held items back, and why that was wrong
Part L took "load-bearing" to mean "answers a recorded failure", from the rules "caution is a cost, paid only against a
measured failure or your word" and "a finding with nothing measured behind it gets no change". Those rules bound adding
caution: a test, gate, review or stop. Moving a mechanical function from an AI session to the tool is not caution; it
removes work an AI does unreliably (design part 4 §1 already gives the tool "whatever has one right answer"). So the bar was
misapplied. Under his criterion an item is in when (1) it has one right answer the tool can compute from records, GitHub or
the harness's own replies, and (2) a tool call does at least the work of the AI function it replaces. (2) is by
construction (a call replaces model turns of reading and reasoning), not measured: no timing is taken, at his word.

## The 22, re-sorted
All 22 meet (1) and (2). Conditions, not exclusions:
- Hooks (B2, B3, E2): reliability in Process4's cloud sessions is not yet seen; process3 recorded hooks lost after a resume
  and not run in some folders (K). B4 reads the same facts from the session list, so a missed hook is caught.
- Gates (A5 the tool obeys his stop, B3 a stop hook, C3 sizes measured): each crosses the no-new-checks rule and needs his
  explicit word. B3 as designed lets a turn end whenever his stop stands or nothing is owed, which answers the harm process3
  recorded ("held sessions against your stop"); the harness also caps it at eight blocks in a row (J).
- E1 Cloudflare becomes load-bearing for the full set: the ledger, dashboard and relays outgrow GitHub's comments (a
  civicsmith-sized state reached 1.17 MB in the build, I) and its write budget (part G).

## Six more, from parts A and B, not in the review document's 22
- F1 roles, names and generations (A4): the tool computes each session's standard name and generation and resolves a role
  to its session; today each session does it from the records by hand.
- F2 replacing a session (A5, B10, B11): the tool counts a job's failed runs and says "replace now" at the third and "record
  blocked" at the fifth, gives the parent the replacement's brief and branch, and tells a role at its refresh what its
  successor needs started (the fill level is read by the session and passed in).
- F3 walks (B13): the tool shares a round's areas among walking sessions, tracks each walker, and tallies flaws and
  observations from the walk issue; naming the areas stays ARCH's.
- F4 the round's and tranche's phase (B14): what comes next (jobs, internal walk, deployment, external walk, tranche end),
  computed from the records, with the release preparation's steps and what is done.
- F5 the mechanical edit and the dropped tranche (B15): the tool lists the edit's modules and runs the drop's steps (it
  already makes the drop's files).
- F6 version moves and account switches (design part 6 §7; build text 6): the tool prints each move's or switch's steps and
  which are done.
All six meet (1) and (2); none adds a check.

## What stays with AI
Where a flaw belongs; interface decisions; a lane's design; walk areas; whether a walk finding is a flaw; plain words to
the owner; whatever his charter leaves open.
