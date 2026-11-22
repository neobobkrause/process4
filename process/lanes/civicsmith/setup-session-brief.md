# The brief for civicsmith's set-up session (act 8): draft

Length: 120 lines. Last section: "4. What it reports when it ends".

Written by PROCESS civicsmith lane #1, 22 Nov 2026, on PROCESS #6's instruction; the process config's fields
filled from the second reading (`research/civicsmith-copy-reading-2.md`) by lane #2, 22 Nov 2026. **Draft**
until the third reading's report (item 12, and the earlier settings file) is in. It is the brief design part 7
§4 act 8 names, for a plain session the owner starts on `neobobkrause/civicsmith-copy`, branch `main`.
Grounds: `conversion-plan.md` §§3–4; build text 2 §§3, 4, 7; build text 1 §5; `research/civicsmith-copy-reading.md`.

## 1. What has changed from act 8 as written

The owner has already landed civicsmith-copy's approvals (`CLAUDE.md`) and `.claude/settings.json` himself,
on 22 Nov 2026 (his word to PROCESS), from PROCESS's draft
(`process/research/approvals-draft-civicsmith-copy-21nov.md`). So this session neither drafts nor places
them. It checks the deny list he landed against Process4's (step 2) and reports any difference; it never
edits either file.

## 2. The owner's decisions it carries into the product's record

The coordinator keeps the product's record of the owner's decisions (design part 1 §4; part 5 §5); PROCESS's
record holds only decisions about the design. This session writes the first entry of civicsmith's record,
`process/decisions-owner.md`, in the same pull request as the first files, with his words exactly as typed:

> "With regard to The paused tranche T53, decision: Start from main as it is. T53 stays where it is as
> history, and anything worth keeping comes back as Process4 work." — 22 November 2026

