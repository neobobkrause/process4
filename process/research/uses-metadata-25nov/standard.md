# A standard for how a module may refer to an earlier one, so the tool can find every reference (25 Nov 2026)

Status: research for PROCESS #15, by a worker. Nothing changed, nothing decided. Read at origin/main cc0ff85. For the owner's
words of 25 Nov (conversation, not a decision): "the tool's operation should be based directly from a deep understanding
of JS's specific means by which a reference is made ... establish a list of ways that code can refer to an earlier
module, make that be the standard, and change existing references outside those standard ways so that all modules
conform to that standard. (Just brainstorming)". Builds on `means.md` (31 means), `tool-map.md` and `design.md` in this
folder.

How sure: **spec** means read in the ECMAScript specification or the Node.js or TypeScript documentation, cited by section
or page name; **run** means shown by a small experiment with TypeScript 6.0.2 under Node 22 (scratch, not kept);
**measured** means a civicsmith number from a cited reading; **estimate** and **inference** mean reasoning, not shown.
Sources read: ECMA-262 (the 2027 draft at tc39.es, section numbers as there; they shift slightly between editions), the
Node.js v26.13.1 documentation pages named below, and the TypeScript handbook pages named below.

## Summary and bottom line

1. **The set of mechanisms can be derived, not sampled, and it is closed at the language level.** By the specification,
   code in a module can obtain anything from outside itself through only seven channels: (1) the static import graph,
   (2) loading by a specifier at run time, (3) the shared global environment and the realm's built-in objects, (4) values
   carried across calls (arguments, results, thrown values, callbacks, promise settlements, implicitly invoked members),
   (5) `import.meta`, (6) code compiled from text, and (7) the host's own facilities (in Node: files, processes, threads,
   network, environment, named process-wide channels, loader hooks). Outside the program there are three more: copies
   made with knowledge, configuration and build steps that name code, and the order in which modules are evaluated.
   Section 1 gives the full list (about 60 mechanisms), maps means.md's 31 onto it, and names 16 that means.md did not
   list (for example `Symbol.for`, `diagnostics_channel` and `BroadcastChannel` by name, `AsyncLocalStorage`, loader
   hooks and `mock.module`, members invoked implicitly such as `then` and `toJSON`, reliance on another module having
   been evaluated first).
2. **Where completeness cannot be proven.** Channels 1 to 6 are closed by the specification. Channel 7 is as open as the
   host: the list is complete only for the Node and workerd versions read, and each release adds to it (Node 26 added
   package maps and text modules). Which values actually flow where at run time is undecidable in general, so no tool
   can find value-flow references in unrestricted JavaScript with certainty. Copies have no reference to find at all.
3. **A standard of 13 rules makes references findable with certainty from the text** (section 2): references only by
   import forms with literal specifiers that resolve by Node's documented algorithm without flags or hooks; no computed
   loading, no code from text; no cross-module file, program or config reach except through the owner module's exported
   accessor; calls and tables by name only with literal names through a declared table; no writes to shared global or
   process-wide state; and, for values, every module boundary named by a JSDoc kind, no `any` reaching a member read, and
   no re-typing of another module's value as an own kind. Two of these already stand as design part 2 §7 rules 4 and 5.
