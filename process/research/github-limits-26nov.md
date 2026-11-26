# GitHub's limits: what process3 had, what Process4 has (26 Nov 2026)

Asked by the owner, 26 Nov ~22:35Z: "Does process4 still have the same safeguards that process3 had to ensure that it
doesn't exceed github limits? If not, then we need to explore adding that tooling back into the process." Raised by
civicsmith ARCH #32's fault (three parallel `notify` runs blocked by GitHub's secondary rate limit; see
`unconverted-told-every-merge-26nov.md`). A worker read process3 (public; final tool on its `tranche` branch, R17 at
`421fb81c^`), Process4's tool and texts, and GitHub's docs.

## Process3, at its end (PD-22, 9 Nov), code unless marked
- 85% target on published limits (`tool/lib/pace.mjs:17,34`; rule P27, text).
- A budget gate: before a job or lane start, read GitHub's free `/rate_limit`; refuse the start at 85% of the primary
  REST or GraphQL bucket (`pace.mjs:77-100`).
- Recognised secondary limits, 403/429, `retry-after`, `x-ratelimit-remaining: 0` (`pace.mjs:60-71`); waited
  Retry-After, then the hot bucket's reset, then `x-ratelimit-reset`, else 60 s (`pace.mjs:107-117`); at most 3 calls;
  a wait over 15 minutes refused at once, naming when to rerun (`util.mjs:258-270`); a rate-limited push stopped.
- `p3 github budget` showed quota; a read cache (30 s open PR, 6 h merged); a state lock per clone; all of a command's
  state writes in one push.
- **Notices were files on a state branch, all of one merge's in one commit** (`notice.mjs:193`), not comments. This,
  more than any pacing, is why process3 never made such a burst.
- Retired by PD-22 ("The secondary limits (points and content a minute) are no longer counted: GitHub's refusal of
  them is obeyed when it comes."): content 80/min and 500/h windows counted account-wide per call; 1 s between writes;
  an account-wide pause on refusal, a stop on a second; a usage ledger and hook; a push ceiling.

## Process4 today
- Text: design part 6 §3 "GitHub's published limits are kept to: sessions stay within them with a margin and obey
  GitHub's own rate-limit responses"; build text 1 §3; build text 5 §1.
- Code (`tool/lib/util.mjs:34,55-70`): a write that meets "rate limit|HTTP 429|abuse" waits Retry-After, else 60 s,
  up to four times. Inferred: `gh api` prints no headers without `-i`, so Retry-After is never seen and every wait is
  60 s (about four minutes in all); no `x-ratelimit-reset`, no growing wait, no `/rate_limit` read.
- Push at most 6 a minute (per machine, `commands.mjs:74-83`); merge at most one a minute into a branch
  (`commands.mjs:551-553`); comments split at 60,000 characters.
- None: pacing of comment, issue or pull-request creation; any limit on parallel `p4` commands; any shared pause.
  `writeNotice` writes every part back to back (`noticecomments.mjs:84-88`); `notify` edits each told job's block in a
  loop (`notify.mjs:173`).

## GitHub's published secondary limits (docs.github.com, read 26 Nov)
At most 100 concurrent requests; 900 REST points a minute; 80 content-creating requests a minute and 500 an hour. On a
limit: wait `retry-after`; if `x-ratelimit-remaining` is 0, wait until `x-ratelimit-reset`; otherwise at least a
minute, longer each time, then fail. Best practice: requests one at a time, at least one second between writes;
"Continuing to make requests while you are rate limited may result in the banning of your integration."

## Judgement
Process4's tool does not keep design part 6 §3: nothing keeps content creation under 80 a minute, and its retry hits
GitHub again every 60 s while blocked, the pattern GitHub warns can lead to a ban. Measured failure: 26 Nov, three
notifies blocked, three notices owed, a job unable to open, the account's writes blocked for every repository. So a
correction is in order (rule 2: it corrects the tool to keep an existing rule; it adds no test, gate or stop).

## Options (to put with A of `unconverted-told-every-merge-26nov.md`)
- **0. No change.** With A the 199-module bursts end; any other large write (a provider many modules use, after the
  sweep) can still trip the limit, and the retry still hammers.
- **G1. Pace writes.** Every content-creating write (comment, issue, pull request, comment edit) at least one second
  after the last, counted across this machine's `p4` commands as `push` already is (GitHub's own advice; under 80 a
  minute). Cost: a notice of N parts takes about N seconds, in the background; merges unaffected. Jobs write a few
  comments each and are on their own machines.
- **G2. Correct the retry.** Read the response headers; wait Retry-After, else until `x-ratelimit-reset`, else a minute
  doubling each time; after the fourth, fail naming the time to rerun. No cost in normal running.
- **G3. Bring back process3's account-wide counting, budget gate and shared pause.** Retired by process3 itself as cost
  without benefit; it needs a shared ledger Process4 does not have. Not recommended.
Recommended: A + G1 + G2.
