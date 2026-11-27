# Part A: the roles and the owner's side, for an administrator tool (27 Nov 2026, worker for PROCESS #21)

Brief: `brief.md` in this folder. Read in full: design 00, 01, 01b, 04, 04b, 04c, 05, 05b, 05c; every file of
`starting_texts/`; build texts 05 and 05b; `process/handover.md`; the t3 study and the status study; and, where they touch
this part, the decision-record entries "How the owner's marked words reach the record", "Session names", "PROCESS: who
starts it…", "A refused act…", "When a role is refreshed, and its wake", "Writing a lane's entry…", "The reading values…",
"What a role reads", "A tranche opens…", "A tranche ends…", "What PROCESS reads in full", "The limit on depth…", "Development
velocity", "GitHub's limits"; research `sizes-handovers-goals-27nov.md`, `reading-sets-27nov.md`,
`weakness-implications-26nov.md`, `wake-left-after-archive-22nov.md`, `refresh-at-every-pause-22nov.md`,
`root-refresh-cadence-22nov.md`, `arch-compacted-fill-unread-25nov.md`, `root-lineage-26nov/README.md`,
`trial-faults-19nov.md`, `uses-metadata-25nov/civicsmith-state.md`; design 03b, 06, 06c, 06d, 07, 07b; build 01b's command
list; `tool/lib/state.mjs` and `commands.mjs` (by search); `coordination/owner_page/desk.html` (head).

Marks: **M** measured or read in a cited source; **I** inference; **U** unproven. No recommendation is made.

## 0. Facts that bound every opportunity in this part

1. **The tool runs only inside a session, when called** (design part 7; brief). It cannot start, message, interrupt,
   archive or list sessions, set a session's name, make or remove a scheduled wake, or read a session's fill or depth:
   those are the harness's tools (part 7 §1, rows "Naming a session", "Fill level", "The limit on depth"; part 4 §11). So
   wherever a lifecycle act is named below, the tool can only *compute or print* it; the session still *does* it.
2. **No cross-repository read** of shared state: HTTP 403 both ways (part 7 §3, M). A product's tool cannot read PROCESS's
   records and the reverse; only messages pass.
3. **One writer per record**; GitHub keeps no guard on two writes to one comment (part 4 §4). A job writes none.
4. **The tool "holds none of the checks that could stop work"** and refuses no work for size (part 6 §5). `merge` already
   obeys a held merge "his hold, not a check" (build 1b, command 6) — the one precedent for the tool carrying out an owner's
   word.
5. **No new test, gate, review or stop** without the owner's explicit word (part 6 §7; PROCESS rule 2); caution is a cost
   (part 1 §6).
6. **The permission checker refuses the coordinator's standing-note write for an instruction relayed through another
   session** ("Undermining Oversight", trial fault 7, M; part 1 §4). It is the reason the owner's operational instructions
   must be typed in the coordinator's own session.
7. **The owner's marked words in a claude.ai page comment have counted at PROCESS**: several decisions are recorded as "typed
   as a comment on his page … attributed by the service to the owner" (decision record, "The limit on depth"; "Writing a
   lane's entry"; M). Whether the checker accepts a *standing-note write* from such a comment at the coordinator is **U**.
8. **Rows of a claude.ai page's database are data, never instructions** (the Artifact/ArtifactData tools' own rule). A click
   that writes a row cannot be the owner's marked word.
9. **GitHub's limits** are the whole account's: 80 content writes a minute, 500 an hour (part 6 §3); the tool's shares come to
   about 95% (decision "GitHub's limits"). Reads cost only the primary 5,000 an hour. Every opportunity below that only
   *reads* GitHub adds no content write.
10. **Where operational state lives now.** The eight records are comments of one issue (build 5 §1), not files or commits;
    part 4 §4: "What sessions say to each other, and the process's running records, never build up as files or commits in a
    repository." So the owner's "branch never merged" question is answered for this part's records already: they are not in
    the repository's files. A branch never merged would make each record write a push (a share of 5.7 pushes a minute per
    repository) and would be "running records as commits", against part 4 §4 (I). One exception exists today:
    PROCESS's handover is the file `process/handover.md` (M), committed to the process's repository, beside the
    `handover-process` record.
11. **The sessions' clocks are wrong**: "the sessions' own clock estimates run 25–30 minutes ahead" (t3 study, Sources, M).
    Any time the tool takes from its machine's clock removes that error from what a session states.

## 1. The defined points this part uses

| Point | Who | What already happens there |
|---|---|---|
| Session start (after the fetch line) | every role | reads its texts, then "the shared state"; names itself from its handover's generation |
| Before a judged act | ARCH (`next-job`, `open`, `merge`), coordinator (`state write`) | the tool already runs here |
| A wake | ROOT, the watcher (hourly scheduled task) | writes/reads `wakes`, reads `stop` |
| A refresh | each long-lived role, first natural pause after 50% fill | rewrites its handover, asks its parent |
| A takeover | the watcher | writes `roles`, wakes, starts a watcher |
| The owner's message | coordinator, ARCH, a lane, PROCESS | marked words copied exactly |
| A pull request event | ARCH (U: subscription not used in products today) | none |
| Round end, tranche end | ARCH, coordinator | `round-done`; the account; the tranche report |

