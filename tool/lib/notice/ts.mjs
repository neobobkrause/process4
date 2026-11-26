// The one place the tool asks TypeScript's reader to read plain JavaScript with its structured comments.
// Ported from the notice's proof (proof: tool/lib/ts.mjs). The reader is loaded only when a command reads code
// (build text 1, section 2): `ts` is empty until loadReader() is called.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { fileSpecifier } from '../util.mjs';

const require = createRequire(import.meta.url);
/** TypeScript, once loadReader() has run. */
export let ts = null;

export function loadReader() {
  if (!ts) ts = require('typescript');
  return ts;
}

/** Settings for every reading. Both sides of a comparison are read with these, by the same version. */
export const options = () => (loadReader(), {
  allowJs: true,
  checkJs: true,
  noEmit: true,
  resolveJsonModule: true, // iteration 5: the reader reads JSON modules
  strict: true,
  // On, so that the reader reads the comment kinds Object and object as written (with it off, it reads them as
  // "anything": found by the proof's change P09). Its complaints about unstated kinds are "I cannot tell", never
  // a disagreement: the check does not refuse them.
  noImplicitAny: true,
  useUnknownInCatchVariables: false,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  // The language's own library only; what the product uses of Node is described in node.d.ts (iteration 2: the
  // browser's description gave Node's timers the wrong kind).
  // The language library of the Node version the product runs on: 2023 (iteration 3), and the later parts Node 22 has
  // (iteration 4).
  lib: ['lib.es2023.d.ts', 'lib.esnext.object.d.ts', 'lib.esnext.collection.d.ts', 'lib.esnext.promise.d.ts', 'lib.esnext.array.d.ts', 'lib.esnext.string.d.ts'],
  types: [],
  skipLibCheck: true,
});

/** Reads the given files (and whatever they import) as one program. */
export const NODE_DESCRIPTION = fileURLToPath(new URL('./node.d.ts', import.meta.url));

export function makeProgram(files, host = undefined) {
  const o = options();
  return ts.createProgram([...files, NODE_DESCRIPTION], o, resolvingQueries(host ?? ts.createCompilerHost(o), o));
}

/**
 * A reader's host that resolves a relative import with a query or fragment (`./index.mjs?again`) as Node does: the
 * same file, found without them (util.mjs, fileSpecifier; build text 2c, S1: Node's documented algorithm). The pinned
 * reader keeps them in the path and finds no file. Every other import is resolved by the reader as before.
 */
function resolvingQueries(host, o, cache = null) {
  if (host.resolveModuleNameLiterals) return host;
  cache ??= ts.createModuleResolutionCache(host.getCurrentDirectory(), (f) => host.getCanonicalFileName(f), o);
  host.resolveModuleNameLiterals = (literals, containingFile, redirected, opts, containingSourceFile) => literals.map((lit) => {
    const mode = ts.getModeForUsageLocation(containingSourceFile, lit, opts);
    return ts.resolveModuleName(fileSpecifier(lit.text), containingFile, opts, host, cache, redirected, mode);
  });
  // The program's own package scopes come from the same cache, so that a package.json is read once per program, not
  // once per file (without it the reader reads it again for each file it finds).
  host.getModuleResolutionCache = () => cache;
  return host;
}

/**
 * The reading under the coding standard (build text 2, section 10; design part 2, section 7): every reading's settings,
 * with the checker's further strictness the standard names, and the rest of the tool's description of the host
 * (host.d.ts: Node's modules a product names, and every untyped channel, such as JSON.parse, given the kind unknown).
 * The uses file and the means are written from this reading only, both sides of a comparison by the same version (rule
 * 6 for the tool); the check's two refusals keep options() as they are, so that no new refusal comes from these settings.
 */
export const HOST_DESCRIPTION = fileURLToPath(new URL('./host.d.ts', import.meta.url));
export const standardOptions = () => ({
  ...options(),
  useUnknownInCatchVariables: true,
  noUncheckedIndexedAccess: true,
  exactOptionalPropertyTypes: true,
});
/**
 * The files the reader has parsed under the standard settings, by name: { text, key, sf }. Every standard program of a
 * run shares them (as TypeScript's own document registry shares a file among the programs of an editor), so that the
 * language's library, the host's description and every product file are parsed and bound once per run, not once per
 * module (civicsmith ARCH #28: a push that rewrote every module's uses file took an hour). A file is reused only where
 * its text and the way it is read are the same as when it was parsed, so a reading is the same as with a fresh parse:
 * the binding of a file depends on the file and the settings alone, and the settings here are always the same.
 */
const parsed = new Map();
const PARSED_MAX = 20000;
/** Forgets every parsed file (the tool's tests use it to read a product with nothing parsed before). */
export const forgetParsed = () => parsed.clear();
function sharingParsed(host) {
  const { getSourceFile } = host;
  host.getSourceFile = (f, lang, onError, fresh) => {
    if (fresh) return getSourceFile.call(host, f, lang, onError, fresh);
    let text;
    try { text = host.readFile(f); } catch { text = undefined; }
    if (text === undefined) return getSourceFile.call(host, f, lang, onError, fresh);
    const key = typeof lang === 'object' ? `${lang.languageVersion}|${lang.impliedNodeFormat}|${lang.jsDocParsingMode}` : `${lang}`;
    const had = parsed.get(f);
    if (had && had.text === text && had.key === key) return had.sf;
    const sf = ts.createSourceFile(f, text, lang);
    if (parsed.size >= PARSED_MAX) parsed.clear();
    parsed.set(f, { text, key, sf });
    return sf;
  };
  return host;
}

