# The build plan: a sequence of purposes with completion conditions (27 Nov 2026, PROCESS #22)

Asked by the owner in PROCESS #22's session, 27 Nov, after the admin-tool study (`admin-tool-27nov/`, items A1,
B1, B2) and the t3 study (`tranche-t3-study-27nov.md`). His words, this session:

- "A1 would enable us to set the purpose of a round... the purpose of the current round may differ from that of
  the next round... after the stated purpose (charter) of the current round is met no matter how many rounds it
  takes to get to that point. ... A1 should enable the owner to state the purpose of the current round along with
  the condition that must be met in order for the purpose to change to the next stated purpose or to the default
  purpose. (For example, a round/tranche that converts every module would be followed by a round/tranche that takes
  on the refactoring, which would then be followed by a 'regular' tranche that takes on unmet requirements, flaws,
  and notices.)"
- "Earlier versions of the process would create an initial build plan [that] would end up being too large for a
  session to hold. So there was a pipelining process... complicated. But the tool we're considering may provide the
  opportunity for a fresh build plan management system that's simpler because it doesn't clog ARCH's or the
  coordinator's context because it's held in memory, which there's more of. This build plan will be the scope of the
  round/tranche."
- "not add new rules when changing existing rules (with a properly light touch) is better."

## The model

