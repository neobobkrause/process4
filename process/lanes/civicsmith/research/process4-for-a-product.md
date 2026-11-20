Length: 90 lines. Last section: "5. Open or unproven, and met first by a real product".

# Process4 for an existing product: the inputs to its conversion plan

Research for the civicsmith lane, 20 Nov 2026, by a research worker. Read in full: build texts 01, 01b, 02, 02b, 03; design parts 02, 09, 10; starting texts 00-index, lane, arch, root. Read in part: build 04 §4-5, build 05 §6, design 04 §2-3, 06 §2, 07 §4; `tool/lib/config.mjs`, `tool/lib/notice/ts.mjs`, `shims/`. Nothing here is a rule; every source text is "proposed" and nothing has run (build 01 header; design 10 §3). **Inference:** marks my own reading. "Bxx" = build text, "Dxx" = design part, "S" = starting text.

The design names no product: "the steps to bring it under Process4 belong to that product's conversion plan" (D00 §1; D10 §2 item 2). The earlier process's product had 220 modules in `build/modules.json`, requirements in `build/requirements/<module>.md` (B02 §1), and its screens and journeys in `docs/development/ux-substrate/` (B03 §1). **Inference:** that is probably this product; the conversion starts from those files.

## 1. Files a product repository must carry

| File | What it holds | Source |
|---|---|---|
| `process.json` (top level, fixed place) | The process config; written by ARCH | B02 §2, §7 |
| `process/modules/order.txt` | One module name per line; line number is the order; names lower-case letters, digits, hyphens | B02 §3 |
| `process/modules/<name>.json` | Exactly five fields: `name`, `files`, `tests`, `public`, `uses` | B02 §3 |
| `process/modules/<name>.md` | Requirements file (form below) | B02 §4 |
| `process/ranking.md` | Five ranked governing texts (mission, principles, standards, requirements, design decisions) and the rule | B02 §8 |
| `process/decisions-owner.md` | Owner's decisions; coordinator only | B02 §2, §8 |
| `process/decisions-arch.md` | ARCH's decisions | B02 §2, §8 |
| `process/procedures/`, `process/releases/`, `process/reports/` | Procedures, release notes, tranche reports | B02 §2 |
| Lane folders, e.g. `lanes/ux/` | Each lane's design and research; named in `lanes` | B02 §7; S lane rule 2 |
| Walks' documents folder (`walks_folder`, e.g. `lanes/ux/walks/`) | Screens document as one page per group of screens, one page per journey, an index page, each under the single-text maximum | B03 §2; S lane rule 5 |
| Walk steps, `walk/internal/` and `walk/external/` under each module's `tests` paths | Small browser programs with four fixed header lines (`requirement:`, `follows:`, `expects:`) | B03 §3 |
| JSDoc structured comments in each module's `public` files | `@param`/`@returns`/`@type`, `@typedef`, `@throws`, `@import`, `@bound`, `@optable`, `@carriesop`, `@message`, `@storedrows`, `@carriestable` | B02b §5 |
| `CLAUDE.md` | The owner's standing approvals for the product; landed only by his click | D06 §2; D07 §4 act 8 |
| `.claude/settings.json` | The deny list, copied unchanged from `shims/claude-settings.json` | D06 §2; B01 §2 |
| `.github/workflows/module-tests.yml` | Copied from `shims/module-tests.yml`; required check `module-tests` | B01 §5 |

**Process config fields** (B02 §7): `process` {repository, version, 40-character commit}; `tranche_branch`; `node`; `lock_files`; `test_command` (one for the whole product); `slots` {default, share}; `lanes` [{name, folder}], UX always present; `hosting` {provider `cloudflare`, development_account id, never the token}; `walks_folder`; `walk` {build_and_serve, run_steps, most_external_walkers = 1}; `deploy` {deploy, seed, remove}; `process_folder`; `language_reader` {name, version, source globs}. The tool defaults missing `process_folder`, `tranche_branch`, `test_command`, `lock_files`, `node` (`tool/lib/config.mjs` `loadConfig`); the fetch line refuses a config without `process.repository` and a 40-hex `process.commit` (`config.mjs` `fetchLine`).

