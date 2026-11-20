# The record of the owner's decisions about the Process4 design

PROCESS is the only writer of this record (design part 5, section 5). It is kept
in the process's repository and kept up to date with the design document in the
same step as each decision is recorded (design part 5, section 4).

## How this record works

- It is **ordered by subject**. Each entry states the rule as it now stands.
- A decision that **changes an entry rewrites it in place.** There is one entry
  for each subject, not a running log.
- The owner's **exact dated words are kept and never edited.** They are quoted in
  the entry, with the date he typed them.
- A **rewritten entry is shown to the owner once before it stands.**
- Only the owner's words count as his decision. A message of his is a decision or
  an instruction only when it begins "Decision:" or "Instruction:". Everything
  else is conversation (design part 1, section 4). PROCESS writes no summary of
  his words as his.
- This record holds his decisions about the **design**. His decisions about a
  **product** are kept by that product's coordinator, in the product's own
  repository (design part 5, section 5).

## Entries

### Subject: Routing an instruction the coordinator records as a standing note

**The rule as it now stands.** An instruction the coordinator acts on and writes
as a standing note — a held merge, a module put first, a new slot number, a stop,
or a request for a full external walk — the owner types in the coordinator's own
session. The permission checker refuses the coordinator's standing-note write for
an instruction relayed through another session, as it refuses a relayed consent
(design part 1, section 4; part 3, section 6). This corrected design part 1,
section 4 (fault 7, found by the trial on 19 November 2026).

**The owner's words.** "Decision: adopt the fixes for faults 7 and 8 in PR #13" — 19 November 2026.

### Subject: What a job reads before it builds

**The rule as it now stands.** A job's required reading includes the record of
ARCH's design decisions, so the job builds to the interface ARCH decided. This
corrected the job's starting text (`starting_texts/job.md`), consistent with
design part 2, section 8 and part 5, sections 5 and 6 (fault 8, found by the
trial on 19 November 2026).

**The owner's words.** "Decision: adopt the fixes for faults 7 and 8 in PR #13" — 19 November 2026.

### Subject: Reporting that an act cannot be done

**The rule as it now stands.** The tool reaches GitHub through `node`; a refused
direct `gh` or git command is expected (the deny list forces GitHub through the
tool) and is not the tool being blocked. A session verifies an act with the tool
before telling the owner it cannot be done. This corrected the PROCESS starting
text (`starting_texts/process.md`, rule 8), after the first PROCESS session wrongly
reported it could not merge (fix B, 19 November 2026).

**The owner's words.** "Decision: adopt the round-4 fixes B, A and C in PR #14" — 19 November 2026.

### Subject: The required check's name

**The rule as it now stands.** The required check is `tool-tests` on the process
repository (which holds the tool) and `module-tests` on a product; the tool
chooses it per repository (`requiredCheck`). This corrected the tool (fix A,
round-4 fault, 19 November 2026).

**The owner's words.** "Decision: adopt the round-4 fixes B, A and C in PR #14" — 19 November 2026.

### Subject: Naming the pull request for a job's commands

**The rule as it now stands.** `ready`, `results` and `close` take the pull request
number, or the branch named with `--branch <b>`, or — when neither is given — default to
the current branch's one open pull request (a job has exactly one); `merge`, `failed-runs`
and `notify` still require the number. Fix C (round-4 fault 1, 19 November 2026) added the
current-branch default. A job starts on a detached checkout of the tranche branch (design
part 4, section 2), where the current branch reads `HEAD` and the default cannot resolve
the pull request, so these three also accept `--branch` as `open` does (fault o); a told
job that finds nothing to change names `--branch <its branch>` or the number. This last
correction answered a trial process fault of 19 November 2026 (the invoice job, pull
request 361, could not `close --nothing-to-change` from its detached checkout, and `close`
ignored `--branch`); researched in `process/research/close-detached-checkout-19nov.md`. It
adds no test, gate, review or stop; it corrects the tool so fix C's intent reaches the
job's actual checkout.

**The owner's words.** "Decision: adopt the round-4 fixes B, A and C in PR #14" — 19 November 2026.

### Subject: The check and deliberate error-condition tests (fault D)

