Written by a worker of PROCESS #10, 23 Nov 2026.
1. Bottom line. The design's "about thirty minutes for one command" is a default, not a ceiling: a background command in a cloud session runs up to 2 hours when given that timeout, and longer if the environment sets a variable.
2. The 45 minutes on GitHub is the process's own number; GitHub allows 6 hours per job.
3. Tests already run 3 files at a time where the machine has 4 CPUs (node's default); the floor for plane is its longest file, about 25 minutes.
4. Pieces are not needed for any module whose tests finish inside 2 hours; plane (about 44 minutes on GitHub) fits one background command.
5. Recommended: B now (one line, plus civicsmith's copy); under change 1, the tool's test command run as one background command; pieces and splitting stay unneeded.

# Long modules: where tests run, how long each place allows, and the options

## 1. How tests run now (read from the tool)

- `shims/module-tests.yml` part two (`timeout-minutes: 45`) checks out, installs the product's lock files, fetches the tool, then runs `p4 run tests`. So install time counts inside the 45 minutes.
- `tool/lib/scope.mjs` `runTests`: per module, first `p4 check <module>`, then ONE command: the product's `test_command` (default `node --test`, `tool/lib/config.mjs`) with every test file of the module as arguments, through `spawnSync` with no timeout (`tool/lib/util.mjs` `run`). No `--test-concurrency`, no per-test timeout (node's default is none).
- `node --test` runs each file in its own process, several at once: by node's documented default, CPUs minus one. Measured here (node 22.23.5, 4 CPUs): six 3-second files took 6.2 s by default (3 at a time), 18.3 s with concurrency 1, 3.1 s with 6. So the run is already parallel.
- GitHub's standard Linux machine (docs, read 23 Nov): 4 CPUs and 16 GB for a public repository, 2 CPUs and 8 GB for a private one. On 2 CPUs node runs ONE file at a time. Whether civicsmith is public or private was not read, so whether plane's 43.9 minutes was serial is unknown.

## 2. What "long" means in each place

| Place | Limit | Source |
|---|---|---|
| GitHub job | 45 min, set by the process (`shims/module-tests.yml` line 89) | measured: plane cancelled at 45 |
| GitHub ceiling | 6 hours per job; 35 days per workflow run (waiting counted) | GitHub docs, read 23 Nov |
| Session, foreground command | 2 min default, 10 min max; at its timeout it moves to the background and gets 30 more min | Claude Code docs, read 23 Nov |
| Session, background command | 30 min default; up to 2 hours with `timeout`; more only by setting `BASH_DEFAULT_TIMEOUT_MS` / `BASH_MAX_TIMEOUT_MS` on the environment | Claude Code docs; this harness's own tool text says the same |
| Session machine | about 4 CPUs, 16 GB, 30 GB disk ("may change") | docs; measured here 4 CPUs, 15 GB, 60 GB free |
| Monitor tool (waiting on a condition) | one watch at most 30 min, then re-armed | this harness's tool text |
| Idle session | the VM pauses "after a few minutes without activity", and a paused VM can be reclaimed | docs |

So the design's thirty minutes (part 7, section 1) is the background default; a tool command can ask for 2 hours. Two rules from the docs matter: a background command started by a WORKER stops when the worker ends, so the job session itself must start it; and the session is re-invoked when its background command exits.

A long module is therefore: on GitHub today, one whose install plus tests pass 45 minutes; under change 1, one whose tests pass 2 hours in one session command (plane is far below). Its floor is its longest test file, whatever the concurrency.

## 3. Options

Under the current process (GitHub runs the tests):

- **A. No change.** Removes nothing. plane merges only if ARCH's speed-up (parallel boots inside migrate-released, target 30 min) lands; any later module past about 40 minutes of tests hits the same wall. Adds nothing forbidden. Needs nothing.
- **B. Raise part two's limit** to 360 (GitHub's ceiling; deleting the line gives the same). Removes the process's own cut-off. Costs: one line here; a cancelled or hung run can use up to 6 hours of GitHub minutes; the second run of every test stays. Adds no test, gate, review or stop. Does NOT reach civicsmith by the move to the latest version: the move changes the tool's commit in `process.json`; the workflow is civicsmith's committed copy, so it needs the same line by a pull request into its tranche branch (the drafted civicsmith approvals let its sessions change workflow files by pull request merged once checks pass; its live approvals were not read here). The pull request's own run uses its changed workflow, so it is not cut by the old limit.
- **B2. Name the concurrency** in `test_command` (for example `node --test --test-concurrency=4`). Helps only on a 2-CPU machine where node chose 1; never below the longest file. Product config, in civicsmith's `process.json`; the memory of several heavy files at once is unknown. Adds nothing forbidden.

