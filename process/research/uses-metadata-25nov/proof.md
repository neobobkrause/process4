# The owner's uses files on the notice's proof, and the proof's "needed and missed: 45" explained (25 Nov 2026)

Status: research for PROCESS #15, by a worker. Nothing in the repository is changed. Read at origin/main 4acec19. Scratch
work (not kept): the tool copied twice (as it is, and with the 2C+ prototype), the uses files, the oracle, the scripts.

## Summary and bottom line

- **The 45 are not about who uses an entry. They are about what changed.** In 43 of the 45 the provider's listing did not
  change at all, so no option of `who-is-told-25nov.md` could tell anyone: options A to D only soften or narrow telling
  among changes the listing already shows. In the other 2, the listing changed in an entry the missed user does not use.
- **What the 45 are.** 40 are misses the design accepts (mostly a job that changed code and left the structured comment as
  it was, so the comment-based listing still describes the old code); 3 are uses of a provider's non-interface files,
  which the notice is not meant to tell; **2 are real misses the design does not accept**: T04 (a class member's new
  `@throws` is not listed at all, a tool fault) and T07 (two parameters of a handed-in function swapped places, which the
  "parameters moved" rule does not look inside).
- **The proof's `needs` is not complete.** Running every later module's own tests before and after each change (measured)
  finds 13 needed users the proof does not record: Y02, Z05 and V04 each break bookings, meter, billing and front (an
  Amount built as a class instance does not survive the door's JSON copy or the store's structured copy), and A14 breaks
  front. The tool tells none of them. So the current tool really misses at least 57 needed users, not 45.
- **Uses files with today's "what changed" barely move the numbers:** 108 told / 53 told without need / 44 missed, against
  116 / 62 / 45. They remove every "not followed fully" notice (reports' 10) and catch A04 (billing reads the meter's
  messages with its own copy of the kind), and, outside the proof's `needs`, front in A14 (it reads Amount through
  bookings); nothing else, because the listing gives them nothing to look up.
