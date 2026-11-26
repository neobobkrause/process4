# The tool cannot classify a package's facilities, and reads the product's own members as the host's (26 Nov 2026, PROCESS #18)

A process fault from civicsmith ARCH #28 (session_018Bhcee2HTc21twW9aRyNPp) via coordinator #10
(session_018BhceewN4fx361Kuj2Ktyk), 07:31Z, unchanged:

"The tool cannot classify a package's facilities. tool/lib/notice/refs.mjs facilityName() names a facility by
checker.getFullyQualifiedName(), which for a declaration in a package gives the quoted absolute path of its file;
listName() strips the quotes and keeps the path, e.g.
`/home/user/civicsmith-copy/bio-plane/node_modules/miniflare/dist/src/index.Miniflare.dispose`. A facility list entry in
the build text's form (`pg:Client.query`) never matches, and an entry written with this machine's path would not match on
GitHub's machines or another session's checkout. Separately, members of the product's own unnamed kinds (destructured
fields such as `viewer`, `project`, `id`, 2,500 or so distinct names), `Proxy`, and `createHash(...).update`/`.digest`
(named `__type.update`/`__type.digest`) are reported as R14 'neither the tool's classification of the host nor the
facility list names': 15,677 such places across the product; packageOf() counts any declaration outside node_modules, the
product's own included, as the host's. Effect: no package facility can be put on civicsmith's facility list, and every
module's uses listing carries R14 places nothing can clear."

ARCH adds: other work goes on; the first eight modules use Node's facilities only (62 of these places among them).
Found by `p4 uses` on all 204 modules, Process4 1216397f.

## Research (worker)

Tool commit 59fa682 on branch facility-worker (on work/facility-names a99d4a8). Lines are of that commit;
"was" lines of its parent.

**1. Package names.** `facilityName()` (refs.mjs was 348) took `checker.getFullyQualifiedName()`, which for a declaration
in a package file is `"<absolute path without extension>".Export.member`; `listName()` (392) only strips the quotes. The
build text names a package's facility `pg:Client.query` (build/02c:50): package, colon, the export and member. Fix:
`qualifiedName()` (refs.mjs:78) names a package's facility `${packageOf(sym)}:${name without its leading quoted module}`;
`packageOf()` (59) takes the package from the path after the last `/node_modules/` (`@a/b` for a scoped one, `@types/x`
as `x`). So `miniflare:Miniflare.dispose` on any checkout. Left as is: the name is the declaration's, so a package that
re-exports under another name (`export { A as B }`) or from a subpath (`pkg/sub`) is named by its declaration, not the
import path; a facility list entry for such a facility must use the declared name.

**2. The product's own members.** Two causes. (a) The destructuring walk (refs.mjs was 967, now 1002) calls `facility()`
when `p.declarations.every(isHostFile)`, true for an empty list: a member a kind operator makes (`Record<'viewer'|'id',
T>`, other non-homomorphic mapped kinds) has no declaration. (b) `packageOf()` (was 53-60) returned the host for a member
with no declaration and for any file outside node_modules, the product's own included; `isHostFile()` (173) counts any
declaration file outside a module as the host's. Fix: `packageOf()` returns `node` only for the tool's folder (the
TypeScript library and the tool's node.d.ts/host.d.ts) and `@types/node`, `workerd` for `@cloudflare/workers-types`,
the package for other node_modules, and null for the product's own files or no declaration; `facility()` (refs.mjs:401)
returns at once on null: the product's own member is no facility (the standard's other rules cover it).

