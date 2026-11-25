// A module's uses file (design part 2, section 7, "Who uses what"; build text 2, section 3): written by the tool, never
// by hand, from the module's code and tests kept to the coding standard, at every push that changes the module
// (commands.mjs, push). Its form:
//   { "module", "written": { "commit", "tool" }, "providers": [earlier modules used, in order],
//     "uses": [ { provider, item, itemKind, type, route: "direct" | { via, item }, standard,
//                 where: [ { file, side: "code", line, in } | { file, side: "test", line, test } ] } ],
//     "outside": [ { rule, file, side, line, what, mayRefer: [modules] | ["*"], waitsOn, tests: [names] } ],
//     "orderFaults": [ { provider, item, itemKind, type, file, side, line, in | test } ],
//     "copies": [ { provider, item, file, side, line, test?, marked?, value?, differs? } | hand-written { file, pointer, of } ],
//     "facilities": [qualified names of the host facilities used] }
// "*" in mayRefer stands for every module earlier than this one at the time it is read (the order can change).
// The only hand-written part is a copy in a data file, an entry { file, pointer, of: "<module>:<item>" }, which the
// tool keeps when it rewrites the file. Read and written here; worked out by notice/refs.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { readAt } from './config.mjs';
import { loadReader, ts, options, forEachNode } from './notice/ts.mjs';
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
  const KEYS = ['module', 'written', 'providers', 'uses', 'outside', 'orderFaults', 'copies', 'facilities'];
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

/** The hand-written part of a uses file: its copies in data files ({ file, pointer, of }), kept when it is rewritten. */
export const handCopies = (data) => (data?.copies ?? []).filter((c) => c && typeof c.of === 'string');

// ---- imports, for a module with no uses file yet ----

/** The product files a file imports: import and export from, import() and require() of a written name, @import and
 * import('...') in comments. A name the tool cannot read is passed to `cannot`. */
export function importsOf(sf, cannot = () => {}) {
  const out = [];
  const spec = (node, s) => { if (s && (ts.isStringLiteral(s) || ts.isNoSubstitutionTemplateLiteral(s))) out.push({ node, spec: s.text }); };
  const visit = (n) => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier) spec(n, n.moduleSpecifier);
    else if (ts.isJSDocImportTag?.(n)) spec(n, n.moduleSpecifier);
    else if (ts.isImportTypeNode(n) && ts.isLiteralTypeNode(n.argument)) spec(n, n.argument.literal);
    // import(...), and require(...) under that name (a require made by createRequire too)
    else if (ts.isCallExpression(n) && (n.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(n.expression) && n.expression.text === 'require'))) {
      const a0 = n.arguments[0];
      if (a0 && (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0))) spec(n, a0); else cannot(n);
    }
  };
  forEachNode(sf, visit, { jsDoc: true });
  return out;
}

/** The product's own package.json, or {}. */
export function ownPackage(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) || {}; } catch { return {}; }
}

/**
 * Resolves a specifier written in a product file to a product file: a written path; the product's own package name or
 * an imports-map name (`#...`), as the language reader resolves them. Null where it is from outside the product or
 * cannot be followed; `own` tells which.
 */
export function makeResolver(tree) {
  const pkg = ownPackage(tree.root);
  const own = typeof pkg.name === 'string' && pkg.name ? pkg.name : null;
  const isOwn = (spec) => spec.startsWith('#') || (!!own && (spec === own || spec.startsWith(`${own}/`)));
  const seen = new Map();
  const find = (spec, from) => {
    try {
      const r = ts.resolveModuleName(spec, from, options(), ts.sys).resolvedModule?.resolvedFileName;
      if (r && !path.relative(tree.root, r).startsWith('..')) return path.resolve(r);
    } catch { /* not resolved */ }
    if (own && pkg.exports === undefined && spec.startsWith(`${own}/`)) return path.resolve(tree.root, spec.slice(own.length + 1));
    return null;
  };
  return {
    isOwn,
    resolve(spec, from) {
      if (spec.startsWith('.') || spec.startsWith('/')) return path.resolve(path.dirname(from), spec);
      if (!isOwn(spec)) return null;
      const key = `${path.dirname(from)}|${spec}`;
      if (!seen.has(key)) seen.set(key, find(spec, from));
      return seen.get(key);
    },
  };
}

/**
 * The other modules a module's files (code and tests) import, each with its places; and the imports the tool cannot
 * read or follow (`cannot`, with a why). Reads each file's text only (no checker).
 */
export function importedModules(tree, mod, { only = null } = {}) {
  loadReader();
  const resolver = makeResolver(tree);
  const imported = new Map();
  const cannot = [];
  const rel = (f) => path.relative(tree.root, f).split(path.sep).join('/');
  for (const f of mod.files) {
    const sf = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    const at = (node) => `${rel(f)}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`;
    for (const { node, spec } of importsOf(sf, (node) => cannot.push({ at: at(node), why: 'an import of a name the tool cannot read', text: node.getText(sf).slice(0, 60) }))) {
      const target = resolver.resolve(spec, f);
      if (!target) {
        if (resolver.isOwn(spec)) cannot.push({ at: at(node), why: "an import by the product's own package name that the tool cannot follow to a file", text: node.getText(sf).slice(0, 60) });
        continue;
      }
      const other = tree.moduleOfFile(target);
      if (!other || other === mod.id) continue;
      if (only && !only.has(rel(f))) continue;
      if (!imported.has(other)) imported.set(other, []);
      imported.get(other).push({ at: at(node), file: rel(f) });
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

/**
 * The product's facility list (build text 2, section 10; R14): `language_reader.facilities` in the process config names
 * the file, by default `<process folder>/facilities.json`:
 *   { "versions": { "node", "typescript", ... }, "entries": { "<qualified name>": "in-process" | "boundary" },
 *     "owners": { "env:<NAME>": "<module>", ... } }
 * Null where the product has none yet: then no use is on it.
 */
export function readFacilities(tree) {
  const rel = tree.cfg.language_reader?.facilities ?? `${(tree.cfg.process_folder || 'process/').replace(/\/?$/, '/')}facilities.json`;
  try {
    const d = JSON.parse(fs.readFileSync(path.join(tree.root, rel), 'utf8'));
    return { file: rel, entries: d.entries ?? {}, owners: d.owners ?? {}, versions: d.versions ?? {} };
  } catch { return null; }
}
