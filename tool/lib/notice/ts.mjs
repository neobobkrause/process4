// The one place the tool asks TypeScript's reader to read plain JavaScript with its structured comments.
// Ported from the notice's proof (proof: tool/lib/ts.mjs). The reader is loaded only when a command reads code
// (build text 1, section 2): `ts` is empty until loadReader() is called.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

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
  return ts.createProgram([...files, NODE_DESCRIPTION], o, host);
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
export function makeStandardProgram(files, oldProgram = undefined) {
  loadReader();
  return ts.createProgram([...files, NODE_DESCRIPTION, HOST_DESCRIPTION], standardOptions(), undefined, oldProgram);
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