**The rule as it now stands.** The tool's `check` makes only the two refusals the
owner approved: a structured comment that disagrees with the module's code, and
the module's code that disagrees with a provider's stated interface (design part 2,
section 6). A wrong-typed value a test passes on purpose inside an error assertion
(`assert.throws`, `assert.rejects` and their kin), to show that an error condition
is "properly identified and communicated", is neither refusal: the tool reads it
as "cannot tell" and never refuses it. This corrected the tool (`check` reported
every type disagreement in a module's files, so it failed required runs on correct
error-condition tests) and the design (part 2, section 6) and build text 1b
(command 18), consistent with the requirement that module tests show error
conditions are communicated (fault D, found by the trial; researched in
`process/research/faultD-check-wrong-type-tests-19nov.md`). Option B of the four
put to the owner: it flips one of the proof's 48 recorded refusing decisions
(P09) and preserves the rest.

**The owner's words.** "Decision: B" — 19 November 2026.

### Subject: Checking the environment's permissions-management settings on setup and an account switch

**The rule as it now stands.** The steps for starting development under a Claude
account — at a product's start, and whenever Process4 development or a product's
development moves to another Claude account — include a check that the cloud
environment the sessions will run under carries the process's permissions-management
settings before ROOT is started. On Claude Code those settings are the `autoMode`
block that steers the auto-mode checker so sanctioned cross-session and cross-repository
acts are not falsely refused; what they are and where they live is design part 7,
section 5. This added the check to the owner's acts (part 1, section 3; part 7,
section 4, act 6), the account-switch step (part 4, section 7), and the open
account-switch design work (part 10, section 2, item 11); on Codex the equivalent is
not yet known (part 8, section 2). It adds no test, gate, review or stop to product
work; it is a setup prerequisite, added on the owner's explicit instruction.

**The owner's words.** "Instruction: When process4 development (and product development using process4) moves to another Claude account, the steps involved in starting development under the different account should include a check to make sure that the environment the sessions will be running under includes the proper settings for process4's permissions management strategy." — 19 November 2026.

### Subject: Moving a product to the latest (or a named) Process4 version

**The rule as it now stands.** The owner, in the coordinator's session, instructs it
to move a product to the latest Process4 version, or to a named version; that one
instruction is his prior approval, needs no commit id, and asks nothing further of
him. The coordinator records his words and tells ARCH; ARCH resolves the latest with
the tool's `latest-version` (the newest commit of the process repository's main,
which holds only merged, tested changes), sets the product's process config to that
commit by pull request, merges it, and refreshes the sessions onto it, losing no
work (design part 6, section 7; part 3, section 1; part 4, section 1; the coordinator
and ARCH starting texts; the tool's `latest-version` command, build text 1b command
25). It removes steps; it adds no test, gate, review or stop. Option C of three put
to the owner (latest by default, a named version when he gives one).

**The owner's words.** "Decision: C" — 19 November 2026.

### Subject: Refreshing PROCESS across repositories, and re-attempting a non-substantive refusal

