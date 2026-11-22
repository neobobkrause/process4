# A product's own workflows that need repository secrets (act 3)

Written by PROCESS #9, 22 Nov 2026. Grounds for the question put to the owner; nothing decided here.

## What the design says

- Design part 7, section 4, act 3: each repository is set with "a read-only token for GitHub's machines, no
  repository secrets".
- Why, as the design states it: product code under test holds no access token (part 2, section 6: "Module tests
  run in two parts, so that product code under test holds no access token"). Any workflow in the repository can
  name a repository secret, and sessions merge workflow changes into the tranche branch, so a repository secret
  is within reach of whatever a session merges.
- Secrets the process uses live in the sessions' cloud environment: the deploy token (part 9, section 1), and for
  a release the production signing keys and a release token with the privileges to publish (part 1, section 2;
  part 3, section 6). The release ceremony is run by ARCH from a session.

## What civicsmith has (measured from its files, not from a refusal)

From the second reading of civicsmith-copy (`process/lanes/civicsmith/research/civicsmith-copy-reading-2.md`,
section 2):

- `container-images` workflow: pushes images to `docker.io/civicsmith` with repository secrets
  `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
- `deploy-test` workflow: deploys with repository secret `CLOUDFLARE_API_TOKEN`.
- `release-sign` workflow: GitHub environment "release" with Bob as required reviewer, secret
  `BIO_RELEASE_SEED` (an environment secret, not a repository secret); pushes the signed `release/` to a
  `dist/cut-*` branch.

A session cannot read a repository's secret names, so whether these secrets are still present is not known; the
settings checklist (`process/lanes/civicsmith/settings-checklist.md`, "Secrets") left the removal to the owner.

Nothing has failed: no civicsmith job, deployment or release has run under Process4.

## The conflict

Removing the repository secrets, as act 3 says, stops `container-images` and `deploy-test`. Keeping them leaves
access tokens within reach of any workflow a session merges.

Under Process4 neither workflow is needed as it stands: the development deployment is ARCH's, from a session,
with the deploy token in the environment (`deploy-test`'s job); and pushing release images is part of publishing
a release, which ARCH does from a session with a release token (the Docker Hub token is such a token, as is the
signing key). Development deployments pull public images and need no Docker Hub token. Whether civicsmith keeps,
reworks or retires its own workflows is a product matter for its ARCH.

## Options

- **A. No change (recommended).** Act 3 stands. The owner deletes the two Docker Hub secrets and the Cloudflare
  secret from civicsmith-copy when convenient (nothing under Process4 uses them). When civicsmith prepares its
  first release, the Docker Hub token goes into the sessions' environment as a release token, made once with what
  publishing needs (part 1, section 3). civicsmith's ARCH is told the two workflows stop and decides their fate.
- **B. Allow secrets inside a GitHub environment with the owner as required reviewer.** civicsmith already does
  this for signing. It keeps the old workflows running, but each run waits for the owner's click: a new stop on
  routine work, which a change may not add (PROCESS rule 2), unless he chooses it.
- **C. Allow repository secrets a product's own workflows use.** Least work now; it removes the reason act 3
  exists (no token within reach of merged code).
