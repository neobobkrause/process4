# Research: a refreshed coordinator cannot determine the live PROCESS (20 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Source: the owner's report, 20 Nov 2026 —
"When the trial product's coordinator is refreshed, it's unable to determine which session is
the current PROCESS." Measured here against the live trial sessions, the tool, and the texts at
`process4` `main` (`1b19568`). This is a **measured process fault** (it happened), so rule 6's
"no change by default" does not apply.

## What was measured

- The live trial coordinator, `session_012hdw2TiGHJ2cGSkBVR1fRc` ("process3-probes coordinator
  #1"), is **blocked**, asking the owner on his page: *"Which session is PROCESS: the 20 Nov
  14:06 UTC one (A), or none (B)?"* The 14:06 session (`session_012hdw2UWLxH6BY5gyh3Lp4w`) is an
  **archived** former PROCESS; the **live** PROCESS is `session_012hdw2Use8KHcTuQ4WjvjL6`
  (this one), recorded in `handover-process` at 16:34Z — before the coordinator refreshed at
  ~17:21Z. So the coordinator never saw the current record.
- Its transcript shows it ran exactly `p4 state read handover-coordinator; p4 state read
  handover-process --repository neobobkrause/process4`. The tool returned, verbatim:
  **"p4 state read: GitHub refused: gh: GitHub access to this repository is not enabled for this
  session. Use add_repo to request access. … (HTTP 403)."** Its page then says: *"I could not
  read PROCESS's own record of itself from this session."* My session id never appears in its
  transcript — the cross-repo read simply failed.
- **The gate is per-session scope, not visibility.** From this PROCESS session (scoped to
  `process4`) a cross-repo `state read --repository neobobkrause/process3-probes` is refused with
  the same 403; so is `--repository neobobkrause/process3`, which is **public**. So a public repo
  does not help: a `gh api` read of *any* repo not attached to the session is refused.
- **`add_repo` for a public repo returns `read_available`:** "it is a public repository and this
  session's git proxy serves anonymous git reads (clone/fetch) … Nothing was attached. … GitHub
  API tools (issues, pull requests) … do not cover unattached repositories. For any of those,
  call add_repo again with access:'push' to attach it with credentials." So **plain git
  clone/fetch of the public process repo works, but reading its shared-state *issue* (gh api)
  needs a credentialed `push` attach.**

## Root cause

**Decision C (19 Nov 2026) rests on a cross-repository `gh api` read that the harness refuses.**
Decision C moved PROCESS's liveness to the process repo's `handover-process` record and had the
coordinator find PROCESS by `state read handover-process --repository <the process repo>` (design
part 6 §7; build text 5 §4). That read is a `gh api` call against another repo's issue, which is
refused (403) for a session scoped to its own repo. The process repo is public and can be
plain-cloned (the read-only tool copy), but the **shared state lives on a GitHub issue**, reached
only by `gh api` — exactly the call the session cannot make cross-repo. Decision C's mechanism was
never measured; it is now measured to fail. The coordinator's fallback (ask the owner which
session is PROCESS) runs on every refresh, interrupting him — the opposite of what decision C
intended.

Underlying constraint, now firmly measured: **cross-repository `gh api` reads are blocked in both
directions; cross-repository *messaging* (session→session) works (design part 7 §3); cross-repo
session create/archive is refused.** So neither the coordinator (product repo) nor PROCESS
(process repo) can *read* the other's GitHub shared state; they can only *message* each other, and
each can read/write its **own** repo's shared state.

## Why `add_repo` is not a clean fix

