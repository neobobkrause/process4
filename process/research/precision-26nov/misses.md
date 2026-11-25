# The 16 users the notice missed on the converted proof: what should have caught each (26 Nov 2026)

Status: research for PROCESS #17, by a worker, on branch `work/decision-c-misses` from `work/decision-c-measure`
(itself from `work/decision-c` at 3338a4c). Nothing in the tool, the design or the build texts is changed. The runs
below were made on scratch copies of the converted proof and of the tool; the research copy is untouched.

## Summary

| Miss | Cause | Verdict | What should catch it |
|---|---|---|---|
| X09, Y06, Z04, V03 billing | meter's program moves refusals to standard error; `startMeter` not updated | (c), and (b) | the meter's own tests at its interface (design 2 §6, §7); the stream in `startMeter`'s means over its closure (build 5 §6) |
| W01, U05 billing | meter's program needs a start argument or an environment value; `startMeter` not updated | (c), and (b) | the same; start arguments and settings (build 5 §6, R12) |
| Z03, U04, T09, W02, T05 billing | meter's program frames its output differently (blank lines, indented JSON, a ready line) | (c); for the notice alone, (a) | the meter's own tests at its interface; nothing in the means carries framing |
| U08, T07 billing | two same-kind parameters swap places | (c) | R13 (own named kinds) and the declared change of meaning (design 2 §7) |
| A14 front | bookings relabels money's `Amount` as its own `Price` | (b) | S4: "A value of another module's type is never relabelled as an own type" |
| X03 front | front's test builds a `Clock`; `Clock.now`'s bound changed | (b) | a conversion "refers to both types" (2c); the means is the stated type expanded (design 2 §7) |
| X01 billing | `formatAmount` gains an optional parameter; billing hands it to `map` | (a) | none: rule 7 lets it through |

(a) a gap in the design, (b) a fault in the tool, (c) the proof not doing what the process does.

With every tool correction below on together, the proof misses 1 (A14) and tells 6 more users without need (281 to
287); with A14's setup kept to S4 as well, it misses none.

## How it was shown

- **Declarations.** Each of the 16 changes re-run with the `meaning` entry the rules would ask for (`startMeter` for the
  11 meter changes, `Bookings.quote` for U08, `createBookings` for T07, `formatAmount` for X01, `Clock` for X03,
  `Amount` for A14): 15 of 16 users are told; A14's front is not (it names no item of money). Two users more are told
  without need (T07: front and reports, which call `createBookings` but hand in no price function).
- **The meter's interface.** A test of the meter's two requirements through `startMeter` (one reading per use, then
  done; a use outside the bound gets a refusal) passes before and **fails on all 11** meter changes. Z03 finished as the
  meter's job would (the change plus `startMeter` skipping blank lines): the test and billing's own tests pass, so
  billing needs no notice at all.
- **Tool corrections, patched into a scratch copy of the tool and measured on all 150 changes** (`measure.mjs`):

| Patch | What it changes | Missed | Told without need |
|---|---|---|---|
| none | | 16 | 281 |
| P1 | `means.mjs`: a file of the module named by a literal (`new URL('./worker.mjs', import.meta.url)`) is in the closure with what it imports and its start-up code; `env.X` and `argv` imported from `node:process` read as a setting and start arguments | 10 | 283 (X10, V07) |
| P1 + P1B | and a started program's running code (a digest) among its starter's channels | 5 | 285 (and T14, T15) |
| P2 | `notice.mjs`: a use that builds a kind (conversion, write, construct) matches a change to any of its members | 15 | 281 |
| P3 | `notice.mjs`: a function confirmed to accept more still tells a user whose file records handing it on (`pass on`) | 15 | 281 |
| P4 | `canon.mjs`: parameter names kept; a parameter renamed by position (both sides named) cannot stand in | 14 | 283 (T07 front, reports) |
| all five | | 1 (A14) | 287 |
| all five, A14's `Price` written as `@typedef {Amount} Price` | | 0 | 287 |

None of these adds a test, gate, review or stop: they change only what the notice reads.

## 1. The meter's program (11)

