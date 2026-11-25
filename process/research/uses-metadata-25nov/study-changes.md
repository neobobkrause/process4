# What changed, studied from the language: the sound list, the undecidable mark, and the means (25 Nov 2026)

Status: research for PROCESS #15, by a worker (study C). Nothing in the repository is changed but this file; nothing is
decided. Read at 983f7c0. Builds on `changes.md` (the tool's list, the job's marks, the guide), `design.md` §2 C and D,
`standard.md` §2.2 (S1–S13) and `every-reference.md` §3.1 (R1–R12). Scratch work (not kept), under the session's
scratchpad `study-c/`: `sound.mjs` (the dependence closure of §3, built on `changes.md`'s prototype), `means.mjs` (the
stated types compared, and the strict checker's new errors), `owntests.mjs` (each provider's old tests run on its new
code), `classify.mjs` (the 118 needed users of §2.6), `an2.mjs` (counts).

The owner's question (25 Nov, conversation): "is this a load-bearing design that will work? If there are areas that
you're not sure if they'll work, how can we determine whether they will work, not based by testing existing code but by
studying the language?" His later points, relayed by PROCESS #15 the same day (conversation, not marked): "is the question
whether the answer changes or simply whether the means by which a user gets an answer changes? Because if the means by
which the use a function is the same, then does the user still need to be notified?"; "If the implementation of a
function changes, for example, from 'whole stay' to 'one night', then that change will be documented in the design and
requirements. That change will be identified and propagated by ARCH and design lanes. So the build tools just don't have
to worry about that. Correct?"; and, of a deliberate change of meaning, "the job that is told of this change must be
tasked not just with making that change but ensuring that that change is communicated as an interface change that users
must be notified of."

## Summary and bottom line

- **Recommended: tell on a change of the means, nothing else; no marks, no judgement by the job.** The *means* of an
  entry is what the standard makes a user's code depend on mechanically: its stated types (S4, checked by the strict
  checker), deeply expanded through every kind they name, plus a few facts the tool computes from the entry's code (the
  error kinds and codes it can throw, whether it needs its handle as `this`, whether it hands back a class instance or
  plain data, which arguments it changes, which channels, files and settings it reads and writes). "Did the means
  change" is decided by comparing two finite descriptions: **decidable, with certainty** (§2.3). Whether the *answers*
  changed is not decidable (Rice's theorem, §4.1), so the design must not rest on anyone deciding it.
- **A change of meaning under the same means is not the notice's to find.** As the owner says, a deliberate one is
  ARCH's: ARCH's placed work names the items whose meaning it changes, and the tool tells their users when that job
  merges (§2.7), so it does not rest on the job remembering. The standard also asks the job to make a change of meaning a
  change of means wherever a type can carry it (a new named kind: `Nights` for `PartySize`, `Euros` for `Cents`,
  `NightTotal` for `StayTotal`), so the tool sees it with certainty. An accidental one is a bug, caught first by the
  provider's own tests: both meaning changes on the proof (P14, P15) fail the provider's own old tests (run, §2.7).
- **On the proof** (118 needed users: 99 the proof names plus 19 whose own tests newly fail), classified one by one
  (§2.6): **50** are told by today's stated types once S4 is in force (46 by the types as listed now, 3 by S4 and the
  strict checker, 1 by the existing name-clash route); **26** more by a means that also carries the computed facts and
  brands (error kinds 8, class instance for plain data 12, `this` 3, brands for same-kind values 3); **18** are not
  users at all once the standard is kept (they read another module's rows, streams, start arguments or files directly,
  which S5, S6, R2 and R12 send through the owner's reader, so the owner's change is matched in the owner's own code);
  **6** are knock-ons that vanish when the told user is fixed; **16** are value-level changes (a bound or a format:
  "a party may now be at most 100", slugs with underscores), all deliberate on the proof; **2** are changes of meaning
  (P14, P15). The last 18 are what the means cannot see; they are ARCH's when deliberate and the provider's tests' when not.
- **Compared on the proof** (94 needed users once the standard is kept; told / told without need / missed): every
  listed entry told, sound list: 444 / 350 / 0; the job's judgement as the oracle: 187 / 94 / 1; the means as today's
  types: 111 / 61 / 44; **the means with the computed facts and brands: about 157 / 81 / 18 (estimate)**; with ARCH
  naming the items of its placed changes (the 16 value-level and 2 meaning changes): **about 204 / 110 / 0
  (estimate)**. The means row rests on no one's judgement; its misses are exactly the changes ARCH places.
- **Question 1, the list's soundness.** The 215 of 215 was empirical; by construction the list was not sound. An
  entry's behaviour (its outcomes over every sequence of calls to the module) depends on code it never calls: whatever
  writes state it reads (module and closure variables, fields of objects by name, contents of containers, the state of
  providers and dependencies handed in), and the code that calls those writers. The prototype's recommended list follows
  calls only; with data dependence switched off, the closure of §3 misses 16 oracle entries on the proof, and the
  prototype's own code half missed 12, caught only by the listing diff. §3.2 gives the rule that is sound under the
  standard: a closure over control edges (calls, references, dispatch by member name, getters and setters, implicit
  calls, module start-up code and its order), then the writers of every location read, then the callers of those
  writers, to a fixpoint. It rests on the slicing theorem (Reps and Yang). Built in scratch: the code half alone misses
  **0** of 215 (no listing diff needed), and lists 1,418 entries (87% of the changed modules' entries; the prototype
  938). Under the means rule it is not used to tell; it is what the computed facts of the means are computed over.
- **Question 2, "unchanged".** Undecidable, rigorously (§4.1: a reduction from the halting problem that keeps the
  standard and keeps the stated types). Decidable sub-cases exist (identical closure, identical up to renaming), but on
  the proof they cover 188 of 1,606 listed entries (12%), all of them entries listed only because their written
  description changed; renaming covers none. So "unchanged" by proof saves almost nothing, and "unchanged" by the job's
  judgement is the one step that can lose a user. The load-bearing choice is not to ask the question.
- **Cost.** Brands, typed refusals and the computed facts are the new part: brands are a per-kind judgement in each
  module's first job (H), on top of S4, which `design.md` already judges the largest cost; the computed facts are tool
  work over the closure of §3 (thrown kinds, `this`, class instances, argument writes, channels), with no change to code.
  What is gained: the job's marking and the guide of `changes.md` §3 are removed, the told set is a pure function of two
  versions' texts, and a told job without need runs its related tests and closes (0.5 to 0.7 a change on the proof).

## 1. Definitions

- **Module P, entry e.** As `changes.md` §1: an exported function, value, kind, handle or class member, operation,
  stored table, data file or program of P.
- **Call, outcome, trace.** A call to e is its arguments, `this`, and what it reads from outside P's code (providers'
  answers, functions handed in, files, settings, clock). An outcome is what it returns or resolves to, what it throws or
  rejects with, and its effects. Because entries share state, an entry is not a function of its call alone; the
  behaviour of P is the set of its **traces**: sequences of calls by the environment (users, providers' answers) to any
  of P's entries, each with its outcome. The **behaviour of e** is, for every trace, the outcomes of the calls to e in it.
  This is contextual (observational) equivalence restricted to P's interface, the standard notion for modules with state.
- **Domain and range, literally.** The domain of e is the set of calls it answers; the range is the set of outcomes it
  can give. Literally these are sets, not the mapping between them: `f(x) = x + 1` becoming `x + 2` keeps both (all
  numbers in, all numbers out). `changes.md` §1 widened range to "described at the level its users may rely on: kinds,
  shapes, bounds, meanings", which brings the mapping back in through "meaning".
- **The means of e** (§2.2): its stated interface under the standard, fully expanded, plus facts the tool computes from
  its code. A *change of means* is a difference between the means before and after.
- **Changed answer under the same means**: a difference in behaviour with the means equal. It splits into a *value-level*
  change (the set of accepted or produced values changes within the same types: a bound, a format) and a *change of
  meaning* (the same sets, another mapping or unit: one night for the whole stay).

## 2. Recommendation: tell on a change of the means

### 2.1 Why the means

Three facts from the language and from computability fix the design:

1. Whether the answers of an entry changed is undecidable (§4.1), even within the standard and even with the stated
   types unchanged. Any design that tells "only when the answers changed" rests on someone's judgement of an undecidable
   question; on the proof that judgement is where the only real losses are (`changes.md` §4.1).
2. Whether the means changed is decidable with certainty (§2.3): two finite descriptions are compared.
3. Under the standard, a user's code depends on a provider only through the means (S1–S13, R1–R12: every reference is
   to an entry, by name or by kind; values from another module's channel only through that module's reader). So every
   change a user's code depends on *mechanically* — would fail to type-check, would call wrongly, would catch the wrong
   error, would parse wrongly — is a change of means, provided the means carries the facts in §2.5. What is left is a
   user that depends on *what the answers are*: that is the requirements' business, which ARCH owns.

