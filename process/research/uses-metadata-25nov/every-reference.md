# Every reference: can each gap be found with certainty and converted to a standard use? (25 Nov 2026)

Status: research for PROCESS #15, by a worker. Nothing changed, nothing decided. Builds on `standard.md` (S1–S13, §4.3
"What remains uncertain") and `design.md` §2 in this folder. Read at origin/main 9b6b51f.

The owner, 25 Nov (conversation, not a decision), on the claim that the tool is "certain for every reference, except a
few unsound corners of the type checker": "Those exceptions amount to the tool NOT certain for every reference. Every
reference means every reference, not every reference except a bounch of others." Then, as relayed by PROCESS: "So the
question is whether these gaps can be reliably identified and converted to 'standard' uses?" And on copies: "The code
that passes a copy does know that it's passing a copy, right? If so, then one straightforward way of identifying that
case is to adopt a naming convention for the value variable being passed so that it 'declares' both that it's a copy
and what its a copy of."

How sure: **run** means shown by the experiments below, under both TypeScript 6.0.2 (`/opt/node-tools`, which
`standard.md` used) and TypeScript 5.6.3 (the version the tool pins in `tool/package.json`), Node 22, `allowJs`,
`checkJs`; **spec** and **read** mean read in the TypeScript handbook ("Type Compatibility", "Type Checking JavaScript
Files", "JSDoc Reference", TSConfig reference) or the ECMAScript specification; **inference** and **estimate** mean
reasoning, not shown. The experiments and the prototype are in scratch (not kept):
`/tmp/claude-0/-home-user-process4/3dc968b5-647f-540d-a4a0-050f6c6ce4b3/scratchpad/residue/` (`check.mjs`, the
prototype of the tool's finder and detector, 347 lines on the TypeScript API; `cases.mjs`, 27 cases; `run.mjs`;
`copies.mjs`; `results.txt`).

## Summary and bottom line

1. **Yes, every gap of §4.3 can be identified with certainty, and each converts to a standard form.** For each gap there
   is now a small case where, with the tool's settings of today, the reference is hidden and nothing complains (run, both
   TypeScript versions). Under the rules below, the reference is either *found* (listed as a use of the provider's entry)
   or its place is *found as outside the standard*, by syntax, by the checker's types, or by a prototype check on the
   TypeScript API (run: 23 gap cases and 2 converted forms closed in both versions, 50 of 50 runs; 2 controls of
   ordinary conforming code give no place). Since the design only needs every non-standard place found, not understood (a found place is told
   conservatively until converted, `design.md` §2B), this is enough for certainty.
2. **Two different things were mixed in §4.3.** (a) a reference the tool does not find: a dependency on P that leaves no
   trace the tool resolves to P. (b) a value at run time that does not match the kind the code states: a bug, not a
   hidden reference. Exactly: (a) happens where a value passes from one kind to another at a place the tool neither
   checks nor attributes. (b) happens where a value is given a kind without a check. Most unsound points of the checker
   are **both**: the unchecked step also hides a module. Index reads without `noUncheckedIndexedAccess`, a missing vs
   `undefined` optional member, and a class instance after a structured copy are **(b) only**: the reference is found
   (run), and the value at fault is `undefined` or P's own data.
3. **The closing rules (R1–R12) add to S4** (§3): no `any` anywhere (R1); `unknown` given structure only on a value from
   the module's own channel (R2); guards only to an own kind from plain values (R3); no export hands out `unknown` or
   `any` (R4); the tool relates every conversion itself: method parameters contravariant (R5), mutable positions
   invariant and no widening into an optional member (R6), no extra optional parameters (R7); no reflective writes onto
   another module's value (R8); no narrowed member path or closure-reassigned narrowed variable relied on (R9); no
   suppression comments or `@overload` claims (R10); every expression's kinds, every conversion and the implicitly
   invoked members attributed (R11, which turns three gaps into found references with no place at all); environment
   only through its owner (R12, S8 made checkable). Plus settings: `strict` with `useUnknownInCatchVariables` **on**
   (the tool sets it off today, `tool/lib/notice/ts.mjs`; run B8 shows that this alone hides a reference now), and the
   tool's description of the host giving every untyped channel the kind `unknown`. An optional brand rule (R13) turns
   content carried in a bare string into a direct reference. `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
   close only (b) and are **not needed** for the claim (run: every (a) closure holds without them).
4. **Conversion** is mechanical for most places; judgment where a kind must be chosen or a hidden error fixed; **two
   steps in module order** (provider first) wherever the standard form is a call to something the provider does not
   export yet: a reader for its data or messages, an accessor for its environment value, an error class, a typed store,
   `readonly` in its parameter kinds. Counts on civicsmith: not measured (the prototype could count them on the first 8
   modules).
5. **Copies cannot be identified with certainty in general** (proof, §5): whether a text is a copy is a fact about how it
   was written, not about the text, and agreement of a computed value with P's is undecidable. **They become certain
   where marked or exact:** the owner's convention, made precise as a JSDoc tag `@copyof <module>:<Entry>` (or the name
   `copyOf_<module>_<Entry>`, with equivalents for data and text files), is read as a reference and checked for drift
   (run); a rule that a literal equal to an earlier module's exported constant is outside the standard unless marked
   makes every exact copy, and every constant-folded one, a found place (run); a literal at a position typed by the
   provider's literal kind is already a reference, not a copy (run). What remains is a copy that is unmarked and not
   exact: built at run time, translated, paraphrased, derived (run: not caught). Likely rare (estimate); tests, the
   walks and the job's word hold it.

**Bottom line.** Under S1–S13 plus R1–R12 and the two settings, the tool finds every reference, where a reference is a
place in U's code or tests that names an entry of an earlier module P, uses a channel P owns, or applies an operation
to a value whose kind at that place, or on either side of a conversion made there, is P's: or else it lists that place
as outside the standard, which the design tells conservatively until a job converts it. That holds for the TypeScript
version the tool pins and the host versions the standard names, given that the checker computes each expression's kind
as documented (the same footing as trusting the parser for imports; §4.3). It is not a claim about copies, which are
not references: marked and exact copies are found with certainty, unmarked transformed copies by no tool.

## 1. What a reference is

**Kind and meaning.** A *kind* is a declaration in a module: a `@typedef`, a class, an exported function's signature,
a member of one of these, an exported constant, or a channel the module owns (its files, programs, tables, keys,
environment values, messages; S5–S10). The meaning of a place in U's text is fixed by the kinds the code states at that
place.

**Reference.** U refers to entry `e` of an earlier module P where U's code or tests:
- (R-name) **name** `e`: an import, a namespace member, a type reference in JSDoc, `extends` (S1–S3);
- (R-channel) **use a channel** `e` owns: a file, program, table, key, environment value or message (S5–S12);
- (R-value) **apply an operation** (read, write, call, build, receive, store, pass on, throw, catch, iterate, or an
  implicitly invoked member such as `then` or `toString`) to a value whose kind at that place is `e` or has `e` as a
  member; and a **conversion** made in U (a value of kind S given kind T: an initializer with a declared kind, an
  assignment, an argument, a return, a cast, a guard, a callback's parameters) refers to the members of *both* kinds
  that the conversion relates.

**Why the conversion is the key.** Under subtyping, a value can be made by one module and read under another module's
kind. If Q defines `Named = { name }` and U passes P's `Row` to Q's function, Q reads its own `Named.name`; Q does not
depend on P (it may come before P). The one who relies on `Row` fitting `Named` is U, at its argument; so U's
conversion refers to `Row.name`. The same holds for an implementer: R's `Circle` handed out as P's `Shape` is R's
conversion; a user of `Shape` depends on P's `Shape`, not on R. So a dependency is mediated either by a name, a
channel, or a conversion, and the tool must see each **conversion** that occurs at run time.

**(a) and (b) exactly.**
- **(b) a mismatch**: at run time a value does not have the kind its place states. Its cause is a step that gives a
  kind without a check (a cast, a guard, a validator, an unsound rule).
- **(a) a hidden reference**: a value of P's kind reaches a place in U through a conversion no place in U's text shows
  (an alias the checker lets through, a value with no kind), so no site attributes it to P.
- A gap is **both** when the unchecked step also carries a value of another module's kind across (the checker accepts
  a Cat where a Dog is stated); **(b) only** when the mismatching value has no other module's meaning (`undefined`, or
  P's own data without its methods).

**Not a reference (as in `standard.md`).** The second level (U calls Q, Q calls P: `means.md` E) is reached through Q's
marks (`design.md` §2C). Content inside a bare `string` or `number` that Q declares as `string`: its declared meaning
at U's place is Q's; U's dependency on P's format inside it is either reached through Q's marks (Q uses P's encoder and
is told) or is U's own decoder, which is a copy of P's format (§5) and, under R2 below, a found place.

## 2. The gaps of §4.3, classified

| § 4.3 item | Case (run) | (a) / (b) | Why |
|---|---|---|---|
| Cast of `JSON.parse` to an own kind | A1: Q hands out P's encoded row as `string`; U casts `JSON.parse(text())` to its own `MyRow` and reads `name` | both | U reads P's `Row.name` under its own kind; and the claim is unchecked |
| Own narrowing of decoded data | A2: as A1 with `typeof`/`in` narrowing instead of a cast | (a) | U's own decoder of P's format: no kind of P appears |
| Messages and stored rows | A3: a message (`(data: any)`, as Node's own descriptions of `MessagePort` give) and a driver row typed `any`; U reads `.name` | both | `any` has no declaring module; the claim is unchecked |
| Environment values | A4: U reads `process.env.PRICE_URL`, which P's `priceUrl()` owns | (a) | the channel name is the only trace and it is not P's entry |
| User-written type guards | A5: U's guard `x is MyCat` over values of D and C handed out by Q | both | guard bodies are unchecked; the narrowed value is C's, read under U's kind |
| Re-typing under an own kind (S4 iii) | A6: `/** @type {MyRow[]} */ const mine = q.rows()` | (a) | reads resolve to U's copy of P's kind |
| Method-parameter bivariance | B1 (method in a kind), B1b (class override narrowing its parameter) | both | `handle(Dog)` stands for `handle(Animal)`; the handler reads Dog members of whatever animal comes |
| Covariant arrays and members | B2 (`Dog[]` aliased as `Animal[]`, a Cat pushed), B2b (`{ pet: Dog }` as `{ pet: Animal }`) | both | readers of the dogs read Dog members of C's Cat |
| Width into an optional member | B11: `Row` widened to `{}`, then claimed `{ name?: Cat }` | both | an absent member is claimed with another module's kind |
| Extra optional parameter | B5: U's `(x, r?: Row)` passed where `(x) => …` is expected; a caller supplies a D value | both | the extra parameter receives what any caller passes |
| Narrowing kept across a call | B6 (`b.pet instanceof Dog`, then a call that stores a Cat), B6b (a narrowed `let` reassigned in a closure) | both | the checker keeps the narrowed kind after the call |
| Index reads without `noUncheckedIndexedAccess` | B3: `rows[5].name` | (b) only | the reference to `Row.name` is found (run); the value is `undefined` |
| `Object.assign` and the like | B4: `Object.assign(row, patch)` writes `Row.name`; `Object.assign({}, row)` reads all of it | (a) | the member write and the reads name no member |
| JavaScript leniencies | B7: `new Map()` is `Map<any, any>` (run); also `[]` is `any[]`, `{*}`, `arguments`, an untyped `Function` (read, handbook) | (a) | every one of them produces `any` |
| Caught values | B8: `catch (e) { e.code }` with `useUnknownInCatchVariables` off, as the tool sets it | (a) | `e` is `any` |
| Suppression comments | B9: `// @ts-ignore` over a wrong claim | both | the checker's complaint is removed |
| Overload signatures | B12: `@overload` returning `Dog` over an implementation returning a Cat | both | overload signatures are claims checked only loosely against the implementation |
| Implicitly invoked members | B10: `` `${new Amount()}` `` calls P's `toString` | (a) | no name at the place |
| Shape after a structured copy | C1: `structuredClone(new Amount()).format()` | (b) only | the reference to `Amount.format` is found (run); the copy has no methods |
| Producer through state typed `unknown` | D1: P's store `take(): unknown`; U1 puts its `Thing`; U casts to its own `Mine` | (a) | U depends on U1's kind; nothing names U1 |

Three more (b)-only points, read, not run: a method extracted and called without its object (`this` is `undefined`);
JavaScript class fields declared but never assigned (`strictPropertyInitialization` does not apply to `.js`); an
`instanceof` test on a class that a plain object can be typed as (classes are structural unless they have a `#private`
member). Each gives a value the wrong shape; none carries another module's value.

## 3. The rules, and the runs that close each gap

**The runs.** Each case is a handful of files, one per module (`a`, `c`, `d`, `p` providers, `q` a passer, `u` the user,
`u1` another user). *Before*: the tool's options today (`tool/lib/notice/ts.mjs`: `strict`, `noImplicitAny`,
`useUnknownInCatchVariables: false`, NodeNext) and name-only attribution, as `usage.mjs` resolves names to
declarations. *After*: the settings below, the tool's description of the host with untyped channels as `unknown`, the
extended attribution (R11) and detectors R1–R12, all in `check.mjs`. In every gap case of kind (a) or both, *before*: the reference is not
found and the checker makes no complaint in U (the two (b)-only cases, B3 and C1, are found before as well). *After*:
closed, by finding or by a place, in both versions.

