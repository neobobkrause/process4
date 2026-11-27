# Every non-conversion merge tells every unconverted module (26 Nov 2026)

Raised by the owner, 26 Nov ~22:15Z, relaying civicsmith's coordinator: "Every merge so far has told 199 modules:
those not yet under the coding standard hear of any change, even when no item changed. The five open jobs each got
three notices."

## What happened (read from civicsmith ARCH's own session, 26 Nov ~22:15Z)

- After the account switch civicsmith runs on Process4 5948442. ARCH merged three jobs that were **not conversions**:
  setup-words (PR 1706, a stale list rebuilt), jurisdictions (1707, seven bugs fixed), calc-grammar (1708, two bugs
  fixed, one declared change). Each is an already-converted early module doing ordinary work.
- Each merge told 199 modules: every later module whose conversion has not merged. The five open conversion jobs each
  got three notices in their job blocks; case-checker's merge (1710) was refused because notices reached it after its
  tests ran. The notice comments are very large; ARCH's `open` for id-spaces ran slowly reading them. The coordinator
  reports "199 follow-up checks" queued.

## Why (the design as written; no tool fault)

- Design part 2 §7, point 3: on any change to a provider's code or tests, whether or not an item changed, each later
  module with a place outside the standard that may refer to it, or with no uses file yet, is told. Rule 2 for the
  tool: where it cannot say which modules a place may refer to, every earlier one. Unconverted civicsmith modules carry
  thousands of such places (first-pass figures: 14,318 places before conversion), so each is told of every change to
  every earlier module. `tool/lib/notice/notice.mjs` (~623-760) does exactly this.
- A conversion's merge tells no one (10164fb); ordinary merges still tell by point 3.
- `round.mjs` `workOf`: an unconverted module's only work is its conversion; its notices wait in waiting work for the
  next job. So after each module's conversion merges, its waiting notices make a **told job**: about 199 extra jobs for
  the sweep, whatever the number of ordinary merges (the notices pile into one told job per module), plus notices to
  open conversion jobs that hold their merges.

## What it buys

A told job after a conversion re-checks a change made to an earlier module before the conversion. But the conversion
itself works on the tranche's newest code (the tool brings its branch up to the tranche before its tests), so a
conversion that runs its tests has already run them on the changed provider; one that changes no running code runs
none. Nothing measured shows a provider's bug fix breaking an unconverted user. Measured: three merges, 199 modules
told each, one merge held, ~199 told jobs queued, slow `open`.

## Options

- **0. No change.** About 199 told jobs after the sweep, each reading its notices and running related tests; open
  conversion jobs keep receiving notices that hold their merges; notice comments stay large.
- **A. A module whose conversion has not merged is not told by point 3; its conversion settles what waits for it.**
  Point 3 (and point 4's "each module with no uses file yet") tells no module before its conversion merges; a
  conversion's merge clears the notices already waiting for its module. Removes the told jobs and the merge holds;
  adds nothing. Risk: a provider change that breaks an unconverted module whose conversion changes no running code is
  caught only by that module's next job or a walk (nothing measured behind it). Text: design part 2 §7 (points 3-4,
  "Not telling the others is safe"), build text 1b command 11, build text 5 §6; tool: notice.mjs, the waiting-work
  clearing at a conversion's merge; ARCH's starting text unchanged.
