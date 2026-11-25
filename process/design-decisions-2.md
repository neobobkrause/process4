# The record of the owner's decisions about the Process4 design, second file

PROCESS is the only writer of this record (design part 5, section 5). It continues
`design-decisions.md`, which says how the record works; both files are read. This file holds the
later subjects; `design-decisions-3.md` takes each new one since 25 November 2026. It was split off on 22 November 2026, when the record reached
the single-text maximum; no entry was changed by the split.

## Entries

### Subject: Standardized session names

**The rule as it now stands.** Every Process4 session carries a standard name, so the owner
can see each one and its lineage. PROCESS is named `PROCESS #<generation>`; a session that
holds a role, `<product> <role> #<generation>` (e.g. `civicsmith ARCH #3`, `civicsmith ux lane
#2`). The generation counts that role's sessions on that product — one for the first, one more
at each refresh, replacement or takeover — and for a long-lived role it is kept in that role's
handover record, so it continues across a full stop and never resets. A job, which holds no
role, is named `<product> <module> #<n>` with `<n>` its job number (the `n` of its branch
`job/<module>.<n>`; earlier `job/<module>/<n>`), so each open job is still told apart by its module (design part 2, section
3; part 4, section 9); a walking session, `<product> walk #<number>` with its walking-session
number. A session that keeps a handover record names itself on start from the generation there;
ARCH names a job and a walking session when it starts them; the owner-started ROOT and PROCESS
name themselves. The name is set with the harness's set-session-title (design part 7, section
1), unproven until the trial (part 7, section 3).

This added the convention, harness-neutral, to design part 4, section 11; the mechanism and the
updated "seeing each open job" row to part 7, section 1, with the set-session-title gap in part
7, section 3; a Codex "Not known" row to part 8, section 1 (Codex is later work); the
`generation` field to the handover record form (build text 5, sections 2 and 4); and a naming
clause to the ROOT, watcher, coordinator, ARCH, lane and PROCESS starting texts. It needs **no
tool change** — the generation rides in the handover records, which the tool stores and reads as
arbitrary JSON — and adds no test, gate, review or stop. It is a naming requirement the owner
added (option B), which the process still meets. For a job the generation is the job number
(the owner's option (a) for the job name): it stays the same when a filled or dead job's session
is replaced from the same branch, and rises only when a fresh job opens for the module.
Researched in `process/research/session-naming-standardization-20nov.md`.

**The owner's words.** "how a job is named decision: as recommended" — 20 November 2026 (the job
name is `<product> <module> #N`, option (a)). "Options for the whole change:decision: s
recommended" — 20 November 2026 (adopt the convention, option B).

### Subject: How the coordinator finds the live PROCESS

**The rule as it now stands.** The coordinator finds the live PROCESS from its **own product's
`roles` record** (`process` field), a local read of its own repository — never a cross-repository
read. ROOT writes that field, learning the live PROCESS from a **message PROCESS sends ROOT on
start**; PROCESS knows which product's ROOT to message from a `products` registry in its own
`handover-process` record (each product it serves and that product's ROOT session), seeded by the
owner once per product, and kept current because ROOT, on its own start, messages the PROCESS
named in `roles.process` its new address. When `roles.process` is none or names a session that no
longer answers, the coordinator surfaces starting PROCESS on the owner's standing page (design
part 6, section 6). No session writes another repository's state and no session reads it across
repositories; only cross-repository **messages** pass, which are not refused.

This corrected the measured fault that a refreshed coordinator could not determine the live
PROCESS: decision C (19 November 2026) had the coordinator read `handover-process` across
repositories with `state read --repository`, but a `gh api` read of another repository's issue is
refused (HTTP 403 — a session is scoped to its own repository; design part 7, section 3), so the
coordinator fell back to asking the owner on every refresh. This supersedes **only** that
cross-repository-read mechanism; decision C's settled point that **the owner starts and refreshes
PROCESS** stands. It changed design part 4, section 5 and part 6, section 7; build text 5,
sections 2 and 4 (the `roles.process` field and the `products` registry); and the PROCESS, ROOT
and coordinator starting texts. It needs no tool change (the `roles` and `handover-process`
records are stored and read as arbitrary JSON) and adds no test, gate, review or stop; it replaces
a broken mechanism with one that uses only proven channels (same-repository state and
cross-repository messaging). Option C of five put to the owner (A no change; B add_repo push, an
over-grant; C messaging registration, recommended; D persist the owner's answer, the fallback
within C; E find PROCESS by its standardized session name, worth measuring). Researched in
`process/research/coordinator-cannot-read-process-liveness-20nov.md`.

**The owner's words.** "Decision: option C" — 20 November 2026.

### Subject: PROCESS and the products it serves share one Claude account; the first account switch moves them together

**The rule as it now stands.** PROCESS and the products it serves run under one Claude
account. Their coordination — a product's coordinator reporting a process fault to PROCESS,
PROCESS announcing itself to a product's ROOT, PROCESS messaging a product's coordinator
(design part 4 §5; part 6 §§6–7) — runs entirely on session-to-session messaging, which the
harness scopes to a single account: a session reaches only its own account's sessions (this
is why cross-repository messaging within one account works — design part 7 §3 — while a
cross-account reach is not available). Cross-account PROCESS↔product coordination is
therefore not built. An account switch (build text 6) that moves a product PROCESS serves to
another Claude account moves PROCESS to that account as well, so the two stay together; the
first account switch (the trial; design part 10 §4, item 15) does so. This does not forbid a
future cross-account arrangement — a coordination channel that does not rely on same-account
messaging would be a process change (option C, the option not taken here) — it records that
none exists now. It changed design part 7 §3 (the account-scoping of session acts) and build
text 6 §1 (the single-account constraint on an account switch). It adds no test, gate, review
or stop; it documents a harness constraint and the means chosen for the first switch. Option
B of three put to the owner (A: the trial moves alone, PROCESS stays and the owner relays
across the account line; B: move PROCESS with the trial, one account; C: build cross-account
coordination first).

**The owner's words.** "Decision: B — Move PROCESS to the new account too (to simplify this first account switch)" — 20 November 2026.

### Subject: The owner never edits a file or types a command

**The rule as it now stands.** Every act of the owner's is clicks on pages named by their full
address, or words he types into a session or into a field of a form. No act asks him to edit a
file or type a command, and his standing page gives each act's steps that way (design part 1,
section 3). In particular:

