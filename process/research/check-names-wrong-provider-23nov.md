# `check` may name the wrong provider in refusal (b)

Written by PROCESS #9, 23 Nov 2026, past its refresh point; for PROCESS #10 to look into. A process fault from civicsmith
plane #1, via ARCH #10 and coordinator #4, 10:56Z, unchanged: "the refusal names control-plane where the provider at
fault is store-assembly; that may be a tool fault." ARCH's context: `p4 check plane` refused plane's call
`assembleStore(ctx, env, { deliver: deliverOwedRender })` with "(b) code disagrees with the stated interface of
control-plane", but the unstated parameter is store-assembly's assemble.mjs:200.

Not yet read in the tool. To find out first: how refusal (b) picks the provider it names (`tool/lib/notice/check.mjs`);
whether `assembleStore` reaches plane through control-plane (a re-export or a carrier), in which case the name may be the
route rather than the owner; and whether the refusal itself is right (a structured comment of store-assembly states the
parameter) or only its wording. If only the name is wrong, it misleads the job but refuses nothing it should not.
Options to put after reading: A no change; B name the module whose comment states the interface (and the route, where
it differs).

## Read in the tool (PROCESS #10, 23 Nov ~17:30Z)

`tool/lib/notice/check.mjs`, `makeClaims` (lines 121-298) and the refusal's wording (line 492). Refusal (b) names every
other module whose **public** file holds a declaration with a structured comment that the complaint touches, found along
several routes: the value's own declaration and kind (`fromValue`, `fromKind`), what is expected where it stands (the
parameter, the field of the expected object kind, the contextual kind: `fromExpected`), the called function's declaration,
and the "declared here" places the complaint names (`fromPlace`). It does not name the module that owns the called function
unless that function's own declaration or parameters carry a structured comment. So for
`assembleStore(ctx, env, { deliver: deliverOwedRender })`, where store-assembly's parameter (assemble.mjs:200) states
nothing, the name control-plane most likely comes from a stated kind of `ctx`, `env`, `deliverOwedRender` or the expected
object that lives in control-plane's public files. Two readings, which the complaint's text decides: (1) the refusal is
right and its name is right: the value contradicts control-plane's stated kind, and the job's report misread it; or (2)
control-plane's comment was only picked up along the way (a contextual kind several steps from what the complaint is
about), and the refusal rests on no comment that states what the call contradicts, which the 22 Nov decision 3B says is
"cannot tell". Asked civicsmith coordinator #4 at ~17:30Z for the exact lines `p4 check plane` printed. Options wait on that.
## The complaint, and what it shows (civicsmith plane #1, via ARCH #11 and coordinator #4, 17:23Z)

plane #1 reproduced it with `p4 check plane` (process copy 0eec86fd) at job/plane.1's commit 2c0f85ea:

    bio-plane/src/plane/store.mjs:41 (b) code disagrees with the stated interface of control-plane: Type '({ ctx, env,
    storeName, answer, session }?: {...}) => Promise<{ ok: boolean; ... }>' is not assignable to type 'null | undefined'.
    (the same at bio-plane/test/m/plane/fixture.mjs:24)

The call: `assembleStore(ctx, env, { deliver: deliverOwedRender })`. At that commit store-assembly's `assembleStore`
stated nothing (`{ deliver = null, releaseKeys = null } = {}`, no @param), so its `deliver` read as null only.
`deliverOwedRender` is control-plane's, with a stated @param and @returns. So the type that cannot be assigned is the
**value**, stated by control-plane; the type it cannot be assigned **to** is store-assembly's parameter, stated by
nothing. The refusal stopped when store-assembly #3 merged with its options stated; plane's call is unchanged.

**Finding.** Reading (2) above holds, and it is more than a wrong name: the refusal itself is false under decision 3B (22
Nov), "refuses a type disagreement only when what it contradicts is stated by a structured comment". What the call
contradicts is the parameter, which no comment states; the value's own comment is not contradicted. The tool counted it
because `makeClaims` gathers comments from **both** sides of an assignment (`fromValue` on the value, `fromExpected` on the
target) and refuses if either is stated. Measured: two false refusals in plane, which recorded plane blocked until
store-assembly merged. Not stopping work now.

## Options

- **A. No change.** A value stated by one module, handed into a parameter or field another module states nothing about,
  is refused and named after the value's module, until the receiving module states it.
- **B. For a "cannot be assigned" complaint, only the receiving side's comment counts (recommended).** The complaint is
  refused only where the parameter, field, variable or answer the value goes into is stated by a structured comment; the
  refusal names the module of that comment (refusal (b)), or is (a) where it is this module's own. The value's own comment
  is not what is contradicted. Other complaints (a missing field, a wrong number of arguments, a name not exported) keep
  their present rules. Before merging: the proof's 48 recorded refusing decisions and 150 changes replayed; any decision
  that changes written down with its reason. It narrows a refusal; it adds no test, gate, review or stop. civicsmith gets
  it by its move to the latest version.