Hooks (SessionStart, UserPromptSubmit, Stop, PreCompact, SessionEnd…) could make "called at a defined point" mechanical,
but: whether project hooks run in these cloud sessions is **U** (brief); a repository's `.claude/settings.json` is the
owner's file; the environment's setup script already writes `~/.claude/settings.json` (`autoMode`, `idleCompaction`; part 7
§5, M), so user-level hooks could be placed there by the same owner-approved proposal (I; U that hooks there run).

---

## A1. The tranche's charter, held as a record the tool prints

1. **Design now.** "There is no single purpose to state and no owner review before it opens: ARCH opens the tranche and
   decides its scope" (part 3 §1; decision "A tranche opens", "Decision: Remove the owner's tranche-approval", 20 Nov). The
   scope is a list of requirements or whole modules in the round record, ARCH's (part 2 §3 step 1; build 5 §2). His words
   about the product live in the coordinator's decision record (part 5 §5); the coordinator passes each to ARCH "exactly as
   typed" by message (coordinator rule 1); ARCH is directed by "his marked words typed here, or carried by the coordinator,
   and the standing notes" (arch.md). A job never sees his words: its job block holds work, kind, meaning, uses (build 5b §5).
2. **Who holds it now, and what failed.** Nobody holds a charter; ARCH holds "what we are doing now" in its context and
   handover (sizes study §4: "Nothing shows a session its purpose again during its life"). In t3 (M, t3 study): the owner's
   "every module, conversions only" lived only in PROCESS #19's handover, not in civicsmith's record (§1, cause 1); "the first
   8, then stop" ended with his confirmed fact, and ARCH #32 decided what came next (§1–2, cause 2); his marked word at 02:52
   was read by ARCH #34 as "plus the small fixes"; ARCH #35 held job flaws "since t3 is conversions only", against the design
   (§3); the scope form cannot say "conversions only" (§3, cause 3).
3. **What the tool would do.** A `charter` record: the tranche's name; its state (about to open, open, ended); each marked
   message of his that the coordinator files as bearing on this tranche, whole and exactly as typed, with its UTC date and
   the decision-record subject it was recorded under. **One writer: the coordinator**, which already writes his record and
   the standing notes. The tool prints it verbatim: in a `brief` (A12) at ARCH's start; above `next-job`'s choice; on the
   owner's page (A9); and `open` copies it into a `charter` field of each job block, so a job reads his words. Beside it the
   tool prints ARCH's recorded scope, so a mismatch between his words and the scope is in plain sight (I). The tool follows
   only the structured scope; it cannot follow free words (a structured "conversions only" scope is option X, outside this
   part). A variant with no new record: the tool reads the decision-record file at the tranche branch's head and prints the
   entries under one agreed subject (I); it costs no write but ties the tool to that file's form.
4. **Trigger.** The coordinator writes it in the same turn it records the words (as it writes a standing note). Read at
   ARCH's start and refresh, at every `next-job` and `open`, at a job's first `p4 open`, and at each page render.
