# The record of the owner's decisions about the Process4 design

PROCESS is the only writer of this record (design part 5, section 5). It is kept
in the process's repository and kept up to date with the design document in the
same step as each decision is recorded (design part 5, section 4).

## Where the record is kept

The record is kept in two files, this one and `design-decisions-2.md`, each under the single-text maximum (design part 5,
section 2). `decisions-index.md` names each subject and the file that holds it; PROCESS reads the index in full and opens
an entry when a question touches it (design part 5, section 3). On 25 November 2026, on the owner's decision to clean up
Process4 (the subject "Cleaning up Process4 before further improvements"), the record's 66 entries were regrouped into one
entry per subject; no rule was changed, and every one of his dated words was kept. What each old entry became is in
`process/research/cleanup-audit-25nov/done-record.md`.

## How this record works

- It is **ordered by subject**, one entry for each subject. Each entry states the rule as it now stands, then the owner's
  words.
- A decision on an **existing subject rewrites that subject's entry in place**, in the file that holds it: the rule is
  restated as it now stands, and his new words are added beneath the earlier ones, oldest first. It is not a running log;
  no second entry is written on a subject that has one.
- A decision on a **new subject** adds an entry at the end of the last file, and a line to the index.
- A **further file** is started only when a file nears 60,000 bytes (the single-text maximum on Claude Code).
- An entry keeps the **why** in a line or two, the option put to the owner with what the options were, and the research it
  rests on in `process/research/`. The narrative of a fix (measurements, pull requests, incidents) stays in the research.
- No decision here adds a test, gate, review or stop unless its entry says so, and then only on his explicit word (design
  part 6, section 7). A change to the tool or to a starting text reaches a product when the product moves to a version that
  holds it (the subject "Moving a product to a Process4 version").
- The owner's **exact dated words are kept and never edited**, with the date he typed them and where he gave them. Where
  several of his decisions fall under one subject, each quotation is kept, oldest first, with what it decided.
- A rewritten entry is **shown to the owner once, for transparency**, so he can catch a misrecording; it is not an approval
  gate (design part 5, section 5; the subject "How the owner's marked words reach the record").
- Only the owner's words count as his decision. A message of his is a decision or
  an instruction only when it begins "Decision:" or "Instruction:". Everything
  else is conversation (design part 1, section 4). PROCESS writes no summary of
  his words as his.
- This record holds his decisions about the **design**. His decisions about a
  **product** are kept by that product's coordinator, in the product's own
  repository (design part 5, section 5).

## Entries

### Subject: How the owner's marked words reach the record

**The rule as it now stands.**

1. **A marked decision given to ARCH or a lane.** One he gives to ARCH is followed, and ARCH passes it to the coordinator
   exactly as typed for the record. One he gives to a lane on its design pages is followed, and the lane passes it to ARCH,
   which relays it to the coordinator exactly as typed. A lane reaches the coordinator only through ARCH; there is no direct
   lane-to-coordinator channel (design part 1, section 4; part 4, section 3; the lane's rule 4 and ARCH's rule 7). A relayed
   decision for the record is not refused by the permission checker.
2. **An instruction the coordinator writes as a standing note** — a held merge, a module put first, a new slot number, a
   stop, or a request for a full external walk — the owner types in the coordinator's own session. The permission checker
   refuses the standing-note write for an instruction relayed through another session, as it refuses a relayed consent
   (design part 1, section 4; part 3, section 6).
