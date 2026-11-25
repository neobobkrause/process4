# The uses file: what the governing texts would have to change, and what binds the design (25 Nov 2026)

A worker of PROCESS #15, on the owner's proposal in `process/research/uses-metadata-25nov.md`. Read only; nothing here is
decided. Quotations are exact; "d2 §7" is design part 2, section 7; "b5 §6" is build text 5, section 6; line numbers are of
the files at this commit.

## Summary and bottom line

1. **Inference sits in about thirty sentences across nine texts.** The core is d2 §7 rules 1 and 2, the "not followed
   fully" machinery (b5 §6, 3,402 bytes), the related-tests following (b5 §7, 1,942 bytes; d2 §7 "Which tests relate"),
   the merge wait's reading of imports (d2 §8; b1b cmd 6), `notify`'s staged reading (b1b cmd 11), the walk areas' "users"
   (b3 §2), and the trial's expectation (b4). Section 1 lists each with what it would become.
2. **The rule it reverses, d2 §7 rule 1 ("No list is kept by hand"), is not in quotation marks, and neither decision
   record holds it.** By the design's convention (part 0 §3, "A rule with no mark is the owner's ruling, or follows from one
   directly") it counts as his ruling, but his own words for it are not on record. It was carried in from the earlier
   design under the heading "For the tool that finds the change" (renamed "Rules for..." at the cleanup, f44954f, 25 Nov).
   The proposal also changes three marked decisions: "Who a change tells" item 3 ("Decision: 3b", 25 Nov), "A job's tests"
   item 3 ("Decision: as recommended", 20 Nov), and "The round" item 2, the merge wait (in "Decision: the update plan as laid
   out", 24 Nov). It carries out a step he named himself on 24 Nov: "The goal is to bring declared uses in line with real
   uses." The proposal is conversation, not marked, so nothing changes until his "Decision:".
3. **Form limits: the job's reading set is 170,742 bytes (verified by summing; 161,967 with part 08), leaving 4,258 under
   175,000 before the product's own files.** `job.md` is 4,264 bytes (about 4,427 as filled) against 8,192, and has 10
   rules, the maximum. `arch.md` is 4,809 bytes (about 4,919 as filled), also with 10 rules. So any new job duty has to
   share an existing rule line. In the job's set, about 5.7 KB of inference text could go or shrink (b5 §6 and §7, d2 §7
   rules 1 and 2 and four bullets, b2b §6's last bullet, b5 §5's notFollowed line). That is more than the uses file's form
   and duty would add (estimated 1.5 to 2.5 KB). A second way to make room: split b5 so a job reads only §5.
