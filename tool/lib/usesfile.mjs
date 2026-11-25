// A module's uses file (design part 2, section 7, "Who uses what"; build text 2c, "The uses file"):
// process/modules/<module>.uses.json, written by the tool, never by hand, from the module's code and tests (push, test,
// uses; usescmd.mjs). Its form:
//   { "module", "written": { "commit", "tool": <the tool's commit> }, "providers": [earlier modules used, in order],
//     "uses": [ { provider, item, itemKind, type, route: "direct" | { via, item }, standard,
//                 value: "member" | "whole" | "handed back" | "none", member,
//                 where: [ { file, side: "code", line, in } | { file, side: "test", line, test } ] } ],
//     "outside": [ { rule, file, side, line, mayRefer: [modules] | ["*"], waitsOn, tests: [names] } ],
//     "orderFaults": [ { provider, item, itemKind, type, file, side, line, in | test } ],
//     "copies": [ { provider, item, file, pointer } ] }
// `value`, on a use of a kind, a handle kind or a class only, says what its places do with the value: read or write the
// one `member` named; use it whole ("whole": hand it to a function, store, spread, compare, iterate, copy, write it as
// text, or anything not proved to be one of the others; "handed back": returned from an export of the module's
// interface code); or none of it ("none": name the kind, or hold the value under a name whose uses are listed apart).
// A use without `value` (a file written before it) reads as "whole".
// "*" in mayRefer stands for every module earlier than this one at the time it is read (the order can change). A place
// in a test that no test case reaches gives `in` in place of `test`. The only hand-written part is a copy in a JSON file,
// a `copies` entry, which the tool keeps when it rewrites the file. Also here: declared uses, imports read from the text
// for a module with no uses file yet, and the facility list.
import fs from 'node:fs';
import path from 'node:path';
import { readAt } from './config.mjs';
import { underPath } from './util.mjs';

const modulesDir = (cfg) => `${(cfg.process_folder || 'process/').replace(/\/?$/, '/')}modules/`;

/** Where a module's uses file is, relative to the product's top. */
export const usesPath = (cfg, module) => `${modulesDir(cfg)}${module}.uses.json`;

/** Is this path (relative to the product's top) a uses file? */
export const isUsesPath = (cfg, rel) => rel.startsWith(modulesDir(cfg)) && rel.endsWith('.uses.json');

/** A module's uses file, read from the folder (or, with ref, from that commit), or null where it has none yet. */
export function readUses(root, module, { cfg, ref } = {}) {
  const text = readAt(root, usesPath(cfg ?? configOf(root, ref), module), ref);
  if (text === null) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function configOf(root, ref) {
  const text = readAt(root, 'process.json', ref);
  try { return { process_folder: 'process/', ...JSON.parse(text ?? '{}') }; } catch { return { process_folder: 'process/' }; }
}

/** The file's text: its keys in a fixed order, each listed item on a line of its own, so that a change reads as lines. */
export function usesText(data) {
  const KEYS = ['module', 'written', 'providers', 'uses', 'outside', 'orderFaults', 'copies'];
  const keys = [...KEYS.filter((k) => k in data), ...Object.keys(data).filter((k) => !KEYS.includes(k))];
  const lines = keys.map((k) => {
    const v = data[k];
    if (Array.isArray(v) && v.length && v.some((x) => x && typeof x === 'object')) return `  ${JSON.stringify(k)}: [\n${v.map((x) => `    ${JSON.stringify(x)}`).join(',\n')}\n  ]`;
    return `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`;
  });
  return `{\n${lines.join(',\n')}\n}\n`;
}

/** Writes a module's uses file into the folder; returns its path relative to the folder. */
export function writeUses(root, module, data, { cfg } = {}) {
  const rel = usesPath(cfg ?? configOf(root), module);
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), usesText(data));
  return rel;
}

/** Do two uses files say the same, apart from when and by what they were written? */
export const sameUses = (a, b) => !!a && !!b && usesText({ ...a, written: null }) === usesText({ ...b, written: null });

/** The hand-written part of a uses file: its copies in JSON files ({ provider, item, file, pointer }), kept when it is rewritten. */
export const handCopies = (data) => (data?.copies ?? []).filter((c) => c && ['provider', 'item', 'file', 'pointer'].every((k) => typeof c[k] === 'string'));

