# Research note: why the trial's ROOT refreshed about hourly on 21 Nov (22 Nov 2026)

Recorded by PROCESS #5 at the owner's request ("Ask ROOT why it's refreshing every hour", 22 Nov
2026). Source: process3-probes ROOT #7's facts-only answer (22 Nov, ~00:31Z), drawn from the archived
sessions' own records (`get_session` `context_usage`, post-turn summaries) and handover-root
generation 6; and the account session list. Not yet a proposal.

## The facts

| Refresh | When (21 Nov, UTC) | Trigger | Fill at handover |
|---|---|---|---|
| ROOT #4 → #5 | ~03:48–03:54 | fill level | 505,367 tokens (~50.5%) |
| ROOT #5 → #6 | ~04:49–04:54 | fill level | 555,719 tokens (~55.6%) |
| ROOT #6 → #7 | ~09:48–09:51 | natural pause, precautionary | 416,965 tokens (~42%) |

ROOT #7 has held the role since ~09:51Z on 21 Nov. The stop had been lifted (~22:16Z, 20 Nov), so the
product was quiet, not stopped.

## Why

- Each ROOT is the former watcher (design part 4, section 6). The watcher wakes hourly and its context
  grows at every wake. The ROOT #5 session had been watcher #5 for about seven hours and became ROOT
  already near half full, so it crossed 50 percent within the hour. The fill clock runs from the
  session's start as watcher, not from its start as ROOT.
- Rough rate from these figures: about 70,000–80,000 tokens of context per hourly wake, for the
  watcher and for ROOT alike, with nothing else happening. At that rate a ROOT or watcher session lasts
  about six to seven hours before the 50 percent refresh, and a watcher that waits long takes over
  close to it.
- Not yet known: what each wake reads that costs that much (a full shared-state read, a session listing
  and the starting text re-read are candidates). That is the measurement to make before any change.

## Judgement

Working as designed; no fault in the refresh rule itself. The cost is the size of each quiet wake.
Whether to change anything is the owner's; a finding is "no change" by default until the per-wake
cost is measured (rule 6).