**Requirements file form** (B02 §4): length line on top; `Next number: <n>`; one requirement per line, `- **R<n>** [met]` or `[not yet met]`, numbers permanent and never reused; text ends `(screen: <page> / <screen>)` or `(journey: <page> step <n>)` so `walk areas` can read it (B02 §4; B03 §2).

**Module entry semantics** (B02 §3): a path ending `/` is a folder; a file belongs to the module with the longest matching path (`config.mjs` `ownerOf`); `public` names interface files, including helpers other modules' tests import; `uses` names declared uses.

**Workflow** (B01 §5; `shims/module-tests.yml`): part one `scope` (read-only token, reads `process.json` at the base commit, runs `p4 run scope`); part two `module-tests` (no token; `npm ci` in each `lock_files` folder; runs `check`, then `test_command` over the scoped files; 45-minute timeout). The shim also reads the job block comment `<!-- process4-job -->`.

**Deny list** (`shims/claude-settings.json`): denies `gh *`, merge by MCP or API, force-push, branch delete, push to main, contents/blob/tree/ref API writes, curl to api.github.com, MCP file writes.

## 2. Constraints that bite a large existing codebase

1. **Module order.** "A module may use only modules before it"; a later use is a design error corrected by reshaping code (D02 §1). Read as: every name in `uses` stands on an earlier line of `order.txt` (B02 §3). Nothing refuses it; ARCH's reading catches it (B02 §3). **Inference:** an existing 200-module codebase with any import cycle must be reshaped before its order file can be honest.
2. **Every file owned.** Every code file has exactly one owner module; every file in the repository belongs to a module, a lane folder or the process's named files; a stray file is given to a module by ARCH before any job touches it (D02 §1). A module with requirements and no code is a list error (D02 §1).
3. **Requirements file size.** Kept "under the single-text maximum" by ARCH splitting the module; nothing refuses (D02 §2). The single-text maximum is 60,000 bytes on Claude Code, 24,000 on Codex (S 00-index §2). B02 §4 still says "under 24,000 bytes". **Inference:** B02 §4 predates the raise; conversion should aim at 24,000 to stay safe on both harnesses until PROCESS reconciles. One file of all 220 entries would be about 60,000 bytes, hence one entry per module (B02 §3).
4. **Language reader.** Only TypeScript 5.6.3 over plain JavaScript has been tried (B02 §1, §9 item 2; B02b §5-6). The tool has one dependency, `typescript` 5.6.3 (B01 §2; `tool/package.json`); it reads with `allowJs`, `checkJs`, `strict`, NodeNext, Node 22's library (`tool/lib/notice/ts.mjs`). Code files are chosen by `language_reader.source`, default `**/*.mjs` (`tool/lib/notice/model.mjs`). **Inference:** `language_reader.name` is not used to pick a reader; the tool only notes a version mismatch (`tool/lib/notify.mjs:41-42`). `.ts` sources may work through the same reader but are untried; `.js`/`.ts`/`.tsx` need the `source` globs set. A browser-targeted module or one using Cloudflare Workers globals is read against Node's description (`node.d.ts`), likely giving "cannot tell" or unknown-kind results.
5. **"Not followed fully"** (B05 §6), for a declared provider P, any of: (1) U declares P and no use is found; (2) U reads or calls a value of unknown kind anywhere in its files, unless from outside the product; (3) U calls by a name the tool cannot read and P has operations; (4) U names a table the tool cannot read and P has tables. Such a U is told on every change to P's listing. In the proof, 54 of 111 needless notices went to one module by cause 2 (B05 §6). **Inference:** uncommented legacy code hits cause 2 widely, so until the first jobs add structured comments, notices will be broad. A module with no comments yet: its job's first step adds them, sending no notice (D02 §7).
6. **The required run's scope** (B01 §5): base is main → nothing; no module code or test changed → nothing; `job/<module>/<n>` told → related tests; job branch otherwise → whole module; any other branch touching module code (the mechanical edit) → whole module for each module touched. Walk folders never run. A module with no test files passes. **Inference:** a mechanical edit across many of 200 modules runs all their tests in one 45-minute job (shim timeout); time unmeasured (B01 §5 "Unproven: the time a whole module takes"; B04 §5).
7. **Dependencies and Node.** The workflow installs only by `npm ci` in each lock file's folder (`shims/module-tests.yml`). **Inference:** pnpm or yarn lock files are not supported as written. One `test_command` serves all modules (B02 §7). The earlier product needed a newer Node than the session machine had (B03 §1).
8. **Slots.** Eight by default across the account; the product's share in `slots.share`; jobs and live walking sessions use slots; standing roles and lanes do not (D02 §5; B02 §7). `next-job` starts one job per call, earliest in module order first (B01b §4 item 9). **Inference:** with 200 modules a first round where most have unmet work runs eight at a time in module order.
9. **One job writes one module.** Cross-module change lands provider-first, users next, old form dropped last; else the boundary is an architecture bug (D02 §8). Mechanical edits only when no job is open (D02 §9).
10. **Interface rules.** Code that checks or builds a crossing value names its kind with `@type`; calls by name need one `@optable` per provider, one gathered list and `@carriesop` (D02 §7 decisions 4-5; B02b §5). Messages between separately running parts are marked `@message` (B02b §5). **Inference:** a Cloudflare product with Workers, queues or service bindings has many such crossings.
11. **Tests and steps prove requirements only;** a test or step serving the process is not allowed (D02 §6; B03 §3). `check` compares declared uses with imports, comments with code, and code with providers' stated interfaces (B01b §4 item 18).
12. **Built files are never committed** (D02 §6; B03 §4). The earlier walker committed 13,017 files, 431 MB (B03 §1).

