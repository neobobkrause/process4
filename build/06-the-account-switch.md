Length: 156 lines. Last section: "7. Unproven, and not settled here".

# Process4 build text 6: the account switch

Beside the design (`design/`, "the design"). **Status: proposed. Nothing here has
run.** It answers item 11 of the design's part 10, section 2 ("The steps of an account
switch, and what is read to show that it lost no work"), and build text 4, stage 7.
It adds no rule to the design, and no test, gate,
review or stop. It elaborates the design's part 4, section 7 ("the one way back") for the
case of a switch of account; where it and the design differ, the design rules.

Marks: **Decided here:** a choice of this text, which the owner or PROCESS can overrule.
**Unproven:** never shown to work. Every claim here is unproven until the
trial (stage 7, item 15).

## 1. What an account switch is

- An account switch moves Process4 development, or a product's development, to another
  Claude account — the account the sessions run under (the design, part 0, section 6;
  part 7, section 5). It may coincide with a switch of the GitHub account the sessions
  act as, or of the hosting account a product deploys to; each of those is the owner's
  own act in the new account (the design, part 7, section 4; part 9).
- **PROCESS and the products it serves run under one Claude account.** Their coordination is
  session-to-session messaging, which the harness scopes to a single account — a session
  reaches only its own account's sessions (the design, part 7, section 3). So PROCESS cannot
  reach a product's sessions, nor they PROCESS, across accounts, and cross-account
  PROCESS↔product coordination is not built. An account switch that moves a product PROCESS
  serves therefore moves PROCESS to the same account, keeping the two together; they are not
  split across accounts (the owner's decision). A future cross-account
  arrangement would need a coordination channel this process does not have.
- It is **the one way back** (the design, part 4, section 7) with the owner's new-account
  acts done first: a full stop, then the owner's acts in the new account, then he starts
  ROOT, and ROOT rebuilds everything from the shared state and the repository.
- **Decided here:** it is not a new mechanism. Nothing is built for it; it reuses the
  stop, the owner's start of ROOT, and the restart-from-state the design already has. This
  text sets down only the order and what is read to confirm it lost no work.

## 2. What carries over, and what changes

**Carries over, because none of it lives in the Claude account:**

- The repositories, their branches and their open pull requests, on GitHub.
- The owner's committed approvals and forbidden commands, in each repository (the design,
  part 6, section 2).
- The shared state, as comments on the shared-state issue on GitHub (the design, part 4,
  section 4); the round, waiting-work, standing-notes, lanes and handover records with it.
- Each open job's branch, its pull request, its job block, its record and its test record
  (the design, part 4, section 11; build text 5, section 5).

**Changes, because it is account-bound:**

- The sessions themselves: every old-account session ends; new sessions run under the new
  account. Their addresses change, which is why roles are named, not addresses (the
  design, part 4, section 4; part 4, section 11).
- The connection of Claude to GitHub as the sessions' account, and the Claude GitHub App
  on both repositories (the design, part 7, section 4, acts 5).
- The secret values in the new account's cloud environment: the deploy token and any
  others (the design, part 1, section 3; part 7, section 4, act 6; part 9).
- The permissions-management settings the new account's environment must carry (the
  design, part 7, section 5): the `autoMode` block that tells the checker the process's
  and products' repositories and the roles' cross-session, cross-repository acts are
  internal and sanctioned.

## 3. The owner's side, in order (before ROOT)

**Decided here,** from the account-bound subset of the design's part 7, section 4, and
part 7, section 5. The owner does these; no session can (the design, part 1, section 3).

1. Tell the coordinator to stop (the design, part 4, section 7): open jobs push and stop,
   and the coordinator writes the stop record.
2. In the new account: give the sessions' GitHub account write access to both
   repositories if it is a new GitHub account too (the design, part 7, section 4, acts
   1–2); otherwise the existing one stands.
3. Connect Claude to GitHub as the sessions' account, and install the Claude GitHub App on
   both repositories (act 5).
4. Make or carry the deploy token and enter the secret values in the new account's cloud
   environment (act 6; part 9), and, for a journey that uses AI, connect the AI account
   (part 1, section 3).
