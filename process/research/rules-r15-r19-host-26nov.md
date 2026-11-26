# R15 read by a name, R19's "assigned", and four gaps in the host description (26 Nov 2026, PROCESS #19)

From civicsmith (via ARCH #28 and coordinator #10), unchanged:

1. From job jurisdictions #3: "R15 flags a list converted to an own alias (Value) but not to the same union spelled out,
   and a list passed as an argument but not one assigned to a Fields member."
2. From job civil-time #3: "The tool also seems to treat any same-named binding elsewhere in a file as an assignment for
   R19 ... I worked within both without changing behaviour."
3. Also from civil-time #3: "the tool's host description omits process.versions (civil-time reads tz/ICU versions for
   R25; now read as unknown and narrowed)" and "the tool's description of node:test has no mock.property and its library
   has no Temporal; mock.timers is unclassified (R14)." (Earlier gaps of the same kind: Buffer and spawn's maxBuffer,
   added by hand in 891a917.)

And from PROCESS (coordinator's question, no build): civil-time's clock test replaces `globalThis.Date` and
`globalThis.Temporal` (assignment, and `mock.method` on a host global) so any clock read throws; 18 places in one file.
What does leaving it outside cost?

## Research (worker)

Branch `work/rules-r15-r19` on main cb649ba. TypeScript 5.6.3, Node 22.23.5. Each fault reproduced first as a small
product in the tool's tests; each new test fails on cb649ba and passes on the branch. Not run on civicsmith.

### 1. R15: fault, both halves

**Text.** R15 (02c:40): "A host value is never relabelled as a product type." 02c:52: R15 is read "from the names the
checker resolves". Nothing in the rule depends on how the target kind is written or by which route the value reaches it.

**Reproduced** (`Value = string | number | null | string[]`, a `string[]` handed on). Before: an argument to a `Value`
parameter, `fields['tags'] = …`, a field of an object literal, `rec.list = …` and `/** @type {Value} */` were R15; an
argument to the same union spelled out, `/** @type {<spelled out>} */`, `fields.other = …` (Fields = `{ [k: string]:
Value }`) and `rec.tags = …` (an optional member) were not.

**Cause.** refs.mjs `relate` (was 685-688) judged R15 by the target as a whole: R15 when the target has a product name
(`isOwnKind(T)`: its alias or symbol is declared in the module) and is not host-declared. A union spelled out has no
alias, so no product name; a union with `| undefined` (an optional member under `exactOptionalPropertyTypes`) is a new
union without the alias; and `relate` returned early (was 665) when neither side had a product name, so a spelled-out
union of own kinds was never related at all. `fields.other = …` had a second cause: the conversion of an assignment
(was 1367) took the member's kind from `getSymbolAtLocation(name)`, which for a member an index signature gives answers
the signature's symbol, whose kind the checker gives as `any`.

**Which way is right.** Neither spelling relabels the list. The value stays the host's `Array`; the union member it
stands in for is `string[]`, the host's own kind, and no shape the product wrote is claimed for it. The tool already
read an alias of one host kind this way (`/** @typedef {string[]} Names */`: no place, as `Names` resolves to `Array`);
an alias of a union of host kinds is the same. A host value handed to a union member that is a shape the product wrote
(`{ readFileSync(…): string }`, the h2 case) is a relabelling, under either spelling and by any route. So the reading by
the alias's name was wrong on the side that flagged, and the routes that did not flag were right only by accident (they
also missed real relabellings).

**Correction** (commit 18659f0). refs.mjs `relate`: R15 judged per member of the source (a host-declared object of no
product kind) against the target members it fits (by `isTypeAssignableTo`; the one member if only one): a place only
where none of those is host-declared and one is a kind the product declares. A union is "involved" by its members, aliased
or spelled out (`ownIn`). The assignment's target: a member an index signature gives takes the signature's kind, read at
the target (`SymbolFlags.Signature` skipped). Test: refs.test.mjs, "R15: a host value is judged by the kind of the target
it stands in for …" (lists: no R15 by any spelling or route, four before; `fs` given a product shape: R15 by an argument,
a stated type, an index-signature member and an optional member, the last two missed before).

### 2. R19: the report's cause not reproduced; a different fault found and corrected

**Text.** R19 (02c:44): "Narrowing is relied on only for a `const` or a parameter never assigned; anything else is a place
(copy it to a `const` first)."

**Same-named binding elsewhere.** Not reproduced. The tool already resolves assignments by the checker's symbol
(refs.mjs, `assignedNames`, was 872-876): a parameter shadowed by a local of the same name in a closure or a block, a
module-level `let` and a parameter of the same name, an object member of the same name: none is read as an assignment of
the other.

