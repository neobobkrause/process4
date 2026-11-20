# Research: owner acts that assume he edits files or types commands (20 Nov 2026)

Recorded by PROCESS #4 before proposing (rule 3). Source: the owner's report, 20 Nov 2026,
in PROCESS's session. The trial's ROOT #3, told "Instruction: merge p4-tranche onto main if
it's ready", found by a trial merge in `neobobkrause/process3-probes` that p4-tranche cannot
merge into main: `CLAUDE.md` conflicts. On p4-tranche it holds his 18 Nov Process4 approvals;
on main his older Process3 approvals, which he edited on 19 Nov (pull request 351). ROOT
recorded a PROCESS FAULT in that repository's handover-root record (issue 292); ARCH is
passing it on through the coordinator. The owner's statement of the real problem: "I don't
edit files and I don't enter command-line commands. Process4 assumes I do."

**Not read here:** the process3-probes repository itself. Reading or acting on it is outside
PROCESS's approvals (they name only `neobobkrause/process4`), and a `gh api` read across
repositories is refused anyway (design part 7 §3). The facts above are the owner's. The
walkthrough below is built so that each step names what he should see, so a difference from
these facts shows up at once and stops the walkthrough.

This is a measured fault: the tranche cannot reach main. Rule 6's "no change by default"
does not apply.

## Why the conflict happened

- Git merges two branches line by line from the point where they split. Both branches changed
  the same lines of `CLAUDE.md` after the split: p4-tranche on 18 Nov, main on 19 Nov (PR 351).
  Git cannot choose between two people's words, so it stops and asks a person to decide.
- GitHub's way of asking is its conflict editor: a text editor showing both versions with
  marker lines, where a person deletes what they don't want and saves. That is editing a file.
- The design expects this not to happen. Approvals edits go on the tranche branch, and main
  never moves while a tranche runs (design part 3 §1; part 6 §2). In the trial, main still
  carried Process3's own approvals and was edited directly, so both branches moved.
- Even without the conflict, the design gives every approvals change to the owner as a commit
  "on GitHub's website" (part 6 §2) or "a pull request on the tranche branch that he opens and
  merges himself" (part 6 §2; part 4 §7). Both mean typing the new text into a file in GitHub's
  web editor. The owner does not edit files, so every approvals edit has no route.

## The immediate conflict can be cleared with buttons only

Pull request 351 is merged on main. GitHub's **Revert** button on a merged pull request builds a
new pull request that undoes it exactly. Merging that revert puts main's `CLAUDE.md` back to its
wording before 19 Nov, which is also its wording where p4-tranche split off, provided nothing else
on main changed that file. Then only p4-tranche has changed the file since the split, git has
nothing to choose, and the tranche merges cleanly. After the tranche merge, main holds his 18 Nov
Process4 approvals, the same bytes he committed on p4-tranche, which are the approvals the trial's
sessions already run under (they start from the tranche branch, design part 4 §2).

- No session touches `CLAUDE.md`. Every text involved is his own committed wording, and his
  clicks on GitHub's website make every change. That is within part 6 §2 as it stands, so the
  conflict fix needs no process change.
- The required run `module-tests` reports on every pull request (`shims/module-tests.yml`,
  `on: pull_request`, any branch) and passes at once when no module code changed (design part 2 §9),
  so the revert pull request can satisfy a branch rule on main.
- Cost: any wording PR 351 added on 19 Nov leaves main. It would have left main anyway when the
  tranche merged with p4-tranche's text chosen. If he wants some of it in his Process4 approvals,
  that is new wording, which needs the general fix below.
- Risks, each caught by a step he can see: PR 351 changed files other than `CLAUDE.md` (the revert
  undoes them all); GitHub cannot revert it automatically (a later change to the same lines); main's
  `CLAUDE.md` changed before 351 as well (the compare page will still say it cannot merge).

## Every owner's act checked for the same assumption

