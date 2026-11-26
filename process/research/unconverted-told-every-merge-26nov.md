# Every non-conversion merge tells every unconverted module (26 Nov 2026)

Raised by the owner, 26 Nov ~22:15Z, relaying civicsmith's coordinator: "Every merge so far has told 199 modules:
those not yet under the coding standard hear of any change, even when no item changed. The five open jobs each got
three notices."

## What happened (read from civicsmith ARCH's own session, 26 Nov ~22:15Z)

- After the account switch civicsmith runs on Process4 5948442. ARCH merged three jobs that were **not conversions**:
  setup-words (PR 1706, a stale list rebuilt), jurisdictions (1707, seven bugs fixed), calc-grammar (1708, two bugs
  fixed, one declared change). Each is an already-converted early module doing ordinary work.
- Each merge told 199 modules: every later module whose conversion has not merged. The five open conversion jobs each
  got three notices in their job blocks; case-checker's merge (1710) was refused because notices reached it after its
  tests ran. The notice comments are very large; ARCH's `open` for id-spaces ran slowly reading them. The coordinator
  reports "199 follow-up checks" queued.

## Why (the design as written; no tool fault)

- Design part 2 §7, point 3: on any change to a provider's code or tests, whether or not an item changed, each later
  module with a place outside the standard that may refer to it, or with no uses file yet, is told. Rule 2 for the
  tool: where it cannot say which modules a place may refer to, every earlier one. Unconverted civicsmith modules carry
  thousands of such places (first-pass figures: 14,318 places before conversion), so each is told of every change to
  every earlier module. `tool/lib/notice/notice.mjs` (~623-760) does exactly this.
- A conversion's merge tells no one (10164fb); ordinary merges still tell by point 3.
- `round.mjs` `workOf`: an unconverted module's only work is its conversion; its notices wait in waiting work for the
  next job. So after each module's conversion merges, its waiting notices make a **told job**: about 199 extra jobs for
  the sweep, whatever the number of ordinary merges (the notices pile into one told job per module), plus notices to
  open conversion jobs that hold their merges.

## What it buys

A told job after a conversion re-checks a change made to an earlier module before the conversion. But the conversion
itself works on the tranche's newest code (the tool brings its branch up to the tranche before its tests), so a
conversion that runs its tests has already run them on the changed provider; one that changes no running code runs
none. Nothing measured shows a provider's bug fix breaking an unconverted user. Measured: three merges, 199 modules
told each, one merge held, ~199 told jobs queued, slow `open`.

## Options

- **0. No change.** About 199 told jobs after the sweep, each reading its notices and running related tests; open
  conversion jobs keep receiving notices that hold their merges; notice comments stay large.
- **A. A module whose conversion has not merged is not told by point 3; its conversion settles what waits for it.**
  Point 3 (and point 4's "each module with no uses file yet") tells no module before its conversion merges; a
  conversion's merge clears the notices already waiting for its module. Removes the told jobs and the merge holds;
  adds nothing. Risk: a provider change that breaks an unconverted module whose conversion changes no running code is
  caught only by that module's next job or a walk (nothing measured behind it). Text: design part 2 §7 (points 3-4,
  "Not telling the others is safe"), build text 1b command 11, build text 5 §6; tool: notice.mjs, the waiting-work
  clearing at a conversion's merge; ARCH's starting text unchanged.
- **B. Hold ordinary work until the sweep ends** (the owner's earlier "conversions only"): ARCH places no non-conversion
  work while unconverted modules remain. No tool change; but the round's scope cannot express "conversions only"
  (scope names requirements or whole modules), and it delays bug fixes for the whole sweep.

Recommended: A. It costs one small tool change and text, and removes ~199 jobs and the merge holds at civicsmith's size.

## Then: the notices could not be written (process fault from civicsmith ARCH #32, 26 Nov ~22:18Z)

Passed unchanged by civicsmith coordinator #14. ARCH ran `p4 notify` for 1706, 1707 and 1708 at once, each in the
background. Each found no item's means changed, told the 199 modules by point 3, wrote the notice into the five open
jobs' blocks, then failed: "GitHub refused: gh: You have exceeded a secondary rate limit and have been temporarily
blocked from content creation ... (HTTP 403); nobody is told; the notice for pull request <n> is owed". Each run's
output was 95-111 MB. `p4 open --module id-spaces` then failed the same way; the tool's four retries did not get past
it. The block is on the sessions' GitHub account, so it reaches every repository that account writes, Process4's
included (PROCESS #20's own `p4 open` stalled at the same time). Effect: three notices owed; id-spaces cannot open.
ARCH will re-run the owed notifies one at a time once the block lifts.

Bearing on the options: the writes that tripped the limit are the 199-module notices themselves. Option A removes
them (no module is told before its conversion), so the fault does not recur and the three owed notices need not be
sent (each told only unconverted modules; the open jobs already have theirs). Under option 0 the tool would also need
to write such notices within GitHub's content-creation limits, a second change; with A, nothing more.

## A third report: R1 notes kept for Node features the tool does not know (runtime-limits #2, PR 1712, via ARCH #32)

Its words: "the uses file keeps R1 places with mayRefer "*" (tokens.mjs:53; runtime-limits.test.mjs:219, 222, 223)
that exist only because the tool's description of Node lacks crypto.subtle and process.cpuUsage. Build text 2c says a
note that stands only for such a gap is not kept. The matching S4 notes are dropped, but these R1 notes are kept and
tell this module of every earlier module's change. Second, possibly a fault: p4 test's record write gave up on
GitHub's secondary rate limit rather than waiting it out." Its tests passed twice (60/0); both record writes refused.

Read in the tool: `refs.mjs:998` marks the checker's S4 note `unknownHost` where the gap is the host's (`hostGap`),
and `usescmd.mjs:51` leaves `unknownHost` places out of the file; but the R1 place for the value of `any` type that
the missing property yields is made without `unknownHost` (`place`, `refs.mjs:366`), so it is kept with mayRefer
["*"]. A tool fault against the owner's decision of 26 Nov (ee2091f: the tool's notes on Node features it does not
know are not kept). Unlike A, it lasts after the sweep: a converted module keeping such a note is told by point 3 of
every earlier module's change.

- **H. Carry the gap through.** An R1 (or other) place whose `any` comes only from a host gap is `unknownHost` too, and
  not kept. Small; no text change (build text 2c already says it). Recommended, with A, G1, G2.
The second point (the record write refused by the secondary limit) is G2 of `github-limits-26nov.md`.
