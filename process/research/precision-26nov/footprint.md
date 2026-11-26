# Footprint: what sessions must read in full

Study for PROCESS #17, 26 Nov 2026, on `work/decision-c-design`. Read in full: design parts 00 to 07 and 09; build texts 02, 02b, 02c, 03, 05; `job.md`, `arch.md`. Changes nothing. Parts 08 and 10 were not read, so PROCESS's figures cover only the parts above. Bytes are exact (`old` minus `new`, UTF-8), each cut checked to occur once in its file.

The test for every counted cut is the owner's (26 Nov): "The need for rigor and accuracy must survive any footprint reduction." A cut is counted only where the texts still say exactly what they said: every condition, exception, term, field name and "held by text"/"Unproven" mark kept, here or at the named home. Glossary definitions are never shortened. Anything less certain is in the flagged list and out of the totals.

Roles: J a job, A ARCH, P PROCESS (design parts only; it reads build texts through their index). Cat: 1 one rule in several places; 2 a build text restating a design rule; 3 words that can go; 5 history, options, dated clauses. D = `design/`, B = `build/`.

## Totals

| | Job | ARCH | PROCESS |
|---|---|---|---|
| Set now (`starting_texts/00-index.md` §2) | 174,971 | 174,879 | 165,217 |
| Cat 1 | 4,292 | 4,612 | 3,791 |
| Cat 2 | 1,149 | 941 | 0 |
| Cat 3 | 3,270 | 2,741 | 692 |
| Cat 5 | 29 | 66 | 50 |
| **1–3 and 5** | **8,740** | **8,360** | **4,533** |
| Set after them | 166,231 | 166,519 | 160,684 |
| Item 4, separately (reading-set change) | 31,588 | 8,332 | 0 |
| Flagged, not counted | 5,370 | 4,703 | 4,069 |

Item 4 overlaps the cuts where a cut lies inside a section listed there; do not add the two.

## Item 4: sections a role never acts on (a reading-set change)

Each would be read only when a question touches it, through one index line, as research is. This changes what the role reads, so it is listed apart and is PROCESS's to propose.

