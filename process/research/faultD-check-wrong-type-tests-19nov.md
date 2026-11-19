# Research: fault D — `check` refuses deliberate wrong-type error tests (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Source of the fault: the trial
coordinator's list (handover `process/handover.md`; `round4-faults-19nov.md`
item 2). Measured here against the tool and texts at `process4` `main`, with the
notice's proof fixtures (`tool/test/fixtures/notice-proof/`). Nothing was
patched; this is research only.

## What the fault is

The tool's `check` (command 18; `tool/lib/notice/check.mjs`) runs inside a
module's own tests and is meant to make only the **two refusals the owner
approved** (design part 2, section 6; build text 2b, sections 5–6):

- (a) a **structured comment** (`@type`) that disagrees with the module's code;
- (b) the module's **code** where it disagrees with a **provider's** stated interface;
- plus the declared-uses check (imports of source *and* tests), which is separate.

Build text 2b §5 ties both refusals to the `@type` mark: "a plain `@type {Kind}`
on the value … **This is what makes the two approved refusals possible.**"

The **implementation** does not restrict itself to mark-anchored disagreements.
It reports **every** TypeScript diagnostic over all of a module's files (source
and tests), minus a hand-kept "cannot tell" list, and buckets each as (a) or (b).
So a test that **deliberately passes a wrong-typed value to prove a function
rejects it** — an error-condition test, which design part 2 §6 explicitly
requires ("show that error conditions are properly identified and
communicated") — is reported as a disagreement, `check` exits 1, and the
required run fails. The behaviour is correct; the test passes at runtime; only
the type check fails.

## Measured

Reproduced on the proof's `money` module (a self-contained module). A normal
error test written the obvious way:

```
assert.throws(() => amount('lots', 'EUR'), RangeError);   // cents must be a number
assert.throws(() => amount(1, 'XXX'), RangeError);        // currency not one of CURRENCIES
```

- At runtime: all tests pass (error conditions correctly raised).
- `check money`: **refused**, 2 refusals, both TS 2345 ("Argument of type
  'string' is not assignable…"), bucketed `(a) a comment disagrees with this
  module's tests` — though no comment is involved.

The existing `money` fixture only passes today because its author wrote the
**workaround** `amount(1, /** @type {any} */ ('XXX'))`: casting the deliberate
wrong value to `any` so the reader raises nothing. That workaround is a hidden
rule no starting text teaches; the trial's `units` and `tax` jobs did not know
it, their required runs failed on the check, and they had to retype their tests.

This is a genuine, measured operational fault, not a deliberate attack, so
rule 6's "attack ⇒ no change" does not apply.

## Why it is the owner's to decide

Any fix changes how an **owner-approved refusal** behaves, and the crux is a real
trade-off with no free lunch: **a deliberate error test and a genuinely wrong
(stale) call can be type-identical.** Example from the proof, change
`P09-newly-refused`, where provider `store.put`'s third parameter became an
object: a stale test `assert.throws(() => s.put('', '1', 0), RangeError)` passes
the old numeric `0`. The type checker cannot tell this stale call from a
deliberate one. So the line drawn decides which real disagreements are still
caught. The design already tolerates a missed user (part 2 §7) and leans on
runtime tests and walks.

## The options, each measured against the proof (48 refusing (change,module)
## decisions recorded across 150 changes)

### A — No change
Keep the `@type {any}` cast workaround. **Cost (measured):** jobs stumble (units,
tax failed their run and retyped); a hidden rule held by no text; error-condition
tests cost extra ceremony. "A workaround is not a fix" (design part 1 §6).

### B — Exempt deliberate error assertions (recommended)
In test files, skip type-disagreements whose line falls inside an
`assert.throws` / `assert.rejects` / `doesNotThrow` / `doesNotReject` callback.
- Fixes the reproduction: both refusals exempted, `check` passes, no cast needed.
- **Blast radius: 1 of 48** refusing decisions flips to not-refused — only the
  ambiguous `P09` stale-call-wrapped-in-throws. Every other recorded detection
  is preserved, including users' stale provider calls in **normal** assertions
  (P08, P26, P27, X08, Z07, U10) and all 51 source refusals.
- Narrows a refusal; adds no test, gate, review or stop (rule 2).
- **Costs:** needs updating the tool's own fixtures/expected for P09 and removing
  the now-needless cast in the `money` fixture (a tool-test update, part of the
  process change). Covers thrown/rejected errors only; an error test that checks
  a *returned* error value is not covered, but such tests usually pass
  valid-typed values (e.g. `amount(-1)`) that raise no type diagnostic anyway.
- Warrants a one-line clarification in design part 2 §6 / build text 2b that
  deliberate error assertions are not among the two refusals (rule 4: design and
  tool move together).

### C — Type-refusals on source only
Run the two type-refusals over source files only; keep the declared-uses check
on tests (design part 2 §6 requires reading test imports).
- Fixes the reproduction. Simpler code.
- **Blast radius: 11 of 48** decisions flip — it also drops legitimate
  detection of users' stale provider calls in their **tests** (P08, P26, P27,
  X08, Z07, U10, P09). Blunter; weakens recorded behaviour the proof valued.

### D — Re-anchor both refusals to the `@type`/interface marks
Make the implementation match build text 2b literally: refuse only where a
marked claim (`@type`, `@param`/`@returns`, an interface-crossing value) is
contradicted, so an unmarked bare value in a test is never refused.
- Most faithful to the written design. **Larger reimplementation; not yet
  measured here.** More disruptive to build and verify than B or C; offer only
  if the fuller alignment is wanted.

## Recommendation

**Option B.** It is the minimal correction that resolves the measured fault while
preserving almost all of the proof's recorded detection (47 of 48 decisions),
adds no test/gate/stop, and keeps error-condition tests cheap as design part 2 §6
intends. If adopted it carries a one-line design/build-text clarification and the
fixture updates noted above. "No change" (A) remains open.

## Still to settle with the owner

- Which option (A/B/C/D), in his marked words, recorded verbatim in
  `process/design-decisions.md` with the date, in the same step as any merge.
- If B: confirm the one P09 decision may stop being refused (it is covered by the
  notice/retest path and runtime), and approve the design-text clarification.
