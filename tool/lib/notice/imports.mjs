// The import scan: which files a product's files import, read as text, with no language reader. Used only for a module
// that has no uses file yet, before its conversion (design part 2, sections 7 and 8): notify tells it of every change of
// an earlier module it imports, and its merge waits on the earlier modules it imports. A module with a uses file is
// read from that file, never by this scan. Imports are followed file to file: by a written relative path, and by the
// product's own package name or its imports map (package.json's `exports` and `imports`).
import fs from 'node:fs';
import path from 'node:path';

// Import specifiers written out: static imports and exports from, @import in comments, import("...") in code and in
// comment kinds, side-effect imports, require. Read over the whole text, comments too: reading too much only reads more.
const SPECS = [/\bfrom\s*(['"])([^'"\n]+)\1/g, /\bimport\s*\(\s*(['"])([^'"\n]+)\1/g, /\bimport\s*(['"])([^'"\n]+)\1/g, /\brequire\s*\(\s*(['"])([^'"\n]+)\1/g];
const COND = ['import', 'node', 'require', 'default'];

/** The product's own package: its root package.json read once ({} where it has none or cannot be read). */
export function ownPackage(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) ?? {}; } catch { return {}; }
}

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

/** Follows a product's files to the files they import. */
export function makeFollow(tree) {
  const pkg = ownPackage(tree.root);
  const own = typeof pkg.name === 'string' && pkg.name ? pkg.name : null;
  const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
  const fileAt = (base) => [base, `${base}.mjs`, `${base}.js`, `${base}.cjs`, `${base}.ts`, `${base}.mts`, `${base}.json`,
    base.replace(/\.js$/, '.ts'), base.replace(/\.mjs$/, '.mts'), base.replace(/\.cjs$/, '.cts'),
    path.join(base, 'index.mjs'), path.join(base, 'index.js'), path.join(base, 'index.ts')].find(isFile) ?? null;
  function resolve(spec, from) {
    if (spec.startsWith('.') || spec.startsWith('/')) return fileAt(path.resolve(path.dirname(from), spec));
    if (spec.startsWith('#')) { const t = lookUp(pkg.imports, spec); return t && t.startsWith('.') ? fileAt(path.resolve(tree.root, t)) : null; }
    if (own && (spec === own || spec.startsWith(`${own}/`))) {
      const sub = spec === own ? '.' : `./${spec.slice(own.length + 1)}`;
      const ex = pkg.exports;
      if (ex !== undefined) {
        const map = typeof ex === 'string' || Array.isArray(ex) || !Object.keys(ex || {}).some((k) => k.startsWith('.')) ? { '.': ex } : ex;
        const t = lookUp(map, sub);
        return t ? fileAt(path.resolve(tree.root, t)) : null;
      }
      return fileAt(path.resolve(tree.root, sub === '.' ? pkg.main || 'index.js' : sub));
    }
    return null; // Node's own, or a package from outside the product
  }
  const deps = new Map();
  function depsOf(file) {
    if (deps.has(file)) return deps.get(file);
    const out = new Set();
    if (!file.endsWith('.json')) {
      let text = '';
      try { text = fs.readFileSync(file, 'utf8'); } catch { text = ''; }
      for (const re of SPECS) {
        re.lastIndex = 0;
        for (let m; (m = re.exec(text));) { const r = resolve(m[2], file); if (r) out.add(r); }
      }
    }
    deps.set(file, [...out]);
    return deps.get(file);
  }
  /** Every file the roots reach, the roots too. */
  function closure(roots) {
    const seen = new Set();
    const todo = [...roots];
    while (todo.length) {
      const f = todo.pop();
      if (seen.has(f)) continue;
      seen.add(f);
      for (const d of depsOf(f)) if (!seen.has(d)) todo.push(d);
    }
    return seen;
  }
  /** The other modules whose files a module's files (code and tests) reach by their imports. */
  function importedModules(moduleId) {
    const mod = tree.byId.get(moduleId);
    const out = new Set();
    if (!mod) return out;
    for (const f of closure(mod.files)) { const m = tree.moduleOfFile(f); if (m && m !== moduleId) out.add(m); }
    return out;
  }
  return { closure, importedModules };
}
