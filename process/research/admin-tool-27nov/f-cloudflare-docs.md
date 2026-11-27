# Cloudflare as Process4's live shared state: documentation findings

Research worker for PROCESS, 27 Nov 2026. Sources are public Cloudflare and Claude Code documentation only. No account, API or wrangler was touched. Text in quotes is from the page cited. Text marked *inferred* is my reading of the docs, not a statement the docs make.

## Short answer

Yes. Option (1), a Worker in front of one SQLite-backed Durable Object (DO), is the closest fit. It gives a single writer, transactions, strong consistency, and costs nothing extra at this load as long as the object can hibernate. Option (2), D1 through a Worker, is also cheap and transactional. D1 straight through the REST API works, but it shares the account-wide 1,200-requests-per-5-minutes API budget, and Cloudflare advises against using it for application traffic. Option (3), KV, is eventually consistent and has no atomic operations, so it is unsuitable for a ledger. Option (4), R2 with conditional writes, can do compare-and-swap on whole objects. But it allows only 1 write per second per key, and its S3 auth needs keys inside the session VM. Every option costs about $0 at the margin, apart from a small risk on DO duration explained below.

## 1. Worker + one SQLite-backed Durable Object

**Consistency and transactions**
- "Durable Objects are single-threaded and cooperatively multi-tasked"; "Each Durable Object has a globally-unique name"; "Since this storage lives together with the object, it is strongly consistent yet fast to access." https://developers.cloudflare.com/durable-objects/what-are-durable-objects/
- `transactionSync()`: "If `callback()` throws an exception, the transaction will be rolled back." "Any series of write operations with no intervening `await` will automatically be submitted atomically." https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/
- Clients reach a DO through a Worker. The docs talk about RPC "between Workers and Durable Objects" (what-are-durable-objects page above). *Inferred:* the DO has no public endpoint of its own, so sessions call the Worker.

**Limits**
- "Storage per object": "10 GB". "Maximum string, BLOB or table row size": "8 MB". "Maximum SQL statement length": "100 KB". "An individual Object has a soft limit of 1,000 requests per second." CPU per request: "30 seconds (default) / configurable to 5 minutes". https://developers.cloudflare.com/durable-objects/platform/limits/

**Latency**
- "By default, a Durable Object is instantiated in a data center close to where the initial get() request is made." Objects "do not currently change locations after they are created". Location hints are "best effort and not a guarantee." https://developers.cloudflare.com/durable-objects/reference/data-location/
- *Inferred:* create it from a request near the sessions (US); every call then pays the trip to that one data center.

**Authentication.** The Worker checks something the caller sends:
- A shared secret held as a Worker secret: "Secrets are a type of binding that allow you to attach encrypted text values to your Worker." "secret values are not visible within Wrangler or Cloudflare dashboard after you define them." https://developers.cloudflare.com/workers/configuration/secrets/ . Cloudflare's own D1 tutorial does this with a bearer API key stored by `wrangler secret put API_KEY`: https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/
- Cloudflare Access on the Worker URL: "Access can protect one Worker's production `workers.dev` URL, preview URLs, or both." https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- Access service tokens use the headers `CF-Access-Client-Id` and `CF-Access-Client-Secret`. There is also a single-header mode (`"read_service_tokens_from_header": "Authorization"`) whose value is the JSON `{"cf-access-client-id": "<CLIENT_ID>", "cf-access-client-secret": "<CLIENT_SECRET>"}`. Tokens expire: a configurable "Service Token Duration … sets the expiration date for the token." https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/

