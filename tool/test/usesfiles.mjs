// Each module's uses file, written by the tool's own writer (usescmd.mjs's usesData, from the reference reader of
// notice/refs.mjs), for the tool's tests: a product as it stands once every module's job has pushed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadTree } from '../lib/notice/model.mjs';
import { usesData } from '../lib/usescmd.mjs';
import { usesPath, usesText } from '../lib/usesfile.mjs';

/** Writes every module's uses file in a product folder; returns them by module. */
export function writeAllUses(root, commit = 'test') {
  const tree = loadTree(root);
  const out = {};
  for (const m of tree.modules) {
    const data = usesData(tree, m.id, commit);
    fs.mkdirSync(path.dirname(path.join(root, usesPath(tree.cfg, m.id))), { recursive: true });
    fs.writeFileSync(path.join(root, usesPath(tree.cfg, m.id)), usesText(data));
    out[m.id] = data;
  }
  return out;
}

const made = new Map();
/** A product's files (path -> text or JSON, as helpers.mjs writes them) with each module's uses file added. */
export function withUsesFiles(files) {
  const key = JSON.stringify(files);
  if (!made.has(key)) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-uses-'));
    try {
      for (const [p, text] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
        fs.writeFileSync(path.join(dir, p), typeof text === 'string' ? text : `${JSON.stringify(text, null, 2)}\n`);
      }
      const cfg = loadTree(dir).cfg;
      const added = {};
      for (const [m, d] of Object.entries(writeAllUses(dir))) added[usesPath(cfg, m)] = d;
      made.set(key, added);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  return { ...files, ...made.get(key) };
}
