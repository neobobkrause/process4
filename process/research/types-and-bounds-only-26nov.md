# Only stated types and bounds tell (26 Nov 2026, a worker for PROCESS)

The owner's decision, exactly: "Decision: only a change of an item's stated types or bounds tells; new errors, other
values within the range, side effects and test prerequisites do not."

Built on `work/types-and-bounds-only` (from main c834ac4, merged with main 70022da). The tool still works out and
lists every part (`p4 listing`); only `compareItem` (and the member-by-member checks that mirror it) stop counting the
parts below as a change. `npm test`: 287 pass, 0 fail.

## Each part of an item's means, and its fate

| Part (design 2 §7; build text 2b §6) | Under the decision | Grounds where ambiguous |
|---|---|---|
| What it accepts, stated types expanded: parameters in order, required, optional, rest; functions it accepts and what they are handed; read-only arguments; a kind's members | Tells | |
| What it hands back, stated type expanded; a value or a promise | Tells | |
| Its sort (function, value, kind, class...) | Tells | |
| A member that may now be missing | Tells | |
| Plain data or a class instance | Tells | Worked out from code, not written; kept as a type fact (a value's kind as the checker and `structuredClone` see it), as PROCESS listed it |
| Needs its object as `this` | Tells | Worked out from code; kept as a type fact (`@this`), as PROCESS listed it |
| A message's channel (`@message`) | Tells | A mark stated in the item's comment and read into the listing beside its kind, not a channel worked out from code |
| Its marked bound lines | Tells | |
| A new type error (code no longer matches its stated types) | Tells | |
| Its code changed while the same type errors stand | **Stops** | No stated type changed; the decision's words name stated types only |
| A type error gone | Does not tell (as on main) | |
| Errors that can leave it | **Stops** | |
| Channels, settings, files, start arguments read or written | **Stops** | |
| Arguments it writes into | **Stops** | |
| A constant's value within its stated type | **Stops** | |
| A constant with no stated type (`export const L = 5`) | Tells | The checker's type of it is `5`: the value is its type, so 5 to 6 changes its type, not a value within it |
| A provider's error or channel taken in by a later item (`takesIn`) | **Stops**: no item is made changed | Types still pass through: a use of a provider's kind through a middle module is in the user's uses file (`route`), and tells as before |
| A change of meaning ARCH names or a job declares | Unchanged (tells) | The owner has not said |
| An item a job records as keeping its domain and range (`push --same`) | Unchanged (tells no one) | |

Code: `tool/lib/notice/notice.mjs` (compareItem, memberChanges, onlyInside, PARTS_OF; `takenIn` removed),
`tool/p4.mjs` (notify's help). Build texts 1b command 11, 2b §6 (its table), 5 §6 say the same.

## Measured (main 70022da against this branch)

- **Converted proof** (`process/research/precision-26nov/measure.mjs`, 150 changes, 108 needs): changed items that
  tell 486 to 210 (-57%); told 410 to 341 (-69, -17%); told without need 309 to 254 (-55); missed 7 to 21 (+14).
  The 14 new misses are breaks found by running the user's tests: a new error kind or code (A06, Y01, Z06, V05, W03,
  U03, T03, T04) and the meter program's channels or start arguments (X09, Y06, Z04, V03, W01, U05). Under the
  decision these reach a user only if ARCH names, or a job declares, a change of meaning.
- **The notice's proof in the tool's fixtures** (`tool/test/fixtures/notice-proof/`): changed items that tell 446 to
  204 (-54%); item reasons 750 to 446; told modules 958 to 958, since every told module there also hears through a
  place outside the standard. 47 answers re-recorded, each with its reason.

## Also dropping named or declared meaning: the cost

Small in the notice: skip `named` in `changedItems` (one loop, about 10 lines) and retire `passedOn` (about 30 lines);
`push --meaning`, the meaning comment, the job block's `meaning` and `close`'s declared-items path in `commands.mjs`,
`round.mjs` and `notify.mjs` become dead, with tests in four files. Measured on the converted proof with no meaning
named: told 341 to 310, told without need 254 to 233, missed 21 to 31 (P15, P17, A07, Y07, Z01, Z02, V02, W17, U06,
T08: limits and meanings changed with no type or bound changed).

## Unknown, or for PROCESS

- The uses file still records `takesIn` (build text 2c; `usescmd.mjs`); notify no longer reads it. Whether to drop it
  from 2c and the writer is not done here.
- Design part 2 §7 and the design decisions still state the old rule; PROCESS edits those.
- The three readings marked ambiguous above (instances and `this` kept, the untyped constant kept, the code change
  under a standing type error dropped) are choices for the owner to confirm.
