# Audit of design changes, 3b80c61..HEAD (24–25 Nov 2026)

Scope: `design/` only. Nine merges touched it (first-parent): 9e0e296 drop tranche; 16914c5 tests once in the job (the
large one: parts 2, 4, 6, 7, 10); 67ce75c move order; b541972 tranche scope; fe4eed0 merging goes on during a notice;
cb43a64 tests on a branch brought up to the tranche; c443ae6 and 727094e decision 2 of the notice (727094e's PR is
titled "Research: a module's first comments" but carries the design change of the owner's "3b"); 7b27892 unknown kind
becoming known. Line numbers are at HEAD. Each finding was checked against the whole design for the old wording.

New-gate check: none found without the owner's word. The merge wait (part 2 §8, line 101) is a new hold on merging, but
the record (design-decisions-2, "Tests once in the job…") says it was added on his explicit word and named to him first.
The drop's "only when every file it changes is the main branch's own" is a condition for skipping tests, not a new check.

## Findings

### Contradictions

1. **Part 2 §6 (02:57) vs part 3 §5 (03:54)** — contradiction. 02:57: "A pull request that is not a job's and changes
   module code or tests is tested the same way by ARCH's session, each touched module whole." 03:54: the drop's pull request
   (not a job's, changes module code and tests) "runs none of the tests". 16914c5 added 02:57 after 9e0e296 added the drop,
   with no exception. Fix: in 02:57 add "other than a drop (part 3, section 5)", and state the drop's no-test rule only there.
2. **Part 2 §9 (02:109)** — stale. The list of pull requests the required run passes at once names only "no module's code
   or tests changed" and "the tranche's own pull request into the main branch"; the drop's pull request is missing, though
   part 3 §5 points to this rule as its home ("as none runs on the tranche's own pull request"). Fix: add "and on a drop's
   pull request whose every file is the main branch's own (part 3, section 5)"; cut the restatement from 03:54.
3. **Part 3 §5 (03:54), inside one bullet** — contradiction. "requirements files … stay as they are" and, two sentences
   later, ARCH "writes 'not yet met' on each requirement whose met mark came from the dropped tranche". Fix: "requirements
   text, the module list … stay as they are; only the met marks the tranche set are put back to not yet met".
4. **Part 2 §6 (02:61) vs §7 (02:84) and §8 (02:101)** — contradiction. 02:61: the check "reads imports by path … a
   declared use with no import it can see (one made by a path, for example) is 'cannot tell'". 02:84: "a use by path is
   not read"; 02:101: "A use made by a path and not declared is missed". "By path" means two different things. Fix: say
   "a literal import path" vs "a path built at run time" once, in 02:61, and use that wording at 84 and 101.
5. **Part 2 §3 step 1 (02:21) vs part 3 §1 (03:8)** — stale/contradiction. 02:21 is the home definition of "the module has
   work": "A requirement in its file is marked not yet met". 03:8 (b541972) redefines it: "a requirement not yet met is work
   only where the list names it". 02:43 ("every module that had work") and 03:15 inherit the old definition. Fix: move the
   scope rule into 02:21 ("…marked not yet met and within the tranche's scope, where ARCH has recorded one (part 3, section
   1)"); 03:8 keeps only that ARCH records the scope.
6. **Part 7 §1 (07:23)** — stale against a measurement in the window. Row: "Two hours for one command the session runs in
   the background". The evidence for fe4eed0 (research `merges-held-for-notify-25nov.md` line 10) records a command "cut by
   the harness's 30-minute limit on a command moved to the background". Fix: add "a command moved to the background after it
   started is cut at thirty minutes" to the row, or mark the two-hour figure unproven for that case.

### Appended beside an older rule / duplicates

7. **Part 3 §1 (03:8)** — appended. New bullet beside 03:7, which already says "ARCH opens the tranche and decides its
   scope" and "There is no single purpose to state". Two statements of one subject. Fix: merge into 03:7 as one bullet
   (and per finding 5, the "what is work" half goes to part 2).
8. **Part 2 §7 (02:75)** — appended exception. "A kind that was unknown and is now stated … tells no one" is a new bullet
   beside "What counts as a change" (02:70), "A comment edited with no change to the listing sends nothing" (02:71) and
   "That step sends no notice" (02:74) — three statements of one rule: describing is not changing. Fix: one sentence in
   02:70: "Describing an entry — first comments, or a kind read as 'anything' now stated — is not a change and tells no one,
   here or in a later module whose listing passes it on."
9. **Part 2 §5 (02:48) vs §3 step 3 (02:23)** — duplicate. "New jobs start, earliest in the order first, only while the
   slots in use are below the number" restates "Ready jobs take free slots, earliest in the module order first"; the
   told-job-above-the-number exception is stated at 02:48 and pointed to at 02:23 beside "Only the owner's marked
   instruction puts a module ahead" (rule plus bolted-on exception). Fix: step 3 keeps one line pointing to §5; §5 states
   the order rule and its one exception once.
10. **Part 2 §6 (02:56), §3 step 6 (02:26), §7 (02:73, 02:79), §9 (02:109), part 4 §11 (04:148), part 6 §5 (06:40)** —
    duplicate. "Tests run once in the job's session by the tool and are recorded" is stated in 02:26, 02:56 and 04:148;
    "the required run only reads the record" in 02:56, 02:79 and 06:40; "a pass before a notice no longer counts" in 02:56
    ("only on a pass recorded … after every notice") and 02:73. Fix: 02:56 is the home; 02:26 and 04:148 point to it;
    drop the last sentence of 02:79 and the second sentence of the notice rule in 02:73 except "the job runs its tests
    again (section 6)".
11. **Part 2 §7 (02:84)** — duplicate. The declared-use bullet restates decision 2 ("told of every change to a kind of that
    provider that tells any user, and of a changed function or value as decision 2 says"). Fix: "The tool cannot follow it,
    so it is told as point 2 below says."
12. **Part 6 §7 (06:67)** — appended. The move-order rule is inserted mid-sentence after an em-dash in an already long
    sentence ("merges it — where the new version's required-run workflow differs …, since the required run judges each pull
    request with the tool at the version its base names; then the sessions refresh"). The "since" clause is the only place
    the design now says which tool version the required run uses (16914c5 deleted "The tool, at the tranche branch's
    version," from 02:79). Fix: state "the required run uses the tool at the version its base branch names" in part 2 §9;
    in 06:67 make the second pull request its own sentence without the reason.

### Stale wording elsewhere

13. **Part 6 §5 (06:40)** — stale. The tool "does only this", but the list lacks acts added in the window: putting back the
    main branch's files for a drop (03:54, "ARCH, by the tool"), bringing a branch up to the tranche branch before tests
    (02:34), and recording and honouring a tranche's scope (03:8). The end of the list also reads "…; and, inside…; set the
    scope…; and, on GitHub's machines…" (two "and"s). Fix: add the three acts and tidy the list's end.
14. **Part 6 §3 (06:28), part 7 §4 act 10 (07:75), part 10 §2 item 8 (10:27)** — stale. "required test run" kept, though
    16914c5 renamed it "the required run" in 02:109 and it now runs no tests. Fix: "required run" in all three.
15. **Part 10 §4 trial item 9 (10:78)** — stale. "tried with the touched modules' tests run and with none run". 02:107 now
    settles it: "ARCH's session tests it as section 6 says". Fix: drop "and with none run".
16. **Part 4 §4 round record (04:73)** — stale. 03:8 puts the tranche's scope "in the round's own record"; the record's
    "Holds" column does not list it. Fix: add "the tranche's scope, where one is recorded".
17. **Part 3 §4 (03:46) vs 03:8** — duplicate/stale. 03:8 says "The account after each round names the scope"; the home
    list of what the account holds (03:46) does not. Fix: add "the scope" to 03:46 and cut the sentence from 03:8.
18. **Part 2 §2 (02:15)** — stale. Home of when ARCH writes "not yet met" names two cases; 03:54 adds a third (after a
    drop). Fix: add "and after a dropped tranche (part 3, section 5)" to 02:15.
19. **Part 2 §1 (02:9)** — stale. The list of "the process's own named files" omits the required-run workflow, which 06:67
    now has ARCH replace by pull request and 07:73 lists among the product's first Process4 files. By 02:9 it fits nowhere
    and must be "given to a module". Fix: add "the required-run workflow" to the list.

### History or provenance

20. **Part 2 §7 (02:84, 02:86–94)** — history (light). "by decision 2 below" / "as decision 2 says" (kept and re-edited
    by c443ae6 and 727094e) label the rules as the owner's numbered decisions. Fix: head the list "Rules for the tool that
    finds the change" and say "point 2".
21. **Part 6 §7 (06:67)** — history/reason. "since the required run judges each pull request with the tool at the version
    its base names" is a reason, which belongs in the background document (00:10). Fix: as finding 12.

No dates, decision letters, civicsmith, proof counts or tool file paths were added to the design text in the window;
these sit only in the decision record and commit messages, where they belong.

### Over-detail

22. **Part 2 §7 decision 2 (02:89)** — over-detail. The list of ways a user "reaches the provider in a way the tool cannot
    read" (whole exports taken, re-exports, carries its calls, hands the entry on as a value) and the "two misses accepted"
    are the tool's definition of "reaches", which part 10 item 12 says lives in build text 5. Fix: "Of a changed function,
    method or value it is told only where it may use that entry, as build text 5 defines; two kinds of miss are accepted
    there."
23. **Part 2 §6 (02:56)** — over-detail. "The tool records on the pull request the commit, the scope, the files run, the
    counts, and pass or fail" is the record's form (build text 5 §5). Fix: "The tool records the result on the pull
    request."
24. **Part 2 §6 (02:61)** — over-detail. "`require`, and imports by the product's own name" is the reader's implementation.
    Fix: "It reads every import form the language reader knows" (with finding 4's path wording).
25. **Part 4 §11 (04:148)** — over-detail and duplicate. "as one command of its own session, which may run up to the time
    a session can run one thing, and waits for it within its turn" repeats part 2 §6 and part 7's row. Fix: "A job runs its
    module's tests by the tool (part 2, section 6)."
26. **Part 10 §3 (10:47)** — over-detail (minor). "as one command of up to two hours" puts the Claude Code figure in a
    harness-neutral list. Fix: "within the time a session can run one thing".

## Verdict

Of the 9 merges, 3 were done cleanly: fe4eed0 (rewrote the open-job heading in place, one sentence in step 8), cb43a64
(rewrote 02:34 in place) and c443ae6 (rewrote decision 2 in place). Their only side effect is the tool list (finding 13).
6 were not clean:
- 9e0e296 left part 2 §2, §6 and §9 contradicting or stale.
- 16914c5 rewrote most sentences in place but left 4 stale places (findings 14, 15) and 3 duplicates (findings 9, 10, 25).
- 67ce75c was appended mid-sentence with a reason clause.
- b541972 was appended beside its own home rule and left 3 stale places.
- 7b27892 appended an exception as a new bullet.
- 727094e added over-detail and a restatement.

Counted by edit (about 26 separate sentence or bullet edits), about 15 were in place and clean and about 11 were not.
The owner's worry holds for the newest rules. The tranche scope, the drop, the move order, the unknown-kind exception and
the slot rule were each added as a new sentence or bullet beside an existing rule, not by rewriting that rule. Each of
them left the older home statement unchanged, so it now reads wrong or incomplete.

Counts by kind (26 findings, each counted once by its main kind): contradiction 5 (1, 3, 4, 5, 6); stale 7 (2, 13, 14,
15, 16, 18, 19); appended 4 (7, 8, 9, 12); duplicate 3 (10, 11, 17); history 2 (20, 21); over-detail 5 (22–26);
new-gate 0.

## Outside the window, noticed in passing

Pre-existing history in the design, not changed in the window: 07:30 "PROCESS #1, #4 and #5 named themselves"; 07:55
"measured 20 November 2026"; 07:56 "the owner's decision of 20 November 2026"; 03:51 "the testing policy is unchanged,
and no end-of-tranche sweep is added"; 06:42 and 10:25 "when the notice's method was proven".