- **B. Hold ordinary work until the sweep ends** (the owner's earlier "conversions only"): ARCH places no non-conversion
  work while unconverted modules remain. No tool change; but the round's scope cannot express "conversions only"
  (scope names requirements or whole modules), and it delays bug fixes for the whole sweep.

Recommended: A. It costs one small tool change and text, and removes ~199 jobs and the merge holds at civicsmith's size.

## Then: the notices could not be written (process fault from civicsmith ARCH #32, 26 Nov ~22:18Z)

Passed unchanged by civicsmith coordinator #14. ARCH ran `p4 notify` for 1706, 1707 and 1708 at once, each in the
background. Each found no item's means changed, told the 199 modules by point 3, wrote the notice into the five open
jobs' blocks, then failed: "GitHub refused: gh: You have exceeded a secondary rate limit and have been temporarily
blocked from content creation ... (HTTP 403); nobody is told; the notice for pull request <n> is owed". Each run's
output was 95-111 MB. `p4 open --module id-spaces` then failed the same way; the tool's four retries did not get past
it. The block is on the sessions' GitHub account, so it reaches every repository that account writes, Process4's
included (PROCESS #20's own `p4 open` stalled at the same time). Effect: three notices owed; id-spaces cannot open.
ARCH will re-run the owed notifies one at a time once the block lifts.

Bearing on the options: the writes that tripped the limit are the 199-module notices themselves. Option A removes
them (no module is told before its conversion), so the fault does not recur and the three owed notices need not be
sent (each told only unconverted modules; the open jobs already have theirs). Under option 0 the tool would also need
to write such notices within GitHub's content-creation limits, a second change; with A, nothing more.

## A third report: R1 notes kept for Node features the tool does not know (runtime-limits #2, PR 1712, via ARCH #32)

Its words: "the uses file keeps R1 places with mayRefer "*" (tokens.mjs:53; runtime-limits.test.mjs:219, 222, 223)
that exist only because the tool's description of Node lacks crypto.subtle and process.cpuUsage. Build text 2c says a
note that stands only for such a gap is not kept. The matching S4 notes are dropped, but these R1 notes are kept and
tell this module of every earlier module's change. Second, possibly a fault: p4 test's record write gave up on
GitHub's secondary rate limit rather than waiting it out." Its tests passed twice (60/0); both record writes refused.

Read in the tool: `refs.mjs:998` marks the checker's S4 note `unknownHost` where the gap is the host's (`hostGap`),
and `usescmd.mjs:51` leaves `unknownHost` places out of the file; but the R1 place for the value of `any` type that
the missing property yields is made without `unknownHost` (`place`, `refs.mjs:366`), so it is kept with mayRefer
["*"]. A tool fault against the owner's decision of 26 Nov (ee2091f: the tool's notes on Node features it does not
know are not kept). Unlike A, it lasts after the sweep: a converted module keeping such a note is told by point 3 of
every earlier module's change.

- **H. Carry the gap through.** An R1 (or other) place whose `any` comes only from a host gap is `unknownHost` too, and
  not kept. Small; no text change (build text 2c already says it). Recommended, with A, G1, G2.
The second point (the record write refused by the secondary limit) is G2 of `github-limits-26nov.md`.

## A fourth report: R2 places on a module's own data (court-citations #2, PR 1715, via ARCH #32, ~22:56Z)

Its words: "R2, 7 places: decoding JSON this module owns is still read as "not from this module's own channel". That
covers the data text in court-data.mjs (index.mjs:148), the package files the build reads from a folder its caller
names (build.mjs:200, 289, 290, 335), the test's reading of a generated module's text, and the test's own
child-process output. Each "waits on the owner of the data: its reader", but this module is that owner." Also `p4 test`
exited on the rate limit without writing its record; a second run ten minutes later wrote it (G2). GitHub's block
lifted ~22:50Z; the three owed notices are held for PROCESS's answer.

Read in the tool: `ownChannel` (`refs.mjs:601`) accepts a literal, a `const` whose initializer is one, `JSON.parse` of
those, a file read whose path resolves inside the module, the module's own table rows, its exported validator's or
guard's parameter. It does not follow a text imported from the module's own data file, a generated file of the module,
or the output of a program the module itself starts; each is made an R2 place with mayRefer ["*"]. A folder its caller
names is a different matter (R15: a boundary export takes no path from its caller); that place may be right.

## After the sweep: what A does not cover

A stops notices to modules not yet converted. A converted module that keeps any place with mayRefer ["*"] is still
told by point 3 of every change to every earlier module, for good. By the design a conversion leaves only places that
wait on a provider or on ARCH; places that wait on "this module" are the conversion's to remove. The runs now report
places left only because the tool records them wrongly: H (R1 notes from Node gaps) and the R2 cases above. Each such
tool fault, corrected, removes leftover places; the rest are the job's.

- **J. Own data read as own.** `ownChannel` also accepts the module's own data text (imported or read from its own
  folder), its own generated files, and the output of a program it starts itself. A caller-named folder stays a place
  (R15). Small; build text 2c's R2 already says it ("read from the module's own channel"). Recommended with A, G1, G2, H.

