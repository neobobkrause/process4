# civicsmith: tests that reach a later module, sorted for ARCH

Length: 70 lines. Last section: "5. What is not known".

Written by PROCESS civicsmith lane #2, 22 Nov 2026, from the third reading
(`research/civicsmith-copy-reading-3.md`; the full report, with every file and line, came by message from
session_018BhcedjomF2pbLdaybhwG5 and is summarised there). **The lane decides none of these.** Each group
gets the kind the lane thinks fits, with its grounds; civicsmith's ARCH decides each (design part 4 §1),
before any job opens on the modules concerned (conversion plan §4). Positions are in `build/modules.json`.

## 1. The four kinds

- **A. The test belongs in the later module.** It exercises the later module's behaviour, or the whole
  product through it; moved into the latest module it reaches, it reaches only earlier ones.
- **B. A shared helper or fixture belongs in an earlier module's public files.** The test needs a tool,
  package or data file that happens to live in a later module's folder.
- **C. The boundary between modules is wrong** (design part 2 §8, an architecture bug): the module list or
  an interface is corrected, not the test alone.
- **D. The order can simply change**: the later module uses nothing that would then stand after it.

A fifth case is not a later-module reference: **E. an earlier module used but not declared** in `uses`.
Declaring the use settles it (27 module pairs).

## 2. The groups, with the kind proposed

| # | Group (testing module → module reached) | Kind | Grounds |
|---|---|---|---|
| 1 | **Tests that boot the real plane (173)** under workerd: 62 files of 21 modules — record-core 37, membership 38, promotion 42, host-governor 43, provenance 44, capture 49 (5 files), reading-pipeline 54 (3), agent-worker 101 (6), reevaluation 104, affordances 144, queue 150, instance-setup 152, screens-intake 166 (4), screens-daily 167, screens-inquiry 168 (7), screens-publish 170, control-plane 172 (21), roster-reader 25 (fixture), office-readers 16 (runs plane's probe), store-assembly 159 (plane's fixture; lists plane's src) | A | Each runs the whole product through plane; they are plane's end-to-end tests. Main's own ruling K856 moved `store-class.test.mjs` to `test/m/plane/` for the same reason. Where a test needs only its own module behind a door, K514 and K856's other arm (compose earlier modules in the module's own fixture) are the alternative ARCH may choose |
| 2 | **Product-wide walks** that list `build/modules.json` or `bio-plane/src` and import or read everything: test-support 7 (`corpus.test.mjs`), promotion 42 (`row-census`), file-safety 51, lines 59, answers 96, docket 111, following 139, answer-envelope 156 (two), control-plane 172 (`r9-seam-limits`) | A | Each checks an invariant of the whole product from an early module; placed in the last module it walks (or one final whole-product module), it reaches only earlier ones. If ARCH wants one home for all such checks, that is a new module at the end of the order, which is kind C |
| 3 | **The declared-operations registry**: walks collecting every module's `DECLARED_OPS` (test-support's helper `bio-plane/test/declared-ops.mjs:92-99`, used by test-support 7, answers 96, op-declarations 154, store-assembly 159, screens-settings 165, control-plane 172; op-grades 143 `declared.mjs`; affordances 144 two files), and earlier modules' tests importing the later registry: case-import 118 → op-grades 143, op-declarations 154; link-sweep 140 → op-grades; queue 150 → op-declarations; op-grades 143 → op-declarations 154; store-door 157 → op-grades (undeclared) | C | The registry collects from every module, while op-declarations itself uses case-import and affordances; earlier modules' tests reach forward to check their own declarations. The boundary of "who checks a declaration" runs against the order. The likely correction is that the registry's own tests (op-declarations, the latest) check every module's declarations, which is kind A for each test; the helper living in test-support 7 is the root of the reach |
| 4 | **interface-shell 162 ↔ screens-entry … screens-action (163–171)**: six shell tests import every screens module; plane 173's `t47`/`t50` import the screens modules without declaring them | C | The shell's tests enumerate their own users, and the screens modules all use the shell: the shell and its screens are tested as one unit. ARCH decides whether the shell's tests move to the last screens module (A) or the boundary is redrawn. Inference: the draft T52/T53 requirements name interface-shell and the screens modules, so this cluster may be among T53's four |
| 5 | **bundler 10 ↔ the fleet**: bundler's tests discover and bundle every real member (pdf-worker 32, ocr-worker 33, sheet-worker 34, file-scanner 35, agent-harness 97, agent-runner 99, agent-worker 101, plane 173; also reads pdf-reader 18, site-profiles 21, subresources 13, court-citations 11) and import installer 175 (`release.test.mjs:1482`, `thirdparty.test.mjs:87`) | C | A general tool at position 10 tests the assembly of the product's real fleet. The generic bundler tests can stay; the tests over the real members are assembly and release checks, which belong to the latest member or the installer (A). ARCH draws that line |
| 6 | **Tooling through another package's folder**: `createRequire(bio-plane/package.json)` for miniflare or esbuild in pdf-pixels 29 (3 files), pdf-worker 32 (2), agent-worker 101 (6), roster-reader 25; bundler 10 `repo.mjs` (links bio-plane's esbuild); pdf-pixels → ocr-worker 33 (`createRequire(ocr-worker/package.json)`, tesseract-wasm, `eng.traineddata`); budget-doctypes 27 → `pdf-worker/node_modules/unpdf` | B | The test needs a development package, not the later module's behaviour. Each package declaring its own development dependency, or one early test helper resolving them, removes the reach. The tesseract data file is a fixture that can move with it |
| 7 | **Reading a later module's config**: bundler 10 (`g54-observability`, `deploybindings`, `resolveversion`), scheduler 141 (`invariants.test.mjs:9,13`), control-plane 172 (`limits.test.mjs:12`) read plane's `wrangler.jsonc`; agent-runner 99 reads agent-worker 101's | A | The assertion is about the later module's deployment config; it belongs in that module's tests |
| 8 | **Reading a later module's source**: record-grammar 2 checks the source files its where-rows name (entities 57, lines 59, progressions 65, money 66, inquiry 80); action-grammar 127 → action-records 128, actions 129; actions 129 → action-holds 130; pdf-worker 32 → admission 155 (`structure.test.mjs:149`); journey-check 178 → op-declarations (earlier, undeclared) | A | A grammar's test that a later module's file says the right thing is that module's test. In each pair the later module already uses the earlier one |
| 9 | **Running a later module's code in a child process or probe**: signatures 9 → capture 49, case-checker 117 (`signatures.test.mjs:585-594`); pdf-reader 18 → docprofile 22, doctypes 23, reading-pipeline 54 (`workerd-index.probe.mjs`) | A | The test checks the later module's use of the earlier one; it belongs in the latest of them (case-checker; reading-pipeline) |
| 10 | **Fixtures in another module's test folder**: jurisdictions 3 → legistar-reader 24 (later); public-read 112 → image-cover 30, store-request 160 → doctypes 23, screens-intake 166 → pdf-reader 18 (earlier, undeclared) | B | The fixture is shared data; in the earlier module's public test files it is reachable by declaring the use (E). For jurisdictions → legistar-reader, A is the alternative (the test belongs in legistar-reader) |
| 11 | **Service bindings to a later worker's bundle**: doctypes 23 → ocr-worker 33 (`capture-policies.mjs:53-60`); roster-reader 25 → pdf-worker 32 | D or A | The report finds no `uses` path back from ocr-worker or pdf-worker to these modules. Whether the order can change depends on ocr-worker's and pdf-worker's own uses (pdf-pixels 29, bundler 10, …); if it cannot, the test belongs in the worker (A) |
| 12 | **pdf-pixels 29 and pdf-worker 32 share one package folder**: pdf-pixels' tests live in `pdf-worker/test/` and list `pdf-worker/src` (`pagepixels.test.mjs:1140`); pdf-worker's `test-script.test.mjs` lists image-codecs' tests under `pdf-worker/test/codecs/` (undeclared earlier) | C | Module boundaries cut through one npm package; the listing tests check the package, not one module. ARCH decides whether the module list or the files' owners change |
| 13 | **Earlier modules used without declaring them**: the 27 pairs in the report's 1(b) (e.g. admission 155 → capture 49; control-plane 172 → lines, calculations, workbooks, scheduler, pdf-worker; installer 175 and stewards 177 → plane's `wrangler.jsonc`; installer → sheet-worker; queue 150 → op-grades 143) | E | Declaring the use in the module's entry settles each; the set-up session converts `uses` as they stand, so ARCH adds them |

