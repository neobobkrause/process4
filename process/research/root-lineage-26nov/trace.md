# ROOT lineage trace, 26 Nov 2026

Read-only research for PROCESS. Sources: `get_session`, `list_sessions` (mine, 7 pages of 100, back to 8 Nov), `list_triggers` (first page) and `list_events` on the sessions named. Times are UTC.
M = read from a record. I = inferred.

Depth here means the number of `parent_session_id` hops up to a session with no parent (the owner started it), so the top session is depth 0. This matches the harness's own count: watcher #12's get_session of itself returned `"lineage":{"depth":8,"limit":8}` (M). The watchers' own texts also say "watcher #8 is lineage level 5 of 8" and "watcher #11 ... lineage depth 7 of 8" (M). From outside, `get_session` returns no `lineage` field for other sessions (M), so the depths below for other sessions are computed from parents (I, but consistent with those three readings).

## Answer in brief

- Every ROOT that a session created is a child of the ROOT before it (M). There are no exceptions. The chain resets only when the owner starts a ROOT by hand (no parent): civicsmith #1 and #7, and process3-probes #2 and #3 (M).
- How it works: each ROOT starts a watcher, which is its child. At a takeover the watcher renames itself ROOT, so each takeover adds 1 to the depth (M; design text quoted in watcher #12's transcript: "Each takeover leaves the new ROOT one level deeper than the one before, because the watcher was started by the ROOT it replaces").
- Current depths: civicsmith ROOT #9 is at depth 2, after the owner reset at ROOT #7. process3-probes ROOT #10 is at depth 7 and its watcher #12 is at depth 8, the limit (M for watcher #12, I for ROOT #10).
- A session at depth 8 cannot start sessions or create, fire or re-arm triggers (M, quoted in section 5). process3-probes is stalled on this: its ROOT cannot be refreshed until the owner starts a fresh ROOT.
- Trigger-created sessions: one exists, with origin `scheduled_trigger` and no `parent_session_id` (M), so it starts at depth 0 (I). It is an orphan (section 4).

## 1. civicsmith

| ROOT | session | created | origin | status | parent | depth | who created it | reign (took over → handed on) | why it ended |
|---|---|---|---|---|---|---|---|---|---|
| #1 | session_018BhcegAmzjwNWYL3hiKonG | 22 Nov 19:00 | desktop_app | archived | none | 0 | owner (M) | 19:00 → ~23:01 (4h) | version move, since ROOT, coordinator #2 and ARCH #6 were all replaced 23:01–23:02 (I) |
| #2 | session_018BhcedH2Cu33ATGjYeJE8v | 22 Nov 23:01 | mcp_seed | archived | #1 | 1 | ROOT #1 (M); was a watcher that took over (I) | ~23:01 → ~23:32 (0.5h) | version move to 4614f8f: "ARCH #7, coordinator #3, watcher #4 started on 4614f8f; watcher #4 to take over ROOT" (M) |
| #3 | session_018Bhcedt8Khih1wkySqBtUq | 22 Nov 23:32 | mcp_seed | archived | #2 | 2 | ROOT #2; was watcher #4 (M) | 23:32 → 23 Nov ~05:14 (5.7h) | version move, since coordinator #4 and ARCH #8 were replaced in the same minute (I) |
| #4 | session_018BhceeqiFSaXdPrichfP66 | 23 Nov 05:14 | mcp_seed | archived | #3 | 3 | ROOT #3 (M); watcher (I) | 05:14 → 24 Nov ~21:59 (40.8h) | version move to ac962e7: "Watcher #8 takes ROOT next (ac962e7)" (M) |
| #5 | session_018BhceghTxHcQbupRs5sxhW | 24 Nov 21:59 | mcp_seed | archived | #4 | 4 | ROOT #4; was watcher #8 (M) | 21:59 → ~23:06 (1.1h) | version move, since coordinator #6 and ARCH #14 were replaced at 23:06 (I) |
| #6 | session_018BhcedgLfKVoMuB7Zbjuoq | 24 Nov 23:06 | mcp_seed | archived | #5 | 5 | ROOT #5 (M); watcher (I) | 23:06 → 23:13 (last update) | it asked the owner to "decide whether to reset the ROOT depth count before the next takeover" (M) |
| #7 | session_018BhceePQhUJcXt8W2pZGxx | 24 Nov 23:48 | desktop_app | archived | none | 0 | owner, as the depth reset (M for origin and no parent; I for the reason) | 23:48 → 25 Nov ~02:51 (3h) | version move: "Coordinator #8 will notify you when every session is on the new version" (M) |
| #8 | session_018BhcedFUvhmvqFAiPnpAWv | 25 Nov 02:51 | mcp_seed | archived | #7 | 1 | ROOT #7; was watcher #13: "watcher #13 will take over as ROOT #8" (M) | 02:51 → ~03:59 (1.1h) | version move to 55db8e4: "ARCH, coordinator and watcher moved to 55db8e4; new watcher will take over ROOT" (M) |
| #9 | session_018BhcefUXKE8xvUkaa9XjGi | 25 Nov 03:57 | mcp_seed | idle (live) | #8 | 2 | ROOT #8; the "new watcher" (M) | 03:57 → now (21.5h) | still ROOT; 469,273 tokens used (47%) at 01:31 26 Nov (M) |

Why takeovers happened in civicsmith: 7 of the 8 handovers were version moves (3 shown by M, 4 by I). One was the owner's depth reset (#7). None was a planned refresh at fill level, and none followed missed wakes. Gaps between takeovers: 4h, 0.5h, 5.7h, 40.8h, 1.1h, (owner reset 0.7h after #6), 3h, 1.1h. Median about 2h (I).

Live civicsmith roles (M, parents from list_sessions):

| role | session | created | parent | depth |
|---|---|---|---|---|
| ROOT #9 | session_018BhcefUXKE8xvUkaa9XjGi | 25 Nov 03:57 | ROOT #8 | 2 |
| watcher #16 | session_018Bhcegf3c1N7JvmQoRbzdf | 25 Nov 04:00 | ROOT #9 | 3 |
| ARCH #27 | session_018Bhcedh1q7Nb2FASGrj4Pq | 25 Nov 15:06 | ROOT #9 | 3 |
| coordinator #9 | session_018BhcedNDzSLiPUv54snhat | 25 Nov 03:58 | ROOT #8 | 2 |

ARCH's lanes (for example ARCH #26's 15 lanes, 12:34–13:07) are at depth 4 (I).

