# Who uses what, and what changed: the design of the owner's proposal, and civicsmith's path (25 Nov 2026, PROCESS #15)

Status: PROCESS #15's design, put to the owner 25 Nov, reworked the same day on his reply (§6). Nothing is built or decided. Grounds: the four workers' files in
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

## 2. The design, reworked on the owner's points (option C below)

Grounds added since the first version: `every-reference.md` (every gap closed and shown), `standard.md` (every means of reference, from the language's definitions; a
standard of permitted forms, S1–S13) and `changes.md` (domain and range in JavaScript; the tool's list of entries that may
have changed, sound on all 150 proof changes; the job's guide). The first version (a job-written file only) is option A.

**A. A standard of how a module may refer to an earlier one** (`standard.md` §2.2), kept in the build text on the forms
and named in the job's text. In short: imports only by a written-out name (S1–S3); run-time loading only of a written-out
name (S2); another module's files, programs and settings only through that module's own exported functions (S5, S6, S10);
calls by name only through a declared table, with a gathering module in place of tree walks (S7); no shared changeable
state across modules (S8); no code built from text (S9); generated files name their source (S11); tests follow the same
rules (S12); import, never copy (S13). And the rule that makes values passed through a middle module visible (S4): every
exported item states the kinds it takes and hands back, the type checker runs strictly, and a value of another module's
kind is never relabelled as one's own. Two of these already stand (design part 2 §7 rules 4 and 5). Added
by `every-reference.md` to close every gap the first version left: no value of unknown kind anywhere (R1); data from another
module's channel only through that module's reader, never given a shape by a cast or a hand-written type test (R2–R4,
R12); the tool itself relates every conversion between kinds, so the claim does not rest on the type checker's documented
unsound points (R5–R7, R9, R11); no writes onto another module's value by reflection (R8); no comments that silence the
checker (R10); the checker setting that types a caught error as unknown turned on (today's tool turns it off, which alone
hides a reference now, case B8). Each gap was shown, by running TypeScript 6.0.2 and 5.6.3 on 27 small cases, to hide its
reference under today's settings and to be found under the new rules: 50 runs of 50; two controls of ordinary conforming
code produce nothing.

**The claim, exactly as shown.** Under the standard, every reference of a later module U to an earlier module P is either
listed as a use of P's entry or sits at a place listed as outside the standard (and is told of every change of P until
converted). A reference is a place in U's code or tests that names an entry of P, uses a channel P owns, or operates on a
value whose kind there, or on either side of a conversion made there, is P's. It rests on the pinned type checker computing
each expression's kind as documented, the same footing as trusting the parser to read imports. Not yet run: the standard's
rule on another module's files misses a path relative to the working directory handed to a file read; one more rule closes
it (S5).