5. **A session confirms the new account's cloud environment carries the permissions-management
   settings,** and where they are missing proposes the change, which the owner approves with a click (the design, part 7, section 5). This is the check the account switch adds. Without it the checker refuses the
   roles' cross-session and cross-repository acts (part 7, section 5), and the restart
   below cannot complete.
6. Start ROOT, with the plain prompt, on the product's repository (act 9). The prompt may
   mention that this follows a switch from another account (the design, part 7, section 4;
   the ROOT prompt, `starting_texts/root.md`, part A).

The repositories' settings and branch rules (acts 3, 4 and 10) do not change at a switch;
they are GitHub's, not the account's.

## 4. The sessions' side, in order (the one way back)

**Decided here,** the same restart the design's part 4, section 7 gives, read for the new
account:

1. ROOT fetches the newest copy of its branch and the process copy; it stops if it cannot
   (`starting_texts/root.md`, rule 1).
2. ROOT reads the roles and lanes records. They name old-account sessions; this is a
   restart. ROOT archives every session still named in the roles and lanes records but
   PROCESS, and every open job's session (the design, part 4, section 7). **Unproven:** whether a
   session under the new account can archive a session that ran under the old one; where
   it cannot, those sessions are left to end on their own and ROOT notes it.
3. ROOT starts the standing roles afresh — the watcher, ARCH and the coordinator — and
   records each one's address in the roles record (the design, part 4, section 5).
4. The coordinator reads the stop record; the owner lifts the stop the usual way once the
   restart is confirmed (the design, part 4, section 10).
5. ARCH starts a new session for each module with an open pull request, continuing from
   its branch and pull request. The round goes on from the round record (the design, part
   4, section 7; part 3, section 1).
6. A process change that was mid-flight at PROCESS is resumed by the owner starting PROCESS
   in the process's repository, surfaced by the coordinator on the owner's standing page
   (the design, part 4, section 5; part 6, section 7).

## 5. What is read to show it lost no work

**Decided here.** After the restart, ROOT and ARCH read, and the coordinator reports to
the owner in one account, that each of these is intact and continued — none of it was in
the Claude account, so each should read exactly as before the switch:

- The **round record**: the tranche, the round, the areas named, and every module's state.
  Each module the record shows open has its open pull request on GitHub; each shown blocked
  has its blocked record; each shown finished is merged, or closed with its nothing-to-change
  record (build text 5, section 2).
- The **waiting-work record**: every notice and flaw placed against a module is still there
  (build text 5, section 2).
- The **standing-notes record**: a held merge, a module put first, a slot number or a
  full-walk request still stands, unless what ends it has come true (build text 5, section 3).
- GitHub's **open and merged pull requests**: every open job pull request has a new session
  continuing it (step 5); no merged pull request was lost.
- The **handover records**: each standing role's successor started from its handover and the
  shared state, not from memory (the design, part 4, section 5).

**Decided here:** nothing is lost when the round record's open and blocked modules match
GitHub's open pull requests and blocked records one for one, and every open pull request has
a live new-account session against it. The coordinator puts this confirmation on the owner's
standing page. **Unproven:** that this reads clean after a real switch.

## 6. Where this sits with the owner

- The generic order above is **Decided here** and overrulable. The account-specific
  particulars — which second GitHub account, which Cloudflare account, which hosts and
  tokens — are the owner's, from his new account (the design, part 7, section 4; part 9,
  section 3). This text does not name them.
- The switch is rehearsed in trial stage 7 (build text 4, section 3, stage 7; the design, part 10,
  section 4, item 15), which asks the owner for his acts in a second account. It is left to
  last because nothing else rests on it.

## 7. Unproven, and not settled here

1. Everything here: the account switch has never been shown to lose no work.
2. Whether a new-account session can archive an old-account session (section 4, step 2).
3. Whether the new account's permission checker passes the roles' sanctioned cross-session
   and cross-repository acts at a real rate (the design, part 7, section 5, is probabilistic;
   only `permissions.deny` is an absolute gate).
4. What is read of the hosting account to show a product's development deployment carries
   over, or is remade, after a switch of the hosting account (the design, part 9, section 3).
5. The Codex side of an account switch, which is not known (the design, part 8).
