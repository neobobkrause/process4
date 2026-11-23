Written by a worker of PROCESS #10, 23 Nov 2026.

Bottom line:
1. The check is exact for one thing: imports written as a path (`import`, `export ... from`, `import('<written path>')`, `@import`). It is silent on `require('<path>')` and on imports by the product's own package name, and it sees no path string at all.
2. No design or build text says "rigorously". They say "declared uses match its imports" (design 2 §6), and that is true only within those bounds. The design over-claims in one place. It says that a declared use with no import is one "no code makes", and the check refuses such a use. A real use made only by reading a file or starting a program is then refused, and the job is told to remove it.
3. The third reading's reach is not calls. It is paths handed to workerd, fs, spawn, `import(<computed>)` and `createRequire`. No 'provider.function' pattern can find these. Most of it reaches later modules (72 pairs; 62 files boot plane, line 173), which no declaration could make legal.
4. Second-level reach needs no detection. The closure of declared `uses`, read from the module list alone, covers it once every first-level use is declared or moved out of module tests.
5. Recommended: fix the check's two faults; keep module tests to imports, moving whole-product tests to plane or the walks; make the merge wait on the closure of declared uses. Before civicsmith's conversion, neither "own providers" nor "every earlier open job" is safe for modules whose tests reach plane.

## 1. What the tool sees as a use

Three readers, which disagree.

**`check`, declared uses** (`tool/lib/notice/check.mjs:513-592`):
- `importsOf` (515-528) reads `import`/`export ... from` with a written path, `@import` and `import('...')` in comment kinds, and `import(<string literal>)` in code.
- `import(<anything else>)` is "cannot tell" (524) and is never refused.
- A specifier that does not start with `.` or `/` counts as outside the product and is skipped silently (546). That skips imports by package name, including the product's own name, and `#imports`.
- `require(...)` is not read at all. It gives no refusal and no "cannot tell".
- The owner of an import is the module with the longest matching path (`model.mjs:38-48, 82-89`).
- Refusals: an undeclared import (561-568); a declared use at the same or a later place in the order (556-560); a declared use with no import and no call by name through a carrier (569-591), which is "cannot tell" instead if the module has unread carrier calls or any value of unknown kind.

**The notice's usage reader** (`usage.mjs:86-213`): TypeScript resolves every name to its declaration, attributed to the provider entry whose range holds it: named, default and namespace imports, re-exports, destructuring, members filled or taken apart, values handed where a provider's kind is expected, `...` spreads, and carrier calls (`carriers.mjs`). It also follows `require` with a written path, because TypeScript resolves it in JS files. It never sees a path string.

**The staged scan** (`staged.mjs:20-85`): this is a regex over the text for `from`, `import(`, `import '` and `require(`. It marks a computed import or require, or the product's own package name, as "cannot follow" (25, 46). A module with such a mark is read as a possible user (179), but that does not make it told.

**Measured on a probe product** (modules a, u, z in that order; the TypeScript 5.6.3 the config names; scratch only):

| Reach in u's test | check | usage | staged scan |
|---|---|---|---|
| named / default / namespace import of a | refused, undeclared | use of a.f, a.default, a.svc | dep |
| own index re-exporting a | sees own src import | use of a.f | dep |
| `await import('../../src/z/index.mjs')` | refused, later | use of z.h | dep |
| `import(p)`, `import(new URL('..z..').href)`, readdir walk | cannot tell | `anything` | cannot follow |
| `require('../../src/z/index.mjs')` | **silent** | use of z.h | dep |
| `import 'prod/src/z/index.mjs'` (own package name) | **silent** | nothing | cannot follow |
| `fs.readFileSync(new URL('../../src/z/config.json'...))` | silent | `anything` from JSON.parse only | nothing |
| `spawnSync(node, [path of src/z/server.mjs])` | silent | nothing | nothing |

A second probe declared `uses: ["a"]` for a module whose only reach to a was an fs read and a spawn of a's program. The check refused it: "declares a in uses, but neither its source nor its tests import it or call it by name". It is "cannot tell" only where the module also has a value of unknown kind (a `JSON.parse` result is enough), so on a large module it is often not refused.

