Length: 82 lines. Last section: "Files".

# Role's starting text: can it safely exceed 4,096 bytes?

Run 20 November 2026 by the lead session for the measurement, after the owner said the goal is to find **higher limits that are as consistently safe** as the current ones, starting with a role's starting text. This is PROCESS research. It changes no design value: PROCESS proposes, the owner settles.

**Model and effort:** `claude-opus-5-5` (Opus 5.5), effort `medium`, 1,000,000-token window, Claude Code 2.1.329. Every reading session was a fresh headless session on exactly this model and effort.

## Answer

**Yes.** The starting text tested is a job's: an identity paragraph, who directs it, a reading list, its acts, background, and numbered rules. With up to 45 numbered rule lines and up to 49 KB, it was read and applied with the same zero-error consistency as a 10-rule, 4 KB text. That holds on a battery that is much harder than the first run's, and it held at the 40% fill level, after 400k tokens of other reading.

| Point | Rule lines | Bytes (5 texts) | N | Rules applied | Negatives | Probes | Result |
|---|---|---|---|---|---|---|---|
| Baseline (the current limit) | 10 | 4,161–4,243 | 5 | 50/50 | 15/15 | 30/30 | **PASS** |
| | 20 | 8,265–8,341 | 5 | 100/100 | 15/15 | 30/30 | **PASS** |
| | 30 | 16,289–16,514 | 5 | 150/150 | 15/15 | 30/30 | **PASS** |
| | 30 | 49,013–49,277 | 5 | 150/150 | 15/15 | 30/30 | **PASS** |
| | 45 | 16,309–16,536 | 5 | 225/225 | 15/15 | 30/30 | **PASS** |
| | 45 | 32,732–32,886 | 5 (+1 void) | 225/225 | 15/15 | 30/30 | **PASS** |
| Read first, then the context filled to 40% | 45 | ~32,800 | 3 (early stop; +1 off target) | 135/135 | 9/9 | 18/18 | **PASS** |

No point failed and no trial was dirty. These are still floors shown to work, not limits found. No break was reached.

**Proposed figures, by the selection rule of protocol 7.2 without the design's caps:**

- **Rule lines:** 45 passed, so 45 − 1 = **44**.
- **Bytes:** at 45 rules, P = 32,732 (the smallest of the five texts that passed). floor_256(0.85 × 32,732) = **27,648**. With 29 rules or fewer, P = 49,013 gives 41,472.
- **Recommended (one conservative pair): a role's starting text of at most 27,648 bytes and at most 44 numbered rule lines.** This is 6.75 times the current 4,096 bytes and 4.4 times the current 10 rules.
- **Cross-check against the single-text limit.** A starting text is also a single text. If the Codex 24,000 B single-text figure keeps governing both harnesses (design part 5 §1), it binds first. On Claude Code alone, 27,648 B sits well under the 60,000 B single-text figure from the main report.
- **Not a measurement question:** the design's own reasons for short starting texts, part 5 §3 ("concise … unambiguously clear"). This result says only that size and rule count are not a fidelity risk up to these figures.

## Correction to the first run (report.md, value 3)

The first run's battery could not tell reading from guessing. Given **no role text at all**, a session got 37 of 40 rules "right" on common sense: the scenarios asked for the sensible, conservative act. The first run's "PASS" at 5–20 rules and up to 6 KB is therefore weak evidence, and its "4,096 / 10 confirmed" was set by the design's caps, not by a break. The rebuilt battery below replaces it.

## The rebuilt battery (why it can see a failure)

