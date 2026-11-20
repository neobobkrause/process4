Length: 76 lines. Last section: 3. Implications for a conversion plan.

# Converting a running ~200-module product onto Process4: best practice

Research note, 20 Nov 2026. Sources are primary where possible; vendor and conference reports are self-reported.

## 1. Practices

**1.1 Strangler fig (incremental replacement, no big-bang rewrite).**
Summary: grow the new structure around the old system and move behaviour over in small releases until the old part can be retired; avoid a single rewrite. Fowler notes this usually means modifying the legacy code, and that it lengthens the period in which two ways of working coexist.
Applies: bring modules under the process one at a time while the product keeps shipping; a module is "converted" only once its requirements, interface declaration, tests and CI gate exist. Unconverted modules keep running as they are.
Source: https://martinfowler.com/bliki/StranglerFigApplication.html

**1.2 Branch by abstraction.**
Summary: put an abstraction in front of the code being changed, move callers onto it, then swap the implementation behind it, keeping trunk releasable throughout (no long-lived branch).
Applies: the machine-readable interface declaration is that abstraction. Declare a module's interface first, point callers at it, then let agents restructure behind it. Works with the "earlier modules only" rule: callers depend on the declaration, not the internals.
Source: https://martinfowler.com/bliki/BranchByAbstraction.html

**1.3 Patterns of Legacy Displacement: thin slices, transitional architecture.**
Summary: choose a thin slice (by product line or value stream) to move first; accept temporary "transitional architecture" that exists only to ease the move and is removed afterwards. Warns that journeys spanning moved and unmoved parts cause trouble.
Applies: pick the first slice as one user journey end to end, not one technical layer. Record shims and adapters as transitional modules with a removal condition so they do not become permanent.
Source: https://martinfowler.com/articles/patterns-legacy-displacement/

**1.4 Enforce dependency direction with a tool, using a baseline of known violations.**
Summary: dependency-cruiser checks `forbidden`/`allowed` rules and cycles in CI; `depcruise-baseline` records today's violations so new rules can be adopted on a codebase that already breaks them, failing only on new ones (`--ignore-known`). Nx's `@nx/enforce-module-boundaries` does the same via project tags and `depConstraints`.
Applies: derive the ordered module list from the real import graph, encode "may only import earlier modules" as a rule, baseline the existing back-edges and cycles, and make the check a required CI job. Burn the baseline down; never add to it.
Sources: https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md ; https://nx.dev/docs/features/enforce-module-boundaries

**1.5 Characterization (golden master / approval) tests before change.**
Summary: Feathers' characterization tests record what code actually does, so later changes that alter behaviour are caught. Approval tests store a blessed output and diff later runs. They pin current behaviour, bugs included, and need repeatable output.
Applies: before an agent restructures a module, capture its behaviour as approval tests; these become the module's first tests. Requirements recovered from code are drafts until a person confirms which recorded behaviours are intended versus bugs.
Sources: https://en.wikipedia.org/wiki/Characterization_test ; https://understandlegacycode.com/approval-tests

**1.6 Screens inventory first, then journeys walked on the live app.**
Summary: UX audit practice is to walk the running app as a new user, screenshot every screen per flow, and build the flow diagram from that, checking that no screen is orphaned. Analytics paths show what users really do, versus intended paths.
Applies: produce the screens document from the deployed product (each screen: purpose, route, roles, entry points), then write journeys from walks plus usage data. Every screen should appear in at least one journey; walks are then checked against both documents.
Sources: https://defra.github.io/defra-ai-modernisation-playbook/pages/output-reference/interaction-analysis ; https://uxdesign.cc/design-audits-what-to-do-when-inheriting-someone-elses-disaster-a73f20b969b1

**1.7 Agent-driven migration: a judge first, rules, a throwaway stress test, dependency-ordered batches.**
Summary: Anthropic's account of large Claude Code migrations: build an objective judge (tests, diffs, a parity harness) and prove it fails on broken code; write a rulebook; run a throwaway mini-migration to fix the rules; slice work by the dependency map; gate each phase; use separate-context reviewers; when failures repeat, fix the process, not the output.
Applies: Process4 gates map onto this directly. Convert modules in list order (earliest first), so each agent's dependencies are already declared and tested.
Source: https://claude.com/blog/ai-code-migration

**1.8 LLMs plus deterministic tooling, with human review sized to capacity (Google).**
Summary: Google's migrations reported ~80% of landed changes fully AI-authored and ~50% less total time on one migration, but simple prompting was not enough; build/test loops and AST checks did much of the work, engineers reverted some changes, and review capacity was the bottleneck. Measure end-to-end time, not share of AI code.
Applies: pace conversion to what reviewers and CI can absorb; use mechanical checks (dependency rule, interface checks, tests) as the primary gate.
Source: https://arxiv.org/abs/2501.06972

**1.9 Pilot first with a representative slice, then expand by tier.**
Summary: a pilot should be an end-to-end slice reaching a real outcome, on a representative team, small enough to see which gaps are real, with an owner for capturing lessons; expand in increments with readiness criteria. Pilots can succeed for reasons that do not carry over.
Applies: convert one journey's modules fully (requirements, interfaces, tests, CI, screens, journey) as proof; separate process faults from product faults; only then widen.
Source: https://if4it.org/best-practices/systems-development-lifecycle-sdlc/how-to-pilot-and-roll-out-a-new-enterprise-sdlc/

## 2. Pitfalls seen in practice

- Big-bang rewrite or long-lived parallel codebase: Anthropic reports a two-codebase effort stuck at 90% parity was worse than starting over (claude.com blog).
- Green CI is not parity: Bun's port passed its full suite yet had 19 regressions after merge (claude.com blog). Pair tests with walks and production checks.
- Implicit contracts and hidden dependencies: untyped shapes needed writing down; cycles hidden by one toolchain surfaced as thousands of errors; Google's call-graph analysis missed dependency-injection links. Static import graphs undercount runtime wiring.
- Golden masters lock in bugs and break on non-deterministic output (time, IDs, ordering) unless scrubbed.
- Prompt-only agent work meanders and costs more (Thoughtworks Radar: https://www.thoughtworks.com/radar/techniques/ai-for-code-migrations); token cost is real (Bun ~$165k at API prices).
- Review becomes the bottleneck; Google slowed change rate to match it.
- Drift: without citable rules, violations become silent divergence.
- Transitional shims and "known violation" baselines that never shrink.
- Pilot scope creep, or a pilot that succeeds only because of special attention.

## 3. Implications for a conversion plan

1. Freeze nothing: the product keeps shipping; convert incrementally (strangler fig).
2. Extract the real import graph; add a dependency-direction check with a baseline of current violations as a required CI job, failing only on new ones.
3. Propose the ordered module list from that graph; list cycles and back-edges as named work items, not hidden exceptions.
4. Write the screens document from the live app and journeys from walks and usage data, before touching code; this is the external judge.
5. Choose one pilot journey and the modules it needs, earliest in the order first.
6. For each pilot module: interface declaration, characterization tests, then a requirements draft a person confirms (intended vs bug).
7. Run the pilot as a throwaway-able stress test of the process; fix the rules, record process faults separately.
8. Expand in list order in batches sized to review and CI capacity; track baseline burn-down and end-to-end time.
9. Retire transitional shims and empty the baseline as the exit condition of the conversion.
