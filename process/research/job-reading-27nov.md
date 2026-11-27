# What a job reads, and how to trim it (27 Nov 2026)

The owner, 27 Nov 2026 00:27 UTC, a comment on his page sent to PROCESS #20: "There isn't be any history in the material
read by a job, only what the job actually needs. Decision: study how to properly trim the 31k of text each job reads but
never uses." Studied by a worker at origin/main 5ebeffa (scripts in PROCESS #20's scratchpad); "used" is its judgement
from every line against `starting_texts/job.md`'s acts and rules (inferred).

## Findings
- **A job's set is over the maximum today**: the 12 texts `job.md` line 9 names total **177,379 bytes** (design part 5
  §2: 175,000), not counting `job.md` (~6,300 filled) and the product's texts. ARCH's set is also over, **176,983**.
  `starting_texts/00-index.md` §2 still states 171,412 (its part sizes are stale: part 02 given 30,957, now 32,536). A
  process fault: the rule is not kept.
- Of the 177,379, the job uses ~92,167; ~85,212 it never acts on (~56,900 in whole sections). History is ~3,100 bytes,
  mostly in part 07 (accounts of what was seen) and the proof passages of build texts 2 and 2b.

| Text | Bytes | Never used | Sections never used |
|---|---|---|---|
| design 00 | 10,975 | 3,864 | §1, §2; 17 of 43 terms |
| design 01 | 11,598 | 7,850 | §1-§5 |
| design 02 | 32,536 | 10,737 | §5, §9; who-is-told list and exceptions, the closure, tool rules 1, 2, 6 |
| design 04 | 22,203 | 17,155 | §2, §3, §5-§7, §9; most of §1, §4, §11 |
| design 05 | 4,341 | 2,513 | §3-§5 |
| design 06 | 14,818 | 12,583 | §1, §2, §5, §7, §8 (mostly) |
| design 07 | 13,053 | 10,360 | §3-§5; 17 of 29 rows of §1 |
| build 02 | 12,527 | 4,206 | §1, §9; most of §7 |
| build 02b | 11,331 | 354 | two "Unproven" lines |
| build 02c | 16,066 | 0 | - |
| build 03 | 13,736 | 10,476 | §2, §4, §5, §7, §8 |
| build 05 §5-7 | 14,195 | 5,114 | §6 (the tool's own working) |

Also missing or hard to find for a job: how it finds ARCH's address (no `state read` among its acts); its time limit
sits in one row of part 7 §1 with no section named; test scope points to build text 1 §5, which it does not read; "none
is numbered R9" (02c) hints at a retired rule.

## Options
- **0. No change.** The job (and ARCH) stay over the maximum.
- **A. Read named sections.** `job.md` line 9 names sections (design 00 §3-6, 01 §6-7, 02 §1-4 and §6-8, 04 §4, §8,
  §10, §11, 05 §1, §2, §6, 06 §3, §4, §6, 07 §1-2; build 02 §2-4 and §8, 02b, 02c, 03 §3 and §6, 05 §5 and §7):
  114,566 bytes, saving 62,813 a job; no other role changes. Part 5 §1 does not say a text is a file, and `job.md`
  already reads build 05 by section. The length line guards a cut read only for a whole file; the largest section
  (part 02 §7, 18,202) is far below the cut.
- **B. A separate short text for jobs** (~60-70k): two texts holding one rule drift; not recommended.
- **C. Split the design parts and build texts by who reads them**: the owner's acts, how the process changes,
  onboarding, what is not proven on Claude Code, ROOT and the watcher, slots and changes that are not a job's, most of
  the walks' text, the tool's own working, the proof, each into files the job does not read. The job reads whole files
  (~115k); ARCH drops to ~167k (under the maximum), walkers ~51k, lanes ~105k; PROCESS unchanged. One large change;
  the risk is a rule sorted into a file a role no longer reads, caught by checking each starting text's cited sections
  against its reading list.
- **D. Remove history** from every governing text (~3,100 bytes for a job, more for others), and reword part 0 §1's
  allowance ("naming where a figure or a quotation comes from") to the owner's rule.
Velocity: ~58k tokens read at every job start and replacement today; ~38k after A or C; on 204 modules at least ~4.2M
tokens saved per pass, and more room before a job's fill level.
Recommended: C and D together (every role reads whole files, ARCH back under the maximum, no history); A alone if a
quick fix is wanted first.

## The owner's choice
"Decision: C & D" — 27 November 2026, about 00:37 UTC, typed in PROCESS #20's session. To be built after the group A,
G1, G2, H, J, N merges (both change design parts 02, 04 and 06), so civicsmith's held work is not kept waiting for it.
