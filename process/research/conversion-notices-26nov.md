# ARCH's findings (a) and (b) from the trial of "who is told": the facility list's first creation, and the conversion's notices (26 Nov 2026, PROCESS #18)

Length: 113 lines. Last section: "Recommendation".

Read at main 3a1824a (dfbd308). Nothing measured on process3-probes; reasoned from the texts and the tool's code, with the
trial's facts (`trial-who-is-told-26nov.md`) and civicsmith's measured costs of 25 Nov (a told job that closes with nothing
to change: about $1.40–$1.90 and 2 minutes, `notify-1356-still-197-25nov.md`).

## (a) The facility list's first creation told every module

**Cause (a tool fault).** `packageVersions` adds each host's version from the facility list's `versions`
(`tool/lib/notice/notice.mjs:786`); before the list exists `readFacilities` returns null (`tool/lib/usesfile.mjs:328-336`),
so the host has no entry. `versionNotices` counts any difference as a change, absent → present included
(`notice.mjs:799-800`), and tells every module whose uses file names a facility of `node`, and every module with no uses
file (`notice.mjs:806-815`); `notify` sends it as "a change to the version of node" (`tool/lib/notify.mjs:224-231`). The
same push wrote every module's uses file (a facility-list change rewrites them all, `tool/lib/usescmd.mjs:92-94`), and
nearly every module uses some Node facility, so all six were told.

