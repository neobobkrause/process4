#!/usr/bin/env node
// The places outside the standard in each product a proof's changes start from (the product with a change's setups),
// as the tool's uses file writer lists them: those that may refer to another module, which hear of any change.
//
//   node process/research/precision-26nov/places.mjs [<tool folder>] [--proof <proof folder>] [--all]
// --all lists every place, those that refer to no other module too.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const all = args.includes('--all') ? (args.splice(args.indexOf('--all'), 1), true) : false;
const PROOF = path.resolve(opt('--proof') ?? path.join(HERE, 'converted-proof'));
const TOOL = path.resolve(args[0] ?? path.join(HERE, '..', '..', '..', 'tool'));
const { loadTree } = await import(pathToFileURL(path.join(TOOL, 'lib/notice/model.mjs')).href);
const { readReferences } = await import(pathToFileURL(path.join(TOOL, 'lib/notice/refs.mjs')).href);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}
const changeDir = (pre, series) => { const [s, i] = pre.includes('/') ? pre.split('/') : [series, pre]; return path.join(PROOF, 'changes', s, i); };
const seen = new Map();
for (const series of fs.readdirSync(path.join(PROOF, 'changes'))) {
  if (series === 'setups') continue;
  for (const id of fs.readdirSync(path.join(PROOF, 'changes', series))) {
    const c = JSON.parse(fs.readFileSync(path.join(PROOF, 'changes', series, id, 'change.json'), 'utf8'));
    const key = (c.before ?? []).join(',');
    if (!seen.has(key)) seen.set(key, { before: c.before ?? [], series, ids: [] });
    seen.get(key).ids.push(id);
  }
}
if (args.includes('--changes')) {
  // each change's own new places: in its provider, after the change and not before (by rule and what, not line)
  const placesOf = (dir, module) => {
    const tree = loadTree(dir);
    if (!tree.byId.has(module)) return [];
    return readReferences(tree, module).outside.map((o) => `${o.rule} ${o.file}: ${o.what} (may refer to ${JSON.stringify(o.mayRefer)})`);
  };
  for (const series of fs.readdirSync(path.join(PROOF, 'changes')).sort()) {
    if (series === 'setups') continue;
    for (const id of fs.readdirSync(path.join(PROOF, 'changes', series)).sort()) {
      const c = JSON.parse(fs.readFileSync(path.join(PROOF, 'changes', series, id, 'change.json'), 'utf8'));
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-places-'));
      try {
        const b = path.join(dir, 'b'), a = path.join(dir, 'a');
        copyDir(path.join(PROOF, 'product'), b);
        for (const pre of c.before ?? []) { const d = changeDir(pre, series); if (fs.existsSync(path.join(d, 'files'))) copyDir(path.join(d, 'files'), b); }
        copyDir(b, a);
        const own = path.join(PROOF, 'changes', series, id, 'files');
        if (fs.existsSync(own)) copyDir(own, a);
        const was = new Set(placesOf(b, c.provider));
        const added = [...new Set(placesOf(a, c.provider))].filter((p) => !was.has(p));
        if (added.length) console.log(`${id} (${c.provider}):\n${added.map((p) => `  ${p}`).join('\n')}`);
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  }
  process.exit(0);
}
for (const [key, { before, series, ids }] of [...seen].sort()) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-places-'));
  try {
    copyDir(path.join(PROOF, 'product'), dir);
    for (const pre of before) {
      const d = changeDir(pre, series);
      if (fs.existsSync(path.join(d, 'files'))) copyDir(path.join(d, 'files'), dir);
    }
    const tree = loadTree(dir);
    const lines = [];
    for (const m of tree.modules) {
      const r = readReferences(tree, m.id);
      for (const o of r.outside) if (all || !Array.isArray(o.mayRefer) || o.mayRefer.length) lines.push(`  ${m.id}: ${o.rule} ${o.file}:${o.line} may refer to ${JSON.stringify(o.mayRefer)}: ${o.what}`);
      for (const f of r.orderFaults) lines.push(`  ${m.id}: order fault ${JSON.stringify(f)}`);
    }
    console.log(`== ${key || 'the product'} (${ids.length} change(s): ${ids.slice(0, 4).join(', ')}${ids.length > 4 ? ', ...' : ''}): ${lines.length} place(s)`);
    for (const l of lines) console.log(l);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
