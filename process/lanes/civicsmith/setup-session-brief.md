# The brief for civicsmith's set-up session (act 8)

Length: 146 lines. Last section: "4. What it reports when it ends".

Written by PROCESS civicsmith lane #1, 22 Nov 2026, on PROCESS #6's instruction; the process config's fields
filled from the second reading (`research/civicsmith-copy-reading-2.md`) by lane #2, 22 Nov 2026, with the third reading's
results (`research/civicsmith-copy-reading-3.md`). It is the brief design part 7
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

0. **Start at the true tip.** Run `git fetch origin main`, and read and work at `origin/main`'s newest
   commit; say which commit that is. (A cloud session's local `main` can be stale: the third reading's
   was, and read the file from before the owner's fix.) Print `.claude/settings.json` as it stands there,
   whole, and report it. Report plainly if it is not the 25-line file of `shims/claude-settings.json` in
   the copy of step 1.
1. **Fetch** the read-only copy of Process4 at its newest `main` commit, into a folder outside the
   working tree, and confirm it with the tool's `latest-version`. Record that commit; it is
   `process.commit` below. It must be at or after `f4e3596`, so civicsmith starts on a version whose
   `check` refuses a declared use of a later module (the owner's decision of 22 Nov 2026, "decision:
   option B, as recommended"; design part 2 §§1, 6).
2. **Check the deny list.** Compare the `permissions.deny` list in `.claude/settings.json` at that tip with
   `shims/claude-settings.json` in that copy. Report "same" or each difference. Do not change the deny
   list. The file as the owner landed it has no `hooks` part: the Node 26 start-up hook was lost when the
   file was replaced (second reading, item 11). Step 6 puts it back.
3. **Branch.** Make a working branch from `origin/main`'s newest commit (e.g. `work/process4-first-files`).
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
     main, in order, reshaping nothing and changing nothing in the product. It re-homes no test and
     changes no product file. It writes the lane's thirteen groups (`later-module-tests.md` §2, in the
     process copy) into `process/waiting-for-arch.md`, shortened to one line each: the group, the modules
     concerned, and the kind the lane proposed (test belongs in the later module; shared helper belongs in
     an earlier module's public files; wrong boundary, part 2 §8; order can change; or an earlier module
     used but not declared), with a pointer to the full list at
     `https://github.com/neobobkrause/process4/blob/main/process/lanes/civicsmith/later-module-tests.md`.
     It adds this note for ARCH, deciding nothing: "Under Process4 a file belongs to the module whose
     entry lists the longest matching path (build text 2, section 3), so a test file can be given to a
     later module by naming its path in that module's `tests`, with no file moved." It names the same lines in its
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
6. **Put the start-up hook back.** First print `.claude/settings.json` as it stands on `main` (the
   owner's fixed file) and report it. Check that `.claude/hooks/session-start.sh` is on `main`, and say
   what it starts. Then make a second working branch from `main`'s newest commit, add the `hooks` part
   below, recovered by the third reading from commit `4e428915` (`research/civicsmith-copy-reading-3.md`
   §3), beside the deny list, changing nothing else, and open a pull request that changes only that file.
   civicsmith-copy's approvals allow a session to place it; **never merge it.** The owner reads the
   changed file on the pull request's page and lands it by clicking Merge there. Give him the pull
   request's full address. If the script is not on `main`, do not open the pull request; report it.

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