## 2. process3-probes

| ROOT | session | created | origin | status | parent | depth | who created it | reign (took over → handed on) | why it ended |
|---|---|---|---|---|---|---|---|---|---|
| #2 | session_018BhcecCYYSx5p5GpzPHTKX | 20 Nov 19:15 | web_claude_ai | archived | none | 0 | owner (M) | 19:15 → 19:21 | the owner started #3 seven minutes later (M times; I reason) |
| #3 | session_018BhcegCuF19u2t53vEuhHv | 20 Nov 19:22 | web_claude_ai | archived | none | 0 | owner (M) | 19:22 → ~20:48 (1.4h) | version move to 3940d130: an ARCH trigger says "watch for ROOT's watcher-takeover completing — ROOT #3 was still on 1b19568" (M) |
| #4 | session_018BhcegnTbHzcLV769QSdhd | 20 Nov 20:45 | mcp_seed | archived | #3 | 1 | ROOT #3 (M); watcher (I) | ~20:48 → 21 Nov 03:48 (7h) | "Planned ROOT refresh handed to watcher #5" (M) |
| #5 | session_018BhcefqJTreGdGDmjy7QWp | 20 Nov 20:54 | mcp_seed | archived | #4 | 2 | ROOT #4; was watcher #5 (M) | 03:48 → ~04:49 (1h) | "handed ROOT to watcher #6" (M). Probably a planned refresh: it had spent 7h as watcher first and ended at 555k tokens (I) |
| #6 | session_018BhcedZC3UgHf6sEikWa8V | 21 Nov 03:53 | mcp_seed | archived | #5 | 3 | ROOT #5; was watcher #6 (M) | ~04:49 → ~09:50 (5h) | "handover-root gen 6 written; ROOT duty passed to watcher #7" (M); a planned refresh (I) |
| #7 | session_018Bhceg1d5SVx54aCGkzRe3 | 21 Nov 04:53 | mcp_seed | archived | #6 | 4 | ROOT #6; was watcher #7 (M) | 09:50 → 24 Nov ~21:11 (3.5 days; it compacted once, since its record has `after_boundary`, M) | version move to 6b47107: "ARCH #4 on 6b47107; watcher #9 taking over ROOT" (M) |
| #8 | session_018Bhcefa2wforoAh5zomFNh | 24 Nov 21:04 | mcp_seed | archived | #7 | 5 | ROOT #7; was watcher #9 (M) | ~21:11 → 25 Nov ~02:50 (5.6h) | "handed ROOT to watcher #10" (M); probably a planned refresh, ending at 566k tokens (I) |
| #9 | session_018BhceeYSvKdwxWhuQiuUck | 24 Nov 21:12 | mcp_seed | archived | #8 | 6 | ROOT #8; was watcher #10 (M) | ~02:50 → ~06:51 (4h) | planned refresh at fill: "my context reached ~65% (650k/1M; autocompact ~78%). I deferred refreshing for two wakes…" (M) |
| #10 | session_018BhcedCGhhS8i8Lridx8te | 25 Nov 02:52 | mcp_seed | idle (live) | #9 | 7 | ROOT #9; was watcher #11 (M) | ~06:51 → now (18.7h) | still ROOT, "holding for owner depth reset" (M) |

