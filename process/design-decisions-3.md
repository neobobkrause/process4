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

### Subject: The notice: an unknown kind becoming known, nothing lost to size or a race, no repeats

**The rule as it now stands.**

1. **An unknown kind becoming known tells no one.** Where an entry's kind, at some place, was read as "anything" before
   and is a stated kind after, that is the entry being described, not changed; it tells no one, in the module itself and
   in every later module whose listing passes it on. Any other difference in the same entry tells as before (design part
   2, section 7; `known` and `knownDecl` in `tool/lib/notice/notice.mjs`).
2. **Nothing lost to size or a race.** A notice added to an open job's block keeps the block under 60,000 characters: its
   reasons lose their before and after where needed, and where that is not enough they become one reason that runs the
   whole module's tests. Where the job's pull request merged or closed while its block was written, the block is put back
   and the user is treated as having no open job, so its notice waits for its next job. A write GitHub refuses ends with
   GitHub's own words, its message and errors included (`tool/lib/notify.mjs`, `noticecomments.mjs`, `util.mjs`).
3. **No repeats.** A told user whose job pull request, open, merged or closed, already names the notice in its block is
   skipped (`tool/lib/notify.mjs`).

Build text 1b, command 11 says so. It answered faults met on civicsmith on 25 Nov 2026: `notify 1356` (setup-words, whose
job stated kinds the reader had inferred as "anything") reported 164 listings changed and 2,143 entries telling, told 198
modules, and then lost most of the notice to a refusal ("Validation Failed", its reason not kept); one notice reached a
job merged the same moment; and a re-run of `notify 1350` repeated the notice for ten jobs that had already carried it.
On the 150 recorded changes of the proof no answer changed (the proof's product is fully typed); the new rule is tested
on a product made for it. Not yet known: how many of 1356's 198 remain told. It adds no test, gate, review or stop.
Option B of three (A no change; B all three; C the second and third only). Researched in
`process/research/notify-1356-anything-to-stated-25nov.md` and `notify-rerun-repeats-25nov.md`.

**The owner's words.** "Decision: B, as recommended" — 25 November 2026 (in PROCESS #12's session, on the three fixes put
to him together).