3. **From a file.** The coordinator carries his marked words into the tool from a file, never typed on a command line
   (coordinator's starting text, rule 1), so that a forbidden `gh` command, the session's or one in his quoted words, cannot
   get the whole recording command refused. PROCESS and ARCH already record from files.
4. **Shown for transparency, not as a gate.** When PROCESS or the coordinator records a decision and shows him the rewritten
   entry, the showing is so he can catch a misrecording. The change merges on his marked decision once the required check
   passes, without a further approval; if he later objects, the entry is rewritten in place, his words unedited (design
   part 5, section 5; PROCESS's starting text, rule 4).

Why: the trial of 19 November 2026 found an instruction relayed to the coordinator refused (fault 7) and the coordinator's
recording command refused for a `gh` command in it, so his words went unrecorded; the verification sweep found the lane's
text sending his words to a coordinator it cannot reach; and "shown to the owner once before it stands" had been read as an
approval gate nothing called for. The lane route was option A of two (A via ARCH; B a direct lane channel); recording from
a file was option C, researched in `process/research/coordinator-gh-in-tool-command-19nov.md`.

**The owner's words.** On faults 7 and 8: "Decision: adopt the fixes for faults 7 and 8 in PR #13" — 19 November 2026.
On recording from a file: "Instruction: add the prevition piece of the coordinator recording-path problem fix as you've described." — 19 November 2026.
On showing an entry: "Decision: fix it" — 20 November 2026 (approving the clarification PROCESS described, after "We need to fix that. You have the charter to do so.").
On a lane's marked words (option A): "open item 13: decided - A" — 20 November 2026.

### Subject: The owner never edits a file or types a command

**The rule as it now stands.** Every act of the owner's is clicks on pages named by their full address, or words he types
into a session or into a field of a form. No act asks him to edit a file or type a command, and his standing page gives
each act's steps that way (design part 1, section 3). In particular:

1. **His approvals.** On his request PROCESS (for the process's repository) or the coordinator (for a product; before a
   product has one, the session that sets it up) drafts the whole text and shows it to him in plain words, or he types it
   himself. The session places the text he approved, unchanged, in a pull request that changes only that file, and never
   merges it; he reads the changed file on the pull request's page and lands it by clicking Merge. A draft has no effect
   until he lands it. No session changes his approvals on its own, and no session merges a change to them. Where one of
   his two files differs between two branches, he chooses which of his own committed versions stands, and GitHub's own
   buttons carry it out (part 6, section 2).
2. **The forbidden commands** are a technical list, the same for every repository. PROCESS keeps it as
   `shims/claude-settings.json` in the process's repository, first made as a byte-for-byte copy of the process
   repository's own `.claude/settings.json` as the owner committed it, and changes it only as a process change on his
   marked decision. A session copies it, unchanged, into a repository by a pull request he lands with a click (part 6,
   section 2).
3. **The environment's permissions-management settings.** A session reads the environment and tells him whether it carries
   them; where they are missing, it proposes the change through the harness's approval prompt, and he approves it with a
   click. He never pastes a script (part 7, sections 4 and 5; build text 6, section 3).
4. **The tool** is built, only PROCESS changes it, and the owner merges none of its pull requests (part 4, section 11; build
   texts 1 and 4).
5. **The support procedures** for promoting a release, rolling one back, and handling a reported problem are each written
   for him as clicks (part 3, section 8).

Kept as they stand: a held merge, made only when he asks for one; and his choice for a tranche that does not come clean,
between merging it into main with its flaws named and dropping it (part 3, section 5). His click on Merge for a change to
his own approvals is the one guard that keeps a session from changing them; that click lands on the tranche branch, not
main. Unproven: that the permission checker lets a session place his typed words in his approvals file; and, in a
repository whose approvals forbid a session to change that file (the process's repository among them), the route works
only once his approvals allow it.

Why: the trial's tranche could not merge into main because its approvals file differed between the two branches, and the
only route to settle that was the owner editing a file. Option B, with sub-choice (ii) for the forbidden commands, of three
(A no change; B choose, don't type; C sessions resolve, write and merge); on who drafts his approvals, option B of two.
Researched in `process/research/owner-acts-without-files-20nov.md`.

**The owner's words.** "Decision: as recommended" — 20 November 2026. On who drafts the
approvals' wording (A: he writes every word; B: PROCESS or the coordinator drafts, he decides and
lands it by his click): "Decision: option B" — 20 November 2026.

### Subject: The design document carries no history

**The rule as it now stands.** The design document (the files in `design/`) states the design as it now stands and carries
no history of how it evolved, beyond naming where a figure or a quotation comes from (design part 0, section 1; part 5,
section 4). The owner's dated decisions are in this record; the reasons and evidence in the background document and the
research. So the design carries no draft or version lineage, no dated decision provenance or labels such as "decision C"
and "fault D", no references to the predecessor process, no working-file or evidence paths, no change narratives, and no
authorship marks ("Claude decided", "Reading", "Settled"); a rule a mark introduced stands plainly. The marks legend (part 0,
section 3) keeps only "Open" and "Unproven", which flag the design's present status; what is unproven, what is still open,
and the trial stay, without dated history. Part 10, section 1 keeps only what is genuinely open.

Why: history had accumulated in the design. No rule changed. Researched in
`process/research/design-history-separation-20nov.md`.

**The owner's words.** "Decision: I agree with your recommendations in the Judgement calls for the owner section. Do it." — 20 November 2026 (on PROCESS's research note `process/research/design-history-separation-20nov.md`; his recommendations there: keep the cleaned present-status and collapse part 10 section 1 (option 1), strip the "Claude decided" mark, and produce one combined downloadable copy).

### Subject: The terms "provider" and "user"

**The rule as it now stands.** The design document refers to a module that provides a service to other modules through an
interface as a **provider**, and a module that uses the service of another module through the provider's interface as a
**user** (design part 0, section 6, worded to his phrasing; part 2).

**The owner's words.** "Instruction: The design document should refer to a module that provides a service to other modules through an interface as a \"provider\". A module that uses the service of another module through the provider's interface is referred to as a \"user.\"" — 20 November 2026.

### Subject: Session names

**The rule as it now stands.** Every Process4 session carries a standard name, so the owner can see each one and its
lineage. PROCESS is named `PROCESS #<generation>`; a session that holds a role, `<product> <role> #<generation>` (e.g.
`civicsmith ARCH #3`, `civicsmith ux lane #2`). The generation counts that role's sessions on that product — one for the
first, one more at each refresh, replacement or takeover — and for a long-lived role it is kept in that role's handover
record (its `generation` field, build text 5, sections 2 and 4), so it continues across a full stop and never resets. A
job, which holds no role, is named `<product> <module> #<n>`, `<n>` its job number (the `n` of its branch
`job/<module>.<n>`), so each open job is told apart by its module; the number stays the same when a filled or dead job's
session is replaced from the same branch, and rises only when a fresh job opens for the module. A walking session is
`<product> walk #<number>`, its walking-session number. A session that keeps a handover record names itself on start from
the generation there; ARCH names a job and a walking session when it starts them; the owner-started ROOT and PROCESS name
themselves (design part 4, section 11; part 7, section 1; the starting texts). The name is set with the harness's
set-session-title, seen to work in Auto mode: PROCESS #1, #4 and #5 named themselves, and the trial's ROOT, watcher, ARCH
and coordinator sessions carry their standard names. On Codex it is not known (part 8, section 1).

Why: a naming requirement the owner added. Option B for the convention, option (a) for the job's name; recording that a
session names itself was option A of two (A record it; B no change). Researched in
`process/research/session-naming-standardization-20nov.md`.

**The owner's words.** "how a job is named decision: as recommended" — 20 November 2026 (the job
name is `<product> <module> #N`, option (a)). "Options for the whole change:decision: s
recommended" — 20 November 2026 (adopt the convention, option B).
On recording that a session can name itself: "Decision: as recommended" — 20 November 2026 (a comment on his standing
page, on the item "Record that a role session can name itself").

### Subject: PROCESS: who starts it and how others find it

**The rule as it now stands.** PROCESS is started and refreshed by **the owner, not by ROOT**: it is the one owner-facing
role, and every refresh happens with him present. At its refresh point PROCESS rewrites its handover record and asks the
coordinator; the coordinator puts the start prompt on the owner's standing page and notifies him; the owner starts the
successor, which starts only from the shared state and the repository, records its liveness and generation in its
`handover-process` record, and announces itself by message to each product's ROOT (design part 4, section 5; part 6,
sections 6–7; part 1, section 3).

