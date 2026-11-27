Length: 128 lines. Last section: "9. What could not be settled".

# Process4 build text 2: the forms of the files the design names

Beside the design (`design/`), not in it. **Status: proposed. The tool reads these forms, but nothing here has run in a process in force.** Sections 5 and 6 are in `02b-the-comment-and-the-listing.md` (build text 2b); section 7, the process config, in `02d-the-process-config.md` (build text 2d); and section 10, the coding standard and the uses file, in `02c-the-coding-standard.md` (build text 2c). The numbers are kept.

Marks: **Decided here:** a choice made in this text. **Unproven:** never shown to work in this form. Every example is made up: a product in plain JavaScript with modules `dates`, `pricing` and `orders`.

## 1. What the forms of sections 5 and 6 are for

Sections 5 and 6 (build text 2b) give the structured comment and the interface listing. The design finds users from the uses files of section 10 and changes from each item's means (build text 5, section 6), with no refusal the owner has not approved. Not proven: these forms on the real product, comments written by real jobs, and what a told job does.

## 2. Where everything is

**Decided here:** the process config is `process.json` at the top of the product's repository, the one fixed place. It names the process folder, and every other form here lives under that folder. The examples use `process/`.

| Form | Place | Writer |
|---|---|---|
| Process config | `process.json` | ARCH |
| Module order | `process/modules/order.txt` | ARCH |
| A module's entry | `process/modules/<name>.json` | ARCH |
| A module's requirements | `process/modules/<name>.md` | ARCH the text; the job the word `met` |
| A module's uses file; the facility list | `process/modules/<name>.uses.json`; `process/modules/facilities.json` (section 10) | The tool, at each push; ARCH |
| Ranking page | `process/ranking.md` | ARCH |
| The owner's decisions on the product | `process/decisions-owner.md` | The coordinator |
| ARCH's technical decisions | `process/decisions-arch.md` | ARCH |
| Procedures, release notes, tranche reports | `process/procedures/`, `process/releases/`, `process/reports/` | ARCH |
| A job's kind, its record and its test record | Three comments on the job's own pull request (build text 5, section 5) | The tool: the job block in ARCH's session, the record and the test record in the job's |
| The shared state's records | Comments on one issue (build text 5, sections 1 to 4) | One session each |

## 3. The module list

**Decided here:** the list is one order file and one small entry file for each module.

**The order file** holds one module name on each line and nothing else. A module's order is its line number. A name is lower-case letters, digits and hyphens.

```
dates
pricing
orders
```

**An entry** is a JSON object with exactly four fields.

```json
{
  "name": "orders",
  "files": ["src/orders/"],
  "tests": ["test/orders/"],
  "public": ["src/orders/index.mjs"]
}
```

- `name`: as in the file's name and the order file.
- `files`: the paths of the code the module owns. A path ending in `/` is a folder with everything under it. A file belongs to the module with the longest matching path.
- `tests`: the paths of its tests, read the same way. Its walk steps are under these paths too, in `walk/internal/` and `walk/external/`, and the module's test command never runs those two folders (build text 3, section 3).
- `public`: its interface files, read the same way: the files whose exports, with the further entries named there, make its listing (build text 2b, section 6). A helper for other modules' tests is one too.
- The requirements file is not named: it is always the `.md` of the same name, and the uses file the `.uses.json`, which names the module's declared uses (section 10). An entry that holds `uses` is read without fault; nothing reads that field. The test command is not here either: it is one line of the process config (section 7).
- A module is identified everywhere by its `name`: in the tool's commands, in a job's branch `job/<name>.<n>` (build text 1b, command 1), and in the records.

**How "a module may use only modules before it" reads:** every provider the module's uses file names stands on an earlier line of the order file than the module's own. `orders` is on line 3, `dates` and `pricing` on lines 1 and 2, so it holds. Otherwise it is an order fault (part 2, sections 1 and 6; build text 1b, command 18). A job changes nothing in the list.

## 4. A module's requirements file

Place: `process/modules/<name>.md`. It is a governing text for the module's job, so its top says its length.

```
Length: 10 lines. Last section: "Requirements".

# orders: requirements

Next number: 4

## Requirements

- **R1** [met] An order holds one or more lines, each a product code and a quantity.
- **R3** [not yet met] An order of more than 999 of one product is refused, and the refusal says which line. (screen: checkout / basket)
```

- One requirement is one line: `- **R<n>** [met]` or `- **R<n>** [not yet met]`, then the text. However long the text, it stays one line, so that a change to a requirement is a change to exactly one line.
- The number is permanent. A requirement that is withdrawn has its line deleted and its number is never used again (R2 above). `Next number` is what makes that hold.
- **Who changes which part.** ARCH writes and rewords the text, adds and deletes lines, and keeps `Next number` and the length line. The job changes one thing only: `[not yet met]` to `[met]`, in its own pull request. Marking changes no line count, so the job never touches the length line.
- ARCH writes `[not yet met]` on a new requirement, and puts it back on a met one in the same change that rewords it so as to change what the product does (part 2, section 2).
- Requirement text names what it serves by ending with `(screen: <page> / <screen>)` or `(journey: <page> step <n>)`. `walk areas` reads these endings.

## 8. The ranking page, the two decision records, and a job's record

**The ranking page,** `process/ranking.md`. Five numbered lines, highest first, each naming a kind of governing text and where it is kept, then the rule.

```
1. Mission: docs/mission.md
2. Principles: docs/principles.md
3. Standards: docs/standards/
4. Requirements: process/modules/<name>.md
5. Design decisions: process/decisions-arch.md and each lane's folder
A lower one never overrides a higher one. A session that finds two in conflict follows the higher and tells ARCH.
```

**The owner's decisions,** `process/decisions-owner.md`, written only by the coordinator. One entry for each subject, in subject order:

```
## Slots
Rule now: ten jobs may run at once on this product.
- 19 Nov 2026: "make it ten"
Shown to the owner: 19 Nov 2026.
```

`Rule now` is rewritten in place when a decision changes it. The dated lines are his exact words, never edited; a new one goes below the last. `Shown to the owner` is the date he saw the rewritten entry, or `not yet`.

**ARCH's decisions,** `process/decisions-arch.md`, written only by ARCH. Same order by subject:

```
## Money
Decision: amounts are whole pence everywhere; no module holds a fraction of a penny.
Why: two modules rounded differently.
Decided: 19 Nov 2026.
```

The `Decision` line is the one plain line the coordinator gives the owner. A changed decision rewrites the entry in place.

**A job's kind, its record and its test record** are three comments on the job's own pull request: the job block, the job's record and the test record. Their forms are in build text 5, section 5 (`05b-pull-request-comments.md`), with the shared state's records.

## 9. What could not be settled

1. **The forms of sections 5 and 6 on a real product** (build text 2b). Their recorded answers are among the tool's own tests (build text 1, section 6); none has run on a product.
2. **A product in another language.** Sections 5 and 6 (build text 2b) are for plain JavaScript under TypeScript's reader. No other reader is built.
3. **Messages between two separately running parts.** The mark is `@message` (build text 2b, section 5).
4. **A decision record that outgrows the maximum.** The owner's dated words are never edited, so his record only grows. How it is split is the coordinator's and PROCESS's to settle.
