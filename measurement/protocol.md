# Process4 reading-fidelity measurement protocol

Developed 20 November 2026 by PROCESS (via a worker), on the owner's instruction to
develop a bounded, conservative protocol for empirically fixing the four reading values of
design part 5 §2 — "workable numbers we can rely on," not the true limits. This is PROCESS
research (rule 3): the grounds for a later proposal to the owner on the four figures.
Status: proposed; nothing here is in force. It is run by a lead session in a Claude Code
session with the Process4 repository mounted — which carries the real governing texts
(`design/`, `build/`, `starting_texts/`) this protocol uses as carriers. The initial
prompt is `initial-prompt.md` beside this file, and `README.md` says how to start it. A
lead session should be able to pick this up and run it unaided.

The worker could not reach the prior first-measurement material in the public process3 repo
(`process4/working/reading_measurements/RESULTS.md`, `RERUN_PROMPT.md`); if the lead can
reach it, it should fold those probe details in before running. This protocol is built from
the design alone.

This protocol measures the four size values of design part 5 §2:

1. The largest **single text** read in full (provisional 24,000 bytes).
2. The largest **set of texts** read together (provisional 175,000 bytes).
3. A role's **starting text** (provisional 4,096 bytes and at most ten rules).
4. The **fill level** at which a session is refreshed (provisional 40% of the window).

All four are currently provisional. The first two rest on a first measurement the owner
judged too weak: it showed sizes that *worked*, never a size that *failed*, so it gives a
safe floor, not the ceiling. The third was proposed, never measured. The fourth is from the
owner's earlier words, never measured.

---

## Part 0. Purpose and philosophy

### 0.1 What this protocol is for

Process4 keeps every governing text under a measured maximum so sessions **read in full
rather than skim**. If a true limit is exceeded there is a silent **loss of fidelity**: the
session skims, then acts on what it did not take in. The damage is invisible at the time and
shows up later as bad work. This protocol's job is to replace the four provisional figures
with **workable numbers we can rely on** — not to find the exact true limits.

### 0.2 The three framing facts that shape every choice below

- **The problem is indeterminate.** A perfectly rigorous search would run forever (infinitely
  many sizes, infinitely many texts, a probabilistic model). We do **not** design an endless
  search. We design a *bounded* one with a fixed, stated cost and explicit stop conditions.
- **Conservative lower bounds already exist.** The four provisional figures are sizes shown
  to work (or, for 3 and 4, the owner's standing policy). We are not starting from zero; we
  are checking whether they are safe and finding how much headroom (if any) exists.
- **The error is asymmetric, so we round down.** Setting a limit too low costs a little
  room; setting it too high causes silent fidelity loss during real development. Therefore
  every chosen number is rounded **down** toward safety, with an explicit margin, and any
  tie or ambiguity resolves toward the smaller (safer) value. For the fill level, "safer"
  means refreshing **earlier** (a lower percentage).

### 0.3 Harness

Per the owner's decision of 20 Nov 2026, Process4 proceeds on **Claude Code first** (Codex
later). This protocol is written to **run on Claude Code**. Each value's section ends with a
**Codex note** marking what must be re-measured there. The design uses the more-constrained
Codex maximums on both harnesses (part 5 §1); keep that in view, but the runs below target
Claude Code.

### 0.4 Claude Code mechanical facts this protocol must respect (design part 7 §2)

- A plain read returns a file **whole up to ~25,000 tokens**. A larger file comes back
  **cut**, and the cut-notice arrives apart from the read's result.
- A file **over 256 KB is refused**, with no lines returned.
- A session **can read its own fill level** (part 7 §1).
- **Compaction** shrinks a full context automatically and **loses what was read** (part 7 §1).
  Refresh exists precisely to pre-empt compaction, so no trial may be allowed to compact
  mid-measurement — compaction during a trial voids that trial.