// ---- imports, for a module with no uses file yet ----

/** The specifiers a file's text writes out: import and export from (and @import), import(), require(), import '…';
 * and the calls of import() or require() with a name not written out (`cannot`). Read from the text, no reader. */
const WRITTEN = [/\bfrom\s*(['"])([^'"\n]+)\1/g, /(?<![.\w$])import\s*\(\s*(['"`])([^'"`\n$]+)\1\s*\)/g, /(?<![.\w$])import\s*(['"])([^'"\n]+)\1/g, /(?<![.\w$])require\s*\(\s*(['"`])([^'"`\n$]+)\1\s*\)/g];
const COMPUTED = /(?<![.\w$])(?:import|require)\s*\(\s*(?!['"`\s])[^)]/g;
export function importsOf(text) {
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  const out = [];
  for (const re of WRITTEN) { re.lastIndex = 0; for (let m; (m = re.exec(text));) out.push({ spec: m[2], line: lineAt(m.index), text: m[0] }); }
  const cannot = [];
  COMPUTED.lastIndex = 0;
  for (let m; (m = COMPUTED.exec(text));) cannot.push({ line: lineAt(m.index), text: text.slice(m.index, m.index + 60).split('\n')[0] });
  return { specs: out.sort((a, b) => a.line - b.line), cannot };
}

/** The product's own package.json, or {}. */
export function ownPackage(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) || {}; } catch { return {}; }
}

const CONDITIONS = ['import', 'node', 'require', 'default'];
/** A target of package.json's exports or imports map: a path, or the first of its conditions that gives one. */
function target(t) {
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) { for (const x of t) { const r = target(x); if (r) return r; } return null; }
  if (t && typeof t === 'object') { for (const k of [...CONDITIONS, ...Object.keys(t)]) if (k in t) { const r = target(t[k]); if (r) return r; } }
  return null;
}
/** A key of an exports or imports map looked up, with one `*` as a wildcard (Node's documented algorithm). */
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

/**
 * Resolves a specifier written in a product file to a product file: a written path; the product's own package name
 * (through its `exports`, or without them as a path from the top) or an imports-map name (`#…`), by Node's documented
 * algorithm (S1). Null where it is from outside the product or cannot be followed; `isOwn` tells which. No reader.
 */
export function makeResolver(tree) {
  const pkg = ownPackage(tree.root);
  const own = typeof pkg.name === 'string' && pkg.name ? pkg.name : null;
  const isOwn = (spec) => spec.startsWith('#') || (!!own && (spec === own || spec.startsWith(`${own}/`)));
  const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
  const fileAt = (rel) => {
    const base = path.resolve(tree.root, rel);
    return [base, `${base}.mjs`, `${base}.js`, `${base}.cjs`, `${base}.json`, path.join(base, 'index.mjs'), path.join(base, 'index.js')].find(isFile) ?? null;
  };
  const inside = (f) => (f && !path.relative(tree.root, f).startsWith('..') ? f : null);
  const find = (spec) => {
    if (spec.startsWith('#')) { const t = lookUp(pkg.imports, spec); return t && t.startsWith('.') ? inside(fileAt(t)) : null; }
    const sub = spec === own ? '.' : `./${spec.slice(own.length + 1)}`;
    if (pkg.exports !== undefined) {
      const ex = pkg.exports;
      const map = typeof ex === 'string' || Array.isArray(ex) || !Object.keys(ex || {}).some((k) => k.startsWith('.')) ? { '.': ex } : ex;
      const t = lookUp(map, sub);
      return t ? inside(fileAt(t)) : null;
    }
    return inside(sub === '.' ? fileAt(pkg.main || 'index.js') : fileAt(sub));
  };
  return {
    isOwn,
    resolve(spec, from) {
      if (spec.startsWith('.') || spec.startsWith('/')) return path.resolve(path.dirname(from), spec);
      return isOwn(spec) ? find(spec) : null;
    },
  };
}

/**
 * The other modules a module's files (code and tests) import, each with its places; and the imports the tool cannot
 * read or follow (`cannot`, with a why). Reads each file's text only: no reader is loaded.
 */