**Where the texts claim more than the code does:** design 2 §7, "A declared use that no code makes ... the check ... finds it ... which removes the declaration". (the code cannot tell "no code makes it" from "made by a path"); the lane's `later-module-tests.md` §1 ("declaring the use settles it") and §3.1 ("makes `check` see them"). (for a pair with no import, the check refuses or says "cannot tell"); PROCESS #9's "exact for imports by path" (misses `require`); build 1b command 18, true only if `require` is not an import.

The notice's own texts are honest: they say it is not a guarantee (design 2 §7; build 5 §6). For any provider U does not declare, build 5 §6 has no "not followed fully" cause, so an undeclared reach by path is never told. A reach to a later module is never told either, because only later modules are users (`notice.mjs:351-358`).

## 2. Why the third reading found uses the tool cannot see

The reading (`civicsmith-copy-reading-3.md` §2) counted 6,016 cross-module static imports. Every one goes to an earlier, declared module, and the check handles all of them correctly. Everything else is reach by path: 242 references in 120 files of 46 modules, 19 walks of the whole tree, and 62 files in 21 modules that boot plane. The lane's groups (`later-module-tests.md` §2), sorted:

- **Booting the whole product** (group 1: 62 files that boot plane, line 173).
  - (a) A first-level use of plane, which is later, so it breaks the order. Declaring it is refused.
  - (b) Everything plane uses (134 modules) is second-level, already known from plane's own `uses`.
  - In substance this is end-to-end testing of the kind the walks do.
- **Product-wide walks** (group 2: 19 walks, readdir of `src` or the module list).
  - (c) Not a module use: a check of the whole product.
  - Paths are found at run time, so no static reader sees them.
- **The declared-operations registry; shell ↔ screens; bundler ↔ fleet; one package split across modules** (groups 3, 4, 5, 12).
  - (a) First-level and later, by non-static means.
  - These are boundary questions (kind C) for ARCH.
- **Reading a later module's config or source** (groups 7, 8).
  - (a) First-level and later. The test belongs to that module.
- **Running another module's program** in a child process, a probe or a service binding (groups 9, 11).
  - (a) First-level.
  - (b) For what that program uses.
- **Fixtures in another module's test folder** (group 10).
  - (a) First-level, but of test files, which are in nobody's `public`.
  - Or (c) if the data is just shared, in which case it belongs in an earlier module's public files.
- **Development packages resolved through another package's folder** (group 6, `createRequire(bio-plane/package.json)`).
  - (c) Not a module use: the folder is reached by accident.
- **Earlier modules used without being declared** (group 13, 27 pairs).
  - (a) First-level and legal. They need declaring, and with no import the check then refuses or says "cannot tell" (section 1).

**The owner's 'provider.function' question.** In this language a provider is reached by an import that names its file. After that a call takes the form the import gave it: `f()` after `import { f }`, `g()` after a default import, `h()` after `const { h } = await import(...)`, `A.f()` only after `import * as A`, `store.get()` on a value a provider handed back, `door.call('op=x')` through a carrier, and nothing at all where a module re-exports. A search for the text 'provider.' would miss most of these. The tool already does better: it resolves every name to its declaration. The reach the reading found contains no call. It is a path string handed to fs, spawn, workerd or `import()`, so no call syntax can find it. Only resolving paths can.

The owner is right on both of his other points. A module that reads another module's files, or runs its program, is that module's user: a first-level use it should declare. What the module it reads or runs uses in turn is second-level, already written in that module's `uses`. Two things follow:
- Second-level reach needs no detection, only the closure of declared `uses`.
- The hard case is a first-level use of a later module (plane). It cannot be declared, so it has to leave module tests.

## 3. Options

None of these adds a test, gate, review or stop. "Safe" means: a module whose job is open can change nothing that a ready job's module tests reach unless that module is among the ones the rule waits on.

- **A. No change.**
  - Costs nothing.
  - "Own providers" is not safe: the 242 references and the 62 plane boots are not in `uses`.
  - "Every earlier open job" is safe for every reach to earlier modules, declared or not, direct or second-level. It is not safe for the 72 later pairs, plane included: no earlier-only rule covers them. It also waits on unrelated jobs.