1. **His approvals.** Their wording is drafted with care: on his request PROCESS (for the
   process's repository) or the coordinator (for a product) drafts the whole text and shows it to
   him in plain words, or he types it himself. The session places the text he approved, unchanged,
   in a pull request that changes only that file, and never merges it. He reads the changed file on
   the pull request's page and lands it by clicking Merge. A draft has no effect until he lands it.
   No session changes his approvals on its own, and no session merges a change to them. (Option B
   of 20 November 2026, below, replaced an earlier reading that no session may draft them: the
   authority to change them is his alone; drafting is work done for him.) Where one of the two files differs between two branches, he
   chooses which of his own committed versions stands, and GitHub's own buttons carry it out (part
   6, section 2).
2. **The forbidden commands** are a technical list, the same for every repository. PROCESS keeps it
   as `shims/claude-settings.json` in the process's repository, first made as a byte-for-byte copy of
   the process repository's own `.claude/settings.json` as the owner committed it, and changes it only
   as a process change on his marked decision. A
   session copies it, unchanged, into a repository by a pull request he lands with a click (part 6,
   section 2).
3. **The environment's permissions-management settings.** A session reads the environment and
   tells him whether it carries them. Where they are missing, the session proposes the change
   through the harness's approval prompt, and he approves it with a click. He never pastes a
   script (part 7, sections 4 and 5; build text 6, section 3).
4. **The tool's first build.** The rule that the owner merged each pull request of the building
   session himself is removed. The tool is built, only PROCESS changes it, and the owner merges
   none of its pull requests (part 4, section 11; build texts 1 and 4).
5. **The support procedures** for promoting a release, rolling one back, and handling a reported
   problem are each written for him as clicks (part 3, section 8).

Kept as they stand, as recommended: a held merge, made only when he asks for one; and his choice
for a tranche that does not come clean, between merging it into main with its flaws named and
dropping it (part 3, section 5). His click on Merge for a change to his own approvals is the one
guard that keeps a session from changing them. That click lands on the tranche branch, not main.

This answered a measured fault. The trial's tranche could not merge into main because its
approvals file differed between the two branches. The design's only route to settle that, and
every approvals edit, was the owner editing a file, which he does not do. The change adds no test,
gate, review or stop: it replaces file-editing acts with clicks. Unproven: that the permission
checker lets a session place his typed words in his approvals file; and in a repository whose
approvals forbid a session to change that file (the process's repository among them), the route
works only once his approvals allow it. Option B, with sub-choice (ii) for the forbidden commands,
of three put to the owner (A no change; B choose, don't type; C sessions resolve, write and merge).
It changed design parts 1, 3, 4, 6, 7 and 10; build texts 1, 4 and 6; the coordinator's and
PROCESS's starting texts; and the starting-texts index. Researched in
`process/research/owner-acts-without-files-20nov.md`.

**The owner's words.** "Decision: as recommended" — 20 November 2026. On who drafts the
approvals' wording (A: he writes every word; B: PROCESS or the coordinator drafts, he decides and
lands it by his click): "Decision: option B" — 20 November 2026.

### Subject: A tranche branch starts from main

**The rule as it now stands.** A product's tranche branch is made from the newest commit of its
main branch, also where main already holds an earlier history (design part 7, section 4, act 8;
part 6, section 2). Build text 4, stage 1, now says so for the trial. This answered a measured
fault: the trial's tranche branch `p4-tranche` was made with a history of its own, shared none
with main, and could not merge into it. The one-off repair is option C: the trial's ARCH joins the
two histories by one pull request into main, keeping main's approvals and forbidden commands, and
the owner carries his approvals onto the tranche branch by clicks. It adds no test, gate, review
or stop. Researched in `process/research/tranche-unrelated-to-main-20nov.md`.

**The owner's words.** "Decision: option C (But, god, I hope this doesn't take any more time. We've
already sent 2 hours on this silly problem.) Go!" — 20 November 2026. "Decision: fix the setup
text" — 20 November 2026.

### Subject: Setting up an existing product under Process4

**The rule as it now stands.** At the owner's act 8 (design part 7, section 4), the plain session he
starts on the product's repository drafts the product's approvals before the product has a
coordinator (part 6, section 2), writes the product's first Process4 files — `process.json`, the
module list, the required-run workflow and the copy of the forbidden commands — by pull request into
main, and then makes the tranche branch from main's newest commit, also where main already holds an
earlier history. At act 10 the branch rule's required check `module-tests` replaces any check an
earlier process required. Part 7, section 4 records that the trial carried out acts 1 to 10, act 10
before act 9; only a real product is unproven. Build text 2's requirements-file size follows the
design's single-text maximum (60,000 bytes on Claude Code). Points 1, 2, 3, 5, 6 and 9 of the
civicsmith lane's nine; no change for 4 (the owner seeds a product's ROOT once, build text 5,
section 4), 7 (a check in civicsmith's conversion plan) and 8 (the account switch is done). It adds no
test, gate, review or stop. Researched in `process/research/civicsmith-lane-points-20nov.md`.

**The owner's words.** "Decision: B" — 20 November 2026 (a comment on his standing page, on the
item "Waiting for you: fixes the civicsmith lane found in the setup steps").

### Subject: A session can set its own name (seen to work)

**The rule as it now stands.** Design part 7 records, as a measured fact, that a role session in
Auto mode can set its own name with the harness's set-session-title: PROCESS #1, #4 and #5 named
themselves, and the trial's ROOT, watcher, ARCH and coordinator sessions carry their standard names.
The item is removed from part 7, section 3 ("Not proven on Claude Code"). It records a measured fact
and adds no test, gate, review or stop. Option A of two (A: record it; B: no change).

**The owner's words.** "Decision: as recommended" — 20 November 2026 (a comment on his standing
page, on the item "Record that a role session can name itself").

### Subject: Onboarding a product — the onboarding lane, how it reads the product, and who changes settings

