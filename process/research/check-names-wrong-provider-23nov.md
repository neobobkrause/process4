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