On the converted copy billing reaches the meter only through `startMeter` (S6), and `startMeter` reads the program's
standard output itself. Each change was rebased from the original, where billing spawned and parsed the program; here it
changes the program and leaves `startMeter` as it was. So every one of the 11 breaks **the meter's own exported item**:
refusals no longer reach `onMessage` (X09, Y06, Z04, V03), `JSON.parse('')` or `JSON.parse('{')` throws inside
`startMeter` (Z03, U04, T09, W02, T05), or the program stops at once (W01, U05). The meter's converted tests run the
program by path and never call `startMeter`, so they pass.

**What the design says.**

- "Every requirement is tested at the module's interface" (design 2 §6). "What it does not cover is an accidental
  change of meaning under the same means: that is a bug in the provider, caught first by the provider's own tests"
  (design 2 §7). The meter's interface is `startMeter` and its message kinds; its tests should call `startMeter`.
- "the owner's change updates it in the same pull request (its own tests run it), and the user's code, which names only
  the owner's typed entry, is unaffected, or, where that entry's kinds change, is A0" (`study-changes.md` §2.6, class S,
  which names all 11).
- Where the change to the program is deliberate and does change what `startMeter` does (refusals now elsewhere), it is
  "a change of meaning under the same means … the job declares each in its pull request" (design 2 §7).
- The means' computed part includes "files, tables, settings, streams and start arguments", worked out "over its
  closure", and the closure adds "a file named by a literal" (build text 5 §6). The tool leaves that file out on purpose:
  "A file of the module that only runs as a program of its own (started by path) is not among them" (`tool/lib/notice/
  means.mjs`, comment at line 516). It also reads a setting only as `process.env.X`, not `env.X` imported from
  `node:process` (U05). That is a fault against build text 5 §6: with P1, `startMeter` gains "writes standard error"
  (X09, Y06, Z04, V03), "start arguments" (W01) and "setting METER_CURRENCY" (U05), and billing is told.
- Framing is in the study's M8 ("which message kinds on which stream, framing", `study-changes.md` §2.2) but not in build
  text 5 §6, and build text 2 §9 item 3 leaves "Messages between two separately running parts" unsettled. Nothing the
  tool computes changes when the program writes a blank line or indents its JSON on the same stream.

**Verdict.** (c) for all 11: the proof neither tests the meter at its interface nor finishes the change as the job
would. In the process the meter's job could not pass its own tests with `startMeter` broken; it fixes `startMeter`
(then billing needs nothing, as Z03 shows) or changes `startMeter`'s kinds (then billing is told, A0). (b) besides for
the 6 whose streams or start-up change, which the rules put in `startMeter`'s means.

**Options, smallest first.**

1. **No change to the texts; correct the tool's closure (P1).** Follows build text 5 §6 as written. Catches 6 of 11;
   +2 told without need (X10: the program gains a timer; V07: a write with a callback). The 5 framing changes still
   rest on the meter's own interface tests.
2. **P1 and a program's code in its starter's means (P1B).** A rule for build text 5 §6: for a starter, the running
   code of the program it starts is part of its means (M8's "framing" has no other computable form). Catches 11 of 11;
   +4 (X10, V07, T14, T15). Every change to the program's running code tells the starter's users.
3. **Framing as a bound line on the `@message` kind** (rule 3). Catches only where the job rewords the line; not
   certain. Not recommended.
4. **No change at all.** Rests on each provider's job testing its start function, a duty held by instructions that
   nothing measures (design 2 §6). Where a job skips it, billing breaks unseen until its next job or a walk.

Recommended: 1 (a correction), and 2 if the owner wants the notice to cover a provider that does not test its starter.

## 2. Two parameters of the same kind swap places (2)

U08: `Bookings.quote(room, party, nights)` becomes `(room, nights, party)`; T07: the price function `createBookings`
accepts is asked `(nights, party)` where it was asked `(party, nights)`. Both are `number, number` before and after; the
tool's form keeps no parameter names. Both titles state the new order as the aim.

**What the design says.** R13: "A value a user could confuse with another of the same base type (nights and party size,
cents and euros) has its own named type, made only in its owner module" (2c). Design 2 §7: "Where a type can carry the
new meaning, the job changes the item's stated type", and a deliberate change of meaning is named by ARCH and declared by
the job. `changes.md` §1.1: "same-kind arguments swapped change the meaning of every call (U08)".