4. **Binding rules.**
   - Where it lives: "Every file ... belongs to exactly one of these" allows two places. Inside the module's `files` path,
     the job owns the file, but the tool counts it as module code: a change to it alone runs the module's whole tests, and
     ARCH may change it only by the mechanical edit. Beside the requirements file in `process/modules/`, it is the module's
     own (as the requirements file is), runs no tests, and a module-list change can rewrite it.
   - Keeping it accurate: the existing check of declared uses can read the file's provider list with no new refusal, if
     the file becomes the declared uses. Refusing at entry level (an imported name the file does not list) would be a new
     refusal. "The owner approved two refusals, and no other is taken" and "must not add a new test, gate, review or stop"
     allow that only on his marked word; the 22 Nov later-module refusal is the precedent.
   - The first job on every module needs a new kind of work in d2 §3 point 1, or it can follow the "no comments yet"
     pattern (the module's next job writes the file first, as a step of its own).
   - A module split leaves users' files stale until their told jobs run. A rename needs the files in the mechanical edit.
5. **The module list's declared uses can be replaced by the file's provider list.** Six readers in the tool would read the
   file instead: `check`, the type-check program behind refusal (b), the merge wait, `notify`'s candidates and
   "not followed" cause 1, and `walk areas`. Text changes would follow in b2 §3 (the entry drops to four fields), the job's
   acts and rule 4, part 0's glossary, b1 §2, and d2 §§1, 6, 7, 8. The entry's `uses` is already the one field a job
   writes, so moving it into a job-owned file changes no writer.

## 1. Every sentence that states or assumes the tool infers uses from code, and what it would become

### Design part 2

| Where | Quoted | Would become |
|---|---|---|
| §1, bullet 1 | "A use of a later module is a design error ... The check of declared uses refuses one (section 6)." | Unchanged in substance; "declared uses" now read from the uses file. |
| §3, point 7 | "once no job is open among the modules this one uses (section 8)" | Unchanged words; §8 defines "uses" from the file. |
| §6, bullet 9 (line 61) | "Module tests include, in the words of the record, "a check that the module's declared uses match its imports". ... It reads every import the module's files make ... A use that no import shows ... it cannot see: a declared use with no import it can see is "cannot tell", not refused." | Same check, with "declared uses" being the providers the uses file names. Imports are still read by code scan (this inference stays: it is how the file is checked). Whether to check at entry level is a new refusal (section 4). |
| §7, "How it is found" (line 71) | "The tool writes out the module's interface, from its code and its structured comments together, before and after" | Unchanged: this is the provider's listing, not users. (F1, "really changed", is the other half and is not this file's.) |
| §7, "Who is told" (line 72) | "In the owner's words, "ideally only the users of the entry that changed". The tool sends the notice and decides to whom." | Unchanged; the tool decides by reading the uses files (still "one right answer", part 4 §1). |
| §7, "Which tests relate" (line 76) | "The notice carries the places in the told module's files that name the changed entry. The related tests are the module's test files that hold such a place, or reach code that holds one, or reach code the told job itself changed, together with any test file the job changed." | "The notice carries the files the told module's uses file names for the changed entry." Related: the test files it names for the entry (marked tests or both), plus the test files the job changed. For test files that exercise a named code file, either keep "reach" (inside-module following, unproven) or replace it with a one-step import rule (test files that import a named code file). This needs a design choice: the file gives files, not calls. |
| §7, three points (line 80) | "where the tool cannot follow a told module's code, that module's whole tests run, since the tool cannot say which relate" | Kept only if "reach" stays; otherwise: "where the told module has no uses file, its whole tests run". |
| §7, Unproven (line 81) | "that the tool can follow from a use to the tests that reach it inside a module, and can tell when it has lost the thread" | Goes if "reach" goes; else stays. |
| §7, "When the module list changes" (line 82) | "the tool makes the interface listings of the modules touched before and after, and the users of any entry whose listing differs are told ... Where only a provider's name changes for its users, their code is changed by a mechanical edit." | Users found from their files (the entry moved shows as `removed` in the old module, so its recorded users are told). Add: the mechanical edit also rewrites users' uses files. See section 4. |
| §7, "A declared use that no code makes" (line 83) | "The tool cannot follow it, so it is told as point 2 below says. The check of declared uses calls it "cannot tell" (section 6); the module's job removes a declaration no code makes." | "A provider the uses file names with no import seen is "cannot tell" in the check; it is told of the entries the file names." The point-2 fallback goes. |
| §7, rule 1 (line 87) | "Which parts of a provider a user uses is worked out by the tool from the user's code and comments. No list is kept by hand." | Reversed: "Which parts of a provider a user uses is recorded by the user's job in its uses file: each provider, each entry, code, tests or both, and the files. The tool reads the files." |
| §7, rule 2 (line 88) | "A user the tool cannot follow fully is told of every change to a kind of that provider that tells any user. Of a changed function, method or value it is told only where it may use that entry ... (build text 5, section 6, names those ways and the two misses accepted)." | Goes for modules with a file. Kept, or a plainer "told of every change that tells any user", only for a module with no uses file yet (the transition). |
| §7, rule 5 (line 91) | "Calls made by name are made followable: each provider publishes one table of its operations, the tables are gathered into one list, and each shared piece that carries a call by name has one comment tying the name to that list." | The table stays (the provider's listing needs its operations to see a change). "Made followable" and the carrier's tying comment exist to find users. They could go, or stay for `check`'s carrier reading (`check.mjs` treats a carrier call as a seen use). A design choice. |
| §8, bullet 2 (line 100) | "A job's pull request merges once no job is open among the modules it uses: the earlier modules its files import, followed file to file as the notice reads them, and those it declares, directly or through others. ... A use that no import shows (section 6) and that is not declared is missed here, as by the notice." | "the modules its uses file names, and theirs in turn ... A use the file does not record is missed here, as by the notice." |
| §9 | "Requirement text, the module list, and the process's named files. These change no code and no tests" | Depends on where the file lives (section 4). |

### Design parts 0, 4, 6, 10

- Part 0 §6 glossary: "**Declared uses:** the modules a module states that it uses." If the file replaces the entry's
  `uses`: "the providers a module's uses file names".
- Part 4 §1: "whatever has one right answer is done by the tool: ... when a notice is sent and to whom". Unchanged.
- Part 4 §11, "For a job": "writes there the job's kind, the work placed and the uses its notice carries". Unchanged. The
  word "uses" now means three things: the notice's reasons, the declared uses, and the file. Naming constraint: the file
  needs a name that does not collide with the job block's `uses`.
- Part 6 §5, the tool's list: "write out a module's interface listing and send notices; ... hold a job's merge while a job
  of a module it uses is open; list a told job's related tests; ... inside a module's own tests, check declared uses".
  The words survive. Adding "read each module's uses file" is optional, since part 6 §5 lists acts, not methods.
- Part 10 §2 item 12: "what the tool means by "cannot follow" and "reaches". Written: build text `05-...`". This shrinks
  to "reaches" only, or goes. Part 10 §3 and §4 item 16 ("a merge that waits for a job of a module it uses") are
  unchanged.

### Build texts

- **b1b cmd 6, `merge`** (line 20): "The modules it uses are the earlier modules its code and test files import, followed
  file to file as `notify`'s staged reading follows them (relative paths, `require`, the product's own package name), and
  those it declares, then their own uses in turn ... No language reader is loaded. An import the scan cannot follow, such
  as a computed one, is not waited on." Would become: the providers its uses file names, closed over theirs, read at both
  commits. `tool/lib/uses.mjs` would mostly go.
