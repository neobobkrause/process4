# Size limits not kept, instructions in handovers, and a session's goal (27 Nov 2026, PROCESS #21)

The owner, in PROCESS #21's session, 27 Nov (conversation, unmarked): "Passing instructions in a handoff document is
problematic because those instructions can end up getting lost, diminished in value, or outright ignored. Every time I ask
about handoff document limits I'm told that they've grown beyond the agreed to limits. Why aren't the handoff size limits
being checked at the end of each session, and if a limit is exceeded a rigorous worker spawned to study what has changed (not
just added), identify text that isn't needed (like the historical notes found earlier), look rigorously for places where
wording can be made more concise without any degradation in meaning, then with that full understanding of what is in the
document set and the full set of opportunities for reduction, a plan for eliminating all unneeded text and editing of
necessary text to bring the text back within the defined limits. Explain what a session's goal is, how its goal is set and
managed, and how a session uses that goal during it's lifecycle."

## 1. Why the limits keep being passed

- The limits are rules held by text with no moment named to measure them. Design part 5 §1: texts are "kept below a
  measured maximum size"; §3: "Whenever they are changed, every effort is made to keep them short enough"; "The size of a
  role's starting text is a rule, not a refusal among the tool's tests." No text says who measures, when, or what follows a
  breach. PROCESS's starting text names none either.
- So sets are measured only when someone happens to: a cleanup (25 Nov), a split (C & D, 27 Nov, which found PROCESS over and
  cut the research index minutes later), or the owner's question. K1–K5 grew every role's set with no measure; handovers and
  the research index grow each session with no measure (`reading-sets-27nov.md`).
- Every text in every role's set from the process's side (design, build texts, starting texts, PROCESS's indexes and
  handover) is written only by PROCESS, in this repository. The growth always comes through a PROCESS change or a PROCESS
  handover, so PROCESS is where a measure can sit. ARCH's set also holds product texts (process config, ranking page, module
  list, requirements, decision records) that product sessions write; that half is not covered here.

## 2. His proposal, as it would sit in Process4 (option S)

- At each PROCESS refresh, before it asks for its successor, and before it puts any change of a text in a set to the owner,
  PROCESS measures every governing text and every role's reading set (each starting text's reading line, the starting text
  counted, as the record "What PROCESS reads in full" counts it) against the maximums. One script prints the table; seconds.
- Where any is over, PROCESS starts one worker with a fixed brief: (1) what changed in each over set since the last
  measure within the limits, by git, rewrites as well as additions; (2) text not needed: history, repetition, the same rule
  in two places, what the reading role never acts on; (3) every place the wording can be shorter with no loss of meaning;
  (4) a plan that removes all unneeded text and edits the rest to bring every set under, with the bytes each step saves.
- PROCESS trims its own handover and indexes itself. Changes to the design, build texts and starting texts are process
  changes: PROCESS puts the plan to him with the bytes, or he may give a standing word that a size-only edit that changes no
  meaning needs no further choice. That choice is his.
- The conflict: PROCESS's rule 2 and design part 6 §7, "A change must not add a new test, gate, review or stop", unless "the
  requirements changed with my explicit approval". The measure stops nothing and refuses nothing; it is a duty with a remedy,
  like the fill level's refresh. But it is a new check, so it needs his explicit word.
- Velocity: the measure costs seconds per refresh. The worker runs only on a breach. Unmeasured: how often a breach will
  come. The cost of not measuring is what this study and two earlier ones found: reading sets over the limit, so sessions
  read only part of what governs them (design part 1 §7, the second weakness).

## 3. Instructions carried in a handover (option H)

- In t3, "every module in order, conversions only" lived only in PROCESS #19's handover as "the owner's instruction at its
  coordinator", and civicsmith's record of his decisions does not hold it (`tranche-t3-study-27nov.md` §1). PROCESS #20
  passed it to him as fact. Design part 1 §4 already says "No session writes its own summary of his words as his", and the
  records of decisions keep his exact words (part 5 §5); the handover broke the first.
- The design never says what a handover may not hold. Part 4 §4: "What that role's successor needs to carry on".
- H: a handover carries no instruction or decision of the owner, and no summary of one. It names the record entry that holds
  his words, and the successor reads them there. An instruction he gave that no record holds is put to him again rather than
  carried. This corrects a gap and adds no check.

## 4. A session's goal

**In Process4 there is no thing called a session's goal.** No text of the design, build texts or starting texts uses the
word. What does that work:

| Session | What it is for | Where that is set | Who changes it |
|---|---|---|---|
| ROOT, watcher, coordinator, ARCH, PROCESS, a lane | Its standing duties: its starting text (who directs it, what it reads, every act it may take, its rules) | Written by PROCESS as a process change; given as the session's first prompt | Only PROCESS, on his word |
| The same, what it is working on now | The shared state (the round record: tranche, scope, round, modules with work; waiting work; standing notes), his decision records, and its handover | ARCH writes the round; the coordinator the standing notes and his record; each role its handover | Each record's one writer |
| A job | One module's work: the job block on its pull request (kind, requirements, flaws, notices) | Chosen by the tool (`next-job`), started by ARCH | ARCH adds notices or decided interface changes to the block |
| A walking session | The areas of one walk | The round record and the walk's issue, set by ARCH | ARCH |
| A worker | Its brief | The session that starts it | Nobody; it ends with its answer |

How a session uses it: it reads its starting text and governing texts once, at its start; it acts from the records; a
long-lived role, at 50% of its context, writes its handover and is replaced, and the successor starts again from the
records. Nothing shows a session its purpose again during its life. What a long-lived role takes to be "what we are doing
now" lives in its context and its handover, and drifts with them. And a tranche has no purpose at all by design: part 3
§1, "There is no single purpose to state … ARCH opens the tranche and decides its scope." His "housekeeping, conversions
only" had no place to be kept but his decision record, and no form the tool could follow.

**Claude Code's own `/goal`** (https://code.claude.com/docs/en/goal.md, read 27 Nov): "sets a completion condition and
Claude keeps working toward it without you prompting each step"; after each turn a small model judges the condition from the
conversation alone (it runs no tools) as not met, met or impossible, and a not-met reason is "taken as guidance for the next
turn". One goal per session, up to 4,000 characters; `/goal` shows it, `/goal clear` removes it; restored on resume; works in
`claude -p`. Not stated: whether it survives compaction, whether the working model is shown the condition again each turn,
and whether a session started by another session can be given one in its first prompt. Process4 does not use it. Nothing is
measured of it here; a study would need a trial.
