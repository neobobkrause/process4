# Tidy study: contradictions, things to combine, and shorter wording (25 Nov 2026)

Asked by the owner, through PROCESS: "study process4 to address (or confirm that they have already been addressed)
contradictions in the design, look for elements that can and should be combined, and try to identify texts that could be
more concise while not damaging their accuracy and adding ambiguity." His clarification, relayed by PROCESS: edits that
remove duplication, contradiction or ambiguity, stating exactly the same rule, are reviewed by PROCESS; a finding that would
change a rule or its scope goes to him, and is marked **changes a rule** below and not edited.

Read in full: `design/` (eleven parts), `build/` (nine texts), `starting_texts/` (nine files), `process/design-decisions.md`,
`process/design-decisions-2.md`. Branch `work/decision-c-tidy`, from `work/decision-c` at eeea14b. Two commits: the
contradiction fixes, then the combining and concision edits. No starting text changed; the record of decisions is not
edited (its findings are listed in section 4).

**Measured after both commits** (`wc -c`; `starting_texts/00-index.md` re-measured): ARCH's reading set 174,825 → 165,829
bytes (−8,996; 9,171 under the maximum); a job's 174,522 → 164,872 (−9,650; 10,128 under). The design 132,172 → 128,899.
Every governing text's top line was checked against `wc -l`. Largest single texts: design part 02, 23,041; build text 1b,
21,585 (under 24,000 for Codex). Starting texts unchanged (largest `process.md`, 6,014; at most ten rule lines).

Counts: 30 contradictions (18 fixed by edit; 12 open: 6 marked changes a rule, 1 the status for the owner, 5 for PROCESS to settle as fact or wording),
plus 6 in the record (not edited); 16 combinable (15 done); 14 concision items (9 done).

## 1. Contradictions

"Fixed" means edited in commit 1 (44ed1bf). "Open" means not edited.

