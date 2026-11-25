# Audit of the record of the owner's design decisions (25 Nov 2026)

A read-only worker's audit for PROCESS. Files read at HEAD `4437ecf`: `process/design-decisions.md` (F1),
`process/design-decisions-2.md` (F2), `process/design-decisions-3.md` (F3). Window: `git diff 3b80c61 HEAD` (13 commits,
24 Nov 18:57 to 25 Nov 06:28 UTC), plus F2's 23 Nov entries from "The form of a job's branch" on, as asked. Nothing here
judges or proposes editing the owner's quoted words; every proposal keeps them all, dated, beneath the entry they belong
to.

## Summary

- The owner's worry is borne out. In the window, 13 entries were added and **none of the existing entries was rewritten**
  (the diff on F2 touches only its header line and appends; F1 only its "Where the record is kept" paragraph). Several new
  entries change the rule of an older entry and leave the older entry stating the old rule (section 3).
- 64 entries in all (F1 30, F2 29, F3 5). They fold into about 32 subjects (section 4).
- The notice (`notify`, who is told, how a notice is delivered) is now spread over **9 entries** in three files; a job's
  tests and the required check over **7**; the check's refusals over **4**; the round/slots/waiting-work/job block over
  parts of **7**.
- In the window's entries, rule and narrative are about equal: about 15,600 bytes of "rule as it now stands", 15,400 of
  fix narrative, 4,500 of the owner's words.
- Sizes: F1 42,348; F2 59,740 (260 bytes under the 60,000 maximum); F3 9,852; total 111,940. A consolidation by subject
  would bring it to about 63,000 to 70,000 bytes (two files), section 6.
- A structural cause: F1's "Where the record is kept" says F3 "takes each new one", and F2 has 260 bytes of headroom, so
  rewriting any F2 entry in place so that it grows would push F2 past the maximum. Appending to F3 is the path of least
  resistance.

## 1. Subjects split across several entries

### Cluster A: the notice (9 entries, plus parts of 1)

| Entry | File | What it states |
|---|---|---|
| The tool's code reading on a large product | F2 (23 Nov) | `notify` finds changed modules from the module lists and file names first; memory allowance 3/4 of the machine |
| The notice reads only what a merge can affect | F2 (23 Nov) | staged reading; "one at a time"; who is read; plain message when memory fails |
| Tests once in the job, ... and slots, item 2 and "Folded in" | F2 (24 Nov) | a notice reaches an open job at once (added to its block, ARCH messages it); six places and a count; class member bounds; refusal (b) |
| Merging goes on while a notice is worked out | F2 (25 Nov) | `notify` runs in the background; a user merged meanwhile gets its notice from waiting work |
| The notice after an early provider's merge: faster, harmless changes tell no one, no notice lost | F2 (25 Nov) | batches, kinds worked out once; not-followed users told of everything that tells anyone; reasons in `process4-notice` comments; waiting-work entry form |
| The notice: an unknown kind becoming known, nothing lost to size or a race, no repeats | F3 (25 Nov) | "anything" to stated tells no one; block under 60,000; race; no repeats |
| The notice's second group carried out: ... | F3 (25 Nov) | says itself "The rules of the entry above are unchanged; the tool now keeps them" — a log of a tool repair, not a subject |
| One name exported by two interface files for two things is two entries | F3 (25 Nov) | the listing's entry names (`<file>:<name>`) |
| A user the tool cannot follow fully is told of a changed function only where it may use it | F3 (25 Nov) | narrows who a not-followed user is told of |
| (part) A told job's tests — the three readings | F1 (20 Nov) | a told job's test scope (belongs with Cluster B) |

Judgement: these are one subject, "the notice", and should not be nine entries. Because the rule is long, the cleanest
form is **three entries**, each one subject, each stating the rule as it now stands with all the owner's dated words of
the entries folded into it beneath:

1. **Who a change tells** (what a listing entry is, `<file>:<name>`; unknown kind becoming known; accepts-more; a user not
   followed fully and the 3B narrowing). Folds: early-provider item 2, F3 "unknown kind" item 1, F3 "second group" items 2
   and 3, F3 "one name ... two entries", F3 "a user the tool cannot follow fully", Tests-once "Folded in" (member bounds).
2. **How `notify` reads the product** (changed modules from file names first; staged reading; batches; kinds worked out
   once; memory allowance; plain message on memory). Folds: "The tool's code reading on a large product", "The notice
   reads only what a merge can affect", early-provider item 1.
