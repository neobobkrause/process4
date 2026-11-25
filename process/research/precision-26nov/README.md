# Precision of who is told, measured on a converted proof (25–26 Nov 2026, PROCESS #17)

Length: 62 lines. Last section: "The owner's words on how findings are judged (25 Nov ~22:30Z, conversation, not marked)".

## Files

- `measure.md` — a worker's converted copy of the notice's proof (every module but `door` kept to the coding standard;
  150 changes rebased; `needs` re-established by running each later module's tests: 108) and the measurement on the tool
  at `work/decision-c` 3338a4c: 373 told, 281 told without need, **16 missed**. `converted-proof/`, `needs.json`,
  `measure.mjs` (re-run: `node process/research/precision-26nov/measure.mjs <a checkout's tool/> [--json out]`), helpers.
- `misses.md` — a worker's study of the 16: cause, design gap / tool fault / proof not acting out the process, options
  with measured cost, and rule 7 ("accepts more") found unsound for functions handed on as values and for objects.
- `summary-who.txt` — the tool on `work/decision-c-who` c913ffb (member-by-member telling; whole-value users of a handle
  told of its members' changes): 384 told, 291 without need, 15 missed (X03 caught).
- `summary-what.txt` — the tool on `work/decision-c-what` 234b92f (equivalent rewrites, exact computed facts, more
  accepts-more confirmed): 369 told, 277 without need, 16 missed.
- `summary-joined.txt`, `measure-output-joined.txt` — both joined (scratch merge, expected answers not reconciled):
  379 told, 286 without need, 15 missed.

## The owner's question (25 Nov ~22:30Z) and the answer given

His words: "I'm only worried about false positives or negatives for modules that * have been properly converted * the
refactor has moved the module to their proper place in the order and moved their tests to the module that they're
testing. With that, how many false results will we have once those issues are factored out. If the number is still
grater than 0, then characterize what would cause them to be reported improperly."

Answer (joined tool; `door`, which the standard cannot express, and A12's outside-the-standard setup left out):
15 missed and about 162 told without need. Missed: 11 a separately running program's output or start-up (meter), 2
same-kind parameters swapped, X01 (rule 7), A14 (a relabelled copy). Without need: 75 exactly the changed item, use
unaffected (kind A, called for by his retest rule); 54 computed facts over-approximated; 33 a whole record or handle held,
the changed member never touched. Not checked: that the proof's tests sit only in the module they test.

## Found in joining

- `work/decision-c-what` confirms as "accepts more" a function handed in that is then handed an extra argument
  (`what-changed.test.mjs`, "a function handed in"); `misses.md` §3 shows this breaks a user whose callback has an
  optional parameter. It is removed in the join.

## Options put to the owner

See `misses.md` §2 and PROCESS's page. Tool faults under rules as they stand (corrected without a decision): the started
program's file followed and `env`/`argv` read (P1); a relabelled copy listed as an S4 place (A14); a user that builds a
kind told of any member's change (P2). Rule changes for his decision: the started program's running code in its
starter's means (P1B); a confirmed "accepts more" still tells users that hand the function on or build their own value
of the accepted kind (P3), or rule 7 narrowed; parameter names in the means (P4).

## The owner's words on how findings are judged (25 Nov ~22:30Z, conversation, not marked)

"I'm asking whether that's a real world scenario. - Would these 150 changes all be made without a design role being
involved? Of those changes that you can say would be made without a design role's involvement, are those changes made by
a tool or by the job? Because the jobs would be instructed to recognize and report changes like that and communicate them
to the notification tool so that they're not missed, right?"

"When evaluating situations where false positives and false negatives might happen, you need give proper consideration to
design/development/build context in which those changes are made, and only report false positives or false negatives
when there are situations when neither roles, jobs, nor tools can recognize the change in a way that the notification
(and metadata maintenance tool) can be properly informed."

PROCESS asked once whether to record the second as a decision. Under it: corrections 1 (P1B) and 3 (P4) withdrawn (they
back up what ARCH names and the job declares, design 2 §7, §8); correction 2 (P3) put to him; the 75 of kind A counted
as retests his rule calls for; the 87 others to be checked one by one for changes the job knows stayed inside its module
(the design lets a declaration add a notice, never remove one).
