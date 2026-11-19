# Research: product sessions cannot message/start PROCESS across repositories (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Measured: at the owner's request
PROCESS sent a test message to the trial coordinator
(`session_012hdw2S6LmPRuy6GVXBtScB`, in `neobobkrause/process3-probes`) at ~17:51
UTC — **delivered**. The coordinator's reply to PROCESS was **refused** by the
permission checker ("Unsanctioned Communication"); ROOT's cross-repo act toward
PROCESS was refused the same way at 17:43 UTC. Reported by the owner, relaying the
coordinator's own finding.

## Diagnosis

- A session loads **its own repository's** standing approvals at start (design part
  6, section 2). The product's standing roles (ROOT, the coordinator, ARCH) run in
  the **product** repository and load **File B** (`process3-probes` `CLAUDE.md`).
- File B sanctions messaging/starting only sessions **working in the product
  repository**. PROCESS works in the **process** repository. So a product session
  messaging PROCESS, or ROOT starting PROCESS, is **cross-repository** and the
  checker refuses it as "Unsanctioned Communication".
- The reverse works: **PROCESS → coordinator delivered**, because **File A**
  (`process4` `CLAUDE.md`) sanctions PROCESS's own outbound side ("message that
  product's coordinator and ROOT"). Inbound receipt by the product session is not
  gated — the message arrived; only the product session's **outbound** send/start
  toward another repository is refused.
- So each side's act is governed by **that side's** approvals. File A covers
  PROCESS's side (correct). File B does **not** sanction the product side's
  cross-repo acts. The earlier handover/report that "the approvals were widened so
  messages pass both ways" was wrong for File B — it was never verified by running,
  and the owner's test now disproves it.

This is **not** a harness limit: PROCESS→product cross-repo messaging works, so the
channel exists. It is an **approvals-wording** gap on the product side.

## What the design requires of a product's approvals (and currently is unstated)

The design's fault path (part 6, section 6) and ROOT's duties (part 4, section 2;
part 6, sections 3 and 5) require, from the **product** side:

1. **ROOT may start PROCESS** in the process repository (and record/read that it is
   running there — `state read --repository`, already sanctioned as a read).
2. **The coordinator may message PROCESS** in the process repository (the fault
   chain session → ARCH → coordinator → PROCESS ends in this message).

Both are cross-repository session acts. File B must sanction them, or the fault
path and ROOT-starts-PROCESS cannot work, and faults reach PROCESS only through the
owner (as now).

## The boundary on PROCESS

PROCESS may **never** write, edit or relay the owner's approvals (rule 10; design
part 6, section 2 — "No session writes, edits or relays it"), and acts on no
repository but this one. File B is the **product's** approvals, in the **product**
repository. So PROCESS cannot fix this directly. PROCESS's part (design part 6,
section 2; part 10, section 1, item 8) is to **propose the wording**; the owner
commits it himself, and the product ROOT restarts to load it (approvals load only
at start).

## Proposed File B wording (for the owner to adopt — NOT approvals until he commits them)

To add to the product's standing approvals, in his own voice, minimally:

> ROOT may start PROCESS in the process's repository (`neobobkrause/process4`), and
> may record and read there that PROCESS is running. The coordinator may message
> PROCESS in the process's repository, and ARCH and the coordinator may receive its
> replies.

This adds no test, gate, review or stop; it sanctions exactly the two cross-repo
acts the design already assumes. After he commits it, the trial ROOT is restarted
so the standing roles load it; then the coordinator→PROCESS reply is tried again to
confirm (my outbound already works).

## Options

- **A — Owner adds the File B wording + restart (recommended).** Makes the design's
  fault path work; least change; keeps faults off the owner's manual relay.
- **B — No approvals change; accept the owner as the relay.** Faults reach PROCESS
  via the owner's standing page, as now. Then a small Process4 design clarification
  should say so (so part 6 §6 is not read as a promise the approvals don't keep).
- **C — Also add a Process4 design/text clarification** (a process change, merged
  the usual way) stating that a product's approvals must sanction ROOT starting
  PROCESS and the coordinator messaging PROCESS cross-repo — so no future product
  repeats this. Pairs with A.

## Open / needs the owner to relay (product sessions cannot answer PROCESS yet)

- The exact act and reason text ROOT was refused at 17:43: was it **ROOT starting
  PROCESS** cross-repo (covered by A), or **ROOT starting a same-repo coordinator**
  (which would be a separate anomaly, since ROOT started coordinators earlier in the
  trial)? I cannot ask the product sessions directly until A is in place.
