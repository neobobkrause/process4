# PROCESS handover

Written 26 Nov 2026 ~09:35Z by **PROCESS #18** (`session_018BhcegQp6kkojsnYHjDzsr`), fill ~44 percent. If you are its
successor, you are **PROCESS #19**: read the generation in `handover-process` (18), name yourself `PROCESS #19` with
set-session-title, record generation 19 and your session there (keep the registry), and message each ROOT in the registry
your address. Your fill (`get_session`, `context_usage`) is real after your first turn ends. Never `git add -A`; put
`.claude/worktrees/` in `.git/info/exclude`. In `tool/`, check TypeScript is 5.6.3 (`npm ci` if not) before running tests.

**Your reading** (the owner's decision (ii)): the design in full, `process/README.md`, `process/decisions-index.md`,
`process/research/README.md`, `process/lanes/civicsmith/README.md`, `build/README.md`, and this handover.

## START HERE: civicsmith's first pass of 8 conversions is under way; tool faults it found wait for the owner

civicsmith moved to 1216397 (who is told; 1-A, 2-B1, 6B; the depth rule) and its first pass of 8 conversions began.
Its ARCH #28 reported faults, all in `process/research/facility-names-26nov.md`:
1. Package facilities named by the machine's path; the product's own members and two host members counted as the host's
   (~15,677 places nothing can clear). Correction built by a worker on `work/facility-names` (59fa682; tool 273/273); an
   implementation error against build text 2c, no text change. Put to the owner as options 0 / A (A recommended), on his
   page. **Waiting for his word.**
2. Three more from job setup-words #11 (Buffer/maxBuffer missing from the host description; S12 counting RegExp `.test`;
   an import with `?again` not resolved). A worker is researching and prototyping them on top of 59fa682 (branch
   `faults-worker` in its worktree); fold its result into the same group and put it to the owner with item 1.
3. `documents` left with no code: design part 2 §1 already makes it a list error; PROCESS told coordinator #10; ARCH
   carried it out. Put to the owner as 0 (recommended) / B on his page; no word yet.
On his word: merge the group into main (p4 merge), record his words in `changes` and the decision record (subject "Who a
change tells" or a new one), and tell civicsmith's coordinator that the latest version holds the corrections; civicsmith
moves again only on his instruction at its coordinator.

After the first pass stops: Part D step 8, the owner's review per module (time and cost; places converted; restated facts;
what waits on a provider; the uses file; whether it serves the provider/user requirement), with PROCESS. Then his word:
go on 8 at a time, change the method, or abandon. The refactoring restarts after the conversion (his words of 25 Nov).

## Done in PROCESS #18 (all merged; his words in the record and `changes`)

- Idle compaction off ("Instruction: Turn idle compaction off"): BioDefault's setup script writes `"idleCompaction": false`.
  Option B (correct "fill unreadable") not chosen; still open on his page.
- ROOT's depth ("Decision: B, as recommended"): B tested (a scheduled task's session has no parent but no repository and
  no session tools), failed, so A built: ROOT asks for a fresh ROOT three levels from the limit and makes no planned
  takeover two levels from it. Option C (fewer takeovers on a version move) asked on his page.
- The trial of who is told on process3-probes: notices reached exactly their users (`trial-who-is-told-26nov.md`).
- "Decision: 1-A, 2-B1, 6B" built as 26fbf9e (2-B1 narrowed: a conversion that changed an item tells as any merge).

## Registry and start checks

1. Environment BioDefault, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode` and `idleCompaction`.
2. `node tool/p4.mjs state read handover-process`: process3-probes ROOT #13 `session_018Bhcecg31mQpQJXnaeMMXw`; civicsmith
   ROOT #10 `session_018Bhceg3cdHS2ZcDWQCDacr`. civicsmith coordinator #10 `session_018BhceewN4fx361Kuj2Ktyk`, ARCH #28
   `session_018Bhcee2HTc21twW9aRyNPp`.
3. No live lane. His page: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy (source `coordination/owner_page/desk.html`;
   publish with the Artifact tool; land each source change by its own small pull request).
4. Flow: `git fetch origin main`, `git checkout -B work/<name> origin/main`, edit, commit (author
   `Claude <noreply@anthropic.com>`, trailers), `p4 push`, `p4 open --title`, `p4 ready <n>`, then `p4 merge <n>` (retry
   while the check runs or "waiting N s since the last merge"). Keep the `changes` record's JSON valid.
5. His page comments sent to Claude carry his decisions too (attributed "the user (owner)"); reply in the thread.
6. Speak to him in plain words, short, bottom line first; say what is proven and what is not.

## Lessons

- Reason from the texts and the workflow; measure only when he asks. Judge a false result in the process's context.
- He wants load-bearing designs; never claim certainty with exceptions.
- A worker's branch in a worktree cannot be checked out in the main checkout; `git branch -f <name> <commit>`.
- Check a worker's choices against his words (2-B1 was built wider than his page said; narrowed).
