Written by a worker of PROCESS #10, 23 Nov 2026.

Bottom line:
1. The check is exact for imports written as a path (`import`, `export ... from`, `import('<written path>')`, `@import`). It is silent on `require('<path>')` and on imports by the product's own package name, and it sees no path string at all.
2. No design or build text says "rigorously". They say "declared uses match its imports" (design 2 §6), which is true within those bounds. The design over-claims once: it calls a declared use with no import one "no code makes", and the check refuses it, so a real use made by reading a file or starting a program is refused and the job is told to remove it.
3. The third reading's reach is not calls. It is paths handed to workerd, fs, spawn, `import(<computed>)` and `createRequire`, which no 'provider.function' pattern can find. Most of it reaches later modules (72 pairs; 62 files boot plane, line 173), which no declaration could make legal.
4. Second-level reach needs no detection. The closure of declared `uses`, read from the module list alone, covers it once every first-level use is declared or moved out of module tests.
5. Recommended: fix the check's two faults; keep module tests to imports, moving whole-product tests to plane or the walks; make the merge wait on the closure of declared uses. Until civicsmith is converted, neither "own providers" nor "every earlier open job" is safe where tests reach plane.

## 1. What the tool sees as a use

**`check`, declared uses** (`tool/lib/notice/check.mjs:513-592`):
- Reads (`importsOf`, 515-528): `import`/`export ... from` with a written path, `@import`/`import('...')` in comment kinds, and `import(<literal>)`.
- `import(<anything else>)` is "cannot tell" (524) and is never refused.
- A specifier not starting with `.` or `/` is skipped silently as outside the product (546). This covers package names, the product's own name included, and `#imports`.
- `require(...)` is not read.
- A file's owner: the longest matching path (`model.mjs:38-48, 82-89`).
- Refuses: an undeclared import (561-568); a declared use at the same or a later place (556-560); a declared use with no import and no carrier call by name (569-591), "cannot tell" instead if the module has unread carrier calls or any value of unknown kind.

**The notice's usage reader** (`usage.mjs:86-213`) resolves every name to its declaration with TypeScript and gives it to the provider entry whose range holds it. It counts named, default and namespace imports, re-exports, destructuring, members filled or taken apart, values handed where a provider's kind is expected, `...` spreads and carrier calls (`carriers.mjs`).

It follows `require` of a written path (TypeScript resolves it in JS). It never sees a path string.

**The staged scan** (`staged.mjs:20-85`) is a regex for `from`, `import(`, `import '` and `require(`. A computed import or require, or the product's own package name, is "cannot follow" (25, 46). That makes a possible user (179), not a told one.

**Measured on a probe product.** Modules a, u, z in that order, (TypeScript 5.6.3, scratch). Reach from a test of u:

| Reach | check | usage | scan |
|---|---|---|---|
| named/default/namespace import of a | refused (undeclared) | a.f, a.default, a.svc | dep |
| own index re-exporting a | own src import seen | a.f | dep |
| `await import('../../src/z/index.mjs')` | refused (later) | z.h | dep |
| `import(p)`; `import(new URL(..z..).href)`; readdir walk | cannot tell | `anything` | cannot follow |
| `require('../../src/z/index.mjs')` | **silent** | z.h | dep |
| `import 'prod/src/z/index.mjs'` (own name) | **silent** | none | cannot follow |
| `fs.readFileSync(new URL('../../src/z/config.json', ...))` | silent | none (only JSON.parse as `anything`) | none |
| `spawnSync(node, [<path of src/z/server.mjs>])` | silent | none | none |

A second probe declared `uses: ["a"]` where the only reach to a was an fs read and a spawn of a's program. The check refused it: "declares a in uses, but neither its source nor its tests import it or call it by name". It is "cannot tell" only where the module also has a value of unknown kind (one `JSON.parse` suffices).

**Texts that claim more than the code does:** design 2 §7, "A declared use that no code makes ... the check ... finds it ... which removes the declaration" (it cannot tell "no code makes it" from "made by a path"); the lane's `later-module-tests.md` §1 "declaring the use settles it" and §3.1 "makes `check` see them" (with no import, it refuses or says "cannot tell"); PROCESS #9's "exact for imports by path" and build 1b command 18 (both miss `require`).

The notice's texts are honest ("not a guarantee"). Build 5 §6 has no "not followed fully" cause for an undeclared provider, and only later modules are users (`notice.mjs:351-358`), so a path reach to an undeclared or later module is never told.

## 2. Why the third reading found uses the tool cannot see

The reading (`civicsmith-copy-reading-3.md` §2) found 6,016 cross-module static imports, all to earlier, declared modules, and the check handles them correctly. The rest is reach by path: 242 references in 120 files of 46 modules, 19 whole-tree walks, and 62 files in 21 modules that boot plane.

Marks: (a) a first-level use to declare; (b) second-level reach through another module; (c) not a module use. Groups are the lane's (`later-module-tests.md` §2):