The coordinator finds the live PROCESS from its **own product's `roles` record** (`process` field), a local read; it never
reads the process's repository, since a cross-repository read is refused (part 7, section 3). ROOT writes that field from
the message PROCESS sends it on start. PROCESS knows which ROOTs to message from a `products` registry in its
`handover-process` record (each product it serves and that product's ROOT session), seeded by the owner once per product
and kept current because ROOT, on its own start, messages the PROCESS named in `roles.process` its new address. When that
field names a running PROCESS, the coordinator messages it; when it is none, or names a session that no longer answers, the
coordinator surfaces starting PROCESS on the owner's standing page (part 6, sections 6–7; build text 5, sections 2 and 4).
No session writes or reads another repository's state; only cross-repository messages pass.

Why: ROOT's cross-repository session create to start PROCESS was never measured, and the one cross-repository lifecycle act
tried (ROOT archiving PROCESS) was refused twice, while messaging worked; the coordinator's first route, a cross-repository
read of `handover-process`, is refused (HTTP 403). Owner-start was option C of three (A no change; B make the autonomous
path run and measure it once; C owner-start by design). The coordinator's route was option C of five (A no change; B
add_repo push, an over-grant; C messaging registration; D persist the owner's answer; E find PROCESS by its session name).
Researched in `process/research/root-refresh-of-process-failed-again-19nov.md`,
`process/research/process-refresh-cross-repo-19nov.md` and
`process/research/coordinator-cannot-read-process-liveness-20nov.md`.

**The owner's words.** On owner-start: "Decision: option C (for now)" — 19 November 2026 (makes
owner-start the designed path for the PROCESS refresh, superseding decision B's
ROOT-starts-PROCESS mechanism for that one act; "for now" keeps the autonomous path open to
revisit).
On how the coordinator finds PROCESS: "Decision: option C" — 20 November 2026.

### Subject: A refused act, an act that cannot be done, and naming a role to message it

**The rule as it now stands.**

