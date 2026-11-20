# Has the design/history separation been maintained? (20 Nov 2026)

Recorded by PROCESS (rule 3) before proposing. The owner asked whether the design
document still keeps to the agreed separation: the design proper states the design **as it
now stands**, with no history of how it evolved; the history — his dated decisions, and the
reasons and evidence — is kept separately, in the record of decisions
(`process/design-decisions.md`) and the background/Foundations document. The design states
this rule itself: part 0 §1 ("It states the design as it now stands. It carries no history
of how the design came to be, beyond naming where a figure or a quotation comes from") and
part 5 §4 ("The design document names no product and carries no history").

**Evidence.** Four read-only workers surveyed all eleven parts (00–02, 03–05, 06–09, 10)
and inventoried every historical/provenance reference with file:line. This note synthesises
them.

## Finding: the separation has NOT been maintained.

History and provenance are woven through the design — lightly in parts 01, 05 (prose), 09;
moderately in 00; **heavily in 02, 03, 04, 06, 07**; and part 10 §1 is almost entirely a
recap of settled decisions. The kinds found:

**A. Draft/version lineage.** "the design, seventh draft" (00:1); "34 rules carried
unchanged from the sixth draft" (00:27); "as the sixth draft quotes it" (04:33).

**B. Dated decision provenance (the largest category).** Dozens of "Settled (the owner, 20
November 2026)" and "the owner's decision, 19/20 November 2026", plus labels "decision C",
"decision B", "fault D", "decision 7", "item 12", and the repeated tag "His decision is in
the record of decisions" (part 3). These recount who decided and when — exactly what the
record of decisions already holds, in his exact words.

**C. Predecessor-process references.** "the process before this one" (02:53, 06:8, 06:38,
07:23, 09:27); "the process3 repository" (05:60); "the earlier process's decision record"
(09:14).

**D. Working-file / evidence paths.** `process4/working/...`, `process4/owner_words/`,
`process4/evidence/foundations.md`, `stage0_report_19nov.md`, and the whole "Where things
are kept now" section (05 §7). These point to historical working artifacts — distinct from
the live companion documents the design legitimately names (the build texts, the record of
decisions, the background document, and a figure's measurement source).

**E. Change-narrative.** "This closed a gap in the round logic…" (02:42); "the ledger … is
retired" (05:38); "It supersedes the weaker first measurement" (07:42); "the design no
longer depends on a cross-repository session create" (07:53); "It failed once" (10:60);
"Why GitHub once suspended the sessions' account was never learned" (10:109).

**F / G. Attribution and status marks.** The design's own mark legend (part 0 §3) defines
five: "Claude decided", "Reading", "Open", "Unproven", "Settled". Three carry history:
**"Claude decided"** (attributes who decided — used on most substantive clauses in 02, 04,
06), **"Settled (owner, date)"** (decision provenance), and **"Reading"** (an unconfirmed
interpretation; nearly all are now settled). Two describe current status: **"Open"** (what
is still unsettled) and **"Unproven"** (what has not been shown to work).

## Clearly history — strip, nothing lost (it is already in the record of decisions / background)

Categories A, B, C, E, the pure-provenance working/evidence paths in D, and the "Claude
decided / Settled / Reading" attribution prefixes in G. Each rule is restated plainly; the
owner's dated words and the provenance stay in `process/design-decisions.md`.

## Judgment calls for the owner

1. **Current-status content — the "Unproven / Open / Not known / Not proven on Claude Code"
   flags and part 10.** This describes what the design has and has not been shown to work:
   present state, not evolution, and safety-relevant. Part 10 §§2–6 (open design work,
   unproven, the trial, what only the first tranche shows, risks) are current status. But
   part 10 §1 ("Open with the owner") is ~90% dated "settled (date)" recaps — the record of
   decisions misfiled into the design.
   - **Option 1 (recommended):** keep the current-status flags and part 10 §§2–6 in the
     design, cleaned of their dated history tails; collapse part 10 §1 to only the
     genuinely-still-open items (the approvals wording; the Codex re-measurement owed), the
     settled recaps removed.
   - **Option 2 (stricter):** move all status/unproven/open/trial content into a separate
     status document too; the design becomes purely the rules.
   - **Option 3:** no change.
2. **The "Claude decided" attribution:** strip it (recommended — a rule stands on its own,
   and the owner-overrule principle is stated generally), or keep it (it marks AI-authored
   technical decisions he can overrule).
3. **The fresh downloadable copy's form:** one clean combined document (recommended) and/or
   the eleven cleaned parts; and the format (markdown, PDF, a Claude doc).

## Scope guardrail

Whatever is chosen, the cleanup changes no **rule**: it relocates provenance and removes
narrative, preserving every rule's substance (rule 2 — correct or remove what is broken, add
nothing). The design must still meet the process4 requirements. The headers' line counts and
the starting-texts index's byte figures are re-measured after the cleanup.
