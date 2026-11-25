# ARCH holds ready jobs while `notify` runs (25 Nov 2026)

Raised by the owner in PROCESS #12's session, 25 Nov ~01:15Z: "You say that that holding is ARCH's own choice, but
process4 must have instructed it to do so. This is just wasted time. We need to figure out what the process is telling
ARCH that's making it wait and fix that." Companion to `notify-slow-early-provider-25nov.md` (why notify is slow).

## What was measured

civicsmith ARCH #15, from its own session record: record-grammar (third of 204 modules) merged (PR 1339); `p4 notify
1339` ran 38 minutes, was cut by the harness's 30-minute limit on a command moved to the background, was restarted at
00:47Z as its own background command, and was still running at 01:01Z. Meanwhile ARCH held every ready job whose module
reaches record-grammar: nine by 01:01Z (capture 1337, promotion 1345, provenance 1346, reading-pipeline 1344,
inquiry-grammar 1347, ratification 1348, wizard-library 1355, lines 1352, people 1357), their tests passed and recorded,
their GitHub check passed. It merged setup-words (1356), which does not reach record-grammar. Three later merges owe
notices "each to be run after this one".

## What in the process makes ARCH wait

1. **Design part 2, section 7:** "A module whose job is already open. The notice reaches that job at once ... A pass
   recorded before the notice no longer counts; the job deals with the notice and runs its tests again." Merging a user
   whose pass predates a notice still being worked out would merge code its tests never judged against the provider's
   change, which this sentence exists to prevent. ARCH honours it the only way it can while `notify` runs: by not merging.
2. **ARCH's starting text, rule 2:** "When it reports tests pass: `merge` ... Then `notify`, message each running job it
   names ..., and refill the slot that turn." One merge, then its notice, in sequence, in one turn; nothing says what to
   do with other ready jobs while a notice is being worked out, and nothing says to start `notify` as a background
   command (as rule 1 says for `p4 test`), so the first run was cut at 30 minutes.
3. **The owner's decision of 24 Nov** (item 2): "There's no reason for a job not to get the [notice] immediately." The
   rule assumed `notify` takes a minute or so. On civicsmith, after an early provider, it takes most of an hour.
4. `merge` itself does not hold: it refuses only a job whose block already shows a notice newer than its test record.
   A user merged before `notify` finishes has no open job when the notice is worked out, so its notice goes to waiting
   work and it gets a told job later (design part 2, section 7, the path for a user with no open job).

So the hold is not ARCH's whim: it follows the design's promise that an open job gets its notice before it merges.
What is broken is that the promise costs a held round of an hour when `notify` is slow.

## Options

- **A. No change.** ARCH holds users until each notice is worked out. An early provider's merge holds the round for
  most of an hour, until `notify` is made faster (the companion fault).
- **B. Merging goes on while a notice is worked out (recommended).** ARCH starts `notify` as its own background command
  (up to two hours) and goes on merging ready jobs meanwhile; a notice reaches the jobs still open when it is worked out,
  and a user merged before then gets it as a told job afterwards, the path the design already has for a user with no
  open job. Text only: ARCH's rule 2, design part 2 sections 3 (step 8) and 7 ("a module whose job is still open when the
  notice is worked out"), build text 1b command 11. No tool change. Costs: a user merged in the meantime may need a
  small told job afterwards (its related tests only, or closed with nothing to change); until then its merged code has
  not been judged against the provider's change, as for any user whose job was not open. Removes a wait; adds no test,
  gate, review or stop.
- **C. Only make `notify` fast** (the companion research). Keeps the hold, shortened to however long `notify` then takes.

B and C combine: B removes the wait now whatever `notify` costs; C then cuts the follow-up told jobs B may cause,
because a fast notice reaches more jobs while they are still open. Interaction with the stale-branch fault (option B
there, `p4 test` merges the tranche in first): none harmful; a job merged in the meantime brings its provider's change
into the tranche, and a told job's `p4 test` then runs on code that holds it.