**The rule as it now stands.** For each product that joins Process4, PROCESS starts one onboarding
lane in the process's repository. The lane talks directly to PROCESS. It plans the product's move and
writes the product's conversion plan. It keeps the product's own "waiting for Bob" page, updated with
where the onboarding stands and with each act it needs from the owner, each fully detailed as steps
(each page by its full address, each button by its exact label, what he should see after each click,
and the whole list of permissions for each token he makes). It writes the brief for the session that
sets the product up. It starts with GitHub: the steps he needs to make the GitHub token, and to set
up the product's repository. No GitHub token need be made where sessions act through the harness's
own connection to GitHub; on Claude Code they do, through Claude's GitHub connection as the sessions'
second account, so none is made. The lane ends when the product's ROOT has started; its folder and
research stay.

The lane does not read or act on the product's repository, accounts or services itself: the owner
starts a read-only session on the product's repository with the lane's brief, and its report reaches
the lane, by message where that repository's approvals allow it and through the owner otherwise.
Every change that onboarding needs to a setting of GitHub or of the hosting account is the owner's
own click, from the lane's page; no session is given the means to change those settings.

The three questions as PROCESS first put them on his standing page, each with "no change" open: (1)
an onboarding lane for each product, recommended yes; (2) how it reads the product — (a) a read-only
session he starts on the product's repository with the lane's brief, or (b) read-only GitHub and
Cloudflare tokens so the lane reads directly — recommended (a); (3) who changes GitHub settings — (a)
he does, by clicks from the lane's page, or (b) a session holding an admin token — recommended (a).
On the GitHub token, PROCESS put three options (A no token, keep the connection, recommended; B a
fine-grained token he makes, with the tool changed and acts showing as him; C a classic token made as
the sessions' account, with the tool changed); his words below settle it as no token where the
connection carries the acts. The lane's grounds are in
`process/lanes/civicsmith/research/github-token-permissions.md`.

It changed design part 0 (sections 1 and 6), part 1 sections 3 and 5, part 4 section 2, part 6
section 8, part 7 section 4, part 10 sections 2 and 3, and the PROCESS starting text. It adds no test,
gate, review or stop: it names a lane PROCESS could already start, and writes down routes already in
use. Unproven: an onboarding lane carried through to a product's ROOT starting; publishing a release
through the connection. Researched in `process/research/product-onboarding-22nov.md`.

**The owner's words.** "1. Decision: yes" — 22 November 2026. "2. Decision: A" — 22 November 2026.
"3. Decision: A" — 22 November 2026. "Decision: The product-specific lane talks directly to PROCESS
and keeps the product's "waiting for Bob" page updated with status and fully detailed steps; and
starts with the steps I need to create GitHub token and set up the product-specific repo. But a
Github token needn't be created if sessions act through Claude's GitHub connection." — 22 November
2026.

### Subject: A product's token is made once, with every permission its development will need

**The rule as it now stands.** A token the owner makes for a product is made once, when the product
joins Process4, with every permission that will be needed across all stages of that product's
development under Process4, for its whole life. The product's onboarding lane works out the whole
list first and gives it on his page, so that no later stage asks him to make another token. Where the
product's development uses more than one service, there is one such token for each. No GitHub token
need be made where sessions act through the harness's connection to GitHub (the entry above). A token renewed
before it expires carries the same permissions. It changed design part 0 section 6 (the deploy
token), part 1 section 3, part 7 section 4 (act 6) and part 9 section 1. It adds no test, gate,
review or stop.

His words came as the answer to question 4 on his standing page, which asked about two seed
values in the sessions' environment. They state a rule for tokens, and that rule is what is recorded
here. What becomes of the two seed values he decided separately on the same day: they are production
signing keys, and they stay (the entry "Publishing a release" in `design-decisions.md`).

**The owner's words.** "4. Decision: The token created for the product being onboarded should be the
token with all the permissions that will be needed across all stages of process4 driven development
across that product's entire lifecycle. Anything short of those privileges will require me to
unnecessarily create yet another token." — 22 November 2026.

### Subject: When the tool's own tests run

**The rule as it now stands.** The tool's tests run only where the tool is changed. Before pushing,
PROCESS runs only the tests of the tool it changed, and none where no tool changed. In the process's
repository the required run `tool-tests` still reports on every pull request, because GitHub requires
it; it runs the tests only on a ready pull request that changes a file of the tool, and passes at once
on a draft and on any other pull request. A file of the tool is anything under `tool/` or `shims/`,
the two starting texts the tool fills in (a job's and a walking session's), and the workflow itself.

What was measured. The workflow already passed at once where no file of the tool changed; PROCESS #6
told the owner on 22 November that it ran the tests on every pull request, which was wrong and is
corrected here. Three things did run needlessly and are removed: PROCESS #6 ran the whole suite in its
session before pushing a change of texts; the workflow counted every starting text as a file of the
tool, so a change to a role's text ran the suite; and the suite ran twice on a pull request that
changed the tool, once when it was opened as a draft and again when it was marked ready. It changed
the workflow `.github/workflows/tool-tests.yml`, design part 6 section 5, build text 1 section 6, and
the PROCESS starting text (its acts and rule 7). It removes test runs; it adds no test, gate, review
or stop.

**The owner's words.** "Decision: github should not be run tool tests on every pull request to the
process4 repository. PROCESS  should never run tool tests before pushing except the tests for a tool
that has been changed." — 22 November 2026.

### Subject: A declared use of a later module is refused

**The rule as it now stands.** The check of declared uses, which already runs inside a module's own
tests and reads its tests as well as its source, also refuses a declared use of a module that is not
before this one in the order. So a job whose code or tests reach a later module cannot make the check
pass by declaring that module. The job cannot settle it in its own module's files: where the use is
needed it reports to ARCH and is recorded blocked, other work goes on, and ARCH corrects the order, the
module list or the boundary (design part 2, sections 1, 3, 6 and 8).

Why. The owner reported that under the earlier process the tests of some modules referred to modules
later in the order, and work got stuck. The design already forbade such a use, but nothing in the tool
compared a module's declared uses with the order: build text 2 said a job adding a use of a later
module "is caught only by ARCH's reading". The order rule is also the ground on which a chain of
notices ends (part 4, section 10). Nothing was measured under Process4: no job had done it. Option B
of three (A no change; B the existing check refuses it, recommended; C the tool tells ARCH and refuses
nothing). It makes an existing check refuse one more thing, on his word; it adds no test run, gate,
review or stop of its own. It changed the tool (`tool/lib/notice/check.mjs`, with a test), design
part 2 sections 1 and 6, build text 1b command 18 and build text 2 section 3. A limit that stands: the
check reads imports by path inside the product; a reference made another way (a package name, a
started process, a file read) is not seen by it. Researched in
`process/research/tests-referring-to-later-modules-22nov.md`.

**The owner's words.** "decision: option B, as recommended" — 22 November 2026.


### Subject: Each session's copy of the process

**The rule as it now stands.** Each session fetches its own copy of the process at the commit the product's
process config names, into a folder outside the product's working files, and installs the tool's one
dependency there. No session edits its copy; that is held by text, as most rules are (design part 6, sections
1 and 5). The fetch line no longer ends with a step that removes write permission from the copy: cloud
sessions run with full rights, so that step stopped nothing. Measured by civicsmith ROOT #1 (22 Nov 2026,
reported through civicsmith's coordinator as a process fault) and again in PROCESS #7's session. No session
is known to have edited its copy, and nothing in the copy is ever committed.

It changed the tool's fetch line (`tool/lib/config.mjs`, with its test), the owner's plain ROOT prompt
(`starting_texts/root.md` part A), build text 1 section 2, build text 2 section 7, build text 4, design part
4 section 11, part 6 sections 3 and 5, part 7 sections 1 and 3, part 10 section 3, and the starting-texts
index. It removes a step; it adds no test, gate, review or stop. Option 1B of three put to the owner (1A no
change; 1B drop the step and say what holds the rule; 1C a stronger system lock in every session's first
command). Researched in `process/research/fault-fetch-copy-not-read-only-22nov.md`. A product receives it
only when it moves to a version that holds it (design part 6, section 7).

**The owner's words.** "Decision: 1B, as recommended" — 22 November 2026 (a comment on his standing page,
on option 1B).

