Length: 249 lines. Last section: "7. Option C: a classic token made as the sessions' account (22 Nov 2026)".

# GitHub fine-grained token: the permissions Process4 needs on a product repository

Research worker, civicsmith lane, 22 Nov 2026. Repository `neobobkrause/civicsmith-copy` (owner: personal account
neobobkrause). Sources: the tool (file:line) and GitHub's public docs, read 22 Nov 2026. Nothing tried against GitHub.
**Status: research, not a decision.**

**Three findings that decide the matter** (sections 2 and 3):
1. **The Checks API does not take fine-grained personal access tokens.** The tool's `results` command reads check runs
   (`github.mjs:72`). On a private repository it would be refused under such a token. No permission fixes it.
2. **A collaborator's fine-grained token cannot work on another user's repository.** The token must be created by
   neobobkrause himself, and every act made with it appears as neobobkrause.
3. **Pushing `.github/workflows/module-tests.yml` needs "Workflows: Read and write"** on top of Contents.

## 1. Acts found in the tool

All GitHub calls go through `gh api` (REST), `tool/lib/util.mjs:40-60`; `tool/lib/github.mjs:16-78` holds every endpoint.
Git runs through `util.mjs:24` over the checkout's `origin` (HTTPS).

| Act | Where (command; code) | Endpoint / command |
|---|---|---|
| Read the repository (default branch) | `commands.mjs:34`; `github.mjs:21` | `GET /repos/{o}/{r}` |
| Read one pull request | ready, results, merge, close, notify, related; `github.mjs:22` | `GET /repos/{o}/{r}/pulls/{n}` |
| Find a branch's open PR; list PRs into a base | `p4.mjs:28`, `commands.mjs:95,137,201,225`, `round.mjs:40`; `github.mjs:24-34` | `GET /repos/{o}/{r}/pulls?state=…&head=…&base=…` |
| Open a draft PR | open; `commands.mjs:142,154`; `github.mjs:35` | `POST /repos/{o}/{r}/pulls` (draft: true) |
| Mark ready | ready; `commands.mjs:165`; `github.mjs:42-45` | session-proxy route `POST …/pulls/{n}/ccr/ready_for_review` (not GitHub's), else `gh pr ready` (GraphQL `markPullRequestReadyForReview`) |
| Merge (merge commit, head-SHA guard) | merge; `commands.mjs:204`; `github.mjs:46` | `PUT /repos/{o}/{r}/pulls/{n}/merge` |
| Close a PR unmerged | close; `commands.mjs:261`; `github.mjs:30` | `PATCH /repos/{o}/{r}/pulls/{n}` |
| Read / add / edit comments (job block, job record, state records, walk comments) | `commands.mjs:80-81,119,155`; `state.mjs:28,109,122,126`; `walk.mjs:63-76`; `notify.mjs:161`; `github.mjs:47-49` | `GET/POST /repos/{o}/{r}/issues/{n}/comments`, `PATCH /repos/{o}/{r}/issues/comments/{id}` |
| Find the state issue by label | `state.mjs:21`; `github.mjs:50` | `GET /repos/{o}/{r}/issues?labels=…` |
| Create labels (state, walk) | `state.mjs:100`; `walk.mjs:37`; `github.mjs:52` | `POST /repos/{o}/{r}/labels` |
| Create the state issue / a walk issue | `state.mjs:103`; `walk.mjs:40`; `github.mjs:53` | `POST /repos/{o}/{r}/issues` (with labels) |
| Lock the state issue | `state.mjs:112`; `github.mjs:54` | `PUT /repos/{o}/{r}/issues/{n}/lock` |
| Close a walk issue | walk close; `walk.mjs:51`; `github.mjs:55` | `PATCH /repos/{o}/{r}/issues/{n}` |
| Read another repo's state issue | state read --repository; `commands.mjs:212-214` | as the two issue reads above, on that repo |
| Release: create draft or pre-release (makes the tag at `main`) | release prepare; `release.mjs:18-25`; `github.mjs:57` | `POST /repos/{o}/{r}/releases` |
| Release: upload files | `release.mjs:26`; `github.mjs:66-71` | `POST https://uploads.github.com/repos/{o}/{r}/releases/{id}/assets` |
| Release: find by tag, publish | release publish; `release.mjs:37-39`; `github.mjs:62-63` | `GET …/releases/tags/{tag}`, `PATCH …/releases/{id}` |
| Required run's check runs on head SHA | results; `commands.mjs:176`; `github.mjs:72` | `GET /repos/{o}/{r}/commits/{sha}/check-runs` (**Checks API**) |
| Failed run's job log | results; `commands.mjs:184`; `github.mjs:75` | `GET /repos/{o}/{r}/actions/jobs/{id}/logs` |
| Workflow runs of a branch | failed-runs; `commands.mjs:342`; `github.mjs:32` | `GET /repos/{o}/{r}/actions/runs?branch=…` |
| Git read: ls-remote, fetch | `commands.mjs:55,58,112,147`; `notify.mjs:100,163`; `round.mjs:37` | git over HTTPS (upload-pack) |
| Git push: new branch, branch commits | branch, push; `commands.mjs:61,92` | `git push origin <sha>:refs/heads/<b>` (never forced) |
| Read process4's main | latest-version; `commands.mjs:320` | `git ls-remote <process repo> refs/heads/main` |
| Onboarding files incl. `.github/workflows/module-tests.yml` (from `shims/module-tests.yml`) | `research/process4-for-a-product.md` line 27 | git push of a workflow file |

Not in the tool: re-run or cancel of a run; commit statuses; tags other than a release's; compare or commit reads by
REST (it diffs locally with git). The workflow `shims/module-tests.yml:11,62-66` uses
the run's own `GITHUB_TOKEN` (`contents: read`), never the personal token.

## 2. Permission list

Names from the token page's "Repository permissions" table. Endpoint rules from https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
and each endpoint page's "Fine-grained access tokens" box (pages under https://docs.github.com/en/rest/).

| Permission | Level | Acts it covers | Doc |
|---|---|---|---|
| Metadata | Read-only (mandatory, added by GitHub) | `GET /repos/{o}/{r}` | rest/repos/repos "Get a repository" |
| Contents | **Read and write** | git fetch/ls-remote/push; **merge a PR** ("Merge a pull request": "Contents" (write)); create/update release; get release by tag; release assets ("Update/Delete a release asset": Contents (write)) | rest/pulls/pulls; rest/releases/releases; rest/releases/assets |
| Pull requests | **Read and write** | list PRs ("List pull requests": Pull requests (read)); create PR, update/close PR (Pull requests (write)); mark ready (inference) | rest/pulls/pulls |
| Issues | **Read and write** | list issues by label (Issues (read)); create issue (Issues (write)); update/close and lock issue, create label, create/edit comment (Issues or Pull requests (write)) | rest/issues/issues; rest/issues/comments; rest/issues/labels |
| Actions | **Read and write** | read: list workflow runs, download job logs (Actions (read)); write: re-run and cancel a run, which the tool does not do today but the approvals name for the process's own repo ("Re-run a workflow", "Cancel a workflow run": Actions (write)) | rest/actions/workflow-runs; rest/actions/workflow-jobs |
| Workflows | **Read and write** (the form offers write only) | pushing `.github/workflows/*.yml` at onboarding and on any later shim change; also "Create/Update a release": "Contents (write) and Workflows (write)" where the release's target commit modifies workflow files | rest/releases/releases; token page "Workflows" table |
| Commit statuses | not needed | the tool reads none | — |
| Checks | **not offered for fine-grained PATs** | `results` (`github.mjs:72`) | see below |
| Administration | **not needed** | no act of the tool changes settings, rulesets, branch protection or collaborators | — |

**Checks.** "List check runs for a Git reference" works only with "GitHub App user access tokens, GitHub App
installation access tokens" and needs "Checks" repository permissions (read); it adds "This endpoint can be used
without authentication or the aforementioned permissions if only public resources are requested."
(https://docs.github.com/en/rest/checks/runs). The token page lists among fine-grained tokens' "major gaps":
"Using fine-grained personal access token to call the Checks API." So on a private product repository `results`
fails under this token whatever is granted. The Actions API (`/actions/runs`, `/actions/runs/{id}/jobs`,
Actions read), which `failed-runs` already uses, could give the same facts: a tool change, for PROCESS.

**Administration.** Flagged as not needed. Setting the required check `module-tests`, rulesets, and repository
settings stay the owner's own clicks (`settings-checklist.md`).

**Other repositories.** `state read --repository` (process4's PROCESS record) and `latest-version` read another
repository. "Tokens always include read-only access to all public repositories on GitHub" (token page, step 11),
so these work only if that repository is public; a token limited to civicsmith-copy reaches no other private repo.

## 3. Who can create it and as whom it acts

**a) A collaborator's token on another user's repository: no.** From
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens:
- "Each token is limited to access resources owned by a single user or organization."
- Step 9: "Under **Resource owner**, select a resource owner. The token will only be able to access resources owned
  by the selected resource owner."
- Among "The major gaps in fine-grained personal access tokens": "Using fine-grained personal access token to
  contribute to repositories where the user is an outside or repository collaborator."

believeinoakland (a collaborator with Write on neobobkrause's repository) can choose only itself or its
organizations as resource owner; neobobkrause's repositories are not reachable.

**b) Who must create it, and as whom it acts.** neobobkrause, with himself as resource owner. "Both fine-grained
personal access tokens and personal access tokens (classic) are tied to the user who generated them and will become
inactive if the user loses access to the resource." (same page). So every push, pull request, comment, merge and
release made with it appears as **neobobkrause**, not as a separate sessions' account. (Inference from "tied to the
user"; the docs page does not use the words "appear as".) (A classic token from believeinoakland would reach the repo, but
its `repo` and `workflow` scopes cover every repository the account can reach.)

**c) Expiry.** Step 7: "Under **Expiration**, select an expiration for the token. Infinite lifetimes are allowed but
may be blocked by a maximum lifetime policy set by your organization or enterprise owner." The pre-fill URL parameter
`expires_in` takes "Integer between 1 and 366, or `none`", "`none` for non-expiring", default 30 days. So the
longest set lifetime is 366 days, and a personal account (no organization policy) may choose no expiration. Also:
"GitHub automatically removes personal access tokens that haven't been used in a year."

