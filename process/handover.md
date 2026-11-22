# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 22 Nov 2026, by **PROCESS #6** (`session_018BhcecxLoUeRRqQzG6YZNk`), after the
onboarding decisions, at a low fill. It is recorded as generation 6 in `handover-process`. A successor is
**PROCESS #7**: read generation 6 there, name yourself `PROCESS #7` with set-session-title (pass your
own session id), and record generation 7 and your session there (the file must start with the JSON block).

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry: `process3-probes`, ROOT `session_018Bhceg1d5SVx54aCGkzRe3` (ROOT #7). ROOTs refresh
   often; confirm with `list_sessions` (titles `process3-probes ROOT #N`, tag `process4-product:process3-probes`)
   and message the live ROOT your session and generation.
4. Your lane: **PROCESS civicsmith lane #1**, `session_018BhceckLEcDGQG4yqJtMVH`, in the `lanes` record;
   its page https://claude.ai/artifact/HyRJShix1qLvC4LCu2pH8R; its folder `process/lanes/civicsmith/`. Message
   it your session. It may ask for a refresh at 50 percent; it was at ~22 percent on 20 Nov. PROCESS #6
   told it and ROOT #7 its session on 22 Nov, and the trial's coordinator #3
   (`session_018BhceeRZwDtL5rXcx3Mp5q`), which answered (see "Waiting on the owner").
5. Keep the owner's page **"Process4 Waiting for Bob"**: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy
   (source `coordination/owner_page/desk.html`; keep both in sync). Owner comments on it wake PROCESS; read
   them with ArtifactComments, reply and resolve.

## Current work: product onboarding (decided 22 Nov; one question left)

The owner chose on 22 Nov ("1. Decision: yes", "2. Decision: A", "3. Decision: A", and decision 4 on
tokens). Built and recorded by PROCESS #6: the onboarding lane (design part 6 section 8), the read-only
session he starts, settings by his clicks, and a product's token made once with every permission its
development will need (part 1 section 3; part 7 section 4 act 6; part 9 section 1). Entries are in
`process/design-decisions.md`; research in `process/research/product-onboarding-22nov.md` (sections 5, 6).

- **Still with the owner:** what becomes of the two seed values in BioDefault (`BIO_RELEASE_SEED`,
  `BIO_RATIFY_SEED`, read by name only). His decision 4 did not say. It is on his page as one question
  (A not production keys; B move them out; C they stay, which changes his 20 Nov rule).
- **The civicsmith lane is civicsmith's onboarding lane.** PROCESS #6 told it the decisions and asked for
  the owner's token page: the whole permission list for each token civicsmith's development needs.
- **PROCESS #5 was still acting on 22 Nov.** The owner typed the same four answers in its session too; it
  recorded them (pull request 123) and asked him to clarify answer 4. PROCESS #6 told it that it has handed
  over and asked the owner to archive it. Only one PROCESS writes.
- **Soon:** `process/design-decisions.md` is 59,183 bytes, just under the 60,000-byte single-text
  maximum. The next entry needs it split first (design part 10 section 2 item 10 leaves the way open).

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

- The seeds question (above).
- Pasting civicsmith-copy's approvals (two texts on his page) and the lane's page items (settings checklist,
  the T53 question).
- Nothing about the trial's stop: coordinator #3 confirmed on 22 Nov that the stop record has read not
  stopped since 20 Nov ~22:16Z; the trial runs, quiet, every requirement met, no process fault open. Two
  optional matters wait for him in the coordinator's session (main's forbidden-commands file; whether to
  try a told job that changes code, and the walks).

## Environment / tool notes

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