### 2.2 The means, defined

For each entry e, before and after:

| Part | What it is | Where it comes from |
|---|---|---|
| **M1 Stated kinds** | What e accepts (parameters in order, optional, rest; fields of objects handed in; the functions handed in and what they are called with) and hands back (value, promise, iterator), each kind expanded member by member through every kind it names, the providers' kinds included, with the kinds' names kept (a user may write a name, P13) | S4(i) JSDoc kinds, read by the checker; today's listing already holds this as `accepts`, `handsBack`, `decl`, `side`, `rowKind`, `channel` |
| **M2 Named kinds for meaningful values (brands)** | `Nights`, `PartySize`, `Cents`, `Euros`, `IsoDay`, `Instant` as distinct kinds, made only in their own module (R13 of `every-reference.md`) | written by the job; checked by the checker (a swap of two parameters of the same base type is then a type error and a change of M1) |
| **M3 `readonly`** | arguments e must not change are stated `readonly` | written; checked (a `sort` on a `readonly string[]` is a type error, Z10) |
| **M4 Thrown kinds** | every error class and literal `code` that can leave e: `throw new K(...)`, `throw Object.assign(new K(...), { code: 'X' })`, and the thrown kinds of the providers' entries e calls, over e's closure (§3.2) | **computed** by the tool, composed across modules like the checker's kinds; a subclass of a listed kind is the same kind (U13) |
| **M5 Plain data or instance** | for each kind handed back or accepted: plain data (own fields only) or a class instance (prototype, getters, private fields) | **computed** (R11 already walks values handed to `JSON.stringify`, `structuredClone`, spread); the checker's structural typing cannot see it, since a class with getter `cents` is assignable to `{ cents: number }` |
| **M6 `this`** | whether e needs its handle as `this` | **computed** over e's closure; stated by `@this` |
| **M7 Effects on arguments** | which arguments e writes into | **computed** from the closure's writes (§3.2) to locations reached from parameters |
| **M8 Channels, settings, start** | for a program: its start arguments and environment variables, which message kinds on which stream, framing; for any entry: files, tables and settings read or written, with their row kinds | under S5, S6, R12 these go through the owner's entries (`startMeter(currency)`, the owner's reader), so they become M1 of those entries; otherwise **computed** from the closure (`process.stdout`, `console.error`, `process.env.X`, `process.argv`, store calls with a literal table) |
| **M9 Sync or async** | value or promise | in M1 (`Promise<T>`) |

