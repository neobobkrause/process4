# Cleanup audit of the last 36 hours (25 Nov 2026, PROCESS #14)

Asked by the owner on 25 Nov ~13:20Z (conversation, in PROCESS #14's session): "I'm concerned that new rules are being added
rather than existing rules being updated. I need you to study the changes to process4 during the last 36 hours to assess
whether they've been done correctly, study whether limits have been exceeded, and propose whether process4 needs to be
cleaned up a bit before we take on any further improvements."

Window: main from `3b80c61` (the last merge before 24 Nov 01:20Z) to `4437ecf`, 73 merges. Five read-only workers, one per
area; their full findings, each with file:line and a one-line fix:

- `design.md` — design parts 00–10: 9 merges, 3 clean, 6 not; 26 findings (5 contradictions, 7 stale, 4 appended, 3
  duplicates, 2 history, 5 over-detail, no new gate).
- `build.md` — build texts 01, 01b, 02b, 05: 34 findings (10 appended, 3 duplicate, 6 contradiction, 15 stale, 8 history
  build-up, 3 mismatch with the tool, 2 gates the design approves but 01b's preamble denies). The tool still matches the texts.
- `starting-texts.md` — arch.md +22% and job.md +18%, every change a clause appended to a rule; ARCH rule 6 now five
  subjects; acts taken but not named (a job merging the tranche in; ARCH writing the workflow copy); lane, ROOT, coordinator
  disagreements with the design; the index's prose stale (figures exact). The job/ARCH first-comments conflict is civicsmith
  ARCH's own standing rule, not a Process4 text; its cause is choice 2.
- `records.md` — the decision record: 13 entries added, none rewritten in place; 64 entries are 31 subjects (the notice
  alone: 9 entries in three files); 6 stale "rules as they now stand"; window entries about half narrative. Consolidated by
  subject with every owner word kept: about 63,000–70,000 bytes, from 111,940.
- `tool.md` — size-cutting done in three places with three measures (one `fail`s a whole notify for size, against "refuses
  nothing for size"; one holds back an open job's notice, against "reaches that job at once"); "needs no test record" decided
  three ways; the job block read six ways; three resolvers for own-name imports; dead code; history in comments. A 9-item
  cleanup list, sized and rated. Note: the 6B patch (`../waiting-work-record-size-25nov/6b.patch`) would add a fourth
  size-cut; rework it onto one fitting function.

## Limits (measured by PROCESS #14, 25 Nov ~13:25Z)

- Every single text is under 60,000 bytes; every starting text under 8,192 bytes and ten rules. Tightest:
  `design-decisions-2.md` at 59,740, which is why every new decision went into a new entry in a third file.
- Reading sets (design part 5 §2: 175,000): ARCH 161,813 and a job 173,749 (169,383 filled, by the worker's count),
  before each reads the product's own files — so likely over in practice; the job's grew ~9,300 in one day. Coordinator
  137,702; ROOT 107,082; watcher 105,901; lane 94,195; walking session 88,889.
- **PROCESS: about 300,000** (design 126,890; build 05 23,346; the three record files 111,940; READMEs and research index
  18,841; handover 12,586; its text 6,179) — past 175,000 and past the 220,000 ever measured to be read whole. On 22 Nov it was
  about 211,000 and was left as it stood. A refreshed PROCESS starts at about 30 percent.

## Why it happened

1. Every change answered a live fault on civicsmith, under time pressure, and was made as the smallest edit at one place.
   The rule "an architecture bug is corrected by rewriting the part it belongs to, never by appending" (design part 1 §6) is
   held by text alone, and was not kept: the old statement elsewhere was not searched for and rewritten.
2. The record pushed toward adding: its second file had 260 bytes of room, and its header says the third "takes each new
   one", so a decision on an existing subject became a new entry.
3. PROCESS's own reading set past the maximum means each PROCESS reads less carefully than the rules assume.

## Options

- **A. No change.** Go on fixing faults as they come. The drift compounds: each later change starts from texts that
  disagree with each other.
- **B. Clean up first, changing no rule and no behaviour, except where a text or the tool breaks a rule the design already
  states (recommended).** In order, one pull request per area, each change named:
  1. The record consolidated by subject (64 entries into about 31), every owner's dated word kept verbatim beneath its
     subject; fix narratives replaced by one line of why and a pointer to research. Its header says a decision rewrites its
     subject's entry.
  2. The design: the 26 findings rewritten in place, each rule once in its home section; tool detail moved to build texts.
  3. The build texts: 01b commands 4, 6, 11, 01 §5, 05 §§2, 5–7 rewritten in place; dated clauses out (they are in the record).
  4. The starting texts: rules re-split by subject, acts taken but unnamed named, disagreements with the design corrected,
     index prose brought up to date; each still under 8,192 bytes and ten rules.
  5. The tool, behaviour-preserving items: one fitting function (which also corrects the two size faults against the design),
     one "needs a test record" rule, one job-block reader, dead code removed, comments saying what the code does. 6B is
     rebuilt on the one fitting function.
- **C. B's texts only (1–4); the tool later.**

A separate choice, because it changes what PROCESS reads (its starting text): **PROCESS's reading set.** Even consolidated,
it stays about 255,000. (i) No change. (ii) PROCESS reads the design and its handover in full, and the decision record,
build text 5 and research through their indexes, opening an entry when a question touches it (as a lane reads research);
the design is the governing statement, kept up to date with each decision; this brings it to about 168,000, under the maximum but with little room, so the handover and research index are kept short too (recommended).

Ordering with the urgent items: civicsmith loses notices while choice 6 waits, so 6B (rebuilt on the one fitting function)
goes first; then the cleanup; then choices 2 and 5 are built onto the clean texts.
