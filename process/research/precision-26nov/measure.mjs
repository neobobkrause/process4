#!/usr/bin/env node
// The notice's precision on the converted proof (precision-26nov): replays the 150 recorded changes of the converted
// copy of the notice's proof the way the tool's own tool/test/notice-replay.mjs does (each module's uses file written
// for the product before the change by the tool's own writer, the same files in the product after it; the change's
// `meaning` named as ARCH's placed work), with the tool of any checkout, and prints who is told and why against the
// users that truly needed telling (needs.json): totals, and each user told without need in one class.
//
//   node process/research/precision-26nov/measure.mjs [<tool folder>] [--proof <proof folder>] [--needs <needs file>]
//        [--json <out file>] [--only <change id>,...]
//
// <tool folder> is a checkout's tool/ (default: this checkout's); it needs its node_modules (npm ci there).
// --proof defaults to converted-proof/ beside this file; for the tool's own fixture, --needs defaults to its expected.json.
// Nothing of the tool is changed: its modules are imported from the folder given.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const PROOF = path.resolve(opt('--proof') ?? path.join(HERE, 'converted-proof'));
const JSON_OUT = opt('--json');
const ONLY = opt('--only')?.split(',');
let NEEDS = opt('--needs');
const TOOL = path.resolve(args[0] ?? path.join(HERE, '..', '..', '..', 'tool'));
if (!NEEDS) NEEDS = fs.existsSync(path.join(PROOF, 'expected.json')) ? path.join(PROOF, 'expected.json') : path.join(HERE, 'needs.json');

const load = (rel) => import(pathToFileURL(path.join(TOOL, rel)).href);
const { notice, makeConfirm } = await load('lib/notice/notice.mjs');
const { loadTree } = await load('lib/notice/model.mjs');
const { usesData } = await load('lib/usescmd.mjs');
const { usesPath, usesText } = await load('lib/usesfile.mjs');

export const SERIES = ['planned', 'adversarial', 'adversarial-independent', 'round3-independent', 'round4-independent',
  'round5-independent', 'round6-independent', 'round7-independent', 'round8-independent'];

// ---- the replay (after tool/test/notice-replay.mjs) -------------------------------------------------------------------
function readChange(series, id) {
  const dir = path.join(PROOF, 'changes', series, id);
  return { ...JSON.parse(fs.readFileSync(path.join(dir, 'change.json'), 'utf8')), id, series, dir };
}
const listChanges = (series) => fs.readdirSync(path.join(PROOF, 'changes', series), { withFileTypes: true })
  .filter((e) => e.isDirectory()).map((e) => e.name).sort();

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}
function applyChange(change, dir) {
  const files = path.join(change.dir, 'files');
  if (fs.existsSync(files)) copyDir(files, dir);
  for (const d of change.delete ?? []) fs.rmSync(path.join(dir, d), { force: true });
}
function digestOf(dir) {
  const h = crypto.createHash('sha256');
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r); else if (!r.endsWith('.uses.json')) h.update(r).update('\0').update(fs.readFileSync(path.join(dir, r))).update('\0');
    }
  };
  walk('');
  return h.digest('hex');
}
const usesCache = new Map();
function writeUses(before, after) {
  const key = digestOf(before);
  if (!usesCache.has(key)) {
    const tree = loadTree(before);
    const out = {};
    for (const m of tree.modules) out[m.id] = usesData(tree, m.id, 'test');
    usesCache.set(key, out);
  }
  for (const dir of [before, after]) {
    const cfg = loadTree(dir).cfg;
    for (const [m, data] of Object.entries(usesCache.get(key))) {
      const p = path.join(dir, usesPath(cfg, m));
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, usesText(data));
    }
  }
  return usesCache.get(key);
}
function buildTrees(change) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-precision-'));
  const before = path.join(base, 'before'), after = path.join(base, 'after');
  copyDir(path.join(PROOF, 'product'), before);
  for (const pre of change.before ?? []) {
    const [s, i] = pre.includes('/') ? pre.split('/') : [change.series, pre];
    applyChange(readChange(s, i), before);
  }
  copyDir(before, after);
  applyChange(change, after);
  const uses = writeUses(before, after);
  return { base, before, after, uses };
}

// ---- the classes ------------------------------------------------------------------------------------------------------
const COMPUTED = new Set(['errors that can leave it changed', 'plain data or instance changed', 'now needs its object as this',
  'no longer needs its object as this', 'arguments written into changed', 'channels, settings or files changed', 'type error in its code']);
const TYPE_WORDS = new Set(['cannot stand in', 'accepts more', 'hands back differently', 'kind changed']);
const PASS = new Set(['import', 're-export', 'type named', 'pass on', 'store', 'receive', 'conversion']);
/** Uses of a kind that only hold or read it: never build, write or call it. */
const HOLDS = new Set(['import', 're-export', 'type named', 'pass on', 'store', 'receive', 'read']);
const matches = (changed, used) => used === changed || used.startsWith(`${changed}.`) || used.startsWith(`${changed}#`);
export const CLASSES = ['A', 'B1', 'B2', 'B3', 'B4', 'B5', 'outside', 'other'];
/** The precedence of a user's classes: the reason hardest to remove first. */
const PRECEDENCE = ['A', 'other', 'B1', 'B4', 'B5', 'B3', 'B2', 'outside'];

