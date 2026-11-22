# The brief for civicsmith's set-up session (act 8): draft

Length: 82 lines. Last section: "4. What it reports when it ends".

Written by PROCESS civicsmith lane #1, 22 Nov 2026, on PROCESS #6's instruction. **Draft:** the process
config's last fields wait on the second reading (`reading-brief-2-tokens.md`). It is the brief design part 7
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
   working tree. Record that commit; it is `process.commit` below.
2. **Check the deny list.** Compare the `permissions.deny` list in `.claude/settings.json` on `main` with
   `shims/claude-settings.json` in that copy. Report "same" or each difference. Do not edit the file; its
   `hooks` part (Node 26 start-up) is the owner's and stays.
3. **Branch.** Make a working branch from `main`'s newest commit (e.g. `work/process4-first-files`).
4. **Write the first Process4 files** (build text 2), in one pull request into `main`:
   - **`process.json`** (build text 2 §7): `process` = { repository `neobobkrause/process4`, version, the
     40-character commit from step 1 }; `tranche_branch` "p4-tranche"; `node` "26.10.0"; `lock_files` the
     nine package lock files; `test_command` one command that runs a list of test files across the
     packages, with bio-plane's preload of `test/platform-sqlite.mjs` inside it (draft: built on the
     existing `node .github/scripts/module-tests.mjs`, given a form that takes a list of files);
     `slots` the default; `lanes` [ux]; `hosting` { provider "cloudflare", the development account's id,
     never a token }; `walks_folder`, `walk`, `deploy` from the product's own commands **(wait on the
     second reading)**; `process_folder` "process/"; `language_reader` the default with `source` covering
     `**/*.mjs`.
   - **The module list** (build text 2 §3), converted from `build/modules.json`, changing no code:
     `process/modules/order.txt` with the 178 names in the same order; one `process/modules/<name>.json`
     each, with exactly `name`, `files` (from `paths`), `tests`, `public` (the module's interface files),
     `uses`. Add the three undeclared uses found by the first reading: `pdf-worker` uses `pdf-pixels` and
     `image-codecs`; `installer` uses `runtime-limits`. Every tracked file gets exactly one owning module,
     including `build/`, `docs/`, `release/`, the generated `bio-plane/src/setup-words/rows.mjs`, the
     bundles, each `package.json` and each `wrangler.jsonc`. Check that every name in `uses` stands
     earlier in the order file; report any that does not, without reordering by judgment.
     **No module's tests may reach a later module.** The second reading's item 12 lists every test
     reference to a module at the same or a later position, of every kind, and the cycles they make; ARCH
     decides each (the lane sorts them into four kinds: test belongs in a later module; shared helper
     belongs in an earlier module's public files; wrong boundary; order can change). This session
     converts the list as ARCH's decisions give it, and where a finding is not yet decided it reports it
     and does not guess. **Wait on that** before writing the module list.
   - **The required-run workflow:** `.github/workflows/module-tests.yml`, copied from Process4's
     `shims/module-tests.yml` unchanged. Leave the product's four own workflows as they are.
   - **The owner's decision record:** `process/decisions-owner.md` with the entry of section 2.
   - Requirements files, the ranking page and the walks' documents are not this session's: ARCH and the
     UX lane write them once ROOT has started (conversion plan §4).
5. **Open the pull request, mark it ready, read its result.** The required run `module-tests` reports on
   it for the first time. For a pull request into `main` its scope is "nothing", so it passes at once
   (build text 1 §5). Then **merge it**.
6. **Make `p4-tranche`** from `main`'s newest commit, the merge of step 5, also where `main` holds the
   earlier processes' history.
7. **Stop.** Do not start ROOT; the owner does (act 9).

## 4. What it reports when it ends

To the onboarding lane by message (session `session_018BhceckLEcDGQG4yqJtMVH`), or through the owner if a
message is refused:
- the deny-list check of step 2;
- the pull request's number, its `module-tests` result and the merge commit;
- `p4-tranche`'s commit;
- any `uses` that does not stand earlier in the order, and any file it could not give an owner.
The lane then puts act 10, the merge rule on `main` and `p4-tranche` requiring `module-tests`, on the
owner's page: the check has now reported once, so GitHub can offer it.
