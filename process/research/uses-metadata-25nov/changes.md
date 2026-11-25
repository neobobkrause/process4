# Telling a change users must hear of from one they need not, in JavaScript (25 Nov 2026)

Status: research for PROCESS #15, by a worker. Nothing in the repository is changed but this file; nothing is decided.
Read at origin/main d293cea. Builds on `design.md` (section 2 B), `proof.md` (the 45 and the 13), design part 2 §7 and
build text 2b. Scratch work (not kept): the prototype `mechlist.mjs`, `flags.mjs`, `analyse.mjs` and their results under
the session's scratchpad `changes/`; it reads the proof worker's `oracle.mjs`, uses files and test runs.

The owner's words (25 Nov, conversation, not a decision): "it's also important that jobs updating module code recognize
and properly handle external interface changes that providers need to be notified of from other changes that providers
don't need to be notfied of" (he means users). His rule (design part 2 §7): "any change to either a provider's domain or
range necessitates that its users be retested. But if both domain and range stay the same, then no retesting of users is
needed"; "Accepting more tells no one".

## Summary and bottom line

- **Domain and range, made exact for JavaScript.** An entry's *domain* is every call it answers rather than refuses,
  with what each part of the call must be and mean: arguments by position, fields of objects handed in, `this`, the state,
  files and environment it reads, how its program is started, and what a function handed to it must do. Its *range* is,
  for every call in the domain, everything another module can observe: the value (shape, kind, bounds, meaning,
  class-ness, identity, frozenness, value or promise), what it throws or rejects with (kind, code, throw or rejection),
  and its effects (rows, files, messages and their channel and framing, changes to arguments, what it hands to a
  function it was given, and when). A different answer inside the stated kind, bound and meaning (a new price, other
  digits in an id) changes neither, as the proof's P01 says ("a different valid answer, same domain and range").
- **Three JavaScript facts decide most hard cases.** Every JavaScript function already accepts every number of
  arguments and objects with any extra fields, so a new parameter or a newly read field is never "accepting more": calls
  that passed something there (as `map`, `forEach` and `then` do) now get another answer (X01, Z07, U10). A method that
  starts using `this` refuses calls it answered before, made without its handle (`list.forEach(rooms.add)`: T01, U07). A
  class instance is not plain data: JSON, `structuredClone` and spread keep only own plain fields, so an Amount built as
  an instance with private fields arrives as `{}` (Y02, Z05, V04; measured here: `JSON.stringify`, `structuredClone` and
  `{...a}` of such an instance all give `{}`).
