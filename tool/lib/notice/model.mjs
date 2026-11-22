// The product as the notice reads it, from the Process4 forms (build text 2, sections 3 and 7): process.json names
// the process folder and the language reader's code files; <process folder>/modules/order.txt gives the order; each
// module's entry <name>.json gives its files, tests, interface files (`public`) and declared uses. A file belongs to
// the module with the longest matching path. Replaces the proof's loader of its own modules.json.
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, loadModules } from '../config.mjs';
import { fail, underPath } from '../util.mjs';

/** A glob of the config's `language_reader.source` (or `exclude`) as a test of a path relative to the product's top. */
export function globTest(patterns) {
  const res = [].concat(patterns).map((g) => {
    let re = '';
    for (let i = 0; i < g.length; i++) {
      const c = g[i];
      if (c === '*' && g[i + 1] === '*') { i++; if (g[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*'; }
      else if (c === '*') re += '[^/]*';
      else if (c === '?') re += '[^/]';
      else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp(`^${re}$`);
  });
  return (rel) => res.some((r) => r.test(rel));
}

/** Every file under the folder, as paths relative to it with '/', sorted. */
function walk(root, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(root, r));
    else if (e.isFile()) out.push(r);
  }
  return out;
}

/** The module that owns a path, and whether it is one of its tests: the longest matching path of any entry. */
function owner(entries, rel) {
  let best = null;
  let len = -1;
  for (const e of entries) {
    for (const [paths, isTest] of [[e.files, false], [e.tests, true]]) {
      for (const p of paths) if (underPath(rel, p) && p.length > len) { best = { name: e.name, isTest }; len = p.length; }
    }
  }
  return best;
}

/**
 * Loads a product folder (a working tree, or a commit written out).
 * @param {string} root the folder that holds process.json
 */
export function loadTree(root) {
  root = path.resolve(root);
  const cfg = loadConfig(root) || fail(`${root} has no process.json`);
  const entries = loadModules(root, cfg);
  if (!entries.length) fail(`${root} has no module order file under ${cfg.process_folder}`);
  const isCode = globTest(cfg.language_reader?.source ?? ['**/*.mjs']);
  // Files the config leaves out of the reader (vendored copies, committed built bundles): no module's, never read as
  // the product's code. Without the field, nothing is left out.
  const isLeftOut = globTest(cfg.language_reader?.exclude ?? []);
  const modules = entries.map((e, index) => ({
    id: e.name, index, uses: e.uses ?? [], entry: e, public: [], src: [], tests: [], files: [],
  }));
  const byId = new Map(modules.map((m) => [m.id, m]));
  for (const rel of walk(root).sort((a, b) => (path.join(root, a) < path.join(root, b) ? -1 : 1))) {
    if (!isCode(rel) || isLeftOut(rel)) continue;
    const o = owner(entries, rel);
    if (!o) continue;
    const m = byId.get(o.name);
    const abs = path.join(root, rel);
    (o.isTest ? m.tests : m.src).push(abs);
    m.files.push(abs);
  }
  for (const m of modules) {
    for (const p of m.entry.public ?? []) {
      for (const f of m.src) if (underPath(path.relative(root, f).split(path.sep).join('/'), p) && !m.public.includes(f)) m.public.push(f);
    }
  }
  const owners = new Map();
  const moduleOfFile = (file) => {
    if (owners.has(file)) return owners.get(file);
    const rel = path.relative(root, file);
    const r = rel.split(path.sep).join('/');
    const m = rel.startsWith('..') || path.isAbsolute(rel) || isLeftOut(r) ? null : owner(entries, r)?.name ?? null;
    owners.set(file, m);
    return m;
  };
  return { root, cfg, modules, byId, moduleOfFile, allFiles: modules.flatMap((m) => m.files) };
}
