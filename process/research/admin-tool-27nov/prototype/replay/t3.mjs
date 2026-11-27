// civicsmith's tranche t3, replayed as events into the local service, from process/research/tranche-t3-study-27nov.md
// only (cited by section). Every time below is in that file. Where the file gives no fact, the event says so in `note`
// and is marked: U (not in the study) or I (an inference from its words). Three products are fed:
//   facts  — the charter as civicsmith's record held it; provider jobs' openings known only as "no later than" the refusal.
//   just   — the same, with the study's "Each was a job ARCH had just opened" read as "opened after case-checker's
//            test pass that then stood" (I), which is what rule Y turns on.
//   x      — as `just`, but with a conversions-only charter from the owner's "lift the stop" at 21:29:50 (the intent
//            PROCESS #19's handover recorded, which civicsmith never held: a counterfactual, §1).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startService } from '../lib/local.mjs';
import { connect } from '../lib/client.mjs';

const D26 = (hm) => `2026-11-26T${hm.length === 5 ? `${hm}:00` : hm}.000Z`;
const D27 = (hm) => `2026-11-27T${hm.length === 5 ? `${hm}:00` : hm}.000Z`;
const CC = 'session_012hdw2S1BUKkpkTUqQfAK43'; // case-checker #5 (status-from-the-system-27nov.md)
const FIRST8 = Array.from({ length: 8 }, (_, i) => `first-8 #${i + 1}`); // names not in the study (U); converted (§1)
const UNNAMED6 = Array.from({ length: 6 }, (_, i) => `unnamed conversion ${i + 1}`); // "six conversions (23:15)", names U
// "Each was a job ARCH had just opened on a module case-checker uses" (§4): so case-checker uses each module named below.
const PROVIDERS = ['ooxml', 'csv-reader', 'office-readers', 'odf-reader', 'format-registry', 'text-chain', 'site-profiles', 'pdf-reader', 'docprofile', ...UNNAMED6];

// The refusals of case-checker's merge (§4): time, the provider jobs named, and their pull requests where given.
const REFUSALS = [
  [D26('23:15'), UNNAMED6.map((m) => [m, null]), 'six conversions'],
  [D26('23:54'), [['ooxml', null], ['csv-reader', null]], 'ooxml and csv-reader, held by the TextDecoder refusal'],
  [D27('02:17'), [['office-readers', '#13'], ['odf-reader', '#9']], 'office-readers #13 and odf-reader #9'],
  [D27('02:37'), [['ooxml', '1739'], ['office-readers', '1734']], 'ooxml 1739 and office-readers 1734'],
  [D27('02:49'), [['format-registry', null], ['text-chain', null], ['site-profiles', null]], 'format-registry, text-chain and site-profiles'],
  [D27('02:59'), [['csv-reader', null]], 'csv-reader'],
  [D27('03:19'), [['csv-reader', null]], 'csv-reader'],
  [D27('03:24'), [['office-readers', null], ['odf-reader', null]], 'office-readers and odf-reader'],
  [D27('03:26'), [['pdf-reader', null]], 'pdf-reader'],
  [D27('03:33'), [['docprofile', '1752']], 'docprofile 1752'],
];
// case-checker's passes (§4): 22:00, 22:56, 01:57; notices after its tests at 22:04 and 01:48.
const standingAt = (t) => (Date.parse(t) >= Date.parse(D27('01:57')) ? D27('01:57') : Date.parse(t) >= Date.parse(D26('22:56')) ? D26('22:56') : null);