- **The tool can list, soundly on the proof, every entry that may have changed.** Split the module into pieces, give
  each piece a digest of its syntax tree without comments, follow the reader's own resolution of names (and member names
  for calls through objects, path texts for programs and data files), and list every entry whose reach has a different
  digest before and after; add every entry whose listing changed. Prototyped and run on all 150 changes: it lists **all
  215** entries the oracle judges changed in the changed modules (0 missed). The code half alone misses 12 (in 4
  changes: values handed back from the store, whose kind's listing changed); an entry's **own** code alone, as
  `design.md` words it, misses **54 in 19 changes** (helpers, constants, data files and programs an entry reaches). So the
  list must follow what an entry reaches, not only its own lines.
- **It over-includes, here heavily.** 1,144 entries listed over the 150 changes (mean 7.6, median 5, max 32) against 215
  that changed (mean 1.4): about 70% of the entries of the modules changed. 36 of the 51 changes that change nothing
  list 250 entries the job must mark "unchanged". Most of the excess is kinds named by the changed code (39%), factory and
  handler functions whose text holds every member, and one behaviour under several names (`op:x`, `Handlers.x`,
  `Bookings.x`). The proof's modules are small and built round one factory each, which is near the worst case; the
  excess on civicsmith is not measured.
- **The job's judgement fits in 1,455 bytes** (section 4): changed what it accepts / changed what it hands back /
  accepts more only / unchanged, with the facts above written in.
- **Failure modes.** A job that marks nothing tells, by "unmarked counts as changed": 429 told / 330 without need / 0
  missed, against 187 / 89 / 1 for a job that marks as the oracle (today's tool: 116 / 62 / 45). Under-marking risk is
  judged: in 16 of the 93 changes with a real change, the job's own aim was internal or "compatible" and a language fact
  made it external; they hold 26 needed users (13 of them the breaks the proof lacked), and 25 of the 26 have their own
  tests fail, so they are caught at their next job; one (U10 bookings) only by a walk. Seven language flags the tool can
  compute (class instance, `this`, parameters, an argument changed, sync or async, timers, process streams) point at 9 of
  those 16, with the listing's words at 3 of them too.
- **Bottom line.** The owner's distinction can be made exactly and mostly mechanically in JavaScript: the tool decides,
  soundly on the proof, *which* entries may have changed (the job never has to remember them), and the job decides only
  *whether* each one's domain or range changed, by a short guide whose hard cases are three language facts. What remains
  unmeasured is how reliably a real job marks; the design's "unmarked counts as changed" bounds the damage of a lazy job
  to over-telling, and only a job that actively marks a real change "unchanged" loses a user, whom that user's own tests
  catch at its next job in 25 of the 26 risky cases on the proof. Two corrections to `design.md`'s option B: the list is
  of entries whose code *or code they reach in the module* changed, and a kind is listed with the entries that build or
  accept it.

## 1. Domain and range of a JavaScript entry

An **entry** is what the listing names (build text 2b §6: a function, value, kind, handle member, class member,
operation, stored table) or what a uses file's "offers" names (`design.md` 2 A: data files, programs, globals, registry
keys). Take an entry as a function from a **call** to an **outcome**. A call is everything the entry reads from outside
itself: its arguments, `this`, the state it reads (stored rows, module state another entry wrote, globals), files,
environment variables, the program's start arguments and input. An outcome is everything it does that outside code can
observe: what it returns or resolves to, what it throws or rejects with, and its effects.

- **Domain** D: the calls it answers rather than refuses, together with what each part of the call must be and **mean**
  (units, order, which field is which). Refusing is throwing or rejecting for a call, or not starting.
- **Range** R: for the calls in D, the set of outcomes it may produce, described at the level its users may rely on:
  kinds, shapes, bounds, meanings, the kinds and codes of what it throws, and its effects. A particular answer inside
  that description is **content**: P01's price, X02's id digits, T12's choice of which part gets a leftover cent.
- **Changed domain**: some call in D is no longer answered, or must now be or mean something else. **Accepts more**: D
  grew, and every call in the old D gets the same outcome as before. **Changed range**: some call in the old D now has
  an outcome outside the old R. The owner's rule tells users on a changed domain or range, and not on accepts more.

Errors sit on both sides: the calls an entry refuses define its domain; the kind and code it refuses them with are range
(V05: TypeError for RangeError changes range only; T04: refusing a full tally narrows the domain and adds an error).
Handing back *more* (a new field, a new error code: P10, W12) is a range change by the rule ("For what a provider hands
back, any change to an entry tells that entry's users"), even though no user's code need change.

### 1.1 Aspect by aspect

| Aspect | Domain or range | Accepts more? | JavaScript facts, and proof cases |
|---|---|---|---|
| Number of arguments | Domain | Never by adding a parameter | A function receives every argument passed; extra ones were ignored. A new parameter, even optional, gives calls that passed one (`map` passes the index, `forEach` the index and list, `then` one value, event emitters what they emit) another answer: **range** changed for those calls. X01, Z07, U10. |
| Order and names of arguments | Domain | No | Arguments are by place; same-kind arguments swapped change the meaning of every call (U08). A renamed argument is no change. |
| Optional, required, default | Domain; a default is range | Required → optional is, if the old calls keep their outcomes | Newly required: changed (P08). A new or changed default changes the outcome of calls that omit it: range. |
| Rest parameter | Domain | No | A list parameter becoming `...rest` makes `f([a, b])` mean one item (Z09). |
| Destructured or read fields of an object handed in | Domain | Only for a field no earlier caller could have sent | Objects carry extra fields (spread, whole rows passed on); a newly read field changes calls that carried it. A newly required field: changed. A newly optional field with a fresh name: accepts more (P07). |
| Accepted kinds and values | Domain | Wider bound, new variant, a refusal dropped | Narrowed bound or kind: changed (P09, P17, U06, X10's 30-second limit). A changed unit or meaning with the same kind: changed (W05 euros for cents, X03's clock). Dropping a refusal: accepts more, even if a user relied on it (Z01). |
| `this` | Domain | A method that stops using `this` | An ES module is strict code: a method called without its handle gets `this === undefined` and throws on `this.x`. A method that starts using `this`, or a handle rebuilt as a class (T01, U07), refuses detached calls (`forEach(rooms.add)`) it answered before. Arrow member to method, or method to arrow, also changes what `this` is. |
| A function handed in (callback, dependency) | Its answer and duties: domain. The arguments the entry hands it, how often, when, with what `this`: range | Asking less of it | T07: the price function is now asked `(nights, party)`: the entry's call of a user's function changed, a change to `createBookings`. Reading the callback's answer differently (a number now expected in euros) is domain. |
| What is returned | Range | No (more is a change) | Fields added, removed, renamed (P05, P06, P10); kind; bound; meaning (P15: total now one night). |
| Value or promise; iterator; stream | Range | No | Sync to async (a promise where a value was) or back; an array to an iterator (no `length`, one pass); a stream for a buffer; events emitted (names, payloads, order). |
| Class-ness and identity of what is returned | Range | No | JSON, `structuredClone`, spread and `Object.keys` see only own enumerable data; getters on a prototype and private fields are lost, the prototype too (`instanceof` false after a copy). An instance for plain data (Y02, Z05, V04) crosses a JSON door or a structured-clone store as `{}`. Handing back the held object instead of a copy (aliasing), or a frozen object (writes throw in strict code), changes range. |
| Changes to arguments | Range (an effect), and domain if some arguments are now refused | No | Sorting, filling or writing into an argument changes the caller's value; a frozen list now throws (Z10). |
| Thrown or rejected | Range (kind, `name`, `code`, stated fields); which calls throw is domain | — | Error kind (V05, A06, W03, T03, U03, Y01, Z06); a `code` added (W12: more, so a change); a throw becoming a rejection or back. A subclass of the stated kind is no change (U13). Message words are content unless the module states them. |
| Stored rows, files, messages, globals | Range (what is written); domain (what must already be there) | A new optional input file or setting | Rows: table name (U01), shape (A01, Y05, U02). Messages of a program: channel (X09, Y06, Z04, V03), framing (Z03, U04 blank lines; W02, T05 ready lines; T09 indenting), kinds (P20, A04). Globals and registry keys set or read. |
| How a program is started; environment | Domain | Dropping a requirement | A start argument (W01), an environment variable (U05), a working folder, a ready signal the starter must wait for (W02 is range for the reader). |
| Timing | Range; a deadline is domain | Lifting a deadline | Sync or async; a timeout added (X10: input must come within 30 s); order of callbacks or events. Extra `await` turns are content unless a user relies on ordering. |
| Exported constants and tables of data | Range (its value) | — | A bound, a list of names, a path or a key: changed (Z02 `MAX_CENTS`, P11 `ROOM_KINDS`). A stated content value (a price, a rate) that stays within its kind: content (P01). |
| Kinds (typedefs) | Range where handed back, domain where accepted | Where only accepted, a wider kind | A kind changes when any value of it can now differ in shape, bound or meaning (the bound line too). It changes with the entries that build or accept it. A pure rename concerns only users that write the name (P13). |
| Class members, constructor | As functions; the constructor's arguments are the class's domain | As functions | Y13 (constructor accepts differently), T04 (`Tally#add`), Z13 (`Tally.sum`). |
| Operation names in dispatch tables | Domain (names answered), and each operation's body and answer as a function | A new operation, if no other module answers that name | Retiring a name (P18). A body crossing a JSON door loses class-ness and `undefined` fields. A new name another module already answers changes that module's entry (X08). |
| Data files and programs a module offers | As values: format, keys, units (domain for readers); how started, protocol (as above) | New optional keys | U09 (prices in euros), V06 and W05 (export renamed in a file outside the interface). |
| Comments, formatting, local names, structure | Neither | — | A described entry is not a changed one (design part 2 §7). A function rewritten as an arrow is unchanged unless it was called with `new` or `this` (U15). Field order in a literal is content unless users read JSON text by position (W13). |

**Where "accepting more" applies.** Only on the domain side, and only when every call answered before gets the same
outcome: a refusal dropped (Z01, X05), a wider bound or new accepted variant (P11's `Rooms.add`, V14's overload), a newly
optional input with a fresh name (P07), a requirement dropped. It never applies to a new parameter of a function, to a
field read from inputs that may already carry it, or to anything handed back.

## 2. What the tool can determine mechanically

### 2.1 Facts with certainty

- **Which files and which pieces changed.** A piece is a top-level declaration, a local function or variable, an object
  or class member, or a top-level statement (the build text 5 §7 pieces, refined). Its digest is its syntax tree with
  comments, whitespace and redundant parentheses dropped, every name, literal and operator kept. Equal digests mean the
  same code; a comment-only change (the 2b forms are all comments) changes no digest.
- **What each piece reaches inside the module.** The reader resolves each name to its declaration (scope-exact, through
  imports between the module's files); calls through an object (`x.m()`, `this.m()`) reach every member named `m` that
  is a function (dispatch by name, so sound for dynamic calls); a computed member call reaches every function member; a
  text that names a file of the module (`new URL('./worker.mjs', import.meta.url)`, `'./prices.json'`) reaches that file;
  a file's top-level statements are reached by all of it (they run on import). The tool's related list already builds
  such a graph (`tool/lib/notice/related.mjs`, ~250 lines).
- **Which entries start where.** An exported function or value starts at its declaration; `Handle.m` and `Class#m` at
  the members named `m`; `op:x` and `table:x` at every piece that reaches the text `x` or a member named `x`; a kind at
  every piece that reaches code or a type comment naming it, and with any listed entry whose kind text names it; a data
  file or program at the file.
- **The listing's differences** (build text 2b §6), as today.

### 2.2 The list, and why it is sound

**The list** = every entry, present before or after, whose reach has a different digest before and after (new and
removed entries included), plus every entry whose listing differs. An entry's behaviour is a function of the code it
reaches, the values it is handed, and the state and environment it reads. If no piece it reaches changed, its code is
the same; what it is handed comes from users or providers (their own changes and notices); so within the module, the
only ways left for it to change are listed below, with the rule that closes each.

| Way an unlisted entry could still change | Closed by |
|---|---|
| A value it hands back was written by changed code into shared state (rows, a cache, a module variable) | The kind of that value is listed (the changed writer names it) and its listing changes where stated; uses files record the kind. In the prototype, the code half missed exactly these: 12 entries in P06, P10, P11, X07 (`Rooms.find` handing back rows with a renamed field), all caught by the listing diff. Optional tighter rule: list every entry that hands back a listed kind (not measured). |
| A provider's change, or a kind passed on through a middle module | The provider's own list and the uses file's "through" route (the proof's A14, P26) |
| A package's version (`node_modules`) | Treat each import of a package as a piece whose text includes the locked version |
| Code the reader cannot resolve: `eval`, `new Function`, `import()` or `require()` of a built path, `Reflect`, `Proxy` | A piece holding one reaches every piece of the module |
| A data file read by a built path | A piece that reads files by a built path reaches every data file of the module |
| Node's own version, the process config | Outside a job's change; the walk |

**Measured on the proof** (all 150 changes; the oracle as `proof.md` §2.2 defines it; "own" entries are those of
modules whose source files the change touches, 215 in all):

| List | Entries listed (sum / mean / median / max) | Oracle's own entries missed |
|---|---|---|
| Own code of the entry only (`design.md`'s wording) + listing diff | 801 / 5.3 / 3 / 31 | **54 in 19 changes** (helpers: T03, Z06, W03, U03; constants and data files: Z02, W17, U06, T08, Y07; the program: W01, U05; T02's operation) |
| Reach by calls (as 2.1) | 938 / 6.3 / 5 / 22 | 12 in 4 changes (state, above) |
| **Reach by calls + listing diff (recommended)** | **1,144 / 7.6 / 5 / 32** | **0** |
| Reach by calls and by data (fields by name, writers of variables) + listing diff | 1,328 / 8.9 / 6 / 32 | 0 (code half alone: 10) |

The list also settles the two real misses the proof's design did not accept: T04's `Tally#add` (own code changed) and
T07's `createBookings` (its statement that calls the price function changed) are both listed; T02's `op:bookquote`
reaches `quote`, so the bound no longer stops short of the operation. X08 (a new operation whose name bookings already
answers) is caught by the listing's existing "now answers the same name" route.

### 2.3 How much it over-includes, and why

On the proof the recommended list holds 905 entries the oracle does not count as changed, against 215 it does: about
6 extra per change, 70% of the entries of the changed modules (mean 10.9 entries). By sort: kinds 349 (39%), factory and
handler functions 143, handler-table members 130, handle members 111, functions and values 64, operations 61, tables 47.
In the 51 changes that change nothing, 36 list something (250 entries; X06's reworded bound alone lists 30 through the
listing), and 15 list nothing.

The causes are structural, not noise: each proof module is one file built round one factory, so the factory's text holds
every member and every member reaches the store's table text; the changed code names its kinds; and one behaviour has
three names (`op:bookquote`, `BookingHandlers.bookquote`, `Bookings.quote`). Ways to cut it without losing soundness
(none measured): a container's digest leaves out the bodies of its members listed as entries of their own, unless the
changed member code reads the container's own arguments (so T07 still lists `createBookings`); a kind is listed only with
an entry whose listing accepts or hands it back, not with every piece that names it; the tool groups entries with the
same reach into one line to mark; local names are normalised before the digest. On civicsmith, whose modules average
about six source files, the list grows with the changed pieces' callers inside the module, so it should be a smaller
share of each module; that is inference, not measured.

### 2.4 Flags the tool can add beside a listed entry

Facts of the language the tool can see in what an entry reaches, before and after, shown as a flag (not a refusal).
Measured over the proof's listed entries (really changed / listed but not changed): a class with getters or private
fields now reached 12 / 9; `this` used or no longer used 16 / 30; the entry's own parameters 13 / 36; an argument now
changed 1 / 0; `async` or `await` 2 / 0; timers 3 / 2; `process` or `console` use 6 / 20. Broader facts (numbers,
texts, object fields built, kinds thrown) fire on half of all listed entries and are better shown as the diff itself.
Most false flags are on new entries, which tell no one and need no flag, or are the prototype's parameter flag on a
table; with those left out, the seven flags fire on listed entries in 5 of the 51 changes that change nothing (Z18,
V07, V12, W11, U13).

## 3. The job's judgement

The job sees, for each listed entry: why it is listed (the changed pieces it reaches, with their hunks), its listing
before and after, and the flags. It marks each entry once, with one line why. Marks: **accepts** (changed domain),
**hands back** (changed range), **both**, **accepts more**, **unchanged**. The lookup tells the users of an entry marked
accepts, hands back or both, or left unmarked; the direction is for the told job and for the record. A group the tool
shows as one line is marked once.

### 3.1 The guide (for the job's instructions; 1,455 bytes)

> What changed, entry by entry. The tool lists each entry whose code, or code it reaches in the module, changed, and each
> whose listing changed. Mark each, with one line why:
> - accepts: a call it answered before is now refused or means something else: an argument, field, `this`, file,
>   environment variable or start argument newly needed; arguments reordered, renamed or in other units; a default
>   changed; a handed-in function called with other arguments, in another order or at another time, or its answer read
>   differently.
> - hands back: for a call it answered before, something another module can see differs beyond its stated kind, bound
>   and meaning: fields, kinds, error kind or code, value or promise, a class instance for plain data (JSON,
>   structuredClone and spread keep only own plain fields), a frozen or shared object, an argument it now changes, rows,
>   files, messages, their channel or framing.
> - accepts more: calls refused before are now answered, and every call answered before gets the same answer. A new
>   parameter or newly read field is not this: calls with extra arguments (map and forEach pass them) or extra fields
>   were answered before and now differ.
> - unchanged: the same calls answered, answers within their stated kind, bound and meaning (a new price, other digits in
>   an id), however the code is now written.
> A kind changes when a value of it can differ in shape, bound or meaning. Unmarked counts as changed; if unsure, mark
> changed.

### 3.2 Worked examples from the 45 and the 13

| Case | Listed entry (flags) | Mark, and why |
|---|---|---|
| P15, P14 | `Bookings.quote`, `op:bookquote` | hands back: total now means one night (same kind, other meaning) |
| P17, A07, W04 | `Bookings.open`, `op:bookopen`, `BookingRequest` | accepts: a party over 100, a note over 140 characters, now refused |
| Z02, W17, U06, T08, Y07 | `amount`, `add`, `Amount`, `MAX_CENTS` | accepts: amounts over 500,000 refused; `MAX_CENTS` hands back a new bound. U06's change is in `limits.json`, which `amount` reaches |
| V05, A06; W03, T03, U03, Z06 | `splitEvenly`; `Bookings.quote`, `op:bookquote` (throws) | hands back: refused with TypeError, or Error with a code, where the stated kind was RangeError. T03's helper is reached |
| T04 | `Tally#add` | both: a full tally is now refused, with Error |
| T07 | `createBookings` | accepts: the price function handed in is asked `(nights, party)` where it was asked `(party, nights)` |
| U08 | `Bookings.quote` | accepts: nights and party swap places |
| Y02, Z05, V04 | `amount`, `add`, `splitEvenly`, `Amount` (class instance, `this`) | hands back: an instance with private fields for plain data; through the door's JSON and the store's structured copy it is `{}`. The job's aim (immutability) is internal; the range change is the language's |
| T01, U07 | `Rooms.add`, `Rooms.find`, `Rooms.list` (`this`) | accepts: now needs its handle as `this`; `forEach(rooms.add)` throws |
| X01, Z07, U10 | `formatAmount`, `Rooms.find` (parameters) | hands back: a second argument, which `map` passes, now changes the answer. Not accepts more |
| Z10 | `listWords` (an argument changed) | both: sorts the caller's list; a frozen list now throws |
| A01, Y05, U02, U01 | `table:bookings` | hands back: rows kept in another shape or table. Rows other modules read are range, even when the handle "keeps its interface" |
| X09, Y06, Z04, V03 | `MeterMsg` (process streams) | hands back: refusals on standard error |
| Z03, U04, W02, T05, T09 | `MeterMsg`, `WORKER_FILE` | hands back: blank or ready lines, indenting: what a reader of each line receives |
| W01, U05 | `WORKER_FILE` | accepts: the program now needs a start argument, or `METER_CURRENCY` |
| W12 | `add` | hands back: an error code is more, and more tells |
| A14 | `Amount` | hands back: `cents` renamed; front is told by its uses file's route through bookings |
| Z01 | `Bookings.open`, `op:bookopen` | accepts more: a party above the seats is answered, and old answers are unchanged. Tells no one; front's test relied on the refusal (the rule's accepted miss) |
| P01, X02, T12 | `PRICE_PER_SEAT_NIGHT`, `Bookings.open`, `splitEvenly` | unchanged: a new price, other digits, another part gets the cent, all within stated kind and meaning |
| U13, U15, W13 | `amount`; text-rules' functions; `Booking` | unchanged: a subclass of the stated error; arrows nobody calls with `new`; field order |
| Most bookings changes | `createBookings` (its text holds every member); `Booking` (named by the changed code) | unchanged, unless what the factory does with its own arguments changed (T07, X03) or a Booking can now differ |

### 3.3 What goes into a build text instead

The table of 1.1 (the job's reference, read when a case is hard, not in the job's instructions); the tool's list (the
pieces, the digest, the edges, how each sort of entry starts, the fallbacks of 2.2); the flags of 2.4 and their wording;
the statement's form in the pull request (one line per entry or group: entry, mark, why) and that the lookup reads it
from the merged pull request; that an unmarked entry counts as changed; grouping; and the measured numbers here as the
proof's.

