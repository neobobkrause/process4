# Done: the record of decisions regrouped by subject (25 Nov 2026)

A worker's report for PROCESS, on the owner's decision "Decision: B, (ii)" of 25 November 2026 (clean up first, changing no
rule). Branch `work/cleanup-record`, from main at `5bed017`. It follows the subject list of `records.md` (section 5), with
one change: the audit's "Secrets, production keys and tokens" (16) and "Publishing a release" (21) are one subject, because
the owner's words on the keys and the release token are one quotation that serves both.

## Result

| | Before | After |
|---|---|---|
| Files | 3 (`design-decisions.md` 42,348; `-2.md` 59,740; `-3.md` 12,350) | 2 (`design-decisions.md` 50,732; `-2.md` 33,327) |
| Total bytes | 114,438 | 84,059 |
| Entries | 66 (30, 29, 7) | 32 subjects (20, 12) |

`design-decisions-3.md` is removed. Its header line "takes each new one" is gone; the first file's "How this record works"
now says a decision on an existing subject rewrites that subject's entry in place, a new subject goes at the end of the last
file, and a further file is started only when a file nears 60,000 bytes. Boilerplate repeated in every entry ("It adds no
test, gate, review or stop"; "Products receive it with their next move") is said once in the header, and each entry that
did add something on his word still says so.

## Old entry → new subject

F1 is the old `design-decisions.md`, F2 `-2.md`, F3 `-3.md`. New file 1 is `design-decisions.md`, file 2 `-2.md`.

| Old entry | File | New subject | New file |
|---|---|---|---|
| Routing an instruction the coordinator records as a standing note | F1 | How the owner's marked words reach the record | 1 |
| What a job reads before it builds | F1 | What a role reads | 1 |
| Reporting that an act cannot be done | F1 | A refused act, an act that cannot be done, and naming a role to message it | 1 |
| The required check's name | F1 | A job's tests, the test record and the required check | 2 |
| Naming the pull request for a job's commands | F1 | A job's commands: naming the pull request, and `ready` | 2 |
| The check and deliberate error-condition tests (fault D) | F1 | What the check refuses | 2 |
| Checking the environment's permissions-management settings on setup and an account switch | F1 | Claude accounts, the environment's settings, and an account switch | 1 |
| Moving a product to the latest (or a named) Process4 version | F1 | Moving a product to a Process4 version | 1 |
| Refreshing PROCESS across repositories, and re-attempting a non-substantive refusal | F1 | Option C part: PROCESS: who starts it and how others find it. Decision B's clarifications: A refused act, ... | 1 |
| The coordinator records the owner's words from a file | F1 | How the owner's marked words reach the record | 1 |
| How the starting-text size limit is measured | F1 | The reading values and how they are measured | 1 |
| The four reading values | F1 | The reading values and how they are measured (fill level cross-referenced from "When a role is refreshed, and its wake") | 1 |
| Two reading-measurement findings | F1 | The reading values and how they are measured | 1 |
| The design document carries no history — enforcing the separation | F1 | The design document carries no history | 1 |
| Showing a record entry is for transparency, not an approval gate | F1 | How the owner's marked words reach the record | 1 |
| How a tranche ends, and what shows its journeys complete | F1 | A tranche ends: clean, merged with its flaws named, or dropped | 1 |
| The terms "provider" and "user" | F1 | The terms "provider" and "user" | 1 |
| Publishing a release — who publishes, and production keys and tokens | F1 | Publishing a release, and where secret values are kept | 1 |
| An urgent fix while a tranche is open | F1 | An urgent fix while a tranche is open | 1 |
| A told job's tests — the three readings | F1 | A job's tests, the test record and the required check (point 3) | 2 |
| The smaller readings (part 10, section 1, item 7) | F1 | The smaller readings (part 10, section 1, item 7) | 1 |
| Which list of journeys counts (walk matter 9.1) | F1 | The walks' five matters | 2 |
| AI journeys in walks (walk matters 9.2 and 9.3) | F1 | The walks' five matters | 2 |
| A flaw set aside by ARCH (walk matter 9.4) | F1 | The walks' five matters | 2 |
| No owner approval of a tranche | F1 | A tranche opens: from main, by ARCH, with its scope | 1 |
| Parts walked by hand (walk matter 9.5) | F1 | The walks' five matters | 2 |
| Releasing from a tranche merged with its flaws named | F1 | A tranche ends: clean, merged with its flaws named, or dropped | 1 |
| Codex — Claude Code first, Codex later | F1 | Codex — Claude Code first, Codex later | 1 |
| A walk-flaw module whose job hands the flaw back (round-done gap) | F1 | The round: slots, merge order, blocked jobs and a flaw handed back | 2 |
| How a lane's marked owner-words reach the coordinator | F1 | How the owner's marked words reach the record | 1 |
| Standardized session names | F2 | Session names | 1 |
| How the coordinator finds the live PROCESS | F2 | PROCESS: who starts it and how others find it | 1 |
| PROCESS and the products it serves share one Claude account | F2 | Claude accounts, the environment's settings, and an account switch | 1 |
| The owner never edits a file or types a command | F2 | The owner never edits a file or types a command | 1 |
| A tranche branch starts from main | F2 | A tranche opens: from main, by ARCH, with its scope | 1 |
| Setting up an existing product under Process4 | F2 | Onboarding and setting up a product | 1 |
| A session can set its own name (seen to work) | F2 | Session names | 1 |
| Onboarding a product — the onboarding lane, ... | F2 | Onboarding and setting up a product | 1 |
| A product's token is made once, with every permission its development will need | F2 | Onboarding and setting up a product | 1 |
| When the tool's own tests run | F2 | When the tool's own tests run | 2 |
| A declared use of a later module is refused | F2 | What the check refuses | 2 |
| Each session's copy of the process | F2 | Moving a product to a Process4 version | 1 |
| Writing a lane's entry before the lane starts | F2 | Writing a lane's entry before the lane starts | 1 |
| The check refuses only what a structured comment states | F2 | What the check refuses | 2 |
| When a long-lived role is refreshed | F2 | When a role is refreshed, and its wake | 1 |
| A replaced session's scheduled wake | F2 | When a role is refreshed, and its wake | 1 |
| Research is read through an index | F2 | What a role reads | 1 |
| The form of a job's branch | F2 | The form of a job's branch | 2 |
| A product's repository may hold secrets | F2 | Publishing a release, and where secret values are kept | 1 |
| The tool's code reading on a large product | F2 | How `notify` reads the product | 2 |
| A job whose block ARCH ended says it goes on | F2 | The round: slots, merge order, blocked jobs and a flaw handed back | 2 |
| The notice reads only what a merge can affect | F2 | How `notify` reads the product | 2 |
| How a dropped tranche is carried out | F2 | A tranche ends: clean, merged with its flaws named, or dropped | 1 |
| Tests once in the job, notices that reach running jobs, merging after the modules a job uses, and slots | F2 | Item 1 and the owner's words: A job's tests, ...; item 2: How a notice reaches a user; items 3–4: The round ...; item 5: What the check refuses; `ready`: A job's commands ...; "Folded in": Who a change tells (member bounds), How a notice reaches a user (six places), What the check refuses (refusal (b)) | 2 |
| The order of a move whose new version changes the required-run workflow | F2 | Moving a product to a Process4 version | 1 |
| A tranche's scope, recorded by ARCH | F2 | A tranche opens: from main, by ARCH, with its scope | 1 |
| Merging goes on while a notice is worked out | F2 | How a notice reaches a user (slot refill also in The round ...) | 2 |
| A job's tests run on its branch brought up to the tranche | F2 | A job's tests, the test record and the required check | 2 |
| The notice after an early provider's merge: ... | F2 | Item 1 and the owner's words: How `notify` reads the product; item 2: Who a change tells (as narrowed); item 3: How a notice reaches a user | 2 |
| `ready` where there is nothing to mark | F3 | A job's commands: naming the pull request, and `ready` | 2 |
| The notice: an unknown kind becoming known, nothing lost to size or a race, no repeats | F3 | Item 1: Who a change tells; items 2–3 and the owner's words: How a notice reaches a user | 2 |
| The notice's second group carried out: ... | F3 | Item 1: How a notice reaches a user; items 2–3 and the owner's words: Who a change tells | 2 |
| One name exported by two interface files for two things is two entries | F3 | Who a change tells | 2 |
| A user the tool cannot follow fully is told of a changed function only where it may use it | F3 | Who a change tells | 2 |
| Cleaning up Process4 before further improvements | F3 | Cleaning up Process4 before further improvements (unchanged) | 2 |
| What PROCESS reads in full | F3 | What PROCESS reads in full (unchanged) | 2 |

The owner's identical words given once for several items are listed once under the subject that holds those items: his
"decision:B" and "Decision: all as you've recommended" of 22 November answered the refresh, the wake and the research index;
the refresh and the wake are now one subject, so those words appear there once (with the fuller parenthetical) and once
under "What a role reads".

## Stale rules rewritten to the rule as it now stands

1. "A product's repository may hold secrets": "the required run's second part holds no access token" is dropped; the update
   of 24 November removed the two-part run and that rule (design part 2 has no token clause).
2. "The notice reads only what a merge can affect": "one at a time" is now "several to a reading"; "those with an import it
   cannot follow (counted in, as "cannot follow")" no longer says they are told: who is told is under "Who a change tells".
3. "The notice after an early provider's merge", item 2 ("told of every change to its listing that tells any user") is
   replaced by the 3B narrowing; its "known limit" on a job block's size is replaced by the block kept under 60,000
   characters.
4. "Tests once in the job", item 1 now follows bringing the branch up to the tranche; item 2's "at once" now means when the
   background `notify` ends, a user merged meanwhile getting its notice from waiting work.
5. "The tool's code reading on a large product": its "Not known" (answered the same day) is dropped.
6. "How a dropped tranche is carried out": "otherwise it runs as any other branch" and the 45-minute narrative are dropped;
   the rule now follows design part 3, section 5 (see below).
7. "The form of a job's branch": "the required-run workflow ... reads a job's block as before" is dropped (the workflow now
   reads the test record).
8. "The check refuses only what a structured comment states" and "A declared use of a later module is refused": "inside a
   module's own tests" is now "part of a module's tests, run by `p4 test` before the tests in scope"; a declared use with no
   visible import is "cannot tell"; the check reads `require` and imports by the product's own name, so "a package name" is
   no longer listed among references it cannot see.
9. "Naming the pull request for a job's commands": `test` added to the commands that take `--branch` (as `tool/p4.mjs`
   shows).
10. "Refreshing PROCESS across repositories" and "The smaller readings": their parenthetical pointers to later entries are
    replaced by the rule as it stands (owner-start; a lane reads research through an index).
11. "Tests once in the job": "ARCH holding requirements out of a tranche (still on his page)" is dropped; it was decided
    (option D, "A tranche opens ...").
12. The record's own header: "A rewritten entry is shown to the owner once before it stands" now says, as design part 5,
    section 5 does, that the showing is for transparency and is not an approval gate. F2's header ("both files are read")
    and F3's are gone.

## Where the design and the record differ

- **A lane's folder needs no module tests.** The record ("The smaller readings", "Decision: as recommended", 20 November
  2026) has the owner confirming it; design part 2, section 9 still says "The owner has not confirmed this." The rule is the
  same in both; only its confirmation differs. The record is unchanged here; PROCESS may want the design's sentence looked
  at in the design's cleanup.
