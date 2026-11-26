# A check of the draft design for the notice (26 Nov 2026)

Status: research for PROCESS #17, by a worker. Read at `origin/work/decision-c-design` 55a0974. Nothing else is changed.
References are `design/02-…` line numbers ("02:94") unless another file is named. Findings are numbered, most serious
first. "Miss" means a later module whose code or tests behave differently and is not told. "Needless" means a module
told when some element already knows it is unaffected.

## A. Misses the design leaves open (check 2)

1. **A constant's new value tells no one, marked copies included.** 02:105 tells a module "that holds a marked copy of
   a changed item"; 02:94 makes an item changed only when its means differs; build 2b §6 says "A plain constant's value
   is content: it is widened to its kind unless its comment states one". So `export const LIMIT = 999` becoming `100`
   changes no means, and a user whose test or JSON data file holds `copyOf_pricing_LIMIT` (build 2c S13) is not told.
   The copy mark exists for exactly this case. The tool sees the value change; the job is not asked to declare it
   (02:83 lists no "value" among meanings). For a constant the value is its range, so this also departs from the
   owner's rule.

2. **A user's uses file goes stale when a provider's stated types change, and stays stale.** 02:98 says a uses file
   "depends only on its module's code, its providers' stated types and the facility list", and is rewritten only at the
   user's own push or ARCH's change. Build 2c line 89 says "A change elsewhere does not make it stale", which 02:98
   contradicts. Concrete case: P's `priceOf` stops returning P2's `Day` and returns P2's `Week`. U, which reads
   `.weekday` of the result, is told (priceOf changed). Its told job finds nothing to change and closes unmerged
   (02:122), so nothing pushes and U's file still records `Day` via `priceOf`. When P2 later changes `Week.weekday`,
   U's file does not name `Week`, so U is missed. A later `Day` change tells U needlessly. 02:126 rewrites users'
   files for module-list moves only, not for stated-type changes.

3. **A middle module's worked-out means change without a merge, so its users are never told.** 02:90 counts "the
   errors that can leave it, its providers' included". `notify` works out means only for modules whose files the merge
   changed (record, "How `notify` reads the product", item 2; build 1b command 11). Concrete case: P2's `f` adds
   `@throws {E}`. P's `g` calls `f` and lets E pass. U calls `g` and does not catch, so U names nothing of P2. P is
   told, finds nothing to change in its own code, and closes unmerged. `g`'s range (its errors) has changed, but P never
   merges, `notify` never recomputes P, and U, whose tests now see E, is not told. The "through a middle module" route
   (02:104; build 2c `route`) covers values of P2's kinds that U handles. It does not cover errors, or channels reached
   through a provider, that pass through U untouched.

4. **A test that mocks a provider's member depends on the provider's insides.** Build 2c S12 allows
   `mock.method(binding, '<name>')` on a provider's exported object. If U's test mocks `P.store.save` to control what
   `P.place` does, and P's job changes `place` to stop calling `save`, then no means changes, the change is "insides
   only" (02:96, 02:116), and U's test silently changes what it does. The tool sees both the mock (U's uses file) and
   the change in `place`'s closure. Nothing in the design joins the two.

5. **Package and host versions have no cause, item or told rule.** A change to `package.json` or its lockfile (owned by
   a module under 02:9 and build 2c S10), or to the Node or workerd version in the facility list, changes the
   behaviour of every module that uses the package or host, earlier ones included. The table at 02:72–78 has no row for
   it. The means stop at the module (02:92), so they do not show it. Only 02:106's places outside the standard are
   told, and the facility list is a process file whose change runs no tests (02:9, 02:152). ARCH or the job knows of
   the bump, but no rule says who is told.

6. **"Describing" is not bounded.** 02:96 says that "a type read as 'anything' before and stated after" tells no one,
   in any merge, not only a conversion, and whether or not code changed. An ordinary job that both states `number`
   where the type was read as anything and drops the code that handled strings narrows the domain, and tells no one.
   Even with no code change, a stated type narrower than what the code took (and what a user already hands it) is a
   domain change for that user. The user's check refuses it at its next job, untold. "Read as anything" is not
   defined either: `any`, `unknown`, plain untyped JavaScript, `object`?

