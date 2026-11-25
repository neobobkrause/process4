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
