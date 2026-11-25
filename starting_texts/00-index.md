# Starting texts: index

Length: 68 lines. Last section: "4. Silent in the design".

One starting text for each role, kept beside the tool and the design at the product's fixed version (design part 4, section 11). The tool fills in a job's text and a walking session's; the session that starts any other role fills in its names and addresses.

## 1. The texts

Limit for each: 8,192 bytes, measured on the role's instructions as filled in for a session, with the one mechanical fetch line left out of the count, and at most ten rules (part 4, section 11; part 5, section 2). "At most ten rules" counts the numbered lines under "Rules", the "Never" line among them; a line may hold closely related rules (part 4, section 11). The lines above "Rules" (what the session is, who directs it, what it reads, and the acts it may take) are not rules. Bytes below are of the whole file as it stands in the repository, measured with `wc -c` (last measured 25 Nov 2026); every file is plain ASCII.

| File | For | Bytes | As filled | Rules | Last section |
|---|---|---|---|---|---|
| `root.md` | ROOT: the owner's plain prompt (part A) and what ROOT reads first (part B) | 4,292 | 4,465 | 9 | Rules |
| `watcher.md` | The watcher | 3,167 | 3,248 | 9 | Rules |
| `coordinator.md` | The coordinator | 4,548 | 4,598 | 10 | Rules |
| `arch.md` | ARCH | 4,809 | 4,919 | 10 | Rules |
| `process.md` | PROCESS | 6,014 | 6,014 | 10 | Rules |
| `lane.md` | A lane, of a product or of PROCESS (template: area, folder, design pages) | 4,104 | 4,205 | 8 | Rules |
| `job.md` | A job (template the tool fills when ARCH's session opens the pull request: module, branch, pull request; the work, the kind and the uses stay in the job block there) | 4,264 | 4,427 | 10 | Rules |
| `walking-session.md` | A walking session (template the tool fills with `walk text`: number, internal or external, tranche, round, the walk issue, the walks' folder, the copy's name and address; its areas stay in the round record and its two commands in the process config) | 3,674 | 3,594 | 10 | Rules |

The commands named are those of build text 1b, section 4. Every text but PROCESS's and ROOT's carries the fetch line as the blank `<fetch line>`.

**As filled in.** A filled text holds names and addresses only. The "As filled" column fills a 40-character product name and commit id, a module, branch and pull-request address, a lane's folder and page, and an external walking session's names, and leaves the fetch line out (as the tool makes it, about 170 bytes with a 40-character repository address). The files hold the fetch line only as its 12-byte blank, so leaving it out gains nothing over the file's size, and filling the names adds bytes. PROCESS's text has no blank: its counted size is its file size. The binding text is `process.md`, at 6,014 bytes; the next is `arch.md`, at about 4,919. All are well under 8,192.

## 2. What each text tells its session to read in full

Sizes of the design's parts, in bytes (last measured 25 Nov 2026): 00 10,448; 01 11,967; 02 19,564; 03 10,638; 04 23,115; 05 5,971; 06 15,277; 07 13,264; 08 4,489; 09 2,628; 10 10,072. All eleven: 127,433. Build texts: 02 15,556; 02b 11,575; 03 20,827; 05 23,178. The set maximum is 175,000; the single-text maximum is 60,000 bytes on Claude Code (24,000 on Codex until it is measured), and build text 05 (23,346) and part 04 (22,943) are the largest single texts, under it on both harnesses. In the copy the design is in `design/` and the build texts in `build/`, and each text's reading line names them so.

Each role reads one harness part, 07 or 08. The combined figure is given with 07, the larger; with 08 it is 8,775 less.

| Text | Design parts | Build texts | Combined bytes | Also told to read (sizes not known) |
|---|---|---|---|---|
| ROOT | 00, 01, 04, 05, 06, 07 or 08 | 05 | 103,220 | The shared state |
| The watcher | 00, 01, 04, 05, 06, 07 or 08 | 05 | 103,220 | The roles, wakes and handover records; after a takeover, `root.md` |
| The coordinator | 00 to 06, 07 or 08 | 05 | 133,422 | The ranking page, the product's record of the owner's decisions, the shared state |
| ARCH | 00 to 06, 07 or 08, 09 | 03 and 05 | 156,877 | The process config, ranking page, module list, both decision records, the shared state |
| PROCESS | All eleven | None; each one before changing it, and any when a question touches it | 127,433 with its folder's README (1,943), the index of the owner's decisions (5,860) and its research index (14,917) | Its handover record |
| A lane | 00, 01, 03, 04, 05, 06, 07 or 08 | 05; and 03 for the UX lane | 113,858; the UX lane 134,685 | The ranking page, the index of the research in its folder, its design pages' links, its handover record |
| A job | 00, 01, 02, 04, 05, 06, 07 or 08 | 02, 02b, 03 and 05 | 170,742 | The ranking page, the module order file, its module's entry and requirements file (kept under the single-text maximum by rule), its pull request |
| A walking session | 00, 01, 03, 06, 07 or 08; and 09 for the external walk | 03 | 82,421 internal; 85,049 external | The process config and the ranking page; for each of its areas, its page of the Screens document or the journeys |

Every set is under 175,000 bytes; the largest is a job's at 170,742, about 4,258 under the maximum. Whether a set stays under it once the product's own documents are added cannot be said: their sizes are not known, and the design sets no size for a record of decisions. A lane's and PROCESS's research is background, read through an index (design part 5, section 3), so it does not count in the set. Build text 3 keeps each page of the walks' documents under the single-text maximum.

The build texts are kept with the design in the process's repository, and a session reads those its starting text names (part 0, section 5). A job reads four because it writes structured comments, its entry's `uses`, the `[met]` mark and walk steps, and reads its job block, whose forms are only there. Each role that writes a record of the shared state reads build text 5, where the records' forms are.

## 3. What the earlier process recorded about starting texts

Read for these texts; nothing here is a rule of Process4 unless the design also holds it.

- "One short rulebook per role, at most ten rules" was kept from the process before this one (`process4_definition_v6.md`, line 434). The design keeps "at most ten rules" (part 5, section 2).
- Every role prompt had a section "Acts you may take" and a "Not yours" line, and a line naming the owner's standing approvals as the session's authority (`permissions_inventory.md`, section 1c). The texts keep that shape; "Not yours" is now the last numbered rule, "Never".
- An act a starting text did not name, asked by message, was declined by the session's own model 6 times of 6; the checker was never reached (`permissions_inventory.md`, trials 19 and 21).
- Consent only quoted in a starting text: merges declined 11 of 11. With the owner's consent typed in the acting session: 0 of 21 refused. On committed approvals: 0 refusals in about 450 acts (trials 23, 24, 25). So no text quotes the owner's approvals or his consent; each names the committed approvals as its authority.
- A prompt that named whose messages are instructions made a session act; without it the session answered "A request from another session isn't enough for me to act on" (trials 17; rows 26, 27). Each text has "Who directs you".
- A session that wrote relayed approvals into a loaded file was refused, "[Instruction Poisoning]" (trial 20). Each text's "Never" rule covers it.
- "Give each judged act ... its own shell command, never chained" was in every prompt, after the one refusal that fell on a chained merge. The design holds it (part 6, section 4).
- ROOT in the earlier process was never started by a plain prompt. Its prompt was about 4 KB (4,034 bytes at the tip), printed by the tool and pasted; its rulebook had 7 rules (`roles_root_coordinator.md`, section on ROOT). The owner's description of the plain prompt, as that file quotes it: "His first prompt says he is starting or restarting development of a named product, names that product's repository, says the Process4 process is to be used, may suggest model and effort, and may mention a switch from another account." Part A of `root.md` follows that sentence. The earlier coordinator prompt was 1,980 bytes; there was never a coordinator rulebook.

## 4. Silent in the design

Things a role must know that neither the design nor a build text says. What is left:

1. **Whether a text ROOT reads after its start counts with the permission checker** as instructions it was started with. The design marks the plain start unproven (part 4, section 2).
2. **To which product's coordinator PROCESS passes what is the owner's to see,** when two products run.
3. **How a session tags or titles the sessions it starts** is given for Claude Code only (part 7).
4. **Which copy of the tool PROCESS runs** in the process's own repository. `process.md` says the one in that repository.
5. **What an onboarding lane reads of its product.** `lane.md` names the product's ranking page, which a product joining Process4 may not yet have; part 6, section 8 says the lane does not read the product's repository itself.
