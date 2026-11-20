// node point.mjs <kind> <bytes> [N=5] : run trials until N valid (CLEAN/DIRTY) or 3 mechanical cuts; reruns INVALID/VOID/ERROR.
import { execFile } from 'node:child_process'; import fs from 'node:fs';
const [kind, bytes, Ns] = process.argv.slice(2); const N = +(Ns || 5);
const S = new URL('..', import.meta.url).pathname;
const run = (seed) => new Promise(res => execFile('node', ['trial.mjs', kind, bytes, String(seed)], { cwd: S + 'm', maxBuffer: 1e8 }, (e, out, err) => { process.stdout.write(out || ''); if (e) process.stdout.write('ERR ' + seed + ' ' + (err || e.message).slice(-500) + '\n');
  try { res(JSON.parse(fs.readFileSync(`${S}data/${kind}/${kind}-${bytes}-s${seed}.json`, 'utf8')).status); } catch { res('ERROR'); } }));
let seed = 1; const statuses = {};
let pending = Array.from({ length: N }, () => seed++);
for (let round = 0; round < 4 && pending.length; round++) {
  const st = await Promise.all(pending.map(run)); pending.forEach((s, i) => statuses[s] = st[i]);
  const valid = Object.values(statuses).filter(x => x === 'CLEAN' || x === 'DIRTY').length;
  const cuts = Object.values(statuses).filter(x => x === 'MECHANICAL-CUT').length;
  if (cuts >= 3 || valid >= N || valid + cuts >= N && cuts > 0) break;
  pending = Array.from({ length: N - valid - cuts }, () => seed++);
}
console.log('POINT', kind, bytes, JSON.stringify(statuses));
