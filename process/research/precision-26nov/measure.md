# The notice's precision once the proof's code keeps the coding standard (26 Nov 2026)

Status: research for PROCESS #17, by a worker, on branch `work/decision-c-measure` from `work/decision-c` at 3338a4c.
Nothing in the tool, the design or the build texts is changed. Everything here is under
`process/research/precision-26nov/`.

## Summary

| | needed | told | told without need | missed |
|---|---|---|---|---|
| Original proof (`tool/test/fixtures/notice-proof`) | 112 | 958 | 846 | 0 |
| Converted proof (this folder) | 108 | 373 | 281 | **16** |

- Converting the product to the standard removes 571 of the 846 users told without need. What is left: 95 told only
  because of a place outside the standard (94 of them are `door`, whose run-time dispatch cannot be written inside the
  standard), 67 for a computed fact (B3), 36 for a member of a kind they hold but do not touch (B1), 80 for exactly the
  item that changed (A), 3 for B2 and B5 together, none for B4.
- **16 needed users are now missed.** In the original every one of them was caught only by its places outside the
  standard ("hear of any change"). Once those places are gone, nothing in the notice sees these changes: 11 are changes
  to the meter's program (its output stream, how it is started), 2 are swaps of two same-kind parameters, 3 are the
  known cases A14, X01 and X03. So the standard's fallback was hiding real gaps in "what changed"; they must be closed
  before the tool can rely on converted code.

## 1. The conversion

Every module but `text-rules` (already inside the standard) was converted; `node --test` passes for each module, and the
tool's `check` refuses none. Behaviour is unchanged, with the small exceptions noted.

- **money, calendar, rooms, bookings**: written-out kinds in place of derived ones (`Currency`, `RoomKind`,
  `BookingState`; the handler kinds of `rooms` and `bookings` written member by member, no mapped or indexed types);
  stated kinds on every export of `calendar` (it had none); const copies before narrowing (R19).
- **store**: `createStoreHolding(seed)` writes the seed records inside the store, so `seededStore` names no table at
  run time (S7); `checkNames` exported, and the store's own bound tests call it for the names no table declares (`''`,
  `Big`, `a b`, 41 letters) — a test of refusing an undeclared name cannot name it through the store's carrier; tables `t`
  and `u` of its own tests declared (`@storedrows`) in `testing.mjs`.
- **rooms**: added to the boundary modules in `facilities.json` (its name sort uses `localeCompare`, which reaches out;
  a code-unit compare would change the order of some names).
- **bookings**: gains the reader `list()` (through `find`), so that `reports` reads bookings through bookings' reader,
  not by casting rows of its table (R2).
- **reports**: `summarize(store)` reads rooms and bookings through `createRooms(...).list()` and
  `createBookings(...).list()`; its parameter is a `Store`, not `*`.
- **meter**: exports `startMeter(uses, onMessage, onError)` (S6), and `readMeterMsg` / `readMeterInput`, the readers of its
  own channel; the program reads its input through its own `lines.mjs` (line ends as `node:readline` reads them),
  because the tool's description of `readline` types its listener `any` (R1) and its `on` is not classified (R14).
- **billing**: starts the meter only through `startMeter`; no `spawn`, no stream, no cast.
- **front**: request bodies built as declared kinds, no conditional spreads (R6, R19).
- **door, left outside the standard**: its dispatch reads a handler by a run-time name (R16/R17 cast to a record) and
  hands back the JSON copy as the operation's kind (R2). There is no way to write a call by name with typed answers
  without a cast, an `@overload` (R10) or indexed and template-literal types (R20, kept, refer to no module); its tests
  call an unknown name on purpose. These places may refer to `*`, so `door` hears of every change to an earlier module.

## 2. The changes on the converted copy

