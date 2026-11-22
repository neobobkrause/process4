# civicsmith-copy: the third reading (22 Nov 2026)

Length: 86 lines. Last section: "4. What the lane takes from it".

Source: the report sent by message to the lane in two parts on 22 Nov 2026 by the read-only session
session_018BhcedjomF2pbLdaybhwG5, on `neobobkrause/civicsmith-copy`, from `reading-brief-3.md` (item 12 a–e
of `reading-brief-2-tokens.md`, and the settings file as PROCESS #6 reworded it). Read with `git show
main:<path>` and `git log main` at the session's `main` ref `0dea5a6e`; nothing changed or pushed; no test
run. Shortened here. The lane's sorting of item 12 is `../later-module-tests.md`.

## 1. Method (item 12)

- Order = position in `build/modules.json` `modules`, 178 modules (setup-words 1 … journey-check 178).
  Every declared `uses` points earlier (0 exceptions). Test files = files under each module's `tests`
  paths, most specific path wins: 4,072 files.
- Every test file parsed (acorn); path expressions resolved; every import, dynamic `import()`, `require`,
  child process, `new Worker`, Miniflare/workerd config, file read and directory listing that lands in
  another module's file kept; a second pass matched string fragments against other modules' paths;
  each hit read in context. Walks that find modules at run time were repeated against main's tree.

## 2. Findings (item 12)

- **(a)** Main's one record of T53 is `build/onboarding/merge-hold.md:5,11`: `tranche/T53` @ `122605e5`,
  2,030 commits, layers 1–4 closed, 5–11 open, twenty jobs named, paused by the owner (K5791). The twenty
  jobs' modules are **not on main**. `build/plan/draft-T52-N1260-requirements.md:18-64` marks lines
  "not yet met: T53" for connection-grammar, connections, money, explore, affordances, interface-shell,
  the screens modules and journey-check. Main's rulings already name the problem: K81, K242, K514, K856
  ("two module tests import plane, later in the order"), K939, K2950, K3344, K3531;
  `build/plan/review2-K4426-round8.md:54-56` ("reaches the plane by a path string … not an import").
- **(b)** No static `import … from` (relative or by package name) reaches a same-or-later or undeclared
  module: all 6,016 cross-module static imports go to an earlier, declared module. Every reference found is
  of another kind: **242 explicit references in 120 files of 46 modules** (72 module pairs pointing
  same-or-later; 27 pairs to earlier modules not in `uses`), plus **19 whole-tree walks**. The real plane
  (`bio-plane/src/plane/index.mjs`, 173) is booted under workerd or run by **62 test files of 21 modules**;
  plane uses 134 modules, so each such test runs nearly the whole product. Service bindings serve
  ocr-worker's and pdf-worker's bundles to tests; no test calls a deployed address.
- **(c)** With test references counted, cycles are too many to list. The report gives the closing line of
  every forward reference with its shortest way back through `uses`, and the strongly connected sets:
  151 modules (references that run code), 163 (plus importing walks), 162 (all explicit references),
  170 (everything). The hub is plane (173).
- **(d)** The first reading's method (relative static imports) would have missed all of it: paths held as
  strings and handed to workerd; computed dynamic `import()`; `node -e` child processes; walks found at
  run time; file and fixture reads; package resolution through another module's folder
  (`createRequire(bio-plane/package.json)`); reach across package folders.
- **(e)** Not determinable from main: T53's jobs and held merges, whether its 2,030 commits change any
  reference or `build/modules.json`, its own rulings and job files, whether its stop was this kind of
  failure; the architecture check (`checks/architecture.mjs`) is not in the copy. `main`'s history is
  shallow (boundary `10344253`, 26 Oct).

## 3. The settings file (item 2)

- The session's `main` ref (`0dea5a6e`) holds the file as neoProcess's removal left it (commit
  `4e428915`, 1 Nov): a 17-line deny list and a `hooks` part. The session reports that its own branch,
  which the harness makes from the repository's newest `main`, differs from that ref only in `CLAUDE.md`
  and `.claude/settings.json`, through `cc2c389f` "Update permissions and remove hooks in settings.json"
  and `16de7665` "Fix JSON formatting in settings.json". **Inference:** the session's `main` ref was
  stale; those two commits are the owner's landing and his fix, so his fixed file was **not** read back.
  Item 12's findings stand for the newest main, since only those two files differ.
- **The recovered `hooks` part** (newest version with one: `4e428915`, `git show
  4e428915:.claude/settings.json`), exactly:

```json
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\""
          }
        ]
      }
    ]
  }
```

- Its parent `60949c25` had six "hooks" entries, neoProcess's, calling `/home/user/neoprocess`; removed
  on 1 Nov with the old process, not wanted. Not read: whether `.claude/hooks/session-start.sh` is still
  on main and is the Node 26 start-up.

## 4. What the lane takes from it

1. Item 12 is sorted for civicsmith's ARCH in `../later-module-tests.md`; the set-up session writes it
   into `process/waiting-for-arch.md` (setup-session-brief step 4).
2. The `hooks` part above goes into the set-up brief's step 6; the set-up session checks that the script
   it names exists before placing it, and reads back the owner's fixed file then.
