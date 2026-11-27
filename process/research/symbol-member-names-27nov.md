# A symbol-keyed member's name shifts with its module's code (27 Nov 2026)

Process fault from civicsmith office-readers #15 (PR 1754), passed unchanged by ARCH #34 and coordinator #16 (~03:26Z),
civicsmith on Process4 7916c03: "`p4 uses office-readers`, run on unchanged code, rewrote the uses file. The only
difference was an item name the tool takes from the checker's internal symbol id, `ooxml Chunks.__@asyncIterator@3605` →
`Chunks.__@asyncIterator@3641`. The number shifts whenever ooxml.mjs changes. So an item's name in a uses file can stop
matching the provider's listing even though nothing about the use changed. That may send notices for "changes" that
aren't real, or miss real ones, and it may be why #1745 produced 238 reasons from a two-line type change. I did not keep
that rewrite."

Read in the tool: TypeScript names a member keyed by a well-known symbol (`[Symbol.asyncIterator]`, `[Symbol.iterator]`,
`[Symbol.toPrimitive]`, …) internally as `__@<name>@<id>`, the id depending on the program's other code. The listing and
the uses file take that internal name as the member's name. Decision J (27 Nov) made R17 print and match it by its
symbol (`refs.mjs` ~999-1005); the item names in listings and uses files were left. A tool fault against design part 2 §7
(an item is named by its name within its module; a use is matched to the provider's item by name): an unchanged use
looks removed and a new one added whenever the provider's file changes, so its users are told of a change that is not
one (a removed item tells), and a real change to that member can be missed under the old name.

Options:
- 0. No change.
- A. Name such a member by its symbol everywhere (`Chunks.[Symbol.asyncIterator]`), in listings, uses files and notices;
  read a name of the old form in an older uses file as the symbol it stands for, so no file needs rewriting and old and
  new names match. Small; no text change (design part 2 §7 already names items by their name).
Recommended: A. Whether it explains #1745's 238 reasons is not known; the rebuilt tool on that merge would show it.

## A second fault, which STOPS a job: a package's declaration merged into a host global (pdf-pixels #6, PR 1767, ~04:24Z)

Its words, via ARCH #34 and coordinator #16: "`p4 check pdf-pixels` refuses 63 "order faults". Each one is a use of the
global `URL` (`new URL(...)`), credited to module pdf-worker as "pdf-worker/node_modules/esbuild/lib/main.d.ts:URL". The
cause: esbuild's main.d.ts declares `interface URL {}`, which merges into the global URL. The tool's `packageOf` / owner
lookup (tool/lib/notice/refs.mjs) takes `sym.declarations[0]`, which here is esbuild's file. Because that file sits under
pdf-worker/, the host's URL becomes a reference to a later product module. ... The refusal still appeared with
pdf-worker/node_modules moved aside. No real use of pdf-worker exists, but `p4 test` will fail on it." pdf-pixels is
recorded blocked.

Read in the tool: several places take a symbol's owner from `declarations[0]` (refs.mjs, e.g. ~452, ~1059, ~1119). A
global the host declares can gain declarations from any package's ambient file, and the first may be the package's,
inside a product module's folder. A tool fault against design part 2 §1 and §6 (a use of a later module is refused only
where it is one) and build text 2c (a host facility is the host's). Its effect: a false refusal, a stopped job.

- **B. A symbol any host description declares is the host's,** whatever else merges into it; a declaration in a package
  (under any `node_modules`) never makes a symbol a product module's. Small; no text change.
Recommended: A and B together, one version; B unblocks pdf-pixels.

## Two more (neither stops work), via ARCH #35 and coordinator #16, ~05:19Z

1. pdf-worker #7 (PR 1770): "workerd's Response and Request are not in the tool's host description. The tool's note on
   the "Cannot find name 'Response'" place says it is not kept, yet the R1 "any" places that follow from it ARE kept in
   the uses file. That is 18 in src/index.mjs (every json(...) answer) and more in the tests. Design part 2, section 7
   says a place that stands only on such a gap is not kept. The S4 on the default export's stated type
   `Promise<Response>` (src/index.mjs:433) is kept too." So H's tracing misses R1 that follows a missing global's value,
   and an S4 on a stated type naming it; and N lacks workerd's Response and Request (and kin).
2. image-codecs #3 (PR 1766): a typed-array method called on a union (`Float32Array | Int32Array`).fill/.set is listed
   as R14 "a facility the classification leaves out", though the same call on one typed-array type is classified (a
   naming of a union member's method; the job narrowed with instanceof).

- **C. Complete H and N for these:** an R1 or S4 that rests only on a missing host global is not kept; workerd's Fetch
  API kinds (Response, Request, Headers, fetch's init) described; a method of a union of host kinds classified as each
  member's. Small; no text change.
Recommended now: A, B and C as one version.

## Two more (neither stops work; civicsmith halted on the owner's word since 06:06Z), ~06:09Z

1. sheet-worker #4 (PR 1778): "the tool has no description of Request, Response or WebAssembly used as a value ("Cannot
   find name 'Response'", "Cannot use namespace 'WebAssembly' as a value"). It marks the first line "not kept", but the
   `any` that flows on from it is kept as R1 places, about 70 here. Also, the WebAssembly.Module type resolves to
   esbuild's declaration and is listed as an esbuild facility (R14). And Miniflare's getR2Bucket is typed as
   Request_2<any>." (C again; the esbuild case is B.)
2. op-grades #5 (PR 1781): "the tool's classification of host facilities leaves out the language's Proxy, so `uses`
   lists the R14 place at bio-plane/src/op-grades/declared.mjs:74. The lib's ProxyHandler and Reflect.get hand back any,
   so R1 is listed at line 75." (N/C: Proxy classified; ProxyHandler's and Reflect.get's `any` is TypeScript's own typing,
   a real R1 the job writes around, or a host gap if judged so.)
C widened: WebAssembly as a value, Proxy, Miniflare's types as the package declares them.