### Subject: Writing a lane's entry before the lane starts

**The rule as it now stands.** A lane's entry in the lanes record is written before its session is
started, as a claim that names no session yet (`"session": null`, `"live": true`); once the start returns,
the starter writes the same entry again with the session's address. The tool accepts that one fill-in and
still refuses a second live session for a lane the record shows live (design part 4, section 3; build text
5, section 2). This holds for a product's lanes (ARCH) and for PROCESS's own lanes. It corrected a measured
fault: the address exists only after the start, and the tool refused to put it in place of what was written
before, so civicsmith's record named a placeholder as its live UX lane (civicsmith ARCH #1, 22 Nov 2026;
PROCESS #6 met the same with its own lane). civicsmith's ARCH can put its record right in two writes (the
entry not live, then live with its address), and with this version in one.

It changed the tool (`laneRefusal` in `tool/lib/state.mjs`, with its test), design part 4 section 3, build
text 5 section 2, ARCH's and PROCESS's starting texts, and the starting-texts index. It adds no test, gate,
review or stop; it keeps the existing refusal and lets the record hold what it was meant to hold. Option 2B
of three put to the owner (2A no change; 2B claim first, address after; 2C record after the start).
Researched in `process/research/fault-lanes-record-before-start-22nov.md`.

**The owner's words.** "Decision: 2B, as recommended" — 22 November 2026 (a comment on his standing page,
on option 2B).

### Subject: The check refuses only what a structured comment states

**The rule as it now stands.** Inside a module's own tests, `check` refuses a type disagreement only when what
it contradicts is stated by a structured comment: one of this module's own marks (refusal (a)), or a
provider's stated interface in its public files (refusal (b)). A disagreement on plain code that no
structured comment states is "cannot tell" and never refused (design part 2, section 6; build text 1b, command
18; build text 2b, section 5). The existing "cannot tell" rules, the error-assertion exemption and the
declared-uses check are unchanged. With it, as recommended beside 3B on the owner's page: the process config's
`language_reader.exclude` names files the reader leaves out (vendored copies, committed built bundles), which
no module then owns, checks or lists (build text 2, section 7); and the tool's walks over a file no longer
overflow the stack on a very long expression, a file the language's own reader still cannot walk becoming
"cannot tell" for `check`.

It corrected a measured fault that stopped work: on civicsmith, the first real code, `check` refused 176 of
178 modules and passed none (74,271 complaints, most on plain uncommented code and in tests), timed out on one
and crashed on another (22 Nov 2026). The tool had labelled every strict-reader complaint as one of the two
approved refusals. One of the proof's 48 recorded refusing decisions changes: T14 (module meter), a refusal of
`process.stdout.write(..., 'utf8')` against the tool's own Node description, which no comment states and whose
recorded needs were already empty, so it was false; it is re-recorded in the proof's expected results with the
reason. It narrows a refusal and mends the tool; it adds no test, gate, review or stop. Option 3B of three put
to the owner (3A no change; 3B refuse only what a comment states; 3C refuse only changed lines). Researched in
`process/research/check-on-real-code-22nov.md`; fault D's option D (19 Nov) is the same idea. Not known: how
many of civicsmith's complaints remain, until one more read-only run there.

**The owner's words.** "Decision: 3B, as recommended" — 22 November 2026 (a comment on his standing page, on
option 3B; PROCESS read "as recommended" as including the two smaller repairs recommended beside it, and said
so to him on the same thread).

### Subject: When a long-lived role is refreshed

**The rule as it now stands.** A long-lived role is refreshed at the first natural pause in its work after its fill
reaches the stated fill level (50 percent). Where it cannot read its fill, it is refreshed at a natural pause, as before.
A pause alone does not call for a refresh (design part 4, section 5; part 1, section 7; the refresh rule of the ROOT,
watcher, coordinator, ARCH, lane and PROCESS starting texts). This corrected a measured fault: "at a natural pause or at
the fill level, whichever comes first" made every pause a refresh, so civicsmith's ARCH was replaced four times in under
an hour at 21 to 30 percent full, each successor reading everything again, against the owner's words that refreshes
"are expensive and slow, and thus should be minimized" (the entry "The four reading values" in `design-decisions.md`).
It removes refreshes; it adds no test, gate, review or stop. Option B of three (A no change; B the fill level decides,
the pause times it; C ROOT may refuse an early refresh). Researched in `process/research/refresh-at-every-pause-22nov.md`.

**The owner's words.** "decision:B" — 22 November 2026. "Decision: all as you've recommended" — 22 November 2026 (in
PROCESS #8's session, after PROCESS asked which of the three open choices "decision:B" answered).

