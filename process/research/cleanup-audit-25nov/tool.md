# Cleanup audit of the tool, 25 Nov 2026

Scope: `git diff 3b80c61..HEAD -- tool/` (21 commits, 30 files, +2660/-324; tool/lib/ +1,700 lines). Read-only: this audit changed no tracked file. Line numbers are those at HEAD. Ratings: **now** (worth cleaning now), **later**, **leave**.

Checks made: none of the files' named imports go unused. `workflowRuns`/`failedRuns` were removed cleanly. The workflow shim calls `run verdict` only (`shims/module-tests.yml:89`).

## tool/lib/notify.mjs

- **N1. Size cutting done twice, with different steps (duplicated logic, patch-on-patch). Rating: now.** `toOpenJobs` fits a notice into a job block in three steps: `[reasons, reasons.map(cutReason), [tooMany]].map(bodyWith).find((x) => x.length < NOTICE_LIMIT)` (160-161). `noticeParts` in noticecomments.mjs fits the same reasons into comments with its own loop and only two steps (whole, then `cutReason`), and then fails (noticecomments.mjs:50). A third bound sits in notice.mjs (`firstPlaces`, at most 6 places, notice.mjs:39), and it covers only the places of a "not followed" reason. A reason's `lines: [...u.lines]` (notice.mjs:440) has no bound at all. So one rule ("a notice's reasons fit what GitHub takes") is spread over three files, each with its own measure.
- **N2. A size-driven path that leaves an open job without its notice. Rating: now (with N1).** `if (!body) { ... 'is too large to take the notice ...; it waits for its next job'); rest.push(t) }` (162). The design says a notice reaches an open job "at once", and a pass recorded before the notice no longer counts (part 2 §7). On this path the open job's pass still stands and the notice waits for a later job. The path is rare, because the `tooMany` step is tiny, but it differs from the design for a size reason, and part 6 §5 says the tool "refuses nothing for size".
- **N3. The "holds the notice already" check reads two places. Rating: later.** `names(blockOf(p), t) || (blockOf(p)?.data.work || []).includes(workLine(t))` (148). The second test covers job blocks written before `open` wrote `notices` (8b2854e, 25 Nov). Could a product still hold such data? Yes: civicsmith jobs opened from waiting work before 25 Nov, open or closed after a notify's merge, may hold it. It can go once the current tranche closes.
- **N4. Reading a job block, written again here. Rating: now (small).** `blockOf` (135-141) and `relatedCmd` (263) each parse `JOB_MARK` themselves. The same read is also at testrun.mjs:23 (`recordsOf`), commands.mjs:203 and commands.mjs:322, and round.mjs:71: six copies in all.
- **N5. A stale command left after the change (dead text). Rating: now (small).** `relatedCmd` still says `as the required run's step 3 picks them` (257) and `'The related list is empty: the required run passes at once.'` (279). The required run no longer makes a related list: a told job always needs its test record (build/01 §5; scope.mjs:59). The merged-result code (268-270) also repeats `scopeForPR`'s merge-tree/commit-tree code (testrun.mjs:44-46).
- **N6. Comments that carry decision history. Rating: later (with C-list item 7).** 117-127 ("the owner's decision of 24 Nov 2026, item 2 ... decision B of 25 Nov 2026, after notify 1350 and 1356 on civicsmith"), 182 and 198. "Decision B of 25 Nov" names five different changes across the tool: noticecomments.mjs:1, testrun.mjs:81, staged.mjs:13, notice.mjs:54 and this file. Read from the code, the label is ambiguous.

## tool/lib/noticecomments.mjs (new)

- **NC1. A refusal for size. Rating: now.** `if (!tryAdd(module, [cutReason(r)])) fail('... too large for one comment even without its before and after; the notice for pull request ${merged} is owed')` (50). One user whose single reason has very many `lines` makes the whole notify fail, for every user and every provider. This is against part 6 §5 ("It refuses nothing for size"). The job-block path has a fallback here (notify.mjs:160 `tooMany`); this path has none. See N1.
- **NC2. An old form read "for earlier records". Rating: later.** `if (Array.isArray(w.uses)) return w.uses;` (87) is for waiting-work entries written before the notice comments existed (396002c, 25 Nov). Could a product still hold such data? Yes: entries notify wrote on civicsmith before 25 Nov carry `uses` and stay until each module's next job opens. It can go once `state read waiting-work` shows none with `uses`.
- **NC3. A gate on `open`. Rating: later.** `if (!mine.length) fail('the notice from ... has no reasons for ${w.module} on its pull request; run notify ${n} again, then open')` (92). A missing comment stops the whole `open --module`, even for a job with other work. The design's answer where the tool cannot follow is that the whole module's tests run (part 2 §7, the three points). The fallback could be a "not followed" reason rather than a refusal.
- **NC4. Header with decision history and the incident (1-6). Rating: later.**

