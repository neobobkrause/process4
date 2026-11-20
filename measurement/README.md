# Measurement: Process4's four reading values

This area holds everything needed to run the reading-fidelity measurement that fixes the
four size values of the design (part 5 §2) with workable, conservative numbers:

1. the largest single text read in full (provisional 24,000 bytes),
2. the largest set of texts read together (provisional 175,000 bytes),
3. a role's starting text (provisional 4,096 bytes and at most ten rules),
4. the fill level at which a session is refreshed (provisional 40%).

## Files here

- `protocol.md` — the method: definitions, the fidelity metric, the per-value designs, the
  exact bounded sweep (~100–140 fresh reading sessions, cost stated up front), the
  conservative selection rule, the operational recipe and the reporting format.
- `initial-prompt.md` — the prompt to give a Claude Code session that will run it.
- `results/` — where the lead session writes its report and raw sweep data.

## How to run it

1. **Start a Claude Code session with this repository (`neobobkrause/process4`) mounted**, in
   Auto mode, under the repository's standing approvals. (Any Claude Code account works; the
   repo must be mounted because the protocol builds its carriers from the real governing
   texts in `design/`, `build/` and `starting_texts/`.)
2. **Give it `initial-prompt.md`** as its starting prompt.
3. **Tell it the model and effort** the production Process4 roles will run on — the reading
   limit belongs to a specific model+effort, so the measurement must use that one.
4. The lead session reads `protocol.md`, builds probed carriers (in its scratchpad, never in
   the tracked governing texts), runs the bounded sweep with fresh reading sessions on the
   fixed model+effort, selects each number conservatively (rounding down, with a margin),
   writes its report to `results/`, opens a pull request, and notifies you.

## After the run

Bring the report to PROCESS. PROCESS turns the four recommended numbers into a proposal for
the owner; the figures become the design's values only on the owner's word. The lead session
does not change the four values itself.
