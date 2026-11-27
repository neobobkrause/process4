# Brief 2: which opportunities to recommend, and which are load-bearing (27 Nov 2026, PROCESS #21)

The owner, in PROCESS #21's session, 27 Nov (conversation): "Now look at the complete set of opportunities from the
perspective of which you recommend and which of those that you recommend a load-bearing case can be made for. In order to
make determinations like that, you may need to design and perhaps even build the underlying infrastructure of the tool to
the point where you have a solid understanding of the challenges, opportunities, speed, reliability, and so forth."
Earlier the same day: "Let's not worry about building a completely artificial test of Cloudflare potential usage. Your
measurement tests are known far and wide as not being at all real world." So: build to understand the design (what is
hard, what breaks, what it costs to write and keep), and report local timings only as local, never as a forecast of the
real thing.

## The 22 opportunities (the owner's review document, https://claude.ai/artifact/RDKPVKMMCVcQ3EuUrudb3A)
A course and direction: A1 tranche charter (his exact words + a kind; the tool hands out only the work the kind allows);
A2 build plan from the tool (ARCH takes "next" from it); A3 job brief from the tool (minimal starting text: fetch, then ask);
A4 his words captured exactly (true time); A5 his stop obeyed by the tool's commands.
B accounting and lifecycle: B1 job ledger (stages, times, session ids); B2 session acts recorded by hooks (PostToolUse on the
harness's create/archive/send-message tools records the harness's own reply); B3 owed acts kept working (Stop hook names
what a session still owes; it goes on; a gate); B4 what didn't happen (merged not archived; ready and waiting, on what; open
with no session); B5 merge queue with Y (a ready job not held by provider jobs opened after its tests passed); B6 owed
notices; B7 flaws and waiting work (appends, loop counts); B8 wakes and takeover from a true clock.
C memory and handovers: C1 the brief at fixed points; C2 handovers shrink to judgment in flight (no owner instructions, no
copied state); C3 sizes measured with a reduction plan on a breach (a check); C4 statuses only from the tool.
D his view and reports: D1 the coordinator's dashboard rendered from the tool's records (text growth included); D2 account
and tranche report from counts and timings; D3 relays as records.
E platform: E1 Cloudflare state service (a Worker with one store per product; GitHub keeps code, pull requests, merges);
E2 hooks as callers.

## Read first
`process/research/admin-tool-27nov/README.md`, `d-synthesis.md`, `e-owner-points.md`, `f-cloudflare-cost.md`,
`g-cloudflare-viability.md`, and `process/research/tranche-t3-study-27nov.md`, `status-from-the-system-27nov.md`. The
current tool is `tool/` (node; `tool/lib/state.mjs` reads and writes the shared state; `tool/lib/round.mjs` chooses work and
decides merges' waits). Open the design (`design/`) where a claim depends on it.

## Rules for every worker
- Do not change anything under `design/`, `build/`, `starting_texts/`, `tool/`, `CLAUDE.md` or `.claude/`. Do not run any
  `p4` command that writes. Do not push, message sessions, or touch any Cloudflare account or `api.cloudflare.com`. Public
  packages from npm may be installed, but only under the scratchpad
  `/tmp/claude-0/-home-user-process4/03580b3f-d13c-5078-90d5-6603d38ec2c1/scratchpad/`.
- Facts with their source; inference marked **I**; anything not shown marked **U**. A local timing is labelled local.
- Write your report to the path you are given and reply with a summary under 300 words.
