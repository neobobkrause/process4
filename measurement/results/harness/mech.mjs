import {runTurn, readCoverage} from '../m/runner.mjs';
import fs from 'node:fs';
const files=fs.readdirSync('.').filter(f=>/^[gp]\d+\.md$/.test(f));
const r=await runTurn({cwd:process.cwd(), prompt:`Read each of these files with the Read tool, one plain Read call per file (no offset or limit), all in parallel: ${files.join(', ')}. Do not read any file a second time. Then reply DONE.`, logFile:'mech.jsonl'});
for(const f of files){const L=fs.readFileSync(f,'utf8').split('\n').length-1; const c=readCoverage(r,f,L); console.log(f, fs.statSync(f).size, 'lines',L, JSON.stringify(c));}
for (const x of r.results) console.log(x.use&&x.use.input.file_path.split('/').pop(), x.len, x.isError, JSON.stringify(x.tail.slice(-150)));
console.log(r.systemNotes, r.cost);
