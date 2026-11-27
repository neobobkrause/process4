# An administrator tool for Process4: the study (27 Nov 2026, PROCESS #21)

Asked by the owner in PROCESS #21's session, 27 Nov (conversation): a tool that is "a stable resource of shared wisdom that
process4 sessions refer at defined points in their lifecycle to keep sessions with roles in the process on their assigned
course"; "how far could process4 requirements benefit from offloading features/responsibilities/constructs from AI to a
mechanical tool like this". His exact words are in `brief.md`.

- `brief.md`: the owner's ask, why, what exists, how the workers worked.
- `a-roles-and-owner.md`: part A, twelve opportunities on the roles and the owner's side (charter, his words, handovers,
  names, sessions check, wakes, stop, relays, dashboard, account, known weaknesses, `brief`).
- `b-work-pipeline.md`: part B, seventeen on the work (charter and scope, plan, job ledger, anomalies, merge queue, job
  instructions, flaws, notice ledger, slots, blocks, replacement, account, walks, phases, edit and drop, relays, timings).
- `c-storage-triggers-rules.md`: part C, where state can live (issue comments, a never-merged branch, and four others; why
  process3's state branch went wrong), hooks and GitHub events as callers, the rules that bound a tool.
- `e-owner-points.md`: his points answered: one writer; a deletable state branch (his approvals and rule); a dedicated state session (not better: a model turn per step, still needs a store); hooks record archives and new sessions from the harness's own answers, a Stop hook names owed acts (a gate, his word); ARCH's next work and a job's goal from the tool (cause 2 largely answered under T2); page comments as his words (his to settle; one trial for the checker).
- `f-cloudflare-cost.md`: process3's state traffic priced at the invoice's Cloudflare prices: about $0 a month on the plan already paid (D1, or a Durable Object that hibernates), at worst $12.50 if a running object carries the account into the next million GB-s. `f-cloudflare-docs.md`: Cloudflare's documentation on the four stores, billing and access.
- `g-cloudflare-viability.md`: Cloudflare as the shared memory: GitHub read 0.9 s a command vs Cloudflare's edge 0.12 s (measured); the full tool likely past GitHub's account limit at civicsmith's pace; one backend module to swap; approvals, network, checker, one host.
- The owner's review document (27 Nov): "Process4 administrator tool: opportunities for review", https://claude.ai/artifact/RDKPVKMMCVcQ3EuUrudb3A: 22 opportunities in five groups (A course, B accounting and lifecycle, C memory and handovers, D his view and reports, E platform), each with pros, cons and fit, a pick per row, and what each needs from him; Cloudflare assumed as the state service. He was told it was "Not real world" measuring is not to be relied on; no artificial Cloudflare trial.
- `d-synthesis.md`: one merged list of 18 items, how they form one tool, storage, the dashboard, 18 gaps in the current
  design, a staged path (stages 0-4), what each needs from the owner.

Checked by PROCESS #21: the tool reads the `stop` record in no command (`tool/lib/state.mjs` names it only); the round
record's 89,773 bytes is civicsmith's state as read on 25 Nov (`uses-metadata-25nov/civicsmith-state.md`), not now.

Options put to the owner (not decided): 0 no tool, text only (V, H, A, Z, S); T1 stages 0 and 1 (text, then read-only
prints: `brief`, the anomalies and sessions check, the merge queue, the plan; no new state, no store decision); T2 T1 and
stage 2 (the tranche's charter with X, his words captured, his stop obeyed by the tool, Y); each later stage on his word
after the one before has run on process3-probes. Store: stay on issue comments with most state derived (option a, the
middle course); a never-merged branch (b) not recommended (process3's suspension, part 4 §4, permanence). Recommended: T2.