Each change's diff against the original file was applied to the converted file (`rebase.py`, `git merge-file`);
about fifty files conflicted and were resolved by hand (`resolutions.py`), and a few clean merges were completed where the
conversion wrote out what the original derived (`'garden'` into `RoomKind`, an operation into the written-out handler
kinds). `change.json` is carried unchanged. A change's own code was not converted: places outside the standard that a
change writes into its provider stay (they do not change who is told by that change, since the uses files are those
from before it).

- **Kept as they were (their point is a place outside the standard)**: setups A12 (front's test reads a caught error),
  A13 (rooms reaches the store by a computed member), P23 (billing calls with an extra argument), U09b (front reads
  bookings' price sheet by path), V06b and W05b (front imports bookings' non-interface file); changes A09 (narrowing by
  `assert.equal`), A08, X10, P27, U01, V10, V14, W08, W10, W11, W12, Z10, Z16, U05, U12, T05, T13 and others listed by
  `node places.mjs tool --changes`. Setup X03a writes `Date()` into bookings (R14): incidental, but bookings is X03's
  provider, so it tells no one.
- **Premise gone**: P22a, P22b, T06a, T06 and Z15 are about `calendar` having no comments; converted, it has them, so
  P22a and T06a only reword comments and T06, Z15 change `weekday`'s stated parameter to text. V13 names the booking
  states, which the conversion already did: only the description is added. A04's setup (billing's own copy of the
  meter's message kind, now on the callback's parameter) is not flagged by the tool at all.
- **Check of the rebase**: each module's tests, before and after each change, give the same result on both copies for
  all 150 changes, except four (below). The changed items match in 128 changes; the rest differ only by items the
  conversion added (`startMeter`, `list`, `createStoreHolding`) or by the door's and V13's premise.

## 3. needs on the converted copy (needs.json)

108, against 112: no new break; four recorded needs disappear, each because `reports` now reads bookings only through
bookings' reader `list` (A01, Y05, U02: rows kept in a shorter form, read back by `find`; U01: the table renamed in all
of bookings' own code, `list` included). Nine recorded needs whose tests do not break on either copy are kept, as are
P28/A13's uncounted transitive breaks of billing, front and reports (not counted on the original either).

## 4. Results on the tool at work/decision-c (3338a4c)

| class | original | converted |
|---|---|---|
| A — names exactly what changed, did not need it | 84 | 80 |
| B1 — another member of a changed kind, or a kind that only gained members | 34 | 36 |
| B2 — equivalent kinds | 2 | 1 |
| B3 — a computed fact differs (errors, channels, instance, `this`, written arguments, a type error) | 55 | 67 |
| B4 — a named meaning reaching a user that only passes the value on | 5 | 0 |
| B5 — accepts more, not confirmed | 0 | 2 |
| outside — a place outside the standard | 666 | 95 |
| other | 0 | 0 |

A user told for reasons of several classes is counted once, in the first of A, other, B1, B4, B5, B3, B2, outside
(the reason hardest to remove first); 48 converted users have reasons of more than one class (`measure-output.txt`).

### Worked examples (converted copy)