1. **Before reporting that an act cannot be done.** The tool reaches GitHub through `node`; a refused direct `gh` or git
   command is expected (the forbidden commands force GitHub through the tool) and is not the tool being blocked. A session
   verifies an act with the tool before telling the owner it cannot be done (PROCESS's starting text, rule 8).
2. **A non-substantive refusal may be re-attempted.** Where the permission checker refuses an act the owner's approvals and
   the permissions-management settings sanction, and the refusal is non-substantive — the checker allowed an identical act
   before or invites another attempt, or the refusal fell on a command the session malformed — the session makes the
   sanctioned act again, cleanly and bounded: it keeps its prior state, retries at its next wake or after a short wait, and
   brings it to the owner if it persists. A genuinely unsanctioned act is still never reworded or handed on, a relayed
   consent is still not retried, and three refusals in a row still stop the session (design part 1, sections 6–7; part 6,
   section 4).
3. **Naming a role to message it.** A session resolves a role to its current session address from the roles record (a lane
   from the lanes record) before messaging it, never from a remembered address; a record in another repository is not read: the live
   PROCESS is found in the product's own roles record (design part 4, sections 4, 5 and 11).
4. **Successor registration.** ROOT records in the roles record the address of each standing session it starts or
   refreshes (design part 4, section 5).

Points 2 to 4 hold for every cross-repository act, messaging among the roles chief among them.

Why: the first PROCESS session wrongly reported it could not merge (fix B of round 4); decision B set the three
clarifications, and its mechanism for starting PROCESS was later replaced (the subject "PROCESS: who starts it and how others
find it"). Researched in `process/research/process-refresh-cross-repo-19nov.md`.

**The owner's words.** On fix B: "Decision: adopt the round-4 fixes B, A and C in PR #14" — 19 November 2026.
On decision B: "Decision:option B" — 19 November 2026 (decision B; its re-attempt,
role-to-address resolution and successor registration remain in force for all
cross-repository acts).

### Subject: When a role is refreshed, and its wake

**The rule as it now stands.** A long-lived role is refreshed at the first natural pause in its work after its fill reaches
the stated fill level, 50 percent (the subject "The reading values and how they are measured"). Where it cannot read its
fill, it is refreshed at a natural pause. A pause alone does not call for a refresh. Before it asks its parent, it rewrites
its handover record (design part 4, section 5; part 1, section 7; the refresh rule of the ROOT, watcher, coordinator, ARCH,
lane and PROCESS starting texts).

Whoever archives a session also removes that session's scheduled wake, if it has one, so no wake fires into an archived
session. At a takeover the watcher makes its own ROOT wake and removes the old ROOT's wake and its own watcher wake (design
part 4, sections 5 and 6; ROOT's and the watcher's starting texts).

Why: "at a natural pause or at the fill level, whichever comes first" made every pause a refresh (civicsmith's ARCH was
replaced four times in under an hour), against the owner's words that refreshes "are expensive and slow, and thus should be
minimized"; and a watcher's hourly wake stayed enabled after its session was archived, as no text named removing it. The
refresh was option B of three (A no change; B the fill level decides, the pause times it; C ROOT may refuse an early
refresh); the wake, option B of three (A no change; B the archiver removes the wake; C each session removes its own before
asking to be replaced). Researched in `process/research/refresh-at-every-pause-22nov.md` and
`process/research/wake-left-after-archive-22nov.md`.

**The owner's words.** On the refresh and the wake, each option B: "decision:B" — 22 November 2026. "Decision: all as you've recommended" — 22 November 2026 (in
PROCESS #8's session, after PROCESS asked which of the three open choices "decision:B" answered).

### Subject: Writing a lane's entry before the lane starts

**The rule as it now stands.** A lane's entry in the lanes record is written before its session is started, as a claim that
names no session yet (`"session": null`, `"live": true`); once the start returns, the starter writes the same entry again
with the session's address. The tool accepts that one fill-in and still refuses a second live session for a lane the record
shows live (design part 4, section 3; build text 5, section 2; `laneRefusal` in `tool/lib/state.mjs`). This holds for a
product's lanes (ARCH) and for PROCESS's own lanes.

Why: the address exists only after the start, and the tool refused to put it in place of what was written before, so a
record named a placeholder as its live lane. Option 2B of three (2A no change; 2B claim first, address after; 2C record after
the start). Researched in `process/research/fault-lanes-record-before-start-22nov.md`.

**The owner's words.** "Decision: 2B, as recommended" — 22 November 2026 (a comment on his standing page,
on option 2B).

### Subject: Codex — Claude Code first, Codex later

**The rule as it now stands.** Process4 proceeds on Claude Code, where the design is complete, and treats the Codex side as
later work. Everything design part 8 marks not known — how Codex carries the approvals, the forbidden commands and a
permission checker, whether messages cross separate chats, each role as its own session, grouping, archiving,
notifications and sign-in renewal — and which Codex model the process uses, are filled from the owner's OpenAI-account work
when he takes that side on; until then Codex is not supported and nothing is blocked waiting on it.

**The owner's words.** "Decision: as recommended" — 20 November 2026 (on the review
page's item-11 / Codex thread).

### Subject: The reading values and how they are measured

**The rule as it now stands.** The four reading figures (design part 5, section 2) rest on the reading-fidelity measurement
of 20 November 2026 on Claude Code (model `claude-opus-5-5`, effort `medium`, a 1,000,000-token window;
`measurement/results/report.md` and `role-text-upward.md`). A Codex re-measurement is owed before they govern there (part 8).

- **The largest single text read in full: 60,000 bytes on Claude Code,** and 24,000 bytes on Codex until Codex is measured;
  20 percent below the largest clean read. It is set per harness, the one exception to the maximums applying on both
  harnesses (part 5, section 1; part 7, section 2).
  Design part 2 is over the Codex figure; it stays whole while no product runs on Codex, and before one does, the Codex
  figure is measured or part 2 is split.
- **The largest set of texts read together: 175,000 bytes,** measured: read whole at every size up to 220,000 bytes, with a
  25 percent margin kept.
- **A role's starting text: 8,192 bytes, and at most ten rules.** The limit is measured against the role's instructions
  proper, leaving out of the count the one mechanical fetch line (the clone command a session runs once at start and never
  rereads), which carries names and addresses, not rules (part 4, section 11; part 5, section 2). The conciseness rule keeps
  the texts short (part 5, section 3).
- **The fill level for a refresh: 50 percent,** above the measurement's 40, so that refreshes, which are expensive and slow,
  are minimised while leaving room to work on. Where no fill level can be read, as on Codex, the refresh comes only at a
  natural pause (part 8).

Two findings of the measurement, each settled as recommended (option (a)):

- **A cut read is silent.** A text past the harness's read-cut (about 25,000 tokens) comes back partial with no notice (part
  7, section 2). The guard is the single-text maximum below the cut, and each governing text stating its line count and last
  section at its top (part 5, section 1). No reading check, gate or stop is added.
- **Reading one's own fill.** A session reads its fill from the harness's own usage data (`get_session`, field
  `context_usage`); a bare headless `claude -p` reader cannot see it and guesses. Where a session cannot read its fill, it
  refreshes only at a natural pause (part 7, section 1; part 5, section 2).

The tool refuses nothing for size (part 6, section 5).

Why: the figures were provisional until measured, and the fetch line was counted against a budget meant for rules (the
size-headroom finding of `process/research/verification-sweep-19nov.md`). "As recommended" was PROCESS's proposal on his
standing page ("Process4 Waiting for Bob", thread 70f2987e), drawn from `measurement/results/report.md`, which kept the fill
level at 40; his exception set it at 50.