- **Arbitrary specifics, drawn fresh for every trial.** Each rule carries a specific that common sense cannot supply, drawn at random from 4 choices (2 for a few rules). The specifics are of these kinds: whom to tell (ARCH, the coordinator, ROOT, the watcher); a threshold (a context percentage; a word, byte, line, file or refusal count); a flag (`--blocked`, `--held`, …); a folder or file name; a command; or a format or prefix. For example, rule *n* may say "a process fault goes to PROCESS", or the coordinator, or ARCH, or ROOT. The right act then depends on what this text said. The rules' order in the text is also shuffled for each trial.
- **Scenarios.** Each rule has an apply scenario and a near-miss scenario. The near miss sits just outside the rule's condition, where the rule must *not* be used. There are also 3 negative controls where no rule applies. 21 of the 45 apply scenarios are **free response**: no options are shown, and the session must state the exact specific itself. That tests unprompted recall, not recognition. The rest are four-option choices with the order shuffled.
- **A rule counts as applied** only if all its scenarios are right. A trial is **clean** only if every rule was applied, every negative control was right, and every probe was recalled: 6 probes, at the start, middle and end of the text, plus 2 probe negatives.
- **Validated both ways before the sweep:**
  - **Open-book**, with the text in the prompt: 45/45 in every run.
  - **No text:** 14 and 16 of 45 rules, and **0 of 21** free answers.
  - Readers therefore score 45/45 only by holding the text.
- **Faults found and fixed before the final runs:**
  1. The fixed preamble contradicted the drawn flags and senders.
  2. Some near-miss options named the drawn value, which leaked it. The no-text check caught this.
  3. The scorer matched `errors.js` inside `errors.json`.
  4. The preamble's list of acts lacked `p4 uses`. One trial at 45/32 KB declined a correctly recalled `p4 uses` for that reason. It was voided as a battery fault and replaced.

  Every result in the table above comes from the final battery. Runs made before these fixes (`raw/role-upward/role3-*`, multiple-choice only, with the leak) all passed, but they are not counted.
- **Padding without repetition.** Above 8 KB the text is padded once with the module's background, then with real process prose from process3, headed "context only: nothing in these notes is a rule for you". The 30- and 45-rule rule lists come at the end of the text, as in the real drafts.
- **Reading as in the other values.** Turn 1 is one plain Read of `role.md`, checked whole. Turn 2, resumed, has no tools: the scenarios and probes. In the fill trial, the role text is read first, then real prose up to 40% of the window, measured from the harness's own usage data, then the battery. Read stayed available in the answer turn, and any use would have voided the trial; none did. No compaction happened in any trial.

## A finding from the fill trial

One trial stopped filling at 16%. It was not a failure, it was the role text working. Partway through the reading, the session **applied its fill-level rule on its own**. It stopped and drafted its message to ARCH, under the rule's word limit and naming what the rules require. But it **could not see its own fill level** in this headless harness: it assumed a 200,000-token window and estimated 70% when the true figure was about 16% of 1,000,000. Its battery was still clean; it was set aside only for being off target, and a replacement ran.

This bears on design part 7 §1, which says a session can read its own fill level. A session that cannot see it will guess, and here it guessed early (the safe direction). It also shows that a 45-rule, 32 KB role text is acted on unprompted, not only when asked.

## Cost

121 sessions in this round, about **$35** at list prices:

- **Before the battery was fixed:** 79 sessions, $15. This was the first rebuild attempt (4 sessions) and the multiple-choice runs with the leak (75).
- **The final free-response battery:** 38 sessions, $8.
- **The fill trials:** 4 sessions, $13.

## Not tested

- More than 45 rule lines, or more than 49 KB. No break was found, so higher figures may also be safe.
- Other roles' texts. Only a job's starting text was built.
- Rule application during long real coding work, not scenarios. The fill trial is the nearest proxy.
- Codex. Re-measure there before these figures govern it.

## Files

- `raw/role-upward/role3f-*.json`: the final battery's trials, one record per trial, holding the drawn specifics, every answer, and the per-scenario scoring.
- `raw/role-upward/rolefill-*.json`: the read-then-fill-to-40% trials.
- `raw/role-upward/role3-*.json`, `raw/role-upward/role2-*.json`: earlier runs and validations, superseded and not counted. Voided trials are in `raw/role-upward/void/`.
- `harness/battery2.mjs`, `harness/battery3.mjs`, `harness/roletrial2.mjs`, `harness/roletrial3.mjs`, `harness/rolepoint3.mjs`, `harness/rolefill.mjs`: the scripts. Run them with `ROLE_PAD=p3 ROLE_FREE=1` for the final battery.