- **B. Correct the check's two measured faults.** This adds no new kind of refusal.
  1. Read `require`/`createRequire` with a written path, and imports by the product's own package name, the way the staged scan already does (`staged.mjs:23, 46`). An undeclared one is then refused like any other import, which applies the existing rule to a form it missed. Needs the owner's word, as decision B did.
  2. Stop refusing a declared use the check cannot see. Either:
     - (i) count a written path into that module's files as making it, which needs a path reader that never refuses; or
     - (ii) make it "cannot tell". This removes a refusal. Cost: a stale declaration is no longer removed, and that user is told on every change of its provider (decision 2).

  B lets an honest first-level use by path be declared. Tool change plus its tests. On its own, B does not make the rule safe.
- **C. The check treats path strings into another module's folder as uses.** This covers written literals, `new URL('<lit>', import.meta.url)`, `path.join` or `resolve` of literals, `spawn`/`exec` arguments and `import()` of such a path. Undeclared or later ones are refused like imports.
  - Removes: most of the explicit references, as an inference. The third reading needed string fragments and reading in context to find its 242, so the share of literal paths among them is unknown.
  - Costs: a path reader with false hits, for example a path named in an error test. On civicsmith, 46 modules' jobs are refused until ARCH moves their tests, the same work as D but forced one job at a time.
  - Still escapes: computed paths, the 19 run-time walks, and paths held in another file's config.
  - It extends an existing refusal to new reach, so it needs the owner's word.
  - Merge rule: safe for literal paths only.
- **D. Module tests reach other modules only by import.** Tests that start the whole product or walk it move to plane's tests (the latest module they reach) or to the walks. A file is given to another module by its path in that module's `tests`, with no file moved (design 2 §1; build 2 §3, longest path).
  - Costs:
    - a rule in text, held by no check;
    - ARCH's conversion of groups 1–12, already proposed by the lane;
    - plane's tests grow, while plane is already the long-module problem (about 44 minutes on GitHub);
    - tests moved to the walks run only at walks.
  - With B, the check is then exact for module tests, apart from computed imports, which it shows as "cannot tell".
  - Still escapes:
    - a new path reach a job writes, held by text only;
    - product source that reaches by path at run time (bundler, installer, service bindings). These are real uses, which B(2) lets be declared.
- **E. The merge waits on the closure of declared `uses`**, providers and their providers, read from the module list alone. This answers the owner's "second level".
  - Costs: a little more waiting than direct providers, much less than every earlier job.
  - Safe exactly where every first-level reach in module tests is a declared use of an earlier module.

## 4. Recommendation

B and D, and E for the merge rule. C is not recommended as a refusal: it is heuristic, it forces blocking at 46 civicsmith jobs, and it still misses the walks. Its non-refusing half belongs in B(2)(i).

Until ARCH's conversion is done, the modules whose tests boot or read plane can be made safe by no merge rule built on `uses` or on the order. They stay out of the slice, as the lane already plans, or merge under the accepted risk of design 10 §6.

## 5. Measured, inferred, unknown

- **Measured here, on probe products under the tool's own code at ca6d410:**
  - every row of the table in section 1;
  - the refusal of an honest declaration made by path;
  - the silence on `require` and on the own package name.
- **Measured by the third reading** (not re-read here): 6,016 static imports, all correct; the 242/120/46 references, 72 later pairs, 27 undeclared earlier pairs, 19 walks, and 62 plane-booting files in 21 modules.
- **Inferred:**
  - the share of the 242 references that a literal-path reader would catch;
  - that civicsmith's large modules mostly get "cannot tell" rather than a refusal when they declare a path-only use, because values of unknown kind are common.
- **Unknown:**
  - civicsmith's `language_reader.source`;
  - whether its package-name imports resolve in the reader on GitHub's machines (it depends on installed `node_modules`);
  - how many of the 27 undeclared pairs also have an import;
  - how long plane's tests would take with group 1 moved into them;
  - whether T53's branch changes any of this.