(Relayed by PROCESS #6 from the owner's session. The coordinator, once started, is its writer.)

## 3. The steps, in order

1. **Fetch** the read-only copy of Process4 at its newest `main` commit, into a folder outside the
   working tree, and confirm it with the tool's `latest-version`. Record that commit; it is
   `process.commit` below. It must be at or after `f4e3596`, so civicsmith starts on a version whose
   `check` refuses a declared use of a later module (the owner's decision of 22 Nov 2026, "decision:
   option B, as recommended"; design part 2 §§1, 6).
2. **Check the deny list.** Compare the `permissions.deny` list in `.claude/settings.json` on `main` with
   `shims/claude-settings.json` in that copy. Report "same" or each difference. Do not change the deny
   list. The file as the owner landed it has no `hooks` part: the Node 26 start-up hook was lost when the
   file was replaced (second reading, item 11). Step 6 puts it back.
3. **Branch.** Make a working branch from `main`'s newest commit (e.g. `work/process4-first-files`).
4. **Write the first Process4 files** (build text 2), in one pull request into `main`:
   - **`process.json`** (build text 2 §7): `process` = { repository `neobobkrause/process4`, version, the
     40-character commit from step 1 }; `tranche_branch` "p4-tranche"; `node` "26.10.0"; `lock_files` the
     nine package lock files; `test_command` one command that runs a list of test files across the
     packages, with bio-plane's preload of `test/platform-sqlite.mjs` inside it (draft: built on the
     existing `node .github/scripts/module-tests.mjs`, given a form that takes a list of files);
     `slots` the default; `lanes` [ { "name": "ux", "folder": "process/lanes/ux/" } ]; `hosting`
     { "provider": "cloudflare", "development_account": "20b533579290b9b93168345edd3b7f72" } (all ten
     `wrangler.jsonc` pin it; never a token); `walks_folder` "process/lanes/ux/walks/" (the UX lane turns
     `docs/development/ux-substrate/` into the Screens document and the journeys there); `process_folder`
     "process/"; `language_reader` the default with `source` covering `**/*.mjs`.
     `walk` and `deploy` come from the product's own commands, as the second reading found them. Each
     must be a command that takes a development copy's name (build text 2 §7; build text 3 §5). Confirm
     each form from the files; where the product has no single command that takes a copy's name, write
     the nearest existing one and list the gap in `process/waiting-for-arch.md`, writing no new script:
     - `walk.build_and_serve`: bio-plane's `npm run dev` (`wrangler dev`), built first with its esbuild
       build step;
     - `walk.run_steps`: the `bio-plane/src/journey-check/` module's runner (the real-product walks;
       `screens/check_walk.mjs` walks only the mockups); `walk.most_external_walkers` 1;
     - `deploy.deploy`: `node bio-plane/scripts/deploy.mjs` for the plane (REST; reads `CF_TOKEN`,
       `CF_ACCT`), then `node bio-plane/scripts/deploy-fleet.mjs` for the container workers (reads
       `CF_TOKEN` or `CLOUDFLARE_API_TOKEN`; needs Docker) and `wrangler deploy` for site, newgroup and
       stewards;
     - `deploy.seed`: the plane's admin operations `instancegroupseed`, `officesseed`, `seatsseed`;
     - `deploy.remove`: no current script; the installer's remove mode and the archived `wipe-0.85.0.mjs`
       delete scripts, container applications, R2 objects and buckets by REST. Record this gap.
   - **The module list** (build text 2 §3), converted from `build/modules.json`, changing no code:
     `process/modules/order.txt` with the 178 names in the same order; one `process/modules/<name>.json`
     each, with exactly `name`, `files` (from `paths`), `tests`, `public` (the module's interface files),
     `uses`. Add the three undeclared uses found by the first reading: `pdf-worker` uses `pdf-pixels` and
     `image-codecs`; `installer` uses `runtime-limits`. Every tracked file gets exactly one owning module,
     including `build/`, `docs/`, `release/`, the generated `bio-plane/src/setup-words/rows.mjs`, the
     bundles, each `package.json` and each `wrangler.jsonc`. Check that every name in `uses` stands
     earlier in the order file; report any that does not, without reordering by judgment.
     **Tests that reach a later module.** ARCH does not exist until ROOT starts, and ROOT needs this list
     on the tranche branch (part 7 §4, acts 8 and 9). So this session converts the list as it stands on
     main, in order, reshaping nothing and changing nothing in the product. For each test reference to a
     later module the second reading found (its item 12), it writes one line into
     `process/waiting-for-arch.md`: the module, the test file and line, the module reached, and the kind
     the lane sorted it into (test belongs in the later module; shared helper belongs in an earlier
     module's public files; wrong boundary, part 2 §8; order can change). It names the same lines in its
     report. ARCH, once started, corrects the list or places the work before any job opens on those
     modules. Known, not a fault: when the list is converted as it stands, any entry whose `uses` names a
     later module is refused by `check` at that module's first job; that is the intended signal to ARCH.
     `check` sees only imports by file path inside the product; an import by package name across
     civicsmith's npm packages, a started process or a file read is outside it, so item 12 of the
     reading is the only finder of those. Also known: the required run passes this pull request whatever the references,
     because a pull request into `main` runs no module's tests (`tool/lib/scope.mjs:28`; build text 1 §5).
   - **The required-run workflow:** `.github/workflows/module-tests.yml`, copied from Process4's
     `shims/module-tests.yml` unchanged. Leave the product's four own workflows as they are.
   - **The owner's decision record:** `process/decisions-owner.md` with the entry of section 2.
   - Requirements files, the ranking page and the walks' documents are not this session's: ARCH and the
     UX lane write them once ROOT has started (conversion plan §4).
5. **Open the pull request, mark it ready, read its result.** The required run `module-tests` reports on
   it for the first time. For a pull request into `main` its scope is "nothing", so it passes at once
   (build text 1 §5). Then **merge it**.
6. **Put the start-up hook back.** After the third reading, the lane gives this session the recovered
   `hooks` part of `.claude/settings.json` (the third reading's item 2 prints the file as it stood before
   it was replaced). Make a second working branch from `main`'s newest commit, place that `hooks` part
   back into `.claude/settings.json` unchanged beside the deny list, and open a pull request that changes
   only that file. civicsmith-copy's approvals allow a session to place it; **never merge it.** The owner
   reads the changed file on the pull request's page and lands it by clicking Merge there. Give him the
   pull request's full address. If the lane has not yet sent the hooks part, skip this step and say so.
7. **Make `p4-tranche`** from `main`'s newest commit, the merge of step 5, also where `main` holds the
   earlier processes' history.
8. **Stop.** Do not start ROOT; the owner does (act 9).

## 4. What it reports when it ends

To the onboarding lane by message (session `session_018BhceeTQKM67dJhV5dBPyh`, the lane's session when
this brief was last written; the owner's page names the current one), or through the owner if a message is
refused:
- the deny-list check of step 2;
- the pull request's number, its `module-tests` result and the merge commit;
- the start-up hook's pull request address, or that step 6 was skipped;
- `p4-tranche`'s commit;
- any `uses` that does not stand earlier in the order, and any file it could not give an owner.
The lane then puts act 10, the merge rule on `main` and `p4-tranche` requiring `module-tests`, on the
owner's page: the check has now reported once, so GitHub can offer it.