| Role | Sections | Bytes | Why the role does not need it |
|---|---|---|---|
| Job | D01 §3 (owner's acts) | 3,384 | A job takes none of his acts |
| Job | D04 §3 (lanes), §6 (ROOT and watcher) | 3,585 | A job never talks to a lane (`job.md` rule 10); no takeover touches it |
| Job | D06 §7 but lines 63–66; §8 | 5,444 | Process changes and onboarding are PROCESS's; lines 63–66 (no new test, no change by a product session) stay |
| Job | D07 §4 (owner's acts to start a product) | 2,722 | Done before ROOT starts |
| Job | B02 §1 (the proof), §7 (process config), §8 but its last paragraph, §9 | 7,291 | The tool reads the config; a job reads the ranking page and ARCH's record, never writes them; §1 and §9 are provenance and open points |
| Job | B03 §5 but "Journeys that use AI" (lines 72–75), §7, §8 | 5,195 | A job writes steps (§3) and reads flaws (§6); it neither deploys, walks, judges a walk nor runs the trial list. The AI-step `expects` rule it needs stays |
| Job | B05 §6, §7 | 3,967 | How the tool computes means, the closure and related tests; the job acts on what the tool prints, under design part 2, section 7 |
| ARCH | D06 §7 lines 68–71; §8 | 3,240 | PROCESS's own running, and onboarding |
| ARCH | D07 §4 | 2,722 | The owner's start of a product |
| ARCH | B03 §8; B05 §4 | 2,370 | The trial list; PROCESS's own issue and registry |
| Job (flagged) | D07 §5 | 2,452 | Part 6, section 4 points here for what the settings sanction |

PROCESS: none; it changes every part, so it reads them all.

## Found, with no bytes to save

1. **Two rules live only in a build text.** B03:74 "A tranche may end with such journeys recorded not walked (the owner's decision)" and B03:75 "The UX design lane sets, per journey, the 'what must be present' words…". One home is the design; moving them is a design change at PROCESS.
2. **ARCH writes the process config** (`arch.md`, acts) but no text in its set gives the config's form (B02 §7).
3. **Ambiguity:** D06:78 "the steps the owner needs to make the GitHub token" beside "No GitHub token need be made where…". A1 also removes a mismatch: D05:37 says the design "carries no history" without the exception D00:10 gives.
4. **Rule numbers are referenced** (D02 §7 "rule 2", "rule 3", "rule 5" from B02b and B02c), so no rule of that list can be cut without renumbering; rule 1 repeats "Who uses what" but stays.

## Counted cuts, by bytes saved

| Id | Cat | Where | Bytes | Roles | Cut → replacement | Home, or why it can go |
|---|---|---|---|---|---|---|
| G | 3 | B02, B03, B05 | J 2440, A 1983 | JA | Every “Gives: … Costs: …” sentence, and “with what it gives and (what it) costs” in the Marks lines → — (list below) | Reasons for a choice; the choice and every Unproven mark stay |
| B11 | 2 | B05:22–31 | 286 | A | “\| Key \| Record \| Its … that role \|” → «Keys (each record's one writer: the design, part 4, section 4): `roles`, `lanes`, `wakes`, `stop`, `standing-notes`, `round`, `waiting-work`, and `handover-root`, `-watcher`, `-arch`, `-coordinator`, `-lane-<name>` for the handovers.» | The writer column repeats the design's table cell for cell |
| A1 | 1 | D05:37 | 218 | JAP | “- The design document names no … follows the body.” → — | Home: part 0, section 1, which also gives the exception for naming a source |
| A53 | 1 | B02b:7 | 204 | J | “Marks: **Decided here:** a choice made … `pricing` and `orders`.” → «Marks and examples: as build text 2.» | Same line in build text 2, read just before |
| A6 | 1 | D01:63 | 199 | JAP | “- A third case is kept … around (section 7).” → — | Home: part 6, section 4, and the row in section 7 |
| A55 | 1 | B05:5 | 187 | A | “It answers item 12 of the … the design rules.” → «The test record's hold on `ready` and `merge` is the design's (part 2, section 6).» | Design part 0, section 5 |
| B1 | 2 | B02:85 | 176 | J | “- ARCH keeps the file under … a longer one.” → — | Design part 2, section 2 (same rule) |
| W30 | 3 | D04:151 | 171 | JAP | “because a session declines an act … its size limit.” → — | Reason only; the rule that a text names every act stays, and so does 'The owner left the count to the AI' (F30) |
| A38 | 1 | D09:21–22 | 164 | AP | “Nothing physical keeps the token's value … the same environment.” → «Nothing physical keeps the token's value, or the value of a production signing key (part 1, section 2), from another session in the same environment.» | Where the keys are kept: part 1, section 2 (same words); the two 'nothing physical' clauses become one |
| A43 | 1 | B03:56 | 161 | JA | “A walking session reads them there: … 4, section 11).” → — | Line 47 of the same section says it |
| A22 | 1 | D05:32 | 160 | JAP | “- A module's requirements file is … 2, section 2).” → — | Home: part 2, section 2 (same rule) |
| A27 | 1 | D07:30 | 158 | JAP | “A session that keeps a handover … them; the owner-started” → «The owner-started» | Home: part 4, section 11 (same words) |
| A2 | 1 | D00:10 | 156 | JAP | “The owner's decisions, in his exact … the background document.” → — | Home: part 5, sections 4 and 5, with part 0's 'Foundations' |
| A48 | 1 | B02c:5 | 154 | JA | “It adds no check, gate, review … the design rules.” → — | Design part 0, section 5 (no build text changes a rule; the design rules); line 53 of this text says a place is listed, never refused, and told |
| B5 | 2 | B03:54 | 154 | JA | “A walking session starts no workers. … 4, section 11).” → «Workers and the fill level: the design, part 4, section 11.» | Design part 4, section 11 (same words) |
| A33 | 1 | D06:78 | 144 | JAP | “No GitHub token need be made … what carries that).” → — | Home: part 1, section 3 (same rule); part 7, act 5 says what carries it |
| A49 | 1 | B02:5 | 140 | J | “It answers part 10, section 2, … review or stop.” → — | Design part 0, section 5; which open items it answered is history |
| A21 | 1 | D04:113 | 137 | JAP | “, and includes confirming that the … 7, section 5)” → «(part 1, section 3; part 7, section 5)» | Home: part 1, section 3 (the owner's act at an account switch) and part 7, section 5 (the check) |
| W25 | 3 | D05:30 | 137 | JAP | “; the design states every decision … passing the maximum.” → «.» | The first clause is part 0, section 1 ('states the design as it now stands'); the second is the reason |
| B2 | 2 | B02:61 | 134 | J | “Had `pricing` used `orders`, that would … 1b, command 18).” → «Otherwise it is an order fault (part 2, sections 1 and 6; build text 1b, command 18).» | Design part 2, section 1 (a design error, reshaped) and section 6 (the check refuses it) |
| B9 | 2 | B02c:48 | 131 | JA | “- **Order.** Every reference points to … an order fault.” → — | Design part 2, sections 1 and 6 |
| A42 | 1 | B02:116 | 130 | J | “A walking session reads the two … and addresses only.” → — | Home: build text 3, section 4 (line 47) and design part 4, section 11 |
| B10 | 2 | B02c:92 | 127 | JA | “A provider's change that alters what … 2, section 7).” → — | Design part 2, section 7, 'Who uses what' (same words) |
| A54 | 1 | B03:5 | 125 | JA | “and answers item 9 of its … review or stop.” → «.» | Design part 0, section 5 and section 3; which item it answered is history |
| A24 | 1 | D05:10 | 119 | JAP | “- The maximums are used on … harness (section 2).” → — | The table beneath says it row by row |
| A4 | 1 | D04:133 | 117 | JAP | “- **The process is completely blocked.** … his to do.” → — | Home: part 1, section 5 (same words); who sends it stays in part 4, section 11 |
| B3 | 2 | B02:143 | 117 | J | “Each recorded decision is one pull … 4, section 11).” → — | Design part 4, section 11 |
| A36 | 1 | D09:13 | 115 | AP | “. It is made once, with … 1, section 3)” → — | Home: part 1, section 3 (made once, with every permission across the lifecycle) |
| A40 | 1 | D03:7 | 113 | AP | “, and the owner directs the … by marked instructions” → — | Home: part 1, section 4 |
| B6 | 2 | B03:39 | 108 | JA | “- A step that proves no … 2, section 6).” → — | Design part 2, section 6 |
| A3 | 1 | D00:13 | 107 | JAP | “- Each part is kept under … maximum (part 5).” → — | Home: part 5, section 1, line 83 (every text and every set below its maximum) |
| W23 | 3 | D05:23 | 106 | JAP | “Set so that session refreshes, which … to work on.” → — | Reason only; the cell keeps its rule (no fill level: refresh at a natural pause) |
| B8 | 2 | B03:79 | 104 | JA | “, with the owner's caution before … of the account"” → «(the owner's caution: the design, part 9, section 1)» | The owner's words are kept in design part 9, section 1 |
| A11 | 1 | D03:19 | 102 | AP | “The order is jobs, then the … with no flaws.” → — | Restates steps 1 to 3 directly above it |
| A52 | 1 | B02b:5 | 102 | J | “It adds no check, gate, review … the design rules.” → — | Design part 0, section 5 |
| A17 | 1 | D04:15 | 101 | JAP | “- **A worker** is a helper … 1, section 6).” → — | Home: part 0, section 6, 'Worker' (same words, fuller) |
| A34 | 1 | D06:77 | 101 | JAP | “Each act is fully detailed as … 1, section 3).” → «Each act is given as steps, as part 1, section 3 says, with the whole list of permissions for each token he makes.» | Home: part 1, section 3 |
| A20 | 1 | D06:69 | 100 | JAP | “The coordinator finds PROCESS in the … 7, section 3).” → «The coordinator finds PROCESS as part 4, section 5 says.» | Home: part 4, section 5, line 90 |
| A23 | 1 | D05:25 | 100 | JAP | “- The role's-text limit leaves the … 4, section 11).” → — | Home: part 4, section 11 |
| A32 | 1 | D07:72 | 100 | JAP | “Decide his approvals in PROCESS's session, … 6, section 2).” → «Decide his approvals in PROCESS's session and land them, with the forbidden commands, on the process repository's main branch (part 6, section 2).» | Home: part 6, section 2 (who drafts, the pull request, his click) |
| A30 | 1 | D07:21 | 96 | JAP | “; where a session cannot read … 5, section 2)” → — | Home: part 4, section 5 (same rule) |
| A10 | 1 | D03:9 | 90 | AP | “A product's tranche runs on one … close (part 6).” → — | Home: part 6, section 5, line 44 (same rule) |
| A7 | 1 | D01:80 | 89 | JAP | “A non-substantive refusal of a sanctioned … it around \|” → «A non-substantive refusal: part 6, section 4 \|» | Home: part 6, section 4 |
| A19 | 1 | D04:140 | 87 | JAP | “A record in another repository cannot … record, and PROCESS” → «The live PROCESS is found as section 5 says; PROCESS» | Home: section 5, line 90 (why, where and by whom the live PROCESS is recorded) |
| A37 | 1 | D09:15 | 87 | AP | “. Both are run on a … 3, section 6)” → — | Home: part 3, section 6 |
| W22 | 3 | D05:8 | 86 | JAP | “Nothing can ensure a full reading; … results in one.” → — | Reason only |
| A57 | 1 | D02:119 | 84 | JAP | “A wrong record is caught as … and the walks.” → «A wrong record is caught as an accidental change of meaning is (above).» | Same section, line 84 (the provider's own tests, then the users' tests at their next job, and the walks) |
| A31 | 1 | D07:46 | 77 | JAP | “The guard is keeping the single-text … which 60,000 is.” → — | Line 45 of the same section: the maximum 'sits below both' |
| W21 | 3 | B02:83 | 72 | J | “So "the module has work" (part … the file alone.” → — | Reason only |
| B4 | 2 | B02:154 | 67 | J | “Each is one pull request, which … by the tool.” → — | Design part 4, section 11 |
| W20 | 3 | B03:142 | 66 | JA | “That is the design's "the areas … no added stop.” → — | Reason only |
| A18 | 1 | D06:68 | 64 | JAP | “- The owner starts PROCESS, and … 4, section 5).” → «-» | Home: part 4, section 2 table and section 5 |
| A46 | 1 | B02c:5 | 60 | JA | “Every job and ARCH read it … 2, section 7).” → — | Who reads what is the starting texts' (starting_texts/00-index.md, section 2) |
| A5 | 1 | D04:132 | 59 | JAP | “**The process itself has a fault.** … 6, section 6).” → «**The process itself has a fault:** part 6, section 6.» | Home: part 6, section 6, line 50 (same rule) |
| A12 | 1 | D04:51 | 58 | JAP | “- The UX lane owns the Screens document and the journeys.” → — | Home: part 3, section 3 ('The UX lane owns them') |
| A39 | 1 | D01:16 | 58 | JAP | “The owner, or whoever runs the product, carries them out.” → — | Home: part 3, section 8 (same words) |
| A44 | 1 | B05:40 | 58 | A | “The coordinator reads it here, never across repositories.” → — | Home: design part 4, section 5, line 90 |
| A13 | 1 | D04:42 | 56 | JAP | “- The owner works with a lane through its design pages.” → — | Home: part 1, section 4 ('He works with a lane through its design pages') |
| W24 | 3 | D05:22 | 56 | JAP | “; the conciseness rule (section 3) keeps the texts short” → — | Reason only |
| A25 | 1 | D05:16 | 51 | JAP | “; the single-text figure is already set per harness” → — | The table's first row |
| A35 | 1 | D09:12 | 51 | AP | “It holds no secrets and keeps no permanent record.” → — | Home: part 0, section 6, 'Development site and development deployment' (same words) |
| W26 | 3 | D05:47 | 49 | JAP | “, for transparency so he can catch a misrecording” → — | Reason only; 'this is not an approval gate' stays |
| A8 | 1 | D06:36 | 48 | JAP | “; three refusals in a row still stop the session.” → «.» | Same section, line 35: 'Three refusals in a row stop a session' |
| W28 | 3 | D04:17 | 44 | JAP | “, because only a session can start a session” → — | Reason only |
| A47 | 1 | B02c:5 | 43 | JA | “, kept in its own file … under 24,000 bytes;” → «, in its own file;» | Reason only |
| A51 | 1 | B02b:5 | 43 | J | “, kept in their own file … numbers are kept” → «, in their own file; their numbers are kept» | Reason only |
| W29 | 3 | D06:8 | 43 | JAP | “Rules held by text alone are a known risk.” → — | Repeats 'That is a known limit' of the sentence before |
| A26 | 1 | D05:47 | 41 | JAP | “(his exact dated words are never edited)” → — | The line above: 'The owner's exact dated words are kept and never edited' |
| A14 | 1 | D04:40 | 40 | JAP | “- ARCH starts a product's design lanes.” → — | Home: section 2 table (ARCH starts the product's lanes) and line 45 ('ARCH opens it') |
| A16 | 1 | D04:14 | 40 | JAP | “and uses a job slot (part 2, section 5)” → — | Home: part 2, section 5 ('walking sessions use the slots') |
| A29 | 1 | D07:37 | 40 | JAP | “Not shown to reach the development site” → — | Same part, section 3: 'Whether a session's browser can reach the development site' |
| A50 | 1 | B02:5 | 38 | J | “(build text 2c), to keep each … numbers are kept.” → «(build text 2c); the numbers are kept.» | Reason only |
| H1 | 5 | D03:63 | 37 | AP | “How his approval reaches the publishing session, if ARCH publishes:” → «How his approval reaches ARCH:» | 'if ARCH publishes' is a leftover option: lines 61-62 say ARCH publishes |
| A15 | 1 | D04:54 | 33 | JAP | “A lane session uses no job slot.” → — | Home: part 2, section 5 ('Lane sessions use none either') |
| A45 | 1 | B05:17 | 33 | A | “No list of later writes is kept.” → — | Home: design part 4, section 4 ('It keeps no list of writes to make later') |
| A28 | 1 | D07:29 | 31 | JAP | “Each job's session is named `<product> … section 11), so” → «Each job's session carries its standard name (part 4, section 11), so» | Home: part 4, section 11 |
| B7 | 2 | B03:48 | 31 | JA | “Built files are not committed.” → — | Design part 2, section 6 |
| A56 | 1 | B02b:11 | 23 | J | “, the only reader tried” → — | Build text 2, section 9, item 2: 'No other reader has been tried' |
| H3 | 5 | B02c:44 | 16 | JA | “It replaces R9.” → — | History of the numbering |
| H4 | 5 | D04:150 | 13 | JAP | “**The tool** is built, and only PROCESS changes it,” → «**The tool:** only PROCESS changes it,» | Status as history; part 6, section 5 says the AI builds it before anything is in force |