function events(variant) {
  const E = [];
  const add = (at, kind, body, note = '') => E.push({ at, kind, body, note });
  add(D26('21:21:57'), 'module.declared', { modules: [
    ...FIRST8.map((name, i) => ({ name, order: i + 1, converted: true })),
    { name: 'case-checker', order: 125, uses: PROVIDERS, converted: null },
    ...PROVIDERS.map((name) => ({ name, order: null, converted: null })),
    { name: 'civil-time', order: null, converted: true }, { name: 'connection-grammar', order: null, converted: true },
    ...['setup-words', 'jurisdictions', 'calc-grammar', 'test-support', 'pdf-worker', 'legistar-reader'].map((name) => ({ name, order: null, converted: null })),
  ] }, 'module order: only case-checker (125th) is in the study (U for the rest); the first eight are converted (§1), their names U');
  const first8 = '"Instruction: once civicsmith is using the latest process4 version, open a tranche to convert the first 8 modules in order, writing the facility list first; then stop for my review"';
  add(D26('21:21:57'), 'charter.set', { words: JSON.parse(first8), kind: 'first-n', n: 8, by: 'owner', source: "civicsmith's decision record as coordinator #13 read it at 21:21:57; when he typed it: U" });
  add(D26('21:21:57'), 'stop.set', { words: 'then stop for my review', by: 'owner' }, "the stop's own record is not quoted in the study (U); its words here are the instruction's");
  add(D26('21:29:50'), 'owner.words', { text: 'The review of the first 8 modules is complete. The process has been updated based on that work. Instruction: lift the stop', where: 'civicsmith coordinator' });
  add(D26('21:29:50'), 'stop.lift', {});
  if (variant === 'x') add(D26('21:29:50'), 'charter.set', { words: 'every module in order, conversions only', kind: 'conversions-only', notices: 'hold', by: 'owner', source: "COUNTERFACTUAL: PROCESS #19's handover's words; civicsmith never held them (§1)" });
  add(D26('21:37:42'), 'owner.words', { text: "The fact that the review of the first eight modules is complete isn't a decision, it's a fact that I've confirmed for you.", where: 'civicsmith coordinator' });
  add(D26('21:48'), 'job.opened', { pr: 1710, module: 'case-checker', kind: 'ordinary', session: CC, label: 'case-checker #5' }, 'who started it: U');
  add(D26('22:00'), 'job.tests', { pr: 1710, passed: true, count: '160/160' }, 'an earlier failing run is in §4; its time is U');
  add(D26('22:01'), 'scope.widen', { by: 'ARCH #32', words: 'The review pause is over…', what: 'the next eight modules (names U); the four inherited fixes run first' });
  for (const m of ['setup-words', 'jurisdictions', 'calc-grammar']) add(D26('22:01'), 'job.opened', { pr: `${m}@fix`, module: m, kind: 'ordinary', bound: 'no-later-than', label: `${m} inherited fix (one of 1706–1708)` }, 'which of 1706–1708 is which: U; opened no later than 22:01 (their numbers being below 1710 suggest before 21:48, I)');
  add(D26('22:04'), 'notice.arrived', { module: 'case-checker', from: 'U (not named in §4)' });
  add(D26('22:56'), 'job.tests', { pr: 1710, passed: true, count: '160/160' });
  add(D26('23:05'), 'scope.widen', { by: 'ARCH #32', words: 'conversions are the cheapest work to run while PROCESS looks at the fix', what: 'csv-reader to docprofile' });
  add(D26('23:17'), 'work.offered', { module: 'test-support', kind: 'requirement', items: ['R16', 'R17'], words: 'next-job offered them as an ordinary job; ARCH took test-support out of scope' });
  for (const [m, n] of [['text-chain', '#3'], ['csv-reader', '#6'], ['office-readers', '#13'], ['odf-reader', '#9']]) add(D26('23:59'), 'work.waiting', { module: m, kind: 'flaw', ref: `${m} ${n}`, words: 'a defect a conversion found ("A conversion can\'t fix that", ARCH #32, 23:57, 23:59)', bound: 'no-later-than' }, 'which flaw was placed when: U');
  add(D27('01:17'), 'slots.set', { number: 4, words: 'the owner cut slots to 4 (his words: U)' });
  add(D27('01:48'), 'notice.arrived', { module: 'case-checker', from: "text-chain's fix" });
  add(D27('01:57'), 'job.tests', { pr: 1710, passed: true, count: '160/160' });
  add(D27('02:15'), 'job.merged', { pr: 'setup-words@fix', bound: 'no-later-than' }, '"By 02:15 the open jobs were three such fixes and case-checker": the inherited fixes had ended; when: U');
  add(D27('02:15'), 'job.merged', { pr: 'jurisdictions@fix', bound: 'no-later-than' });
  add(D27('02:15'), 'job.merged', { pr: 'calc-grammar@fix', bound: 'no-later-than' });
  add(D27('02:52:51'), 'owner.words', { text: 'Decision: this tranche is housekeeping: module conversions only, no new features. A conversion changes no behaviour, so ARCH names no walk area for it; a round in which no area is named has no walk and no deployment.', where: 'civicsmith coordinator' });
  if (variant !== 'x') add(D27('02:52:51'), 'charter.set', { words: 'Decision: this tranche is housekeeping: module conversions only, no new features. …', kind: 'conversions-only', notices: 'hold', by: 'owner', source: 'the 02:52:51 decision, read by the service as a conversions-only kind (option X); ARCH #34 read it as "conversions only, plus the small fixes"' });
  // the refusals, each with its provider jobs open at that moment
  let open = [];
  for (const [t, named, said] of REFUSALS) {
    const ids = named.map(([m, n]) => `${m}@${n || t.slice(11, 16)}`);
    for (const id of open.filter((x) => !ids.includes(x))) add(t, 'job.closed', { pr: id, bound: 'no-later-than' }, 'I: a provider named at one attempt and not at the next is taken as no longer open');
    for (const [[m, n], id] of named.map((x, i) => [x, ids[i]])) {
      if (open.includes(id)) continue;
      const after = variant === 'facts' ? null : standingAt(t);
      add(t, 'job.opened', { pr: id, module: m, kind: m.startsWith('unnamed') ? 'conversion' : 'ordinary', bound: 'no-later-than', opened_after: after, label: `${m}${n ? ` ${n}` : ''}`, takes: [`${m} ${n}`] },
        after ? `I: "just opened" read as after case-checker's standing pass (${after})` : 'opened no later than this refusal; the study says "just opened" (exact time U)');
    }
    open = ids;
    add(t, 'merge.refused', { pr: 1710, held_by: named.map(([m, n]) => `${m}${n ? ` ${n}` : ''}`), said });
  }
  for (const id of open) add(D27('03:49'), 'job.closed', { pr: id, bound: 'no-later-than' }, 'I: the last holder ended before the merge');
  add(D27('03:49'), 'job.merged', { pr: 1710, sha: '1c12b6bd' }, "its session's archive time: U (archived as read ~08:00Z, status-from-the-system-27nov.md)");
  add(D27('04:06'), 'scope.widen', { by: 'ARCH', what: "round 2's sixteen" });
  add(D27('04:58'), 'work.offered', { module: 'docprofile', kind: 'ordinary', items: ['docprofile #8'], words: "an ordinary job for a flaw legistar-reader's conversion found" });
  add(D27('05:14'), 'work.offered', { module: 'U (told modules)', kind: 'told', items: ["told jobs from docprofile's merge, 05:14–05:18"], words: 'started above the slot number' });
  add(D27('05:14'), 'slots.set', { number: 8, words: 'slot number 8 ("slots in use 11 of 8"); when it went back from 4 to 8: U' });
  add(D27('05:22'), 'work.offered', { module: 'pdf-worker', kind: 'requirement', items: ['R45'], words: 'a requirement of a whole module in scope' });
  add(D27('05:54'), 'work.offered', { module: 'U (told modules)', kind: 'told', items: ["told jobs from docprofile's second merge, 05:54–06:07"] });
  for (let i = 1; i <= 14; i++) add(D27('06:06'), 'job.opened', { pr: `halt-${i}`, module: `unnamed open job ${i}`, kind: i <= 8 ? 'told' : 'ordinary', bound: 'no-later-than', label: i <= 8 ? `told by docprofile's merge (${i} of 8)` : `open job (${i - 8} of 6, kind U)` }, '"At the halt 14 job sessions were open against 8 slots, eight of them told by docprofile\'s merge" (§3); names U');
  return E.map((e, i) => [e, i]).sort((a, b) => Date.parse(a[0].at) - Date.parse(b[0].at) || a[1] - b[1]).map(([e]) => e);
}

