# civicsmith's tokens: the whole list of permissions (final)

Length: 95 lines. Last section: "5. What is not verified".

Written by PROCESS civicsmith lane #1, 22 Nov 2026, and made final by lane #2 the same day from the second
reading (`research/civicsmith-copy-reading-2.md`) and Cloudflare's own public documentation, on PROCESS #6's
instruction carrying the owner's decision of 22 Nov 2026: "The token created for the product being onboarded
should be the token with all the permissions that will be needed across all stages of process4 driven
development across that product's entire lifecycle. Anything short of those privileges will require me to
unnecessarily create yet another token." (design part 1 §3; part 9 §1). The owner's page carries it as
Action 7. Grounds: `research/cloudflare-token-permissions.md`, and section 5 below.

## 1. Which services, and which token for each

| Service | Token | Why |
|---|---|---|
| Cloudflare | **One API token, the development account only** (`20b533579290b9b93168345edd3b7f72`) | Development copies (deploy, seed, reset, remove) and the walks. All ten Workers pin this account. The rehearsal of a fresh install is a test copy on the same account (K5258, `build/GRANTS.md:45`); `CS_TEST_CF_*` are read by no code |
| Cloudflare R2, S3-compatible keys | **None** | No script uses R2's S3 interface (second reading) |
| GitHub | **None.** The owner's decision of 22 Nov 2026: "Decision: ... But a Github token needn't be created if sessions act through Claude's GitHub connection." | Sessions act through Claude's GitHub connection |
| An AI provider | **None in the environment** | Anthropic only; the key reaches the product per call from its sealed credentials store (group, member or project) |

The release signing keys stay in the sessions' environment (the owner's decision of 22 Nov 2026, as PROCESS #6
relayed it) and are not part of this list. With PROCESS, not settled here: the Docker Hub credential the
`container-images` workflow holds as repository secrets, against act 3's "no repository secrets"; and that the
install and update run before a release is the owner's own sign-in, since the installer takes no API token
(OAuth only, `newgroup/src/index.mjs`).

## 2. The Cloudflare token's permissions

Dashboard names ("Edit" in the dashboard is "Write" in the API). Every row is limited to the development
account. No zone rows: no Worker has routes, custom domains or zones; all run on `*.workers.dev`.

| Permission | What civicsmith uses it for | Verified |
|---|---|---|
| Account · Workers Scripts · Edit | Upload, settings, schedules, secrets, delete; Durable Objects; workers.dev; service bindings | Yes |
| Account · Workers R2 Storage · Edit | Buckets `bio-captures`, `bio-published`; remove deletes objects and buckets | Yes |
| Account · Containers · Edit | agent-runner and file-scanner containers; `wrangler containers push`; REST containers/applications | Name yes; need not stated |
| Account · Cloudchamber · Edit | Containers' underlying deployments | Name yes; need not stated |
| Account · Browser Run · Edit | bio-plane's `BROWSER` binding (Browser Rendering, renamed Browser Run) | REST use yes; deploy need not stated; not on the permissions list |
| Account · Email Routing Addresses · Edit | stewards' `send_email` binding NOTIFY: verified destination addresses | Name yes; deploy need not stated |
| Account · Email Sending · Edit | The same, where sending is set up by the newer Email Service | Named in its docs, not on the permissions list |
| Account · Connectivity Directory · Admin | file-scanner's optional Workers VPC binding SECURITY_VPC (Admin creates VPC services; Bind only binds them) | Names yes; that it is the installer's `connectivity-directory.bind` scope, not stated |
| Account · Workers Observability · Edit | Reading the copies' logs (the telemetry query accepts only Write) | Yes; that it is the installer's `account-logs.read` scope, not stated |
| Account · Workers Tail · Read | `wrangler tail` | Yes |
| Account · Account Settings · Read | Wrangler's account checks | Yes |
| Account · Workers KV Storage · Edit | Unused today; kept under the owner's rule | Yes |
| Account · D1 · Edit | Unused today; kept under the owner's rule | Yes |
| Account · Queues · Edit | Unused today; kept under the owner's rule | Yes |
| Account · Workers AI · Edit | Unused today; kept under the owner's rule | Yes |
| User · User Details · Read | Wrangler's identity check | Yes |
| User · Memberships · Read | Wrangler's account listing | Yes |

**Expiry:** none, or the longest the owner chooses; renewal carries the same permissions (part 1 §3).
**Client IP filtering:** none (the sessions' machines have no fixed address).

## 3. The two routes

PROCESS settled (22 Nov 2026) that the sessions' environment already holds a Cloudflare token, as `CF_TOKEN`
and `CLOUDFLARE_API_TOKEN`. So:

- **Route A, first.** The owner opens Cloudflare's API Tokens page, finds the token in use, compares its
  permissions with section 2, adds what is missing with the token's Edit, and saves. If its value does not
  change, nothing is re-entered. He never chooses Roll, which makes a new value.
- **Route B, only if he cannot tell which token is in use.** He makes a new token with section 2's rows,
  and enters its value in the BioDefault environment's variables, replacing `CF_TOKEN` and
  `CLOUDFLARE_API_TOKEN`, with `CF_ACCT` the development account.

## 4. Where the values go

The scripts read environment variables: `deploy.mjs` reads `CF_TOKEN` and `CF_ACCT`; `deploy-fleet.mjs`
reads `CF_TOKEN` or `CLOUDFLARE_API_TOKEN`; wrangler reads `CLOUDFLARE_API_TOKEN`. So the token's value is in
the BioDefault environment's variables under both names, never in a repository. `CF_ACCT` is the
development account's id, which is not a secret.

## 5. What is not verified

From Cloudflare's own pages, read 22 Nov 2026 by a worker of this lane (no token, no API call, no login):

- **Editing keeps the value: not verified, very likely.** The create-token page says "You can also edit a
  token after creation" (https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).
  "Update Token" (`PUT /user/tokens/{token_id}`) returns no value, and its `token_prefix` field is "only
  present for tokens created or rolled after this field was added"
  (https://developers.cloudflare.com/api/resources/user/subresources/tokens/methods/update/). Rolling is
  the act that makes a new secret: "roll your token to generate a new secret … will invalidate the previous
  token" (https://developers.cloudflare.com/fundamentals/api/how-to/roll-token/). No page says in words
  that an edit keeps the value; the page's Route A step 8 covers a changed value.
- Dashboard labels verified in the docs: "three dot icon", "Roll", "Confirm", "Create Token", "Continue to
  summary", "Back". Not printed in any doc: an "Edit" menu item and the button that saves an edit.
- No page says which permission deploying a Worker with Containers, a `browser` binding, a `send_email`
  binding or a Workers VPC binding needs beyond Workers Scripts. Those rows are kept under the owner's rule.
- Workers VPC: "`Connectivity Directory Bind` to list, read, and bind VPC Services in Workers";
  "`Connectivity Directory Admin` to create, update, and delete VPC Services"
  (https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/). Not on the permissions list.
- Logs: the telemetry query accepts only "Workers Observability Write"
  (https://developers.cloudflare.com/api/resources/workers/subresources/observability/subresources/telemetry/methods/query/).
