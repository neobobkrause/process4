# PROCESS handover — interim

**Interim and pre-live.** This file is a bridge, used only while nothing is in
force and the tool is still being first built. Once the shared-state issue
exists, the handover lives there in the `handover-process` record (design part 4,
section 4; build text 5, section 4) and this file is retired.

Last written: 2026-11-19, by the first PROCESS session.

## What a successor should read first

Read in full, in order (PROCESS's starting text): all eleven design parts
(`design/00` to `design/10`); then `build/05-the-records-and-following.md`; then
this record of the owner's decisions (`process/design-decisions.md`); PROCESS's
own folder (`process/`); and this handover.

## Where things stand (2026-11-19)

- **Nothing is in force.** The design document is still "proposed". Per the
  owner's standing approvals in `CLAUDE.md`, we are in the phase where the tool
  is first built.
- **The tool is partly built.** Stages 1 and 3 are merged to `main` (branch,
  push, open, ready, results, merge, close, next-job, finished, round-done,
  failed-runs, state read/write, run scope, run tests). The tool's own tests
  pass (45 of 45 on 2026-11-19, Node 22). Not yet built (needs the language
  reader, stage 4 per `tool/package.json`): writing out a module's interface
  listing and sending the notice; the declared-uses check and the two approved
  refusals; listing a told job's related tests; and opening/closing/reading a
  walk's issue (design part 6, section 5; build texts 2b and 05 sections 5–7,
  and 03 for walks).
- **No process change is proposed.** The `changes` record is empty (or not yet
  made; see below).

## This session's work

- Set up PROCESS's own records, on the owner's word of 2026-11-19 ("Set up
  PROCESS's own records"): created the PROCESS folder (`process/`), this interim
  handover, and the design-decisions record scaffold (empty of entries).

## The one thing deferred to the owner

- **The GitHub shared-state issue was not created.** In this setup session the
  tool's `gh`-based path is refused by the permission checker (this session's
  sanctioned GitHub route is the MCP tools, which act under the connected
  account, not the separate sessions' account the design intends). The issue's
  purpose is runtime coordination, which only matters once the process is live.
  Recommendation put to the owner: defer creating it until ROOT first runs under
  the real setup, where `state write --create --process` makes it as designed.
  Awaiting the owner's choice.

## Known environment facts (this harness/session)

- GitHub here is reached through the MCP `github` tools, not the `gh` CLI. The
  tool (`p4`) is built on `gh`, so `p4` commands that touch GitHub are refused in
  this setup session. Plain repository work (write files, commit, push to the
  working branch, open a pull request by MCP) is the sanctioned route, matching
  "the harness's ordinary means" for the first build (design part 4, section 11).
- Working branch: `claude/process-repo-setup-2wgwvz`.
