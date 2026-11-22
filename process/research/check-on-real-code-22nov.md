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
