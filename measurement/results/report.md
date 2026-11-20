Length: 136 lines. Last section: "Files".

# Reading-fidelity measurement: report

Run 20 November 2026 by the lead session for the measurement, following `measurement/protocol.md`. This is PROCESS research: the evidence for a proposal to the owner. It changes none of the four design values. PROCESS proposes, and the owner settles them.

**Model and effort measured:** Claude Code 2.1.329, model `claude-opus-5-5` (Opus 5.5), effort `medium`, 1,000,000-token context window (as reported by the harness). Every reading session ran on exactly this model and effort. A change of production model or effort means re-measuring (protocol 2.3).

## Priority finding

**None.** No provisional figure is unsafe. Every provisional size and level passed 5 of 5 trials, and so did every size tested above it, up to the mechanical cut for the single text. The tightening rule (protocol 7.4) does not apply to any value.

## Summary

| Value | Provisional | Recommended | Margin | Verdict |
|---|---|---|---|---|
| Single text | 24,000 B | **60,000 B** on Claude Code (24,000 stays until Codex is measured; see below) | 20% below P = 76,000; also below the smallest whole-read ceiling seen (64,000–67,000 B for dense text) | Confirmed with headroom. The limit is mechanical: no fidelity break was found below the cut |
| Set of texts | 175,000 B | **175,000 B** (the rule allows 176,000) | 20% below P = 220,000, the largest size tested | Confirmed with headroom. No break found up to 220,000 |
| Role text | 4,096 B / 10 rules | **4,096 B / 10 numbered rule lines** (design caps) | Passed at 20 lines (46 single rules) and at 6,187 B; the rule's figures, 19 rules and 5,120 B, sit above the caps | Confirmed with headroom, by both rule counts |
| Fill level | 40% | **40%** (the rule allows 65%; protocol 7.3 says not to raise it) | Passed at 80%; 80 − 15 = 65 | Confirmed with headroom. No fall-off found up to 80% |

**Read first.** Nothing tested broke on fidelity. Every trial that got its text whole was clean: 103 trials and about 1,200 probe questions, with no position class missed and no negative control failed. So these numbers are floors shown to work, not limits found. The only boundary found is the harness's mechanical cut on a single read (about 25,000 tokens). The single-text figure comes from that cut. The other three come from the largest point tested and the design's caps. The protocol expects this on a 1M-token model (3.4, 6.3).

**On the single text and Codex.** Design part 5 §1 says the Codex maximums govern both harnesses. Until Codex is measured, 24,000 remains the governing figure under the design as written. 60,000 is the Claude Code figure. Using it on Claude Code alone would be a change to part 5 §1, which is the owner's decision.

## How the trials were run

- **Reading sessions.** Each trial was a fresh headless Claude Code session (`claude -p --model claude-opus-5-5 --effort medium`), started in a folder holding only its carrier files, with the Read tool alone. **Turn 1:** read the named file(s) in full, one plain Read per file, then reply only "READ COMPLETE". The session was told that questions would follow and that it could not reopen the files then. **Turn 2:** the same session, resumed, received the questions in random order. For values 1–3 it had **no tools** in turn 2, so it could not reopen the source. For value 4, Read stayed available (removing it voids the prompt cache on an 800k-token context), and any tool use in the answer turn voided the trial. None occurred.
- **Whole-read check.** For every Read, the line numbers returned were compared with the file's line count. A first Read that did not return every line counts as a mechanical cut (protocol 0.4). It is not a fidelity point, and no questions were asked.
- **Compaction check.** Every transcript was scanned for compaction or context-clearing events. There were none in any trial.
- **Carriers.** Copies of the real `design/`, `build/` and `starting_texts/` texts, in a seeded rotated order, cut at a line end, with neutral filler (headed sections, lists, tables) to reach the exact byte target. All carriers and answer keys were kept in the lead's scratchpad. No tracked file was touched.
- **Probes.** 12 per carrier, 2 in each of the 6 classes (early/middle/late × shallow/deep). The text of a probe was "The `<attr>` for the `<invented subject>` is `XX-1234`." A shallow probe was a top-level paragraph. A deep probe sat in a table cell or mid-line in a list item or paragraph. Probes are at least 500 bytes apart (at least bytes/40 on the 12 KB carrier). Each carrier variant was checked for zone placement (within ±2 points) and for spacing before use. **Negative controls:** 2 per trial, worded like a probe question about a subject never planted. Scoring was exact: a near miss counts as a miss.
- **Prior material.** process3's `process4/working/reading_measurements/` has the materials README, `cut.py` and `verify.py`. It does not have `RESULTS.md` or `RERUN_PROMPT.md`, so neither was found. Its design (zones by tenths and middle, strict exact recall, a told arm) agrees with this protocol and was followed.

