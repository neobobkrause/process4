// node rolefill.mjs <K> <bytes> <pct> <seed> : role text read first, context filled to pct with real
// prose, then the discriminating battery (free-response apply scenarios) and probe recall.
import fs from 'node:fs';
import { build3, FREE, freeScore } from './battery3.mjs';
import { rng, shuffle } from './gen.mjs';
import { runTurn, readCoverage, MODEL, EFFORT } from './runner.mjs';
const [Ks, Bs, pctS, seedS] = process.argv.slice(2); const K = +Ks, B = +Bs, pct = +pctS, seed = +seedS;
const S = new URL('..', import.meta.url).pathname; const id = `rolefill-K${K}-${B}-f${pct}-s${seed}`;
const dir = `${S}trials/${id}`; fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(`${S}data/rolefill`, { recursive: true }); const log = `${S}logs/${id}.jsonl`; fs.writeFileSync(log, '');
const rt = build3(K, B, seed + 50); fs.writeFileSync(`${dir}/role.md`, rt.text);
const R = rng(seed * 31337 + K + B + pct);
const srcs = shuffle(fs.readdirSync(`${S}fillsrc`).sort(), R); const names = srcs.map((_, i) => `notes-${String(i + 1).padStart(3, '0')}.md`);
srcs.forEach((f, i) => fs.copyFileSync(`${S}fillsrc/${f}`, `${dir}/${names[i]}`));
const scen = shuffle(rt.scen, R).map(s => { const L = ['A', 'B', 'C', 'D']; const perm = shuffle(L, R); const shown = {}; perm.forEach((o, i) => shown[L[i]] = s.opts[o]); return { ...s, shown, ansShown: L[perm.indexOf(s.ans)], free: s.kind === 'apply' && FREE[s.ruleNo] != null }; });
const probeQs = shuffle(rt.probes, R);
fs.writeFileSync(`${S}keys/${id}.json`, JSON.stringify({ params: rt.params, scen: scen.map(s => ({ id: s.id, ans: s.ansShown, free: s.free })), probes: probeQs }, null, 1));
const scenText = scen.map((s, i) => s.free ? `S${i + 1}. ${s.text.replace(/ (Whom|Which|What|Where|In what|How|To whom)[^?]*\?$/, '')} [Free answer: state the exact specific your rules require (the session, command, flag, folder, file name, format or prefix), in a few words.]` : `S${i + 1}. ${s.text}\n   A) ${s.shown.A}\n   B) ${s.shown.B}\n   C) ${s.shown.C}\n   D) ${s.shown.D}`).join('\n\n');
const t0 = Date.now(); let cost = 0;
let r = await runTurn({ cwd: dir, prompt: 'You are about to take on a role. Read your role text, role.md, in full with the Read tool, in one plain Read call (no offset or limit): every line, carefully, since you must act on every rule in it for the rest of this session. Read it once. Then reply only: READ COMPLETE.', logFile: log });
const cov = readCoverage(r, 'role.md', rt.text.split('\n').length - 1); const sid = r.sessionId; let ctx = r.iterations.at(-1); cost = r.cost;
const W = r.contextWindow || 1e6; const target = pct / 100 * W - 9000; let next = 0, per = 10500;
while (ctx < target - per * 0.6 && next < names.length) {
  const n = Math.max(1, Math.min(10, Math.round((target - ctx) / per))); const batch = names.slice(next, next + n); next += n;
  r = await runTurn({ cwd: dir, resume: sid, prompt: `As part of your work, read these files in full with the Read tool, one plain Read call each (you may issue them together): ${batch.join(', ')}. Read every line, once. Then reply only: DONE.`, logFile: log });
  const nc = r.iterations.at(-1); if (nc > ctx) per = 0.5 * per + 0.5 * (nc - ctx) / batch.length; ctx = nc; cost = Math.max(cost, r.cost); if (r.isError) break;
}
const ask = `You are still the session your role text describes. For each situation below, choose what you do, following your role text exactly, from your reading alone. Do not use any tool and do not open any file again. Then answer Q1-Q${probeQs.length} about your role text: the value exactly as written (for example AB-1234), or NOT STATED; do not guess.\n\nReply with one line per item, nothing else: "S1: <letter>" (or, for a free answer, "S1: <your answer>"), ..., then "Q1: <answer>", ....\n\n${scenText}\n\n${probeQs.map((p, i) => `Q${i + 1}. ${p.question}`).join('\n')}`;
r = await runTurn({ cwd: dir, resume: sid, prompt: ask, logFile: log }); cost = Math.max(cost, r.cost); const actx = r.iterations.at(-1);
const ans = {}; for (const l of (r.reply || '').split('\n')) { const m = l.match(/^\W*([SQ]\d+)\W*:\s*\**\s*(.*)$/); if (m) ans[m[1]] = m[2].trim(); }
const sres = scen.map((s, i) => { const a = ans['S' + (i + 1)] || ''; return { id: s.id, rules: s.rules, kind: s.kind, free: s.free, answer: a.slice(0, 120), ok: s.free ? freeScore(s.ruleNo, s.choiceIdx, a) : a.trim().toUpperCase().startsWith(s.ansShown) }; });
const pres = probeQs.map((p, i) => { const a = ans['Q' + (i + 1)] || ''; const c = a.toUpperCase().match(/[A-Z]{2}-\d{4}/g) || []; return { planted: p.planted, ok: p.planted ? (c.length === 1 && c[0] === p.code) : (c.length === 0 && /not stated|unknown/i.test(a)) }; });
const failed = []; for (let k = 1; k <= K; k++) if (sres.some(s => s.rules.includes(k) && !s.ok)) failed.push(k);
const negFail = sres.filter(s => s.kind === 'neg' && !s.ok).length + pres.filter(p => !p.planted && !p.ok).length;
const out = { id, K, bytes: rt.bytes, pct, seed, model: MODEL, effort: EFFORT, params: rt.params, fillPct: +(100 * actx / W).toFixed(2), filesRead: next, roleReadWhole: cov.firstWhole, reopened: r.uses.length, compactions: r.compactions,
  rulesApplied: K - failed.length, failed, wrong: sres.filter(s => !s.ok), negFail, probeRecall: pres.filter(p => p.planted && p.ok).length, probesPlanted: pres.filter(p => p.planted).length, reply: r.reply, cost: +cost.toFixed(2) };
out.status = r.isError ? 'ERROR' : out.reopened ? 'VOID-REOPENED' : !cov.firstWhole ? 'MECHANICAL-CUT' : Math.abs(out.fillPct - pct) > 2 ? 'OFF-TARGET' : negFail ? 'INVALID' : (failed.length === 0 && out.probeRecall === out.probesPlanted) ? 'CLEAN' : 'DIRTY';
out.seconds = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(`${S}data/rolefill/${id}.json`, JSON.stringify(out, null, 1));
console.log(id, out.status, `fill ${out.fillPct}% rules ${out.rulesApplied}/${K} failed [${failed}] wrong [${out.wrong.map(w => w.id + ':' + w.answer.slice(0, 40))}] neg ${negFail} probes ${out.probeRecall}/${out.probesPlanted} $${out.cost} ${out.seconds}s`);