**The owner's words.** On how the starting-text limit is measured: "Decision: change the way the limit is measured as you've recommended." — 20 November 2026.
On the four values: "decision: as recommended, except that session refreshes a expensive
and slow, and thus should be minimized. So the fill level should be set to 50% - which still
leaves a lot of room to continue work up to the 74% when compaction can occur." — 20 November
2026.
On the two findings: "Decision: as recommended" — 20 November 2026 (on the standing page,
the two-findings item; option (a) for each finding).
On design part 2 over the Codex figure: "Decision: 0" — 26 November 2026, about 00:00 UTC (in PROCESS #17's session; options:
0 leave it whole while no product runs on Codex, recommended; A split it now and trim elsewhere to keep a job's reading set
under 175,000).

### Subject: What a role reads

**The rule as it now stands.**

- **A job** reads, among its required reading, the record of ARCH's design decisions, so it builds to the interface ARCH
  decided (`starting_texts/job.md`; design part 2, section 8; part 5, sections 5 and 6).
- **A role's research** is background, not governing text. A lane, and PROCESS, reads in full an index of its research, one
  line for each file saying what it holds, and reads a research file, or gives it to a worker, when a question needs it; it
  keeps the index current. So research can grow without the role's reading set passing the maximum (design part 4, section
  3; part 5, section 3; part 6, section 7; the lane's and PROCESS's starting texts; the starting-texts index). This replaced
  "every later session of the lane reads it first".
- What PROCESS reads in full is the subject "What PROCESS reads in full".

Why: the trial's fault 8 (19 November 2026) corrected the job's starting text. Research read in full had put a lane's reading
set (civicsmith's UX lane, about 300,000 bytes) and PROCESS's past the 175,000-byte set maximum. The index was option B of
four (A no change; B research through an index; C condense research; D measure larger sets). Researched in
`process/research/lane-reading-set-over-maximum-22nov.md`.

**The owner's words.** On fault 8: "Decision: adopt the fixes for faults 7 and 8 in PR #13" — 19 November 2026.
On research through an index (option B): "decision:B" — 22 November 2026. "Decision: all as you've recommended" — 22 November 2026.

### Subject: The smaller readings (part 10, section 1, item 7)

**The rule as it now stands.** The smaller interpretive readings the design had not had the owner confirm one by one stand
as recommended, each settled in its home section: a role's starting text and its starting instructions are one thing, and
the definitions of an architecture bug and an implementation error (part 0, section 6); how an architecture bug is
corrected (part 1, section 6); a lane's folder needs no module tests (part 2, section 9); exercising a doubtful workflow in
a walk adds no test (part 3, section 3); the lane rules stand as written, except that a lane reads its research through an
index (the subject "What a role reads"), and questions to a lane and its answers are not kept as a running record (part 4,
section 3); a role lasts while its sessions are refreshed often (part 4, section 5); every stop nothing called for is
reported to PROCESS during the trial (part 4, section 10); PROCESS brings the owner a role's principles that cannot be kept
short (part 5, section 3); the ranking page runs from mission highest to design decisions lowest (part 5, section 6); and
PROCESS starts its own lanes (part 6, section 8).

**The owner's words.** "Decision: as recommended" — 20 November 2026.

### Subject: Onboarding and setting up a product

**The rule as it now stands.**

1. **The onboarding lane.** For each product that joins Process4, PROCESS starts one onboarding lane in the process's
   repository. The lane talks directly to PROCESS. It plans the product's move and writes the product's conversion plan. It
   keeps the product's own "waiting for Bob" page, updated with where the onboarding stands and with each act it needs from
   the owner, each fully detailed as steps (each page by its full address, each button by its exact label, what he should
   see after each click, and the whole list of permissions for each token he makes). It writes the brief for the session
   that sets the product up. It starts with GitHub: the steps he needs to make the GitHub token, and to set up the
   product's repository. The lane ends when the product's ROOT has started; its folder and research stay (design part 6,
   section 8; part 1, sections 3 and 5).
2. **How the product is read, and who changes settings.** The lane does not read or act on the product's repository,
   accounts or services itself: the owner starts a read-only session on the product's repository with the lane's brief, and
   its report reaches the lane, by message where that repository's approvals allow it and through the owner otherwise.
   Every change that onboarding needs to a setting of GitHub or of the hosting account is the owner's own click, from the
   lane's page; no session is given the means to change those settings.
3. **Tokens, made once.** A token the owner makes for a product is made once, when the product joins Process4, with every
   permission that will be needed across all stages of that product's development under Process4, for its whole life. The
   onboarding lane works out the whole list first and gives it on his page, so that no later stage asks him to make another
   token. Where the product's development uses more than one service, there is one such token for each. No GitHub token is
   made where sessions act through the harness's own connection to GitHub; on Claude Code they do, through Claude's GitHub
   connection as the sessions' second account. A token renewed before it expires carries the same permissions (part 1,
   section 3; part 7, section 4, acts 5 and 6; part 9, section 1).
