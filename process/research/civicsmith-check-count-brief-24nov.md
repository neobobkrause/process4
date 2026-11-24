# A read-only count of the check's refusals on civicsmith, before it moves (brief, 24 Nov 2026)

Written by PROCESS #11. The update the owner decided on 24 Nov ("the update plan as laid out"; built in pull request 233)
changes what `check` refuses: it now also reads `require('<path>')` and imports by the product's own package name, so an
undeclared one of those is now refused; and a declared use with no import it can see is "cannot tell" instead of refused.
How many refusals this adds or removes on civicsmith is not known (`module-uses-23nov.md`; the plan, item 5). This brief is
for a read-only session the owner starts on civicsmith-copy; it changes nothing and its report comes to PROCESS.

The update ran cleanly on the trial product (24 Nov, about 21:40Z): ordinary jobs, a merge that waited, and a notice that
reached an open job (process3-probes ARCH #4's account).

## The prompt (given whole to the read-only session)

```
You are a read-only reading session on neobobkrause/civicsmith-copy, for PROCESS of Process4. Change nothing: no commit, no
push, no pull request, no comment, no record of the shared state; write files only under /tmp. Report at the end.

1. git fetch origin p4-tranche, and work at the tip of origin/p4-tranche (detached). Note its commit id.
2. Read process.json: note process.commit (the pinned version; call it OLD).
3. Clone https://github.com/neobobkrause/process4 twice, outside the repository: /tmp/p4-old at OLD, and /tmp/p4-new at the
   newest commit of its main (note that commit id; call it NEW). In each, cd tool and npm ci.
4. For every module in the product's module list (the names in process/modules/order.txt, or as process.json's module list
   says), run from the repository root, with a generous memory allowance where needed:
     node /tmp/p4-old/tool/p4.mjs check <module>   > /tmp/old-<module>.txt 2>&1
     node /tmp/p4-new/tool/p4.mjs check <module>   > /tmp/new-<module>.txt 2>&1
   Each prints "Check of <module>: N disagreement(s)" or "no disagreement found", one line per disagreement, and one line per
   "cannot tell". Run modules one at a time; a module that crashes or runs past 10 minutes is noted and skipped.
5. Report, in plain words and short:
   - the two commit ids and the tranche commit;
   - modules passing under OLD and under NEW, out of how many;
   - total disagreements under OLD and NEW, and the change;
   - each module whose result changed: OLD count, NEW count, and the NEW disagreements grouped by kind with up to three
     examples each (file:line and the line printed), especially refusals naming require(...) or an import by the
     product's own name;
   - how many "cannot tell" lines say a declared use has no import seen;
   - any crash, timeout or out-of-memory, with the module.
Send the report by message to PROCESS (its session is named "PROCESS #<n>" in the account's session list; the newest one)
if your approvals allow; otherwise end your turn with it, and the owner passes it on.
```

## What PROCESS does with the report

Records it here, beside this brief, and puts the numbers to the owner in plain words before civicsmith moves. A refusal the
update adds is a product matter for civicsmith's ARCH to correct by its jobs (an undeclared import declared, or a use of a
later module reshaped), not a process change; unless the count shows a fault in the check itself, which is put to the owner
with options.
