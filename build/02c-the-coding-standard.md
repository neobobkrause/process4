Length: 89 lines. Last section: "10. The coding standard and the uses file".

# Process4 build text 2c: the coding standard and the uses file

Section 10 of build text 2, kept in its own file so that each stays under 24,000 bytes; sections 1 to 4 and 7 to 9 are in `02-the-forms.md`, 5 and 6 in `02b-the-comment-and-the-listing.md`. Every job and ARCH read it (the design, part 2, section 7). **Status: not built, not run.** From `process/research/uses-metadata-25nov/` (`standard.md`, `every-reference.md`, `study-references.md` section 4). It adds no check, gate, review or stop: a place outside the standard is listed and told, never refused. Where it and the design differ, the design rules.

## 10. The coding standard and the uses file

**A reference.** Module U refers to item `e` of an earlier module P where U's code or tests name `e` (an import, a namespace member, a JSDoc type, `extends`); use a channel P owns (its files, programs, tables, keys, environment values, messages); or work on a value of P's type: read, write, call, build, receive, store, pass on, throw, catch or iterate it, or let the language call a member implicitly (`then`, `toString`). At a conversion (an assignment, an argument, a return, a declared type) it refers to both types. An **item** is anything P offers.

**The rules on form.**

- **S1 Imports.** `import`, `export … from`, JSDoc `@import` and `import('…')` types, and `import('…')` use a string written out in full: a relative path, the product's own name or a `#` name, resolved by Node's documented algorithm with no `NODE_PATH`, loader hooks, `--conditions` or `--preserve-symlinks`.
- **S2 Loading at run time.** `import()`, `require()` and `import.meta.resolve()` only with a written-out string; `require` never renamed or passed on; no `module.require`, `require.main` or `require.cache`.
- **S3 Namespace members.** `ns.x`, or `ns[k]` only where `k` is a written-out name or a fixed set of them.
- **S4 Types at every boundary.** Every exported item states in JSDoc the types it takes and hands back (build text 2b, section 5). The checker runs strict over code and tests. A value of another module's type is never relabelled as an own type. A caught error is read only after `instanceof` the owner's error class or its exported check.
- **S5 Other modules' files.** A path into another module's folder (data, fixtures, source, settings, a tree walk) is replaced by that module's exported accessor, or a JSON or text import. Paths are built only from the module's own anchor (`import.meta.url`, `__dirname`) and written-out parts, and stay in its own folders; none is relative to the working folder.
- **S6 Other modules' programs.** Another module's program, worker or bundle is started only through its exported start function; messages carry stated types (`@message`).
- **S7 Calls by name.** An operation or table is named, written out, through the provider's declared table (build text 2b, section 5). A folder walk or registry across modules is replaced by a gathering module, after all it gathers, that imports each member.
- **S8 Shared state.** No writes to globals, built-in prototypes, or another module's classes or exported objects; no `Symbol.for` or process-wide named channel (`diagnostics_channel`, `BroadcastChannel`, custom `process` events) but by a name imported from its owner; no exported mutable container.
- **S9 Code from text.** No `eval`, `new Function`, `vm` on product code, string timers or `node -e` scripts.
- **S10 Settings that name code.** Only in forms the tool reads (`package.json`, `wrangler.jsonc`, the module list), each owned by the module whose code it names; test globs stay in the module's own paths.
- **S11 Generated files.** A committed generated file names its generator and inputs in a header.
- **S12 Tests.** Tests keep S1 to S11; preloads and set-up use only the module's own files; a mock names its target written out (`mock.module('<path>')`, `mock.method(binding, '<name>')`); each test case has a written-out name (`test('…')`, `it('…')`, `describe('…')`).
- **S13 Facts.** Every fact a module states is obtained from the module that owns it: an import of its constant, or a call to its reader, any cache being inside the reader. Where that is impossible (a test's deliberately written-out expected answer, a data file) the copy is marked: `copyOf_<module>_<item>` or `/** @copyof <module>:<item> */` in JavaScript; `@copyof <module>:<item>` in a comment on the line above in another file with comments; a `copies` entry in the uses file for JSON. A marked copy is a use of its item.

**The rules on types, host facilities and order.**

- **R1** No expression's type is or contains `any`.
- **R2** A value of type `unknown` is given a shape only where it is read from the module's own channel; another module's data is read only through that module's reader.
- **R3** A hand-written type guard narrows only to the module's own type, from a value with no product type.
- **R4** No export hands out `unknown` or `any`, in a result, a member, a type argument or a callback's parameter.
- **R5 to R7** The tool checks every conversion itself, member by member: method parameters contravariant, overrides included (R5); writable members invariant unless the receiving type says `readonly`, and no widening into an optional member (R6); no function with more parameters than the one expected (R7).
- **R8** No reflective writes onto another module's value (`Object.assign`, `Object.defineProperty`, `Reflect.set` and their kin).
- **R10** No `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` or `@overload`, and no product `.d.ts` file.
- **R11** The tool attributes every expression's type, both sides of every conversion, each member of a value handed to `unknown`, `object` or a reflective read (`JSON.stringify`, `Object.keys`), and the members the language calls implicitly.
- **R12** `process.env` is read only in the module that owns that value.
- **R13** A value a user could confuse with another of the same base type (nights and party size, cents and euros) has its own named type, made only in its owner module.
- **R14** Every use of a facility of Node, workerd, the language or a package is on the product's facility list (below). A use not on it, a write to a member it declares, or a use of one that reaches out made outside a boundary module, is a place. Each outside channel (a path outside the product, a host, a port, an environment name, a table) is written out in exactly one module.
- **R15** A host value is never relabelled as a product type. A boundary module's export takes no path, address, command, program, channel, table or key from its caller but one of a fixed set of names it declares.
- **R16** A cast to a narrower type is a place, except where a module decodes its own channel (R2).
- **R17** No conversion to a type with open-ended keys, except from one of the same element type or a literal written there; none drops a member the language calls implicitly (`then`, `toJSON`, `valueOf`, `toString`, `constructor`, the well-known symbols, `util.inspect.custom`).
- **R18** `call`, `apply`, `bind` and `Reflect.apply` on a product function check the receiver as a conversion; a function that reads `this` with no stated `@this` or class, called so, is a place.
- **R19** Narrowing is relied on only for a `const` or a parameter never assigned; anything else is a place (copy it to a `const` first). It replaces R9.
- **R20** No conditional, mapped (but `Readonly`), indexed-access or template-literal types, and no `infer`; a generic type refers to itself only with its own parameters; a generic function is converted only to a generic signature with the same parameters, or after explicit instantiation.
- **R21** A module's top-level code starts no timer, listener, server or worker, and uses no facility that reaches out.
- **R22** Tests use only the module's own written-out resources or temporary ones they make; no assertion on real elapsed time (mock timers instead).
- **Order.** Every reference points to an earlier module (the design, part 2, section 1); one to a later module is an order fault.
- **Settings.** `strict`, with `useUnknownInCatchVariables`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`; the tool's description of the host types `JSON.parse`, message listeners and stored rows `unknown`. Stored data is cast only where it is read back and decoded.

**Facilities.** The tool carries the classification of Node's and workerd's facilities, each by its qualified name, `in` the process or reaching `out`, for the versions it pins. **The facility list,** `process/modules/facilities.json`, written by ARCH with the module list, holds the product's pinned Node and workerd versions, its boundary modules, and each facility of a package the product uses, classified the same way: `{ "versions": { "node": "22.12.0", "workerd": "2026-11-01" }, "boundary": ["store"], "facilities": [ { "name": "pg:Client.query", "reach": "out" } ] }`.

**How each is read.** S1 to S3, S5 to S12, R8, R10, R12, R21 and R22 from the syntax; R14 and R15 from the names the checker resolves; the rest from the checker's types. A place that breaks one is listed with its rule, never refused, and told (the design, part 2, section 7, rule 2) until converted.

**The conversion** (the design, part 2, section 7):

1. `p4 uses <module>` lists every reference in standard form, by provider and item; every place outside the standard, with its rule and the modules it may refer to (every earlier one where the tool cannot tell); every order fault, which the job reports to ARCH and does not convert; every literal exactly equal to a value an earlier module offers (a candidate restated fact); and what a conversion needs from a provider first.
2. The job converts each place by the table below, states its exported items' types (S4) and makes its code keep R1 to R22. What waits on a provider it reports to ARCH; that provider's conversion adds the item (a new item tells no one), and the place stays listed until then. It runs `uses` again until nothing it can convert remains.
3. `push` writes the uses file. Tests run once, only if running code changed (build text 1, section 5). At `ready` the tool writes the report for the owner's review: places converted by rule, copies, what waits on a provider, time and cost (build text 5, section 5).

| Found | Converted to | Provider first |
|---|---|---|
| Import or `require` of a name built at run time | Written-out imports, or a gathering module ARCH places | No |
| Folder walk or registry across modules | A gathering module after its members | ARCH places it |
| Another module's file read by path | Its exported accessor, or a JSON or text import | The accessor |
| Another module's program run by path | Its exported start function | The function |
| A global; another module's environment value | The owning module's function | Where it has none |
| A value of unknown type from another module | The provider's stated type | Its stated types |
| A cast or hand check on another module's data | That module's reader | The reader |
| Reflective writes, checker-silencing comments, loose conversions | Ordinary code | No |
| A restated fact | An import or a reader call; a marked copy only where impossible | Where it offers neither |

**The uses file,** `process/modules/<module>.uses.json`, beside the requirements file. The tool writes it (`push`, `uses`) from the module's code and tests and its providers' stated types, never by hand: one record for each earlier module, item, type of reference and route, with every place.

```json
{ "module": "orders", "written": { "commit": "<commit>", "tool": "<the tool's commit>" }, "providers": ["dates", "pricing"],
  "uses": [ { "provider": "pricing", "item": "priceOf", "itemKind": "function", "type": "call", "route": "direct", "standard": true,
      "where": [ { "file": "src/orders/lines.mjs", "side": "code", "line": 41, "in": "addLine" },
                 { "file": "test/orders/lines.test.mjs", "side": "test", "line": 17, "test": "lines > refuses 1000" } ] },
    { "provider": "dates", "item": "Day", "itemKind": "type", "type": "read", "route": { "via": "pricing", "item": "priceOf" },
      "standard": true, "where": [ { "file": "src/orders/lines.mjs", "side": "code", "line": 44, "in": "addLine" } ] } ],
  "outside": [ { "rule": "S5", "file": "test/orders/fixtures.mjs", "side": "test", "line": 9, "mayRefer": ["pricing"],
      "waitsOn": "pricing: a fixture accessor", "tests": ["lines > reads a saved price"] } ],
  "orderFaults": [], "copies": [ { "provider": "pricing", "item": "LIMIT", "file": "test/orders/limits.json", "pointer": "/max" } ] }
```

- `providers` are the module's declared uses (the design, part 2, section 6). An item is named as the provider's listing names it (build text 2b, section 6). `type` is one of: import, namespace member, type named, extends, call, construct, read, write, receive, pass on, store, throw, catch, iterate, implicit member, conversion, file, table, operation by name, re-export, marked copy. `route` is `direct` or the middle module's item it came through.
- A place gives file, side, line and enclosing function; in a test, the full name of each test case that holds it or calls the helper that holds it (`in` where none reaches it). `outside` gives each place outside the standard with its rule, what it is, what it may refer to (`mayRefer`; `*`, every earlier module), what it waits on and its tests; `orderFaults`, each reference to a later module as `{provider, file, line}`. A place leaves the file in the push that converts it.
- The one hand-written part is a `copies` entry for a JSON file (file, JSON Pointer, item), which the job adds and the tool keeps. Nothing checks the file: the tool writes it from the code. A change elsewhere does not make it stale.
