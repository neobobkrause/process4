# The waiting-work record outgrows one comment (25 Nov 2026, PROCESS #13; not yet put through options in full)

A process fault from civicsmith ARCH #24 via coordinator #9 (10:38Z), unchanged: "civicsmith, Process4 version 55db8e45df.
`p4 notify 1445` (office-readers' merge) ran to its end at 10:37Z 25 Nov, told the one open job it names (sources, PR 1585)
and wrote the notice's reasons on PR 1445 (9 comments), then failed on its last act: 'p4 notify: GitHub would not rewrite the
waiting-work record; it stays as it was. GitHub said: gh: Validation Failed (HTTP 422); ... body is too long (maximum is 65536
characters)'. The waiting-work record (issue 1122) already holds 1,937 entries, 256,350 bytes as `state read` prints it
(171,183 as compact JSON), almost all notices; older entries still carry their `uses` from before decision B of 25 Nov.
`writeRecord` (tool/lib/state.mjs) writes each record as one comment, and the design keeps each record under the single-text
maximum 'as a rule', which nothing now keeps for waiting work. So every notify still to run (about 67 merged pull requests
queued, from 1436 to 1583) can tell open jobs but cannot place its notice against a module with no open job; those placements
are lost until it is mended. A re-run after the mend adds them (a second run adds nothing to job blocks)." ARCH #24 holds the
notify queue and goes on merging and filling slots from the waiting work that stands.

## Reading

Decision B of 25 Nov moved a notice's reasons onto the merged pull request so the record names only the notice; but the
number of entries (one per told module per notice) still grows with every early provider's merge, and old entries keep
their `uses`. Even without `uses`, ~1,937 entries of about 60 bytes is ~115,000 bytes, past 65,536. So the record needs to
span more than one comment, as the notice comments already do, and old `uses` can be dropped where the pull request holds
the reasons. 3B and (if chosen) 2C+ would shrink how many entries arise, not the bound itself.

## Options (to put)

- A. No change: notices for modules with no open job are lost while the record is full.
- B. The waiting-work record (and any record that can grow with the product) is written in as many comments as it needs,
  each under GitHub's limit, read back as one (`writeRecord`/`readRecords` in `tool/lib/state.mjs`; build text 5 §1–2),
  and an entry no longer carries `uses` where its merged pull request holds the reasons. After it lands and civicsmith
  moves, ARCH re-runs the queued notifies, which place what was lost. Recommended.
- C. Only drop the old `uses` and group entries by module: smaller, but still past the limit on civicsmith.

## The same limit at `open` (civicsmith ARCH #26 via coordinator #9, 12:55Z, unchanged)

"`p4 open --module filings --branch job/filings.1` exits 1 with "p4 open: GitHub refused: gh: Validation Failed (HTTP 422);
GitHub said: Validation Failed; Body is too long (maximum is 65536 characters)". The job block that `open` writes ... carries
each waiting notice's uses (filings has 22 notices placed against it) ... so no pull request opens and the job cannot start.
The branch job/filings.1 exists with no pull request, and the round record shows filings open with pull_request null. ...
Other work goes on: filings waits, later modules' jobs continue."

Reading: decision B of 25 Nov (second group) keeps a job block under 60,000 characters when `notify` adds a notice to an open
job (reasons lose before/after, then one reason that runs the whole module); `open --module` copies every notice's reasons
whole and applies no such cut (`open` in `tool/lib/commands.mjs`). Folded into choice 6: 6B also makes `open` apply the same
cut, and its block never exceeds what a comment holds.

Correction (ARCH #26 via coordinator #9, 12:59Z, unchanged): "the pull request did open (1669, draft, job/filings.1);
GitHub's 422 refused the job-block comment, not the pull request. So 1669 stands open with no job block and no job session.
An open filings job also makes `merge` wait for it in every later module that uses filings. I leave 1669 as it is until the
mend; no job is started on it." So the fault also holds merges of filings' users until 6B lands (or ARCH, on its own
judgment, closes 1669 unmerged; a product matter, not PROCESS's to direct).

A second instance (ARCH #26 via coordinator #9, 13:07Z, unchanged): "`open --module following` (branch job/following.1) failed
the same way (GitHub 422, body over 65,536 characters); pull request 1674 opened as a draft with no job block. Both filings
(1669) and following (1674) now stand open with no job, each holding a slot, and their later users' merges wait on them."

## 6B built as a patch, ready to land (PROCESS #14, 25 Nov ~13:45Z)

`waiting-work-record-size-25nov/6b.patch` (against main 3e3fe9e). Not in the tool until the owner's word. What it does:

1. **A record in parts** (`tool/lib/state.mjs`: `recordParts`, `writeRecord`, `readAll`, `partMark`, `RECORD_LIMIT` 60,000).
   Where a record's body fits one comment it is written as now. Otherwise its longest list (`work` for waiting work,
   `modules` for the round) is spread over as many comments as it needs: the first comment holds the rest of the record,
   the list's first items and `parts: N`; each further comment, marked `<!-- process4-record: <key>, part <i> -->`, holds
   only the list's next items. Further parts are written first, then the first comment. A part no longer needed is
   emptied (and is not read, since the first comment names how many there are); its comment is reused later. Reading
   joins the parts and leaves `parts` out, so no command that reads a record changes. A part missing fails plainly; an
   entry too large for one comment on its own fails plainly. The marks of further parts do not match the old tool's
   record mark, so a product on an older version is not confused by them (and no older version writes them).
2. **A starting job's block cut to fit** (`open` and `jobBlockBody` in `tool/lib/commands.mjs`), as notify cuts a running
   job's: each notice's reasons whole where they fit; else every reason without its before and after; else the notices
   with most reasons, one by one, each put as one "not followed" reason, which runs the whole module's tests. Worked out
   before any pull request is opened; fails plainly, opening nothing, if even that does not fit.
3. **A job's pull request left without its block** (civicsmith filings 1669, following 1674): `open --module` on that
   branch now writes the block onto the open pull request, takes the notices out of waiting work, and opens no second
   pull request. So ARCH repairs both with one `open` each after the move, without closing them.

Not built, and not needed: dropping old `uses` from entries. With the record in parts its size has no bound to meet, and
an entry's `uses` (written before decision B) is the only copy of that notice's reasons, since its merged pull request
holds none; dropping it would lose them. The page's 6B is reworded to match.

Tests: the changed files' tests (`state`, `commands`, `notify`, `round`, `walk`), 91 pass, among them four new: a record of
1,937 entries in parts read back whole, shorter and longer again; a missing part and an oversized entry fail plainly; a
starting block cut (30 reasons cut, a 20-reason notice put as one reason); a block-less pull request given its block. One
existing assertion changed: `open`'s copy of a 180,000-character notice now goes in cut, as notify already does.

On the owner's word: apply the patch; build text 5 §1 (a record in parts) and §5 (a starting block cut), build text 1b
commands 3 and 11 (a sentence each), design part 4 §4 ("each record one comment" → "one comment, or more where it outgrows
one"); record in `design-decisions-3.md`; run the same tests; merge. Then civicsmith moves; ARCH runs `open --module` on
filings and following, and re-runs the held notifies.

## 6B rebased onto main after decision C (26 Nov 2026, PROCESS #18)

Commit e86eddc (local branch `work/choice6-records-in-parts-ready`, on main e0fff72; not pushed). A worker carried the
patch onto today's forms: a notice too large for a starting job's block now goes in as one `whole` reason, the form and
wording `notify` already uses ("the notice from X (pull request N) has K reasons, too many for the job block; the whole
module's tests run"), which `related` already reads as the whole module; the two new tests now give the modules their
conversion first (on main, notices count as work only after a module's conversion). The record in parts spreads the longest
list: `work` for waiting work, `modules` for the round (a 900-module round wrote in 3 parts and read back the same). Tests:
the five changed files 114/114; whole tool suite 270/270. Still to write on the owner's word: build text 5 §1 says the tool
"refuses none for size" — a record with no list, or one entry too large for a comment alone, now fails plainly (§1 and §5,
1b commands 3 and 11, design part 4 §4 as above). `state write` prints the first comment's size only. Decision C does not
remove the need: entries still grow one per told module per notice, and the old entries keep their `uses`.