4. **Setting the product up.** At the owner's act 8 (design part 7, section 4), the plain session he starts on the
   product's repository drafts the product's approvals before the product has a coordinator (part 6, section 2), writes the
   product's first Process4 files — `process.json`, the module list, the required-run workflow and the copy of the
   forbidden commands — by pull request into main, and then makes the tranche branch from main's newest commit, also where
   main already holds an earlier history. At act 10 the branch rule's required check `module-tests` replaces any check an
   earlier process required. The owner seeds a product's ROOT in PROCESS's registry once (build text 5, section 4). Build
   text 2's requirements-file size follows the design's single-text maximum.

Unproven: an onboarding lane carried through to a product's ROOT starting; publishing a release through the connection;
acts 1 to 10 for a real product (the trial carried them out, act 10 before act 9).

Why: setup steps the civicsmith lane found wrong or missing (its points 1, 2, 3, 5, 6 and 9 of nine); a lane per product
to plan the move. The three onboarding questions: (1) an onboarding lane, recommended yes; (2) how it reads the product, (a)
a read-only session he starts or (b) read-only tokens for the lane; (3) who changes settings, (a) he does by clicks or (b) a
session holding an admin token; on the GitHub token, three options (A no token, keep the connection; B a fine-grained token
he makes; C a classic token made as the sessions' account). The token rule answered question 4 on his page, which asked
about two seed values; what became of those is under "Publishing a release, and where secret values are kept". Researched in
`process/research/civicsmith-lane-points-20nov.md`, `process/research/product-onboarding-22nov.md` and
`process/lanes/civicsmith/research/github-token-permissions.md`.

**The owner's words.** On the setup fixes: "Decision: B" — 20 November 2026 (a comment on his standing page, on the
item "Waiting for you: fixes the civicsmith lane found in the setup steps").
On onboarding: "1. Decision: yes" — 22 November 2026. "2. Decision: A" — 22 November 2026.
"3. Decision: A" — 22 November 2026. "Decision: The product-specific lane talks directly to PROCESS
and keeps the product's "waiting for Bob" page updated with status and fully detailed steps; and
starts with the steps I need to create GitHub token and set up the product-specific repo. But a
Github token needn't be created if sessions act through Claude's GitHub connection." — 22 November
2026.
On a product's token: "4. Decision: The token created for the product being onboarded should be the
token with all the permissions that will be needed across all stages of process4 driven development
across that product's entire lifecycle. Anything short of those privileges will require me to
unnecessarily create yet another token." — 22 November 2026.

### Subject: Claude accounts, the environment's settings, and an account switch

**The rule as it now stands.**

1. **One account.** PROCESS and the products it serves run under one Claude account. Their coordination (a coordinator
   reporting a process fault to PROCESS, PROCESS announcing itself to a product's ROOT, PROCESS messaging a coordinator) runs
   on session-to-session messaging, which the harness scopes to a single account; cross-account coordination is not built.
   An account switch (build text 6) that moves a product PROCESS serves to another Claude account moves PROCESS as well
   (design part 7, section 3; build text 6, section 1). A future cross-account channel is not forbidden; it would be a
   process change.
2. **The environment's settings, checked.** The steps for starting development under a Claude account — at a product's
   start, and whenever Process4 development or a product's development moves to another Claude account — include a check,
   before ROOT is started, that the cloud environment the sessions will run under carries the process's
   permissions-management settings (on Claude Code the `autoMode` block that steers the auto-mode checker, so sanctioned
   cross-session and cross-repository acts are not falsely refused). Where they are missing, the session proposes the
   change and the owner approves it with a click (design part 1, section 3; part 4, section 7; part 7, sections 4 and 5;
   part 10, section 2). On Codex the equivalent is not yet known (part 8, section 2).
3. **Idle compaction off.** The same setup script that writes the `autoMode` block also writes `"idleCompaction": false`
   into `~/.claude/settings.json`, so a session left idle for about an hour is not compacted and does not lose what it read
   (design part 7, sections 1 and 5). It takes effect for sessions started fresh. Unproven: that the harness honours it.

Why: the check was added on the owner's explicit instruction, as a setup prerequisite. Moving PROCESS with the trial was
option B of three (A the trial moves alone, the owner relays across the account line; B move PROCESS too, one account; C
build cross-account coordination first).
Idle compaction: civicsmith ARCH #26 was compacted after 76 idle minutes at 43 percent fill; option A of four (0 no change;
A turn it off in the environment; B correct the claim that the fill cannot be read; C both), research
`arch-compacted-fill-unread-25nov.md`. B was not chosen and stays open with him.

**The owner's words.** "Instruction: When process4 development (and product development using process4) moves to another Claude account, the steps involved in starting development under the different account should include a check to make sure that the environment the sessions will be running under includes the proper settings for process4's permissions management strategy." — 19 November 2026.
On the first account switch: "Decision: B — Move PROCESS to the new account too (to simplify this first account switch)" — 20 November 2026.
On idle compaction, typed in PROCESS #18's session: "Instruction: Turn idle compaction off" — 26 November 2026.

### Subject: Publishing a release, and where secret values are kept

**The rule as it now stands.**

1. **Proving and publishing.** Process4 builds the product's installer and updater as product code (jobs, with their own
   tests) and proves them on a development account, for both a fresh install and an upgrade, before any release is offered.
   "Successful" means the installer or updater finishes without error and the site it produces starts; on a failure no
   release is offered and the fault becomes next-tranche work (part 3, section 6; part 2). On the owner's approval ARCH
   carries out the publish: the release ceremony places the new installer where the product's "check for updates" and
   outside users expect to find it, using a **release token** that grants the privileges to publish. Running an install or
   an update on a real site is always the user's or operator's act, never the developer's, never a session's.