4. **Under the standard the tool can compute each module's uses exactly** (provider, entry, files, code or tests) from
   the module's own text and its providers' declared kinds, with one cheap reader per module at its own job, and the
   record stays accurate through the existing notice (a change that alters a user's computed uses is a change to a
   provider's declared kinds, which tells that user). The job-written uses file then shrinks to a residue: claims at
   untyped channels (which the tool can list but not verify) and copies.
5. **Designs (section 3).** (a) the job-written file of design.md adds no refusal and works now, but nothing checks its
   B, C and D records. (b) a tool-computed list adds no refusal if non-standard references stay "cannot tell" under
   the existing rule 2 fallback, but it over-tells exactly as today until a module conforms. (c) a job file checked for
   exact agreement adds a refusal, and is dominated: where the tool is exact the file is a copy; where it is not, the
   agreement cannot be checked. **A fourth, the union** (tool-computed uses plus the job's file for the residue, telling
   whoever either names), adds no refusal and is never worse than (a). Refusing non-standard forms would be **a new
   refusal**: design part 2 §6 says such uses are "cannot tell", not refused, and a form refusal is not a disagreement
   between declared and actual uses. Widening the forms the existing check reads (say a literal `new URL` into another
   module) and refusing an undeclared or later use by them is the existing refusal over more forms, but it changes §6's
   text, so it is the owner's call too.
6. **Value flow (section 4).** Plain JavaScript with JSDoc and no type checker cannot make "U reads P's `Row` received
   through Q" certain: a comment is a claim, and nothing derives the value's origin. With TypeScript's checker in strict
   checkJs and the standard's kind rules, it becomes certain within the checker's model (run: typed and inferred
   passers, spreads and destructuring all resolve to P's declaration; a JSON value, an untyped callback and an own copy
   of P's kind do not, and each is caught by one rule). What remains uncertain is listable: casts and type guards at
   untyped channels (JSON, messages, storage, environment), TypeScript's documented unsound points, and run-time shape
   changes (a class instance after a JSON copy, the proof's Y02).
7. **civicsmith's conformance (section 5).** Imports already conform (6,016 cross-module static imports, measured). Most
   non-conforming references are the refactoring plan's own work, because they point later: 5,350 references to later
   parts (3,884 from code), 341 open computed references, 19 walks, test-support's helper reaching 95 later parts, 62
   files booting plane (measured). The new work is the value rule: nearly every module reads untyped values (194 of
   setup-words' 197 told users were not followed for that, measured), so typing every boundary is judgment per module,
   likely costlier than design.md's uses pass (estimate, unmeasured).

**Bottom line.** A rigorous tool is possible only with a standard: the language allows references a static reader can
never find, so "find them all in whatever code is written" has no rigorous answer, and "find them all in code written
to a list of forms" has one. The reference rules (section 2, S1 to S3 and S5 to S12) are cheap where code already
points earlier and coincide with civicsmith's refactoring where it does not. The value rule (S4) is what turns the
uses file from a job's word into a computed fact, and it is the expensive part. Recommended to put to the owner: adopt
the standard as text (as rules 4 and 5 are now), let the tool compute uses for what conforms and print each
non-conforming reference as "cannot tell", tell by the union of computed uses and the job's residue file, and leave a
refusal of non-standard forms to his marked decision as the new refusal it is.

## 1. The complete set of mechanisms

### 1.1 What counts as a dependency

U depends on P when some change to P's files alone can change what U's code or tests do (a value, a thrown error, a
file's contents, a timing, a pass or fail). A **reference** is a place in U's text, or in text U's run reads, that
selects P's code, data or effect. The owner's rule tells by entry, so the target granularity is P's entry (export,
operation, table, member of a kind), plus, under the standard, files and programs offered through an exported accessor.

### 1.2 The argument from the language's definition

ECMAScript's evaluation reads state only through environment records, the objects reachable from values it holds, and
host operations (spec). For code in a module:

- **Identifiers** resolve through the lexical environment chain to the module's own declarations, its import bindings,
  or the global environment (ECMA-262 §9.1 Environment Records; §9.1.1.5 Module Environment Records, §9.1.1.5.5
  CreateImportBinding; §9.1.2.1 GetIdentifierReference). An import binding is an indirect binding to the exporting
  module's environment, found by §16.2.1.7.2.2 ResolveExport.
- **Which module a specifier names** is host-defined: §16.2.1.10 HostLoadImportedModule maps (referrer, specifier,
  attributes) to a Module Record, must give the same answer for the same pair, and leaves the mapping to the host
  ("typically a normalization process"). The module requests of a Source Text Module Record are static semantics of its
  text (§16.2.1.4 ModuleRequests; §16.2.2 Imports; §16.2.3 Exports; §16.2.2.4 WithClauseToAttributes).
- **Run-time loading** goes through the same host hook from an import call (§13.3.10 Import Calls, §13.3.10.2
  EvaluateImportCall). `import.meta` is filled by the host (§13.3.12.1.1 HostGetImportMetaProperties).
- **Code from text**: `eval` (§19.2.1, §19.2.1.1 PerformEval) and the Function constructors (§20.2.1.1.1
  CreateDynamicFunction), gated by §19.2.1.2 HostEnsureCanCompileStrings.
- **Shared mutable places in a realm**: the global object (§19 The Global Object, §19.1.1 globalThis), the realm's
  intrinsics and their prototypes (§9.3 Realms, §9.3.2 CreateIntrinsics), and the agent-wide symbol registry (§20.4.2.4
  Symbol.for, §20.4.5.1 GlobalSymbolRegistry Records). Module records are themselves shared: every importer of a
  specifier gets the same instance, so module-level state is a singleton (§16.2.1.10's "same result each time").
- **Values across calls**: arguments, `this`, results, thrown completions, promise reactions (§9.5 Jobs and Host
  Operations to Enqueue Jobs), generator resumptions, and members the language calls implicitly (getters, setters,
  Proxy traps, `Symbol.iterator`, `Symbol.toPrimitive`/`valueOf`/`toString`, `Symbol.hasInstance`, a thenable's `then`,
  `toJSON` from `JSON.stringify`). Every such value originated through one of the other channels in some module.
- **Other agents** (Worker threads, processes) share nothing but what the host provides: messages, shared memory
  (§9.7 Agent Clusters; the memory model), and the host's I/O.

So the channels are: **(1) static linking, (2) run-time loading, (3) shared realm state, (4) values across calls, (5)
`import.meta`, (6) code from text, (7) host facilities**. Channels 1 to 6 are enumerated by the specification.
Channel 7 is whatever the host offers; in Node it is reached through `node:*` module requests or host globals (Node.js
"Globals" page), so it is enumerable for a given version. Three channels lie outside the running program: **(8) copies**
(knowledge with no reference), **(9) configuration and build steps that name code**, **(10) evaluation order**
(§16.2.1.6.1.3 Evaluate and InnerModuleEvaluation fix the order; a module can rely on another having run first without
naming it).

### 1.3 The mechanisms, by channel, with means.md's numbers

"New" marks a mechanism means.md does not list.

| Ch. | Mechanism | Source | means.md |
|---|---|---|---|
| 1 | `import { x } from`, default, namespace `* as W`, side-effect `import 'm'` | ECMA-262 §16.2.2 | A1, A2, A3 |
| 1 | `export { x } from`, `export * from`, `export * as ns from` (re-exports; the declaring module by ResolveExport) | §16.2.3, §16.2.1.7.2.2 | A6 |
| 1 | Import attributes: JSON modules `with { type: 'json' }`; text modules `with { type: 'text' }` (Node 26, behind `--experimental-import-text`) | §16.2.1.8.2 ParseJSONModule; Node "Modules: ECMAScript modules", Import attributes, JSON modules, Text modules | A8 (JSON); text **new** |
| 1 | Wasm modules and `import source` (source phase imports), unflagged since v24.5 / v22.19 | Node "ECMAScript modules", Wasm modules | **new** |
| 1 | Specifier forms: relative URL; bare name through `node_modules` and `package.json` `"exports"` (subpaths, patterns, conditions); own name (self-reference); `#` through `"imports"`; package maps (Node 26.4, `--experimental-package-map`) | Node "Modules: Packages" (Subpath exports, Subpath patterns, Conditional exports, Resolving user conditions, Self-referencing a package using its name, Subpath imports, Package maps); "ECMAScript modules", Resolution Algorithm Specification | A1, A4, A5; package maps **new** |
| 1 | Type-only references: JSDoc `@import`, `import('…').T`, `@typedef` built on them | TypeScript "JSDoc Reference" | A7 |
| 2 | `import(spec)` literal or computed; `import.meta.resolve(spec)` | §13.3.10; Node "ECMAScript modules", import() expressions, import.meta.resolve | A8, A9 |
| 2 | `require(spec)`, `require.resolve`, `module.require`, `require.main.require`, `require(esm)`; `createRequire(x)` from any base; `module.findPackageJSON` | Node "Modules: CommonJS modules" (All together, Loading from node_modules folders, Loading from the global folders: `NODE_PATH`); "Modules: node:module API" | A8, A9, D7 |
| 2 | A helper that loads modules its callers name; walks that list the tree and load each | (built from the above) | A10, A11 |
| 2 | Loader customization: `module.register`, `module.registerHooks` (resolve and load hooks), `--import`/`--require`/`--experimental-loader` preloads, `NODE_OPTIONS`, `--conditions`, `--preserve-symlinks` | Node "node:module API", Customization Hooks; "Command-line API" | preload in D4; hooks **new** |
| 2 | Test module mocking: `mock.module(specifier)` replaces a module for the test's importers; `mock.method(obj, 'name')`, `mock.property` | Node "Test runner", Mocking, `mock.module` (`--experimental-test-module-mocks`) | **new** |
| 2 | `vm.SourceTextModule`, `vm.SyntheticModule`, `vm.Script`, `importModuleDynamically` | Node "VM" | **new** (with ch. 6) |
| 3 | Writes to the global object (`globalThis.x`, `Object.defineProperty(globalThis, …)`), reads of them | §19 | D4 |
| 3 | Patching intrinsics' prototypes (`Array.prototype.x`), another module's class or exported object, CommonJS `module.exports` of another module; `module.syncBuiltinESMExports()` | §9.3.2; Node "node:module API" | **new** |
| 3 | `Symbol.for('key')`: string-keyed identity shared across modules and realms | §20.4.2.4, §20.4.5.1 | **new** |
| 3 | Module-level singletons: one module's exported state written by U1 and read by U2 (a cache, a registry, `register`/`lookup`); live bindings (`export let`) | §16.2.1.10, §9.1.1.5 | D4 (registries); the U1→U2 edge **new** |
| 4 | P's value or kind handed to U by Q (passer), handles, inferred shapes, callbacks, values U builds for P, thrown errors, inheritance | §9.5 and call semantics | B1 to B7 |
| 4 | Members invoked implicitly: getters and setters, Proxy traps, `then` (await), `toJSON`, `Symbol.iterator`, `Symbol.toPrimitive`, `Symbol.hasInstance`, `util.inspect.custom` | ECMA-262 (Await, GetIterator, ToPrimitive, InstanceofOperator, JSON.stringify) | **new** (a variant of B) |
| 4 | Implicit context: `AsyncLocalStorage` (a store set by a caller's module, read by a callee without a parameter) | Node "Asynchronous context tracking" | **new** |
| 5 | `import.meta.url`, `.dirname`, `.filename`, `.main`; CommonJS `__dirname`, `__filename` | §13.3.12; Node "ECMAScript modules", import.meta | used by D1 to D3 |
| 6 | `eval`, `new Function`, `vm.runIn*Context`, `vm.compileFunction`, `node -e`, `Function.prototype.toString` and stack traces read as source | §19.2.1, §20.2.1.1; Node "VM" | `node -e` in D3; rest **new** |
| 7 | Files: reading another module's source, data, fixtures, schemas, `package.json`; listing the tree | Node "File system" | D1, D2, A11, D7 |
| 7 | Programs: `child_process` spawn and exec, `new Worker(path or URL)`, Miniflare or workerd booting a script by path, service bindings | Node "Child process", "Worker threads" | D3 |
| 7 | Messages: `postMessage`, `MessageChannel`, stdin and stdout, HTTP, Durable Object RPC | Node "Worker threads" | D5 |
| 7 | Named process-wide channels: `diagnostics_channel.channel(name)`, `new BroadcastChannel(name)`, `worker_threads.setEnvironmentData(key)`, `process.on`/`process.emit` of custom events | Node "Diagnostics Channel", "Worker threads", "Process" | **new** |
| 7 | Environment: `process.env`, `--env-file`, `process.argv`, `process.cwd()` used to find product files | Node "Process", "Command-line API" | D4 (env) |
| 7 | Run-time stores: SQLite, KV, Durable Object storage, temp files written by one module and read by another; tables by name | Node "SQLite" and the hosting platform | C2; run-time files **new** |
| 7 | Opaque code: native addons (`.node`, `process.dlopen`), Wasm | Node "C++ addons", "ECMAScript modules" | **new** |
| 4/7 | Calls by name through a carrier (`door.call('priceof')`, `op=x&`); tables by name; per-module tables gathered by a walker; data keys (`word('setup.title')`) | build text 2b §5 | C1, C2, C3, C4 |
| 9 | Configuration naming code: `wrangler.jsonc` (`main`, `class_name`, `script_name`, `services`), `package.json` (`main`, `exports`, `bin`, `scripts`), test runner globs that pick up another module's tests | the platforms' formats | C5; test globs **new** |
| 9 | Generated code: a generator in G writes a file owned by M | | D6 |
| 8 | Copies: a path, a limit, an operation name, an English text copied without a reference | | D8 |
| 10 | Evaluation order: U relies on P (a polyfill, a registration) having been evaluated first because an entry file imported P before U | §16.2.1.6.1.3 | **new** |
| — | Second level: U calls Q, Q calls P | | E (not a use) |

### 1.4 What means.md missed

Sixteen mechanisms, none of them seen in civicsmith's measurements because nobody looked for them: text, Wasm and
`import source` modules; package maps; loader hooks; `mock.module` and `mock.method`; `vm` modules; prototype and
export patching; `Symbol.for`; the U1→U2 edge through a module-level singleton; implicitly invoked members;
`AsyncLocalStorage`; code compiled from text (beyond `node -e`); named process-wide channels; run-time stores and
files; native and Wasm code; test-runner globs; evaluation order. Of these, the singleton edge and evaluation order
matter most: the reader of a registry depends on a registrant it never names, which may stand later in the order.

### 1.5 Where completeness holds and where it cannot be proven

- **Holds (spec):** channels 1 to 6. The specification fixes every way an evaluation reads outside its own text, and
  the list above covers each.
- **Holds for a stated version only:** channel 7. Node's surface is enumerable (`module.builtinModules`, the "Globals"
  page) but grows with each release, and civicsmith also runs under workerd and Miniflare, whose bindings and
  `scriptPath` options are another host's surface. A standard must name the hosts and versions it was checked against.
- **Cannot be decided:** which values flow where at run time. By Rice's theorem no tool decides a non-trivial
  property of what an arbitrary program does, so value-flow references (channel 4 and the singleton edge) cannot be
  found with certainty in unrestricted code. A standard can only forbid the forms that hide them.
- **Has nothing to find:** copies (channel 8) and reliance on behaviour that no kind states (a sort order, a run-time
  shape after a JSON copy). These are not references; no reading of text finds them.
- **Resolution is the host's:** §16.2.1.10 leaves specifier mapping to the host. It is certain only when the host's
  documented algorithm is the one that runs: no hooks, no `NODE_PATH`, no symlink flags, known conditions. civicsmith
  has two resolvers, Node in tests and wrangler's esbuild in deployment, whose conditions differ (inference: esbuild
  for workers adds "workerd" and "worker").

## 2. The proposed standard

### 2.1 The principle

Every reference to another module is either an **import of a statically resolvable specifier** or a **value whose kind
is named**, and every other route goes through an entry the providing module exports. The tool then reads references
from syntax and kinds, never from run-time inference. Two rules of this kind already stand in design part 2 §7: rule 4
("Code that checks or builds what crosses a module's interface says, in a comment, which kind it checks or builds")
and rule 5 (calls by name through one table and a marked carrier). Build text 2b §5 records that the proven tool "held
modules to these forms by refusals the design does not take".

### 2.2 The rules

| # | Rule: permitted form, and what it forbids | Why the tool is then complete for it | Cost to conform |
|---|---|---|---|
| **S1** | **Imports by literal specifier.** Static `import`, `export … from`, `@import` and `import('…')` kinds, with a string-literal specifier that is relative, or the product's own name, or `#…`, resolving by Node's documented algorithm. For product-internal specifiers, `"exports"`/`"imports"` targets carry no conditions (or only a fixed set the tool resolves as a union). Forbids: `NODE_PATH`, resolve hooks, `--conditions`, `--preserve-symlinks`, sibling packages reached by bare name without a root `package.json`. | Module requests are static semantics of the text (§16.2.1.4); with flags and hooks fixed, Node's resolution (Resolution Algorithm Specification; "Packages") is a pure function of the text and the tree. ResolveExport (§16.2.1.7.2.2) gives the declaring module of every re-exported name. | Low. civicsmith's 6,016 cross-module imports already resolve this way (measured). Package-name imports: unmeasured; each is a mechanical rewrite. |
| **S2** | **Run-time loading only with a literal.** `import('<literal>')`, `require('<literal>')` (module scope, or one `createRequire(import.meta.url)` bound once and never passed), `import.meta.resolve('<literal>')`. Forbids computed specifiers, aliasing `require`, `module.require`, `require.main`, `Module._load`, `require.cache`. | The only loading hooks are §13.3.10 and Node's require family; with literal arguments each resolves as S1. | Judgment where the set of targets was open (walks, helpers): S7 replaces them. |
| **S3** | **Namespace members by name.** `W.x`, or `W[k]` only where `k` is a literal or a union of literals. | Module namespace objects (§10.4.6) are keyed by export name; a literal key names the entry. | Low; count unmeasured. |
| **S4** | **Kinds at every boundary.** (i) every export states its parameters and result by JSDoc kind (the JavaScript counterpart of TypeScript's `isolatedDeclarations`, which TypeScript 6.0.2 refuses with `allowJs`, run); (ii) strict checkJs, and no member read, call or hand-over on a value of kind `any` (TypeScript does not flag library `any`, such as `JSON.parse` or `new Map()`'s values, run); a value from an untyped channel is cast once, where it enters, to the kind of the module that defines it; (iii) a value of another module's kind is never re-typed as an own kind; (iv) a caught value is read only after `instanceof` the provider's class or the provider's exported guard. | With (i) a module's interface is a function of its own text, so a provider's kinds reach a user only by name. With (ii) and (iii) every member read resolves to a declaration, and the checker names its module (run, section 4). | High: judgment per module. Most of the cost of the whole standard (section 5). |
| **S5** | **No reach into another module's files.** A path or URL into another module's folder (data, fixtures, source, `package.json`, a tree walk, `createRequire(other/package.json)`) is replaced by the owner's exported accessor (`fixtureUrl`, `readX()`), or by a JSON or text import. Product-tree anchors (`import.meta.url`, `.dirname`, `__dirname`, `process.cwd()`, `require.resolve`, `import.meta.resolve`, `findPackageJSON`) may be joined only with literals, and the result stays inside the module's own folders. | Every path into the product tree starts at an anchor; anchors are syntax, and literal joins can be evaluated by the tool. A path built from run-time input cannot start at an anchor, so it cannot name a product file except by an absolute literal, which the rule also forbids. | Mechanical per pair, but each pair needs the owner's export first (two modules; design part 2 §8's order, or one mechanical edit, part 2 §9). |
| **S6** | **Programs through the owner.** Another module's program, worker, bundle or runtime is started only through its exported entry (`startMeter()`, `bootPlane()`, an exported URL); messages exchanged carry `@message` kinds (build text 2b §5). | The reference becomes an import of an entry; the message kind is a named kind (S4). | Judgment where tests boot a later module (an order fault anyway). |
| **S7** | **By name only through a declared table.** Operations and tables by name: a literal name at the call through a marked carrier (rule 5, as now). Registries and walks: replaced by a gathering module, after everything it gathers, that imports each member statically. No run-time `register`/`lookup` across modules except with literal keys against a declared table. | Names are literals checked against literal tables; a gathering module is an ordinary list of S1 imports. | Mechanical for each walker once the order is right; the order is ARCH's (most walkers point later). |
| **S8** | **No shared mutable state across modules.** No writes to the global object, intrinsics' prototypes, another module's classes or exported objects; no `Symbol.for`; no named process-wide channels (`diagnostics_channel`, `BroadcastChannel`, `setEnvironmentData`, custom `process` events) except with a name imported from the owner; `process.env` read only through one owning module's accessor; modules export no mutable containers (mutation only through exported functions, which are entries). The identifiers `globalThis` and `global` appear only as the base of reads of documented built-ins. | Aliasing is closed by syntax (the global object cannot be named any other way under S9). Mutation through exported functions is a use of an entry. | Low to medium; counts unmeasured (bio-plane's preload sets platform globals, read). |
| **S9** | **No code from text.** No `eval`, `new Function`, `vm` on product sources, string timers, `node -e` scripts that load modules; no source read from `Function.prototype.toString` or stack traces. | Removes §19.2.1 and §20.2.1.1. | Low; counts unmeasured (`node -e` probes, read in R3 group 9). |
| **S10** | **Config names code only in parsed forms.** Only formats the tool reads (`wrangler.jsonc` `main`, `class_name`, `script_name`, `services`; `package.json` `main`, `exports`, `bin`, `scripts`; the module list), each owned by the module whose code it names. Test globs stay inside the module's own paths. | Each named path or class resolves like S1. | Medium; ARCH's ownership calls (plane's `wrangler.jsonc` is read by five modules' tests, measured). |
| **S11** | **Generated files say so.** A committed generated file names its generator and inputs in a header the tool reads, and its generator reads inputs only by S1 or S5. | The dependency on the generator and its inputs is named. | Low (one generator known: `rows.mjs`); its inputs point later (order fault). |
| **S12** | **Tests follow the same rules.** Preloads and global set-up only of the module's own files; `mock.module('<literal>')`; `mock.method(binding, '<literal>')` on an import binding; fixtures through S5; no loaders or custom conditions. | Test-only mechanisms reduce to S1 to S11. | As S5 to S7 (most of civicsmith's non-import reach is in tests). |
| **S13** | **Import, never copy** (a value another module defines is imported, not written out again). | Not checkable: a copy has no reference. The tool can list literal matches against providers' exported strings and operation names as an aid. | Judgment; 89 tests asserting English text rather than word keys were held in civicsmith (measured, K5313). |

The order rule (design part 2 §1) applies unchanged: every reference by any permitted form points earlier.

### 2.3 The 31 means under the standard

- **Found with certainty from syntax:** A1 to A8 (S1 to S3), A3 (S1; its effects are forbidden by S8), C1 and C2 (S7,
  literal names), C3 (S7, gathering module), C4 at entry level (`word` is an import; the key is certain only if `word`'s
  key parameter is typed as a union of keys), C5 (S10), D6 (S11).
- **Converted to imports, then certain:** A9, A10, A11 (S2, S7), D1, D2, D7 (S5), D3 (S6), D4 (S8).
- **Certain through the checker under S4:** B1 to B7, D5's message kinds, and the members invoked implicitly.
- **Not findable:** D8 (S13) and behaviour no kind states. E is not a use.

### 2.4 What the tool computes under the standard

At a module's own `check` (one program: the module's files plus its providers' interface files, as `check.mjs` builds
now, tool-map §4): (1) every S1 to S3 reference resolved to provider and entry; (2) every member read, call, argument,
`extends` and cast whose kind is declared in an earlier module, mapped to the entry that holds the declaration (as
`usage.mjs`'s `entryOf` does now); (3) S5 to S11 forms read as references to the owner's entries; (4) each file marked
code or tests by the module list's `paths` and `tests`. Every place that breaks a rule is printed as "cannot tell",
with its rule, the category that exists today. Because S4(i) makes each interface depend only on its own text, the
result depends only on the module's text and its providers' declared kinds, unlike the cache tried on 25 Nov, which
went stale because inference read whole import closures (tool-map §5).

## 3. Three designs compared

| | (a) Job-written uses file (design.md) | (b) Standard, uses computed by the tool | (c) Standard, job's file checked for exact agreement | (d) Standard, union of computed uses and the job's residue file |
|---|---|---|---|---|
| Who records | the job, everything | the tool | both, must match | the tool for conforming references; the job for claims and copies |
| Certain for | imports only (checked against code at module level) | every conforming reference | as (b) | as (b) |
| Non-conforming code | the job's word | "cannot tell"; the existing rule 2 fallback tells that module of every telling change of the provider concerned (of all providers when the target is unknown) | the file cannot be checked there | the job's file covers it; the tool lists it as "cannot tell" |
| Works on civicsmith today | yes (unproven accuracy) | no: over-tells as today until each module conforms | no | yes, and improves as modules conform |
| Job's work | write and keep the whole file | none for uses; conformance | both | conformance, plus a short residue file |
| New refusal | none | none (if "cannot tell" only) | yes: entry-level disagreement (design.md §2E already rules this out) | none |
| Use of the file | the record | none (file unnecessary) | a duplicate | the residue only |

- **(c) is dominated.** Where the tool is exact the job's file adds only a second statement to disagree with; where the
  tool is not exact, agreement cannot be checked. Its only gain, making the job think about its uses, (d) keeps
  for the residue without a refusal.
- **(d) is (a) with the tool filling what it can know.** Union cannot tell fewer than (a). Over-telling comes only from
  stale job records, as in (a). It is the same union tool-map §9 recommends for the merge wait.
- **A refusal of non-standard forms.** Design part 2 §6 says a use no import shows "it cannot see: a declared use with no
  import it can see is 'cannot tell', not refused", and "The owner approved two refusals, and no other is taken". A
  refusal because of a reference's form is not a disagreement between declared and actual uses, so it is **a new
  refusal**, and design part 6 ("A change must not add a new test, gate, review or stop") rules it out unless the owner
  decides it. Narrower, and arguable as an **extension**: teach the existing check the standard's other literal forms
  (S5's literal URLs, S6's exported entries, S10's config) so that an undeclared or later use made by them is refused
  exactly as an undeclared import is today. That is the existing refusal ("declared uses disagree with the imports")
  over more forms, and it serves design part 2 §1 ("The check of declared uses refuses" a later use). It still
  rewrites §6's sentence, so it too is the owner's call.
- **Without any refusal, what holds the standard:** text (as rules 4 and 5), the "cannot tell" lines in every job's
  check output, and the cost of the rule 2 fallback to the module that does not conform.

## 4. Value flow: U reads P's `Row` received through Q

### 4.1 Plain JavaScript with JSDoc, no checker

No static standard makes it certain. A JSDoc kind is a comment; without a checker nothing ties it to the value, so
"U reads P's kind" rests on the writer's word, as in design (a). Syntax alone can require that a kind be named
wherever a value enters U (rule 4 does this today for checks and builds), but not that the name is the right one.

### 4.2 With TypeScript's checker, strict checkJs, and S4

Run (TypeScript 6.0.2, `allowJs`, `checkJs`, `strict`, NodeNext): P exports `Row` and `make`; Q imports P; U imports
only Q. For each `.name` U reads, the checker's symbol for the member and the module declaring it:

| U reads `.name` from | Resolves to | Under S4 |
|---|---|---|
| `q.rows()`, Q states `@returns {P.Row[]}` | P | conforms |
| `q.rowsUntyped()`, Q states nothing, returns `make()` | P (by inference across files) | S4(i) requires Q to state it, so Q's interface does not depend on P's code |
| an inferred shape from P | P | as above |
| `q.rowsJson()` (`JSON.parse`) | nothing: `any`, and strict mode does not flag it | S4(ii): cast where it enters |
| Q's own object built from P's fields | Q (correct: Q's kind) | conforms |
| `/** @type {MyRow[]} */ const mine = rows()` | U: an own copy of P's kind hides the use | S4(iii): caught at declaration, argument and cast (a 20-line prototype found all three) |
| a spread `{ ...row }`, a destructure `{ name } = row` | P | conforms |
| an untyped callback `each((r) => r.name)` | nothing; strict flags the implicit `any` | S4(ii) |
| `catch (e) { e.code }` | strict flags `unknown` | S4(iv) |
| `data.rows[0].name` from `import data from '../p2/data.json' with { type: 'json' }` | P2's JSON file | a data file read becomes a typed import (S5) |

So under S4 the tool can list, for every expression in U, the earlier module whose kind it has, and map it to the entry:
U uses `P: Row`, via `Q: rows`, in these files. That is means.md's option C ("origin keyed"), computed rather than written.

### 4.3 What remains uncertain

- **Claims at untyped channels.** A cast of `JSON.parse`, a message, a stored row, an environment value, or a
  user-written type guard (`x is P.Row`) states a kind; the checker believes it. The tool can list every such place
  exactly; it cannot prove the claim. This is the residue of design (d).
- **TypeScript's unsound points**, documented in the handbook ("Type Compatibility", a note on soundness): bivariant
  method parameters, covariant arrays, index reads without `noUncheckedIndexedAccess`, `Object.assign` and the like. Each
  can let a value of P's kind arrive typed as something else. Most can be closed by flags; not all.
- **Shape at run time.** The checker trusts that an `Amount` instance is still one after a JSON or structured copy; the
  proof's Y02, Z05 and V04 broke four users that way (proof.md). That is behaviour, not reference.
- **The producer through state.** Under S8, U2 reading what U1 put into P's store sees P's declared kind, not U1. If
  the kind is P's, the dependency is on P (found). If P stores `unknown` and U2 casts to U1's kind, the cast names U1
  (found, and an order fault if U1 is later); if U2 casts to its own kind, S4(iii) catches it only where the source is
  typed, which `unknown` is not. A residue claim.
- **TypeScript's own JavaScript leniencies** (handbook "Type Checking JavaScript Files": unspecified type parameters
  default to `any`, so `new Map()` holds `any`, run): closed only by S4(ii)'s extra check, which TypeScript does not do
  itself.

## 5. civicsmith's conformance

Sources as in means.md §4: R3 (third reading, tests only, 178 modules), LD (the lane's layers report, code and tests,
about 204 modules, as read in `../refactor-plan-check-24nov.md`), R1, WT, `../check-on-real-code-22nov.md`. LD and R3
are not reconciled.

| Rule | Outside the standard on civicsmith | How sure | What changing them involves |
|---|---|---|---|
| S1 | none among 6,016 cross-module static imports; package-name imports across its 11 packages (no root `package.json`): count unknown | measured / unmeasured | mechanical rewrite to relative paths, or one root `package.json` |
| S2, S7 | 341 open computed references (211 outside journey-check); bundler's computed import of 7 later parts; test-support's declarations helper importing 95 later parts; 19 whole-tree walks in 9 modules; registry walkers in about 8 modules; every module's `DECLARED_OPS` gathered at run time | measured | judgment: gathering modules after what they gather; almost all point later, so the refactoring plan (steps 3 to 8) must remove them anyway |
| S5 | 432 of 597 upper test files read later parts' files through a shared helper; tests of 27 parts read journey-check's design files; 4 fixture pairs; record-grammar reads 5 later modules' source (+4 pairs); about 15 files resolve tooling through another package's folder | measured | the later-pointing ones are order faults for ARCH; the earlier ones (27 undeclared earlier pairs in tests, R3) are mechanical: an accessor in the owner, then an import |
| S6 | 62 test files in 21 modules boot plane; child processes and probes (signatures, pdf-reader); 2 service-binding pairs | measured | moves already in the plan (group 1, step 3; plane-program) |
| S10 | plane's `wrangler.jsonc` read by the tests of bundler, scheduler, control-plane, installer, stewards; agent-worker's by agent-runner | measured (R3 groups 7, 13) | test moves to the owner (kind A, `../../lanes/civicsmith/later-module-tests.md`) |
| S11 | `setup-words/rows.mjs` (26,994 lines) generated from the source of 201 later parts | measured | an order fault the plan does not address (`refactor-plan-check-24nov.md` §2) |
| S7 (C1) | 1,068 operations, 560 named by the UI; whether names are literal and carriers marked: not checked | measured / unmeasured | mechanical where names are literal (add the marks); judgment where names are built |
| S4 | nearly every module reads untyped values: 194 of setup-words' 197 told users were not followed for that; `check` on plain code gives 207,184 "cannot tell" places (TypeScript complaints, many from untyped code); JSDoc being written now, module by module | measured (as indicators; neither counts S4 breaches) | judgment per module, the largest cost: name the kind of every value crossing a boundary, about 1.1 million lines of source and tests |
| S8, S9, S3 | bio-plane's test preload sets platform globals; `node -e` probes; namespace computed keys | read / unmeasured | small (estimate) |
| S13 | 89 tests asserting English text instead of word keys | measured (K5313) | judgment, small |
| — overall | 1,279 module pairs referred to and not declared, none by import; 5,350 references to later parts, 3,884 from code | measured (LD) | an upper bound on the references S1 and S2 do not cover; some are calls by name that S7 accepts |

Estimate, unmeasured: the reference rules (all but S4) add little work beyond the refactoring plan, because most of
what breaks them points later and must move anyway; the earlier-pointing residue is mechanical, about a few hundred
pairs. S4 is the new work. Per module it is the same reading design.md's uses pass needs (which values come from which
module), but the job writes kinds into the code instead of a list beside it, and the checker must then pass under
strict settings. Likely more than the uses pass's estimated $2–5 a module; a sample of five modules would measure both
together.

## 6. For the owner, if he takes this further

- Whether the standard is held by text only (as rules 4 and 5), or also by a refusal (new; his marked decision).
- Whether S4 applies to every module at once, or a module's uses are computed where it conforms and come from the job's
  file where it does not (design (d)), so civicsmith can convert module by module.
- Whether the host versions the standard was checked against (Node, workerd, wrangler's bundler) are named in the
  product's process config, as the language reader is now (design part 2 §7).

## 7. Sources read

In this folder: `design.md`, `means.md`, `tool-map.md`, `proof.md`, `civicsmith-state.md`. `../who-is-told-25nov.md`
§§1–3; `../refactor-plan-check-24nov.md`; `../check-on-real-code-22nov.md`; `process/lanes/civicsmith/research/
civicsmith-copy-reading.md` §§2, 3, 7, 8, `civicsmith-copy-reading-3.md`; `process/lanes/civicsmith/later-module-
tests.md`; design part 2 §§1, 6–8; design part 6 (rules for changes); build text 1b command 18; build text 2b §5;
`tool/lib/notice/check.mjs` (`importsOf`, `makeOwnName`, `declaredUses`).

ECMA-262 (2027 draft): §9.1 Environment Records, §9.1.1.5 Module Environment Records, §9.1.2.1 GetIdentifierReference,
§9.3 Realms, §9.5 Jobs, §9.7 Agent Clusters, §10.4.6 Module Namespace Exotic Objects, §13.3.10 Import Calls, §13.3.12
Meta Properties, §16.2.1.4 ModuleRequests, §16.2.1.6.1.3 Evaluate, §16.2.1.7.2.2 ResolveExport, §16.2.1.8.2
ParseJSONModule, §16.2.1.10 HostLoadImportedModule, §16.2.2 Imports, §16.2.3 Exports, §19 The Global Object, §19.2.1 eval,
§20.2.1.1 Function, §20.4.2.4 Symbol.for, §20.4.5.1 GlobalSymbolRegistry Records.

Node.js v26.13.1 documentation: "Modules: ECMAScript modules" (Import attributes, JSON modules, Text modules, Wasm
modules, import() expressions, import.meta, Resolution Algorithm Specification); "Modules: CommonJS modules" (All
together, Loading from node_modules folders, Loading from the global folders); "Modules: Packages" (Subpath exports,
Subpath imports, Subpath patterns, Conditional exports, Resolving user conditions, Self-referencing a package using its
name, Package maps); "Modules: node:module API" (createRequire, findPackageJSON, register, registerHooks,
syncBuiltinESMExports, Customization Hooks); "Command-line API" (`--import`, `--require`, `--experimental-loader`,
`--conditions`, `--preserve-symlinks`, `NODE_OPTIONS`, `NODE_PATH`, `--env-file`); "Test runner" (Mocking,
`mock.module`, `mock.method`); "VM"; "Worker threads" (`new Worker`, `BroadcastChannel`, `setEnvironmentData`);
"Diagnostics Channel"; "Asynchronous context tracking" (`AsyncLocalStorage`); "Child process"; "File system";
"Process"; "Globals".

TypeScript: handbook "Type Checking JavaScript Files", "JSDoc Reference", "Type Compatibility"; TSConfig options
`checkJs`, `strict`, `noImplicitAny`, `useUnknownInCatchVariables`, `noUncheckedIndexedAccess`,
`isolatedDeclarations`. Experiments run with TypeScript 6.0.2 (`/opt/node-tools`), scratch, not kept.