**What civil-time most likely met.** `assignedNames` counted every prefix unary expression on an identifier as an
assignment: `!zone`, `-n`, `+n`, `~n`, not only `++`/`--`. So `function f(zone) { if (!zone) return ''; return
zone.toUpperCase(); }` was R19, "relies on the narrowed parameter zone, which is assigned", with no assignment anywhere;
the usual guard `if (!x) return` triggers it. A fault against R19's text (a parameter never assigned is allowed). Also:
an assignment that takes a value apart (`[zone] = zs`, `({ zone } = o)`) and a for-of/for-in target (`for (zone of zs)`)
were not counted, so a narrowed parameter assigned that way was missed (the opposite fault). And a narrowed `let` never
assigned is rightly a place by the text ("anything else"), but was worded "which is assigned"; a reader seeing that with
no assignment in sight would look for one elsewhere.

**Correction** (commit 18659f0). refs.mjs `assignedNames`: by symbol, the targets of `=`, compound and logical
assignments, `++`/`--` only, the bindings an assignment or a for-of/for-in takes apart (`addTarget`). The place's words:
a parameter "which is assigned"; a variable "which is not a const", "and is assigned" where it is. Test: refs.test.mjs,
"R19: a parameter is assigned only by an assignment to its own binding …" (`!zone`, `-zone.length` and a shadowing local
no place; three destructuring/for-of assignments and a `let` placed; before: one wrong place, three missed).

### 3. The host description

**How it is made today.** By hand. `tool/lib/notice/node.d.ts` (120 lines: assert, timers, process, console, URL,
TextEncoder/Decoder, crypto global, fetch, performance) is read by both readings; `tool/lib/notice/host.d.ts` (228 lines
before this change: JSON.parse giving `unknown`, Buffer, node:fs, fs/promises, path, url, os, child_process,
worker_threads, module, diagnostics_channel, readline, crypto, events, process, vm, node:test) only by the reading under
the standard. Both say they cover what the tool's made-up product used; members were added one fault at a time from
Node's v22 documentation (Buffer, maxBuffer in 891a917). The language's library is TypeScript 5.6.3's own lib files
(es2023 and some esnext parts, ts.mjs `options`). `facilities.json` is generated from those three by
`facilities-build.mjs`, whose groups (IN_NODE, TESTS, …) are a hand review by name; nothing defaults to `in`.

