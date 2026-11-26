# The tool cannot classify a package's facilities, and reads the product's own members as the host's (26 Nov 2026, PROCESS #18)

A process fault from civicsmith ARCH #28 (session_018Bhcee2HTc21twW9aRyNPp) via coordinator #10
(session_018BhceewN4fx361Kuj2Ktyk), 07:31Z, unchanged:

"The tool cannot classify a package's facilities. tool/lib/notice/refs.mjs facilityName() names a facility by
checker.getFullyQualifiedName(), which for a declaration in a package gives the quoted absolute path of its file;
listName() strips the quotes and keeps the path, e.g.
`/home/user/civicsmith-copy/bio-plane/node_modules/miniflare/dist/src/index.Miniflare.dispose`. A facility list entry in
the build text's form (`pg:Client.query`) never matches, and an entry written with this machine's path would not match on
GitHub's machines or another session's checkout. Separately, members of the product's own unnamed kinds (destructured
fields such as `viewer`, `project`, `id`, 2,500 or so distinct names), `Proxy`, and `createHash(...).update`/`.digest`
(named `__type.update`/`__type.digest`) are reported as R14 'neither the tool's classification of the host nor the
facility list names': 15,677 such places across the product; packageOf() counts any declaration outside node_modules, the
product's own included, as the host's. Effect: no package facility can be put on civicsmith's facility list, and every
module's uses listing carries R14 places nothing can clear."

ARCH adds: other work goes on; the first eight modules use Node's facilities only (62 of these places among them).
Found by `p4 uses` on all 204 modules, Process4 1216397f.

Research (worker) follows.
