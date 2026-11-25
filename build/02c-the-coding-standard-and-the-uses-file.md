Length: 91 lines. Last section: "12. The facility list".

# Process4 build text 2c: the coding standard, the uses file and the facility list

Sections 10 to 12 of build text 2, kept in their own file so that each stays under 24,000 bytes. Written by Claude on 25 Nov 2026 for the owner's decision C ("Who a change tells", `process/design-decisions-2.md`); its grounds are in `process/research/uses-metadata-25nov/` (`standard.md`, `every-reference.md`, `study-references.md`). **Status: proposed. The tool reads these forms and its own tests pass; nothing here has run on a real product or in a process in force.** It adds no check, gate, review or stop: a place outside the standard is listed, never refused (design part 2, sections 6 and 7). Where it and the design differ, the design rules.

Marks: **Decided here:** a choice of this text, with what it gives and costs. **Unproven:** never shown to work.

## 10. The coding standard

Every module's code and tests keep it (design part 2, section 7). Under it the tool lists every reference of a module to an earlier module's item as a use, or the place it sits at as outside the standard, with its rule.

**The reading's settings.** TypeScript at the version the tool pins (5.6.3), over JavaScript with its structured comments, `strict` with `useUnknownInCatchVariables`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`; and the tool's description of the host (`tool/lib/notice/node.d.ts` with `host.d.ts`), in which every untyped channel has the kind `unknown` (`JSON.parse` among them) and each Node module a product names is described. **Decided here:** these settings are the uses file's reading only; the check keeps its own (`ts.mjs`, `options()`), so that no new refusal comes from them. Gives: the two approved refusals stay as they are. Costs: a module's code is read twice, once for each.

The forms in which a module may refer to an earlier one:

- **S1** Imports by a written-out specifier: relative, the product's own name, or `#…`, resolved by Node's documented algorithm.
- **S2** Loading at run time only of a written-out name: `import('…')`, `require('…')` from one `createRequire(import.meta.url)`, `import.meta.resolve('…')`.
- **S3** A module object's member by name: `W.x`, or `W[k]` where `k` is a written-out name or a choice of them.
- **S4** Kinds at every boundary: each export states the kinds of its parameters and its result; the checker passes under the settings above.
- **S5** No reach into another module's files: a path or URL into its folder is replaced by its exported reader. Every path, URL or name handed to a file, process, worker, import or storage facility is a place unless the tool works it out exactly to the module's own folders from `import.meta.url`, `.dirname`, `.filename`, `import.meta.resolve('…')` or `process.execPath`, through `new URL`, `fileURLToPath`, `path.join`, `resolve`, `dirname`, `basename`, `+` and written-out texts, or it is the result of the owner's exported reader. A path relative to the working directory is always a place.
- **S6** Another module's program, worker or bundle only through its exported starter.
- **S7** Calls and tables by name only with a written-out name through the declared table (design part 2, section 7, rule 5; build text 2b, section 5).
- **S8** No state shared across modules: no writes to the global object, `Symbol.for`, named process-wide channels by a name of one's own, or exported variables.
- **S9** No code made from text: `eval`, `Function`, `node:vm`, a timer given a text.
- **S10** Configuration in a module's folders names only that module's code.
- **S11** A generated file names its generator and inputs in a `@generated` line in its first ten.
- **S12** Tests keep the same forms; each test case's name is written out; `mock.module('…')` and `mock.method` on an import only.
- **S13** Import, never copy: a value another module defines is obtained from it. Where that is impossible (a test's written-out expected answer, a data file) the copy is marked, by a name `copyOf_<module>_<item>` (a module's `-` written `_`) or `/** @copyof <module>:<item> */`, and read as a use; in a comment-bearing text file, `@copyof <module>:<item>` in a comment; in JSON, a hand-written entry of the uses file (section 11). `/** @notcopy */` marks a chance equality.

The rules on kinds, the host and order (R9 is replaced by R19; R13, brands, is not taken):

- **R1** No value of kind `any`. **R2** A value of kind `unknown` is given structure (a cast, a guard, narrowing then a member read) only where it comes from the module's own channel, or in its own exported validator. **R3** A guard narrows only to the module's own kind, from a value of no product kind. **R4** No export hands out `unknown` or `any`.
- **R5** Method parameters taken contravariantly; **R6** writable members and list elements invariant, no read-only member given a writable kind, no widening into an optional member; **R7** no function of more parameters than the one expected. The tool relates both kinds at each conversion itself, member by member.
- **R8** No reflective writes onto another module's value (`Object.assign`, `defineProperty`, `setPrototypeOf`, `Reflect.*`).
- **R10** No `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` or `@overload`, and no product `.d.ts` files.
- **R11** The tool attributes every expression's kinds, both sides of every conversion, every member of a value handed to a reflective read, and the members the language calls by itself (`toString`, `valueOf`, `then`, `toJSON`, `Symbol.iterator`, `Symbol.hasInstance`).
- **R12** The environment only through the module that owns the setting.
- **R14** Every host facility a module uses is on the product's facility list (section 12); a boundary facility only in a boundary module; no write to a member the host declares.
- **R15** A host value is not given a product kind; a boundary module's export takes no path, command or name from its caller but as a value of a choice of written-out names.
- **R16** Casts only upward, save R2's decoding of an own channel. **R17** No conversion to a kind with an index signature from one without (`Object.values`, `entries`, `assign` included), and none that drops a member the language calls by itself.
- **R18** A receiver handed to `call`, `apply`, `bind` or `Reflect.apply` is related to the method's class.
- **R19** Narrowing is relied on only for a `const` or a parameter never assigned; a narrowed member path or `let` is a place.
- **R20** No conditional, mapped, indexed-access or text-pattern kinds, no `infer`. **Decided here:** not applied to the kinds of the tables and carriers of calls by name (a declaration marked `@carriesop`, `@carriestable` or `@optable`, or built from one), whose written form in build text 2b, section 5 needs them and which the tool reads by their marks. Gives: rule 5's own form is no place. Costs: those kinds are trusted as the marks say.
- **R21** A module's evaluation starts nothing: no timer, listener, server, worker or boundary facility at its top level.
- **R22** A test uses only resources of its own; reads no clock, starts no real timer, listens on no fixed port.

