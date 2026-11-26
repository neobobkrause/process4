# Cut check: did the footprint cuts lose anything?

Check for PROCESS #17, 26 Nov 2026. Commit `1313a74` (98 cuts, from `footprint.md` on `work/decision-c-footprint`) read cut by cut: the text before (`1313a74^`), the text after (`1313a74`), and the home each cut relies on (at `1313a74`). The test is the owner's: "The need for rigor and accuracy must survive any footprint reduction." Changes nothing but this file.

Verdicts: **K** kept in full (here or at a home that says it); **R** lost, but only a reason, a cost or history: no rule, condition, exception, term, field name, "held by text" or "Unproven" mark; **C** meaning changed. No cut lost a rule, condition, exception, term, field name, "held by text" or "Unproven" mark.

**Counts: K 66, R 29, C 3. Lost rules, conditions, exceptions or marks: none.** Pointers created by the cuts all name the right part and section (one, A20, leaves a dangling "that field"). Four pointers elsewhere now land on a section whose words were cut (section 3 below).

Lines are at `1313a74^` (before); D = `design/`, B = `build/`.

## 1. Every cut

| Id | Where | V | Home at 1313a74, or what is gone |
|---|---|---|---|
| A2 | D00:10 | K | D05 §5 (record, exact dated words never edited); D05 §4 + D00 'Foundations' (background = reasons and evidence) |
| A3 | D00:13 | K | D05 §1 line 8 (every text and set below its maximum); PROCESS reads all eleven as one set (`process.md`) |
| A39 | D01:16 | K | D03 §8 line 73, same words |
| A6 | D01:63 | K | D06 §4 line 36 (non-substantive refusal, not working it around) |
| A7 | D01:80 | K | Pointer "part 6, section 4" right |
| A57 | D02:119 | K | "(above)" = D02 §7 line 84, same catch order |
| A40 | D03:7 | K | D01 §3 row ("whenever he chooses"), §4 line 47 |
| A10 | D03:9 | K | D06 §5 line 44 |
| A11 | D03:19 | K | D03 §2 steps 1–3 |
| H1 | D03:63 | K | D03 §6 lines 59–60: ARCH publishes |
| A16 | D04:14 | K | D02 §5 lines 3, 5 (walking sessions use slots) |
| A17 | D04:15 | K | D00 §6 'Worker'; D04 §2 table |
| W28 | D04:17 | R | "because only a session can start a session" |
| A14 | D04:40 | K | D04 §1 ARCH line; §2 table; §3 "ARCH opens it" |
| A13 | D04:42 | K | D01 §4 line 47, same words |
| A12 | D04:51 | K | D03 §3 line 31; `lane.md` rule 5 |
| A15 | D04:54 | K | D02 §5 line 5 |
| A21 | D04:113 | K | Pointers right: D01 §3 row 31, D07 §5 line 84; also D10 §2 item 11 |
| A5 | D04:132 | K | D06 §6 line 50; pointer right |
| A4 | D04:133 | K | D01 §5 line 56, same words; sender D04 §11 line 144 |
| A19 | D04:140 | K | "as section 5 says" = D04 §5 line 86 (why, where, by whom) |
| H4 | D04:150 | K | "is built" stays at D06 §5 line 46 |
| W30 | D04:151 | R | the reason for "name every act", and "What keeps a text short is its size limit" |
| W22 | D05:8 | R | "Nothing can ensure a full reading; keeping below the maximum reliably results in one." |
| A24 | D05:10 | K | D05 §2 table rows 1–2 |
| A25 | D05:16 | K | D05 §2 table row 1 |
| W24 | D05:22 | K | The conciseness rule stands at D05 §3 line 26 |
| W23 | D05:23 | R | why 50 percent; the yardstick stays (D05 §1 line 9) |
| A23 | D05:25 | K | D04 §11 line 146 |
| W25 | D05:30 | R | First clause K (D00 §1; D05 §4–5); "So research and the record can grow…" gone |
| A22 | D05:32 | K | D02 §2 line 17, fuller |
| A1 | D05:37 | K | D00 §1 lines 10–12 (with the exception); D09 line 5 |
| W26 | D05:47 | R | "for transparency so he can catch a misrecording" |
| A26 | D05:47 | K | D05 §5 line 41 |
| W29 | D06:8 | K | "That is a known limit", the sentence before |
| A8 | D06:36 | K | D06 §4 line 35, unqualified (also `walking-session.md` rule 8) |
| A18 | D06:68 | K | D04 §2 table, §5 line 85, §7 line 108; D01 §3 row 23 (see §3, stale pointers) |
| A20 | D06:69 | K | Pointer right (D04 §5 line 86, with `process` field and no cross-repository read); "that field" now dangles (§3) |
| A34 | D06:77 | K | D01 §3 lines 34, 36; pointer right |
| A33 | D06:78 | **C** | See §2.1 |
| A30 | D07:21 | K | D04 §5 line 83; D05 §2 last row |
| A28 | D07:29 | K | D04 §11 line 136 (name holds the module) |
| A27 | D07:30 | K | D04 §11 line 136, same words |
| A29 | D07:37 | K | D07 §3 line 53; D03 §3 Unproven |
| A31 | D07:46 | K | D07 §2 line 45 |
| A32 | D07:72 | K | D06 §2 line 13; D01 §3 row 27 |
| A35 | D09:12 | K | D00 §6, same words |
| A36 | D09:13 | K | D01 §3 line 36; D00 'Deploy token'; D07 act 6 |
| A37 | D09:15 | K | D03 §6 lines 57–58 |
| A38 | D09:21–22 | K | Keys' keeping: D01 §2, D07 §1 row 18; both "nothing physical" clauses kept; pointer right |
| A49 | B02:5 | K | D00 §5; which items it answers: D10 §2 items 6, 7 |
| A50 | B02:5 | R | "to keep each file under 24,000 bytes" |
| W5 | B02:7 | **C** | See §2.2 |
| W1 | B02:15 | R | Gives/Costs of `process.json` |
| W2 | B02:33 | R | Gives/Costs of the split list; "a job reads only the order and its own entry" stays in `job.md` |
| B2 | B02:61 | K | D02 §1 line 7, §6 line 61 (ARCH corrects the order); 1b command 18 is `check`; pointers right |
| W21 | B02:83 | R | "So 'the module has work' … reads from the file alone." |
| B1 | B02:85 | K | D02 §2 line 17; D05 §2 (60,000) |
| W3 | B02:111 | R | Gives/Costs of one `test_command` |
| A42 | B02:116 | K | B03 §4 step 1 (line 47); D04 §11 line 146 |
| W4 | B02:119 | R | Gives/Costs of the fixed reader version |
| B3 | B02:143 | K | D04 §11 line 139 |
| B4 | B02:154 | K | D04 §11 line 139 |
| A51 | B02b:5 | R | "so that each stays under 24,000 bytes" |
| A52 | B02b:5 | K | D00 §5 |
| A53 | B02b:7 | K | B02 line 7 carries the same Unproven mark and examples (with W5's change) |
| A56 | B02b:11 | K | B02 §9 item 2 line 160 |
| A47 | B02c:5 | R | "so that each stays under 24,000 bytes" |
| A46 | B02c:5 | K | `starting_texts/00-index.md` §2; `job.md`, `arch.md` |
| A48 | B02c:5 | K | D00 §5; B02c line 52 (listed, never refused, told) |
| H3 | B02c:44 | R | "It replaces R9." (R9 now an unexplained gap, §3) |
| B9 | B02c:48 | K | D02 §1 line 7, §6 line 61; B02c `orderFaults` field stays (heading, §3) |
| B10 | B02c:92 | K | D02 §7 line 99, fuller |
| A54 | B03:5 | K | D00 §5; D10 §2 item 9 |
| W16 | B03:7 | **C** | See §2.2 |
| W6 | B03:23 | R | Cost: see §2.3 |
| B6 | B03:39 | K | D02 §6 line 64 |
| W7 | B03:41 | R | Gives/Costs of steps in modules |
| W8 | B03:43 | R | Cost: see §2.3 |
| B7 | B03:48 | K | D02 §6 line 65; `walking-session.md` rule 10 |
| B5 | B03:54 | K | D04 §11 line 141; `walking-session.md` rules 9–10; pointer right |
| A43 | B03:56 | K | B03 §4 step 1; D04 §11 line 146 |
| W9 | B03:56 | R | "Costs: two more entries in the process config." |
| W10 | B03:58 | R | "Gives: room inside the time a session can run one thing (the design, part 7, section 1)." |
| W11 | B03:68 | R | Cost and fallback: see §2.3 |
| W12 | B03:75 | R | Cost: see §2.3 |
| B8 | B03:79 | K | D09 §1 line 14, the owner's words; pointer right |
| W13 | B03:83 | R | "Gives: the owner's caution is kept by starting low. Costs: early external walks are slow." |
| W14 | B03:89 | R | Gives/Costs of the walk issue; its last sentence K (D04 §8 line 114) |
| W15 | B03:131 | R | Cost: see §2.3 |
| W20 | B03:142 | R | "That is the design's "the areas it was given", and no added stop." |
| A55 | B05:5 | K | D00 §5; D10 §2 item 12 |
| W17 | B05:12 | R | "Gives: every command reads fixed fields. Costs: the owner reads JSON on the page." |
| A45 | B05:17 | K | D04 §4 line 77 |
| B11 | B05:22–31 | K | D04 §4 table, writer for writer (the takeover clause included); pointer right |
| A44 | B05:40 | K | D04 §5 line 86 |
| W18 | B05:111 | R | "Gives: `merge` and `next-job` act rightly before the coordinator's next write." ("Costs:" stays alone) |
| W19 | B05:154 | R | "Gives: the required run and every command read fixed places, and no write is lost to another session's." |

## 2. Losses and changes, most serious first

### 2.1 A33, D06 §8 (now line 78): meaning changed

Before: "With GitHub: the steps the owner needs to make the GitHub token, and to set up the product's repository. No GitHub token need be made where sessions act on GitHub through the harness's own connection to it (the harness part says what carries that)."

After: "With GitHub: the steps the owner needs to make the GitHub token, and to set up the product's repository."

The onboarding lane's start now reads as always making a GitHub token. The exception survives at D01 §3 line 36, but D06 §8 does not point there. Worse, D07 §4 act 5 (line 70), "Sessions act on GitHub through this connection, so no GitHub token is made (part 6, section 8)", now points to a section that says only the steps to make one. The two now read as contradicting each other on Claude Code. The study itself flagged this sentence as ambiguous ("Found", item 3); cutting the qualifier made it worse. To restore it: put back the cut sentence, or end D06 line 78 with "(none where part 1, section 3 says none is needed)" and point D07 act 5 to part 1, section 3.

### 2.2 W5 (B02:7), W16 (B03:7): the mark's definition changed

Before: "**Decided here:** a choice made in this text, with what it gives and what it costs." (B03: "with what it gives and costs"). After: "**Decided here:** a choice made in this text." The definition of a mark changed: a reader no longer expects each choice to carry its gains and costs. This matches the G cuts and changes no rule. B02b takes the new definition through A53 ("as build text 2"). Some Gives and Costs remain: B03:13 (flagged F26), B05:102 "Costs:", and B01 and B04, which were not cut. They do not conflict with the new definition.

### 2.3 Stated costs and limits no longer said anywhere (R, but closest to rigor)

No rule rests on them, but each one named a weakness of a choice, and nothing now says it:

- W12, B03 (now line 72), the AI-step judgment: "Costs: this is a session's judgment and can differ between sessions."
- W15, B03 (now line 128), a flaw set aside: "Costs: ARCH judges entries about a product it designed; the account is what lets the owner see it."
- W6, B03 (now line 23), the areas list: "Costs: a deep module can pull in most of the product, and only ARCH's judgment trims that."
- W8, B03 (now line 40), walking by hand: "Costs: session time; and for a part walked by hand the record is the session's own words."
- W11, B03 (now line 65), one copy per walker: "Costs: several deployments each round, of unknown length, and more of the account's room. If that is too much, the other form is one copy, with ARCH giving each session journeys that do not touch the same data." The fallback form is now said nowhere. The deployment's length is still unknown at D09 §3 line 26.
- W7, B03 (now line 40), steps kept with modules: "Costs: a journey's steps are spread over many modules; a journey step no module's requirement covers has no home until ARCH writes the requirement."
- W2, B02 (now line 33), the split module list: "(220 entries in one file would be about 60,000 bytes, estimated)" and "a rename touches two".

### 2.4 Reasons and history no longer said (R)

- W28, D04 (now line 16): "because only a session can start a session". The fact that the tool cannot start a session is now said nowhere.
- W30, D04 (now line 146): "because a session declines an act its starting text does not name, and that alone is more than ten single rules for most roles. What keeps a text short is its size limit."
- W22, D05 (now line 8): "Nothing can ensure a full reading; keeping below the maximum reliably results in one."
- W23, D05 (now line 22): "Set so that session refreshes, which are expensive and slow, are minimised while leaving room to work on." The second half stays as the yardstick in D05 §1 line 9.
- W26, D05 (now line 42): "for transparency so he can catch a misrecording".
- W25, D05 (now line 27): "So research and the record can grow without a role's reading set passing the maximum." `starting_texts/00-index.md` §2 says it for research, not for the record.
- W20, B03 (now line 139): "That is the design's "the areas it was given", and no added stop."
- W21, B02 (now line 83): "So "the module has work" (part 2, section 3) reads from the file alone." (B05 line 75 still says a requirement not yet met is read from the requirements file.)
- A50, A51, A47 (B02:5, B02b:5, B02c:5): "to keep each file under 24,000 bytes". The Codex single-text figure still binds through D05 §2.
- H3, B02c (now line 44): "It replaces R9."
- W1, W3, W4, W9, W10, W13, W14, W17, W18, W19: the Gives and Costs of a choice; each choice and every Unproven mark stays. W3's cost follows from the rule itself: "a product whose modules need different commands must give one command that tells them apart".

## 3. Wording defects the cuts left (nothing lost)

- **A20, D06 line 69.** "When that field names a running PROCESS": the field was named in the cut words. It is now named only at the home the pointer gives (D04 §5 line 86, "its `process` field"). Suggest: "…as part 4, section 5 says (its `process` field)."
- **A18, stale pointers.** D06 §6 line 51 "the owner starts it (section 7)" and D04 §5 line 85 "PROCESS is started and refreshed by the owner (part 6, section 7)" pointed at the cut line. D06 §7 now says only that the coordinator surfaces the start. The rule itself stands at D04 §2 and §5 and at D01 §3. D04 line 86 and D06 line 69 now point at each other.
- **A33, D07 line 70.** See §2.1.
- **B9, B02c line 27.** The heading "The rules on types, host facilities and order" heads a list that no longer holds an order rule. The rule is in D02 §1 and §6, and the uses file's `orderFaults` stays.
- **H3, B02c.** The R-list jumps from R8 to R10 with nothing saying why.

## 4. Reach (homes outside a reading role's set)

The texts say what they said, but for some roles the home now lies outside their set. None of these roles acts on what moved:

- A12 (UX lane owns the documents), A39 (the owner carries the procedures): the home is part 3, which ROOT, the watcher and a job do not read.
- A15, A16 (slots), A22 (requirements file size): the home is part 2, which ROOT, the watcher and a lane do not read.
- B6, B7 (steps prove requirements; built files): the home is part 2, which the UX lane and a walking session do not read. A walking session's own text forbids committing and changing steps.
- B5 (workers, fill level): the home is part 4, which a walking session does not read. Its text, rules 9 and 10, says both.
- B8 (the owner's caution): the home is part 9, which a job, a lane and an internal walker do not read. ARCH, which raises the figure, reads it.
