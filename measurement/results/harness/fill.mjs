// node fill.mjs <pct> <seed>  — value 4 trial (fill level for refresh).
import fs from 'node:fs';
import { setExclude, validCarrier, rng, shuffle, score } from './gen.mjs';
import { runTurn, readCoverage, MODEL, EFFORT } from './runner.mjs';
setExclude(['build/04-the-trial.md']);
const [pctS, seedS] = process.argv.slice(2); const pct = +pctS, seed = +seedS;
const S = new URL('..', import.meta.url).pathname;
const id = `fill-${pct}-s${seed}`;
const dir = `${S}trials/${id}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(`${S}data/fill`, { recursive: true });
const log = `${S}logs/${id}.jsonl`; fs.rmSync(log, { force: true });
const R = rng(seed * 997 + pct);
const carrier = validCarrier('single', 24000, 500 + seed); fs.writeFileSync(`${dir}/carrier.md`, carrier.text);
fs.writeFileSync(`${S}keys/${id}.json`, JSON.stringify(carrier.key, null, 1));
fs.copyFileSync('/home/user/process4/build/04-the-trial.md', `${dir}/requirements.md`);
const srcs = shuffle(fs.readdirSync(`${S}fillsrc`).sort(), R);
srcs.forEach((f, i) => fs.copyFileSync(`${S}fillsrc/${f}`, `${dir}/notes-${String(i + 1).padStart(3, '0')}.md`));
const fillNames = srcs.map((_, i) => `notes-${String(i + 1).padStart(3, '0')}.md`);

const TASKQ = [
  { q: 'Under build text 4\'s rule of the order, which doubtful thing is tried first?', all: ['most doubtful'] },
  { q: 'What must the owner\'s trial wording of his forbidden commands allow for stage 0?', all: ['script'], any: ['node', 'gh', 'git'] },
  { q: 'In stage 0\'s run on 19 Nov, which GitHub interface was refused, and which worked?', all: ['graphql', 'rest'] },
  { q: 'What is the name of the process repository\'s own required run?', all: ['tool-tests'] },
  { q: 'In stage 1, how many merges made by the tool must pass the permission checker?', any: ['twenty', '20'] },
  { q: 'In stage 2, what rouses ROOT?', all: ['hourly'] },
  { q: 'In stage 3, at what point is a job replaced?', all: ['third'] },
  { q: 'How many recorded changes does the notice\'s proof hold in its repository?', all: ['150'] },
  { q: 'Which option of `release prepare` makes stage 6\'s first trial release?', all: ['development'] },
  { q: 'Which status check does act 10\'s branch ruleset require?', all: ['module-tests'] },
  { q: 'What dollar budget does build text 4 set for each stage?', neg: true },
];
const t0 = Date.now(); const turns = []; let cost = 0, compactions = 0; const notes = [];
const rec = (name, r) => { turns.push({ name, ctx: r.iterations.at(-1), maxCtx: Math.max(0, ...r.iterations), uses: r.uses.length, reply: (r.reply || '').slice(0, 200), notes: r.systemNotes, compactions: r.compactions, isError: r.isError }); cost = Math.max(cost, r.cost); compactions += r.compactions; notes.push(...r.systemNotes); };
let r = await runTurn({ cwd: dir, prompt: 'You are a working session that will read a large amount of material and then do a piece of work. First read carrier.md in full with the Read tool, in one plain Read call (no offset or limit): every line, carefully; it is a governing text you must keep in mind. Read it once. Then reply only: READ COMPLETE.', logFile: log });
rec('carrier', r); const sid = r.sessionId;
const covC = readCoverage(r, 'carrier.md', carrier.text.split('\n').length - 1);
const WINDOW = r.contextWindow || 1000000;
const target = pct / 100 * WINDOW; const reserve = 7500; // task file (~4.3k tokens) + question turn
let next = 0, ctx = r.iterations.at(-1), perFile = 10500; const fillCov = [];
while (ctx < target - reserve - perFile * 0.6 && next < fillNames.length) {
  const gap = target - reserve - ctx; let n = Math.max(1, Math.min(10, Math.round(gap / perFile)));
  const batch = fillNames.slice(next, next + n); next += n;
  r = await runTurn({ cwd: dir, resume: sid, prompt: `Next, read these files in full with the Read tool, one plain Read call each (no offset or limit; you may issue the calls together): ${batch.join(', ')}. Read every line. Read each once. Then reply only: DONE.`, logFile: log });
  rec('fill', r);
  for (const f of batch) { const t = fs.readFileSync(`${dir}/${f}`, 'utf8'); fillCov.push({ f, ...readCoverage(r, f, t.split('\n').length - 1) }); }
  const nctx = r.iterations.at(-1); if (nctx > ctx) perFile = 0.5 * perFile + 0.5 * (nctx - ctx) / batch.length; ctx = nctx;
  if (r.isError) break;
}
r = await runTurn({ cwd: dir, resume: sid, prompt: 'Now the piece of work. Read requirements.md in full with the Read tool, in one plain Read call (no offset or limit): every line, carefully. Read it once. Then reply only: READ COMPLETE. The work on it will be given in the next message, when you will not be able to open any file again.', logFile: log });
rec('task-read', r); const covT = readCoverage(r, 'requirements.md', fs.readFileSync(`${dir}/requirements.md`, 'utf8').split('\n').length - 1);
// question turn: task questions + early-probe questions, randomised, + handover
const probeQs = shuffle(carrier.key.probes, R);
const items = shuffle([...TASKQ.map((t, i) => ({ type: 'task', i, text: t.q })), ...probeQs.map(p => ({ type: 'probe', subject: p.subject, text: p.question }))], R);
const prompt = `Do the work now, from your reading alone. Do not use any tool and do not open any file again.\n\nPart 1. Answer each numbered question. Questions about requirements.md: a short answer. Questions about a code (audit code, calibration key, reference mark, tracking number) come from carrier.md: give the code exactly as written (for example AB-1234). If what you read did not state it, answer NOT STATED; do not guess. One line per question: "1. <answer>".\n\n${items.map((x, i) => `${i + 1}. ${x.text}`).join('\n')}\n\nPart 2. After the answers, write a handover of at most 120 words under the heading HANDOVER, for the session that would replace you: what you read, what work you did, and what remains.`;
r = await runTurn({ cwd: dir, resume: sid, prompt, logFile: log }); rec('answer', r); const reopened = r.uses.length;
const reply = r.reply || ''; const ans = {}; for (const l of reply.split('\n')) { const m = l.match(/^\s*\**\s*(\d+)[.):]\**\s*(.*)$/); if (m && !ans[+m[1]]) ans[+m[1]] = m[2]; }
const taskRes = items.map((x, n) => ({ ...x, n: n + 1, answer: (ans[n + 1] || '').trim() })).filter(x => x.type === 'task').map(x => { const t = TASKQ[x.i]; const a = x.answer.toLowerCase();
  const ok = t.neg ? /not stated|not state|no .*budget|does not|unknown|none/i.test(a) && !/\$\s*\d/.test(a) : ((t.all || []).every(s => a.includes(s)) && (!t.any || t.any.some(s => a.includes(s))));
  return { q: t.q, neg: !!t.neg, answer: x.answer, ok }; });
const order = items.filter(x => x.type === 'probe').map(x => x.subject);
const probeReply = items.map((x, n) => x.type === 'probe' ? `${order.indexOf(x.subject) + 1}. ${ans[n + 1] || ''}` : '').filter(Boolean).join('\n');
const pr = score(carrier.key, order, probeReply);
const hm = reply.split(/HANDOVER/i)[1] || ''; const hw = hm.trim().split(/\s+/).filter(Boolean).length;
const handoverOk = hw >= 25 && hw <= 200 && /requirements|build text 4|trial/i.test(hm);
const answerCtx = turns.at(-1).ctx;
const out = { id, pct, seed, model: MODEL, effort: EFFORT, window: WINDOW, targetTokens: target, answerCtx, fillPct: +(100 * answerCtx / WINDOW).toFixed(2),
  inTolerance: Math.abs(100 * answerCtx / WINDOW - pct) <= 2, filesRead: next, coverage: { carrier: covC, task: covT, fillCut: fillCov.filter(c => !c.firstWhole).map(c => c.f) },
  task: taskRes, taskOk: taskRes.filter(t => !t.neg && t.ok).length, taskNegOk: taskRes.filter(t => t.neg).every(t => t.ok), probes: pr, handoverWords: hw, handoverOk, compactions, notes: [...new Set(notes)], turns, cost: +cost.toFixed(2), reply };
const negOk = out.taskNegOk && !pr.invalid;
out.reopened = reopened;
out.status = turns.some(t => t.isError) ? 'ERROR' : reopened ? 'VOID-REOPENED' : compactions ? 'VOID-COMPACTED' : !covC.firstWhole || !covT.firstWhole ? 'MECHANICAL-CUT' : !out.inTolerance ? 'OFF-TARGET' : !negOk ? 'INVALID' : (out.taskOk === 10 && pr.clean && handoverOk) ? 'CLEAN' : 'DIRTY';
out.seconds = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(`${S}data/fill/${id}.json`, JSON.stringify(out, null, 1));
for (const f of fillNames) fs.rmSync(`${dir}/${f}`, { force: true }); // fill copies are reproducible from fillsrc + seed
console.log(id, out.status, `fill ${out.fillPct}% task ${out.taskOk}/10 neg ${out.taskNegOk} probes ${pr.recall}/12 pneg ${pr.negOk}/2 missed [${pr.missedClasses}] handover ${hw}w ${handoverOk} fillcuts ${out.coverage.fillCut.length} notes ${out.notes} $${out.cost} ${out.seconds}s`);