## 4. Failure modes

### 4.1 A job that marks a real change "unchanged" (or "accepts more")

Judged on the proof (the changes' titles are the job's own account of its aim): of the 93 changes with a real change in
their own modules, 77 change the entry on purpose (a bound lowered, a field renamed, an error kind chosen, a channel
chosen); a job asked about that entry, with the diff beside it, has its answer in its own aim. 16 of the proof's 19 a2
cases are of this kind: the job forgot to update a comment, which the list no longer depends on. In **16** the aim is
internal or meant to be compatible and a language fact makes it external: Y02, Z05, V04 (immutability by a class), T01,
U07 (state in one place, by `this`), X01, Z07, U10 (an optional parameter), A01, Y05, U02 (rows thought internal), W02,
T05, Z03, U04 (lines "readers skip"), W12 (more). These hold **26 needed users** (by `needs` and by the users' own test
runs; today's tool tells one of them). How often a real job errs on them is not measured.

What catches one: the user's own tests the next time its job runs, if it runs (25 of the 26 fail their own tests: the
proof's test runs before and after each change); else a walk (U10's bookings, which names the kind and has no test
showing it). Z01's user is lost by the rule, not by the job, and is caught the same way.

### 4.2 A job that over-marks, or does not mark

Each user told without need is a told job that runs its related tests and closes with nothing to change (on civicsmith's
t2, about 163 of 324 job pull requests closed with nothing to change). Measured with the proof's uses files, against its
`needs`:

