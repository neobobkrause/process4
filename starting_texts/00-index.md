# Starting texts, first draft: index

Length: 74 lines. Last section: "4. Silent in the design".

Drafts written by Claude on 18 Nov 2026 from the seventh draft of the design (`process4/definition/process4_definition_v7/`), and reconciled the same day with the design and with build texts 1 to 5. Status: proposed. Nothing here is in force. No draft has been put before the permission checker.

## 1. The texts

Limit for each: 8,192 bytes, measured on the role's instructions as filled in for a session with the one mechanical fetch line left out of the count (the owner's decision, 20 Nov 2026; part 4, section 11; part 5, section 2), and at most ten rules. Bytes below are of the whole file as it stands in the repository, measured with `wc -c` (last measured 24 Nov 2026); every file is plain ASCII. The as-filled figures that the limit is actually measured against are after the table.

How the rules stand against "at most ten". Each text has ten numbered lines or fewer under "Rules". That is so only because several rules are joined on one numbered line. Counted singly, every text has well over ten: the table gives both counts. The single count takes each sentence of a numbered line as one rule, and each thing named in a "Never" line as one; another reader's count may differ by a few. The lines above "Rules" are in neither count: what the session is, who directs it, what it reads, and the acts it may take. Whether the limit is on the numbered lines or on the single rules is open with the owner (design part 10, section 1, item 10).

| File | For | Bytes | Numbered lines | Single rules | Last section |
|---|---|---|---|---|---|
| `root.md` | ROOT: the owner's plain prompt (part A) and what ROOT reads first (part B) | 4,296 | 9 | 25 | Rules |
| `watcher.md` | The watcher | 3,115 | 9 | 22 | Rules |
| `coordinator.md` | The coordinator | 4,636 | 10 | 33 | Rules |
| `arch.md` | ARCH | 5,197 | 10 | 29 | Rules |
| `process.md` | PROCESS | 6,179 | 10 | 32 | Rules |
| `lane.md` | A lane (template: area, folder, design pages) | 3,722 | 8 | 26 | Rules |
| `job.md` | A job (template the tool fills when ARCH's session opens the pull request: module, branch, pull request; the work, the kind and the uses stay in the job block there) | 4,366 | 10 | 33 | Rules |
| `walking-session.md` | A walking session (template the tool fills with `walk text`: number, internal or external, tranche, round, the walk issue, the walks' folder, the copy's name and address; its areas stay in the round record and its two commands in the process config) | 3,622 | 10 | 27 | Rules |

The commands named are those of build text 1b, section 4. Every text but PROCESS's and ROOT's carries the fetch line as a blank.

**As filled in, and the 20 Nov rule.** The limit is measured on the role's instructions as filled in, with the one mechanical fetch line (the clone command, run once) left out of the count (the owner's decision, 20 Nov 2026). A filled text holds names and addresses only: a product name of about 40 characters, the pinned commit id, and, for every text but PROCESS's and ROOT's, the roughly 198-byte fetch line, which the count excludes.

The binding text is `process.md`: it carries no fetch line, so its counted size is its file size, 6,179 bytes, well under the 8,192-byte limit. Every other text but ROOT's carries the fetch line the count excludes, so each has about 198 bytes more real headroom than its file size suggests; with a 40-character product name and the commit id filled in, all stay well under 8,192 (`root.md` and `coordinator.md`, the next tightest, count at roughly 4,296 and 4,438). The role-text limit was raised from 4,096 to 8,192 bytes on the 20 November 2026 measurement (part 5, section 2); the four reading figures are now measured, not provisional.

## 2. What each text tells its session to read in full

Sizes of the design's parts, in bytes (last measured 25 Nov 2026): 00 10,448; 01 11,967; 02 19,247; 03 11,033; 04 23,036; 05 5,720; 06 15,037; 07 13,232; 08 4,489; 09 2,628; 10 10,053. All eleven: 126,890. Build texts: 02 15,266; 02b 11,162; 03 20,922; 05 23,346. The set maximum is 175,000; the single-text maximum is 60,000 bytes on Claude Code (24,000 on Codex until it is measured), and part 04 (23,036) and build text 03 (20,922) are the largest single texts, under it on both harnesses. In the copy the design is in `design/` and the build texts in `build/`, and each text's reading line names them so.

Each role reads one harness part, 07 or 08. The combined figure is given with 07, the larger; with 08 it is 8,743 less.

