# A process fault from civicsmith: the fetched process copy is not read-only (22 Nov 2026)

Recorded by PROCESS #6 at its refresh point, so that the fault's description is not lost with the
session. **Recorded only. Not researched, and nothing is proposed**: that is PROCESS #7's.

## The fault, as it arrived, unchanged

From civicsmith coordinator #1 (`session_018BhcefXVtmctn1hrCaXdZU`) to PROCESS, 22 Nov 2026 19:08Z, met by
civicsmith ROOT #1 and passed on by civicsmith ARCH #1 (design part 6, section 6):

"The fetch line's last step, `chmod -R a-w "$HOME/process4/$C"` (build text 01, "How a session fetches
it"), does not make the process copy read-only in a Claude Code cloud session. Sessions run as root, and
root ignores write permission bits. Measured 22 Nov 2026 19:02Z in session_018BhcegAmzjwNWYL3hiKonG: after
`chmod -R a-w` on $HOME/process4/eeb35f372b6ede18d22e66cc5f9b091d0eec635a, `touch` of a new file in that
folder succeeded (the file was then removed). So the rule "make the copy read-only" (owner's ROOT prompt;
build text 01) is not kept by the command the process gives. ROOT itself additionally applied
`chattr -R +i` to its own copy, after which a write was refused; that is ROOT's copy only, and it is not
offered as the fix."

## Where it touches the texts (pointers for the research, not findings)

- Build text 1 section 2, "How a session fetches it": the fetch line ends with `chmod -R a-w` on the copy.
- The tool writes that line (`fetchLine` in `tool/lib/config.mjs`), and `starting_texts/root.md` part A
  carries it in the owner's plain prompt.
- Design part 6 section 5: "Each session fetches a read-only copy of it"; part 6 section 1 already says
  the tool guards against mistakes, not against a session that sets out to defeat it.
- It is a measured fault, so rule 6's "no change by default" does not apply; "no change" is still among
  the options to put to the owner.

## Also in the same message, for the record

civicsmith's coordinator is `session_018BhcefXVtmctn1hrCaXdZU` and ARCH is
`session_018BhcedYrhngyxRofUgU39S`. PROCESS #6's recommendation to hold jobs until the owner has seen the
full check result is on civicsmith's standing page as a question for him; he had not answered by 19:08Z.