## tool/lib/notice/notice.mjs

- **NT1. One rule written twice, once on structure and once on text (patch-on-patch around the declaration backstop). Rating: later (medium).** The rule "an unknown kind becoming known tells no one" is `known(b, a)` on canonical forms (61-73) and `knownDecl(b, a)` (75-100). `knownDecl` is a word-by-word longest-common-subsequence aligner over the printed declarations, there because the "declaration changed (not classified)" backstop (ts.mjs:20, "for the backstop of rule 18") compares printed text. It carries its own size cut: `if (x.length * y.length > 4_000_000) return false; // too long to align: judged as a difference` (89). `known` is also applied in rename matching (renamed-kind detection, ~line 113) and in `ek` (~151). So three call sites and two engines serve one rule.
- **NT2. "Not followed" handling split between notice.mjs and narrow.mjs. Rating: later.** The guard `if (declared && diff.some((e) => e.tells !== 'nobody'))` (446) filters, then `diff.filter((e) => e.tells !== 'nobody')` (455) filters again for narrow. notice.mjs builds `why` (447-451); narrow.mjs works out its own reason (`opaqueWhy`, and `passedOn` returns a string) and throws it away (`telling` returns entry names only). The notice therefore says "told of X" but never why narrowing kept X. The comments at 442-445 and 452-453 restate the decision twice.
- **NT3. "Read the code after the change?" decided in two files. Rating: later (medium).** notice.mjs works out `namesAfter` over every changed module (415), then `ua = namesAfter || R.readsAfter(user) ? R.uses('A', user) : undefined` (426). staged.mjs works out `afterUses = opsInPlay || addsNames(provider, ...)` for the provider only (staged.mjs:260), lazily reads `usesAfter` when asked (296), and `readsAfter` adds `filesChanged` (298). `notice()` passes `addsNames` as a callback that runs `diffListings` again (316-317); the `differs` callback runs it a third time. `wholeReading` needs a stub `readsAfter: () => true` (335). This speed-up works but is layered on the reader rather than placed in one predicate.
- **NT4. `firstPlaces` / `PLACES_SHOWN` (33-39). Rating: later (fold into N1).** Its comment says it exists because "a reason without bound made a waiting-work record too large to write". The waiting-work record no longer holds reasons, so it is a size bound kept for a cause that is gone. It is still useful for readability.
- **NT5. noticeText additions (raises, channel, "may now be missing", ~476-481). Rating: leave.** These are plain output. The comment names "civicsmith notify 1356".

## tool/lib/notice/narrow.mjs (new)

- **NA1. Three different answers to "where does an import by the product's own package name go". Rating: now (to decide), medium risk.** narrow uses staged's `makeReach`, which marks such an import `UNRESOLVED` (staged.mjs:61). So `if (c.unresolved) { why = 'reaches an import the scan cannot follow'; ... }` (62) makes every user that imports the product by its own name fully "opaque", and the narrowing (design part 2 §7, decision 2) never applies to it. check.mjs follows the same import with the TS resolver plus a fallback (`makeOwnName`, check.mjs:599-620). uses.mjs follows it with a hand-written exports/imports-map lookup (`makeFollow`, uses.mjs:16-60). Whether civicsmith imports itself by name was not checked here. If it does, decision 3B saves nothing there.
- **NA2. A whole-exports scan and a re-export test written again. Rating: later (small).** The `WHOLE` loop appears twice in the file: `opaqueWhy` (65-67) and `takesWhole` (105). `REEXPORT_FROM.test(read(g))` (75) re-reads the file with its own regex, although `reach.scan(g).reexport` already exists (staged.mjs:82, with a slightly different regex).
- **NA3. Exports nobody uses. Rating: now (trivial).** `return { telling, namesIn, opaqueWhy }` (125), and `NARROWED`, `namesOf`, `kindOf` exported. Nothing outside the file uses them, tests included.
- **NA4. Header (1) "the owner's decision 3B of 25 Nov 2026". Rating: later.** "Design part 2 §7, decision 2" is the stable name.

## tool/lib/notice/staged.mjs

- **S1. Batching plus `heldBy` (123-144), `plainKinds` sharing and the `holds` parameter in listing.mjs. Rating: leave.** This is a performance change that keeps answers. `heldBy` reproduces what a per-module program would hold so the batched listing gives the same answer, which is complex but contained.
- **S2. Reading after the change split with notice.mjs. Rating: later.** See NT3.
- **S3. The header's points 4-6 (12-20) are history ("the owner's decision B of 25 Nov 2026; ... civicsmith took most of an hour"). Rating: later.** Points 4-6 say what the code does; only the history lines need trimming.