- **b1b cmd 11, `notify`** (lines 27 to 35, 4,043 bytes). Three passages change.
  - "How it reads, in stages ... it reads only the later modules that can reach the changed one: those whose imports,
    followed file to file, lead to it; those that declare it; those that reach a carrier ...; and those with an import
    the scan cannot follow." This becomes: it reads the uses files of later modules that name the changed module.
  - "It finds the users of each such entry in every later module, declared or not. A user it cannot follow fully is told
    as build text 5, section 6 says." This becomes: the users of the entry are the modules whose files name it.
  - The memory allowance and the two-hour background command could shrink. The listing of the changed module and of
    modules "changed through" it still needs the reader.
- **b1b cmd 18, `check`**: "Declared uses against the imports of the module's source and tests ... A declared use with
  no import seen is "cannot tell"". The same check reads the file's providers. Entry level would be new (section 4).
- **b1b cmd 24, `related`**: "as step 5 of build text 1, section 5 picks them". This follows the new related rule.
- **b1 §2** (line 34): "What the tool reads from the product: ... interface files and declared uses". Add "and each
  module's uses file", or move declared uses there.
- **b1 §5 step 5** (line 79): "**related**: the list that build text 5, section 7 defines, chosen by whole file, and one
  step wider each time the tool loses the thread, up to the whole module." This follows the new rule.
- **b2 §3**: the entry's "exactly five fields" and "`uses`: its declared uses, by name". Also "**Decided here:** a job may
  change the `uses` of its own entry and nothing else in the list ... A job adding a use of a later module is refused by
  `check` in its own module's tests". Either kept, or the field goes and this moves to the uses file's form.
- **b2b §5** (line 70): "A name the tool cannot read leaves the user not followed (build text 5, section 6)." With the
  file, the job records `op:<name>`, so this goes. Line 72 ("are followed as calls by name are") goes the same way.
- **b2b §6**:
  - "Comparing" (line 100): "A later module whose listing changed though its files did not ... is "changed through" it,
    and its users are told too." This stays. The users of the passing module's entry are found from their files, which
    name that module's entry.
  - Last bullet (line 126): "**An entry's users** are found in every later module, declared or not (build text 5, section
    6). A user not followed fully is told as build text 5, section 6 says". This becomes: they are found from the later
    modules' uses files.
- **b3 §2** point 3: "A changed module that names none takes the areas of its users, followed upward". Today
  `tool/lib/walk.mjs:142` reads users as "later modules that declare it in uses". It would read the files instead.
- **b4 §** "what the trial shows" (lines 93 to 95). Item 1, "A provider's interface change tells only the users of the
  changed entry", stays. Item 3, "The tool says so when it has not followed a module fully, and that module's whole tests
  then run", becomes the case of a module with no uses file.
- **b5 §5**:
  - `lines` (line 146): "`lines` are the places in the told module that use the entry". These become the files the uses
    file names, or stay as lines only if the file records lines. The owner asked for files; PROCESS #14 said "the files".
  - The notFollowed reason (line 147) goes for modules with a file.