**Verdict.** (c): the conversion kept no R13 kinds and the changes carry no declaration. With the declaration both are
told (shown above). R13 is judgement (which values a user could confuse); nothing finds a breach.

**Options.**

1. **Parameter names in the means (P4).** Where both sides name a parameter, a different name at a place cannot stand
   in. Both told; +2 (T07: front and reports). A plain rename tells (needless); a swap that keeps the old names is not
   seen (an accidental bug, for the provider's tests). Tool only.
2. **R13 kept** (brands `Nights`, `PartySize`): certain through the checker. Cost: a kind per meaningful value in each
   module's conversion, and every user builds them through the owner's maker (`study-changes.md` §2.5 judges it the
   largest cost after S4).
3. **No change.** Rests on ARCH naming and the job declaring a deliberate swap; an unnamed one breaks the user unseen.

Recommended: 1, with 2 as the certain route where the owner wants it.

## 3. A14: a kind relabelled in the middle

Bookings writes `Price`, a hand-written copy of money's `Amount`, and hands `Amount` values out as `Price`. Front reads
`Price` (through the door), so its uses file names only bookings' `Price`. Money renames `cents`; bookings is told (its
uses file records the conversion `Amount` to `Price`), front is not.

**What the design says.** S4: "A value of another module's type is never relabelled as an own type"; S13: a restated
fact is obtained from its owner or marked. S4 is read "from the checker's types" (2c, "How each is read"). The tool
lists no place for it: the uses file already records the conversion with both sides, but no rule turns it into a
place (`refs.mjs` has no relabel check). Kept to S4 (`@typedef {Amount} Price`), front's uses file names `Amount`
through bookings and front is told at money's merge (shown).

