# Part K: the evidence behind each of the 22 opportunities (27 Nov 2026, worker for PROCESS #21, brief 2)

Question: for each opportunity, which recorded failure or cost in Process4's (or process3's) history it would have prevented
or materially reduced, and how often that failure occurred. Facts carry their source; **I** marks inference, **U** unproven.
Nothing here is decided; classifications are this worker's, for the owner.

**Sources (short names).** t3 = `process/research/tranche-t3-study-27nov.md`; ST = `status-from-the-system-27nov.md`; SZ =
`sizes-handovers-goals-27nov.md`; RS = `reading-sets-27nov.md`; A, B, C, D, E = parts `a-`…`e-` of this folder (item ids as
there); research files by name without the folder. p3 = public neobobkrause/process3, branch `process4`, `process4/evidence/`:
CF `causal_forensics.md`, LL `ledger_lines.md`, PS `product_side.md`, DEC `DECISIONS.md`, RRC `roles_root_coordinator.md`.

**Classes.** LOAD-BEARING: prevents a recorded, repeated or costly failure and nothing simpler does. SUPPORTING: needed only
to make a load-bearing item work. USEFUL: real benefit, no recorded failure behind it (or one a simpler item already
answers). NOT RECOMMENDED: cost or risk exceeds the evidence; caution and "nothing measured" count against it ("caution is a
cost, paid only against a measured failure or your word").

## The failures on record, numbered for reference

| # | Failure (date; count) | Source |
|---|---|---|
| F1 | His tranche intent lost or misstated: "every module, conversions only" lived only in PROCESS #19's handover; PROCESS #20 told him, unchecked, it was in the round record (26 Nov 21:22); the 02:52 word lacked the sentence that would hold fixes | t3 §1, cause 1 |
| F2 | ARCH chose what came next and widened the scope four times on its own judgment (22:01, 23:05, 04:06 and one more), ran fixes first; ARCH #34 read "conversions only" as "plus small fixes"; ARCH #35 held 3 job flaws against the design | t3 §§2–3, causes 2–3 |
| F3 | No scope form for "conversions only": earlier modules' fixes and told jobs rank ahead of later conversions; round 1 under ARCH #34 opened no conversion | t3 §3 |
| F4 | case-checker ready (tests passed 22:00, 22:56, 01:57), refused at about 10 merge attempts, each by a provider job just opened; merged 03:49, ~6 h; held 1 of 4 slots after 01:17 | t3 §4, cause 5; B4 |
| F5 | Statuses from the transcript: "every job is archived" with 2 archives never made (ARCH's count, unchecked); ARCH #34 dropped case-checker's session id; F1's unchecked claim (3 cases, 26–27 Nov) | ST; t3 §1 |
| F6 | Owed `notify` runs with no record form: 23 Nov (out of memory, "ARCH records each owed notice"); 25 Nov 99 unrun notices "only as a list in ARCH's handover", "the real loss risk"; 25 Nov ~67 merged PRs queued (1436–1583); 26 Nov five conversion notices owed (1688–1693) | notify-out-of-memory-23nov l.51–69; uses-metadata-25nov/civicsmith-state §2; waiting-work-record-size-25nov; notify-size-26nov |
| F7 | Notices lost when a record outgrew a comment: notify 1339 (25 Nov, modules unknown, output cut); notify 1340; notify 1445 (1,937 entries, 256,350 bytes); job block for filings (PR 1669); 2 job PRs with no block | waiting-work-too-large-25nov; waiting-work-record-size-25nov; design-decisions-2 l.527 |
| F8 | Orphan scheduled wakes: civicsmith watcher #1's wake bound to an archived session (22 Nov); process3-probes watcher #8's wake firing hourly into a repository-less session, HTTP 403, pushing to him (26 Nov); p3: ROOT's hourly task kept firing after the 9 Nov stop, 94 push notifications by 13 Nov | wake-left-after-archive-22nov; root-lineage-26nov; RRC §1.3 |
| F9 | Over-the-number sessions: 14 job sessions against 8 slots at the halt; blocks ARCH ended counted as free slots, ARCH filled by hand (23 Nov, 3 jobs; fixed) | t3 §3; blocked-record-not-cleared-23nov |
| F10 | Reading sets past their maximum by unmeasured growth, at least four times: lane set (22 Nov), job set (27 Nov), PROCESS 179,585 > 175,000 (27 Nov), ARCH 98.9% before product texts; PROCESS's handover 12,586 bytes (25 Nov); his words: "Every time I ask … they've grown beyond the agreed to limits" | SZ §1; RS; lane-reading-set-over-maximum-22nov; job-reading-27nov |
| F11 | Refresh cost is mostly reading: ARCH #3 lived 11 min, $4.98, "mostly that reading"; successors start at 170–210k tokens; ARCH at #35 by 27 Nov; round record 89,773 bytes (> 60,000) so "the shared state" cannot be read in full | refresh-at-every-pause-22nov; A11–A12 |
| F12 | Handovers carry wrong or lost state across generations: "fill unreadable" handed down ARCH #22→#26, hid an idle compaction (25 Nov); F1; F5's dropped id; p3: 26 hand-written handoffs became the rulebook, 21 items marked "Bob's" of which 14 were mechanisms, a coordinator's "about 6 jobs" followed as his for ~6 h, a "Bob's, asked, no answer" item stalled a decision ~9 h; a "state and open acts only" handoff (5 Nov) had rules again within 24 h | arch-compacted-fill-unread-25nov; CF §§3–4 |
| F13 | Fault 7: his instruction relayed through ARCH; the coordinator's standing-note write refused (19 Nov); a `gh` command in his quoted words got the recording refused | trial-faults-19nov; A2 |
| F14 | Cross-repository reads refused (403): a refreshed coordinator could not find the live PROCESS and asked him on every refresh (20 Nov; fixed by registration by message); PROCESS's refresh ask sent to the watcher's id (19 Nov) | coordinator-cannot-read-process-liveness-20nov; process-refresh-cross-repo-19nov |
| F15 | GitHub limits: secondary limit refused writes 22:10–22:50 and ~01:08 (26–27 Nov, from ~100 MB notices), slots cut to 4; p3's account suspended 6 Nov after 1,387 state-branch pushes in 19 h (cause unproven) | t3 §2; C §1.1 |
| F16 | Figures rebuilt by hand: first-pass durations and costs gathered from reports ("merged-file counts exceed … not investigated"); t3's timeline rebuilt by six workers reading transcripts | first-pass-figures-26nov; t3 Sources |

Measured harm of the mechanisms themselves (p3 and its predecessor): records → guards → stops (43% of 90 sampled refusal sites
guard the process's own records, CF §6); a usage ledger of 3,150 commits, "mostly measuring the process's own record-keeping"
(PS §3); a turn-end hook "held a session against STOP EVERYTHING" and a Stop hook "held sessions against your explicit stop"
(LL ENF-3, ENF-5, dropped "must not return"); hooks "vanished after a resume" and did not load where the project root was not
the repository (LL ENF-1; DEC PD-13, 8 Nov); a model judge "sent a finished BOB back 28 times" (LL ENF-6). The one restraint
that held all week was mechanical: role prompts capped at 4,096 bytes by a test stayed at 4,032–4,197 bytes while `tool/lib`
grew from 1,431 to 23,429 lines (CF, Headline).

## The 22, one by one

**A1 Tranche charter (his words + a kind; the tool hands out only what the kind allows).**
Addresses F2, F3 fully once the kind is "conversions only" (that is option X carried as a record, t3 §7); F1 in part: his
words sit beside the scope where a mismatch shows, and a successor reads them instead of a handover. Would NOT have
prevented: F1's root (the sentence never typed at civicsmith before 02:52; a charter holds only what he says); t3 cause 4
(conversions' stated types making flaw jobs); F4. Cost: one record, few writes; reverses part 3 §1 "no single purpose"
(his word); a kind that holds flaws back departs from "flaws are always work" (his word); choosing which words bear is
judgment. Needs: A2 (so the plan follows it), A4 or the existing decision record. **LOAD-BEARING**: F2/F3 cost a whole
tranche's direction (two rounds, ~8 h) and no text can bind a scope the form cannot express; the kind is the only fix.

**A2 Build plan from the tool (ARCH takes "next" from it).**
Addresses F2 (ARCH's four widenings would become the charter's computation, E §5); PROCESS #20's wrong forecast "go on
through the remaining modules" (a plan print shows eight, B2). Not: F3 by itself (the ranking is the tool's already;
`next-job` chooses). Cost: a text change to ARCH and part 3 §1; a read-only `plan` print (~200 GETs a call before K5, B2).
Needs A1 (without a charter there is nothing to compute from). **SUPPORTING** to A1.

**A3 Job brief from the tool (minimal starting text: fetch, then ask).**
Addresses: job reading set over 175,000 (job-reading-27nov; already cut by "Decision: C & D"); trial fault 8 (two jobs
missed ARCH's decisions, 19 Nov; fixed by text); a job's ~58k starting tokens (B6). In t3 jobs reported flaws correctly; the
failure was ARCH's placement (t3 §2), so a tranche line in the job adds nothing measured. Cost: breaks part 4 §11 "names and
addresses only"; a brief is a second source beside the block; a fault in it misleads every job. Needs A1 for the charter
lines, C1's machinery. **USEFUL**: reading cost only; its recorded failures are already fixed by text.

**A4 His words captured exactly (true time).**
Addresses F13's second half (a `gh` command inside his quoted words got the recording refused, one case); the sessions'
clocks running 25–30 min ahead (t3 Sources; no misdated record found **U**). Not: F13's relay refusal (the checker judges
the relayed source, not the format); F1 (words never typed); p3's authority drift (F12), which came from handovers, not from
the record. Cost: small; a UserPromptSubmit hook form cannot tell him from a peer (**U**, A2). Needs nothing; A1 and C2 read
the record it writes. **SUPPORTING**: the decision record already holds his exact words by text (part 1 §4); A4 makes
A1's input exact, one command for six.

**A5 His stop obeyed by the tool's commands.**
Addresses: no Process4 failure; civicsmith halted 06:06Z 27 Nov, no act during a stop read (A7). p3's 94 pushes after a
stop (F8) came from a wake, which the tool cannot touch. Cost: four commands read one record; a stale stop holds work;
whether a tool carrying out his stop is a new stop is his (part 6 §5). Needs A1's record kind (same reads). **USEFUL**:
cheap, his own word carried, nothing recorded behind it.

**B1 Job ledger (stages, times, session ids).**
Addresses F5's dropped session id; job session ids in no record though ROOT rule 1 archives "every open job's session"
(B3); F16 (timings by hand); base for D2. Not: F4 (the wait chain is derivable from PR and test-record times, B4); F5's
"2 never made" (a listing shows that, B4). Cost: +2 writes a job (~48/h at 24 jobs/h, B3), pushing the full tool near
GitHub's 475 margin (G); p3's records each grew guards (CF §6). Needs E1 at full scale (**I**). **USEFUL**: B4 and a
session listing cover its failures with no writes; its own gain is timings (D2).

**B2 Session acts recorded by hooks (PostToolUse on create/archive/send_message).**
Addresses F5 (an archive recorded from the harness's answer), new session ids, F14's mis-addressing (records the target,
does not prevent it). Not: an archive never made (a hook records only calls made; the gap shows only against a list).
Cost: a hook in each product's `.claude/settings.json` (his merge); unproven in Process4 (C §2.1); outside the checker;
p3 measured hooks not loading (PD-13) and its hook-recorded traffic took "about 11 builder fixes in three days" while
primary use stayed under 12% (CF §4.2). Needs E2, B1. **NOT RECOMMENDED**: B4 with a harness listing passed in reads the
same truth, writes nothing and needs no hook.

**B3 Owed acts kept working (Stop hook names what a session owes; a gate).**
Addresses "work stops with nothing calling for it" (A11); F6 and F5's missed archives in part. No Process4 record of a turn
ended with owed work that a print would not have caught (**I**: ARCH tied archiving to the job's message, ST cause 3, a text
fix). Cost: a gate (his explicit word, part 6 §7); the exact mechanism has measured harm: held sessions against his stop,
platform overrides after eight blocks (LL ENF-3, ENF-5, "must not return"); the `/goal` judge reads only the transcript
(SZ §4). Needs E2, B4, B6. **NOT RECOMMENDED**: measured harm, no measured failure; B4's print at merge and refresh (and
a non-blocking PostToolUse note, if hooks are ever proven) gives the benefit without holding a turn.

**B4 What didn't happen (merged not archived; ready and waiting, on what; open with no session).**
Addresses F4 (named at the first refused attempt, 23:15, not after 6 h, **I**); F5 (archives counted against a listing);
F8 (wakes bound to archived sessions, 3 cases); F9 (above-number count with grounds); F6 (owed notices, with B6); F7's
PRs with no block (2 + filings). Not: the acts themselves (archive, delete a wake: harness acts); F4's cause (only Y ends
it). Cost: read-only; a listing of sessions and scheduled tasks passed in by file (harness formats **U**, B3 (c)); a
duty to clear would be a gate (his word); thresholds the design lacks. Needs a listing; B6 for notices; B1 optional.
**LOAD-BEARING**: about eight instances of five kinds in seven days, a join across GitHub, records and the harness that
text (V, option A) asks a session to do by memory, which F5 shows fails.

**B5 Merge queue with Y (a ready job not held by provider jobs opened after its tests passed).**
Addresses F4 (~6 h, ~10 refusals, a slot of 4); the structural case of any late module with many providers (t3 §4). The
queue print adds 25 Nov's nine held jobs (already fixed by text, merges-held-for-notify-25nov). Not: notices arriving
after the pass (22:04, 01:48), which rightly re-run tests. Cost: Y lets a job merge before a newer provider job lands (that
provider's merge then tells it, as any user); no writes. Needs nothing for Y; times from GitHub. **LOAD-BEARING** (Y): one
occurrence but costly and structural; the queue print alone only names the wait.

**B6 Owed notices.**
Addresses F6: four occasions in four days (23, 25 ×2, 26 Nov), the 99 "only in ARCH's handover"; three parallel `notify`
runs (26 Nov, B8). Not: F7's lost placements (a record-size fault, fixed by 6B); which modules a cut-off run lost. Cost:
one mark per merge (~24/h), or none if "notify ran" is derived from the comments `notify` already writes on the merged PR
(**I**: needs a marker for a notice that tells no one). Needs B4 to print it. **LOAD-BEARING**: repeated, and the only
alternative today is a handover line, the failure itself.

**B7 Flaws and waiting work (appends, loop counts).**
Addresses ARCH #30's "for later; no job starts" with no form (t3 §1); hand rewrites of the whole record (silent drops **I**,
none measured); counts for "handed back twice" (none exists, no failure seen, B7). F7 is fixed (6B). Not: ARCH #35's holds
(A1's kind settles where flaws go). Cost: tool surface; same writes. Needs A1 for hold reasons. **USEFUL**.

**B8 Wakes and takeover from a true clock.**
Addresses F8 only through the wake ids it would keep, which a scheduled-task listing in B4 already gives (each names its
bound session); depth trouble (8 reached, 25 Nov) is a lineage fault answered by root-lineage's options, not a clock. No
takeover misjudged by a wrong clock is recorded. Cost: ROOT's and the watcher's records, writes each wake. **USEFUL**:
its failure is B4's; the true clock has nothing recorded behind it.

**C1 The brief at fixed points.**
Addresses F11 (each ARCH start rereads ~170–210k tokens; $4.98 for an 11-minute life; 35 generations); "the shared state"
unreadable in full (89,773-byte round record); ST causes 1, 3, 4 (a read in place of memory); F12's "fill unreadable" (a
fact read fresh, not inherited). Not: habit (ST cause 2: a session that does not call it); a fault in the brief misleads
every role at once (t3 cause 6). Cost: a bounded print to keep small; typed record commands are new surface; called by the
starting text's first commands (E §6), no hook. Needs B4, B6, A1 for content. **LOAD-BEARING**: F11 is paid every refresh
and records past the single-text maximum cannot be read any simpler way.

**C2 Handovers shrink to judgment in flight (no owner instructions, no copied state).**
Addresses F1 (the instruction that lived only in a handover), F5's dropped id, F6's 99, F12 (four ARCH generations of a
false belief; p3's 14 mechanisms passed as his and the 9-hour stall); ARCH's 43,295-byte handover (A3). Not: judgment in
flight, which stays words. Cost: text (option H) plus a handover block the tool fills; a derived view is only as right as
the tool. Needs C1 (else the state has nowhere to be read), C3 (p3's text-only "state and open acts only" handoff had rules
back within 24 h; only a measured bound held there). **LOAD-BEARING**: F12 is repeated in both processes and is what made
F1 possible; H alone is the simpler fix p3 measured failing.

**C3 Sizes measured, with a reduction plan on a breach (a check).**
Addresses F10 (at least four breaches in six days, each found by chance or his question), PROCESS's handover at 12,586
bytes; the stale byte figures in `starting_texts/00-index.md`. Not: ARCH's product-side texts (not PROCESS's to measure,
SZ §1). Cost: seconds a refresh; a worker only on a breach; a new check, so his word (part 6 §7); he proposed it himself
(SZ, unmarked: "Why aren't the handoff size limits being checked…"). Needs nothing. **LOAD-BEARING**: repeated failure of
a text rule; p3's one mechanical size cap is the one restraint measured to hold.

**C4 Statuses only from the tool.**
Addresses F5 and F1's unchecked claim (3 cases). Not: facts the tool cannot read (sessions, wakes: harness listings); a
tool fault becomes every status's fault (t3 cause 6). Cost: an exclusive rule binds every statement to the tool's
correctness; option V (read the system that holds it, say "unchecked" otherwise, ST) is simpler and untried, since both
cases fell outside the weakness row's old sign. Needs C1, B4. **SUPPORTING**: V carries the rule; C1/B4 give it one read
where the state is spread.

**D1 The coordinator's dashboard rendered from the tool's records (text growth included).**
Addresses: PROCESS's hand-written page (14,463 bytes, rewritten each update, A9); build 5 §8's open "whether the owner can
read the JSON records"; his repeated size questions (F10's growth, shown). No product page was read; no failure of a page
is recorded. Not: F1 (said in conversation). Cost: ~10–20 reads a render; an `owner-items` record; whether a pre-filled
comment is "typed myself" is his. Needs C1, B4, A1, C3. **USEFUL**.

**D2 Account and tranche report from counts and timings.**
Addresses F16 (hand-gathered figures; six workers to rebuild t3). No account has been tested (B12). Cost: round open/close
stamps; p3's accounting ledger became 3,150 commits measuring its own bookkeeping (PS §3) and an hourly audit that accreted
until cut to daily (CF §3 E). Needs B1. **USEFUL**: real saving, derived form only; no failure of work behind it.

**D3 Relays as records.**
Addresses: faults passed through 2–3 sessions "unchanged" (no alteration found; ARCH #15 cut its own output, losing a list,
waiting-work-too-large-25nov); F14's mis-addressing. Not: F13 (a record of a relayed instruction is still relayed; the
checker's ground is unchanged). Cost: PR subscriptions go to one session; new records and writes; cross-repo needs E1.
Needs E1, A4. **USEFUL**: ARCH's relay share is unmeasured (B16); no loss recorded.

**E1 Cloudflare state service.**
Addresses F7 (no comment-size limit: waiting work and a job block past 65,536; the round record past 60,000), F14 (both sides reach one store), F15's state share
(content writes off GitHub); 0.9 s a GitHub state read against ~0.12 s to the edge (local timings, G); p3's state-branch
races (six commits, three reviews) and undeletable branch. Each recorded case is already fixed another way (6B parts,
registration by message, K1–K5). What remains is a forecast: the full tool at 270–450 writes/h near or past 475 (G, **I**).
Cost: new Worker and object code to build and keep; his approvals wording, a network secret, the checker on a new host
**U**; Process4 tied to one host; ~$0–12.50/month (F). Needs nothing; B1, B6 (marked form), D1 and D3 need it at scale.
**SUPPORTING**: needed only if the write-heavy items are taken; the minimal set below writes little.

**E2 Hooks as callers.**
Addresses habit (ST cause 2, a session not calling the tool; no failure measured since texts name the calls); the
SessionStart `compact` point (ARCH #26, 25 Nov; its cause removed by idle compaction off). Not: anything the starting
text's "fetch, then `p4 brief`" does not (E §6). Cost: settings per product (his merge), unproven in Process4, outside the
checker; p3 measured hooks failing to load (PD-13) and blocking hooks overriding his stop (ENF-3/5). **NOT RECOMMENDED**
now; worth a first trial on process3-probes only if a session is seen skipping its calls.

## Summary

| Class | Items |
|---|---|
| LOAD-BEARING | A1, B4, B5 (Y), B6, C1, C2, C3 |
| SUPPORTING | A2 (to A1), A4 (to A1), C4 (to V, via C1/B4), E1 (to B1/B6/D1/D3 at scale) |
| USEFUL | A3, A5, B1, B7, B8, D1, D2, D3 |
| NOT RECOMMENDED | B2, B3, E2 |

## The minimal set

**A1 + A2 (text form), B4, B5 (Y), B6, C1, C2, C3**, on GitHub as today (store option a), with the text options V and A
beside them (no tool). Coverage: F1 (A1, C2), F2–F3 (A1, A2), F4 (B5, B4), F5 (B4, V), F6 (B6), F8–F9 (B4), F10 (C3),
F11 (C1), F12 (C2, C3). Writes added: A1's record (a few a tranche), B6's mark (~24/h at most, none if derived); B4, B5, C1,
C3 read only. F7, F13–F15 are fixed already or untouched by any item (F13 is the checker's).

What each excluded item would have added:
- A3: shorter job starts (~58k tokens, B6); nothing recorded unfixed.
- A4: exact bytes and a true UTC time for his words, one command for six; avoids the one refused recording.
- A5: his stop held by the commands, beyond the text duty; no breach on record.
- B1: job timings and session ids kept (D2's base); costs ~48 writes/h.
- B2: archives and new ids from the harness's own answer, if hooks prove to run; duplicates B4's listing.
- B3: a turn that cannot end with owed acts; the mechanism p3 measured overriding his stop.
- B7: append-only placements and loop counts; no failure since 6B.
- B8: a true-clock takeover; its orphan-wake part is in B4.
- C4: one rule naming the tool as the source; V does the work with less dependence on the tool's correctness.
- D1: a page from records, his size view at a glance; no page failure recorded.
- D2: the account without hand counting (F16); needs B1.
- D3: relays byte-exact as records; no relay loss recorded; needs E1.
- E1: speed (local 0.9 s vs ~0.12 s), no size cap, cross-repository reads, headroom for B1/D1/D3; needs his approvals and
  settings. Becomes needed once the write-heavy items are taken.
- E2: calls at fixed points without relying on text; unproven here, measured unreliable in p3.
