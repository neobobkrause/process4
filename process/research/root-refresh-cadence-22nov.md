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

## Measured: what a quiet wake reads (22 Nov 2026, ~00:40Z)

A read-only worker measured the live sessions' own transcripts (`list_events`, the context size logged
on each model call).

- **ROOT #7:** about 10,500 tokens per quiet wake (326,840 at 19:47Z to 367,682 at 23:47Z, five wakes).
  Steps: the wake turn (~1,700); the wake prompt read through ReadNotifications (~2,550); `p4` writes
  `wakes` and reads `stop` and `roles` (~770); `get_session` on the watcher, ARCH and the coordinator
  (~4,700, the wake prompt's step 3); the reply (~150).
- **Watcher #8:** about 5,700 per quiet wake (224,347 at 20:18Z to 247,160 at 00:18Z). Steps: the wake
  turn (~1,500); the wake prompt (~3,500); reading `wakes`, `roles`, `stop` (~700); the reply.
- Neither does a full state read, a session listing, a re-read of texts, or a git fetch.
- **ROOT #6 on 21 Nov:** about 43,000 per wake (07:48–09:48Z), of which ~34,500 per wake appeared on the
  model call after ReadNotifications, though that result was 4,875 characters. Each wake resumed the
  session on a fresh worker (worker epoch 6 → 7 → 8, remote tools still "pending" at start). The likely
  cause is text the harness re-sends when a session resumes on a new worker; its content could not be
  seen. ROOT #7 also resumes every wake (epoch 22) and shows no such jump. Unconfirmed.

## Conclusion

Quiet wakes now cost about 10,500 (ROOT) and 5,700 (watcher). At those rates a ROOT lasts about two days
of quiet wakes before 50 percent. The near-hourly refreshes of 21 Nov came from the ~43,000-per-wake jump
on that day, a harness effect not caused by anything the process reads, and not seen today. The largest
cost the process controls is the three `get_session` calls (~4,700, about 45 percent of a ROOT wake).
Recommendation: no change now (rule 6: what is measured today is small); watch whether the jump returns.
