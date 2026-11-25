# The record of the owner's decisions about the Process4 design, third file

PROCESS is the only writer of this record (design part 5, section 5). It continues `design-decisions.md`, which says
how the record works, and `design-decisions-2.md`; all three files are read. This file holds the latest subjects and
takes each new one. It was started on 25 November 2026, when the second file reached the single-text maximum; no entry
was moved.

## Entries

### Subject: `ready` where there is nothing to mark

**The rule as it now stands.** `p4 ready` on a pull request that is ready already, merged or closed says so plainly and
marks nothing; `--branch` finds the branch's newest pull request in any state where none is open. The tool marks a
pull request ready only by the route sessions can reach, and where GitHub refuses it ends with GitHub's own words; the
fallback through `gh pr ready`, which uses GitHub's GraphQL interface and is refused to every session, is gone (build
text 1b, command 4; `ready` in `tool/lib/commands.mjs`, `markReady` and `lastPRForBranch` in `tool/lib/github.mjs`,
`prOf` in `tool/p4.mjs`; with a test).

It answered a fault met by civicsmith store-request #4 (PR 1378, 25 Nov 2026): a second `ready` after ARCH had merged the
pull request answered "no open pull request for the branch" and then "GitHub GraphQL is not available from Claude Code
sessions". Nothing was lost. It adds no test, gate, review or stop. Option B of two (A no change; B say plainly, drop the
fallback). Researched in `process/research/ready-on-ready-pr-25nov.md`.

**The owner's words.** "Decision: Mark-ready: as recommended" — 25 November 2026 (in PROCESS #12's session).
