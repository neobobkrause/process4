# Research: the trial's faults waiting for PROCESS (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Source: the trial coordinator's
standing page ("Faults waiting for PROCESS", `neobobkrause/process3-probes`,
updated 19 Nov 2026 14:35 UTC), read 19 Nov. Verified against the tool and texts
at `process4` `main`. These are the coordinator's evidenced faults; the owner's
own standing page also mentions a separate "eight gaps the builder found in the
texts," which are not in the repository and are to be reconciled with the owner.

Each finding is judged by the process's own rule: a change may only correct or
remove what is broken, never add a test, gate, review or stop; a finding with
nothing measured behind it defaults to "no change".

## The eight faults, and the finding for each

1. **Units job — `check`/`listing`/`related` missing at dfaad79.** Measured
   (jobs hit it). **Already fixed** in `6be2618` (stage 4 added `listing`,
   `notify`, `check`, `related`). No PROCESS change; cleared by moving the trial
   onto the stage-4 commit.
   - Second part: `p4 ready` with no argument stops ("name the pull request by
     its number"); the starting text lists `ready` bare. See fault 5; the job
     supplies its pull request number, so nothing is broken. **No change.**
2. **Money job — `listing`/`check` missing at dfaad79.** **Already fixed** in
   `6be2618.** No PROCESS change.
3. **Shipping/discount jobs — same missing commands.** **Already fixed** in
   `6be2618.** No PROCESS change.
4. **`results` misreports a cancelled run as a failure (PR 330).** Measured.
   **Already fixed** in `6be2618` (the stage-4 work corrected the cancelled-run
   handling; confirmed on the owner's standing page). No PROCESS change.
5. **Told invoice job — starting text gives `close --nothing-to-change "<why>"`,
   tool wants the pull request number (`close <pr> --nothing-to-change`).**
   Measured. The acts list names the act; the job holds its pull request number
   and the command works with it. Nothing is broken. **Recommended: no change**
   (optional tidy: let `ready`/`results`/`close`/`failed-runs`/`notify` default
   to the job's single open pull request — a tool change, offered to the owner,
   not required).
6. **ROOT cannot start PROCESS (cross-repo); the coordinator cannot message it.**
   Measured (the checker refused). **Owner's act, now done:** the approvals of
   `process4` (File A, PR #12) and of `process3-probes` (File B) were widened on
   19 Nov so ROOT may start PROCESS and messages may pass both ways. Cross-repo
   start/message remains **unproven**; confirmed only by trying. No PROCESS text
   change.
7. **The coordinator's standing-note write is refused for a relayed instruction**
   ("Undermining Oversight"). Measured: the owner typed "Instruction: make the
   slot number 2" in ARCH's session; ARCH relayed it; the coordinator's write of
   the slot-number note was refused. It works when the owner types it in the
   coordinator's own session. **PROCESS change prepared** (see below).
8. **A job can finish without reading ARCH's decisions.** Measured: two jobs
   (invoice 336, money 340) met their requirement but missed the decided
   interface (field and option names from ARCH's decision record). The job's
   starting text names the ranking page, not the record of ARCH's design
   decisions. **PROCESS change prepared** (see below). The "every job also
   reports the missing commands" part is fault 1–3, already fixed in `6be2618`.

## The two prepared changes

Considered together as a group (design part 6, section 7). Neither adds a test,
gate, review or stop; each corrects what is broken.

### Fault 7 — design correction (`design/01`, part 1, section 4)

The design let a marked instruction reach the coordinator through ARCH. For the
operational instructions the coordinator records as a standing note — a held
merge, a module put first, a new slot number, a stop, or a request for a full
external walk — the permission checker refuses the coordinator's standing-note
write when the instruction was relayed. This is the same reason a relayed release
consent is not used (design part 3, section 6). The fix rewrites the front-door
bullet so these instructions are typed by the owner in the coordinator's own
session, and names the measured constraint. It adds no rule; it corrects a routing
the checker does not allow.

### Fault 8 — starting-text correction (`starting_texts/job.md`)

The job's required reading named the ranking page but not the record of ARCH's
design decisions, so a job could build without reading the interface decisions it
must meet. The design already expects jobs to follow ARCH's decided interface
(part 2, section 8; part 5, sections 6 and 50 — design decisions are governing
text). The fix adds "the record of ARCH's design decisions" to the job's
read-in-full list. It adds no check; the job simply reads a governing text it was
already meant to follow. The text stays within its limits (3,477 bytes, ten rule
lines).

## Still to settle with the owner

- His approving words for each change, recorded in `process/design-decisions.md`
  (exact, dated), in the same step as each merge (design part 5, section 4).
- Reconciliation of the builder's separate "eight gaps in the texts" with this
  list, if it differs.
- Whether to take the optional tool tidy for fault 5 (default to the job's one
  open pull request) or leave it "no change".
