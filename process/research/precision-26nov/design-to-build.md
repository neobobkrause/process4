# What the tool, the build texts and the starting texts must change to match design part 2, section 7 (26 Nov 2026)

Length: 107 lines. Last section: "Reading sets".

Status: a list for PROCESS #17, written with the draft on `work/decision-c-design`. Nothing below is made yet. One line
or so each: file, what, why. "D7" is section 7 of `design/02-modules-jobs-tests-and-the-notice.md`; "D6", "D8" its
sections 6 and 8. "F<n>" is the finding of `design-check.md` (branch `work/decision-c-design-check`) it answers.

## The tool

- `tool/lib/notice/notice.mjs` (`changedItems`, about line 483): drop the branch that sets `tells = false` when every part
  is `accepts more`; such an item tells its users. Why: D7 "What changes"; the owner's decision (record, "Who a change
  tells", item 3).
- `tool/lib/notice/notice.mjs` (header comment lines 4–10; the summary line about 672; the `notConfirmed` print about
  684; `makeConfirm`/`confirm.acceptsMore`, about 218–296): keep the checker's answer only to choose the word printed
  (`accepts more` or `cannot stand in`); remove every use of it in deciding who is told, and rule 52 and rule 7 from the
  comments. Why: the same.
- `tool/lib/notice/listing.mjs` and `canon.mjs`: keep a constant's value in its entry, so a changed value is a changed
  item; a marked copy of it is then told by the existing copy route. Why: D7, a constant's value is in its range (F1).
- `tool/lib/notice/notice.mjs`: describing (a part read as any value becoming stated) tells no one only where the item's
  code is unchanged, or the merged job's kind is `conversion`. Why: D7 "Not a change" (F6).
