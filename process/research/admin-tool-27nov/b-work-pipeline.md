# Part B: the work itself: the tranche, the pipeline of jobs, the round, walks and release (27 Nov 2026, PROCESS #21)

A study for the administrator tool brief (`brief.md` in this folder). It covers what a mechanical tool could hold, carry
out or show about the work: the tranche's charter and plan, each job from ready to archived, the merge order, notices,
slots, blocks, replacement, the round's end and its account, walks, deployment, release, the mechanical edit, the dropped
tranche, ARCH's passing things on, and timings. It makes no recommendation.

**Read in full:** design `02-`, `02b-`, `03-`, `03b-`; build `01b-`, `02-`, `02d-`, `03-`, `03b-`; `tool/lib/round.mjs`;
`process/research/tranche-t3-study-27nov.md`. **Also read:** `status-from-the-system-27nov.md`, `sizes-handovers-goals-27nov.md`,
`job-reading-27nov.md`, `reading-sets-27nov.md`, `merges-held-for-notify-25nov.md`, `blocked-record-not-cleared-23nov.md`,
`wake-left-after-archive-22nov.md`, `held-requirements-23nov.md` (first half), `github-limits-account-27nov.md`,
`first-pass-figures-26nov.md`; design `01-` §7, `04-`, `04b-`, `06-` §3, `06c-`, `07-` §1 rows, `10-` §5; build `05-`, `05b-`;
starting texts `job.md`, `arch.md`, `coordinator.md`, `walking-session.md`, `root.md` (rules); `tool/lib/commands.mjs`
(`open`, `jobWaits`, `merge`, `nextJob`, `failedRunsCmd`); `process/handover.md`; the decision entries "The round…", "A job's
tests…", "The walks' five matters", "A record that outgrows one comment…", "Development velocity", "GitHub's limits"
(`design-decisions-2.md`), "A tranche opens…", "A tranche ends…" (`design-decisions.md`).

**Marks.** *Inference:* my reading, not stated by a source. *Unproven:* never shown to work. "The tool" means the p4
tool as it is; "an administrator tool" or "the admin tool" means what the brief explores, whatever shape it takes (a set
of p4 commands, a separate program, records). Times are UTC.

## 0. What the pipeline is today, and where each fact lives

