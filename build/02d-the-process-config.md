Length: 41 lines. Last section: "7. The process config".

# Process4 build text 2d: the process config

Section 7 of build text 2. Its other sections: 1 to 4, 8 and 9 in `02-`; 5 and 6 in `02b-`; 10 in `02c-`. **Status: proposed. The tool reads this form, but nothing here has run in a process in force.**

Marks and examples: as build text 2.

## 7. The process config

Place: `process.json`. ARCH writes it; it changes as the process's named files do (part 2, section 9).

```json
{
  "process": { "repository": "https://github.com/<owner>/<process repository>", "version": "4.0.0", "commit": "9f2c…(40 characters)" },
  "tranche_branch": "tranche",
  "node": "22",
  "test_command": "node --test",
  "slots": { "default": 8, "share": 8 },
  "lanes": [ { "name": "ux", "folder": "lanes/ux/" } ],
  "hosting": { "provider": "cloudflare", "development_account": "<the account's id>" },
  "walks_folder": "lanes/ux/walks/",
  "walk": { "build_and_serve": "npm run serve-local", "run_steps": "npm run walk --", "most_external_walkers": 1 },
  "deploy": { "deploy": "npm run dev-deploy --", "seed": "npm run dev-seed --", "remove": "npm run dev-remove --" },
  "process_folder": "process/",
  "language_reader": { "name": "typescript", "version": "5.6.3", "source": ["**/*.mjs"], "exclude": ["**/vendor/**"] }
}
```

- `process`: the one fixed version of the process the tranche runs on: the process repository's address, the version's name, and its full commit id on that repository's main branch. Each session, and the required run, fetches a copy of exactly that commit (build text 1, section 2). A move to another version (the design, part 6, section 7) is a change to this field by one pull request; `latest-version` gives the newest commit (build text 1b, command 25). Where the new version's `shims/module-tests.yml` differs from the product's copy, the copy is replaced by a second pull request merged after the first, because the required run judges each pull request with the tool at the version its base names.
- `tranche_branch`: the name of the one lasting tranche branch, which pull requests go into. The process's repository has no tranche branch: its own `process.json` names `main` here.
- `node`: the product's Node version, which the required run sets up. A config that holds `lock_files` is read without fault; nothing uses it, since the required run installs none of the product's dependencies (build text 1, section 5).
- `test_command`: the command the tool runs over a list of a module's test files. **Decided here:** one command for the product, kept here and not in each entry.
- `slots.default`: the account's slot number when the owner has given none. `slots.share`: this product's share of it (part 2, section 5); with one product the two are equal. A number the owner gives later is held in the standing notes, not here.
- `lanes`: each lane's name and its folder. The UX lane is always there.
- `hosting`: the provider's name and the development account. The account's id is not a secret. The deploy token is, and is never written here.
- `walks_folder`: where the Screens document and the journeys are kept.
- `walk`: the command that builds and serves the product on one machine; the command that runs named steps against an address; and the most external walkers, which begins at one (build text 3, sections 4 and 5).
- `deploy`: the product's own commands that deploy, seed and remove a development copy, each run with a copy's name by ARCH's session (build text 3, section 5).
- `process_folder`: where the files of sections 3, 4 and 8 are kept.
- `language_reader`: the reader's name, its exact version, which files are the product's code (`source`), and, optionally, which of them it leaves out (`exclude`, patterns of the same form), such as vendored copies and committed built bundles. A file left out belongs to no module: the reader neither checks nor lists it, and an import of it is an import from outside the product. Without `exclude` nothing is left out. **Decided here:** the version is fixed in the config.
