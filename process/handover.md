# PROCESS handover — interim

**Interim and pre-live.** The process repo's shared-state issue is #33; its `handover-process` record
carries PROCESS liveness, the generation and the `products` registry. This file is the detailed handover.

Last written: 2026-11-22, by **PROCESS #5** (`session_018Bhcef3whBKwaQ5fD7JKxB`), at about 47 percent
fill, at a natural pause. You, the successor, are **PROCESS #6**: read generation 5 in
`handover-process`, name yourself `PROCESS #6` with set-session-title (pass your own session id), and
record generation 6 and your session there (the file must start with the JSON block).

## Start checks

1. Environment **BioDefault**, `neobobkrause/process4` only; `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. Products registry: `process3-probes`, ROOT `session_018Bhceg1d5SVx54aCGkzRe3` (ROOT #7). ROOTs refresh
   often; confirm with `list_sessions` (titles `process3-probes ROOT #N`, tag `process4-product:process3-probes`)
   and message the live ROOT your session and generation.
4. Your lane: **PROCESS civicsmith lane #1**, `session_018BhceckLEcDGQG4yqJtMVH`, in the `lanes` record;
   its page https://claude.ai/artifact/HyRJShix1qLvC4LCu2pH8R; its folder `process/lanes/civicsmith/`. Message
   it your session. It may ask for a refresh at 50 percent; it was at ~22 percent on 20 Nov.
5. Keep the owner's page **"Process4 Waiting for Bob"**: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy
   (source `coordination/owner_page/desk.html`; keep both in sync). Owner comments on it wake PROCESS; read
   them with ArtifactComments, reply and resolve.

## Current work: product onboarding (the owner's request of 22 Nov)

The owner asked to work through onboarding a product into Process4 and then change the design. Research
and four questions are in `process/research/product-onboarding-22nov.md` (Q1 an onboarding lane per
product; Q2 how it reads the product; Q3 who makes settings changes; Q4 production keys reported in the
environment). They are on his page. Wait for his marked choices, then make the design change (part 6 §8,
part 7 §4, part 4 §2 and the PROCESS starting text likely), recorded in `process/design-decisions.md`.

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

- The onboarding questions Q1–Q4.
- Pasting civicsmith-copy's approvals (two texts on his page) and the lane's page items (settings checklist,
  the T53 question).
- When to lift the trial's stop (the stop record reads not stopped per ROOT #7; confirm with the coordinator).

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