| Case | Closed by | After (both versions) | Detection | Conversion to standard | Steps |
|---|---|---|---|---|---|
| A1 cast of decoded foreign data | R2 | place `R2 decoding a value not from an own channel` at the cast | checker (`unknown`) + syntax (origin chain) | call the owner's reader (`p.readRow(JSON.parse(text()))`; the converted case finds `p:Row.name`) | two if P has no reader |
| A2 narrowing of decoded foreign data | R2 | places at `'name' in v` and `v.name` | as A1 | as A1; or R13 brands make it a direct reference (converted case finds `p:RowText`) | as A1 |
| A3 message, stored row | R1 + host description | places `R1 any`; with `unknown` from the description, the checker complains too | checker types | owner's reader for the message or row kind; own validator for own channels | two if the owner has none |
| A4 environment | R12 | place at `process.env.PRICE_URL` | syntax | call `p.priceUrl()` | two if no accessor |
| A5 guard to an own kind | R3 (and R11 finds `c:Cat`) | place `R3 type guard` | checker (type predicate) | `instanceof` the provider's class, or the provider's guard | two if the provider has neither |
| A6 own copy of a passed kind | R11 | found: `p:Row.id`, `p:Row.name` (converted), no place needed | TS API (conversion attribution) | import `Row` instead of `MyRow` | one, mechanical |
| B1, B1b bivariance | R5 | place `R5 method parameter bivariance` | TS API (relate members, override check) | take the base's parameter kind and narrow inside by `instanceof` | one; judgment, small |
| B2, B2b covariance | R6 | place `R6 mutable covariance` | TS API (mutable positions invariant) | the receiving kind says `readonly` / `ReadonlyArray` | one if U's kind; two if P's parameter kind |
| B11 width into optional | R6 | two places `R6 optional member the source may hold` | TS API | do not widen to `{}`/`unknown` | one, mechanical |
| B5 extra optional parameter | R7 | place `R7 extra optional parameter` | TS API (arity at conversion) | match the expected arity | one, mechanical |
| B6, B6b narrowing across a call | R9 | place `R9 narrowed member path` / `narrowed variable assigned in a closure` | checker (narrowed vs declared kind) + syntax | copy the member to a `const`, then narrow | one, mechanical |
| B7 `new Map()` holds `any` | R1 | places `R1 any` at each use | checker types | state the type arguments | one; the kind is usually evident |
| B8 caught value | setting + R1 + R2 | checker complaint `'e' is of type 'unknown'` and places | setting, checker | `instanceof` the provider's error class (S4 iv) | two if no class |
| B9 suppression | R10 | place `R10 suppression` | syntax | fix the hidden complaint | one; judgment |
| B12 overload | R10 | place in P `R10 overload signature` | syntax | drop `@overload` or make the implementation's kind honest | in P; judgment |
| B10 implicit members | R11 | found: `p:Amount.toString (implicit)` | TS API | none | none |
| B4 `Object.assign` | R8 + R11 | place `R8 reflective write`; found: all members of `Row` | syntax + checker | spread into a new value, or P's own setter | one; two if P must add a setter |
| B3 index read | (found already) | found before and after; with the optional flag also a complaint | — | optional (b) | — |
| C1 structured copy | (found already) | found; with the host description `structuredClone` returns data without methods and the checker complains | host description | P exports a reader that rebuilds the instance | (b) only |
| D1 store typed `unknown` | R4 (in P) + R2 (in U) | place `R4 untyped value handed out@p: take (unknown)`; place R2 at U's cast | checker (export kinds) | P's store becomes typed (generic, instance created by the producer U1, so U imports from U1) | two, provider first; ARCH if U1 is later |
| A1b control: own channel decoded to own kind | — | no place | — | — | — |
| K1 control: spread, destructure, generic identity, `for…of`, a `ReadonlyArray` parameter, a structural parameter, `catch` with `instanceof` | — | no place | — | — | — |

