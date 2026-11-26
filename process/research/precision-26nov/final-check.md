# Final check: the tool, the build texts, the starting texts and the design agree?

PROCESS #17's worker, 26 Nov 2026, on `work/decision-c-design` at 398c1ce. Read: design part 2 in full, part 4 §4 and
§11, part 0; the four subjects of `process/design-decisions-2.md`; build texts 01, 01b, 02b, 02c, 05; starting texts
`job.md`, `arch.md`, `00-index.md`; the tool's files named in the brief and its tests. The tool's own tests: 253 of
253 pass (`cd tool && npm ci && npm test`). Experiments E1 to E8 were run against `notice()` on small made-up products
(script kept outside the repository); each result is quoted where it is used. Nothing was changed but this file.

## Findings, most serious first

**1. A provider's change that passes through a middle module's value or answer reaches no later user (a miss in the
design and the tool).** `takesIn` carries only a provider's errors and channels (design part 2 line 92; tool
`notice.mjs:471` `TAKEN`; `means.mjs:926-927`). A middle item whose value or answer is computed from a provider's
item is not changed when that item's value, bound or meaning changes. E1: `dates.LIMIT = 5 -> 6`; `orders.MAX = LIMIT * 2`;
`report.most = () => MAX`: told `orders` only. E2: a `@bound` on `dates.lim()` changed; `orders.m()` returns `lim()`;
`report` calls `m()`: told `orders` only. `report`'s uses file names only `orders MAX` / `orders m` (no route through
them, since a number is no provider kind). The told middle module changed no code, so by design part 2 line 125 it
closes unmerged and no merge ever tells `report`. This contradicts the safety paragraph (line 117: "every way its code
and tests can depend on a provider is a use its uses file lists").

**2. The job's session writes ARCH's job block, a second writer that can lose a notice.** `push --notice-nothing` and
`close --nothing-to-change` rewrite the `<!-- process4-job -->` comment from the job's session
(`commands.mjs:201-210`, called at `:191` and `:580`). Part 4 line 80 (one writing session per record) and line 145
("so each has one writer"), and build text 1b line 17 ("Each comment has one writer") forbid it. Race: `notify`
(ARCH's session) adds notice N+1 to the block (`notify.mjs:161-167`) between the job's read and its write; the job's
write puts the block back without it: its `work`, `uses`, `notice_seq` and `notices` are gone, `merge`'s check
(`testrecord.mjs:43`) passes, and a re-run of `notify` would add it only while the job is still open. Even without the
race, `--notice-nothing` records the block's count at the moment of the push (`commands.mjs:204`), so a notice that
arrived after the job read its block is marked as needing no change unseen. The write exists because the required run
reads only the job block and the test record (`shims/module-tests.yml:74-76`; `testrecord.mjs:34-36` reads the block's
copy), whereas build text 1 line 71 says the run reads "the job block, the job's record and the test record" and build
text 5 line 168 says the job's record's `notice_needs_no_change` is what counts. Build text 5's job block form (lines
129-142) has no `notice_needs_no_change`; build text 1b command 5 (line 17) does not say `close` writes it.

**3. A conversion tells no one of any change, not only of describing.** `notice.mjs:415,419` set `tells: !conversion`
for every item found by its means, removed items included; `:533` skips the second-answerer rule too. E4: at a
conversion, `dates.gone` removed and `LIMIT 5 -> 6`: told nobody (the same change outside a conversion tells
`orders`). Design part 2 line 97 makes only describing "not a change" at a conversion; a removal, a value, a bound,
errors or a type error still change. The decision record (`design-decisions-2.md:220`, "An item's first means, at its
conversion, tells no one") is worded more widely than the design; the tool follows the record. The test
`who-is-told.test.mjs:123` asserts the wide reading. One of the two texts needs to change.

**4. An earlier module with no uses file and an order fault is never told.** For a user with no uses file the tool
looks only at earlier changed modules (`notice.mjs:574-584`, `reachedModules` in `usesfile.mjs:198`); order faults are
read only from uses files (`:649`). E7: `dates` (first) imports `orders.m` (later); `orders.m` changes: with `dates`'s
uses file, `dates` is told; without it, nobody. Design part 2 line 107 (point 3, "each earlier module with an order
fault naming it") and line 117 ("an order fault, no uses file yet ... is told of every change it might see").

**5. A later module with no uses file that reaches a provider through a middle module is not told.** Point 3 says
"imports it" (line 107) and the tool reads direct imports only (`usesfile.mjs:163-232`). E3: `orders` re-exports
`dates.parseDay`; `report`, with no uses file, imports it from `orders`; `parseDay` changes: told `orders` only. With
`report`'s uses file (E6) `report` is told, through the route. Line 117's claim does not hold for this case; either
point 3 follows imports transitively or the claim narrows.

**6. "A new item, which no one uses yet" can still change a user.** E8: `orders` holds `export * from '../dates/...'`
and `export * from './own.mjs'` (which exports `x`); `report` imports `x` from `orders`. `dates` adds its own `x`: the
two star exports now conflict, so Node refuses `report`'s import; nobody is told (`fresh`, `notice.mjs:416`). S1
(build text 2c line 12) allows `export … from`. Design part 2 line 97.

**7. "Nothing where no running code changed" is not built.** `decideScope` (`scope.mjs:28-87`) has no comparison of a
file's text with comments and layout left out; any changed file under a module's paths runs that module. Build text 1
line 77 (step 3, "or none changes running code") says it does; design part 2 lines 55 and 127, and the owner's words
("no need for the module jobs to run tests when no code is being run", decisions lines 258-259). So a conversion that only
states types in comments runs its whole module, and a told job's comment-only edit runs its related tests.

**8. The mechanical-edit exception is built wider than the design.** `notify.mjs:247-255` spares any told module that
the merged pull request changed and whose test record ran whole, whatever the pull request; design part 2 line 115
names the mechanical edit only. Build text 5 line 180 states the wide form, so build text and tool agree against the
design. It reads the test record's `modules`, which build text 5's form (lines 162-166) does not list.

**9. A rule in no design text, built by reading users' code.** "`<module>` now answers the same name" (build text 2b
lines 72 and 114) is not in design part 2. The tool builds it by reading every other module's source and running the
checker over each that marks `@optable` (`notice.mjs:533-540`), against "who is told is a lookup with no user's code
read" (design line 99; decisions, "How `notify` reads the product", item 3). For modules with no uses file the tool
also reads their text (`notice.mjs:576`); that is unavoidable for point 3, but the design's "no user's code read"
should say so.

**10. Smaller rules built that no text states.**
- A Process4 version move rewrites every uses file written under another facility classification
  (`usescmd.mjs:94-101`); design line 99 names only the facility list.
- The related list runs the whole module for any reason that names no item: a `mock` or `package` reason
  (`related.mjs:86-87`). Design line 55 and build text 5 line 184 give the whole module only for no uses file or when
  the code cannot be followed.
- Describing reads only "any" as "anything" (`notice.mjs:64-65`); a stated `unknown` (`canon.mjs:56`) made specific
  tells, though design line 97 counts "one that admits every value". Over-tells only.
- A `--same` item tells no one, and so do the middle items that take in its errors or channels (`notice.mjs:544`
  feeds `takenIn` only telling items). Design line 119 ("takes off only that item") reads either way; one line would
  settle it.
- `branch --into` and `open --into <branch>` exist (`p4.mjs:49`, `commands.mjs:312`); build text 1b commands 1 and 3
  do not name `--into`.

**11. Words and fields: build texts against the tool.**
- Build text 2b's table (lines 103-114) uses `errors`, `data or instance`, `this`, `writes arguments`, `channels`,
  `type error`, `declaration changed`; the tool writes `errors that can leave it changed`, `plain data or instance
  changed`, `now needs its object as this`, `arguments written into changed`, `channels, settings or files changed`,
  `type error in its code`, and also `kind changed`, `may now be missing`, `value changed`, `meaning changed`; it never
  writes `declaration changed` (`notice.mjs:208-242`).
- Build text 5 §5 (lines 138-142): a reason's `found` may also be `any change`; reasons also carry `items`, `copy`,
  `namedBy` and `whole` (`notice.mjs:579,585,618`; `notify.mjs:164`), none listed. `whole` decides the related list.
- Build text 5 §6 point 4 (line 180) omits "each module with no uses file yet", which design line 108 and the tool
  (`notice.mjs:714-718`) both have.

**12. Stale "not built" in texts.** The means, the uses files, `uses`, the comparison and the related list are built
and tested (`what-changed`, `who-is-told`, `notify`, `related` tests). Still marked not built: build text 1b lines 26
(`listing`), 35 (`notify`), 58 (`uses`); 2b line 124; 2c line 5 ("Status: not built, not run"); 5 lines 175 and 190;
design part 4 line 83 ("The shared state is not built"; `tool/lib/state.mjs` builds it).

**13. History and dated clauses.** Design part 2 carries none beyond the dated source of the owner's quotation (line
68), which part 0 §1 allows. Elsewhere:
- Build text 1: line 5 "Written by Claude on 18 Nov 2026"; §1 (lines 9-24) is a history of what carried over from the
  earlier tool and what was dropped, "Two came back in another form"; line 14 "(the earlier second route ... is no
  longer tried)"; line 30 "5.6.3 was the version studied"; lines 33 and 118.