3. **How a notice reaches a user** (background `notify`, merging goes on; an open job's block and ARCH's message; waiting
   work and the `process4-notice` comments; block size; race; no repeats). Folds: Tests-once item 2 and "Folded in" (six
   places), "Merging goes on", early-provider item 3, F3 "unknown kind" items 2 and 3, F3 "second group" item 1.

Build text 1b, command 11 shows the same layering in the build texts: one paragraph says both "a user not followed fully is
told on any change to the listing" and, later, "A user it cannot follow fully is told only of a change that tells any
user", and its staged-reading sentence is spliced mid-list ("...the kinds a file declares are worked out once for each
side and kept across those readings: those whose imports, followed file to file, lead to it..."). Outside this audit's
scope (a build text), named so PROCESS can see it.

### Cluster B: a job's tests, the test record and the required check (7 entries)

| Entry | File |
|---|---|
| The required check's name | F1 |
| A told job's tests — the three readings | F1 |
| When the tool's own tests run | F2 (process repository's `tool-tests`) |
| Tests once in the job, ... item 1 | F2 |
| A job's tests run on its branch brought up to the tranche | F2 |
| How a dropped tranche is carried out (the required run's pass-at-once for a drop) | F2 |
| A product's repository may hold secrets (its "required run's second part holds no access token") | F2 |

Judgement: one entry, "A job's tests, the test record and the required check": who runs `p4 test`, scope (ordinary,
told, nothing), bringing the branch up to the tranche, the test record, `module-tests` reading it, failed-run counts,
ARCH's non-job pull requests, a drop's pull request. "When the tool's own tests run" is a different repository's run and
can stay its own entry (or be a numbered point of this one).

### Cluster C: what the check refuses (4 entries)

| Entry | File |
|---|---|
| The check and deliberate error-condition tests (fault D) | F1 |
| A declared use of a later module is refused | F2 |
| The check refuses only what a structured comment states | F2 |
| Tests once in the job, ... item 5 ("The check mended": `require`, imports by product name, declared use with no visible import is "cannot tell") | F2 |

Judgement: one entry, "What the check refuses", with the two refusals, the error-assertion exemption, the structured-comment
limit, `language_reader.exclude`, declared uses (later module refused; no visible import is "cannot tell"). Design part 2,
section 6 already states it as one rule.

### Cluster D: the round — slots, merge order, blocked jobs, waiting work, scope (parts of 7 entries)

| Entry | File | Part concerned |
|---|---|---|
| A walk-flaw module whose job hands the flaw back (round-done gap) | F1 | finished, waiting work |
| A job whose block ARCH ended says it goes on | F2 | blocked record, slot |
| Tests once in the job, ... items 3 and 4 | F2 | merge after the modules a job uses; slots |
| Merging goes on while a notice is worked out | F2 | refill the slot in the same turn |
| A tranche's scope, recorded by ARCH | F2 | round record, `not_this_tranche` |
| How a dropped tranche is carried out | F2 | clears round and waiting-work records |
| The notice after an early provider's merge, item 3; F3 "unknown kind" item 2; F3 "second group" item 1 | F2, F3 | waiting-work entry form; job block size; `open --module` copying notices |

Judgement: two subjects. "The round: slots, merge order and blocked jobs" (folds Tests-once items 3 and 4, the `--unblocked`
entry, the round-done gap entry) and the waiting-work and job-block size rules belong to "How a notice reaches a user"
(Cluster A, 3). The tranche scope stays with the tranche (Cluster F).

### Cluster E: a job's commands, naming the pull request and `ready` (3 entries)

"Naming the pull request for a job's commands" (F1); "`ready` where there is nothing to mark" (F3); Tests-once item 1's
"`ready` runs nothing: it marks ready only where a pass is recorded..." (F2). One entry. The F1 entry is also out of date
by omission: `test` (new on 24 Nov) also takes `--branch`.

### Cluster F: a tranche's life (7 entries)

F1: "How a tranche ends, and what shows its journeys complete", "No owner approval of a tranche", "Releasing from a tranche
merged with its flaws named", "An urgent fix while a tranche is open". F2: "A tranche branch starts from main", "How a
dropped tranche is carried out", "A tranche's scope, recorded by ARCH". Judgement: two entries — "A tranche opens: from
main, by ARCH, with its scope" and "A tranche ends: clean, merged with flaws named, or dropped (and release from it)";
the urgent fix may stay its own.

### Cluster G: refreshing roles and finding PROCESS (6 entries)

F1 "Refreshing PROCESS across repositories, and re-attempting a non-substantive refusal" (carries a parenthetical patch
pointing to F2 instead of being rewritten); F2 "How the coordinator finds the live PROCESS"; F2 "When a long-lived role is
refreshed"; F2 "A replaced session's scheduled wake"; F1 "The four reading values" (fill level 50); F1 "Two
reading-measurement findings" (finding 2, reading one's own fill). Judgement: "PROCESS: who starts it and how others find
it" (first two), "When a role is refreshed, and what goes with it" (refresh rule, fill level, reading one's own fill, wake
removal), and the re-attempt clarifications as their own subject ("A refused act: reporting it, and re-attempting a
non-substantive refusal", with F1 "Reporting that an act cannot be done").

### Cluster H: the reading values and research (5 entries)

F1 "How the starting-text size limit is measured", "The four reading values", "Two reading-measurement findings"; F2
"Research is read through an index"; F1 "The smaller readings" (patched with a parenthetical to point at the research
entry). Judgement: "The reading values and how they are measured" (first three) and "What a role reads" (research index,
a job's required reading from F1 "What a job reads before it builds").

### Cluster I: the owner's words reaching the record (4 entries)

F1 "Routing an instruction the coordinator records as a standing note", "The coordinator records the owner's words from a
file", "How a lane's marked owner-words reach the coordinator", "Showing a record entry is for transparency". One entry.

### Cluster J: setting up a product, accounts, tokens and secrets (8 entries)

F1 "Checking the environment's permissions-management settings...", "Publishing a release — ... production keys and
tokens"; F2 "PROCESS and the products it serves share one Claude account", "The owner never edits a file or types a
command", "Setting up an existing product under Process4", "Onboarding a product — ...", "A product's token is made once",
"A product's repository may hold secrets". Judgement: three subjects — "Onboarding and setting up a product" (onboarding,
setup, token made once), "Secrets, keys and tokens" (repository secrets, production keys, release token, token made once
cross-referenced), "Claude accounts and an account switch" (one account; environment settings check). "The owner never
edits a file" stays its own.

### Cluster K: walks (6 entries)

F1 walk matters 9.1, 9.2–9.3, 9.4, 9.5 (four entries), the round-done gap and "How a tranche ends" (walk scope). One entry
"The walks' five matters" (9.1–9.5); the round-done gap goes to Cluster D.

### Cluster L: moving a product to a Process4 version (3 entries)

F1 "Moving a product to the latest (or a named) Process4 version"; F2 "The order of a move whose new version changes the
required-run workflow"; F2 "Each session's copy of the process". One entry (the third may stay its own).

### Cluster M: session names (2 entries)

F2 "Standardized session names"; F2 "A session can set its own name (seen to work)". One entry.

## 2. Entries that read as a log of a fix

Bytes measured per entry (rule paragraph(s) / narrative paragraphs / owner's words). F1's older entries put the narrative
inside the rule paragraph ("This corrected ...", "Why option C supersedes ..."), so their split is an estimate.

| Entry | File | Rule | Narrative | Words | Narrative share of entry less words |
|---|---|---|---|---|---|
| The notice after an early provider's merge | F2 | 1,304 | 1,979 | 741 | 60% (timings, GB, 97%, 17 answers, the uses-file idea) |
| Tests once in the job, ... and slots | F2 | 2,736 | 1,482 | 536 | 35% |
| Merging goes on while a notice is worked out | F2 | 714 | 1,097 | 663 | 61% (38 minutes, nine held jobs) |
| How a dropped tranche is carried out | F2 | 879 | 959 | 122 | 52% (45-minute limit narrative) |
| The form of a job's branch | F2 | 523 | 873 | 106 | 63% (207 branches, 137 of 204) |
| The notice reads only what a merge can affect | F2 | 1,206 | 867 | 333 | 42% (256 MB to 128 MB, 166 modules) |
| A tranche's scope, recorded by ARCH | F2 | 940 | 866 | 103 | 48% |
| A job's tests run on its branch brought up to the tranche | F2 | 679 | 836 | 338 | 55% (PR 1346, 201 tests) |
| The tool's code reading on a large product | F2 | 423 | 715 | 97 | 63% (12 GB) |
| A product's repository may hold secrets | F2 | 616 | 708 | 275 | 53% |
| A job whose block ARCH ended says it goes on | F2 | 631 | 626 | 97 | 50% |
| The order of a move whose new version changes the workflow | F2 | 548 | 526 | 122 | 49% |
| A user the tool cannot follow fully is told ... | F3 | 1,072 | 1,092 | 108 | 50% ($1.40 to $1.90, 125 modules, 8 answers) |
| The notice: an unknown kind becoming known ... | F3 | 1,224 | 906 | 143 | 43% (2,143 entries, 198 modules) |
| The notice's second group carried out | F3 | 1,043 | 824 | 108 | close to 100%: its own first line says no rule changed; it is a log of a repair (PR numbers 1404, 1408, 1407) |
| One name exported by two interface files | F3 | 465 | 640 | 107 | 58% |
| `ready` where there is nothing to mark | F3 | 628 | 436 | 112 | 41% (PR 1378) |
| A declared use of a later module is refused | F2 | 577 | 1,126 | 83 | 66% |
| How the coordinator finds the live PROCESS | F2 | 943 | 1,384 | 67 | 59% |
| When the tool's own tests run | F2 | 608 | 812 | 247 | 57% |
| The check refuses only what a structured comment states | F2 | 988 | 1,068 | 253 | 52% (176 of 178, 74,271) |
| Refreshing PROCESS across repositories | F1 | about 2,000 | about 2,200 | 437 | about 50% ("Why option C supersedes decision B") |
| The four reading values | F1 | 1,816 | 1,134 | 288 | 38% |

Window total (F2 from "The form of a job's branch" on, and F3): rule about 15,600 bytes, narrative about 15,400, owner's
words about 4,500 — narrative is half of every entry's own text. Most rule paragraphs also carry the list of files changed
(`tool/lib/...`, build text numbers), which is provenance, not rule; a consolidated entry can keep one line of where it is
carried out. Each window entry ends with the same boilerplate ("It adds no test, gate, review or stop. Option B of three
(A ...; B ...; C ...). Researched in ... Products receive it with their next move."), about 250 to 350 bytes each.

## 3. Stale rules still stated

1. **"A product's repository may hold secrets"** (F2, 23 Nov) says "the required run's second part holds no access token
   (design part 2, section 6)". The update of 24 Nov removed the two-part run and "the rule that product code under test
   holds no access token" (Tests-once, item 1); design part 2 now says nothing of a token (grep: no "token" in
   `design/02-*.md`), and build text 1 line 70 lists it as removed.
2. **"The notice reads only what a merge can affect"** (F2, 23 Nov) says the later modules are read "one at a time"; the
   early-provider entry (25 Nov) made it "several to a reading" (`BATCH` in `tool/lib/notice/staged.mjs`). It also counts
   "those with an import it cannot follow" in as users told, which 3B (F3) narrowed.
3. **"The notice after an early provider's merge"** (F2, 25 Nov), item 2: a user not followed fully "counts as using
   everything of the provider and is told of every change to its listing that tells any user". Superseded hours later by
   F3 "A user the tool cannot follow fully is told of a changed function only where it may use it" (3B); design part 2,
   section 7, decision 2 states the narrowed rule. Its "known limit: a job block that gathers several large notices could
   still pass a comment's size" is superseded by F3 "the notice", item 2 (the block kept under 60,000).
4. **"Tests once in the job ..."** (F2, 24 Nov), item 2 "A notice reaches a running job at once ... ARCH messages the job"
   is now conditioned by "Merging goes on" (the notice comes when the background `notify` ends; a user merged meanwhile
   gets it from waiting work) and by F3's race rule. Item 1 "runs `check` and then the tests in scope" now follows
   bringing the branch up to the tranche (25 Nov). Neither was rewritten.
5. **"The tool's code reading on a large product"** (F2, 23 Nov): its rule still holds (the memory allowance is in
   `tool/p4.mjs`), but its "Not known: whether a job merge's notify on civicsmith fits ... with the second repair" was
   answered the same day (it did not; decision D followed). Fold into Cluster A, 2.
6. **"How a dropped tranche is carried out"** (F2, 24 Nov 18:57) was recorded 45 minutes before the update (19:41). Its
   rule "the required run passes that pull request at once ... otherwise it runs as any other branch" and its narrative
   ("past the 45-minute limit") speak of the run that the update removed. The design (part 3, section 5) was rewritten to
   the new form; the entry was not. Also unclear after the update: a drop pull request that fails the pass-at-once falls
   under "ARCH's session tests a pull request that is not a job's ... each touched module whole", the very run the drop was
   meant to avoid. Worth a line in the consolidated entry.
7. **"The form of a job's branch"** (F2, 23 Nov): "the required-run workflow ... reads a job's block as before" — the
   workflow now reads the test record (`run verdict`). Minor.
8. **"The check refuses only what a structured comment states"** and **"A declared use of a later module is refused"**
   (F2, 22 Nov) say the check runs "inside a module's own tests"; since 24 Nov it runs in `p4 test` in the job's session
   before the tests. Tests-once item 5 changed the declared-uses check (a declared use with no visible import is "cannot
   tell") without rewriting either entry.
9. **"Naming the pull request for a job's commands"** (F1, 19 Nov) lists `ready`, `results` and `close` as taking
   `--branch`; `test` (24 Nov) does too. By omission.
10. **"Refreshing PROCESS across repositories"** (F1) and **"The smaller readings"** (F1) were not rewritten when later
    entries changed them; each carries a parenthetical pointer to the later entry instead (the same pattern, earlier).
11. **F2's own header** says "It continues `design-decisions.md` ...; both files are read" — there are three.

Good examples of the rules being followed: "Standardized session names" was rewritten in place for the branch form (23
Nov), and "Publishing a release" was rewritten in place on 22 Nov with the earlier words kept and marked as replaced.

## 4. Do the named design, build and starting-text changes exist at HEAD?

Spot-checked by grep; every one named in the window's entries is present:

| Entry | Checked | Found |
|---|---|---|
| The form of a job's branch | `job/<module>.<n>` | build texts 1, 1b, 5; `tool/lib/round.mjs` |
| A product's repository may hold secrets | design part 2 token clause | gone from design (see 3.1) |
| The tool's code reading | memory allowance | `max-old-space` in `tool/p4.mjs`; build 1b command 11 |
| A job whose block ARCH ended | `--unblocked` | `tool/lib/commands.mjs`, `tool/p4.mjs`; design part 2 line 33 |
| The notice reads only what a merge can affect | `staged.mjs`, `notices.mjs` | present |
| How a dropped tranche | `drop --tranche`; design part 3 s5; build 1 step 2a; ARCH rule 6 | present |
| Tests once in the job | `run verdict`, `testrecord.mjs`, `testrun.mjs`; build 1 line 70 "Removed by the update"; slot rule design part 2 lines 47–48 | present |
| Order of a move | design part 6 s7; ARCH rule 6; build 1b command 25 | present |
| A tranche's scope | `workOf`, `scopeOf` in round.mjs; `not_this_tranche` in commands.mjs, build 1b, job.md; design part 3 line 8 | present |
| Merging goes on | design part 2 line 28; ARCH rule 2; build 1b command 11 | present |
| A job's tests on its branch brought up | `bringBaseIn` in `tool/lib/testrun.mjs`; build 1b command 27 | present |
| The notice after an early provider | `noticecomments.mjs`; `process4-notice` in build 1b and 5 | present |
| `ready` where nothing to mark | `markReady`, `lastPRForBranch` in github.mjs; `prOf` in p4.mjs; `gh pr ready` only in a comment | present |
| The notice: unknown kind | `known`, `knownDecl` in notice.mjs; design part 2 line 75 | present |
| The notice's second group | `toOpenJobs` (notify.mjs), `unbracket` (ts.mjs), `noticeText` (notice.mjs) | present |
| One name ... two entries | `<file>:<name>` in build 2b | present |
| A user not followed fully | `tool/lib/notice/narrow.mjs`; design part 2 decision 2 and "A declared use that no code makes"; build 5 s6 | present |

No entry names a change that is missing. The design is ahead of the record: it states the current rule where the record's
older entries do not (3.1 to 3.4).

## 5. Proposed subject list for a consolidated record

Titles only; each states the rule as it now stands, then all the owner's dated words of the entries folded into it.

**Owner, words and the record**
1. How the owner's marked words reach the record — folds F1 Routing an instruction...; The coordinator records the
   owner's words from a file; How a lane's marked owner-words reach the coordinator; Showing a record entry is for
   transparency.
2. The owner never edits a file or types a command — F2, as is.
3. The design document carries no history — F1, as is (trim narrative).
4. The terms "provider" and "user" — F1, as is.

**Sessions and roles**
5. Session names — folds F2 Standardized session names; A session can set its own name.
6. PROCESS: who starts it and how others find it — folds F1 Refreshing PROCESS (its PROCESS part); F2 How the coordinator
   finds the live PROCESS.
7. When a role is refreshed, and what goes with it — folds F2 When a long-lived role is refreshed; A replaced session's
   scheduled wake; F1 four reading values (fill level) and two findings (finding 2).
8. A refused act: reporting it and re-attempting a non-substantive refusal — folds F1 Reporting that an act cannot be
   done; F1 Refreshing PROCESS (decision B's clarifications 1 to 3).
9. A lane's entry is written before the lane starts — F2, as is.
10. Codex later — F1, as is.

**Reading**
11. The reading values and how they are measured — folds F1 How the starting-text size limit is measured; The four
    reading values; Two reading-measurement findings.
12. What a role reads — folds F1 What a job reads before it builds; F2 Research is read through an index; F1 The smaller
    readings (its lane-reading point).
13. The smaller readings — F1, the rest of it.

**Accounts, setup and versions**
14. Onboarding and setting up a product — folds F2 Onboarding a product; Setting up an existing product; A product's
    token is made once.
15. Claude accounts and an account switch — folds F1 Checking the environment's permissions-management settings; F2
    PROCESS and the products it serves share one Claude account.
16. Secrets, production keys and tokens — folds F2 A product's repository may hold secrets; F1 Publishing a release (keys
    and release token part).
17. Moving a product to a Process4 version — folds F1 Moving a product to the latest version; F2 The order of a move ...;
    F2 Each session's copy of the process.

**Tranches and release**
18. A tranche opens: from main, by ARCH, with its scope — folds F2 A tranche branch starts from main; F1 No owner
    approval of a tranche; F2 A tranche's scope, recorded by ARCH.
19. A tranche ends: clean, merged with flaws named, or dropped — folds F1 How a tranche ends; F1 Releasing from a tranche
    merged with its flaws named; F2 How a dropped tranche is carried out.
20. An urgent fix while a tranche is open — F1, as is.
21. Publishing a release — F1, the publishing part.

**Jobs and the round**
22. A job's branch — F2 The form of a job's branch.
23. A job's commands: naming the pull request and marking ready — folds F1 Naming the pull request; F3 `ready` where
    there is nothing to mark; Tests-once item 1 (`ready`).
24. The round: slots, merge order and blocked jobs — folds Tests-once items 3 and 4; F2 A job whose block ARCH ended;
    F1 A walk-flaw module whose job hands the flaw back.
25. A job's tests, the test record and the required check — folds F1 The required check's name; F1 A told job's tests;
    Tests-once item 1; F2 A job's tests run on its branch brought up to the tranche.
26. When the tool's own tests run — F2, as is (the process repository).
27. What the check refuses — folds F1 fault D; F2 A declared use of a later module is refused; F2 The check refuses only
    what a structured comment states; Tests-once item 5.

**The notice**
28. Who a change tells — folds early-provider item 2; F3 unknown kind item 1; F3 second group items 2–3; F3 one name ...
    two entries; F3 a user the tool cannot follow fully; Tests-once "Folded in" (member bounds, refusal (b)).
29. How `notify` reads the product — folds F2 The tool's code reading on a large product; F2 The notice reads only what a
    merge can affect; early-provider item 1.
30. How a notice reaches a user — folds Tests-once item 2 and six-places; F2 Merging goes on; early-provider item 3; F3
    unknown kind items 2–3; F3 second group item 1.

**Walks**
31. The walks: the five matters — folds F1 walk matters 9.1, 9.2–9.3, 9.4, 9.5.

64 entries become 31 subjects.

## 6. Sizes

| File | Bytes | Entries | Owner's words (approx.) |
|---|---|---|---|
| design-decisions.md | 42,348 | 30 | 5,700 |
| design-decisions-2.md | 59,740 (260 under 60,000) | 29 | 7,400 |
| design-decisions-3.md | 9,852 | 5 | 600 |
| Total | 111,940 | 64 | about 13,700 |

Estimate for a consolidation by subject (31 subjects):

- Header and "How this record works": about 2,000.
- Rule as it now stands: about 50,000 bytes today across all entries (including F1's in-paragraph narrative, about a
  third of it); with duplicates merged (the notice alone repeats about 9,000 bytes of rule across its entries, to about
  4,500) and F1's narrative taken out, about 38,000 to 42,000.
- One "why" line and a research pointer per subject in place of each fix narrative: about 31 x 250 = 8,000.
- The owner's words, all kept: about 13,700.
- Titles: about 2,500.

Total: **about 63,000 to 70,000 bytes**, two files each well under 60,000 (or one file at about 60,000 if every "why" is a
pointer only). A consolidation that only merged clusters and kept every fix narrative would come to about 100,000 bytes,
still three files.