7. **A module with no uses file is told only if it "imports" the provider** (02:106). Before its first push every
   module has none, and on a product in conversion that is most modules. One that reads P's files by path, starts P's
   program, or loads P by a computed name is missed. The safety claim at 02:114 ("under the standard a module that
   uses no changed item cannot see the change") does not cover these modules, which are not under the standard.
   Cases 1–4 also contradict it as worded: they are uses of unchanged items that see a change. It holds only for a
   change of means.

8. **Where an element knows, but no rule gives it a route.** 02:75 says a job's fix that would change a used item
   "beyond the work placed goes to ARCH first". ARCH recognizes domain and range changes (02:82), but records only
   changes under the same types (02:82; part 4, line 10). So a job cannot check whether a domain change is "beyond the
   work placed". A job that changes an expected answer in its own tests of a used item, as a "fix" (02:74, "A fix that
   keeps the interface changes none"), changes what users' tests see. The provider's tests, which 02:84 relies on to
   catch accidental changes of meaning, are rewritten in the same pull request, so they catch nothing. This is held by
   text alone. The design should say so, since 02:84 presents the provider's tests as the catch.

## B. Needless notices where an element knows (check 2, second half)

9. **Accepting more tells every use, plain calls included** (02:94). The `map` example affects only a use that hands
   the function on, or that implements or overrides it. A direct call cannot receive a new optional parameter or be
   hurt by a wider parameter type. The uses file already tells `call` apart from `pass on`/`whole` (build 2c), and the
   design uses that distinction for kinds (02:110), but not here.

10. **A function whose handed-back kind changed only in its members tells every caller.** Under 02:108 "A change
    reaches every use of the item", and the function's means differs, so all its callers are told. Build 5 §6 tells
    them only through the kind's own uses, so a caller that reads an unchanged member is not told. The design and the
    build text contradict each other, and the design rules (00:45), so as written it over-tells where the tool knows.

11. **Other known-unaffected modules that are told:**
    - An equivalent rewrite, or "a computed fact wider than the code's effect" (02:116; open item 3). That phrase is
      not defined.
    - A middle module whose every use of a kind is `handed back`, with no test that asserts it, is still told of a
      member added. The `handed back` exception (02:111) is for meaning alone.
    - An item ARCH named (02:82) whose change the merged job did not in the end make. A name "may add …, never
      remove" (02:116).
    - A place outside the standard whose rule names its exact target, for example an S5 path written out to one of
      P's files, is told of every change to P's files (02:106), although the tool knows which file it reads.

## C. Not load-bearing yet: terms two builders would build differently (check 1)

12. **The rules that decide "reaches" are in build 5 §6, not the design.** The design (02:108–112) lacks these:
    - which changes to a kind are "any other change" (constructor, index or call signature, bound line, what kind it is);
    - a member whose kind changed inside another kind;
    - a function told through the kinds it hands back (finding 10);
    - a changed handle-kind method reaching the whole value's uses;
    - for the `handed back` exception: "none a marked copy", the order of deciding (last module to first), and "a
      module whose later receivers are all left untold stays told".

    The related-tests definition ("piece", "calls", "reaches", losing the thread) is only in build 5 §7, and the
    closure only in build 5 §6. Part 0:45 says build texts "change no rule", yet these are rules (marked "Decided
    here"). The plan `design-to-build.md` lines 42–46 would cut build 5 §6 to a pointer to the design. That would
    delete rules the design does not hold.

13. **"Whole value"** (02:98, 02:110) is a closed list: hands on, returns, stores, compares, iterates, writes as text.
    Build 2c adds spread, listing members, copy, taking a rest, and the default "anything the tool cannot prove is one
    of the others". The default is what makes the list safe, and the design leaves it out.

14. **"Meaning" is never defined.** 02:70 has "meaning under the same types"; 02:91 and 02:111 have "meaning under the
    same means". These differ: errors, `this` and channels are in the means but not in the types. 02:83 gives only
    examples in parentheses. A reader cannot tell whether these are meaning, which the job declares, or a "fix", which
    tells no one: a different rounding, a reordered list, a changed error message, a slower answer, a changed log
    line. Because "the insides only" (02:96, 02:116) is defined as "no means changed and nothing declared", it is
    circular: an undeclared change of meaning counts as insides by definition.

15. **"Domain/range" and "meaning" are set side by side.** 02:70 and 02:82–83 say "domain or range, or its meaning".
    Part 0:65 defines the interface as domains and ranges. The owner's rule ("if both domain and range stay the same,
    then no retesting") then reads as excluding meaning-only changes, yet the design tells them. 02:87 ("the checkable
    form of its domain and range") suggests meaning is the part of domain and range that types cannot show. The design
    should say so once. Otherwise it departs from his words.

16. **Smaller gaps:**
    - "A middle module is told only where its own file names the item" (02:104). Under build 2c R11 every value
      handled is attributed, so it is unclear when this ever excludes a module.
    - "a message kind" as an item (02:87). Build 2b §6 has no message entry, and part 10 §2 item 10 leaves messages'
      form unsettled.
    - "at once or later" (02:90). Is it stated or worked out? Build 5 §6's worked-out list omits it.
    - "the provider's files" (02:106). Does this include its requirements file?
    - "holds its value under a name of its own" (02:110).
    - "a lane's design says what the product will do differently, never which items" (02:82). Is this a rule for the
      lane, or a statement of fact?

## D. Contradictions and duplicates (check 3)

17. **Accepting more is stated as a ruling and also as open.** 02:94 states it with no mark. Part 0:25 says "A rule
    with no mark is the owner's ruling". Part 10 item 2 says it is open, and the record ("Who a change tells", item 3)
    says the opposite. The plan changes the tool and the starting texts to tell on accepting more (`design-to-build.md`
    lines 10–30) while its own "Not changed" waits on his word. On substance the owner's rule supports telling: the
    `map` case is a real change of domain. The rule needs an **Open** mark at 02:94 until he decides.

18. **"Later module" against order faults.** 02:102 says "tells each later module", and 02:114 says "an earlier module
    cannot use the provider". But 02:106 tells "an order fault naming it", which is an earlier module that uses the
    provider.

19. **"Once" against "twice".** 02:102 says each module is told "once". Build 1b command 11 says "once for each module
    whose files the merge changed … Costs: a user can be told twice". The plan does not list this.

20. **Retesting is not the same for an open job and a told job.** An open job that gets a notice always runs its tests
    again (02:34, 02:56, 02:120). A told job that finds nothing to change runs none (02:122). The open item 4 should
    name both.

21. **One lasting tranche branch against an urgent fix.** Part 3:8 says there is "one lasting tranche branch". Part
    3:70 builds the urgent fix "as its own tranche from the main branch". This was there before the draft. The draft's
    "told as any" (part 3:70; 02:78) leaves open which tranche the fix's own notices go to.

22. **Rules with more than one home:**
    - ARCH deciding interface changes: 02:74, 02:82, 02:143, and part 4:10.
    - A notice reaching an open job: 02:34, 02:56, 02:120.
    - The test scope: 02:56–57, 02:121, 02:124, build 1 §5, and `job.md` line 3.
    - Uses files rewritten at a push or a list change: 02:98, 02:126, 02:150, build 1b command 2.
    - "Every requirement tested at the interface": 02:60 and 02:84.
    - Describing: 02:96 and build 2b §6 (the plan fixes this).
    - Who is told: 02:102–112 and build 5 §6, which differ (findings 10 and 12).

23. **Build and starting texts out of step with the draft** (to list, not fix). The plan does not cover:
    - build 1b command 11, told twice;
    - build 2c line 89, "does not make it stale";
    - build 2c's `value` list against 02:98;
    - build 2b's entries, which have no message kind;
    - `job.md` rule 4, which lacks "the order of two values of one type" and the bound line;
    - `arch.md`, whose reading set (02c, 03, 05) leaves out build 2b §6's words, though 02:82 asks ARCH to recognize
      changes of means.

    The plan's own figures put a job's reading set at 174,554 and ARCH's at 174,690 bytes, within 450 bytes of the
    175,000 maximum (part 5:21).

## E. The owner's form (check 4)

24. **Product, harness and host names in parts 1–6.** Part 2:100 names "Node's and workerd's facilities"; workerd is
    the hosting provider's runtime (part 0:12). Part 6:15 (`shims/claude-settings.json`), 6:22 ("Claude Code …
    Codex") and 6:23 (`CLAUDE.md`, `.claude/settings.json`) name the harness. These were there before the draft.

25. **Quotations.**
    - "changed" and "unchanged" (02:94) and "anything" (02:96) are in quotation marks but are not his words. Under
      part 0:21 they pass only as names of terms. Plain words would be safer.
    - The domain-and-range rule at 02:68, quoted as his, is in no entry of the record of decisions. Searching both
      decision files finds it nowhere. Part 0:21 asks for the record to be named where a quote comes through one. The
      record should carry his words with their date.
    - "in the words of the record" (02:61) does not say which record.
    - "(R13)" (02:89) and "(rule 3)" are codes in prose he reads.

26. **History.** Part 10 item 2 explains the open item by what the record said earlier. That is acceptable for an open
    item. 02:94's "accepting more included" reads as an answer to the old rule. No options and no "as today" were
    found in parts 1–6.

## F. New rules, and added tests, stops or reviews (check 5)

27. **New tests, stops and reviews:**
    - **A new test duty.** 02:84 says the provider's tests cover "a program the module starts … through the item that
      starts it". This adds to what tests must cover, and it rests on no record entry.
    - **A widened stop.** 02:75 and 02:143 ("does not build it until ARCH decides") now cover every change of domain.
      With accepting more counted as one, a job that adds an optional parameter now waits for ARCH.
    - **A new step before every placement.** 02:82 has ARCH work out every item's domain, range and meaning, and their
      users from the uses files, before it places any work. Before the draft ARCH named only changes of meaning. It is
      held by text and produces no record (finding 8).

28. **New rules (not statements of existing ones):**
    - Accepting more tells its users (02:94), against the record.
    - The mechanical-edit exception (02:112). It is in no record entry and narrows who is told.
    - The urgent fix's taking-in merge is told (02:78; part 3:70).
    - What a started program writes is meaning (02:91).
    - "The order of two values of one type" as a declared meaning (02:83).
    - The `handed back` meaning exception (02:111) was in build 5 §6 before. It is now in the design, but in a shorter
      form (finding 12).
    - The three new open items (part 10, items 2–4) are questions, not rules.
