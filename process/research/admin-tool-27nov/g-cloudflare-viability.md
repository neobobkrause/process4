# Part G: Cloudflare as the tool's shared memory — speed, integration, other issues (27 Nov 2026, PROCESS #21)

The owner, 27 Nov (conversation): "What about speed, latency, integration with the tool's code, and other issues? Is this a
viable/attractive option given that github account limits simply can't support the tool's expected traffic?"

## Speed
Timings taken here on 27 Nov were withdrawn at the owner's word the same day (measurements made outside the real
solution are not relied on). What the documentation states: a Durable Object lives in the data centre near its first
caller and stays there, and handles about 1,000 requests a second (`f-cloudflare-docs.md`).

## Is GitHub's limit the reason? What the record shows
GitHub's content-write limit is the whole account's: 80 a minute, 500 an hour (design part 6 §3). civicsmith at 8 slots
runs an estimated 184–352 an hour (`github-limits-account-27nov.md`, inferred). The tool's full form adds about 48 an hour
for a job ledger and 24–48 for owed notices (part B, B3, B8), to about 270–450: near or past the 95% margin (475) at the top,
before hooks recording every session act or a dashboard's reads. Reads have their own limit (5,000 an hour); the round's
commands read every job pull request's comments (B, cross-cutting). So: today's records fit; the full tool very likely
does not, at civicsmith's pace. Not measured.

## Speed and latency
- Every GitHub write is spaced and counted against the account's shares (K1–K5; `tool/lib/pace.mjs`), which can make a
  write wait; the state service has no such budget.
- Strongly consistent: a session reads what the last write left (docs). GitHub comments are too, but a record over 65,536
  characters is written in parts, not at once (C §1.3).

## Integration with the tool's code
- The tool already reads and writes the shared state through one module (`tool/lib/state.mjs`: `readRecords`,
  `writeRecord`). A second backend there (an HTTPS call with JSON) leaves every command's logic as it is.
- New code: a small Worker and Durable Object (SQLite; a table per record or kind, one object per product) and its tests,
  run locally on workerd (the runtime civicsmith's tests already use). Deployed with Cloudflare's own tool from a session
  holding a deploy key.
- Authentication: one key, held as a network secret for the Worker's exact host and injected by the proxy, so no session
  sees it (`f-cloudflare-docs.md`; environment docs).

## Other issues
- Approvals: Process4's names no Cloudflare account; each product's approvals cover only deploying that product. Both need
  his wording for the state service. Which account: the product's development account (already on the paid plan) or one
  of Process4's own; the free plan's limits for this use were not checked.
- Network: the Worker's host is not allowed today; the network secret for that host allows it.
- The permission checker: a session's call to a new host may be judged as sending data outside; the environment's
  `autoMode` settings would name it as internal work (design part 7 §5). **U.**
- A new dependency: when Cloudflare is down, the tool's state is unreachable (as GitHub's is when GitHub is down; code and
  pull requests still need GitHub).
- Design: parts 1–6 name no host. The store becomes a term ("the state service") with its carrier in part 9.
- What it also solves: product sessions cannot read the process repository's state, or the reverse (design part 7 §3); a
  service both reach removes that refusal (PROCESS reading a product's state, a coordinator reading PROCESS's liveness).
- A halt and an account switch: the store is durable, so nothing need be saved or loaded; an export to the repository at a
  tranche's end, if wanted, is one commit. An account switch of Claude leaves it untouched; the network secret is entered in
  the new environment.

## Assessment (for the owner)
Viable, and attractive for the full tool: no GitHub write budget spent on state, no comment size limit,
no lost writes, cross-repository reads solved, near-zero cost. Against: new code to build and keep (Worker and object), a
second service, his approvals and settings, the checker unproven on the new host, and Process4 tied to one host.