### Subject: A replaced session's scheduled wake

**The rule as it now stands.** Whoever archives a session also removes that session's scheduled wake, if it has one, so
no wake fires into an archived session. At a takeover the watcher makes its own ROOT wake and removes the old ROOT's wake
and its own watcher wake (design part 4, sections 5 and 6; ROOT's and the watcher's starting texts). This corrected a
measured fault: civicsmith watcher #1's hourly wake stayed enabled after the session was archived, because no text named
removing a wake. It adds no test, gate, review or stop. Option B of three (A no change; B the archiver removes the wake;
C each session removes its own before asking to be replaced). Researched in
`process/research/wake-left-after-archive-22nov.md`.

**The owner's words.** "decision:B" — 22 November 2026. "Decision: all as you've recommended" — 22 November 2026.

### Subject: Research is read through an index

**The rule as it now stands.** A role's research is background, not governing text. A lane, and PROCESS, reads in full
an index of its research, one line for each file saying what it holds, and reads a research file, or gives it to a
worker, when a question needs it; it keeps the index current. So research can grow without the role's reading set
passing the maximum (design part 4, section 3; part 5, section 3; part 6, section 7; the lane's and PROCESS's starting
texts; the starting-texts index). This replaced "every later session of the lane reads it first" (part 4, section 3;
the owner's confirmation of the lane rules in "The smaller readings", `design-decisions.md`). It corrected a measured
fault: civicsmith's UX lane had to read about 300,000 bytes at its start, and PROCESS #8 about 700,000, past the
175,000-byte set maximum and the 220,000 bytes measured to be read whole. It removes reading; it adds no test, gate,
review or stop. Option B of four (A no change; B research through an index; C condense research; D measure larger
sets). Researched in `process/research/lane-reading-set-over-maximum-22nov.md`. Left as it stands: PROCESS's own set,
with the two decision-record files (about 71,000 bytes), is about 211,000 bytes, still past 175,000 though under the
220,000 measured.

**The owner's words.** "decision:B" — 22 November 2026. "Decision: all as you've recommended" — 22 November 2026.

### Subject: The form of a job's branch

**The rule as it now stands.** A job's branch is `job/<module>.<n>`, `<n>` its job number: one flat name under `job/`.
The tool still reads the earlier form `job/<module>/<n>` as a job's branch, so earlier jobs and their numbers count, and
the trial's history carries on. Because the name still begins `job/`, the required-run workflow each product has
committed reads a job's block as before, and a product receives the change by moving to the latest version (design part
6, section 7). The old branches stay as history.

It corrected a measured fault that stopped every civicsmith job: civicsmith-copy kept 207 branches named `job/<module>`
from its earlier process, and GitHub cannot hold `job/<module>/<n>` beside `job/<module>` ("directory file conflict"),
so 137 of its 204 modules, the first in the order among them, could have no job branch (civicsmith ARCH #7, 23 Nov 2026,
passed on by civicsmith coordinator #3). It changed the tool (`tool/lib/round.mjs`, `commands.mjs`, `notify.mjs`,
`scope.mjs`, `p4.mjs` help, with a test of a job branch beside an old flat one) and build texts 1, 1b, 2 and 5; the design
names no branch form and is unchanged. It adds no test, gate, review or stop. Option B of three (A no change, the owner
deletes the old branches; B a branch form that cannot meet them; C skip such modules). Researched in
`process/research/job-branch-name-collides-23nov.md`.

**The owner's words.** "Decision: Change the job branch's form as recommended (B)" — 23 November 2026.

### Subject: A product's repository may hold secrets

**The rule as it now stands.** Process4 sets no rule on the secrets a product's repository keeps for its own
workflows; that is the product's matter. The owner's act 3 (design part 7, section 4) sets a repository's merges, branch
deletion and a read-only token for GitHub's machines, and no longer says "no repository secrets". What stands beside it:
the required run's second part holds no access token (design part 2, section 6), and the secret values Process4 itself
uses (the deploy token, a product's production signing keys, a release token) are kept in the sessions' cloud
environment (parts 1, 3, 7 and 9).

Why. The words had no reason or source in the design and no decision of the owner's behind them; sessions kept building
on them (the civicsmith lane's settings checklist and token list, PROCESS's notes, a question put to him on 22 Nov), and
PROCESS #9 wrongly gave part 2, section 6 as their reason. A read-only worker searched every text: act 3 was the only
governing statement. It removes a rule; it adds no test, gate, review or stop. No tool or starting text changed, so no
product needs to move. The session-written texts that rested on the words carry a withdrawal note in place. Option B of
two (A no change; B remove the words). Researched in `process/research/no-repository-secrets-rule-23nov.md`.

**The owner's words.** "Process4 keeps getting caught up with this false rule that it holds that a product's repository
can hold no secrets. That is not the case." — 23 November 2026 (conversation). "Decision: B" — 23 November 2026 (a
comment on his page, on option B).

### Subject: The tool's code reading on a large product

**The rule as it now stands.** `notify` works out which modules a merge changed from the two module lists and the changed
file names alone, before reading any code; where none changed it says so and reads nothing. The commands that read a
product's code (`listing`, `notify`, `check`) run with a memory allowance of three quarters of the machine's memory
where node's default is less. It changes no answer the tool gives.