**The rule as it now stands.** PROCESS is started and refreshed by **the owner, not by
ROOT** (option C, the owner's decision of 19 November 2026). It is the one owner-facing
role: the owner directs it directly, and every refresh happens with him present, so
refreshing it by hand is low-cost and removes the dependency on a cross-repository session
create, which the permission checker resisted. At its refresh point PROCESS rewrites its
handover record and asks the coordinator; the coordinator puts the start prompt on the
owner's standing page and notifies him; the owner starts the successor, which starts only
from the shared state and the repository and records its own liveness in PROCESS's record
in the process's repository. The coordinator reads that record to find PROCESS running
(and so does not ask the owner to start a second), and surfaces the prompt whenever PROCESS
is stopped or asks to refresh (design part 4, section 5; part 6, sections 6–7; part 1,
section 3; the PROCESS, ROOT and coordinator starting texts). ROOT no longer starts or
refreshes PROCESS.

**Decision B's other clarifications stand unchanged**, for every cross-repository act other
than starting PROCESS — cross-repository messaging among the roles (which is proven to
work) chief among them:

1. **Non-substantive refusals may be re-attempted.** Where the checker refuses an act the
   owner's approvals and the permissions-management settings sanction, and the refusal is
   non-substantive — the checker allowed an identical act before or invites another
   attempt, or the refusal fell on a command the session malformed — the session makes the
   sanctioned act again, cleanly and bounded (keep prior state, retry at the next wake or
   after a short wait, bring it to the owner if it persists). This is not working a refusal
   around: a genuinely unsanctioned act is still never reworded or handed on, a relayed
   consent is still not retried, and three refusals in a row still stop the session (design
   part 1, sections 6–7; part 6, section 4).
2. **Naming a role to message it.** A session resolves a role to its current session
   address from the roles record (a lane from the lanes record) before messaging it, never
   from a remembered address, with `state read --repository` where the record is in another
   repository (design part 4, sections 4 and 11).
3. **Successor registration.** ROOT records in the roles record the address of each
   standing session it starts or refreshes (design part 4, section 5).

**Why option C supersedes decision B for the PROCESS refresh.** Decision B relied on ROOT
performing a cross-repository session create to start the PROCESS successor. That create was
never once measured, and on 19 November 2026 the PROCESS refresh fell to the owner by hand a
**second** time — on a version (`7d8e529`) that already carried decision B — because the
refreshing PROCESS went straight to the owner-start step without engaging ROOT, and because
an owner-started PROCESS has no parent-ROOT link to climb back on. Worse, the only
cross-repository session-lifecycle act actually attempted post-B (ROOT archiving the
process-repository PROCESS session) was refused twice even with the permissions-management
settings in place (`[Destructive or Unwanted Actions]`, then `[Undermining Oversight]`),
while cross-repository messaging worked. So owner-start is made the designed path for the
one role always refreshed with the owner present, removing a dependency on an unproven,
doubt-cast cross-repository create. Option C of three put to the owner (A: no change; B:
make the autonomous path run and measure it once; C: owner-start by design). It adds no
test, gate, review or stop; it removes steps and a dependency, and updated design parts 1,
4, 6, 7 and 10 and the PROCESS, ROOT and coordinator starting texts in the same step.
Researched in `process/research/root-refresh-of-process-failed-again-19nov.md` (and the
first occurrence in `process/research/process-refresh-cross-repo-19nov.md`).

**The owner's words.** "Decision:option B" — 19 November 2026 (decision B; its re-attempt,
role-to-address resolution and successor registration remain in force for all
cross-repository acts). "Decision: option C (for now)" — 19 November 2026 (makes
owner-start the designed path for the PROCESS refresh, superseding decision B's
ROOT-starts-PROCESS mechanism for that one act; "for now" keeps the autonomous path open to
revisit).

### Subject: The coordinator records the owner's words from a file

**The rule as it now stands.** The coordinator carries the owner's marked words into the
tool from a file, never typed on a command line (coordinator starting text, rule 1). This
prevents the fault measured on the trial, where a forbidden `gh` command — one the session
added, or one present in the owner's quoted words — reached the command line and the
permission checker refused the whole recording command, so his words went unrecorded and he
had to retype them. It is the preventive half of the coordinator recording-path fault; the
recovery half (re-issuing a command the session malformed, cleanly) is the
non-substantive-refusal clarification of the decision above. Researched in
`process/research/coordinator-gh-in-tool-command-19nov.md` (option C). It adds no test, gate,
review or stop; `process.md` and `arch.md` already record their words from files, so only the
coordinator text needed the clause.

**The owner's words.** "Instruction: add the prevition piece of the coordinator recording-path problem fix as you've described." — 19 November 2026.

### Subject: How the starting-text size limit is measured