G, item by item (Id, where, bytes, roles): W11 B03:68 336 (JA); W14 B03:89 323 (JA); W7 B03:41 287 (JA); W2 B02:33 245 (J); W6 B03:23 176 (JA); W8 B03:43 172 (JA); W3 B02:111 135 (J); W4 B02:119 113 (J); W19 B05:154 104 (JA); W15 B03:131 99 (JA); W13 B03:83 90 (JA); W10 B03:58 89 (JA); W1 B02:15 87 (J); W17 B05:12 82 (A); W18 B05:111 79 (A); W12 B03:75 69 (JA); W9 B03:56 47 (JA); W5 B02:7 38 (J); W16 B03:7 30 (JA).

## Flagged: cutting could change what is said (not in the totals)

| Id | Where | Bytes | Roles | Candidate | Why flagged |
|---|---|---|---|---|---|
| F20 | D07:82 | 452 | JAP | “- **Why.** Without them the … internal and expected.” | A reason paragraph, but it records the checker's default behaviour |
| F10 | D02:117 | 447 | JAP | “Not telling the others is … it might see.” | A reason, but it is the soundness argument for the notice: cutting it loses rigor |
| F35 | B02:108 | 422 | J | “A move to another version … its base names.” | Restates part 6, section 7, but names `shims/module-tests.yml`, found nowhere else in the job's set |
| F18 | D07:55 | 395 | JAP | “A session is scoped to … — is refused.” | Evidence; the replacement keeps the measured facts but not the error text |
| F3 | D00:91 | 345 | JAP | “What it holds, among other … the tool uses.” | Glossary entry; the default slot number, the walk commands and the most external walkers are said to be in the config nowhere else in the design |
| F19 | D07:58 | 276 | JAP | “With the ordinary push and … the sessions' account.” | Evidence of what the tool relies on |
| F26 | B03:13 | 252 | JA | “Gives: a walking session reads … is conversion work.” | 'reads ... nothing else' and 'the UX lane must shape the documents this way' are rules |
| F36 | job.md:20 | 185 | J | “change its stated type where … never hide one.” | Restates design part 2, section 7; but a starting text's rules are the role's principles, and the examples are what the job acts on |
| F32 | B02b:76 | 181 | J | “the proven tool held modules … refusals are unproven.” | Unproven item: the replacement loses which refusals |
| F33 | D02:61 | 175 | JAP | “A module's declared uses are … imports by construction.” | Definition is in part 0 and section 7; 'match by construction' is said only here |
| F12 | D01:47 | 174 | JAP | “; the permission checker refuses … 3, section 6)” | A reason, but it carries a measured behaviour of the checker found nowhere else |
| F23 | B02:110 | 173 | J | “A config that still holds … 1, section 5).” | Old forms; states the tool's behaviour |
| F21 | D07:85 | 154 | JAP | “The settings are expected to … rather than permits.” | Inside an Unproven item; 'expected to work' is an assurance, but 'probabilistic' is a fact |
| F9 | D06:16 | 149 | JAP | “- The approvals and the … change to them.” | That the checker protects the files is said nowhere else in these words |
| F1 | D04:80 | 148 | JAP | “GitHub keeps no guard against … one writing session.” | Line 64 says 'Each record has one writer', but the GitHub fact (two writes, one lost silently) is stated nowhere else |
| F17 | D07:54 | 140 | JAP | “(ROOT archiving the process-repository PROCESS … and "Undermining Oversight")” | Evidence; would move to the background document |
| F8 | D04:94 | 138 | JAP | “- Sessions other than ROOT … are refreshed often.” | Second sentence is part 0's 'A role lasts; its sessions are replaced'; the first is said nowhere else |
| F31 | B03:11 | 128 | JA | “The design fixes what an … walk a journey.” | Design part 3, section 3; but a job does not read part 3, so its set would lose the definition |
| F28 | D03:54 | 120 | AP | “Process4 is a development process, … to the owner.” | May be read as a principle (the balance is the owner's) |
| F37 | job.md:19 | 113 | J | “: coverage, correct results, error … fast and efficient” | Restates design part 2, section 6; a starting text's principles |
| F27 | B05:111 | 106 | A | “Costs: a held merge ends … the owner's word.” | States how a held merge ends |
| F29 | D09:5 | 104 | AP | “Support for other hosting is … as another table.” | Status as well as plan |
| F6 | D00:88 | 100 | JAP | “It is made once for … 1, section 3).” | Part 1, section 3; glossary definition |
| F13 | D03:29 | 100 | AP | “The only walk made on … no triage lanes.” | 'Only' adds exclusivity not in line 28; 'no triage lanes' names an earlier process's element |
| F34 | D06:67 | 93 | JAP | “(`latest-version`: the newest commit of … merged, tested changes)” | 'holds only merged, tested changes' is said only here |
| F5 | D00:63 | 89 | JAP | “The product is one ordered … modules before it.” | Part 2, section 1; glossary definition |
| F25 | B05:139 | 89 | JA | “An older block with no … as holding it.” | Old forms; states the tool's behaviour |
| F14 | D04:17 | 85 | JAP | “The share of ARCH's work … the first tranche.” | A trial plan; belongs with part 10, but nowhere else says it |
| F16 | D06:42 | 83 | JAP | “The changes recorded when the … of the tool.” | Reads as history but sets what the tool's tests are |
| F4 | D00:49–50 | 82 | JAP | “The AI decides everything technical … decided. - **Harness:**” | Same words in part 1, section 1; but it is part of a glossary definition |
| F22 | B02:58 | 82 | J | “An entry that still holds … reads that field.” | Old forms; states the tool's behaviour |
| F7 | D00:83 | 74 | JAP | “Its wording may be drafted … his own click.” | Part 6, section 2; glossary definition |
| F24 | B05:84 | 59 | A | “An older entry that still … as it is.” | Old forms; states the tool's behaviour |
| F15 | D04:46 | 49 | JAP | “, and is measured at … the first tranche” | A trial plan; nowhere else |
| F2 | D07:38 | 42 | JAP | “; that no session edits it is held by text” | Home: part 6, section 5: 'No session edits its copy; this is held by text' ; but this removes a 'held by text' mark |
| F30 | D04:151 | 36 | JAP | “The owner left the count to the AI.” | History, but it marks the count as the AI's choice, not his ruling (part 0, section 3) |
| F11 | D02:68 | 19 | JAP | “(14 November 2026)” | Dated clause; part 0, section 1 allows naming where a quotation comes from |