A **type error** in e's code under the strict checker counts as a change of e's means (nothing refuses, as design part
2 §6 asks; the error itself is a defect for the job). P16 shows why: the code hands back `{ ok, reason }` while the stated
kind says `boolean`; the checker reports it (run, §2.6), so the stated kind must move, or the entry is told.

### 2.3 Why "did the means change" is decidable with certainty

- **Decidable.** M1–M3 and M9 are type expressions; expanded with names kept and cycles cut at a name, each is a finite
  tree. M4–M8 are finite sets computed over a finite closure. Comparing two finite trees or sets is decidable (linear in
  their size). Note what is *not* claimed: whether two different type expressions denote the same set of values is a
  semantic question, and TypeScript's type language is rich enough (conditional and recursive types) that it is not
  decidable in general; the comparison is textual after normalising (`Array<A>` and `A[]`, union order, optional as
  `| undefined` under `exactOptionalPropertyTypes`), so it can say "changed" for an equivalent rewrite (T12's
  `Array<Amount>`), never "unchanged" for a different one. That is the safe direction.
- **Certain: a job cannot change the means unseen.** For M1–M3 and M9 the stated kinds are the means, and the checker
  forces code to conform: if the code hands back or accepts something outside its stated kinds, the check fails, which
  counts as a change. This holds exactly as far as the checker is sound; its documented unsound points are closed by the
  standard (R1 no `any`; R2–R4 casts only where an own channel is decoded; R5–R7 the tool's own checks of method
  parameters, writable members and extra parameters; R10 no suppression), plus two settings this use needs that
  `every-reference.md` lists as optional: `noUncheckedIndexedAccess` (an index read may be `undefined`: V09's `pop`
  after a length check) and `exactOptionalPropertyTypes`. One more rule is needed for stored data: a cast is allowed on
  the decoding read only, never at the write (Y05 wrote its row "as a Booking" by a cast; under the rule the write is
  checked against the stated row kind, so a new row shape is a change of `rowKind`). M4–M8 are computed from the code
  itself over a sound closure (§3), so they cannot drift from it; they over-approximate (a kind that may be thrown is
  listed), so a change can be reported where behaviour is the same (T16's helper keeps its kinds, so it does not), never
  missed.
- **What it rests on.** The pinned checker computing kinds as documented, as `every-reference.md` §4 rests the
  reference side; the closure's rule (§3); the standard kept (a place outside it is listed and told of every change, as
  `design.md` B already does).

### 2.4 Domain and range, read literally, and the means