**The rule as it now stands.** A role's starting-text size limit (4,096 bytes, a provisional
figure — part 5, section 2) is measured against the role's **instructions proper**, with the
one mechanical **fetch line** left out of the count: the single clone command a session runs
once at start to fetch its read-only copy of the process, and never rereads. The limit exists
so a role's rules are read in full, not skimmed; the fetch line carries only names and
addresses (the pinned process version's commit id, the repository), not rules, so counting it
against the budget measured the wrong thing. This changed design part 4, section 11 (the
measurement rule) and part 5, section 2 (a note). It removes nothing a role reads and adds no
test, gate, review or stop; texts that carry a fetch line (every role but PROCESS, which has
none) gain headroom. The four size values themselves stay provisional and open (part 10,
section 1, item 1). Surfaced by the owner's question on the review page; the size-headroom
finding it answers is in the verification sweep, `process/research/verification-sweep-19nov.md`.

**The owner's words.** "Decision: change the way the limit is measured as you've recommended." — 20 November 2026.

### Subject: The four reading values

**The rule as it now stands.** The four reading figures (design part 5, section 2) are set
on the reading-fidelity measurement of 20 November 2026, run on Claude Code (model
`claude-opus-5-5`, effort `medium`, a 1,000,000-token window; `measurement/results/`, report
`report.md` and `role-text-upward.md`). They are no longer provisional on Claude Code. A
Codex re-measurement is owed before they govern there (part 8).

- **The largest single text read in full: 60,000 bytes on Claude Code,** and 24,000 bytes on
  Codex until Codex is measured. On Claude Code governing prose read whole up to the
  harness's mechanical read-cut (about 25,000 tokens, about 76,000 bytes); 60,000 is 20
  percent below the largest clean read. This sets the single-text maximum per harness,
  relaxing the earlier rule that the Codex maximums govern both harnesses (part 5, section 1)
  for this one value (part 7, section 2).
- **The largest set of texts read together: 175,000 bytes,** now measured (the word
  "provisional" is dropped): read whole at every size up to 220,000 bytes, with a 25 percent
  margin kept.
- **A role's starting text: 8,192 bytes, and at most ten rules.** A role text was read and
  its rules applied with no error far beyond this (45 rules at 32.9 KB); 8,192 is a modest
  raise from 4,096 for breathing room. The rule count stays ten, and the conciseness rule
  keeps the texts short (part 5, section 3).
- **The fill level for a refresh: 50 percent** (raised from 40). Reading stayed clean at
  every fill up to 80 percent. The owner set 50 percent — above the measurement's
  conservative 40 — so that session refreshes, which are expensive and slow, are minimised
  while leaving room to work on. On Codex, where no fill level can be read, the refresh comes
  only at a natural pause (part 8).

"As recommended" is PROCESS's proposal on the owner's standing page ("Process4 Waiting for
Bob", thread 70f2987e) drawn from `measurement/results/report.md`: single text 60,000 on
Claude Code (24,000 for Codex), set of texts 175,000 now measured, a modest raise of the role
text to 8,192 keeping ten rules, and the fill level kept at 40 — the last of which his
exception changes to 50. This settled design part 10, section 1, item 1 (the four values were
the one open point there). It changed design part 5, sections 1 and 2; part 7, section 2 (the
Claude Code reading measurement); part 10, section 1 (item 1 settled) and section 2 (items 5
and 10); the starting-texts index; and the refresh level (40 → 50 percent) in every role's
starting text. It adds no test, gate, review or stop: the tool refuses nothing for size (part
6, section 5), so no tool change was needed. Two measurement findings are put to the owner
separately: a cut read returns a partial file with no notice (part 7, section 2), and a
headless session cannot read its own fill (part 7, section 1), which bears on honouring the 50
percent refresh unattended.

**The owner's words.** "decision: as recommended, except that session refreshes a expensive
and slow, and thus should be minimized. So the fill level should be set to 50% - which still
leaves a lot of room to continue work up to the 74% when compaction can occur." — 20 November
2026.

### Subject: Two reading-measurement findings — a silent cut read, and reading a session's own fill

**The rule as it now stands.** Two findings from the 20 November reading measurement
(`measurement/results/report.md`, `role-text-upward.md`) are settled, each as recommended
(option (a)).

- **A cut read is silent (finding 1): no further change.** When a single text exceeds the
  harness's read-cut (about 25,000 tokens), a plain read returns a partial file and, in this
  harness version, the tool result carries no notice of the cut (design part 7, section 2, now
  records this). The guard is that the single-text maximum (60,000 bytes on Claude Code) sits
  below the cut, and every governing text states its line count and last section at its top
  (part 5, section 1), so a short read can be caught. No reading check, gate or stop is added.
- **A session reading its own fill (finding 2): part 7, section 1 records how.** A session
  reads its fill from the harness's own usage data (`get_session`, field `context_usage`), the
  route the role sessions use; a bare headless `claude -p` reader cannot see it and guesses
  (early, the safe way, seen once on 20 November). Where a session cannot read its fill, it
  refreshes only at a natural pause (part 5, section 2; part 8). This corrected the flat
  statement in part 7, section 1 that "the session can read how full its context is", and
  bears on the 50 percent refresh trigger settled in the entry above.

It adds no test, gate, review or stop: finding 1 adds nothing (the guard already holds and the
measured fact is recorded), and finding 2 records a measured nuance and leans on the existing
natural-pause fallback. Changed design part 7, section 1; part 7, section 2 was already updated
with the four-values change above.

**The owner's words.** "Decision: as recommended" — 20 November 2026 (on the standing page,
the two-findings item; option (a) for each finding).

### Subject: The design document carries no history — enforcing the separation

**The rule as it now stands.** The design document (the files in `design/`) states the design
as it now stands and carries no history of how it evolved, beyond naming where a figure or a
quotation comes from (design part 0, section 1; part 5, section 4). The history lives elsewhere:
the owner's dated decisions in this record, and the reasons and evidence in the background
document. To enforce this, the design was cleaned of the history that had accumulated in it:
draft and version lineage ("the seventh draft", "the sixth draft"); dated decision provenance
("Settled (the owner, <date>)", "the owner's decision, <date>", labels such as "decision C" and
"fault D"); references to the predecessor process ("the process before this one"); working-file
and evidence paths (`process4/working/…` and the like); change-narratives (how a rule came to be
or was withdrawn); and the authorship marks "Claude decided", "Reading" and "Settled". A rule
that a mark had introduced now stands plainly; the marks legend (part 0, section 3) keeps only
"Open" and "Unproven", which flag the design's present status. Part 10, section 1 ("Open with the
owner") is reduced to the one genuinely-open item (the wording of the standing approvals), its
settled-decision recaps removed as duplicates of this record. The present-status content — what
is unproven, what is still open, and the trial — stays, cleaned of its dated history.

No rule changed: the cleanup only relocated provenance and removed narrative; the design still
meets the process4 requirements, and it added no test, gate, review or stop. The starting-texts
index's measured byte figures were updated to the cleaned parts' sizes in the same step. The
build texts and the index still carry their own history and are not part of this change.

**The owner's words.** "Decision: I agree with your recommendations in the Judgement calls for the owner section. Do it." — 20 November 2026 (on PROCESS's research note `process/research/design-history-separation-20nov.md`; his recommendations there: keep the cleaned present-status and collapse part 10 section 1 (option 1), strip the "Claude decided" mark, and produce one combined downloadable copy).

