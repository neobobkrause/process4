// node trial.mjs <single|set> <bytes> <seed>  -> one trial: build carrier, fresh session reads it
// (turn 1, Read only), then answers in a resumed turn with NO tools (cannot reopen the source).
import fs from 'node:fs';
import path from 'node:path';
import { validCarrier, questionnaire, score, rng } from './gen.mjs';
import { runTurn, readCoverage, MODEL, EFFORT } from './runner.mjs';

const [kind, bytesS, seedS] = process.argv.slice(2);
const bytes = +bytesS, seed = +seedS;
const S = path.dirname(new URL(import.meta.url).pathname) + '/..';
const id = `${kind}-${bytes}-s${seed}`;
const dir = `${S}/trials/${id}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const keyDir = `${S}/keys`; fs.mkdirSync(keyDir, { recursive: true });
const dataDir = `${S}/data/${kind}`; fs.mkdirSync(dataDir, { recursive: true });
const log = `${S}/logs/${id}.jsonl`; fs.mkdirSync(`${S}/logs`, { recursive: true }); fs.rmSync(log, { force: true });

let files, key, prompt1;
if (kind === 'single') {
  const c = validCarrier("single", bytes, seed); key = c.key; files = [{ file: 'carrier.md', text: c.text }];
  prompt1 = `You are a reading session. Read the file carrier.md in full with the Read tool, in one plain Read call (no offset or limit): every line, carefully, as a governing text you will have to act on. Read it once and read nothing else. When you have read it, reply only: READ COMPLETE. Questions about it will come in the next message, and you will not be able to open the file again then.`;
} else {
  const c = validCarrier("set", bytes, seed); key = c.key; files = c.files;
  prompt1 = `You are a reading session. Read this set of files in full, in this order, each with one plain Read call (no offset or limit): ${files.map(f => f.file).join(', ')}. Read every line of every file, carefully, as governing texts you will have to act on. Read each file once and read nothing else. When you have read them all, reply only: READ COMPLETE. Questions about them will come in the next message, and you will not be able to open the files again then.`;
}
for (const f of files) fs.writeFileSync(`${dir}/${f.file}`, f.text);
fs.writeFileSync(`${keyDir}/${id}.json`, JSON.stringify(key, null, 1)); // private key: never in the trial dir

const t0 = Date.now();
const r1 = await runTurn({ cwd: dir, prompt: prompt1, logFile: log });
const cov = files.map(f => ({ file: f.file, bytes: Buffer.byteLength(f.text), ...readCoverage(r1, f.file, f.text.split('\n').length - (f.text.endsWith('\n') ? 1 : 0)) }));
const cut = cov.filter(c => !c.firstWhole);
const out = { id, kind, bytes, seed, model: MODEL, effort: EFFORT, date: new Date().toISOString(), coverage: cov,
  turn1: { reply: r1.reply, uses: r1.uses.length, compactions: r1.compactions, notes: r1.systemNotes, ctx: r1.iterations.at(-1), cost: r1.cost, isError: r1.isError } };
if (r1.isError || !r1.sessionId) out.status = 'ERROR';
else if (cut.length) { out.status = 'MECHANICAL-CUT'; out.cut = cut; }
else {
  const R = rng(seed * 31 + bytes + 7); const q = questionnaire(key, R);
  const prompt2 = `Answer each question from what you read. Do not use any tool; answer from your reading alone. Give the value exactly as written in the text (for example AB-1234). If the text did not state it, answer NOT STATED; do not guess. Reply with a numbered list, one line per question, the answer only.\n\n${q.text}`;
  const r2 = await runTurn({ cwd: dir, prompt: prompt2, resume: r1.sessionId, tools: '', logFile: log });
  const sc = score(key, q.order, r2.reply);
  out.turn2 = { reply: r2.reply, uses: r2.uses.length, compactions: r2.compactions, notes: r2.systemNotes, ctx: r2.iterations.at(-1), cost: r2.cost, isError: r2.isError };
  out.score = sc;
  out.status = (r2.isError) ? 'ERROR' : (r1.compactions || r2.compactions) ? 'VOID-COMPACTED' : sc.invalid ? 'INVALID' : sc.clean ? 'CLEAN' : 'DIRTY';
}
out.seconds = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(`${dataDir}/${id}.json`, JSON.stringify(out, null, 1));
console.log(id, out.status, out.score ? `recall ${out.score.recall}/${out.score.of} neg ${out.score.negOk}/${out.score.negOf} missed [${out.score.missedClasses}]` : (out.cut ? 'cut ' + JSON.stringify(out.cut.map(c => [c.file, c.bytes, c.firstLast])) : ''), `${out.seconds}s`);
