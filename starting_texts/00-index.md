# Starting texts: index

Length: 55 lines. Last section: "3. Silent in the design".

One starting text for each role, kept beside the tool and the design at the product's fixed version (design part 4, section 11). The tool fills in a job's text and a walking session's; the session that starts any other role fills in its names and addresses.

## 1. The texts

Limit for each: 8,192 bytes, measured on the role's instructions as filled in for a session, with the one mechanical fetch line left out of the count, and at most ten rules (part 4, section 11; part 5, section 2). "At most ten rules" counts the numbered lines under "Rules", the "Never" line among them; a line may hold closely related rules (part 4, section 11). The lines above "Rules" (what the session is, who directs it, what it reads, and the acts it may take) are not rules. Bytes below are of the whole file as it stands in the repository, measured with `wc -c`; every file is plain ASCII.

| File | For | Bytes | As filled | Rules | Last section |
|---|---|---|---|---|---|
| `root.md` | ROOT: the owner's plain prompt (part A) and what ROOT reads first (part B) | 4,642 | 4,815 | 9 | Rules |
| `watcher.md` | The watcher | 3,189 | 3,270 | 9 | Rules |
| `coordinator.md` | The coordinator | 4,622 | 4,672 | 10 | Rules |
| `arch.md` | ARCH | 5,344 | 5,454 | 10 | Rules |
| `process.md` | PROCESS | 6,056 | 6,056 | 10 | Rules |
| `lane.md` | A lane, of a product or of PROCESS (template: area, folder, design pages) | 4,134 | 4,235 | 8 | Rules |
| `job.md` | A job (template the tool fills when ARCH's session opens the pull request: module, branch, pull request; the work, the kind, the items named as changing meaning and the uses stay in the job block there) | 6,007 | 6,170 | 10 | Rules |
| `walking-session.md` | A walking session (template the tool fills with `walk text`: number, internal or external, tranche, round, the walk issue, the walks' folder, the copy's name and address; its areas stay in the round record and its two commands in the process config) | 3,697 | 3,617 | 10 | Rules |

The commands named are those of build text 1b, section 4. Every text but PROCESS's and ROOT's carries the fetch line as the blank `<fetch line>`.

**As filled in.** A filled text holds names and addresses only. The "As filled" column fills a 40-character product name and commit id, a module, branch and pull-request address, a lane's folder and page, and an external walking session's names, and leaves the fetch line out (as the tool makes it, about 170 bytes with a 40-character repository address). The files hold the fetch line only as its 12-byte blank, so leaving it out gains nothing over the file's size, and filling the names adds bytes, except in the walking session's text, whose alternatives shrink to one when filled. PROCESS's text has no blank: its counted size is its file size. The binding text is `job.md`, at about 6,170 bytes as filled; the next are `process.md` and `arch.md`, at 6,056 and about 5,454. All are under 8,192.

## 2. What each text tells its session to read in full

A text's reading line names whole files by how their names begin (`design/04-`, `design/04b-`), so that a role reads only the files that hold what it acts on; a part or build text kept in more than one file keeps its section numbers (design part 0, section 4). Sizes in bytes of the design's files: 00 12,248; 01 4,267; 01b 7,544; 02 30,109; 02b 2,616; 03 3,893; 03b 6,780; 04 10,847; 04b 9,993; 04c 2,006; 05 1,935; 05b 1,024; 05c 1,791; 06 3,061; 06b 3,355; 06c 3,040; 06d 4,272; 06e 2,150; 07 5,148; 07b 7,630; 08 4,469; 09 2,075; 10 10,553. All of them: 140,806. Build files a role reads: 02 8,322; 02b 11,026; 02c 16,093; 02d 4,055; 03 5,154; 03b 7,805; 05 10,847; 05b 9,351. The set maximum is 175,000; the single-text maximum is 60,000 bytes on Claude Code (24,000 on Codex until it is measured). The largest single text a role reads is design file 02 (30,109), under the Claude Code figure and over the Codex one; the next is build file 02c (16,093), under both.

Each role reads one harness part. The combined figure is given with 07, the larger; with 08 in its place it is 679 less, and for a lane, which reads 07 and 07b on Claude Code, 8,309 less. Combined bytes are of the files named; with the starting text added as it stands in the repository, the total follows.

| Text | Design files | Build files | Combined bytes | With the starting text | Also told to read (sizes not known) |
|---|---|---|---|---|---|
| ROOT | 00, 01, 01b, 04, 04b, 04c, 05, 06, 06d, 07 or 08 | 05 | 72,168 | 76,810 | The shared state |
| The watcher | 00, 01, 01b, 04, 04b, 04c, 05, 06, 06d, 07 or 08 | 05 | 72,168 | 75,357 | The roles, wakes and handover records; after a takeover, `root.md` |
| The coordinator | 00, 01, 01b, 02, 02b, 03, 03b, 04, 04b, 04c, 05, 05b, 06, 06b, 06d, 07 or 08 | 02, 05 | 128,267 | 132,889 | The ranking page, the product's record of the owner's decisions, the shared state |
| ARCH | 00, 01, 01b, 02, 02b, 03, 03b, 04, 04b, 05, 05b, 06, 06d, 07 or 08, 09 | 02, 02c, 02d, 03, 03b, 05, 05b | 167,439 | 172,783 | The process config, ranking page, module list, both decision records, the shared state |
| PROCESS | Every file | Their index, `build/README.md`; each text before changing it, and any when a question touches it | 177,942: the design 140,806, its folder's README (2,116), the index of the owner's decisions (3,005), the build texts' index (5,835) and its research index (26,180) | 183,998 | Its handover record |
| A lane | 00, 01, 01b, 03, 04, 04b, 05, 06, 06e, 07 and 07b or 08 | 05; and 03, 03b for the UX lane | 79,563; the UX lane 92,522 | 83,697; 96,656 | The ranking page, the index of the research in its folder, its design pages' links, its handover record |
| A job | 00, 01, 02, 04, 05, 06, 07 or 08 | 02, 02b, 02c, 03, 05b | 117,561 | 123,568 | The ranking page, the module order file, its module's entry and requirements file (kept under the single-text maximum by rule), its pull request |
| A walking session | 00, 01, 03, 06, 07 or 08; and 09 for the external walk | 03, 03b | 41,576 internal; 43,651 external | 45,273; 47,348 | The process config and the ranking page; for each of its areas, its page of the Screens document or the journeys |

Every set but PROCESS's is under 175,000 bytes; the largest is ARCH's at 167,439, 172,783 with its starting text. PROCESS's is over: its research index alone is 26,180 bytes, and the index is PROCESS's to shorten, a process fault. Whether a set stays under the maximum once the product's own documents are added cannot be said: their sizes are not known, and the design sets no size for a record of decisions. A lane's and PROCESS's research is background, read through an index (design part 5, section 3), so only the index counts in the set. Build text 3 keeps each page of the walks' documents under the single-text maximum.

The build texts are kept with the design in the process's repository, and a session reads those its starting text names (part 0, section 5). A job reads build files 02, 02b, 02c, 03 and 05b because it writes structured comments, keeps the coding standard (build text 2c, which ARCH also reads), writes the `[met]` mark and walk steps, and reads its job block, whose forms are in build text 5, section 5; it writes no record of the shared state, so it reads no more of build text 5. ARCH and the coordinator read build file 02 for the forms of the files they write (the module list and requirements files, the ranking page, the decision records), and ARCH reads 02d for the process config. Each role that writes a record of the shared state reads build file 05, where the records' forms are.

## 3. Silent in the design

Things a role must know that neither the design nor a build text says. What is left:

1. **Whether a text ROOT reads after its start counts with the permission checker** as instructions it was started with. The design marks the plain start unproven (part 4, section 2).
2. **To which product's coordinator PROCESS passes what is the owner's to see,** when two products run.
3. **How a session tags or titles the sessions it starts** is given for Claude Code only (part 7).
4. **Which copy of the tool PROCESS runs** in the process's own repository. `process.md` says the one in that repository.
5. **What an onboarding lane reads of its product.** `lane.md` names the product's ranking page, which a product joining Process4 may not yet have; part 6, section 8 says the lane does not read the product's repository itself.