## 3. What must exist before ROOT starts, and what ARCH creates after

**Before ROOT** (owner's acts, D07 §4; B04 §4):
- Second GitHub account with write access to product and process repositories; repository settings: merge commits, no auto-merge, no auto-delete, read-only Actions token, no repository secrets; a no-delete, no-overwrite rule on every branch (acts 1-4).
- Claude connected as that account and its App installed; deploy token (Cloudflare API token for the development account only, D09 §1-2) entered in the cloud environment's secrets (acts 5-6).
- The owner's approvals and the deny list landed on the product's main branch by his click, from a plain session that also makes the tranche branch from main (acts 7-8; D06 §2).
- `process.json` with `process.repository` and `process.commit`: ROOT's plain prompt fetches "the read-only copy of the process that `process.json` names" (S root A; B01 §2). **Inference:** `process.json` must therefore be on the tranche branch before act 9, though B02 §7 names ARCH as its writer.
- **Inference:** the workflow file should be in place too, because act 10 (branch rule requiring `module-tests`) waits on the run's first report (D07 §4 act 10; B04 §4). The run passes "nothing" while no `process.json` exists (shim).
- Act 9: start ROOT on the product repository alone, tranche branch, Auto mode, plain prompt (D07 §4).

**ROOT then:** creates the shared state's issue once (`state write --create`), starts the watcher, ARCH and the coordinator, sets its hourly wake (S root B, rules 1-2; B01b §4 item 17).

**ARCH creates or keeps after:** the module list, requirement text, process config, ranking page, its decision record, tranche report, release notes, procedures (S arch "Acts"); assigns every unowned file (D02 §1); writes the lanes record and starts lanes (S arch rule 7); names walk areas, deploys development copies by the `deploy` commands (S arch; B03 §5). The coordinator writes `decisions-owner.md` (B02 §2). The UX lane shapes the walks' documents into pages, which "is conversion work" for this product (B03 §2). Each module's first job adds structured comments (D02 §7). The owner later enters the development copies' hosts among allowed hosts (B03 §5; B04 §4).

**Inference:** the texts do not say who converts `build/modules.json` and `build/requirements/` into the new forms or when; the conversion plan must assign it (D10 §2 item 2).

## 4. Roles and lanes a product gets

- **Standing:** ROOT; under it the watcher, ARCH and the coordinator; under ARCH, jobs, walking sessions and lanes; at most three levels deep (D04 §2). PROCESS lives in the process repository, started by the owner (D04 §2; D10 §3).
- **Lanes:** "The UX lane is always there. A product's other lanes are named in its process config" (D04 §3; B02 §7 `lanes`). The owner identifies the need; ARCH opens it (D04 §3). One session at a time per lane (D04 §3). First run researches founding documents, existing code and best practice with workers, answers nothing until recorded in its folder (D04 §3; S lane rule 2). The UX lane owns the Screens document and journeys, maintains the journey list, and sets each journey's "what must be present" words (B03 §5, §9 items 1-2; S lane rule 5).
- **Jobs:** one per module with work, branch `job/<module>/<n>`, draft PR into the tranche branch, merged by ARCH via the tool (B01b §4 items 1, 3, 6; D02 §3).
- **Walking sessions:** internal per screen group, external per journey, external count = least of free slots, external areas, `most_external_walkers` (B03 §4-5).

## 5. Open or unproven, and met first by a real product

1. **Conversion plan itself is undone** (D10 §2 item 2). So are per-product promoting, rollback and support procedures (D10 §2 item 1) and where cost can be read (D10 §2 item 3).
2. **The reader on real code.** The notice was proven only on eleven made-up modules and 150 changes; "The made-up modules are not the real product" (B02 §1). The trial "cannot show how the tool's reader behaves on a real product's code, or how long a real module's tests take" (B04 §5). The notice on a real product: unproven (D10 §3). Design 8's "accepts more" by the type checker was never built (B02 §1; B02b §6).
3. **Forms left unsettled** (D10 §2 item 10; B02 §9): helpers under one module's tests that another imports (not covered by the listing); one form for messages between separately running parts; splitting an outgrown owner's decision record.
4. **Another language** is untried (B02 §9 item 2).
5. **Walks by sessions** are unproven: a session's browser reaching the development site, sharing a walk, the account bearing walkers, a walk ending without flaws (D10 §3). The earlier product's walks never passed: 12 deployments failed, 147 of 157 external steps still failing (B03 §1).
6. **Cloudflare unknowns** (D09 §3): how many walkers the account bears; whether a deployment fits the time a session can run one thing; whether the installer can place a release in an empty account; how an AI account connects to a secret-free deployment. Deployment from a session is unproven (D10 §3); deploy-plus-walk took 60-64 minutes before (B03 §1).
7. **The mechanical edit's one merge** and its required run (D10 §3; B01 §8 item 2; trial item 9). A large conversion is likely to need several.
8. **The tool and its fetch:** a one-repository session cloning the process repository; assumes it is public, else part two of the run fails as written (B01 §2, §8 item 1; D10 §2 item 4). Whether act 10 can precede act 9 is not known (D07 §4).
9. **The owner's acts to start a product** and the tranche branch merging into main are unproven (D10 §3).
10. **Risks with no trial** (D10 §6): a job's tests judge its own work; a loosened step cannot be seen; another module's merge can break a module unseen until a walk; most rules are held by text alone.
11. **Only the first tranche can show** whether a tranche can end, merges keep passing the checker, how often faults wait on the owner, and cost (D10 §5).
12. **Reading sets with product documents** added are of unknown size against the 175,000-byte set maximum (S 00-index §2).
