# Will "every reference is found" hold? A study of the language on three open points (25 Nov 2026)

Status: research for PROCESS #15, by a worker. Nothing changed, nothing decided. Builds on `standard.md` (S1–S13),
`every-reference.md` (R1–R12, the 27 cases) and `design.md` §2 A in this folder. Read at origin/main.

The owner, 25 Nov (conversation, not a decision): "is this a load-bearing design that will work? If there are areas
that you're not sure if they'll work, how can we determine whether they will work, not based by testing existing code
but by studying the language?" Relayed by PROCESS the same day: "CC wrote all the civicsmith code. So can we [s]tay with
certainty whether CC uses any of these ways for code to reach outside itself?"; "can the conversion job efficiently
study each node reference and the values passed and returned to determine whether it's a reference to another
module?"; "Can the process4 standard be design[ed] to avoid all the holes in the typescript tool?"

How sure: **spec** means read in ECMA-262 (the 2027 draft at tc39.es; section numbers as there), the Node.js or
TypeScript documentation, or TypeScript's own source, cited by section or URL; **paper** means read in the cited paper;
**run** means shown by a small experiment here with TypeScript 5.6.3 (the version the tool pins) and 6.0.2, Node
v22.23.5, `@types/node` 26.1.2 (scratch, not kept:
`/tmp/claude-0/-home-user-process4/3dc968b5-647f-540d-a4a0-050f6c6ce4b3/scratchpad/study-a/exp/`); **inference** means
reasoning, not shown. Nothing here was measured on civicsmith (its repository is not in this session).

## Summary and bottom line