**Pricing on Workers Paid** (https://developers.cloudflare.com/durable-objects/platform/pricing/)

| Item | Included | Overage |
|---|---|---|
| Requests | 1 million/month | $0.15/million |
| Duration | 400,000 GB-s/month | $12.50/million GB-s |
| SQLite rows read | 25 billion/month | $0.001/million |
| SQLite rows written | 50 million/month | $1.00/million |
| SQLite stored data | 5 GB-month | $0.20/GB-month |

- Requests include HTTP requests, RPC sessions, WebSocket messages and alarm invocations.
- Deletes count as rows written.
- SQLite storage billing began in January 2026, so it applies now.

**When duration is billed.** This is the part that matters for this account.
- "Duration is billed in wall-clock time as long as the Object is active and not eligible for hibernation," "but is shared across all requests active on an Object at once." (pricing page)
- "Durable Objects that are idle and eligible for hibernation are not billed for duration, even before the runtime has hibernated them." (pricing page)
- "Duration billing charges for the 128 MB of memory your Durable Object is allocated, regardless of actual usage." Objects that share an isolate "are still billed as if they are allocated a full 128 MB." (pricing page)
- "Pending I/O operations keep an object in memory for up to 15 minutes each. The object incurs duration charges during that time." (pricing page)
- `accept()` on a standard WebSocket "will incur duration charges for the entire time the WebSocket is connected." (pricing page)
- The lifecycle page says an object is charged only when it is "actively running in-memory" or "idle in-memory and non-hibernateable". A hibernateable object hibernates "after 10 seconds of inactivity". A non-hibernateable idle object is evicted "after 70-140 seconds of inactivity (no incoming requests or events)." https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/
- Hibernation needs all of these (lifecycle page): "No `setTimeout`/`setInterval` scheduled callbacks are set"; "No I/O operation or promise passed to `this.ctx.waitUntil()` remains unfinished, and no outbound connection remains open"; "No WebSocket standard API is used"; "No request/event is still being processed".
- *Inferred:* an object that serves only HTTP or RPC, with no timers, no `waitUntil` and no outbound connections, is billed only while a request is in flight. If one of those conditions fails, it stays billed until 70–140 s after its last request. With a request every few seconds, that means all day.
- Rounding: "This billable usage is rounded up to the next billable unit before the corresponding rate is applied." The docs' examples round GB-s to whole millions; for example, "552,960 GB-s - included 400,000 GB-s = 152,960 GB-s … (rounded) 1,000,000 GB-s x $12.50 / 1,000,000 = $12.50". GB-s are computed as "seconds * 128 MB / 1 GB", with 1 GB counted as 1,000 MB. (pricing page)

## 2. D1 (through a Worker or through the REST API)

**Consistency and transactions**
- "D1 routes all queries (both read and write) to a specific database instance in one location in the world." Read replicas need the Sessions API, which "is only available via the D1 Worker Binding and not yet available via the REST API." "Sessions API ensures sequential consistency for all queries in a session." https://developers.cloudflare.com/d1/best-practices/read-replication/
- "Batched statements are SQL transactions": if a statement fails, D1 "aborts or rolls back the entire sequence", and "each statement in the list will execute and commit, sequentially, non-concurrently." https://developers.cloudflare.com/d1/worker-api/d1-database/
- The REST body accepts `batch: [{sql, params}]`, and `sql` "Supports multiple statements, joined by semicolons, which will be executed as a batch." https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/

**Limits** (https://developers.cloudflare.com/d1/platform/limits/)
- Each database stores "up to 10 GB".
- Row or string size: "2,000,000 bytes (2 MB)".
- Statement length: "100,000 bytes (100 KB)".
- Queries per Worker invocation: 1,000 on Paid.
- Query duration: 30 seconds.
- "Each individual D1 database is inherently single-threaded, and processes queries one at a time."

**REST API route, authentication and rate limit**
- Route: `POST /accounts/{account_id}/d1/database/{database_id}/query`, authenticated with "Authorization: Bearer $CLOUDFLARE_API_TOKEN". Accepted permissions include "D1 Read" and "D1 Write". (API reference above)
- Rate limit: "The global rate limit for the Cloudflare API is 1,200 requests per five minute period per user, and applies cumulatively regardless of whether the request is made via the dashboard, API key, or API token." "If you exceed this limit, all API calls for the next five minutes will be blocked" with HTTP 429. There is also a per-IP limit of 200/second. https://developers.cloudflare.com/fundamentals/api/reference/limits/
- The D1 reference publishes no separate D1 limit.
- Cloudflare's advice: "D1's built-in REST API is best suited for administrative use as the global Cloudflare API rate limit applies." (D1 tutorial above)

**Latency**
- A 2025 change moved REST authentication to the nearest data center: "Latency improvements range from 50-500 ms depending on request location and database location". https://developers.cloudflare.com/changelog/2025-05-30-d1-rest-api-latency
- *Inferred:* REST calls carry noticeable overhead compared with a Worker binding.

**Pricing on Paid** (https://developers.cloudflare.com/d1/platform/pricing/)

| Item | Included | Overage |
|---|---|---|
| Rows read | 25 billion/month | $0.001/million |
| Rows written | 50 million/month | $1.00/million |
| Storage | 5 GB | $0.75/GB-month |

- "Rows read measure how many rows a query reads (scans)". Index writes "add an additional written row".
- Queries run from the dashboard or wrangler are billable. The page does not mention the REST API by name.

## 3. Workers KV

- **Consistency.** "KV achieves high performance by being eventually-consistent." Changes "may take up to 60 seconds or more to be visible" elsewhere. Visibility at the writing location is "not guaranteed and therefore it is not advised to rely on this behaviour". "KV is not ideal for applications where you need support for atomic operations." Cloudflare suggests sending writes through a Durable Object instead. https://developers.cloudflare.com/kv/concepts/how-kv-works/
- **Limits.** Writes to the same key: "1 per second". Value size: "25 MiB". Key size: "512 bytes". Operations per Worker invocation: 1,000. https://developers.cloudflare.com/kv/platform/limits/
- **Pricing on Paid.** https://developers.cloudflare.com/workers/platform/pricing/

| Item | Included | Overage |
|---|---|---|
| Reads | 10 million/month | $0.50/million |
| Writes | 1 million/month | $5.00/million |
| Deletes | 1 million/month | $5.00/million |
| Lists | 1 million/month | $5.00/million |
| Storage | 1 GB | $0.50/GB-month |

- **Latency.** Reads are edge-cached; `cacheTtl` defaults to 60 s (how-kv-works page), hence the staleness.
- **Verdict.** It can serve read-mostly snapshots such as the charter or plan. It cannot serve the round state or the ledger.

## 4. R2 with conditional writes

- **Consistency.** "clients should be able to observe the effects of any write, update and/or delete operation immediately, globally". Listing is strongly consistent. Unconditional concurrent writes: "the last writer to complete" wins. https://developers.cloudflare.com/r2/reference/consistency/
- **Conditional writes.** PutObject supports `If-Match`, `If-None-Match`, `If-Modified-Since` and `If-Unmodified-Since`. "R2 evaluates conditional headers atomically against the committed bucket state"; "The condition is evaluated at the moment the write commits". A failed condition returns `412 PreconditionFailed`. https://developers.cloudflare.com/r2/api/s3/conditional-operations/
- The Workers binding's `put()` takes an `onlyIf` option (Workers API reference: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).
- *Inferred:* this gives compare-and-swap on whole objects (read the ETag, write with `If-Match`, retry on 412). There are no multi-object transactions. Each update rewrites the whole object.
- **Limits.** "Concurrent writes to the same object name (key)": "1 per second"; going faster returns HTTP 429. The Cloudflare REST API is limited to "1,200 requests per five minutes across all R2 REST API operations". https://developers.cloudflare.com/r2/platform/limits/
- **Authentication.** S3 clients use an Access Key ID and Secret Access Key against `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. https://developers.cloudflare.com/r2/api/tokens/
- *Inferred:* S3 requests are signed per request, so a static header injected by a proxy cannot authenticate them. The keys would have to sit inside the VM, or a Worker would front the bucket.
- **Pricing.** https://developers.cloudflare.com/r2/pricing/

| Item | Free each month | Price |
|---|---|---|
| Storage | 10 GB-month | $0.015/GB-month |
| Class A operations (PutObject, ListObjects) | 1 million | $4.50/million |
| Class B operations (GetObject, HeadObject) | 10 million | $0.36/million |
| Egress | — | free |


## Worker host costs (options 1, 2-via-Worker, 3, 4-via-Worker)

The Paid plan has a minimum of "$5 USD per month". It includes "10 million included per month" requests at "+$0.30 per additional million", and "30 million CPU milliseconds" at "+$0.02 per additional million CPU milliseconds". https://developers.cloudflare.com/workers/platform/pricing/

## Cost estimate at civicsmith's size

**Load assumptions**
- Jobs: 24/h × 12 h × 30 days = 8,640 jobs/month. At 20 reads and 5 writes each, that is 172,800 reads and 43,200 writes.
- Standing roles: 2,000 reads and 500 writes a day, or 60,000 reads and 15,000 writes a month.
- Total: about **232,800 reads and 58,200 writes**, or **291,000 calls a month**. That averages about 67 calls per 5 minutes during the 12 h day, roughly one every 4.5 s.
- Each read returns about 2,000 rows (low: 50 rows, using indexes). Each write touches 1 row plus 3 index rows.
- Stored data is 1–5 MB.
- Account context (given): DO requests, rows, KV and D1 operations are far under their included amounts. DO duration was 1.24M GB-s last month against 400k included, so 840k GB-s billable. *Inferred:* under the documented rounding that bills as 1M GB-s ($12.50), which leaves about 160k GB-s of headroom before the next million.

**Usage at this load:** 291k requests, at most 466M rows read, and about 233k rows written. All of these fall inside the included amounts of 1M requests, 25B rows read and 50M rows written.

| Option | Usage at this load | Extra $/month, low | Extra $/month, high |
|---|---|---|---|
| 1. Worker + DO, object hibernates (HTTP/RPC only) | Duration while requests run: 20 ms each = 745 GB-s; 500 ms each = 18,624 GB-s | $0 (about $0.01 linear) | $0 within the rounding headroom (about $0.23 linear) |
| 1′. Worker + DO, object cannot hibernate (timer, `waitUntil`, open socket) | Stays in memory through each 12 h day: 1,296,000 s × 0.128 = 165,888 GB-s. At 24 h: 331,776 GB-s | about $2.07 linear | **+$12.50**, because the total crosses 1M GB-s billable (24 h: about $4.15 linear, still +$12.50 rounded) |
| 2a. D1 via Worker | Rows and requests only; no duration charge | $0 | $0 |
| 2b. D1 via REST API | Same, with no Worker | $0 | $0 in money. Risk: it uses about 67 of the 1,200 calls per 5 min on average, shared with every other API use by that user or token. Going over blocks **all** API calls for 5 minutes |
| 3. KV via Worker | 233k reads, 58k writes, ≤291k lists | $0 | $0 |
| 4. R2 (via Worker or S3) | 233k Class B, 58k Class A (291k Class A if every read lists) | $0 | $0 |

All rows assume other usage stays far below the included amounts; the $5 minimum is already paid.

## Reaching it from a cloud session

**Is the host allowed already?**
- The Claude Code default allowlist includes `*.r2.cloudflarestorage.com`, which is the R2 S3 endpoint.
- It does not include `api.cloudflare.com` or `*.workers.dev`.
- In the environment settings, "A leading `*.` matches every subdomain". https://code.claude.com/docs/en/cloud-environments
- The environment-change tools available to sessions accept only exact hosts, with no wildcards. A Worker would therefore be added by its exact hostname, `<worker>.<subdomain>.workers.dev` (the format is from https://developers.cloudflare.com/workers/configuration/routing/workers-dev/).

**Injecting a secret**
- A network secret is stored on the environment. "Anthropic's agent proxy adds the key to requests for the hosts you list, after each request leaves the session's VM". "Sessions can reach those hosts even when the environment's network access level wouldn't otherwise allow them." Saving a secret for the Worker host or `api.cloudflare.com` therefore also opens that host.
- The form defaults to header `Authorization` with prefix `Bearer`. The name can be changed and the prefix cleared. The secret "applies in every session that runs in the environment". (cloud-environments page)
- This fits three schemes:
  - a Worker shared secret, sent as `Authorization: Bearer …`;
  - a D1-scoped API token for the REST route;
  - Access's single-header mode, with the JSON value in `Authorization` and no prefix.
- *Inferred:* the two-header Access form needs a second header row, which the restricted one-host form may not offer.
- R2's S3 signing cannot be injected this way (see section 4).
