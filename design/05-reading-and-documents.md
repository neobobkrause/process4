# Part 5. Reading in full, and the documents

Length: 62 lines. Last section: "7. Where things are kept now".

## 1. Reading in full

- A session acts only on what it has read in full or measured.
- Every text a session must read in full, and every set of texts read together, is kept below a measured maximum size. Nothing can ensure a full reading; keeping below the maximum reliably results in one.
- The maximums and the fill level are chosen by one yardstick: after a session has read what it must, there is room for a worthwhile piece of correct work and a handover before the fill level.
- The maximums are used on both harnesses, with one exception: the largest single text is set per harness — 60,000 bytes on Claude Code, measured there on 20 November 2026, and 24,000 bytes on Codex until Codex is measured (section 2; part 7, section 2). The Claude Code measurement showed the Codex single-text figure to be far below what Claude Code reads whole, so that one value is no longer the more constrained. The set, role-text and fill-level figures also come from the Claude Code measurement and apply on both harnesses, with a Codex re-measurement owed; where Codex shows no fill level, the refresh comes only at a natural pause (part 8).
- Sessions are refreshed so that compaction is never needed. In the owner's words, the process has "session refresh requirements that rigorously eleminate the need for compaction".
- **Claude decided:** each governing text says at its top how long it is and what its last section is.

## 2. The four values

All four were settled by the owner's marked decision of 20 November 2026 (the record of decisions), on the reading-fidelity measurement of that day: Claude Code, model `claude-opus-5-5`, effort `medium`, a 1,000,000-token window (`measurement/results/`). They are no longer provisional on Claude Code. A Codex re-measurement is owed before they govern there (part 8); the single-text figure is already set per harness.

| Value | Figure | What it rests on |
|---|---|---|
| The largest single text read in full | 60,000 bytes on Claude Code; 24,000 bytes on Codex until Codex is measured | Measured on Claude Code: governing prose read whole up to the harness's mechanical read-cut, about 25,000 tokens (about 76,000 bytes of dense prose). 60,000 is 20 percent below the largest clean read. 24,000 is the largest size shown to work on Codex and governs there until Codex is measured (part 7, section 2; part 8) |
| The largest set of texts read together | 175,000 bytes | Measured on Claude Code: read whole at every size up to 220,000 bytes, with a 25 percent margin kept. It was also the largest set shown to work on Codex. Codex re-measurement owed |
| A role's starting text | 8,192 bytes, and at most ten rules | Measured on Claude Code: a role text was read and its rules applied with no error far beyond this, at 45 rules and 32.9 KB. 8,192 is a modest raise from 4,096 for breathing room; the rule count stays ten, and the conciseness rule (section 3) keeps the texts short. Codex re-measurement owed |
| The fill level for a refresh | 50 percent | Measured on Claude Code: reading stayed clean at every fill up to 80 percent. The owner set 50 percent so that session refreshes, which are expensive and slow, are minimised while leaving room to work on. On Codex no fill level can be read, so the refresh comes only at a natural pause (part 8) |

- These are floors shown to work on Claude Code, not sizes at which reading was shown to fail; each keeps a margin below the largest clean read.
- **The owner's decision, 20 November 2026:** the role's-text limit is measured against the role's instructions proper, leaving the one mechanical fetch line (the clone command, run once and never reread) out of the count, so boilerplate does not crowd out the rules (part 4, section 11).
- **Claude decided:** where a harness shows no fill level (part 8), the refresh comes only at a natural pause.

## 3. Keeping texts under the maximums

- Each role's principles are concise, sufficient for the role to be performed correctly, and unambiguously clear. Whenever they are changed, every effort is made to keep them short enough to be read in full and not scanned. Where that cannot be done, the matter comes to the owner to find a solution. **Settled (the owner, 20 November 2026):** PROCESS brings it to him.
- **Claude decided:** the size of a role's starting text is a rule, not a refusal among the tool's tests.
- A module's requirements file is kept under the single-text maximum as a rule ARCH applies; ARCH splits the module when a file nears it (part 2).
- Nothing refuses a job or a merge for size.

## 4. The two documents

- The owner's ledger was a worksheet and is retired.
- There are two documents. This design document defines the design and is what sessions follow. A background document gives the background and context; it is the owner's Foundations brought up to date with the design.
- The design document names no product and carries no history. Its body, parts 1 to 6, names no hosting provider and uses harness-neutral terms. A table for each harness and for each hosting provider follows the body.
- Where one harness's side of the design is not yet known or not yet built, the design notes the shortcoming plainly and leaves it for the owner's work on that harness's account to fill (part 8).
- Each harness's own files are kept apart in the process's repository, and a change for one harness never alters the other's.
- The design document is kept up to date with the owner's decisions in the same step as each decision is recorded.

## 5. The records of decisions

- The owner's decisions about the Process4 design are kept in the process's repository, by PROCESS. His decisions about a product are kept by the coordinator. Each record has one writer. **Claude decided:** a product's record is kept in that product's repository.
- A record is ordered by subject. Each entry states the rule as it now stands, and a decision that changes an entry rewrites it in place.
- The owner's exact dated words are kept and never edited.
- A rewritten entry is shown to the owner once before it stands.
- **Claude decided:** ARCH's technical decisions are written in a second record in the product's repository, of which ARCH is the only writer.

## 6. Each product's ranking page

- Each product has one short page, kept by ARCH and read by every role, that ranks its kinds of governing text: mission, principles, standards, requirements, design decisions. **Settled (the owner, 20 November 2026):** mission is highest and design decisions lowest.
- A lower one never overrides a higher one. A session that finds two in conflict follows the higher and tells ARCH.

## 7. Where things are kept now

- The Process4 work is kept in a folder named process4, on a branch named process4, of the process3 repository. The work for both harnesses is on that same branch.
- The owner's typed words are in `process4/owner_words/`. The working Foundations are `process4/evidence/foundations.md` and `process4/evidence/foundations_tranche_9nov.md`.
- The figures behind section 2 are in `process4/working/harness_separation/` and `process4/working/reading_measurements/RESULTS.md`. The second measurement is briefed in `process4/working/reading_measurements/RERUN_PROMPT.md`.