## A fifth report: more Node features missing (signatures #3, PR 1713, via ARCH #32, ~23:01Z)

Its words: "it has no `atob`/`btoa`, no `crypto.subtle`, no node:crypto `createPrivateKey`, `createPublicKey`, `sign`,
`webcrypto` or `KeyObject`, no `Buffer#readUInt32BE`, and no spawnSync's `output`. Plain TypeScript 5.6.3 with Node's
types accepts that code. The R1/S4/R4 places that remain in sshsig.mjs, sign-sshsig.mjs and the tests come from those
gaps." And: "`assert.ok(Array.isArray(x))` narrows x to `… & any[]` for the rest of the test (R1); ... A loop label
named like a variable (`outer:` beside `const outer`) also reads as any."

Bearing: H covers the telling: a note that stands only on a host gap is not kept, whatever its rule (R4 places
already refer to no module, `refs.mjs:1708`). The gaps themselves stay places in the printout the job reads; the
lasting cure is option C of `rules-r15-r19-host-26nov.md` (Node from its published types), still open with the owner.
`Array.isArray` narrowing to `any[]` is TypeScript's own typing: a real R1, the job's to write differently. The loop
label read as a value is a reader fault, folded into H (a label is never a value).
Figures for the owner's account: runtime-limits 683 -> 18 places, bundler 1,316 -> 259, court-citations 799 -> 128,
signatures 578 -> 121 (PRs 1712-1715, merged).

## A sixth report: test-support #6 (PR 1711, via ARCH #32, ~23:16Z)

