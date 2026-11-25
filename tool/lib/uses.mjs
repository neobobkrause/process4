// The modules a module uses, for merge (design part 2, section 8; build text 1b, command 6): the providers its uses file
// names (the uses it lists, and the modules a place outside the standard may refer to), read at the tranche branch's
// newest commit and at the job's head, and theirs in turn, each read from its own uses file at the same commits. A
// module with no uses file yet, before its conversion, uses the earlier modules it imports (the import scan,
// notice/imports.mjs). No language reader.
import path from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { loadTree } from './notice/model.mjs';
import { makeFollow } from './notice/imports.mjs';
import { hasUsesFile, providersOf, readUsesFile } from './usesfile.mjs';
import { writeOut } from './notify.mjs';

/**
 * The modules a module uses, directly or through others, in module order, each with its ground. Given several trees
 * (the tranche's newest commit and the job's head), a module's direct uses are the union of what each tree shows; the
 * order is the first tree's, then any module only a later tree has.
 */
export function usesOf(trees, moduleId) {
  trees = [].concat(trees);
  const follows = trees.map(() => null);
  const order = orderOf(trees);
  const direct = new Map();
  const directOf = (id) => {
    if (direct.has(id)) return direct.get(id);
    const out = new Map();
    trees.forEach((tree, i) => {
      const mod = tree.byId.get(id);
      if (!mod) return;
      const u = readUsesFile(tree, id);
      if (hasUsesFile(u)) {
        for (const p of providersOf(u)) {
          // a place outside the standard that cannot say which modules it may refer to: every earlier module
          const named = p === '*' ? order.slice(0, order.indexOf(id)) : [p];
          for (const m of named) if (m !== id && tree.byId.has(m) && !out.has(m)) out.set(m, p === '*' ? 'its uses file (a place outside the standard)' : 'its uses file');
        }
      } else {
        follows[i] ??= makeFollow(tree);
        for (const m of follows[i].importedModules(id)) if (!out.has(m)) out.set(m, 'imports (no uses file yet)');
      }
    });
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
