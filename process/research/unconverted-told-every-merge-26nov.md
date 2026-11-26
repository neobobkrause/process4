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