## Value 1: the largest single text

| Point | Bytes | N | Result | Probe recall by class (E/M/L × shallow/deep) | Negatives | Notes |
|---|---|---|---|---|---|---|
| S1 | 12,000 | 5 | **PASS** | 120/120 (all classes 100%) | 10/10 | |
| S2 | 24,000 | 5 | **PASS** | 120/120 | 10/10 | the provisional figure |
| S3 | 48,000 | 5 | **PASS** | 120/120 | 10/10 | |
| S4 | 72,000 | 5 | **PASS** | 120/120 | 10/10 | ~22.5k tokens of text |
| refine | 76,000 | 5 | **PASS** | 120/120 | 10/10 | ~24k tokens: at the cut |
| refine | 80,000 | 5 | **CUT** (5/5) | — | — | returned 61,548–66,784 B |
| refine | 88,000 | 5 | **CUT** (5/5) | — | — | returned 60,417–70,700 B |
| S5 | 96,000 | 5 | **CUT** (5/5) | — | — | returned 55,399–69,445 B |

**The mechanical cut** (`raw/mechanical-calibration.json`) is set by tokens, about 25,000, not by bytes. Governing prose (dense markdown, about 3.2 bytes per token) reads whole to at least 76,000 B and is cut from 80,000 B. Table-dense real process prose reads whole at 63,381 B and is cut at 67,409 B. A cut file returns well short of the cap, 53–70 KB here. **The tool result carries no cut notice.** In the calibration run the session noticed for itself and read on with an offset, but a session that did not notice would act on a partial read. This bears on design part 7 §2: the cut notice "arriving apart" was not seen in the tool result in this harness version.

**Selection (7.1).** P = 76,000. There was no fidelity F; the only failures were the cut. L = floor_1000(0.80 × 76,000) = **60,000**. min(L, P) = 60,000. The whole-read ceiling is at least 76,000 for governing text and at least 63,381 for the densest real text tried, so 60,000 is below both, and 60,000 is the result. Tested points: 5 coarse and 3 refinement, 40 trials. The 88,000 point was redundant once 80,000 had cut.

**Codex note.** Re-measure S1–S5 and the cut ceiling on Codex before any single-text figure governs there. Until then the design keeps the Codex 24,000.

## Value 2: the largest set of texts

| Point | Total bytes | N | Files per set | Largest file | Result | Probe recall | Negatives | Context at questions |
|---|---|---|---|---|---|---|---|---|
| T1 | 88,000 | 5 | 9–13 | 22,455 B | **PASS** | 60/60 | 10/10 | ~35k tokens |
| T2 | 132,000 | 5 | 13–18 | 22,670 B | **PASS** | 60/60 | 10/10 | ~52k |
| T3 | 175,000 | 5 | 19–20 | 22,629 B | **PASS** | 60/60 | 10/10 | ~68k |
| T4 | 220,000 | 5 | 22–25 | 22,563 B | **PASS** | 60/60 | 10/10 | ~84k |