/**
 * A run in which the files the reader reads stay as they are (a commit written out, the tool's own files): within it,
 * every standard program shares what it learns of the files, so that a file is read, and an import or a library
 * resolved, once per run, not once per module. What a program finds is what it would find alone, the files being the
 * same. Used where a command reads module after module of a product written out (usescmd.mjs, usesworker.mjs, notices.mjs).
 */
let run = null;
export function whileFilesStay(f) {
  if (run) return f();
  loadReader();
  const o = standardOptions();
  const host = ts.createCompilerHost(o);
  run = {
    texts: new Map(), exists: new Map(), dirs: new Map(),
    resolution: ts.createModuleResolutionCache(host.getCurrentDirectory(), (x) => host.getCanonicalFileName(x), o),
  };
  run.library = ts.createModuleResolutionCache(host.getCurrentDirectory(), (x) => host.getCanonicalFileName(x), o, run.resolution.getPackageJsonInfoCache());
  try { return f(); } finally { run = null; }
}
const remembered = (map, f) => (x) => { if (!map.has(x)) map.set(x, f(x)); return map.get(x); };
function stayingFiles(host) {
  const { readFile, fileExists, directoryExists } = host;
  host.readFile = remembered(run.texts, (x) => readFile.call(host, x));
  host.fileExists = remembered(run.exists, (x) => fileExists.call(host, x));
  if (directoryExists) host.directoryExists = remembered(run.dirs, (x) => directoryExists.call(host, x));
  const library = run.library;
  host.resolveLibrary = (name, from, opts) => ts.resolveLibrary(name, from, opts, host, library);
  return host;
}

export function makeStandardProgram(files, oldProgram = undefined, virtual = null) {
  loadReader();
  const o = standardOptions();
  // A program with files written only in memory shares nothing of a run's: its imports may find those files.
  const shared = run && !virtual?.size ? run : null;
  const base = ts.createCompilerHost(o);
  const host = resolvingQueries(sharingParsed(shared ? stayingFiles(base) : base), o, shared?.resolution);
  if (virtual?.size) {
    // Files the tool writes only in memory (the questions makeSame puts to the checker), served beside the real ones.
    const { getSourceFile, fileExists, readFile } = host;
    host.getSourceFile = (f, lang, ...rest) => (virtual.has(f) ? ts.createSourceFile(f, virtual.get(f), lang, true) : getSourceFile.call(host, f, lang, ...rest));
    host.fileExists = (f) => virtual.has(f) || fileExists.call(host, f);
    host.readFile = (f) => (virtual.has(f) ? virtual.get(f) : readFile.call(host, f));
  }
  return ts.createProgram([...files, ...(virtual?.keys() ?? []), NODE_DESCRIPTION, HOST_DESCRIPTION], o, host, oldProgram);
}

export const readerVersion = () => loadReader().version;

/**
 * The text of a comment's tag, whitespace made single. A bound line is read from the comment as written, up to the
 * next tag, so an @ inside its words does not cut it (iteration 4).
 */
export function tagText(tag) {
  if (tag.tagName?.text === 'bound') {
    const sf = tag.getSourceFile?.();
    if (sf) {
      const start = tag.tagName.end;
      const docEnd = (() => { let p = tag.parent; while (p && !ts.isJSDoc(p)) p = p.parent; return p ? p.end : sf.text.length; })();
      const out = [];
      sf.text.slice(start, docEnd).split('\n').forEach((l, i) => {
        if (out.done) return;
        let line = i === 0 ? l : l.replace(/^\s*\*(?!\/)\s?/, '');
        if (i > 0 && /^\s*@[a-zA-Z]/.test(line)) { out.done = true; return; } // the next tag
        const close = line.indexOf('*/');
        if (close >= 0) { line = line.slice(0, close); out.done = true; }
        out.push(line);
      });
      return out.join(' ').replace(/\s+/g, ' ').trim();
    }
  }
  const t = ts.getTextOfJSDocComment(tag.comment) ?? '';
  return t.replace(/\s+/g, ' ').trim();
}

/** The JSDoc blocks that belong to a declaration. */
export function docsOf(decl) {
  if (!decl) return [];
  if (ts.isJSDocTypedefTag(decl) || ts.isJSDocCallbackTag(decl)) return decl.parent && ts.isJSDoc(decl.parent) ? [decl.parent] : [];
  let host = decl;
  if (ts.isVariableDeclaration(decl)) host = decl.parent?.parent ?? decl;
  // The reader attaches every comment block that stands before a declaration; only the nearest one is its own.
  const all = host.jsDoc ?? [];
  return all.length ? [all[all.length - 1]] : [];
}

/** The tags with a given name in the JSDoc of a declaration. */
export function tagsOf(decl, name) {
  const out = [];
  for (const d of docsOf(decl)) for (const tag of d.tags ?? []) if (tag.tagName.text === name) out.push(tag);
  return out;
}

/**
 * Visits root and every node under it, a node before its children and the children in order, as ts.forEachChild
 * gives them, with jsDoc also a node's comment blocks before its children; leave(n), if given, after n's children.
 * f(n) returning false skips n's children. Kept by hand on a list, never by recursion: a long chain such as
 * a + b + c + ... nests one node per term, and a recursive walk of a few thousand terms runs out of stack.
 */
export function forEachNode(root, f, { jsDoc = false, leave = null } = {}) {
  const LEAVE = Symbol('leave');
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    if (n?.[LEAVE]) { leave(n[LEAVE]); continue; }
    if (f(n) === false) continue;
    const kids = [];
    if (jsDoc) for (const d of n.jsDoc ?? []) kids.push(d);
    ts.forEachChild(n, (c) => { kids.push(c); });
    if (leave) stack.push({ [LEAVE]: n });
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
}

export function lineOf(node) {
  const sf = node.getSourceFile();
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
