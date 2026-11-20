# Civicsmith: what our records say (research, 20 Nov 2026)

Length: 97 lines. Last section: "9. The repository's owner (20 Nov 2026)".

Written by a research worker for the civicsmith lane. Read-only work; nothing pushed. "Inference" marks every line that is not a recorded fact.

## 1. Sources read

- **process4 working tree** (`/home/user/process4`, main at this session's checkout): `grep -i civic` hits only three files: `process/design-decisions.md`, `process/research/session-naming-standardization-20nov.md`, `coordination/owner_page/desk.html`. Gave the owner's one quote naming civicsmith, naming examples, and the current readiness line.
- **process4 git history** (103 commits, all branches): `git log --all -i -S civicsmith` gives 10 commits (`6c6ed44`, `70c7209`, `014e6ed`, `62b4d94`, `a6dc207`, `1b20401`, `0f6cd92`, `bc7c4d8`, `86cf327`, `2354e3d`). Gave the readiness assessment, phasing and the conversion's named parts. `-S "200 modules"` gives nothing; "~200 modules" appears only in the PROCESS texts quoted in section 4. Only one file was ever deleted (`process/research/measurement-lead-session-prompt-20nov.md`, not about civicsmith).
- **process4 build/ and design/**: `build/03-the-walks.md` section 1 records measured facts about "the product" built under the earlier process (walks, Cloudflare, docs folder). It never names it. `design/09-hosting-cloudflare.md`, `design/10-open-and-unproven.md`, `build/02-the-forms.md` give what a conversion needs.
- **process3 public clone** (unshallowed, 40 commits, 1–2 Nov 2026): no mention of civicsmith in any commit, file or message (`git log --all -i -S civic`, `--grep civic`). Gave the earlier process's tool and approvals, and two measured facts about "the first product" / "a large product".
- **Public check of the product repo**: `git ls-remote https://github.com/neobobkrause/civicsmith` (and `CivicSmith`, `civicsmith-app`) all asked for credentials. Private or absent; not tried further, out of bounds.

## 2. What civicsmith is

- The only words of the owner that name it (conversation, 20 Nov 2026; `process/design-decisions.md`, "Releasing from a tranche merged with its flaws named", commit `014e6ed`): "The development of large workflows like civicsmith is a process of balancing 3 things: time, resources, and quality. ... I have no intention to ever ship a product with known flaws. But what we've designed here isn't a product, it's a software development process. That process, by necessity, must have the real world flexibility to create the proper balance that the product requires."
- The owner's standing direction (19 Nov, quoted in the handover at `70c7209`/`6c6ed44`): "develop, test, and evolve process4 to the point that it meets all design requirements and can be used for development of both the trial product and larger products like civicsmith".
- Purpose, audiences and principles of civicsmith itself: **not recorded anywhere we can read.** The name suggests civic software (inference only).
- Inference (not stated): the unnamed "product" of the earlier process in `build/03-the-walks.md` is civicsmith, since it ran on Cloudflare, was large, and is the one product the owner wants to move. If so, these are recorded facts about it:
  - It has "the product's own first-use door", members who can be invited, an AI assistant ("six have steps only the AI assistant can do"), a website and an installer ("three begin at the website or the installer"). Journeys lists disagreed: 27, 27 and 32.
  - The owner, 14 Nov: "screens and journeys are kept in docs/development/ux-substrate/ in the product repo". That folder held 133 files on main, with a Screens page and a Journeys page.
  - The owner, 9 Nov: "The first run or two of the external system will run without without an AI account connected."

## 3. How it is built and run now

- **Language, framework, module list, tests:** not recorded in any source we can read. "About 200 modules" is PROCESS's figure (section 4); its source is not given.
- **Hosting:** the design's only hosting table is Cloudflare (`design/09-hosting-cloudflare.md`: "Cloudflare, the first hosting provider"); the readiness assessment names "walks, deployment and release by sessions on Cloudflare" for civicsmith (`62b4d94`). Process3's approvals (CLAUDE.md, 2 Nov) speak of "the product's own Cloudflare account, the one its process config names", development deployments, "walkers", and "development releases, with their tags and pre-releases in the product's repository".
- **Process it runs on now:** not stated for civicsmith. Inference: Process3 (earlier process: `node .process/tool/p3.mjs`, a pinned clone at `.process/`, ledger in `process/ledger/<id>.json`, required check "gate", shims `process-gate.yml` / `process-record.yml`, `record_since` so pre-Process3 history is not checked). `build/01-the-tool-and-the-required-run.md` records that in the earlier process "every session held one repository and fetched the process as its first command, `git submodule update --init .process`".
- **Measured under the earlier process, for "the product"** (inference that it is civicsmith):
  - process3 `shims/process-gate.yml`: "the full checkout of a large product took up to 4 minutes" (Bob's decision 3A, 2 Nov); a private repository keeps the full fetch.
  - process3 `tool/lib/github.mjs`: `gh pr ready` (GraphQL) unreachable from Code sessions, "measured 1 Nov 2026, the first product job".
  - `build/03-the-walks.md` section 1: walks were a program (a Playwright walker module, local and live arm), not sessions; local arm limit 45 minutes; all 12 development deployments failed, 10 at the walk; "No walk ever passed"; deployment-with-walk runs took 60 and 64 minutes; 1,690 page faults first seen live; walker output committed was 13,017 files, 431 MB. The owner, 8 Nov: "be careful that there aren't too many external walkers to cause the Cloudflare system to exceed limits of the account".
- **Repositories:** the product repo's name is not recorded (inference: `neobobkrause/civicsmith`, which is private or absent). The trial product is a different repo, `neobobkrause/process3-probes`.

## 4. What Process4's records already say about civicsmith

- **Readiness assessment** (PROCESS, on the owner's request; standing page, commit `62b4d94`): "The reading-limit risk I flagged is now largely answered — the limits have wide measured headroom. What stays unproven is scale (~200 modules), and walks/deployment/release by sessions on Cloudflare — the design's own position is that the first real tranche is the proof. I recommend phasing: run the figures into the design, do civicsmith's setup, then a small first tranche as the proof."
- Same in the handover (`1b20401`): "scale (~200 modules) and session-run walks/deployment/release on Cloudflare are unproven ... Recommended phasing: figures into design → civicsmith setup → small first tranche as proof." At `a6dc207` the figures step is marked "(done)".
- **Current line** (`coordination/owner_page/desk.html`, commit `2354e3d`): "Civicsmith readiness. Unchanged: civicsmith's setup, then a small first tranche as the proof. This fault is one more reason its tranche branch must start from its main." The fault (`process/research/tranche-unrelated-to-main-20nov.md`): the trial reused a repo whose main held the earlier process's history, and its tranche branch shared no history with main, so it could not merge.
- **What the conversion consists of** (handover, `70c7209`; repeated `1b20401`): "The first real tranche (the proof), and the civicsmith conversion (its own conversion plan + the owner's setup acts + the autoMode settings on its env)", and "Per-product promote/rollback/support procedures (design part 3 §8), written at conversion."
- **Design** (`design/00-index.md`): the design "names no product. A product's own facts and the steps to bring it under Process4 belong to that product's conversion plan." `design/10-open-and-unproven.md` section 2: item 1, per-product promote/rollback/support procedures, none written; item 2, "Each product's conversion plan. It is not part of this document."
- **Risks named** (`design/10` section 3, all unproven and relevant to civicsmith): walks made by sessions and "the hosting account bearing the walkers"; a walk ending without flaws; a deployment made from a session; the tranche branch merging into main; the release path (install, update); two products sharing the slots; the notice on a real product. `process/research/owner-acts-without-files-20nov.md`: promote/rollback/support procedures "On Cloudflare ... would naturally be commands. They must be written as clicks, or name someone else to carry them out."
- **Naming** (`process/design-decisions.md`, `bc7c4d8`): examples `civicsmith ARCH #3`, `civicsmith ux lane #2`, job `civicsmith orders #2` (examples only; "orders" is not a recorded civicsmith module).
- **Config the conversion must fill** (`build/02-the-forms.md`): `process.json` at the repo top, with `"hosting": { "provider": "cloudflare", "development_account": "<the account's id>" }`; `design/09`: a deploy token for the development account only, among the harness's secret values.

## 5. Unknown: what we could not learn and who must tell us

The owner (he holds the private repo and the accounts), unless marked PROCESS:
- The product repo's exact name, its visibility, and whether this lane may read it (it needs a session started in that repo under civicsmith's own approvals; our approvals do not reach it).
- Civicsmith's purpose, audiences and founding principles, and where its founding documents live.
- Language, framework, build and test commands, and the real module count (source of "~200").
- Whether civicsmith is the "product" of the earlier records (`build/03`), and which process it runs on now (Process3 pin, ledger, shims, `.process` submodule), and whether work is mid-tranche.
- The Cloudflare development account to use, deploy token, installed sites, the installer/updater, and the AI-account setup for walks.
- Civicsmith's own standing approvals and forbidden commands for Process4.
- Whether its main holds the earlier process's history, so the tranche branch is made from main's newest commit (the trial's fault).
- PROCESS: the conversion plan itself (design part 10 §2 item 2), the per-product procedures (part 3 §8), and what "civicsmith's setup" covers step by step; the source of the "~200 modules" figure.

## 6. From PROCESS #5, by message, 20 Nov 2026 (added by the lane)

- What the lane is for, in the owner's words of 20 Nov 2026 as PROCESS relayed them: "I'm starting to think about the steps involved in moving civicsmith development to process4. Create a process4 civicsmith lane for working through those issues. Any action it takes to update process4 will be by communicating with PROCESS." So "those issues" are the steps of the move: civicsmith's conversion plan (design part 0 §1; part 10 §2 item 2).
- About 200 modules; hosted on Cloudflare; its AI journeys exist (the walks' AI decisions were made with civicsmith in mind). PROCESS's standing recommendation: civicsmith's setup, then a small first tranche as the proof.
- From the account's session titles (9 Nov, process3 era): civicsmith ran under Process3 with a copy repository called "civicsmith-copy", pinned to process3 commits ("pin move", "layer/14", jobs such as "credentials", "op-declarations", "ai-accounts"). PROCESS has not read civicsmith's repositories and does not know their exact names, language, size or founding documents.
- Measured on the trial (process/research/tranche-unrelated-to-main-20nov.md): a reused repository's main must be the tranche branch's base, and main's ruleset must require `module-tests` (the trial's still required Process3's `gate`). Both bear directly on a Process3 repository moving to Process4.
- The account switch moved PROCESS and products to one Claude account (design part 7 §3).
- PROCESS asks the lane to put to the owner: the repository name(s); whether the real civicsmith or civicsmith-copy is converted; the founding documents and where they are.

## 7. From the owner, 20 Nov 2026 (conversation, not a marked decision)

His words, as typed: "The civicsmith repo is neobobkrause/civicsmith2 / The founding docs are in the repo /
There is no work in flight / You can see the languages in the repo / Also note that there are several
problems that need to be resolved before process4 development can begin."

- So the repository that moves is `neobobkrause/civicsmith2` (not "civicsmith-copy"; the page's Choice 1
  is answered by his naming it). It is under the owner `neobobkrause`, which the permissions-management
  settings already name (point 7).
- `git ls-remote https://github.com/neobobkrause/civicsmith2` asked for credentials (20 Nov 2026): the
  repository is private. The lane's approvals cover neobobkrause/process4 only, so the lane does not read
  it. Its languages, founding documents and the "several problems" are learnt from a session started in
  civicsmith2 under its own approvals, or from the owner (see `civicsmith2-reading-brief.md`).

## 8. From the owner, 20 Nov 2026, later (conversation, not a marked decision)

His words, as typed: "A — I'll start the read-only session on civicsmith2" and "The problems in
civicsmith2 that I'm referring to are related to cyclic references within modules and other source code
issues that have made it difficult to close a round without addressing."

## 9. The repository's owner (20 Nov 2026)

The owner later asked, as typed: "Clone the repository believeinoakland/civicsmith2 into this session."
So civicsmith2 is under the owner `believeinoakland`, not `neobobkrause` as first given (§7).
`believeinoakland` is also the GitHub account that marks this lane's pull requests ready (PR 100 events), i.e.
the sessions' account. The lane did not clone it: the standing approvals in neobobkrause/process4 make a
session's acts on a product's repository only from a session started there, one repository per session.
Bearing on point 7: the environment's `autoMode` block trusts repositories by owner (`neobobkrause/*`,
research/starting-a-product.md §2); a repository under `believeinoakland` is not covered by that wording.
Inference until the environment is read.
