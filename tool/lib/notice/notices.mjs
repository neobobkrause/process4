// The reading of notify (command 11), run in a process of its own: running out of memory ends V8 at once, beyond any
// catch, so notify reads the product here and says plainly when this process could not finish. Reads, on standard
// input, { dirB, dirA, mods, named }: the product written out before and after the merge, the modules the merge changed
// that were there before, and the items whose meaning ARCH named or the job declared; writes, on standard output, the
// notice for each module, in that order.
import { readFileSync } from 'node:fs';
import { loadTree } from './model.mjs';
import { notice } from './notice.mjs';
import { Fail } from '../util.mjs';

const { dirB, dirA, mods, named = [] } = JSON.parse(readFileSync(0, 'utf8'));
try {
  const treeB = loadTree(dirB), treeA = loadTree(dirA);
  process.stdout.write(JSON.stringify(mods.map((m) => notice(treeB, treeA, m, { named: named.filter((n) => n.module === m) }))));
} catch (e) {
  if (!(e instanceof Fail)) throw e;
  process.stderr.write(`p4-fail: ${e.message}\n`);
  process.exitCode = 2;
}
