# Verification sweep: does the current process4 meet its design requirements? (19 Nov 2026)

Recorded by PROCESS (rule 3). The owner asked for "a set of workers to rigorously confirm
whether the current version of process4 meets all of its design requirements, and report
findings." Six workers ran in isolated worktrees against `main` at `9f4f640` (the tip before
option C merged as PR #32). Each read its slice in full and reported with file:line evidence.
Slices: (VW1) the tool vs design part 6 §5 + build texts 1/1b; (VW2) shared state + the
notice/following; (VW3) jobs, rounds, walks, release, account switch, required-run scope;
(VW4) roles + starting texts + reading maximums; (VW5) design internal consistency + the
decisions record; and a drafter that produced the owner-open review (now the "Process4 Open
Points" page).

## Headline

**process4 is sound.** The tool's own tests pass **105/105** (two workers ran them
independently after `npm ci` restores the pinned TypeScript 5.6.3). All 25 tool commands plus
the two `run` entries are implemented and behave as design part 6 §5 and build text 1b
specify. The shared state, the notice/following machinery (including the fault-D fix), the
job/round/slot/scope/release logic, and all eight role starting texts (within ≤10 rules and
the 4,096-byte filled limit) match the design. No critical defect was found. What follows is a
list of genuine but mostly minor gaps, ranked, each judged by rule 2 (correct what is broken;
add no test, gate, review or stop).

## Findings that become corrections (no rule change; mergeable under the standing direction)

1. **Broken cross-reference in the decisions record.** `process/design-decisions.md` (the
   "What a job reads before it builds" entry) cites "part 5, sections 6 and 50"; part 5 has
   7 sections. Intended: "sections 5 and 6" (the "50" is a line-number slip). *Fix: correct
   the citation.* (VW5-1)
2. **build text 1b command spec is stale.** `ready`, `results`, `close` still show
   PR-number-only signatures; the tool, the decisions record and `job.md` all carry the
   `--branch`/current-branch default from fix C + fault o. The tool is the faithful artifact;
   01b was not updated. *Fix: update build/01b's three command lines.* (VW5-2)
3. **"Not built" wording is now false.** build/01b:5 ("Nothing here is built") and design/06
   §5 ("Unproven: the tool is not built") predate the built tool. *Fix: reword to "built but
   not yet proven in a running process" (the tool is built; nothing is in force).* (VW5-4)
4. **Missing sentence break.** design/10 §3: "...not proven on Claude Code** in part 7 A
   session fetching..." needs a period after "part 7". *Fix: cosmetic.* (VW5-5)
5. **Research-file typo.** `round4-faults-19nov.md` cites "part 2, section 59" for the
   check-reads-tests rule; it is section 6 (line 59). *Fix: optional, a research file.* (VW5-3)
6. **process.md under-grants its lane acts.** The owner's approvals grant PROCESS "start,
   message, interrupt and archive its own lanes"; process.md lists only "Start, message and
   archive." *Fix: add "interrupt" (needs a small offsetting trim — process.md fills to 4,091,
   5 bytes under).* (VW4-2)
7. **The index is stale.** `starting_texts/00-index.md`'s raw-byte table is stale for 5 of 8
   texts and its "as filled" table never measured the now-tighter coordinator/process texts;
   self-declared line count off by one. *Fix: refresh the index tables.* (VW4-3)
8. **build texts 4 and 6 reference the old PROCESS-refresh mechanism.** build/04 stage 10 and
   build/06 §6 say ROOT starts/refreshes PROCESS; option C makes that the owner's act. *Fix:
   update both to match option C (read each in full first, per PROCESS rule).* (option-C ripple)

Several VW2/VW1 items are **no change**: VW2's three divergences (not-followed cause-1 reads
before+after; `state read standing-notes` shows the raw record while merge/next-job use the
live view; `errorAssertionSpans` matches the `assert.throws`/`.rejects` property form only —
the node:assert idiom) are all low-impact and consistent with intent. VW1's two notes
(`module-tests.yml` uses `if: ${{ !cancelled() }}`, documented as deliberate and
effect-equivalent to `always()`; `round.mjs` REQUIRED default constant, never reached because
every caller passes the repo-aware name) are harmless.

**VW4-4 is already resolved by option C:** the worry that `root.md` lacked `state write
--repository` to register a cross-repo PROCESS successor is moot — option C removes ROOT from
the PROCESS lifecycle entirely; PROCESS now registers its own liveness in its process-repo
record.

## Findings that are the owner's to settle (potential rule/design changes — not auto-fixed)

A. **Round-done can deadlock on a walk-flaw-only module (the one substantive gap).** If a walk
   flaw is placed against a module and that module's job finds the fix belongs elsewhere and
   closes unmerged, `finished()` never returns true (a walk-flaw module is "finished only by a
   merge"), yet `open --module` already stripped the flaw from waiting-work, so `next-job`
   never re-picks it and `round-done` reports not-done forever. design part 2 §4 explicitly
   sanctions this scenario ("the flaw goes back to ARCH, which places it against another
   module") but gives such a module no path to "finished" or to being dropped from the round.
   This is a latent gap in built round logic that only bites once walks run (stage 5,
   unproven). *This needs a design clarification + likely a small tool correction; it is a
   correction, not a new gate, so it fits rule 2 — but it changes round-done behaviour, so I
   will bring you options before building it.* (VW3 GAP 1)

B. **A lane cannot reach the coordinator, though lane.md rule 4 tells it to.** lane.md rule 4
   says a marked owner message to a lane "is passed to the coordinator exactly as typed for
   the record," but the lane's Acts grant only messaging ARCH, and design part 4 §3 routes all
   lane traffic through ARCH; the design never establishes a lane→coordinator channel (00-index
   already flagged "how an owner's marked message on a design page reaches the coordinator" as
   silent). This is the same underspecified area as the lane readings in open-point 7. *Resolve
   either by routing rule 4 via ARCH or by granting the channel — a design choice for you.*
   (VW4-1)

C. **No tool flag for the opt-in full external walk.** ARCH must hand-write `full:true` into
   the round record before `walk open`; there is no `walk open --full`. Consistent with "the
   tool judges nothing," so this is a convenience, not a defect. Adding a flag is an *addition*,
   so by rule 2 it is "no change" unless you want it. (VW3 GAP 2)

## Status of the fixes

The clear corrections (1–8 above) are being prepared as a bounded "verification + consistency
fixes" change, merged under the owner's standing direction (corrections, tool-tests green, no
rule changed). Items A and B go to the owner with options before any build. The sweep found
nothing that blocks the trial or the first real tranche beyond what design part 10 already
marks unproven.