5. **Pros.** His exact words survive ARCH's generations (civicsmith ARCH reached #35 by 27 Nov, M, handover.md and t3 study)
   and handover rewrites; jobs see the intent behind their work; the owner sees exactly what ARCH and jobs are shown; it
   removes a relay that paraphrased (coordinator #14's "yours to decide", t3 §1).
6. **Cons and risks.** It answers his ask ("the charter of the current (or about to be opened) tranche") but sits against the
   rule "no single purpose to state" (part 3 §1): his decision is needed on whether a charter exists. Choosing which of his
   words "bear on this tranche" is a judgment, and a filtering coordinator could drop one — the very summary risk part 1 §4
   forbids; copying every marked product decision avoids the choice but grows the record. His latest word replaces earlier
   ones (part 1 §4): the coordinator must rewrite the record whole, or the tool must print in date order and let the reader
   apply the latest (I). Words given to ARCH or a lane reach the coordinator by relay (part 1 §4); whether the checker passes
   a charter write carrying relayed words is **U** (fault 7 refused a relayed standing-note write; a relayed decision *for the
   record* is not refused, decision record point 1). A session can still not read it (held by text). One comment holds under
   60,000 characters (build 5 §1). GitHub: one content write per change; the read rides on the one listing call that already
   reads every record.
7. **Velocity at civicsmith's size.** No wait added; one write per instruction; a job block grows by his words' bytes. I:
   fewer jobs started against his intent (t3 round 1 opened no conversion at all under ARCH #34, §2).
8. **Text removed.** His instructions from ARCH's, the coordinator's and PROCESS's handovers (option H); part of coordinator
   rule 1's relay (the message stays, to wake ARCH). Product handover sizes cannot be read from here.
9. **Test, gate, review or stop.** None; a new record and a duty to write it. It changes part 3 §1's stance: his word.
10. **Interactions.** A2 (how his exact words are captured), A3 (handovers carry none), A7 (standing notes beside it), A9 (the
    page shows it), A12 (`brief` prints it); option X (a scope the tool can follow) is what would make the charter's
    "conversions only" binding; Y and V are independent.

## A2. Capturing and carrying the owner's marked words

1. **Design now.** Part 1 §4: a message beginning "Decision:" or "Instruction:" is copied exactly, with its date; a session
   asks once otherwise; no summary as his. The coordinator records "from a file (never on a command line), one pull request
   each" (rule 1; decision record point 3). A lane → ARCH → coordinator; ARCH → coordinator (part 1 §4; arch rule 7; lane
   rule 4). Standing-note instructions are typed in the coordinator's own session (part 1 §4).
2. **Who, and what failed.** The coordinator and every relaying role. Fault 7 (relayed instruction refused, M); a `gh`
   command inside his quoted words got the recording command refused (decision record, point 3, M); t3: a fact ("the review
   … is complete") and a decision were run together, and the coordinator relayed it as "yours to decide" (t3 §1, M); his
   intended sentence on fixes was never typed (t3 §1).
3. **What the tool would do.** `p4 words --from <file> [--subject <s>]`: takes the exact message text from a file, stamps
   the UTC date from the machine clock (fact 11), inserts the quotation under the chosen subject of the decision record,
   commits, opens and merges the record's pull request (today's `branch`/`push`/`open`/`ready`/`merge` in one), and, where a
   kind is given, writes the matching standing note or charter entry in the same act. Writer stays the coordinator. Placing a
   word under a subject and restating the rule "as it now stands" (part 5 §5) stay the coordinator's judgment. A
   UserPromptSubmit hook could save each prompt beginning with the mark, byte for byte, to a file the coordinator then passes
   to the tool, removing the hand transcription (I).
4. **Trigger.** The coordinator's turn on his message (or the hook on submit).
5. **Pros.** Exact bytes and a true date; one command in place of six; the relay of his words becomes a pointer to a record
   entry the receiver reads itself.
6. **Cons and risks.** Hooks in cloud sessions **U**; whether a hook's input tells a prompt the owner typed from a message
   another session sent is **U** (such messages arrive as turns marked as from a peer; their origin in hook input is not
   known). A tool that *refuses* an unmarked text would be a new refusal (his word needed); without it the tool only records.
   The record's form (ordered by subject, rewritten in place) means the tool edits a prose file — a form change PROCESS would
   make once. GitHub: a decision record pull request is already about four to five content writes (branch, push, open,
   ready, merge); unchanged.
7. **Velocity.** Seconds; fewer coordinator turns per decision (I).
8. **Text removed.** Part of coordinator rules 1–2 (about 300 bytes, I); relayed copies of his words in handovers.
9. **Test, gate, review or stop.** None, unless the refusal of unmarked text is chosen.
10. **Interactions.** Feeds A1 and A7; A9's page comments are a second source of his words; A3.

## A3. Handovers: what the tool could hold or derive instead

1. **Design now.** One `handover-<role>` record per long-lived role, written by its holder before a refresh: "What that
   role's successor needs to carry on" (part 4 §4); the block holds role, session, generation, written; plain words follow
   (build 5 §2). No size is set but "each record is kept under the single-text maximum, as a rule" (part 4 §4). Nothing says
   what a handover may not hold (status study; sizes study §3).
2. **Who, and what failed (M unless marked).** civicsmith's `handover-arch` was 43,295 bytes on 25 Nov, and "the 99 unrun
   notices exist only as a list in ARCH's handover" — "the real loss risk" (civicsmith-state §2, §4). ARCH #34 kept
   "case-checker 1710 (ready…)" but dropped the session's id (status study, cause 4). "fill unreadable" was handed down ARCH
   #22 → #26, false, and hid an idle compaction (arch-compacted §2). PROCESS #19's handover carried an owner instruction no
   record held (t3 §1). PROCESS's handover reached 12,586 bytes (cleanup audit, 25 Nov); the file has ranged 5,183–7,716 bytes
   over ten versions and is 2,478 now (git, M). The owner: "putting a comment in a handover is a temporary patch that
   disappears in a generation or two" (weakness-implications).
3. **What the tool would do.** Fill the block itself (`p4 handover --from <words file>`: session from the environment,
   generation, written from the machine clock) and make most of the plain words unnecessary by deriving state on demand:

| What handovers hold now (observed or by design) | Where the tool would read it instead | New state needed |
|---|---|---|
| Generation, session, time (all roles) | Block, filled by the tool | none |
| The owner's instructions (ARCH, coordinator, PROCESS) | Decision record, standing notes, charter (A1) | charter |
| Open jobs: ready, waiting on whom, blocked, failed runs, tests standing | PRs + job records + test records + `merge`'s wait reason | none |
| Merges owed (ready jobs that no longer wait) | as above | none |
| `notify` owed per merged PR (civicsmith's 99) | merged job PRs since the tranche opened lacking a "notify ran" mark | a mark written by `notify` on each merged PR |
| Sessions to archive; wakes to remove | A5's reconciliation | trigger ids per wake |
| Who holds each role and lane | roles and lanes records | none |
| Products registry (PROCESS) | `handover-process` block (already) | none |
| The owner's page address and what waits on it (PROCESS, coordinator) | an `owner-items` record (A9) | owner-items |
| Lessons and lore ("fill unreadable", "verify workers' figures") | design part 1 §7 and the texts; not a tool's | none (a rule: handovers carry no lessons) |
| Judgment in flight: a design question half-settled, what ARCH meant to decide next, a lane question asked | stays plain words | — |

4. **Trigger.** The refresh point (before asking the parent); the successor reads the derived view with `brief` (A12).
5. **Pros.** Removes ARCH's drift causes 1 (what did not happen leaves no trace), 3 (results arrive elsewhere) and 4 (details
   drop in rewrites) for everything derivable (status study); a handover shrinks to judgment in flight; a successor verifies
   less.
6. **Cons and risks.** The "notify ran" mark is one content write per merged PR (civicsmith t2: 154 merged job PRs in about 18 hours,
   24 Nov ~22:05Z to 25 Nov ~16:00Z, civicsmith-state §2–3; well inside ARCH's 475-an-hour share, I). Deriving owed `notify` runs over a whole tranche reads every
   merged PR's comments: hundreds of reads (primary limit only), unless kept as K5 keeps what is final (decision "GitHub's
   limits", I). The derived view is only as right as the tool, which has had many faults (t3 cause 6). A role that writes
   state into words anyway is held only by text. Product handovers cannot be read from here, so the share derivable is I.
7. **Velocity.** I: successor start shorter (less to read, nothing to re-verify); ARCH #3's 11-minute life cost $4.98, "mostly
   that reading" (refresh-at-every-pause, M).
8. **Text removed.** Most of a 43,295-byte ARCH handover (I); PROCESS's handover lines that mirror its page (about 1,000 of
   2,478 bytes, I); design part 4 §4 would name what a handover holds (a few lines added, not removed).
9. **Test, gate, review or stop.** None.
10. **Interactions.** Needs A1, A5, A9's records; is read through A12; option H (widened) is its text side; V (state a status
    only from a read of the system) is what the derived view serves.

