# Where Process4 says a product's repository holds no secrets

Written by PROCESS #9, 23 Nov 2026, from a read-only worker's search of the whole repository (design, build texts,
starting texts, shims, tool, workflows, PROCESS's folder, the civicsmith lane's folder, CLAUDE.md, the owner's page).
The owner said, 23 Nov: "Process4 keeps getting caught up with this false rule that it holds that a product's
repository can hold no secrets. That is not the case." (conversation, not a marked decision.)

## The one governing statement

- `design/07-harness-claude-code.md`, section 4, act 3: "Set each repository's settings: merges by merge commit, no
  automatic merging, no automatic deleting of branches, a read-only token for GitHub's machines, no repository
  secrets." It applies to every repository, a product's among them. The text gives no reason and no source; no entry
  in either decision file cites it, and the owner's quoted words nowhere state it. It was already in the act list
  before the 19 Nov trial (build text 4 refers to acts 1 to 8 by number).
- Governing texts that lead to it only by reference: design part 6, section 2 ("the ordered list of his acts ... is in
  part 7, section 4"); build text 4, sections naming "acts 1 to 8".

## Rules that are different, and stand

- Design part 2, section 6: "Module tests run in two parts, so that product code under test holds no access token."
  This is the required run: its second part holds no GitHub workflow token (`shims/module-tests.yml`, `NO_TOKENS` in
  the tool). It says nothing about a repository's secrets. PROCESS #9's note `repository-secrets-22nov.md` wrongly
  gave it as act 3's reason.
- The development deployment "holds no secrets" (design parts 0 and 9): about the deployed site, not the repository.
- The secret values the process itself uses (the deploy token, the production signing keys, a release token) are kept
  in the sessions' cloud environment (parts 1, 3, 7, 9; the owner's decisions of 20 and 22 Nov). Where the process
  keeps its own secrets; it forbids nothing else.

## Session-written texts built on act 3 (records and research, not governing)

civicsmith lane: `research/process4-for-a-product.md`, `research/starting-a-product.md` (which flagged the conflict
and left it open), `process-points.md`, `conversion-plan.md`, `settings-checklist.md` ("[ ] No repository secrets";
"remove it at setup, as act 3 says"), `tokens.md`, `research/civicsmith-copy-reading-2.md`, `reading-brief-2-tokens.md`.
PROCESS: `research/product-onboarding-22nov.md`, `research/repository-secrets-22nov.md`, `handover.md`, and the
owner's page item of 22 Nov (now withdrawn).

## Options

- **A. No change.** Act 3 keeps "no repository secrets"; sessions go on putting it to him.
- **B. Remove the words "no repository secrets" from act 3 (recommended).** A product's repository may hold the
  secrets its own workflows use; that is the product's matter. Nothing else in the design changes: the required run's
  second part still holds no token, and the process's own secrets stay in the cloud environment. The lane's checklist
  item, the earlier research's recommendations and the handover line are marked as resting on the removed words, in
  place. Removes a rule; adds no test, gate, review or stop. No product needs to move: no tool or starting text changes.

## Outcome

The owner chose B, 23 Nov 2026 ("Decision: B", a comment on his page). Act 3 lost the words; the session-written texts
above carry a withdrawal note in place. Entry "A product's repository may hold secrets" in `design-decisions-2.md`.