- **b5 §6, the whole section** (3,402 bytes): "**Who is a user.** Every later module in the order, declared or not. Uses
  are read from the user's source and tests ... A **use** of an entry of provider P by module U is a file and line in U
  that the reader resolves to that entry's declaration", the four causes of "Not followed fully", the narrowing, and the
  "Accepted misses". This would be replaced by a short "who is a user: a module whose uses file names the entry". Cause 1
  ("U declares P and no use of P is found in its code") disappears, because the file names the entries.
- **b5 §7, "Reaches"** (1,942 bytes). This shrinks or goes, as decided for d2 §7 "Which tests relate".
- **b5 §8** item 3 mentions §6's forms. It is edited with them.

### Starting texts

- **`job.md`**:
  - Header line: "The job block there holds your work, your kind (ordinary or told) and the uses a notice carries".
    This stays.
  - Acts: "change `uses` in its entry". This becomes "write and keep its uses file", or is covered by "Write the
    module's own files" if the file is inside the module.
  - Rule 2: "If the module has no structured comments yet, add them first, as a step of their own". This could take
    "and no uses file" (section 4).
  - Rule 4: "The module's declared uses match its imports, its test files included. Remove a declared use that no code
    makes." This becomes the uses-file duty.
  - Rule 6: "(`related` lists the tests that relate)". This stays.
- **`00-index.md`** §2: "A job reads four because it writes structured comments, its entry's `uses`, the `[met]` mark and
  walk steps". This becomes "its uses file".

### The decision record (`process/design-decisions-2.md`)

Each entry below would be rewritten in place:

- "The round", item 2: "the earlier modules its files import, followed file to file as the notice reads them, and the
  modules it declares ... A use made by a path and not declared is missed here, as by the notice."
- "A job's tests", item 3: "where the tool cannot follow a told module's code, that module's whole tests run ...
  Unproven: that the tool can trace a use to the tests that reach it."
- "What the check refuses", item 3: declared uses.
- "Who a change tells", item 3: the narrowing for a user not followed fully.
- "How `notify` reads the product", items 1 to 3: the staged reading of "the later modules that can use it".
- "How a notice reaches a user", item 3: "A "not followed fully" reason keeps its first six places and a count".

## 2. The owner's own words: which rulings the proposal reverses or refines

The design's convention (part 0 §3): "Words in quotation marks are the owner's, exactly as typed ... Where a quotation is
not among his typed words and comes through an earlier record, the line says which record." And: "A rule with no mark is
the owner's ruling, or follows from one directly."

**Reversed.**

- **D2 §7 rule 1: "Which parts of a provider a user uses is worked out by the tool from the user's code and comments. No
  list is kept by hand."**
  - The design carries it without quotation marks, so these are not shown as his typed words.
  - No entry in `process/design-decisions.md` or `process/design-decisions-2.md` holds it, and no subject in
    `decisions-index.md` names it (searched for "by hand" and "worked out by the tool").
  - It stood under "For the tool that finds the change:" before the cleanup of 25 Nov (commit f44954f) renamed the heading
    "Rules for the tool that finds the change"; the record's entries called these lines "decision 2" and so on.
  - Its origin is earlier than this repository's shallow history (the oldest commit here, 10bc086, already has it). It
    may be in the earlier process (public `neobobkrause/process3`); I could not search that repository from this session.
  - So: it is his ruling by the design's convention, but the record cannot show his words for it. Say so plainly when it
    is put to him.
  - Part 1 §4 governs how a reversal lands: "His latest statement replaces any earlier one, without a question to him.
    No session sets his older words against his newer ones." That applies only to a marked statement. His proposal of
    25 Nov is conversation ("Not marked: conversation, not a decision", `uses-metadata-25nov.md`).

**Refined or superseded (marked decisions in the record).**

- **"Who a change tells", item 3.** The narrower rule for a user the tool cannot follow fully: "On a user the tool cannot
  follow fully: "Decision: 3b" — 25 November 2026". With a uses file, "not followed fully" stops arising for a module that
  has one. 3B survives only for a module with no file.
