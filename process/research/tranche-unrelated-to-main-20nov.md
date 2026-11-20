# Research: the trial's tranche branch shares no history with main (20 Nov 2026)

Recorded by PROCESS #5 before proposing (rule 3). Source: the brief "BRIEF FOR PROCESS — the
process3-probes merge-to-main fault", written by process3-probes coordinator #3 and handed to
PROCESS by the owner on 20 Nov 2026. Its facts (ROOT's and ARCH's fault record, passed on
unchanged; the coordinator's read-only checks) are taken as given. PROCESS has not read
`neobobkrause/process3-probes`: acting on it is outside PROCESS's approvals, and a cross-repository
`gh api` read is refused (design part 7 §3). Verified against the design, build texts 1 and 4 and
the tool at `process4` `main` (`3f63726`).

This is a measured fault (the tranche cannot reach main), so rule 6's "no change by default" does
not apply.

## The facts, from the brief

- `git merge-base origin/main origin/p4-tranche` is empty. Root commits differ (main `ba1eb24…`,
  p4-tranche `3d46b84…`). So no pull request from p4-tranche into main can merge.
- `CLAUDE.md` and `.claude/settings.json` differ. main holds the owner's new 20 Nov approvals,
  landed by him directly on main; p4-tranche holds his older ones.
- The product is on Process4 `3940d130`. Development is stopped (his account-switch instruction,
  18:12Z). No open jobs, walks or lanes. Round 6 of tranche t1 is done: PR 370 and PR 371 merged
  into p4-tranche, PR 373 closed nothing-to-change. Waiting work is empty.
- The owner wants the work on main now, without rerunning jobs. He offered to delete p4-tranche
  himself as the last step.

## Why it happened

- The design says the tranche branch is made from main: design part 7 §4 act 8 ("which also makes
  the tranche branch from main"); part 6 §2 ("the tranche branch is made from it").
- The trial reused a repository whose main already held the earlier process's history. Build text
  4, stage 1, says only that "a plain session started there writes the repository's first content
  as its first act … The base then has no process config". It reads as if the repository were
  empty and never says the tranche branch must start from main's newest commit. The tranche
  branch was made with a history of its own.
- So the design's rule was right and not followed; the build text that guided the trial's setup
  was silent where it mattered. That is an implementation error in build text 4 (design part 1 §6),
  corrected in the text that has it. It needs no new check.

## What the tool already offers

- `p4 branch <name> --into main` makes a working branch from main's newest commit and pushes it
  (`tool/p4.mjs` help; build text 1b).
- `p4 open --title … --into-main` opens a pull request into main. The required run's scope for a
  pull request into main is "nothing", so `module-tests` passes at once (`tool/lib/scope.mjs`;
  design part 2 §9; part 3 §5). Where the base has no process config, the head's is used (build
  text 1 §5).
- `p4 merge` merges it once the run passed (ARCH merges the tranche into main; design part 3 §5).
- The trial's branch rule (build text 4 §4, act 10) forbids deleting or overwriting any branch, with
  no one excepted. So deleting p4-tranche would first need the owner to change that rule.

## Which files

Across two unrelated histories "the changes" cannot be computed; a whole state must be chosen. The
honest choice is **main's tree made equal to p4-tranche's tree, except `CLAUDE.md` and
`.claude/settings.json`, which keep main's versions.** Files only on main (the earlier process's)
leave main; they stay in its history. This makes the result checkable by one page: after the merge,
GitHub's compare of p4-tranche to main lists exactly two changed files. Keeping main-only files
instead would make main a mixture that neither branch ever was, which nothing has tested.

## Options (considered together; none adds a test, gate, review or stop)

- **A — No change.** The tranche stays off main. Fails the owner's goal.
- **B — Copy the state onto a branch from main** (the owner's shape (a)). ARCH makes a branch from
  main, one commit sets the tree as above, opens a pull request into main and merges it. Keeps the
  work. But p4-tranche still shares no history with main, so the next tranche merge fails the same
  way. To go on, either p4-tranche is deleted and remade from main (the owner first changes his
  branch rule, then deletes, then a session remakes it) or the process config names a new tranche
  branch. More steps for him, and a branch rule loosened even briefly.
- **C — Join the two histories (recommended).** As B, but the one commit has two parents: main's
  newest commit and p4-tranche's newest commit (a merge of unrelated histories, every file settled
  to p4-tranche's version except the two protected files, which keep main's). Merged into main by
  pull request. Then p4-tranche is part of main's history: the tranche goes on from p4-tranche as
  the design intends (part 3 §1, "one lasting tranche branch"), later tranche merges have a route,
  nothing is deleted, no branch rule changes. Built by git's own plumbing (`git read-tree`,
  `git checkout origin/main -- <the two files>`, `git commit-tree -p origin/main -p
  origin/p4-tranche`), so no conflict editor and no person editing a file. Same cost to the owner as
  B's first half; none of B's second half.
  - Follow-up within C: his new approvals reach the tranche branch by one pull request from main
    into p4-tranche that changes only those two files; a session opens it and never merges it; he
    clicks Merge (design part 6 §2: he chooses which of his committed versions stands, GitHub's
    buttons carry it out). Until then sessions starting from p4-tranche run on his older approvals.
- **D — Fresh tranche from main and rerun the jobs** (shape (b)). Discards finished, merged work.
  Not recommended.

Who carries it out: ARCH, in the product, on the owner's prior approval typed in the coordinator's
session — the shape already used for a version move (design part 6 §7). PROCESS does not act on a
product's repository. Unproven: that the permission checker passes ARCH's merge into main of a
pull request built this way; if it refuses, the owner's click on "Merge pull request" lands it.

## The recurrence

Correct build text 4, stage 1: the trial's tranche branch is made from main's newest commit, in a
repository whose main already has history as in an empty one. One sentence; design part 7 §4 act 8
already says it. No check is added. "No change" stays open: the design already states the rule.

## "The owner does not edit files"

`3940d130` already carries the owner's decisions of 20 Nov: he never edits a file or types a
command; PROCESS or the coordinator drafts his approvals and he lands them by a click; PROCESS
keeps the forbidden commands. Nothing in options B–D asks him to edit a file or type a command.
Measured gap that remains: he landed his new approvals on main directly, where the design puts
approvals edits on the tranche branch (part 6 §2); option C's follow-up pull request carries them
to the tranche branch by his click.

## The owner's choice

"Decision: option C (But, god, I hope this doesn't take any more time. We've already sent 2 hours on this silly problem.) Go!" — 20 November 2026. Option C is carried out by the trial's ARCH on his instruction in the coordinator's session. The separate correction to build text 4, stage 1: "Decision: fix the setup text" — 20 November 2026; made by its own pull request.
