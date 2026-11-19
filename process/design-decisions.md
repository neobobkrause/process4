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
design part 2, section 8 and part 5, sections 6 and 50 (fault 8, found by the
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

**The rule as it now stands.** `ready`, `results` and `close` default to the
current branch's one open pull request when no number is given (a job has exactly
one); `merge`, `failed-runs` and `notify` still require the number. This corrected
the tool (fix C, round-4 fault 1, 19 November 2026).

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

## Earlier decisions not yet migrated

The owner's design decisions made while Process4 was written are kept as his
typed words in the process3 repository, under `process4/owner_words/` (design
part 5, section 7). Migrating those into this record — one entry per subject, in
his exact words — is done only on the owner's word, because the words quoted here
must be his exact typed words and must never be fabricated or paraphrased.