### 3.1 The rules (proposed additions to S4)

- **R1 No `any`.** No expression in a module has a kind that is or contains `any` (in unions and type arguments). This
  catches every JavaScript leniency of the handbook ("Type Checking JavaScript Files"), library `any` (`JSON.parse`,
  `Map` without arguments, Node's `(value: any)` listeners), explicit `{*}`/`{?}`, and an untyped `Function`. Detection
  is certain: every use of a value is an expression and each expression's kind is the checker's.
- **R2 Decoding only of own channels.** Giving structure to an `unknown` value (a cast, a guard call, or narrowing then
  reading a member) towards an own kind or no kind is allowed only where the value is read from the module's own channel
  (whose name S5, S7 and S8 already check), `JSON.parse` of such a read, a literal, a `const` bound to one of these, or
  the `unknown` parameter of the module's own exported validator. Decoding towards another module's kind is done by
  that module's reader (which names it). This is the exact form of "values from untyped channels only through the
  owning module's exported reader".
- **R3 Guards.** A type predicate or assertion function narrows only to the module's own kind, from a value with no
  product kind (`unknown` or built-in). Anything else is a claim about another module's value.
- **R4 Nothing untyped handed out.** No export hands out `unknown` or `any`: results, members of handed-out kinds,
  type arguments, and parameters of callbacks it calls. A shared store is generic, created by the module whose values
  it holds; a registry is S7's declared table.
- **R5–R7 The tool relates every conversion itself.** At every place where one kind is given another, the tool walks
  both kinds member by member and requires: method parameters contravariant (R5; `strictFunctionTypes` exempts method
  syntax, handbook and TSConfig `strictFunctionTypes`), including class overrides; members and container elements that
  can be written invariant unless the receiving kind says `readonly`, no `readonly` source given a writable target, and
  no widening into an optional member (R6); no function with more parameters than the expected one (R7; handbook "Type
  Compatibility", optional and rest parameters). These checks fire only where a product kind is involved, so built-in
  data is untouched (the control K1 gives no place).
- **R8 No reflective writes onto another module's value**: `Object.assign`, `Object.defineProperty(ies)`,
  `Object.setPrototypeOf`, `Reflect.set/defineProperty/setPrototypeOf/deleteProperty`.
- **R9 No narrowed path relied on across a call**: a member path narrowed (`b.pet` after `instanceof`) or a `let`
  that a closure reassigns. Copy to a `const` first.
- **R10 No suppression and no overload claims**: `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `@overload`; also no
  product `.d.ts` files (unchecked declarations; read, by file name).
- **R11 Attribution (the tool, not the code)**: every expression's kinds; both sides of every conversion, member by
  member; every member for a value handed to a slot of kind `unknown`, `object`, `{}` or `any` or to a reflective read
  (`JSON.stringify`, `Object.keys/values/entries`, `structuredClone`, `String`); and the members the language invokes
  implicitly (ToPrimitive: `valueOf`, `toString`, `Symbol.toPrimitive`; Await: `then`; iteration: `Symbol.iterator`;
  `instanceof`: `Symbol.hasInstance`; `JSON.stringify`: `toJSON`; ECMA-262 ToPrimitive, Await, GetIterator,
  InstanceofOperator, SerializeJSONProperty).
- **R12 Environment only through its owner** (S8 made a check): `process.env.X` outside the owning module is a place.
- **R13 (optional) Brands.** Every `string` or `number` an export hands out is a named kind (`string & { readonly
  __kind: 'p.RowText' }`), made only by a cast in its own module. Not needed for the claim (A2 is found by R2); it turns
  "Q passes P's encoding as a bare string" into a direct reference, and makes literal copies at typed positions type
  errors (§5).
- **Settings**: `strict` with `useUnknownInCatchVariables` true (today set false); the tool's description of the host
  gives every untyped channel the kind `unknown` (message listeners, driver rows, `Response.json`) and re-declares
  `JSON.parse` to return `unknown` (an overload merged ahead of the library's; run, both versions) and `structuredClone`
  to return the data without methods. Optional, for (b) only: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.

## 4. Why the detection is certain, and what it still rests on

1. **Every way a value enters a module's code is covered.** By `standard.md` §1.2 a module obtains values through names
   (S1–S3, syntax), channels (S5–S12, syntax, plus R2 for their contents), shared state (S8, syntax), and calls across
   module boundaries. Values from calls carry declared kinds (S4 i), and every place where they change kind is a
   conversion.
2. **Every conversion is at a syntactic position, and the positions are finite**: initializers with a declared kind,
   assignments and destructuring with declared kinds, arguments (with spread and tagged templates), returns and
   `yield`, arrow bodies, object-literal members and array elements under an expected kind, defaults, `for…of`
   bindings with declared kinds, class `extends` and JSDoc `@implements` (overrides), casts and `@satisfies`, guard
   calls, `await` on thenables, and `catch`. The prototype covers the expected-kind positions (TypeScript's
   `getContextualType`), casts, guard calls and overrides. A tool for real use must take the full list from the
   pinned checker's own relation sites (inference; the list is finite and fixed per version).
3. **At each conversion the tool applies its own relation** (R5–R7), which is sound by construction (writable
   positions invariant, parameters contravariant, no arity widening, no width into optional members, no `any`, no
   unchecked claims). So the claim does not rest on TypeScript's own assignability being sound. TypeScript's documented
   unsound points are exactly the ones its relation lets through (handbook "Type Compatibility", a note on soundness;
   TSConfig `strictFunctionTypes`), and each now gives a place (runs B1–B12).
4. **What it still rests on**: that the pinned checker computes each expression's kind (inference and narrowing) as
   documented. The two documented unsound narrowings are covered (R9; index reads are (b)). A checker bug or an
   undocumented unsound inference would be a gap of the same footing as a parser bug in reading imports today. It is
   held by the pin (the tool fixes TypeScript at one exact version) and by keeping these cases as the tool's own tests,
   so a new version that changes any of them shows. No such case is known after R1–R12 (inference).
5. **A correction to S5's argument** (read, not run): `standard.md` says a path built from run-time input "cannot name a
   product file except by an absolute literal". A *relative* string passed to `fs` resolves against `process.cwd()`, an
   implicit anchor: `readFileSync('modules/p/data.json')` names P's file. The check must therefore treat every path,
   URL or name argument of a host API (file system, child processes, workers, `import()`, storage, named channels) as a
   place unless the tool can evaluate it to an own path or it is the result of an owner's accessor. That remains a
   syntactic check over a version-bound list of host APIs.

**What a found place costs until converted.** Design §2B: the tool tells that module of every change to the provider
concerned; where the provider is unknown (R1, R2, R9), of every change of every earlier module (the rule 2 fallback).
A place in a provider's own interface (R4, B12's `@overload`) makes that entry's users "cannot tell" for what the entry
hands out, so they are told of changes to the modules it draws from as well (inference; the exact telling for such
places is the design's to fix). Over-telling stops when the place is converted.

## 5. Copies (S13)

**What a copy is.** U's text holds something P defines (a value, a name, a format, a field list, an algorithm),
written again instead of imported. At run time no value passes from P to U, so there is no reference to find.

**It cannot be identified with certainty in general (proof).**
- Copy-ness is not a property of the text. Take any literal U contains, say `'GET'` or `250`: the same text arises
  whether its writer copied it from P or wrote it independently. A function of the text alone cannot tell the two
  apart, so no check of the text can.
- Agreement is undecidable once computed. If U computes a value (`['price', 'of'].join('')`, `limit - 1`, a
  translation table), whether it equals or depends on P's value is a non-trivial property of what U's program does,
  undecidable in general (Rice's theorem; `standard.md` §1.5). Only constant expressions can be decided, by folding.

**What can be made certain, and how (run, `copies.mjs`, identical output in both versions):**

| U's text | Tool's result | Certain? |
|---|---|---|
| `call('priceof')` where `call(op: Op)` and `Op` is P's literal kind `'priceof' \| 'list'` | a **reference** to `p:Op` (the literal's expected kind is P's) | yes: not a copy at all |
| `/** @copyof p:WORDS.empty */ const expectedEmpty = 'Nothing to price yet'` | **marked**: a reference to `p:WORDS.empty`, equal to the provider's value | yes |
| `/** @copyof p:LIMIT */ const max = 200` | marked: a reference, and **differs** from the provider's value (200 vs 250) | yes, drift shown |
| `const copyOf_p_OP_PRICE = 'priceof'` (the owner's naming form) | **named**: a reference to `p:OP_PRICE` | yes |
| `const op = 'priceof'` (unmarked) | listed: equals `p:OP_PRICE` | yes (exact) |
| `'Price list'` as a test's expected value (unmarked) | listed: equals `p:WORDS.title` | yes (exact) |
| `'price' + 'of'` | folded, listed: equals `p:OP_PRICE` | yes (constant) |
| `['price', 'of'].join('')` | nothing | **no** |
| `'Liste des prix'` (a translation) | nothing | **no** |
| `fixture.json`: `"op": "priceof"`, `"heading": "Price list"` | listed: equal to `p:OP_PRICE`, `p:WORDS.title` | yes (exact) |
| `page.sql`: `-- @copyof p:OP_PRICE` above `WHERE name = 'priceof'` | marked: a reference; the literal matches the marked entry | yes |

**The marking convention, precisely** (the owner's proposal; the writer knows it is copying):
- **In code and tests, where import is possible, the rule is simply: import.** A constant, a word, an operation name,
  a kind is imported from its module (S13). A test asserts against the provider's word entry or constant, not its
  English. A marker is allowed only where import is impossible or defeats the purpose: a test that deliberately pins
  the literal value P must produce; a value that must exist before P can be loaded.
- **The marker in JavaScript**: a JSDoc tag on the declaration or the expression, `/** @copyof <module>:<Entry>[.<member>] */`.
  The tool reads it with TypeScript's JSDoc parser (an unknown tag is kept with its text; run). Where there is a
  variable, the owner's naming form `copyOf_<module>_<Entry>` is equivalent (run); the tag is preferred because it
  also marks a literal with no variable, such as `assert.equal(out, /** @copyof p:WORDS.title */ ('Price list'))`,
  and names a member.
- **In files with comments** (SQL `--`, HTML `<!-- -->`, YAML/TOML `#`, CSS `/* */`): the same text `@copyof
  <module>:<Entry>` in a comment on the line or block above (run for SQL).
- **In JSON** (no comments): a `copies` list in the module's uses file (`design.md` §2B: `process/modules/<module>.uses.json`),
  each item a file, a JSON Pointer and an entry (`{ "file": "test/fixture.json", "pointer": "/op", "of": "p:OP_PRICE" }`).
- **What the tool does with a marker**: records U → P:entry as a use (so a change to the entry tells U), refuses
  nothing; lists "cannot tell" if the entry does not exist or is not earlier (an order fault); and, where the copy is
  exact, compares the two values and lists a difference (the drift case above).

**The exact-literal rule as an aid, and what it adds.** The tool lists every literal in U's code, tests, JSON and text
files (after folding constant expressions) that equals a literal exported by an earlier module (constants, word
texts and keys, operation and table names). With the rule "a literal equal to an earlier module's exported constant is
outside the standard unless marked", every **exact** copy, marked or not, is a found place: certain. Coincidences
(`'id'`, `0`, `1`, short words) are the cost: a length threshold, and a one-time mark by the job (`@notcopy`) where the
match is chance. Extending the match to *unexported* literals of earlier modules finds copies of values P never
exported, at more coincidences. A strengthening that makes the listing exhaustive for product strings: shared product
strings and names exist only as exported constants (or literal kinds, which also make a copy at a typed position a
reference, and with R13 brands a type error).

**What remains.** A copy the writer did not mark and that no exact match catches: built at run time, translated,
paraphrased, a derived number (`249` for "below 250"), a field list or a format reimplemented by hand, a value in a
binary file. How likely: low (estimate). Copies are usually pasted, so exact; civicsmith's measured copies are of this
kind (89 tests asserting English text, K5313, all exact literals that the listing finds). What then catches it: U's own
tests, when they run against P's real output (at U's next job, or when U is told for another reason); the internal and
external walks, for anything a user sees; and the job's word, in the residue it records. None is certain.

## 6. The complete list

| Gap | Kind | Identified with certainty? | By | Shown by | Conversion |
|---|---|---|---|---|---|
| Cast of `JSON.parse`, message, stored row, environment | (a)/both | yes | R1, R2, R12, host description | A1, A3, A4 | owner's reader or accessor; two steps if missing |
| Own decoding of foreign data | (a) | yes | R2 | A2 | as above |
| User-written guards | both | yes | R3 | A5 | provider's class or guard |
| Re-typing under an own kind | (a) | found as a reference | R11 | A6 | import the kind |
| Method-parameter bivariance | both | yes | R5 | B1, B1b | widen and narrow inside |
| Covariant arrays and members; width into optional | both | yes | R6 | B2, B2b, B11 | `readonly` (two steps if P's kind) |
| Extra optional parameters | both | yes | R7 | B5 | match arity |
| Narrowing kept across calls | both | yes | R9 | B6, B6b | copy to a `const` |
| `Object.assign` and reflective writes | (a) | yes; reads found | R8, R11 | B4 | spread or P's setter |
| JavaScript leniencies, library `any` | (a) | yes | R1 | B7 | state the type |
| Caught values | (a) | yes | setting, R1, R2 | B8 | provider's error class |
| Suppression comments, overloads, `.d.ts` | both | yes | R10 | B9, B12 | fix the claim |
| Implicitly invoked members | (a) | found as a reference | R11 | B10 | none |
| Producer through state typed `unknown` | (a) | yes (in P and in U) | R4, R2 | D1 | typed store; two steps |
| Index reads; optional vs `undefined` | (b) only | reference found | — (flags optional) | B3 | optional |
| Shape after JSON or structured copy | (b) only | reference found; JSON path is R2 | host description | C1 | provider's reader |
| Unbound `this`, unassigned JS fields, `instanceof` on structural classes | (b) only | reference found (read) | — | — | optional |
| Copies, marked or exact | not a reference | yes | marker; exact-literal rule | `copies.mjs` | import, or mark |
| Copies, unmarked and not exact | not a reference | **no (proof, §5)** | — | `copies.mjs` (not caught) | tests, walks, job's word |
| An unknown checker bug or undocumented unsound inference | — | not known to exist | pin + these cases as tests | — | add a rule when found |

## 7. The final claim

> Under the standard S1–S13 plus R1–R12 (§3.1), with `strict` (including `useUnknownInCatchVariables`) and the tool's
> description of the host giving every untyped channel the kind `unknown`, for every module U and every earlier module
> P, every **reference** of U to an entry `e` of P is either listed by the tool as a use of P:`e`, or lies at a place the
> tool lists as outside the standard, with its rule. Here a reference is a place in U's code or tests that names `e`,
> uses a channel `e` owns, or applies an operation (read, write, call, build, receive, store, pass on, throw, catch,
> iterate, or an implicitly invoked member) to a value whose kind at that place, or on either side of a conversion made
> there, is `e` or has `e` as a member. This holds for the TypeScript version the tool pins and the Node and workerd
> versions the standard names, given that the checker computes each expression's kind as documented. Copies are not
> references: a marked copy and an exact (or constant-folded) copy of an earlier module's exported literal are found with
> certainty; an unmarked copy that is not exact is found by no tool, and is held by tests, the walks and the job's word.

## 8. What this would change (for PROCESS, if taken further)

- `standard.md` S4: add R1–R12 (and R13 as an option); S5: the cwd-relative path (§4.5); S13: the marking convention and
  the exact-literal rule.
- The tool's settings: `useUnknownInCatchVariables` from false to true (it hides a reference today, B8); the host
  description (`tool/lib/notice/node.d.ts`) with `unknown` for untyped channels, `JSON.parse` and `structuredClone` as
  above.
- The tool's check: R1–R12 as places ("cannot tell", with the rule), R11 as attribution; the 27 cases as its tests.
- Measure on the first 8 civicsmith modules how many places each rule gives, and how many need the provider first.