### Subject: Showing a record entry is for transparency, not an approval gate

**The rule as it now stands.** When PROCESS (or the coordinator) records a decision and shows
the owner the rewritten entry, the showing is for transparency — so he can catch a
misrecording — and is not an approval gate. The change merges on the owner's marked decision
once the required check passes, without waiting for a further approval; if he later objects to
the entry it is rewritten in place (his exact dated words are never edited). This corrected
design part 5, section 5 and the PROCESS starting text (rule 4), where "shown to the owner once
before it stands" had been read as requiring a separate approval to merge — a stop nothing
called for, since the owner's standing approvals already let sessions merge into main once the
required check passes, without a person's review. It removes a self-imposed gate; it adds no
test, gate, review or stop, and it preserves the owner's controls: a change still merges only on
his marked decision for it, the required check must pass, and the entry is still shown and still
corrigible.

**The owner's words.** "Decision: fix it" — 20 November 2026 (approving the clarification PROCESS described, after "We need to fix that. You have the charter to do so.").

### Subject: How a tranche ends, and what shows its journeys complete

**The rule as it now stands.** No change. A tranche ends when its rounds' partial walks
(internal and external) come clean, each walk scoped by ARCH to the areas that round changed;
what shows that the journeys named for the tranche complete is those partial walks themselves,
not any added end-of-tranche sweep. The final-round-sweep reading once proposed in design
part 3, section 5 is not adopted. A full external walk stays opt-in, made only on the owner's
request (part 3, section 3). This settled the open question in part 3, section 5 and the open
item in part 10, section 1, item 2; it changes no testing or walk rule and adds no test, gate,
review or stop.

**The owner's words.** "Decision: make no changes to the testing policy we've defined and confirmed ad nausium." — 20 November 2026.

### Subject: The terms "provider" and "user"

