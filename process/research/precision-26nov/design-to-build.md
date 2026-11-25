# What the tool, the build texts and the starting texts must change to match design part 2, sections 7 and 8 (26 Nov 2026)

Length: 69 lines. Last section: "Not changed".

Status: a list for PROCESS #17, written with the draft on `work/decision-c-design`. Nothing below is made yet. One line
each: file, what, why. "Design 2 §7" is the rewritten section 7 of `design/02-modules-jobs-tests-and-the-notice.md`.

## The tool

- `tool/lib/notice/notice.mjs` (`changedItems`, about line 483): drop the branch that sets `tells = false` when every
  part is `accepts more` and the checker confirms it; such an item tells its users. Why: design 2 §7, any change to what
  an item accepts is a change of its domain; rule 7 for the tool is gone.
- `tool/lib/notice/notice.mjs` (header comment, lines 4–10; the summary line about 672; the `notConfirmed` line about
  684): remove "accepting more tells no one", rule 52 and rule 7, and the "accepts more, not confirmed" print. Why: the
  same; the print has no meaning once every `accepts more` tells.
- `tool/lib/notice/notice.mjs` (`makeConfirm`, `confirm.acceptsMore`, about lines 218–273, 287–296): keep `standsIn` and
  the checker question only to choose the word printed (`accepts more` or `cannot stand in`); remove anything that uses
  them to decide who is told. Why: the word stays useful to the told job; it no longer narrows the notice.
- `tool/lib/notify.mjs`: do not tell a module whose code or tests the merged pull request itself changed where that pull
  request's test record ran that module whole (a mechanical edit). Why: design 2 §7, the mechanical-edit exception; its
  tests already ran on the change.
- `tool/lib/notify.mjs`: check that `notify` works out the pull request that takes the main branch into the paused
  tranche after an urgent fix as it does any merge (not read for this list). Why: design 2 §7 table and part 3 §7.
- `tool/test/what-changed.test.mjs` (the cases at about lines 106–143 that expect `accepts more (tells no one)`): expect
  them to tell. Why: the rule they test is gone.
- `tool/test/fixtures/notice-proof/.../expected.json` for the changes whose answer rested on "accepts more" (V01, V14,
  Z09, Z14, Y03, Z07, Z10, U10, A12 among those that name it; find each by `accepts more` in its `change.json` or
  expected answer): reconcile the expected told sets. Why: the same.
- `tool/test/notify.test.mjs`: one case for the mechanical-edit exception. Why: the tool's own tests cover what it
  changed (design 6 §5); this is no test of a product.

## The build texts

- `build/02b-the-comment-and-the-listing.md` §6, table: the `accepts more` row's "Told" becomes "Its users", and its long
  "When" cell shrinks to "What it accepts differs and every old argument is still accepted (the checker's answer
  chooses this word or the next)"; the `cannot stand in` row drops "or not confirmed as accepting more". Why: design 2 §7.
- `build/02b-the-comment-and-the-listing.md` §6, the "Describing is not changing" bullet and the "A named or declared
  change of meaning" bullet: replace with one pointer to design 2 §7 ("Not a change"; "A changed item"). Why: one home
  per rule; saves bytes in a job's and ARCH's reading sets.
- `build/02b-the-comment-and-the-listing.md` §6, "Unproven": drop "the checker confirming 'accepts more'". Why: nothing
  rests on it.
- `build/05-the-records-and-following.md` §6, "Who is told": drop "an item the checker confirms only accepts more"; add
  the mechanical-edit exception; shorten the paragraph to a pointer to design 2 §7 ("Who is told"), keeping only the
  fields the tool reads (`mayRefer`, `relabels`, `value`). Why: design 2 §7; one home; bytes.
- `build/05-the-records-and-following.md` §6, "The means": point to design 2 §7 for what the means holds, keeping the
  closure's full rule here. Why: the design now states the means as domain and range; one home; bytes.
- `build/01b-the-commands.md` command 11 (`notify`): drop "the checker confirming 'accepts more'" from Unproven; add the
  mechanical-edit exception under "Who is told"; say the urgent fix's taking-in merge is notified as any. Why: design 2 §7.
- `build/README.md`: no section changes; re-read its 2b and 5 lines after the edits. Why: the index stays current.

## The starting texts

- `starting_texts/job.md` rule 4: add "reword its marked bound line where a bound changes" and "a change to a used
  item's domain, range or meaning that your work does not name goes to ARCH before you build it (part 2, section 8)".
  Why: design 2 §7 (what the job recognizes) and §8.
- `starting_texts/arch.md` rule 3: "Before placing work, work out which items' domain, range or meaning it changes and,
  from the uses files, who uses them; name each item it changes under the same types (was, is now)". Rule 2: run `notify`
  also for the merge that takes the main branch in after an urgent fix. Why: design 2 §7 table, §8; part 3 §7.
- `starting_texts/00-index.md` §2: re-measure every size and combined set. Its figures are stale: a job's set is 172,044
  bytes on `work/decision-c` before this draft and 174,554 with it (the index says 166,734); ARCH's 172,135 and 174,690
  (it says 167,721). Why: both are within about 500 bytes of the 175,000 maximum; the build-text pointers above bring
  them back down.

## Not changed

- Design 2 §7's rule that a name or declaration may add a changed item, never remove one; the told job that closes with
  nothing to change running no test. Both wait on the owner (design part 10, section 1, items 3 and 4).
- The record of decisions, "Who a change tells", item 3, which still says an item that only accepts more tells no one.
  Only the coordinator's or PROCESS's record of his marked decision changes it (design part 10, section 1, item 2).