const CHECKPOINTS = [
  [D26('21:30'), 'stop lifted'], [D26('21:49'), 'case-checker #5 opened'], [D26('22:01'), 'ARCH widens: review pause over'],
  [D26('22:05'), 'notice to case-checker after its pass'], [D26('22:57'), 'tests pass again'], [D26('23:05'), 'ARCH widens: csv-reader to docprofile'],
  ...REFUSALS.slice(0, 2).map(([t]) => [t, 'merge refused']), [D27('01:18'), 'slots cut to 4'], [D27('01:58'), 'tests pass a third time'],
  ...REFUSALS.slice(2, 5).map(([t]) => [t, 'merge refused']), [D27('02:53'), 'the owner\'s "conversions only" decision'],
  ...REFUSALS.slice(5).map(([t]) => [t, 'merge refused']), [D27('03:49'), 'merged'], [D27('04:06'), 'ARCH widens: round 2'],
  [D27('04:20'), '31 min after the merge'], [D27('05:23'), 'round 2 offers'], [D27('06:06'), 'the halt'],
];

const q = (r) => r.ready.find((x) => x.pr === 1710);
const verdict = (r) => { const j = q(r); return j ? `${j.verdict}${j.holders.length ? ` (${j.holders.filter((h) => !r.rule_y || h.under_y !== 'free').map((h) => `${h.module}${r.rule_y ? `:${h.under_y}` : ''}`).join(', ') || '-'})` : ''}` : 'not ready'; };

