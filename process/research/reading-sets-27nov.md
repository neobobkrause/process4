# What each role reads, against the limits, after C & D and K1–K5 (27 Nov 2026, PROCESS #21)

Asked by the owner in PROCESS #21's session, 27 Nov: "Spawn a worker to study the handoff documents and determine
whether/if any of the documents are over their limits. For those that are, we need to research and understand how that
happened." Measured by a worker at 45181b8; its main figures checked by PROCESS (`wc -c`).

## What was measured
- **No single text is over 60,000 bytes.** Largest: design part 2 (`02-`), 30,109. Every "Length" header and last-section
  line is right. Every starting text is under 8,192 bytes with at most ten rules (five at ten).
- **The "Output too large" at PROCESS #21's start** was the Bash tool's display cap (~30,000 characters) on two files printed
  together (32,725 and 32,947 characters), not a document over a limit.
- **PROCESS's reading set:** 173,513 bytes without its starting text (99.2%); 179,585 with it, 4,585 over 175,000. The record
  ("What PROCESS reads in full", `design-decisions-2.md`, "Decision: B, (ii)", 25 Nov) counts the starting text; so does the
  25 Nov cleanup audit. `starting_texts/00-index.md` and `job-reading-27nov.md` do not.
- **ARCH:** 167,759 (95.9%), 173,116 with its starting text (98.9%), before the product's own texts it also reads (process
  config, ranking page, module list and others), which take it over in practice. Not yet studied. Every other role 76% or less.

## How it got there
1. "Decision: C & D" (27 Nov; fdb4e0d, pull request 403): `job-reading-27nov.md` said PROCESS's set would not change; the
   split added 3,287 bytes to the design, which PROCESS reads whole. That commit measured the sets and wrote "PROCESS's is
   over" in `starting_texts/00-index.md`.
2. Pull request 404, eight minutes later: the research index cut from 26,180 to 11,814 bytes (under "Decision: B, (ii)"),
   bringing the set without the starting text under.
3. "Decision: K1–K5" (pull request 406): design part 6 +320 bytes (read by every role), build text 1 +1,496, `P4_ROLE` in
   every starting text. No size check; `starting_texts/00-index.md`'s figures were left stale (it still says PROCESS is over).
4. Handover and research-index growth since left 1,487 bytes of room without the starting text.

## Option put to the owner
- 0. No change.
- Z. PROCESS reads the civicsmith lane's README only when a lane question arises (no lane is live), and keeps its handover
  under 3,000 bytes; `starting_texts/00-index.md`'s figures are corrected. About 173,500 bytes with the starting text.
  Removes reading; adds nothing. Text only (starting text, `starting_texts/00-index.md`, decision record).
Recommended: Z. ARCH's set is studied before anything is put to him on it.
