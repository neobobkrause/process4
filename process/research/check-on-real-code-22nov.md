# Research: the tool's check on a real product's code as it stands (22 Nov 2026)

Recorded by PROCESS #6 (rule 3). Not yet a proposal: the measurement is asked for below.

## What was measured

civicsmith's set-up session (22 Nov, `process/lanes/civicsmith/research/setup-session-report.md`), with
the tool at process4 `eeb35f3`, ran `check` once on the first two modules of civicsmith-copy as the code
stands, no job having touched it:

- `setup-words`: 551 disagreements, 518 of them in one vendored third-party file
  (`bio-plane/src/setup-words/vendor/acorn.mjs`), 33 in its tests.
- `record-grammar`: 59 (22 in code, 37 in tests).
- All are of the kind "(a) a comment disagrees with this module's code" or "... tests". The other 176
  modules were not tried.

The required run runs `check` before a module's tests (build text 1 section 5), so the first job on
either module fails its run on code it did not write.

## Why it matters

- This is the first time the reader has met real code. The design marks it unproven ("that it refuses
  only real disagreements", build text 1b command 18; part 10 section 5 by implication). The notice's
  proof ran on eleven made-up modules written to be clean.
- The design's answer to a module with no structured comments is that its job's first step adds them
  (part 2 section 7). It has no answer to a module whose existing comments, or whose plain code, the
  reader already complains about by the hundred.
- A vendored third-party file is no job's to correct. The tool has no way to leave a file out of the
  reader: `language_reader.source` takes only patterns that include (`globTest` in
  `tool/lib/notice/model.mjs` has no excluding form), and a file's owner module does not change whether
  it is read.
- Failed runs are counted with no reset: the third replaces the job's session, the fifth blocks the
  module (part 4 section 10). Disagreements the job did not cause would spend them.

## What is not known

How many of the 178 modules fail, how the disagreements divide (real comment-against-code errors, the
reader's strictness on plain JavaScript, vendored or built files, tests), and how long `check` takes on
a large module. Without that, any change would be a guess (rule 6).

## The measurement asked for

One read-only run by the set-up session, which still holds the repository and the tool: `check` on every
module, with counts by kind, the commonest complaint codes, files under vendored or built folders, the
modules that pass, and the time each took; reported to PROCESS by message. The prompt is on the owner's
standing page and on the lane's page.

## Options to weigh once measured (none proposed yet)

- No change: each module's first job clears its own disagreements; ARCH keeps modules that fail out of
  early tranches.
- The process config can name files the reader leaves out (vendored and built files), by an excluding
  pattern. A tool change; corrects a refusal of files no job can correct.
- `check` refuses only what a job changed (the lines or files of its pull request), and says the rest
  without refusing. A larger change to an approved refusal's reach.
- Kinds of complaint that turn out to be the reader's strictness on plain JavaScript, not a comment
  disagreeing with code, join "cannot tell" (as fault D did for one such kind).

## A second finding from the same report, for later

Design part 7 section 4 act 8 has the set-up session write the first Process4 files "by pull request
into main" and does not say who merges it. civicsmith-copy's approvals, as PROCESS drafted them, let
sessions merge into the tranche branch and the tranche branch into main only, so the owner merged it by
his click (#1119). Options to put to him after civicsmith starts: the owner merges it (as happened, one
click); or a product's approvals let the set-up session merge that one pull request once its check
passes.

## The measurement, as it arrived (22 Nov 2026, 19:24Z)

From the civicsmith set-up session (session_018BhcecbrWWH3xBs3py4NQW), at the owner's request, addressed to
PROCESS #6 and passed on unchanged to PROCESS #7. Read-only; nothing in civicsmith-copy changed. `check` from
the tool at `eeb35f3` (the commit civicsmith's `process.json` names), on `p4-tranche` at `e123992b`, one
module at a time, 300 s each, Node 22. The report in short (its full per-module table is in PROCESS #7's
session, notification of 19:25Z):

- **178 modules: 176 refused, 0 pass, 1 timed out (bundler, 300 s), 1 crashed (pdf-worker).**
- The crash: "RangeError: Maximum call stack size exceeded" in `tool/lib/notice/listing.mjs:232` (`visit`,
  through :275), recursing through TypeScript's walk of a long binary expression. Reproduces with
  `p4 check pdf-worker`. A tool fault.
- **74,271 disagreements**: declared uses 52 (journey-check 50, queue 2; one is queue's test importing the
  later op-declarations, group 3 of `later-module-tests.md`); "(a) comment against code" 11,293; "(a)
  comment against tests" 43,885; "(b) code against a provider's stated interface" 19,041. "Cannot tell":
  143,634. 59,797 of the disagreements are in test files, 14,474 in source files.
- Commonest codes: TS2339 "property does not exist" ×43,141; TS2322 ×13,179; TS2345 ×6,907; TS2353 ×4,199;
  TS2531 ×1,166; then ×722 and fewer.
- Vendored and committed built files: 2,754 (agent-worker's bundle 1,481, acorn 518, ocr-worker's bundle
  444, and four more bundles). bio-plane/dist/ and release/ were not counted: they were given to bundler,
  which timed out, likely on two 28 MB bundles (inference, the report's).
- Total time about 34 minutes; most modules 2 to 40 s.

## What it shows (PROCESS #7)

- **The check cannot be passed by any civicsmith job as things stand.** The required run runs `check` before
  a module's tests (build text 1 section 5). Every module is refused on code its job did not write, by the
  hundred or thousand (capture: 1,972 against its tests). A job's failed runs are counted with no reset:
  the third replaces its session, the fifth blocks the module (design part 4 section 10). So the first
  tranche cannot merge a single job. This is a measured fault that stops work.
- **The cause is in the tool, not in civicsmith's comments.** In `check.mjs` (lines 245-249) every
  TypeScript diagnostic that survives the "cannot tell" list is labelled "(a) a comment disagrees with this
  module's code" when it names no other module, whether or not a comment is involved. The reader runs
  `checkJs` with `strict` and `noImplicitAny` (`tool/lib/notice/ts.mjs:19-29`). On plain JavaScript written
  without type comments, that reports ordinary idioms (a property added to an object later, `null` where
  `undefined` was inferred) by the ten thousand. The owner approved two refusals only: a structured comment
  that disagrees with the code, and code that disagrees with a provider's stated interface (design part 2
  section 6). Fault D's research (19 Nov) already found this gap, as its option D ("refuse only where a
  marked claim is contradicted"); option B was chosen then because it was enough for the trial's
  commented, made-up modules. civicsmith is the first real code.
- The design's answer to a module with no comments (its job's first step adds them, part 2 section 7)
  does not reach this: the job would have to make the whole module, tests included, clean under strict
  type-checking first.
- Two smaller faults ride with it: the crash on pdf-worker (a tool fault), and committed built files, which
  the design says are never committed (part 2 section 6), are read and refused, and slow `check` past
  usefulness. Placing those files is civicsmith's ARCH's work; the tool's part is whether it reads them.

## Options (none adds a test, gate, review or stop; each narrows a refusal or mends the tool)

- **A. No change.** civicsmith opens no job that can merge. Not workable.
- **B. Make `check` refuse only what the owner approved (recommended).** A disagreement is refused only
  where a structured comment states the thing contradicted (a `@type`, `@param`, `@returns`, `@typedef` and
  the other marks of build text 2b section 5), or where a value crosses into a provider's stated interface;
  a diagnostic on plain unmarked code is "cannot tell". This is fault D's option D: the tool brought to the
  design's own words. Larger change; the proof's recorded decisions (the tool's notice-proof tests) must
  still hold, and they were all written with comments, so most should. How many of the 74,271 remain is not
  known until it is run on civicsmith again (one more read-only run, as before).
- **C. Refuse only on the lines the job changed.** `check` still lists every disagreement but refuses only
  those on lines the pull request changed. Smaller change. Old disagreements stay listed, not refused. Cost:
  a job that edits a line of plain code meets the reader's strictness on that line and must type it.
- **D. Also leave out files the process config names** (vendored and built files) by an excluding pattern.
  Narrow; on its own it removes only about 2,754 plus bundler's timeout.
- **E. Mend the crash** on pdf-worker: the walk at `listing.mjs:232` made so a deep expression does not
  overflow, or the overflow reported as "cannot tell" for that file. A correction under any option.

B and C can be taken together (refuse only marked claims, and only on changed lines); D and E go with either.
Moving civicsmith onto the result needs the owner's instruction in its coordinator's session, as for the two
other faults; putting all three together lets civicsmith move once.