**A** — P05 `door` uses `op:bookstatus`, whose answer lost a field; P06 `billing` receives `Room` (field renamed);
P09 `rooms` calls `Store.put`, which now refuses non-objects (rooms only puts objects); P11 `bookings` reads `Room`,
whose `kind` gained `'garden'` (it reads `seats` only, but a uses file records a kind's fields as one item);
P12 `meter` reads `Amount`, whose bound line changed; P13 `front` reads `Amount`, renamed (`removed`);
P17 `billing` calls `Bookings.open`, whose meaning ARCH named; P22b `bookings` calls `addDays`, now refusing non-whole
days; X05 `rooms` calls `Store.put`, which gained an optional argument and an error; Y07 `meter` reads `Amount`, whose
limit's meaning changed only in a test.

**B1** — P10 `billing` reads `Booking`, which only gained `created`; P18 `billing` holds `BookingHandlers`, whose
`bookcancel` went; P21 `rooms` uses `Store.get/list/put`, the store gained `count`; P28 `billing` holds a `Store` whose
`get` became `read`; X08 `door` names `RoomOps`, which gained an operation; Y10 `front` holds `Bookings`, whose other
members changed; Z17, Z18 and W08 `bookings` use `Rooms.add/find`, rooms gained `findAll`, `byKind`, `pick`;
V09 `billing` uses `Bookings.open/cancel`, bookings gained `suggest`; W16 `rooms`, the store gained `id`.

**B2** (all) — W14 `billing`: `splitEvenly`'s answer kind named, same shape; U10 `billing` and `reports`:
`createRooms` hands back `RoomDirectory`, the renamed `Rooms` (also told as A: `Rooms` "removed").

**B3** — P05, P10, A01, Y05, Y10 `door`: `op:bookopen` and its siblings "channels, settings or files changed" because the
change touched how bookings keeps rows; Y04 `bookings`: `Rooms.find` channels; P28/A13 `billing`: `createStore` "errors
that can leave it changed"; Y01, Z06 `door`: an operation's errors; X04 `bookings`: `Rooms.add` "type error in its code";
P09 `rooms`: `createStore` type error.

**B4** — none on the converted copy: `meter` now reads `Amount` (its `startMeter` and test do), so the five original
cases (Y07, Z02, W17, U06, T08: `meter` given `Amount`'s named meaning, received and named only) become A.

**B5** (all) — Y03 and Z14 `front`: `createDoor` (its `Door.get` optional or undefined) "accepts more" by the stated
kinds, not confirmed by the checker.

### Missed (16)

| Change | User | Why nothing told it |
|---|---|---|
| X09, Y06, Z04, V03 | billing | meter writes refusals to standard error; no item's means includes the program's stream |
| Z03, U04, T09 | billing | meter writes blank lines or indented JSON; same |
| W02, T05 | billing | meter writes a ready line first; same |
| W01, U05 | billing | meter needs a currency argument / environment value to start; `startMeter` unchanged |
| U08, T07 | billing | two parameters of the same kind swap places; the means compares kinds only |
| A14 | front | front reads `Amount` through bookings' own copy `Price`: no route from money to front |
| X01 | billing | `formatAmount` accepts more (optional digits); billing hands it to `map`, which passes the index |
| X03 | front | front's test implements `Clock` without naming it; `Clock.now`'s bound changed |

In the original all 16 were told only for places outside the standard. With converted code the 11 meter cases need the
program's stream and start-up to be part of an item's means (`startMeter`'s, or the `@message` kinds'), or the program
treated as a channel the starter's means reaches.

## 5. Surprising

- The standard's "hear of any change" fallback was the only thing catching 16 real needs; precision and recall cannot
  be read separately.
- B3 grows (55 → 67) after conversion: computed facts (channels above all) spread across a module's operations when one
  function's storage changes, and they reach users that only call by name.
- A kind's fields are not items: "reads `Room`" cannot be told from "reads `Room.kind`", so a field-level change stays A
  (P11, X07). Handle members are items, so the same change to a handle becomes B1.
- A renamed kind reaches users as "removed" (U10) even where its shape is the same.
- `door` cannot be converted: a typed call by name needs a cast, an overload or R20's forbidden kinds.

## Re-running

```
cd tool && npm ci && cd ..          # the checkout's TypeScript
node process/research/precision-26nov/measure.mjs <path to a checkout's tool/> [--json out.json]
```
With no path it uses this checkout's `tool/`. `--proof tool/test/fixtures/notice-proof` measures the original proof
against its `expected.json` (reproduces 112/958/846/0). The other scripts: `rebase.py` + `resolve.py` (rebuild the
converted changes), `tests.mjs` (each module's tests before and after each change; results in `tests-original.json`,
`tests-converted.json`), `needs.mjs` (writes `needs.json`), `places.mjs` (places outside the standard).
