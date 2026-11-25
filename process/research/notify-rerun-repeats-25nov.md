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

## The answer to 1 (03:11Z, from ARCH #17's diff of bio-plane/test/declared-ops.mjs, e60165a757..5b70828de0)

`registerDeclared(root, ...registrations)` became `registerDeclared(root, ...rest)`: a leading string is now taken as
`upTo`, every other argument must be a function, and it now raises `TypeError` ("a registration must be a function") and
a new `Error` (an `upTo` not on the order file). Its comment adds `@throws {TypeError}`. The kinds of error an entry raises
are part of what it hands back (the proof's iteration 2, `notice.mjs`), so "hands back differently" is the rules' answer,
not a misreading; the printed "accepts" lines (anything to anything | string) are only the visible part. So the tool is
right by the rules, and the 125 are told by decision 2: the handful followed fully because they call `registerDeclared`
(e.g. `interface-shell/register.mjs:6`), the rest because they are not followed fully and so count as using everything of
test-support.

What remains is the cost of decision 2 on a plain-JavaScript product: about 113 told checks at about $1.75 each for a
change that a module can only meet by calling `registerDeclared`. A narrowing to research, if the owner wants it: a user
the tool cannot follow fully is told of a changed function only where its code names that function, or reaches the
provider in a way the scan cannot read (a computed import, a namespace import); a changed kind still tells it as now.
Not built, not measured on the replay; it changes the owner's decision 2.

## Left for PROCESS #13 (25 Nov ~04:10Z): the narrowing of decision 2, not yet researched

A worker began and was stopped at PROCESS #12's refresh, with no result. The brief, to give a worker again: a user the
tool cannot follow fully is told of a changed FUNCTION (or method or value entry) only where its own files name that
entry (an identifier or property name equal to the entry's name, in code or a structured comment), or reach the provider
in a way the scan cannot read (a computed import, `import * as`, a `require` of a computed path, a re-export through a
carrier); a changed KIND (typedef, class, table, operation) still tells it as now. Prototype it in `notice.mjs`'s
not-followed branch in a worktree and report: on the 150 proof changes, how many answers change and whether each dropped
user truly could not use the changed entry (any that does is a hole); on a synthetic early-provider product, how many
users drop for a function change and for a kind change; the cost. It changes the owner's decision 2 and needs his word.

Two smaller gaps, information: (1) a re-run of `notify <n>` rewrites waiting-work entries only for modules it tells
again, so entries of an earlier run for modules no longer told stay (ARCH #18 was told it may clear a merge's own entries
before re-running); (2) an owner's hold on notice-only checks is not a standing note the tool knows, so `next-job` could
not pass over held modules and all work stopped behind them (ARCH #18's fault, 04:06Z; moot once the owner lifted the
hold, 04:07Z).

## Measured after 55db8e4 (civicsmith ARCH #18, passed unchanged by coordinator #9, 25 Nov ~04:16Z)

> "The re-run of notify 1356 on tool 55db8e45 told 197 users, not few: 90 modules changed their listing, 178 entries changed
> in a way that tells. The cause is a real change under the rules: setup-words' localize (and build, WORD_ROWS) gained stated
> bounds ('bound changed'), and nearly every later module uses localize and passes it on; many users are also 'not followed
> fully' (1,785 such lines). Six open told jobs were told and messaged; the rest went to waiting work. 1339's old entries
> (138) were removed from waiting work before its re-run, now running. Observed cost so far of a notice-only told job that
> closes with nothing to change: about $1.40-$1.70 and 2 minutes each (connection-grammar, bundler, ooxml)."

PROCESS #13's reading: a changed stated bound is an interface change by the owner's own rule (design part 2 §7, decision 3:
"If those words are changing, then there must be a reason why"), so 1356's 197 are told by the rules, not by the
not-followed rule alone. The narrowing of decision 2 would remove only those of the 197 that neither name `localize`, `build`
or `WORD_ROWS` nor reach setup-words by an unreadable route; since nearly every later module uses `localize`, it would likely
save little on 1356. Its saving is on changes like 1350 (a function few call). Rough cost of 1356 at the observed rate:
197 × about $1.55 ≈ $300, plus 1350's ~113 ≈ $175. Whether a bound written for the first time (no bound before) should count
as "changed" is a separate question, not yet researched: build text 2b §6 is the place to read.

### A bound written for the first time (PROCESS #13, 25 Nov ~04:25Z; not yet put to the owner)

The first-comments exemption (design part 2 §7; `noticeWith` in `tool/lib/notice/notice.mjs`, `commentsOnly` in
`check.mjs`) applies only where the module had no interface comments before AND the whole merge leaves running code the
same. setup-words' 1356 met neither (it had some comments; it changed one word), as `notify-1356-anything-to-stated-25nov.md`
found. Decision B of 25 Nov made an unknown kind becoming stated tell no one, but `bound changed` (build text 2b §6 table:
"A bound line added, removed or reworded") still tells on a bound written where the entry had none. Possible option: a bound
added to an entry that had no bound lines before is the entry being described, like a kind becoming known, and tells no one;
a bound reworded or removed, or added beside existing bounds, still tells. Against it: the owner's decision 3 ("If those words
are changing, then there must be a reason why. It must be that that interface is changing, right?") — a new bound can be a
real tightening (a module that accepted 1 to 999 and now says 1 to 99 in its first bound line). Asked civicsmith ARCH #18
(via coordinator #9, 04:25Z) how many of 1356's 197 are told only by such first bounds.

## The narrowing of decision 2, measured (a worker of PROCESS #13, 25 Nov ~04:40Z)

Prototype (uncommitted; its diff and new file kept in `narrowing-decision-2-25nov/`): a user not followed fully is told of a
changed function, value, method or class member only where (a) that entry's name appears as an identifier anywhere in the
user's files, before or after, comments and strings included; or (b) the user reaches the provider in a way the scan cannot
read: an unfollowable import in its reach, `import * as`, `import('…')` or `require('…')` of a provider file, or another
module's `export … from` or carrier in its reach that reaches the provider. A changed kind (typedef, handle kind, class,
operation, operation table, stored rows) tells as now.

- **Proof replay, 150 changes:** 8 answers change, all one user (`reports`) losing a not-followed reason (P09, P22b, P27, A03,
  A14, X03, U08, T02); each checked against `reports`' files and the proof's own `needs`: **no hole**. Users the proof says
  needed a change and are not told: the same before and after. Time 35.9 s → 35.8 s.
- **Synthetic, 50 plain-JS users of a provider third in the order, all cause 2:** a function change (`@throws` added) told
  50 → 7 (5 callers, 1 namespace importer, 1 computed importer); a kind change 50 → 50. The narrowing costs 5–9 ms.
- **Holes found outside the proof:** (1) the function handed on by another module as a value (`export const helpers = { reg:
  registerDeclared }`) and called there, for a throws or bound change only — closed by an amendment: (b) also tells where a
  module in the user's reach hands the changed entry on as a value or takes the provider's whole exports (`asValue` in
  `usage.mjs`); 0 more told on the proof and the synthetic product; (2) a callback handed in from elsewhere (`function
  boot(register)`); (3) a name built from pieces. (2) and (3) are accepted misses (the design accepts a missed user, part 2
  §7), to be named in build text 5 §6.
- **Not known:** how many of civicsmith's ~120 stay told through (b)'s "an unfollowable import anywhere in its reach" (a
  widely imported loader with a computed import would keep many told). Seen on the first `notify` after it lands.
- Adopting re-records the 8 proof answers in `expected.json`, each with its reason; the reason in a notice should name which
  entries told the user.