Pairs the report found with **no `uses` path back** (bundler → court-citations, subresources, pdf-reader,
site-profiles; pdf-reader → docprofile; case-import, link-sweep → op-grades; queue → op-declarations;
pdf-pixels → pdf-worker) close no cycle through `uses` alone; they are listed under their groups above.
For each, D is possible where the later module's own uses allow the move; ARCH checks that in the order.

## 3. The order of the work, as the lane sees it

1. Kind E first: declaring 27 uses changes no code and makes `check` see them.
2. Groups 1 and 2 are most of the reach (62 plane-booting files; 19 walks). Until they move, almost every
   module sits in one strongly connected set of 151 to 170 modules through plane (report 1(c)), so a
   change to nearly any module can fail another module's test.
3. Groups 3, 4, 5 and 12 are architecture questions (kind C): ARCH decides each before moving files.
4. The rest (groups 6–11) are small moves, each in one module's job.

## 4. How it reaches ARCH

ARCH does not exist until ROOT starts. The set-up session writes one line per group above into
`process/waiting-for-arch.md` (setup-session-brief step 4): the group, the files and lines as the report
gives them, the module reached, and the kind proposed. ARCH corrects the list or places the work before any
job opens on those modules. Per design part 2 §1 and the later-use check (process4 `f4e3596`), a module
whose entry declares a later use is refused by `check` at its first job; the references here are **not**
declared imports, so `check` does not see them, and this list is their only finder.

## 5. What is not known

- Which four modules T53 was working on (not on main; report 1(e)). Groups 3 and 4 touch modules the
  draft T52/T53 requirements name (affordances, interface-shell, the screens modules); that is inference.
- Whether T53's 2,030 commits change any of these references or `build/modules.json`.
- Whether each walk's `try/catch` imports load: no test was run.
