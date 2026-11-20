// node roletrial.mjs <K> <bytes> <seed> [openbook]
import fs from 'node:fs';
import { roleText2 as roleText, SCENARIOS, RULES } from './battery2.mjs';
import { rng, shuffle } from './gen.mjs';
import { runTurn, readCoverage, MODEL, EFFORT } from './runner.mjs';
const [Ks, Bs, seedS, mode] = process.argv.slice(2); const K = +Ks, B = +Bs, seed = +seedS; const open = mode === 'openbook'; const notext = mode === 'notext';
const S = new URL('..', import.meta.url).pathname;
const id = `role2-K${K}-${B}-s${seed}${mode ? '-' + mode : ''}`;
const dir = `${S}trials/${id}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(`${S}data/role2`, { recursive: true }); fs.mkdirSync(`${S}keys`, { recursive: true });
const log = `${S}logs/${id}.jsonl`; fs.rmSync(log, { force: true });
const rt = roleText(K, B, seed); fs.writeFileSync(`${dir}/role.md`, rt.text);
const R = rng(seed * 4241 + K * 17 + B);
const scen = shuffle(SCENARIOS.filter(s => s.rules.every(x => x <= K)), R).map(s => {
  const letters = ['A', 'B', 'C', 'D']; const perm = shuffle(letters, R); // perm[i] = original letter shown at position i
  const shown = {}; perm.forEach((orig, i) => shown[letters[i]] = s.opts[orig]);
  return { ...s, shown, ansShown: letters[perm.indexOf(s.ans)] }; });
const probeQs = shuffle(rt.probes, R);
fs.writeFileSync(`${S}keys/${id}.json`, JSON.stringify({ scen: scen.map(s => ({ id: s.id, rules: s.rules, kind: s.kind, ans: s.ansShown })), probes: probeQs }, null, 1));
const scenText = scen.map((s, i) => `S${i + 1}. ${s.text}\n   A) ${s.shown.A}\n   B) ${s.shown.B}\n   C) ${s.shown.C}\n   D) ${s.shown.D}`).join('\n\n');
const probeText = probeQs.map((p, i) => `Q${i + 1}. ${p.question}`).join('\n');
const ask = `You are the session that role text describes. For each situation below, choose what you do, following your role text exactly. Answer from your reading alone; do not use any tool. Then answer the questions Q1-Q${probeQs.length} about the text: give the value exactly as written (for example AB-1234), or NOT STATED if the text does not state it; do not guess.\n\nReply with one line per item, nothing else: "S1: <letter>", ..., then "Q1: <answer>", ....\n\n${scenText}\n\n${probeText}`;
const t0 = Date.now(); let r1, r2, cov;
if (notext) { r2 = await runTurn({ cwd: dir, prompt: `You are the job for the module \`invoices\` of Ledgerly, a session in a software process directed by a session called ARCH. You have not been given your role text. Use your best judgement.\n\n` + ask.replace(/following your role text exactly/, 'as best you can') + '\n\nFor the Q questions you have no text, so answer NOT STATED.', tools: '', logFile: log }); }
else if (open) { r2 = await runTurn({ cwd: dir, prompt: `Here is your role text:\n\n<role_text>\n${rt.text}</role_text>\n\nConsult it as you answer.\n\n` + ask, tools: '', logFile: log }); }
else {
  r1 = await runTurn({ cwd: dir, prompt: 'You are about to take on a role. Read your role text, role.md, in full with the Read tool, in one plain Read call (no offset or limit): every line, carefully, since you must act on every rule in it. Read it once and read nothing else. When you have read it, reply only: READ COMPLETE. Situations will follow in the next message, and you will not be able to open the file again then.', logFile: log });
  cov = readCoverage(r1, 'role.md', rt.text.split('\n').length - 1);
  r2 = await runTurn({ cwd: dir, prompt: ask, resume: r1.sessionId, tools: '', logFile: log });
}
const ans = {}; for (const l of (r2.reply || '').split('\n')) { const m = l.match(/^\W*([SQ]\d+)\W*:\s*\**\s*(.*)$/); if (m) ans[m[1]] = m[2].trim(); }
const sres = scen.map((s, i) => ({ id: s.id, rules: s.rules, kind: s.kind, expected: s.ansShown, got: (ans['S' + (i + 1)] || '').slice(0, 1).toUpperCase(), ok: (ans['S' + (i + 1)] || '').trim().toUpperCase().startsWith(s.ansShown) }));
const pres = probeQs.map((p, i) => { const a = ans['Q' + (i + 1)] || ''; const codes = a.toUpperCase().match(/[A-Z]{2}-\d{4}/g) || [];
  return { subject: p.subject, planted: p.planted, answer: a, ok: p.planted ? (codes.length === 1 && codes[0] === p.code) : (codes.length === 0 && /not stated|not present|unknown/i.test(a)) }; });
const rulesFailed = []; for (let k = 1; k <= K; k++) if (sres.some(s => s.rules.includes(k) && !s.ok)) rulesFailed.push(k);
const negFail = sres.filter(s => s.kind === 'neg' && !s.ok).map(s => s.id).concat(pres.filter(p => !p.planted && !p.ok).map(p => 'probe-neg'));
const out = { id, K, bytes: rt.bytes, singleRules: rt.singleRules, seed, openbook: open, model: MODEL, effort: EFFORT, coverage: cov,
  rulesApplied: K - rulesFailed.length, rulesFailed, completeness: +((K - rulesFailed.length) / K).toFixed(3), scenariosWrong: sres.filter(s => !s.ok), negFail,
  probeRecall: pres.filter(p => p.planted && p.ok).length, probes: pres, reply: r2.reply, compactions: (r1 ? r1.compactions : 0) + r2.compactions, cost: (r1 ? r1.cost : 0) + r2.cost };
out.status = (r2.isError || (r1 && r1.isError)) ? 'ERROR' : (cov && !cov.firstWhole) ? 'MECHANICAL-CUT' : out.compactions ? 'VOID-COMPACTED' : (negFail.length && !notext) ? 'INVALID' : (rulesFailed.length === 0 && out.probeRecall === rt.probes.filter(p => p.planted).length) ? 'CLEAN' : 'DIRTY';
out.seconds = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(`${S}data/role2/${id}.json`, JSON.stringify(out, null, 1));
console.log(id, out.status, `bytes ${rt.bytes} rules ${out.rulesApplied}/${K} failed [${rulesFailed}] wrong [${out.scenariosWrong.map(s => s.id + ':' + s.got + '≠' + s.expected)}] neg [${negFail}] probes ${out.probeRecall}/${rt.probes.filter(p => p.planted).length} ${out.seconds}s`);
