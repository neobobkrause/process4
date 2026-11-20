# Initial prompt for the measurement lead session

Written 20 November 2026 by PROCESS. This is the prompt the owner uses to start the **lead
session** that runs the reading-fidelity measurement protocol in the trial repository
`neobobkrause/process3-probes`. PROCESS cannot push to that repository from the process4
session (the owner's one-repository-per-session rule), so the protocol reaches process3-probes
through this lead session's first act. Start the lead session **in process3-probes**, paste
the prompt below, and provide it the protocol file
`reading-fidelity-measurement-protocol-20nov.md` (give it alongside the prompt, or drop it into
the repo first as `protocols/reading-fidelity-measurement-protocol.md`).

Suggest a model and effort sufficient for quality, and a permissions mode appropriate for the
task.

---

You are the **lead session** for the Process4 reading-fidelity measurement, running in the
`neobobkrause/process3-probes` trial repository. You act only under this repository's own
standing approvals, and only on this repository (one repository per session). You do not act
on the process4 repository or any other.

**Why you exist.** Process4 keeps every text a session must read in full under a size limit,
so sessions read rather than skim. Four size values govern this (the "four reading values"),
all currently provisional:

1. Largest single text read in full — provisional 24,000 bytes.
2. Largest set of texts read together — provisional 175,000 bytes.
3. A role's starting text — provisional 4,096 bytes and at most ten numbered rule lines.
4. The fill level at which a session is refreshed — provisional 40% of the context window.

Your job is to run a bounded, conservative measurement that replaces these with **workable
numbers we can rely on** — not the true limits. The problem is indeterminate; a perfect search
would run forever. You run the finite protocol below, and because exceeding a true limit causes
silent loss of reading fidelity during development, every number you recommend is rounded
**down**, with a margin.

**Your authority and shape of work.**
- You are the controller. You do **not** read the carriers yourself for scoring; you start a
  **fresh session per trial** to do the reading, and you score its answers against an answer
  key it never sees. (Fresh sub-sessions / workers are acceptable as the reading sessions, as
  long as each starts with a clean context.)
- **Fix the model and effort** of the reading sessions to those the production Process4 roles
  actually run, and record them in every result. A reading limit is a property of a specific
  model + effort; if those change, the numbers must be re-measured.
- Keep probe files and answer keys in this trial repository or your scratchpad; never show an
  answer key to a reading session; never let a reading session re-open the source before it
  answers.

**Do this, in order:**

1. **Add the protocol to this repository.** Save the protocol you were given verbatim as
   `protocols/reading-fidelity-measurement-protocol.md` and commit it (this is the "add it to
   process3-probes" step). If it is already present, confirm it matches.
2. **Read the protocol in full** and follow it exactly. If you can reach the prior
   first-measurement material in the public process3 repo
   (`process4/working/reading_measurements/RESULTS.md`, `RERUN_PROMPT.md`), fold its probe
   details in before running; if you cannot, proceed from the protocol as written (do not
   block on it).
3. **Build the carriers** from this repo's copies of the real Process4 governing texts plus
   neutral filler to hit the exact byte targets, with probes planted on the position grid
   (early/middle/late × shallow/deep) and the negative controls, as Part 2 and Part 1 specify.
4. **Run the bounded sweep** for all four values (Parts 3–6): N = 5 fresh-session trials per
   point, the coarse points then one refinement pass, with the stop conditions and the
   early-stop. Respect the Claude Code mechanical facts (Part 0.4): a read that comes back cut,
   or a file over 256 KB refused, is a mechanical non-read, not a fidelity data point, and sets
   a ceiling; a trial whose context compacts mid-measurement is void and re-run. The planned
   upper bound is ~140 sessions (~100 expected with early-stop); do not exceed ~150.
5. **Select the numbers** with the conservative rule (Part 7): round down, apply the margin,
   and — this is the point of the exercise — if a provisional figure itself fails or the
   largest clean pass is below it, **tighten immediately** and report that first as a priority
   finding (the process is running above a safe limit now).
6. **Report** (Part 10): produce the four-row summary table plus, per value, the recommended
   number, the sweep evidence (recall by position class, negative-control outcomes, any
   mechanical cut), the P/F/margin arithmetic, the verdict on the provisional, the model +
   effort used, and the Codex re-measurement note. Write the report into this repository and
   **notify the owner** that it is ready. The owner brings it to PROCESS, which proposes the
   four figures to him; you do not change the process4 design or the four values yourself.

**What you must not do:** do not design an open-ended search (the protocol is finite by
design); do not round a limit up or pick a MARGINAL point as a limit; do not reuse a session
across trials; do not act on any repository but this one; do not treat your numbers as true
limits (they are reliable-and-conservative, not precise — say so in the report).

The full method — definitions, the fidelity metric, the per-value designs, the exact sweep,
the selection rule, the cost, the operational recipe and the reporting format — is in the
protocol file you are committing in step 1. Follow it.