| Stage of one job | Who acts now | Where the fact is kept | Time kept? |
|---|---|---|---|
| Module has work | Tool computes (`workOf`, round.mjs l.109) from requirements at the tranche tip, waiting work, round scope, converted set | Nowhere as a stamp; worked out afresh | No |
| Ready, takes a slot | `next-job` (one per call, 01b cmd 9) picks; ARCH calls it | Round record entry `{module, state:"open", pull_request:null, branch}` (commands.mjs `nextJob`) | No (record rewritten in place, no time per entry) |
| Branch, pull request, job block | ARCH runs `branch`, `open --module` (01b cmds 1, 3) | Branch; draft PR; job block comment (ARCH's) | PR `created_at` (GitHub) |
| Session started | ARCH, by the harness, with the text `open` printed | Harness only (name `<product> <module> #<n>`, product tag; part 4 §11, part 7 §1) | Harness only |
| Working, pushes | Job | Branch commits; job record comment (job's) for blocked/unblocked/nothing-to-change | Commit times |
| Tests | Job runs `p4 test` (cmd 27), background, ≤2 h | Test record comment (job's), rewritten in place: commit, result, `fails_total`, `written` | Last run only |
| Ready | Job runs `ready` (cmd 4), sends ARCH one message | PR not draft | GitHub timeline event (not read by the tool, *inference* from github.mjs) |
| Waiting to merge, on what | ARCH runs `merge` (cmd 6); it prints `waits for <module> (pull request <n>)`, exits 0 | Nowhere | No |
| Merged / closed | ARCH `merge`; job `close --nothing-to-change` | PR state | `merged_at`, `closed_at` |
| Notice worked out | ARCH runs `notify` (cmd 11), background | Notice comments on the merged PR; open users' job blocks; waiting work | No; an owed notice has no record (§B8) |
| Session archived | ARCH, by the harness (part 4 §5) | Harness only | Harness only |

So the tool already decides the stages that "have one right answer" (part 4b §1: slot, notice, round done), but the
pipeline's state is spread over the round record, three comments per PR, GitHub's PR fields and the harness, and the parts
the harness holds (which session runs which job, whether it is archived) are in no record at all. A program cannot be
assumed to call the harness's tools (brief, "the runtime"); 01b §4: "The tool cannot message a session: where the design
says 'the tool tells ARCH', the tool prints the line and the session sends it."

---

## B1. The tranche's charter: its kind, the owner's words, and its scope with a history

1. **Now.** Part 3b §1: "There is no single purpose to state and no owner review before it opens: ARCH opens the tranche
   and decides its scope, recording it where the tranche holds less than all the work." Part 2 §3 step 1: the scope is "a
   list of the requirements, or whole modules", in the round record, which "ARCH rewrites as the tranche goes on". Build 5
   §2 gives `scope: {tranche, holds}`; `scopeOf`/`workOf` (round.mjs l.57–121): a conversion is in scope where `holds` names
   its module or one of its requirements; "Notices, walk flaws and flaws a job reports are always work." The owner's words
   about a tranche live only in the product's decision record (coordinator) and reach ARCH as a message (coordinator rule 1).
2. **Holder and failures.** ARCH holds the scope; nobody holds a "kind". t3 study causes 1–3: "conversions only, every
   module" never reached civicsmith as a marked word before 02:52; the word that came (02:52) was read by ARCH #34 as
   "conversions only, plus the small fixes"; ARCH #32 added the next eight modules at 22:01 and then "widened the scope
   three more times on its own judgment" (t3 §2; 23:05 and 04:06 among them); ARCH #35 held three job flaws "since t3 is conversions only", against the design; "no scope form
   can say 'conversions only'"; PROCESS #20 told the owner, unchecked, that the instruction was in the round record. The round
   record is rewritten in place, so the scope's earlier forms and who widened it when are not kept anywhere (*inference*
   from build 5 §1 "rewritten in place"). `sizes-handovers-goals-27nov.md` §4: "a tranche has no purpose at all by design";
   "Nothing shows a session its purpose again during its life."
3. **What an admin tool would do.** Hold a charter: tranche name; a kind from a closed list the design would define
   (*inference*, e.g. `all-work` (today's default), `conversions-only` (option X in `process/handover.md`), `urgent-fix`
   (part 3b §7)); the owner's marked words verbatim with date and the decision-record entry that holds them; the scope
   `holds`; and a scope log (each change: time, ARCH, one line of reason). The kind feeds `workOf` (as X proposes). **State
   and writer:** the one-writer rule (part 4 §4) splits it: the owner's words and the kind fit the standing notes (the
   coordinator's record of "the owner's instructions now in force for running work", already read by the tool before every
   merge, part 4 §11) as a new note kind; the scope and its log stay in the round record (ARCH). The charter is then a view
   the tool prints from two records, not a new record.
4. **Trigger.** The coordinator writes the note on his marked word; ARCH writes scope changes by `state write round`; the
   tool reads both in `next-job`, `open`, `finished`, `round-done` (as it reads scope now); a `charter` print at ARCH's
   start and refresh, at `open` (into the job block, §B6), and for the coordinator's page.
5. **Pros.** His intent lives in the system, not in a handover or a transcript (cause 1; option H there); the kind is
   applied by the tool, not remembered by ARCH (cause 3); a scope log lets the round's account and the owner see each
   widening and its reason; a status about the tranche can be read, not recalled (option V).
6. **Cons and risks.** A closed list of kinds is design work, and each kind is a rule the tool applies; a kind that holds
   flaws back is a choice about what counts as work (like the scope, decision D of 24 Nov), but it departs from "notices,
   walk flaws and flaws a job reports are always work" and from part 3 §2 item 4 ("not the next tranche"), so it needs his
   word. The tool cannot read free text: someone maps his words to a kind. The coordinator "decides nothing about the
   product" (part 4b §1), so the kind is best named in his own marked word (*inference*). The round record grows by the log
   (60,000-character comments, split into parts, build 5 §1). Cause 4 of the t3 study (a conversion's stated types making the
   check refuse later modules' code, so flaw jobs appear) is not touched by any charter.
7. **Velocity.** One write per scope change, one per kind change; reads already made. The cost it avoids in t3: a round
   of fixes the owner did not intend (round 1 under ARCH #34 "opened no conversion at all"), and slots cut to 4.
8. **Text removed.** Instructions carried in handovers (PROCESS #19's line); part of ARCH rule 5 (≈350 bytes) would point
   to the charter. No design byte count can be given until the kinds are written.
9. **Test/gate/review/stop.** Adds none on a job; a kind is a filter on what counts as work, as the scope is.
10. **Interactions.** Is option X's carrier; feeds B2 (plan), B6 (charter lines in the job block), B7 (holds in waiting
    work), B12 (account), the coordinator's dashboard; supports V and H (`status-from-the-system-27nov.md`).

## B2. The build plan of the tranche and round

1. **Now.** No text defines a build plan. `next-job` picks one module per call, earliest in order (01b cmd 9; `rankReady`,
   round.mjs l.251). The round record lists the modules with work only as `next-job` last wrote them (`moduleStates`,
   l.216). The product's own plan (civicsmith's conversion plan §5) predates the coding standard; t3 study §5: "No text of
   Process4 or of the plan describes a tranche of conversions alone."
2. **Failures.** PROCESS #20 told the owner ARCH would "go on through the remaining modules in order" (wrong: the record
   held eight). Nobody could say before round 2 that earlier modules' fixes and told jobs would rank ahead of later
   conversions (t3 §3: "in a tranche of conversions in order, the earlier modules' fixes and checks always rank ahead").
3. **Admin tool.** A read-only `plan` print computed by the same functions `next-job` uses (`workOf`, `rankReady`,
   `slots`): every module with work in the order it would start, its kind, what waits beyond the scope
   (`not_this_tranche`), told modules, blocked ones, how many would start at once, and the count. No state; no writer. A
   snapshot at round open (ARCH writing the planned set into the round record) would also serve part 2 §4, which counts
   "every module that had work when the round opened, or was given work during it" (*inference*: `moduleStates` today keeps
   earlier entries by name, not a frozen opening set).
4. **Trigger.** ARCH at round open and after each scope change; the coordinator for the account and the page; PROCESS when
   asked (reading a product's records from the process repository: `state read --repository`, "where the harness allows",
   build 5 §1, *unproven*).
5. **Pros.** The owner and PROCESS see what the tranche will do before it does it; a statement about "what comes next" is
   read, not guessed.
6. **Cons.** A forecast only: notices, job flaws and walk flaws arrive during the round, so the order changes. `readView`
   reads every job PR's comments (K5 keeps merged kinds locally); at civicsmith's size after a sweep that was ~200 GETs a
   call before K5 (`github-limits-account-27nov.md`). No durations, so no time estimate without B17.
7. **Velocity.** None on jobs; seconds per print.
8. **Text removed.** "What is next" lines in ARCH's and PROCESS's handovers (no byte count readable here for product
   handovers).
9. None.
10. Uses B1's kind; feeds B12, the dashboard; with B17's durations could give a time forecast (*inference*).

## B3. The job ledger: each job's stages, times and session

1. **Now.** Part 2 §3 steps 1–8 name the stages; §0's table shows where each is kept. Part 4 §5: "A finished session is
   archived … The session that started a session archives it"; no moment is named (`status-from-the-system-27nov.md`). Part
   4b §9: "He can see each open job's progress and status without speaking to it." ROOT's rule 1 archives "every open job's
   session" at a restart, though no record names job sessions (the round entry has module, state, pull request, branch,
   `restarted`: round.mjs l.224, commands.mjs `nextJob`).
2. **Failures.** ARCH stated jobs archived that were not ("26 archive calls are in it; the 2 that were never made aren't";
   "I archive each job when it's done" became "every job is archived"); ARCH #34's notes kept "case-checker 1710 (ready…)"
   and dropped its session id (`status-from-the-system-27nov.md`, causes 1, 2, 4). The anomalies the caller names (merged
   not archived; open with no session) cannot be seen from any record: the first needs the harness's session list against
   PR state, the second the same (*inference*). t3 §3: "14 job sessions were open against 8 slots" was counted from sessions.
3. **Admin tool.** A ledger row per job: module, job number, kind, PR, and times for each stage, plus the session id(s) and
   archive state. Most columns can be **derived** from GitHub at read time (PR created/merged/closed; job block; job record;
   test record; timeline for ready) with no state. What GitHub does not hold: (a) the moment work appeared and the moment
   the slot was taken (the tool can stamp these itself, in the round entry `next-job` already writes); (b) the session id and
   archive (only ARCH knows; it would run e.g. `p4 started <pr> --session <id>` and `p4 archived <pr>` after the harness
   act, writing into the job block, which ARCH already writes); or (c) instead of (b), ARCH passes the harness's session
   list to a read-only command (`p4 jobs --sessions <file>`), which joins it to PRs by name and writes nothing. Test runs: the
   test record keeps only the last run (`fails_total` counts all), so per-run times need a stamp list (*inference*).
   **One writer** holds: the round record and job block are ARCH's; test and job records the job's.
4. **Trigger.** The p4 commands that already run at each stage stamp their own stage (`next-job`, `open`, `test`, `ready`,
   `merge`, `close`), so no session has to remember; the two harness acts need a command after them (a rule in text) or a
   session list passed in. A Claude Code `SessionEnd`/`SessionStart` hook could stamp a job's own session id and end, but
   whether project hooks run in these cloud sessions is unproven, and `.claude/settings.json` is the owner's file (brief).
5. **Pros.** Statuses come from the system (option V); handovers need not carry job lists or session ids (option H); the
   base for B4, B5, B10–B12, B17 and the owner's dashboard; ROOT's restart could archive from a list instead of a search.
6. **Cons and risks.** Writes: stamping `started` and `archived` is +2 content writes a job. At 8 slots and 20–30-minute jobs
   the account runs 184–352 writes an hour of 500 (`github-limits-account-27nov.md`, inferred there); 24 jobs an hour add
   ~48. K3 charges 10 per job opened; it would need raising (*inference*). Recording each merge attempt would add unbounded
   writes (case-checker: ten or more attempts) and is better printed than written. The job block is cut at 60,000 characters
   (build 5b §5); a session list is small. A session that does not run the stamp command leaves the same gap as today, but
   the anomaly is visible (B4). The tool reading each PR's timeline is untried (*inference* from github.mjs). Option (c)
   depends on the harness's list format.
7. **Velocity.** +2 writes a job (each ≥1 s apart, G1) or none with (c); saves ARCH's own reconstruction at each status and
   refresh; prevents idle unarchived sessions (cost unmeasured; they hold no slot, which counts PRs, round.mjs l.242).
8. **Text removed.** Job lists, session ids and "ready, waiting" lines in ARCH's handover (product handover not readable
   here; *inference* from ARCH #34's line); option A's refresh sweep in `status-from-the-system-27nov.md` becomes one read.
9. None: a stamp is a write, not a check.
10. Foundation of B4, B5, B8, B10, B11, B12, B17; serves the dashboard (part A/brief) and option V.

## B4. Anomalies: what looks wrong now, shown when asked

1. **Now.** No text lists conditions to look for. ROOT's hourly wake finds stopped sessions (part 4 §10). `round-done`
   prints each module's state (cmd 13); `next-job` prints slots in use.
2. **Failures.** case-checker #5 ready (tests passed 22:00, again 22:56 and 01:57 after notices at 22:04 and 01:48) and
   merged 03:49, "about six hours after it started", refused at ≥10 attempts, each time by a provider job ARCH had just
   opened (t3 §4); two sessions never archived (above); "slots in use 11 of 8" and 14 sessions for 8 slots, eight told jobs
   started above the number by rule (t3 §3); notices "owed" after `notify` ran out of memory, which "ARCH records" with no
   record form for it (`notify-out-of-memory-23nov.md` l.62; no form in build 5, *checked by search*); a watcher's
   scheduled wake left bound to an archived session (`wake-left-after-archive-22nov.md`).
3. **Admin tool.** A read-only print of predicates over B3 and the records: a ready job (test record stands) not merged
   after T, with its wait chain and when each blocking job opened (before or after the ready job's pass, the fact option Y
   turns on); merged or closed with a live session; open PR with no live session; live job session with no open PR; slots
   in use above the number, split into allowed told starts (part 2 §5) and others; a job PR with no job block (seen 25 Nov,
   "two jobs' pull requests opened with no block", decision "A record that outgrows one comment"); waiting work for a module
   that has an open job; a merge with no `notify` done (B8); a block whose blocker merged and that was not handed out again;
   a failed test record with no new run for T; a scheduled wake bound to an archived session (needs the wake list passed in).
   No state beyond B3.
4. **Trigger.** ARCH at each refresh and before it states a status; ROOT at its hourly wake (an existing defined point);
   the coordinator for the page; a `Stop` hook (unproven, above).
5. **Pros.** Shows what a transcript cannot (ARCH's causes 1, 3, 5: what did not happen, results that arrive elsewhere,
   what other sessions changed); turns "say plainly when I haven't checked" (ARCH's own conclusion) into one command.
6. **Cons.** Thresholds (T) are numbers the design does not have; "No number is a target" (part 3b §5). A ready job waiting
   is by design (part 2 §8), so it is information, not a fault. If any text made clearing every anomaly a condition for
   another act, it would become a gate; PROCESS's own reading of option S ("it is a new check, so it needs his explicit
   word", `sizes-handovers-goals-27nov.md` §2) applies to a duty to call it. Session and wake lists must be passed in by a
   session (harness-only).
7. **Velocity.** case-checker's hold would have been named at its first refused attempt (23:15) rather than found after
   six hours (*inference*); reads only.
8. Removes status reconstruction from ARCH; ROOT's "find a stopped session" becomes one join (*inference*).
9. Shows only; whether a duty to call it counts as a check is his to say (above).
10. Needs B3; complements V and A (`status-from-the-system-27nov.md`), B5, B8.

## B5. The merge queue: what is ready, what each waits on, and when to try again

1. **Now.** Part 2 §3 step 7 and §8: a job merges "once no job is open among the modules this one uses", directly or through
   others, at the tranche tip and the job's head; a blocked job holds no one. `merge` prints the waits, merges nothing,
   exits 0 (cmd 6; `jobWaits`, commands.mjs). ARCH rule 2: "where `merge` says it waits, merge again once it no longer waits."
   Merges are paced one a minute per repository (`merge`, GitHub's recommendation).
2. **Failures.** case-checker (above); t3 cause 5: "Nothing stops a new job starting on such a module while a ready job waits
   on it." ARCH's cause 3: "the step that should follow a merge was tied to a job's message, not to the merge." 25 Nov: nine
   ready jobs held while `notify` ran (`merges-held-for-notify-25nov.md`; fixed by option B, merging goes on).
3. **Admin tool.** A queue print: open job PRs whose test record stands, each with its waits and how long it has waited;
   and a form of `merge` that, after its own merge, names the PRs that no longer wait (it knows which module just merged),
   or merges each of them in module order, paced. No state (derived); with B3, wait times are kept. Every merge is ARCH's
   own act (part 2 §3), so the point at which a waiting job may become free is always inside ARCH's turn (*inference*), and
   a provider that closes unmerged (`close`, job's act) arrives as the job's message.
4. **Trigger.** `merge` itself (after each merge), `notify`'s end, each job's ready message, ARCH's refresh. A GitHub
   Actions workflow on `pull_request` closed could compute the same, but nothing it writes wakes ARCH unless ARCH is
   subscribed to PR activity (a harness feature; whether a product's approvals allow it, and its cost at ~200 PRs, unproven).
5. **Pros.** No ready job depends on ARCH remembering it; merges follow providers' merges at once.
6. **Cons.** Does not end the starvation case: a provider job opened after the ready job's pass still holds it (that is
   option Y, a design change pending his word). Merging several in one command takes a minute each (eight ready: eight
   minutes, inside the two-hour command limit); each merge needs its own `notify`, and parallel `notify` runs hit GitHub's
   secondary limit on 26 Nov (decision "GitHub's limits").
7. **Velocity.** Removes the delay between a provider's merge and the retry (t3's attempts were 2–40 minutes apart,
   *inference* from the listed times); the six-hour class needs Y as well.
8. ARCH rule 2's retry clause (≈80 bytes); handover "ready, waiting on" lines.
9. None: the hold exists already; this only says when it ends.
10. B3 (times), Y (what holds), B8 (`notify` after each merge), B17 (wait measures).

## B6. Job-specific instructions: the job block, the filled starting text, the charter lines

1. **Now.** Part 4 §11: starting texts are filled "with names and addresses only. A list (the work placed, the uses a
   notice carries, a walk's areas) stays in the pull request or the round record, which the text names." `open` writes the
   job block (module, work, kind, `meaning`, `uses`, `notices`, `not_this_tranche`; build 5b §5; cmd 3) and prints `job.md`
   filled with module, product, branch, PR and fetch line (`jobText`, commands.mjs). The job reads 12 texts (~177,379 bytes
   on 27 Nov, over the 175,000 maximum; ~85,212 never acted on: `job-reading-27nov.md`); "Decision: C & D" splits texts by
   reader.
2. **Failures.** The set over its maximum (above); "how it finds ARCH's address (no `state read` among its acts)"; its time
   limit "in one row of part 7 §1" (job-reading). In t3 the conversion jobs found real defects ("A conversion can't fix
   that") and reported them; nothing in a job's instructions said what the tranche was for (*inference*: `job.md` holds no
   tranche line; the block has none).
3. **Admin tool.** The block (or a print beside it) also carries the charter lines that bear on a job: the tranche kind and
   what it means for a defect the job finds (e.g. "report it; do not fix it here"), and `not_this_tranche` (exists); the
   rules for its kind only (conversion: build 2c and rule 2; told: rule 6 and `related`; ordinary: rules 3 and 5); the time
   a command may run; ARCH's current session (read from the roles record by the tool). Optionally the reading list by kind.
   **State:** none new; derived from the block, the charter (B1) and the roles record; writer ARCH's session through `open`.
4. **Trigger.** `open` at start and at each replacement (it re-prints for an open PR).
5. **Pros.** The owner's intent reaches each job without a relay; a job reads less; the same words for every job.
6. **Cons.** Filling rule lines breaks "names and addresses only" (part 4 §11), a design rule; kind-specific texts mean more
   texts kept in step ("two texts holding one rule drift", option B in `job-reading-27nov.md`, not recommended there);
   starting texts stay under 8,192 bytes and ten rules (part 4 §11). The block's 60,000-character cut applies.
7. **Velocity.** `job-reading-27nov.md`: ~58k tokens read at each job start today, ~38k after A or C; ≥4.2M tokens a pass
   of 204 modules. Charter lines add a few hundred bytes a job.
8. Up to 62,813 bytes a job (option A's figure) if reading by kind is taken; C & D already decided covers most.
9. None.
10. B1 (charter), C & D, B11 (replacement text).

## B7. Placing flaws, and the waiting work

1. **Now.** A flaw a job finds "goes to ARCH, which places it against that module" (part 2 §3 step 5); walk flaws: three
   outcomes (build 3 §6: a named module, the UX lane, set aside with one line); a flaw handed back twice "ARCH decides as a
   design question" (part 2 §4); a job blocked twice by the same module is an architecture bug (part 4 §10). Waiting work is
   ARCH's record (build 5 §2), written by `state write waiting-work --from <file>`, a whole-record rewrite (cmd 17); `open`
   copies a module's entries into the block and removes them; `notify` writes notice entries.
2. **Failures.** ARCH #30 marked six fixes "for later; no job starts", a status no form holds; ARCH #32 ran them first
   (t3 §§1–2). ARCH #35 held three job flaws against the design (§3). The record passed 65,536 characters with 1,937 entries
   and notices were lost (decision "A record that outgrows one comment"). No counter exists for "handed back twice" or
   "blocked twice by the same module" (`finished`, `blockOf` in round.mjs count nothing; *inference*).
3. **Admin tool.** Keeps the mechanics, not the choice: a `place` command that appends one entry (module, kind, source job
   or walk flaw, words or link, time) instead of ARCH rewriting the whole record by hand; a hold field set by the charter's
   kind (B1/X) with the reason; counts of hand-backs per flaw and of blocks per pair of modules, printed with the line part
   4 §10 already gives ("a design question"). **Writer** stays ARCH's session. **Judgment** stays ARCH's: which module, the
   document wrong or not, set aside or not, which interface change to name.
4. **Trigger.** ARCH's placement after a job's message, a conversion's report, or a walk read; `open` (exists).
5. **Pros.** No hand-composed JSON for a whole record (an entry dropped by a rewrite is silent; *inference*); a hold has a
   form and a reason; loops are counted, not remembered.
6. **Cons.** A tool change (PROCESS); each placement is still one write (no change in count); the counters read closed PRs'
   job records (reads).
7. Minor; avoids lost entries and repeated loops.
8. A sentence of ARCH rule 4; handover notes on held fixes.
9. None.
10. B1 (holds), B3, B12 (placements and set-asides in the account), B13 (walk flaws).

## B8. Notices and told jobs

1. **Now.** Part 2 §7 and cmd 11: `notify` per merge, background, ≤2 h; ARCH goes on merging; for a user with an open job
   it adds the notice to the block and prints "message the job of <module> (pull request <m>)", "which ARCH's session acts
   on"; for one with no open job, notice comments and a waiting-work entry. A conversion's merge tells no one. `ready` and
   `merge` refuse a job whose tests ran before its latest notice (build 5b §5; `jobWaits`), so a job that missed ARCH's
   message is caught mechanically at `ready`/`merge`.
2. **Failures.** Three fix merges each told ~199 modules, ~100 MB each; GitHub's secondary limit refused writes 22:10–22:50
   and ~01:08; slots cut to 4 (t3 §2; decision A ended it). Owed notices with no record (B4). Three parallel `notify` runs
   on 26 Nov (decision "GitHub's limits"). ARCH holding merges while `notify` ran (25 Nov; fixed).
3. **Admin tool.** A notice ledger per merge: `notify` not run, running, done, or owed with its reason; how many told; which
   open jobs need a message and whether ARCH sent it. **Writer:** ARCH's session (`merge` marks owed, `notify` clears, on the
   merged PR or in the round record). The message to the job stays a session act.
4. **Trigger.** `merge`, `notify`'s end or failure; B4 lists the owed.
5. **Pros.** An owed notice survives ARCH's refresh without a handover line; at most one `notify` at a time can be seen
   (*inference*).
6. **Cons.** +1–2 writes a merge; a `notify` cut by the session's end or the two-hour limit leaves "running" stale unless
   read with the session list.
7. Small; protects against a user merging unaware of a change it never got (its next job or a walk would catch it, part 2
   §3).
8. Handover lines like "three later merges owe notices" (`merges-held-for-notify-25nov.md`).
9. None.
10. B3, B4, B5.

## B9. Slots and the order

1. **Now.** Part 2 §5; `next-job` (cmd 9; `slots`, `chooseNext`, round.mjs l.242–281): slots in use are open job PRs not
   blocked plus live walkers; earliest in order first, the owner's `module-first` notes ahead; a told module earlier than
   the latest running job starts above the number. "Decided here: one job for each call … Costs: eight calls to fill eight
   slots." ARCH refills "in the same turn" (part 2 §3 step 8).
2. **Failures.** "slots in use 11 of 8"; 14 open against 8 at the halt, eight told above the number (t3 §3), by the rule,
   which has no cap. 23 Nov: blocks ARCH ended were counted as free slots; ARCH filled by hand (fixed by `--unblocked`).
3. **Admin tool.** The choice is already mechanical. Further: a fill print naming every pick for the free slots in one
   call; the above-number count and its grounds shown (B4); the slot holders from B3.
4. **Trigger.** After each merge, close or block; ARCH's turn.
5. **Pros.** Fewer calls (each reads the view and, since K1, writes only when the record changes).
6. **Cons.** "One judged act for each command" exists because of the permission checker (part 6 §4); a batch of starts
   would change that build choice. A cap on above-number starts would be a design change, not mechanics.
7. Up to seven fewer view reads per refill.
8. Small.
9. None.
10. B1 (kind changes what is work), B3.

## B10. Blocked jobs and the count of failed runs

1. **Now.** Part 4 §10: the third failed run brings a fresh session; the fifth records the module blocked and frees its
   slot. `fails_total` in the test record (build 5b §5); `failed-runs` prints the line for ARCH at 3 and 5 (cmd 15) only
   when ARCH runs it. A job blocked by another module writes `push --blocked`; ready again when that module merges, handed
   out once (`readyAgain`); `--unblocked` where ARCH ended the block. ARCH records the fifth-run block in the round record
   (`archBlocked`, round.mjs l.180), by a whole-record rewrite.
2. **Failures.** The block ARCH ended (23 Nov, three times; fixed). No failure of the failed-run count was seen in the
   files read (none seen).
3. **Admin tool.** `test` itself prints the third/fifth-run line in the job's output, so the job's message to ARCH carries
   it (*inference*: today only `failed-runs` prints it); a `block` command for ARCH's fifth-run record instead of a hand
   rewrite; the per-pair block count (B7).
4. **Trigger.** `test`; the job's message; B4.
5. **Pros.** The count cannot be missed by ARCH not asking.
6. **Cons.** Small tool changes.
7. Small.
8. Small.
9. None: the counts and their consequences are the design's.
10. B3, B4, B7, B11.

## B11. Replacing a job (fill level, failed runs, death)

1. **Now.** Part 4 §11: a job at the fill level pushes, tells ARCH, stops; "ARCH replaces it from the same branch". Part 4
   §5: replaced "with a new session that continues from the same branch and pull request". `open` re-prints the block and
   the same filled `job.md` for an open PR. A fresh session after two failed corrections "first works out why the
   corrections were made" (part 4 §10), but the filled text does not say it is a replacement or why (*inference* from
   `jobText`). Job sessions are named by job number (part 4 §11), so a replacement carries the same name (*inference*).
2. **Failures.** None seen specifically; the old session left unarchived is the same class as B3's (*inference*).
3. **Admin tool.** In B3's row, the list of sessions for the job with the reason for each (start, fill, third run, died);
   the printed text for a replacement names the session it replaces, the reason, `fails_total`, and, after failed runs,
   the instruction part 4 §10 already gives.
4. **Trigger.** `open` at replacement; the job's last message.
5. **Pros.** The replacement knows what it is; the old session's archive is tracked.
6. **Cons.** More than names and addresses in the text (part 4 §11); one write for the lineage.
7. Small.
8. None in texts; handover lines.
9. None.
10. B3, B6, B10.

## B12. The round's done-ness, and the account after each round

1. **Now.** Part 2 §4: the tool decides `finished` and `round-done` (cmds 12, 13); a blocked module's work "carries into the
   next round and is named in the account". Part 3b §4: the coordinator gives "the tranche's scope where one is recorded,
   jobs done, flaws found, flaws carried over, observations set aside, changes to the walks' documents, rewordings made, and
   cost where it can be read"; coordinator rule 7: "from what ARCH tells you"; ARCH rule 7: tell the coordinator "what the
   round's account needs". Build 3 §6: each set-aside flaw is named with its reason.
2. **Failures.** No round with walks has finished, so no account has been tested (part 3 §3 unproven). *Inference:* a scope
   history (B1) would have shown the owner each widening in t3.
3. **Admin tool.** An `account` print from GitHub and the records: scope and its log; jobs merged or closed in the round
   (needs round open and close stamps, which the round record lacks: it holds `round` as a number); blocked modules with
   reasons (`round-done` lines); flaws found and placed, observations and set-asides (walk issues and ARCH's placements);
   changes to the walks' folder (git log in the window); requirement lines whose text changed (git diff); cost "unmeasured".
   Collecting is mechanical. Judgment kept: whether a rewording changes what the product does (part 2 §2), and the plain
   one-line summary the coordinator gives.
4. **Trigger.** `round-done` printing `done` (ARCH), or the coordinator asking.
5. **Pros.** Removes one relay (ARCH to coordinator) and one memory; read from the system.
6. **Cons.** Needs round stamps; set-aside reasons need a fixed place (build 3 §6 names the account, not a record; ARCH
   writes area outcomes into the round record, build 3b §7); cost cannot be read.
7. Small; ARCH's time spent composing the account is unmeasured.
8. A clause each in ARCH rule 7 and coordinator rule 7 (≈170 bytes).
9. None ("Nothing waits on it", part 3b §4).
10. B1, B3, B7, B13, B17; the dashboard.

## B13. Walks: areas, walking sessions, the walk issue, the outcome

1. **Now.** Part 3 §§2–3; build 3 and 3b; cmds 19–23. `walk areas` lists candidates from changed modules' step headers and
   requirement endings, then users' areas (3b §2); ARCH adds or removes each with one line of reason and writes the areas
   into the round record before any walker starts. Walkers are recorded `live` until ARCH archives each (build 5 §2);
   at most as many as slots, external ones at most `walk.most_external_walkers` (3b §5). "Without flaws" is fixed: every
   area has a "walked to the end" line by its session, and every flaw is set aside (3b §7). "**The tool judges nothing.**
   ARCH writes the outcome".
2. **Failures.** None: "No walk of either kind has ever been made by a session" (part 3 §3). In t3 the owner decided that a
   conversion round names no area, so it has no walk and no deployment.
3. **Admin tool.** Mechanical parts: share the areas among sessions within the limits; track walkers live/archived and the
   areas not walked (for a fresh session, build 3b §7); compute the 3b §7 condition from the issue's fixed-form lines once
   ARCH's set-asides are recorded; print each walker's text (`walk text`, exists). Judgment kept: adding or removing areas,
   flaw or observation, placement, document wrong, a step using AI judged by reading (3b §5).
4. **Trigger.** `round-done` done → `walk areas` → areas written → `walk open` → `walk text` per session → walkers write →
   ARCH reads and places → outcome.
5. **Pros.** Fewer hand rewrites of the round record; the outcome follows a fixed rule rather than a recollection.
6. **Cons.** Computing the outcome reverses the decided "the tool judges nothing" (3b §7); everything here is unproven;
   deployment copies and their names are written by ARCH (3b §5) and would need stamps too.
7. Unknown; never run.
8. Some of 3b §7's text.
9. None, if it only computes what ARCH would write; deployment already waits for "without flaws" (3b §7).
10. B14, B12, B3 (walkers as rows like jobs).

## B14. The round and tranche lifecycle: what comes next, deployment and release preparation

1. **Now.** Part 3 §2: jobs, internal walk, deployment only when it lists no flaw, external walk; flaws to named modules
   next round. Part 2b §9: the mechanical edit is merged "once, when no job is open, between a round's last merge and its
   internal walk". Part 3b §5: the tranche ends when a round's partial walks both come clean; ARCH merges it into main by
   PR; the tranche report. Part 3b §6: release only after an install and an update are "run and confirmed successful";
   ARCH prepares unpublished; the owner's marked approval typed in ARCH's session; `release prepare`/`publish` (cmds 7, 8).
   Build 3b §5: one copy per external walker, removed, deployed afresh and seeded each round.
2. **Failures.** None of these paths has run (part 3 §§3, 6 unproven). *Inference:* a round with no area (the owner's t3
   decision) has no walk, so it cannot meet "both come clean" as written; whether such a tranche ends, and how, is not
   stated in part 3b §5.
3. **Admin tool.** A phase print derived from the records: jobs not done; done and the mechanical edit pending or merged;
   areas not written; internal walk open or with an outcome; copies deployed (needs stamps); external walk; tranche-end PR;
   release prepared; install and update confirmed (no record form holds these today, *inference*); approval words. Each
   with the commands of the next acts. The judgment of what goes into a release's notes stays ARCH's.
4. **Trigger.** ARCH's start and refresh; `round-done`; each walk's close; a version move "at the next round boundary"
   (part 3b §1) needs the boundary known.
5. **Pros.** A successor ARCH starts "only from the shared state and the repository" (part 4b §5) and finds where the round
   is; fewer phase lines in handovers.
6. **Cons.** Phases not recorded today must be recorded (deployment, install, update), so new fields and writes; the phase
   print risks restating the design in code (*inference*); unproven paths.
7. Unknown.
8. Part of ARCH rule 4 and handover phase lines.
9. None if it only prints.
10. B12, B13, B15, B17.

## B15. The mechanical edit and the dropped tranche

1. **Now.** Mechanical edit: "A worker in ARCH's session makes it as one change covering every affected module … merged
   once, when no job is open, between a round's last merge and its internal walk. ARCH's session tests it" (part 2b §9).
   Dropped tranche: `drop --tranche` restores code and test files and uses files (cmd 26); then ARCH runs `ready` and
   `merge`, "closes the tranche's open jobs unmerged, clears the round and waiting-work records, and puts back 'not yet met'
   only on each requirement whose met mark came from the dropped tranche" (part 3b §5), each by hand.
2. **Failures.** The t1 drop (24 Nov) was made before the command existed and ran every module whole (decision "A tranche
   ends"); none since.
3. **Admin tool.** Edit: show when no job is open and the round's jobs are done (the window), and the edit's PR status; the
   tool holds no lock (*inference*: a lock on `next-job` would be a stop). Drop: compute the requirements whose `[met]` came
   from the tranche (lines changed from `[not yet met]` to `[met]` between main and the tranche branch, a git diff), list the
   open job PRs to close and the records to clear; the requirement-text PR is ARCH's file (part 4 §11) and stays its act.
4. **Trigger.** `round-done` done (edit); `drop` (drop's finish).
5. **Pros.** The drop's four hand steps become one listing; fewer misses.
6. **Cons.** Rare events; a tool change for little use.
7. Negligible.
8. Small.
9. None.
10. B14.

## B16. ARCH's passing things on

Part 4b §1: "The share of ARCH's work that is passing things on is measured on the first tranche" (also part 10 §5); not yet
measured. From ARCH's starting text and the design, the relays, and what a mechanical tool could take:

| Relay | Now (source) | Mechanical part | Stays with a session |
|---|---|---|---|
| Start a job with the printed text | rule 2; cmd 3 | Text and block (exist); session id into B3 | The start (harness) |
| Tell an open job of a notice | rule 2; cmd 11 | Block updated (exists); `ready`/`merge` catch a missed message (exists); sent or not in B8 | The message |
| Retry a merge that waited | rule 2 | B5 | — |
| Refill the slot | rule 2 | `next-job` (exists); fill print (B9) | Start |
| Replace at fill level / third run | rule 2; part 4 §10 | Lineage, text (B11); third-run line (B10) | Start, archive |
| Archive a finished session | part 4b §5 | List of what to archive (B3/B4) | Archive (harness) |
| Place a job's flaw | rule 4 | Entry form, counts (B7) | Which module |
| Give unwalked areas to a fresh walker | rule 4; 3b §7 | List (B13) | Start |
| Stop: interrupt each job; lift: wake or replace each | rule 6; part 4 §10 | List of live job sessions (B3) | Interrupt, wake (harness) |
| Tell the coordinator each decision, one line | rule 7 | The coordinator can read ARCH's decision record (a repository file, build 2 §8) and its `Decision` line (*inference*) | — |
| Tell the coordinator the round's account | rule 7; coordinator rule 7 | B12 | The plain summary |
| Pass the owner's marked words given to a lane, exactly | rule 7 | None: they are in no record (*inference*) | The relay |
| Pass a process fault to the coordinator unchanged | rule 8 | A fault could be a fixed-form entry rather than two relayed messages (*inference*; no record holds faults; a job writes no record, build 5 §1) | The judgment that it is a fault |
| Pass release approval words to the coordinator | rule 6; part 3b §6 | `release publish` prints them (cmd 8) | The relay |

- **Pros/cons in common.** Every act on a session (start, message, interrupt, archive) is a harness act, and the tool cannot
  make it (01b §4), so a mechanical tool holds the list, the content and whether it was done, never the act. A relay replaced
  by a record the receiver reads removes a message and a memory, but each new record has one writer and costs writes.
- **Velocity.** Unmeasured; the tranche report is to give "the overhead share" and "ARCH's idle time while work was ready"
  (part 3b §5).
- **Gate?** None of the above.
- **Interactions.** B3–B13 are each one row's mechanical part.

## B17. Velocity measures: what timings could be recorded

1. **Now.** Part 3b §5: one tranche report "only from what git and GitHub already hold: time, work done and left, anything
   deferred and why, cost where it can be read … the overhead share, ARCH's idle time while work was ready, the owner's
   minutes"; "No number is a target. Nothing reads the report to decide anything." The conversion report holds "time from
   opening" (build 5b §5). Decision "Development velocity": every choice weighs time and cost at the product's real size.
2. **Failures.** The first-pass figures were gathered by ARCH from jobs' reports and session records by hand ("Merged-file
   counts exceed three jobs' own reports: not investigated"; durations 6–103 min, $1.74–$51.67 a job:
   `first-pass-figures-26nov.md`); t3's timeline was rebuilt by six workers reading transcripts (t3 study, "Sources").
3. **What could be recorded, and from where.**

| Measure | From GitHub, free | Needs a tool stamp | Needs the harness (passed by a session) |
|---|---|---|---|
| Work appeared → slot taken (queue) | — | `next-job` | — |
| Slot taken → PR opened | PR `created_at` | `next-job` | — |
| PR opened → session started | — | — | session created |
| Started → first test; each test run's length and result | last run only | `test` start/end per run | — |
| Failed runs | `fails_total` | — | — |
| Ready → merged, and each wait (on which provider, opened when) | ready event, `merged_at` | each `merge` refusal (print, or write) | — |
| Merged → `notify` done; modules told | — | `notify` | — |
| Merged/closed → archived | — | — | session archived |
| Slots used over time; idle slots while modules were ready ("ARCH's idle time while work was ready") | — | `next-job`, `merge` | — |
| Round open → jobs done → walks → deployment | — | round stamps | walker sessions |
| Content writes an hour | — | each machine's pace file (local, per machine: `github-limits-account-27nov.md`) | — |
| Cost | — | — | not readable (part 3b §5 "unmeasured") |

4. **Trigger.** Each p4 command at its own stage; a `report` print at round and tranche end.
5. **Pros.** The report the design asks for becomes a print; velocity is measured, not estimated; case-checker-type waits
   are counted (wait per provider).
6. **Cons.** Stamps are writes (B3's +2 a job, more if each test run and merge attempt is written); measures must stay
   information (part 3b §5), or they become targets; harness times need a session to pass them.
7. The measures cost writes; they enable every later velocity choice to be made on figures.
8. None.
9. None.
10. B3 underlies it; B2's forecast and B12's account use it.

---

## Cross-cutting facts for the synthesis

**Where the state could live (facts for the storage question).**
- Derived afresh from GitHub and the existing records: B2, B4, B5, B9, B12 (mostly), B13 (mostly), B14 (mostly), B15. No new
  writer, no writes; cost is reads (5,000 an hour primary; `readView` reads every job PR's comments, merged kinds cached
  locally since K5).
- Stamps written into existing one-writer places: B3 (round entry by `next-job`; job block by ARCH; test record by the job),
  B8, B11, B17. Each stamp is a content write within GitHub's 80 a minute and 500 an hour for the whole account (part 6 §3).
- New fields in existing records: B1 (a standing-note kind, coordinator; scope log, ARCH), B7 (hold, counts).
- A branch never merged, instead of issue comments: every stamp would be a push (GitHub recommends 6 a minute per
  repository); process3 wrote ~143–173 pushes an hour before its suspension on 6 Nov, and a shared ledger on a branch (G3)
  was judged at ~144 pushes an hour, "the pattern before process3's suspension" (`github-limits-account-27nov.md`).
  *Inference:* B3's stamps alone at 24 jobs an hour would add ~48–100 pushes an hour on such a branch.

**Defined points that already exist** (where a mechanical tool could be called or could print, with no new stop): a
session's start (starting text's first acts); `open` (each job start and replacement); each p4 command at its stage; ARCH's
merge (every merge is ARCH's own act); `notify`'s end; `round-done`; ROOT's hourly wake; each refresh (handover written);
`walk close`; `release prepare`. Points that are unproven: Claude Code project hooks in these cloud sessions; PR activity
subscription for product sessions; GitHub Actions writes as a separate writer (whose writes may or may not count toward the
account's content limit: not verified).

**What stays with AI (judgment), and why.** Which module a flaw belongs to, and whether the document or the product is wrong
(build 3 §6); setting a flaw aside; the scope's contents (which requirements and modules), until the owner names a kind;
every interface decision and the order of changes that land together (part 2 §8); ending a block by a list or boundary
change (part 2 §8); adding or removing walk areas where a change's effect is in doubt (part 3 §3); flaw versus observation,
and an AI step's result judged by reading (3b §5); whether a rewording changes what the product does (part 2 §2); the
code, tests and steps; the plain-words summary to the owner; release notes. Each needs reading meaning, which the tool's
fixed-form reading cannot do. Mapping the owner's free words to a tranche kind is also judgment, unless he names the kind
himself.

**What no mechanical tool here settles.** t3 cause 4 (conversions' stated types making the check refuse later modules'
code, so flaw jobs and their notices appear): a design question (ARCH's decision 1738 in civicsmith; the check's refusal (b)
here). The starvation of a ready job by newly opened provider jobs: option Y's rule, which B5 only makes visible.
