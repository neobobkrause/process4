# Starting texts: index

Length: 55 lines. Last section: "3. Silent in the design".

One starting text for each role, kept beside the tool and the design at the product's fixed version (design part 4, section 11). The tool fills in a job's text and a walking session's; the session that starts any other role fills in its names and addresses.

## 1. The texts

Limit for each: 8,192 bytes, measured on the role's instructions as filled in for a session, with the one mechanical fetch line left out of the count, and at most ten rules (part 4, section 11; part 5, section 2). "At most ten rules" counts the numbered lines under "Rules", the "Never" line among them; a line may hold closely related rules (part 4, section 11). The lines above "Rules" (what the session is, who directs it, what it reads, and the acts it may take) are not rules. Bytes below are of the whole file as it stands in the repository, measured with `wc -c`; every file is plain ASCII.

| File | For | Bytes | As filled | Rules | Last section |
|---|---|---|---|---|---|
| `root.md` | ROOT: the owner's plain prompt (part A) and what ROOT reads first (part B) | 4,292 | 4,465 | 9 | Rules |
| `watcher.md` | The watcher | 3,167 | 3,248 | 9 | Rules |
| `coordinator.md` | The coordinator | 4,548 | 4,598 | 10 | Rules |
| `arch.md` | ARCH | 5,316 | 5,426 | 10 | Rules |
| `process.md` | PROCESS | 6,014 | 6,014 | 10 | Rules |
| `lane.md` | A lane, of a product or of PROCESS (template: area, folder, design pages) | 4,104 | 4,205 | 8 | Rules |
| `job.md` | A job (template the tool fills when ARCH's session opens the pull request: module, branch, pull request; the work, the kind, the items named as changing meaning and the uses stay in the job block there) | 6,134 | 6,297 | 10 | Rules |
| `walking-session.md` | A walking session (template the tool fills with `walk text`: number, internal or external, tranche, round, the walk issue, the walks' folder, the copy's name and address; its areas stay in the round record and its two commands in the process config) | 3,674 | 3,594 | 10 | Rules |

The commands named are those of build text 1b, section 4. Every text but PROCESS's and ROOT's carries the fetch line as the blank `<fetch line>`.

**As filled in.** A filled text holds names and addresses only. The "As filled" column fills a 40-character product name and commit id, a module, branch and pull-request address, a lane's folder and page, and an external walking session's names, and leaves the fetch line out (as the tool makes it, about 170 bytes with a 40-character repository address). The files hold the fetch line only as its 12-byte blank, so leaving it out gains nothing over the file's size, and filling the names adds bytes, except in the walking session's text, whose alternatives shrink to one when filled. PROCESS's text has no blank: its counted size is its file size. The binding text is `job.md`, at about 6,297 bytes as filled; the next are `process.md` and `arch.md`, at 6,014 and about 5,426. All are under 8,192.

## 2. What each text tells its session to read in full

Sizes of the design's parts, in bytes: 00 10,975; 01 10,852; 02 30,957; 03 10,477; 04 21,675; 05 4,341; 06 14,818; 07 12,389; 08 4,489; 09 2,075; 10 10,498. All eleven: 133,546. Build texts: 02 12,527; 02b 10,683; 02c 15,039; 03 13,736; 05 23,860, of which its sections 5 to 7 are 13,420. The set maximum is 175,000; the single-text maximum is 60,000 bytes on Claude Code (24,000 on Codex until it is measured). The largest single texts are part 02 (30,957), under the Claude Code figure and over the Codex one, and part 04 (21,675), under both. In the copy the design is in `design/` and the build texts in `build/`, and each text's reading line names them so.

Each role reads one harness part, 07 or 08. The combined figure is given with 07, the larger; with 08 it is 7,900 less.

| Text | Design parts | Build texts | Combined bytes | Also told to read (sizes not known) |
|---|---|---|---|---|
| ROOT | 00, 01, 04, 05, 06, 07 or 08 | 05 | 98,910 | The shared state |
| The watcher | 00, 01, 04, 05, 06, 07 or 08 | 05 | 98,910 | The roles, wakes and handover records; after a takeover, `root.md` |
| The coordinator | 00 to 06, 07 or 08 | 05 | 140,344 | The ranking page, the product's record of the owner's decisions, the shared state |
| ARCH | 00 to 06, 07 or 08, 09 | 02c, 03 and 05 | 171,194 | The process config, ranking page, module list, both decision records, the shared state |
| PROCESS | All eleven | Their index, `build/README.md`; each text before changing it, and any when a question touches it | 162,242: the design 133,546, its folder's README (2,116), the index of the owner's decisions (2,634), the build texts' index (5,251) and its research index (18,695) | Its handover record |
| A lane | 00, 01, 03, 04, 05, 06, 07 or 08 | 05; and 03 for the UX lane | 109,387; the UX lane 123,123 | The ranking page, the index of the research in its folder, its design pages' links, its handover record |
| A job | 00, 01, 02, 04, 05, 06, 07 or 08 | 02, 02b, 02c, 03, and 05's sections 5 to 7 | 171,412 | The ranking page, the module order file, its module's entry and requirements file (kept under the single-text maximum by rule), its pull request |
| A walking session | 00, 01, 03, 06, 07 or 08; and 09 for the external walk | 03 | 73,247 internal; 75,322 external | The process config and the ranking page; for each of its areas, its page of the Screens document or the journeys |

Every set is under 175,000 bytes; the largest are a job's at 171,412 and ARCH's at 171,194, 3,588 and 3,806 under the maximum. Whether a set stays under it once the product's own documents are added cannot be said: their sizes are not known, and the design sets no size for a record of decisions. A lane's and PROCESS's research is background, read through an index (design part 5, section 3), so it does not count in the set. Build text 3 keeps each page of the walks' documents under the single-text maximum.

The build texts are kept with the design in the process's repository, and a session reads those its starting text names (part 0, section 5). A job reads four and part of a fifth because it writes structured comments, keeps the coding standard (build text 2c, which ARCH also reads), writes the `[met]` mark and walk steps, and reads its job block, whose forms are only in build text 5, sections 5 to 7; it writes no record of the shared state, so it reads no more of build text 5. Each role that writes a record of the shared state reads build text 5, where the records' forms are.

## 3. Silent in the design

Things a role must know that neither the design nor a build text says. What is left:

1. **Whether a text ROOT reads after its start counts with the permission checker** as instructions it was started with. The design marks the plain start unproven (part 4, section 2).
2. **To which product's coordinator PROCESS passes what is the owner's to see,** when two products run.
3. **How a session tags or titles the sessions it starts** is given for Claude Code only (part 7).
4. **Which copy of the tool PROCESS runs** in the process's own repository. `process.md` says the one in that repository.
5. **What an onboarding lane reads of its product.** `lane.md` names the product's ranking page, which a product joining Process4 may not yet have; part 6, section 8 says the lane does not read the product's repository itself.