1. **Host facilities: CLOSABLE WITH AN ADDED RULE, and the rule is an inventory, not a deny-list.** By the
   specification a module obtains values from only six sources (§1.1): its own syntax, its import bindings, the global
   environment, `import.meta` and module loading, operations on values it already holds, and values handed in by a
   caller. The host can enter only at the points ECMA-262 Annex D lists: the global object's extra properties, the
   host hooks, host-defined built-ins and extra properties on standard objects, exotic objects, and the jobs and
   callbacks it runs (§1.2). Every one of these is reached by a *name* the checker resolves to a declaration, except
   where a value has kind `any` (R1), a member is computed (S3, `noImplicitAny`), code is made from text (S9), or a
   host value is relabelled as a product kind. So **the tool can inventory, with certainty, every host facility a
   module uses, in code written by anyone** (run: `node:fs`, `fs`, `globalThis.process`, an alias of `globalThis`,
   destructuring of `process`, `Error.captureStackTrace`, `RegExp.$1`, `Symbol.for`, `[].constructor`, `import.meta.*`
   all resolve to their declarations; a computed global member is a checker complaint). Where the preconditions fail,
   the failing place is itself listed. Two escapes were found and closed by rules: a host value relabelled as a product
   kind and handed to another module (run: the second module's use shows no host facility; R15 finds it at the
   relabelling), and a boundary module that re-exports a *facility* (a `readText(path)` that any module can aim at
   another module's file; R15 forbids it). The allow-list is then simply the product's **facility list**: the
   qualified declarations the inventory shows, each marked inside-the-process or boundary; anything new is found the
   same way (R14). Node's `module.builtinModules` is not a usable list on its own: in Node 22 it omits `node:test`,
   `node:sqlite` and `node:sea` (run; the docs say prefix-only modules were added in v23.5.0), and the language library
   declares members that are shared state across modules (`RegExp.$1`, run: module B reads module A's match).
2. **Arguments of facilities that reach outside (the owner's second question): decidable after S5/S6 conversion.** A
   path, URL, command, worker script or specifier built from the module's anchors (`import.meta.url`, `.dirname`,
   `.filename`, `import.meta.resolve('<literal>')`, `process.execPath`) and written-out parts through a fixed set of pure
   functions (`new URL`, `fileURLToPath`, `path.join/resolve/dirname/basename`, `+`, template literals) evaluates
   exactly, so whether it names the module's own folder, an earlier module's, a later one's, or something outside the
   product is certain. Anything else (a parameter, an environment value, configuration, run-time data, a cwd-relative
   string) is a place; the job converts it to a written-out anchored path, or to a call of the owner's accessor (a
   found reference), and run-time data enters a path only through `path.basename` or a literal-union kind (§1.6). The
   job's judgement is left only for choosing owners and splitting generic helpers; the result is decidable by
   construction.
3. **Checker soundness: CLOSABLE WITH ADDED RULES for every hole that can attribute a value to the wrong module, on a
   defined subset K; NOT CLOSABLE BY STUDY for the correctness of the checker's implementation.** The requirement is
   narrower than soundness: only that a value read at a place under module M's kind was in fact made under M's kind or
   reached the place through a conversion the tool attributes. Holes whose only effect is `undefined` or P's own data in
   the wrong shape do not matter (§2.1). Bierman, Abadi and Torgersen prove a safe core of TypeScript sound (safeFTS,
   Theorem 1) and show that its unsoundness comes from exactly three added rule families: unchecked downcasts,
   `any` (with indexing by it), and covariance of members and of parameters. Every hole found here for JavaScript with
   JSDoc is one of those three, or comes from a feature outside their core (optional members, index signatures,
   narrowing, accessors, receivers, generics, recursive kinds, the library's own declarations). Each is closed either
   by forbidding its construct (a rule of the standard, checked by syntax or by the checker's own types) or by the tool
   checking the conversion itself; **seven holes were not closed by R1–R12** and need rules R16–R20 (run: a downcast,
   a hidden `then` run by `await`, a forgotten member re-exposed by `Object.values`, a receiver of another kind given
   to `call`, a getter's result narrowed, an accessor narrowed by assignment, `Box<Dog>` accepted as `Box<Animal>`
   through method syntax; each gives a value of another kind with no complaint, in both TypeScript versions). What
   cannot be closed by study: TypeScript has no specification (archived 2016) and its checker is not proven to
   compute kinds as documented; and the host and package descriptions are claims about Node, workerd and packages.
   Both are premises of the same footing as trusting the parser; the first is reducible only by an independent checker
   for K (Safe TypeScript shows such a checker is possible), not by study.
4. **Dependencies that are not values: CLOSED BY STUDY for evaluation order and shared state, CLOSABLE WITH TWO RULES
   for the event loop and tests, NOT CLOSABLE (and not a reference matter) for whether a change altered timing or
   resource use.** By the owner's rule, timing, effects and required state are part of an entry's domain and range
   (`changes.md` §1), so they are dependencies. Under S7 and S8 a module can rely on another having run only by reading
   state it reaches by a reference, and an import guarantees the provider ran first (§16.2.1.6.1.3.1). Code of P runs in
   U's process only if P is in U's import closure or a later composer loads both; with R21 (module evaluation starts no
   activity and touches no host facility outside the process) every activity of P starts at a call whose caller holds a
   found reference, so event-loop and resource effects ride on found references. A state one user writes and another
   reads through a shared provider is a dependency of the composer that runs both, which references both. Interference
   between separate processes (tests run in parallel) or with the machine is not a provider relation at all; R22 keeps
   it out of tests. Whether a given change altered an entry's timing or resource use is the "what changed" half
   (`design.md` §2 C) and is undecidable in general; it is the job's mark, as now.

**Bottom line.** The design is load-bearing on the reference side, with nine more rules (R14–R22, §4) and one
premise that no study can discharge: that the pinned TypeScript checker types each expression of the subset K as its
documentation says, and that the facility list's descriptions match the host. The study turned the deny-list into a
closed inventory, found seven checker holes the earlier rules left open and closed each, and showed that timing,
ordering and contention are either carried by a found reference or are not provider dependencies. The final claim the
study supports is in §5. What the owner gains by a further step: an independent checker for K would replace the
TypeScript premise by the correctness of a much smaller program; nothing else in the claim depends on unproven ground.

## 1. Host facilities: from a deny-list to a closed inventory

### 1.1 How a module obtains any value at all (spec)

An expression in module code evaluates to a value by one of these routes (ECMA-262 §13 Expressions, §14 Statements,
§15 Functions and Classes). The table is exhaustive by the grammar: every expression form falls into one row.

| Source | Spec | Who made the value |
|---|---|---|
| **S-own: its own syntax** — literals, object and array initializers, function, class, generator and async function definitions, regular expression and template literals | §13.2.3–§13.2.8, §15.2–§15.8 | the module; the new object's prototype is a realm intrinsic (%Object.prototype%, %Array.prototype%, %Function.prototype%, %AsyncFunction.prototype%, …), so syntax alone reaches intrinsics (§6.1.7.4, §10.1.13 OrdinaryCreateFromConstructor) |
| **S-name: an identifier** | §13.2.2, §9.4.2 ResolveBinding, §9.1.2.1 GetIdentifierReference | resolved outward through the module's own function and block records, then its Module Environment Record (own declarations and import bindings, §9.1.1.5, §9.1.1.5.5 CreateImportBinding), then the Global Environment Record (§9.1.1.4: the global object's properties and script-level lexical declarations). Module code is strict (§11.2.2), so an unresolvable name throws on read and on write (§6.2.5.5 GetValue, §6.2.5.6 PutValue): no implicit global is ever created. `this` at module top level is `undefined` (§9.1.1.5.4) |
| **S-meta: `import.meta`, `import()`** | §13.3.12, §13.3.12.1.1 HostGetImportMetaProperties, §13.3.12.1.2 HostFinalizeImportMeta; §13.3.10, §16.2.1.10 HostLoadImportedModule | the host |
| **S-op: an operation on a value already held** — property read, call, `new`, `super`, tagged template, operators, `await`, iteration, destructuring | §13.3.2, §13.3.5–§13.3.7, §13.3.11, §27.10.5.3 Await, §7.4.4 GetIterator, §7.1.1 ToPrimitive, §13.10.2 InstanceofOperator | the code of the object's getter, method, trap or protocol member: some module's, the specification's built-ins, or the host's |
| **S-in: a value handed in** — parameters, `arguments`, `this` of a call, `yield`'s resumption, a `catch` binding, a promise reaction's argument | §15.2, §10.4.4, §13.3.6.2 EvaluateCall, §14.15, §27.5.5.4 | the caller: another module, a built-in, or the host running a job or callback (§9.5.2 HostMakeJobCallback, §9.5.3 HostCallJobCallback) |
| **S-text: code made from text** | §19.2.1 eval, §20.2.1 Function constructor, §19.2.1.2 HostEnsureCanCompileStrings | any of the above, read through a name or a value; removed by S9 |

By induction on evaluation, every value a module holds was made by its own syntax, or came from a binding (an import
or a global), from the host's `import.meta` or loader, from code run by an operation on a value it held, or from a
caller. No other route exists in the language.

### 1.2 Where the host can enter (spec)

ECMA-262 Annex D (informative, pointing to normative clauses) lists every point at which a host may layer behaviour:
**D.1 host hooks** (HostCallJobCallback, HostEnqueueFinalizationRegistryCleanupJob, HostEnqueueGenericJob,
HostEnqueuePromiseJob, HostEnqueueTimeoutJob, HostEnsureCanCompileStrings, HostFinalizeImportMeta, HostGetCodeForEval,
HostGetImportMetaProperties, HostGrowSharedArrayBuffer, HostHasSourceTextAvailable, HostLoadImportedModule,
HostGetSupportedImportAttributes, HostMakeJobCallback, HostPromiseRejectionTracker, HostResizeArrayBuffer,
InitializeHostDefinedRealm); **D.2 host-defined fields**; **D.3 the global object** (§19: "may have host-defined
properties in addition to the properties defined in this specification"); **D.4 steps around running jobs**; **D.5 the
internal methods of exotic objects not in the specification**; **D.6 built-in objects and methods not in the
specification, except as §17.1 forbids**. And §2 Conformance: an implementation "may provide properties not described
in this specification, and values for those properties, for objects that are described in this specification", and
"may support program and regular expression syntax not described in this specification".

Mapped onto §1.1: the host enters through **S-name** (a global object property: D.3), **S-meta** (D.1's import-meta
and loading hooks), **S-op** (a host built-in, an extra property on a standard object such as V8's
`Error.captureStackTrace`, an exotic object such as Node's `process.env`: D.5, D.6), **S-in** (the host calling a
module's function with host values: D.1 job hooks, D.4), extra **syntax** (§2), and **S-text** (D.1). The remaining
hooks (FinalizationRegistry cleanup, ArrayBuffer resizing, the rejection tracker, source text availability) act on
values the module already holds or on the whole process (§3).

### 1.3 The inventory: certain for every module, conforming or not (run)

The tool walks every identifier, member access, literal element access and destructuring element of a module and asks
the checker for its symbol and declaration. A use is a **host use** when the declaration lies in the language library
(`lib.*.d.ts`), the host description or a package's declarations. Run on a file of 26 lines exercising each route
(`exp/cases/h1`, TypeScript 5.6.3 and 6.0.2, with `@types/node` 26.1.2):

| Route in the module | Inventory entry (run) |
|---|---|
| `import fs from 'node:fs'`, `import { readFileSync } from 'fs'` | `"node:fs"`, `"node:fs".readFileSync` |
| `const { env, argv } = process` | `NodeJS.Process.env`, `NodeJS.Process.argv`, `process` |
| `const g = globalThis; g.fetch` | `global.fetch` (the alias does not hide it) |
| `globalThis.process.cwd()`, `globalThis['process']` | `NodeJS.Process.cwd`, `process` |
| `[].constructor`, `(async () => {}).constructor` | `Object.constructor` (the way to %Function% and %AsyncFunction% without naming them) |
| `RegExp.$1`, `Symbol.for('k')`, `Error.captureStackTrace` | `RegExpConstructor."$1"`, `SymbolConstructor.for`, `ErrorConstructor.captureStackTrace` |
| `new URL(…).searchParams.get('a')` (a value received from a built-in) | `URL`, `URL.searchParams`, `URLSearchParams.get` |
| `import.meta.url`, `.dirname`, `.resolve` | `ImportMeta.url`, `ImportMeta.dirname`, `ImportMeta.resolve` |
| `Object.getOwnPropertyDescriptor(globalThis, 'process')`, `Reflect.get(…)`, `Object.getPrototypeOf(process)` | the reflective function itself; its result is `any`, so R1 lists every use of it |
| `globalThis[k]` with `k` computed | no symbol; checker complaint TS7053 (noImplicitAny), so a place |
| `Object.prototype.toString = …` | `Object.toString` — and no complaint: a **write** to an intrinsic passes the checker (R14 must forbid writes) |

With the tool's own host description (`tool/lib/notice/node.d.ts`) instead of `@types/node`, every undeclared module
is TS2307 and every undeclared global TS2304/TS2591, so they are places too. One defect found: that description gives
`process` an index signature `[key: string]: any`, so `process.cwd` resolves to the index and has kind `any` (run). R1
lists every use, but the inventory then names "process[string]" rather than the member; the index signature should go.

**Why the inventory is certain (inference from §1.1–§1.2 and the checker's rules).** A host value enters a module only
through S-name, S-meta, S-op, S-in or S-text. S-text is removed by S9 and by R1 (the Function constructor reached by
`.constructor` returns `any`). S-name: every identifier resolves to a declaration or is a checker complaint; a global
reached by a computed key is TS7053; by reflection, a result of kind `any` (R1). S-meta and module loading: every
specifier is a literal (S1, S2), so every built-in and package import is listed. S-op: under R1 and `strict`, every
member read, write or call on a value has a symbol whose declaration is known; a member that is not declared is a
complaint (TS2339), so V8's extra properties and Node's undocumented members are places unless the description
declares them. S-in: a host callback's parameters have the declared kinds of the host's description; using them is
S-op again. Implicitly invoked members (iteration, `await`, `ToPrimitive`, `toJSON`) act on values already in the
inventory; R11 lists them too. Extra syntax (§2) is a parse error to TypeScript's parser.

**What it rests on.** (a) The checker resolves each symbol as documented (§2.6). (b) The descriptions: a member
described with a looser kind than the host gives (`object`, `unknown`) can only be given structure by a cast, which
R2 and R16 make a place; a member described as `any` is R1. A description that *omits* a facility makes it unusable
without a complaint, never invisible. (c) No value of kind `any` anywhere (R1).

**What escapes the inventory, and how each is found.**

| Escape | Found? | How |
|---|---|---|
| A value of kind `any` (library, untyped package, `JSON.parse`) | yes, as a place | R1 |
| A member computed at run time | yes, as a place | TS7053 under `noImplicitAny`; S3 |
| Code from text | yes, as a place | S9; R1 |
| **A host value relabelled as a product kind and handed on** (run `exp/cases/h2`: module U writes `/** @type {Reader} */ export const reader = fs`; module V calls `reader.readFileSync('modules/p/data.json', 'utf8')`; V's inventory shows **no** host use) | **not by R1–R12**; yes with R15 | a prototype check at U's conversion reports "gives host member readFileSync (from fs.d.ts) a product kind" (run). R11 already attributes both sides of the conversion; R15 makes the conversion a place |
| **A boundary module that hands out a facility** (`export function readText(p) { return fs.readFileSync(p) }`; V calls `readText('modules/p/data.json')`) | **not by R1–R12** (V's use is a found reference to U; the path names P's file) | R15: a boundary module's exports take no path, URL, command, channel or table name from callers except as a value of a literal-union kind it declares |
| A third-party package's internals | the import is listed; what the package does is not | the package is a facility on the list (by name and exact version) like a built-in, with its declarations as its description; or it is forbidden |
| A host behaviour no code names (unhandled rejection ends the process, the default `--unhandled-rejections=throw`; job ordering; FinalizationRegistry timing) | not a host *facility* use | §3 |

So the answer to "can we say with certainty whether CC uses any of these ways for code to reach outside itself": yes,
per module, for any code: the inventory lists every host facility the module names, and every place where it could
reach one without naming it is itself listed (R1, TS7053, S9, R15). This does not need the module to conform first.

### 1.4 Why `module.builtinModules` and the library cannot be the list themselves

- In Node v22.23.5, `require('node:module').builtinModules` has 68 names and omits the prefix-only modules
  `node:test`, `node:sqlite` and `node:sea`, which `isBuiltin` accepts (run). Node's documentation: "v23.5.0 The list
  now also contains prefix-only modules" (https://nodejs.org/api/module.html#modulebuiltinmodules). A list taken from
  it is version-dependent in its own definition.
- The language library declares members that are state shared across modules: `RegExp.$1`–`$9`, `input`, `lastMatch`
  and the others (`lib.es5.d.ts`, `RegExpConstructor`, from the "legacy RegExp features" proposal,
  https://github.com/tc39/proposal-regexp-legacy-features): run `exp/cases/w/w11`, module B's `RegExp.$1` returns
  `'secret'` from module A's match, with no complaint and no reference. Also `Symbol.for`/`keyFor` (§20.4.2.4, a
  registry shared across realms), `Object.constructor` (the route to %Function%), and writes to any intrinsic
  (`Object.prototype.toString = …`, run: no complaint).
- So the list must be the product's own: the facilities its modules actually use, each entry a qualified declaration
  name, reviewed once. That is what the owner's relayed point proposes ("the allow-list can simply be the facilities
  the inventory shows").

### 1.5 The facility list and boundary modules (the rule, R14 and R15 in §4)

- **The list** is a file in the product's process configuration, naming the pinned Node, workerd, TypeScript and
  package versions, and, per entry, a qualified declaration (`"node:fs".readFileSync`, `NodeJS.Process.env`,
  `ArrayConstructor.isArray`, `global.fetch`), marked **in-process** (pure computation, data structures, encoders,
  `URL`, `path`, `structuredClone`, `queueMicrotask`) or **boundary** (reaches outside the process or is process-wide:
  files, child processes, workers, network, `process.*` except `argv`, `execPath`, `exitCode` reading, environment,
  clocks and timers used for waiting, `SharedArrayBuffer`/`Atomics`, `WeakRef`/`FinalizationRegistry`). Never on the
  list: writes to any member declared in the library or a host description; `Symbol.for`, `Symbol.keyFor`; the legacy
  RegExp statics; `Object.constructor` and `Function`; `eval`; `node:vm`, `node:inspector`, `node:module`'s
  `register`/`registerHooks`; `Error.prepareStackTrace`, `Error.stackTraceLimit` writes; `Buffer.allocUnsafe` (it
  returns memory another module may have used).
- **Boundary modules** are named in the module list. Only they use boundary entries. Each owns the channels it touches
  (S5–S8): paths, programs, hosts, ports, environment names, tables. Each external channel (a path outside the
  product, a host name, a port, an environment name, a table) is written out in exactly one module.
- **Starting the list.** The first pass of each module (`design.md` §2 H) runs the inventory; the union is the
  product's first list, reviewed entry by entry against the host's documentation. A later use not on it is a place
  until the list grows by the same review.

### 1.6 What the tool can determine about the arguments of facilities that reach outside

The owner's second question. Under S5/S6 every argument naming something outside the module is a constant expression
over the module's anchors, or the result of an owner's accessor. The tool evaluates the first by a fixed interpreter
over: string and number literals; `const` bindings of them; `+` and template literals; `new URL(a, b)`,
`fileURLToPath`, `pathToFileURL`; `path.join`, `resolve`, `dirname`, `basename`, `relative`; the anchors
`import.meta.url`, `.dirname`, `.filename` (known per file), `import.meta.resolve('<literal>')` (Node's resolution
algorithm, S1), `process.execPath` (the node binary). This is constant folding, linear in the expression (inference).

| Facility (boundary) | Determined mechanically | Left to the job | After conversion |
|---|---|---|---|
| File reads and writes (`fs.*`, `createReadStream`, `opendir`, `watch`) | the evaluated path, and whether it lies in the module's own folders, an earlier module's (a reference to that module's channel; S5 asks for its accessor), a later one's (an order fault) or outside the product (an external channel, owned by one module) | which module owns an external path; splitting a helper that reads many modules' files into the owners' accessors (two steps, provider first) | every path is a constant expression, or `path.join(OWN, path.basename(x))` for run-time names (a `..` in run-time data cannot escape a `basename`), or an accessor's result |
| A cwd-relative string handed to a file API | that it is relative (so it depends on the working directory at run time, which the text does not fix) | nothing: always a place | anchored to `import.meta.dirname` |
| `spawn`, `exec`, `execFile`, `fork` | the command, each argument, the script path, the `cwd` option, if constant | the owner of the program; probes that start another module's program become that module's exported starter (S6) | constant, or the owner's starter |
| `new Worker(url)` | the evaluated URL and whose file it is | as above | as above |
| `fetch(url)`, `http.request`, sockets | the host and port when constant: an external channel, owned by one module | the owner of each external service; URLs from configuration move behind the owner's accessor | constant, or the accessor |
| `import.meta.resolve('<lit>')`, `import('<lit>')` | the resolved file, exactly (S1, S2) | nothing | — |
| `process.env.X` | the name `X` (R12) | the owner of the setting | the owner's accessor |
| Storage (SQLite, KV, Durable Objects) | table and key names when literal or of a literal-union kind | the owner of each table | S7's declared tables |

So the job studies each facility use once: the tool has already sorted it into own, earlier (with the owner), later,
outside (with the external name) or place (not constant). The judgement left is ownership and the shape of the
accessor; after the conversion, every case is decided by evaluation.

### 1.7 workerd

The Workers runtime gives a module the global scope of a service worker and hands host values in as arguments: the
`env` bindings and `ctx` passed to an exported handler (Cloudflare "Bindings",
https://developers.cloudflare.com/workers/runtime-apis/bindings/; `nodejs_compat` adds `node:` modules,
https://developers.cloudflare.com/workers/runtime-apis/nodejs/). This is S-in from §1.1: the handler's parameters must
have a declared kind from the host description (wrangler's generated `Env`), each binding an entry of the facility
list owned by one module, as S10 already asks for `wrangler.jsonc`. Nothing else differs (inference).

### 1.8 Conclusion on point 1

**CLOSABLE WITH THIS ADDED RULE: R14 (inventory and list) and R15 (host values keep host kinds; boundary modules
export accessors, not facilities), §4.** The completeness of the host's surface no longer matters: the tool does not
need to know what Node offers, only what each module names, and §1.1–§1.3 show that every route to a host value is
either named or a listed place. It rests on the checker's symbol resolution (§2.6) and on the list's descriptions
being accurate for the entries on it.

## 2. The type checker's holes

### 2.1 What the requirement needs: attribution, not full soundness

The tool needs one property: **if an expression at a place in U has a kind whose members are declared in module M,
then every value there at run time was made under that kind of M, or reached the place through a conversion the tool
attributes (R11) or lists (a place).** A hole matters only if it can deliver a value made under another module's kind
to a place typed as M's without a conversion the tool sees. A hole whose only effect is `undefined` where a value was
expected, or P's own data without its methods, is a bug, not a misattribution (`every-reference.md` §1, "(b) only").

### 2.2 What the literature establishes

- TypeScript's design goals list as a **non-goal**: "Apply a sound or 'provably correct' type system. Instead, strike a
  balance between correctness and productivity." (https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
  The handbook, "Type Compatibility", "A Note on Soundness": "The places where TypeScript allows unsound behavior were
  carefully considered"; it names function parameter bivariance and optional and rest parameters
  (https://www.typescriptlang.org/docs/handbook/type-compatibility.html). TypeScript has no current specification;
  the last language specification is archived (https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md).
- **Bierman, Abadi, Torgersen, "Understanding TypeScript", ECOOP 2014, LNCS 8586, pp. 257–281**
  (https://doi.org/10.1007/978-3-662-44202-9_11; PDF https://gavinbierman.github.io/assets/pdf/ecoop2014.pdf). They
  formalise the non-generic core (FTS) and split it into **safeFTS** and **prodFTS**. In safeFTS assignment
  compatibility is the greatest fixed point over possibly infinite tree types (coinductive, after Gapeyev, Levin and
  Pierce), **invariant on property members** ([A-Prop]), **contravariant in parameters and covariant in results**
  ([A-CS]), `any` only as a top type ([A-AnyR]), and "In safeFTS the only asserts permitted are those that are known to
  be correct" (an assertion `<T>e` needs `S` assignable to `T`). §5 Theorem 1 (subject reduction) proves safeFTS sound.
  §6 shows prodFTS adds exactly: **§6.1 unchecked downcasts**; **§6.2 `any` assignable to every type, with member
  access, calls and indexing on `any` typed `any`**, and indexing by a non-literal string typed `any`; **§6.3 covariance
  of member types and bivariance of call-signature parameters**. Each is unsound. §2 adds a fourth suspected source,
  "the treatment of recursive definitions of generic type operators", left out of the formalisation.
- **Rastogi, Swamy, Fournet, Bierman, Vekris, "Safe & Efficient Gradual Typing for TypeScript", POPL 2015**
  (https://www.microsoft.com/en-us/research/publication/safe-efficient-gradual-typing-for-typescript-3/; PDF
  https://www.microsoft.com/en-us/research/wp-content/uploads/2014/07/safets.pdf). A sound variant of TypeScript,
  with a formal core (SafeTS) and Theorem 1 (forward simulation: checks catch every dynamic type error and do not alter
  type-safe code). What it changes is a map of what must be closed: classes are **nominal** (an instance is decided by
  its prototype; §2.1); methods are distinct from fields and immutable; **`this` in a non-method function is
  unusable** ("We preclude the use of this in a non-method function", §3); **covariant subtyping only for immutable
  arrays** (`CheckedArray`, §4.5); function subtyping not coercive (`(x:Point)⇒3dPoint <: (x:3dPoint)⇒Point`
  excluded); `any` and downcasts made safe by **run-time checks**. Porting 100,000+ lines found 98 uses of bivariant
  array subtyping and 130 of covariant method arguments (§5). Since the tool cannot add run-time checks, what Safe
  TypeScript checks at run time the standard must forbid statically.
- **TypeScript 4.7 release notes**, variance annotations: TypeScript "tries to infer the variance of type parameters as
  an optimization", and "the calculation may find circularities that can't be accurately resolved"
  (https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html). The measured variance inherits
  method bivariance (run w14 below).
- **TypeScript's checker source** (5.6.3, `recursiveTypeRelatedTo` and `isDeeplyNestedType`, read): a pair already on
  the stack is assumed related ("Maybe"), which is the coinductive check of safeFTS for regular (non-expanding) types;
  but when both sides have nested three instantiations of the same generic with growing type ids ("expanding"), the
  checker returns Maybe without comparing, and a Maybe at the outermost level counts as success. That is unsound for
  expanding recursive generics, the point Bierman et al. set aside.

### 2.3 The subset K

JavaScript modules (strict by §11.2.2) checked with `allowJs`, `checkJs`, `strict` (including
`useUnknownInCatchVariables`), whose kinds are written in JSDoc from: primitives and literal types; object types
(`@typedef` object literals, classes with or without `#private` members); `ReadonlyArray`, arrays, tuples; `Map`,
`Set`, `Promise`, iterators and generators with all type arguments stated; unions and intersections of these; function
types; generics (`@template`) whose recursive references are **non-expanding** (a kind refers to itself only with its
own parameters unchanged). Not in K: conditional types, `infer`, mapped types other than the library's `Readonly`,
indexed-access types, template literal types; `this` as a parameter kind (JSDoc does not express it in `.js` files:
run, `@param {this}` is an implicit `any`, TS7006); TypeScript-only syntax (enums, namespaces, `declare`, `!`,
declaration merging beyond what JavaScript files infer). These features are what Bierman et al. leave out, or carry
relation rules ("Maybe" on expansion, deferred conditional relations) with no soundness argument.

### 2.4 Every hole for K, and how each is closed

"Attr." says whether the hole can misattribute (§2.1). "Closed by": **forbid** (a rule of the standard; the construct
is found by syntax or by the checker's own types), **tool** (the tool's own relation or attribution at a conversion),
or **TS** (the checker already refuses it in K's settings). Runs are in `exp/cases/w/`, both TypeScript versions, all
with no complaint unless stated.

| # | Hole | Source | Attr. | Run | Closed by |
|---|---|---|---|---|---|
| 1 | `any` assignable to everything; members, calls, indexing on `any` | Bierman §6.2 | yes | B7, B8 (every-reference); w13: a promise's rejection reason and `Array.isArray`'s `any[]` | forbid: R1 |
| 2 | Unchecked downcast (a cast to a narrower kind) | Bierman §6.1 | yes | x1: an `Animal` cast to `Dog`, `bark` read, TypeError at run time | forbid: **R16 (new)**, casts only upward under the tool's relation, except R2's decoding of own channels |
| 3 | Covariance of writable members, arrays and elements | Bierman §6.3 | yes | B2, B2b; w12: a `readonly` member given a writable kind | tool: R6 |
| 4 | Bivariant method parameters (method syntax exempt from `strictFunctionTypes`) | Bierman §6.3; TSConfig `strictFunctionTypes` | yes | B1, B1b | tool: R5 |
| 5 | Variance measured, not checked: `Box<Dog>` accepted as `Box<Animal>` because `put` is a method | TS 4.7 notes | yes | w14: a cat put into the dogs' box, `bark` fails | tool: **R5 on expanded members (R20, new)**: the tool relates generic instantiations member by member and never uses measured variance |
| 6 | Width into an optional member | (outside FTS) | yes | B11; w12: `tag: 7` read as `string` | tool: R6 |
| 7 | **Width re-exposed by an index signature** (an object kind given an implicit index signature, `Object.values`/`entries`, `Record<string, T>`) | handbook "Index Signatures"; implicit index signatures for object literal types | yes | w3: `{ a: Named }` holding a hidden `b: 7`, `Object.values` typed `Named[]` | tool: **R17 (new)** |
| 8 | **A protocol member hidden by width** (`then`, `toJSON`, `valueOf`, `toString`, `Symbol.iterator`, `Symbol.toPrimitive`, …) is still invoked by the language | §27.10.5.3 Await, §7.1.1 ToPrimitive, §7.4.4 GetIterator, §25.5.4.2 SerializeJSONProperty | yes: the hidden member's module runs | w1: an object with `then` relabelled `{ a: number }`; `await` yields the string `'from-then'` typed `{ a: number }` | tool: **R17 (new)**, no conversion drops a protocol member; R11 then attributes it |
| 9 | Extra optional parameter (arity widening) | handbook "Optional and Rest Parameters" | yes | B5 | tool: R7 |
| 10 | Required parameter where an optional one is expected | handbook (same) | (b) only | w10 | TS: refused under `strictNullChecks` (TS2322, run) |
| 11 | Narrowing kept across a call; a `let` reassigned in a closure | handbook "Narrowing" | yes | B6, B6b | forbid: R9, strengthened as **R19** |
| 12 | **A getter's result narrowed** (the next read runs the getter again) | as above | yes | w7: `typeof b.pet === 'number'`, then `toFixed` on `'cat'` | forbid: **R19 (new)**, narrowing only of `const` locals and never-reassigned parameters |
| 13 | **Assignment narrowing through an accessor** (getter and setter of different kinds, TS 5.1) | TS 5.1 notes, "Unrelated Types for Getters and Setters" | yes | w9: after `t.v = 5`, `t.v` read as `number`, is `'text'` | forbid: R19 |
| 14 | `in` narrowing fooled by a hidden member | TS 4.9 notes, "Unlisted Property Narrowing with the in Operator" | — | w2 | TS: since 4.9 the narrowed member is `unknown` (TS18046, run) |
| 15 | User-written type guards and assertion functions | handbook "Narrowing" | yes | A5 | forbid: R3 |
| 16 | **A receiver of another kind given to `call`, `apply`, `bind`, `Reflect.apply`** (a method without a declared `this`) | §20.2.3.3; TSConfig `strictBindCallApply` | yes | w6: `D.prototype.up.call({ y: 1 })` | tool: **R18 (new)**, the receiver is a conversion to the method's class |
| 17 | Unbound method call (`this` undefined) | Safe TS §3 | (b) only | (read) | — |
| 18 | Overload signatures over an implementation | handbook "Function Overloads"; JSDoc `@overload` | yes | B12 | forbid: R10 |
| 19 | Suppression comments | — | yes | B9 | forbid: R10 |
| 20 | The library's own `any` and bivariance (`JSON.parse`, `Reflect.*`, `Object.getPrototypeOf`, `Promise` rejection, `Array.isArray`, method syntax throughout `lib.d.ts`) | lib.es5.d.ts | yes | B7, w13 | forbid: R1 (every `any`); tool: R5 at each conversion; host description re-declares the channels as `unknown` (every-reference §3.1) |
| 21 | JavaScript leniencies (`[]`, `new Map()` without arguments, `Object`, `arguments`, untyped `Function`) | handbook "Type Checking JavaScript Files" | yes | B7 | forbid: R1 |
| 22 | `Object.assign`, `defineProperty`, `setPrototypeOf` | lib | yes | B4 | forbid: R8 |
| 23 | Proxy (a `get` trap returns `any`) | lib `ProxyHandler` | yes | (read) | forbid: R1; `Proxy` off the facility list |
| 24 | Generic signature compared after erasing type parameters | handbook "Type Compatibility", Generics | — | w8 | TS: refused (TS2322, run); R20 keeps generic-to-non-generic conversions to explicit instantiation |
| 25 | Expanding recursive generics assumed related at depth 3 | checker source; Bierman §2 | yes (in principle) | (read) | forbid: R20, non-expanding recursion only |
| 26 | Classes without `#private` are structural; `instanceof` on a plain object typed as the class | Safe TS §2.1 | (b) only | (read) | — (optional: `#private` makes them nominal) |
| 27 | Declaration merging, enums | — | — | — | not expressible in `.js` (K); expando members on another module's value are R8/S8 |
| 28 | Index reads without `noUncheckedIndexedAccess`; class fields never assigned; shape after a structured or JSON copy; spread of a class instance's accessors | handbook; TSConfig | (b) only | B3, C1 | — (flags optional) |
| 29 | Host and package descriptions that are wrong | — | yes | — | premise (§2.6), bounded to the facility list's entries |
| 30 | The checker computes a kind other than the documented one (a bug) | — | yes | — | premise (§2.6) |

### 2.5 Why the list is complete for K (inference from the paper)

safeFTS is sound (Bierman Theorem 1). prodFTS differs from it by the rule families of §6.1–§6.3, rows 1–4. K extends
FTS by: generics (rows 5, 24, 25), optional members and parameters (6, 9, 10), index signatures (7), protocols the
language invokes (8), control-flow narrowing (11–15), receivers and `this` (16, 17), overloads (18), suppression (19),
the library (20–23), JavaScript inference (21), classes (26), and run-time copies (28). For each extension the rows
list every relation or typing rule the handbook documents for it, with a run where one could be built. That the
checker has no further undocumented unsound rule inside K is not provable by study (row 30). The soundness of K as a
whole with R1–R20 is argued from the parts: safeFTS for the core; readonly covariance and contravariant parameters as
in Safe TypeScript's formal core and standard subtyping (Pierce, *Types and Programming Languages*, ch. 15, 20–21);
coinductive relation of non-expanding recursive types (Gapeyev, Levin, Pierce, "Recursive subtyping revealed", JFP
12(6), 2002, Bierman's reference [6]). **No published theorem covers K exactly**; the argument composes results.

### 2.6 What cannot be closed by study

- **The checker's implementation** (row 30). There is no specification to read it against; "as documented" means the
  handbook and release notes. A bug in inference or narrowing inside K would misattribute silently, like a parser bug
  in reading imports. Held by the pin (one exact version), by keeping every case above and in `every-reference.md` as
  the tool's tests, and reducible only by an independent checker for K (Safe TypeScript is a precedent: a separate
  checker with a proof for its core). How large: unknown; none is known after R1–R20 (inference).
- **The descriptions** (row 29): `@types/node` is maintained apart from Node; the tool's own description is written by
  hand. Each facility-list entry is reviewed against the host's documentation once; a wrong return kind can
  misattribute only values the host makes or carries, so the exposure is the list, not the host.

### 2.7 The owner's third question: can the standard avoid every hole?

Yes, for every hole that can misattribute, by one of two means; none needs a run-time check.
- **Forbidden where it lives** (the standard names the construct; found by syntax or by the checker's types): `any`
  (R1), unchecked decoding and guards (R2, R3), downcasts (R16), narrowing of anything but a `const` or an unassigned
  parameter (R19), overloads and suppression (R10), reflective writes (R8), expanding recursion and the kinds outside
  K (R20), host facilities off the list (R14).
- **Checked by the tool itself at each conversion**, because the construct is ordinary code and only the relation is
  wrong: writable members invariant, `readonly` not given a writable kind, no width into optional members (R6); method
  parameters contravariant (R5) on expanded instantiations (R20); no arity widening (R7); no width into index signatures
  and no protocol member dropped (R17); receivers related to the method's class (R18); both sides attributed (R11).
- **Already refused by TypeScript in K's settings**: rows 10, 14, 24.
- **Not needed**: the (b)-only rows 17, 26, 28.
- **Not avoidable by any rule**: rows 29 and 30, the premises.

### 2.8 Conclusion on point 2

**CLOSABLE WITH THESE ADDED RULES (R16–R20, §4), within K; NOT CLOSABLE BY STUDY: the correctness of the pinned
checker's implementation and of the facility list's descriptions,** both premises of the claim, of the same kind as
trusting the parser and Node itself.

## 3. Dependencies that are not values

### 3.1 From the owner's definition

The owner's rule (design part 2 §7): "any change to either a provider's domain or range necessitates that its users be
retested". `changes.md` §1 made domain and range exact for JavaScript: the domain includes what an entry requires to
be there already (state, files, environment, how it is started, a deadline); the range includes every effect another
module can observe (values, thrown errors, stored rows, messages, globals) and **timing** (sync or async, timers, the
order of callbacks). So timing, side effects and required prior state **are** dependencies the provider/user
requirement must catch, when they are part of an entry U uses. The question is only whether the *reference* to that
entry is found. Three cases.

### 3.2 Evaluation order: closed by study (given S7, S8)

- An import makes the provider run first: InnerModuleEvaluation evaluates every requested module before the module
  itself (ECMA-262 §16.2.1.6.1.3.1; with top-level await, §16.2.1.6.1.3.2 ExecuteAsyncModule keeps the order of
  completion). So if U imports P, P has run.
- If U does not import P, U can observe that P ran only through state P changed that U reads. Under S8 there is no
  shared global, prototype, `Symbol.for` or process-wide channel; under R14 no host member is written and no
  process-wide host setting is used outside a boundary module; under S7 there is no run-time registry. The remaining
  state is a module's own, reached only through its exports: a found reference. So "U relies on P having run" without
  a reference to P is not possible under the standard (inference from the spec sections and the rules).

### 3.3 State written by one user and read by another: the composer's dependency (closed by study)

P exports `setLocale(l)` and `word(k)`; U1 calls `setLocale('fr')`, U2 calls `word('title')`. U2's results depend
on U1's call. But they do so only in a process where both run, which is a run of some module M that loads both (the
product, or a later module's tests). In U2's own tests U1 is not loaded unless U2 imports it (then found). The
dependency belongs to M, which references U1 and U2 (found), and the effect "P's state set to fr" is in the range of
U1's entry (`changes.md` §1: "Stored rows, files, messages, globals: range"). So it is found, at the module whose
behaviour it is. With top-level effects allowed, M's reference could be a bare `import './u1.js'` (an A3 import: still
found); R21 makes it an explicit call.

### 3.4 The event loop and background activity: closable with R21

Jobs run in the order the host enqueues them (§9.5, §9.5.5 HostEnqueuePromiseJob; §27.5.2 Promise Jobs), and timers,
I/O callbacks and the rejection tracker (§27.5.1.9 HostPromiseRejectionTracker; Node ends the process on an unhandled
rejection by default, https://nodejs.org/api/cli.html#--unhandled-rejectionsmode) are the host's. Code of P can take
part in U's process only if P's module is loaded there: by §1.1 and S2/S9, the code that runs is exactly the modules
in the static and literal-dynamic import closure of the entry (U's test files, or a composer). Two routes remain for P
to affect U's timing or failure without U calling P:
- **Activity started at evaluation** (a timer, an interval, a listener, a server, a read): it runs because someone
  imported P, and it keeps running while U works. **R21** forbids it: a module's top-level code only declares and
  initialises its own bindings and calls earlier modules' entries; it starts no timer, listener, I/O or other boundary
  facility. Then P's code runs only when an entry of P (or a function P handed out, typed under R4/R11) is called, and
  every activity P starts is part of that entry's range, with a found caller.
- **Activity started by a call** (U calls Q, Q calls `P.startPolling()`): part of the range of Q's entry; told through
  Q's marks (`design.md` §2 C; the tool already flags timers and sync-to-async).

### 3.5 Resources and contention

- **Within a process** (memory, file descriptors, the libuv thread pool, sockets of a shared agent): observable by
  other modules only as timing or failure. By §3.4 only modules in the run consume them, and each consumption is part
  of a called entry's range. Found as references; whether a change altered the consumption is the change half.
- **Between processes**: the Node test runner runs each test file in its own process, concurrently
  (https://nodejs.org/api/test.html, "Test runner execution model", `--test-concurrency`). Then P's tests can slow U's
  or collide with them on a fixed port or path. P is not U's provider in any sense of the owner's rule: no change to
  P's domain or range is involved, only the machine. It is test non-isolation. A shared fixed resource is an external
  channel, owned by one module (R14); clocks used for assertions are boundary facilities (R14), so in a test they are
  places. **R22** states it for tests: resources only the module's own or ephemeral (port 0, `fs.mkdtemp`), no
  assertion on elapsed real time, timers through the runner's mock timers (https://nodejs.org/api/test.html#class-mocktimers).
- **Garbage collection** (WeakRef, FinalizationRegistry): liveness is the implementation's choice (§9.9); both are
  boundary entries (R14).

### 3.6 Conclusion on point 3

**CLOSED BY STUDY**: reliance on evaluation order and on state another module set (§3.2, §3.3), given S7, S8, R14.
**CLOSABLE WITH THESE ADDED RULES**: background activity (R21) and contention in tests (R22). **NOT CLOSABLE, and
outside the reference claim**: whether a particular change altered an entry's timing or resource use. That is a
property of what two programs do, undecidable in general (Rice's theorem, `standard.md` §1.5), so it stays the job's
mark with the tool's flags (`design.md` §2 C). How large: every change to code that runs on the event loop; the flags
cover the language facts (timers, sync to async, process use), not costs.

## 4. The added rules (exact words)

Numbered after `every-reference.md`'s R1–R13.

- **R14 Host facilities by inventory.** The tool lists, for each module, every use of a host facility: every module
  request whose specifier is not a product module, every identifier that resolves to the global environment, every
  `import.meta` member, every handler parameter the host passes, and every member read, write, call or implicitly
  invoked member whose declaration is in the language library, the host description or a package's declarations.
  Each use must match an entry of the product's facility list (a qualified declaration name, marked in-process or
  boundary, under the pinned Node, workerd, TypeScript and package versions). A use not on the list, any write to a
  member declared there, and a use of a boundary entry outside a boundary module named in the module list, is a place.
  Each external channel (a path outside the product, a host name, a port, an environment name, a table) is written
  out in exactly one module.
- **R15 Host values keep host kinds; boundaries hand out no facility.** A conversion that gives a member declared in
  the library, the host description or a package a kind declared in the product is a place. An export of a boundary
  module takes no path, URL, command, program, channel, table or key from its caller except as a value of a
  literal-union kind that module declares.
- **R16 Casts only upward.** A cast (`/** @type {T} */ (e)`, `@satisfies` aside) is allowed only where `e`'s kind is
  assignable to `T` under the tool's relation (R5–R7, R17); a cast to a narrower kind is a place, except R2's decoding
  of the module's own channel.
- **R17 No hidden members.** A conversion to a kind with an index signature (written, or implicit for an object type,
  or inferred by `Object.values`, `Object.entries`, `Object.assign` or a spread) is allowed only from a kind with an
  index signature of the same element kind or from an object literal written there. No conversion drops from its
  source kind a member the language invokes implicitly: `then`, `toJSON`, `valueOf`, `toString`, `constructor`, and the
  well-known symbol members (`Symbol.iterator`, `asyncIterator`, `toPrimitive`, `hasInstance`, `toStringTag`,
  `species`, `isConcatSpreadable`, `match`, `matchAll`, `replace`, `search`, `split`, `unscopables`), and Node's
  `util.inspect.custom`.
- **R18 Receivers are conversions.** In `f.call(r, …)`, `f.apply(r, …)`, `f.bind(r, …)` and `Reflect.apply(f, r, …)`,
  where `f` is a product function, `r` is related to `f`'s declaring class or `@this` kind as a conversion (R5–R7,
  R11, R17); a function that reads `this` and has neither is a place when called this way.
- **R19 Narrowing only of stable names.** Narrowing (by `typeof`, `instanceof`, equality, a discriminant, `in`, a
  guard or an assignment) is relied on only for a `const` local or a parameter never assigned; a narrowed member path,
  element access, or `let` is a place (copy to a `const` first). This replaces R9.
- **R20 Kinds in K.** No conditional, mapped (other than `Readonly`), indexed-access or template literal kinds, and no
  `infer`; a generic kind refers to itself only with its own parameters unchanged; a generic function is converted
  only to a generic signature of the same type parameters or after explicit instantiation; the tool relates generic
  instantiations member by member (R5–R7) and does not use the checker's measured variance.
- **R21 Evaluation starts nothing.** A module's top-level code declares and initialises its own bindings and may call
  earlier modules' entries; it starts no timer, interval, listener, server or worker and uses no boundary facility.
- **R22 Tests are isolated.** A module's tests use only resources named by the module's own written-out anchored
  paths, or ephemeral ones (port 0, a temporary directory they create); they assert on no elapsed real time, and use
  the test runner's mock timers instead of real delays. Clock reads in tests are boundary uses (R14), so each is a
  place unless it feeds no assertion.

## 5. The final claim, in the words the study supports

> Under the standard S1–S13, with R1–R8, R10–R12 and R14–R22 (R19 replacing R9), the settings `strict` (including
> `useUnknownInCatchVariables`) and a host description in which every untyped channel has the kind `unknown`, for every
> module U and every earlier module P, every dependency of U on P in the owner's sense — some change to the domain or
> range of an entry of P, including its effects, its timing and the state it requires, can change what U's code or
> tests do — is either listed by the tool as a use of that entry of P, or reached through a listed use of an entry of
> an intermediate module whose range carries P's, or lies at a place the tool lists as outside the standard, with its
> rule; and every host facility U uses is listed by the tool and is on the product's facility list or is such a place.
> This holds for the TypeScript, Node, workerd and package versions the facility list names, given two premises that
> no study of the language can discharge: that the pinned TypeScript checker resolves each symbol and computes each
> expression's kind, within the kinds R20 allows, as its documentation describes; and that the descriptions of the
> entries on the facility list are true of the host. It does not cover copies, which are not references (marked and
> exact copies are found with certainty, others by no tool), nor whether a given change altered an entry's timing or
> resource use, which is the job's mark on what changed, nor interference between separate processes, which is not a
> dependency on a provider and which R22 keeps out of tests.

## 6. What this would change (for PROCESS, if taken further)

- `standard.md`: R14–R22 beside R1–R13; S8's examples gain the legacy RegExp statics and writes to intrinsics.
- The tool: the inventory (a walk over symbols the checker already resolves, as `usage.mjs` does); the facility list
  file; R15–R19 as places; the R5–R7 relation applied to expanded generic instances; the constant evaluator of §1.6;
  the host description loses `process`'s `[key: string]: any`; the runs `exp/cases/h1`, `h2`, `w/*`, `x1` as tests.
- The first pass of each module (`design.md` §2 H) produces its inventory; the product's first facility list is their
  union, reviewed entry by entry.
- Optional, for the owner: an independent checker for K, to replace the TypeScript premise by a smaller one.

## 7. Sources

ECMA-262, 2027 draft (https://tc39.es/ecma262/ and the multipage edition https://tc39.es/ecma262/multipage/), sections
by number: §2 Conformance; §4.2 Hosts and Implementations; §6.1.7.4 Well-Known Intrinsic Objects; §6.2.5.5 GetValue;
§6.2.5.6 PutValue; §7.1.1 ToPrimitive; §7.4.4 GetIterator; §9.1.1.4 Global Environment Records; §9.1.1.5 Module
Environment Records (§9.1.1.5.4 GetThisBinding, §9.1.1.5.5 CreateImportBinding); §9.1.2.1 GetIdentifierReference;
§9.3.1 InitializeHostDefinedRealm; §9.3.2 CreateIntrinsics; §9.4.2 ResolveBinding; §9.5 Jobs (§9.5.2, §9.5.3,
§9.5.5); §9.9 WeakRef and FinalizationRegistry processing model; §10.1.13 OrdinaryCreateFromConstructor; §10.4.4
Arguments Exotic Objects; §11.2.2 Strict Mode Code; §13.2.2–§13.2.8; §13.3.2 Property Accessors; §13.3.5–§13.3.7;
§13.3.6.2 EvaluateCall; §13.3.10 Import Calls; §13.3.11 Tagged Templates; §13.3.12 Meta Properties (§13.3.12.1.1,
§13.3.12.1.2); §13.10.2 InstanceofOperator; §14.15 The try Statement; §15.2–§15.8; §16.2.1.6.1.3.1
InnerModuleEvaluation; §16.2.1.6.1.3.2 ExecuteAsyncModule; §16.2.1.10 HostLoadImportedModule; §17 and §17.1 Forbidden
Extensions; §19 The Global Object; §19.2.1 eval, §19.2.1.2 HostEnsureCanCompileStrings; §20.2.1 The Function
Constructor; §20.2.3.3 Function.prototype.call; §20.4.2.4 Symbol.for; §25.5.4.2 SerializeJSONProperty; §27.5.1.9
HostPromiseRejectionTracker; §27.5.2 Promise Jobs; §27.5.5.4 Promise.prototype.then; §27.10.5.3 Await; Annex D Host
Layering Points (D.1–D.6). TC39 proposal "Legacy RegExp features in JavaScript",
https://github.com/tc39/proposal-regexp-legacy-features.

G. Bierman, M. Abadi, M. Torgersen, "Understanding TypeScript", ECOOP 2014, LNCS 8586, 257–281,
https://doi.org/10.1007/978-3-662-44202-9_11 (read: §2, §3, §4 Definition 2 and rules, §5 Theorem 1, §6.1–§6.3).
A. Rastogi, N. Swamy, C. Fournet, G. Bierman, P. Vekris, "Safe & Efficient Gradual Typing for TypeScript", POPL 2015,
https://www.microsoft.com/en-us/research/wp-content/uploads/2014/07/safets.pdf (read: §1, §2.1, §2.3, §3 "Restricting
the use of this", §4.5, §5). V. Gapeyev, M. Levin, B. Pierce, "Recursive subtyping revealed", JFP 12(6), 2002 (cited
through Bierman et al., not read). B. Pierce, *Types and Programming Languages*, MIT Press 2002, ch. 15, 20, 21 (cited,
not reread).

TypeScript: Design Goals (https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals); handbook "Type
Compatibility" (https://www.typescriptlang.org/docs/handbook/type-compatibility.html), "Type Checking JavaScript
Files", "JSDoc Reference", "Narrowing", "Index Signatures"; TSConfig `strictFunctionTypes`, `strictBindCallApply`,
`noImplicitAny`, `useUnknownInCatchVariables`; release notes 4.7 (variance annotations), 4.9 (`in` narrowing), 5.1
(unrelated getter and setter types); archived language specification
(https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md); checker source of 5.6.3
(`recursiveTypeRelatedTo`, `isDeeplyNestedType`), read in `node_modules/typescript/lib/typescript.js`.

Node.js: "Modules: node:module API", `module.builtinModules` and its history
(https://nodejs.org/api/module.html#modulebuiltinmodules); "Command-line API", `--unhandled-rejections`; "Test
runner", execution model and `MockTimers` (https://nodejs.org/api/test.html); "Globals"; "Process". Cloudflare Workers:
"Bindings", "Node.js compatibility".

In this repository: `standard.md`, `every-reference.md`, `design.md`, `changes.md` in this folder;
`tool/lib/notice/ts.mjs`, `tool/lib/notice/node.d.ts`, `tool/package.json`.