/**
 * The tool's own checker question (notice.mjs makeConfirm) asked both ways for an item: `equivalent`, each of its kinds
 * before and after assignable to the other; `grewOnly`, for a kind, the new one assignable to the old and not the other
 * way (it only gained members). Null where the checkout offers no makeConfirm or it cannot answer.
 */
function checkerFor(treeB, treeA, module) {
  if (typeof makeConfirm !== 'function') return { equivalent: () => null, grewOnly: () => null };
  let there, back;
  const ask = (item) => {
    try {
      there ??= makeConfirm(treeB, treeA, module);
      back ??= makeConfirm(treeA, treeB, module);
      return { oldToNew: there(item).confirmed, newToOld: back(item).confirmed };
    } catch { return null; }
  };
  return {
    equivalent: (item) => { const a = ask(item); return a && a.oldToNew && a.newToOld; },
    grewOnly: (item) => { const a = ask(item); return a && a.newToOld && !a.oldToNew; },
  };
}

/** The class of one reason a user is told for, and why, in words. */
function classify(r, user, n, uses, { equivalent, grewOnly }) {
  if (r.outside || r.orderFault || r.noUsesFile || !r.item) {
    return { cls: 'outside', why: r.outside ? `outside the standard: ${r.outside}` : r.orderFault ? `order fault: ${r.orderFault}` : r.noUsesFile ? 'no uses file' : 'no item' };
  }
  const words = r.changes ?? [];
  const c = n.changed.find((x) => x.module === r.module && x.item === r.item);
  if (c?.notConfirmed || words.includes('cannot stand in') && c?.words?.includes('accepts more')) return { cls: 'B5', why: `accepts more, not confirmed: ${c?.notConfirmed ?? ''}` };
  if (words.length && words.every((w) => COMPUTED.has(w))) return { cls: 'B3', why: `computed fact: ${words.join(', ')}` };
  // the tool's checker question for an operation or a table asks of what is handed in only: what it hands back is not asked
  const askable = !/^(op|table):/.test(r.item) || words.every((w) => w === 'cannot stand in' || w === 'accepts more');
  if (words.length && words.every((w) => TYPE_WORDS.has(w)) && askable && equivalent(r.item) === true) return { cls: 'B2', why: `equivalent kinds: ${words.join(', ')}` };
  const mine = (uses[user]?.uses ?? []).filter((u) => u.provider === r.module && matches(r.item, u.item));
  const copies = (uses[user]?.copies ?? []).filter((x) => x.provider === r.module && typeof x.item === 'string' && matches(r.item, x.item));
  if (words.length && words.every((w) => w === 'meaning changed') && mine.length && mine.every((u) => PASS.has(u.type))) {
    return { cls: 'B4', why: `named meaning, passed on only (${[...new Set(mine.map((u) => u.type))].join(', ')})` };
  }
  const exact = mine.some((u) => u.item === r.item) || copies.length;
  const changedNames = new Set(n.changed.filter((x) => x.module === r.module && x.tells !== false).map((x) => x.item));
  const memberHits = mine.filter((u) => u.item !== r.item);
  if (!exact && memberHits.length && memberHits.every((u) => !changedNames.has(u.item))) {
    return { cls: 'B1', why: `uses ${[...new Set(memberHits.map((u) => u.item))].join(', ')} of ${r.item}, which did not change itself (${words.join(', ')})` };
  }
  // B1 too: the user only holds or reads the kind X (receives it, names it, passes it on, reads it), never builds or
  // writes one, and uses none of X's members that changed: X changed by members the user does not touch (a member
  // listed as its own item that changed, came or went), or X, a kind, only gained members (its new kind is assignable to
  // the old one and not the other way: a new field told to a field reader).
  const direct = mine.filter((u) => u.item === r.item);
  if (exact && !copies.length && direct.every((u) => HOLDS.has(u.type))) {
    const prefix = [`${r.item}.`, `${r.item}#`];
    const own = (name) => prefix.some((p) => name.startsWith(p));
    const touched = [...n.changed.filter((x) => x.module === r.module && own(x.item)).map((x) => x.item), ...(r.module === n.provider ? (n.fresh ?? []).filter(own) : [])];
    const usedTouched = memberHits.filter((u) => touched.includes(u.item));
    const gained = /^[A-Z][a-z]/.test(r.item) && words.every((w) => w === 'hands back differently') && grewOnly(r.item) === true;
    if (!usedTouched.length && (touched.length || gained)) {
      return { cls: 'B1', why: `holds or reads ${r.item} (${[...new Set(direct.map((u) => u.type))].join(', ')})${memberHits.length ? ` and uses ${[...new Set(memberHits.map((u) => u.item))].join(', ')}` : ''}; ${touched.length ? `what changed is ${touched.join(', ')}` : 'it only gained members'} (${words.join(', ')})` };
    }
  }
  if (exact || memberHits.length) return { cls: 'A', why: `uses ${exact ? r.item : [...new Set(memberHits.map((u) => u.item))].join(', ')} (${[...new Set(mine.map((u) => u.type))].join(', ')}): ${words.join(', ')}` };
  return { cls: 'other', why: `no use of ${r.item} found in ${user}'s uses file (${words.join(', ')})` };
}