- **Booting the whole product** (group 1, 62 files). (a) for plane, which is later, so it cannot be declared; (b) for the 134 modules plane uses, already in its `uses`. In substance, end-to-end testing like the walks.
- **Product-wide walks** (group 2: 19 walks). (c): whole-product checks; paths found at run time, beyond any static reader.
- **The operations registry; shell and screens; bundler and fleet; one package split across modules** (groups 3, 4, 5, 12). (a), later; boundary questions for ARCH.
- **Reading a later module's config or source** (groups 7, 8). (a), later. The test belongs to that module.
- **Running another module's program** by child process, probe or service binding (groups 9, 11). (a), plus (b) for what that program uses.
- **Fixtures in another module's test folder** (group 10). (a) of test files, in nobody's `public`; or (c) if shared data, which belongs in an earlier module's public files.
- **Development packages resolved through another package's folder** (group 6). (c): the folder is reached by accident.
- **Earlier modules used without being declared** (group 13, 27 pairs). (a), and legal. Declaring them meets the check's refusal or its "cannot tell" (section 1).

**The owner's 'provider.function' question.** A provider is reached by an import that names its file. After that a call takes the import's form: `f()` after `import { f }`, `g()` after a default import, `h()` after `const { h } = await import(...)`, `A.f()` only after `import * as A`, `store.get()` on a value a provider handed back, `door.call('op=x')` through a carrier, nothing at all where a module re-exports.

A search for 'provider.' misses most of these; the tool already resolves every name to its declaration. The reach the reading found holds no call, only a path string, so only resolving paths finds it.

The owner is right on his other points. A module that reads another module's files or runs its program is its user, with a first-level use it should declare. What that module uses in turn is second-level and already written in its `uses`. So second-level reach needs only the closure of declared `uses`. The hard case is a first-level use of a later module, such as plane: it cannot be declared, so it has to leave module tests.

## 3. Options

None adds a test, gate, review or stop. "Safe": no module with an open job can change what a ready job's module tests reach unless the rule waits on it.

**A. No change.** Costs nothing.
- "Own providers" is not safe: the 242 references and the 62 plane boots are not in `uses`.
- "Every earlier open job" is safe for all reach to earlier modules, any level, declared or not; not for the 72 later pairs (plane included); and it waits on unrelated jobs.

**B. Correct the check's two measured faults.**
1. Read `require`/`createRequire` with a written path, and imports by the product's own name, as the staged scan already does (`staged.mjs:23, 46`). An undeclared one is then refused like any import. That applies the existing rule to a form it missed, but it needs the owner's word, as decision B did.
2. Stop refusing a declared use the check cannot see: (i) count a written path into that module's files as making it (paths read, never refused for); or (ii) make it "cannot tell", removing a refusal, at the cost that a stale declaration stays and its user is told on every change of that provider (design 2 §7, decision 2).

B lets an honest use by path be declared; a tool change with its tests; alone, not safe.

**C. The check treats path strings into another module's folder as uses.** These are literals, `new URL('<lit>', import.meta.url)`, `path.join`/`resolve` of literals, `spawn`/`exec` arguments and `import()` of such paths. An undeclared or later one is refused.
- Removes: most explicit references (inferred; the reading needed string fragments and context for its 242, so the share is unknown).
- Costs: false hits (a path named in an error test, for example). It also refuses at 46 civicsmith modules' jobs until ARCH moves their tests. That is D's work, forced one job at a time, and it needs the owner's word.
- Still escapes: computed paths, the run-time walks, and paths held in config files.
- Merge rule: safe for literal paths only.

**D. Module tests reach other modules only by import.** Tests that start or walk the whole product go to plane's tests (the latest module they reach) or to the walks. A file is given to another module by its path in that module's `tests`, and nothing is moved (design 2 §1; build 2 §3, longest path).
- Costs: a rule held in text only; ARCH's conversion of groups 1–12 (already proposed by the lane); plane's tests grow, and plane is already the long-module problem (about 44 minutes on GitHub); tests moved to the walks run only at walks.
- With B, the check is then exact for module tests. Computed imports stay as "cannot tell".
- Still escapes: a new path reach a job writes; product source reaching by path at run time (bundler, installer, bindings), real uses that B(2) lets be declared.

**E. The merge waits on the closure of declared `uses`** (providers and theirs), read from the module list alone. Answers the owner's "second level". Costs more waiting than direct providers, much less than every earlier job. Safe wherever every first-level reach in module tests is a declared use of an earlier module.

## 4. Recommendation

B and D, with E as the merge rule. C should not become a refusal: it is heuristic, blocks 46 civicsmith jobs, and still misses the walks. Its non-refusing half is B(2)(i).

Until ARCH's conversion is done, no rule built on `uses` or on the order makes the modules whose tests boot or read plane safe. They stay out of the slice, as the lane plans, or merge under the accepted risk of design 10 §6.

## 5. Measured, inferred, unknown

- **Measured here** (probe products, tool at ca6d410): the table in section 1; the refusal of an honest declaration made by path; the silence on `require` and the own name.
- **Measured by the third reading** (not re-read): 6,016 correct static imports; 242 references in 120 files of 46 modules; 72 later and 27 undeclared earlier pairs; 19 walks; 62 plane-booting files in 21 modules.
- **Inferred:** the share of the 242 a literal-path reader would catch; that civicsmith's large modules mostly get "cannot tell", not a refusal, when declaring a path-only use.
- **Unknown:** civicsmith's `language_reader.source`; whether its package-name imports resolve in the reader on GitHub; how many of the 27 pairs also import; plane's test time with group 1 added; T53's branch.