- **"A job's tests, the test record and the required check", item 3.** "where the tool cannot follow a told module's
  code, that module's whole tests run". His words: "On a told job's tests, the three readings: "Decision: as recommended"
  — 20 November 2026." The design states the three readings as "Three points on what the owner's rule means" (d2 §7,
  line 80). The first two stand ("a told job's own edits count among "the changed parts""; "tests are chosen by whole
  file"). The third changes if related tests come from the file.
- **"The round", item 2 (merge order).** "followed file to file as the notice reads them, and the modules it declares".
  This came with the update: "Decision: the update plan as laid out" — 24 November 2026. The "Why" gives his requirement
  that "the round wait for the earliest running job a job depends on". That part is not in quotation marks there; it is
  PROCESS's summary. The wait's purpose stands; only how "uses" is read changes.
- **"How `notify` reads the product".** Its "Why" (PROCESS's words, not his) records: "The owner's uses-file idea (a file
  per module written at its job) was built and tested: same answers, little gain once kinds are worked out once." His
  decision there was "Decision: B, as recommended" (25 Nov, the three fixes). B did not take the uses file, so nothing of
  his is reversed. But PROCESS's recorded finding of "little gain" must be distinguished:
  - That file cached the tool's own inference and went stale with "any change in a module's import closure"
    (`notify-slow-early-provider-25nov.md`).
  - This file is authored by the job.
- **"What the check refuses", item 3.** "On a declared use of a later module: "decision: option B, as recommended" — 22
  November 2026". This holds and carries over to the file's providers.

**Quoted words the proposal serves or must keep (not reversed).**

- D2 §7: "ideally only the users of the entry that changed". Entry-level records serve this directly. It is not in either
  decision record.
- D2 §7: "any change to either a provider's domain or range necessitates that its users be retested. But if both domain
  and range stay the same, then no retesting of users is needed." The file answers who uses an entry, not whether it
  changed (F1 stays to be designed). It is not in the record files.
- D2 §6: "a check that the module's declared uses match its imports" ("in the words of the record", an earlier record) and
  "I think it has to check tests too". Both are kept if the file becomes the declared uses: the check reads it, tests
  included. The owner's "the metadata should indicate whether references to a provider is in the module code, tests, or
  both" fits this.
- D2 §3: "Yes, a job writes its own tests. That's an important responsibility." This is the model for a job writing its
  own uses file.
- D2 §3: "A job for module A isn't allowed to change module B. The only other way of editing a module is when a
  mechanical edit (like a word table change) makes the change." This binds who may edit a uses file (section 4).
- His framing of 24 Nov (conversation, `process/research/update-plan-24nov.md`): "Another big change that will be
  researched is whether it's possible (and how) to update module and test code so that all references to other modules
  is done in a way that the provider's list of users is much more accurate than is currently possible. The goal is to
  bring declared uses in line with real uses." The record's entry "A job's tests" notes it: "A later step he named, not
  part of it: bringing declared uses in line with real uses." The proposal is that step.

## 3. Form constraints

**The job's reading set** (`starting_texts/job.md`, "Read in full"; sizes by `wc -c` at this commit):

| Text | Bytes |
|---|---|
| design 00 | 10,448 |
| design 01 | 11,967 |
| design 02 | 19,564 |
| design 04 | 23,115 |
| design 05 | 5,971 |
| design 06 | 15,277 |
| design 07 (Claude Code) | 13,264 |
| build 02 | 15,556 |
| build 02b | 11,575 |
| build 03 | 20,827 |
| build 05 | 23,178 |
| **Total** | **170,742** (with part 08, 4,489 bytes, in place of 07: 161,967) |

- The handover's figure is right: 4,258 bytes under 175,000. The job's set also names the ranking page, ARCH's decision
  record, the order file, its entry, its requirements file and its pull request, none of them measured. The design says
  so (`00-index.md` §2).
- An aside, outside this question: `00-index.md` §2 gives build 05 as 23,346 bytes and part 04 as 22,943. Today they
  measure 23,178 and 23,115. Its §1 says "every file is plain ASCII", but eight of the job's eleven texts hold a few
  non-ASCII characters. `wc -c` counts bytes, so the totals stand.

**Where the new text would go.**

- The form of the uses file: in b2 §3 beside the entry, or a new b2 section. A job already reads b2. That is about 1 to
  1.5 KB with an example.
- The duty: in d2 §3 or §7 (one or two bullets, about 0.5 KB), and in `job.md` rule 4 (rewrite in place).
- The first-writing job: in d2 §3 point 1 and §4 if it is a new kind of work (about 0.3 KB). In ARCH's text only if ARCH
  places it; `next-job` could find a missing file itself.
- Estimated addition to the job's set: 1.5 to 2.5 KB, which fits in 4,258. Anything more needs room made.

**What could be removed from the job's set** (bytes measured):

| Text | Bytes |
|---|---|
| b5 §6, "Cannot follow" | 3,402 (replaced by perhaps 300) |
| b5 §7, "Reaches" | 1,942 (if related tests come from the file) |
| b5 §5, the notFollowed line | 181 |
| d2 §7 rule 2 | 437 |
| d2 §7 rule 1 | 127 (rewritten, not removed) |
| d2 §7, "A declared use that no code makes" | 222 |
| d2 §7, "Unproven" | 198 |
| b2b §6, last bullet | 267 |
| d2 §8, merge wait | 340 (shortened) |

That is about 5.7 KB in the job's set if "reach" goes, about 3.6 KB if it stays. b1b cmd 11 (4,043 bytes) also shrinks,
but b1b is not in the job's set. A larger lever is structural: a job reads b5 for its §5 forms (5,651 bytes). Moving §§6
to 8 (6,409 bytes) to a separate text frees 6.4 KB with no loss to the job. Moving §§1 to 4 (10,357 bytes, the shared
state, which "A job writes none" of) as well frees more. The index says "Each role that writes a record of the shared state
reads build text 5", and a job writes none.

**The job's starting text.**

- `job.md` is 4,264 bytes; the index gives 4,427 as filled. The limit is 8,192, so about 3,765 bytes are free. Size is
  not the binding limit.
- The rule count is: `grep -c` gives 10 numbered rules, the maximum ("at most ten rules", part 5 §2; part 4 §11).
- Any new duty must go on an existing line:
  - Rule 4 (116 bytes) is the natural home: "The module's declared uses match its imports ...".
  - Rule 2 (125 bytes, "If the module has no structured comments yet ...") can take "or no uses file".
  - The acts line "change `uses` in its entry" changes in place.

**ARCH's starting text.**

- `arch.md` is 4,809 bytes (about 4,919 as filled), with 10 rules, also the maximum.
- ARCH needs a change only if it places the first-writing jobs, or must carry users' files in a mechanical edit (rule 1
  already covers "the mechanical edit"). Rule 2's "Run `notify` for each merge as its own background command, keep
  merging meanwhile" can stay as it is.
- ARCH's reading set is 156,877 bytes (verified), so 18,123 are free.

## 4. Design rules that bind the proposal

**"A change must not add a new test, gate, review or stop. It may only correct or remove what is broken."** (Part 6 §7,
"What follows from them".)
- The uses file is product-side record work, not a test, gate, review or stop. Writing it is a duty, like writing tests
  and comments.
- The first job on every module is work, not a gate. It needs a new kind of work, since d2 §3 point 1 defines work as "A
  requirement ... or a walk flaw, a notice, or a flaw reported by another module's job".
- It must not become a stop. Nothing may refuse a merge for a missing or late file. A module with no file falls back
  (below).
- The proposal removes what is broken: the not-followed over-telling (F2, F3).
- The job's "Never" line, "add a test, check, gate, review or stop that serves the process", and d2 §6, "A test or step
  that serves the process is not allowed": no product test may check the uses file.

**"Every file in the product's repository belongs to exactly one of these: a module; a lane's folder; or the process's own
named files (... the module list ...)."** (d2 §1.) Two places fit.
- **(a) Inside the module's `files` or `tests` paths.** The module owns it and only its job writes it ("A job writes
  only its own module's files").
  - The tool's scope counts every file under those paths as module code or tests (`tool/lib/scope.mjs`, `ownerOf`). A
    pull request changing only the file therefore runs the module's whole tests. The first-writing job on 204 modules
    would run 204 modules' whole tests with no code changed, against "A test runs only when there is a fully informed
    reason to run it" (d2 §6). The tool would have to exempt it, as it exempts the walk folders.
  - ARCH could change it only by "the mechanical edit", whose moment is "when no job is open, between a round's last
    merge and its internal walk" (d2 §9).
  - A module split puts the file in one of the two halves by "the longest matching path" (b2 §3). The other half starts
    with no file.
- **(b) In `process/modules/<name>.uses.json`, beside the requirements file.** A requirements file is not among the
  named files listed, so it belongs to its module. Its job writes the `[met]` mark, and "Requirement text, the module list,
  and the process's named files ... change no code and no tests, so their pull requests merge ... with no module tests
  run" (d2 §9).
  - The entry's `uses` is already the one field a job writes outside its code ("a job may change the `uses` of its own
    entry and nothing else in the list", b2 §3).
  - Place (b) runs no tests for a file-only change.
  - ARCH can rewrite users' files in the same module-list change at a split or rename, with no mechanical-edit window.
- The owner said only "every module maintain a metadata file". "Inside the module's files" is PROCESS #14's word, not his.

**"A job writes only its own module's files."** (d2 §3, "held by the job's instructions and by no check".)
- The file is written by its own module's job only, and it is about providers, so a provider's job never edits its users'
  files.
- A provider's change reaches users only by notice. Each told job updates its own file.
- Keeping it current is held by text, a known limit (part 6 §1: "Rules held by text alone are a known risk").

**The check of declared uses, and "The owner approved two refusals, and no other is taken"** (d2 §6).
- The two refusals are about structured comments (a) and provider interfaces (b). The declared-uses check is a separate
  part of module tests, "a check that the module's declared uses match its imports", which already refuses two things:
  - an import of a module not declared (`check.mjs`, "imports X, which ... does not declare in uses");
  - a declared module that is not earlier (`check.mjs:649-653`).
- If the uses file's provider list becomes the declared uses, the same check reads it, and nothing new is refused. This
  is what the texts allow without his word.
- Comparing at entry level would be a new refusal: an imported name of P that the file does not list for P, or a
  code/tests mark that disagrees with which files import P. The record's precedent: the later-module refusal "makes an
  existing check refuse one more thing, on his word" ("What the check refuses", Why; "decision: option B, as recommended",
  22 Nov). So an entry-level refusal needs his marked decision.