Each set held whole real governing files, plus one neutral filler appendix at a random position. The 12 probes were placed by position within the whole set: a "late/deep" probe was buried in the last ~15% of the set. Every file came back whole.

**Selection.** P = 220,000, no F. L = floor_1000(0.80 × 220,000) = 176,000. That sits 1,000 above the provisional figure. Ties and ambiguity resolve toward the smaller value (0.2), so **keep 175,000**, now measured with 25% headroom to the largest clean pass. **Per-file constraint assumed (4.4):** every file in these sets was at most about 22.7 KB, under both 24,000 and 60,000. A set made of files near 60,000 B each was not tested.

**Codex note.** Re-measure on Codex. The window and per-read behaviour differ there.

## Value 3: a role's starting text

The role text was a job's starting text. Its 20 numbered rule lines are lines 1–10 from the real `starting_texts/job.md`, lightly condensed, plus 10 realistic lines drawn from the other drafts (`arch.md`, `lane.md`, `coordinator.md`) and the design. The rest is the same text: identity, who directs, reading list, acts, and a neutral "About the module" section that pads to the byte target. Rule point R*k* uses lines 1..*k*.

The battery has an apply scenario and a near-miss scenario for every line (three for line 10). It also has 5 joint scenarios, each used once all its rules are present, and 3 negative controls where no rule applies. Answers were four-option choices, with the option order shuffled for each trial, plus 3 recall probes and 2 probe negatives. **The battery was checked open-book first** (the text given in the prompt): 2 runs, 49/49 correct each. So a miss in a trial means a reading failure, not a faulty scenario. A rule counts as applied only if every scenario that rests on it was answered correctly.

| Point | Numbered lines | Single rules | Bytes | N | Rule application | Negatives | Recall probes | Result |
|---|---|---|---|---|---|---|---|---|
| R1 | 5 | 11 | 3,846–3,858 | 5 | 100% (25/25) | 15/15 | 15/15 | **PASS** |
| R2 = Z1 | 10 | 27 | 3,980–3,988 | 5 | 100% (50/50) | 15/15 | 15/15 | **PASS** |
| R3 | 15 | 35 | 4,024–4,031 | 5 | 100% (75/75) | 15/15 | 15/15 | **PASS** |
| R4 | 20 | 46 | 4,141–4,145 | 5 | 100% (100/100) | 15/15 | 15/15 | **PASS** |
| Z2 | 10 | 27 | 6,173–6,187 | 5 | 100% (50/50) | 15/15 | 15/15 | **PASS** |

R2 and Z1 are the same condition (10 lines near 4,096 B). They were run once and the 5 trials count for both. Stop condition 5.4 was met: all points passed, so no refinement was run. The value-3 subtotal is 25 trials.

**Selection (7.2).** Rule count: 20 passed, so 20 − 1 = 19, capped at the design's 10. Bytes: floor_256(0.85 × 6,187) = 5,120, capped at 4,096. **Result: 10 numbered lines / 4,096 B, confirmed with headroom.**

**On open item 10 (lines or single rules).** Application stayed complete up to 20 numbered lines carrying 46 single rules, at about 4.1 KB. The real drafts carry 22–31 single rules behind 10 lines. No break was found by either count, so this measurement gives no grounds to change the count to single rules. It also cannot say where a break by single-rule count would come.

**Codex note.** Re-measure on Codex. The 10-rule cap is a design rule and stands on both harnesses.

## Value 4: the fill level for refresh

**Each trial** began with a fresh session reading a 24,000 B probed carrier of real governing text (12 probes, 2 negatives, all early in the context). It then read real process prose in batches until the context reached the target ±2 points. The prose was process3's public markdown, 4.1 MB, cut into 36 KB files, about 10.5k tokens each, and every file was checked whole. Next it read the task text: `build/04-the-trial.md`, 14,667 B, standing in for a module's requirements file and left out of the carrier pool.