**Verdict.** (b). Not lost in the process: after money's change bookings' conversion no longer type-checks and its tests
fail, so its told job changes or drops `Price`, and front is told at that merge ("A middle module that passes a value on
is told only where its own file names the item", build text 5 §6). Front is told one merge late; nothing runs its tests
in between.

**Options.**

1. **The tool lists the relabel** (a conversion from another module's kind to a kind this module writes out) as an S4
   place. Bookings hears of every change to money until converted (+0 on the proof: bookings is already told at A14);
   its conversion writes `Price` as money's kind, and front is told at money's merge. A correction; no stop.
2. **No change.** Front is told one merge later, through bookings' own change; if bookings maps the new field back, front
   needs nothing.

Recommended: 1.

## 4. X03: front builds a Clock

Front's test hands bookings `{ now: () => '2026-…T09:30:00.000Z' }` as its clock. Front's uses file records `Clock`
(conversion). The change rewrites `Clock.now`'s bound line (an instant to a day); the tool finds `Clock.now: bound
changed`, which is right, but tells no one: front names `Clock`, not `Clock.now`, and a handle kind's means is only its
member names (`listing.mjs` line 117: `kind: 'handle kind'`, `bounds: []`; `notice.mjs` line 192, `matches`, goes from a
changed item to its members only).

**What the design says.** "At a conversion … it refers to both types" (2c). An item's means is "its stated types,
expanded through every type they name" (design 2 §7), with its bound lines (build text 2b §6), and "every module whose
file names a changed item, or a member of a changed type, by any route" is told (build text 5 §6). `Clock`'s stated type
and its bound line changed; front names `Clock`.

**Verdict.** (b).

**Options.**

1. **A user that builds a kind is told of a change to any of its members (P2).** Builds: a value converted to the kind,
   written or constructed. Told; +0 on the proof.
2. **A handle kind's means holds its members' means** (the design read literally): told; +15 told without need (every
   module that only holds a `Store`, `Rooms` or `Bookings` hears of each member's change).
3. **No change.** Front's tests break unseen; this breaks "every reference means every reference".

Recommended: 1.

## 5. X01, and whether rule 7 is sound

`formatAmount(a)` becomes `formatAmount(a, digits?)`. Billing writes `parts.map(formatAmount)`; `map` passes the index,
which now sets the digits. The tool finds "accepts more" and the checker confirms it, so no one is told (design 2 §7:
"accepting more tells no one"; rule 7: "'Accepts more' counts only when the language's own type checker confirms it").
R7 ("no function with more parameters than the one expected") guards the other direction only. The research had said
it: "a new parameter or a newly read field is never 'accepting more': calls that passed something there (as `map`,
`forEach` and `then` do) now get another answer (X01, Z07, U10)" (`changes.md`, summary and §1.1), and
`study-changes.md` §2.6 counts X01 as a change of means. **Verdict: (a)**, a gap: the rule as written lets it through.

**Is it general?** Yes. Asked of the pinned checker (TypeScript 5.6.3, strict, the standard's settings):

| Case | Checker |
|---|---|
| `(a) => string` and `(a, digits?) => string`, each assigned to the other | both accepted: "accepts more" is confirmed |
| `parts.map(newF)`; `Array.from(parts, newF)`; `'x1'.replace(/x/, (m, digits?) => …)` | accepted; the extra argument arrives |
| stored as `(a: A, i: number) => string`, then called with two | accepted |
| `newF.bind(null, a0)` handed to `[1, 2].map(…)` | accepted; the element arrives as `digits` |
| `oldF.call(null, a0, 2)`, `oldF.apply(null, [a0, 2])`, `oldF(...[a0, 2])` | refused (TS2554, TS2345) |
| an accepted kind gains `digits?: number`; a user passes its own `{ cents, digits: string }` | rule 7's question accepted both ways; the user's call now refused (TS2345), but the user is not told |

So, under the standard's settings, a direct call, `call`, `apply` or a spread cannot pass more arguments than the old
function took; more arguments reach it only when it is handed on as a value to a function type with more parameters:
the host's callbacks (`map`, `forEach`, `filter`, `find`, `some`, `every`, `flatMap`, `reduce`, `Array.from`'s mapper,
`replace`'s replacer, `sort`, `JSON.parse`'s reviver, event listeners, `setTimeout`'s extra arguments), a product
function type with more parameters, a variable or field of such a type, or a bound function handed on the same way.
TypeScript lets a function of fewer parameters stand where more are expected, and an optional parameter counts as
absent, so the checker sees no difference; and no checker question can, since `digits?: number` receiving the index,
a `number`, type-checks. The same holds for members: an accepted kind that gains an optional member breaks a user whose
wider value already carries a member of that name. The reverse case is safe: a provider whose accepted callback is
handed an extra argument is "cannot stand in" by the tool's own comparison, and told.

**Rule 7 is therefore unsound as built**, for a function handed on as a value and for a wider object handed in. On the
proof only X01 is lost by it (Z07 and U10 are told for other reasons).

**Options.**

1. **"Accepts more" still tells a user that hands the item on (P3).** The uses file already records `pass on`. Told;
   +0 on the proof. Narrower still: only where a parameter was added. Tool and one sentence in design 2 §7.
2. **A rule beside R7:** a function of another module is handed on only to a function type with as many parameters as it
   declares; otherwise wrapped (`parts.map((p) => formatAmount(p))`), so the call is direct and checked. Read from the
   checker's types, listed as a place, never refused; the place hears of every change to its provider until converted.
3. **Rule 7 narrowed** as `changes.md` asked: a new parameter, or a new optional member, never counts as accepting
   more. Tells every user of the item at each such change, whether or not it hands the item on (not measured). The
   member case needs this or a check of each user's conversions.
4. **No change.** X01-type breaks reach the user's next job or a walk.

Recommended: 1 for functions; for the member case, 3 restricted to users whose file records a conversion into the kind.

## Re-running

The scratch scripts and patched copies are not committed. To repeat: copy `converted-proof/` and the tool's `lib/`
elsewhere, apply the patch described in the table of "How it was shown" (each behind its own switch), and run
`node process/research/precision-26nov/measure.mjs <patched tool> --proof <copy> [--only <ids>]`; for a declaration, add
`"meaning": [{ "item": "startMeter", "line": "…" }]` to the copied `change.json`.
