// Carrier + private answer key generation for values 1 (single text) and 2 (set of texts),
// and the early-probe carrier for value 4. Carriers are copies in the scratchpad; the tracked
// design/, build/, starting_texts/ files are only read.
import fs from 'node:fs';
import path from 'node:path';

export const REPO = '/home/user/process4';
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
export function shuffle(a, R) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export let EXCLUDE = [];
export function setExclude(x) { EXCLUDE = x; }
export function governingFiles() {
  const out = [];
  for (const d of ['design', 'build', 'starting_texts'])
    for (const f of fs.readdirSync(path.join(REPO, d)).sort()) if (f.endsWith('.md') && !EXCLUDE.includes(`${d}/${f}`)) out.push({ name: `${d}/${f}`, text: fs.readFileSync(path.join(REPO, d, f), 'utf8') });
  return out;
}

// ---- neutral filler of comparable structure (headed sections, lists, tables) ----
const W = 'record session module branch request owner review handover reading window refresh tranche round walk step test check listing entry folder index page note figure value limit count rule line section part order kind state table copy text measure size field form comment issue label marker report summary account harness config archive term'.split(' ');
const V = 'keeps lists names records reads writes holds marks opens closes carries follows replaces checks counts orders states shows sets gives takes'.split(' ');
function sentence(R) { const n = 8 + Math.floor(R() * 10); const w = []; for (let i = 0; i < n; i++) w.push(i === 2 ? V[Math.floor(R() * V.length)] : W[Math.floor(R() * W.length)]); const s = w.join(' '); return s[0].toUpperCase() + s.slice(1) + '.'; }
export function filler(bytes, R) {
  let s = ''; let sec = 1;
  while (s.length < bytes + 2000) {
    s += `\n## ${sec}. Notes on the ${W[Math.floor(R() * W.length)]} ${W[Math.floor(R() * W.length)]}\n\n`;
    s += Array.from({ length: 2 + Math.floor(R() * 2) }, () => sentence(R)).join(' ') + '\n\n';
    for (let i = 0; i < 3 + Math.floor(R() * 3); i++) s += `- ${sentence(R)} ${sentence(R)}\n` + (R() < 0.4 ? `  - ${sentence(R)} ${sentence(R)}\n` : '');
    if (R() < 0.5) { s += `\n| Item | Kind | Note |\n|---|---|---|\n`; for (let i = 0; i < 3; i++) s += `| ${W[Math.floor(R() * W.length)]} | ${W[Math.floor(R() * W.length)]} | ${sentence(R)} |\n`; }
    sec++;
  }
  return s;
}
// trim/pad a text to exactly n bytes, ending in a newline (ASCII text assumed for filler; real texts are ASCII)
export function exact(text, n, R) {
  let b = Buffer.from(text, 'utf8');
  if (b.length > n) { let t = b.subarray(0, n).toString('utf8'); const k = t.lastIndexOf('\n', n - 1); t = t.slice(0, k + 1); b = Buffer.from(t, 'utf8'); }
  let t = b.toString('utf8');
  if (b.length < n) { const need = n - b.length; let f = filler(need + 500, R).replace(/^\n+/, ''); f = Buffer.from(f).subarray(0, need - 1).toString('utf8') + '\n'; t += f; }
  return t;
}

// ---- probes ----
const SUBJ = ['Orchid register', 'Basalt ledger', 'Cinder checklist', 'Juniper tally', 'Marigold index', 'Quartz roster', 'Heron docket', 'Lichen manifest', 'Pewter almanac', 'Sorrel catalogue', 'Tamarind log', 'Vellum schedule', 'Walnut inventory', 'Yarrow journal', 'Zircon digest', 'Alder census', 'Bramble folio', 'Cobalt survey', 'Damson ledger', 'Ember register', 'Fennel roster', 'Garnet docket', 'Hazel manifest', 'Indigo tally', 'Jasper index', 'Kestrel catalogue', 'Linden log', 'Mallow schedule', 'Nettle inventory', 'Oriel journal', 'Plover digest', 'Quince census', 'Rowan folio', 'Saffron survey', 'Thistle register', 'Umber ledger', 'Vetch checklist', 'Willow almanac'];
const ATTR = ['audit code', 'calibration key', 'reference mark', 'tracking number'];
const LET = 'BCDFGHJKLMNPQRSTVWXZ';
function code(R) { return LET[Math.floor(R() * 20)] + LET[Math.floor(R() * 20)] + '-' + (1000 + Math.floor(R() * 9000)); }
export function makeProbes(R, nPlanted, nNeg) {
  const subj = shuffle(SUBJ, R).slice(0, nPlanted + nNeg);
  const used = new Set();
  return subj.map((s, i) => { let c; do c = code(R); while (used.has(c)); used.add(c);
    const a = ATTR[Math.floor(R() * ATTR.length)];
    return { subject: s, attr: a, code: c, planted: i < nPlanted, question: `What is the ${a} for the ${s}?` }; });
}

