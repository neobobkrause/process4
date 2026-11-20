# PROCESS handover — interim

**Interim and pre-live.** A bridge while nothing is in force. The process repo's shared-state issue
is #33; its `handover-process` record carries PROCESS liveness, the generation and the `products`
registry. This file is the detailed handover.

Last written: 2026-11-20, by **PROCESS #4** (`session_018Bhced7M3Fhf7DEa5tX2Tb`), at the owner's
word "Refresh yourself", from `main` tip `3940d13` (plus this handover's own pull request). You, the
successor, are **PROCESS #5**: read generation 4 in `handover-process`, name yourself `PROCESS #5`
with set-session-title, and record generation 5 and your session there.

## Start checks

1. You should be on the **BioDefault** environment, with `neobobkrause/process4` as your only
   repository. Confirm the `autoMode` block is loaded: `~/.claude/settings.json` has `autoMode`.
2. `node tool/p4.mjs state read` reads issue #33.
3. The `products` registry is **empty**. The trial (`neobobkrause/process3-probes`) is running on
   this account (the owner spoke to "process3-probes ROOT #3"), but nobody has told PROCESS its ROOT.
   Ask the owner once for the trial's ROOT session title, record it, then message that ROOT your
   session and generation (design part 4 §5).
4. Keep the owner's standing page **"Process4 Waiting for Bob"**: https://claude.ai/artifact/SY4Ub7f1vwHN6fjvxz23iy
   (this account; source `coordination/owner_page/desk.html`; keep both in sync). Update it in place.

## The owner's new approvals in this repository (landed 20 Nov 2026)

The owner landed a new `CLAUDE.md` on main himself (commit `2276962`), word for word PROCESS #4's
draft (`process/research/approvals-draft-process4-20nov.md`). You are the first PROCESS started under
it. New in it: PROCESS may, at his request, draft his approvals or the forbidden-commands list, and
place a text he approved, unchanged, in a pull request changing only `CLAUDE.md` or only
`.claude/settings.json`, and never merge it. Sessions merge into main without review except such a
pull request. PROCESS may propose cloud-environment setting changes through the harness's approval
prompt. Process files change only by his marked decision at PROCESS.

## Done in PROCESS #4 (all merged, tool-tests green)

- #83 Standing page republished on this account; handover note.
- #84 Research: owner acts that assume file editing (`process/research/owner-acts-without-files-20nov.md`).
- #85 Process change, "Decision: as recommended": the owner never edits a file or types a command.
  His acts are clicks or typed words; approvals landed by his click; forbidden commands kept by
  PROCESS; environment settings proposed for his click; first-build owner merges removed; support
  procedures written as clicks. Kept: a held merge (only when he asks) and his choice for a tranche
  that does not come clean (merge with flaws named, or drop) — **the one case where he approves a
  merge to main; he confirmed that.** A clean tranche merges into main with no act of his.
- #86 Process change, "Decision: option B": PROCESS or the coordinator **drafts** his approvals; he
  decides and lands them. Draft of process4 approvals added.
- #88 Standing page and handover: approvals landed.
- #89 Master forbidden-commands list at `shims/claude-settings.json` (a byte-for-byte copy of this
  repo's `.claude/settings.json`), named in design part 6 §2 and build text 1 §2.

The decisions record (`process/design-decisions.md`) holds all of this under the subject "The owner
never edits a file or types a command".

## Waiting on the owner (all in the trial; he has the step-by-step from PROCESS #4)

0. **The trial's conflict.** p4-tranche cannot merge into main: `CLAUDE.md` differs (main's 19 Nov
   edit, PR 351, vs p4-tranche's 18 Nov Process4 approvals). The owner is clearing it with the trial's
   coordinator by clicks: Revert PR 351 on main, then the tranche merges. PROCESS gave him a coordinator
   prompt for it. PROCESS has not read process3-probes (outside its approvals).
1. **Move the trial to the latest Process4 version** (it pins `7d8e529`): he types
   "Instruction: move process3-probes to the latest Process4 version." in the coordinator's session.
2. **Update the trial's approvals.** He asks the trial's coordinator to draft them, then stops work,
   asks it to place the draft in a pull request into p4-tranche (he merges), and starts a fresh ROOT.
   If the checker refuses the placing, the fallback is his one-time copy into GitHub's editor.
3. **First real use of a session placing an approved approvals text in a pull request** happens in
   step 2. He will report "it worked" or "refused". Record the result in design part 6 §2 (now
   "Unproven") and part 10 §3, as a measured fact, on his word.

## Offered to the owner, not decided

- Record in design part 7 §3 that a role session setting its own title has worked (PROCESS #1, #4).

## Environment / tool notes

- `node tool/p4.mjs <cmd>` reaches GitHub; a direct `gh` command is denied by design. Flow:
  `git checkout -b work/<name> origin/main` → edit → commit (author `Claude <noreply@anthropic.com>`,
  Co-Authored-By + Claude-Session trailers) → `p4 push` → `p4 open --title` → `p4 ready <pr>` →
  `p4 results <pr>` until passed → `p4 merge <pr>`. tool-tests takes about two minutes.
- Cross-repo `gh api` reads are refused (403); cross-repo messaging within one account works;
  session acts are account-scoped.
- Read your fill with `get_session` (no id), `context_usage`; refresh at 50 percent.
- **Bookkeeping:** every design part and build text states "Length: N lines" (`wc -l`) at its top.
  `starting_texts/00-index.md` carries per-text byte figures and combined reading sums; re-measure
  whenever a design part, build text or starting text changes size. Starting texts: at most 8,192
  bytes and ten numbered rules.
- **How the owner wants to be spoken to:** plain words, short, bottom line first. He does not edit
  files or type commands; give clicks on pages named by full address and exact button labels. He
  works fast; one matter at a time.