- **A dropped tranche's pull request.** The record said the required run passes it at once only when every file is main's
  own, "otherwise it runs as any other branch" (the removed run). The design says only that it runs none of the tests "and
  only when every file it changes is the main branch's own". The new entry follows the design; what happens to a drop pull
  request with a file that is not main's own (ARCH's session testing each touched module whole, the run the drop meant to
  avoid) is stated nowhere. The audit (`records.md`, 3.6) raised the same point.
- **A user the tool cannot follow fully.** Design part 2, section 7, decision 2 says "a changed function, method or value"
  and "a kind"; the record (3B) says "function, method, value or class member" and lists "a kind, handle kind, class,
  operation, table or table of operations", and its list of unreadable reaches is a little fuller. Not a conflict: the
  design is the shorter statement. The entry keeps the record's fuller wording, which the tool and build text 5, section 6
  carry.

No other current rule was found to differ from design parts 1 to 7.

## Verification

Scripts in `/tmp/p4check/` (not committed):

- `check.py`: every double-quoted string longer than 15 characters in the "The owner's words." paragraphs of the three old
  files (`git show origin/main:<file>`) is searched for, byte for byte, in the two new files. **76 checked, 0 missing**, 0
  differing only in white space.
- `units.py`: each quotation with its date and its parenthetical, white space normalised. **86 checked, 0 missing.**
- `short.py`: quotations of 15 characters or fewer with their dates, counted: every one present ("decision:B" of 22 November
  3 → 2, as above).
- `allquotes.py`: every double-quoted string in the old files, anywhere, absent from the new files, read by hand: entry
  titles, terms and narrative quotations only; none of the owner's words. His words quoted outside "The owner's words." (his
  requirements of 23 November; the drop of t1; "I think that the reason ..."; the "Folded in" and refresh quotations) are
  kept with their line breaks.

## Outside this change

- `process/lanes/civicsmith/` (conversion plan, tokens, settings checklist, two research files) names the entry "A product's
  repository may hold secrets" in `process/design-decisions-2.md`; it is now in "Publishing a release, and where secret
  values are kept" in `design-decisions.md`. Those are dated withdrawal notes in the lane's folder; not changed.
- `process/handover.md`, section "Decided and built by PROCESS #6 on 22 Nov", says its entries are in `design-decisions-2.md`;
  several are now in `design-decisions.md`. Only its mentions of `design-decisions-3.md` were changed, as asked.
