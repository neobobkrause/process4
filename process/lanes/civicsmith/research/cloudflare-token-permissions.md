Length: 145 lines. Last section: Not verified.

# Cloudflare API token permissions for a Workers + Durable Objects + R2 product

Read 22 Nov 2026 from public Cloudflare docs only; no token used, no API called. Sources:
- [P] https://developers.cloudflare.com/fundamentals/api/reference/permissions/ (the permissions list)
- [C] https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- [T] https://developers.cloudflare.com/fundamentals/api/reference/template/
- [A] https://developers.cloudflare.com/fundamentals/api/get-started/account-owned-tokens/
- [R] https://developers.cloudflare.com/fundamentals/api/how-to/restrict-tokens/
- [V] https://developers.cloudflare.com/fundamentals/api/how-to/create-via-api/
- [API:x] the "Accepted Permissions" box on https://developers.cloudflare.com/api/resources/x/, with `subresources/` and `methods/` dropped from x

## How the names appear in the dashboard and in the API

[P] lists each group twice: once as **Read / Edit**, once as **Read / Write**. Its MoQ table maps "Dashboard permission: MoQ Edit" to "API name: MoQ Write", and [C] step 7 says permissions offer `Edit` (full CRUDL) or `Read`. So the dashboard shows **Edit**; the API reference and [T] show **Write**. Below, each permission is written as the dashboard shows it, as "Scope · Group · Level". [V] says to use permission-group `id`s, because "the permission `name` is cosmetic and subject to change".

## 1. Workers scripts: deploy, delete, Durable Objects, cron, secrets

- **Account · Workers Scripts · Edit**: write access to Workers scripts [P]. Every endpoint below accepts "Workers Scripts Write":
  - upload/update a script, which is what `wrangler deploy` uses, including DO class migrations in the upload: [API:workers/scripts/update]
  - delete a script, used by `wrangler delete`: [API:workers/scripts/delete]
  - cron triggers: [API:workers/scripts/schedules/update]
  - secrets, used by `wrangler secret put`: [API:workers/scripts/secrets/update]
  - list Durable Object namespaces (Write or Read): [API:durable_objects/namespaces/list]
- [P] has no separate "Durable Objects" permission; DO endpoints accept Workers Scripts permissions.

## 2. R2 buckets and objects

**Using wrangler or the Cloudflare REST API:**
- **Account · Workers R2 Storage · Edit** [P]. Bucket create and delete accept "Workers R2 Storage Write" [API:r2/buckets/create], [API:r2/buckets/delete].
- Per https://developers.cloudflare.com/r2/api/tokens/, Write = create/delete/list buckets, edit bucket config, read/write/list objects; Read = list buckets, view config, read/list objects.
- Bucket-level groups exist through the API: "Workers R2 Storage Bucket Item Write/Read" (resource = Bucket), plus "Workers R2 Data Catalog Write/Read" (same page).

**Using the S3-compatible API.** The source is https://developers.cloudflare.com/r2/api/tokens/.
- S3 clients need an **Access Key ID and Secret Access Key**, not the bearer token.
- Dashboard steps: **R2 object storage** → Overview → under **Account Details**, **Manage** next to **API Tokens** → **Create Account API token** or **Create User API token** → choose Permissions → optionally scope to buckets → create.
- The R2 permission choices are **Admin Read & Write**, **Admin Read only**, **Object Read & Write**, and **Object Read only**. The two Object levels can be limited to specific buckets and work only with the S3 API, not the REST API.
- Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. Jurisdictions have their own endpoints: `.eu.`, `.fedramp.`, `.us.`.
- When a token is created through the API, the Access Key ID is the token's `id` and the Secret Access Key is "the SHA-256 hash of the API token `value`". So a general API token that carries R2 permissions can be turned into S3 credentials.

## 3. KV and D1

- **Account · Workers KV Storage · Edit / Read** [P]. Namespace create accepts "Workers KV Storage Write" [API:kv/namespaces/create].
- **Account · D1 · Edit / Read** [P]. Database create accepts "D1 Write" [API:d1/database/create].

## 4. Containers