**The four.**
- `process.versions`: missing (S4 "Property 'versions' does not exist", and R1 at each read). Node 22 documents it
  (process.html#processversions, added v0.2.0).
- node:test `mock.property`: missing (S4, R1). Node documents it as **added in v22.20.0** (test.html), with
  `MockPropertyContext`. So it exists only for a product whose Node is 22.20.0 or later; the tool pins only "22".
- `Temporal`: missing, and correctly so for Node 22: TypeScript 5.6.3's library has no Temporal, and Node 22 has no
  Temporal global (`typeof Temporal` is `'undefined'` on 22.23.5). civil-time's `globalThis.Temporal` is a read of a name
  the pinned host does not have (S4 "no index signature", R1). Not a gap of the description.
- `mock.timers`: not a gap now. It was described, but its members were named `__type.enable` / `__type.tick`, so they were
  unclassified R14 places: the same fault as node:crypto's `__type.update`, corrected by 59fa682 ("the host's unnamed kinds
  by their declaration"), merged to main at 14:17Z in PR #369, after civil-time #3 ran (10:08Z). Reproduced on 59fa682's
  parent (three R14 `__type.*`) and gone on main. One documented member was missing: `timers.setTime` (added v21.2.0);
  `enable`'s `now` may be a Date.

**By hand (commit 432cf4a, separate).** host.d.ts: `NodeProcessVersions` (node, v8, modules, which Node's text names, as
`string`; the other parts in Node's example as optional, since they depend on how Node was built; no index signature,
which would make each read a `__index` facility no list names) on `NodeProcess.versions` and `node:process`'s `versions`;
`NodeMock.property` and `NodeMockPropertyContext` (accesses, accessCount, mockImplementation, mockImplementationOnce,
resetAccesses, restore); `timers.setTime`, `now?: number | Date`. facilities-build.mjs: `NodeProcessVersions` plain
data (`in`), `NodeMockPropertyContext` `tests`; `process.versions` itself `out`, like `process.version` (a read of the
host's build: the tz and ICU versions decide time-zone results). facilities.json rebuilt: 1347 in, 56 tests, 588 out
(was 1320, 43, 586); none removed. Test: refs.test.mjs, "the host's description holds process.versions and node:test's
mock.property …" (eight S4/R1 before, none after; Temporal stays a complaint).
Small and safe in the sense that it only adds declarations, every one from Node 22's documentation, and removes no
facility. Two judgements PROCESS may want to make instead of me: `process.versions` as `out` (so civil-time's read in a
module not a boundary is now one R14 place, instead of S4 and R1); and `mock.property` described for all of Node 22
although it exists only from 22.20.0 (a product pinned below would pass the checker and fail at run time; its tests
would show it).

**Option C: describe Node from @types/node, pinned to the product's Node version (not built).** Measured with
@types/node 22.12.0 (the 02c example's pin) and its one dependency undici-types 6.20.0: 2.4 MB + 0.2 MB, 102 `.d.ts`
files, ~51,000 lines, ~8,300 member declarations (today's descriptions: 2 files, ~350 lines, 1,970 classified names).
With TypeScript 5.6.3 and the tool's settings (`skipLibCheck` off) it reads clean (0 complaints). A program over one
small file takes ~1.4 s against ~0.4 s with today's descriptions (165 files against 69).
- Files that change: `tool/package.json` and `package-lock.json` (a second dependency, and its dependency); `ts.mjs`
  (both readings take Node's types from the pinned package instead of node.d.ts); `node.d.ts` removed; `host.d.ts` cut to
  the overlay the standard needs (JSON.parse `unknown`, which @types/node gives as `any`); `refs.mjs` (which files are the
  host's; the NEVER list's names); `facilities-build.mjs` rewritten (every group names today's hand kinds, `NodeProcess`,
  `NodeMock`, `NodeSpawnOptions`, …; @types/node's are `NodeJS.Process`, `MockTracker`, `SpawnOptions`, and modules are
  declared as `"fs"` with `"node:fs"` re-exporting, so facility names change), and a review of ~4x as many names;
  `facilities.json` regenerated, one per pinned Node version; the tool's tests that name host facilities. Roughly the
  size of the facility-names work (59fa682) plus a full re-review of the classification.
- Pinning to the product's version: @types/node is published per Node major.minor, not per patch (22.12.0 exists; its
  patch numbers are its own). The facility list names `"node": "22.12.0"`; the tool would carry one @types/node and one
  classification per supported version, or fetch one per product at read time (a network fetch inside `uses`/`check`).
- The one-dependency rule: build text 1 §2 ("the tool has one dependency, the `typescript` package at one exact version,
  5.6.3") would need a change by the owner: a second package (and undici-types), at one exact version per supported Node
  version. Its stated gain (both sides of a comparison read by one reader version) holds if the types are pinned too.
- Risk. @types/node is written by the DefinitelyTyped community, not by Node; design part 2 §7 rests on "each host's
  descriptions of its facilities are true". Seen in 22.12.0: `ProcessVersions` declares `http_parser` (gone from Node 22)
  and extends `Dict<string>` (an index signature: each other part is an unclassified `__index` facility); listeners and
  many results are `any` (more R1 places, as designed but many more). Renaming every host facility rewrites every uses
  file and tells every module (build text 5, point 4) once. Three times the reading time per program.
- Against that: today each gap arrives as one job's fault (Buffer, maxBuffer, process.versions, mock.property, setTime so
  far); C would close the class, apart from errors in @types/node itself.

### 4. The clock test that replaces host globals (question, no build)

Reproduced (refs.test style, not committed): a test that saves and replaces `globalThis.Date`, `globalThis.Temporal`,
and `mock.method(globalThis, 'Date', …)`. The places: S8 "writes globalThis.Date / .Temporal, shared by every module",
R14 "writes Date, a member the host declares", S12 "mock.method other than on an import", R1 and S4 for
`globalThis.Temporal` (no index signature), and the checker's S4 complaints of the class and mock assignments.
- **mayRefer.** `["*"]` for every one but the checker's two assignability complaints (S4 "not assignable", `[]`).
  `waitsOn` "this module" for all.
- **Told.** notice.mjs (733-744): a place whose `mayRefer` holds `*` hears of any change to the files of every earlier
  module, a reason per place ("a place outside the coding standard that may refer to any earlier module"); an empty
  `mayRefer` refers to no module (design part 2 §7, rule 2). So civil-time is told at every merge of every module before
  it, with up to 16 reasons, and the told job reruns the test file that holds them (related.mjs: the file holding a place
  named by a reason). Here `*` is apt for S8: the test's verdict (no clock read anywhere it calls) does depend on every
  module it calls.
- **Blocking.** None. A place is "never refused" (02c:52); `ready` and the test record are not gated on places; the
  conversion's report (commands.mjs 438-472) lists each under "still outside" with what it waits on ("this module"),
  which an owner reading the report sees as conversion work not done.
- **Cost, in short:** a notice and a rerun of that test file at each earlier module's merge, for as long as the test
  stands; 16 lines in each conversion report and uses file; nothing refused. A form for it (a test replacing a host
  facility through node:test's mock, read as a mock use of the host) stays the design question PROCESS #18 named.

**Tests.** `npm test` in tool/: 281 pass, 0 fail (278 before, three new).

**Unknown.** None of this was run on civicsmith. Which construct civil-time's R19 places actually were (the `!x` cause is
inferred from the words "which is assigned" and the report; a narrowed `let` is still a place by the text). Whether
jurisdictions' `Fields` is an index-signature kind or one with optional members (both routes are corrected). civicsmith's
pinned Node version (whether `mock.property` exists there). Whether any civicsmith module relies on the R15 places that
are now gone being listed (none should: they were not relabellings).
