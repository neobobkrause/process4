# A second reading brief for civicsmith-copy: what its development needs from each service

Length: 59 lines. Last section: "What to send back".

Written by PROCESS civicsmith lane #1, 22 Nov 2026, for the owner's rule of 22 Nov 2026 that each token he
makes for a product carries every permission its development under Process4 will ever need (design part 1
§3; part 9 §1). The first reading (`research/civicsmith-copy-reading.md`) did not cover what each Worker
binds, nor how releases are published and installed. The owner may give this prompt to a plain session he
starts on `neobobkrause/civicsmith-copy`. It changes nothing and uses no token or secret.

## The prompt (paste as is)

> Read only. Change no file, branch, setting or session; push nothing; write nothing inside the repository
> (any script you write lives outside it). Use no token, secret or environment variable to reach Cloudflare
> or any other service. Items 1 to 9: read the repository's files only. Item 10 alone may use this
> session's own GitHub connection, for reads of this repository only. Report, in plain words, for the Process4
> civicsmith onboarding lane, each fact with its file path, and "not found" where a fact is not in the files.
>
> 1. **Bindings.** For each of the ten `wrangler.jsonc` files (and any other wrangler or Cloudflare config):
>    the Worker's name; every binding by kind — Durable Objects (class names, migrations), R2 buckets, KV
>    namespaces, D1 databases, Queues, Workers AI, Browser Rendering, Vectorize, Hyperdrive, service bindings,
>    Containers, Analytics Engine, Email, any other; cron triggers; routes, custom domains, zones, or
>    `workers_dev`; compatibility flags; and the names of secrets it expects (names only, never values).
> 2. **Deploy commands.** What `bio-plane/scripts/deploy.mjs`, `deploy-fleet.mjs`, `derive-bindings.mjs`,
>    `bundles.mjs` and `release-assemble.mjs` call: wrangler commands, Cloudflare REST endpoints (paths),
>    S3-compatible R2 calls, and which environment variable names they read for credentials (names only).
> 3. **Seed, reset and remove.** Any scripts or documented steps that seed a deployment with data, reset it,
>    or remove it; what they call.
> 4. **Containers.** What the `container-images` workflow builds and where it pushes images (registry
>    host, image names); whether any Worker uses Cloudflare Containers; which workers (pdf-worker,
>    ocr-worker, sheet-worker, agent-worker, file-scanner) run where.
> 5. **AI services.** Which AI providers the product calls (Workers AI, Anthropic, OpenAI, other), from
>    which Worker, and the secret names they read. What `docs/` or `bio-plane/INSTALLER.md` say an operator
>    must provide for AI features.
> 6. **Releases.** Where a published release is placed so that installs and the updater find it (GitHub
>    Releases, an R2 bucket, a URL), who signs it and with what (`release-sign` workflow: the key's secret
>    name only), and what `release/RELEASE.json` points to.
> 7. **Install and update test.** How the new-team rehearsal works (`CS_TEST_CF_ACCOUNT_ID`): which
>    account, which credentials (names only), and whether the installer can run with an API token instead
>    of its OAuth sign-in. What "Workers Paid" and other account plans or products the installer requires.
> 8. **Other services.** Any service outside Cloudflare and GitHub the product's build, tests, walks or
>    deployments call (email, maps, payment, storage, package registries beyond npm), with the secret
>    names they read.
> 9. **GitHub.** Any GitHub token, App or secret the product's own workflows or scripts use, by name, and
>    what each is used for.
> 10. **The repository's settings, as this session can see them.** With this session's own GitHub
>    connection, read only (GET), on this repository only, report what you find, and say plainly where a
>    read is refused or shows nothing: the merge options (merge commits, squash, rebase, auto-merge,
>    automatic deletion of head branches) and the default branch; every ruleset and its rules, targets,
>    enforcement and bypass list, and any classic branch protection; the Actions workflow permissions
>    (the default token's permission, and whether Actions may create and approve pull requests); and
>    the names of any repository secrets that remain (names only, never values). Change nothing.
> 11. **The approvals files as they now stand.** Give the whole text, exactly, of `CLAUDE.md` and of
>    `.claude/settings.json` on `main` (they hold no secret), from the repository's files.

## What to send back

The report goes to the lane by message to session_018BhceckLEcDGQG4yqJtMVH if the session's approvals
allow it; otherwise the session shows it to the owner, who passes it on. Each line names its source path.