To gh-api-read the process repo's issue, the coordinator would have to `add_repo neobobkrause/
process4` with **access:"push"** — attaching the process repo to every product coordinator **with
write credentials**. That breaks Process4's separation (product sessions may not change the
process; design part 6 §3) and over-grants far beyond the read it needs; branch protection would
still block pushes, but handing credentials is the wrong shape, and the checker's acceptance is
itself unproven. Rejected except as a last resort.

## Options (considered as a group; design part 6 §7). None adds a test, gate, review or stop.

### A — No change
Keep decision C; the coordinator asks the owner each time it cannot read the record. **Cost
(measured):** the owner is interrupted on every coordinator refresh; the coordinator can forward
no process fault to PROCESS on its own. This is the status quo the owner hit.

### B — `add_repo` the process repo with push credentials, then read as decision C intends
Smallest change to the text, but over-grants (above) and is unproven. **Not recommended.**

### C — (recommended) Keep PROCESS's liveness in the PRODUCT repo, kept current by cross-repo
### messaging (the proven channel), read locally by the coordinator
Revert decision C's cross-repo read. Concretely:
- The coordinator finds PROCESS from the **product's own `roles` record `process` field** (a
  local read of its own repo — never cross-repo), and messages that session for a fault
  (cross-repo *message* — proven).
- The `process` field is written by **ROOT** (its sole writer, a local write). ROOT learns the
  live PROCESS from a **cross-repo message PROCESS sends it on start** ("I am PROCESS, session X,
  generation N"). No session ever writes another repo's state.
- **Bootstrap** (both cross-repo reads are blocked, so PROCESS must learn ROOT's address by some
  seed): PROCESS keeps the product's ROOT (and coordinator) address in its **own**
  `handover-process` record (local to PROCESS), seeded once by the owner when PROCESS first serves
  that product; a later PROCESS reads it locally and re-announces itself, so the owner is involved
  only once per product, not per refresh.

This uses only proven capabilities (same-repo state read/write; cross-repo messaging), restores
the product `roles.process` field that decision C had sidelined, and closes the exact gap decision
C's own research flagged ("a PROCESS the owner starts is not reported to ROOT by any defined
step") by *defining* that step as a message. It changes design part 6 §7 and part 4 §5 (the
PROCESS-liveness mechanism), build text 5 §2/§4, and the PROCESS, ROOT and coordinator starting
texts.

### D — Lighter: the coordinator persists the owner's answer locally, so it never re-asks
Keep the owner as the bootstrap but stop the repetition: when the `roles.process` field is empty
or names a dead session, the coordinator surfaces to the owner **once** "name the current
PROCESS"; ROOT writes the answer to `roles.process`; thereafter refreshed coordinators read it
locally and do not re-ask. The owner is touched once per PROCESS *generation* (rare, and he is
present then anyway), never on a mere coordinator refresh. Less machinery than C; a little more
recurring owner touch. C and D share the same local-read core and can be combined (C's
auto-announce with D as the fallback when a message is missed).

### E — (worth measuring) The coordinator finds PROCESS by the harness session list, by its
### standardized name
Now that sessions are named `PROCESS #N` (settled 20 Nov), the coordinator could find the live
PROCESS as the running session titled `PROCESS #N` via the account session list (`list_sessions`),
which is account-level, not repo-scoped — no cross-repo `gh api`, no owner, no registration. This
PROCESS session used `list_sessions` to find the trial coordinator, so the capability exists here;
whether a product role session in Auto mode has it is unmeasured. It departs from the design's
"resolve a role from the shared state" principle (it resolves by harness session title, part 7),
so it would be a harness-table mechanism with that caveat. Promising and light if the capability
holds; measure before adopting.

## Recommendation

**C**, with **D** as its fallback (local read of `roles.process`; kept current by PROCESS→ROOT
messaging; owner-seeded once per product; owner-named once if a message is ever missed). It is the
robust fix that uses only proven channels and keeps the shared state on GitHub as the design
requires. **E** is worth a single trial measurement; if `list_sessions` works for a product role
session, it could replace the bootstrap entirely, but it should not be the sole mechanism until
measured. **B** is rejected (over-grant, unproven). **A** leaves a measured, recurring
interruption in place.

## Note on decision C

This supersedes decision C's **mechanism** (coordinator reads `handover-process` cross-repo), which
is measured not to work; it does **not** reopen decision C's settled point that the owner starts
and refreshes PROCESS (option C of 19 Nov) — that stands. The `handover-process` record keeps
carrying PROCESS's liveness for PROCESS's own successors; what changes is that the *coordinator*
no longer reads it cross-repo.

## Still to settle with the owner

His marked choice among A / B / C / D / E (C recommended, D as fallback), recorded verbatim in
`process/design-decisions.md` with the date, in the same step as any merge. Separately, the trial
coordinator is blocked right now; PROCESS may message the product's coordinator under the owner's
standing approvals, so on his word I can tell it the live PROCESS to unblock it at once — a
one-off, not the fix.
