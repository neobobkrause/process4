// Replays the recorded changes of the notice's proof (build text 1, section 6), converted to the Process4 forms in
// fixtures/notice-proof/: the product, and each change as an overlay of the files it writes (proof: proof/trees.mjs).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { analyse, notice } from '../lib/notice/notice.mjs';
import { loadTree } from '../lib/notice/model.mjs';
import { check } from '../lib/notice/check.mjs';
import { makeProgram } from '../lib/notice/ts.mjs';

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
  return { base, before, after };
}

/** The tool's answer to one change: who is told and, briefly, why; the entries' words; whose check refuses after it. */
export function answer(change) {
  const { base, before, after } = buildTrees(change);
  try {
    // The notice is read in stages, as notify reads it (lib/notice/staged.mjs); the check below reads the whole product.
    const n = notice(loadTree(before), loadTree(after), change.provider);
    const told = {};
    for (const t of n.told) {
      told[t.user] = t.reasons.map((r) => (r.notFollowed ? `${r.module}: not followed fully` : `${r.module} ${r.entry}: ${r.changes.join(', ')}`));
      if (t.undeclared.length) told[t.user].push(`note: uses ${t.undeclared.join(', ')} without declaring it`);
    }
    const A = analyse(after);
    const order = A.tree.modules.map((m) => m.id);
    // A fresh program for the check: the reader's complaints are read before anything is written out (a program that
    // has already written out declarations reports `@type {const}` as a missing name).
    const fresh = { program: makeProgram(A.tree.allFiles), uses: A.uses };
    const refuses = order.slice(order.indexOf(change.provider)).filter((m) => check(A.tree, m, { analysis: fresh }).refused);
    return {
      firstCommentsStep: n.firstCommentsStep,
      entries: n.entries.map((e) => `${e.module} ${e.entry}: ${e.changes.join(', ')}`),
      told,
      refuses,
      notice: n,
    };
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
}