export function importedModules(tree, mod, { only = null } = {}) {
  const resolver = makeResolver(tree);
  const imported = new Map();
  const cannot = [];
  const rel = (f) => path.relative(tree.root, f).split(path.sep).join('/');
  for (const f of mod.files) {
    const { specs, cannot: computed } = importsOf(fs.readFileSync(f, 'utf8'));
    for (const c of computed) cannot.push({ at: `${rel(f)}:${c.line}`, why: 'an import of a name the tool cannot read', text: c.text });
    for (const { spec, line, text } of specs) {
      const target = resolver.resolve(spec, f);
      if (!target) {
        if (resolver.isOwn(spec)) cannot.push({ at: `${rel(f)}:${line}`, why: "an import by the product's own package name that the tool cannot follow to a file", text });
        continue;
      }
      const other = tree.moduleOfFile(target);
      if (!other || other === mod.id) continue;
      if (only && !only.has(rel(f))) continue;
      if (!imported.has(other)) imported.set(other, []);
      if (!imported.get(other).some((x) => x.at === `${rel(f)}:${line}`)) imported.get(other).push({ at: `${rel(f)}:${line}`, file: rel(f) });
    }
  }
  return { imported, cannot };
}

/**
 * A module's declared uses (design part 2, section 6): the providers its uses file names, with its order faults and
 * places outside the standard; for a module with no uses file yet, the modules its files import (design part 2,
 * sections 7 and 8). `from` says which.
 */
export function declaredUses(tree, mod) {
  const data = readUses(tree.root, mod.id, { cfg: tree.cfg });
  if (data) {
    return {
      from: 'uses file', file: usesPath(tree.cfg, mod.id), data,
      providers: [...new Set([...(data.providers ?? []), ...(data.orderFaults ?? []).map((o) => o.provider)])].filter((p) => p !== mod.id),
    };
  }
  const { imported, cannot } = importedModules(tree, mod);
  return { from: 'imports', file: usesPath(tree.cfg, mod.id), data: null, providers: [...imported.keys()], imported, cannot };
}

/** Each module's users, by their declared uses: the modules whose uses file (or, without one, imports) names it. */
export function usersMap(tree) {
  const out = new Map(tree.modules.map((m) => [m.id, []]));
  for (const m of tree.modules) for (const p of declaredUses(tree, m).providers) if (out.has(p) && p !== m.id) out.get(p).push(m.id);
  return out;
}

/** Is a path (relative to the product's top) one of a module entry's test paths, by the longest matching path? */
export function sideOf(entry, rel) {
  let best = null, len = -1;
  for (const [paths, side] of [[entry.files ?? [], 'code'], [entry.tests ?? [], 'test']]) {
    for (const p of paths) if (underPath(rel, p) && p.length > len) { best = side; len = p.length; }
  }
  return best;
}

// ---- the facility list (R14) ----

/** Where the product's facility list is (build text 2c, "The facility list"), written by ARCH with the module list. */
export const facilitiesPath = (cfg) => `${modulesDir(cfg)}facilities.json`;

/**
 * The product's facility list (build text 2c, "Facilities"; R14): its pinned versions, its boundary modules, and the
 * facilities of the packages it uses (the host's, Node's and the language's, the tool classifies itself:
 * notice/facilities.json):
 *   { "versions": { "node", "workerd" }, "boundary": [modules], "facilities": [ { "name": "pg:Client.query", "reach": "in" | "out" } ] }
 * Read as { file, versions, boundary: Set of modules, reach: Map of name to "in" or "out" }. Null where the product has
 * none yet: then it has no boundary module and no package's facility is classified.
 */
export function readFacilities(tree) {
  const rel = facilitiesPath(tree.cfg);
  try {
    const d = JSON.parse(fs.readFileSync(path.join(tree.root, rel), 'utf8'));
    return {
      file: rel, versions: d.versions ?? {}, boundary: new Set(Array.isArray(d.boundary) ? d.boundary : []),
      reach: new Map((Array.isArray(d.facilities) ? d.facilities : []).filter((f) => f && typeof f.name === 'string').map((f) => [f.name, f.reach === 'out' ? 'out' : 'in'])),
    };
  } catch { return null; }
}
