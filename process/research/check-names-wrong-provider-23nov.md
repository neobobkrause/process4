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