| # | Where | Current words | What is wrong | Proposed words or action | Bytes | Why accuracy is kept | Status |
|---|---|---|---|---|---|---|---|
| 1 | Design part 2 §6 | "The owner approved two refusals, and no other is taken." ... "Only these two refusals stand; no other is built into module tests." | The bullet above it has the check refuse a use of a later module, a third refusal the owner approved (record, "What the check refuses", item 3). | "Beside the check of declared uses against the order (above), the owner approved two refusals, and no other is taken."; the repeated sentence removed | −7 | Same three refusals the record holds; nothing added | Open → fixed |
| 2 | Design part 2 §1 | "the process's own named files (... the process config, the module list, the product's two decision records ...)" | The facility list (`process/modules/facilities.json`, build text 2c) is ARCH's, but fits none of the three homes, so the design would have ARCH give it to a module. | "... the module list and the facility list, ..." | +22 | ARCH keeps it (part 4 §1, `arch.md`); it merges and is dropped as the module list is. PROCESS to confirm | Open → fixed |
| 3 | Design part 4 §6 | "ROOT starts the watcher as its first act after fetching." | §7, §11 and `root.md` rule 1: at a restart ROOT first archives every recorded session; started first, the new watcher would be archived. | "ROOT starts the watcher before the other roles, after fetching and, at a restart, archiving (section 11)." | +49 | The order `root.md` already gives | Open → fixed |
| 4 | Design part 4 §4, standing-notes row | "a held merge, a module put first, the slot number" | Part 1 §4, part 4 §11, `coordinator.md` rule 6 and build text 5 §§2–3 also write a full external walk asked for as a standing note. | "..., the slot number, a full external walk asked for" | +32 | Names the kind the other texts already write | Open → fixed |
| 5 | Design part 4 §11 | "PROCESS finds each product's ROOT in its products registry (section 5)" | Section 5 names no registry; it is in build text 5 §4. | "(build text 5, section 4)" | +14 | Reference only | Open → fixed |
| 6 | Design part 7 §3 | "an account switch moves them together (part 6, section 7; build text 6, section 1)" | Part 6 §7 says nothing of accounts. | "(build text 6, section 1)" | −19 | Reference only | Open → fixed |
| 7 | Design part 10 §2 item 5 | "eight texts in the build folder `starting_texts/`" | `starting_texts/` is not in `build/`. | "in the folder `starting_texts/`" | −6 | Names the real folder | Open → fixed |
| 8 | Design part 0 §6, "Process config" | "What it holds (each field is in the build text ...): the process version ..., the folder of the walks' documents, ..." | Reads as the whole list; part 3 §6 says the config names the process folder, and build text 2 §7 has more fields. | "What it holds, among other fields (...): ..., the process folder and the folder of the walks' documents, ..." | +37 | Build text 2 §7 holds every field | Open → fixed |
| 9 | Design part 6 §7 | "The sessions then refresh onto it (...), losing no work (part 3, section 1)." | Reads as at once; part 3 §1: where jobs are open, at the next round boundary unless the owner says move now. | "The sessions then refresh onto it when part 3, section 1 says (...), losing no work." | +8 | Part 3 §1's timing, which the record's entry cites | Open → fixed |
| 10 | Build text 3 §4 | "room inside the about thirty minutes a session can run one thing" | Part 7 §1: two hours for a background command (thirty minutes was a foreground command moved to the background). | "room inside the time a session can run one thing (the design, part 7, section 1)" | +16 | The twenty-minute split rule is unchanged | Open → fixed |
| 11 | Build text 3 §2 step 5 | "In the round that would end the tranche, ARCH adds the journeys the design's reading of part 3, section 5 calls for." | Part 3 §5 and the record ("A tranche ends", item 1): no end-of-tranche sweep; it calls for no journeys. | Step removed; step 6 becomes 5 | −120 | The step added nothing the design allows | Open → fixed |
| 12 | Build text 2b §5 | "(part 2, section 7, point 3)" | Part 2 §7 has both numbered "rules" and a bullet "Three points"; build text 2c and the record say "rule". | "(part 2, section 7, rule 3)" | −1 | Reference only | Open → fixed |
| 13 | Build text 1 §3 | "**Unproven:** every row. No approvals wording for Process4 is committed, and no act of this tool has been judged." | Part 6 §2: his committed `CLAUDE.md` block is in force; the tool has run on products. | "**Unproven:** that the permission checker passes every row at a real rate." | −39 | Part 6 §5's own unproven claim | Open → fixed |
| 14 | Build text 1 §2 | "The process's repository has five folders ... PROCESS's own folder is a sixth." | The repository also holds `coordination/` and `measurement/`. | "holds, among others, five folders ... PROCESS's own folder is another." | +17 | The five named are unchanged | Open → fixed |
| 15 | Build text 6, intro, §§5–7 | "build text 4, section 7"; "(the design, part 10, section 6)" for the switch that failed | Build text 4 has no section 7 (stage 7 is in §3); part 10 §6 does not mention the switch. | "build text 4, stage 7" (five places) | −37 | References only | Open → fixed |
| 16 | Build text 6 §4 step 2 | "ROOT archives every session still named in the roles and lanes records and every open job's session" | Design part 4 §7 and `root.md` rule 1: all but PROCESS (a cross-repository archive is refused, part 7 §3). | "... records but PROCESS, and every open job's session" | +13 | The design's rule | Open → fixed |
| 17 | `starting_texts/00-index.md` §2 | ROOT and watcher 103,666; coordinator 137,407; lane 114,304 / 135,206; walking 83,183 / 85,811 | Measured on the branch's own files these were 103,730, 137,616, 114,368 / 135,259, 83,172 / 85,800. | Every set re-measured after each commit | n/a | `wc -c` sums | Open → fixed |
| 18 | `starting_texts/00-index.md` §1 | "filling the names adds bytes" | `walking-session.md` is 3,674 bytes and 3,594 as filled. | "..., except in the walking session's text, whose alternatives shrink to one when filled." | +84 | States the table's own figures | Open → fixed |
| 19 | Design part 2 §7 "The conversion" | "each merging once its providers' conversions have merged (section 8)" | Section 8, build text 1b command 6 and the record ("The round", item 2): a job merges once no job is open among the modules it uses. An unconverted provider with no open job holds no one. | Choose one rule and state it in both places | — | — | Open, **changes a rule** |
| 20 | Design part 3 §7 | "the fix is built as its own tranche from the main branch" | §1: "There is one lasting tranche branch." Which branch carries the urgent fix is not said (record, "An urgent fix", says the same as §7). | Name the branch the fix uses | — | — | Open, **changes a rule** |
| 21 | Design part 0 §2, part 10 §3 | "Nothing here is in force and nothing here has run."; "Process4 has never run and its tool is not built." | The record cites runs on civicsmith and process3-probes; part 6 §5 and part 4 §11 say the tool is built. | The status is set on his word (part 0 §2); put the status question to him | — | — | Open, for the owner |
| 22 | Design part 5 §3 | PROCESS reads the record "and the build texts the same way, through an index of the record's subjects and each build text's sections" | No index of the build texts' sections exists; `process.md` and the index (PROCESS: "None; each one before changing it ...") read a build text when a question touches it. The record ("What PROCESS reads in full") says build text 5 is read through an index. | Either write the index or say "and a build text when a question touches it" | — | — | Open, **changes a rule** (what PROCESS reads) |
| 23 | Design part 10 §2 item 6 | "The forms used when the notice's method was proven are in a repository this work could not open, and win where they differ." | Build text 2 §1 and build text 4: the proof's repository is public and was read. "Win where they differ" sets the proof above build text 2b, which decision C changed. | Drop both clauses | — | — | Open, **changes a rule** (precedence) |
| 24 | Design part 10 §2 item 10 | "helpers under one module's tests that another module imports, which the interface listing does not cover" | Build text 2 §3: "A helper for other modules' tests is one too" (an interface file). | Remove the clause if PROCESS agrees it is settled | — | — | Open, for PROCESS |
| 25 | Design part 3 §5, part 2 §7; build text 1b commands 2, 26 | A drop puts back "every module code and test file ... and nothing else"; the tool rewrites the uses file "in every change ARCH makes to the module" | Uses files are not module paths, so a drop either leaves them describing the tranche's code, or `push` rewrites them; each holds `written.commit`, so a rewritten one is never "the main branch's own", and the required run does not pass the drop at once. | Say what a drop does with uses files | — | — | Open, **changes a rule** |
| 26 | Build text 2 §9 item 1; build text 5 §8 item 3; build text 1 §6 | "the 150 recorded answers are to be recorded again"; build text 1: "recorded again under the means and the uses files with its 13 further breaks" | One says done, the others owed. | PROCESS to say which is true and make the three agree | — | — | Open, fact |
| 27 | Build text 5 §6 | "**The closure** is the rule of `process/research/uses-metadata-25nov/study-changes.md`, section 3.2" | A rule held only in research, which is background, not governing text (design part 5 §3). | State the rule in build text 5 §6 | — | — | Open, **changes a rule** (moves it into governing text) |
| 28 | Build text 2c "The conversion" step 3; build text 5 §5 | "the report for the owner's review" | "Review" reads as a gate against part 1 §7 and part 2 §6; nothing waits on the report. | "the report for the owner to read" | ~0 | Nothing waits on it either way | Open, wording |
| 29 | Design part 2 §7 "Who uses what" | "A uses file depends only on its own module's code and its providers' stated types, so a change elsewhere does not make it stale." | A provider's stated types are "elsewhere"; such a change does change the file, until the told job pushes. | "... so only a change to its own module's code or a provider's stated types changes it" | ~0 | Same facts, no contradiction | Open, wording |
| 30 | Build text 1 §8 item 3 | "the proposal in `owner_acts_and_approvals.md` was written before the path existed" | His approvals are committed (part 6 §2). | Remove the clause | ~−90 | Status line only | Open (PROCESS-only text) |