## A4. The roles record, finding a role, and naming sessions

1. **Design now.** Roles record, writer ROOT (the watcher at a takeover) (part 4 §4; build 5 §2); a role is resolved to its
   address from the record before a message, never from memory (part 4 §11); lanes: claim before start, address after
   (part 4 §3); names `<product> <role> #<generation>`, generation kept in the handover, "one more than your handover record's
   generation (one if none)" in six starting texts; a job `<product> <module> #<n>`, a walker `<product> walk #<number>`, named
   by ARCH (part 4 §11; decision "Session names"). PROCESS is found in the product's `roles.process` (part 4 §5).
2. **Who, and what failed.** ROOT, each role, ARCH for jobs. The cross-repository read of `handover-process` was refused and
   replaced by registration by message (coordinator-liveness, M); the lanes record named a placeholder (22 Nov, M, fixed by
   claim-then-fill); a session id dropped in a handover (status study). No miscounted generation seen.
3. **What the tool would do.** `p4 name`: prints the standard name with the generation one higher and writes it into the
   role's own handover in the same act (each role writes its own); `open` and `walk text` print the job's and walker's names
   with their starting texts; `p4 who <role|lane>`: prints the address to message and when it was written; a claim-then-fill
   for roles as for lanes. The session still sets its title and tag (harness acts).
4. **Trigger.** Session start; before each message to a role.
5. **Pros.** The count is computed, not remembered; one source for names; the six naming lines shrink.
6. **Cons and risks.** Small gain: no failure here has been measured. The tool cannot tell whether an address still answers
   (fact 1). A role that messages a remembered address is held only by text, as now.
7. **Velocity.** Negligible either way.
8. **Text removed.** The six "Name yourself …" lines total 829 bytes (M); I: about half could go.
9. **Test, gate, review or stop.** None.
10. **Interactions.** A3 (generation in the handover block), A5, A6.

## A5. The lifecycle of sessions: start, archive, wakes, a stopped session

1. **Design now.** Who starts whom (part 4 §2); a finished session is archived by its starter, else ROOT, and the archiver
   removes its wake (part 4 §5; decision "When a role is refreshed, and its wake"); a stopped session is first woken by
   ROOT's message and replaced at the next wake (part 4 §11; ROOT rule 4); no moment is named for archiving a job (status
   study). Grouping by tag is "Not measured" (part 7 §1).
2. **Who, and what failed (M).** ROOT, ARCH, the watcher. A watcher's wake kept firing after its archive (22 Nov); again,
   process3-probes watcher #8's wake fired hourly into a repository-less session, HTTP 403, and pushed to the owner
   (root-lineage). ARCH counted "every job is archived" from habit; "2 never made" (status study, ARCH's count, not checked).
   civicsmith had 14 job sessions open against 8 slots at the halt (t3 §3). The trial improvised wake removal (wake-left).
3. **What the tool would do.** The session lists the product's sessions by tag and its scheduled tasks with the harness and
   saves the listing to a file; `p4 sessions --from <file>` compares it with the roles and lanes records, the round record's
   walking sessions and the job PRs (branch `job/<module>.<n>` → name `<product> <module> #<n>`), and prints: sessions whose
   job's PR has merged or closed (archive), live sessions no record names (archive or ask), roles named but not live (wake or
   replace), wakes bound to archived sessions (remove). It needs each wake's trigger id recorded (in `wakes`, ROOT's, or each
   role's handover block). Acts stay the session's.