| Marking | Told / without need / missed |
|---|---|
| Today's tool (inferred uses, listing diff) | 116 / 62 / 45 |
| The job marks nothing: every listed entry counts as changed | 429 / 330 / 0 |
| The same, with the data-flow list | 430 / 331 / 0 |
| The job marks as the oracle, on the recommended list | 187 / 89 / 1 (Z01) |
| The oracle, provider's own entries only (`proof.md`) | 183 / 86 / 2 |

So a job that skips the marking costs 242 told jobs over the 150 changes (about 1.6 a change) and loses no one; marking
pays for itself in told jobs, not in safety. Against the users whose tests really break, the oracle row misses 7: Z01,
and P28 and A13's knock-on breaks in billing, front and reports (fixing rooms and bookings fixes them).

### 4.3 Making the marking more reliable without a test, gate, review or stop

1. **An unmarked entry counts as changed** (`design.md` B). A job that skips or rushes over-tells, never under-tells.
2. **The list shows its reason**: for each entry, the changed pieces it reaches with their hunks, and the listing before
   and after. The job judges the code it changed, not its memory of it; the 19 forgotten comments were memory.
3. **Flags beside the entry** (2.4), worded as the language fact ("a class instance with private fields: JSON and
   structuredClone give {}", "now uses `this`: calls without the handle throw", "a new parameter: callers passing an
   extra argument, as map does, get another answer"). On the proof they point at 9 of the 16 risky changes. The tool
   may pre-mark a flagged entry "changed (flag)", which the job may change with a line why; nothing refuses.
4. **The guide in the job's instructions** (3.1), which names the three facts.
5. **Grouping**: one line per behaviour, so `op:x`, `Handlers.x` and the handle member are not marked three ways.
6. **A test-expectation flag**: a test file of the module whose changed lines name the entry and change what they expect
   (a value, an error kind) is shown as a flag; it is the old "bound test changed" rule without its refusal. Not
   measured here; A07, Y07, T08, V02, V05 and Z01 change such tests.
7. **A record, to measure it in force**: a job whose tests fail on a provider's entry marked "unchanged" or "accepts
   more" says so in its pull request, naming the provider's pull request. That is the measure this research lacks.

## 5. What is measured and what is judged

- **Measured** (prototype on all 150 changes, TypeScript 5.6.3's reader, scratch): the list's sizes and contents at
  three depths, its misses against the oracle, the flags' counts, the told counts with the proof's uses files and the
  users' own test runs; `JSON.stringify`, `structuredClone` and spread of an instance with private fields giving `{}`;
  `map` passing the index into a new optional parameter; a frozen list's `sort` throwing TypeError.
- **Judged**: the definitions and table of section 1 (from the language's rules, checked against the oracle's calls);
  the oracle itself (`proof.md` §4 lists its judgement calls); which 16 changes are risky for a job (from their titles);
  the guide's wording; the remedies for over-inclusion and the soundness fallbacks of 2.2, which were not built.
- **Not measured**: how reliably real jobs mark; the list's size on civicsmith; the cost of the grouping and container
  refinements; whether the tighter kind rule of 2.2 (every entry handing back a listed kind) stays useful in size.