- Under the texts as they stand, without it, a mismatch at entry level may only be "cannot tell", printed and not refused.
- Whatever the check cannot see stays "cannot tell": "a declared use with no import it can see is "cannot tell", not
  refused" (a use by path, a started program). The file is how such uses become known at all.
- Refusal (b) itself depends on declared uses. `check.mjs:390` builds the type-check program from the module's files plus
  the declared providers' `public` files. Replacing the declared uses must feed the same list.

**A module with no comments yet** (d2 §7): "The first thing its job does is add the structured comments, as a step of their
own, describing the module as it stands; that step is a description, which tells no one." (`job.md` rule 2.)
- The same pattern fits a module with no uses file: its next job writes it first, as a step of its own.
- A missing file tells no one of the module's own change, but the module is a user that must be found. Until it has a
  file, the tool must either keep inferring for it (today's machinery, kept for the transition) or tell it of every change
  that tells any user of a provider it imports.
- The owner asked for "a job to run on every module" so that every module has a file before the tool relies on it. Two
  routes:
  - A dedicated job per module, which needs a new kind of work and costs one job per module once (204 on civicsmith).
  - The no-comments pattern, which needs no new kind of work but leaves the fallback in place until every module has had
    a job.
- Either way, the first file needs the provider's entry names. A job already has `p4 listing` among its acts. The file
  names entries as the listing does (b2b §6: `<name>`, `<file>:<name>`, `Name.x`, `Name#x`, `op:<name>`, `table:<name>`).

**The mechanical edit** (d2 §9).
- "A worker in ARCH's session makes it as one change covering every affected module, and it is merged once; and the
  moment: when no job is open, between a round's last merge and its internal walk." And from d2 §7: "Where only a
  provider's name changes for its users, their code is changed by a mechanical edit."
- With the file, a provider's rename must rewrite every user's file in that same edit, or the files go stale.
- An entry rename is `removed` plus `new entry`, which tells its users. Their told jobs update their own files; no
  mechanical edit is needed.

**When the module list changes** (d2 §7).
- "A change to the list sends no notice of itself. Where it moves code between modules or splits a module, the tool
  makes the interface listings of the modules touched before and after, and the users of any entry whose listing differs
  are told".
- With files, a provider's split shows as `removed` in the old module and `new entry` in the new one. The users the files
  record for the removed entries are told, and their told jobs re-point their files.
- Until then their files name entries that no longer exist. A later change to the new module finds no recorded users of
  those entries: a missed notice, which the design accepts ("It is a way of saving work, not a guarantee").
- Mending this needs one of:
  - ARCH rewrites the affected files with the list change (easy at place (b); a mechanical edit at place (a));
  - the tool maps old entries to new from the two listings when reading files.
- A user module's own split leaves one half without a file (place (a)) or needs ARCH to divide it (place (b)).
- A rename of the user module itself moves its file at place (a), or renames it with the entry at place (b).

**Two more binding lines.**
- "Nothing refuses a job or a merge for size" (part 5 §3). A large module's file must not be refused for size.
- "A session acts only on what it has read in full or measured" (part 5 §1). The first-writing job must read the whole
  module's code, using workers for a large one (part 1 §6), and must be replaced at the fill level from its branch.

## 5. Could the uses file replace the module list's declared uses, and what reads them today

**What reads declared uses today** (the entry's `uses`, `process/modules/<name>.json`):

| Reader | What it does with them |
|---|---|
| `check` (`tool/lib/notice/check.mjs` `declaredUses`, 625-667; b1b cmd 18; d2 §6) | Refuses an undeclared import of another module; refuses a declared module that is not earlier; "cannot tell" for a declared module with no import seen. |
| `check`'s type-check program (`check.mjs:390`) | Builds the program from the module's files plus each declared provider's `public` files, which refusal (b) checks against. |
| `merge`'s wait (`tool/lib/uses.mjs:114`; b1b cmd 6; d2 §8) | Adds declared modules ("declares") to the imported ones, closed over theirs. |
| `notify`'s candidates (`tool/lib/notice/staged.mjs:254`; b1b cmd 11) | Reads "those that declare it" as possible users. |
| `notify`'s answer (`tool/lib/notice/notice.mjs:430` and following; b5 §6) | "Not followed fully" cause 1 ("U declares P and no use of P is found"); the note "uses pricing without declaring it"; the "not told" line. |
| `walk areas` (`tool/lib/walk.mjs:142`; b3 §2 point 3) | "Users of a module: later modules that declare it in uses". |
| The order rule (b2 §3) | "every name in `uses` stands on an earlier line of the order file". |

Texts that name them:
- part 0 §6, glossary;
- d2 §1 ("The check of declared uses refuses one"), §6, §7 ("A declared use that no code makes"), §8;
- b1 §2;
- b2 §3, the field and the "Decided here";
- `job.md`, acts and rule 4;
- `00-index.md` §2;
- the record's "What the check refuses" item 3 and "The round" item 2.

**Can the file replace them?**
- Yes. The set of providers the file names is the module's declared uses, with more detail. Every reader above needs only
  the provider list (`walk areas`, `merge`, `check`, refusal (b)'s program) or would use the entries (`notify`).
- Gains: one record, not two that can disagree. The job is already the only writer of `uses`, so no writer changes. It
  matches his 24 Nov goal, "bring declared uses in line with real uses".
- Costs and conditions:
  - The entry goes from "exactly five fields" to four (b2 §3).
  - Every reader changes in one tool change.
  - At place (a), ARCH loses sight of the declared graph in the module list. It can read ~200 small files, but the
    module list stops being the one place the order and its uses stand together.
  - A product's move needs the files to exist first, or the tool must read the old `uses` field where no file exists.
  - Keeping the field beside the file is also possible, as a cross-check the existing check would read. But two job-written
    lists of the same thing is the "list kept twice" problem the proposal ends, and it adds a check of one against the
    other, which is a new refusal (section 4).

## Sources read

- **Design:** design 02 in full; design 04 §§1, 3, 4, 11 (and the rest of part 4); design 05; design 06 (§§5, 7 and the
  rest); design 00 §§3, 6; design 01 §4; design 10 §§2 to 4.
- **Build:** build 01b, 02, 02b, 05 in full; build 01 §§2, 5; build 03 §2; build 04 trial lines.
- **Starting texts:** `starting_texts/job.md`, `arch.md`, `00-index.md`.
- **Decision record:** `process/decisions-index.md` and `process/design-decisions-2.md`, the subjects "The round", "A
  job's tests", "What the check refuses", "Who a change tells", "How `notify` reads the product", "How a notice reaches a
  user". `process/design-decisions.md`'s subject list was searched.
- **Research:** `process/research/uses-metadata-25nov.md`, `update-plan-24nov.md`, `notify-slow-early-provider-25nov.md`,
  `not-followed-told-everything-25nov.md`, `module-uses-23nov.md`.
- **Tool:** `tool/lib/scope.mjs`, `uses.mjs`, `walk.mjs`, `notice/check.mjs`, `notice/staged.mjs`, `notice/notice.mjs`.
- **History:** `git log -S` on the rule's text.