**A restated fact is a defect, not a reference** (the owner, 25 Nov). A module that writes out a value another module
owns (a limit, a text, a name) instead of obtaining it has a bug. The standard's rule (S13, reworded): every fact a module
states is obtained from the module that owns it: an import of its exported constant where the fact is fixed in code (no
cost at run time), or a call to its reader where the fact is configured or stored; any cache is the owner's, inside its
reader, never a copy held by the user. Obtained so, every fact is a reference, found as above. A module that breaks the
rule has a bug like any other, which the job's duty, the module's own tests and the walks catch; the tool helps by listing
every literal that exactly equals a value an earlier module exports, and every place marked as a copy where obtaining is
impossible (a test's deliberately literal expected value, a data file), with drift reported. Detecting every such bug with
certainty is not claimed, as it is not claimed for any other bug; the claim is about references, and for references it
holds as stated.

**B. Who uses what is computed by the tool, from code that keeps the standard, and recorded.** At a job's push the tool
writes the module's uses file (`process/modules/<module>.uses.json`, beside its requirements file): each earlier module,
each entry used, by which route, code or tests, and the files. Because every interface then depends only on its own text,
the result depends only on the module's own code and its providers' stated kinds, so it cannot go stale as the 25 Nov
cache did. The job adds by hand only what the standard cannot see (a value copied rather than imported, S13); for a
module that keeps the standard that part is empty. A place that breaks the standard is listed in the file as "not yet in
the standard", with its rule; for that module the tool tells it of every change to the provider concerned, as today, until
a job brings it into the standard. Nothing refuses: a refusal by form would be a new refusal (design part 2 §6).

**C. What changed is listed by the tool and judged by the job.** Before `ready`, the tool lists every entry of the module
that may have changed: every entry whose own code or anything it reaches inside the module (helpers, constants, data files,
programs) changed, comments ignored; every entry whose listing changed; and each kind with the entries that build or accept
it. On all 150 proof changes this list held every entry the oracle counts as changed (215 of 215). Seven flags the tool
computes mark the language facts that turn an inward-looking change outward: a class instance handed back, `this` newly
used, parameters added or moved, an argument changed in place, sync becoming async, timers, process or console use. The
job marks each listed entry "changes what it accepts", "changes what it hands back", "accepts more only" or "unchanged",
with one line why, by a guide of about 1,450 bytes in its instructions (`changes.md` §3). A flagged entry starts marked
changed; an unmarked one counts as changed; nothing stops.

**D. Who is told is a lookup** of the merged pull request's marks against every later module's uses file: exactly the
modules that use a changed entry, by any route, with the files. A told job's related tests are the test files its uses
file lists for those entries. The merge wait reads the uses files' provider lists. "Accepting more tells no one" stays.

**E. Jobs that change no code run no tests,** said at the top of their instructions: a job that only writes its module's
uses file or comments runs nothing. A job that changes code runs its module's tests as now.

**H. The first job on each module: into the standard, copies marked, uses written** (asked for by the owner, 25 Nov,
§6). One job per module, in module order where a provider must first export a reader or accessor, otherwise in parallel:
- **The tool lists** every place in the module's code and tests outside the standard, with its rule, and every literal
  that exactly matches a value an earlier module exports (a candidate copy).
- **The job decides and converts.** Each non-standard reference to an earlier module is rewritten to the standard form
  (where the provider must first export a reader or accessor, the job reports it and the provider's job comes first).
  Each copy is replaced by an import where one is possible; where not (a test's deliberately literal expected value, a
  data file, a fixture, text in another language), it is marked by the copy convention: in code, the name declares that
  it is a copy and of which module's entry; where there is no name, an equivalent marker the tool reads. The job also
  looks for copies the tool could not list (a reworded or translated value) and marks them. It states its module's kinds
  where S4 asks.
- **The tool writes the uses file** from the converted code, marked copies included, and lists what is still outside the
  standard; such a place is told of every change of the provider concerned until a later job converts it.
- **Tests:** the job runs its module's tests once when it changed running code (conversions and renames do); a job that
  only marked data files or wrote comments runs nothing, said at the top of its instructions.
- **What the first pass of 8 shows per module:** places converted, copies found and marked, cost and time, and whether
  the uses file is right.

**F. Removed:** the tool's inference of users (~480 lines), the import-following lookups (~215, replaced by a lookup),
the "not followed fully" telling for modules that keep the standard; from the texts, design part 2 §7 rules 1 and 2,
"Which tests relate" by following calls, and the passers' multiplication. The listing stays as one input to C and for the
check's two refusals. The decisions this replaces are rewritten in place in `design-decisions-2.md` ("Who a change
tells", "How `notify` reads the product", "How a notice reaches a user", the merge wait in "The round"), the earlier
rulings retired there with their dates, not added beside.

**G. Reverses** the owner's rule in design part 2 §7, point 1, "No list is kept by hand" (the list is now kept, by the tool
and the job), and replaces his decision 3B of 25 Nov morning, the third of the told job's readings of 20 Nov and the merge
wait's reading of 24 Nov. It carries out his 24 Nov words "The goal is to bring declared uses in line with real uses".

## 3. Options for the fix

| | Who uses what | What changed | On the proof (told / without need / missed) | Rigour |
|---|---|---|---|---|
| **0. No change** | Inferred | Description compared | 116 / 62 / 45 (at least 57 with the 13 found breaks) | civicsmith cannot go on |
| **A. Job-written file** | The job's word; imports checked | Tool list, job's marks | 187 / 89 / 1 (marks as the oracle) | Rests on each job's care |
| **B. Standard without the kinds rule (S4)** | Tool-computed for direct references; values through a middle module recorded by the job | Tool list, job's marks | as A | Certain for direct references only |
| **C. Full standard (recommended)** | Tool-computed for every reference, from the standard | Tool list, job's marks | as A | Every reference found or its place listed; a restated fact is a defect, by rule obtained from its owner |

With every entry left unmarked (the worst job), A to C give 429 / 330 / 0: more told, nobody missed. Not proven: how
reliably real jobs mark; the cost of bringing civicsmith's 204 modules into the standard, above all S4's kinds (judged the
largest cost; unmeasured). If the first pass shows S4 too costly, B is the fallback with no rework of what was done.

## 4. civicsmith's path

The owner chose to drop t2 (decision typed at civicsmith's coordinator, 25 Nov); ARCH is carrying it out. After it,
civicsmith's code is main's: its imports already keep S1 (6,016, measured); its references that break the standard mostly
point to later modules (5,350 references, 341 computed, 19 tree walks, a test helper reaching 95 later parts), which the
refactoring plan was to correct anyway.

**The first pass, as the owner set it:** the finished design, texts and tool, built and proven on the tool's own tests and
the proof (re-recorded with the 13 found breaks); then civicsmith moved to it; then jobs run in parallel on the first 8
real modules in the order, each the first job of H; then a stop. The owner sees, per module: the effort (time, cost), the
uses file beside the code, and whether it serves the provider/user requirement. The files are kept once confirmed. Then he
decides to go on, fix the method, or abandon it (and correct the files written).

## 5. Order, on the owner's decisions

Record (rewriting the entries named in F); rewrite the design and texts in place; build the tool; re-record the proof;
civicsmith's move; the first pass of 8; the owner's review.

## 6. The owner's reply (25 Nov ~15:45Z, in PROCESS #15's session; conversation, not marked)

"It's important that the tool that identifies provider uses be rigorous so that we have a very high level of confidence that
no references are being missed. Making this determination should simply be by trying a few modules. Rather, the tool's
operation should be based directly from a deep understanding of JS's specific means by which a reference is made.

You say that a helper found 31 ways in four families that civicsmith's code refers to an earlier module. We should research
and consider whether we should establish a list of ways that code can refer to an earlier module, make that be the
standard, and change existing references outside those standard ways so that all modules conform to that standard. (Just
brainstorming)

There's no need for the module jobs to run tests when no code is being run. That needs to be in the instructions given at
the top of these jobs.

It sounds like it makes sense to abandon the minimal refactoring work done so far so that we can complete this
provider/user fix before returning to the refactoring.

Yes, there were some decisions made earlier related to the provider/user problem that we knew may not work (and in fact
didn't work). Those decisions to try those methods conflict with the proposed solution we're talking about here. It's
important that the recording of any decisions we make here be entered into the record in ways that keep the record
consistent and update existing records whenever possible rather than just piling more new rulings into an already full
record.

If you're going to measure 5 files to estimate the effort of creating and maintaining module metadata, then I recommend that
we first develop a load-bearing design that meets all requirements, develop and test the tool, develop the plan for running
jobs that process each module (with parallel running), but stop after the first 5 or 8 modules to see how much effort each
module job is taking and the fidelity of each resulting metadata file. There's no advantage to "testing" this on 5 modules
when we can run the real tool. If we find after the initial set of modules that the process isn't workable we can decide at
that point how to fix it or abandon the plan (and fix the metadata files generated so far accordingly).

Yes, it's also important that jobs updating module code recognize and properly handle external interface changes that
providers need to be notified of from other changes that providers don't need to be notfied of."

PROCESS #15's reading: "should simply be by trying" read as "should not simply be" (the next sentence begins "Rather");
asked to confirm. "Abandon the minimal refactoring work done so far" sounds decided; asked once whether to record it.
What follows: the design is reworked to be load-bearing on two new researches (`standard.md`: the complete set of
JavaScript's means of reference and a standard that lets the tool find every use with certainty; `changes.md`: what is an
interface change in JavaScript, what the tool can list mechanically, and the job's guide); jobs that change no code run no
tests, said at the top of their instructions; the five-module sample is dropped in favour of the real pass stopped after
the first 5 to 8 modules for review; decisions recorded by rewriting the existing entries in place (the notice subjects in
`design-decisions-2.md`), not by new ones.

The owner, later the same day (conversation, not marked):

"I the plan is to abandon the refactoring work done so far and finish this fix first, then the decision should not be to not
make any changes to civicsmith, the decision should be to delete the refactoring tranche so that we have a clean repo and
can make a clean start when the fix is in and confirmed as correct.

Running tests is throwaway work with not yet finalized code. I'm saying that we should develop finalized code and use that
code on 8 real modules to create real metadata files which we'll keep once we confirm that the data is correct, the effort
involved is acceptable, and the data really can be used to meet our provider/user dependency requirements."

PROCESS #15: dropping civicsmith's tranche is a product decision, made through civicsmith's coordinator (design part 1 §4;
part 3 §5), carried out by ARCH with the drop built 24 Nov, which civicsmith's version 55db8e4 already holds: main's code
and tests come back; the plan, ARCH's decisions, requirement text, the module list and the lanes stay; the met marks t2 gave
go back to not yet met. The steps for the owner are on his page. The first pass: the finished tool and job texts, run on 8
real modules whose files are kept once correct, the effort acceptable and the files shown to meet the requirement.

The owner, later the same day (conversation): "So the question is whether these gaps can be reliably identified and
converted to "standard" uses?"; "The code that passes a copy does know that it's passing a copy, right? If so, then one
straightforward way of identifying that case is to adopt a naming convention for the value variable being passed so that
it "declares" both that it's a copy and what its a copy of."; "It sounds like the tool that will create the metadata file
while also converting code to use only standard references must also be tasked with properly renaming these copy
variables. Is that reasonable?"; and, on PROCESS's answer (the tool lists, the job judges and converts, the tool writes the
file): "Yes, build that into the corrected design". Built in as §2 H. Also: "Every reference means every reference, not
every reference except a bounch of others" — the claim is withheld until each gap is closed or proven unclosable
(`every-reference.md`, in progress).

The owner, later (conversation): "You say that every gap except one kind of copy can be found with certainty and converted.
But what about that one kind of copy? Again, we're looking for a load-bearing solution, not a partial solution that may
kinda work."; on the example of a screen stating "maximum 10 MB": "Are you saying that the screen hardcoded the 10 MB value
because that's what it was told earlier? That sounds like a bug. If it's efficient to call the module again each time, then
do so. If it's not reasonable to call each time, then a cache, perhaps with a timeout, would work. Or am I missing
something?"; and "In light of that, do we still need the helper?" PROCESS stopped the helper that was to prove detection of
copies by position: a restated fact is a defect, not a reference; the rule says obtain every fact from its owner (§2 A).
