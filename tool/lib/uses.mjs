// The modules a module uses, for merge (design part 2, section 8; build text 1b, command 6):
// the modules its files (code and tests) import, followed file to file as the notice's staged reach reads them
// (notice/staged.mjs: relative paths and require), and through the product's own package name; plus the modules it
// declares in the module list; closed over those modules' own uses. A text scan of imports only: no language reader.
import fs from 'node:fs';
import path from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { loadTree } from './notice/model.mjs';
import { makeReach } from './notice/staged.mjs';
import { writeOut } from './notify.mjs';

// Import specifiers written out, as staged.mjs reads them.
const SPECS = [/\bfrom\s*(['"])([^'"\n]+)\1/g, /\bimport\s*\(\s*(['"])([^'"\n]+)\1/g, /\bimport\s*(['"])([^'"\n]+)\1/g, /\brequire\s*\(\s*(['"])([^'"\n]+)\1/g];
const COND = ['import', 'node', 'require', 'default'];

/** A target of package.json's exports or imports map: a path, or the first of its conditions that gives one. */
function target(t) {
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) { for (const x of t) { const r = target(x); if (r) return r; } return null; }
  if (t && typeof t === 'object') { for (const k of [...COND, ...Object.keys(t)]) if (k in t) { const r = target(t[k]); if (r) return r; } }
  return null;
}

/** A key of an exports or imports map looked up, with one `*` as a wildcard. */
function lookUp(map, key) {
  if (!map || typeof map !== 'object') return null;
  if (key in map) return target(map[key]);
  for (const [k, v] of Object.entries(map)) {
    const star = k.indexOf('*');
    if (star < 0) continue;
    const pre = k.slice(0, star), post = k.slice(star + 1);
    if (key.startsWith(pre) && key.endsWith(post) && key.length >= pre.length + post.length) {
      const t = target(v);
      if (t) return t.split('*').join(key.slice(pre.length, key.length - post.length));
    }
  }
  return null;
}

/** Follows a product's files to the files they import: staged.mjs's reach, and the product's own package name too. */
export function makeFollow(tree) {
  const reach = makeReach(tree);
  let pkg = {};
  try { pkg = JSON.parse(fs.readFileSync(path.join(tree.root, 'package.json'), 'utf8')) || {}; } catch { pkg = {}; }
  const own = typeof pkg.name === 'string' ? pkg.name : null;
  const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
  const fileAt = (rel) => {
    const base = path.resolve(tree.root, rel);
    return [base, `${base}.mjs`, `${base}.js`, `${base}.cjs`, `${base}.ts`, `${base}.json`,
      path.join(base, 'index.mjs'), path.join(base, 'index.js'), path.join(base, 'index.ts')].find(isFile) ?? null;
  };
  function resolveOwn(spec) {
    if (spec.startsWith('#')) { const t = lookUp(pkg.imports, spec); return t && !t.startsWith('.') ? null : t ? fileAt(t) : null; }
    const sub = spec === own ? '.' : `./${spec.slice(own.length + 1)}`;
    const ex = pkg.exports;
    if (ex !== undefined) {
      const map = typeof ex === 'string' || Array.isArray(ex) || !Object.keys(ex || {}).some((k) => k.startsWith('.')) ? { '.': ex } : ex;
      const t = lookUp(map, sub);
      return t ? fileAt(t) : null;
    }
    return sub === '.' ? fileAt(pkg.main || 'index.js') : fileAt(sub);
  }
  const ownDeps = new Map();
  function ownOf(file) {
    if (ownDeps.has(file)) return ownDeps.get(file);
    const out = [];
    if (own || pkg.imports) {
      let text = '';
      try { text = fs.readFileSync(file, 'utf8'); } catch { text = ''; }
      for (const re of SPECS) {
        re.lastIndex = 0;
        for (let m; (m = re.exec(text));) {
          const s = m[2];
          if (s.startsWith('#') || (own && (s === own || s.startsWith(`${own}/`)))) { const f = resolveOwn(s); if (f) out.push(f); }
        }
      }
    }
    ownDeps.set(file, out);
    return out;
  }
  /** Every file the roots reach, the roots too. */
  function closure(roots) {
    const seen = new Set();
    const todo = [...roots];
    while (todo.length) {
      const f = todo.pop();
      if (seen.has(f)) continue;
      seen.add(f);
      for (const d of [...reach.scan(f).deps, ...ownOf(f)]) if (!seen.has(d)) todo.push(d);
    }
    return seen;
  }
  return { closure };
}

/**
 * The modules a module uses, directly or through others, in module order: by import (its files and what they reach)
 * and by declaration, closed over the used modules' own uses. Each with its ground. Given several trees (the tranche's
 * newest commit and the job's head), a module's direct uses are the union of what each tree shows; the order is the
 * first tree's, then any module only a later tree has.
 */
export function usesOf(trees, moduleId) {
  trees = [].concat(trees);
  const follows = trees.map((t) => makeFollow(t));
  const direct = new Map();
  const directOf = (id) => {
    if (direct.has(id)) return direct.get(id);
    const out = new Map();
    trees.forEach((tree, i) => {
      const mod = tree.byId.get(id);
      if (!mod) return;
      for (const f of follows[i].closure(mod.files)) { const m = tree.moduleOfFile(f); if (m && m !== id && !out.has(m)) out.set(m, 'imports'); }
      for (const u of mod.uses) if (u !== id && tree.byId.has(u) && !out.has(u)) out.set(u, 'declares');
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