**3. `__type.update` and `Proxy`.** host.d.ts:137 gives `createHash` an unnamed result kind `{ update(): { digest() } }`.
The old naming walked up only to a `VariableDeclaration` (console.log) and never reached a function, so the name stayed
`__type.update`; facilities-build.mjs dropped every `__type` name, so no classification could hold it. A naming fix,
not an entry: `qualifiedName()` names a member of an unnamed kind by the declaration it is written in
(`node:crypto.createHash.update`, `...update.digest`), the same function names the classification
(facilities-build.mjs `nameOf`, and line 149 now lists every member of an unnamed kind in the descriptions), and the
crypto review (line 88) takes `createHash`'s result with it: `in`. Rebuilt facilities.json: 1292 in, 43 tests, 586 out
(was 1286/27/553); no name removed. The same fix names `fetch.ok`, `node:readline.createInterface.close` and the like.
`Proxy` is the language's, already named `Proxy` and the host's; it is left out of the classification on purpose
(facilities-build.mjs:17; study-references.md row 23: "forbid: R1; Proxy off the facility list"). It stays a place,
but its message wrongly sent it to ARCH ("neither ... nor the facility list names", waits on ARCH), whose list holds
packages only. Now (refs.mjs:415-416) an unclassified host facility says "a facility of the host the tool's
classification leaves out" and waits on the module; a package's off the list says "a facility of <pkg> the facility
list does not name" and waits on ARCH.

