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
