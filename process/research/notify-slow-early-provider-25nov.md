# `notify` after an early provider's merge takes most of an hour on civicsmith (25 Nov 2026)

Recorded by PROCESS #11 at its refresh, for PROCESS #12 to research and put to the owner. A process fault from civicsmith
ARCH #15, passed unchanged by coordinator #7 at 00:47Z:

> "`p4 notify 1339` (record-grammar, the third module in the order; 204 modules; NODE_OPTIONS=--max-old-space-size=12000)
> ran 38 minutes and reached 8 GB resident without printing a notice, and was then stopped by the harness's 30-minute limit
> on a command moved to the background. I restarted it as its own background command (two-hour limit). While it runs I hold
> the merge of every ready job whose module uses record-grammar (six now: capture 1337, inquiry-grammar 1347, promotion
> 1345, provenance 1346, reading-pipeline 1344, ratification 1348), because a notice may reach one of them after its tests
> ran. Three later merges (test-support 1340, office-readers 1343, test-support 1350) also owe notices, each to be run after
> this one. At this speed one merge of an early provider holds the round for most of an hour. Not worked round: I am waiting
> for the tool."

## What is known (from the build, not yet measured here)

- `notify` reads in stages (decision D of 23 Nov, `tool/lib/notice/staged.mjs`): the changed module's listing before and
  after; where it changed, every later module that can reach it, one at a time, each with its own program and type checker.
  record-grammar is third of 204, and its listing changed (a structured comment's fields), so most later modules are read.
- The update of 24 Nov added `notify` to running jobs and `merge`'s wait; it did not change the reading's cost. The memory
  measurement of 23 Nov was on a 312-module made-up product (128 MB with 166 users); civicsmith's real code is far heavier.
- ARCH's holding of merges is its own reading; `merge` already refuses a job whose tests ran before a notice reached it, but
  a merge made before `notify` runs would send the notice to waiting work instead.

## Questions for the research (no options yet)

- Where the time goes: parsing, one type checker per user, or the reach scan; measure on civicsmith read-only.
- Whether a user can be judged without a full program of its own (e.g. only the files that name the changed entries).
- Whether `notify` should be started by ARCH as a background command of up to two hours in its text, as `p4 test` is.

## Also seen at the same time (information for the owner; no change proposed)

The refactoring tranche is drawing in modules through placed flaws, as warned at 00:13Z: by 00:44Z jobs had also started
for inquiry-grammar, ratification, provenance, promotion, reading-pipeline, interface-shell, lines, wizard-scripts,
wizard-library and setup-words. Several are adding structured comments, which the check's refusals ask for.

## PROCESS #12: why it is slow, from the code, and the faster ways (25 Nov ~01:35Z)

Measured on civicsmith: `notify 1339` took about 43 minutes and 8 GB, and told nearly every later module, most as "not
followed fully" (`waiting-work-too-large-25nov.md`). The owner, 25 Nov: "We know it's slow. We also know from looking at
the code why it's slow. What we need to figure out is how to meet the tool's requirements much faster than how it does it
now." So no further measuring of the slowness; the work is a faster design, held to the same answers.

Why, from the code (`tool/lib/notice/staged.mjs`, `usage.mjs`, `ts.mjs`):
1. Every later module that can reach the provider is read on its own: a fresh TypeScript program and type checker over
   its files and everything they import. The provider and the shared lower modules are worked out again for each of
   about 200 users.
2. Each user is read twice, before and after, though the after side only serves new names (`useB ?? useA` in
   notice.mjs).
3. Plain JavaScript with `checkJs`: the checker infers kinds from function bodies across files, the costliest reading.
4. For a user that declares the provider and is "not followed fully" (a value of unknown kind anywhere), the tool still
   walks all its files to list every use, though such a user is told on any change and its job runs its whole tests.
5. One reading at a time, on one core.

The faster ways, each held to the 150 recorded answers of the proof (who is told must not change):
- **Early stop.** For a user that declares the provider, stop at the first value of unknown kind: it is told, "not followed
  fully", with that place. Its reasons then name the cause, not each use; its job runs its whole tests either way. On
  civicsmith most users are of this kind, so most readings become short. Expected the largest gain; to be confirmed.
- **The after side only when needed:** only where a changed entry is new, or operations or tables are in play. About half.
- **In parallel:** the readings spread over the machine's cores, each in its own process with bounded memory. About the
  number of cores.
- **Shared work:** several users read in one program, so the provider's chain is worked out once per batch; bounded by
  memory.
- **Remembered results:** a user's result kept, keyed by the content of every file it reads, and reused at the next merge
  where none changed.

Options to put to the owner, with the record-size fault (`waiting-work-too-large-25nov.md`), as one group:
- A. No change.
- B. The first three ways (early stop, after side only when needed, in parallel), with waiting work kept small (its
  option B) and GitHub's words printed on a failed write; then `notify 1339` run again to recover the lost notices.
  Recommended. Estimated, not yet shown: 43 minutes to a few minutes on civicsmith.
- C. B, and the last two ways (shared work, remembered results). More code and more to prove; worth it only if B is not
  enough.

## The worker's measurement and build (25 Nov ~02:20Z)

A worker in PROCESS #12's session built two synthetic products shaped like civicsmith (200 modules, the provider third,
121 importing it directly, closures of 74 modules on average; p200 64k lines, h200 119k lines with every source file
public), changed a required field of the provider's kind (198 listings change, 197 users told), and timed `notify`'s
reading in a scratch copy of the tool. Scripts and raw timings: the session scratchpad, `notify-prof/` (not kept).

- **The cause:** 97% of h200's time (1,467 of 1,507 s) is declaration emit in `listing.mjs` (`plainEverywhere`): each
  "through" listing emits declarations for every public file in its program's whole import closure, which forces a full
  type check of each of those files, again for each candidate. The rest is small (programs 8-10 s, makeUsage 10 s).
- **Plain-kinds cache:** keep each file's plain kinds per side across programs (exact: a file's declarations depend only
  on the file and its imports). h200 1,507 s / 3.2 GB to 52 s / 1.1 GB; p200 137 s to 27 s. Replay: all 150 whole
  reports identical.
- **With side A read only where needed and one program per side:** h200 36 s / 1.7 GB; p200 20.5 s. Identical.
- **Early stop:** no measurable gain after the cache; 9 recorded answers' reason text changes. Not taken.
- **Four parallel readers:** 40 s and 5.9 GB on h200 (each repeats the check of all public files). Not taken.
- **Per-user cache across runs:** helps a second merge of the same provider only. Not needed.
- **The owner's uses file (D):** made at the before commit it gives identical answers (0.75 s per module at the job), but
  any change in a module's import closure makes its file stale, and an early provider's merge changes every later
  module's closure, so the next such notice reads them all anyway; with the cache `notify` is already about 40 s. Adds
  little.
- **Fix B of `not-followed-told-everything-25nov.md`:** 17 of the 150 changes' answers change, one user each, all notices
  for nothing (5 confirmed accepts-more, 12 new entries); 15 users no longer told, 2 still told for other reasons.
- **Waiting-work size:** 4.68 million characters for the 197 told users on p200 (median 23.6k per user; 2-3 users pass
  65,536). Each reason carries the provider's whole kind before and after. Must be fixed separately.

Estimate for civicsmith (heavier, not opened): 43 minutes to about 1-1.5 minutes within about 2 GB.
