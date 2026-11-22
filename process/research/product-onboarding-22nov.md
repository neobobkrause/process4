# Research: onboarding a product into Process4 — requirements, access, and who does what (22 Nov 2026)

Recorded by PROCESS #5 before proposing (rule 3). The owner's request, 22 Nov 2026 (conversation):
"The process of onboarding a project may involve a number of significant actions just to get the
incoming repo to the point that a ROOT for that product can be started. These actions may include
github, Cloudflare configuration changes and the creation and sharing of tokens that process4 will need
to read and make changes to the repo and site configuration. I'll need step by step instructions for
getting process4 those tokens. Then once PROCESS has the needed reading privileges, I'll need to make
changes to the github rules and actions to conform with process4's requirements. I believe that all this
onboarding work should be the charter of a product-specific lane that PROCESS spwans (as it did for
civicsmith). Let's work through this process4 onboarding process so that the requirements and steps are
thoroughly understood, then make any necessary changes to the process4 design."

Grounds read: design parts 1 §3, 4 §§1–2, 6 §§2–3 and §8, 7 §§1, 3–5, 9; the civicsmith lane's research
(`process/lanes/civicsmith/research/starting-a-product.md`, `civicsmith-copy-reading.md`,
`settings-checklist.md`, `conversion-plan.md`); measurements of 19–21 Nov.

## 1. What the design says today

- Onboarding is the owner's ten acts of part 7 §4 plus the environment check of §5. Act 8 (since 20 Nov)
  is a plain session he starts on the product's repository, which drafts the approvals, writes the first
  Process4 files and makes the tranche branch from main.
- There is no onboarding role. PROCESS may have lanes "for standing subjects, as needed" (part 6 §8); the
  civicsmith lane is in practice an onboarding lane, but no text says what such a lane does or ends.

## 2. Measured constraints any design must meet

1. **A session reaches one repository's GitHub.** A `gh api` read of another repository is refused (403),
   even a public one (part 7 §3). A plain `git clone` of a public repository works.
2. **A session holding two repositories loads no deny list** (part 7 §1). So attaching the product's
   repository to a process4 session (`add_repo`) removes the forbidden commands from that session.
3. **The approvals of both repositories confine a session to the repository it was started in** (process4's
   CLAUDE.md: "A session's acts on a product's repository … are made only from a session started in that
   product's repository").
4. **The sessions' GitHub account can push and merge but cannot change settings** (part 6 §3; acts 1–2).
   Rulesets, required checks, Actions permissions and repository secrets are the owner's clicks.
5. **A read-only session on the product's repository, started by the owner, works:** it read
   civicsmith-copy in full on 21 Nov and its report reached the lane through the owner.
6. **Cloudflare:** this environment already injects a credential for `api.cloudflare.com` (its scope is
   not read here). Part 9: the deploy token is for the development account only. The owner's audit
   session on civicsmith-copy (21 Nov) reported that the BioDefault environment holds production signing
   seeds — against part 1 §2 ("no session directly holds a production key"). Not verified by PROCESS.

## 3. What onboarding has to accomplish (from the trial and civicsmith)

Read: the repository's rulesets, required checks, workflows, Actions settings, secrets' names, old
process files and branches, open pull requests; the Cloudflare development account and anything a
deployment needs. Change (owner's clicks): rulesets (all-branch no-delete/no-overwrite; main and tranche
branch PR-only with `module-tests`, replacing old checks), Actions permissions (read-only token), old
workflows disabled, repository secrets removed, production keys out of the environment, the
environment's permissions-management block naming the repository. Change (a session, by pull request):
approvals (first time: owner's paste or delete-then-merge), the forbidden-commands copy, `process.json`,
module list, `module-tests` workflow, the tranche branch from main. Then start ROOT.

## 4. Questions for the owner (the design changes follow from his answers)

- **Q1. The onboarding lane.** Adopt a standing rule: for each product joining Process4, PROCESS starts a
  product onboarding lane in the process's repository (like the civicsmith lane), whose charter is the
  conversion plan, the reading, the owner's step-by-step pages, and the set-up session's brief; it ends
  when ROOT starts. Recommended: yes (it is what the civicsmith lane already does).
- **Q2. How the lane reads the product.** (a) The owner starts a read-only session on the product's
  repository with the lane's brief, and its report reaches the lane (measured to work; one start for him
  each time). (b) The owner makes a read-only GitHub token (fine-grained: the one repository; Metadata,
  Contents, Administration, Actions, Secrets — all read) and a read-only Cloudflare token, saved as the
  environment's network secrets, so the lane reads directly. Unproven: that a token for `api.github.com`
  can stand beside the session's own GitHub access; and it widens what a process4 session reaches, which
  his approvals now forbid (constraint 3) and would need his new wording. Recommended: (a) now; (b) only
  if (a) proves too slow.
- **Q3. Who makes the settings changes.** (a) The owner, by clicks, from the lane's step-by-step page,
  each with what he should see (as today). (b) A token with admin rights given to a session. (b) lets
  sessions change the rules that guard them, against part 6 §1. Recommended: (a).
- **Q4. Production keys in the environment** (the audit finding). Recommended: verify, then move them to a
  separate environment the sessions do not run in, by his clicks; a finding against part 1 §2 regardless
  of onboarding.

## 5. Measured by PROCESS #6 on starting (22 Nov 2026)

Read with the harness's own environment read on **BioDefault**, the environment PROCESS, its lane and
the trial's sessions run under. Names only; no value was read, used or shown.

- **Q4, confirmed as far as names go.** The environment's variables include two whose names are
  `BIO_RELEASE_SEED` and `BIO_RATIFY_SEED`. That matches the audit session's report (constraint 6).
  Whether they are production keys is the owner's to say.
- **Tokens already there (bears on Q2 and Q3).** The same environment holds, by name, an admin token and
  a member token for the product, a GitHub token, three Cloudflare tokens with their account ids, and
  sign-in names and passwords for the walks. A network secret for `api.cloudflare.com` is also saved on
  it. What each reaches was not read, and none was used: using one from a process4 session on a
  product's repository or account is outside the approvals (constraint 3).
- **What follows for the design question.** Every session on BioDefault receives all of these, PROCESS
  and its lanes among them (design part 9 section 2: "Nothing physical keeps the token's value from
  another session in the same environment"). So "getting Process4 the tokens" is less a matter of
  making new ones than of deciding which environment holds which, and which sessions run in it.
- Network access is unrestricted. The setup script writes the permissions-management block (design
  part 7 section 5); the session's own settings carry it. The environment names no repositories. Two
  other environments exist on the account: Default and Full.

## 6. The owner's choices (22 Nov 2026), and what was built

His words, as typed in PROCESS #6's session: "1. Decision: yes"; "2. Decision: A"; "3. Decision: A";
"4. Decision: The token created for the product being onboarded should be the token with all the
permissions that will be needed across all stages of process4 driven development across that
product's entire lifecycle. Anything short of those privileges will require me to unnecessarily
create yet another token."

- 1 to 3 as recommended: the onboarding lane (design part 6 section 8), the read-only session he
  starts, settings by his clicks.
- 4 answers a different matter from the one Q4 put. It sets how a product's tokens are made (design
  part 1 section 3; part 7 section 4 act 6; part 9 section 1). It does not say what becomes of the two
  seed values in BioDefault, and is not read as changing "No session directly holds a production key"
  (20 Nov). That is put to him again as one question on his page: are the two seeds production keys,
  and do they stay where sessions run.
- Both are recorded in `process/design-decisions.md`.
