# civicsmith-copy: the second reading (22 Nov 2026)

Length: 71 lines. Last section: "4. What the lane takes from it".

Source: the report sent by message to the lane on 22 Nov 2026 by the read-only session
session_018BhceeSpqddJ1PpU6i6hDj, on `neobobkrause/civicsmith-copy` at main `cc2c389f`, from
`reading-brief-2-tokens.md` items 1–11 (item 12 is **not** in the report: the session's prompt was given
before item 12 was added). Items 1–9 from files only; item 10 by the session's own GitHub connection, GETs
of this repository only; nothing changed. Shortened here; file paths are the report's.

## 1. Cloudflare: what the ten Workers use (items 1–4, 7)

- All ten pin the development account `20b533579290b9b93168345edd3b7f72`; none has routes, custom domains
  or zones; all on `*.workers.dev`. Binding kinds found **nowhere**: KV, D1, Queues, Workers AI,
  Vectorize, Hyperdrive, Analytics Engine.
- Used: Workers scripts (10), Durable Objects (bio-plane STORE; agent-worker REMOTE cross-script, SEGMENTS,
  CHECKS; agent-runner; file-scanner SCANNER, RENDERER; stewards STORE), R2 buckets `bio-captures` and
  `bio-published`, service bindings, **Browser Rendering** (bio-plane `BROWSER`), **Containers**
  (agent-runner 1 class, file-scanner 2 classes; images pushed by `wrangler containers push` to
  registry.cloudflare.com), **Email** (`send_email` binding NOTIFY in stewards), cron triggers (bio-plane,
  file-scanner, stewards), Worker secrets, optional **Workers VPC** binding SECURITY_VPC (file-scanner;
  added by the installer), observability/logs.
- Deploy: `bio-plane/scripts/deploy.mjs` (REST only: workers subdomain, scripts settings, schedules,
  script upload with keep_bindings) reads `CF_TOKEN`, `CF_ACCT`; `deploy-fleet.mjs` (docker pull/tag,
  `wrangler containers push`, `wrangler deploy`; REST containers/applications) reads `CF_TOKEN` or
  `CLOUDFLARE_API_TOKEN`; site, newgroup, stewards deploy with `wrangler deploy` (stewards also
  `wrangler secret list`). **No S3-compatible R2 use anywhere.**
- Seed: plane admin ops (instancegroupseed, officesseed, seatsseed). Reset: plane op `purge`; a fresh
  store by `deploy.mjs --store-generation N`. Remove: REST DELETE of scripts (`?force=true`), container
  applications, R2 objects and buckets (archived `wipe-0.85.0.mjs`; the installer's remove mode).
- The installer (newgroup) accepts **no API token**: OAuth only (`newgroup/src/index.mjs`), six scopes:
  workers-scripts.write, workers-r2.write, account-settings.read, containers.write,
  connectivity-directory.bind, account-logs.read. It requires Workers Paid and R2. K5258/`GRANTS.md:45`:
  the owner's rehearsal is a fresh test copy on the development account; his own fresh install through
  Cloudflare's consent screen is his walk. `CS_TEST_CF_*` are read by no code.

## 2. AI, other services, releases, GitHub (items 5, 6, 8, 9)

- AI: Anthropic only. The key is not an environment secret; it arrives per call from the plane's sealed
  credentials store (group, member or project). Claude subscription sign-in path disabled in code.
- Other services needing a credential: **Docker Hub** (`container-images` workflow pushes to
  `docker.io/civicsmith` with repository secrets DOCKERHUB_USERNAME / DOCKERHUB_TOKEN). Others keyless or
  per-group (CourtListener, security tools) entered by a group's admin.
- Releases: committed files in `release/`, read over raw GitHub at `believeinoakland/bio` (a move to
  `civicsmith/civicsmith` is recorded as owed, `build/GRANTS.md`). No GitHub Release object or tag is used.
  Signing: `release-sign.yml`, GitHub environment "release" (required reviewer Bob), secret BIO_RELEASE_SEED,
  pushes the signed `release/` to a `dist/cut-*` branch.
- Repository secrets the workflows name: CLOUDFLARE_API_TOKEN (deploy-test), DOCKERHUB_USERNAME,
  DOCKERHUB_TOKEN (container-images), BIO_RELEASE_SEED (release-sign, in the "release" environment).

## 3. Settings and approvals (items 10, 11)

- Item 10: the session's tools could not read merge options, rulesets, Actions permissions or secret
  names. Every branch lists `"protected": true` (main, the snapshot branch among them). `p4-tranche` does
  not exist yet; `process.json` is not in the repository (both expected before act 8).
- Item 11: `CLAUDE.md` is the owner's approvals of 21 Nov 2026 (full text in the report).
  **`.claude/settings.json` as committed is not valid JSON**: it starts `"permissions": {` with no
  enclosing `{ }`. Claude Code may ignore it, so the deny list may not be in force. It also carries no
  `hooks` part: the Node 26 start-up hook is no longer registered.

## 4. What the lane takes from it

1. Urgent, the owner's: `.claude/settings.json` must be made valid (and the hook question settled). Only
   he changes it; PROCESS drafts the text.
2. The Cloudflare token: one token, one account (the development account). Permissions: see `tokens.md`.
3. No R2 S3 token. No GitHub token. No AI-provider environment token (keys live in the product's store).
4. Docker Hub: a credential the product's own `container-images` workflow holds as a repository secret,
   which act 3 ("no repository secrets") takes out. Put to PROCESS.
5. The install-and-update run before a release cannot use a token: the installer is OAuth only. It is the
   owner's own sign-in on Cloudflare's consent screen. Put to PROCESS.
6. Item 12 (tests reaching a later module) must still be read: a short third reading.