2. **Production signing keys.** A product's production signing keys are needed to produce the installer as part of the
   release ceremony. They are kept among the secret values of the environment the product's sessions run under, and they
   stay there (part 1, section 2; part 3, section 6; part 7, section 1; part 9, section 2). A known limit, stated in part 9:
   nothing physical keeps a key's value from another session in the same environment.
3. **Secret values.** The secret values Process4 itself uses (the deploy token, a product's production signing keys, a
   release token) are kept in the sessions' cloud environment (parts 1, 3, 7 and 9). Process4 sets no rule on the secrets a
   product's repository keeps for its own workflows; that is the product's matter. The owner's act 3 (design part 7, section
   4) sets a repository's merges, branch deletion and a read-only token for GitHub's machines, and says nothing of
   repository secrets.

Why: on 22 November 2026 the owner decided the two production signing keys in the sessions' environment stay there,
replacing the first sentence of his words of 20 November ("No session directly holds a production key") and the route
through a secret-management facility that went with it. "No repository secrets" in act 3 had no reason, source or decision
behind it, and sessions kept building on it; removing it was option B of two (A no change; B remove the words), researched in
`process/research/no-repository-secrets-rule-23nov.md`.

**The owner's words.** On keys and the release token, replaced by his words of 22 November 2026 where they differ:
"Decision: No session directly holds a production key. But a product's production secret key may
be used their a secret management facility to produce the installer. Similarly, the release
process may require the use of a release token that grants it the necessary privileges in order
to publish a release." — 20 November 2026. On the install/update success definition, confirming
the reading restated to him on the review page: "Decision" — 20 November 2026.
On the production signing keys: "I have no recollection of saying that no session should hold production
keys. As the design clearly says, production keys are needed in order for an installer be created
as part of the release ceremony. Decision: BIO_RELEASE_SEED and BIO_RATIFY_SEED production signing
keys, and they stay." — 22 November 2026.
On repository secrets: "Process4 keeps getting caught up with this false rule that it holds that a product's repository
can hold no secrets. That is not the case." — 23 November 2026 (conversation). "Decision: B" — 23 November 2026 (a
comment on his page, on option B).

### Subject: Moving a product to a Process4 version

**The rule as it now stands.**

1. **The owner's one instruction.** The owner, in the coordinator's session, instructs it to move a product to the latest
   Process4 version, or to a named version; that one instruction is his prior approval, needs no commit id, and asks
   nothing further of him. The coordinator records his words and tells ARCH.
2. **ARCH's steps.** ARCH resolves the latest with the tool's `latest-version` (the newest commit of the process
   repository's main, which holds only merged, tested changes), sets the product's process config to that commit by pull
   request, and merges it. Where the new version's required-run workflow (`shims/module-tests.yml`) differs from the
   product's copy, ARCH replaces the copy by a second pull request, merged after the first: the required run judges each
   pull request with the tool at the version its base names, so the new workflow cannot pass on the pull request that
   moves the version. Then the sessions refresh onto it, losing no work (design part 6, section 7; part 3, section 1; part
   4, section 1; the coordinator's and ARCH's starting texts, ARCH's rule 6; build text 1b, command 25).
3. **Each session's copy of the process.** Each session fetches its own copy of the process at the commit the product's
   process config names, into a folder outside the product's working files, and installs the tool's one dependency there.
   No session edits its copy; that is held by text, as most rules are, since cloud sessions run with full rights and the
   fetch line removes no write permission. Nothing in the copy is ever committed (design part 6, sections 1 and 5; part 7,
   section 1; `tool/lib/config.mjs`; `starting_texts/root.md` part A).

Why: the move asked steps of the owner (option C of three: latest by default, a named version when he gives one); a move
made as one pull request carrying both the version and the new workflow failed its required run (option B of two: A no
change; B write the order down; `process/research/move-with-new-workflow-24nov.md`); and the fetch line's read-only step was
measured to stop nothing (option 1B of three: 1A no change; 1B drop the step and say what holds the rule; 1C a stronger
system lock; `process/research/fault-fetch-copy-not-read-only-22nov.md`).

**The owner's words.** On the move: "Decision: C" — 19 November 2026.
On a session's copy: "Decision: 1B, as recommended" — 22 November 2026 (a comment on his standing page,
on option 1B).
On the order of the two pull requests: "Decision: B, as recommended" — 24 November 2026 (a comment on his standing page, on option B).

### Subject: A tranche opens: from main, by ARCH, with its scope

**The rule as it now stands.**

1. **No owner approval.** A tranche opens because the product has work to do — requirements added or changed, issues
   raised by its lanes, flaws found by walks or by jobs, and notices between modules. There is no single purpose to state
   and no owner review or approval before it opens: ARCH opens the tranche and decides its scope. The owner directs the
   product continuously — through the coordinator and the lanes, and by marked instructions (put a module first, change the
   slot number, stop, move versions) — and still approves every public release (design part 1, section 3; part 3, section
   1; part 4, section 1).
2. **From main.** A product's tranche branch is made from the newest commit of its main branch, also where main already
   holds an earlier history (design part 7, section 4, act 8; part 6, section 2; build text 4, stage 1).
3. **Its scope.** Where a tranche holds less than all the work, ARCH writes its scope in the round record: the tranche, and
   the requirements (`<module> R<n>`) or whole modules it holds. While it stands, a requirement not yet met is work only where
   the scope names it; every other requirement waits until the tranche ends. Notices, walk flaws and flaws a job reports are
   always work, since they come from the tranche's own changes. ARCH rewrites the scope as it adds work, and in the same act
   as a split moves requirement lines. With no scope, every requirement is work. `next-job`, `open`, `finished` and
   `round-done` all honour it; a job's block names only in-scope requirements and lists the module's others under
   `not_this_tranche`, which the job leaves alone. The scope ends with the tranche (design part 3, section 1; build text 5,
   section 2; build text 1b, commands 3 and 9; ARCH's rule 6; the job's rule 1). Not given by it: confirming stability
   before other work starts is the owner's halt.

Why: the owner's approval of a tranche was a step nothing needed; the trial's tranche branch, made with a history of its own,
could not merge into main (the one-off repair was option C: ARCH joined the two histories by one pull request into main, and
the owner carried his approvals onto the tranche branch by clicks); and the tool counted every unmet requirement as work, so
ARCH could hold none out. The scope was option D of four (A no change; B a held mark; C a held list; D a scope list).
Researched in `process/research/tranche-unrelated-to-main-20nov.md` and `process/research/held-requirements-23nov.md`.

**The owner's words.** On the trial's tranche branch: "Decision: option C (But, god, I hope this doesn't take any more time. We've
already sent 2 hours on this silly problem.) Go!" — 20 November 2026. "Decision: fix the setup
text" — 20 November 2026.
On approval of a tranche: "Decision: Remove the owner's tranche-approval" — 20 November 2026.
On a tranche's scope: "Decision: D, as recommended" — 24 November 2026 (in PROCESS #11's session).