## tool/lib/notice/check.mjs

- **CK1. Work left after a refusal became "cannot tell" (dead weight). Rating: now.** Since a declared use with no import is never refused (686, "cannot tell"), the block at 667-689 can only drop a "cannot tell" note or change its wording. It still builds a lister over *every* module with all public files in the program, plus a usage reading (`const lister = makeLister(program, tree)`, 672), on each `check` run inside module tests, and it has its own out-of-stack backstop (675-678). This is the costliest part of `check` for a product with declared but unimported uses. The fix is to say "cannot tell" directly, or keep only the carrier test.
- **CK2. The `receivingOnly` mode threaded through `saidBy`. Rating: later.** `const receivingOnly = ASSIGNS.has(d.code) && !isTarget(e)` (328), then `receivingOnly ? [] :` (332), `if (!receivingOnly)` (337, 354), `if (receivingOnly)` (340) and `(!receivingOnly || EXPECTED_FROM.has(r.code))` (360). That is one mode switched at five places inside one function, rather than its own function for assignment complaints. The notice-proof fixtures cover it, so the risk sits in the refusal rules.
- **CK3. Comments 110-112, 324-327 and 624-626 repeat "(the owner's decision of 24 Nov 2026)". Rating: later.**

## tool/lib/notice/listing.mjs and ts.mjs

- **L1. `<file>:<name>` entries for one name exported twice (106-121). Rating: leave.** The correction sits where it belongs, and narrow's `namesOf` strips the prefix to match.
- **L2. Member bound lines (`memberOwnBounds`, 26-32). Rating: leave.** It is the right fix, in place.
- **T1. ts.mjs:104-105 `topColon`/`unbracket`. Rating: leave.** It is a regex repair of printed text for the declaration backstop, part of NT1's backstop. It would go if the backstop were narrowed.

## tool/lib/commands.mjs

- **C1. "Needs no test record" decided in three places, differently. Rating: now.** In `ready` (258-274), `scopeForPR(..., {related:false})`, then `if (s.scope !== 'nothing') fail`, then `if (noticeSeq(jobBlock) > 0) fail` (268-270). In `results` (288-289), `if (!record && !noticeSeq(jobBlock)) { try { ...scopeForPR... } catch { } }`. In testrun.mjs `verdict` (163), `if (s.scope === 'nothing') { ok = true ... }`, with no notice check at all. A job with a notice but no module file changed is refused by `ready` and passed by the verdict. One `needsRecord(scope, jobBlock)` in testrecord.mjs would serve all three.
- **C2. Part of a record check written again. Rating: now (small).** In `jobWaits`, `if (noticeSeq(jobBlock) > (Number(record?.notice_seq) || 0)) fail(...)` (324) repeats one clause of `recordStands` (testrecord.mjs:385). Lines 321-323 repeat `recordsOf` (testrun.mjs:21-25) word for word.
- **C3. `open` writes `not_this_tranche`, `uses` from `noticeReasons`, and `notices` (238-244). Rating: leave.** The data is right. The gate it inherits is NC3.
- **C4. `drop` (113-182). Rating: leave.** It is new, self-contained, and named in build/01b. The gate `fail('nothing to restore ...')` is an honest answer, not a check that stops work.
- **C5. Comments 260 and 316 carry decision history. Rating: later.**

## tool/lib/testrun.mjs, testrecord.mjs, scope.mjs

- **TR1. `verdict` (158-170). Rating: now (with C1).** `why = st.ok ? st.why : record ? st.why : 'no pass recorded ...'` (167) is a three-way ternary, two branches of which are the same value. See C1 for the missing notice clause.
- **TR2. The drop branch tested by its own regex. Rating: now (trivial).** `/^drop\//.test(branch)` appears twice (43, 90), although scope.mjs exports `DROP`. The base is fetched twice in one `p4 test`: `bringBaseIn` (91), then `scopeForPR` (38).
- **TR3. `bringBaseIn` pushes a merge commit from inside `test` (86-106). Rating: leave.** Design part 2 §3 names it ("brings up to the tranche branch's newest commit by a plain merge"). Note that `test` therefore writes to the remote branch.
- **SC1. The `related: false` mode in `decideScope` (scope.mjs:59-61). Rating: later.** It is a flag that makes the verdict call a told job "whole module" so that no reader runs on GitHub. What the verdict needs is only "nothing, or needs a record", which C1's single predicate would give. The wording at scope.mjs:70, `'its related list is empty: it passes at once'`, is stale in the same way as N5.
- **SC2. `run scope` / `run tests` / `runTests` (scope.mjs:136-157, p4.mjs `'run tests'`). Rating: leave.** The workflow no longer uses them, but build/01b:44 says they "remain, unused by the workflow". Removing them is a build-text change first.

