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

## Earlier decisions not yet migrated

The owner's design decisions made while Process4 was written are kept as his
typed words in the process3 repository, under `process4/owner_words/` (design
part 5, section 7). Migrating those into this record — one entry per subject, in
his exact words — is done only on the owner's word, because the words quoted here
must be his exact typed words and must never be fabricated or paraphrased.