**e) Workflows for pushing workflow files.** Token page, its own example link "Update code and open a pull request":
"Includes permission to edit workflow files for Actions - remove `workflows:write` if you don't need to do that"
(with `contents=write&pull_requests=write&workflows=write`). GitHub Apps page: "If you want your app to use an
installation or user access token to authenticate for HTTP-based Git access, you should request the "Contents"
repository permission. If your app specifically needs to access or edit Actions files in the `.github/workflows`
directory, request the "Workflows" repository permission."
(https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app).
Releases page: "Fine-grained access tokens and GitHub App installation tokens also need the "Workflows" repository
permission (write)" when "the resolved target commit modifies workflow files". No docs sentence says in so many
words that `git push` with a fine-grained PAT needs Workflows; that is a strong inference from the three.

## 4. Creation steps and labels

From the token page, section "Creating a fine-grained personal access token" (**V** = seen on that docs page;
**N** = not verified, not seen on a docs page read here):

1. Profile picture → **Settings** (V) → left sidebar **Developer settings** (V) → under **Personal access tokens**,
   **Fine-grained tokens** (V) → **Generate new token** (V). Direct address
   `https://github.com/settings/personal-access-tokens/new` (V, as the base of the page's pre-fill links).
2. **Token name** (V): e.g. `process4-civicsmith-copy`.
3. **Expiration** (V): a date up to 366 days, or no expiration (V as `expires_in=none`; the menu's own words,
   e.g. "No expiration", N).
4. **Description** (V), optional.
5. **Resource owner** (V): `neobobkrause`.
6. **Repository access** (V) → **Only select repositories** (V) → **Selected repositories** dropdown (V):
   `neobobkrause/civicsmith-copy`.
7. **Permissions** (V) → repository permissions (the page's table heading is "Repository permissions", V; the
   form's own section label, N): Actions, Contents, Issues, Pull requests, Workflows set to **Read and write**;
   Metadata **Read-only** is added by GitHub (the level words "Read and write"/"Read-only" as the form shows them, N;
   the docs show `read`, `write`).
8. **Generate token** (V). That the token is shown only once: N.

Pre-fill (V, parameter names from the docs table): `https://github.com/settings/personal-access-tokens/new?name=process4-civicsmith-copy&expires_in=366&actions=write&contents=write&issues=write&pull_requests=write&workflows=write`
(owner and repository then chosen by hand).

## 5. Not verified

- Upload a release asset: its docs page shows no fine-grained box; Contents (write) is inferred from its sibling
  asset endpoints.
- `gh pr ready` (GraphQL `markPullRequestReadyForReview`) under a fine-grained PAT, and which permission it needs
  (inferred: Pull requests write). The session-proxy route `…/ccr/ready_for_review` is not GitHub's and would not
  exist where the token is used outside a Claude session.
- Whether civicsmith-copy is private (the Checks finding bites only if it is) and whether process4 is public.
- That git push of a workflow file is refused without Workflows (inference, section 3e).
- That acts appear as neobobkrause in every place (inference from "tied to the user who generated them").
- Form wording: "No expiration", the "Read and write"/"Read-only" level labels, "token shown once".

## 6. What the lane adds (22 Nov 2026)

- The tool removes `GH_TOKEN` and `GITHUB_TOKEN` from every `git` it starts (`tool/lib/util.mjs:20-26`,
  "Token variables are removed from every git the tool starts and every product program"). So as built, a
  token entered as `GH_TOKEN` would not carry the tool's pushes; those go by the session's own GitHub
  connection, as the sessions' account. Whether `gh` calls (`tool/lib/github.mjs`) would then act with the
  token, as neobobkrause, beside pushes made as the sessions' account, is not measured.
- Proven on the trial with the session's own connection and no token (coordination/trial/setup_log_19nov.md
  line 19): the tool made 20 merges, pushes and pull requests as the sessions' account, no refusal by the
  permission checker or by GitHub.
- Design part 6 §3: "Sessions act as a second GitHub account that can push and merge but cannot change
  settings." A token made by neobobkrause acts as the owner, limited only by the token's own permissions.
- So, as built, the token is not used by Process4's tool, and making it would need a Process4 change to use
  it. That is PROCESS's to decide; the lane gives the owner the steps he asked for, with these facts beside them.

## 7. Option C: a classic token made as the sessions' account (22 Nov 2026)

Case: believeinoakland, a collaborator (Write) on neobobkrause/civicsmith-copy, a personal-account repository,
makes a personal access token (classic) with scopes `repo` and `workflow`. Sources: docs.github.com only, read
22 Nov 2026 through a page-summarising fetch, so quotes may be shortened. No token was made or tried.

Ground rules the docs give:
- "Scopes limit access for OAuth tokens. They do not grant any additional permission beyond that which the
  user already has." (/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps). So the token can do at
  most what the collaborator can do.
- `repo`: "Grants full access to public and private repositories including read and write access to code…";
  `workflow`: "Grants the ability to add and update GitHub Actions workflow files." (same page)
- Fine-grained limits: "Using fine-grained personal access token to contribute to repositories where the user
  is an outside or repository [collaborator]" is listed as unsupported, which is why a classic token is the
  option here (/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

(a) Collaborator rights. Page "Permission levels for a personal account repository"
(/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-user-account-settings/permission-levels-for-a-personal-account-repository):
there is no "Write" role, only owner and collaborator; collaborators can "pull (read) ... and push (write)",
and "Collaborators can't have read-only access". Listed for collaborators: "Create, merge, and close pull
requests in the repository"; "Create, assign, close, and re-open issues"; "Create, edit, and delete comments
on commits, pull requests, and issues"; "Manage labels for issues and pull requests"; "Create and edit
releases for the repository"; "Enable and disable auto-merge for a pull request". Owner only, among others:
"Merge a pull request on a protected branch, even if there are no approving reviews", "Manage webhooks",
"Manage deploy keys", "Allow or disallow auto-merge for pull requests".

Per act:
1. git push over HTTPS: yes. "When Git prompts you for your password, enter your personal access token."
   (/en/get-started/git-basics/about-remote-repositories). Workflow files: needs `workflow` (scope text above).
2. Pull requests: create, update (title, body, state=closed/open), merge: yes, from the collaborator list
   and REST pages (/en/rest/pulls/pulls). That page names no classic-token scope and no rule for merge (403
   listed without cause). Mark ready: unstated. Update has no `draft` field; the page names no REST way to
   mark a pull request ready (it is GraphQL, not on that page).
3. Issues: yes. "Any user with pull access to a repository can create an issue"; "users with push access or
   Triage role can edit an issue"; "Users with push access can lock an issue or pull request's conversation"
   (/en/rest/issues/issues). Comments and labels: yes by the collaborator list; the label and comment REST
   sections state no who-can or scope rule (/en/rest/issues/labels).
4. Workflow files: yes, with `workflow`; unstated whether branch rules on .github/ apply differently.
5. Releases: yes. "Users with push access to the repository can create a release." / "...can edit a
   release." `draft`: "false publishes the release"; `prerelease` field exists; "personal access tokens
   (classic) need the workflow scope" if the target commit changes workflow files (/en/rest/releases/releases).
   Tag creation by release: implied only ("Unused if the Git tag already exists"). Tags by git push: yes as
   a push. Assets: upload to uploads.github.com; no token rule stated (/en/rest/releases/assets).
6. Check runs read: yes. "OAuth app tokens and personal access tokens (classic) need the repo scope to use
   this endpoint on a private repository." and "OAuth apps and authenticated users can view check runs and
   check suites, but they are not able to create them." "Write permission for the REST API to interact with
   checks is only available to GitHub Apps." (/en/rest/checks/runs; /en/rest/guides/using-the-rest-api-to-interact-with-checks)
7. Actions: yes. List runs: "...need the repo scope to use this endpoint with a private repository."
   Re-run, re-run failed jobs: "...need the repo scope to use this endpoint." Cancel: "OAuth tokens and
   personal access tokens (classic) need the repo scope to use this endpoint." (/en/rest/actions/workflow-runs).
   Jobs: "Anyone with read access to the repository can use this endpoint." (/en/rest/actions/workflow-jobs).
   Unstated: the repository role needed to re-run or cancel.

(b) Owner control. Organizations can set "Restrict personal access tokens (classic) from accessing your
organizations", and "Personal access tokens (classic) do not have an expiration requirement."
(/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization).
No equivalent for a personal account or its repositories was found; the owner's control is removing the
collaborator. Unstated whether removal revokes or merely disables the token's reach.

(c) Expiry and steps (managing-your-personal-access-tokens). Seen on the page: "Personal access tokens",
"Tokens (classic)" ("In the left sidebar, under Personal access tokens, click Tokens (classic)"), "Generate
new token", "Generate new token (classic)", "Note", "Expiration" ("choose a default option or click Custom to
enter a date"), "Select the scopes you'd like to grant this token", `repo`, "Generate token", "Copy token".
Not seen: the URL https://github.com/settings/tokens/new, "Select scopes" as an exact label, `workflow` as a
step, and "No expiration". Docs: "we recommend that you set an expiration", and GitHub revokes a token "when
the token hasn't been used in one year" (/en/authentication/keeping-your-account-and-data-secure/token-expiration-and-revocation).

(d) Breadth warnings: "Personal access tokens (classic) are less secure." and "Your personal access token
(classic) can access every repository that you can access." It reaches every repository of organizations
the user belongs to, unless an organization restricts classic tokens (managing-your-personal-access-tokens).

Not verified:
- That "No expiration" is offered in the classic Expiration menu, and the URL /settings/tokens/new.
- Marking a pull request ready with this token (GraphQL; not read).
- Merge against branch protection or rulesets as a collaborator; the role needed to re-run or cancel runs.
- Token scopes for label, comment, pull request and asset endpoints (pages state none).
- Whether a release's `tag_name` creates a missing tag.
- Anything by trial: no token was made and no call was made.