**4. Against the text.** An implementation error. build/02c:50 gives the list's form (`pg:Client.query`) and that the tool
classifies the host's facilities; design part 2 §7 (02:101) "The tool classifies the facilities of the hosts ...; ARCH
... classifies the product's packages". R14 (02c:39) covers facilities of Node, workerd, the language or a package, not
the product's own code. packageOf()'s comment ("anything else ... the host's") departed from the text. No text change
is needed. A sentence that would close the re-export gap, if PROCESS wants it (02c, after the facility list's example):
"A package's facility is named by its package, a colon, and its qualified declaration within the package (`pg:Client.query`)."

**Tests.** refs.test.mjs, new test "facility names": two checkouts give the same names; `miniflare:Miniflare.dispose`,
`@a/b:ns.f` cleared by the list and waiting on ARCH off it; `viewer`/`id` from a `Record` no facility; createHash's
update and digest the host's and `in`; Proxy a place waiting on the module. `npm test`: 273 pass, 0 fail (272 before).

**Unknown.** How many of the 15,677 places clear (not run on civicsmith). By ARCH's categories: the product's own
members (about 2,500 distinct names, most of the places by ARCH's account) and `createHash(...).update/.digest` all
clear; `Proxy` uses remain, now waiting on the module. Expect nearly all to clear, less the Proxy uses. Not covered: a
product whose program loads `@types/node` (a package's `/// <reference types="node" />`) names Node's modules `fs.x`,
not `node:fs.x`; workerd has no classification yet, so each workerd use stays a place; a product declaration file in
no module now gives no facility at all (design part 2 §1 gives every file a module).

## Options (put to the owner 26 Nov ~07:55Z)

- **0. No change.** No package can be put on civicsmith's facility list; ~15,677 places outside the standard that no job can
  clear; every module stays "not kept to the standard" and is told of every change of every earlier module it may refer to.
- **A. Merge the correction (recommended).** Branch `work/facility-names` (59fa682): an implementation error against build
  text 2c and design part 2 §7, no text change. Tool tests 273/273. Unknown until run on civicsmith: how many places clear
  (expected nearly all but `Proxy`, which stays a place by design). Left as they are, each still a place or a name to settle
  later: a package re-exported under another name, Node types pulled in by a package, workerd (not yet classified), a
  product `.d.ts` that belongs to no module.
Adds no test, gate, review or stop.

## Three more faults from the first conversion (civicsmith job setup-words #11, PR 1688, via ARCH #28 and coordinator #10, 09:29Z), unchanged

"(a) The tool's host description has no Buffer, so readFileSync's bytes.toString("utf8") at build.mjs:128 is a checker
complaint. It also has no maxBuffer in NodeSpawnOptions (build.mjs:201).
(b) S12 reports RegExp .test(...) calls in tests as "a test whose name is not written out": word-list.test.mjs:363, 372,
373 and extraction.test.mjs:310. I left those as they are.
(c) The tool cannot resolve the written-out import "../../../src/setup-words/index.mjs?again" (S1, word-list.test.mjs:245),
which R4's fresh-load test needs."

Coordinator adds: ARCH carried out the answer on `documents` (it leaves the module list; its files go to setup-words).

## Research on the three (worker)

Tool commit 891a917 on branch faults-worker (on work/facility-names 495b651, which holds 59fa682). "Was" lines are of its
parent. Each fault reproduced first; each new test fails on the parent and passes on 891a917.

**(a) Buffer, maxBuffer.** host.d.ts is written by hand and covers what the made-up product used. It declared no `Buffer`
(global or `node:buffer`), gave `readFileSync(path)` with no encoding the result `Uint8Array` (was host.d.ts:22; and
`fs/promises.readFile`, was 47), whose `toString()` takes no argument, so `bytes.toString("utf8")` is the complaint
"Expected 0 arguments"; `NodeSpawnOptions` (was 89) had no `maxBuffer`. Each is an S4 place with the checker's words.
Against the text: an implementation error. Design part 2 §7 (02:101) rests the standard on "each host's descriptions
of its facilities are true", and build/02c:50 has the tool classify Node's facilities "for the versions it pins"; Node 22
documents `Buffer` (buffer.html), `readFileSync` handing one back, and `maxBuffer` for execFileSync/spawnSync/exec.
Fix: host.d.ts:22-51 `Buffer extends Uint8Array` (toString(encoding, start, end), equals, compare, copy, write,
subarray, slice, indexOf, includes, toJSON), `BufferConstructor` (from, alloc, allocUnsafe, byteLength, concat,
isBuffer, isEncoding, compare), `node:buffer`/`buffer`; readFileSync and readFile hand back `Buffer` (54, 79);
NodeSpawnOptions (121) gains maxBuffer, killSignal, shell, windowsHide, and `input` may be bytes. Classification:
facilities-build.mjs:81-84 Buffer `in` (computes on what it is handed); `BufferConstructor.allocUnsafe` was already
NEVER (refs.mjs:110) and stays so. facilities.json rebuilt: 1320 in, 43 tests, 586 out (was 1292/43/586); none removed.
Test: refs.test.mjs:1170.

**(b) S12 and RegExp `.test`.** `isTestCall` (check.mjs, was 636) took any member call named test/it/describe/suite as a
test call, so `WORD.test(s)` is a test case: with a written-out argument a test of that name, otherwise the S12 place
"a test whose name is not written out" (refs.mjs:220, 231). An implementation error: S12 (02c:24) names the runner's
calls `test('…')`, `it('…')`, `describe('…')`. Fix: check.mjs:640-663, a member call counts only on a name imported from
`node:test`/`test` (`nt.describe`) or on a parameter of a function handed to a test call (`t.test`). Read from the
syntax, as 02c:52 says S12 is. Test: refs.test.mjs:1187.

**(c) `index.mjs?again`.** The pinned reader resolves a specifier as a path and keeps the query in it, finds no file
(complaint 2307), and refs.mjs:925 makes it the S1 place "an import the tool cannot resolve". S1 (02c:13) allows a
written-out relative path "resolved by Node's documented algorithm"; Node's ESM resolver treats a relative specifier
as a URL, finds the file without its query or fragment, and loads it again for each distinct query (esm.html, "URLs").
So an import of the module's own file with a query is within S1 (and within S5: it is the module's own file). The "R4"
the fault names is not the standard's R4 (02c:32, no export hands out unknown or any); presumably civicsmith's own
requirement on a fresh load. An implementation error. Fix: util.mjs:121 `fileSpecifier` strips `?…`/`#…` from a relative,
absolute or `file:` specifier only (a package or `#` name is no URL); ts.mjs:54-65 a compiler host that resolves with it,
used by both readings (46, 81); usesfile.mjs:153 and related.mjs:133 resolve the same way. The load stays distinct at run
time; the checker reads one file and so gives both loads the same kinds and symbols, which is right for types and uses
(the reference is to the module itself). A missing file with a query is still an S1 place. Test: refs.test.mjs:1205.

**Tests.** `npm test`: 276 pass, 0 fail (273 before, three new).

**Unknown.** Not run on civicsmith. (a) is the class, not the instance: host.d.ts still describes only part of Node, and
every other documented member a product uses (spawnSync's Buffer results with no encoding, `Buffer.readUInt32LE`, …) is
still an S4 place until described; the tool pins no Node descriptions (TypeScript is its one dependency), so each such
fault comes one at a time. A sentence, if PROCESS wants the class settled in the text (02c, Settings): "The tool's
description of the host gives every facility of the pinned Node version as Node documents it; a facility it leaves out
is the tool's fault, reported to PROCESS, not a place of the module's." (b) a test context under another name passed
on (`const u = t; u.test(...)`) is no longer a test call. (c) the class identity of two loads (an `instanceof` across
them fails at run time) is not modelled.

## Options, as one group (put to the owner 26 Nov ~09:50Z, replacing the earlier 0 / A)

- **0. No change.** The ~15,677 places stay; Buffer, maxBuffer, RegExp `.test` and `?again` imports go on raising complaints.
- **A. Merge the four corrections (recommended).** `work/facility-names` (59fa682, 891a917): package facilities named as the
  list names them; the product's own members no facility; Buffer and the spawn options described; RegExp `.test` not a
  test; a query on an import resolved to its file. Each an implementation error against build text 2c / design part 2 §7;
  no text change. Tool tests 276/276. Not run on civicsmith.
- **C. Describe Node from its published type description, pinned to the product's Node version, instead of by hand (a
  question, not built).** The hand-written host description covers only part of Node, so its gaps will surface one job at
  a time. Not researched; to study only on his word. Rule 6: nothing measured beyond the gaps met so far.

## Two more, already covered (civicsmith job connection-grammar #4, PR 1694, via ARCH #28 and coordinator #10, 09:46Z), unchanged

"(1) uses and check read a RegExp's .test(...) call inside an assertion as a test case, and list it as "S12 a test whose
name is not written out". This happens at conformance.test.mjs:106 and hub-by-kind.test.mjs:143, 160 and 162. I left those
lines as they are. (2) node:crypto's Hash update and digest are named __type.update and __type.digest, so they are listed
as unclassified facilities (R14) at shape.test.mjs:105."

Both are corrected on this branch (891a917: RegExp `.test` no test; 59fa682: a member of an unnamed host type named by its
declaration). Coordinator #10 told so as information.

## Two more (civicsmith job record-grammar #4, PR 1689 merged, via ARCH #28 and coordinator #10, 09:55Z), unchanged

"b. A renamed destructuring key (`for (const { prefix: p } of ID_TABLE)`) is reported as a value of kind any (2 R1,
ids-types.test.mjs).
c. A value narrowed by `instanceof` (S4's prescribed form) or by the module's own guard is still reported R2 by its declared
kind unknown (acceptance.test, invariants.test, sha256.mjs's own snapshot, which the module itself writes)."
(Its fault (a), `x.test(...)` read as a test case, is corrected on this branch.)

## Research on b and c (worker)

Branch `narrowing-worker`, on `work/facility-names` (59fa682, 891a917). TypeScript 5.6.3. Not run on civicsmith.

**(b) `{ prefix: p }` as kind any.** refs.mjs:1007-1008 (was) made every identifier that is not a declaration's name an R1
candidate. In a binding element `prefix: p` the name is `p`; `prefix` is the `propertyName`, a key, not a value, and
the checker gives a key in a pattern no type of its own (`getTypeAtLocation` returns its error type, printed `any`). So
each renamed key was "a value of kind any". An implementation error: R1 (02c:29) is about expressions; the key is none,
and the binding `p` (correctly typed) is still read. Fix: refs.mjs:1011-1013, a key of a binding element is skipped like
a member's name in `x.name`. Test: refs.test.mjs:1226 (`for…of` and a plain `const` pattern; failed with two R1 before).

**(c) narrowed `unknown` still R2.** refs.mjs:1015-1019 (was) took the kind of the read's holder from its symbol
(`getTypeOfSymbol`, the declared `unknown`) and excused only a narrowing to another module's class (`kindDecls` of the
narrowed kind). `e instanceof Error` (S4's form for a host error) or `m instanceof Mine` (own class) left `e.message`,
`m.name` an R2. An implementation error against S4 (02c:16) and R2 (02c:30): after `instanceof` the value is the class's
instance, its shape the class's, not one the module gives it. Fix: refs.mjs:1020-1024 reads the kind at the use
(`getTypeAtLocation`, the narrowed kind); the hand narrowings keep their place at the narrowing (`in`, 1025-1028, as
before; a guard, below).

**The module's own guard.** 02c does not say "only instanceof": R3 (02c:31) allows a hand-written guard narrowing to
the module's own type from a value with no product type; R2 allows giving a shape only where the value is from the
module's own channel; the conversion table (02c:68) names "a cast or hand check on another module's data" as converted
to that module's reader. So a guard of the module counts as narrowing, and is a place only when its argument is not from
the module's own channel. The tool had placed instead each read after the guard (and the `in` checks inside the guard
body, whose parameter had no origin). Fix: refs.mjs:1029-1038, a call of a guard of this module (`v is T`) whose argument
is `unknown` and not its own channel is one R2 place at the call; refs.mjs:597-599, a guard's own parameter is judged at
its calls (as the exported validator's already was). A guard on the module's own channel (`JSON.parse` of its own text or
file) is no place; on another module's data it stays R2, once. An implementation error; no text change. Test:
refs.test.mjs:1239 (instanceof Error on a caught value, instanceof an own class, an own guard on own and on foreign data;
five R2 before, one after).

**Tests.** `npm test`: 278 pass, 0 fail (276 before, two new, each failing before its fix).

**Unknown.** sha256.mjs's snapshot "which the module itself writes": whether the tool's `ownChannel` sees that file as
the module's own (a path it can evaluate from `import.meta.url`) is not seen; if not, its guard call stays one R2 there.
`instanceof` a host class on another module's data (not an error) now reads by the class too; 02c names `instanceof` only
for caught errors, so this follows S4 by extension. A sentence, if PROCESS wants it written (02c, R2): "A value narrowed by
`instanceof` has the class's shape; a module's own guard gives a shape and is placed where its argument is not from the
module's own channel."

## More from civicsmith job civil-time #3 (PR 1692, via ARCH #28 and coordinator #10, 10:08Z), unchanged

"the tool's host description omits process.versions (civil-time reads tz/ICU versions for R25; now read as unknown and
narrowed). The tool also seems to treat any same-named binding elsewhere in a file as an assignment for R19 ... I worked
within both without changing behaviour." And: "R26's clock test (invariants.test.mjs, 18 places: S8, R14, S4, R1) replaces
globalThis.Date and globalThis.Temporal so that any clock read throws. The standard has no form for this: S8 forbids the
writes; mock.method on a host global is flagged S12; the tool's description of node:test has no mock.property and its
library has no Temporal; mock.timers is unclassified (R14). I kept the test as it was rather than weaken it."

Reading (PROCESS #18, not yet researched by a worker): four more gaps in the hand-written host description (process.versions,
node:test's mock.property, Temporal, mock.timers' classification) — now measured repeatedly, so option C (describe Node from
its published types, pinned to the product's Node version) has a measured cause. R19's same-named binding looks like a tool
fault (a binding elsewhere is not an assignment). Replacing a host global in a test (a clock that throws) has no form in the
standard: a design question for the owner (a form for a test to replace a host facility, e.g. node:test's mock on a host
global, read as a mock use of the host), not a tool fault. For PROCESS #19: research these three; put C, R19 and the test
form to the owner as one group with, or after, A.