// Insert a probe near byte offset pos (string index; texts are ASCII). shallow: a standalone top-level
// paragraph at a block boundary. deep: inside a nested list item / table cell / mid-paragraph line.
function insertAt(text, pos, p, depth, zone, relax = 1) {
  const lines = text.split('\n'); const starts = []; let o = 0; for (const l of lines) { starts.push(o); o += l.length + 1; }
  const fence = []; { let f = false; for (const l of lines) { if (l.startsWith('```')) f = !f; fence.push(f); } }
  const taken = [...text.matchAll(/[A-Z]{2}-\d{4}/g)].map(m => m.index);
  const gap = Math.floor((zone ? Math.min(500, Math.floor((zone[1] - zone[0]) * text.length / 5)) : 500) / relax);
  const inZone = (k) => !zone || (starts[k] / text.length >= zone[0] + 0.003 && starts[k] / text.length <= zone[1] - 0.003);
  const far = (k) => taken.every(x => x < starts[k] - gap || x > starts[k] + lines[k].length + gap);
  let li = starts.findIndex((st, i) => st + lines[i].length >= pos); if (li < 0) li = lines.length - 1;
  const tiers = depth === 'shallow'
    ? [(k) => lines[k] === '' && lines[k - 1] !== '' && !/^\|/.test(lines[k - 1]) && !fence[k]]
    : [(k) => !fence[k] && ((/^\s+[-*] /.test(lines[k]) && lines[k].length > 60) || (/^\|.*\|.*\|/.test(lines[k]) && !/^\|[\s:|-]+\|$/.test(lines[k]) && lines[k].length > 60) || (/^[-*] /.test(lines[k]) && lines[k].length > 200) || (/^[A-Za-z*]/.test(lines[k]) && lines[k].length > 250)),
       (k) => !fence[k] && !/^#/.test(lines[k]) && !/^\|[\s:|-]+\|$/.test(lines[k]) && lines[k].length > 80,
       (k) => !fence[k] && !/^#/.test(lines[k]) && !/^\|[\s:|-]+\|$/.test(lines[k]) && lines[k].length > 40];
  for (const ok of tiers) for (let d = 0; d < lines.length; d++) for (const k of [li + d, li - d]) {
    if (!(k > 0 && k < lines.length) || !inZone(k) || !far(k) || !ok(k)) continue;
    if (depth === 'shallow') { lines.splice(k, 0, '', `The ${p.attr} for the ${p.subject} is ${p.code}.`); return { text: lines.join('\n'), kind: 'top-level paragraph' }; }
    const l = lines[k]; let kind;
    if (l.startsWith('|')) { const cells = l.split('|'); const ci = Math.max(1, Math.floor((cells.length - 1) / 2)); cells[ci] = cells[ci].replace(/\s*$/, '') + ` (the ${p.attr} for the ${p.subject} is ${p.code}) `; lines[k] = cells.join('|'); kind = 'table cell'; }
    else { const mid = Math.floor(l.length / 2); let b = l.indexOf('. ', mid); if (b < 0) b = l.lastIndexOf('. ', mid); if (b < 0) b = l.indexOf(', ', mid); if (b < 0) b = l.indexOf(' ', mid); if (b < 0) b = l.length - 1;
      lines[k] = l.slice(0, b + 1) + ` (The ${p.attr} for the ${p.subject} is ${p.code}.)` + l.slice(b + 1); kind = /^\s+[-*] /.test(l) ? 'nested list item' : /^[-*] /.test(l) ? 'list item, mid-line' : 'mid-paragraph'; }
    return { text: lines.join('\n'), kind };
  }
  if (relax < 8) return insertAt(text, pos, p, depth, zone, relax * 2);
  throw new Error('no insertion site ' + depth + ' ' + JSON.stringify(zone));
}
const ZONES = { early: [0, 0.15], middle: [0.38, 0.62], late: [0.85, 1] };
// 12 probes: early/middle/late x shallow/deep, 2 each. Fractions within each zone.
export const GRID = [
  ['early', 'shallow', 0.015], ['early', 'deep', 0.05], ['early', 'shallow', 0.09], ['early', 'deep', 0.13],
  ['middle', 'deep', 0.42], ['middle', 'shallow', 0.47], ['middle', 'deep', 0.53], ['middle', 'shallow', 0.58],
  ['late', 'deep', 0.86], ['late', 'shallow', 0.90], ['late', 'deep', 0.94], ['late', 'shallow', 0.98]];

// Single carrier: rotated real governing texts, cut at a line end, probes planted, filler to exactly `bytes`.
export function singleCarrier(bytes, seed) {
  const R = rng(seed * 7919 + bytes);
  const files = shuffle(governingFiles(), R);
  let body = files.map(f => f.text.trim() + '\n').join('\n');
  const probes = makeProbes(R, 12, 2);
  const probeBytes = probes.filter(p => p.planted).reduce((s, p) => s + p.attr.length + p.subject.length + p.code.length + 20, 0);
  body = exact(body, bytes - probeBytes - 60, R); // real text first
  const realBytes = Buffer.byteLength(body);
  // plant from the back so earlier offsets stay valid
  const planted = probes.filter(p => p.planted).map((p, i) => ({ ...p, zone: GRID[i][0], depth: GRID[i][1], frac: GRID[i][2] }));
  let t = body;
  for (const p of [...planted].sort((a, b) => a.frac - b.frac)) { const r = insertAt(t, Math.floor(p.frac * t.length), p, p.depth, ZONES[p.zone]); t = r.text; p.site = r.kind; }
  t = exact(t, bytes, R);
  for (const p of planted) { const idx = t.indexOf(p.code); p.offset = idx; p.actualFrac = +(idx / bytes).toFixed(3); p.line = t.slice(0, idx).split('\n').length; }
  return { text: t, key: { bytes: Buffer.byteLength(t), realBytes, fillerBytes: bytes - realBytes, lines: t.split('\n').length - 1, probes: [...planted, ...probes.filter(p => !p.planted)] } };
}

// Set: real governing files (each whole, under the single-text limit), in a rotated order, plus one
// neutral filler file placed at a random position, totalling `bytes`. Probes by position within the whole set.
export function setCarrier(bytes, seed) {
  const R = rng(seed * 104729 + bytes);
  const pool = shuffle(governingFiles(), R);
  const chosen = []; let tot = 0;
  for (const f of pool) { if (tot + Buffer.byteLength(f.text) <= bytes - 3000) { chosen.push({ ...f }); tot += Buffer.byteLength(f.text); } }
  const probes = makeProbes(R, 12, 2);
  const planted = probes.filter(p => p.planted).map((p, i) => ({ ...p, zone: GRID[i][0], depth: GRID[i][1], frac: GRID[i][2] }));
  const probeBytes = planted.reduce((s, p) => s + p.attr.length + p.subject.length + p.code.length + 22, 0);
  const fillBytes = bytes - tot - probeBytes;
  const fpos = 1 + Math.floor(R() * (chosen.length - 1));
  chosen.splice(fpos, 0, { name: 'filler', text: '# Appendix: working notes\n' + filler(fillBytes, R) });
  chosen[fpos].text = exact(chosen[fpos].text, fillBytes, R);
  // plant by global position
  const total = chosen.reduce((s, f) => s + f.text.length, 0);
  for (const p of planted) {
    let g = Math.floor(p.frac * total); let k = 0; while (g >= chosen[k].text.length && k < chosen.length - 1) { g -= chosen[k].text.length; k++; }
    const r = insertAt(chosen[k].text, g, p, p.depth, null); chosen[k].text = r.text; p.site = r.kind; p.fileIndex = k; p.line = r.line;
  }
  const finalTot = chosen.reduce((s, f) => s + Buffer.byteLength(f.text), 0);
  // fix exact total on the filler file
  const diff = finalTot - bytes; if (diff !== 0) chosen[fpos].text = exact(chosen[fpos].text, Buffer.byteLength(chosen[fpos].text) - diff, R);
  const files = chosen.map((f, i) => ({ file: `${String(i + 1).padStart(2, '0')}-${f.name.replace(/\//g, '-').replace(/^(design|build|starting_texts)-/, '$1-')}`.replace(/-filler$/, '-appendix-working-notes.md'), source: f.name, text: f.text }));
  let run = 0; for (const f of files) { f.bytes = Buffer.byteLength(f.text); f.lines = f.text.split('\n').length - (f.text.endsWith('\n') ? 1 : 0); run += f.bytes; }
  let cum = 0; const starts = files.map(f => { const s = cum; cum += f.bytes; return s; });
  for (const p of planted) { const f = files[p.fileIndex]; p.file = f.file; p.actualFrac = +((starts[p.fileIndex] + f.text.indexOf(p.code)) / cum).toFixed(3); }
  return { files, key: { bytes: cum, nFiles: files.length, maxFile: Math.max(...files.map(f => f.bytes)), probes: [...planted, ...probes.filter(p => !p.planted)] } };
}

export function questionnaire(key, R) {
  const qs = shuffle(key.probes, R);
  return { order: qs.map(p => p.subject), text: qs.map((p, i) => `${i + 1}. ${p.question}`).join('\n') };
}

export function score(key, order, reply) {
  const ans = {};
  for (const line of (reply || '').split('\n')) { const m = line.match(/^\s*\**\s*(\d+)[.):]\**\s*(.*)$/); if (m) ans[+m[1]] = m[2]; }
  const res = order.map((subj, i) => {
    const p = key.probes.find(x => x.subject === subj); const a = (ans[i + 1] || '').trim();
    const codes = a.toUpperCase().match(/[A-Z]{2}-\d{4}/g) || [];
    const saysNot = /not (stated|present|in the|given|mentioned)|no such|unknown|does not (say|appear|state|mention)|n\/a/i.test(a);
    let ok; if (p.planted) ok = codes.length === 1 && codes[0] === p.code; else ok = codes.length === 0 && saysNot;
    return { subject: subj, planted: p.planted, zone: p.zone, depth: p.depth, expected: p.planted ? p.code : 'NOT STATED', answer: a, ok };
  });
  const probes = res.filter(x => x.planted), negs = res.filter(x => !x.planted);
  const missed = probes.filter(x => !x.ok);
  return { recall: probes.filter(x => x.ok).length, of: probes.length, negOk: negs.filter(x => x.ok).length, negOf: negs.length,
    missedClasses: missed.map(x => `${x.zone}/${x.depth}`), invalid: negs.some(x => !x.ok), clean: missed.length === 0 && negs.every(x => x.ok), detail: res };
}

export function validate(key, bytes, isSet) {
  const P = key.probes.filter(p => p.planted);
  const z = { early: [0, 0.15], middle: [0.38, 0.62], late: [0.85, 1] };
  const outz = P.filter(p => p.actualFrac < z[p.zone][0] - 0.02 || p.actualFrac > z[p.zone][1] + 0.02);
  let gapOk = true;
  if (!isSet) { const o = P.map(p => p.offset).sort((a, b) => a - b); const g = Math.min(...o.slice(1).map((x, i) => x - o[i])); gapOk = g >= Math.min(500, bytes / 40); }
  else { const a = P.map(p => p.actualFrac).sort((x, y) => x - y); gapOk = Math.min(...a.slice(1).map((x, i) => x - a[i])) * bytes >= 500; }
  return outz.length === 0 && gapOk && key.bytes === bytes;
}
export function validCarrier(kind, bytes, seed) {
  for (let k = 0; k < 200; k++) { const s = seed * 1000 + k; try { const c = kind === 'single' ? singleCarrier(bytes, s) : setCarrier(bytes, s); if (validate(c.key, bytes, kind !== 'single')) { c.key.variant = s; return c; } } catch {} }
  throw new Error('no valid carrier');
}
