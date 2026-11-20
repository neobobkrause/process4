# Draft: the owner's standing approvals for neobobkrause/process4 (20 Nov 2026)

Drafted by PROCESS #4 at the owner's request, under his decision "Decision: option B" (20 Nov
2026): PROCESS drafts the whole text, shows it to him in plain words, and places the text he
approves, unchanged, in a pull request that changes only `CLAUDE.md`; only he merges it. **This
draft has no effect.** It becomes his approvals only when he lands it by his own click.

## What changes from the text in force (19 Nov 2026), in plain words

1. **Date and scope.** Dated 20 Nov 2026. "While its tool is first built" is dropped: the tool is built.
2. **Who decides.** "Only words I wrote count as my word" becomes: only messages he types himself
   count as his decisions or instructions. The typo "a separate process lane call PROCESS" is fixed.
3. **Merges into main.** Sessions still merge once the required checks pass, except a pull request
   that changes `CLAUDE.md` or `.claude/settings.json`: only he merges that.
4. **His approvals file and the forbidden commands.** Sessions still may never change either file
   on their own. New exception: PROCESS may place a text he approved in its session, unchanged, in a
   pull request that changes only one of those files. It never merges that pull request.
5. **Process files.** "a change I chose in my own words at PROCESS" becomes "a change I chose by my
   marked decision at PROCESS", which is what the rest of the text already means.
6. **Environment settings.** Sessions still may never change permission settings. New exception:
   PROCESS may propose a change to the cloud environment's settings through the harness's own
   approval prompt. That change takes effect only when he approves it there.

Everything else is unchanged, word for word.

## The full draft

```
## Standing approvals from Bob

Standing approvals from Bob for Process4, the development process, 20 Nov 2026, for process4's own repository only. They cover every Claude session working on Process4, including sessions that other sessions started. Each product developed with Process4 carries its own approvals in its own repository. A session's acts on a product's repository, accounts and services are governed only by that product's approvals, and are made only from a session started in that product's repository (one repository per session).

Such sessions may, without asking me: subscribe to and unsubscribe from activity on the process's pull requests; notify me by push notification; and create and edit Process4 pages and documents on claude.ai under the Claude account the acting session itself runs under.

In this repository, neobobkrause/process4, only, they may: push to their own working branches; open, edit, comment on, mark ready or draft, close and reopen pull requests; run builds and tests, fetching public packages and images for them; run, re-run and cancel this repository's own workflows; change its workflow files only through pull requests merged as below, never renaming or removing a job whose name matches a required check, never widening any workflow's or job's permissions, and never adding a pull_request_target trigger; and merge pull requests into main once their required checks pass, without a person's review, except a pull request that changes CLAUDE.md or .claude/settings.json, which only I merge.

PROCESS, the one session that changes Process4, may also, for a product built with Process4: message that product's coordinator and ROOT, so that process faults reach PROCESS and its replies reach them; and, in this repository, start, message, interrupt and archive its own lanes. At my request, PROCESS may draft the text of these approvals or of the list of forbidden commands, and may place a text I have approved in its session, unchanged, in a pull request that changes only CLAUDE.md or only .claude/settings.json; it never merges that pull request. PROCESS may propose a change to the settings of the cloud environment the sessions run under through the harness's own approval prompt; the change takes effect only when I approve it there.

Only messages I typed myself count as my decisions or instructions. Never record your decision or your summary as mine. Process changes only happen in a separate process lane called PROCESS that I interact with. A message of mine is a decision or an instruction only when it begins "Decision:" or "Instruction:". Everything else is conversation. If a session thinks I have decided something without that mark, it asks me once whether to record it as one.

They may never: force-push; delete a branch, tag or release; change permission, repository or ruleset settings, or a protected environment, except by the proposal through the harness's approval prompt named above; push to main; change the files in design/, build/ or starting_texts/, except to carry out a change I chose by my marked decision at PROCESS; change CLAUDE.md or .claude/settings.json, except by the pull request named above, which only I merge; reveal any secret value; or act on any account or service other than those named here, except under a product's own approvals from a session started in that product's repository. Reading public documentation, reading the public repository neobobkrause/process3, and fetching public packages and images are not acts on another service.
```