### Subject: A tranche ends: clean, merged with its flaws named, or dropped

**The rule as it now stands.**

1. **Clean.** A tranche ends when its rounds' partial walks, internal and external, come clean, each scoped by ARCH to the
   areas that round changed. Those walks are what shows the journeys named for the tranche complete; no end-of-tranche sweep
   is added. A full external walk is opt-in, made only on the owner's request (design part 3, sections 3 and 5).
2. **Merged with its flaws named.** A tranche that does not come clean goes on in rounds until the owner says; he then
   chooses between merging it with its flaws named, its flaws becoming work in the next tranche, and dropping it. The
   process neither forces nor forbids a release from a flaws-named tranche: whether anything is released is his judgement,
   governed by his release approval and a confirmed install and update (part 3, sections 5–6). Process4 is a
   software-development process, not the product, and leaves the balance of time, resources and quality to him.
3. **Dropped.** A dropped tranche is carried out as the tranche's merge into main run the other way. ARCH runs `p4 drop
   --tranche <name>`, which puts back on the tranche branch main's version of every module code and test file the tranche
   changed, with that module's uses file, and nothing else: requirements files, the module list, the process's named files, the decision records and the
   lanes' folders stay. That pull request runs none of the tests, as none runs on the tranche's own pull request into main,
   and only when every file it changes is main's own. ARCH merges it, closes the tranche's open jobs unmerged, clears the
   round and waiting-work records, and writes "not yet met" on each requirement whose met mark came from the dropped
   tranche. No notice is sent (design part 3, section 5; part 2, section 9; build text 1, section 5, step 4; build text 1b,
   command 26; ARCH's starting text).

Why: the walks already show the journeys complete; the earlier reading that no release could follow until a later tranche
ended clean was withdrawn; and the design named dropping but gave no way to carry it out: when the owner dropped
civicsmith's tranche t1 ("Decision: drop
tranche t1. The refactor starts from main's code as it is; keep the requirements, the module list, the decision records
and the lanes' design work.", typed in civicsmith's coordinator session, 24 Nov), a restoring pull request ran every module
it touched whole. The drop was option C of three (A no change, each module's next job restores its own files; B the owner
merges a restoring pull request past the required run; C a drop is the tranche's merge run the other way). Researched in
`process/research/dropped-tranche-24nov.md`.

**The owner's words.** On how a tranche ends: "Decision: make no changes to the testing policy we've defined and confirmed ad nausium." — 20 November 2026.
On the balance the process must leave him (conversation,
20 November 2026): "The development of large workflows like civicsmith is a process of
balancing 3 things: time, resources, and quality. ... I have no intention to ever ship a
product with known flaws. But what we've designed here isn't a product, it's a software
development process. That process, by necessity, must have the real world flexibility to
create the proper balance that the product requires." Confirming the reading restated on
the review page's item-3 thread: "Decision" — 20 November 2026.
On a dropped tranche: "Decision: C, as recommended" — 24 November 2026 (a comment on his standing page, on option C).

### Subject: An urgent fix while a tranche is open

**The rule as it now stands.** When an urgent fix is needed while a tranche is open, the open tranche is paused on the
owner's word; the fix is built as its own tranche from the main branch and merged; the paused tranche then takes the main
branch in and goes on (design part 3, section 7).

**The owner's words.** On the urgent-fix question, confirming the reading restated on the review page: "Decision" — 20 November 2026.

## Earlier decisions not yet migrated

The owner's design decisions made while Process4 was written are kept as his
typed words in the process3 repository, under `process4/owner_words/`.
Migrating those into this record — one entry per subject, in
his exact words — is done only on the owner's word, because the words quoted here
must be his exact typed words and must never be fabricated or paraphrased.
