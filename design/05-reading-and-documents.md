# Part 5. Reading in full, and the documents

Length: 53 lines. Last section: "6. Each product's ranking page".

## 1. Reading in full

- A session acts only on what it has read in full or measured.
- Every text a session must read in full, and every set of texts read together, is kept below a measured maximum size. Nothing can ensure a full reading; keeping below the maximum reliably results in one.
- The maximums and the fill level are chosen by one yardstick: after a session has read what it must, there is room for a worthwhile piece of correct work and a handover before the fill level.
- The maximums are used on both harnesses, with one exception: the largest single text is set per harness (section 2).
- Sessions are refreshed so that compaction is never needed. In the owner's words, the process has "session refresh requirements that rigorously eleminate the need for compaction".
- Each governing text says at its top how long it is and what its last section is.

## 2. The four values

A Codex re-measurement is owed before these figures govern there (part 8); the single-text figure is already set per harness.

| Value | Figure | What it rests on |
|---|---|---|
| The largest single text read in full | 60,000 bytes on Claude Code; 24,000 bytes on Codex until Codex is measured | Set per harness (part 7, section 2). |
| The largest set of texts read together | 175,000 bytes | Applies on both harnesses. |
| A role's starting text | 8,192 bytes, and at most ten rules | Applies on both harnesses; the conciseness rule (section 3) keeps the texts short. |
| The fill level for a refresh | 50 percent | Set so that session refreshes, which are expensive and slow, are minimised while leaving room to work on. Where a harness shows no fill level, as on Codex, the refresh comes only at a natural pause (part 8). |

- The role's-text limit leaves the one mechanical fetch line out of the count (part 4, section 11).

## 3. Keeping texts under the maximums

- Each role's principles are concise, sufficient for the role to be performed correctly, and unambiguously clear. Whenever they are changed, every effort is made to keep them short enough to be read in full and not scanned. Where that cannot be done, the matter comes to the owner to find a solution. PROCESS brings it to him.
- A role's research is background, not governing text. A lane, and PROCESS, reads in full an index of its research, one line for each file, and reads a research file, or gives it to a worker, when a question needs it (part 1, section 6). PROCESS reads the record of the owner's decisions about the design (section 5) and the build texts the same way, through an index of the record's subjects and one of each build text's sections (`process/decisions-index.md`, `build/README.md`); the design states every decision as it now stands. So research and the record can grow without a role's reading set passing the maximum.
- The size of a role's starting text is a rule, not a refusal among the tool's tests.
- A module's requirements file is kept under the single-text maximum as a rule ARCH applies, and nothing refuses a job or a merge for size (part 2, section 2).

## 4. The two documents

- There are two documents. This design document defines the design and is what sessions follow. A background document gives the background and context; it is the owner's Foundations brought up to date with the design.
- The design document names no product and carries no history. Its body, parts 1 to 6, names no hosting provider and uses harness-neutral terms. A table for each harness and for each hosting provider follows the body.
- Where one harness's side of the design is not yet known or not yet built, the design notes the shortcoming plainly and leaves it for the owner's work on that harness's account to fill (part 8).
- Each harness's own files are kept apart in the process's repository, and a change for one harness never alters the other's.
- The design document is kept up to date with the owner's decisions in the same step as each decision is recorded.

## 5. The records of decisions

- The owner's decisions about the Process4 design are kept in the process's repository, by PROCESS. His decisions about a product are kept by the coordinator. Each record has one writer. A product's record is kept in that product's repository.
- A record is ordered by subject. Each entry states the rule as it now stands, and a decision that changes an entry rewrites it in place.
- The owner's exact dated words are kept and never edited.
- A rewritten entry is shown to the owner once, for transparency so he can catch a misrecording; this is not an approval gate. The change merges on his marked decision once the required check passes, without waiting for a further approval; if he later objects to the entry it is rewritten in place (his exact dated words are never edited).
- ARCH's technical decisions are written in a second record in the product's repository, of which ARCH is the only writer.

## 6. Each product's ranking page

- Each product has one short page, kept by ARCH and read by every role, that ranks its kinds of governing text: mission, principles, standards, requirements, design decisions. Mission is highest and design decisions lowest.
- A lower one never overrides a higher one. A session that finds two in conflict follows the higher and tells ARCH.