Its words: "1. The tool's description of Node lacks node:zlib, node:http, node:sqlite and node:crypto.createCipheriv. It
also lacks fs lstatSync, chmodSync, chownSync, openSync and closeSync, rmSync's maxRetries, Hash.digest() with no
argument, new TextDecoder(label), Buffer.of, Buffer.readUInt32BE, Buffer.writeUIntLE, process.getuid,
process.memoryUsage, Stats.mode, and NodeWritable write(Uint8Array), once and end(callback). Most of the remaining R1
and S4 places come from these. 2. R2 does not count JSON a module's own spawned child prints, or a file the module
wrote, as the module's own channel. It also flags get/set on a Map<string, unknown> the module declares itself. 3. `new
Map()` on a declared type reads as Map<any, any> (R1). TS 5.5's inferred type predicates read as hand-written R3
guards. Iterable/AsyncIterable defaults read as any. 4. R17 flags Object.assign from a value whose kind hides members,
but not an object spread of the same value. R6 flags a literal passed through a conditional but not the same literal
passed directly. 5. A deliberately bad input to a function stored in a closure and handed to assert.throws later is a
disagreement, not "cannot tell". I rewrote those calls directly inside assert.throws." test-support: 3,868 -> 526
places, merged.

Bearing:
- Point 5 is a refusal against the owner's rule (design part 2 §6: a value passed on purpose in an error assertion is
  "cannot tell", never refused). A tool fault; the job worked round it by rewriting its tests.
- Points 2-4 are the reader's precision against the standard as written; J widens to "the reader faults the jobs
  report": each corrected where the tool contradicts build text 2c, judged one by one by a worker; where the tool misses
  one form of a real place (point 4's spread, direct literal), the miss is recorded, not widened, at the owner's word.
- Point 1, with signatures' list, makes about forty missing Node names from three jobs. **N: add the reported Node
  features by hand** to the tool's description (from Node 22's documentation, as 70022da did), with H so any later gap
  tells no one. Small. **C** (Node from @types/node, `rules-r15-r19-host-26nov.md`) closes the class but costs a second
  dependency, about three times the reading time of each `uses`/`check`/`notify` run, and a rename of every host
  facility that tells every converted module once. Recommended: N now, C not.
Group now: A, G1, G2, H, J (widened), N. Recommended: all six.

## A seventh report, which STOPS two jobs: ooxml #4 (PR 1719) and csv-reader #5 (PR 1720), via ARCH #32, ~23:53Z

Both: `node.d.ts:116` declares `declare class TextDecoder { decode(b?: Uint8Array): string; }`: no constructor
parameters (label, {fatal, ignoreBOM}), no `encoding`, no `decode(input, {stream})`, not on globalThis. Once the module
states its types, `p4 check` REFUSES its own correct code as "(a) a comment disagrees with this module's code: Expected
0 arguments, but got 2" (ooxml.mjs, two places; csv-reader index.mjs:1071, 1080, 1309, 1433, 1544, entry.test.mjs:60,
text.test.mjs:369). `p4 test` runs the check, so neither job can pass; both keep their branches. ooxml also reports:
`Blob`, `DecompressionStream`, `ReadableStream`, `crypto.subtle`, workerd's `crypto.DigestStream`, `node:zlib` and the
language's `IteratorResult` `done`/`value` undescribed; R17 looking up a symbol-keyed member by its internal name
(`__@asyncIterator@NNNN`, `refs.mjs` ~766), so every object with `[Symbol.asyncIterator]` given a stated type is a place;
and the check counts TypeScript's 2531 "Object is possibly 'null'" as a refusal while 2532/18047/18048 are "cannot
tell" (`check.mjs:59` lacks 2531). ARCH: "the same family: the tool's description of Node and workerd is incomplete.
One corrected version would settle all of them."

Bearing:
- This is a stop nothing called for (design part 4 §10): a refusal of correct code that rests only on the tool's
  description of the host. The owner's rule (part 2 §6) allows refusing code only where it disagrees with a structured
  comment or a provider's stated interface; the host's description is neither a mark of the module nor a provider.
- **H widened:** a checker complaint that rests only on a host gap is "cannot tell" in `check`, never a refusal, as it
  is already not kept in the uses file. Then no later gap can stop a job.
- **N widened:** TextDecoder in full (as csv-reader states it, WHATWG), Blob, ReadableStream, DecompressionStream,
  crypto.subtle, workerd's DigestStream, node:zlib, and the ~40 names of the earlier reports; IteratorResult classified.
- **J widened:** R17's symbol-keyed lookup; 2531 read as 2532 is.
- C (published types) would close Node's gaps but not workerd's (a third package, @cloudflare/workers-types). Still not
  recommended now; with H widened a gap can no longer stop work, only leave places for a later pass.
Group now: A, G1, G2, H, J, N, each widened as above. H and N unblock ooxml and csv-reader.

## Built (worker, 27 Nov 2026; tool tests 293 -> 312, all pass)
On the owner's "Decision: A, G1, G2, H, J, N" (27 Nov, 00:22 UTC). A: notify drops every module without a merged
conversion before writing anything, counts and names them; a conversion's notify removes only that module's waiting
notices. G1: every non-GET `gh api` write starts at least 1 s after the last, slots reserved under a lock in
`$TMPDIR/p4-writes.json`. G2: writes run with `-i`; retry-after, else the reset where nothing remains, else 60/120/240/480
s; then "run the command again after <UTC>"; a rate block is never taken for an ordinary refusal. H: one host-gap
judgement shared by `uses` and `check` (unknown host globals, destructured members, calls only the description's
signature rejects); "cannot tell" in `check`; R1 (and a cast's R2 from `any`) traced to a gap not kept; a loop label is
no value; R4, R16's other branch and R17 not traced (R4 refers to no module). J: own channel follows imported own data,
files in a folder the module made, its own program's output, `get` on its own Map; R17 symbol members; 2531; a closure
handed to an error assertion; TS 5.5 inferred predicates; `new Map()` and iterable defaults left (TypeScript really types
them with `any`); R17 assign/spread and R6 conditional/direct are misses, reported, not widened. N: the reported Node
and workerd features added and classified (`facilities.json` only gains names); descriptor-taking fs functions make no
S5 place.
