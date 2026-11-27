# Where the administrator-tool work stands (27 Nov 2026 ~23:00Z, PROCESS #21, written at its refresh)

Read this, then the owner's review document, before acting on the tool. It holds what the owner is after, what was learned
and what is proposed; each line points to the research that carries the detail.

## What the owner is after (his words, 27 Nov, conversation, unmarked)
- Why: civicsmith's tranche t3 ran "on autopilot with little to no regard for the goals and directions it had been given";
  "Flaws in judgment are flaws in Claude's harness … a powerful tool available for overcoming weaknesses that we know about
  is the use of tools that perform tasks mechanically every time."
- What: a tool that is "a stable resource of shared wisdom that process4 sessions refer at defined points in their lifecycle
  to keep sessions with roles in the process on their assigned course": accounting (jobs, lanes), lifecycle transitions,
  reminding sessions of state, policy and direction, a persistent shared memory of facts; it holds the tranche's charter,
  build plan, round state, job-specific instructions and the job pipeline; it "only speak[s] when asked", called "a given
  way at defined points" mandated by Process4.
- Benefits he expects: "a significant reduction in size and scope of the handoff docs"; "a sane administrator function";
  no reporting or acting "from memory"; a coordinator-kept interactive dashboard where he sees, understands and corrects
  where text is generated and whether it is needed.
- Scope: "every aspect of the development process that this tool could support reliably and that would be at least as
  efficient/fast as the AI-based function it would replace" (not only items with a recorded failure).
- His points: one writer to the state; transient state may live where sessions can delete it without him; he will widen
  GitHub token grants; compaction is off; starting texts minimal, the rest fetched from the tool; ARCH's next work and a
  job's goal come from the tool; Cloudflare as shared memory is worth it (priced from his invoice: ~$0 a month).

## How he wants the work done (learned today; keep to these)
- No timing or speed measurements of any kind ("Your measurement tests are known far and wide as not being at all real
  world"); figures already taken were withdrawn. No retest when nothing changed. No artificial Cloudflare trial.
- Put things to him as a document he can review and pick in (a Claude Docs doc), with each item explained: what it does,
  pros, cons, fits with. Plain words.
- Workers: one folder each, narrow briefs in parallel, no instruction later taken back. Check workers' key claims (V).
- A status or fact is stated only from a read of the system (the lesson of PROCESS #20's unchecked claim).

## What was learned (research in this folder)
- t3's causes (`../tranche-t3-study-27nov.md`): his intent never reached civicsmith as a marked word until 02:52; ARCH chose
  next work and widened scope (the design lets it); no scope form says "conversions only"; conversions made fix jobs in
  other modules; case-checker waited six hours (held, not holding); tool faults and GitHub limits.
- Storage (C, F, G): a never-merged state branch is how process3's account came to be suspended (1,387 pushes in 19 h);
  GitHub's 500 writes an hour across the account; comments hold 65,536 characters; Cloudflare (a Worker, one Durable Object
  or D1 per product) is consistent, cheap and solves cross-repository reads, at the cost of new code, approvals, a network
  secret and one host.
- Hooks (J): in nested sessions they behaved as documented (PostToolUse sees the harness's reply; a Stop block kept a
  session working; an unreachable service broke nothing). Not yet seen in Process4's cloud sessions; process3 lost hooks
  after a resume and its Stop hook "held sessions against your stop".
- Design and build (H, I): the store is the one writer; owed acts are worked out when asked, not stored; facts reported twice
  must be harmless; a brief needs a size bound; one shared key proves no role; the full tool is about another tool's size.
- Evidence (K): sixteen recorded failures mapped to the items.

## What is proposed (the review document, https://claude.ai/artifact/RDKPVKMMCVcQ3EuUrudb3A)
28 functions in six groups: A course (A1 charter, A2 plan, A3 job brief, A4 his words, A5 his stop), B accounting (B1 ledger,
B2 hooks record acts, B3 owed acts kept working, B4 what didn't happen, B5 merge queue with Y, B6 owed notices, B7 flaws, B8
wakes), C memory (C1 brief, C2 handovers shrink, C3 sizes measured, C4 statuses from the tool), D his view (D1 dashboard, D2
account and report, D3 relays), E platform (E1 Cloudflare, E2 hooks), F (F1 names, F2 replacing, F3 walks, F4 phase, F5
edit and drop, F6 moves and switches). Recommended: all 28 (part M), with conditions: hooks with B4 as backstop; A5, B3, C3
on his explicit word (gates); E1 needed by the full set. What stays with AI: where a flaw belongs, interfaces, lanes'
designs, walk areas, flaw or not, plain words to him, what his charter leaves open.

## Open with him
- His picks in the document, and one marked line making them his decision.
- Whether a comment he sends from his page, pre-filled by a button, counts as typed by him (asked; unanswered).
- The store (Cloudflare or GitHub), the account, approvals wording, the network secret, hooks in products' settings.
- Earlier choices still waiting: X, Y, A/B/C (tool faults; pdf-pixels stopped), S, H, V, archive-at-the-act, Z.

## Next, on his word
Turn the picks into a staged build plan (smallest useful stage first, tried where the real work is, no artificial trial),
draft the approvals wording for him to approve, then build with workers. civicsmith stays halted until he says.