**What the design says.** A facility-list change rewrites every module's uses file (design part 2 §7 "Who uses what",
`design/02-modules-jobs-tests-and-the-notice.md:99`; build text 1b command 2): what changes is which uses are places
outside the standard (R14, `build/02c-the-coding-standard.md:39,50`), not any code. Nothing in point 3 or 4 tells a module
because its uses file was rewritten. Point 4 tells "on a change to the host's version" (`design/02...:108`; build text 5
§6, `build/05-the-records-and-following.md:172`). A version written down for the first time is not a change of the host the
modules run on: the product's tests run on the Node that `process.json`'s `node` names (`shims/module-tests.yml:41-45`),
which the facility list does not touch. So telling every module on the list's first creation is **not required by the
design; it is a tool fault.** (Aside, not a fault of this trial: the list's `versions` never chooses the Node the tests
run on; a later edit to it tells users while their tests still run on `process.json`'s `node`.)

**Cost on civicsmith** (if its facility list is first written after the move): one notice per host named in `versions`
(two if it names node and workerd), to about all 204 modules: 204–408 waiting-work entries on a record already past one
comment (needs 6B). Modules 1–8 keep it behind their conversion (`tool/lib/round.mjs:84-85`), then take a told job; the
other ~196 take a told job in this tranche, since notices are always work whatever the scope (`build/05...:64`;
`round.mjs:86-88`) and the round is not done while a module has work (`round.mjs:256-269`). About 204 told jobs: roughly
$285–$390 and ~400 session-minutes, and told modules earlier than the latest running job start above the slot number
(`round.mjs:237-246`). A `package` reason names no item, so a told job that does change code runs the whole module's tests
(`tool/lib/notice/related.mjs:95-96`).

**Smallest correction.** In `versionNotices`, a host whose version the facility list did not hold before (no list, or no
key for that host) is not changed: filter the host keys with `vb.has(p)` at `notice.mjs:799`. A few lines and one test.
It matches the design as written; a clause in build text 5 §6 point 4 ("a version first written is no change") is optional.

## (b) A conversion's merge tells every later unconverted module

**Which rule.** Point 3 (`design/02...:107`; build text 5 §6), applied in `notice.mjs` with `filesChanged` true for a
conversion (it changes the provider's files):
- A later module with a uses file: each place outside the standard whose `mayRefer` names the provider or is `*` tells it
  of any change to the provider's files (`notice.mjs:715-726`). Since the facility list's push wrote every module's uses
  file, unconverted modules have uses files full of places, and `*` is the default `mayRefer` (`tool/lib/notice/refs.mjs:304`)
  and the value for a checker error in untyped code (`refs.mjs:906`): a plain-JavaScript module not yet converted almost
  always holds one. This is the path ARCH saw ("via places-outside-the-standard").
- A later module with no uses file: told if it imports the provider (directly or through a re-export), reads its files or
  starts its program, or if the tool cannot tell (`notice.mjs:643-668`).
The conversion exemption in `changedItems` covers describing only (`notice.mjs:8-11`; design "Not a change",
`design/02...:97`); point 3 tells "whether or not an item changed", and "The insides only" keeps points 3 and 4 even
against a `same` record (`design/02...:119`).

**Counts.** Conversion of module k tells about every later unconverted module: up to 204 − k.
- First pass, modules 1–8 in order: Σ(204 − k) = 1,596 notices; 28 reach the in-scope conversions 2–8 (open jobs take them
  in their block and must answer them before merge), 1,568 reach the ~196 modules outside the scope.
- The whole product converted in order: Σ_{k=1}^{203}(204 − k) = 20,706 notices (n(n−1)/2).

**What each costs a told module that is unconverted and outside the scope.** One waiting-work entry (~60 bytes; 1,568 is
~94 KB, past one comment without 6B) and reasons on the conversion's pull request: one reason per place, so modules with
hundreds of places make long notices, and without 6B `open` copies them whole into the job block and can exceed a comment
(as filings and following did). Then a told job in this tranche (notices are always work; its conversion is not in scope,
so the kind is `told`, `round.mjs:84-88`): between ~196 jobs (all eight merge before any told job opens) and ~1,568 (a told
job after each merge), so about $320 to $2,600 for the pass, and the pass's round cannot end until they are done. A told
job that finds nothing to change runs no test (`design/02...:125`); an `outside` reason relates the test files that hold
or reach the place (`related.mjs:96`) if it does change code. If notices still wait when the module's own conversion opens,
the conversion does not read them: its block carries the conversion alone and the notices stay waiting
(`tool/lib/commands.mjs:357`, `round.mjs:84-85`), to make a told job after the conversion merges, naming places it removed.

**Is it moot?** A conversion "changes no behaviour, declares no change of meaning" (`design/02...:76,127`). That is held
by text, backed by the provider's own tests where running code changed (`design/02...:84,127`) and by the tool's means
check (any change other than describing tells its users by point 1, `notice.mjs:8-11`). Nothing checks that a conversion's
rearranged insides (a dynamic name made a table, a reflective write made ordinary code, a file moved) are invisible to a
place outside the standard in a later module that reaches inside it; that is what point 3 guards for any insides change.
So the notice is not strictly moot, but what it buys is one session's reading of the conversion against its places, with
no test run when it finds nothing; in the trial all were spurious. Note: point 3 also tells all later unconverted
modules of every ordinary change to an early module; options below remove only the conversion's share.

## Options

(a)
- **0. No change.** About 204 told jobs on civicsmith once (~$285–$390), 204–408 entries (needs 6B). No risk added.
- **1. A host version first written tells no one** (tool only, `notice.mjs:799`). Removes the spurious notice. Risk: none
  found; no module's host changed. Adds no test, gate, review or stop.

(b)
- **0. No change.** 1,596 notices and 196–1,568 told jobs for the first pass ($320–$2,600), ~20,700 notices over the
  whole conversion; the record overflows (already does). No risk added.
- **B1. A conversion's merge tells no module by point 3** (places outside, modules with no uses file); its statement that it
  changes no behaviour stands for points 3 as a `same` record stands for an item. Points 1 and 2 still tell (any means
  change but describing), and mocks and order faults are few and could stay. Removes nearly all 1,596 / 20,706. Risk: an
  accidental behaviour change, or an inside rearrangement a later place reaches, is caught only by the provider's own tests,
  the later module's tests at its own conversion where code changed, and the walks, not by a told session's reading. Tool:
  skip the two point-3 branches when the provider is the conversion (`notice.mjs:643-668, 715-726`); text: design part 2 §7
  point 3 and build text 5 §6 (needs the owner's marked decision). Adds no test, gate, review or stop.
- **B2. Notices to an unconverted module are dropped when its conversion runs** (it reads the providers afresh). Alone it
  removes only the stale told jobs after each conversion; the told jobs during this tranche still run, because notices are
  always work. To help it must also make such notices wait for the module's conversion, which would drop point-1 notices of
  real interface changes too, while a conversion runs tests only where its own code changed: a real gap. Restricted to
  point-3 notices from conversions it becomes B1, later and with more stored. Adds no test, gate, review or stop.
- **B3. No change but 6B lands.** The record and job blocks fit; the notices and told jobs all stay. Needed in any case for
  the record civicsmith already overflowed.

## Recommendation

(a) Option 1: a fault against the design as written, smallest fix, no text change needed. (b) B1 together with 6B (B3):
6B because the record already overflows and B1 does not shrink the existing 1,937 entries; B1 because the conversion's
point-3 notices buy one session's reading per later module with no test, at O(n²) sessions, while the provider's own tests
and the walks stay. B1 changes the design text and needs the owner's "Decision:". Without B1, put to him that the first pass
of 8 runs about 200–1,600 told jobs outside its scope before it can stop.

## The owner's decision (26 Nov 2026)

Typed in PROCESS #18's session: "Decision: 1-A, 2-B1, 6B" — the group put on his page "Process4 Waiting for Bob"
(05:45Z): 1-A the tool's fault fixed (a host version first written tells no one); 2-B1 a conversion's merge tells no module
by point 3; 6B a record in parts, a starting job's block cut to fit (research `waiting-work-record-size-25nov.md`). Built
as one version, so civicsmith moves once.