// ---- the run ----------------------------------------------------------------------------------------------------------
const needsFile = JSON.parse(fs.readFileSync(NEEDS, 'utf8'));
const needsOf = (id) => {
  const e = needsFile.changes?.[id];
  return Array.isArray(e) ? e : e?.needs ?? [];
};

const t = { needed: 0, told: 0, toldWithoutNeed: 0, missed: 0 };
const counts = Object.fromEntries(CLASSES.map((c) => [c, 0]));
const mixed = {};
const rows = [];
const missed = [];
const perChange = {};
const started = Date.now();
for (const series of SERIES) {
  for (const id of listChanges(series)) {
    if (ONLY && !ONLY.includes(id)) continue;
    const change = readChange(series, id);
    const { base, before, after, uses } = buildTrees(change);
    try {
      const treeB = loadTree(before), treeA = loadTree(after);
      const named = (change.meaning ?? []).map((x) => ({ found: 'named', ...x }));
      const n = notice(treeB, treeA, change.provider, { named });
      const checker = checkerFor(treeB, treeA, change.provider);
      const needs = needsOf(id);
      const told = n.told.map((x) => x.user);
      perChange[id] = { provider: change.provider, needs, changed: n.changed.map((c) => `${c.module} ${c.item}: ${c.changes.join(', ')}${c.tells === false ? ' (tells no one)' : ''}`), told };
      t.needed += needs.length;
      t.told += told.length;
      for (const u of needs.filter((x) => !told.includes(x))) {
        t.missed++;
        missed.push({ id, user: u, changed: n.changed.map((c) => `${c.module} ${c.item}: ${c.changes.join(', ')}${c.tells === false ? ' (tells no one)' : ''}`) });
      }
      for (const x of n.told) {
        if (needs.includes(x.user)) continue;
        t.toldWithoutNeed++;
        const rs = x.reasons.map((r) => ({ ...classify(r, x.user, n, uses, checker), reason: r.item ? `${r.module} ${r.item}: ${(r.changes ?? []).join(', ')}` : `${r.module}: ${r.outside ? 'outside' : r.orderFault ? 'order fault' : 'no uses file'}` }));
        const set = [...new Set(rs.map((r) => r.cls))];
        const cls = PRECEDENCE.find((c) => set.includes(c)) ?? 'other';
        counts[cls]++;
        if (set.length > 1) { const k = set.sort((a, b) => PRECEDENCE.indexOf(a) - PRECEDENCE.indexOf(b)).join('+'); mixed[k] = (mixed[k] ?? 0) + 1; }
        rows.push({ id, series, provider: change.provider, user: x.user, cls, classes: set, reasons: rs });
      }
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  }
}

const L = [];
L.push(`Tool: ${TOOL}`, `Proof: ${PROOF}`, `Needs: ${NEEDS}`, `Time: ${Math.round((Date.now() - started) / 1000)} s`, '');
L.push(`needed ${t.needed}, told ${t.told}, told without need ${t.toldWithoutNeed}, missed ${t.missed}`, '');
L.push('Told without need, by class (a user with reasons of several classes is counted once, in the first of A, other, B1, B4, B5, B3, B2, outside):');
for (const c of CLASSES) L.push(`  ${c.padEnd(8)} ${counts[c]}`);
if (Object.keys(mixed).length) {
  L.push('  of which with reasons of several classes:');
  for (const [k, v] of Object.entries(mixed).sort((a, b) => b[1] - a[1])) L.push(`    ${k}: ${v}`);
}
L.push('', 'Missed:');
if (!missed.length) L.push('  none');
for (const m of missed) L.push(`  ${m.id} ${m.user}; changed: ${m.changed.join('; ') || 'nothing'}`);
L.push('', 'Each told without need:');
for (const r of rows) L.push(`  [${r.cls}] ${r.id} ${r.user}: ${r.reasons.map((x) => `${x.cls} ${x.reason} -- ${x.why}`).join(' | ')}`);
console.log(L.join('\n'));
if (JSON_OUT) fs.writeFileSync(JSON_OUT, `${JSON.stringify({ tool: TOOL, proof: PROOF, totals: t, counts, mixed, missed, rows, changes: perChange }, null, 1)}\n`);
