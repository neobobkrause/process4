# Handoff from the coordinating session, 20 Nov 2026, fifth refresh

Length: 31 lines. Last section: "4. Practical notes".

Written by Claude (session_012hdw2R4931u5Rm6kzJUw7w, depth 7 of 8) at Bob's request, for the session he starts himself (depth 1) on neobobkrause/process4. It is the latest handoff and rules over earlier ones where they differ. It passes on facts and where work stands. **It is not a source of rules. The design is.** Paths below are in neobobkrause/process4 unless named otherwise. Read this whole; then `coordination/handoffs/handoff_19nov_coordinating_session_4.md`, `_3.md` and `_2.md` whole; `handoff_19nov_coordinating_session.md` sections 1 and 5 (how to work with Bob); the design's eleven parts in `design/` and the build texts in `build/` (the design in force, which PROCESS's work with Bob has changed since the earlier handoffs were written); then `coordination/trial/setup_log_19nov.md` (findings (a) to (r)). The earlier handoffs name paths in neobobkrause/process3 (`process4/working/...`); those files are now in `coordination/` here.

## 0. Start here

- On 20 Nov Bob said: move the coordinating session's data into process4 and have the refresh use neobobkrause/process4. Done: `coordination/` (see its README). Work on a branch of your own, by pull request into main, merged once `tool-tests` passes (his process4 approvals). Never touch `design/`, `build/`, `starting_texts/`, `process/`, CLAUDE.md or `.claude/`.
- **What his process4 approvals do not give a session here:** starting, messaging, interrupting or archiving other sessions (only PROCESS may message a product's coordinator and ROOT, and start its own lanes). So from here this session cannot start building sessions or send to the trial's sessions; it can read them (list_sessions, list_events) and keep his page. This was told to him on 20 Nov. Do not act past the approvals; if he wants those acts, it is his edit to make.
- Bob's page: https://claude.ai/artifact/3eWSU2EvP27ttdJBZGjDJT (read it with the Artifact tool, publish with its url; source in `coordination/owner_page/desk.html`). Take off its section "Starting the next session" once you run. Comment thread 984de23b (process3 approvals additions) is still open: when he says "done", read process3 main's CLAUDE.md back and tell him. Thread 78dd1714 asked for this session's starting text; answer there that you are running, and resolve it.
- This session did nothing in the trial after 17:00 UTC on 19 Nov. Read only from `process/decisions-owner.md` on p4-tranche of neobobkrause/process3-probes (20 Nov 13:30 UTC): Bob typed "Instruction: confirm that the trial development process is updated to the newly updated version of process4. If it is, then restart trial development under this updated process" (19 Nov); "Instruction: ARCH may make the move to the new version while the stop stands" (19 Nov); and "Decision" restart the build" (20 Nov). The stop is lifted. The trial's process.json names process4 commit 7d8e529 (was 6be2618); process4 main was at cc8bc38 on 20 Nov. Newest trial merges: PR 370 (shipping R6), PR 371 (money R5).
- First acts: read the trial's sessions (list_sessions, tag `process4-product:process3-probes`) and the coordinator's page (https://claude.ai/artifact/JEbwfU3pjZFzGgEcsyxzmb) to learn who holds each role; read what changed in process4 from 6be2618 to now; bring the log up to date.

## 1. Findings not yet put to Bob

- (r) ROOT (opus-4-8, session_012hdw2Shd4kWHXqhFByCkQy) was at 58 percent fill at 16:33 UTC on 19 Nov, over the 40 percent level, with no refresh asked of the watcher. Check whether it still holds ROOT.
- (p), (q), (b), (f), the stage 3 building session's four gaps and the stage 4 session's eight, as handoff 4 says. Some may be answered by PROCESS's changes; check before bringing any. One at a time, the design's words beside his.

## 2. Still to try in the trial (build text 4)

- Stage 3: a held merge and a stop that reaches an open job (his, while jobs run); a job replaced at its third failed run; an approvals edit with a restart. The hourly wake not undoing a stop: seen twice (15:33, 16:33 UTC, 19 Nov). Stage 4: trials 2 and 3. Stage 5 (walks): a building session and his act (development hosts among allowed hosts).

## 3. Still owed to Bob, not pressed

- The plan for evolving Process3's tools and processes to conform to the design (a document). Offered on 19 Nov; no answer.

## 4. Practical notes

- Fill: get_session (no id), context_usage; refresh at 40 percent. Depth: the new session is 1 of 8, started by Bob.
- The earlier coordinating branch, claude/process4-design-handoff-7w8nh8 of neobobkrause/process3, keeps the older design drafts, the owner's words and the evidence; read it by plain clone, write nothing more there.