The **build plan** is an ordered list of **purposes**. Each purpose holds: the work it takes on (its scope), and
the **completion condition** that ends it. The *current* purpose sets the current tranche's scope. When the current
purpose's condition is met — across however many rounds and tranches — the plan advances to the next purpose, and
when none remains, to the **default purpose** (all unmet requirements, flaws and notices are work; ARCH decides the
scope; a tranche ends when its walks come clean — today's behaviour). Where the owner states no build plan, the
default purpose stands from the start, so nothing changes for a product that wants no phases.

A purpose governs at the **tranche** level: it persists across successive tranches until its condition is met; each
tranche draws its scope from the current purpose; the rounds inside a tranche work as today. (Round-level purposes
are a possible variant; not proposed, because the owner's examples are tranche-sized phases.)

The build plan is **held by the tool in the shared state**, set from the owner's marked instruction (through the
coordinator, as his other standing direction is), read by the tool's work commands. It is not carried in ARCH's or
the coordinator's context — that is the simplification over the old pipelined build plan. ARCH no longer holds
"what we are doing now"; it reads the current purpose and scope from the tool.

This generalises the **existing `scope` mechanism** (part 2 §3; build 5 §2) over time, rather than adding a parallel
construct. The round record's `scope` becomes the current purpose's derived scope.

No owner approval to *open* a tranche is added: that stays removed ("Decision: Remove the owner's tranche-approval",
20 Nov). Stating a purpose is direction, like a marked instruction, not a gate on opening.

## What this changes (and the requirements it changes — his explicit approval needed, rule 2)

1. Part 3 §1 stance "there is no single purpose to state" → the owner may state purposes, held as a build plan.
2. "Notices, walk flaws and flaws a job reports are always work" (part 2 §3; decision entry) → always work *within
   the current purpose*; a stated purpose that does not take on flaws defers them to the purpose that does. (Notices
   stay always work: a merge's users must be re-checked within the tranche; a conversions-only purpose sends no
   notices, since a conversion's merge tells no one.)
3. Part 3 §2 item 4 "Each flaw becomes work... in the next round, 'not the next tranche'" → so, unless the current
   purpose does not take on flaws, when it waits for the purpose that does.

A purpose/scope is a filter on what counts as work (as scope is today); it adds no test, gate, review or stop on a
job or a merge (rule 2 satisfied on that count). Advancement is computed by the tool, not an owner gate.

## Risk / open sub-decisions to put to him

- **Completion conditions.** Keep them to what the tool can check (every module converted; a named set of
  requirements met; walks clean) plus the owner's marked word to advance where he wants one. Rich free-text
  conditions the tool cannot evaluate are out (the tool cannot read free text; admin-tool A1/B1).
- **Cause 4 (t3 §7, unmeasured).** A conversion states its module's types; the check can then refuse a later
  module's conversion until an earlier module's flaw is fixed. Under a strict conversions-only purpose that defers
  all flaws, such a conversion is blocked and the purpose may not complete. Sub-decision: a conversions purpose also
  takes on the narrow fixes its own conversions need to proceed (natural reading of "convert every module", but
  reopens some drift), or blocked conversions carry to the next purpose. Flag; do not resolve here.
- **Where held and one writer (part 4 §4).** Lightest: the owner's purposes + conditions ride the coordinator's
  standing direction (he writes them from the marked word); the tool derives and records the current scope in the
  round record (ARCH's writer) as now. Build text 5 §2 and 1b and the tool (06c) change to match; build texts change
  no rule.

## The specific design edits proposed (before → after)

See the proposal put to the owner this session. Primary edits: design part 3 §1 (03b) opening bullet; part 2 §3
step 1 (02) scope sentences and the "always work" clause; part 3 §2 item 4 (03); part 6 §5 tool list (06c, one
clause); the decision entry "A tranche opens" (design-decisions.md, rewritten in place with his new dated words on
approval). Build-level to match: build 5 §2 round form (a `plan`/purposes field), 1b commands 3 and 9, ARCH rule 6
and the job's rule 1 in the starting texts (pointing to the tool, net removal of held "what's next" text).

## Options put (not decided)

- **0 — no change.** Keep "no single purpose"; ARCH decides scope. Cost: the t3 drift can recur; his intent is held
  only in ARCH's context and handovers.
- **A — single current purpose (lighter).** The tool holds one current purpose + scope; no sequence, no auto-advance;
  the owner states each next purpose himself when ready. Simpler; he intervenes at each phase boundary.
- **B — the build plan (what he described).** An ordered sequence of purposes, each with a completion condition; the
  tool advances automatically; default when the list is exhausted or none is stated. Recommended (his direction).

## Refinement from the owner's dialogue (27 Nov, this session, unmarked conversation)

The owner refined the model. Captured for the final proposal (his marked decision still owed):

1. **Purpose is a round property, not a job's; focus is uniform across jobs.** Every job's role is the same (work one
   module); every lane's role is the same (design one area). A round carries one **purpose** = the **focus-set** its
   jobs take on, applied uniformly. A job's focus can be multiple. Default focuses: a module's unmet requirements, its
   flaws, the providers it uses that have changed. The owner, by the dashboard or the coordinator, may add to, subtract
   from or replace the default focuses for a round (conversion round → convert only; refactoring round → refactor). A
   lane's design-area focus may likewise widen or narrow.
2. **The purpose persists across the round and successive rounds until its condition is met**, then the next purpose
   begins; when the owner's special purposes are used up, the default purpose runs on. The example (convert every
   module, then refactor, then requirements/flaws/notices) is **sequential phases** — each purpose runs to completion
   before the next — not one job doing all of them.
3. **ARCH and the jobs read only the current focus**; they do not know or care whether it is special or default. The
   tool holds the sequence and advances it. This keeps ARCH and the jobs simple.
4. **Completion conditions are ARCH's.** ARCH obtains each purpose's completion condition (asks the owner where a
   special purpose is set) and **makes the determination that it has been met**; the tool then advances. (Supersedes
   the earlier "tool-checkable conditions only".)
5. **The tool tracks per-module job properties** (the module-level mirror of the build plan; part 2 §3 step 1 refers
   to them): the module's currently unmet requirements; flaws found in its code or tests; the provider interfaces it
   uses that have changed since its last job run; and any special reason a run is needed (conversion, refactoring,
   etc.). "A module has work" = these, filtered by the current round's focus, non-empty.
6. **A conversion-only round is not notice-free; it is free of attending to anything but conversion** (his words).
   Work it surfaces — notices to earlier, already-merged modules, flaws — is recorded against those modules and
   carried to a later round whose focus takes it on (the default round at the latest). The round never chases it and
   never stalls on it. This qualifies the 26 Nov "a conversion's merge tells no one": a conversion that must restate
   an item's type to match the code is a real interface change whose users must be told; reconciling this with the
   notify-flood fix of 26 Nov must be done carefully in the edit set (do not reopen the 199-module flood).
7. **Still open with the owner:** whether a purpose boundary coincides with the tranche's merge to main (each purpose
   its own tranche: convert→merge→refactor→merge→regular) or purposes sequence within one long-lived tranche. Needed
   before the merge-to-main text can be written exactly.

Part 3 §2 item 4 edits accepted in dialogue (not yet marked). Where this lands: the admin-tool review document's
charter (A1), plan (A2) and ledger (B1) items (it is on track to become the tool's design), and the Process4 design
text (parts 2 §3, 3 §1–2, 6 §5) on his marked decision.