Read: design part 1 §3 (his acts), part 4 §7, part 6 §2–3, part 7 §4–5, part 3 §6 and §8,
part 9; build text 4 §2 and §4 (the trial's asks); build text 6 §3 (the account switch).

**Need typing into a file (no route for him today):**
1. Committing his standing approvals, `CLAUDE.md`, in the product's and the process's
   repository (part 1 §3; part 6 §2; part 7 §4 acts 7–8).
2. Committing the forbidden commands, `.claude/settings.json`, a JSON file (same places).
3. Every later edit to either, by a pull request he opens and merges (part 6 §2; part 4 §7).
   The trial asks two of these (build text 4 §4, stages 2 and 3).
4. Resolving a conflict in either file: GitHub's conflict screen is a file editor (today's case).
5. Putting the permissions-management settings into an environment when they are missing
   (part 7 §5; part 1 §3; build text 6 §3 step 5): today that means pasting a setup script into
   the environment's settings. Checking that they are present needs no file. A session can read
   the environment and tell him, as PROCESS #4 did on 20 Nov.
6. Build text 4 §2 item 1 sends him to a proposal file for his approvals' wording.

**Need a command line:** no owner's act in the design as written. One at risk: the written
procedures for promoting a release, rolling one back, and handling a problem reported from an
installed site (part 3 §8; part 1 §2) are not written yet. On Cloudflare those would naturally be
commands. They must be written as clicks, or name someone else to carry them out.

**Already clicks, or words typed into a session or a form field (fine):** starting ROOT and
PROCESS; telling the coordinator things and giving marked decisions and instructions; approving
a release (typed in ARCH's session); choosing at PROCESS; GitHub settings and the branch rule
(part 7 §4 acts 1–4, 10: settings pages, with names typed into form fields); connecting Claude to
GitHub and installing the GitHub App; making the deploy token in Cloudflare's dashboard and entering
secret values into the environment's form (the value is pasted into a field, not a file); entering
allowed hosts (a form field, or a session proposes the change and he approves it in a prompt);
connecting an AI account; merging the building session's pull requests (a button).

## Options (considered together; none adds a test, gate, review or stop)

- **A — No change.** The conflict can still be cleared with buttons (above), since that stays
  within part 6 §2. Cost: every later approvals edit, the trial's two planned edits among them,
  needs file editing he does not do, so each one blocks; a setup without the environment
  settings blocks too.
- **B — Choose, don't type (recommended).** He never edits a file; his approvals stay in his own
  words; only his click lands a change to them.
  1. To move or reconcile his existing texts, he chooses which of his own committed versions
     stands, and GitHub's buttons do it (Revert, Merge). No session touches the files.
  2. New wording: he types it as a marked message in a session: the coordinator for a product,
     PROCESS for the process's repository. That session puts his exact words, unchanged, into a
     pull request that changes only that file, and never merges it. He opens the pull request's
     page, reads "Files changed", and clicks "Merge pull request". No session composes, alters or
     merges his approvals. Honest limit: a session does type his words into the file. Nothing
     but his reading of "Files changed" checks the transcription, and whether the permission
     checker lets a session write `CLAUDE.md` at all is **unproven**.
  3. The forbidden commands are a technical list, the same for every repository. Sub-choice:
     (i) he types it as in 2, as a list of commands; or (ii) recommended: PROCESS keeps it as a
     technical text, changed only as a process change on his marked decision, and a session copies
     it into a product's repository by a pull request that he merges with a click. (ii) moves its
     wording from him to PROCESS, a requirement change only he can make.
  4. Environment settings: a session checks the environment. Where the settings are missing, it
     proposes the change through the harness's own approval prompt, and he approves it with a click.
     His approvals forbid a session changing permission settings, and the change happens only on his
     click. Whether the checker lets a session make the proposal is unproven.
  5. The three support procedures (part 3 §8), when written, are written as clicks.
  Changes: design part 1 §3, part 4 §7, part 6 §2, part 7 §4–5; build texts 4 and 6; the
  coordinator's and PROCESS's starting texts gain the act "place the owner's typed approvals words
  in a pull request; never merge it" (kept within limits).
- **C — Sessions resolve, write and merge on his word.** The fewest clicks for him. But a session
  would land changes to his approvals, which he ruled out; the design forbids it (part 6 §2); and
  the permission checker, the only guard on those files, would likely refuse it. Not recommended.

Recommendation: **B**, with (ii) for the forbidden commands. The conflict walkthrough is the same
under A and B. Under C it would be a session's act instead.

## Still to settle with the owner

His marked choice (A / B / C, and (i) or (ii) within B), recorded verbatim in
`process/design-decisions.md` with the date, in the same step as the merge.
