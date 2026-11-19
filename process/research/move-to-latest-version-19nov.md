# Research: a one-instruction "move this product to the latest Process4 version" (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Need, from the owner (19 Nov): a
straightforward way to tell the coordinator to transition a product's development to
the latest Process4 version and have the details handled without further owner
involvement — no commit id to look up, no orchestration by hand.

## How a version move works today (and why it's clunky)

- A product pins one Process4 version in its `process.json` (design part 6, section
  5; part 3, section 1: one fixed version per tranche). Moving versions = editing
  that pin to a new commit id.
- The move needs the owner's prior approval (part 6, section 7; rule 5), and ARCH
  makes it "by the means PROCESS proposes." In practice: owner's Decision to the
  coordinator → ARCH edits `process.json` by PR → ROOT refreshes the sessions (this
  is how c6dec02 was done, PR 354).
- Frictions the owner hit: (1) he must name the exact commit id; (2) he must pick the
  right session (he told ROOT; the front door is the coordinator); (3) it reads as
  several manual steps rather than one instruction.

Nothing here is broken in correctness — ROOT was right to refuse to edit
`process.json` or re-pin itself. The gap is ergonomics: the frictions above.

## Proposed mechanism (recommended)

A named operation: **"move <product> to the latest Process4 version."**

1. **The owner, in the coordinator's session (his front door), types one line:**
   `Decision: move <product> to the latest Process4 version` (or `Instruction:`).
   No commit id. That one line is his prior approval (part 6, section 7).
2. **The coordinator** records his words in the product decision record and tells
   ARCH to move to latest. It needs no commit id from him.
3. **ARCH resolves "latest"** = the current tip of the process repository's `main`
   (which only ever holds merged, tool-tests-passed process changes), updates
   `process.json` to that commit id by pull request, and merges it.
4. **The sessions refresh onto the new version:** ROOT refreshes the standing roles
   (they re-fetch the tool copy at the new commit), by the means it already uses for
   a refresh; ARCH restarts any open job from its branch on the new version.
5. **The coordinator confirms** to the owner in one line on the standing page when
   every session is on the new version. No further involvement.

**Timing / "one version per tranche" (part 3, section 1).** ARCH chooses the
least-disruptive means (rule 5), without troubling the owner: if no job is open, it
moves at once; if jobs are open, it moves at the next round boundary, or — when the
owner's instruction says "now" — stops and restarts the open jobs from their
branches on the new version (the same shape as the approvals-edit restart, part 4,
section 7). The design should say a version move normally lands at a round/tranche
boundary and that ARCH makes it lose no work.

## What this change touches

- **Design:** part 6, section 7 / rule 5 (name this as the proposed means); part 3,
  section 1 (a version move lands at a boundary / loses no work); a line in the
  coordinator's and ARCH's roles (part 4, section 9/10) that "move to latest" is an
  instruction the coordinator records and ARCH carries out.
- **Tool (small):** a helper so ARCH resolves "latest" without a commit id — e.g.
  `latest-version`, printing the newest `main` commit of the process repository it
  already reads; plus `process.json` being updated through the tool's ordinary PR
  path. No new test, gate, review or stop; it removes steps.
- **Starting texts (minimal, within the 10-rule / 4,096-byte limits):** the
  coordinator's rule 6 (the instructions it records and relays) gains "a move to the
  latest Process4 version"; ARCH's text gains the "move to latest" action.

## Checks against the rules

- Rule 2: this **removes** friction and steps; it adds no test, gate, review or stop.
- Rule 5 / part 6 section 7: the owner's one line is his prior approval; ARCH makes
  the least-disruptive move — exactly what rule 5 asks PROCESS to define.
- The version stays pinned in `process.json`; "latest" resolves only to merged,
  tested process commits; one-version-per-tranche is preserved by landing the move at
  a boundary.

## Options for the owner

- **A — No change.** Keep the two-step (owner names the commit to the coordinator;
  ARCH + ROOT do the rest). Works; but keeps the commit-id and multi-step friction.
- **B — Build the mechanism above (recommended).** One instruction to the
  coordinator, "latest" auto-resolved, the chain run to completion, no further
  involvement.
- **C — B, but the owner may still name a specific version** when he wants a pin
  other than latest (keeps both: "latest" by default, a named commit when given).

Recommendation: **C** (B's convenience, with the option to pin a specific version).
To settle with the owner: his marked choice, recorded verbatim; then PROCESS builds
it as one process change (design + the small tool helper + the two text lines).