Confirmed already addressed (checked on this branch): the required-run workflow among the named files (part 2 §1); the
required run passing a dropped tranche's pull request only when every file is main's own (part 2 §9; build text 1 §5 step
4; the record); the tranche's scope stated once (part 2 §3 step 1, referred to from part 3 §1); the 50 percent fill level
in every starting text and part 5 §2; the job's branch `job/<module>.<n>` in part 4 §11 and build texts 1, 1b, 2 and 5;
a cross-repository read refused and the coordinator reading only its own roles record (parts 4, 6, 7; build text 5 §2;
`coordinator.md`); a lane's marked words passing through ARCH (part 1 §4, `lane.md` rule 4, the record).

## 2. Elements that can and should be combined

All but the last were done in commit 2. Bytes are each text's own change.

| # | Where | Current words | What could change | Action taken | Bytes | Why accuracy is kept |
|---|---|---|---|---|---|---|
| 1 | Design part 1 §6, part 1 §7 row, part 6 §4 | The non-substantive re-attempt stated in full three times | One home, part 6 §4 ("rules that exist because of the permission checker") | Part 1 §6: "a non-substantive refusal of a sanctioned act is made again, cleanly and bounded, as part 6, section 4 says"; the table row points there; part 6 §4 gains part 1's example "(mixing a forbidden command into a legitimate one)" | −645 | Every condition stays in part 6 §4 |
| 2 | Design part 4 §5 (three bullets), §2, §11; part 6 §7; part 7 §3 | Who starts PROCESS, and how the coordinator finds it, stated five times | Who starts: part 4 §5; how found: part 4 §5 and part 6 §7 | Part 4 §5's PROCESS bullet keeps only the refresh steps and the cross-repository rules; part 4 §2's repeated sentence and part 7 §3's two restatements removed; part 6 §7 shortened | −951 | The rule, the record field and the reach remain in their homes; reasons removed |
| 3 | Design part 4 §4, §7, §11 | Who removes a standing note; how a held merge reaches ARCH | §4 for removal, §11 for how ARCH learns | §7's bullet removed; §4 says "the coordinator's session removes the note, by the tool"; §11 adds "which the tool reads before every merge" | −152 | Both facts kept |
| 4 | Design part 4 §8 | "A message from the directing session is an instruction ..." | Part 1 §6 and part 4 §11 say it | Removed | −107 | Stated in part 1 §6 |
| 5 | Design part 1 §5 | "He can see each open job's progress and status ... (part 4, section 9)" | Part 4 §9 holds it | Removed | −93 | Part 4 §9 |
| 6 | Design part 4 §10 | "A walk flaw that two modules' jobs have each handed back ... not placed a third time" | Part 2 §4 is the home | "A flaw handed back twice is decided by ARCH as a design question (part 2, section 4)." | −64 | Part 2 §4's rule |
| 7 | Design part 2 §7 | "A told job that finds nothing to change records that ... closes it unmerged. No test runs ..." | Part 2 §4 is the home | "A told job that finds nothing to change closes as section 4 says, and runs no test." | −52 | Same acts |
| 8 | Design part 2 §7, rules 1 and 2 | Restate "Who uses what" and "Who is told" | Keep the numbers (cited by build text 2c and the record) | "1. Users are found by reading their uses files (above)." "2. A place outside the standard is told as above, until a job converts it; where the tool cannot say which modules it may refer to, it may refer to every earlier one." | −154 | Rule 2's one extra fact kept |
| 9 | Design part 5 §§1–2 | Codex re-measurement owed, and no fill level → natural pause, stated five times | §2's opening line and the fill-level row | §1 bullet and table cells shortened; the separate fill-level bullet folded into the row; the fetch-line bullet points to part 4 §11 | −617 | Every figure and condition stays in §2 |
| 10 | Design part 5 §3 | Requirements file size; "Nothing refuses a job or a merge for size." | Part 2 §2 holds both | One sentence citing part 2 §2 | −32 | Same rule |
| 11 | Design part 6 §3 | "Only the owner's click lands a change to his approvals or the forbidden commands (section 2)." | Section 2 says it | Removed | −94 | Part 6 §2 |
| 12 | Design part 3 §5 | "A full external walk remains available only on the owner's request (section 3)." | Section 3 says it | Removed | −80 | Part 3 §3 |
| 13 | Design part 3 §6, part 9 §2 | Release token and signing keys restated from part 1 §2 | Part 1 §2 is the home | Part 3 §6: "the release token and ... the production signing keys of part 1, section 2"; part 9 keeps the keys' place and the known limit | −243 | Part 1 §2 holds both |
| 14 | Design part 4 §5 | "ARCH is long-lived." | Part 0 §6: every standing role is long-lived | Removed | −22 | Part 0 §6 |
| 15 | Build text 3 §9 | The five matters "settled (the owner, 20 November 2026)" | Each is stated in §§3, 5, 6 and in the record | §9 removed; the unused "**Owner's:**" mark removed | −1,534 | Each rule stays in the body; the record keeps his words |
| 16 | Design part 10 §1 and part 6 §2 "Open (the owner)" | The same open item | Part 10 gathers open items by design (its first line) | Not changed | 0 | — |