**The rule as it now stands.** The design document refers to a module that provides a service
to other modules through an interface as a **provider**, and a module that uses the service of
another module through the provider's interface as a **user**. This is the owner's marked
instruction; the design already defined and used these terms (part 0, section 6; part 2), and
the definition in part 0, section 6 is reworded to his phrasing in the same step. It adds no
test, gate, review or stop; it fixes terminology.

**The owner's words.** "Instruction: The design document should refer to a module that provides a service to other modules through an interface as a \"provider\". A module that uses the service of another module through the provider's interface is referred to as a \"user.\"" — 20 November 2026.

### Subject: Publishing a release — who publishes, and production keys and tokens

**The rule as it now stands.** Process4 builds the product's installer and updater as product
code (jobs, with their own tests) and proves them on a development account for both a fresh
install and an upgrade before any release is offered (part 3, section 6; part 2). On the
owner's approval, ARCH carries out the publish: the release ceremony places the new installer
where the product's "check for updates" and outside users expect to find it, using a **release
token** that grants the privileges to publish; where producing the installer needs a product's
**production secret**, that secret is used **through a secret-management facility**. **No
session directly holds a production key.** Running an install or an update on a real site is
always the user's or operator's act — never the developer's, never a session's. This settled
the open question in part 3, section 6 and the open item in part 10, section 1, item 4, and
refined the production-key rule (part 1, section 2; part 9, section 2). It adds no test, gate,
review or stop; it is a requirement change made with the owner's explicit approval. The
install/update success definition is also settled: the install and the update run on a
development account, "successful" means the installer or updater finishes without error and the
site it produces starts, and on a failure no release is offered and the fault becomes
next-tranche work (part 3, section 6).

**The owner's words.** "Decision: No session directly holds a production key. But a product's production secret key may be used their a secret management facility to produce the installer. Similarly, the release process may require the use of a release token that grants it the necessary privileges in order to publish a release." — 20 November 2026. On the install/update success definition, confirming the reading restated to him on the review page: "Decision" — 20 November 2026.

### Subject: An urgent fix while a tranche is open

**The rule as it now stands.** When an urgent fix is needed while a tranche is open, the open
tranche is paused on the owner's word; the fix is built as its own tranche from the main
branch and merged; the paused tranche then takes the main branch in and goes on (part 3,
section 7). This settled the open question in part 3, section 7 and the open item in part 10,
section 1, item 5, confirming the reading restated to him on the review page. It adds no test,
gate, review or stop.

**The owner's words.** On the urgent-fix question, confirming the reading restated on the review page: "Decision" — 20 November 2026.

### Subject: A told job's tests — the three readings

**The rule as it now stands.** Three points on what a told job re-tests are confirmed as the
design read them (part 2, section 7): (1) a told job's own edits count among "the changed
parts", so what it touches is re-tested; (2) the related tests are chosen a whole test file at
a time; (3) where the tool cannot follow a told module's code, that module's whole tests run,
since the tool cannot say which relate. These define the scope of a told job, which runs fewer
tests than an ordinary job; they add no test, gate, review or stop, and the mechanism that
traces a use to its tests remains unproven until the trial (part 2, section 7, "Unproven").
This settled the open item in part 10, section 1, item 6.

**The owner's words.** "Decision: as recommended" — 20 November 2026.

### Subject: The smaller readings (part 10, section 1, item 7)

**The rule as it now stands.** The smaller interpretive readings the design had not had the
owner confirm one by one are confirmed as recommended, each now settled in its home section:
a role's starting text and its starting instructions are one thing, and the definitions of an
architecture bug and an implementation error (part 0, section 6); how an architecture bug is
corrected (part 1, section 6); a lane's folder needs no module tests (part 2, section 9);
exercising a doubtful workflow in a walk adds no test (part 3, section 3); the lane rules stand
as written, and questions to a lane and its answers are not kept as a running record (part 4,
section 3); a role lasts while its sessions are refreshed often (part 4, section 5); every stop
nothing called for is reported to PROCESS during the trial (part 4, section 10); PROCESS brings
the owner a role's principles that cannot be kept short (part 5, section 3); the ranking page
runs from mission highest to design decisions lowest (part 5, section 6); and PROCESS starts
its own lanes (part 6, section 8). This settled part 10, section 1, item 7; each inline
"Reading" became a settled ruling in the same step. It adds no test, gate, review or stop.

