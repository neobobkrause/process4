import { execFile } from 'node:child_process'; import fs from 'node:fs';
const [K, B, Ns] = process.argv.slice(2); const N = +(Ns || 5); const S = new URL('..', import.meta.url).pathname;
const run = (seed) => new Promise(res => execFile('node', ['roletrial3.mjs', K, B, String(seed)], { cwd: S + 'm', maxBuffer: 1e8 }, (e, out, err) => { process.stdout.write(out || ''); if (e) process.stdout.write('ERR ' + (err || e.message).slice(-400) + '\n');
  try { res(JSON.parse(fs.readFileSync(`${S}data/role3/role3${process.env.ROLE_FREE === '1' ? 'f' : ''}-K${K}-${B}-s${seed}.json`, 'utf8')).status); } catch { res('ERROR'); } }));
let seed = 1; const st = {}; let pending = Array.from({ length: N }, () => seed++);
for (let r = 0; r < 4 && pending.length; r++) { const x = await Promise.all(pending.map(run)); pending.forEach((s, i) => st[s] = x[i]);
  const valid = Object.values(st).filter(v => v === 'CLEAN' || v === 'DIRTY').length; if (valid >= N) break; pending = Array.from({ length: N - valid }, () => seed++); }
console.log('POINT role3', K, B, JSON.stringify(st));
