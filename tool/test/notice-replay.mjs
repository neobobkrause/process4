// Replays the recorded changes of the notice's proof (build text 1, section 6), converted to the Process4 forms in
// fixtures/notice-proof/: the product, and each change as an overlay of the files it writes (proof: proof/trees.mjs).
// Each module's uses file is written for the product before the change by the stand-in writer (usesfile-standin.mjs),
// as each module's last job would have left it; a merge rewrites no other module's uses file, so the product after the
// change holds the same ones. A change's `meaning` stands for the items ARCH names in the work it placed.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { notice } from '../lib/notice/notice.mjs';
import { loadTree } from '../lib/notice/model.mjs';
import { check } from '../lib/notice/check.mjs';
import { makeProgram } from '../lib/notice/ts.mjs';
import { usesFilePath } from '../lib/usesfile.mjs';
import { writeUsesFiles } from './usesfile-standin.mjs';

export const FIXTURE = new URL('./fixtures/notice-proof/', import.meta.url).pathname;
export const SERIES = ['planned', 'adversarial', 'adversarial-independent', 'round3-independent', 'round4-independent',
  'round5-independent', 'round6-independent', 'round7-independent', 'round8-independent'];

export function readChange(series, id) {
  const dir = path.join(FIXTURE, 'changes', series, id);
  return { ...JSON.parse(fs.readFileSync(path.join(dir, 'change.json'), 'utf8')), id, series, dir };
}

export const listChanges = (series) => fs.readdirSync(path.join(FIXTURE, 'changes', series), { withFileTypes: true })
  .filter((e) => e.isDirectory()).map((e) => e.name).sort();

export const allChanges = () => SERIES.flatMap((s) => listChanges(s).map((id) => readChange(s, id)));

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

/** Every file of a folder and its text, for the cache of uses files. */
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

/** Each module's uses file, written into the product before the change and, the same, into the product after it. */
function writeUses(before, after) {
  const key = digestOf(before);
  if (!usesCache.has(key)) usesCache.set(key, writeUsesFiles(before));
  else for (const [m, data] of Object.entries(usesCache.get(key))) fs.writeFileSync(path.join(before, usesFilePath(loadTree(before).cfg, m)), `${JSON.stringify(data, null, 2)}\n`);
  const cfg = loadTree(after).cfg;
  for (const [m, data] of Object.entries(usesCache.get(key))) fs.writeFileSync(path.join(after, usesFilePath(cfg, m)), `${JSON.stringify(data, null, 2)}\n`);
}

/** The product before and after one change, in a fresh folder under `base`. */
export function buildTrees(change, base = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-proof-'))) {
  const before = path.join(base, 'before'), after = path.join(base, 'after');
  copyDir(path.join(FIXTURE, 'product'), before);
  for (const pre of change.before ?? []) {
    const [s, i] = pre.includes('/') ? pre.split('/') : [change.series, pre];
    applyChange(readChange(s, i), before);
  }
  copyDir(before, after);
  applyChange(change, after);
  writeUses(before, after);
  return { base, before, after };
}

/** A told module's reason, briefly: provider, item and words; or provider and how it was found, for a reason with no item. */
export const brief = (r) => (r.item ? `${r.module} ${r.item}: ${r.changes.join(', ')}${r.found.some((f) => f !== 'its means') ? ` (${r.found.join(', ')})` : ''}` : `${r.module}: ${r.found.join(', ')}`);

/**
 * The tool's answer to one change: who is told and, briefly, why; the changed items' words; whose check refuses after it.
 * @param o.named false to leave out the items the change's `meaning` names (ARCH's placed work)
 */
export function answer(change, { named = true } = {}) {
  const { base, before, after } = buildTrees(change);
  try {
    const n = notice(loadTree(before), loadTree(after), change.provider, { named: named ? (change.meaning ?? []).map((x) => ({ found: 'named', ...x })) : [] });
    const told = {};
    for (const t of n.told) told[t.user] = [...new Set(t.reasons.map(brief))];
    const tree = loadTree(after);
    const order = tree.modules.map((m) => m.id);
    const fresh = { program: makeProgram(tree.allFiles) };
    const refuses = order.slice(order.indexOf(change.provider)).filter((m) => check(tree, m, { analysis: fresh }).refused);
    return {
      changed: n.changed.map((c) => `${c.module} ${c.item}: ${c.changes.join(', ')}${c.tells ? '' : ' (tells no one)'}`),
      told,
      refuses,
      notice: n,
    };
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
}