The owner's rule (design part 2 §7) speaks of domain and range: sets. Read literally, `x + 1` becoming `x + 2` changes
neither, and the rule tells no one; "a different valid answer, same domain and range" (P01) says the same. The means is
the checkable form of those sets: M1–M3 state them as kinds, M4 states the refusals' kinds, M5–M8 the rest of what a
user's code can touch. Where a type can carry the set exactly, a change of the set is a change of means. Where it cannot
— a numeric bound (`1 to 100`), a text format (only `a-z`, `0-9` and underscores) — the set changes within the same
types: the value-level changes of §2.6. A bound can be brought partly into the means by a rule (each bound an exported
constant of literal type, `MAX_PARTY: 100`, which the refusal must use: S13's "obtain every fact from its owner"), but
the checker cannot force a refusal to use it, so that part is a convention, not a certainty. The mapping between the
sets (meaning, units within one kind) is outside the literal rule and outside any type unless a brand names it.

### 2.5 What the means must contain, and what each part costs

| Part | Needed users on the proof it tells that today's types do not | Enforced by | Cost |
|---|---|---|---|
| S4(i) every export states its kinds; strict checker; a type error counts as a change | 3 (P16, Z15, T06) | checker | `design.md`'s largest judged cost; already in option C |
| M4 thrown kinds and codes, computed | 8 (A06, Y01, Z06, V05, W03, U03, T03, T04) | tool over the closure | tool only; ~100–150 lines on §3's closure (judged) |
| M5 class instance or plain data, computed | 12 (Y02, Z05, V04: bookings, meter, billing, front each) | tool (R11's walk) | tool only |
| M6 `this`, computed | 3 (U07, T01 ×2) | tool | tool only |
| M2 brands for same-kind values and units | 3 (U08, T07: nights and party swapped; X03: a day for an instant) | checker | per-kind judgement in each module's first job; cascades to every user that builds such a value (it must call the owner's maker); unmeasured, judged the next largest cost after S4 |
| M3 `readonly` | 0 extra on the proof (Z10's comment-borne read-only is already in today's kinds) | checker | low |
| M7, M8 computed effects | 0 extra once S5, S6, R2, R12 are kept (the 18 of §2.6 S become the owner's own code) | tool | tool only |
| Typed results instead of throws (`Result<T, E>`) | none beyond M4 | checker | high (a rewrite of every refusal); **not recommended**: M4 gives the same certainty by computation |

### 2.6 The proof's needed users, one by one

Needed users: the 99 the proof names (`expected.json` "needs") and the 19 later modules whose own tests newly fail after
the change (the proof's test runs): 13 real breaks the proof lacked and 6 knock-ons. 118 in all. "Told by today's types"
is measured: the listing's type parts (`kind`, `accepts`, `handsBack`, `decl`, `side`, `rowKind`, `channel`) compared
before and after for every entry, removed entries included, new entries telling no one, then the proof's uses files. The
other categories are judged from each change's diff and title.

| Category | Users | Which |
|---|---|---|
| **A0** Means changed, today's stated types | 46 | P03 front; P04, P05, P19, P20, P23 billing; P06 bookings, front; P08 billing, front, reports; P13 bookings, meter, billing; P18, P25, P27 front; P26 bookings, meter, billing, front; P28, A13 rooms, bookings; A04 billing; A14 bookings, meter, billing, front\*; X01, Y03, Y13, Z08, Z09, Z13, Z14, V01, W06 billing; X07 bookings; Y04, Z07, Z10, Z11 front; U10 bookings, front |
| **A1** Means changed once S4 and the strict checker are in force | 3 | P16 front (the checker reports the hand-back against `boolean`); Z15, T06 reports (calendar states no kinds today) |
| **A-clash** The listing's existing "now answers the same name" route | 1 | X08 billing |
| **B-throw** M4 thrown kinds | 8 | A06, Z06, V05, W03, U03, T03, T04 billing; Y01 front (A06, Y01 and Z06 also by their `@throws` lines, where the job updated them) |
| **B-class** M5 class instance for plain data | 12 | Y02, Z05, V04: bookings\*, meter\*, billing\*, front\* |
| **B-this** M6 | 3 | U07 reports; T01 front, reports |
| **B-brand** M2 | 3 | U08, T07 billing (same-kind parameters swapped); X03 front (the clock handed in must now give a day, not an instant) |
| **S** Not a user once the standard is kept | 18 | rows read directly (S5, R2): A01, Y05, U01, U02 reports; a program's streams and framing read directly (S6, R2): X09, Y06, Z04, V03, Z03, U04, W02, T05, T09 billing; a program started directly (S6, R12): W01, U05 billing; another module's files read directly (S5): V06, W05, U09 front |
| **K** Knock-on of a told user's break | 6 | P28, A13: billing\*, front\*, reports\* (rooms and bookings are told, A0; fixing them fixes these) |
| **V** Value-level: a bound or a format within the same types | 16 | refusal bounds: P12, Y07, Y08, Z02, W17, U06, T08 bookings; P17, A07, W04, Z01 front; V02, T02 billing; text format: A03 rooms, front; Z12 rooms |
| **C** Meaning under the same means | 2 | P14, P15 billing ("total now means one night") |

\* a break found by running the user's own tests, not in the proof's list.

Notes. The 18 of S are users only because their code reaches past the owner: under the standard the reader, starter or
accessor is the owner's, the owner's change updates it in the same pull request (its own tests run it), and the user's
code, which names only the owner's typed entry, is unaffected, or, where that entry's kinds change, is A0. W05 and U09
(prices in euros) would in addition need a brand (`Euros` for `Cents`) once the price is read through the owner's
accessor. Z01 (a refusal dropped, "accepts more") tells no one by the owner's rule and breaks front's test, which relied
on the refusal.

### 2.7 Value-level and meaning changes: ARCH's, and the provider's own tests

**Deliberate changes.** Every V and C change on the proof is deliberate: its title states the new bound, format or
meaning as the aim ("A party may now be at most 100", "Slugs join words with underscores, as the venue's booking system
needs", "bookquote's total now means one night"). Under design part 2 §8 such a change is ARCH's to decide before it is
built. The recommendation, on the owner's words:

1. **ARCH's placed work names the items whose meaning or values it changes** (entry, and "accepts" or "hands back"), in
   the work it places. The tool reads that list from the placed work and tells those items' users when the job's pull
   request merges, exactly as it tells a change of means. The told set is then the union of two mechanical sets: the
   means' differences, and ARCH's named items. Nothing rests on the job remembering.
2. **The standard asks the job to make a change of meaning a change of means where a type can carry it**: a new named
   kind (`NightTotal` in place of `StayTotal`, `Euros` in place of `Cents`, `IsoDay` in place of `Instant`), so the tool
   sees it with certainty and every user's code that handles the old kind fails to check until it is moved. This is the
   same rule as M2, applied to the change at hand.
3. **A job that changes a value or a meaning that its placed work does not name** is outside the process (the change is
   ARCH's to place); it is a defect, like any other, and is caught as below.

**Accidental changes: the provider's own tests.** Each provider's test files as they were *before* the change were run on
its code *after* (scratch `owntests.mjs`; all 150 pass before):

| Change | Category | Provider's old tests on the new code |
|---|---|---|
| P14, P15 | C | **fail** (2 tests): an accidental "one night" would be caught at home |
| P12, P17, A07, Y07, Y08, Z01, V02, T08, A03, Z12 | V | **fail**: the bound tests (build text 2b's bound test per bound line) see the new edge |
| Z02, W17, U06 | V | pass: the tests read the limit from the module (`MAX_CENTS`, `limits.json`), so they move with it |
| W04, T02 | V | pass: a new bound where none was; no old test sends a 141-character note or a four-night quote |

So of the 18 V and C cases, 13 would be caught by the provider's own tests if they were accidental; the other 5 are
missed because a test restates the value from the code (Z02, W17, U06) or no test covers the newly refused values (W04,
T02). The first is a testing rule the standard can add (a bound test states the edge as a literal, the one place S13
allows a deliberate copy, `design.md` §2 A); the second is the general limit of testing, met by the users' own tests at
their next job and by walks. **What remains after (1) and (2)**: an accidental value-level or meaning change that the
provider's tests do not cover; on the proof, at most 5 users (bookings ×3 for Z02, W17, U06; front for W04; billing for
T02), each of whose own tests fail at its next job (the proof's runs).

### 2.8 Options compared on the proof

Against the 94 needed users that remain once the standard is kept (the 118 less S and K, which the standard and the
told users' fixes resolve); the first rows against all 118 are in brackets.

| Option | Told / without need / missed | Rests on |
|---|---|---|
| Today's tool (`changes.md`) | 116 / 62 / 45 of the proof's 99 | inference and comments |
| (a) Tell every entry on the sound list of §3 (no marks) | 444 / 350 / 0 [444 / 326 / 0] | the list's rule |
| (a′) The same, `changes.md`'s list (not sound by construction, §3.5) | 429 / 335 / 0 [429 / 311 / 0] | the list plus the listing diff |
| (b) (a), less what is provably unchanged (identical closure, or identical up to renaming) | 444 / 350 / 0 | the same as (a): the sound list already leaves out every entry whose closure is identical; renaming adds nothing on the proof |
| (c) The job's marks, as the oracle marks | 187 / 94 / 1 [187 / 76 / 7] | each job's judgement of an undecidable question |
| (d0) The means: today's stated types, S4 and the checker | 111 / 61 / 44 | the checker |
| **(d1) The means with M2–M8** | **about 157 / 81 / 18** | the checker and the tool's computation |
| **(d2) (d1) and ARCH's named items** | **about 204 / 110 / 0** | the checker, the tool, ARCH's placed work |

(d1) and (d2) are estimates: M2–M8 are not built; for the changes of B (and, in (d2), V and C) the users the oracle's
marks tell stand in for what the computed fact or ARCH's list would tell, and W12, U13 and W07 (thrown kinds or codes
changed without a needed user) are added as over-tells. (d2)'s "without need" is close to (c)'s because ARCH names an
item where the oracle marks it; the difference from (c) is who decides: in (d2) no job judges anything.

### 2.9 The recommended design, and what remains

- **What changed is the means**, computed by the tool from the two versions: stated kinds compared; thrown kinds, `this`,
  plain data or instance, argument writes and effects computed over the closure of §3; a type error counts as a change.
- **Plus ARCH's named items** from the placed work. **Who is told** is `design.md` D's lookup of those entries against
  every later module's uses file. A told job whose code needs no change runs its related tests and closes.
- **Removed**: the job's marks, the guide (`changes.md` §3.1), "unmarked counts as changed", the flags as prompts to a
  judge (they become parts of the means: `changes.md`'s class instance, `this`, argument changed, sync or async,
  process streams), and the listing diff of bound lines and prose as a cause of telling (bound lines stay as the
  requirement text and for the provider's bound tests).
- **Added to the standard**: every export states its kinds (S4, already); brands for meaningful values whose confusion a
  user could make (M2, in the first job, H); `readonly` where an argument must not change; casts only on the decoding
  read; the two checker settings of §2.3; a bound test states its edge as a literal.
- **What remains, and who meets it**: an accidental value-level or meaning change the provider's tests miss (at most 5
  users on the proof), met by users' tests at their next job and walks; a deliberate one ARCH did not name, which is a
  process fault ARCH's own review meets; a change in a place outside the standard, told of every change until converted
  (`design.md` B). Not measured: the cost of brands on civicsmith; the size of the means' over-telling there.

## 3. Question 1: is the tool's list sound by construction?

### 3.1 The behaviour of an entry, and what it can depend on

Take e's behaviour as in §1 (outcomes of calls to e over every trace of P). The ECMAScript specification fixes every way
an evaluation can read anything: it evaluates code (statements and expressions of a function object's
[[ECMAScriptCode]], reached by [[Call]] and [[Construct]]), and reads bindings (Environment Records), object properties
([[Get]], with getters), internal slots of built-ins (a Map's [[MapData]], an Array's elements), and host facilities.
So, within P and with the standard kept, e's outcome in a trace can depend on exactly:

1. **Code that runs during the call (control).** Direct calls and references to functions (a reference may be called
   later, so any reference counts); calls through objects, resolved at run time by property lookup on the receiver and
   its prototype chain (dynamic dispatch, own classes included, `super`); getters and setters, run by property reads and
   writes and by destructuring; **implicit calls** made by the abstract operations: ToPrimitive (`valueOf`, `toString`,
   `Symbol.toPrimitive`, run by `+`, comparisons, template literals and computed property keys), GetIterator and
   IteratorStep (`Symbol.iterator`, `next`, `return`: `for…of`, spread, array destructuring, `yield*`), Await and the
   promise resolve functions (`then`), InstanceofOperator (`Symbol.hasInstance`), SerializeJSONProperty (`toJSON` and own
   getters), species constructors; callbacks P hands to built-ins or to providers; and P's module evaluation, which runs
   every file's top-level statements once, in the order of the import graph (InnerModuleEvaluation visits each module's
   requested modules in source order), with function declarations instantiated first (hoisted) and `let`, `const` and
   `class` in their temporal dead zone until reached.
2. **State written by code that is not run during the call (data).** A binding (module scope, or a closure's scope
   shared by the functions of one factory call) written by another function; a field of an object written by another
   function, or created by one (an object literal's fields, a class's fields and constructor, `this.x =`); the contents
   of a container (`push`, `set`, element writes), through any alias; the state of a provider or of a dependency handed
   in (a store, a clock), written by P's own calls to it; files and tables P writes and reads back.
3. **What the writers were handed.** A writer writes what its own inputs make it write; so the code that calls a writer,
   transitively, decides what reaches e.
4. **Resources and settings**: data files read by literal path (S5), the environment through its owner (R12), start
   arguments, the clock and randomness (inputs, not code).
5. **Providers' entries.** Through their outcomes, which the providers' own means and notices cover (§3.4).

The standard removes the rest: no `eval` or code from text (S9), no writes onto another module's values or the global
object or intrinsics (S8, R8), no computed loading (S2), no reach into other modules' files (S5), no shared mutable state
across modules (S8). Without S9 and R8 no static rule could be sound: `eval` reaches any binding by a name built at run
time, and a reflective write can replace any method.

### 3.2 The rule (a dependence closure over the module's pieces)

Pieces are `changes.md`'s units (top-level declarations, locals, object and class members, top-level statements, data
files), with one change: a piece's own text **leaves out the pieces nested in it** (a factory's text holds its members'
names, not their bodies), and each piece gets a key (file, enclosing pieces, name, ordinal). Each piece is analysed once.

**Edges.**

- **F (control).** p → q when p: names q's binding (scope-exact, through imports between P's files; any reference, not
  only calls); reads, writes, calls or destructures a member named `m` and q is a function, getter or setter member named
  `m` anywhere in P (dispatch by name, which is sound for any receiver); has a computed member access (then every function
  member); names a file of P by a literal (S5); contains q and q runs when p runs (a local `const` with a non-function
  initialiser, a data member, a class's fields and constructor for the class; not a nested function or method, whose body
  does not run when it is created); or is an import (q: the imported declaration, and that file's top-level statements
  and order piece). **Ambient**, from every piece: its file's top-level statements; an **order piece** per file (the
  sequence of its non-hoisted top-level statements and its imports' specifiers, so a reordering is a change); every member
  named `toString`, `valueOf`, `toJSON`, `then`, `next`, `return`, `throw`, `constructor`, and every member with a
  computed name (implicit calls need no name in the caller's text); and, from a piece holding a name that resolves to
  nothing in P and is not a documented built-in, every piece of P.
- **Locations, reads and writes.** A location is: a binding (by its declaring piece); a field name `f:n` (field-based:
  every object's field `n` is one location, sound because objects are merged); the contents of a binding or field
  (`c:…`), merged with the contents it is assigned from (`const a = this.items` merges `c:a` with `c:f:items`), with a
  universal `c:?` for contents reached through a parameter, `this` or a call's result; and `ext` for the state outside
  P's code (providers' entries, dependencies and callbacks handed in, and host channels). A piece writes a location by
  assignment or update (`x =`, `x.n =`, `x[k] =`, `++`, `delete`), by creating it (a declaration with an initialiser, an
  object literal's field, a class field or method), by a mutating built-in method on it (typed by the checker: `push`,
  `set`, `sort` and the like on an Array, Map, Set, Date), by `Object.assign` and `defineProperty` on it, or by handing
  it to code outside P; it writes and reads `ext` when it calls code outside P. It reads a location by any other
  occurrence. A read of contents depends on the writers of those contents and of `c:?`.
- **The closure** C(e): start from e's pieces (as `changes.md` §2.1); add everything reachable by F and ambient edges;
  then, for every location read by a piece in C(e), add its writers, **and every piece that reaches a writer by F
  (its callers, transitively; ambient edges are not followed backwards)**; repeat to a fixpoint.
- **The list**: every entry, before or after, whose closure differs between the versions (compared as keyed digests of
  the pieces' own texts, comments and redundant parentheses dropped); every entry of a kind named by a listed entry's
  kind, as now. The listing diff is not needed for soundness.

This is the unit-level form of a backward slice over a system dependence graph (Weiser; Ottenstein and Ottenstein;
Horwitz, Reps and Binkley), with heap locations in the place of variables, the call-site and parameter edges collapsed
into "callers of writers", and field-based heap abstraction (as in field-based JavaScript call-graph construction,
Feldthaus et al.). It is coarser than a statement-level, context-sensitive slice, and sound for the same reason.

### 3.3 Why the rule is sound

**Claim.** Under the standard, with the pinned host, if C(e) has the same keyed digests before and after, then for every
trace on which both versions terminate, the outcomes of every call to e are the same.

**Argument.** By induction on the steps of the trace's evaluation, relating the two versions' runs. (i) Every piece whose
code runs during a call to e is in C(e): a call is reached through a name or a member name (F), a getter or setter by its
name, an implicit call by its protocol name (ambient), a module's top-level code before any of its pieces (ambient), and
nothing else can run code under S9 and R8. (ii) Every value e reads was last written by a piece in C(e) or came from the
environment: the writers of each location read are added, field-based and merged locations over-approximate aliasing, and
`ext` stands for every state outside P that P's own calls can change. (iii) What each such writer writes is decided by
its own code and its inputs, and its inputs come from its callers, added transitively, or from the environment. (iv) The
order of start-up code is in the order pieces. So the two runs of e take the same steps on the same values. This is the
content of the slicing theorem (Reps and Yang: a program and its slice agree on the sequence of values at the slice's
points on every initial state on which the program halts; two programs with isomorphic slices agree likewise; also
Horwitz, Prins and Reps on the adequacy of program dependence graphs). As there, termination is the exception: a change
elsewhere that makes a writer loop is listed (the writer's own closure changed) but e's is not; e's outcomes on traces
that still reach it are unchanged.

**Assumptions it rests on.** The standard (S2, S5, S8, S9, R8; no `Proxy` and no `with`, or a piece holding one reaches
every piece); stack text, function `name` from a stack and timing taken as content, as `changes.md` §1.1 does; resource
exhaustion out of scope; Node's version and packages fixed (a package import is a piece whose text includes the locked
version); the providers' own changes reaching P through its calls (`ext`) and told to P by the providers' means. **The
middle-module case**: when a provider Q's means changes, P is told; P's job adapts P; if P's own means then changes, P's
users are told by P's change. If Q's answers change under the same means (a V or C change), P's answers may change under
P's same means: that is ARCH's naming (§2.7), which must name, for a changed item, the items of later modules that pass
its answer on, or accept that users of P learn of it by their tests.

### 3.4 What the list of `changes.md` misses by construction

| Gap | Example | In the recommended list? |
|---|---|---|
| Data dependence through module or closure state: a function e does not call writes what e reads | `record()` changes what `total()` hands back; `open` writes `next` and the row that `find` hands back | No: the recommended list follows calls only. Its code half missed 12 oracle entries on the proof (P06, P10, P11, X07), caught by the listing diff only because the row kind's comment changed |
| Field writes and container contents by another function, through aliases | `add` pushes into `this.items`, `list` returns a copy | No (`changes.md`'s "data" level adds writers of names and data members, not field assignments or mutation) |
| The callers of a writer | a helper writes what its caller hands it | No |
| Implicit calls | `` `${amount}` `` runs `toString`; `for…of` runs `Symbol.iterator`; `await` runs `then`; `{ cents } = a` runs a getter | Partly (a getter read as `.cents` is; destructuring, templates, iteration and `then` are not) |
| A call through a data member holding a function | `{ m: cond ? a : b }` then `x.m()` | No (dispatch reaches function members only) |
| Order of top-level statements and imports | two registrations swapped | No (the digest is of a set) |
| A name that resolves to nothing | an undeclared global | Dropped silently |
| Over-inclusion by containment | a factory's text holds every member's body | Over-included (sound, larger) |

**Measured on the proof** (scratch `sound.mjs`, all 150 changes, the oracle of `proof.md`):

| List | Entries listed, code half (sum / mean / median / max) | With the listing diff | Oracle's 215 missed, code half / with listing diff |
|---|---|---|---|
| `changes.md` recommended (calls only, containers whole) | 938 / 6.3 / 5 / 22 | 1,144 | 12 / 0 |
| §3.2 control only (fine pieces, no data) | 797 / 5.3 / 5 / 21 | 1,004 | 16 / 4 |
| §3.2 with data, no callers of writers | 1,356 / 9.0 / 7 / 23 | 1,545 | 0 / 0 |
| **§3.2 full (recommended rule)** | **1,418 / 9.5 / 7 / 23** | 1,606 | **0 / 0** |
| §3.2 full, containers whole | 1,423 / 9.5 / 7 / 23 | 1,611 | 0 / 0 |

The full rule lists 87% of the 1,638 entries of the changed modules (`changes.md`'s list 57%); in the 51 changes that
change nothing, 38 list something (419 entries with the listing diff). It tells, with no marks, 444 / 345 / 0 against the
proof's 99 needs (the recommended list 416 / 317 / 0 by its code half). The cost of soundness is size: the proof's
modules are one factory each whose rows and objects all escape, so a field-based analysis couples most members. A
points-to analysis by allocation site (Andersen; Steensgaard) would separate objects that never meet, but objects handed
to users or a store can come back, so on interface modules much of the coupling is real.

**Under the means rule** the list is not used to tell. The closure of §3.2 is what M4–M8 are computed over, per version,
so its soundness is still load-bearing, and its size no longer costs told jobs.

## 4. Question 2: can "unchanged" be decided?

### 4.1 It cannot, even within the standard and with the means unchanged

**Rice's theorem** (1953): every non-trivial property of the partial function a program computes is undecidable. "e
before and e after have the same behaviour" is, for a fixed e before, such a property of e after; so is "the domain is the
same set", "the range is the same set", and "the domain only grew with old outcomes kept" (accepts more).

A direct reduction keeps everything the design could hope to rely on. Given any Turing machine M and input w, let

```js
/** @param {number} n  @returns {0 | 1} */
export function probe(n) { return runFor(M, w, n) ? 1 : 0; } // after; before: return 0
```

where `runFor` simulates M on w for `n` steps with a loop and `BigInt` tape (plain, standard-keeping JavaScript: no
`eval`, no reflection, every kind stated). Before and after have the same stated kinds (the same means), both always
terminate, and after behaves as before for every call exactly when M never halts on w; the range `{0}` stays `{0}`
exactly then. A procedure deciding "unchanged" (or "same range") would decide non-halting. So the mark "unchanged" is
undecidable in general, and not even semi-decidable (it is the complement of an r.e.-complete problem). JavaScript's
semantics has no memory bound (BigInt, arrays, closures), so it is Turing-complete; a real machine's finite memory makes
the question decidable in principle only by exploring astronomically many states. The same holds for Weiser's
observation that statement-minimal slices are not computable: a sound list is computable because it over-approximates,
and the mark asks for the exact answer.

### 4.2 What can be decided, and how much it covers on the proof

| Sub-case | Decision | On the proof |
|---|---|---|
| The closure of §3.2 is identical (keyed digests) | unchanged, by §3.3 | 188 of 1,606 listed entries (12%): those listed only because their description changed |
| Identical after renaming names bound inside a piece (alpha-equivalence) | unchanged, if the name is not observable (a function's `name` escaping) | 0 more (no change on the proof is a local rename) |
| Comment and type-only changes | already not listed (comments, JSDoc and redundant parentheses are dropped) | 15 changes list nothing |
| A refactor proven equal (regression verification, Godlin and Strichman; SymDiff, Lahiri et al.; translation validation) | "equal" or "unknown"; sound, incomplete | not built; for JavaScript it would need IEEE numbers, strings, heap, implicit calls. Small cases show the trap: T15 turns `'a' + x` into `` `a${x}` ``, equal only when `x` is a primitive (`+` calls `valueOf` first, a template `toString`); V12's destructured parameter reads the fields eagerly and throws earlier on a missing argument; U15's arrows refuse `new` |
| The means unchanged | decidable (§2.3), but not "unchanged" | 242 entries change means over the 150 changes, against 1,606 listed |

### 4.3 The options, with their cost

- **(a) Tell every user of every listed entry.** Certain. On the proof, against the 94 needed users of §2.8, 444 told /
  350 without need / 0 missed with the sound list (`changes.md`'s list with its listing diff: 429 / 335 / 0). Cost: about
  2.3 told jobs without need per change, each running its related tests and closing.
- **(b) "Unchanged" only where proven.** Certain. The proof the sound list itself gives (an identical closure) is
  already (a): it is why the 188 entries the listing diff adds need no telling (457 / 363 / 0 with them, 444 / 350 / 0
  without). Renaming saves nothing on the proof. Anything more needs an equivalence prover for JavaScript, a research
  project, not worth it for what is left to save.
- **(c) The job's judgement.** 187 / 94 / 1 if every job marks as the oracle (187 / 89 / 1 against the proof's 99). Not certain: it is an answer to an
  undecidable question by each job; `changes.md` §4.1 judges 16 changes with 26 needed users risky.
- **(d) The means (recommended, §2).** Certain for what it covers; no judgement; about 157 / 81 / 18 with M2–M8, about
  204 / 110 / 0 with ARCH's named items (estimates). Its misses are exactly the changes ARCH places, and accidental ones
  the provider's tests mostly catch (§2.7).

## 5. What is measured, judged and not measured

- **Measured** (scratch, on the proof's 150 changes, TypeScript 5.6.3, Node 22): the sizes and misses of the list at
  five rules (§3.4); who each tells, against the proof's needs and the users' own test runs; the means as today's
  listing's type parts, and who it tells (§2.6, A0); the strict checker's new errors in each provider (16 changes; only
  P16's concerns an interface, the rest are strictness of the fixtures' code); each provider's old tests on its new code
  (58 changes fail them, 92 pass; §2.7).
- **Judged**: the categories of the 72 needed users today's types do not tell (§2.6, from each diff and title); that
  M4–M6 would tell the B users and over-tell only W12, U13, W07; the (d1) and (d2) rows, which stand the oracle's told
  sets in for the computed facts and ARCH's names; the soundness argument (§3.3), from the specification and the slicing
  theorem, not from runs; the cost of brands.
- **Not measured**: M2–M8 built; brands' cost on civicsmith; the closure's size on civicsmith's larger modules; how
  reliably ARCH's placed work names the items it changes.
- **Prototype limits** (the rule, not the prototype, is the claim): `sound.mjs` approximates built-in typing for
  mutators by the checker's view of the receiver, treats `await` as outside state, and leaves the implicit-call members
  ambient; no change on the proof has a `toString`, `then` or computed-name member, so that part is not exercised.

## 6. Citations

- ECMA-262, ECMAScript Language Specification (2025): ToPrimitive and OrdinaryToPrimitive; GetIterator, IteratorStep;
  Await and the Promise Resolve Functions (`then`); InstanceofOperator; SerializeJSONProperty; [[Get]] and [[Set]] of
  ordinary objects; module records: InnerModuleEvaluation and ExecuteModule; FunctionDeclarationInstantiation and
  InstantiateFunctionObject (hoisting); strict mode `this` (tc39.es/ecma262).
- H. G. Rice, "Classes of recursively enumerable sets and their decision problems", Trans. AMS 74 (1953) 358–366.
- M. Weiser, "Program slicing", ICSE 1981; and IEEE TSE 10(4) (1984) 352–357 (minimal slices not computable).
- K. J. Ottenstein and L. M. Ottenstein, "The program dependence graph in a software development environment", SIGPLAN
  Notices 19(5) (1984); J. Ferrante, K. Ottenstein, J. Warren, "The program dependence graph and its use in
  optimization", TOPLAS 9(3) (1987).
- S. Horwitz, T. Reps, D. Binkley, "Interprocedural slicing using dependence graphs", TOPLAS 12(1) (1990).
- S. Horwitz, J. Prins, T. Reps, "On the adequacy of program dependence graphs for representing programs", POPL 1988;
  T. Reps and W. Yang, "The semantics of program slicing and program integration", TAPSOFT 1989, LNCS 352.
- S. Horwitz, "Identifying the semantic and textual differences between two versions of a program", PLDI 1990; D.
  Binkley, "Using semantic differencing to reduce the cost of regression testing", ICSM 1992; G. Rothermel and M. J.
  Harrold, "A safe, efficient regression test selection technique", TOSEM 6(2) (1997).
- L. O. Andersen, "Program analysis and specialization for the C programming language", PhD thesis, DIKU 1994; B.
  Steensgaard, "Points-to analysis in almost linear time", POPL 1996; A. Feldthaus, M. Schäfer, M. Sridharan, J. Dolby,
  F. Tip, "Efficient construction of approximate call graphs for JavaScript IDE services", ICSE 2013 (field-based
  analysis); S. H. Jensen, A. Møller, P. Thiemann, "Type analysis for JavaScript", SAS 2009.
- B. Godlin and O. Strichman, "Regression verification", DAC 2009; S. K. Lahiri, C. Hawblitzel, M. Kawaguchi, H. Rebêlo,
  "SymDiff: a language-agnostic semantic diff tool for imperative programs", CAV 2012.
- TypeScript handbook, "Type Compatibility" and TSConfig reference (`strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `useUnknownInCatchVariables`); JSDoc reference (`@this`, `@throws`).
