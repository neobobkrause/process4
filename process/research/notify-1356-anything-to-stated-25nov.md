# `notify 1356` (setup-words): 164 listings changed, 198 told, and a 422 refusal (25 Nov 2026)

A process fault from civicsmith ARCH #17, passed unchanged by coordinator #8 at 03:14Z:

> "p4 notify 1356 (setup-words' merge), run on 124ed528 from 03:16Z to ~03:14Z+, printed: 164 module(s) changed their
> listing; 2143 entries changed in a way that tells; 198 user(s) told. It added the notice to the job blocks of seven open
> jobs (doc-clean 1384, sheet-worker 1387, op-grades 1389, queue-producers 1391, queue-catalogue 1392, translations 1394,
> screens-intake 1364), then ended 'p4 notify: GitHub refused: gh: Validation Failed (HTTP 422)', exit 1. No
> process4-notice comment for the other users and nothing in waiting work (0 entries for 1356). sheet-worker 1387 was
> merged by ARCH at about the same moment the notice reached its block, so its 1356 notice now sits on a merged pull
> request and reaches no job. Many told entries are setup-words' own exports (PSEUDO_PATH, ROWS_PATH, WORDS_PATH,
> WORD_ROWS, build, callsOf, combine, extract, word, hasWord) and every module's DECLARED_OPS kinds where description
> went from anything to string."

ARCH does not re-run it until PROCESS says.

## What it shows

1. **An unknown kind becoming known ripples through the product.** setup-words' job added structured comments and
   changed one word. Its comments now state kinds the reader inferred as "anything" before (e.g. `word` hands back a
   string). Every later module whose `DECLARED_OPS` takes a description from `word` now has that member as `string`
   where it was `anything`, so 164 listings changed "through" setup-words with no change to their own files, and 2,143
   entries "tell". The running code is the same; only what the reader knows changed. The design's rule for a module's
   first comments step (a comments-only change sends no notice) does not reach it, because the same merge changed a word
   and the module had some comments before.
2. **The 422.** One write was refused with "Validation Failed". Which write is not known: the eighth job block, or a
   notice comment. `util.mjs` keeps only the first three lines of `gh`'s error output, and `gh api` puts GitHub's message
   body on its standard output, so the reason ("body is too long", or another) was lost. A job block that gathers a
   large notice (2,143 entries) can pass a comment's size: the known limit named in the decision of 25 Nov.
3. **A notice to a job merged the same moment** reaches no one (sheet-worker 1387): the race between `merge` and a
   background `notify` that decision B of 25 Nov (merging goes on) accepts; such a module should get a told job instead.

## Options

- **A. No change.** Each such merge tells nearly the whole product; told jobs by the hundred.
- **B. An unknown kind becoming known is a description, not a change (recommended).** Where an entry's kind, at some
  place, was "anything" before and is a stated kind after, that difference tells no one, as a module's first comments
  step tells no one today (design part 2, section 7, which already says describing a module as it stands sends no
  notice). Any other difference in the same entry still tells. With it, keep each job block's notice part under the
  comment limit (the reasons beyond it read from the notice comments on the merged pull request, as waiting work now
  does), print GitHub's full refusal, and treat a told job merged before its block was written as having no open job.
  Then re-run `notify 1356`, `1339` and `1340`. Tool change with tests; replay must hold.
- **C. B without the first part.** Fixes the losses, keeps the ripple.

Not known until a re-run with B: how many of the 2,143 entries and 198 users remain.
