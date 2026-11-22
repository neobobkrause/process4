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

## Research, by PROCESS #7 (22 Nov 2026)

**Measured here, in PROCESS #7's own cloud session** (user id 0, ext4): after `chmod -R a-w` on a folder, a
write into it succeeded; after `chattr -R +i` on another folder, a write was refused ("Operation not
permitted"). So the fault as civicsmith reported it is confirmed, and ROOT's `chattr` route works on this
machine. The tool writes nothing into its own copy at run time (its only writes go to the system's temporary
folder: `tool/lib/commands.mjs:68`, `tool/lib/notify.mjs:28,37`), so a copy that truly cannot be written
would not stop it.

**What the read-only step was for.** Build text 1 section 2 gives the copy's guard as its place: "the copy is
outside the product's working tree, so no job commits or edits it". Design part 6 section 1 already says the
tool guards against mistakes, not against a session that sets out to defeat it. Nothing has gone wrong from
the copy being writable: no session is known to have edited a copy. What is measured is only that the
command does not do what the texts say it does.

**Where the step and its words are.** The fetch line (`fetchLine`, `tool/lib/config.mjs:73`) and its test
(`tool/test/util.test.mjs:49-52`); the owner's plain ROOT prompt (`starting_texts/root.md` part A, "make the
copy read-only"); build text 1 section 2; design part 6 section 5 ("Each session fetches a read-only copy
of it"), part 7 section 1 (row "A read-only copy of the process"), part 4 section 11, part 10 section 3;
build text 2 line 122; build text 4 line 39.

## Options (none adds a test, gate, review or stop)

- **A. No change.** The texts keep saying "read-only"; on Claude Code the copy is in fact writable. Cost: a
  rule the process gives that its own command does not keep.
- **B. Say what is true, and drop the step that does nothing (recommended).** Remove `chmod -R a-w` from the
  fetch line, and word the texts as "a copy of the process, kept outside the working files, which no session
  edits": a rule held by text, as part 6 section 1 already accepts for most rules. One line of the tool and
  its test; the texts named above. Removes a step; adds nothing.
- **C. Make the copy truly read-only.** Replace `chmod -R a-w` with `chattr -R +i`. Measured to work here and
  in civicsmith ROOT #1's session. Costs: it is a privileged command in every session's first command, so the
  permission checker judges it at every start (passed once, for ROOT; never measured at a rate); it fails
  where the file system has no such flag, and nothing is known of Codex here; a copy so marked cannot be
  removed without first undoing it.

Rule 6 leans to B: the step guards against a mistake nobody has made, and B removes what does not work rather
than strengthening a guard with nothing measured behind the need for it.