- Containers exist as a product (https://developers.cloudflare.com/containers/). [P] lists **Account · Containers · Edit / Read** ("write/read access to Containers"). It also lists **Account · Cloudchamber · Edit / Read** ("Cloudchamber deployments").
- Images: when `image` points to a Dockerfile, `wrangler deploy` "will build your container image locally using Docker, then push it to a registry run by Cloudflare" (https://developers.cloudflare.com/containers/platform-details/image-management/). Docker must be running.
- The managed registry is `registry.cloudflare.com/<ACCOUNT_ID>/…`. `wrangler containers push` pushes "to a Cloudflare managed registry, which is automatically integrated with your account". `wrangler containers registries credentials --push/--pull` generates temporary push/pull credentials (https://developers.cloudflare.com/workers/wrangler/commands/containers/).
- No separate registry token is described for wrangler; no page names the permission (see Not verified).

## 5. Queues, Workers AI, Browser Rendering

- **Account · Queues · Edit / Read** [P]. Queue create accepts "Queues Write", "Workers Scripts Write" or "Workers Admin" [API:queues/create].
- **Account · Workers AI · Edit / Read** [P]. Running a model accepts "Workers AI Write" or "Workers AI Read" [API:ai/run].
- Browser Rendering has been renamed **Browser Run**. Its REST API docs say to create a custom token with **"Browser Run - Edit"** (https://developers.cloudflare.com/browser-rendering/rest-api/). The `/content` endpoint accepts "Browser Run Write" [API:browser_rendering/content/create]. No token is needed when it is used through a Worker binding. This permission is **not** on [P].

## 6. Tail, whoami, account and user reads

- **Account · Workers Tail · Read**: "Grants `wrangler tail` read permissions" [P]. Tail create accepts "Workers Tail Read" or "Workers Scripts Write" [API:workers/scripts/tail/create].
- **Account · Account Settings · Read**: "read access to Account resources, account membership, and account level features" [P].
- **User · User Details · Read** [P]. GET /user accepts it [API:user/get].
- **User · Memberships · Read** [P]. GET /memberships accepts it [API:memberships/list]. This one appears as "User Memberships Read" in [T].
- The Workers Builds default token has the same set as the Edit Cloudflare Workers template, minus Workers Tail (https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## 7. workers.dev, routes, custom domains

- workers.dev:
  - Setting the account subdomain accepts "Workers Scripts Write" or "Workers Admin" [API:workers/subdomains/update].
  - Enabling a script on workers.dev accepts "Workers Scripts Write" [API:workers/scripts/subdomain/create].
  - Both are account-level; no zone permission is needed.
- Routes: **Zone · Workers Routes · Edit** [P]. Route create accepts only "Workers Routes Write" [API:workers/routes/create]. The zone must have a proxied DNS record for the hostname (https://developers.cloudflare.com/workers/configuration/routing/routes/). Creating that record needs **Zone · DNS · Edit** [P; [P] prints the name "DNS Write" in both lists].
- Custom Domains: "Cloudflare will create DNS records and issue necessary certificates on your behalf" (https://developers.cloudflare.com/workers/configuration/routing/custom-domains/). The attach endpoint accepts "Workers Scripts Write", "Workers Editor" or "Workers Admin" [API:workers/domains/update]. No zone permission is listed there.

## 8. Creating a custom token in the dashboard

Steps from [C]:
1. Go to https://dash.cloudflare.com/profile/api-tokens/ (**My Profile** > **API Tokens**) for a user token. For an account-owned token, go to **Manage Account** > **API Tokens** ([A] says **Manage account** > **Account API tokens**; https://dash.cloudflare.com/?to=/:account/api-tokens).
2. Select **Create Token**.
3. Name the token.
4. Choose a template or "start from scratch".
5. Create a policy: type *Account*, *User* or *Zone*, then resource rules "such as specific accounts or zones". Under **Account Resources**, "select the specific account to include or exclude from the dropdown menu" (fundamentals SCIM page, in https://developers.cloudflare.com/fundamentals/llms-full.txt).
6. Choose the permissions.
7. Optionally set **Token expiration** and **Client IP Address Filtering**.
8. Select **Continue to summary**. **Back** lets you adjust.
9. Select **Create Token**.
10. "The token secret is **only shown once**." The page also shows a test curl call to `/user/tokens/verify`.

Other facts:
- User tokens start with `cfut_` [C]. Account tokens start with `cfat_` [A].
- [R] Client IP filtering: "Is in" / "Is not in" CIDR rules (not applied to Verify Token).
- [R] TTL: start (`notBefore`) and end (`notAfter`) dates, 00:00 UTC; no expiry by default.
- [A] Account-owned tokens act as service principals and do not break when a user leaves. Creating one needs "API Token Provisioning" or Super Administrator. They can only grant a subset of the creator's own permissions. Workers, Workers KV, Workers Queues, Workers AI, Workers Observability, R2, D1, Durable Objects and Browser Run are all listed ✅.
- **"Edit Cloudflare Workers" template** [T] contains:
  - Zone: Workers Routes Write
  - Account: Workers Scripts Write, Workers KV Storage Write, Workers Tail Read, Workers R2 Storage Write, Account Settings Read
  - User: User Details Read, User Memberships Read
- The GitHub Actions guide says: Account API tokens page → **Create Token** → under **Permission policies**, open the **Custom** dropdown, select **Edit Cloudflare Workers**, then scope it to the deploying account (https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
- The template lacks D1, Queues, Containers, Workers AI, Browser Run and DNS.

## 9. Two accounts in one token

[V]: "Each token can contain multiple policies." A single account is `"com.cloudflare.api.account.<ACCOUNT_ID>": "*"`, and a `resources` object can hold several keys; the zone example on [V] lists two zones in one policy. So one token can name two specific accounts, either as two resource keys or as two policies. When a token reaches more than one account, wrangler needs `CLOUDFLARE_ACCOUNT_ID` or `account_id` to pick one (https://developers.cloudflare.com/workers/wrangler/system-environment-variables/). This is an inference.

## 10. OAuth into a target account

- Cloudflare runs a public OAuth 2.0 provider. It supports only the Authorization Code flow.
- Creating an OAuth client: **Manage Account** > **OAuth clients** > **Create client**. This needs the Super Administrator, Administrator or "OAuth Client Write" role. Through the API, it needs a token with "`OAuth Clients Write`" (https://developers.cloudflare.com/fundamentals/oauth/create-an-oauth-client/). The create endpoint accepts "OAuth Client Write" [API:iam/oauth_clients/create].
- "OAuth scope names correspond to Cloudflare API token permission names."
- The consent screen lets the user pick the account(s) and decline optional scopes, then select **Authorize** (https://developers.cloudflare.com/fundamentals/oauth/authorizing-an-application/).
- Admins can block new grants: **Manage Account > Members > Settings > Public OAuth App access**.
- No token permission approves an OAuth grant on a user's behalf. A grant needs a person at the consent screen.
- A token from the target account carrying the same permissions can do the same API work as the OAuth grant. That is an inference from "scope names correspond", not a stated equivalence.
- `wrangler login` is itself OAuth (`--scopes`; https://developers.cloudflare.com/workers/wrangler/commands/general/).

## Suggested minimum for the product (inference from the above)

- Account (Include → the specific account or accounts):
  - Workers Scripts · Edit
  - Workers R2 Storage · Edit
  - Workers Tail · Read
  - Account Settings · Read
  - Workers KV Storage · Edit and D1 · Edit, if used
  - Queues · Edit, Workers AI · Edit (or Read), Browser Run · Edit, if used
  - Containers · Edit, if used
- User:
  - User Details · Read
  - Memberships · Read
- Zone (Include → the specific zone), only if routes or custom domains are used:
  - Workers Routes · Edit
  - DNS · Edit, if the token creates records

## Not verified

- The dashboard itself was not seen (login needed). "Create Custom Token" and "Get started" appear on no page I opened; [C] says only **Create Token** and "start from scratch".
- Whether each dashboard row reads "Edit" or "Write" was inferred from [P]'s two lists, the MoQ table and [C] step 7. For DNS, [P] prints "DNS Write" in both lists, so the dashboard label "DNS · Edit" is unconfirmed.
- No page says which permission `wrangler deploy` with Containers needs, or which permission pushes to registry.cloudflare.com: Containers Edit, Cloudchamber Edit, or Workers Scripts Edit alone. Unconfirmed.
- "Browser Run · Edit" is not on [P]. Its exact group and level in the dashboard are taken only from the Browser Run docs' "Browser Run - Edit".
- I found no "Workers Observability" permission on [P], and no page saying which permission Workers Logs or Observability queries need.
- Whether Custom Domains need a zone permission in addition to Workers Scripts Edit is unconfirmed. The API page lists only account Workers permissions.
- Whether the dashboard's "Include → Specific account" accepts two accounts in one row, rather than needing two rows or policies, is unconfirmed. Only the API form was confirmed.
- That `wrangler whoami` strictly needs User Details Read and Memberships Read (taken from the template, not a stated requirement).
- "OAuth Clients Write" (on the OAuth page) and "OAuth Client Write" (on the API page) differ in spelling. Neither is on [P].
