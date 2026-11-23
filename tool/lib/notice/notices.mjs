// The reading of notify (command 11), run in a process of its own: running out of memory ends V8 at once, beyond any
// catch, so notify reads the product here and says plainly when this process could not finish. Reads, on standard
// input, { dirB, dirA, mods }: the product written out before and after the merge, and the modules the merge changed
// that had a listing before; writes, on standard output, the notice for each, in that order.
import { readFileSync } from 'node:fs';
import { loadTree } from './model.mjs';
import { notice } from './notice.mjs';
import { Fail } from '../util.mjs';

const { dirB, dirA, mods } = JSON.parse(readFileSync(0, 'utf8'));
try {
  const treeB = loadTree(dirB), treeA = loadTree(dirA);
  process.stdout.write(JSON.stringify(mods.map((m) => notice(treeB, treeA, m))));
} catch (e) {
  if (!(e instanceof Fail)) throw e;
  process.stderr.write(`p4-fail: ${e.message}\n`);
  process.exitCode = 2;
}
