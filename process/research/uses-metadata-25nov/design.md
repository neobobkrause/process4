# Who uses what, and what changed: the design of the owner's proposal, and civicsmith's path (25 Nov 2026, PROCESS #15)

Status: PROCESS #15's design, put to the owner 25 Nov. Nothing is built or decided. Grounds: the four workers' files in
this folder — `tool-map.md` (the tool), `texts.md` (the governing texts), `means.md` (how JavaScript refers to a
provider; civicsmith's measured habits), `proof.md` (the proof's 45 explained; the proposal simulated on the proof) — and
`civicsmith-state.md` (ARCH #27's measurement of civicsmith's refactoring and tranche t2). The owner's words are in
`../uses-metadata-25nov.md`.

## 1. What the research shows

1. **The notice has two halves, and both are inferred today.** "Who uses this entry" is inferred from plain JavaScript;
   "did this entry change" is inferred by comparing two written descriptions of the provider (its listing).
2. **The owner's uses file answers the first half fully.** On the proof, a careful job's uses files for every module find
   every user of a changed entry, with no "tell everyone" fallback, in 45 ms for all 150 changes (the tool takes 50 s; up to
   40 min on civicsmith). 14 of 119 uses (12%) are ones the tool cannot infer; on plain-JavaScript civicsmith far more
   (inference: 194 of 197 users told after setup-words were told only because the tool could not follow them).
3. **By itself it does not fix the misses, because they sit in the second half.** "Needed and missed: 45" is explained: in
   43 of the 45 the provider's listing did not change at all, so no way of finding users could tell anyone — mostly a job
   that changed code and left its comment as it was (19), or a change to output the listing does not describe. Uses files
   with today's listing diff: 108 told / 53 without need / 44 missed (today 116 / 62 / 45). The proof's own list of who
   needed telling is also incomplete: running every later module's tests before and after finds 13 more real breaks, none
   told today. So today's tool misses at least 57 needed users on the proof.
4. **With an accurate "what changed", uses files tell every needed user but one:** 202 told / 104 without need / 1 missed
   (Z01, an "accepts more" change the rules do not tell). It tells more than today because a real change now reaches every
   user of the changed entry, which is the owner's rule; 13 of the 104 "without need" in fact break.
5. **The same insight serves both halves.** The owner: "every references, through any means, was initially written with
   forethought". So is every change: the provider's job knows what it changed. A job stating its changed entries is the
   provider-side twin of the uses file. The risk is measured on the proof: in 19 of 45 misses a job changed code and did
   not update its own comment. So the statement must be anchored to something the job cannot forget: the tool lists every
   entry whose own code changed (a mechanical fact), and the job must say of each whether what it accepts or hands back
   changed.
6. **What JavaScript does.** 31 means in four families (imports; values passed through a middle module without importing
   the provider; calls by name through tables; outside the language: data files, programs, globals). A job can record all
   of them; only imports can be checked against code. On civicsmith all 6,016 cross-module imports point to earlier,
   declared modules; its references that do not are path reads and computed loaders pointing later (e.g. test-support's
   helper imports 95 later parts by a computed path; 19 whole-tree walks), which a uses file would bring out as order faults
   for ARCH, not hide.

## 2. The design (option B below)

**A. Each module keeps one file of what it uses and what it offers** (`process/modules/<module>.uses.json`, beside its
requirements file; a process file of the module, so changing it alone runs no tests — written by its jobs only).
- **Uses:** for each earlier module it uses: each entry used (function, value, kind, class member, operation name, data
  file, program), the route (direct, or "via Q's entry" for a value of P received through Q), code or tests or both, and the
  files that use it. The provider list replaces the module list's declared uses.
- **Offers (non-listing entries only):** data files, programs, operation names, globals or registry keys other modules may
  use, so a uses record has something on the provider's side to name.

**B. Each job that changes code states what it changed.** In its pull request, before `ready`, the tool lists every entry of
the module whose own code changed, and every entry whose listing changed; the job marks each "changed what it accepts",
"changed what it hands back", or "unchanged", with one line why. An entry the job leaves unmarked counts as changed (it
tells; nothing stops). Entries in "offers" the job changed are marked the same way.

**C. Who is told is a lookup.** After a merge, the tool reads the merged pull request's statement and every later module's
uses file, and tells exactly the modules whose file names a changed entry (by any route), with the files concerned. A told
job's related tests are the test files its uses file lists for those entries. "Accepting more tells no one" stays.

**D. The merge wait** reads the uses files' provider lists instead of following imports.

**E. Kept accurate by the job, with the check that already exists.** A job writes its module's uses file as it writes its
tests (the first act of a module's first job if it has none), and keeps it current in each pull request that changes code
or tests. The existing check of declared uses against imports reads the file's provider list: an import of a module the
file does not list, or a listed later module, is refused as today. Nothing new refuses: no entry-level check (that would be
a new refusal; rule 2 rules it out).

**F. Removed** from the tool: the inference of users (`usage.mjs`, `narrow.mjs`, the "not followed fully" fallback, the
staged reading of users; ~480 lines) and the import-following lookups (~215 lines, replaced by ~60–100 lines of lookup).
The listing stays, as the aid in B and for the check's two refusals the owner approved. From the texts: design part 2 §7
rules 1 and 2, "Which tests relate" by call-following, "A declared use that no code makes", the passers' multiplication;
about thirty sentences in nine texts (`texts.md`), six decision entries rewritten. The job's reading set loses ~5.7 KB and
gains ~2 KB (it is 170,742 of 175,000 now).

**G. Reverses the owner's rule** in design part 2 §7, "For the tool that finds the change", point 1: "Which parts of a
provider a user uses is worked out by the tool from the user's code and comments. No list is kept by hand." (Not in his
quotation marks; by the design's convention his ruling. It also refines his "Decision: 3b" of 25 Nov, the third of the told
job's readings of 20 Nov, and the merge wait's reading under "Decision: the update plan as laid out" of 24 Nov. It carries
out his 24 Nov words "The goal is to bring declared uses in line with real uses".)

## 3. Options for the fix

- **0. No change.** civicsmith cannot go on: `notify` cannot write its waiting work; 99 merges' users are untold.
- **A. Uses files only; "what changed" stays the listing comparison** (with the listing faults mended). Removes the
  over-telling from users the tool cannot follow. On the proof: 108 / 53 / 44 missed. The misses stay.
- **B. Uses files and the job's statement of what changed (recommended).** On the proof (with an accurate statement):
  202 / 104 / 1 missed. Fixes both the over-telling (no "tell everyone") and the misses (code changes the listing does
  not show). Adds no test, gate, review or stop: an unmarked entry tells. Unproven: how reliably a job marks its entries;
  that a first job per module records civicsmith's uses accurately; the cost per module.
- Not offered: an entry-level check of uses files against providers, or an independent reading of each change (each a new
  check or review).

## 4. civicsmith's path (needs the fix built first; considered with it)

Facts (`civicsmith-state.md`): the plan's steps 1 and half of 2 are built, 3–8 not started; the plan, ARCH's decisions,
requirement text and module list live under `process/` on p4-tranche. t2 is round 1, no walk; 324 job pull requests, ~163
closed with nothing to change; 99 merged pull requests' users never told; 938 notices waiting from the old method; 624
changed code and test files in 124 modules, mostly comments and notice responses.

- **0. No change:** hold until the fix, then move and carry on; the 99 untold merges and 938 old notices are worked by the
  new method from listings that no longer exist as statements — not workable as is.
- **R1. Keep t2.** After the fix and the move: discard the old waiting work; every module's first job writes its uses file
  and, because notices owed from 99 untold merges may affect it, runs its module's tests once (the told job it was owed);
  then continue the plan in t2. Keeps all of t2's work. Costs every module a job with its tests run (204), and carries t2's
  untold changes until each module's test run.
- **R2. Drop t2 and restart the refactoring from main (recommended).** The drop (built, 24 Nov) puts back main's code and
  tests and keeps the plan, ARCH's decisions, requirement text, the module list and the lanes. Then every module's first job
  writes its uses file from main's consistent code (no tests owed: nothing untold); then a new tranche runs the plan from
  step 1. Loses steps 1 and half of 2 (small) and t2's comment and notice-response work in 124 modules; the new method does
  not depend on comments to find users. Starts from a known state.
- **Effort of the uses pass** (estimate, not measured): 204 jobs; 1,153 source and 3,647 test files, ~1.1 million lines; the
  large modules need workers (plane's tests 29,654 lines). Perhaps $2–5 a module, $400–1,000 in all, and 6–13 hours at
  eight slots. A sample of five modules first would measure it.

## 5. Order, on the owner's decisions

Record; rewrite the design and texts in place; build the tool (proof re-recorded with the 13 found breaks added to its
`needs`, and the uses files the worker wrote as its fixture); trial on process3-probes; measure the uses pass on five
civicsmith modules (read-only brief); then civicsmith's path as chosen.
