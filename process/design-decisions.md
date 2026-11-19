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

## Earlier decisions not yet migrated

The owner's design decisions made while Process4 was written are kept as his
typed words in the process3 repository, under `process4/owner_words/` (design
part 5, section 7). Migrating those into this record — one entry per subject, in
his exact words — is done only on the owner's word, because the words quoted here
must be his exact typed words and must never be fabricated or paraphrased.
