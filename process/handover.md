# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 22 Nov 2026, by **PROCESS #6** (`session_018BhcecxLoUeRRqQzG6YZNk`), after the
decisions on tests and signing keys, at a low fill. It is recorded as generation 6 in `handover-process`. A successor is
**PROCESS #7**: read generation 6 there, name yourself `PROCESS #7` with set-session-title (pass your
own session id), and record generation 7 and your session there (the file must start with the JSON block).

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry: `process3-probes`, ROOT `session_018Bhceg1d5SVx54aCGkzRe3` (ROOT #7). ROOTs refresh
   often; confirm with `list_sessions` (titles `process3-probes ROOT #N`, tag `process4-product:process3-probes`)
   and message the live ROOT your session and generation.
4. Your lane: **PROCESS civicsmith lane #2**, `session_018BhceeTQKM67dJhV5dBPyh` (model claude-opus-5-5), in the
   `lanes` record; civicsmith's onboarding lane. Its page https://claude.ai/artifact/HyRJShix1qLvC4LCu2pH8R
   (a Claude Doc; read it with the Claude Docs connector); its folder `process/lanes/civicsmith/`. Message it
   your session. Lane #1 (`session_018BhceckLEcDGQG4yqJtMVH`) asked for its refresh at 53 percent on 22 Nov
   and was archived by PROCESS #6. To refresh a lane: write it not live in `lanes`, start the successor
   with create_session (the prompt PROCESS #6 used is in lane #2's first message), write it live, archive
   the old one. The trial's coordinator #3 is `session_018BhceeRZwDtL5rXcx3Mp5q`.
5. Keep the owner's page **"Process4 Waiting for Bob"**: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy
   (source `coordination/owner_page/desk.html`; keep both in sync). Owner comments on it wake PROCESS; read
   them with ArtifactComments, reply and resolve.

## Current work: product onboarding (decided 22 Nov)

Built and recorded by PROCESS #6 on the owner's decisions of 22 Nov (entries in
`process/design-decisions-2.md`, and "Publishing a release" in `design-decisions.md`; research in
`process/research/product-onboarding-22nov.md`, sections 5 to 7):

- The onboarding lane (design part 6 section 8); the read-only session he starts; settings by his clicks.
- A product's token is made once with every permission its development will need (part 1 section 3).
- The tool's tests run only where the tool is changed: PROCESS runs before pushing only the tests of the
  tool it changed; `tool-tests` passes at once on a draft and on a pull request that changes no file of
  the tool (`tool/`, `shims/`, `starting_texts/job.md`, `starting_texts/walking-session.md`, the workflow).
- Production signing keys stay in the sessions' environment ("No session directly holds a production
  key" is gone from the design). The civicsmith approvals draft was changed to match.

- **Decided 22 Nov:** the lane talks directly to PROCESS, keeps the product's "waiting for Bob" page with
  status and fully detailed steps, and starts with GitHub; no GitHub token is made where sessions act
  through Claude's GitHub connection (part 6 section 8; part 1 sections 3 and 5; part 7 section 4). So no
  token and no tool change. Untried through the connection: publishing a release.
- **Decided 22 Nov ("decision: option B, as recommended"):** the declared-uses check refuses a declared
  use of a module that is not before this one (tool `check`, design part 2 sections 1 and 6, build texts
  1b and 2). Research: `process/research/tests-referring-to-later-modules-22nov.md`. Known limit, not
  changed: the check sees only imports by path, not references by package name. The lane's second
  reading (item 12) looks for every kind of reference on civicsmith-copy's main.
- **The civicsmith lane is civicsmith's onboarding lane** and works to that decision: its page as
  civicsmith's "waiting for Bob"; the GitHub token steps first; then the repository set-up walk-through;
  then the Cloudflare token (draft up; a second read-only reading closes it). It tells PROCESS when ready.
- **PROCESS #5 is archived** (by the owner, 22 Nov; confirmed from the session list). It had acted once
  after handing over (pull request 123). Only one PROCESS writes.
- **The decisions record is two files**, both read, each under 60,000 bytes; new entries go in the second.

## Done in PROCESS #5 (all merged, tool-tests green)

- The trial's p4-tranche joined to main (option C; research `tranche-unrelated-to-main-20nov.md`); build
  text 4 says a tranche branch starts from main.
- Setting up an existing product: part 7 §4 act 8 and act 10, part 6 §2, build text 2 (civicsmith lane
  points 1, 2, 3, 5, 6, 9; "Decision: B").
- A session can set its own name, recorded as seen to work.
- civicsmith lane started; civicsmith-copy approvals drafted for the owner to paste
  (`process/research/approvals-draft-civicsmith-copy-21nov.md`); first-approvals gap researched
  (`first-approvals-in-existing-product-21nov.md`).
- Trial ROOT refresh cadence measured (`root-refresh-cadence-22nov.md`): quiet wakes ~10.5k (ROOT) and
  ~5.7k (watcher); 21 Nov's ~43k/wake jump was a harness effect; no change recommended.

## Waiting on the owner

- civicsmith-copy (22 Nov): GitHub set-up done on his word (a session cannot read those settings);
  `CLAUDE.md` landed by him and read back as drafted; T53 decided ("Start from main as it is. ..."; a
  product decision, kept by the lane). `.claude/settings.json` on its main was not valid JSON (the page had
  given him a fragment; PROCESS #6's fault to have kept that wording); he reported it fixed on 22 Nov with
  the whole of `shims/claude-settings.json`, to be read back by the third reading. The Node 26 hook it lost is
  recovered by the third reading and put back by the set-up session's pull request, which he merges.
- The second and third readings are in `process/lanes/civicsmith/research/` (`-reading-2.md`,
  `-reading-3.md`). Item 12 (tests reaching a later module) is sorted for ARCH in
  `process/lanes/civicsmith/later-module-tests.md`: no static import reaches a later module; 62 test files
  in 21 modules start the real plane; with tests counted, 151 to 170 modules form one connected set. The
  tool cannot see such reach, so the order rule rests there on ARCH's module list; PROCESS recommended no
  process change now (the research note's last section). The third reading's local main was stale, so
  his fixed settings file is read back by the set-up session; the recovered hook is
  `SessionStart -> bash "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"`.
- Two matters the lane passed to PROCESS, not yet put to the owner (one at a time): (a) civicsmith's own
  `container-images` workflow pushes to Docker Hub with repository secrets, which act 3 ("no repository
  secrets") removes; `deploy-test` likewise holds a Cloudflare token as one; `release-sign` uses an
  environment secret behind a required reviewer. Options to prepare: an environment with a required
  reviewer for them; or the push moves into the session-run release ceremony with a token in the
  sessions' environment; or an exception to act 3. (b) civicsmith's installer takes no token, only the
  owner's own sign-in, so the install and update before a release (part 3 section 6) is his own act for
  this product; no design change asked, it goes on his release page.
- The set-up session ran on 22 Nov (`process/lanes/civicsmith/research/setup-session-report.md`):
  civicsmith-copy PR #1119 (first Process4 files; merged by the owner's click, since its approvals let
  sessions merge only into p4-tranche and p4-tranche into main); `p4-tranche` made from main; his fixed
  settings file read back as `shims/claude-settings.json`; hook PR #1120 open for his click;
  `process.commit` = process4 `eeb35f3`. The lane is not refreshed again: it ends when ROOT starts.
- **Open research, the main risk now:** `check` fails on the code as it stands (setup-words 551, 518 in a
  vendored file; record-grammar 59). `process/research/check-on-real-code-22nov.md`. A read-only
  measurement over all 178 modules is asked of the owner (one paste into the set-up session,
  `session_018BhcecbrWWH3xBs3py4NQW`); its report comes to PROCESS by message. Then put options to him
  (that note's last sections). No job should open on civicsmith before that.
- Also for later: who merges the set-up pull request into main (same note, last section).
- Done on his word, 22 Nov: #1120 merged (the hook is on main); the measurement pasted into the set-up
  session; the Cloudflare token created and entered in the environment. Next for him: Action 9 (branch
  rule); Action 9a (carry main's `.claude/settings.json` onto p4-tranche by his clicks); Action 10
  (ROOT), whose prompt carries PROCESS's session. When civicsmith's ROOT messages its
  address, add it to `products` in `handover-process`; then archive the lane and write it not live.

## Environment / tool notes

- Run no tool tests by hand unless you changed a tool, and then only that tool's tests (his decision).
- `node tool/p4.mjs <cmd>`; direct `gh` is denied by design. Flow: `git checkout -b work/<name> origin/main`
  → edit → commit (author `Claude <noreply@anthropic.com>`, Co-Authored-By + Claude-Session trailers) →
  `p4 push` → `p4 open --title` → `p4 ready <pr>` → `p4 results <pr>` until passed → `p4 merge <pr>`
  (it waits ~40 s after the last merge into main; run it with a timeout of 100 s).
- The `lanes` record refuses a second live session; write a lane as not live before rewriting it.
- design/, build/, starting_texts/ change only on the owner's marked decision ("Decision:" or
  "Instruction:"); an unmarked request is refused by the checker — ask once. His decisions may arrive as
  comments on his page.
- Bookkeeping: each design part and build text states "Length: N lines"; `starting_texts/00-index.md`
  carries byte figures and set sums — re-measure on any size change.
- How the owner wants to be spoken to: plain words, short, bottom line first; clicks with full addresses
  and exact button labels; one matter at a time.
