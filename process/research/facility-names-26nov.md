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
