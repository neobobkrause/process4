# Research: "Unsanctioned Communication" refusals of PROCESS↔product acts (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). **This file was first written with a
wrong diagnosis (that File B lacked the wording) and is rewritten here from the
sessions' own transcripts; the owner's exact dated words are never edited, but this
is PROCESS's own research, so it is corrected in place.**

## What was measured

- At the owner's request PROCESS sent a test message to the trial coordinator
  (`session_012hdw2S6LmPRuy6GVXBtScB`) at ~17:51Z — **delivered**.
- The coordinator's **reply** to PROCESS (~17:52Z) was **refused**. Exact reason
  from its transcript: *"Permission for this action was denied by the Claude Code
  auto mode classifier. Reason: [Unsanctioned Communication]. … You *may* attempt to
  accomplish this action using other tools."* (a `send_message` to
  `session_012hdw2UKJgbfzjKvHCV4eMY`).
- ROOT's act refused at 17:41Z was a **same-repository** `create_session`
  (refreshing the coordinator onto c6dec02), **not** a cross-repo act. ROOT's own
  words: *"identical creates had worked,"* so it treated it as a **transient
  classifier refusal**, kept the old session, and planned to retry at its next
  hourly wake. ROOT wrote a harness note: *"create_session can be refused
  transiently ('Unsanctioned Communication') — keep the old session and retry next
  wake."*

## Corrected diagnosis

The refusals are **nondeterministic false positives from the Claude Code auto-mode
permission classifier**, not an approvals-wording gap.

- **File B already authorizes the act.** The product's `CLAUDE.md` says product
  sessions may *"start one PROCESS session in the repository neobobkrause/process4 …
  and message, interrupt and archive it,"* and may *"start, message, interrupt and
  archive Claude sessions working on Process3 or those products."* So both the
  coordinator→PROCESS message and ROOT's coordinator create are sanctioned by the
  committed approvals. **No File B change would fix this; my earlier proposed clause
  is withdrawn.**
- The auto-mode classifier is an independent AI judge (design part 6, section 1
  lists "the permission checker" as one of three things that hold a rule). It
  refused acts the approvals permit — a same-repo create and a cross-repo message —
  having allowed identical acts before. The classifier message itself invites
  retrying/other means.
- So this is a **harness behaviour** (classifier nondeterminism) intersecting with
  Process4's **never-retry rule**.

## The real fault: never-retry is too blunt for non-substantive refusals

The design treats every checker refusal as authoritative and bars rework (part 1,
sections 6–7; part 6, section 4). That rule exists to stop a session
**circumventing a refusal of an act the approvals do not allow**. But two refusals
measured on 19 Nov are **not** of that kind:

1. **Classifier noise** (this file): a transient false refusal of an act the
   approvals DO sanction. ROOT improvised the right handling (keep prior state,
   retry at next wake, escalate if persistent); the coordinator, reading the rule
   strictly, abandoned its reply to PROCESS. Handling is inconsistent and undefined.
2. **A malformed command** (see `coordinator-gh-in-tool-command-19nov.md`): a
   forbidden command mixed into a legitimate tool command; the legitimate act was
   never cleanly attempted.

Both share a root: the never-retry rule does not distinguish a **substantive**
refusal (the act is not permitted → never rework) from a **non-substantive** one
(classifier noise, or a self-inflicted malformed command → the sanctioned act may
be re-attempted). Fault 7 (a relayed consent) is different and genuinely not
retried; keep it apart.

## Options (fold with the coordinator-gh item; one coherent clarification)

Each clarifies/corrects; none adds a test, gate, review or stop (rule 2).

- **A — No change.** Keep strict never-retry; rely on ROOT-style improvisation and
  the owner's relay. Cost: measured breakage (the coordinator can't confirm to
  PROCESS; refreshes stall on noise); inconsistent handling; the owner's words can
  be lost (the gh case).
- **B — Clarify never-retry (recommended).** A session may re-attempt an act **its
  approvals sanction** when the refusal is non-substantive — a transient classifier
  refusal (an identical act worked before / the classifier itself invites retry), or
  a self-inflicted malformed command re-issued cleanly. Bounded: keep prior state,
  retry at the next wake or after a short delay, and escalate to the owner if it
  persists. Guards kept: a genuinely-unsanctioned act is never reworded; the
  three-refusals-in-a-row stop still applies. This standardises ROOT's sensible
  behaviour and unblocks the coordinator→PROCESS reply.
- **C — Also document the classifier behaviour** in the Claude Code harness table
  (design part 7 / "Not proven on Claude Code"): the auto-mode classifier can
  transiently refuse cross-session acts the approvals permit; sessions handle it per
  B. A process change, merged the usual way.

## Note for the charter discussion

File B is correct as-is for this; the fix is in Process4's own design/texts (B, C),
which is squarely PROCESS's to make on the owner's word — no product-repo change
needed here. But PROCESS could only confirm File B was adequate once the owner
pasted it; PROCESS cannot currently read the product repos' governing files, which
bears on the broader charter question raised 19 Nov.