The answer turn asked 10 work questions whose facts are spread through the task text, from first section to last, plus 1 negative. It also asked the 12 early probes and 2 negatives, all mixed in random order, and a handover of at most 120 words. **Fill** was measured from the harness's own usage data: the context tokens of the answer call ÷ the 1,000,000-token window. This is the figure the session's fill display shows. Nothing compacted in any trial.

| Point | Target | Measured fill at the answer | N | Work answers | Early probes | Negatives | Handover | Result |
|---|---|---|---|---|---|---|---|---|
| F1 | 20% | 19.84–20.79% | 3 | 30/30 | 36/36 | 9/9 | 3/3 | **PASS** (early stop: first 3 clean) |
| F2 | 40% | 39.79–40.58% | 5 | 50/50 | 60/60 | 15/15 | 5/5 | **PASS** |
| F3 | 60% | 59.71–60.59% | 5 | 50/50 | 60/60 | 15/15 | 5/5 | **PASS** |
| F4 | 80% | 79.46–80.36% | 5 | 50/50 | 60/60 | 15/15 | 5/5 | **PASS** |

Stop condition 6.3 was met: F1–F4 all passed, so no fall-off was seen in the tested range and no refinement was run.

**Selection (7.3).** Pf = 80, no Ff. floor_5(80 − 15) = 65. 7.3 forbids raising the level above the owner's 40% on this measurement alone, so the result is **40%, confirmed**, with measured headroom to 80%. On this window 40% leaves about 360k tokens. The largest role reading set, 137,729 B, is about 40k tokens, roughly 4%. On this model the yardstick of part 5 §1 is met with wide room.

**Codex note.** Codex shows a fill level differently, or not at all (part 8). Re-measure there and record whether a fill level can be read.

## Cost

105 headless reading sessions, about **$127** at list prices (from the harness's own reports):

- **Value 1:** 40 trials, $10.
- **Value 2:** 20 trials, $20.
- **Value 3:** 25 trials plus 2 open-book validation runs, $2.
- **Value 4:** 18 trials including the pilot, $94.
- **Mechanical calibration:** 3 sessions, about $2.

The 103 fidelity trials are within the protocol's cap of 140.

## Departures from the protocol, and limits

- **Questions after the read, not in the same turn (9.4).** The questions came in a second turn of the same session, so reading could not be aimed at them. For values 1–3 that turn had no tools, so the source could not be reopened. Nothing could compact between the turns, and no transcript shows that anything did.
- **Fill measured by the harness, not stated by the session (6.1, 9.7).** It is the same count the harness shows the session.
- **Value 4 material.** The fill was real process prose from process3, not Process4's governing texts. Those total only 271 KB; the 80% points needed about 2.9 MB.
- **Early stop.** Used only at F1. The 20% pilot (`fill-20-s99`, identical except that its answer turn had no tools) counts as one of its three trials. Every other point ran the full N = 5, cut points included.
- **The tests may be easier than real reading.** Every reader was in the told arm: it knew questions would follow. Probes are distinctive invented codes, and the value-3 scenarios are four-option choices. A session reading habitually, without being told it will be asked, may hold less. A wholly clean result across all 103 trials is also a sign of a ceiling effect: these tests found no break, which is not the same as showing that none exists. That is why every figure keeps its margin, and why values 2–4 keep the provisional figure rather than rising.
- **Value 4 work.** The work was question answering plus a handover, not code. A coding task at high fill was not measured.
- **Not tested.** Interaction effects (protocol 11) and sets of large files.

## Files

- `sweep.csv`: one row per trial, giving status, recall, negatives, missed classes, context tokens and whole-read result.
- `raw/single`, `raw/set`, `raw/role`, `raw/fill`: each trial's full record, with the session's replies and per-question scoring. `raw/mechanical-calibration.json`: the cut calibration.
- `harness/`: the scripts that built the carriers and ran and scored the trials, kept so the run can be repeated, on Codex too. The answer-key files and probed carriers were not committed.
