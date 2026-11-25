# Re-running `notify 1350` on the fixed tool: still 125 told, and notices repeated for jobs that had carried them (25 Nov 2026)

A process fault from civicsmith ARCH #17, passed unchanged by coordinator #8 at 03:00Z:

> "p4 notify 1350, re-run on 124ed528 at 03:15Z 25 Nov, wrote waiting-work entries again for ten modules whose told jobs had
> already carried and finished that same notice (bundler 1367, ooxml 1368, csv-reader 1369, office-readers 1370,
> odf-reader 1371, pdf-reader 1372, roster-reader 1373, budget-doctypes 1374, image-codecs 1375, pdf-pixels 1376); 'a second
> run for the same merge adds nothing' holds only for open jobs. ARCH #17 removed those ten entries from waiting work by
> state write. Also: the re-run still tells 125 users (registerDeclared 'hands back differently'; not-followed users told
> with it), contrary to PROCESS #12's expectation that it would tell none."

Context from ARCH #17: waiting work holds 113 checks from 1350 and 24 from PR 1353; ARCH starts them 8 at a time; the
coordinator puts the cost to the owner on his civicsmith page.

## 1. Why 125 are still told

PROCESS #12 expected none from ARCH #15's account that test-support's change "only added an optional `upTo` parameter
(accepts more)". The fixed tool reports also a "hands back differently" on `registerDeclared`, a change that tells that
entry's users; a not-followed user counts as using everything, so it is told (decision B of 25 Nov keeps that). So the
answer follows the rules; the expectation rested on a partial description. Not yet known: whether `registerDeclared`'s
hand-back truly changed, or the reader infers a different kind for unchanged code (plain JavaScript: an added optional
parameter can change an inferred return kind). Asked ARCH #17 for the notice's before and after lines (03:01Z).

## 2. A re-run repeats a notice a finished job carried

`toOpenJobs` (tool/lib/notify.mjs) skips a told user whose OPEN job's block already names the notice (`notices` holds
{from, merged}). A user whose job carried the notice and then merged or closed has no open job, so the notice goes to
waiting work again and a new told job would start for nothing. Correction: also skip a told user whose job pull request
of any state, opened after the merge, already names that notice in its block. Small tool change with a test; adds no
test, gate, review or stop.