Under the proposed process (tests run once in the job, recorded by the tool):

- **C1. One background command (recommended).** The job session starts the tool's test command with `run_in_background` and a timeout up to 2 hours; the tool runs scope, `check` and the tests exactly as `runTests` does now, confirms the checkout is clean and its commit is the pull request's head before and after, and writes the pass for that commit. The session is woken when it exits; to keep the VM from pausing it waits in its turn (the Monitor tool, or short foreground waits) rather than ending its turn. Removes: GitHub's run and its 45 minutes, the second run, pieces. Costs: part of change 1's build, plus one line in part 7 replacing "about thirty minutes" with the real numbers and the job's starting text saying to start it in the background itself, not in a worker. Adds no test, gate, review or stop (it replaces the run that exists). Reaches civicsmith partly by the move (tool and starting texts), but GitHub's side of change 1 (the seconds-long check, or removing the workflow and the required check) is a change in civicsmith's repository or its branch rule either way.
- **C2. Pieces** (a file or a few per command, the whole recorded when every piece passed). Removes the need for any single long command, and lets a restarted machine resume. Costs: the tool keeps per-piece results for one commit on the pull request and refuses a whole pass while a piece is missing or from another commit; the job spends one session turn per piece (147 files in plane); a single file longer than the command limit still cannot be split; tests that share set-up across files may differ when run apart. Adds no test or gate, but more tool. Not needed while a module fits 2 hours; the owner deferred it.
- **C3. Raise the session's limit** by `BASH_DEFAULT_TIMEOUT_MS` / `BASH_MAX_TIMEOUT_MS` on the cloud environment, proposed by PROCESS through the harness's approval prompt, the owner approving there. Only for a module past 2 hours. Reaches civicsmith's sessions only if they run in that environment (not read).

Product matters, either process:

- **D. ARCH splits a long module** into two real modules (design part 2, sections 1-2: ARCH edits the module list and moves code by a mechanical edit). A product decision, in civicsmith's repository only; needs no Process4 change; adds nothing forbidden. Costs a reshaping, new uses and a new order. Not a general fix.
- **E. The job speeds up its own tests** (ARCH's course for plane now). Product work; changes no workflow.

## 4. Measured, inferred, unknown

- **Measured:** plane: 147 files, 591 tests, `duration_ms` 2632285 (43.9 min), cancelled at 45 (ARCH's reading of run 45179857787); migrate-released about 25 min (ARCH's words, how measured not stated). Here: node's default runs 3 files at once on 4 CPUs; this machine has 4 CPUs, 15 GB, 60 GB free disk. A background command started by this worker (a loop writing the time each minute) ran PROBE_RESULT.
- **Documented:** GitHub 6 hours per job, 35 days per run, the machine sizes; Claude Code's foreground 2/10 minutes, background 30 minutes default and 2 hours maximum, raising variables, worker-started commands stopping with the worker, a paused idle VM.
- **Inferred:** with 3 files at once in a session, plane takes at least its longest file (about 25 min) and likely well under 2 hours; that a move to the latest version does not touch civicsmith's workflow copy (nothing read rewrites it).
- **Unknown:** whether civicsmith is public (GitHub's CPUs, so whether plane ran serial); how long plane's tests take in a session; whether a running background command keeps the VM from pausing once the session's turn has ended (so C1 says to wait inside the turn); the most a session may live; memory of several heavy files at once; whether civicsmith's live approvals let its sessions make B's pull request.
