# Part 9. The hosting table for Cloudflare

Length: 29 lines. Last section: "3. Not known".

Everything in this part is specific to Cloudflare, the first hosting provider. Support for other hosting is not built; the design is written so that it can be added as another table.

## 1. What carries each term

| Term in parts 1 to 6 | On Cloudflare |
|---|---|
| The development account | The product's own Cloudflare account, the one its process config names |
| The development site and a development deployment | The product deployed into that account, under names kept apart from any installed site, reaching no one else. It holds no secrets and keeps no permanent record. Sessions may deploy, configure, seed, reset and remove it |
| The deploy token | A Cloudflare API token for the development account only, held among the harness's secret values. It is made once, with every permission any stage of the product's development will need there (part 1, section 3) |
| The hosting account's limits | The limits of that Cloudflare account. The owner's caution: "be careful that there aren't too many external walkers to cause the Cloudflare system to exceed limits of the account" |
| Install and update | The product's installer placing a release into an empty Cloudflare account, and its updater moving an installed release to a newer one. Both are run on a development account before a release is offered (part 3, section 6) |
| Installed sites | Cloudflare accounts where a release runs for real users. No session holds a key to one |

## 2. Decisions

- The development site's names are kept apart from any installed site's.
- The deploy token is for the development account only. Only ARCH's instructions name deploying. Nothing physical keeps the token's value from another session in the same environment.
- A product's production signing keys, needed to produce the installer in the release ceremony, are kept among the harness's secret values in the environment its sessions run under (part 1, section 2), and a release token with publish privileges may be used to publish a release. Nothing physical keeps a key's value from another session in the same environment.

## 3. Not known

- How many external walkers the account bears.
- Whether a deployment can be made from a session within the time a session can run one thing.
- Whether the installer can place a release into an empty account. A development deployment does not use the installer.
- What carries the owner's act of connecting an AI account to the development deployment (part 1, section 3), and how that stands with a deployment that holds no secrets.
