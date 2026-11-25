# notify 1356 on 55db8e4 still tells 197: what makes "anything → stated" tell (25 Nov 2026, PROCESS #13)

Length: see file. Status: research; nothing put to the owner yet.

## What was reported

civicsmith ARCH #18 (to PROCESS #13 directly, 04:20Z, and through coordinator #9): `p4 notify 1356` on tool 55db8e45 (which
holds decision B of 25 Nov, "an unknown kind becoming known tells no one", PR 271) told 197 users; 90 listings changed; 178
entries tell. Counted from its printed output: only 2 of the 178 entries tell by `bound changed` alone with empty bounds
before; 176 carry another telling reason, nearly always `hands back differently`; every one of the 197 users' named uses
includes `hands back differently`; 3 users are told by named uses only, 10 only as "not followed fully", 184 by both. Its
fault, written once: "setup-words' localize and word each show 'hands back before: anything / hands back after: string' and
are reported 'hands back differently -> tells users'. Design part 2, section 7 ... says this should tell no one. The same
pattern appears in other entries (e.g. callsOf and extract: hands back before null)." Cost: about $1.40–$1.90 and 2 minutes
for each told job that closes with nothing to change; 197 queued from this merge.

## Reproduced (PROCESS #13, scratch product of two modules; the provider already has one commented entry and the merge
## changes one word elsewhere, so the first-comments exemption does not apply, as on 1356)

| Before → after (an entry with no comment → the same code with comments) | Tool says | Told |
|---|---|---|
| `f(k){return k}` → `@param {string} k @returns {string}` | nothing | none |
| table lookup, arrow const: the same | nothing | none |
| + `@throws {TypeError} when k is empty` (code already threw) | `hands back differently`; printed `handsBack anything → string, throws [TypeError]` | the user |
| + a first `@bound` line | `bound changed` | the user |
| `if(!k) return null; return k.x` → `@param {{x: string}\|undefined} k @returns {string\|null}` | `declaration changed (not classified)` | the user |
| `f(k, o = {})` → `@param {object} [o]` | `cannot stand in` (`{}` → `object`, a real narrowing by the rules) | the user |
| `f(k, o)` → `@param {object} [o]` | `accepts more` (confirmed) | none |

So `known()` works. Two separate causes make "anything → stated" tell:

1. **A first `@throws` (and a first `@bound`) is judged a change.** `diffListings` (tool/lib/notice/notice.mjs) pushes
   `hands back differently` when the `throws` lists differ, and `bound changed` when the bounds differ; an entry that stated
   none before has `[]`. The printout then shows the `accepts`/`handsBack` lines, which differ only by "anything → string",
   and not the throws, so it reads as decision B failing. By the design as written this is NOT a fault: decision B covers a
   kind read as "anything" becoming stated; "Any other difference in the same entry tells as before"; the error kinds are
   part of what is handed back (build text 2b §6; proof iteration 2); a bound line added is `bound changed` (decision 3).
   It is a cost of the rules on a product whose comments are being written for the first time.
2. **An implementation error against decision B: `unbracket` in `tool/lib/notice/ts.mjs` (`declarationsOf`) strips the
   brackets of any group holding `|` with no inner brackets — including a parameter list.** `export function f(_: { x:
   string; } | undefined): string | null;` prints as `export function f_: { x: string; } | undefined: string | null;`, so
   the declaration backstop (`knownDecl`) cannot line it up with `f(_: any): any` and reports `declaration changed (not
   classified)`, which tells. The structured comparison had found no change. Correction: `unbracket` leaves a parameter
   list's brackets alone (a group with a `:` at its own top level). This carries out decision B; it is not a new rule.