A "cut" read and a "refused" read are **mechanical** failures, detectable at the time, and
are a *different* thing from fidelity loss (silent skimming of a text that *was* returned
whole). The protocol separates the two: a mechanical cut/refusal is an automatic non-read
(not a fidelity data point), and it sets an absolute ceiling the fidelity limit can never
exceed.

---

## Part 1. Definitions

### 1.1 Fidelity

**Fidelity** = the degree to which a session has actually taken in the whole of a text it
read, as opposed to having skimmed or scanned it. We cannot observe reading directly; we
measure it through **probes** (recall) and, for role texts, through **rule application**
(completeness of action).

### 1.2 Probe

A **probe** is a short, distinctive, arbitrary, checkable fact planted at a known position in
a carrier text. A good probe is:

- **Arbitrary / un-guessable** — it cannot be inferred from the surrounding text or from
  general knowledge (e.g. an invented token: *"the calibration key for section 4 is
  `QX-7731`"*, or *"the verification phrase here is `amber-lantern`"*). This defeats
  confabulation: a skimming model cannot reconstruct it.
- **Semantically inert** — removing it would not break the text, so its presence does not
  change how hard the text is to read, and planting it does not distort the measurement.
- **Checkable** — there is exactly one correct answer, recorded in an answer key the reading
  session never sees.

**Probe positions.** Each probe has two coordinates:

- **Linear position:** *early* (first ~15% of the text), *middle* (~40–60%), *late*
  (last ~15%).
- **Structural depth:** *shallow* (a top-level line, e.g. directly under a heading) vs
  *deep* (buried — inside a nested list, a table cell, or mid-paragraph several levels down).

That gives a **3 × 2 grid = 6 position classes**. Skimming fails the *middle* and *deep*
classes first (the well-known "lost in the middle" effect), so those classes are the binding
constraint.

### 1.3 Probe density

- **Single text / set text:** **2 probes per position class = 12 probes** per carrier (for a
  very small text, see role-text section, which uses fewer).
- Probes are spread so that no two sit within ~500 bytes of each other, and the *middle* and
  *deep* classes are genuinely buried.

### 1.4 Negative control

Among the questions posed after a read, include **2 negative controls**: questions phrased
exactly like probe questions but whose true answer is **"not present / not stated"** (the
fact was never planted). A session that answers a negative control with a confident invented
value is **confabulating** — which means its "passes" on real probes may be guesses too. Any
trial that fails a negative control is marked **invalid** (not a pass and not a clean fail;
it is discarded and re-run, and a point that keeps producing confabulation is flagged as a
methodology problem, not a size result).

### 1.5 Pass threshold (a single trial)

One **trial** = one fresh session that reads the specified material and then answers the
question set **without re-opening the source** (re-reading would measure lookup, not the
fidelity of the single full read). A trial is a **clean read** when **all** of the following
hold:

- Every probe is recalled correctly (12 of 12), **and**
- Both negative controls are answered "not present", **and**
- No position class shows a miss.

A trial is a **dirty read** if any probe is missed. (A trial with a negative-control failure
is **invalid**, per 1.4, and re-run.)

Recall is scored exactly: a probe counts only if the planted token is reproduced correctly.
Near-misses count as misses (conservative).

### 1.6 Pass threshold (a size point)

Each size point is tested with **N = 5 clean-or-dirty trials** (invalid trials re-run until 5
valid trials exist). Classify the point:

- **PASS** — all 5 trials are clean reads.
- **FAIL** — 2 or more trials are dirty, **or** any single position class is missed in 2 or
  more trials (a repeatable fidelity gap).
- **MARGINAL** — exactly 1 trial is dirty and no position class repeats. A MARGINAL point is
  treated as the boundary itself and is **never** chosen as a limit; the limit is set below it.

This all-clean rule is deliberately strict because the cost of over-reading is silent and
real (0.2). We would rather call a workable size MARGINAL than ship a size that skims.

---

## Part 2. Test material

### 2.1 Use real governing texts as carriers

The measurement must reflect how hard Process4's **actual** texts are to read, not generic
prose. Carriers are built from the repository's real governing texts, with probes inserted
and synthetic filler added only to hit exact byte targets:

- **Design parts** (bytes, from starting_texts/00-index §2): 00 = 10,680; 01 = 8,300;
  02 = 15,773; 03 = 8,790; 04 = 19,737; 05 = 5,647; 06 = 9,052; 07 = 6,471; 08 = 4,111;
  09 = 2,340; 10 = 10,955. All eleven = 101,856.
- **Build texts:** 02 = 14,730; 02b = 10,264; 03 = 20,073; 05 = 17,002.
- **Role starting texts** (`starting_texts/`): the eight drafts, 2,689–3,950 bytes, each
  ≤10 numbered rule lines.
- **Role reading sets** (realistic set totals, same source): ROOT 76,889; coordinator
  101,452; ARCH 123,865; PROCESS 118,858; job 137,729; UX lane 105,752; walking (internal)
  63,366. These span ~63 KB–138 KB and are the natural material for the set-of-texts test.

The largest single real governing text is build text 03 at 20,073 bytes (design part 04 is
19,737) — both under the provisional 24,000. Sizes above that are reached by concatenating
real texts and topping up with **neutral filler of comparable structure** (headed sections,
lists, tables) so the carrier stays as dense/structured as real material.

### 2.2 Probe insertion

Probes are inserted into copies kept in the trial repository (or the scratchpad), never into
tracked design/build/starting_texts files. The answer key lives with the lead/controller and
is never shown to a reading session.

### 2.3 Model and effort are fixed and recorded

The first measurement used one model on a 1,000,000-token window. **Fix the model and effort
to those the production roles actually run**, record them in every result, and **re-measure
if the production model or effort changes** (a reading limit is a property of a specific
model, not of the process). Note: 40% of a 1M-token window is ~400k tokens, far above any
role's reading set (~16k–35k tokens), so on this window the mechanical room is abundant and
the fill-level question (part 6) is about *degradation*, not about *fitting*.

---

## Part 3. Value 1 — the largest single text

### 3.1 Design

Vary one carrier's size; find the largest size at which fidelity holds reliably. Each trial:
a fresh session is told to read one carrier file in full, then answer the 12 probe + 2
negative-control questions without re-opening it. Before scoring fidelity, confirm the read
**returned whole** (no cut-notice); a cut read is a mechanical non-read (0.4), recorded as
such and excluded from the fidelity pass/fail.

### 3.2 Bounded sweep

Coarse geometric sweep (factor ~2), anchored around the provisional 24,000 and extended
toward the mechanical ~25k-token cut:

| Point | Bytes | Note |
|---|---|---|
| S1 | 12,000 | below provisional |
| S2 | 24,000 | the provisional figure |
| S3 | 48,000 | 2× provisional |
| S4 | 72,000 | 3× provisional |
| S5 | 96,000 | near the ~25k-token cut; expect some cut reads here |

5 coarse points × N = 5 → **25 trials**.

**One refinement pass.** Bracket the boundary between the largest PASS and the smallest
FAIL/MARGINAL and test up to **3** intermediate sizes (halving the gap each step until the
bracket is ≤ ~6,000 bytes wide, then stop). 3 refinement points × 5 → **15 trials**.

**Single-text subtotal: ≤ 40 trials.**

### 3.3 Stop conditions

- Stop when the boundary is bracketed to within ~6,000 bytes, **or**
- all tested sizes PASS up to the point where reads begin to come back **cut** (then the
  mechanical cut is the binding ceiling — see 3.4), **or**
- the refinement budget (3 points) is spent.
- If the lowest point (S1) already FAILS, add at most **2** lower points (8,000; 4,000). If
  even those fail, stop and flag a **methodology confound** (a 12 KB real text skimming is
  not credible) rather than reporting an implausibly tiny limit.

### 3.4 Likely outcome and how to read it

On a 1M-token-window model, fidelity may well hold up to the mechanical cut. If so, the
single-text limit is set by the **cut ceiling** (the largest size reliably returned *whole*,
~25k tokens), with margin — not by a fidelity break. Report that plainly so the lead is not
confused when every byte size passes fidelity: the workable limit is
`min(fidelity-derived pass, mechanical-whole-read ceiling)`, then margin (part 7).

### 3.5 Codex note

Codex has a different (more constrained) window and a different cut behaviour. Re-measure S1–
S5 and the cut ceiling on Codex before relying on a single-text figure there; the design
already intends the Codex figure to govern both harnesses.

---

## Part 4. Value 2 — the largest set of texts

### 4.1 Design

A role reads its governing set as **several files**, each read with its own read call. Vary
the **total bytes** across the set; find the largest reliable total. Construct each set from
multiple real carrier files (each individually under the single-text limit and under the
256 KB refusal), probed **across the set**: 12 probes distributed over the files so that the
early/middle/late and shallow/deep classes map onto *position within the whole set* (e.g. a
"late/deep" probe sits buried near the end of the last file). Trial: the session reads all
files in the set in order, then answers the question set without re-opening.

### 4.2 Bounded sweep

Anchored on the provisional 175,000 and the real set totals (63 KB–138 KB):

| Point | Total bytes | Composition guide |
|---|---|---|
| T1 | 88,000 | ~ROOT-sized set |
| T2 | 132,000 | ~ARCH/PROCESS-sized set |
| T3 | 175,000 | the provisional figure |
| T4 | 220,000 | above provisional |

4 coarse points × N = 5 → **20 trials**. **One refinement pass**, up to **2** intermediate
sizes to bracket the boundary to ≤ ~15,000 bytes → **10 trials**.

**Set-of-texts subtotal: ≤ 30 trials.**

### 4.3 Stop conditions

Same shape as 3.3: stop when the boundary is bracketed to ≤ ~15,000 bytes, or when all points
up to T4 PASS (then the provisional 175,000 is confirmed with headroom and the set limit is
set at or below the largest PASS with margin). Keep every individual file well under the
256 KB refusal and under the single-text limit, so no mechanical cut confounds the set result.

### 4.4 Cross-check against the single-text result

A set total only means "read in full" if **each file** in it is also within the single-text
limit from part 3. Report the set figure together with the per-file constraint it assumes.

### 4.5 Codex note

Re-measure on Codex; the set is read as several files there too, but the window and per-read
behaviour differ.

---

## Part 5. Value 3 — a role's starting text

### 5.1 Why this one is different

A role text is a *small* single text (≤ ~4 KB), so recall is trivial — the real concern is
that the session **applies every rule** (completeness of **action**, not just recall). The
provisional is **4,096 bytes and at most ten numbered rule lines** (the count is numbered
rule lines, per part 10 §1 item 10; the owner's 20 Nov decision excludes the one mechanical
fetch line from the count). This section measures **rule-application completeness** at a given
size and rule count, and relates it to the single-text metric.

### 5.2 Design — the application battery

1. Take a role text with **K numbered rule lines** at byte size **S** (built from the real
   draft starting texts, padded/extended with realistic extra rules to hit K).
2. Build a **scenario battery**: for each rule line, **≥ 2 scenarios** that hinge on it — one
   where the rule plainly applies and must be honoured, one near-miss testing the rule's
   boundary — plus **≥ 2 joint scenarios** requiring two or more rules together.
3. A fresh session reads the role text in full, then works each scenario (decides and acts /
   states what it would do).
4. Score **application completeness**: a rule is "applied" only if **every** scenario hinging
   on it is handled correctly. Completeness = fraction of rules correctly applied.
5. **Negative control:** include ≥ 2 scenarios that *look* like they should trigger a rule
   but do not. A correct session takes no special action and says none applies; a session
   that invents a rule (over-application) fails the control, and that trial is invalid.
6. **Recall sanity check:** also plant a few probes and confirm recall passes (it should,
   trivially) — recall is the floor; **application is the governing result**.

**Per-trial pass:** 100% of rules correctly applied **and** negative controls clean.
**Per-point pass (N = 5):** all 5 trials pass. A single missed rule is a real fault (a role
acting without honouring a rule it "read"), so the bar is completeness, not a majority.

### 5.3 Bounded sweep (two axes)

**Rule-count axis** (size fixed near 4,096 bytes), to locate where application completeness
breaks as rules accumulate:

| Point | Rules (numbered lines) |
|---|---|
| R1 | 5 |
| R2 | 10 (the provisional count) |
| R3 | 15 |
| R4 | 20 |

**Size axis** (rules fixed at 10), to separate size effects from count effects:

| Point | Bytes |
|---|---|
| Z1 | 4,096 (the provisional size) |
| Z2 | 6,144 |

6 coarse points × N = 5 → **30 trials.** **One refinement pass** of up to **2** points around
whichever boundary binds (count or size) → **10 trials.**

**Role-text subtotal: ≤ 40 trials.**

Report the result in terms of **numbered rule lines** (the governing count) but also note the
**single-rule count** (each sentence/obligation counted singly; the drafts already run ~22–31
single rules behind ≤10 numbered lines per starting_texts/00-index §1), because application
load tracks the true number of distinct obligations, not the line count. If completeness
breaks by single-rule count rather than line count, say so — that is the owner's open item 10
answered with evidence.

### 5.4 Stop conditions

Stop when the breaking rule count / size is bracketed by one PASS and one FAIL/MARGINAL
adjacent point, or when R1–R4 and Z1–Z2 all PASS (then the provisional 10-rules/4,096-bytes
is confirmed with headroom). Do not search beyond 20 rules or 8 KB — a role text that large
violates the design's intent regardless of what the model can do.

### 5.5 Codex note

Re-measure on Codex; application completeness is model-specific. The ≤10-rule rule is a design
rule (part 5 §3), not a harness measurement, and stands on both.

---

## Part 6. Value 4 — the fill level for refresh

### 6.1 Design

Measure whether **work fidelity/quality degrades as the context window fills**, then set the
refresh level **conservatively below** the onset of degradation. The yardstick (part 5 §1):
after a session has read what it must, there must be room for **a worthwhile piece of correct
work plus a handover before the fill level**. So the test task at each fill level is exactly
that: a representative unit of real work *and* a handover.

Each trial:

1. Start a fresh session. Have it read material until its **self-reported fill level**
   (part 7 §1) reaches the target **X% ± 2 points**. The filling material includes a carrier
   with probes planted **early** (so they were read well before the fill was reached).
2. **Before any compaction** (compaction voids the trial — 0.4), pose the representative task:
   read one real module-sized requirements file (~15 KB) now in context and produce the work
   it calls for (e.g. a structured comment / answers to 10 questions whose facts are spread
   through it), **plus a short handover**.
3. Score two things: (a) **work fidelity** — is the produced work correct and complete,
   honouring facts spread throughout the task input; (b) **retention** — are the *early*
   probes (read long ago, now deep in a full context) still recalled.
4. Include a negative control in both the task questions and the probe set.

**Per-trial pass:** work is correct and complete, handover is adequate, early-probe retention
holds, negative controls clean. **Per-point pass (N = 5):** all 5 clean.

### 6.2 Bounded sweep

| Point | Fill level |
|---|---|
| F1 | 20% |
| F2 | 40% (the provisional / current policy) |
| F3 | 60% |
| F4 | 80% |

4 coarse points × N = 5 → **20 trials.** **One refinement pass**, up to **2** points to
bracket the degradation onset to ≤ ~10 percentage points → **10 trials.**

**Fill-level subtotal: ≤ 30 trials.**

### 6.3 Stop conditions

Stop when the degradation onset is bracketed by one PASS and one FAIL/MARGINAL adjacent fill
level, or when F1–F4 all PASS (degradation not observed within tested range; the refresh level
is then set by the yardstick and margin, not by an observed break — report that).

### 6.4 Direction of the margin (inverted)

For this value, **lower is safer** (refresh earlier). The refresh level is set *below* the
onset of degradation, not at the largest pass. See part 7.

### 6.5 Codex note

Codex shows a fill level differently (part 8 territory); where a harness shows no fill level,
refresh comes only at a natural pause (part 5 §2). Re-measure on Codex, and record whether a
fill level is even readable there.

---

## Part 7. The conservative selection rule

Let **P** be the largest size that PASSED and **F** the smallest that FAILED or was MARGINAL
(so the true workable threshold lies in the interval `(P, F]`). Choose the limit **strictly
below P**, with an explicit safety margin, rounded **down**:

### 7.1 Values 1 and 2 (single text, set of texts) — larger is riskier

```
Limit L = floor_to_1000( 0.80 × P )      # a 20% margin below the largest confirmed clean size
L = min( L, P )                          # never above the largest confirmed pass
L = min( L, mechanical_whole_read_ceiling )   # never above the size still returned whole
```

- Round **down** to the nearest 1,000 bytes.
- If the sweep bracketed a fidelity break (a real F exists), additionally cap `L ≤ floor(0.9 × F)`
  and take the smaller of the two caps.
- If every tested size passed up to the mechanical cut, `L` is set by the cut ceiling with the
  20% margin (the single-text / set limit is mechanically, not cognitively, bound).

### 7.2 Value 3 (role text) — both axes

- **Rule count:** workable count = `largest rule count that PASSED − 1` (a one-rule margin
  below the confirmed pass), and never above the design's **10**. Report both the numbered-line
  count and the single-rule count at that point.
- **Byte size:** `L = floor_to_256( 0.85 × P_bytes )`, never above the design's **4,096**.
- Because the design caps these at 10 rules / 4,096 bytes anyway, the practical output is
  usually *"the provisional 10/4,096 is confirmed with margin X"* or *"tighten to …"*.

### 7.3 Value 4 (fill level) — smaller is safer (inverted)

Let **Pf** be the highest fill level that PASSED and **Ff** the lowest that degraded.

```
Refresh level = floor_to_5( Pf − 15 )    # refresh 15 percentage points below the highest clean fill
Refresh level = min( Refresh level, floor(0.9 × Ff) )
```

- Round **down** to the nearest 5 percentage points.
- Never set the refresh level *above* the current provisional 40% on the strength of this
  measurement alone — the 40% is the owner's standing policy; the protocol reports whether it
  is safe and how much headroom exists, and leaves raising it to the owner.

### 7.4 The tightening rule (the whole point of the asymmetry)

If fidelity/quality degrades **at or below a current provisional figure** — i.e. the
provisional size itself FAILS or is MARGINAL, or the largest PASS `P` is **below** the
provisional — then the provisional is **unsafe and must be tightened immediately** to `L`
computed above. Flag this as a **priority finding**: the process is currently running above a
safe limit, which means real fidelity loss is possible in live development *now*. This case is
reported first, before any headroom findings.

---

## Part 8. Total cost, stated up front

| Value | Coarse | Refinement | Trials (N = 5) |
|---|---|---|---|
| 1. Single text | 5 pts | ≤ 3 pts | ≤ 40 |
| 2. Set of texts | 4 pts | ≤ 2 pts | ≤ 30 |
| 3. Role text | 6 pts | ≤ 2 pts | ≤ 40 |
| 4. Fill level | 4 pts | ≤ 2 pts | ≤ 30 |
| **Total** | **19 pts** | **≤ 9 pts** | **≤ 140 sessions** |

One trial = one fresh session. **Planned upper bound: 140 sessions.** An optional early-stop
lowers the *expected* cost: at a point where the first 3 trials are all clean, or 2 of the
first 3 are dirty, stop that point early (the classification is already settled), which
typically brings the expected total to **~100 sessions**. The cost is finite and known before
any run begins — this is the bounded search the owner asked for, not an endless one.

A boundary point that lands **MARGINAL** may be re-run at **N = 8** (one extra round of 3) for
confidence; budget for at most two such boundary points (+6 sessions). Even with that, the
total stays under ~150.

---

## Part 9. Running a trial (operational recipe)

1. **Lead/controller** (a session that is *not* the reading session) prepares the carrier
   file(s) with probes at the planned positions and records the answer key privately. Keeps
   probe files in the trial repository or scratchpad, never in tracked governing files.
2. Start a **fresh** session (fixed model + effort, recorded). Its prompt tells it to read
   the named file(s) **in full** and then answer a questionnaire **without re-opening** them.
3. For the single-text/set tests, verify the read(s) returned **whole** (no cut-notice). A cut
   or a 256 KB refusal is logged as a mechanical non-read and the point's byte target is
   capped accordingly.
4. Pose the question set (12 probes + 2 negatives) in **randomised order**, in the **same
   turn** as the read where possible, to avoid any refresh/compaction between reading and
   answering.
5. Score against the key. Classify the trial (clean / dirty / invalid). Re-run invalid trials.
6. Repeat to N valid trials; classify the point (PASS / FAIL / MARGINAL).
7. For fill-level trials, additionally drive the fill to target via the session's
   self-reported fill level before posing the task, and confirm no compaction occurred.
8. Guard against contamination: a fresh session per trial; never reuse a session that already
   saw an answer key or another trial's questions.

---

## Part 10. Reporting format

For **each of the four values**, the protocol returns to PROCESS (for PROCESS to bring to the
owner):

1. **Recommended workable number** — the single figure to adopt (bytes; or rules + bytes; or
   fill %).
2. **Evidence** — the sweep table: every size/level tested, PASS/FAIL/MARGINAL, N, probe
   recall broken down **by position class**, negative-control outcomes, and (values 1–2) any
   mechanical cut/refusal observed.
3. **Margin** — P, F, the margin applied, and the arithmetic of part 7.
4. **Verdict on the provisional** — confirmed-with-headroom, or **tighten to X** (with the
   tightening rule flagged as priority if it binds).
5. **Model + effort** the numbers were measured on.
6. **Codex note** — what must be re-measured on Codex before the figure can govern there.

A one-line summary table heads the report:

| Value | Provisional | Recommended | Margin | Verdict |
|---|---|---|---|---|
| Single text | 24,000 B | … | … | … |
| Set of texts | 175,000 B | … | … | … |
| Role text | 4,096 B / 10 rules | … | … | … |
| Fill level | 40% | … | … | … |

---

## Part 11. What this protocol does and does not establish

**It does establish:**

- **Workable, conservative numbers** that, on the tested Claude Code model+effort and with
  realistic Process4 material, reliably produced full reads (values 1–3) and un-degraded work
  (value 4) across the trial budget — with a stated safety margin below any observed break.
- The **position-sensitivity** of fidelity (which parts of a text or context fail first),
  which is itself useful guidance for how to lay out governing texts.
- Whether each **provisional figure is safe**, and if not, a tightened figure.

**It does not establish:**

- The **true limits.** The problem is indeterminate; this is a bounded search for reliable,
  conservative numbers, not a proof of the maximum.
- **Guarantees for untested conditions:** other models, other effort levels, Codex, text far
  denser or more adversarial than the real governing material, or compositions not
  represented in the test sets. A change in production model or effort requires re-measuring.
- **That reading can never fail.** The model is probabilistic; "PASS" means no fidelity loss
  was *observed* below the chosen number within the trial budget, not that none can ever
  occur. This is why every figure is rounded down with a margin.
- **Interaction effects** beyond the stated cross-checks (e.g. a set at the set limit whose
  files are each at the single-text limit while the context is near the fill level). The four
  values are measured largely independently; the yardstick cross-check in part 5 §1 and part
  4 §4 is a consistency check, not a jointly-measured limit.

The protocol's promise is exactly the one the owner set: **reliable-and-conservative, not
precise.** It finds numbers we can rely on and rounds them toward safety, at a finite,
stated cost.