**The owner's words.** "Decision: as recommended" — 20 November 2026.

### Subject: Which list of journeys counts (walk matter 9.1)

**The rule as it now stands.** The UX design lane maintains the product's list of journeys;
that maintained list is the list the walks use, and the owner does not approve it per tranche.
This settled the first of the five walk matters the owner was to settle (build text
`03-the-walks.md`, section 9, item 1; the "which list counts" question recorded there in
section 1 and in design part 10, section 1, item 9), and confirms the UX lane's ownership of
the walks' documents (design part 3, section 3; part 4, section 3). The form of the two
documents stays as build text 3, section 2 decides (a page per screen group and per journey,
with an index). The owner still approves each tranche (part 3, section 1); he simply does not
separately approve the journey list. It adds no test, gate, review or stop. The other four
walk matters (9.2–9.5) remain open.

**The owner's words.** "Decision: the UX design lane maintains the list of journeys. That's the list to use, and I don't need to approve that list after a tranche." — 20 November 2026.

### Subject: AI journeys in walks (walk matters 9.2 and 9.3)

**The rule as it now stands.** (9.2) A step of a journey that uses AI is judged as a module
test is judged — a different but still valid answer does not fail it — and the "what must be
present" wording the step's `expects` line carries is set **per journey by the UX design
lane** (build text `03-the-walks.md`, section 5). (9.3) When no AI account is connected to the
development deployment, journeys that use AI are recorded **not walked**, and a tranche **may
still end** with them recorded not walked (option A); each is named not walked in the account
after the round. This settled walk matters 9.2 and 9.3 (build text 3, section 9; design part
10, section 1, item 9). It adds no test, gate, review or stop.

**The owner's words.** On 9.2: "Decision: agreed, except that the “what must be present” wording is set per journey by the UX design lane." — 20 November 2026. On 9.3: "Decision: A" — 20 November 2026.

### Subject: A flaw set aside by ARCH (walk matter 9.4)

**The rule as it now stands.** ARCH may rule that a walker's entry is none of the three flaw
kinds and set it aside, with the reason named in the account after the round, which is what
lets the owner see and overrule it (option a; build text `03-the-walks.md`, section 6, outcome
3, and section 9; design part 10, section 1, item 9). ARCH already decides the product's
technical matters, so this keeps a routine judgment with ARCH while keeping it visible to the
owner. It adds no test, gate, review or stop.

**The owner's words.** "Decision: as recommended" — 20 November 2026.

### Subject: No owner approval of a tranche

**The rule as it now stands.** A tranche opens because the product has work to do —
requirements added or changed, issues raised by its lanes, flaws found by walks or by jobs,
and notices between modules. There is no single purpose to state for a tranche and no owner
review or approval before it opens: ARCH opens the tranche and decides its scope. The owner
directs the product continuously — through the coordinator and the lanes, and by marked
instructions (put a module first, change the slot number, stop, move versions) — and still
approves every public release. This removed the owner's "approve or change ARCH's proposal for
a tranche" act (design part 1, section 3), rewrote how a tranche opens (part 3, section 1), and
changed ARCH's duty from "proposes each tranche" to opening it and deciding its scope (part 4,
section 1). It removes a step; it adds no test, gate, review or stop.

**The owner's words.** "Decision: Remove the owner's tranche-approval" — 20 November 2026.

### Subject: Parts walked by hand (walk matter 9.5)

**The rule as it now stands.** A walking session walks by hand — operates the running product
in its browser, in its own words — whatever a screen or journey page describes that no written
step covers; a walk is measured against the document, not only against its written steps
(option a; build text `03-the-walks.md`, section 3 and section 9; design part 10, section 1,
item 9). This catches a missing or weakened step, which under the alternative would be checked
by no one. It adds no test, gate, review or stop (the walk already exists; this says what it
covers). With this, all five walk matters (9.1–9.5) are settled.

**The owner's words.** "Decision: as recommended" — 20 November 2026.

### Subject: Releasing from a tranche merged with its flaws named

