# Part F: what process3's transient state would have cost on Cloudflare (27 Nov 2026, PROCESS #21)

The owner, 27 Nov (conversation): "look at process3's use of the repo for transient state information to estimate how much
it would have cost per month if we had used Cloudflare for that purpose instead given the costs found on the invoice I've
given you." Prices are the invoice's own unit prices (Cloudflare invoice of 24 Nov 2026 for 24 Oct–23 Nov, the account on
Workers Paid; the invoice's personal details are not kept here). Process3's volumes are from part C §1.1 and process3's
`process4/evidence/` files (public neobobkrause/process3, branch `process4`).

## Process3's state traffic (measured there)
- 1,387 pushes to the state branch in 19 hours (about 73 an hour), 173 in the busiest hour; 12,881 of 18,295 commits on it
  over about nine days (about 1,430 a day); 8,937 files; "pushes 94 an hour" in its hourly budget lines from 7 Nov.
- Reads (polling) were not counted anywhere read; assumed below at 10 reads for each write.

## The month, priced
Low: 1,430 writes a day; high: 173 an hour all day (4,150 a day). Each write taken as one request and five rows; reads ten
per write.

| Line (invoice price, included amount) | Low month | High month | Cost |
|---|---|---|---|
| Workers requests ($0.30/M; 10M included) | ~0.5M | ~1.4M | $0 |
| Durable Objects requests ($0.15/M; 1M included) | ~0.5M | ~1.4M | $0 to $0.06 |
| Durable Objects rows written ($1/M; 50M included) | ~0.2M | ~0.6M | $0 |
| Durable Objects rows read ($0.001/M; 25B included) | small | small | $0 |
| Durable Objects storage ($0.20/GB-month; 1 GB included); process3's 8,937 small files | well under 1 GB | | $0 |
| Durable Objects duration ($12.50 per million GB-s, billed in whole millions; this account used 1,242,406 GB-s, billed $25.00) | a few thousand GB-s if the object can hibernate | up to 331,776 GB-s if it never can | $0, or $12.50 if it pushes the account's total into the next million |
| D1 instead: rows written ($1/M; 50M), rows read ($0.001/M; 25B), storage ($0.75/GB; 5 GB); no duration charge | | | $0 |
| KV instead: writes ($5/M; 1M included) | ~43k | ~125k | $0; but KV is eventually consistent, unfit for this |

Duration is billed only while an object is active and cannot hibernate, always at 128 MB (counted as 0.128 GB); an idle
object that cannot hibernate stays billed until evicted 70–140 s after its last request; one that can hibernate (plain
requests, no timers or open connections) is not billed while idle (`f-cloudflare-docs.md`). The ceiling for one object
running every second of a 30-day month is 331,776 GB-s. Billable duration "is rounded up to the next billable unit", a
million GB-s: the invoice bills 1,242,406 GB-s as $25.00, two such units (the docs' example subtracts the 400,000 included
first, which would give one unit; the invoice's figure is what was charged). So added duration costs nothing until it
carries the account's total over the next million, then $12.50.
**About $0 a month on top of the $5 plan the account already pays, built to hibernate or on D1; at worst $12.50 a month, if
an object kept running carries the account's duration into the next million.** For comparison, the invoice's $168.44
was $126.00 container memory, $25.00 Durable Objects duration, $7.02 container disk, $5.42 container CPU and $5.00 the plan:
the product's own running, not state.

## What the price leaves out
- Whether a process may use this account: Process4's approvals name no Cloudflare account; a product's development
  account is for deploying that product (design part 9). Using it, or a separate account, needs his approvals' wording.
- Reaching it: from sessions, the Cloudflare API host or a Worker's address must be allowed in the environment's network,
  with the key held as a network secret for that exact host (`*.r2.cloudflarestorage.com` is allowed by default;
  `api.cloudflare.com` and `*.workers.dev` are not). D1 through Cloudflare's REST API shares 1,200 requests per 5 minutes
  with all other API use by that user, and going over blocks every call for 5 minutes; Cloudflare calls that API "best
  suited for administrative use". A Worker in front of one Durable Object (strongly consistent, single-threaded,
  transactions) or of D1 avoids that limit. KV is eventually consistent; R2 allows one write a second per key.
- Ties Process4 to one host (design parts 1–6 name none).