| Text | Design parts | Build texts | Combined bytes | Also told to read (sizes not known) |
|---|---|---|---|---|
| ROOT | 00, 01, 04, 05, 06, 07 or 08 | 05 | 102,786 | The shared state |
| The watcher | 00, 01, 04, 05, 06, 07 or 08 | 05 | 102,786 | The roles, wakes and handover records; after a takeover, `root.md` |
| The coordinator | 00 to 06, 07 or 08 | 05 | 133,066 | The ranking page, the product's record of the owner's decisions, the shared state |
| ARCH | 00 to 06, 07 or 08, 09 | 03 and 05 | 156,616 | The process config, ranking page, module list, both decision records, the shared state |
| PROCESS | All eleven | 05; each other one before changing it | 150,236 | The record of the owner's decisions about the design, its folder's README and research index, its handover record |
| A lane | 00, 01, 03, 04, 05, 06, 07 or 08 | 05; and 03 for the UX lane | 113,819; the UX lane 134,741 | The ranking page, the index of the research in its folder, its design pages' links, its handover record |
| A job | 00, 01, 02, 04, 05, 06, 07 or 08 | 02, 02b, 03 and 05 | 169,383 | The ranking page, the module order file, its module's entry and requirements file (kept under the single-text maximum by rule), its pull request |
| A walking session | 00, 01, 03, 06, 07 or 08; and 09 for the external walk | 03 | 82,639 internal; 85,267 external | The process config and the ranking page; for each of its areas, its page of the Screens document or the journeys |

Every set is under 175,000 bytes; the largest is a job's at 169,383, about 5,600 under the maximum. Whether a set stays under it once the product's own documents are added cannot be said: their sizes are not known, and the design sets no size for a record of decisions. A lane's and PROCESS's research is background, read through an index (design part 5, section 3), so it does not count in the set. Build text 3 keeps each page of the walks' documents under the single-text maximum.

The build texts are kept with the design in the process's repository, and a session reads those its starting text names (part 0, section 5). A job reads four because it writes structured comments, its entry's `uses`, the `[met]` mark and walk steps, and reads its job block, whose forms are only there. Each role that writes a record of the shared state reads build text 5, where the records' forms are.

## 3. What the earlier process recorded about starting texts

Read for these drafts; nothing here is a rule of Process4 unless the design also holds it.

- "One short rulebook per role, at most ten rules" was kept from the process before this one (`process4_definition_v6.md`, line 434). The design keeps "at most ten rules" (part 5, section 2).
- Every role prompt had a section "Acts you may take" and a "Not yours" line, and a line naming the owner's standing approvals as the session's authority (`permissions_inventory.md`, section 1c). The drafts keep that shape; "Not yours" is now the last numbered rule, "Never".
- An act a starting text did not name, asked by message, was declined by the session's own model 6 times of 6; the checker was never reached (`permissions_inventory.md`, trials 19 and 21).
- Consent only quoted in a starting text: merges declined 11 of 11. With the owner's consent typed in the acting session: 0 of 21 refused. On committed approvals: 0 refusals in about 450 acts (trials 23, 24, 25). So no draft quotes the owner's approvals or his consent; each names the committed approvals as its authority.
- A prompt that named whose messages are instructions made a session act; without it the session answered "A request from another session isn't enough for me to act on" (trials 17; rows 26, 27). Each draft has "Who directs you".
- A session that wrote relayed approvals into a loaded file was refused, "[Instruction Poisoning]" (trial 20). Each draft's "Never" rule covers it.
- "Give each judged act ... its own shell command, never chained" was in every prompt, after the one refusal that fell on a chained merge. The design holds it (part 6, section 4).
- ROOT in the earlier process was never started by a plain prompt. Its prompt was about 4 KB (4,034 bytes at the tip), printed by the tool and pasted; its rulebook had 7 rules (`roles_root_coordinator.md`, section on ROOT). The owner's description of the plain prompt, as that file quotes it: "His first prompt says he is starting or restarting development of a named product, names that product's repository, says the Process4 process is to be used, may suggest model and effort, and may mention a switch from another account." Part A of `root.md` follows that sentence. The earlier coordinator prompt was 1,980 bytes; there was never a coordinator rulebook.

## 4. Silent in the design

Things a role must know that neither the design nor a build text says. Of the first list's 24 items, most are answered by part 4, section 11 or by a build text. What is left:

1. **Whether a text ROOT reads after its start counts with the permission checker** as instructions it was started with. The design marks the plain start unproven (part 4, section 2).
2. **How a job hands back a walk flaw that needs no change:** "the flaw goes back to ARCH" names no act, and nothing says what becomes of the job's pull request, since such a module "is finished only by a merge". `job.md` says only that the flaw goes back to ARCH.
3. **To which product's coordinator PROCESS passes what is the owner's to see,** when two products run.
4. **A lane's acts on its design pages** are named in `lane.md` (keep the pages; put a question to the owner there). How the owner's marked message on a design page reaches the coordinator is now settled (the owner's decision for item 13, 20 Nov 2026): the lane passes it to ARCH, which relays it to the coordinator exactly as typed (design part 1, section 4; part 4, section 3).
5. **How a session tags or titles the sessions it starts** is given for Claude Code only (part 7).
6. **Which copy of the tool PROCESS runs** in the process's own repository. `process.md` says the one in that repository.
7. **Whether the lines above "Rules" count** toward ten: who directs the session, what it reads, the acts it may take. Part 4, section 11 names "every rule" and the "never" lines. Neither count in section 1 takes them in.