**The rule as it now stands.** A tranche that does not come clean may be merged with
its flaws named — its flaws becoming work in the next tranche — or dropped, on the
owner's word. The process neither forces nor forbids a release from a flaws-named
tranche: whether anything is released from it is the owner's judgement, governed by his
release approval and a confirmed install and update (design part 3, sections 5–6). The
earlier reading that no release could follow until a later tranche ended clean is
withdrawn. Process4 is a software-development process, not the product, and leaves the
balance of time, resources and quality to the owner rather than deciding it for him.
This settled the open question in design part 3, section 5 and the open item in part 10,
section 1, item 3. It removes a process prohibition; it adds no test, gate, review or
stop, and the guardrails that stop a bad release — his explicit release approval, and a
confirmed install and update — are unchanged.

**The owner's words.** On the balance the process must leave him (conversation,
20 November 2026): "The development of large workflows like civicsmith is a process of
balancing 3 things: time, resources, and quality. ... I have no intention to ever ship a
product with known flaws. But what we've designed here isn't a product, it's a software
development process. That process, by necessity, must have the real world flexibility to
create the proper balance that the product requires." Confirming the reading restated on
the review page's item-3 thread: "Decision" — 20 November 2026.

### Subject: Codex — Claude Code first, Codex later

**The rule as it now stands.** Process4 proceeds on Claude Code, where the design is
complete, and treats the Codex side as later work. Everything design part 8 marks not
known — how Codex carries the approvals, the forbidden commands and a permission checker,
whether messages cross separate chats, each role as its own session, grouping, archiving,
notifications and sign-in renewal — and which Codex model the process uses, are filled
from the owner's OpenAI-account work when he takes that side on; until then Codex is not
supported and nothing is blocked waiting on it. This settled the approach in design part
10, section 1, item 11; the Codex specifics in part 8 remain to be filled. It adds no
test, gate, review or stop.

**The owner's words.** "Decision: as recommended" — 20 November 2026 (on the review
page's item-11 / Codex thread).

### Subject: A walk-flaw module whose job hands the flaw back (round-done gap)

**The rule as it now stands.** A module carrying a walk flaw (or a flaw another module's job
reported) is finished by a merge; or, when its job finds that nothing in the module needs
changing, by its job recording that in its pull request and closing it unmerged, which hands
the flaw back to ARCH. ARCH re-places the flaw against another module (or gives it to the UX
lane where the document is wrong); the module that handed it back is finished for the round,
and the re-placed flaw is the other module's work (bounded by design part 4 §10: a flaw handed
back twice becomes a design question). This closed a latent gap in the built round logic found
by the verification sweep: such a module reached neither "finished" (it is "finished only by a
merge") nor the next job (the flaw was stripped from waiting work when its job opened), so
`round-done` hung forever once walks run. It is a correction that completes what design part 2
§4 already intended; it adds no test, gate, review or stop. It changed design part 2 §4, the
tool's `finished` (`tool/lib/round.mjs`), build text 1b command 12, and the tool's tests.

**The owner's words.** "open item 12: decided - close the gap" — 20 November 2026.

### Subject: How a lane's marked owner-words reach the coordinator

**The rule as it now stands.** When the owner gives a lane a marked decision on its design
pages, the lane passes it to ARCH, which relays it to the coordinator exactly as typed for the
record. A lane reaches the coordinator only through ARCH; lanes talk only to ARCH (design part
4 §3), so no direct lane→coordinator channel is added. This resolved a contradiction the
verification sweep found: lane.md rule 4 told the lane to pass the owner's marked words "to the
coordinator exactly as typed," but a lane's granted acts reach only ARCH. Option A (route via
ARCH) of two put to the owner (A: via ARCH; B: grant the lane a direct channel). It changed
design part 1 §4, the lane starting text (rule 4) and ARCH's (rule 7). It adds no test, gate,
review or stop, and no new channel: ARCH already reaches the coordinator, and a relayed
decision for the record — as opposed to a standing note — is not refused by the permission
checker (part 1 §4; part 3 §6).

**The owner's words.** "open item 13: decided - A" — 20 November 2026.

## Earlier decisions not yet migrated

The owner's design decisions made while Process4 was written are kept as his
typed words in the process3 repository, under `process4/owner_words/` (design
part 5, section 7). Migrating those into this record — one entry per subject, in
his exact words — is done only on the owner's word, because the words quoted here
must be his exact typed words and must never be fabricated or paraphrased.
