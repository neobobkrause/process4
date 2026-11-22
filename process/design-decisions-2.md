# The record of the owner's decisions about the Process4 design, second file

PROCESS is the only writer of this record (design part 5, section 5). It continues
`design-decisions.md`, which says how the record works; both files are read. This file holds the
later subjects and takes each new one. It was split off on 22 November 2026, when the record reached
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
`job/<module>/<n>`), so each open job is still told apart by its module (design part 2, section
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