## 3. Texts that can be more concise

Done in commit 2 except where marked.

| # | Where | Current words | What could change | Action | Bytes | Why accuracy is kept |
|---|---|---|---|---|---|---|
| 1 | Build text 3 §1 (job and ARCH) | "What is recorded, and what is not": the earlier process's measurements | History; no rule | Removed; header: "Its sections begin at 2." (numbers kept: the record and other texts cite them) | −3,357 | The unproven claims are in design part 3 §3 and part 10 |
| 2 | Build text 3 header, §4 | "Written by Claude on 18 Nov 2026"; "Reconciled the same day ..."; "the design's list for it now names them (part 0, section 6)" | History | Removed | −140 | No rule in them |
| 3 | Build text 2 header, §1, §3 (job) | Authorship, reconciliation dates; the study and proof sessions' narrative; "as in the process before this one"; the proof's paths for `public` | History | §1 kept as a short pointer naming the proof, its scope and its own "not proven" words (build text 2b and 5 cite it) | −1,501 | The proof's location and its four quoted limits kept |
| 4 | Build text 2b intro (job) | "...in `02c-the-coding-standard.md`; whose section 1 says what was proven ..." | Garbled clause order | Reordered | −20 | Same pointers |
| 5 | Build text 2c header (job and ARCH) | "From `process/research/uses-metadata-25nov/` (...)" | Where it came from | Removed | −117 | No rule |
| 6 | Build text 5 header, §1, §8 (ARCH) | The carrier's source files; "where the carrier file had plain lines"; "the carrier file's read-back ... is not built"; "On a product, GitHub refused ..." | History | Removed | −508 | The 60,000-character rule stays in §5 |
| 7 | Design part 2 §9 | "and it is merged once; and the moment: when no job is open, ..." | Awkward | "and it is merged once, when no job is open, ..." | −16 | Same rule |
| 8 | Design part 7 §4 | "Act 10 was done before act 9 on the trial." | History (record, "Onboarding", keeps it) | Removed | −44 | No rule |
| 9 | `starting_texts/00-index.md` §2 | "so either grows only as something in it is removed" | No longer true at ~9,000 under | Removed | −52 | Figures beside it |
| 10 | Build text 1 header and §1 (PROCESS only) | "Written by Claude on 18 Nov 2026"; "What carries over, what is dropped, what is new" (~3,000 bytes) | History; keep only "New" and the dropped list if PROCESS wants them | Not done | ~−2,500 | — |
| 11 | Build texts 4 and 6 headers (PROCESS only) | "Written by Claude ..."; build text 4 §2 "It was done before act 9 on the trial" | History | Not done | ~−300 | — |
| 12 | Build text 2c R19 | "It replaces R9." | History, but explains the gap in R1 to R22 | Not done (removing it leaves an unexplained gap) | −16 | — |
| 13 | `starting_texts/00-index.md` §3 | "What the earlier process recorded about starting texts" | History in an index no role reads | Not done | ~−2,900 | — |
| 14 | Design part 7 §5 | "**Why.**" paragraph | Reasons belong in the background document (part 0 §1) | Not done (it names the checker's categories a session meets) | ~−500 | — |

## 4. Findings in the record of decisions (not edited)

| # | Where | Words | What is wrong |
|---|---|---|---|
| R1 | `design-decisions.md`, "A refused act ...", item 3 | "with `state read --repository` where the record is in another repository" | Design part 4 §11 and part 7 §3: such a read is refused; the subject "PROCESS: who starts it" says so too. |
| R2 | `design-decisions.md`, "A tranche ends", item 3 | "build text 1, section 5, step 2a" | Now step 4. |
| R3 | `design-decisions.md`, "Earlier decisions not yet migrated" | "(design part 5, section 7)" | Part 5 has six sections. |
| R4 | `design-decisions-2.md`, "Who a change tells", item 1 | "(S1 to S13, R1 to R22 and the type checker's settings, build text 2)" | The standard is build text 2c. |
| R5 | `design-decisions-2.md`, "The walks' five matters" | Labels "(9.1)" to "(9.5)" | Build text 3 §9 is removed in commit 2; each item's own references (§§2, 3, 5, 6) still hold. |
| R6 | `design-decisions-2.md`, "What PROCESS reads in full" | "build text 5 and its research through their indexes" | No index of build text 5 exists (contradiction 22). |

## 5. Not resolved without the owner

Contradictions 19, 20, 21, 22, 23, 25 and 27 change a rule, or the status, and are his. Contradiction 2 (the facility list
among the named files) was edited as a gap-filling fix; PROCESS should confirm it is not a rule change.
