# What in the tool works out "who uses what", and what a job-written uses file would do to it (25 Nov 2026)

Status: research for PROCESS #15, by a worker. Read-only; nothing in the tool is changed. Read at origin/main 4acec19.
Line numbers are file lines (comments and blank lines included). "Uses file" means the owner's proposal
(`../uses-metadata-25nov.md`): each module keeps a file, written by a job that understands the code and kept current by
every later job, naming per provider the entries used and the files using each, marked code / tests / both.

## Summary and bottom line

Five places in the tool work out who uses what: the notice's reading of users (`usage.mjs`, driven by `staged.mjs`,
with the "not followed fully" fallback and its narrowing `narrow.mjs`), the passers ("changed through"), the merge wait
(`uses.mjs`), the related tests of a told job (`related.mjs`, fed by the places the notice found), and the check of
declared uses against imports (`check.mjs`). Separately, "what changed" is worked out by writing the provider's listing
before and after (`listing.mjs`, `canon.mjs`) and comparing (`diffListings`, `makeConfirm`); a uses file does not touch
that half, and it is the larger body of code. Of about 3,700 lines in the files concerned (notify.mjs, notice/*,
uses.mjs, scope.mjs), with a complete entry-level uses file: **about 480 lines are removable** (all of `usage.mjs` and
`narrow.mjs`, the not-followed fallback, the staged reading of users); **about 215 are replaced by a lookup** (the
users loop of the notice, the merge wait's import following, the related list's places, the walk's users), which would
itself be perhaps 60 to 100 new lines; **about 1,270 are still needed for "what changed"** (listings, their comparison,
rule 52's checker, the first-comments step, and, unless the uses file also records kinds received through middle
modules, the listings of passers); **about 1,740 are kept unchanged** (notify's plumbing, the check's two refusals,
the related list's call-following, the reader and product model). The cost and the over-telling on civicsmith sit
almost entirely in the removable part (reading and type-checking every later module; "not followed fully"), so the
saving is far larger than the line count suggests. Two findings limit what the file can fix: **the proof's
"needed and missed: 45" is almost entirely the other half** (40 of the 45 are changes after which the provider's
listing does not differ at all, so no method of finding users could tell anyone), and **removing "not followed
fully" loses no user the proof says needed telling** (no needed user is told only as not followed; the 11 told only as
not followed needed nothing). The uses file tried on 25 Nov was a cache of the tool's own inference in a scratch
prototype; it is not in the tool, and it went stale because inferred uses change whenever anything in a user's import
closure changes.

| | Lines (about) | What |
|---|---|---|
| (a) removed | 480 | `usage.mjs` 216, `narrow.mjs` 126, staged reading of users ~81, notice's not-followed and after-side parts ~59 |
| (b) replaced by a lookup | 215 | notice's users loop and its entry ~54, `uses.mjs` 147 (merge wait), related list's places 9, walk's users 2, passers' choice 3 |
| (d) still needed for "what changed" | 1,270 | `listing.mjs` 351, `canon.mjs` 285, notice's comparison and confirmation ~314, staged listings of provider and passers ~188, `commentsOnly` 83, notify's changed modules and child reading 46 |
| (c) kept unchanged | 1,740 | rest of `notify.mjs`, `check.mjs` (but its declared-uses part extended), `related.mjs` call-following, `scope.mjs`, `ts.mjs`, `model.mjs`, `carriers.mjs`, `noticeText` |

## 1. `notify` and the notice

### 1.1 The flow today (for orientation)

`notify` (`tool/lib/notify.mjs:180-236`) writes both commits out, finds the modules whose files the merge changed
(`changedModules`, :87-95), and runs `notice/notices.mjs` (18 lines) in a child process (`readNotices`, :97-115) so
running out of memory is said plainly. `notices.mjs` calls `notice()` (`notice.mjs:311-324`) per changed module, which
builds a staged reader (`staged.mjs:148-305`) and runs `noticeWith` (`notice.mjs:346-468`). The told users go to open
job blocks (`toOpenJobs`, :129-174) or the notice comments and waiting work (:219-235).

### 1.2 Each part, and what a uses file does to it

| Part | File:lines | Lines | What it does | With a uses file |
|---|---|---|---|---|
| Changed modules | `notify.mjs:87-95` | 9 | Owners of the files the merge changed, by either side's module list. | (d) kept: "which provider changed" |
| Child reading | `notify.mjs:97-115`, `notices.mjs:1-18` | 37 | Runs the reading in its own process; out of memory said plainly. | (d) kept while the provider's listing is still read with TypeScript; could go if only one module's listing is read |
| Listing command, check command, related command, plumbing | `notify.mjs:1-85`, `:117-280` | ~230 | `listing`, `toOpenJobs`, waiting work, `check`, `related`. | (c) kept |
| `analyse` (whole product read) | `notice.mjs:21-31` | 11 | One program over the whole product: every listing and every module's uses. Used only by tests (`notice-replay.mjs:63`, `notify.test.mjs:569,741,854`); no command calls it. | (a) its uses part goes; tests need only listings |
| `firstPlaces` | `notice.mjs:33-39` | 7 | First six places of a not-followed reason. | (a) |
| `addsName` | `notice.mjs:41-42` | 2 | Whether the users' code after the change must be read for uses (a new or renamed name). | (a) |
| `TELLS`, `renameHandles`, `known`, `knownDecl`, `diffListings` | `notice.mjs:44-192` | 148 | Compares two listings entry by entry and gives each changed entry its word; the softenings (decision B, F1's backstop). | (d) the heart of "what changed"; F1 is mended here or by the provider's job stating changes |
| `describe` | `notice.mjs:194-206` | 13 | An entry in printable form. | (d) |
| `makeConfirm` (rule 52) | `notice.mjs:208-288` | 81 | Asks TypeScript's checker whether "accepts more" holds. Its non-staged path (`perModule` false) is only reached from `wholeReading`, which no caller uses. | (d) |
| `partsThatDiffer` | `notice.mjs:290-301` | 12 | The before/after parts in a reason. | (c) |
| `notice()` | `notice.mjs:303-324` | 22 | Picks the whole or staged reading; the whole branch (:312) is never taken by any caller (all pass trees or folders). | (b) becomes: provider listing before/after, then lookup |
| `wholeReading` | `notice.mjs:326-339` | 14 | The reading over `analyse()` results. Dead in production and tests. | (a) |
| First-comments step | `notice.mjs:354-363` | ~10 | A comments-only first step of a module without comments tells no one (`commentsOnly`, `check.mjs:669-751`). | (d) |
| `compare` and the passers loop | `notice.mjs:365-398` | ~34 | Lists and compares the provider, then every module in `R.mayChangeThrough` (the passers); rule 52 on each "accepts more". | (d) for the provider; for passers see 1.4 |
| Route 4, new operation answered by a second module | `notice.mjs:399-412` | 14 | A new `op:x` that another module already answers marks that module's `op:x` as changed. | (d) the detection stays (it is a "what changed"); its users become a lookup of the other module's `op:x` |
| `namesAfter` | `notice.mjs:413-418` | 6 | Whether to read users' code after the change. | (a) |
| Users loop, route 1 (and 2) | `notice.mjs:419-441` | 23 | For each later module that the staged reader read, for each changed module older than it: each changed entry that tells and that the user's uses (`usage.mjs`) hold gives a reason with its places. | (b) the lookup: users of (module, entry) from the uses files; reasons carry files instead of lines |
| "Not followed fully" | `notice.mjs:442-458` | 17 | For a declared provider: the four causes (no use found; an "anything" read anywhere; unreadable operation name; unreadable table name); then `narrow.mjs` decides which changed entries tell. | (a) — but a small fallback is needed for a module whose uses file is missing or unreadable (tell it of every telling change of each declared provider), a few lines |
| Told / not told / summary | `notice.mjs:459-467` | 9 | Collects the reasons; the undeclared-use note. | (b) rewritten with the lookup; the "undeclared" note becomes "the uses file names a provider the module list does not declare" (or goes, see 4) |
| `noticeText` | `notice.mjs:470-496` | 27 | Prints the notice. | (c), one line for not-followed reasons goes |
| `usage.mjs` | `usage.mjs:1-216` | 216 | Asks the type checker what every name, member read, object field, taken-apart member, argument and carrier call in a user's files resolves to; the smallest listed entry range that holds the declaration is the entry used (`entryOf`, :24-38). Also lists "anything" reads (cause 2, :198-204), unreadable operation and table names (:179-188), `named` and `asValue` flags, undeclared providers. | (a) from the notice. It could instead move into the job's own `check` as a cross-check of the uses file (one program, the module's own files plus its providers' interface files, which `check` already builds at `check.mjs:390`) |
| `narrow.mjs` | `narrow.mjs:1-126` | 126 | Decision 3B: for a not-followed user, a changed function, method, value or class member tells only if its files name it as text (`namesIn`, :43-50, F4), or it reaches the provider unreadably (`opaqueWhy`, :53-81, F3), or a module in its reach hands the entry on as a value or takes the provider whole (`passedOn`, :98-123). | (a) |
| `carriers.mjs` | `carriers.mjs:1-74` | 74 | Reads the name a carrier call carries (`@carriesop`, `@carriestable`). | (c) still used by `check.mjs:13`; its use by `usage.mjs` goes |
| `listing.mjs` | `listing.mjs:1-351` | 351 | A module's listing from its interface files: every entry, ranges, bounds, throws, operations, tables, declarations as printed (the backstop), with the plain-kinds cache (`plainKinds`, :43-91). | (d). Its `ranges` exist only for `usage.mjs`'s `entryOf` and would go (a few lines) |
| `canon.mjs` | `canon.mjs:1-285` | 285 | The canonical form of a kind; `same`, `standsIn`, `render`. `paramOptional` (:163-172) is F6. | (d) |
| `model.mjs`, `ts.mjs` | 91 + 187 | 278 | The product's module list and files; the reader's settings, programs, tags, `declarationsOf`. | (c) |

### 1.3 The staged reader (`staged.mjs`, 305 lines) part by part

| Part | Lines | What it does | With a uses file |
|---|---|---|---|
| Header, constants | 1-40 | Describes the stages; `SPECS`, `COMPUTED`, `CARRIER`, `OWNS_NAMES`, `REEXPORT`, `BATCH`. | ~10 lines of the header (a); the rest (d) |
| `ownPackage` | 42-45 | The product's package.json. | (c) used by `check.mjs:14` |
| `makeReach` | 47-101 | Text scan of imports, relative paths only; own-name and `#` imports are "cannot follow" (:61, F3 kind 1, M1); a computed import anywhere in the text makes a file unresolved (:36,70, F3 kinds 2 and 3). | (d) only for flagging modules that own operations or tables (:235-245); its "unresolved" result has no consumer left |
| `makeHost`, `heldBy` | 103-138 | Programs of one side share parsed files; the files a batched module's own program would hold. | (d) for the provider's and passers' listings |
| Setup, `listing()` | 140-172 | Two sides, caches; a module's listing from a program over its source files. | (d) |
| `closureOf`, `reaches`, `unresolvedIn`, `reachesCarrier` | 174-192 | What a module's files reach, by relative path; whether it reaches a target module, an unreadable import, or a carrier. | (a) for candidates; for passers replaced by the lookup (see 1.4) |
| `usesFrom`, `usesAfter` | 194-215 | Runs `usage.mjs` over a user's program. | (a) |
| `filesChanged` | 217-228 | Whether a user's own files changed (to read its code after the change). | (a) |
| `prepare`: passers | 232-234 | Passers = every later module whose **source** reaches the provider by relative imports (route of F5; M1 misses own-name importers). | (b) lookup, see 1.4 |
| `prepare`: flags, `opsInPlay` | 235-251 | Modules whose source holds `@optable` / `@storedrows` (or re-exports such a file); operations or tables are "in play" if the provider or a changed passer has them. | (d) route 4's detection |
| `prepare`: candidates | 252-256 | A later module is read as a possible user if it reaches a module that may change, declares one, has an unreadable import anywhere in its reach, or reaches a carrier while operations are in play. | (a) — this is where most of the 40 minutes and 8 GB went before the 25 Nov cache |
| `prepare`: after side, batches | 257-283 | Reads users and passers in batches of 20, side B then side A. | listing of passers (d); reading of users' uses (a) |
| Returned interface | 285-304 | `mayChangeThrough`, `isCandidate`, `uses`, `readsAfter`, `opListings`, `release`. | `isCandidate`, `uses`, `readsAfter` (a) |

### 1.4 The passers ("changed through", F5)

Today the passers are found by import reach (`staged.mjs:234`), listed before and after, and compared like the
provider (`notice.mjs:398`); users of a passer's changed entry are told (route 2), and passers' not-followed declarers
too. This is a "what changed" question about the passer (does its listing differ because of P?), plus a "who uses"
question (which modules might pass P on). With a uses file there are two ways:

- **Variant 1 (recommended to design): passers chosen by lookup, their listings still compared.** A later module can
  pass on a changed entry of P only if its uses file names that entry (or another changed entry of a module changed
  through P) in its **code**. Taken in module order, that is the passers set; each is listed before and after as now.
  Users of a passer's changed entry are then a lookup too. This needs no user to know about P, and the canonical form
  helps: a plain-data kind is written out in full wherever it appears (`canon.mjs` header), so a change to `P.Row`
  shows in `P.make`'s entry and in `Q.rows`'s entry, and the modules naming those are found. It is much smaller than
  today's reach set (only modules that use a changed entry, not all that import P), and it closes M1 (own-name
  importers are found by the file, not by path).
- **Variant 2: the uses file also records provider kinds received through a middle module** (U reads `row.name` from
  `Q.rows()`; U's file names `P.Row`). Then passers' listings need not be read at all (about 80 more lines removable,
  and the costliest reading gone), but each job must know which earlier module a value's kind comes from, and a miss
  there is silent. Variant 1 asks less of the job.

## 2. The merge wait

| Part | File:lines | Lines | What it does | With a uses file |
|---|---|---|---|---|
| `jobWaits` | `commands.mjs:314-339` | 26 | Refuses where a notice came after the tests; then, for each module the job uses earlier in the order, an open, unblocked job holds it. Reads at the tranche branch's newest commit and the job's head. | (c), calls the lookup instead |
| `merge` | `commands.mjs:341-363` | 23 | The owner's hold, the wait, one merge. | (c) |
| `uses.mjs` | `uses.mjs:1-147` | 147 | `makeFollow` (:42-95): `staged.mjs`'s relative-path scan plus its own resolver for own-name and `#` imports (:17-63, the third resolver of audit NA1). `usesOf` (:103-129): direct uses = modules reached by imports from all the module's files, plus declared; closed over those modules' own uses; union over the given commits. `earlierUsesAt` (:137-147): writes the commits out and keeps the earlier modules. Text only, no reader; fast. | (b) direct uses = the providers named in the module's uses file (code or tests), closed transitively over the providers' own files, read at both commits. Its import scan is cheap and mechanical; keeping it as a union with the file costs nothing and covers a provider the job forgot. The design says the wait reads uses "as the notice reads them" (design part 2 §8), so the text changes either way |

Module level suffices here; the entry level of the file is not used.

## 3. The related tests of a told job

| Part | File:lines | Lines | What it does | With a uses file |
|---|---|---|---|---|
| `decideScope`, told branch | `scope.mjs:58-72` | 15 | Calls `relatedList` with the job block's `uses` (the notice's reasons); a failure is the whole module. | (c) |
| `relatedCmd` | `notify.mjs:257-280` | 24 | The same list from the session. | (c) |
| Step 3, not followed → whole module | `related.mjs:80-85` | 6 | Any `notFollowed` reason relates every test file. | (c) kept for the fallback (a module with no uses file, or a reason cut by `fitReasons`, `noticecomments.mjs`) |
| Place targets | `related.mjs:178-186` | 9 | Each place (`file:line`) in the reasons, mapped through the pull request's diff, marks the piece that holds it. | (b) from the uses file's files: a test file named as using the changed entry is related itself; a code file named marks all its pieces (or its top) as targets. Coarser than lines; lines in the file would go stale at every edit |
| Pieces, call graph, reaching, steps 1 and 2 | `related.mjs:87-176`, `:188-222` | ~130 | Build text 5 §7's call-following inside the module, and "losing the thread". | (c) still needed for "reaches a code file that uses the entry" and for the job's own changed lines. Could be cut to file-level import closure if the owner accepts coarser lists; unproven either way |

The test record and `ready` do not compute uses (they read `notice_seq` and the related scope).

## 4. The check of declared uses, the order rule, and the module list's `uses`

The module list's entry (`build/02-the-forms.md:51-74`) has five fields; `uses` is "its declared uses, by name"; the job
may change only its own entry's `uses`. "A module may use only modules before it" reads: every name in `uses` stands on
an earlier line of the order file.

| Part | File:lines | Lines | What it does | With a uses file |
|---|---|---|---|---|
| `importsOf` | `check.mjs:572-589` | 18 | Every import a file makes: import/export from, `import()`, `require()`, `@import`, `import('…')` in comment kinds; a computed one is "cannot tell". | (c) |
| `makeOwnName` | `check.mjs:591-615` | 25 | Own-name imports resolved with TypeScript's resolver (the second resolver of NA1). | (c) |
| `declaredUses` | `check.mjs:617-667` | 51 | Refuses a declared use not before this module (:645-653); refuses an import of another module's file that `uses` does not declare (:654-661); a declared use with no import seen is "cannot tell" (:662-666). | (c), extended to the uses file: refuse a provider in the file that is not earlier; refuse an imported module the file does not name; "cannot tell" for a named provider with no import. With the program `check` already builds (providers' interface files included, :390), it can also refuse an entry name the provider's listing does not have, which keeps names matching `diffListings`'s (`Kind.member`, `Class#member`, `op:x`, `table:t`, `<file>:<name>`) |
| `ownProgram` | `check.mjs:390` | 1 | The check's program: the module's files and its declared providers' interface files. | (c) reads the providers from the file or the list |
| Other declared-`uses` readers | `notice.mjs:430`, `staged.mjs:254` (notice: declared providers for not-followed and candidates); `walk.mjs:141-142` (`walk areas`: users of a changed module that names no area) | — | | the notice's two go with (a); `walk.mjs` (b) a lookup or kept on the list |

Whether `uses` in the module list stays: it becomes derivable (the providers named in the uses file). Keeping both
means a check that they agree; dropping `uses` changes build text 2 §3 and the order rule's wording.

## 5. The earlier cache of uses (25 Nov)

- **What was built.** In PROCESS #12's session (25 Nov ~02:20Z) a worker, measuring `notify`'s slowness on two synthetic
  civicsmith-shaped products, built option D, "the owner's uses file": at each job, the tool's own inference
  (`usage.mjs` over the module) written to a file, which `notify` then read instead of type-checking users. Recorded in
  `../notify-slow-early-provider-25nov.md:92-95` and `process/design-decisions-2.md:263`.
- **What it showed.** Made at the before commit it gave identical answers, at about 0.75 s per module at the job.
- **Whether it is in the tool.** No. Its scripts were in the session scratchpad (`notify-prof/`, "not kept"). The tool
  commit of that work, 2fd92cd ("decision B"), took the other measures: the plain-kinds cache (`listing.mjs:43-91`,
  `staged.mjs:16-17,151`), batches of 20 (`staged.mjs:14-15,268-279`) and reading users' code after the change only when
  needed (`staged.mjs:18-20,257-259`). No file, field or code in the tool names a uses file.
- **Why it went stale.** It cached what the tool inferred, and the inference depends on the user's whole import
  closure: in plain JavaScript with `checkJs`, a value's kind is inferred from the provider's code. A merge of an early
  provider changes every later module's closure, so every file written at an earlier job is stale at the next such
  notice, and `notify` must read them all again. With the cache, `notify` was already about 40 s on the synthetic
  product, so D "adds little". It also inherited the inference's faults (F2, F3: "not followed").
- **Why the proposal differs.** The new file is written by the job from what the code is meant to use; it changes only
  when the user's code changes, or when a provider removes or renames an entry, which the notice itself tells (a removed
  entry tells its users by the old name, so the lookup still finds them, and their jobs update the file).

## 6. Using a provider without naming it, and how the tool handles each today

| Way | Example | Today | With a uses file |
|---|---|---|---|
| A value or kind through a middle module (passer, F5) | `Q.rows()` hands back `P.Row[]`; U reads `row.name` | Typed: the checker resolves `row.name` to `P.Row`'s property, so U uses P (route 1, "uses P without declaring it" note). Q's listing compared "through" P if Q's **source** reaches P by relative path (`staged.mjs:234`); not if by own name (M1). Untyped: U reads "anything"; if U declares P it is not followed (cause 2), narrowed by `passedOn` (`narrow.mjs:111-123`); if not, only route 2 through Q | Variant 1: U's file names `Q.rows`; Q is a passer by lookup; Q's changed `rows` tells U. Variant 2: U's file also names `P.Row` |
| A function or handle handed along | a store from `createStore` handed to `createRooms`; a provider function passed as a callback | `matchMembers`, `handedOnAsValue` (`usage.mjs:114-145`); `passedOn` in narrow. Accepted miss: a callback from a module U does not reach (build text 5 §6) | The job names the members it calls on the handle (`Store.get`), since a handle kind is written by name only and each member is its own entry (`canon.mjs:6-8`) |
| Operations called by name through tables (design part 2 §7 rule 5) | `door.call('op=quote&…')`; `@optable` on the provider, `@carriesop` on the door | `carrierOf` reads a literal name (`carriers.mjs:15-74`); `usage.mjs:182-184` maps it to `op:x` of whichever module lists it (only listings given: provider, passers, flagged when operations are in play); an unreadable name is cause 3. A new name answered by a second module is route 4 (`notice.mjs:399-412`) | The job names `op:x` of the module that answers it. Route 4 detection stays; its users are a lookup. A carrier's bound that does not reach the operation (proof T02) is still missed unless the job also names the handler |
| Tables of the shared store | `@storedrows`, `@carriestable` | As operations; cause 4 | The job names `table:t` |
| Re-export | Q: `export { f } from P` | The checker resolves the alias to P (route 1); Q's listing lists `f` and changes through P; narrow treats a re-export in U's reach as opaque (`narrow.mjs:72-77`) | Names `P.f` or `Q.f`; both found (Q.f through Variant 1) |
| Import by the product's own name or imports map | `import 'civ/words'`, `#util` | Notice: "cannot follow" (`staged.mjs:61`): always a candidate, opaque for every provider (F3), never a passer (M1). Check and merge wait follow it with their own resolvers | Not needed by the notice; check and merge wait still resolve (one resolver, audit NA1) |
| Computed import or require | a test helper's `import(p)` | Unresolved: always a candidate, opaque everywhere (F3 kind 2); related step 2 | The job names what the loader loads |
| Reading another module's file by path | `limits.json` read by code and tests (proof U06) | Invisible to `usage.mjs`, to `check` ("cannot tell" for a declared provider), to the merge wait. Notice: a declared provider with no use found is cause 1; undeclared is missed | The job can record it, but a data file is not a listing entry: the file needs a form for a use outside the listing (a named file, or "the whole module", told of every telling change). Its change is also outside the listing ("what changed") |
| Running another module's program by path | billing spawns meter and reads its messages (proof A04, W01, W02, U05, T05, T09) | As above. A04: meter's `MeterMsg` changed in a way that tells, billing uses it by reading meter's output, never imports it: missed | The job names `MeterMsg` (A04 caught). Behaviour of the program not in the listing (ready line, environment, pretty-printing) is still the other half |
| Names built from pieces, computed members | `obj[name]` | "anything", cause 2; accepted miss in narrowing | The job names the entries |
| A kind renamed, shape unchanged | proof U10 | Tells only users that **name** it (`usage.mjs` `named`, `notice.mjs:439`); front uses it without naming: missed | The file needs a "names it" mark, or every listed user is told (slight over-telling) |
| Shared registries, environment, globals | a registry each module fills (`DECLARED_OPS`-like), `process.env` | Not seen; F4 counts a module's own `DECLARED_OPS` as naming every other's | The job names the registry entry if it is a listed entry |

## 7. Tests that exercise each part

| Part | Tests |
|---|---|
| Users found by the reader, reasons with lines (route 1) | `notify.test.mjs:120,157,194,216,235,276,406,442,458,553,830`; the proof |
| Staged candidates and reach | `notify.test.mjs:327` (insides only: no later module read), `:344` (no import path: not read; unreadable import: read) |
| Not followed, narrowing | `notify.test.mjs:577` (cause 1), `:862` (3B), `:897` (first six places); the proof (25 not-followed reasons) |
| What changed: diff, confirm, known, entries | `notify.test.mjs:473` (rule 52), `:511` (unknown becoming known), `:540`, `:553` (same-name entries), `:830` (class member bound); the proof |
| First-comments step | `notify.test.mjs:742` (`commentsOnly`); the proof's `firstCommentsStep` answers |
| Declared uses and order (check) | `notify.test.mjs:628,648,751`; `scope.test.mjs:98` (check before tests); the proof's `refuses` |
| Merge wait | `commands.test.mjs:243-311` (by import, by declaration, through others; a use the head newly imports), `:313` |
| Related tests | `related.test.mjs:78-132` (places, changed lines, steps 1-3), `:144-176` (scope and command) |
| Notice reasons into job blocks | `commands.test.mjs:107,122` (open copies reasons), `notify.test.mjs:157-302` |
| Walk users | `walk.test.mjs:113` (a changed module naming no area: its users' areas, by declared uses) |

Every notify test fixture would need uses files for its users; the tests at :327, :344, :577, :862, :897 test parts
that go.

## 8. What the proof relies on

`tool/test/notice-proof.test.mjs` (30 lines) replays 150 recorded changes (9 series, plus `setups` applied as "before")
over `fixtures/notice-proof/product` (12 modules: text-rules, money, calendar, store, rooms, bookings, door, meter,
billing, front, reports; each with a module entry and declared `uses`; mostly commented). `notice-replay.mjs` (79
lines) builds before and after folders, runs the staged `notice()` (as `notify` does), then `analyse(after)` only to make
one program for `check`, and `check()` of every module from the provider on. It asserts, per change, `told` (each told
user with reason strings: `"<module> <entry>: <words>"`, `"<module>: not followed fully"`, `"note: uses X without
declaring it"`), `refuses`, and `firstCommentsStep`, against `expected.json`. `needs` (who truly needed a change) is
recorded but not asserted.

- With a uses file, the proof's product needs one for each of its 11 users, and each change that edits a user's code
  needs its updated file; the 25 not-followed reasons and 5 undeclared notes would change, so the answers are
  re-recorded on purpose (rule 54).
- **Told without need: 62.** Of these, 11 users are told only as not followed (a uses file removes them if correct), 12
  have an entry reason as well, 39 are told only through an entry they really use (a uses file keeps them; only "what
  changed" can drop them). No user that needed telling is told only as not followed, so dropping the fallback loses
  none in the proof.
- **Needed and missed: 45**, measured by replaying the 45 cases with the current tool: in 40, the provider's listing
  does not differ at all (behaviour under an unchanged kind, a constant or a JSON value changed, a separately run
  program's output, a comment forgotten, a method that now needs its handle, a module without comments changed); in 2
  (X01, Z07) the change is a confirmed "accepts more", which tells no one by rule; in 3 the listing tells but the user
  is not found: A04 (billing runs meter, never imports it), U10 (a rename tells only users that name the kind), T02 (a
  bound on `Bookings.quote` does not reach the operation billing calls through the door). 5 of the 45 are caught by
  the user's own check at its next job. A complete uses file could reach at most A04 and U10 (T02 only if billing's job
  names the handler). The rest need the other half: the provider's job saying which entries changed in domain or range.

## 9. Points for the design that follow from the map

- Entry names in the file must be the listing's (`p4 listing <provider>` gives them); the check can refuse an unknown
  one from the program it already builds.
- A module with no uses file yet (the move of civicsmith, a new module) needs a stated fallback; the smallest is today's
  cause 1 ("declares P, no use known": told of every telling change of P), and related step 3.
- Files, not lines, in the file: the related list then works at file level for places.
- The notice's reasons change shape (files, not lines); `fitReasons` and the job block are unaffected.
- The merge wait gains nothing in correctness from dropping its import scan; a union is the safe choice.
- The cost of a notice after the change: two listings of the provider (one program over its closure each), plus
  listings of the passers the lookup picks (Variant 1), plus reading about 200 small files; no user is type-checked.