4. **Trigger.** ROOT's hourly wake; ARCH in the turn a job's PR merges or closes (option A of the status study) and at its
   refresh; ROOT at a restart.
5. **Pros.** Replaces habit and memory with a comparison (status causes 1, 2, 5); finds orphan wakes; one listing may replace
   ROOT's three `get_session` calls, about 4,700 of a quiet wake's ~10,500 tokens (root-refresh-cadence, M; the saving I).
6. **Cons and risks.** Two harness acts remain (list, archive) and must still be made; tag listing unmeasured; name parsing
   breaks if a session's title is wrong; a session that does not run it. Reads only on GitHub.
7. **Velocity.** Seconds a wake; frees slots held by finished-but-live sessions only where those count (they do not: slots are
   counted from PRs, build 1b command 9).
8. **Text removed.** Session lists in ROOT's and ARCH's handovers.
9. **Test, gate, review or stop.** None: it prints.
10. **Interactions.** A3, A4, A6; A8 (PR subscription would tell ARCH a merge happened).

## A6. ROOT's wake, the watcher's takeover, depth, and the one way back

1. **Design now.** The watcher wakes half an hour after ROOT; two missed wakes and it takes over: writes `roles`, makes its
   ROOT wake, removes two wakes, starts a watcher, tells the coordinator, archives the old ROOT (part 4 §6; watcher rules 1–6).
   Depth: three levels from the limit, a fresh ROOT on the owner's page; two levels, no planned takeover (part 4 §6; decision
   "The limit on depth"). ROOT is taken over only at fill or death (decision D, 27 Nov). After a full stop: the owner starts
   ROOT, which archives every session in the roles and lanes records but PROCESS, and every open job's, then starts the roles
   afresh; ARCH restarts each job from its branch (part 4 §7; ROOT rule 1).