Not yet known: how 1356's 176 entries split between cause 1 (a first `@throws`; ARCH's "hands back differently") and cause 2
(which prints "declaration changed (not classified)", not seen in ARCH's summary), and what "hands back before null" is
(an inferred `null`, e.g. a JS stub whose only visible return is `null`, is a stated kind to the tool, not "anything", so
null → string tells by the rules). Asked ARCH #18 (04:27Z) for the exact blocks of localize, word, callsOf, extract.

## Options to put, once ARCH's quotes settle the split (with the narrowing of decision 2, as one group)

- A. No change.
- B. Correct cause 2 (`unbracket`), and print the throws before and after in a notice so the reason is visible. Carries out
  decision B; no rule changes.
- C. B, and a first `@throws` or first `@bound` on an entry that stated none before tells no one **where that entry's own
  running code is unchanged** (compared with comments left out, as the first-comments step already compares a module). Where
  the code changed too (1350's `registerDeclared`, which began to throw), it tells as now. Extends decision B; narrows where
  decision 3 applies to a bound that describes code that did not change.
- D. The narrowing of decision 2 (worker measuring): a user not followed fully is told of a changed function only where its
  files name it or reach the provider by a route the scan cannot read.

## The split, settled by ARCH #18's quotes (25 Nov ~04:36Z)

ARCH quoted the `notify 1356` blocks and `git show` of the declarations (merge 51436cfe89, first parent cf7a1adf9a). Before
1356, `word` and `localize` had plain prose comments with no tags, `callsOf` a `/* */` comment; after, each has `@param`,
`@returns`, a first `@throws {Error}` and (word, localize) a first `@bound`. "Function bodies of word and localize are
unchanged by 1356." The printed reasons: localize and word "accepts more, bound changed, hands back differently"; callsOf
and extract "hands back differently" with hands back `anything[]` → a stated list; no throws lines printed (the printout
did not print them). By the reproduction above, the "anything → stated" differences tell no one; what tells is the first
`@throws` (→ "hands back differently") and the first `@bound` (→ "bound changed"), on code that did not change. So cause 1
is essentially the whole of 1356's 197, and option C (a first `@throws` or `@bound` on an entry whose own running code is
unchanged tells no one) would have told none of them; cause 2 (the brackets) was not among 1356's printed reasons.
The printout now shows the kinds of error raised, the channel and "may now be missing" where they differ (PR 275).

## A module's first comments (membership, PR 1457) and options 2C, 2C+, 2D, measured (a worker of PROCESS #13, ~06:30Z)

The fault (civicsmith ARCH #19 via coordinator #9, 06:07Z, from membership #1): a module's first comments cannot be a step
of their own, because once a module has comments `check` reads its inferred kinds as stated and its own tests disagree (a
test indexing a nullable answer unguarded), so code changes in the same pull request and the first-comments exemption
(whole pull request comments-only) is lost; even comments alone told 140 users on civicsmith. ARCH #19 lands membership's
real fix and holds its comments meanwhile.

"Own running code unchanged" as built: a digest of the entry's declaration node with comments and grouping brackets left
out (`shapeOfNode` in `check.mjs`): a function declaration; a `const` statement; a class whole; a class member's own
declaration or its `this.x = ...` statement. It misses what the entry calls (a helper in the same module or another), state
it reads, what an import resolves to, a base class, patches made elsewhere. So "own code unchanged" is not "behaviour
unchanged".

- **Proof replay (150):** 2C changes 1 answer (Z19: `front` not told of a first `@bound` on `isEmail`, code unchanged; needs
  []); 2C+ the same 1; 2D changes 5 (P09, P12, X06, Y08, Z19), dropping 2 users, no hole by the proof's reading, but P09 is
  a real "newly refused" reached through a helper (`seededStore`'s own body unchanged, its helper `put` now throws). Of 175
  `bound changed` entries, 162 are on comment-only sorts (untouched by any option); of the 13 on code-bearing entries with
  code unchanged, 2C and 2C+ silence 1, 2D all 13 (decision 3 overridden for code-bearing entries).
- **A membership-shaped product (20 plain-JS users; a class with delegating statics, a `#private` field, inferred
  nullable kinds; first comments plus a one-line test fix):** told now 19; 2C 15; **2C+ 0**; 2D 0. What 2C leaves: two
  "accepts more, not confirmed" (a class with a `#private` field is nominal, so the checker never confirms it), and three
  `declaration changed (not classified)` (`this` → `Membership`; an inferred `{…} | null` → `Member | null`).
- **2C+** = 2C, and on an entry whose own code is unchanged, no declaration backstop and an "accepts more" not put to the
  checker. A helper change with a new `@throws` on the unchanged caller still tells (2D loses it). Caveat: an "accepts
  more" the checker would refuse, on unchanged code, is caught by the user's own check later, not by a notice.
- Cost: the digest is under 1% of a replay.
- Found along the way: rule 52 cannot confirm a class with a `#private` field; `unbracket` mangled an optional constructor parameter
  (`constructor_?:`; the worker ran before the 1B correction merged; to check against it); class members never list `@throws`.

Prototype (switch `P4_OWNCODE`): `first-comments-2c-25nov/prototype.diff`.

## More evidence, 09:02Z (civicsmith ARCH #22 via coordinator #9, unchanged)

"re-run of notify 1404 (jurisdictions #1, a comments-only pull request: every changed line of jurisdictions/index.mjs is
JSDoc, code identical with comments stripped) told about 150 modules, nearly all as "not followed fully" users, against
design part 2 section 7 (a module's first structured-comments step sends no notice). The first two told jobs, civil-time #2
(1538) and id-spaces #2 (1539), closed nothing-to-change for that reason, about $1.4-1.6 each. ... The notify queue I
inherited holds about 70 more old merges, many comments-carrying; at this rate each can start up to ~150 notice-only jobs."

PROCESS #13's reading: the first-comments exemption applies only to a module with no interface comments before (jurisdictions
likely had some). civicsmith runs 55db8e4, without 3B (narrowing for not-followed users), 1B or 4B; 3B alone removes a
not-followed user unless it names a changed function or reaches the provider unreadably, so much of the ~150 would likely go
(unmeasured on civicsmith). Choice 2C+ would cover a comments-only change on unchanged code. Exposure if unchanged: up to
~70 × ~150 × ~$1.5. Put to the owner as urgent: decide 2, move civicsmith now, and (his call) hold notice-only checks until moved.
