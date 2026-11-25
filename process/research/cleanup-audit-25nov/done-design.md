# Design cleanup: what was done for each finding of `design.md`

Branch `work/cleanup-design`, from main at 5bed017. Parts changed: 02, 03, 04, 06, 07, 10. Design set 127,224 bytes before,
127,295 after (part 2 gained the tranche scope moved from part 3). Every part's top line was checked against `wc -l`; part 3
is now 75 lines. Sizes and reading-set sums in `starting_texts/00-index.md` were re-measured; the table's sums were already
off by a few hundred bytes before this change (build texts had grown since they were last summed), and now match `wc -c`.

## The 26 findings

1. **Done.** Part 2 §6: a pull request not a job's is tested by ARCH's session "other than a dropped tranche's whose every
   file is the main branch's own (section 9; part 3, section 5)".
2. **Done.** Part 2 §9 has a new bullet, "The required run", naming three pull requests it passes at once: no module code or
   tests changed; the tranche's own into main; a dropped tranche's whose every file is main's own. Part 3 §5 now refers to
   it instead of restating it. The wording follows the record (decision C, 24 Nov): the required run passes the drop's pull
   request at once only when every file is main's own.
3. **Done.** Part 3 §5: "the requirement text ... stay as they are", and ARCH "puts back 'not yet met' only on each
   requirement whose met mark came from the dropped tranche (part 2, section 2)".
4. **Done.** Part 2 §6 states once what the check reads (every import written as a file path or by the product's own
   name) and what it cannot see ("a use that no import shows, such as an import whose path is built at run time, or
   another module's file read or its program run by a file path"). §7 (a declared use that no code makes) and §8 (the
   merge wait) now say "a use that no import shows (section 6)". "By path" no longer appears in part 2.
5. **Done.** Part 2 §3 step 1 is the home of the scope (decision D, 24 Nov): a requirement is work when not yet met and
   within the tranche's scope; the scope is all the work unless ARCH records a smaller one in the round record, rewritten as
   the tranche goes on, ending with the tranche; a requirement outside it waits. Part 3 §1 refers to it.
6. **Done (task item 5).** Part 7 §1, the row "The time a session can run one thing", gains only what was measured
   (`merges-held-for-notify-25nov.md`, line 10): "A command started in the foreground and then moved to the background was
   seen cut at thirty minutes." The two-hour figure for a command started in the background is left as it was; that file
   saw such a command run only about fourteen minutes, so it neither shows nor refutes it.
7. **Done.** Part 3 §1's second bullet removed; the first bullet says ARCH decides the scope, "recording it where the
   tranche holds less than all the work (part 2, section 3, step 1)".
8. **Done.** Part 2 §7 "What counts as a change" now holds the one rule: describing an entry is not changing it and tells
   no one, here or in a later module whose listing passes it on (first comments; a kind read as "anything" now stated);
   any other difference tells as before. The separate unknown-kind bullet and "a comment edited with no change to the
   listing sends nothing" are gone; the first-comments bullet keeps its step and says it is a description.
9. **Done.** Part 2 §3 step 3: "It takes a slot, in the order section 5 gives." §5 states the order, the owner's
   instruction putting a module ahead, and the one exception for a told job, once.