export async function replay({ log = console.log } = {}) {
  const svc = await startService();
  const out = { rows: [], notes: [] };
  try {
    const cl = Object.fromEntries(['facts', 'just', 'x'].map((v) => [v, connect({ url: svc.url, key: svc.keys.import, product: `t3-${v}` })]));
    const evs = Object.fromEntries(Object.keys(cl).map((v) => [v, events(v)]));
    out.notes = evs.facts.filter((e) => e.note).map((e) => `${e.at.slice(5, 16).replace('T', ' ')} ${e.kind}: ${e.note}`);
    const pos = Object.fromEntries(Object.keys(cl).map((v) => [v, 0]));
    let posted = 0;
    for (const [t, what] of CHECKPOINTS) {
      for (const v of Object.keys(cl)) {
        while (pos[v] < evs[v].length && Date.parse(evs[v][pos[v]].at) <= Date.parse(t)) {
          const e = evs[v][pos[v]++];
          await cl[v].append(e.kind, e.body, { at: e.at, key: `replay-t3-${v}-${pos[v]}`, actor: e.body.by || null });
          posted++;
        }
      }
      const [mqOff, mqYA, mqYB, anA, nextA, nextX, brA, brC] = await Promise.all([
        cl.facts.mergeQueue({ now: t }), cl.facts.mergeQueue({ now: t, y: true }), cl.just.mergeQueue({ now: t, y: true }),
        cl.facts.anomalies({ now: t }), cl.facts.next({ now: t }), cl.x.next({ now: t }),
        cl.facts.brief('arch', { now: t }), cl.facts.brief('coordinator', { now: t }),
      ]);
      const anX = await cl.x.anomalies({ now: t, y: true });
      if (t === D27('03:33')) { out.brief_0333 = brA.text; out.brief_0333_coordinator = brC.text; }
      out.rows.push({
        t: t.slice(11, 16), what, mq_off: verdict(mqOff), mq_y_facts: verdict(mqYA), mq_y_just: verdict(mqYB),
        ready_waited_min: q(mqOff)?.waited_min ?? null,
        anomalies: {
          ready_waiting: anA.ready_waiting.map((x) => `${x.module} ${x.waited_min} min`), merged_not_archived: anA.merged_not_archived.map((x) => `${x.pr} ${x.for_min} min`),
          open_no_session: anA.open_no_session.length, outside_charter: anA.outside_charter.map((x) => `${x.module}(${x.kind})`), scope_vs_charter: anA.scope_vs_charter.map((x) => `${x.at.slice(11, 16)} ${x.widened}`), over_slots: anA.over_slots,
        },
        anomalies_x_outside_charter: anX.outside_charter.length,
        next_recorded: nextA.next ? `${nextA.next.module} (${nextA.next.kind})` : nextA.why, next_x: nextX.next ? `${nextX.next.module} (${nextX.next.kind})` : nextX.why,
        held_x: nextX.held.map((h) => h.ref), offered_x: nextX.offered_check.map((o) => `${o.at.slice(11, 16)} ${o.items.join('+')}: ${o.charter_allows ? 'allowed' : 'held'}`),
        offered_recorded: nextA.offered_check.map((o) => `${o.at.slice(11, 16)} ${o.items.join('+')}: ${o.charter_allows ? 'allowed' : 'held'}`),
        brief_bytes: { arch: brA.bytes, coordinator: brC.bytes },
      });
    }
    out.events_posted = posted;
    // the same views read back afterwards "as of" each checkpoint, from the whole log: they must agree
    let agree = 0;
    for (const [t] of CHECKPOINTS) {
      const [a, b] = [await cl.facts.mergeQueue({ now: t, asof: t }), await cl.just.mergeQueue({ now: t, asof: t, y: true })];
      const row = out.rows.find((r) => r.t === t.slice(11, 16));
      if (verdict(a) === row.mq_off && verdict(b) === row.mq_y_just) agree++;
    }
    out.asof_agrees = `${agree} of ${CHECKPOINTS.length} checkpoints`;
    const { loaded: _l, ...stats } = await cl.facts.stats();
    out.stats = stats;
    out.refusals_recorded = (await cl.facts.events({ limit: 1000 })).filter((e) => e.kind === 'merge.refused').length;
  } finally { await svc.stop(); }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = await replay();
  const file = fileURLToPath(new URL('./t3-output.json', import.meta.url));
  writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  for (const r of out.rows) console.log(`${r.t} ${r.what.padEnd(38)} off: ${r.mq_off.slice(0, 70)} | Y facts: ${r.mq_y_facts.slice(0, 60)} | Y just: ${r.mq_y_just.slice(0, 60)}`);
  const { loaded, ...stats } = out.stats;
  console.log(`events posted ${out.events_posted}; as-of read-back agrees at ${out.asof_agrees}`, JSON.stringify(stats));
}
