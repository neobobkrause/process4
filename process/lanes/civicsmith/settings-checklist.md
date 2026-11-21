# civicsmith-copy's repository settings for Process4: the checklist

Length: 62 lines. Last section: "Not yet: act 10".

Written by PROCESS civicsmith lane #1, 21 Nov 2026, at the owner's request (conversation): "Before we go
anywhere, we need to confirm that the civicsmith-copy repo's setting (actions, rules, etc) are properly
setup for process4." The lane cannot read civicsmith-copy's settings, which are outside its approvals and
need the repository's admin view. So this is what Process4 needs, page by page, for the owner to confirm
on GitHub. Sources: design part 7 §4 acts 2–5 and 10; build text 4 §4; research/civicsmith-copy-reading.md.
**The setting names are GitHub's as the lane knows them, not read from GitHub's pages today; where a page
words one differently, the meaning given here is what counts.**

## Access — https://github.com/neobobkrause/civicsmith-copy/settings/access (act 2)

- [ ] The sessions' GitHub account (the one that marks the lane's pull requests ready: `believeinoakland`)
      is listed with **Write** access, accepted. Not Admin.

## General — https://github.com/neobobkrause/civicsmith-copy/settings (act 3)

- [ ] Default branch: `main`.
- [ ] Under "Pull Requests": **Allow merge commits** on; **Allow squash merging** off; **Allow rebase
      merging** off. Process4 merges by merge commit only.
- [ ] **Allow auto-merge** off.
- [ ] **Automatically delete head branches** off.

## Actions — https://github.com/neobobkrause/civicsmith-copy/settings/actions (act 3)

- [ ] Actions are allowed to run (the required run, `module-tests`, is a GitHub Actions workflow).
- [ ] Under "Workflow permissions": **Read repository contents and packages permissions** (read-only).
- [ ] **Allow GitHub Actions to create and approve pull requests** off.

## Secrets — https://github.com/neobobkrause/civicsmith-copy/settings/secrets/actions (act 3)

- [ ] No repository secrets. **Note:** the product's own `deploy-test` workflow uses a Cloudflare token.
      If that token is stored here, removing it stops `deploy-test` (a workflow run by hand or by a push
      to `deploy-test/*`). Under Process4 the deploy token lives only in the cloud environment's settings
      (act 6), and ARCH deploys from a session by the process config's `deploy` commands. Removing it is
      what act 3 says; the owner may first want ARCH to have a working deploy (the first tranche's proof).
      The lane's recommendation: remove it at setup, as act 3 says; `deploy-test` is not part of Process4.

## Rules — https://github.com/neobobkrause/civicsmith-copy/settings/rules (act 4)

- [ ] Any ruleset or branch protection left from earlier processes is removed or replaced. The reading
      found none recorded for this copy (`build/GRANTS.md` records rulesets only on the original
      `civicsmith` organisation); also check https://github.com/neobobkrause/civicsmith-copy/settings/branches
      for classic branch-protection rules.
- [ ] One ruleset on **all branches**: **Restrict deletions** and **Block force pushes**, enforcement
      Active, bypass list empty. This also keeps `snapshot/pre-refactor-2026-09-25`, which civicsmith's
      safety rules name.

## The Claude GitHub App (act 5)

- [ ] Claude's GitHub App is installed on civicsmith-copy, connected as the sessions' account
      (https://github.com/neobobkrause/civicsmith-copy/settings/installations lists it).

## Not yet: act 10

Only after the required run `module-tests` has reported once (it arrives with the set-up session's first
pull request): one ruleset on `main` and `p4-tranche`: **Require a pull request before merging** with zero
approvals; merge method merge commit only; **Require status checks to pass** with `module-tests`, source
GitHub Actions; bypass list empty (build text 4 §4). Not before, because a required check that has never
reported cannot be chosen.