10. **Done.** Part 2 §6 is the home ("once, in the job's own session, by the tool, as one command of that session, which
    it waits for within its turn"; "the required run only reads that record"). §3 step 6 and part 4 §11 point to it; the
    last sentence of §7 "The scope" is gone (its "one required run, with one name" moved to §9); §7's open-job bullet
    keeps only "runs its tests again (section 6)". Part 6 §5's "read the record ... for the required run" is kept: it is
    the tool's act in its list, not the rule.
11. **Done.** "The tool cannot follow it, so it is told as point 2 below says."
12. **Done.** Part 2 §9 says the required run judges each pull request "with the tool at the version its base branch
    names". Part 6 §7: the second pull request is its own sentence, with "(part 2, section 9)" in place of the reason.
13. **Done.** Part 6 §5's list adds: honouring a tranche's recorded scope in what counts as work; bringing a pull
    request's branch up to the tranche branch before its tests; putting back main's module code and test files for a
    dropped tranche. "Set the scope of a pull request's tests" moved beside the test acts; the end now has one "and".
14. **Done.** "Required run" in part 6 §3, part 7 §4 act 10, part 10 §2 item 8.
15. **Done, see the list below.** Part 10 §4 item 9: "merges once, with the touched modules' tests run by ARCH's session
    (part 2, section 9)".
16. **Done.** Part 4 §4, round record: "The tranche, its scope where one is recorded, the round, ...".
17. **Done.** Part 3 §4: the account names "the tranche's scope where one is recorded"; the sentence left part 3 §1.
18. **Done.** Part 2 §2: ARCH puts "not yet met" back "on each one whose met mark came from a dropped tranche (part 3,
    section 5)".
19. **Done.** Part 2 §1: "the required-run workflow" added to the process's named files.
20. **Done.** The list in part 2 §7 is headed "Rules for the tool that finds the change"; the reference is "point 2".
21. **Done** with 12.
22. **Done.** Point 2 keeps the rule (told of a changed function, method or value only where it may use that entry:
    where its files name it or where it reaches the provider in a way the tool cannot read) and refers to build text 5,
    section 6 for the list of ways and the two accepted misses, which that section states in full.
23. **Done.** "The tool records the result on the pull request (its form is in build text 5, section 5)"; build text 5
    §5 holds the fields.
24. **Done** with 4. `require` and the import forms are left to build text 1b, command 18, which lists them.
25. **Done.** Part 4 §11: "A job runs its module's tests by the tool (part 2, section 6)." "Waits for it within its turn"
    moved into part 2 §6, its home, so nothing is lost.
26. **Done.** Part 10 §3: "within the time a session can run one thing".

Also done, from "Outside the window": 07:30 session numbers ("PROCESS sessions named themselves"), 07:55 and 07:56
dates and decision label, and 03:51 ("there is no end-of-tranche sweep"). Part 3 §5's "None of the tests runs on that pull
request" now points to part 2 §9; part 2 §3's "(part 2, section 8)" is "(section 8)".

## Left, for PROCESS

- **Trial item 9 (finding 15)** changes what the trial rehearses: the design now asks only the form with the touched
  modules' tests run, as part 2 §9 already rules. Build text 4 (section 3, stage 6, its first item) still asks both forms,
  "the second ... asked for by the one trial-only line of the process config (build text 2, section 7)". If PROCESS
  judges dropping the "none run" rehearsal a change of behaviour rather than a stale line, revert that one line and put
  it to the owner; otherwise the build texts' cleanup should drop the second form and the trial-only config line.
- **Build texts that cite old wording:** build text 5 §6 cites "the design, part 2, section 7, decision 2" (now "point
  2"); build text 1b, command 18 says "since a use by path is not read" (part 2 now says "a use that no import shows").
  Both for the build-text cleanup; no rule differs.
- **Not moved (no build text states it):** part 6 §7's "`latest-version`" command name is tool detail in the design, but
  build text 1b command 25 does state it, so it could go; left because it is not among the 26 findings. Part 7 §3's
  incident narratives (ROOT's archive refused twice with the checker's categories; "about fifty") and part 7 §4's "Act 10
  was done before act 9 on the trial" are evidence or history; left, as part 7 records measured harness facts.
- **"When the notice's method was proven"** (06:42, 10:25) names which recorded changes become the tool's tests and which
  forms win; it identifies a source rather than telling history, so it is left.
- **The two-hour figure** in part 7 §1 is not shown by any measurement read here; it is the harness's own stated limit.
  Whether to mark it unproven is for PROCESS.