2. **Who, and what failed (M).** process3-probes reached depth 8, its watcher could arm no wake, ROOT ran to 814k tokens and
   compacted; civicsmith ROOT went to depth 5 before the owner reset it; ROOT #12 replaced twenty minutes after its start for
   a version move (root-lineage). Quiet wakes cost ~10,500 (ROOT) and ~5,700 (watcher) tokens; one day ~43,000 (cause not
   known) (root-refresh-cadence). The restart path has not been run in a product (part 4 §5 "Unproven: replacing ARCH while
   jobs are open").
3. **What the tool would do.** `p4 wake root`: writes the time from the machine clock and prints the stop record and roles in
   one call; `p4 wake watcher`: prints "takeover due" or not from `root_last_woke` and the clock (one right answer); the depth
   ROOT reads at its start kept in its handover block and the page line printed when due; `p4 restart-plan`: from roles,
   lanes, round and open job PRs, the exact list of sessions to archive (PROCESS left out), wakes to remove, roles to start,
   and each job to restart with its branch and the text `open` prints.
4. **Trigger.** The two wakes; ROOT's start; a version move.
5. **Pros.** The takeover decision uses a true clock (fact 11); a restart works from a list, not from recall; smaller wakes (I).
6. **Cons and risks.** The takeover and restart acts stay harness acts; depth is read only through `get_session` by the
   session; the watcher must still wake and call; gain on a quiet wake is small.
7. **Velocity.** Small; a restart shorter (I).
8. **Text removed.** Watcher rules 1–2 could become "run `p4 wake watcher`; take over when it says" (about 150 bytes, I).
9. **Test, gate, review or stop.** None.
10. **Interactions.** A4 (roles writes), A5 (wakes and trigger ids), A9 (depth and fresh-ROOT items on the page).

## A7. Stops on the owner's word, and standing notes

1. **Design now.** He tells the coordinator, which writes `stop` and tells ARCH, which interrupts each job; lifted the same
   way; ROOT reads `stop` at every wake (part 4 §10). Standing notes: held merge, module first, slot number, full external
   walk; the tool removes a note when its end comes true (build 5 §3); `merge` and `next-job` read the notes (build 1b,
   commands 6, 9). The tool reads the stop record in no command (M: `tool/lib` names it only as a key).
2. **Who, and what failed.** Coordinator, ARCH, ROOT. Fault 7 (relay refused, M). civicsmith was halted on his word at
   06:06Z 27 Nov (handover.md, M); whether any act ran during a stop is not readable here.
3. **What the tool would do.** `next-job`, `open`, `merge` and `walk open` read `stop` and, while it stands, do nothing and
   print his words and since when, as `merge` prints a held merge; `brief` prints the stop and every note in force. Writer
   stays the coordinator.
4. **Trigger.** Every such command; every `brief`.
5. **Pros.** His stop holds in the session that would act, across refreshes; ROOT's and ARCH's text duty becomes a backstop.
6. **Cons and risks.** Part 6 §5's "holds none of the checks that could stop work": I, a stop he ordered is his act, as the
   held merge is; whether that reading stands is his. A stale record (the coordinator slow to clear it) holds work; jobs
   already running are still interrupted by ARCH (a harness act).
7. **Velocity.** None in normal running.
8. **Text removed.** Little; arch rule 6's first clause could shorten (about 100 bytes, I).
9. **Test, gate, review or stop.** It *carries out* an existing stop; whether that counts as a new stop is his question.
10. **Interactions.** A1 (the charter is the same kind of record); A9 (the page shows stop and notes).

## A8. Messages between roles, and "passing things on"

1. **Design now.** A message wakes; what it carries is saved first elsewhere (part 4 §8). "The share of ARCH's work that is
   passing things on is measured on the first tranche" (part 4 §1). The relays:

| Relay | From → to | Content already stored? | Tool could carry the content? |
|---|---|---|---|
| His marked words | lane → ARCH → coordinator; ARCH → coordinator | the giver's session only | yes, as A2's file and record pointer |
| A process fault, "written once, passed on unchanged" | any → ARCH → coordinator → PROCESS | nowhere (part 6 §6) | in-product, yes (a fault comment, one writer each); to PROCESS no: cross-repo read refused (fact 2) |
| Each ARCH decision, one plain line | ARCH → coordinator | ARCH's decision record | yes: `p4 decisions --since <commit>` prints new entries (same repository, I) |
| What the round's account needs | ARCH → coordinator | git and GitHub | yes (A10) |
| A standing note | coordinator → ARCH | the record (read before every merge) | already; the message only wakes |
| A stop | coordinator → ARCH → each job | the record | the record; interrupts stay harness acts |
| A job's "ready", "blocked", "at fill" | job → ARCH | the PR (job record, test record) | the PR; a subscription could wake ARCH |
| A notice to an open job | ARCH → job | the job block (`notify`) | already |
| What waits for the owner | PROCESS, ROOT → coordinator | nowhere | an `owner-items` record (A9), for ROOT; PROCESS by message only |
| PROCESS's address | PROCESS → ROOT | ROOT writes `roles.process` | already |

2. **Failures (M).** case-checker: "the step that should follow a merge was tied to a job's message, not to the merge"
   (status study, cause 3); relays refused (fault 7; cross-repo "Unsanctioned Communication", 19 Nov, cured by `autoMode`);
   intent not relayed (t3 cause 1). The passing-things-on share has not been measured.
3. **What the tool would do.** Hold each relayed content in a record or on the PR and print it to the receiver, so the
   message carries only "read X". ARCH subscribes to each job PR at `open` (U in products), so a job's ready mark, test
   record or a merge reaches ARCH as an event even when no message is sent.
4. **Trigger.** Each relay's moment; PR events.
5. **Pros.** "Unchanged" becomes byte-exact; nothing depends on the receiver's transcript; part of ARCH's relaying moves out.
6. **Cons and risks.** Messages stay harness acts (wake); a PR's events go to one session at a time, so a refreshed ARCH must
   subscribe again to every open PR (the successor's `brief` can list them, I); each push's CI result adds to ARCH's context
   (cost, unmeasured); a fault record is a new comment write per fault (few).
7. **Velocity.** I: shorter waits after a job's work finishes when its message is late or missing.
8. **Text removed.** Small; "send ARCH one message" lines stay for waking.
9. **Test, gate, review or stop.** None.
10. **Interactions.** A1, A2, A9, A10; option A of the status study (archive at the merge or close).

## A9. The coordinator's standing page and the owner's dashboard

1. **Design now.** "One standing page always shows everything waiting for him"; a phone notification for what only he can
   clear; the coordinator keeps it, PROCESS and ROOT pass it theirs (part 1 §5; coordinator rule 5); each act's steps by full
   address, button label and what he sees (part 1 §3); pages on claude.ai (part 7 §1). He can see each open job's progress
   without speaking to it, through the session list (part 4 §9; "Whether the list he sees meets the rule is not measured",
   part 7 §1). Build 5 §8 item 2: "Whether the owner can read the JSON records well enough on the page" is open.
2. **Who, and what failed.** The coordinator (product), PROCESS (its own page, which the design's "one page" does not name;
   process.md keeps "the owner's page of what you put to him", M), the onboarding lane. PROCESS's page is hand-written
   HTML, 14,463 bytes (M), rewritten each update. PROCESS #20 told him an unchecked status in conversation (t3 §1); a
   hand-written page carries the same risk (I). Product pages could not be read here.
3. **What the tool would do.** `p4 page --out <file>` renders HTML from the records and GitHub: the stop and standing notes;
   the charter (A1) and scope; the round (modules by state, blocked with reasons, walks and areas); open job PRs (tests
   standing, `merge`'s wait, failed runs, time open); waiting-work counts; owed acts (A3); roles with generation and when
   written; PROCESS's liveness; the last account (A10); and the items only he can clear, from an `owner-items` record the
   coordinator writes (questions in the one form of part 1 §5, a prepared release, dated acts with steps, a PROCESS or fresh
   ROOT start). The tool renders; the coordinator writes the questions and publishes the page (a harness act) and notifies.
   **Interactive:** each option carries a button that fills a page comment with the marked words ("Decision: B" for a
   question; "Instruction: hold the merge of pull request 41"; "Instruction: lift the stop"), which he reads, may edit, and
   sends; the comment reaches the coordinator's session, which records it as A2 says. Links go to each PR and session.
   A page database is no route for his choices (fact 8).
4. **Trigger.** After each coordinator turn that changes a record; at round end; when PROCESS or ROOT passes an item; on
   his request. The coordinator has no wake, so between its turns the page ages; it shows when it was rendered.
5. **Pros.** The page states what the records hold, not what a session recalls; the coordinator writes only judgment (the
   questions); his choice is one click and a send, in his own words' form; the page and the sessions see one state.
6. **Cons and risks.** Is a pre-filled comment "a message I typed myself"? His call (CLAUDE.md: "Only messages I typed myself
   count"). Whether the checker passes a standing-note write from a page comment at the coordinator is **U** (facts 6, 7).
   "One page" vs PROCESS's own page: a dashboard per product leaves PROCESS's apart (as now). A "live data" page reading
   GitHub itself would avoid re-renders but needs a connector the page may not have (U). Reads per render: one listing call
   plus the open PRs and their comments, about 10–20 reads (I); no content write. Rendering needs the records' forms in the
   tool, one more thing the tool must keep right.
7. **Velocity.** I: his decisions reach the record sooner; fewer coordinator tokens per update.
8. **Text removed.** Coordinator rule 5's list could point to the rendered sections (about 200 bytes, I); page contents out
   of the coordinator's handover.
9. **Test, gate, review or stop.** None.
10. **Interactions.** Shows A1, A3, A6, A7, A10; feeds A2; a new `owner-items` record (writer: the coordinator).

## A10. The account after each round, and the tranche report

1. **Design now.** After each round the coordinator gives "the tranche's scope where one is recorded, jobs done, flaws found,
   flaws carried over, observations set aside, changes to the walks' documents, rewordings made, and cost where it can be
   read. Nothing waits on it" (part 3 §4), "from what ARCH tells you" (coordinator rule 7; arch rule 7). The tranche report,
   by ARCH, "only from what git and GitHub already hold": time, work done and left, deferred and why, cost, the overhead share,
   ARCH's idle time while work was ready, the owner's minutes, the UX lane's changes to the two documents; "Nothing reads the
   report to decide anything" (part 3 §5).
2. **Who, and what failed.** Coordinator and ARCH; none seen (no account or report read here; t3 had no walk). Cost cannot be
   read (part 7 §1, Open).
3. **What the tool would do.** `p4 account [--round <n>]`: jobs merged and closed nothing-to-change in the round, flaws from
   the walk issues, flaws still in waiting work, observations, git changes to the walks' folder, cost "unmeasured". It needs
   each round's opening time in the round record (one field, ARCH's). `p4 tranche-report`: time open to merge, requirements met
   and not, modules not in scope (`not_this_tranche`), UX-document changes by git, each job's ready-to-merge wait from PR
   times. "Why deferred", "rewordings made", the overhead share and the owner's minutes have no mechanical source: they stay
   ARCH's words or "unmeasured".
4. **Trigger.** `round-done` printing done; the tranche's merge into main.
5. **Pros.** Exact counts; one relay (ARCH → coordinator) gone; the same numbers on the page.
6. **Cons and risks.** Some fields are judgment; round windows need timestamps not kept now; a tranche's merged PRs are
   hundreds of reads (primary limit only).
7. **Velocity.** Small gain; nothing waits on either.
8. **Text removed.** "what the round's account needs" in arch rule 7 (about 40 bytes); coordinator rule 7 shortens (I).
9. **Test, gate, review or stop.** None.
10. **Interactions.** A8, A9.

## A11. The known weaknesses (design part 1 §7) a tool could step around

| Weakness | What the tool could do | What stays with the session |
|---|---|---|
| A full context loses what was read | `brief` reprints state at start and on demand (A12); handovers shrink (A3) | reading its fill (`get_session`), choosing the natural pause |
| A long text is scanned, not read | a short `brief` in place of raw records (civicsmith's round record was 89,773 bytes and waiting work at GitHub's 65,536-character limit, civicsmith-state §4, M: over the 60,000-byte single-text maximum, so "the shared state" in every reading line could not be read in full); `p4 sizes` measures each role's set (option S; a new check, his word) — `starting_texts/00-index.md`'s byte figures are already stale by 13–16 bytes a file (M, `wc -c`) | reading governing texts in full |
| A claim is made that was not checked | status commands (A3, A5) give the read the claim should rest on; option V widens the row's sign | deciding to check; saying what is unproven |
| Conversation is taken as a decision | none mechanical; a hook can capture marked words exactly (A2) | the one question "Shall I record that as a decision?" |
| A choice is made without weighing velocity | none | all of it |
| Caution grows the process | none | all of it |
| A refusal is worked around | none (refusals are the checker's; whether hooks see them is U) | all of it |
| A successor acts from memory it does not have | `brief` and derived handovers (A3, A12) | — |
| The same correction fails again and again | already the tool (`failed-runs`, part 4 §10) | ARCH's replacement act |
| Work stops with nothing calling for it | `brief` lists owed acts (merges, `notify`, free slots, archives); a Stop hook or `/goal` could hold the turn open while any remain (U; `/goal`'s judge runs no tools and sees only the conversation, sizes study §4); either would be a new check (his word) | doing the work |

## A12. Reading-set size, and what a `brief` command could replace

1. **Design now.** A session acts only on what it read in full or measured; sets under 175,000 bytes, a text under 60,000
   (part 5 §1–2). Sets as built (starting_texts/00-index §2, M): ROOT and the watcher 72,168 (with text ~76,000), the
   coordinator 128,267, ARCH 167,439 (172,783 with its text, 98.9%) before the product's own texts, a job 117,561, a lane
   79,563, PROCESS over (reading-sets study). Each role also reads "the shared state", of unknown size.
2. **Failures (M).** Sets passed the maximum three times by growth no one measured (sizes study §1); ARCH's set is over in
   practice once product texts are added (reading-sets); civicsmith's round record alone exceeded the single-text maximum
   (A11); refresh cost is mostly reading (refresh-at-every-pause).
3. **What the tool would do.** `p4 brief <role>`: prints, in plain lines and bounded in size, the *state* the role acts on now:
   for all, the stop, notes in force, charter, who holds each role, its own name and generation; ARCH, the round in summary,
   open PRs with their state, owed acts, waiting-work counts by module, lanes; the coordinator, owner items, PROCESS's field,
   the last account; ROOT, wakes, depth line, the sessions check (A5); a job, its block and the charter (via `open`); a walker,
   its areas. Rules stay in the governing texts: a brief that restated rules would be a second source beside the design (part
   5 §4 keeps one). Where reading could go: if every record write became a typed command (`p4 note add …`, `p4 roles set …`,
   `p4 scope set …`), the record forms in build 5 §2–3 (6,319 bytes, M) need not be read by ROOT, the watcher, the coordinator
   or a lane (I; ARCH still needs the round's meaning); if `open` printed the job block in plain words, a job might not need
   build 5b (9,351 bytes) (I).
4. **Trigger.** Session start (or a SessionStart hook, U); after a long background wait; before a status claim.
5. **Pros.** The "shared state" line becomes readable in full; a successor starts from fresh facts; sets shrink.
6. **Cons and risks.** A brief is not governing text; a fault in it misleads every role at once; it must stay small itself;
   typed record commands are new tool surface for PROCESS to keep; a session not calling it.
7. **Velocity.** I: each refresh rereads less; ARCH refreshes often (27 generations by 25 Nov, civicsmith-state §3, M).
8. **Text removed.** "Then … the shared state" in eight reading lines becomes "`p4 brief`"; up to 6,319 bytes from five roles'
   sets and 9,351 from a job's (I, as above).
9. **Test, gate, review or stop.** None; `p4 sizes` would be a check (his word).
10. **Interactions.** Prints A1, A3, A5, A6, A7; is the read V asks for.

---

## What stays with AI, and why

- **Judgment the design gives a role** (part 4 §1: "whatever has one right answer is done by the tool … ARCH's session keeps
  what needs judgment"): ARCH's scope, design and interface decisions, where a flaw goes, when a lane runs, the tranche's
  merge or drop proposals; a lane's design; PROCESS's whole work.
- **The owner's words**: whether an unmarked message is a decision (the one question), under which subject it is recorded,
  the rule restated "as it now stands" (part 5 §5), and the plain-words form of every question put to him. The tool can carry
  his words byte for byte; it cannot interpret them, so "conversions only" binds only through a structured scope.
- **Harness acts**: starting, messaging, interrupting, archiving, naming, waking; reading fill and depth (fact 1).
- **Claims**: what is proven and what is not (part 1 §5) — the tool supplies the read, not the honesty.
- **The natural pause** and whether a quiet session is busy or stopped beyond what the records show.

## How these fit together

| | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 | A10 | A12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| New state | charter | — | notify mark | — | trigger ids | — | — | fault comment | owner-items | round times | — |
| Writer | coord. | coord. | ARCH (tool) | each role | ROOT | ROOT | coord. | each sender | coord. | ARCH | — |
| Depends on | A2 | — | A1, A5, A9 | A3 | A4 | A4, A5 | — | A2 | A1, A3, A7, A10 | — | A1, A3, A5–A7 |

A1, A2 and A9 are one chain: his words captured exactly (A2), held for the tranche (A1), shown and answered on his page
(A9). A3 and A12 are one chain: what a handover no longer carries, `brief` prints. A5 and A6 share the sessions check and
the wake ids. Option H (handovers carry no instruction) is A3's text side; V is served by A3, A5 and A12; X is what would make
A1 binding; S is A12's `p4 sizes`.

## Unproven or open in this part

Hooks running in cloud sessions, and their input naming who typed a prompt; the checker on a standing-note or charter write
from a page comment or a relayed word; PR subscriptions in products; tag listing; a "live data" page; whether a pre-filled
comment counts as words he typed (his call); whether the tool obeying a stop is a "check that could stop work" (his call);
whether a charter fits part 3 §1 (his call); product handover contents and sizes beyond the 25 Nov figures.