## tool/lib/round.mjs

- **R1. Dead export. Rating: now (trivial).** `export function pickNext(view, states)` (174). After `chooseNext` (191) took its place nothing calls it, tests included.
- **R2. `scopeOf`/`workOf`/`finished` for the tranche's scope (26-47, ~107). Rating: leave.** The change sits in place. Comment 26 carries "decision D of 24 Nov 2026".

## tool/lib/uses.mjs (new)

- **U1. A copied regex and a reader of its own. Rating: later.** `const SPECS = [...]` (14) is a verbatim copy of staged.mjs:35 ("as staged.mjs reads them"). `pkg = JSON.parse(...package.json...)` (45) re-implements `ownPackage` (staged.mjs:44). See NA1 for the third own-name resolver.

## tool/lib/github.mjs, util.mjs, state.mjs, p4.mjs

- **G1. GitHub's refusal words reached two ways. Rating: leave.** The words sit in a mutable property on the function (`gh.refused`, util.mjs:57, 69). `markReady` reads it directly (github.mjs:47); state.mjs reads it through `gh.refusal?.()` (state.mjs:127). It is small, but a side channel.
- **P1. A stale help line. Rating: now (trivial).** `HELP.notify` (p4.mjs:126) still says the reasons go "into the waiting-work record". They now go into notice comments, and the record only names them.
- **P2. Optional call `ctx.gh.lastPRForBranch?.(...)` (p4.mjs:33). Rating: leave.** It only guards test doubles.

## Gates beyond the design (item 5), in one place

1. noticecomments.mjs:50: notify fails for size. This goes against part 6 §5.
2. notify.mjs:162: an open job is left without its notice for size. This goes against part 2 §7.
3. noticecomments.mjs:92: `open` refuses where notice comments are missing. The design names no such gate.
4. commands.mjs:270 compared with testrun.mjs:163: `ready` refuses a case that the verdict passes. The two are inconsistent, and neither goes beyond the design on its own.

No other new gate was found. The merge holds (`jobWaits`), the ready rule, the test record and the check's two refusals are all named in part 2 §§3, 6 and 7 and part 6 §5.

## A cleanup would do these 9 things

1. **One reason-fitting function** for both the job block and the notice comments, with one degradation order: whole, then without before/after, then lines capped "and N more", then one whole-module reason. It never fails and never diverts an open job's notice. This covers N1, N2, NC1 and NT4. *Medium size, medium risk.* The notify tests cover both paths.
2. **One "needs a test record" predicate** in testrecord.mjs, used by `ready`, `results` and `verdict`. It drops the `related:false` mode from `decideScope`. `jobWaits` calls `recordsOf` and uses `recordStands`'s notice clause rather than its own. This covers C1, C2, TR1 and SC1. *Small-medium size, low-medium risk.* It touches the required run's verdict.
3. **One job-block reader** (`jobBlockOf(comments)` in round.mjs or github.mjs) to replace the six copies (N4, C2). *Small size, low risk.*
4. **Drop dead code and stale text**: `pickNext`, narrow's unused exports, the `/^drop\//` copies, `relatedCmd`'s and scope.mjs:70's "passes at once" wording, and `HELP.notify`. This covers R1, NA3, TR2, N5, SC1 wording and P1. *Small size, very low risk.*
5. **Cut the expensive tail of `declaredUses`** (CK1). It can now only change a "cannot tell" note, so either say "cannot tell" directly or keep a carrier-only test without listing every module. *Small size, low risk.* It changes only cannot-tell notes, and makes `check` faster.
6. **One own-package-name resolver** shared by staged/narrow, check and uses. First decide whether narrow should follow self-imports or treat them as opaque, then update tests. This covers NA1, U1 and NA2. *Medium size, medium risk.* It changes who is told on products that import themselves by name.
7. **Rewrite decision-history comments** to say what the code does, with the stable design reference (part/section, decision 2). Any history belongs in the commit log. This covers N6, NC4, NA4, S3, CK3, C5 and R2. *Small-medium size, no risk.*
8. **One home for "read the users' code after the change"**: a single predicate in staged.mjs that notice.mjs asks, without the `addsNames` callback re-running `diffListings` (NT3, NT2's double filter). *Medium size, medium risk*, guarded by the notice-proof fixtures.
9. **Later, after the current tranche:** remove the old-form reads (N3's work-line test, NC2's inline `uses`) once a `state read waiting-work` on each product shows no entry with `uses` and no open job lacks `notices`. Consider whether the textual declaration backstop (NT1's `knownDecl`, T1) can be narrowed so that `known` alone carries the rule. *Small size (old forms), low risk / large size (backstop), high risk.*
