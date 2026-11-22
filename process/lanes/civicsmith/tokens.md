# civicsmith's tokens: the whole list of permissions (draft)

Length: 78 lines. Last section: "4. What stays open until the second reading".

Written by PROCESS civicsmith lane #1, 22 Nov 2026, on PROCESS #6's instruction carrying the owner's decision
of 22 Nov 2026: "The token created for the product being onboarded should be the token with all the
permissions that will be needed across all stages of process4 driven development across that product's
entire lifecycle. Anything short of those privileges will require me to unnecessarily create yet another
token." (design part 1 §3; part 9 §1). **Status: draft.** It becomes final after the second reading
(`reading-brief-2-tokens.md`) shows what civicsmith's ten Workers bind. Grounds: `research/cloudflare-token-permissions.md`
(Cloudflare's own public pages, each cited there), `research/civicsmith-copy-reading.md` §§2, 4, 6.

## 1. Which services, and which token for each

| Service | Token | Why |
|---|---|---|
| Cloudflare | **One API token**, naming the development account and the rehearsal account | Development deployments (deploy, configure, seed, reset, remove), the walks' development site, and the install and update run before a release (part 3 §6; part 9 §1) |
| Cloudflare R2, S3-compatible access | **One R2 API token**, only if the second reading shows the product's scripts reach R2 by its S3 interface | Cloudflare issues R2 S3 credentials separately from API tokens (research §2) |
| GitHub | **None.** The owner's decision of 22 Nov 2026, as typed: "Decision: ... But a Github token needn't be created if sessions act through Claude's GitHub connection." Sessions act through Claude's GitHub connection as the sessions' account | The page's Action 1 checks the connection covers civicsmith-copy. Not yet tried through it: publishing a release. The token research stays in `research/github-token-permissions.md` |
| An AI provider | **Open.** If the product's AI features call a provider other than Workers AI, a development key may be needed for the walks of journeys that use AI (part 1 §3, "Connect an AI account to the development deployment") | Second reading, question 5 |

The release signing keys: the owner's decision of 22 Nov 2026, as PROCESS #6 relayed it, "Decision:
BIO_RELEASE_SEED and BIO_RATIFY_SEED production signing keys, and they stay." They stay in the sessions'
environment and are not part of this list. Nothing here reaches an installed site: an installed site is a
group's own Cloudflare account, which the product's installer reaches by the group's own sign-in, never by
this token.

## 2. The Cloudflare token's permissions

The lane's design: one token, made once, covering every Workers-family product civicsmith's development
uses or may come to use in the two accounts, so that no later stage needs another (the owner's rule). It
reaches no zone unless the second reading shows routes or DNS on a zone of the development account.
Names are as the dashboard shows them ("Edit" in the dashboard is "Write" in the API).

| Group · permission · level | What it allows | Verified on Cloudflare's pages |
|---|---|---|
| Account · Workers Scripts · Edit | Deploy, update, delete Workers; Durable Object classes and migrations; cron triggers; Worker secrets; workers.dev; Custom Domains | Yes |
| Account · Workers R2 Storage · Edit | Create, list, delete R2 buckets (`bio-captures`, `bio-published`) | Yes |
| Account · Workers KV Storage · Edit | KV namespaces, if bound | Yes |
| Account · D1 · Edit | D1 databases, if bound | Yes |
| Account · Queues · Edit | Queues, if bound | Yes |
| Account · Workers AI · Edit | Workers AI, if bound | Yes |
| Account · Containers · Edit | Cloudflare Containers, if used (the product has a `container-images` workflow) | Name yes; whether a deploy needs it, **not verified** |
| Account · Cloudchamber · Edit | Containers' underlying service | Name yes; need **not verified** |
| Account · Browser Run · Edit | Browser Rendering (renamed Browser Run), if bound | **Not verified**: Cloudflare's guide names it, its permission list does not |
| Account · Workers Tail · Read | `wrangler tail`, to read a development deployment's logs | Yes |
| Account · Account Settings · Read | Wrangler's account checks | Yes |
| User · User Details · Read | Wrangler's identity check | Yes |
| User · Memberships · Read | Wrangler's account listing | Yes |
| Zone · Workers Routes · Edit | Routes on a zone; **only if** the second reading shows routes | Yes |
| Zone · DNS · Edit | DNS records; **only if** the second reading shows custom domains on a zone | Name in the docs is "DNS Write"; dashboard label **not verified** |

**Account resources:** include the development account and the rehearsal account (the one the product's
`CS_TEST_CF_ACCOUNT_ID` names). **Not verified:** that the dashboard takes two accounts in one token; the API
does. If it does not, the fallback is one token for each account, which the owner's rule allows to be
named here now so that no later stage asks for another.

**Expiry:** none set, or the longest the owner chooses; renewal carries the same permissions (part 1 §3).
**Client IP filtering:** none (the sessions' machines have no fixed address).

## 3. Where the values go

Each value goes in the fields of Claude's cloud environment settings page for the environment civicsmith's
sessions run under (part 7 §4 act 6), never in a repository. The names the product's scripts read are
given by the second reading (question 2); until then the page names none.

## 4. What stays open until the second reading

1. Which bindings each of the ten Workers uses: this settles which "if bound" rows stay, and whether any
   zone permission is needed.
2. Whether deploy scripts reach R2 by its S3 interface (then the R2 API token of section 1).
3. Whether Containers are deployed through Cloudflare, and which permission a deploy needs.
4. Where releases are published, and whether the installer can run with an API token on the rehearsal
   account rather than its sign-in (if not, the install and update run needs the owner's sign-in once).
5. Which AI provider, if any beyond Workers AI.

The lane's recommendation on 1: keep every account-level row even where nothing binds it today. Each is
limited to the two development accounts, and his rule is to make the token once.