- **Uses files with an accurate "what changed" catch every needed user but one**, and that one (Z01) only because
  "accepting more tells no one": 202 / 104 / 1, or 218 / 119 / 0 counting a widened domain as a change. They tell more
  than today, because real changes reach every user of the changed entry (the owner's entry-level rule); 13 of the 104
  "without need" in fact break.
- **The lookup is trivial**: 150 changes, five ways each, files read and matched, in about 45 ms in all (measured); the
  tool's notice took 50 s for the same 150 changes on this 11-module product, and up to 40 minutes on civicsmith.
- **Understanding matters, but on this product only for a few uses**: 14 of 119 recorded uses (12%) are ones the tool
  cannot infer (untyped values, table names as text, a module's own copy of a kind, non-interface files, a computed
  member, an object written to fit a kind it never names). With the accurate "what changed", those 14 decide 9 of the
  needed users. This product is commented almost throughout; on plain-JavaScript civicsmith the share will be far larger
  (inference).

**Bottom line.** The owner's uses file is a sound answer to "who uses this entry": complete, fast, and with no fallback to
"tell everyone". It is not, by itself, a fix: the proof's misses all sit in the other half, deciding what changed. A design
that adopts the uses file must also replace the listing diff as the sole judge of "changed" with a reading of the
provider's change that sees code, not only comments; on this proof that reading, with the uses files, tells every user
that needed telling. Whether a job (the same job that forgot to update its comment in 19 of these cases) can be relied on
to state its own changed entries is the open question; the proof's cases suggest an independent reading of the provider's
diff, entry by entry.

## 1. The 45, explained

### 1.1 How "needed and missed" is counted

`expected.json` holds, for each of the 150 changes, `told` (the users the tool tells, design 8) and `needs` (the proof's
reading of which users truly needed a change, carried over from process3's design-7 readings). The research's table
counts, over all 150 changes: told = the sum of |told|; told without need = the sum of |told \ needs|; needed and missed =
the sum of |needs \ told|. Reproduced exactly from `expected.json` (116 / 62 / 45), and again by running the notice alone
on all 150 changes with the tool as it is (116 / 62 / 45; same users told in all 150) and with the 2C+ prototype applied
(115 / 61 / 45; Z19's front dropped). The same 45 under every option because no option adds a way to see a change: each
removes tellings (descriptions, unconfirmed accepts-more, wider reach of "not followed") and none adds one.

Of the 45, the listing showed **no telling entry at all** in 43. In U10 it showed `Rooms` renamed (told bookings, which
writes the name), while front needed `Rooms.find`, which only accepts more. In T02 it showed a new bound on `Bookings.quote`,
while billing uses the operation `bookquote`, whose handler calls `quote`; the bound did not reach the operation's entry.

### 1.2 The 45, one by one

Classes: **(a)** the design accepts missing it; **(b)** the proof counts a need the notice is not meant to tell; **(c)** a
real miss the design does not accept. The (a) kinds: **a1** a change under "anything" (an uncommented provider, M2);
**a2** code changed, the stated interface (bound line, `@throws`, `@storedrows`) left as it was, so the listing still
describes the old code (design 8 dropped design 7's "bound test changed" rule and its refusals); **a3** a running
program's stream changed (channel, blank or ready lines, indenting, how it is started) with its stated message kind left
alone (design 7's refusals not taken; the owner approved two); **a4** the user's use is invisible: its own copy of the
kind; **a6** the provider only accepts more, and the user hands the function on as a value (accepted: "accepting more
tells no one"; build text 5 §6, "a function handed in as a callback"); **a7** a method now needs its handle (`this`) and
the user hands it on as a value; **ac** the provider's own check refuses the change, so it cannot merge as it is. In every
(a) and (c) case the user is caught by its own tests the next time its job runs, or by a walk (design part 2 §7).

| # | Change | User | What the user relies on that changed | Class |
|---|---|---|---|---|
| 1 | P15 | billing | `op:bookquote` total now one night (code); bound line left | a2 |
| 2 | P16 | front | `isEmail` hands back `{ok, reason}`, comment still says boolean; text-rules' own check refuses | ac |
| 3 | P17 | front | party at most 100 in code only; front's test books 150 | a2 |
| 4 | A01 | reports | bookings' rows kept in a short form; reports reads rows by table name | a2 |
| 5 | A04 | billing | meter's reading carries `price` for `cost`; billing reads it with its own copy of `MeterMsg` | a4 |
| 6 | A07 | front | party at most 100; bookings moved its test, not its bound line | a2 |
| 7 | X01 | billing | `formatAmount` takes optional digits; billing hands it to `map`, which passes the index | a6 |
| 8 | X09 | billing | refusals now on standard error; `@message stdout` left | a3 |
| 9 | Y05 | reports | rows kept without `day`; cast at write | a2 |
| 10 | Y06 | billing | refusals on standard error | a3 |
| 11 | Y07 | bookings | amount limit 500,000 in code; bound line left; bookings' quotes can pass it | a2 |
| 12 | Z01 | front | party may exceed the room's seats; front's test expects a refusal | a2 (also accepts more) |
| 13 | Z02 | bookings | exported `MAX_CENTS` lowered; the listing holds its kind (number), not its value | a2 |
| 14 | Z03 | billing | a blank line after each message; billing parses each line | a3 |
| 15 | Z04 | billing | refusals on standard error | a3 |
| 16 | Z07 | front | `Rooms.find` takes an optional kind; front's test maps `rooms.find` (index as kind) | a6 |
| 17 | Z15 | reports | uncommented calendar: `weekday` takes text | a1 |
| 18 | V02 | billing | meter refuses over 600 minutes in code; bound line left | a2 |
| 19 | V03 | billing | refusals through `console.error` | a3 |
| 20 | V05 | billing | `splitEvenly` throws TypeError; `@throws` left; billing's test expects RangeError | a2 |
| 21 | V06 | front | front imports bookings' non-interface `prices.mjs`; its export renamed | b |
| 22 | W01 | billing | the meter must be started with a currency argument | a3 |
| 23 | W02 | billing | an empty ready line first | a3 |
| 24 | W03 | billing | unknown room refused with Error; the handle's `@throws` left | a2 |
| 25 | W05 | front | front loads bookings' `prices.mjs` with `import()`; export renamed | b |
| 26 | W17 | bookings | exported `MAX_CENTS` lowered; bound line left | a2 |
| 27 | U01 | reports | rows go to table `bookings-2`; `@storedrows` left | a2 |
| 28 | U02 | reports | rows kept without `day` | a2 |
| 29 | U03 | billing | unknown room refused with a coded Error; `@throws` left | a2 |
| 30 | U04 | billing | a blank line after each message | a3 |
| 31 | U05 | billing | the meter needs `METER_CURRENCY` in its environment | a3 |
| 32 | U06 | bookings | limit lowered in `limits.json`; bound line left | a2 |
| 33 | U07 | reports | `Rooms.add` now calls `this.find`; reports' test hands `rooms.add` to `forEach` | a7 |
| 34 | U09 | front | front reads bookings' `prices.json` by file path; its key renamed | b |
| 35 | U10 | front | as Z07 (and `Rooms` renamed, which front does not name) | a6 |
| 36 | T01 | front | handle built as a class; `find` needs `this`; front maps `rooms.find` | a7 |
| 37 | T01 | reports | `add` needs `this`; reports hands `rooms.add` on | a7 |
| 38 | T02 | billing | `quote` limited to 3 nights, stated on `Bookings.quote`; `op:bookquote` calls it, its own entry unchanged | a2 (borderline: errors pass through calls in the listing, bounds do not) |
| 39 | T03 | billing | unknown room refused with Error in a helper; `@throws` left | a2 |
| 40 | T04 | billing | `Tally#add` now throws Error when full; **its `@throws` was updated**, but the listing records no `@throws` for a class member (`listing.mjs:207-222`) | **c** |
| 41 | T05 | billing | an empty line first, by `console.log()` | a3 |
| 42 | T06 | reports | `weekday` takes text; the partial first step did not describe it | a1 |
| 43 | T07 | billing | the venue's price function is asked `(nights, party)` for `(party, nights)`; rule 48 compares only an entry's own parameter names | **c** |
| 44 | T08 | bookings | limit lowered in code and in money's test helper; bound line left | a2 |
| 45 | T09 | billing | messages written indented over several lines | a3 |

Counts: a1 2, a2 19, ac 1, a3 11, a4 1, a6 3, a7 3 (**a: 40**); **b: 3**; **c: 2**. So **42 of the 45 are real
changes a user needed to follow**; the design accepts 40 of them by its general clause and by the rules it chose not to
take; **2 are real misses it does not accept** (T04 is a tool fault; T07 is arguably one, since rule 48 exists to catch
moved parameters).

### 1.3 Needed users the proof does not record (measured)

Every later module's own tests were run on the product before and after each of the 150 changes (no failures before any
change). They agree with `needs` in 137 changes. Of the 13 that differ:

- **Breaks the proof does not record: 13 users.** Y02, Z05, V04 (Amount as a class instance with private fields; the door's
  JSON copy and the store's structured copy turn it into `{}`): bookings, meter, billing and front each fail. A14 (bookings
  writes its own `Price` copy; Amount's `cents` renamed): front fails (it reads `b.total.cents`). The tool tells none of the
  13 (its listing of Amount is unchanged by Y02/Z05/V04; in A14 the change stops at bookings' own copy). They would be
  class a2 (what crosses changed in a way no stated kind expresses) and a4.
- **Breaks that are not needs:** P28 and A13 (store's `get` renamed) break billing, front and reports only because their
  tests build rooms and bookings, which call `get`; fixing rooms and bookings fixes them.
- **Needs that no test shows:** P05, P06 front, P13, X07, V02, W04, U10 bookings: a kind's name or a stated bound the user
  must follow, which its tests do not exercise.

## 2. The owner's proposal, simulated

### 2.1 The uses files

One JSON per module, written by reading each module's code and tests (base product), plus the changes the proof's setups
make to users (19 setups change a user's file; the rest change only their own provider). Form:

```
{ "module": "reports",
  "providers": { "rooms": { "table:rooms": { "code": ["reports/src/index.mjs"], "test": [], "how": "by-name", "named": false }, ... } } }
```

An entry is named as the tool's listing names it (`amount`, `Amount`, `Store.get`, `Tally#add`, `op:bookquote`,
`table:rooms`), or, for a file outside the provider's interface, `file:<path>` or `<file>:<export>`. `how` records the
means: import, kind written by name, member, `through:<module>` (a value or kind received through a middle module),
`by-name` (an operation called or a table named as text), `untyped`, `handed-on`, `own-copy`, `computed`, `file`. `named`
says whether the user writes the entry's name (a pure rename concerns only those). The base files, compactly (c code, t
tests):

| User | Providers and entries |
|---|---|
| rooms | text-rules: slugify c; store: Store, Store.get, Store.put, Store.list, Stored c, createStore t |
| bookings | money: amount c, Amount c+t; calendar: parseDay, formatDay, addDays c; store: Store, Store.get, Store.put, Stored c, createStore t; rooms: Rooms, Rooms.find c, Room c+t (its tests book `hall`, the slug of `Hall`), createRooms, Rooms.add, NewRoom t |
| door | bookings: BookingOps c; rooms: RoomOps c |
| meter | money: amount c, Amount c+t |
| billing | money: amount, add, formatAmount, splitEvenly c, Amount c+t; meter: WORKER_FILE c, MeterInput c+t, MeterMsg c+t; door: Door, Door.get, Door.call c, createDoor, Handlers t; bookings: op:bookstatus c+t by-name, op:bookquote c+t by-name, createBookings, bookingHandlers, Bookings.open, Bookings.cancel, Booking, BookingRequest t; rooms: createRooms, roomHandlers, Rooms.add, Room, NewRoom t; store: createStore t |
| front | text-rules: isEmail, titleCase c; rooms: ROOM_KINDS, RoomKind c, op:roomlist c+t by-name, Room c+t through door, createRooms, roomHandlers t, table:rooms t by-name (seeded rows); bookings: op:bookopen, op:bookcancel c+t by-name, Booking, BookingRequest c+t through door, createBookings, bookingHandlers t; money: Amount c+t through bookings; door: Door, Door.call c, createDoor, Handlers t; store: seededStore t |
| reports | rooms: ROOM_KINDS c, table:rooms c by-name, Room c untyped, createRooms, Rooms.add, NewRoom t; calendar: parseDay, weekday c; store: Store.list, Stored c untyped, createStore t; bookings: table:bookings c by-name, Booking c+t untyped, createBookings, Bookings.open, Bookings.cancel, BookingRequest t |

92 uses in the base (41 code only, 35 tests only, 16 both), 13.7 KB for seven files. The setups add, for example: front →
text-rules `slugify` through rooms' re-export (A03); billing → meter `MeterMsg` as `own-copy` (A04); rooms → store
`Store.get` as `computed` (A13); reports → rooms `Rooms.add` handed on to `forEach` (U07a); front → bookings
`prices.mjs:SEAT_NIGHT_CENTS` (V06b, W05b) and `file:bookings/src/prices.json` (U09b); bookings → rooms `RoomKind`, for
its price table keyed by every kind (X07); billing → money `Tally`, `Tally#add`, `Tally#total` or `Tally.sum` or `sum`.

**Understanding the tool cannot supply (measured against the tool's own inferred uses, `usage.mjs`, on the same code):**
119 distinct uses recorded, 105 inferred by the tool, **14 not**: reports' six (two tables named as text, `Room`,
`Store.list`, `Stored`, `Booking` through the untyped `source`); billing → `Room` (its tests rely on room ids being slugs);
front → rooms' re-exported `slugify`; billing's own copy of `MeterMsg`; rooms' computed `get`; front's three
non-interface file uses; front's clock object written to fit `Clock` without naming it; bookings' table keyed by
`RoomKind`. The tool infers nothing the files lack, but it did find four uses this writer first left out (the argument
kinds `Handlers`, `BookingRequest`, `NewRoom` of objects handed to calls), which were then added: a careful writer also
forgets, and the tool's inference is a useful cross-check, as the existing check of declared uses against imports is.

### 2.2 Who is told, three ways of deciding "what changed"

Who is told = every module whose uses file (as it stood before the change) names an entry that changed; a pure rename
tells only a user with `named`. "What changed":

- **(i) the tool's listing diff as today:** the entries of the tool's own notice output whose words tell (`tells` not
  `nobody`), in the provider and in modules changed through it;
- **(ii) the same with 2C+:** the prototype `first-comments-2c-25nov/prototype.diff`, applied to a scratch copy and run with
  `P4_OWNCODE=2C+` (not approximated);
- **(iii) an oracle:** the entries each change really altered in what they accept or hand back, judged by reading the
  change (listed per change in the scratch file `oracle.mjs`), including entries of a later module that hands the changed
  value on (for example bookings' `Booking` and operations when Amount's field is renamed). A widened domain is marked and
  counted in a separate row; so is a variant with the provider's own entries only.

Against the proof's `needs` (told / told without need / needed and missed):

| | Told | Without need | Missed |
|---|---|---|---|
| Current tool (inferred uses, "not followed" fallback) | 116 | 62 | 45 |
| (i) uses files + listing diff | 108 | 53 | 44 |
| (ii) uses files + listing diff with 2C+ | 107 | 52 | 44 |
| (iii) uses files + oracle | 202 | 104 | 1 |
| (iii) oracle, a widened domain counted as a change | 218 | 119 | 0 |
| (iii) oracle, the provider's own entries only | 182 | 85 | 2 |
| (iii) oracle, with only the 105 uses the tool can infer | 190 | 101 | 10 |

Against the users whose own tests break (section 1.3): current tool 116 / 68 / 61; (i) 108 / 60 / 61; (iii) 202 / 100 / 7,
where all 7 are P28 and A13's knock-on breaks (billing, front, reports, twice) and Z01.

**The misses.**

- (i) and (ii), 44 each: the 45 of section 1.2 less A04, which billing's uses file catches. Their cause is the same in every
  case: the listing showed no telling entry the user uses (43 none at all; U10 and T02 as in 1.1). 2C+ changes no miss.
- (iii), 1: Z01 front. The change only accepts more (a party larger than the room is no longer refused), which the design
  tells no one; front's test relied on the refusal. Counting a widened domain catches it.
- (iii) provider only, 2: Z01, and X08 billing, where rooms' new operation takes the name `bookstatus` from bookings, so the
  entry that changed is bookings', not the provider's. The tool's existing route 3 (a new operation whose name another
  module answers) is the rule for this; with it, provider-only telling misses only Z01.
- (iii) with only tool-inferable uses, 10: A01, Y05, U01, U02 (reports reads tables by name through an untyped value), A04
  (own copy), A13 rooms (computed member), V06, W05, U09 (non-interface files), Z01. Understanding decides 9 needed users.

**Told without need.**

- (i): 53. 38 are users the oracle also tells (they use an entry that really changed); 12 come from changes that altered
  nothing (A10 3, X06 5, Z19 1, T10 2, T12 1: descriptions and an unconfirmed accepts-more, F1 and F6 of the research). 2C+
  removes Z19 only; option B's checker call would remove T10. The other 3 are the listing's coarser words: P13's rename of
  Amount passed on as "hands back differently" in bookings' `Booking` (front, reports), and P18's retired operation shown
  as `Door.call` and `Door.get` no longer standing in (billing, which calls neither `bookcancel`). Every "not followed
  fully" notice is gone (reports, 10).
- (iii): 104 by the proof's `needs`, of which 13 really break (section 1.3). Of the other 91: 52 use the changed entry in
  their code in a way this change does not affect (for example meter's amounts never come near the new limit); 20 use it
  only in their tests (the file marks this, so a told job runs only those test files); 19 use it only through a later
  module's entry (bookings' operations handing a changed Amount on). This is the owner's rule at entry level, "the users of
  the entry that changed", not a fault of the lookup; finer telling would need the use itself judged, not the entry.

### 2.3 How long the lookup takes (measured)

For each change: read the 11 base files and the setups' files (about 14 KB), index them by provider and entry, match the
changed entries. All 150 changes, five ways each: about 45 ms in all, well under 1 ms per change and way. The tool's notice
alone on the same 150 changes: 50 s (about 0.33 s each) on this 11-module product; civicsmith's early providers took up to
40 minutes and 8 GB (`notify-slow-early-provider-25nov.md`). On civicsmith (about 200 files) the lookup is a read of the
uses files on the tranche branch plus a match; inference says seconds at most.

## 3. Method

1. Read `who-is-told-25nov.md`, `uses-metadata-25nov.md`, the replay (`tool/test/notice-replay.mjs`), the test, design part
   2 §6-7 and build text 5 §6.
2. Recounted from `expected.json`; ran the notice alone (`notice(loadTree(before), loadTree(after), provider)`, as the
   replay's `answer` does, without the check) on all 150 changes with a scratch copy of the tool, and with a second copy
   with `first-comments-2c-25nov/prototype.diff` applied (it applies with offsets; `who-is-told-25nov/proto.diff` no longer
   applies to `narrow.mjs`). Kept each change's entries, words and told users.
3. Wrote the before and after of every change and setup as diffs and read them all; read the whole product.
4. Wrote the uses files (scratch `uses-data.mjs` generates them) and the oracle (`oracle.mjs`).
5. Simulated (`simulate.mjs`): uses as before the change (base, then the change's setups in order), changed entries by each
   way, users told, compared with `needs` and with test breaks.
6. Ran each later module's tests (`node --test '<module>/test/*.test.mjs'`) on the product before and after each change.
7. Compared the uses files with the tool's inferred uses (`analyse(...).uses`) on the same before-trees.

## 4. What is measured and what is judged

- **Measured:** the 116 / 62 / 45 count and its reproduction; the tool's and 2C+'s changed entries and told users; the
  test breaks before and after each change; the simulation's counts for a given set of uses files and oracle; the lookup
  time; which recorded uses the tool infers.
- **Judged (by this worker, reading code):** the uses files; the oracle; the classes of section 1.2. The uses files were
  written after reading the changes, so hindsight may have helped: billing's test use of `Room`, front's `Clock`, and
  bookings' `RoomKind` table are uses a job writing without knowing the changes to come could leave out. The oracle is
  what a careful reader of each provider diff would state; several entries are judgement calls and are marked in
  `oracle.mjs` (X10's 30-second limit counted as a change; X02, Z16 and T12 counted as no change, since the new values stay
  within what the entries state; W12's error code counted as handing back more, U13's subclass as no change).
- **Not measured:** whether a provider's job, asked to state its changed entries, would match the oracle. In 19 of the 45
  the same job changed code and forgot the comment that states it, which is reason to doubt self-report alone. Civicsmith
  is not measured: the share of uses that need understanding, and the told counts, will differ there.