It corrected a measured fault: on civicsmith (204 modules) `notify` crashed out of memory on a merge that changed only
process files, because it read the whole product twice before asking whether any module changed; run again by hand with
12 GB it finished (civicsmith ARCH #8, 23 Nov 2026, passed on by civicsmith coordinator #4). It changed the tool
(`tool/lib/notify.mjs`, `tool/p4.mjs`, with tests) and build text 1b, command 11. It adds no test, gate, review or stop.
Option B of three (A no change; B both repairs; C the first only). Not known: whether a job merge's notify on civicsmith
fits a session machine's memory with the second repair. Researched in `process/research/notify-out-of-memory-23nov.md`.

**The owner's words.** "Decision: B" — 23 November 2026 (a comment on his page, on option B).

### Subject: A job whose block ARCH ended says it goes on

**The rule as it now stands.** A job stopped by another module records that it is blocked and its slot is freed; when
that module merges, the job is ready again. Where ARCH ends the block by its own decision instead (a change to the
module list, the order or a boundary, design part 2, section 8) and tells the job to go on, the job pushes with
`--unblocked "<why>"`, which rewrites its own record to say it goes on; the round then shows it open and its slot used.
The job is still the record's one writer (design part 2, section 3; part 4, section 11; build text 1b, command 2; build
text 5, section 5; the job's starting text).

It corrected a measured fault: on civicsmith three blocks (setup-words, pdf-worker, ocr-worker) ended by ARCH's decision,
not by the blocking module's merge; the tool kept reading them blocked, counted their slots as free, and ARCH filled
slots by hand (civicsmith ARCH #8 and setup-words #1, 23 Nov 2026, passed on by civicsmith coordinator #4). It changed
the tool (`push` in `tool/lib/commands.mjs`, `tool/p4.mjs` help, with a test) and the texts named above. It adds no
test, gate, review or stop. Option B of two (A no change; B `push --unblocked`). Researched in
`process/research/blocked-record-not-cleared-23nov.md`.

**The owner's words.** "Decision: B" — 23 November 2026 (a comment on his page, on option B).

### Subject: The notice reads only what a merge can affect

**The rule as it now stands.** `notify` reads in stages. For each module a merge changed, it reads that module's
interface listing before and after, from that module's files and what they import. Where the listing is the same,
nobody is told and no other module is read. Otherwise it reads, one at a time and as they stood before the merge, only
the later modules that can use it: those whose imports, followed file to file, lead to it, those that declare it, those
that reach a carrier where operations or tables are involved, and those with an import it cannot follow (counted in, as
"cannot follow"). "Accepts more" is confirmed from that module's public files only. Where a reading still does not fit
the machine's memory, `notify` says so plainly, tells nobody, and names the notice owed, instead of crashing. The rules
of the notice (design part 2, section 7; build text 5, section 6) are unchanged; the replay of the proof's 150 recorded
changes gives the same whole reports, with no recorded answer changed. It changed the tool (`tool/lib/notice/staged.mjs`
and `notices.mjs`, new; `notice.mjs`, `ts.mjs`, `notify.mjs`; tests) and build text 1b, command 11. It adds no test,
gate, review or stop.

Why. Decision B of the same day was not enough: on civicsmith a job merge's `notify` ran out of memory even at 12 GB,
because it read and type-checked the whole product twice, and a third time in part, for every merge. The owner asked
whether the tool was properly designed for its purpose; it read far more than the notice needs. Measured on a built test
product of 312 modules: the smallest memory that lets a notice finish fell from 256 MB to 128 MB where 166 later modules
can use the change, and to 64 MB where 6 can; across the 150 proof changes, 76 kept their listing and read no other
module. Not known: whether a civicsmith job merge now fits a session machine's memory. Option D of four (A no change; B
read one side at a time; C B with a plain message; D read only what a merge can affect). Researched in
`process/research/notify-out-of-memory-23nov.md`.

**The owner's words.** "The huge need for memory by this tool leaves me wondering if the tool is properly designed for
the purpose it serves. Is there a more efficient design for this tool that can meet all requirements?" — 23 November
2026 (conversation). "Decision: D" — 23 November 2026 (a comment on his page, on option D).

### Subject: How a dropped tranche is carried out

**The rule as it now stands.** A dropped tranche is carried out as the tranche's merge into main run the other way.
ARCH runs `p4 drop --tranche <name>`, which puts back on the tranche branch main's version of every module code and test
file the tranche changed, and nothing else: requirements files, the module list, the process's named files, the decision
records and the lanes' folders stay. The required run passes that pull request at once, running none of the tests, only
when every file it changes is main's own; otherwise it runs as any other branch. ARCH merges it, closes the tranche's open
jobs unmerged, clears the round and waiting-work records, and writes "not yet met" on each requirement whose met mark came
from the dropped tranche. No notice is sent (design part 3, section 5; build text 1 section 5, step 2a; build text 1b,
command 26; ARCH's starting text).

It corrected a measured fault that stopped work: the owner dropped civicsmith's tranche t1 on 24 Nov ("Decision: drop
tranche t1. The refactor starts from main's code as it is; keep the requirements, the module list, the decision records
and the lanes' design work.", typed in civicsmith's coordinator session), and the design named dropping but gave no way to
carry it out: a restoring pull request ran every module t1 touched whole, plane among them, past the 45-minute limit, with
main's own code failing `check` in several modules (civicsmith ARCH #11, passed on by coordinator #4). It removes a test run
with no reason behind it (design part 2, section 6); it adds no test, gate, review or stop. Option C of three (A no change,
each module's next job restores its own files; B the owner merges a restoring pull request past the required run; C a drop
is the tranche's merge run the other way). Researched in `process/research/dropped-tranche-24nov.md`.

**The owner's words.** "Decision: C, as recommended" — 24 November 2026 (a comment on his standing page, on option C).

### Subject: Tests once in the job, notices that reach running jobs, merging after the modules a job uses, and slots

**The rule as it now stands.**

1. **A job's tests run once, in the job.** The job runs `p4 test` in its own session, as one background command of up to
   two hours, and waits for it within its turn. The tool decides the scope as before (the whole module for an ordinary
   job; the related test files for a told job; nothing where no module file changed), runs `check` and then the tests in
   scope, and writes one test record on the pull request: the commit, the notice count, the scope, the files, the counts,
   pass or fail, and the fails across every run. `ready` runs nothing: it marks a pull request ready only where a pass is
   recorded for its head after every notice, or where nothing needs testing. GitHub's required check `module-tests` keeps
   its name and only reads the record, in seconds; it runs no product code. The failed-run count that brings a fresh
   session (third) and a block (fifth) is read from the record. ARCH's session tests a pull request that is not a job's and
   changes module code or tests the same way, each touched module whole. A test file the module list gives to another
   module, unchanged, is not run for the move. A module whose tests take more than two hours is ARCH's to split. Removed:
   the run on GitHub's machines in two parts, its 45-minute limit, the second run of a job's tests, and the rule that
   product code under test holds no access token.
2. **A notice reaches a running job at once.** Where a told user's job is open, the notice is added to that job's block
   (its work and uses; the block's notice count rises), and ARCH messages the job. A pass recorded before the notice no
   longer counts. The job deals with the notice, runs `p4 test` again, and is ready again. A user with no open job gets a
   told job, as before.
3. **A ready job merges once no job is open among the modules it uses.** Those are the earlier modules its files import,
   followed file to file as the notice reads them, and the modules it declares, directly or through others. `merge` says
   which job it waits for and merges nothing; ARCH merges once that job has merged. A blocked job holds no one. `merge`
   also refuses a job whose tests ran before its latest notice.
4. **Slots.** New jobs start, earliest in the order first, only while slots in use are below the slot number. After a
   provider's interface change, a module with a notice waiting and no open job, earlier in the order than the latest
   running job's module, starts at once above the slot number; a later one waits its turn.
5. **The check mended.** It also reads `require` and imports by the product's own name, as the notice does; a declared use
   with no import it can see is "cannot tell", no longer refused.

Folded in, each recommended on his page before: a "not followed fully" reason keeps its first six places and a count, so a
notice is never lost for its size; a class member's own written bound is in its listing, so a changed bound tells its
users; refusal (b) counts only the comment on the side that receives a value.

Why. His requirements of 23 Nov, in his words: "running a test only as much as is minimally necessary to confirm that the
test passes"; "a test should not be running multiple times"; "a job marks itself ready once it's already passed its
tests"; "There's no reason for a job not to get the [notice] immediately"; and that the round wait for the earliest
running job a job depends on. Measured: on civicsmith the required run's 45-minute limit cancelled plane's 44 minutes of
tests after they passed, and a run that saw a pull request as a draft passed it once ready with no tests run. It removes
test runs, a time limit and a second run; the merge's wait is added on his explicit word, which rule 2 of PROCESS's
starting text needs, and was named to him before he decided. The tests a job runs, and what they prove, are unchanged.
Not part of it: bringing declared uses in line with real uses (the later step he named), and ARCH holding requirements out
of a tranche (still on his page). Unproven: all of it, until the trial on the trial product. Researched in
`process/research/update-plan-24nov.md` and `update-build-spec-24nov.md`, with the files they name.

**The owner's words.** "Decision: the update plan as laid out" — 24 November 2026 (in PROCESS #10's session, on the plan
`process/research/update-plan-24nov.md` with its item 6 moved to a later step: "Agreed, move change 6 to the later step.
With that, please lay out the process4 change plan for one final read through before approving it."). On the second line
of item 1: "Tests are code. They don't even reference the environment's secret values. So your concerns about that are a
non-issue." — 24 November 2026 (conversation).

### Subject: The order of a move whose new version changes the required-run workflow

**The rule as it now stands.** A product moves to a new Process4 version by one pull request setting its process config.
Where the new version's required-run workflow (`shims/module-tests.yml`) differs from the product's copy, ARCH replaces the
copy by a second pull request, merged after the first. The required run judges each pull request with the tool at the
version its base names, so the new workflow cannot pass on the pull request that moves the version (design part 6, section
7; ARCH's starting text, rule 6; build text 1b, command 25).

It corrected a measured fault: civicsmith's move to the update of 24 Nov, made as one pull request carrying both, failed
its required run (the new workflow ran the old tool, which has no `run verdict`), and passed as two pull requests in order
(civicsmith ARCH #12, passed on by coordinator #4). Text only; no tool change; it adds no test, gate, review or stop.
Products receive it with their next move. Option B of two (A no change; B write the order down). Researched in
`process/research/move-with-new-workflow-24nov.md`.

**The owner's words.** "Decision: B, as recommended" — 24 November 2026 (a comment on his standing page, on option B).

### Subject: A tranche's scope, recorded by ARCH

**The rule as it now stands.** Where a tranche holds less than all the work, ARCH writes its scope in the round record: the
tranche, and the requirements (`<module> R<n>`) or whole modules it holds. While it stands, a requirement not yet met is work
only where the scope names it; every other requirement waits until the tranche ends. Notices, walk flaws and flaws a job
reports are always work, since they come from the tranche's own changes. ARCH rewrites the scope as it adds work, and in the
same act as a split moves requirement lines. With no scope, every requirement is work, as before. `next-job`, `open`,
`finished` and `round-done` all honour it; a job's block names only in-scope requirements and lists the module's others
under `not_this_tranche`, which the job leaves alone. The scope ends with the tranche (design part 3, section 1; build text
5, section 2; build text 1b, commands 3 and 9; ARCH's rule 6; the job's rule 1).

It corrected a measured fault: the design gave ARCH a tranche's scope but the tool counted every requirement not yet met as
work, so ARCH could not hold any out (civicsmith ARCH #8, 23 Nov; again, sharper, civicsmith ARCH #13, 24 Nov: 78
requirements in 29 modules would start with the owner's refactoring-only tranche). civicsmith ARCH #13 checked the option
against the refactoring's eight steps before the owner decided, at his word. Not given by it: confirming stability before
other work starts is the owner's halt, kept on after the refactoring tranche merges. It changes the tool (`workOf`,
`scopeOf` and `finished` in `tool/lib/round.mjs`; `open` in `commands.mjs`; with tests); it adds no test, gate, review or
stop. Option D of four (A no change; B a held mark; C a held list; D a scope list). Researched in
`process/research/held-requirements-23nov.md`.

**The owner's words.** "Decision: D, as recommended" — 24 November 2026 (in PROCESS #11's session).

### Subject: Merging goes on while a notice is worked out

**The rule as it now stands.** After a merge, ARCH refills the slot in the same turn and starts `notify` for that merge as
its own background command of up to two hours, and goes on merging other ready jobs meanwhile. When `notify` ends, a
notice reaches each told user whose job is still open then, at once, as before: it goes into the job's block, ARCH
messages the job, and a pass recorded before it no longer counts. A user that merged before the notice was worked out
has no open job then, so its notice waits in waiting work for its next job, a told job, the path the design already had
for a user with no open job (design part 2, sections 3 and 7; build text 1b, command 11; ARCH's starting text, rule 2).

It corrected a measured fault: on civicsmith, after record-grammar (third of 204 modules) merged, `notify` ran most of an
hour (38 minutes, cut by the harness's 30-minute limit on a command moved to the background, then restarted), and ARCH
held nine ready jobs whose tests had passed, because the design promised an open job its notice "at once" before it
merged, and ARCH's text ran merge and notice in one sequence in one turn (civicsmith ARCH #15, 25 Nov 2026). The owner:
"This is just wasted time. We need to figure out what the process is telling ARCH that's making it wait and fix that."
Costs: a user merged meanwhile may need a small told job afterwards; until then its merged code has not been judged
against the provider's change, as for any user whose job was not open. Text only, no tool change; it removes a wait and
adds no test, gate, review or stop. Products receive it with their next move. Option B of three (A no change; B merging
goes on; C only make `notify` faster, still being measured; B and C combine). Researched in
`process/research/merges-held-for-notify-25nov.md`.

**The owner's words.** "You say that that holding is ARCH's own choice, but process4 must have instructed it to do so.
This is just wasted time. We need to figure out what the process is telling ARCH that's making it wait and fix that." —
25 November 2026 (conversation, in PROCESS #12's session). "Decision: B, as recommended" — 25 November 2026 (in PROCESS
#12's session, right after the options for this item were put to him; PROCESS read it as this item, and asked him
whether it also answers the other item on his page, the stale-branch test, which also recommends B; he said yes, the entry
"A job's tests run on its branch brought up to the tranche").

### Subject: A job's tests run on its branch brought up to the tranche

**The rule as it now stands.** Before it runs a pull request's tests, `p4 test` brings the branch up to its base's newest
commit: where the tranche branch holds commits the head lacks, it merges the tranche into the checkout with a plain merge
commit (never a rebase), pushes it, and runs the tests there; the test record names that new head. Where the two do not
merge cleanly, it changes nothing, runs nothing, and says to merge the tranche in first; such a branch could not merge
into the tranche either. A pull request into main, and a drop's, are left as they are (design part 2, section 3; build
text 1b, command 27; `bringBaseIn` in `tool/lib/testrun.mjs`, with a test).

It corrected a measured fault: civicsmith provenance #1's first `p4 test` (PR 1346, 25 Nov) failed only in `check`, on a
field record-grammar's job had already stated and merged into the tranche; the branch lacked that merge. The job merged
the tranche in by hand and passed (201 tests, about 30 seconds), but the false failure counted toward the failed runs that
bring a fresh session and a block. The behaviour was PROCESS #11's own choice in the update of 24 Nov (tests at the head
as pushed; before it, GitHub tested the merged result). It removes wasted and falsely counted runs; it adds no test, gate,
review or stop. Products receive it with their next move. Option B of three (A no change; B the tool brings the tranche in
first; C test a temporary merged copy). Researched in `process/research/test-on-stale-branch-25nov.md`.

**The owner's words.** "Decision: B, as recommended" — 25 November 2026 (in PROCESS #12's session). PROCESS first recorded
those words for the entry "Merging goes on while a notice is worked out" and asked whether they also answered this item;
his answer, the same day: "Yes, B covered the stale-branch item too" — 25 November 2026.

### Subject: The notice after an early provider's merge: faster, harmless changes tell no one, no notice lost

**The rule as it now stands.**

1. **Faster, same answers.** `notify` works out the kinds each file declares once for each side (before and after) and
   keeps them across its readings; it reads the later modules that can reach the change several to a reading, never the
   whole product at once; and it reads a user's code after the change only where a changed entry is new or renamed,
   operations or tables are in play, or the user's own files changed (build text 1b, command 11).
2. **A change that tells no user tells a user the tool cannot follow fully nothing either.** Such a user counts as using
   everything of the provider and is told of every change to its listing that tells any user; a confirmed accepts-more,
   or a new entry, tells it nothing (design part 2, section 7, decision 2; build text 5, section 6).
3. **No notice lost.** The reasons for told users with no open job are written once on the merged provider's pull request,
   in `<!-- process4-notice -->` comments each under 60,000 characters, as many as needed; the waiting-work entry names
   only the module, the provider and the merged pull request; `open --module` copies the reasons into the job block. A
   write GitHub refuses ends with GitHub's own words (build text 5, section 2; build text 1b, commands 3 and 11).

It corrected three measured faults on civicsmith, 25 Nov 2026: `notify` after record-grammar (third of 204 modules) took
about 43 minutes and up to 8 GB, and once took down ARCH's session machine; its waiting-work write was refused, losing
the notices of every told module with no open job (twice, after record-grammar and test-support); and an optional
parameter added to test-support told 121 modules, each a told job running its whole tests. Measured by a worker on two
made-up products shaped like civicsmith (200 modules, the provider third): 97% of the time was declaration emit redone
for every user; with the change, 1,507 s and 3.2 GB to 36.8 s and 1.5 GB (the heavier), 137 s to 14 s (the lighter);
the saved list it would have written there was 4.7 million characters. On the 150 recorded changes of the proof, all
answers are the same except 17, each a user the tool cannot follow fully no longer told of a confirmed accepts-more (5)
or a new entry (12), re-recorded in `expected.json` with the reason. The owner's uses-file idea (a file per module written
at its job) was built and tested: same answers, but an early provider's merge makes every later file stale, so it adds
little once (1) is in. It changed the tool (`listing.mjs`, `staged.mjs`, `notice.mjs`, `notify.mjs`, `commands.mjs`,
`state.mjs`, `util.mjs`, `github.mjs`, new `noticecomments.mjs`; tests), design part 2 section 7, build texts 1b and 5.
It removes notices for nothing and lost notices and makes no answer of the notice's rules worse; it adds no test, gate,
review or stop. Not known: civicsmith's own time (estimated one to one and a half minutes; its code is heavier). A
known limit: a job block that gathers several large notices could still pass a comment's size. Option B of three (A no
change; B the three fixes; C fixes 1 and 3 only). Researched in `process/research/notify-slow-early-provider-25nov.md`,
`waiting-work-too-large-25nov.md` and `not-followed-told-everything-25nov.md`.

**The owner's words.** "Before we bring civicsmith over to the latest version, there seems to be a question about the
amount of time it takes for the tool that notifies users that a provider has changed. This tool seems to take a VERY long
time - unreasonably long. Research this to understand what we can do to make the tool go as fast as it can while doing
the task correctly." — 25 November 2026 (conversation). "We know it's slow. We also know from looking at the code why it's
slow. What we need to figure out is how to meet the tool's requirements much faster than how it does it now." — 25
November 2026 (conversation). "Decision: B, as recommended" — 25 November 2026 (in PROCESS #12's session, on the options
for this item).