- Build text 1b line 13: branches "kept from an earlier process" and "The earlier form `job/<module>/<n>`".
- Build text 2c line 44: "It replaces R9" (and R9 is absent from the list).
- Build text 2b line 76: what "the proven tool" did.
- `starting_texts/00-index.md` §3 (lines 47-58), "What the earlier process recorded"; lines 9 and 28 "last measured
  25 Nov 2026".
No option lists were found in these texts; "Decided here" lines with gives and costs are the build texts' own mark.

## Item 1: where each rule of part 2 §6–8 is carried

Built as stated unless a finding above says otherwise.

| Rule (design part 2) | Where |
|---|---|
| Accepting more tells (line 95) | `notice.mjs:225`; tests `what-changed.test.mjs:84`, `notify.test.mjs:603` |
| A constant's value (line 90) | `notice.mjs:237`; `who-is-told.test.mjs:94` |
| Describing, only with code unchanged or at conversion (97) | `notice.mjs:64-80,223`; conversion wider: finding 3 |
| Type error, removed, named, declared (95) | `notice.mjs:240,415,421-431`; `notify.mjs:213-216` |
| New item tells no one (97) | `notice.mjs:416`; finding 6 |
| `same` takes off only that item (119) | `notice.mjs:433-436`; `notify.mjs:219`; finding 10 |
| Point 1, any route, middle items (95, 105) | `notice.mjs:611-622`, `takenIn` `:481-519`; finding 1 |
| Member exceptions (112-113) | `memberChanges` `:273`, `reaches` `:337`, `onlyInside` `:320`, `:611` |
| Meaning only, handed back (114) | `passedOn` `:362-388`; `notify.test.mjs:1102` |
| Mechanical edit (115) | `notify.mjs:247-255`; finding 8 |
| Point 2, marked and relabelled copies (106) | `notice.mjs:555-566,613-625` |
| Point 3, outside, `mock`, order faults, no uses file (107) | `:596-604,638-646,649-656,574-584`; findings 4, 5 |
| Point 4, packages, host, no uses file (108) | `versionNotices` `:703-727` |
| Lookup with no user's code read (99) | `usesOf` `:39`; finding 9 |
| Uses file rewritten at push, ARCH's change, list and facility change (99) | `usescmd.mjs:85-176`; finding 10 |
| Open job gets the notice at once; else waiting work (123) | `notify.mjs:135-180,262-274` |
| `push --notice-nothing`; recorded pass stands (123) | `commands.mjs:196-210`, `testrecord.mjs:34-43`; finding 2 |
| `close --nothing-to-change` pushes a rewritten uses file, else closes (125) | `commands.mjs:569-611` |
| Record stands for a head differing only in the uses file (56) | `testrecord.mjs:64-71`, `testrun.mjs:27-39` |
| Scope: whole, related, nothing, whole where not followed (55) | `scope.mjs:28-87`, `related.mjs:86-89`; finding 7 |
| Related tests by whole file (124) | `related.mjs:195-238` |
| Merge waits for open jobs of providers, in turn (147) | `commands.mjs:473-494` |
| A changed expected answer, or bound, declared by the job (83) | held by text (`job.md:20`), as the design says |

## Starting texts

`job.md` and `arch.md` name the commands and flags the tool takes (`push --meaning/--same/--notice-nothing`,
`close --nothing-to-change`, `test`, `ready`, `related`) and point to the design rather than restate it, except `job.md`
rule 6, which restates close's two outcomes; it agrees with the tool. `job.md` line 22 tells the job that its "recorded
pass stands" after `--notice-nothing`; under finding 2 that holds only for notices the job saw.