- `tool/lib/notify.mjs` (with `notice.mjs`): after a provider's change, work out again the means of each later module
  whose means take in a changed part of the provider (a provider's errors or channels that pass through its items), and
  tell that module's users of each item that differs there, as for a change of that module. Why: D7 "What changes" (F3).
  This reads the code of those later modules, which the record's "How `notify` reads the product" (item 3, "a lookup
  with no code read") excludes: PROCESS must settle the two.
- `tool/lib/uses.mjs`, `usesfile.mjs`, `notice/refs.mjs`: record a test's replacement or mock of a provider's member
  (`mock.method`, `mock.module`, an assignment over it) as a use of type `mock`; and each package and host facility the
  module uses, by package. Why: D7 "Who uses what" (F4, F5).
- `tool/lib/notify.mjs`: point 3 of D7 "Who is told": tell, on any change to the provider's code or test files, each
  module with a `mock` use of it; each later module with no uses file that imports it, reads its files by path or starts
  its program, and every later module with no uses file where the tool cannot tell which. Why: D7 (F4, F7).
- `tool/lib/notify.mjs`: point 4: on a merge that changes a package's version (`package.json`, its lockfile) tell each
  module whose uses file names the package; on one that changes the host's version in the facility list, each module
  that uses a facility of it. Why: D7 (F5).
- `tool/lib/notify.mjs`: do not tell a module whose code or tests the merged pull request itself changed where its test
  record ran that module whole (the mechanical edit). Why: D7, an addition for the owner to read (F28).
- `tool/lib/notify.mjs`: work out the pull request that takes the main branch into the paused tranche after an urgent
  fix as any merge (not read for this list). Why: D7 table; part 3 §7.
- `tool/lib/commands.mjs` (`push`, `close`, `ready`, `merge`) and `testrecord.mjs`: a told job that finds nothing to
  change and whose uses file the tool rewrote pushes it, records nothing to change, marks ready and is merged with no
  test (scope nothing); a test record stands for a later head that differs from its commit only in the module's uses
  file. Why: D6, D7 "What a told module does" (F2).
- `tool/lib/commands.mjs`, `testrecord.mjs`, build text 5 §5's job record: an open job that a notice reaches and that
  finds nothing to change records that (a new record value, with the notice's number); its earlier pass then stands for
  that notice. Why: D6, D7 (F20).
- `tool/test/what-changed.test.mjs` (cases about lines 106–143 expecting `accepts more (tells no one)`), and the proof's
  expected answers that rest on "accepts more" (V01, V14, Z09, Z14, Y03, Z07, Z10, U10, A12 among those that name it):
  expect them to tell. Why: the owner's decision.
- `tool/test/notify.test.mjs`, `what-changed.test.mjs`: one case each for a constant's value, describing with changed
  code, a middle module's errors, a mock, a package version, a module with no uses file reading by path, the
  mechanical-edit exception, and a told job pushing its rewritten uses file. Why: the tool's own tests cover what it
  changed (design 6 §5); none tests a product.

## The build texts

- `build/02b-the-comment-and-the-listing.md` §6: the `accepts more` row tells "Its users", its "When" cell shortened to
  the word's meaning; `cannot stand in` drops "or not confirmed as accepting more"; "A plain constant's value is content:
  it is widened to its kind unless its comment states one" becomes "a constant's value is kept"; the "Describing" and
  "named or declared" bullets become one pointer to D7; Unproven drops "the checker confirming". Why: D7 (F1, F6).
- `build/02b-the-comment-and-the-listing.md` §6: an entry for a message's kind with its channel, or a line that a
  message's kind is a kind whose entry carries its channel. Why: D7 lists it (F16, F23).
- `build/02c-the-coding-standard.md`, uses file: "A change elsewhere does not make it stale" (line 89) becomes "a
  provider's change that alters what it records tells the module, whose next push rewrites it"; add `mock` and package
  uses to the `type` list; the `value` list already matches D7's whole-value list and default. Why: D7 (F2, F4, F5, F13).
- `build/05-the-records-and-following.md` §6 and §7: cut to the how, pointing to D7 for each rule now held there (the
  means, the closure's rule and its narrowings, who is told, where a change reaches a use, the related tests and losing
  the thread); keep the JSON fields the tool reads (`mayRefer`, `relabels`, `value`, `route`), the fixpoint's order and
  the exact list of implicit members. Why: one home (F12); and the reading sets (below).
- `build/05-the-records-and-following.md` §5: the job record's new "notice needs no change" value; the test record's
  rule for a head that differs only in the uses file. Why: D6, D7 (F2, F20).
- `build/01b-the-commands.md` command 2 (`push`), 4 (`ready`), `close`, 11 (`notify`), 27 (`test`): as the tool lines
  above; in 11 drop "the checker confirming 'accepts more'" from Unproven, say "once for each notice" (one notice for
  each changed module, so a user can be told once per changed module), and add points 3 and 4 and the mechanical-edit
  exception. Why: D7 (F19, F23).
- `build/01-the-tool-and-the-required-run.md` §5 (the scope's seven steps): check against D6's one statement of the
  scope; keep it as the how. Why: one home (F22).
- `build/README.md`: re-read the 2b, 2c and 5 lines after the edits.

## The starting texts

- `starting_texts/job.md` line 3: drop the restated scope ("Tests run only where…"), pointing to design 2 §6. Why: one
  home (F22).
- `starting_texts/job.md` rule 4: a bound changed is reworded on its marked bound line; a change of meaning (the order of
  two values of one type, what a started program writes, a changed expected answer in its own interface tests) is
  declared; a change to a used item's domain or range that the placed work does not name goes to ARCH first (design 2
  §8). Why: D7, D8 (F8, F23).
- `starting_texts/job.md` rule 6: an open job that finds a notice needs no change records that and its pass stands; a
  told job whose uses file was rewritten pushes it and marks ready, running no test. Why: D7 (F2, F20).
- `starting_texts/arch.md` rule 3: "Name in the work you place each interface change you decided (item; was, is now)";
  rule 2: run `notify` also for the merge that takes the main branch in after an urgent fix, and for a package's or the
  host's version change. Why: D7 table, D8 (F8, F27).
- `starting_texts/00-index.md` §2: re-measure every size and combined set (its figures, 166,734 for a job and 167,721
  for ARCH, were stale before this draft: 172,044 and 172,135). Why: F23.

## Not changed

- The mechanical-edit exception (D7) is an addition, not the owner's ruling: he reads it (F28).
- `arch.md`'s reading set needs no build text 2b: ARCH names the interface changes it decided and no longer works out
  means itself (F23).

## Reading sets

Measured on this draft, with the build texts as they stand: a job's set 178,670 bytes and ARCH's 178,806, over the
175,000 maximum (before the drafts, 172,044 and 172,135); PROCESS's 164,540. Build text 5's sections 6 and 7 are 8,438
bytes; cut to the how (above) they come to about 3,000, which brings a job's set to about 173,300 and ARCH's to about
173,400; the 2b §6 pointers save about 900 more. Both cuts must land with the design change.