Why takeovers happened in process3-probes: 2 version moves (#3→#4, #7→#8), and 5 planned refreshes at fill level (#4→#5, #5→#6, #6→#7, #8→#9, #9→#10), of which 2 are M and 3 are I. None followed missed wakes. Gaps between takeovers: 7h, 1h, 5h, 3.5 days, 5.6h, 4h.

A pattern (I): every ROOT starts as a watcher and keeps that context. ROOTs #5 and #9 had spent 7h and 5.6h watching before they took over, so they reached the refresh point soon after taking over.

Live process3-probes roles:

| role | session | created | parent | depth |
|---|---|---|---|---|
| ROOT #10 | session_018BhcedCGhhS8i8Lridx8te | 25 Nov 02:52 | ROOT #9 | 7 |
| watcher #12 | session_018Bhcef9Ew8N32yjjJSBAy6 | 25 Nov 06:54 | ROOT #10 | 8 (M, lineage field) |
| ARCH #4 | session_018BhceewUWSQ9EKrb2nVhd3 | 24 Nov 21:03 | ROOT #7 | 5 |
| coordinator #4 | session_018Bhcedx7Rp4XRCUFihCwvp | 24 Nov 21:16 | ROOT #8 | 6 |

## 3. Fill growth (how fast ROOT's context fills, and why)

### civicsmith ROOT #9 (Opus 5.5)

- **Floor.** The first call already carried 84,954 tokens of context before any read (M). This is probably the system prompt, tool schemas and repository instructions (I).
- **Startup.** The startup reads added about 55k tokens in 2 minutes, reaching 139,662 at 03:59:56 (M). The reads were design 00/01/04/05/06/07 (about 23 KB per part), build 05 (22 KB), the starting texts, and `p4 state read | head -150`. That last command is a read of all records, but cut to 150 lines, so the ~256 KB waiting-work record was not printed in full.
- **Quiet wake.** Each quiet wake runs these steps:
  1. ReadNotifications (3.2 KB wrapper);
  2. Write wakes.json;
  3. `p4 state write wakes`;
  4. `$P state read stop | sed -n 2,6p; $P state read roles | sed -n 2,10p` (one record each, trimmed, 320 bytes);
  5. `list_sessions limit 5` (2.8 KB), or three `get_session` calls (about 9.6 KB).

  No read of all records happens and the waiting-work record is never read (M). Measured growth between wake starts: 22:04→23:04 was +5.9k, 23:04→00:04 was +6.1k, 00:04→01:04 was +5.2k; wakes with three get_session calls were +7.7k to +9.6k (M). **So a quiet wake adds about 6k tokens.**
- **Busy hours.** Busy hours, when roles move or ARCH and lanes are started, add 15–40k per hour (M): 04:13→06:04 was +33k; 10:04→11:09 was +30k; 15:05→16:05 was +16k.
- **Trajectory.** 140k at 04:00, 263k at 10:04, 321k at 13:06, 398k at 18:04, 469k at 01:31 (M). That is about 15k per hour on average after startup. At about 6k per quiet hour it reaches 500k at about 06:30 on 26 Nov, roughly 27h after it started (I). From a fresh start with only quiet wakes, 140k→500k would take about 60h (I).
- **Main cause.** The startup floor and reads (about 140k), then busy-period work. The hourly wake itself is lean.

### process3-probes ROOT #10 (Opus 4.8, high effort)

- **Quiet wake.** Each quiet wake runs these steps (M):
  1. ReadNotifications. The wrapper is 6,001 bytes, because the trigger prompt is about 3.5 KB.
  2. One Bash command that writes wakes and runs `state read stop` and `state read roles` (one record each, 802 bytes).
  3. Three `get_session` calls (about 10 KB).
  4. A short summary.

  No read of all records happens (M).
- **Hidden jump.** On most wakes the context jumps by 34–35k tokens on the first call after ReadNotifications. The jump is not explained by the visible tool result. For example, at 23:48 25 Nov the context went from 337,887 to 373,129 tokens while the visible notification was only 6,001 bytes (M). The same jump of 34.2–35.2k appears at 18:38, 19:48, 20:49, 21:00, 21:47, 23:48, 00:48 and 01:30, but not at 18:48 or 22:48 (M). It stays in context afterwards; the next wake starts from the higher level (M). The cause is unknown. It is something the harness adds around the notification, not tool output (I). A candidate is attachments re-sent after a worker restart (worker_epoch is 29); this needs checking. civicsmith ROOT #9 on Opus 5.5 shows no such jump (M).
- **Per-wake figures.** A wake with the jump adds about 43k tokens (M: 23:48→00:48 was +43.7k; 00:48→01:30 was +43.5k). A wake without it adds about 3–12k (M).
- **Trajectory.** ROOT #10 reached 813,168 tokens and **autocompacted** at 17:48–17:50 on 25 Nov: 814,226 tokens before, 17,626 after, with 99k of context after compaction (M). It had been told to "prefer to run longer (refresh nearer 65-70%) to hold the window open for the owner's reset" (M). It never refreshed, because its successor would be at depth 8 with no valid standby. After compaction it went from 99k to 460k in 7.7h, about 47k per hour (M). From the ~100k floor, 500k is reached in about 9–10 wakes, roughly 9–10h (I). It will cross 500k at about the 01:47 wake on 26 Nov and reach autocompact (about 784k) about 7h later (I).
- **Main cause.** The unexplained ~33k injection per wake, about 75–80% of growth. Next comes the three get_session checks of about 10 KB (I from M figures).

## 4. Sessions created by a scheduled task

- **list_sessions.** Across 7 pages (about 700 sessions, back to 8 Nov), list_sessions shows only the origins `claude_code_mcp_seed`, `desktop_app` and `web_claude_ai` (M). list_sessions leaves out trigger-run sessions (M: the one below is missing from the page that covers its creation time).
- **Most triggers.** Every trigger in list_triggers has `persist_session: true`, and its `last_run.session_id` is the bound session's own id in the `cse_` form (M). So a firing goes into an existing session, creates no session and does not change depth (M/I).
- **One trigger-created session.**
  - **Record.** It is **session_018Bhcee9sccXSYNCS1LxFkg**: title "⚡ process3-probes watcher wake", origin `scheduled_trigger`, **no parent_session_id**, no repository source, Opus 5.5, idle (M).
  - **How it arose.** It was created at 24 Nov 21:18:20.876. Its trigger, `trig_01XvR6QJQmrBnXXyKCSyMQ4z` ("process3-probes watcher wake", cron 17 * * * *), was bound to watcher #8 (session_018BhcefQuGdTUF3KNY3dkT2). Watcher #8 was archived at 20:17:52. The trigger's `persistent_session_id` was re-pointed to the new session at 21:18:21 (M). So when a persistent trigger fires at a gone session, the service makes a fresh session with no parent (I).
  - **Depth.** By the parent chain it is at depth 0 (I). Its lineage field cannot be read from outside.
  - **What it does.** It still fires hourly. Each wake runs `p4 state read` and gets "GitHub access to this repository is not enabled for this session… (HTTP 403)" (M). It sent a mobile push at 25 Nov 22:17 (M). Its prompt still tells it to take over ROOT if wakes are missed (M), but it cannot read the records.
  - **Why it exists.** The old watcher wake was never deleted at takeover (I).
- **What this means (I).** A trigger firing creates a session only in the gone-session case, and that session has no parent, so it starts a fresh chain at depth 0. Even so, the depth-8 refusal also forbids a deep session to "create, fire or re-arm routines", so a session at depth 8 cannot use a trigger to escape.

## 5. Halts caused by the depth limit

- **process3-probes watcher #12** (session_018Bhcef9Ew8N32yjjJSBAy6, depth 8), at **25 Nov 06:57:07**: its `create_trigger` for its own hourly wake was refused with these words (M):
  > "create_trigger: this session is at lineage depth 8 (limit 8), so it cannot start sessions, or create, fire or re-arm routines and reminders. No user or organization setting changes this limit; finish the work in this session or ask the user to start a new session."

  It reported this as a process fault to ARCH and ROOT. ARCH #4 later reported "Relayed the lineage-depth-8 wake fault to the coordinator unchanged" (M).
- **Effects** (M unless marked):
  - Watcher #12 has no wake. No trigger is bound to it in list_triggers.
  - ROOT #10 cannot refresh, so it ran to autocompact at 814k (section 3).
  - ROOT #10's status is "holding for owner depth reset", and ROOT #9 noted "owner's depth reset still pending on the standing page".
  - The owner's remedy, a fresh ROOT by plain prompt, is flagged need_input on coordinator #4's standing page.
- **civicsmith:** there was no refusal. ROOT #6 (depth 5) raised the reset in advance (needs_action, M) and the owner started ROOT #7 with no parent 35 minutes later (M). The transcripts were not searched for other refusals, beyond the summaries and the pages read.
