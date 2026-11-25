// The reading of notify (command 11), run in a process of its own: running out of memory ends V8 at once, beyond any
// catch, so notify reads the product here and says plainly when this process could not finish. Reads, on standard
// input, { dirB, dirA, mods, named, sameAs }: the product written out before and after the merge; the modules to read
// that were there before, each { module, filesChanged, conversion }; the items whose meaning ARCH named or the pull
// request declared; and those it records as keeping their domain and range; writes, on standard output, the notice for each module, in that order.
import { readFileSync } from 'node:fs';
import { loadTree } from './model.mjs';
import { notice } from './notice.mjs';
import { Fail } from '../util.mjs';

const { dirB, dirA, mods, named = [], sameAs = [] } = JSON.parse(readFileSync(0, 'utf8'));
try {
  const treeB = loadTree(dirB), treeA = loadTree(dirA);
  process.stdout.write(JSON.stringify(mods.map((m) => notice(treeB, treeA, m.module, {
    named: named.filter((n) => n.module === m.module || !n.module), filesChanged: m.filesChanged, conversion: m.conversion,
    sameAs: sameAs.filter((x) => x.module === m.module || !x.module),
  }))));
} catch (e) {
  if (!(e instanceof Fail)) throw e;
  process.stderr.write(`p4-fail: ${e.message}\n`);
  process.exitCode = 2;
}