**What the tool does with a place.** It lists it with its rule, file, side, line, the modules it may refer to (named where the tool can tell, such as a path into a module's folder; otherwise `*`, every earlier module), what it waits on (this module, or a provider's step first), and for a test the cases it sits in. A use of a later module is an order fault, which `check` refuses (design part 2, section 6). Nothing else refuses.

**Unproven:** that the listed relation sites are every conversion the pinned checker makes (study-references §4.2 asks for the checker's own full list); the inventory of implicitly called members of the language library; the first pass's cost.

## 11. The uses file

Place: `process/modules/<module>.uses.json`, beside the requirements file. Writer: the tool, never by hand, at each `push` that changes the module's code or tests (and of a job's own module), from the code as pushed, in a commit of its own that the push carries (build text 1b, command 2). `p4 uses <module>` prints the same reading without writing it (command 28). `drop` puts it back with its module's code. No check of the file is made.

```json
{ "module": "billing", "written": { "commit": "<sha>", "tool": "process4-tool 0.1.0, typescript 5.6.3" },
  "providers": ["amounts", "bookings"],
  "uses": [ { "provider": "bookings", "item": "Bookings.quote", "itemKind": "method", "type": "call", "route": "direct", "standard": true,
              "where": [ { "file": "src/invoice.mjs", "side": "code", "line": 42, "in": "makeInvoice" },
                         { "file": "test/invoice.test.mjs", "side": "test", "line": 17, "test": "invoice > totals a two-night stay" } ] } ],
  "outside": [ { "rule": "S5", "file": "test/fixtures.mjs", "side": "test", "line": 9, "what": "readFileSync of a path into bookings's folder",
                 "mayRefer": ["bookings"], "waitsOn": "bookings: an exported reader or accessor", "tests": ["invoice > reads a saved booking"] } ],
  "orderFaults": [], "copies": [ { "provider": "words", "item": "WORDS.invoiceTitle", "file": "test/invoice.test.mjs", "side": "test", "line": 30, "test": "invoice > titles", "marked": "copyOf_words_invoiceTitle" } ],
  "facilities": ["\"node:fs\".readFileSync", "Array.map"] }
```

- `providers`: the earlier modules used, in module order: the module's declared uses (design part 2, section 6).
- `item`: as the provider's listing names it (build text 2b, section 6), `<file>:<name>` where two interface files export one name for two things; `*` for the module object itself (`import * as W`, `import('…')`, an import that names nothing). A reference to a declaration outside the provider's interface files is named `<file>:<name>`, with `standard: false`, and its place is listed under S5.
- `type`: `import`, `type` (a kind in a comment), `extends`, `read`, `write`, `call`, `new`, `value` (the result of a call), `convert` (either side of a conversion), `implicit`, `call by name`, `table by name`, `mock`, `copy`, `generated`.
- `route`: `direct`, or `{ "via": <module>, "item": <its item> }` where the value reached the place through a middle module's item.
- `where`: one entry for each place; in a test, one for each test case that holds the place or calls a helper that does (`test`, the names joined by ` > `); at a test file's top level, each of its cases.
- `outside`: an entry may add `item`, the module's own item a place in its interface concerns (S4, R4, R10). `mayRefer: ["*"]` stands for every module earlier than this one when the file is read.
- `copies`: a marked copy (`marked`, with `value` and `differs` where the provider's value is written out and not the same), or a written-out text or number of at least four characters or 100 exactly equal to a value an earlier module exports (unmarked), in code, tests or JSON (`pointer`). **The only hand-written part:** `{ "file", "pointer", "of": "<module>:<item>" }` for a copy in a data file, kept as written when the tool rewrites the file, and read as a use.
- `facilities`: the qualified names of the host facilities the module uses (R14), from which ARCH makes the product's first facility list.

**Decided here:** an entry of each list is one line of the file. Gives: a change reads as lines. Costs: long lines.

**A module with no uses file yet** declares the modules its code and tests import (`check`, the merge wait, `walk areas`).

## 12. The facility list

Place: the file `language_reader.facilities` in the process config names, by default `process/facilities.json`. Writer: ARCH.

```json
{ "versions": { "node": "22", "typescript": "5.6.3" },
  "entries": { "\"node:fs\".readFileSync": "boundary", "Array.map": "in-process", "JSON.parse": "in-process" },
  "owners": { "env:PRICE_URL": "pricing" } }
```

Each entry is a facility's qualified declaration, as the uses files' `facilities` print it, marked `in-process` or `boundary`. `owners` names the module that owns each external channel the tool reads by name (an environment setting, `env:<NAME>`), so that a place reading it names that module. A boundary module is one whose entry in the module list has `"boundary": true`. A use not on the list, a write to a member the host declares, and a boundary facility outside a boundary module are places (R14). Never on the list: `Symbol.for`, `eval`, `Function`, `node:vm`, the legacy `RegExp` statics, `node:module`'s `register`. Without a list, every facility used is a place. **Decided here:** the list is a file the config names, with the boundary mark on the module's entry. Gives: one file per product, read at every reading. Costs: a sixth, optional field on an entry.
