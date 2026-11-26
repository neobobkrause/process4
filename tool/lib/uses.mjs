// The modules a module uses, for merge (design part 2, section 8; build text 1b, command 6): the providers its uses
// file names (usesfile.mjs), and for a module with no uses file yet the modules its code and tests import; closed over
// those modules' own uses in turn. Read at the tranche branch's newest commit and at the job's head, the union. No
// checker runs: a uses file is read as it stands, and imports are read from each file's text.
import path from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { loadTree } from './notice/model.mjs';
import { declaredUses } from './usesfile.mjs';
import { writeOut } from './notify.mjs';

/**
 * The modules a module uses, directly or through others, in module order, each with its ground. Given several trees
 * (the tranche's newest commit and the job's head), a module's direct uses are the union of what each tree shows; the
 * order is the first tree's, then any module only a later tree has.
 */
export function usesOf(trees, moduleId) {
  trees = [].concat(trees);
  const direct = new Map();
  const directOf = (id) => {
    if (direct.has(id)) return direct.get(id);
    const out = new Map();
    for (const tree of trees) {
      const mod = tree.byId.get(id);
      if (!mod) continue;
      const d = declaredUses(tree, mod);
      for (const p of d.providers) if (p !== id && tree.byId.has(p) && !out.has(p)) out.set(p, d.from === 'uses file' ? 'its uses file' : 'imports');
    }
    direct.set(id, out);
    return out;
  };
  const found = new Map();
  const todo = [...directOf(moduleId)];
  while (todo.length) {
    const [m, how] = todo.shift();
    if (m === moduleId || found.has(m)) continue;
    found.set(m, how);
    for (const [u, h] of directOf(m)) if (!found.has(u)) todo.push([u, `through ${m} (${h})`]);
  }
  const order = orderOf(trees);
  return [...found].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])).map(([module, how]) => ({ module, how }));
}

const orderOf = (trees) => [...new Set(trees.flatMap((t) => t.modules.map((x) => x.id)))];

/**
 * The modules earlier in the order that a module uses, read at one or more commits (the tranche branch's newest first,
 * whose order counts), each written out to a folder outside the checkout; the union of their uses, closed.
 */
export function earlierUsesAt(root, shas, moduleId) {
  const base = mkdtempSync(path.join(tmpdir(), 'p4-uses-'));
  try {
    const trees = [...new Set([].concat(shas))].map((sha) => loadTree(writeOut(root, sha, base)));
    const order = orderOf(trees);
    if (!order.includes(moduleId)) return [];
    return usesOf(trees, moduleId).filter((u) => order.indexOf(u.module) < order.indexOf(moduleId));
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}
