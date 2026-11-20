: <<'PROMPT_IS_BELOW'
This file is the initial prompt to paste into a Claude Code session that has the Process4
repository (neobobkrause/process4) mounted. Everything below the line is the prompt. Before
you start the session, decide the model and effort the production Process4 roles will run on,
and give that to the session when you start it (replace <MODEL + EFFORT> below, or just tell
it in the first message).
PROMPT_IS_BELOW

---

You are the **lead session** for the Process4 reading-fidelity measurement. You are running in
the **Process4 repository (`neobobkrause/process4`), mounted**. You act under this repository's
standing approvals, loaded from `CLAUDE.md` at your start: you may push to your own working
branch, open/edit/merge pull requests (merge to main once the required check passes), run the
tool, run builds and tests, and start workers. You never change the files in `design/`,
`build/` or `starting_texts/`; you never change the process or the tool; you never act on any
other repository.

**Your job.** Run the measurement in `measurement/protocol.md` and produce workable,
conservative numbers for Process4's four reading values, for PROCESS to bring to the owner.
**Read `measurement/protocol.md` in full first and follow it exactly.** It is finite by design
(~100–140 fresh reading sessions, a stated cap); do not turn it into an endless search.

**Model and effort (the key input).** Fix the **reading sessions'** model and effort to what
the production Process4 roles will run on: **<MODEL + EFFORT>** (if this was not filled in, ask
the owner before you build anything). A reading limit belongs to a specific model+effort — use
exactly that one and record it in the report. Your own (lead) model+effort can be whatever is
sufficient to orchestrate and score.

**Build the carriers.** Build them from this repo's **real** governing texts (`design/`,
`build/`, `starting_texts/`) plus neutral filler to hit the exact byte targets, with probes on
the position grid (early/middle/late × shallow/deep) and the negative controls (protocol
Parts 1–2). Keep carriers and answer keys **in your scratchpad** (or an untracked
`measurement/carriers/` you do not commit) — **never insert probes into the tracked
`design/`, `build/` or `starting_texts/` files.**

**Run the sweep.** Execute the bounded sweep for all four values (protocol Parts 3–6): N = 5
fresh reading sessions per point, the coarse points then one refinement pass, with the stop
conditions and the early-stop. Each reading session is a **fresh worker on the fixed
model+effort** that reads the carrier and answers the probe + negative-control questions
**without reopening the source**; you score it against the private key and classify
PASS / FAIL / MARGINAL. Respect the mechanical facts (protocol Part 0.4): a read that comes
back cut, or a file over 256 KB refused, is a mechanical non-read, not a fidelity point; a
trial whose context compacts mid-measurement is void and re-run.

**Select the numbers.** Apply the conservative selection rule (protocol Part 7): round **down**
with a margin; and if a current provisional figure is itself unsafe (fails, or the largest
clean pass is below it), flag that **first** as a priority finding.

**Report.** Write the report (protocol Part 10: the four-row summary table + per-value
evidence, the model+effort used, the Codex re-measurement notes) and the raw sweep data into
`measurement/results/`. Commit it on a working branch and open a pull request **with the
tool** — `node tool/p4.mjs` with `branch`, `push`, `open --title`, `ready`, `results` (until
passed), `merge`; a direct `gh`/`git` push is denied by design, so use the tool. A
measurement-only change passes the required check at once. Then **notify the owner and
PROCESS** that the report is ready. **Do not change the four design values yourself** —
PROCESS proposes them to the owner, who settles them.

**Flow reminder.** Branch from main: `git checkout -b work/measurement-run origin/main`; make
your files; `git add` + commit; `node tool/p4.mjs push`; `node tool/p4.mjs open --title "..."`;
`ready`; `results` until `passed`; `merge`. Give each judged tool act its own shell command;
never chain them. If a merge is refused as "Destructive or Unwanted Actions," run `git status`
alone, then the merge alone, and retry once.
