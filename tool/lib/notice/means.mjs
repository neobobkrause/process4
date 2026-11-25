// The means of each item of a module (design part 2, section 7, "What counts as a change"; the study of what changed,
// process/research/uses-metadata-25nov/study-changes.md, sections 2.2, 2.3 and 3.2): what a user's code depends on
// mechanically, worked out by the tool from one side of a change, never from a person's words.
//
// - M1 to M3 and M9 (stated kinds expanded through every kind they name, names kept; named kinds; read-only; a value
//   or a promise) and the marked bound lines come from the listing (listing.mjs), read with the coding standard's
//   checker settings and its description of the host (ts.mjs, makeStandardProgram), the reading the uses file is written from.
// - M4 to M8 are computed from the module's code, over a closure of its pieces (section 3.2 of the study):
//   control edges (a name's declaration, any member of the same name, every member a computed access may reach, the
//   members the language calls without a name (toString, valueOf, toJSON, then, next, return, throw, constructor and
//   computed names), and the pieces written in place inside a piece); then the writers of every location read (a
//   binding, a field by its name, `ext` for every state outside the module's code), the pieces that reach those writers
//   by control edges, and their control closure, to a fixpoint. Module start-up code (each file's top-level statements)
//   is in that closure too.
//   Decided here: what can leave the call or happen during it is read over the control closure alone (M4 the errors
//   that can leave it, M6 whether it needs its object as `this`, M7 which arguments it writes into, and its type
//   errors), since only code that runs during the call can throw out of it or touch its arguments; what it hands back
//   and what it reads (M5 plain data or a class instance, M8 channels, settings, files and streams) over the whole
//   closure, since a value can be built, and a setting read, by code that wrote state the item reads. A provider's
//   own errors are not composed into its users' means: a provider's change tells its users, and theirs tell theirs
//   when their own means change (the study's middle-module case, section 3.3).
//   Exact where the language decides it (build text 5, section 6): an error raised inside a try block whose catch never
//   names it, or by code that block calls to run at once, does not leave the item (throwsOf); a stream written out of
//   the program by code outside the call does not reach it (SINKS); what the item's own code reads of what its caller
//   handed it is its input, and does not take in the writers of those fields (paramReads); a call into a module proven
//   to keep no state neither writes nor reads `ext` (statelessModule).
// - A type error in the item's code under the standard's settings counts as a change: its errors, without positions,
//   are part of its means, and while it has one, a change to its code is a change of its means (`code`, a digest of the
//   code that runs during a call, comments left out).
// Each part over-approximates: a change can be reported where behaviour is the same, never missed (the safe side).
import crypto from 'node:crypto';
import { builtinModules } from 'node:module';
import path from 'node:path';
import { ts, loadReader, makeStandardProgram, forEachNode } from './ts.mjs';
import { makeLister } from './listing.mjs';
import { carrierOf } from './carriers.mjs';

const BUILTIN = new Set(builtinModules);
/** Members the language calls without the caller's text naming them (ToPrimitive, iteration, await, JSON). */
const IMPLICIT = new Set(['toString', 'valueOf', 'toJSON', 'then', 'next', 'return', 'throw', 'constructor', 'toPrimitive', 'iterator', 'asyncIterator', 'hasInstance']);
/** Built-in methods that write into the object they are called on. */
const MUTATORS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin', 'set', 'delete', 'clear', 'add', 'setDate', 'setTime', 'setFullYear', 'setMonth', 'setHours', 'setMinutes', 'setSeconds', 'setMilliseconds']);
const FS_READ = new Set(['readFileSync', 'readFile', 'createReadStream', 'readdirSync', 'readdir', 'existsSync', 'statSync', 'stat', 'lstat', 'lstatSync', 'access', 'accessSync', 'opendir', 'readlink', 'readlinkSync', 'realpath', 'realpathSync']);
const FS_WRITE = new Set(['writeFileSync', 'writeFile', 'appendFile', 'appendFileSync', 'createWriteStream', 'mkdirSync', 'mkdir', 'mkdtemp', 'mkdtempSync', 'rmSync', 'rm', 'rmdir', 'rmdirSync', 'unlinkSync', 'unlink', 'renameSync', 'rename', 'copyFileSync', 'copyFile', 'cp', 'cpSync', 'truncate', 'truncateSync', 'symlink', 'symlinkSync', 'chmod', 'chmodSync']);
const STARTS = new Set(['spawn', 'spawnSync', 'fork', 'exec', 'execSync', 'execFile', 'execFileSync', 'Worker']);
const TIMERS = new Set(['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask']);
const STDERR = new Set(['error', 'warn', 'trace']);
/** Node's modules that keep no state a call can change for a later one. */
const KEEPS_NO_STATE = new Set(['path', 'url', 'crypto', 'buffer', 'string_decoder', 'querystring', 'punycode']);
/** The host's facilities, named without an import, that keep state across calls. */
const HOST_STATE = new Set(['process', 'globalThis', 'global', 'fetch', 'setTimeout', 'setInterval', 'setImmediate', 'clearTimeout', 'clearInterval',
  'clearImmediate', 'queueMicrotask', 'require', 'module', 'exports', 'performance', 'WebSocket', 'Worker', 'BroadcastChannel', 'MessageChannel',
  'Atomics', 'SharedArrayBuffer', 'FinalizationRegistry', 'WeakRef', 'localStorage', 'sessionStorage', 'navigator', 'caches', 'XMLHttpRequest', 'EventSource']);
/** Channels that only carry out of the program: what is written to them is read by no code of the product. */
const SINKS = new Set(['writes standard output', 'writes standard error', 'writes to its parent']);
/** The reader's complaints about what it has no description of (check.mjs): not the item's own type errors. */
const NOT_THE_CODES = new Set([2307, 7016, 2580, 2591, 2867, 2868]);
const NODE_NAMES = /'(crypto|fetch|performance|Buffer|AbortController|AbortSignal|Blob|Response|Request|Headers|FormData|WebSocket|global|globalThis|require|module|exports|__dirname|__filename|setImmediate|clearImmediate)'/;
/** Items that carry no code of their own: their means is their stated kinds and bounds. */
const NO_CODE = new Set(['kind', 'handle kind', 'operation table', 'stored rows']);

const isFunctionPiece = (n) => (ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n)
  || ts.isConstructorDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n)) && !!n.body;
const isClassPiece = (n) => ts.isClassDeclaration(n) || ts.isClassExpression(n);
const isJSDocNode = (n) => n.kind >= ts.SyntaxKind.FirstJSDocNode && n.kind <= ts.SyntaxKind.LastJSDocNode;
const textOfName = (n) => (n && (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n) || ts.isPrivateIdentifier(n)) ? n.text : null);

/** The member name a piece answers to, when it is a member (of an object written in place or of a class). */
function memberNameOf(n) {
  if (ts.isMethodDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n)) return textOfName(n.name) ?? (n.name && ts.isComputedPropertyName(n.name) ? '[computed]' : null);
  const p = n.parent;
  if (p && (ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p)) && p.initializer === n) return textOfName(p.name) ?? (ts.isComputedPropertyName(p.name) ? '[computed]' : null);
  return null;
}

/** The name a piece is known by, for its key. */
function pieceName(n) {
  if (ts.isSourceFile(n.parent ?? n) && !isFunctionPiece(n) && !isClassPiece(n)) return 'top';
  if ((ts.isFunctionDeclaration(n) || isClassPiece(n)) && n.name) return n.name.text;
  if (ts.isConstructorDeclaration(n)) return 'constructor';
  const m = memberNameOf(n);
  if (m) return m;
  const p = n.parent;
  if (p && ts.isVariableDeclaration(p) && ts.isIdentifier(p.name)) return p.name.text;
  return 'anon';
}

/** A node's running code, comments and grouping brackets left out, with each piece written inside it as its key. */
function shapeOf(node, isNested, keyOf) {
  const out = [];
  forEachNode(node, (n) => {
    if (n !== node && isNested(n)) { out.push(`<${keyOf(n)}>`); return false; }
    if (ts.isParenthesizedExpression(n)) return true;
    if (isJSDocNode(n)) return false;
    let leaf = '';
    if (ts.isIdentifier(n) || ts.isPrivateIdentifier(n)) leaf = n.text;
    else if (ts.isStringLiteral(n) || ts.isNumericLiteral(n) || ts.isBigIntLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isRegularExpressionLiteral(n)) leaf = n.text;
    else if (n.kind === ts.SyntaxKind.TemplateHead || n.kind === ts.SyntaxKind.TemplateMiddle || n.kind === ts.SyntaxKind.TemplateTail) leaf = n.text;
    out.push(`(${n.kind}${n.flags & ts.NodeFlags.OptionalChain ? '?' : ''}${leaf ? ':' + JSON.stringify(leaf) : ''}`);
    return true;
  }, {
    leave: (n) => {
      if (ts.isParenthesizedExpression(n)) return;
      if (ts.isBinaryExpression(n)) out.push(`op${n.operatorToken.kind}`);
      if (ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) out.push(`op${n.operator}`);
      if (ts.isVariableDeclarationList(n)) out.push(`decl${n.flags & ts.NodeFlags.BlockScoped}`);
      out.push(')');
    },
  });
  return out.join('');
}

/**
 * The pieces of a module's code and what each does: its control edges, the locations it reads and writes, and the facts
 * the means are made of. One program, one module.
 */
function makeCode(program, checker, tree, mod) {
  const own = new Set(mod.src);
  const rel = (f) => path.relative(tree.root, f).split(path.sep).join('/');
  const pieces = [];
  const byNode = new Map();
  const add = (node, top = false) => {
    if (byNode.has(node)) return byNode.get(node);
    const p = { i: pieces.length, node, file: node.getSourceFile().fileName, top, member: memberNameOf(node), edges: new Set(), kinds: new Map(), contains: new Set(), reads: new Set(), paramReads: new Set(), writes: new Set(), rejects: new Set(),
      thisUse: false, throws: new Set(), instances: new Set(), channels: new Set(), news: [], params: [], errors: [] };
    pieces.push(p);
    byNode.set(node, p);
    return p;
  };
  const sfs = mod.src.map((f) => program.getSourceFile(f)).filter(Boolean);
  for (const sf of sfs) {
    for (const st of sf.statements) add(st, !ts.isFunctionDeclaration(st));
    forEachNode(sf, (n) => { if (n !== sf && (isFunctionPiece(n) || isClassPiece(n)) && !byNode.has(n)) add(n); });
  }
  const isPiece = (n) => byNode.has(n);
  /** The innermost piece holding a node. */
  const pieceOf = (n) => { for (let x = n; x; x = x.parent) if (byNode.has(x)) return byNode.get(x); return null; };
  // M4, exact where the language decides it: an error raised while the code of a try block runs, inside the same piece,
  // is caught where that try has a catch that never names the error it caught (so cannot hand it on). Such a block is
  // "catching". An edge from a piece to another is a call where every reference that makes it is a call (`guarded`
  // where every such call is inside a catching block of that piece), and otherwise a reference (`ref`): what is only
  // referenced may run later, outside the block.
  const catchingTry = new Map();
  const isCatching = (t) => {
    if (catchingTry.has(t)) return catchingTry.get(t);
    let ok = !!t.catchClause;
    const v = t.catchClause?.variableDeclaration;
    if (ok && v) {
      if (!ts.isIdentifier(v.name)) ok = false;
      else {
        const sym = checker.getSymbolAtLocation(v.name);
        forEachNode(t.catchClause.block, (x) => { if (ok && ts.isIdentifier(x) && checker.getSymbolAtLocation(x) === sym) ok = false; return ok; });
      }
    }
    catchingTry.set(t, ok);
    return ok;
  };
  /** Whether code at a node runs inside a catching try block of the piece that holds it. */
  const caughtAt = (node, p) => {
    for (let x = node; x && x !== p.node; x = x.parent) if (x.parent && ts.isTryStatement(x.parent) && x.parent.tryBlock === x && isCatching(x.parent)) return true;
    return false;
  };
  /**
   * Whether an expression reads, member by member, what a piece's own caller handed it: its root is a parameter of the
   * piece (or a name bound from one) with no default value, which could be the module's own state.
   */
  const fromParam = (e, p, depth = 0) => {
    while (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e) || ts.isParenthesizedExpression(e) || ts.isNonNullExpression?.(e)) e = e.expression;
    if (!ts.isIdentifier(e) || !isFunctionPiece(p.node) || depth > 8) return false;
    let d;
    try { d = checker.getSymbolAtLocation(e)?.declarations?.[0]; } catch { d = undefined; }
    let top = d;
    while (top && (ts.isBindingElement(top) || ts.isObjectBindingPattern(top) || ts.isArrayBindingPattern(top))) {
      if (ts.isBindingElement(top) && top.initializer) return false;
      top = top.parent;
    }
    if (!top) return false;
    if (ts.isParameter(top)) return top.parent === p.node && !top.initializer && !top.dotDotDotToken;
    // a const of the piece's own, set from what it was handed (const r = req; const { req } = o)
    return ts.isVariableDeclaration(top) && !!top.initializer && !!(top.parent.flags & ts.NodeFlags.Const) && pieceOf(top) === p && fromParam(top.initializer, p, depth + 1);
  };
  /** Where an object binding pattern reads from: what a piece's caller handed it, as fromParam says. */
  const patternFromParam = (pattern, p) => {
    let top = pattern;
    while (top.parent && (ts.isBindingElement(top.parent) || ts.isObjectBindingPattern(top.parent) || ts.isArrayBindingPattern(top.parent))) {
      if (ts.isBindingElement(top.parent) && top.parent.initializer) return false;
      top = top.parent;
    }
    const holder = top.parent;
    if (holder && ts.isParameter(holder)) return holder.parent === p.node && isFunctionPiece(p.node) && !holder.initializer && !holder.dotDotDotToken;
    return !!holder && ts.isVariableDeclaration(holder) && !!holder.initializer && fromParam(holder.initializer, p);
  };
  const RANK = { guarded: 0, call: 1, ref: 2 };
  /** An edge, with how it is made: the least sure of all the references that make it. */
  const link = (p, q, kind) => { p.edges.add(q); const had = p.kinds.get(q); if (!had || RANK[kind] > RANK[had]) p.kinds.set(q, kind); };
  /** How a name or member at a node is used: the callee of a call or `new` (guarded, inside a catching block), or a reference. */
  const useKind = (e, p) => {
    const par = e.parent;
    const called = par && (ts.isCallExpression(par) || ts.isNewExpression(par)) && par.expression === e;
    return !called ? 'ref' : caughtAt(e, p) ? 'guarded' : 'call';
  };
  /** Whether a piece's errors are raised while its call runs (not a promise's or a generator's later). */
  const runsAtOnce = (q) => !isFunctionPiece(q.node) || !(q.node.asteriskToken || (q.node.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.AsyncKeyword));
  // Keys: file, the names of the enclosing pieces and the piece's own, and its place among pieces of that name.
  const keys = new Map();
  {
    const count = new Map();
    for (const p of pieces) {
      const chain = [];
      for (let x = p.node; x; x = x.parent) if (byNode.has(x)) chain.unshift(pieceName(x));
      const base = `${rel(p.file)}:${chain.join('/')}`;
      const k = count.get(base) ?? 0;
      count.set(base, k + 1);
      keys.set(p, `${base}#${k}`);
    }
  }
  const keyOf = (n) => keys.get(byNode.get(n));
  const members = new Map(); // member name -> pieces
  const implicit = new Set();
  for (const p of pieces) {
    if (!p.member) continue;
    if (!members.has(p.member)) members.set(p.member, new Set());
    members.get(p.member).add(p);
    if (IMPLICIT.has(p.member) || p.member === '[computed]') implicit.add(p);
  }
  const fnMembers = [...pieces].filter((p) => p.member);

  const resolve = (sym) => {
    if (sym && sym.flags & ts.SymbolFlags.Alias) { try { const a = checker.getAliasedSymbol(sym); if (a && a.declarations?.length) return a; } catch { /* unresolved */ } }
    return sym;
  };
  /** Where an imported name comes from, when it is a module of Node's own: [module, name]. */
  const nodeImport = (sym) => {
    const d = sym?.declarations?.[0];
    if (!d) return null;
    let n = d;
    while (n && !ts.isImportDeclaration(n)) n = n.parent;
    if (!n || !ts.isStringLiteral(n.moduleSpecifier)) return null;
    const spec = n.moduleSpecifier.text.replace(/^node:/, '');
    if (!BUILTIN.has(spec.split('/')[0])) return null;
    const name = ts.isImportSpecifier(d) ? (d.propertyName ?? d.name).text : ts.isImportClause(d) || ts.isNamespaceImport(d) ? '*' : null;
    return { spec, name };
  };
  const inOwn = (d) => d && own.has(d.getSourceFile().fileName);
  const stateless = new Map(); // module -> proven to keep no state (statelessModule)
  const fromProduct = (d) => d && !d.getSourceFile().isDeclarationFile && tree.moduleOfFile(d.getSourceFile().fileName);
  /** The pieces a declaration's name leads to when it is named: the function, the class and its constructor. */
  const targetsOf = (d) => {
    const out = [];
    if (byNode.has(d)) out.push(byNode.get(d));
    if ((ts.isVariableDeclaration(d) || ts.isPropertyAssignment(d) || ts.isPropertyDeclaration(d)) && d.initializer) {
      let init = d.initializer;
      while (ts.isParenthesizedExpression(init)) init = init.expression;
      if (byNode.has(init)) out.push(byNode.get(init));
    }
    if (isClassPiece(d)) for (const m of d.members) if (ts.isConstructorDeclaration(m) && byNode.has(m)) out.push(byNode.get(m));
    if (ts.isShorthandPropertyAssignment(d)) { const v = checker.getShorthandAssignmentValueSymbol(d); for (const x of v?.declarations ?? []) out.push(...targetsOf(x)); }
    return out;
  };
  /** A binding a piece reads or writes is a location when it is declared outside that piece (module or closure state). */
  const bindingLoc = (sym, p) => {
    const d = sym?.declarations?.[0];
    if (!d || !inOwn(d)) return null;
    if (!(ts.isVariableDeclaration(d) || ts.isParameter(d) || ts.isBindingElement(d))) return null;
    if (pieceOf(d) === p) return null;
    return `b:${keys.get(pieceOf(d))}:${sym.name}`;
  };
  const isWriteTarget = (e) => {
    let x = e;
    while (x.parent && (ts.isParenthesizedExpression(x.parent) || ts.isNonNullExpression?.(x.parent))) x = x.parent;
    const par = x.parent;
    if (!par) return false;
    if (ts.isBinaryExpression(par) && par.left === x && par.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && par.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return true;
    if ((ts.isPrefixUnaryExpression(par) || ts.isPostfixUnaryExpression(par)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(par.operator)) return true;
    if (ts.isDeleteExpression(par)) return true;
    return false;
  };
  /** The location a receiver's contents are kept in, for a built-in method that writes into it. */
  // A value made fresh by the call (a built-in that builds a new list or text) has no location; a value another module
  // handed back is state outside this module's code; one this module's own code handed back may be any field.
  const FRESH = new Set(['map', 'filter', 'slice', 'concat', 'flat', 'flatMap', 'toSorted', 'toReversed', 'toSpliced', 'with', 'keys', 'values', 'entries', 'from', 'of', 'split', 'fromEntries', 'assign']);
  const contentsLoc = (e, p) => {
    while (ts.isParenthesizedExpression(e) || ts.isNonNullExpression?.(e) || ts.isAwaitExpression(e)) e = e.expression;
    if (ts.isIdentifier(e)) {
      const sym = resolve(checker.getSymbolAtLocation(e));
      const d = sym?.declarations?.[0];
      if (d && fromProduct(d) && !inOwn(d)) return 'ext';
      return bindingLoc(sym, p);
    }
    if (ts.isPropertyAccessExpression(e)) return `f:${e.name.text}`;
    if (ts.isElementAccessExpression(e)) return 'f:*';
    if (ts.isCallExpression(e)) {
      const callee = e.expression;
      if (ts.isPropertyAccessExpression(callee) && ['sort', 'reverse', 'fill', 'copyWithin'].includes(callee.name.text)) return contentsLoc(callee.expression, p);
      let d;
      try { d = checker.getResolvedSignature(e)?.declaration; } catch { d = undefined; }
      if (d && d.getSourceFile().isDeclarationFile) return ts.isPropertyAccessExpression(callee) && !FRESH.has(callee.name.text) ? contentsLoc(callee.expression, p) : null;
      if (d && inOwn(d)) return 'f:*';
      return 'ext';
    }
    if (e.kind === ts.SyntaxKind.ThisKeyword) return 'f:*';
    return null;
  };
  const lit = (e) => (e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) ? e.text : null);
  /** The file a literal path names, relative to the product, where it is one (new URL('./x', import.meta.url)). */
  const pathOf = (e, sf) => {
    if (e && ts.isNewExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === 'URL' && lit(e.arguments?.[0])) return rel(path.resolve(path.dirname(sf.fileName), lit(e.arguments[0])));
    if (e && ts.isPropertyAccessExpression(e) && ['pathname', 'href'].includes(e.name.text)) return pathOf(e.expression, sf);
    const s = lit(e);
    return s ?? '?';
  };

  /** What a thrown value is: its error class, and its code where one is set. */
  function thrownOf(e, p) {
    while (ts.isParenthesizedExpression(e) || ts.isAwaitExpression(e)) e = e.expression;
    const codesOf = (obj) => (obj && ts.isObjectLiteralExpression(obj) ? obj.properties.filter((x) => ts.isPropertyAssignment(x) && textOfName(x.name) === 'code').map((x) => lit(x.initializer) ?? '?') : []);
    if (ts.isNewExpression(e)) return [ts.isIdentifier(e.expression) ? e.expression.text : e.expression.getText()];
    if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.getText() === 'Object.assign' && e.arguments[0]) {
      const [base] = thrownOf(e.arguments[0], p);
      const codes = e.arguments.slice(1).flatMap(codesOf);
      return codes.length ? codes.map((c) => `${base} code ${c}`) : [base];
    }
    if (ts.isIdentifier(e)) {
      const sym = checker.getSymbolAtLocation(e);
      const d = sym?.declarations?.[0];
      if (d && ts.isCatchClause(d.parent)) return ['(an error caught and thrown again)'];
      if (d && ts.isVariableDeclaration(d) && d.initializer) {
        const base = thrownOf(d.initializer, p);
        const codes = [];
        forEachNode(p.node, (n) => {
          if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(n.left) && n.left.name.text === 'code'
            && ts.isIdentifier(n.left.expression) && checker.getSymbolAtLocation(n.left.expression) === sym) codes.push(lit(n.right) ?? '?');
        });
        return codes.length ? base.flatMap((b) => codes.map((c) => `${b} code ${c}`)) : base;
      }
    }
    let t;
    try { t = checker.typeToString(checker.getTypeAtLocation(e)); } catch { t = '?'; }
    return [t];
  }

  // Each piece's own code, nested pieces left out.
  for (const p of pieces) {
    const sf = p.node.getSourceFile();
    const visit = (n) => {
      if (n !== p.node && isPiece(n)) {
        // a piece written in place inside this one: reached from it (a callback handed on, a function handed back, a member
        // of an object built here); a class written here runs its field initializers and static parts when this one runs.
        // A member that is an item of its own (it fills a member of a listed kind, or of an exported class) is reached by
        // its users' calls, not when the object holding it is built (itemPieces, below).
        // a function written here under a name runs only where that name is used (noteName); any other runs as it is used
        const named = isFunctionPiece(n) && (ts.isFunctionDeclaration(n) || (ts.isVariableDeclaration(n.parent) && n.parent.initializer === n && ts.isIdentifier(n.parent.name)));
        if (named) p.edges.add(byNode.get(n)); else link(p, byNode.get(n), 'ref');
        p.contains.add(byNode.get(n));
        // a class written inside this piece is defined when it runs: its fields are written then
        if (isClassPiece(n)) for (const m of n.members) if (ts.isPropertyDeclaration(m) && textOfName(m.name)) p.writes.add(`f:${textOfName(m.name)}`);
        // an object's member written here creates that field
        const mn = memberNameOf(n);
        if (mn) p.writes.add(mn === '[computed]' ? 'f:*' : `f:${mn}`);
        return false;
      }
      if (isJSDocNode(n)) return false;
      if (n.kind === ts.SyntaxKind.ThisKeyword) p.thisUse = true;
      if (ts.isIdentifier(n)) noteName(n, p);
      if (ts.isPropertyAccessExpression(n)) noteMember(n, n.name.text, p);
      if (ts.isElementAccessExpression(n)) {
        const k = lit(n.argumentExpression) ?? (n.argumentExpression && ts.isNumericLiteral(n.argumentExpression) ? n.argumentExpression.text : null);
        if (k !== null) noteMember(n, k, p);
        else { for (const q of fnMembers) link(p, q, 'ref'); p[isWriteTarget(n) ? 'writes' : fromParam(n.expression, p) ? 'paramReads' : 'reads'].add('f:*'); }
      }
      if ((ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) && ts.isObjectLiteralExpression(n.parent)) {
        const k = textOfName(n.name);
        p.writes.add(k === null ? 'f:*' : `f:${k}`);
      }
      if (ts.isSpreadAssignment(n)) p.reads.add('f:*');
      if (ts.isBindingElement(n) && ts.isObjectBindingPattern(n.parent)) {
        const k = textOfName(n.propertyName ?? n.name);
        const into = patternFromParam(n.parent, p) ? p.paramReads : p.reads;
        if (k !== null) { into.add(`f:${k}`); for (const q of members.get(k) ?? []) link(p, q, 'ref'); }
        else into.add('f:*');
      }
      if (ts.isPropertyDeclaration(n) && textOfName(n.name)) p.writes.add(`f:${textOfName(n.name)}`);
      if (ts.isThrowStatement(n) && n.expression && !caughtAt(n, p)) for (const x of thrownOf(n.expression, p)) p.throws.add(x);
      if (ts.isCallExpression(n)) noteCall(n, p, sf);
      if (ts.isNewExpression(n)) noteNew(n, p, sf);
      if (ts.isObjectLiteralExpression(n) && n.properties.some((x) => ts.isGetAccessor(x) || ts.isSetAccessor(x))) p.instances.add('an object with getters or setters');
      return true;
    };
    forEachNode(p.node, visit);
  }

  /**
   * Whether another module of the product is proven to keep no state: nothing a call into it does can change what a
   * later call into it hands back, so a call into it neither writes nor reads `ext`. Proven, from the files of it this
   * program reads, when each holds at its top only imports, exports, functions, classes with no static state, and
   * `const` declarations whose values are made without running code; no binding at its top is ever written, written
   * into, or (where it holds a list or an object) handed on; nothing it writes outlives a call (it writes only into what
   * a function made fresh itself, and into `this` only in a constructor: no closure, no object's later state, nothing
   * it is handed); it names none of the host's facilities that keep state
   * (process, timers, fetch, the global object); it imports only such modules of the product and Node's modules that keep
   * none. Anything else is not proven, and a call into it reads and writes `ext` as before.
   */
  function statelessModule(mid) {
    if (stateless.has(mid)) return stateless.get(mid);
    stateless.set(mid, false); // a cycle is not proven
    const m = tree.byId.get(mid);
    const files = (m?.src ?? []).map((f) => program.getSourceFile(f)).filter(Boolean);
    const ok = files.length > 0 && files.every((sf) => statelessFile(sf, mid));
    stateless.set(mid, ok);
    return ok;
  }
  function statelessFile(sf, mid) {
    const topOf = (d) => {
      if (!d || d.getSourceFile().fileName !== sf.fileName && tree.moduleOfFile(d.getSourceFile().fileName) !== mid) return false;
      if (ts.isFunctionDeclaration(d) || ts.isClassDeclaration(d)) return ts.isSourceFile(d.parent);
      return ts.isVariableDeclaration(d) && ts.isVariableStatement(d.parent?.parent) && ts.isSourceFile(d.parent.parent.parent);
    };
    const made = (e) => { // a value made without running code
      while (ts.isParenthesizedExpression(e) || ts.isAsExpression?.(e) || ts.isSatisfiesExpression?.(e)) e = e.expression;
      if (ts.isStringLiteral(e) || ts.isNumericLiteral(e) || ts.isBigIntLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return true;
      if ([ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return true;
      if (ts.isRegularExpressionLiteral(e)) return !/[gy][a-z]*$/.test(e.text.slice(e.text.lastIndexOf('/') + 1));
      if (ts.isIdentifier(e)) return true;
      if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
      if (ts.isPrefixUnaryExpression(e)) return made(e.operand);
      if (ts.isBinaryExpression(e)) return made(e.left) && made(e.right);
      if (ts.isTemplateExpression(e)) return e.templateSpans.every((x) => made(x.expression));
      if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => !ts.isArrowFunction(x) && !ts.isFunctionExpression(x) && made(ts.isSpreadElement(x) ? x.expression : x));
      if (ts.isObjectLiteralExpression(e)) return e.properties.every((x) => (ts.isPropertyAssignment(x) && !ts.isComputedPropertyName(x.name) && !ts.isArrowFunction(x.initializer) && !ts.isFunctionExpression(x.initializer) && made(x.initializer)) || ts.isShorthandPropertyAssignment(x));
      if (ts.isPropertyAccessExpression(e)) return made(e.expression);
      if (ts.isCallExpression(e) && e.expression.getText(sf) === 'Object.freeze') return e.arguments.every(made);
      return false;
    };
    for (const st of sf.statements) {
      if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) {
        const spec = st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) ? st.moduleSpecifier.text : null;
        if (!spec) continue;
        const to = program.getResolvedModuleFromModuleSpecifier?.(st.moduleSpecifier, sf)?.resolvedModule?.resolvedFileName;
        const other = to && tree.moduleOfFile(path.resolve(to));
        const builtin = spec.replace(/^node:/, '');
        if (other) { if (other !== mid && !statelessModule(other)) return false; }
        else if (!KEEPS_NO_STATE.has(builtin)) return false;
        continue;
      }
      if (ts.isFunctionDeclaration(st)) continue;
      if (ts.isClassDeclaration(st)) {
        if (st.members.some((x) => ts.isClassStaticBlockDeclaration(x) || ((ts.getCombinedModifierFlags(x) & ts.ModifierFlags.Static) && !ts.isMethodDeclaration(x)))) return false;
        let usesThis = false;
        for (const x of st.members) if (ts.getCombinedModifierFlags(x) & ts.ModifierFlags.Static) forEachNode(x, (y) => { if (y.kind === ts.SyntaxKind.ThisKeyword) usesThis = true; return !usesThis; });
        if (usesThis) return false;
        continue;
      }
      if (ts.isVariableStatement(st)) {
        if (!(st.declarationList.flags & ts.NodeFlags.Const)) return false;
        if (st.declarationList.declarations.some((d) => !ts.isIdentifier(d.name) || !d.initializer || !made(d.initializer))) return false;
        continue;
      }
      if (ts.isExpressionStatement(st) && ts.isStringLiteral(st.expression)) continue;
      if (ts.isExportAssignment(st) && made(st.expression)) continue;
      return false;
    }
    // nothing written that outlives a call: a write, a writing built-in or Object.assign only into a local of the same
    // function made fresh there (an object or list written in place, a new built-in), and `this` only in a constructor
    const fnOf = (n) => { for (let x = n.parent; x; x = x.parent) if (ts.isFunctionLike(x) && !ts.isTypeNode(x) && !isJSDocNode(x)) return x; return null; };
    const freshLocal = (e, at) => {
      while (ts.isParenthesizedExpression(e) || ts.isNonNullExpression?.(e)) e = e.expression;
      if (e.kind === ts.SyntaxKind.ThisKeyword) { const f = fnOf(at); return !!f && ts.isConstructorDeclaration(f); }
      if (!ts.isIdentifier(e)) return false;
      let d;
      try { d = checker.getSymbolAtLocation(e)?.declarations?.[0]; } catch { d = undefined; }
      if (!d || fnOf(d) !== fnOf(at) || !fnOf(at)) return false;
      if (ts.isParameter(d)) return false;
      if (!ts.isVariableDeclaration(d) || !d.initializer) return false;
      let i = d.initializer;
      while (ts.isParenthesizedExpression(i) || ts.isAsExpression?.(i) || ts.isSatisfiesExpression?.(i)) i = i.expression;
      return ts.isObjectLiteralExpression(i) || ts.isArrayLiteralExpression(i) || (ts.isNewExpression(i) && ts.isIdentifier(i.expression) && ['Map', 'Set', 'Array', 'Object', 'Date'].includes(i.expression.text));
    };
    const rootOf = (e) => { while (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e) || ts.isParenthesizedExpression(e) || ts.isNonNullExpression?.(e)) e = e.expression; return e; };
    let pure = true;
    forEachNode(sf, (n) => {
      if (!pure) return false;
      if (isJSDocNode(n)) return false;
      if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) && isWriteTarget(n)) { if (!freshLocal(rootOf(n), n)) pure = false; }
      else if (ts.isIdentifier(n) && isWriteTarget(n)) {
        let d;
        try { d = checker.getSymbolAtLocation(n)?.declarations?.[0]; } catch { d = undefined; }
        if (!d || !fnOf(n) || fnOf(d) !== fnOf(n)) pure = false; // a name of an enclosing function's, or of the module's
      } else if (ts.isCallExpression(n)) {
        const c = n.expression;
        if (ts.isPropertyAccessExpression(c) && MUTATORS.has(c.name.text) && !freshLocal(rootOf(c.expression), n)) pure = false;
        if (['Object.assign', 'Object.defineProperty', 'Object.defineProperties', 'Object.setPrototypeOf', 'Reflect.set', 'Reflect.defineProperty'].includes(c.getText(sf)) && n.arguments[0] && !freshLocal(rootOf(n.arguments[0]), n)) pure = false;
      }
      return pure;
    });
    if (!pure) return false;
    // every name of the file: no top-level binding written or written into, no list or object of one handed on, no
    // facility of the host that keeps state
    let ok = true;
    forEachNode(sf, (n) => {
      if (!ok) return false;
      if (isJSDocNode(n) || ts.isTypeNode(n)) return false;
      if (!ts.isIdentifier(n)) return true;
      const par = n.parent;
      if (ts.isPropertyAccessExpression(par) && par.name === n) return true;
      let sym;
      try { sym = checker.getSymbolAtLocation(n); } catch { sym = undefined; }
      const d = sym?.declarations?.[0];
      if (!d) return true;
      if (d.getSourceFile().isDeclarationFile) { if (HOST_STATE.has(n.text) && !nodeImport(sym)) ok = false; return true; }
      if (d === par || (ts.isVariableDeclaration(par) && par.name === n) || ((ts.isFunctionDeclaration(par) || ts.isClassDeclaration(par)) && par.name === n)) return true;
      let target = sym;
      if (sym.flags & ts.SymbolFlags.Alias) { try { target = checker.getAliasedSymbol(sym); } catch { return true; } }
      if (ts.isImportSpecifier(par) || ts.isImportClause(par) || ts.isNamespaceImport(par) || ts.isExportSpecifier(par)) return true;
      const td = target.declarations?.[0];
      if (!topOf(td)) return true;
      // a use of a top-level binding of the module: follow the members read from it to the outermost
      let e = n;
      while (e.parent && ((ts.isPropertyAccessExpression(e.parent) || ts.isElementAccessExpression(e.parent)) && e.parent.expression === e || ts.isParenthesizedExpression(e.parent) || ts.isNonNullExpression?.(e.parent))) e = e.parent;
      if (isWriteTarget(e)) { ok = false; return false; }
      const up = e.parent;
      if (up && ts.isCallExpression(up) && up.expression === e) { if (ts.isPropertyAccessExpression(e) && MUTATORS.has(e.name.text)) ok = false; return true; }
      if (!ts.isVariableDeclaration(td) || inert(up, e)) return true;
      let t;
      try { t = checker.getTypeAtLocation(e); } catch { t = undefined; }
      if (!t || !(t.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.Undefined | ts.TypeFlags.Null))) ok = false;
      return true;
    }, { jsDoc: false });
    return ok;
  }
  /** A place where a value is used without being handed on: compared, counted, copied, read or looped over. */
  function inert(up, e) {
    if (!up) return false;
    if (ts.isBinaryExpression(up)) return ![ts.SyntaxKind.EqualsToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.CommaToken].includes(up.operatorToken.kind);
    if (ts.isPrefixUnaryExpression(up) || ts.isTypeOfExpression(up) || ts.isSpreadElement(up) || ts.isSpreadAssignment(up) || ts.isTemplateSpan(up)) return true;
    if ((ts.isForOfStatement(up) || ts.isForInStatement(up)) && up.expression === e) return true;
    if ((ts.isIfStatement(up) || ts.isWhileStatement(up) || ts.isSwitchStatement(up) || ts.isCaseClause(up)) && up.expression === e) return true;
    if (ts.isConditionalExpression(up) && up.condition === e) return true;
    if (ts.isElementAccessExpression(up) && up.argumentExpression === e) return true;
    return false;
  }

  function noteName(n, p) {
    const par = n.parent;
    if (!par) return;
    if (ts.isPropertyAccessExpression(par) && par.name === n) return;
    if ((ts.isPropertyAssignment(par) || ts.isMethodDeclaration(par) || ts.isPropertyDeclaration(par) || ts.isGetAccessor(par) || ts.isSetAccessor(par)) && par.name === n) return;
    if (ts.isBindingElement(par) && par.propertyName === n) return;
    if ((ts.isFunctionDeclaration(par) || ts.isClassDeclaration(par) || ts.isFunctionExpression(par) || ts.isClassExpression(par)) && par.name === n) return;
    if (ts.isImportSpecifier(par) || ts.isImportClause(par) || ts.isNamespaceImport(par) || ts.isExportSpecifier(par)) return;
    if (ts.isLabeledStatement(par) || ts.isBreakOrContinueStatement(par)) return;
    const raw = ts.isShorthandPropertyAssignment(par) && par.name === n ? checker.getShorthandAssignmentValueSymbol(par) : checker.getSymbolAtLocation(n);
    if (!raw) return;
    // a name of Node's own modules: its channels are read from what is called (noteCall)
    if (nodeImport(raw)) return;
    const sym = resolve(raw);
    const decls = sym?.declarations ?? [];
    // the name a declaration gives, with its value: a write of the binding
    if ((ts.isVariableDeclaration(par) || ts.isBindingElement(par)) && par.name === n) {
      if (par.initializer || ts.isBindingElement(par)) { const loc = bindingLoc(sym, null); if (loc) p.writes.add(loc); }
      return;
    }
    if (ts.isParameter(par) && par.name === n) return;
    for (const d of decls) {
      if (inOwn(d)) {
        const kind = useKind(n, p);
        for (const t of targetsOf(d)) if (t !== p) link(p, t, kind);
        const loc = bindingLoc(sym, p);
        if (loc) {
          if (isWriteTarget(n)) p.writes.add(loc);
          if (!isWriteTarget(n) || (par && !ts.isBinaryExpression(par)) || (ts.isBinaryExpression(par) && par.operatorToken.kind !== ts.SyntaxKind.EqualsToken)) p.reads.add(loc);
        }
      } else if (fromProduct(d) && sym.flags & ts.SymbolFlags.Value) {
        // another module's value: state outside this module's code, unless that module is proven to keep none
        if (isWriteTarget(n) || !statelessModule(fromProduct(d))) { p.reads.add('ext'); p.writes.add('ext'); }
      }
    }
  }

  function noteMember(e, name, p) {
    const kind = useKind(e, p);
    for (const q of members.get(name) ?? []) if (q !== p) link(p, q, kind);
    const w = isWriteTarget(e);
    p[w ? 'writes' : fromParam(e.expression, p) ? 'paramReads' : 'reads'].add(`f:${name}`);
    if (w && ts.isBinaryExpression(e.parent) && e.parent.operatorToken.kind !== ts.SyntaxKind.EqualsToken) p.reads.add(`f:${name}`);
    // channels and settings reached by name
    const text = e.getText();
    if (/^process\.env(\.|\[)/.test(text) && ts.isPropertyAccessExpression(e) && e.expression.getText() === 'process.env') p.channels.add(`setting ${name}`);
    else if (ts.isElementAccessExpression(e) && e.expression.getText() === 'process.env') p.channels.add(`setting ${name}`);
    if (text === 'process.argv') p.channels.add('start arguments');
    if (text === 'process.stdin') p.channels.add('reads standard input');
    if (text === 'process.exitCode') p.channels.add('exit code');
  }

  function noteCall(c, p, sf) {
    const callee = c.expression;
    const name = ts.isPropertyAccessExpression(callee) ? callee.name.text : ts.isIdentifier(callee) ? callee.text : null;
    const full = callee.getText();
    // a built-in method that writes into the object it is called on
    if (ts.isPropertyAccessExpression(callee) && MUTATORS.has(name)) {
      let builtin = false;
      try { const d = checker.getResolvedSignature(c)?.declaration; builtin = !d || d.getSourceFile().isDeclarationFile; } catch { builtin = true; }
      if (builtin) { const loc = contentsLoc(callee.expression, p); if (loc) p.writes.add(loc); }
    }
    if (full === 'Object.assign' || full === 'Object.defineProperty' || full === 'Object.defineProperties') {
      const loc = c.arguments[0] && contentsLoc(c.arguments[0], p);
      if (loc) p.writes.add(loc);
      if (full !== 'Object.assign') p.instances.add('properties defined');
    }
    if (full === 'Object.create' || full === 'Object.setPrototypeOf') p.instances.add('an object with a prototype');
    // a promise made rejected leaves as it is handed back, whatever block the call is in
    if (full === 'Promise.reject' && c.arguments[0]) for (const x of thrownOf(c.arguments[0], p)) p.rejects.add(x);
    if (ts.isIdentifier(callee) && callee.text === 'reject' && c.arguments[0]) for (const x of thrownOf(c.arguments[0], p)) p.rejects.add(x);
    // channels
    if (ts.isPropertyAccessExpression(callee) && callee.expression.getText() === 'console') p.channels.add(STDERR.has(name) ? 'writes standard error' : 'writes standard output');
    if (/^process\.stdout\./.test(full)) p.channels.add('writes standard output');
    if (/^process\.stderr\./.test(full)) p.channels.add('writes standard error');
    if (full === 'process.exit') p.channels.add('exit code');
    if (full === 'process.on' || full === 'process.once') p.channels.add(`process event ${lit(c.arguments[0]) ?? '?'}`);
    if (full === 'process.send') p.channels.add('writes to its parent');
    if (full === 'fetch') p.channels.add('network');
    if (TIMERS.has(full)) p.channels.add('a timer');
    if (full === 'Date.now' || full === 'performance.now') p.channels.add('the clock');
    if (full === 'Math.random' || /^crypto\./.test(full)) p.channels.add('randomness');
    // Node's own modules, named by import
    const root = ts.isPropertyAccessExpression(callee) ? callee.expression : callee;
    const imp = ts.isIdentifier(root) ? nodeImport(checker.getSymbolAtLocation(root)) : null;
    if (imp) {
      const fn = imp.name === '*' ? name : imp.name;
      if (/^fs(\/promises)?$/.test(imp.spec)) {
        if (FS_READ.has(fn)) p.channels.add(`reads file ${pathOf(c.arguments[0], sf)}`);
        else if (FS_WRITE.has(fn)) p.channels.add(`writes file ${pathOf(c.arguments[0], sf)}`);
        else p.channels.add(`files (${fn})`);
      } else if (imp.spec === 'child_process' && STARTS.has(fn)) p.channels.add(`starts a program ${c.arguments.map((a) => pathOf(a, sf)).filter((x) => x !== '?').join(' ') || '?'}`);
      else if (imp.spec === 'worker_threads') p.channels.add(`threads (${fn})`);
      else if (imp.spec === 'process') p.channels.add(`process (${fn})`);
      else p.channels.add(`${imp.spec} (${fn})`);
    }
    // a table of the shared store named in a call to the store (@carriestable), or an operation called by name
    let carrier;
    try { carrier = carrierOf(checker, c); } catch { carrier = undefined; }
    if (carrier) for (const nm of carrier.names ?? ['?']) p.channels.add(`${carrier.kind === 'table' ? 'table' : 'operation'} ${nm} (${carrier.member})`);
  }

  function noteNew(n, p, sf) {
    const e = n.expression;
    const sym = ts.isIdentifier(e) || ts.isPropertyAccessExpression(e) ? resolve(checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e)) : null;
    const d = sym?.declarations?.[0];
    const m = d && fromProduct(d);
    if (m && (isClassPiece(d) || sym.flags & ts.SymbolFlags.Class)) p.instances.add(`an instance of ${m}.${sym.name}`);
    const imp = ts.isIdentifier(e) ? nodeImport(checker.getSymbolAtLocation(e)) : null;
    if (imp && STARTS.has(imp.name)) p.channels.add(`starts a program ${n.arguments?.map((a) => pathOf(a, sf)).join(' ') || '?'}`);
    if (ts.isIdentifier(e) && e.text === 'Date' && !n.arguments?.length) p.channels.add('the clock');
  }

  // M7: which parameters each function piece writes into, through a local name for it and through the module's own
  // functions it hands them to, to a fixpoint.
  const paramsOf = (fn) => (isFunctionPiece(fn.node) ? fn.node.parameters : []);
  const written = new Map(pieces.map((p) => [p, new Set()]));
  {
    const rootOf = (e) => {
      for (;;) {
        while (ts.isParenthesizedExpression(e) || ts.isNonNullExpression?.(e)) e = e.expression;
        if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) e = e.expression;
        else return e;
      }
    };
    // the parameter index a name stands for, in a function piece: the parameter itself, a name bound from it, or a
    // local name set from it (const a = p, const b = p.list)
    const paramIndex = (fn, id) => {
      if (!ts.isIdentifier(id)) return -1;
      const sym = checker.getSymbolAtLocation(id);
      const d = sym?.declarations?.[0];
      if (!d) return -1;
      const ps = paramsOf(fn);
      for (let i = 0; i < ps.length; i++) {
        if (ps[i] === d) return i;
        let found = false;
        forEachNode(ps[i], (x) => { if (x === d) found = true; return !found; });
        if (found) return i;
      }
      if (ts.isVariableDeclaration(d) && d.initializer && pieceOf(d) === fn) return paramIndex(fn, rootOf(d.initializer));
      return -1;
    };
    const fns = pieces.filter((p) => paramsOf(p).length);
    const writesIn = (fn) => {
      const out = new Set();
      const visit = (n) => {
        if (n !== fn.node && isPiece(n) && !ts.isArrowFunction(n)) return false;
        if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) && isWriteTarget(n)) { const i = paramIndex(fn, rootOf(n.expression)); if (i >= 0) out.add(i); }
        if (ts.isCallExpression(n)) {
          const callee = n.expression;
          if (ts.isPropertyAccessExpression(callee) && MUTATORS.has(callee.name.text)) { const i = paramIndex(fn, rootOf(callee.expression)); if (i >= 0) out.add(i); }
          if (callee.getText() === 'Object.assign' && n.arguments[0]) { const i = paramIndex(fn, rootOf(n.arguments[0])); if (i >= 0) out.add(i); }
          // handed to a function of this module that writes into that parameter
          let target = null;
          try { const d = checker.getResolvedSignature(n)?.declaration; if (d && byNode.has(d)) target = byNode.get(d); } catch { /* none */ }
          if (target) n.arguments.forEach((a, j) => { if (written.get(target)?.has(j)) { const i = paramIndex(fn, rootOf(a)); if (i >= 0) out.add(i); } });
        }
        return true;
      };
      forEachNode(fn.node, visit);
      return out;
    };
    for (let changed = true, rounds = 0; changed && rounds < 20; rounds++) {
      changed = false;
      for (const fn of fns) { const w = writesIn(fn); if (w.size !== written.get(fn).size) { written.set(fn, w); changed = true; } }
    }
  }

  // Type errors under the standard's settings, each in the innermost piece holding it.
  for (const sf of sfs) {
    for (const d of [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)]) {
      const text = ts.flattenDiagnosticMessageText(d.messageText, ' ');
      if (NOT_THE_CODES.has(d.code) || ((d.code === 2304 || d.code === 2552) && NODE_NAMES.test(text))) continue;
      let n = sf;
      for (;;) { let next = null; ts.forEachChild(n, (c) => { if (c.getStart(sf) <= (d.start ?? 0) && (d.start ?? 0) < c.end) { next = c; return true; } }); if (!next) break; n = next; }
      const p = pieceOf(n);
      if (p) p.errors.push(`TS${d.code}: ${text}`);
    }
  }

  // The closures.
  const back = new Map(pieces.map((p) => [p, new Set()]));
  for (const p of pieces) for (const q of p.edges) back.get(q).add(p);
  const writers = new Map();
  const fieldWriters = new Set();
  for (const p of pieces) for (const l of p.writes) {
    if (!writers.has(l)) writers.set(l, new Set());
    writers.get(l).add(p);
    if (l.startsWith('f:')) fieldWriters.add(p);
  }
  const writersOf = (l) => {
    if (l === 'f:*') return fieldWriters;
    const out = new Set(writers.get(l) ?? []);
    if (l.startsWith('f:')) for (const w of writers.get('f:*') ?? []) out.add(w);
    return out;
  };
  /** Code that runs during a call: control edges and the members the language calls without a name. */
  const itemPieces = new Set();
  const control = (seeds) => {
    const seen = new Set();
    const todo = [...seeds, ...(seeds.length ? implicit : [])];
    while (todo.length) {
      const p = todo.pop();
      if (seen.has(p)) continue;
      seen.add(p);
      for (const q of p.edges) if (!seen.has(q) && !(p.contains.has(q) && itemPieces.has(q))) todo.push(q);
    }
    return seen;
  };
  /**
   * M4 over the control closure, each piece reached as it runs: at once, or only inside a catching block (`caught`).
   * A piece reached by a guarded call to code that runs at once is caught; what a caught piece calls to run at once is
   * caught too; whatever is only referenced, or runs later (async, a generator), is not. A caught piece's own errors do
   * not leave the item; a rejected promise it makes does.
   */
  const throwsOf = (seeds) => {
    const mode = new Map();
    const todo = [...seeds, ...(seeds.length ? implicit : [])].map((p) => [p, 'once']);
    while (todo.length) {
      const [p, m] = todo.pop();
      const had = mode.get(p);
      if (had === 'once' || had === m) continue;
      mode.set(p, m);
      for (const q of p.edges) {
        if (p.contains.has(q) && itemPieces.has(q)) continue;
        const k = p.kinds.get(q) ?? 'ref';
        const caught = runsAtOnce(q) && (k === 'guarded' || (m === 'caught' && k === 'call'));
        todo.push([q, caught ? 'caught' : 'once']);
      }
    }
    return [...mode].flatMap(([p, m]) => [...(m === 'once' ? p.throws : []), ...p.rejects]);
  };
  // The files that run in the same program as an item: those its interface files and its own file import, followed
  // file to file within the module. A file of the module that only runs as a program of its own (started by path) is
  // not among them: its code runs elsewhere, and writes nothing an item reads.
  const imports = new Map();
  for (const sf of sfs) {
    const out = new Set();
    for (const spec of sf.imports ?? []) {
      const to = program.getResolvedModuleFromModuleSpecifier?.(spec, sf)?.resolvedModule?.resolvedFileName;
      if (to && own.has(path.resolve(to))) out.add(path.resolve(to));
    }
    imports.set(sf.fileName, out);
  }
  const loadedWith = (files) => {
    const seen = new Set();
    const todo = [...mod.public, ...files].map((f) => path.resolve(f));
    while (todo.length) { const f = todo.pop(); if (seen.has(f)) continue; seen.add(f); for (const g of imports.get(f) ?? []) todo.push(g); }
    return seen;
  };
  /** The whole closure: control, start-up code, the writers of every location read and what reaches them, to a fixpoint. */
  // What an item's own pieces read of what its caller handed it is its input, whoever made it: the item's answer for
  // that input does not depend on the code that wrote it (its writers' own means tell their users). What any other
  // piece reads through its parameters may be the module's state, handed on, and pulls in that state's writers.
  const whole = (fc, inputs = new Set()) => {
    const loaded = loadedWith([...fc].map((p) => p.file));
    const C = new Set([...fc, ...control(pieces.filter((p) => p.top && loaded.has(path.resolve(p.file))))]);
    for (;;) {
      const reads = new Set();
      for (const p of C) for (const l of [...p.reads, ...(inputs.has(p) ? [] : p.paramReads)]) reads.add(l);
      const W = new Set();
      for (const l of reads) for (const w of writersOf(l)) if (!C.has(w) && loaded.has(path.resolve(w.file))) W.add(w);
      if (!W.size) return C;
      const callers = new Set(W);
      const todo = [...W];
      while (todo.length) for (const a of back.get(todo.pop())) if (!callers.has(a)) { callers.add(a); todo.push(a); }
      const more = [...control([...callers])].filter((p) => !C.has(p));
      if (!more.length) return C;
      for (const p of more) C.add(p);
    }
  };

  const digestOf = (set) => {
    const h = crypto.createHash('sha256');
    for (const k of [...set].map((p) => `${keys.get(p)}=${shapeOf(p.node, (n) => isPiece(n), keyOf)}`).sort()) h.update(k).update('\n');
    return h.digest('hex').slice(0, 16);
  };
  const sortedOf = (set, f) => [...new Set([...set].flatMap(f))].sort();

  /** The computed parts of the means for an item whose code starts at the given pieces. */
  function factsOf(seeds, whole_) {
    const fc = control(seeds);
    const all = whole(fc, whole_ ? new Set() : new Set(seeds));
    // `this`: in the item's own code, and in arrow functions written inside it, which share its `this`
    const own = new Set(seeds);
    const todo = [...seeds];
    while (todo.length) for (const q of todo.pop().edges) if (ts.isArrowFunction(q.node) && !own.has(q)) { own.add(q); todo.push(q); }
    return {
      throws: [...new Set(throwsOf(seeds))].sort(),
      instances: sortedOf(all, (p) => [...p.instances]),
      needsThis: [...own].some((p) => p.thisUse && !p.top),
      writesArguments: sortedOf(seeds.filter((p) => isFunctionPiece(p.node)), (p) => [...written.get(p)].map((i) => `argument ${i + 1}`)),
      // M8: what runs during the call, all of it; what the closure adds beyond that (code that wrote state the item
      // reads), only what can reach that state: a stream written out, which no code of the product reads back, cannot
      channels: sortedOf(all, (p) => [...p.channels].filter((c) => fc.has(p) || !SINKS.has(c))),
      typeErrors: sortedOf(fc, (p) => p.errors),
      code: digestOf(fc),
      ...(whole_ ? { wholeModule: true } : {}),
    };
  }

  /** The pieces that are items' own code: reached from where they are written only by a call. */
  const setItemPieces = (set) => { for (const p of set) itemPieces.add(p); };
  return { pieces, byNode, members, keys, factsOf, setItemPieces, rel };
}

/** The key, on each item's means, of where it was read from: { side: { tree, moduleId, items, meta }, name }. */
export const MEANS_SIDE = Symbol('p4.means.side');
const SIDES = new WeakMap(); // tree -> moduleId -> the side last worked out
/** The means last worked out for a module of a product (moduleMeans), or null. */
export const meansSideOf = (tree, moduleId) => SIDES.get(tree)?.get(moduleId) ?? null;

/**
 * The means of every item of one module, on one side of a change.
 * @param tree the product (loadTree)
 * @param moduleId the module
 * @returns {{ module: string, items: Record<string, object>, listing: object }}
 */
export function moduleMeans(tree, moduleId) {
  loadReader();
  const mod = tree.byId.get(moduleId);
  if (!mod) throw new Error(`no module is named ${moduleId}`);
  const program = makeStandardProgram(mod.src);
  const checker = program.getTypeChecker();
  const listing = makeLister(program, tree).list(mod);
  const code = makeCode(program, checker, tree, mod);
  // Where each item's code is: the pieces inside its declaration; for a member of a kind of handle, an operation or a
  // class member, every piece that fills that member (an object written for that kind, found by the checker) and every
  // member of the same name (any receiver may reach it).
  const entryOfDecl = (d) => {
    if (!d) return null;
    const f = d.getSourceFile().fileName, at = (d.name ?? d).end - 1;
    let best = null;
    for (const r of listing.ranges) if (r.file === f && r.start <= at && at < r.end && (!best || r.end - r.start < best.end - best.start)) best = r;
    return best?.entry ?? null;
  };
  const fills = new Map(); // entry -> pieces that fill it
  for (const p of code.pieces) {
    let holder = p.node.parent;
    if (holder && ts.isPropertyAssignment(holder)) holder = holder.parent; else if (!(ts.isMethodDeclaration(p.node) || ts.isGetAccessor(p.node) || ts.isSetAccessor(p.node))) holder = null;
    if (!holder || !ts.isObjectLiteralExpression(holder) || !p.member) continue;
    const ct = checker.getContextualType(holder);
    const ps = ct && checker.getPropertyOfType(ct, p.member);
    const e = entryOfDecl(ps?.declarations?.[0]);
    if (!e) continue;
    if (!fills.has(e)) fills.set(e, new Set());
    fills.get(e).add(p);
  }
  // A shorthand member ({ quote }) fills the member with a function declared elsewhere in the module.
  for (const f of mod.src) {
    const sf = program.getSourceFile(f);
    if (!sf) continue;
    forEachNode(sf, (n) => {
      if (!ts.isShorthandPropertyAssignment(n) || !ts.isObjectLiteralExpression(n.parent)) return;
      const ct = checker.getContextualType(n.parent);
      const e = entryOfDecl(ct && checker.getPropertyOfType(ct, n.name.text)?.declarations?.[0]);
      if (!e) return;
      for (const d of checker.getShorthandAssignmentValueSymbol(n)?.declarations ?? []) {
        const init = ts.isVariableDeclaration(d) ? d.initializer : d;
        const p = code.byNode.get(init) ?? code.byNode.get(d);
        if (p) { if (!fills.has(e)) fills.set(e, new Set()); fills.get(e).add(p); }
      }
    });
  }
  // The members that are items of their own: those that fill a listed kind's member, and an exported class's members.
  const memberSeeds = new Set([...fills.values()].flatMap((x) => [...x]));
  for (const [name, e] of Object.entries(listing.entries)) {
    if (e.kind !== 'class member') continue;
    const member = /[.#]([^.#]+)$/.exec(name)?.[1];
    for (const p of code.members.get(member) ?? []) if (ts.isClassDeclaration(p.node.parent) || ts.isClassExpression(p.node.parent)) memberSeeds.add(p);
  }
  code.setItemPieces(memberSeeds);
  const items = {};
  for (const [name, e] of Object.entries(listing.entries)) {
    const it = { kind: e.kind };
    if (e.accepts !== undefined && e.accepts !== null) it.accepts = e.accepts;
    if (e.handsBack !== undefined && e.handsBack !== null) it.handsBack = e.handsBack;
    if (e.side) it.side = e.side;
    if (e.optional) it.optional = true;
    it.bounds = e.bounds ?? [];
    it.where = e.where;
    if (!NO_CODE.has(e.kind)) {
      let seeds = new Set();
      const member = /^op:(.+)$/.exec(name)?.[1] ?? /[.#]([^.#]+)$/.exec(name)?.[1];
      if (e.kind === 'method' || e.kind === 'operation' || e.kind === 'class member') {
        for (const p of fills.get(name) ?? []) seeds.add(p);
        for (const p of code.members.get(member) ?? []) seeds.add(p);
      } else {
        // the outermost pieces inside the item's declaration: what is written inside them is reached from them as the
        // closure says (a member of an object handed back that is an item of its own is not)
        const inside = new Set();
        for (const r of listing.ranges.filter((x) => x.entry === name)) {
          for (const p of code.pieces) {
            if (p.file !== r.file || p.node.getStart(p.node.getSourceFile()) < r.start || p.node.end > r.end) continue;
            inside.add(p);
          }
        }
        for (const p of inside) {
          let outer = p.node.parent;
          while (outer && !code.byNode.has(outer)) outer = outer.parent;
          if (outer && inside.has(code.byNode.get(outer))) continue;
          seeds.add(p);
        }
        // a class's own item is built by its constructor and its fields; its members are items of their own
        if (e.kind === 'class') for (const p of inside) if (ts.isConstructorDeclaration(p.node)) seeds.add(p);
      }
      const whole = !seeds.size;
      if (whole) seeds = new Set(code.pieces);
      Object.assign(it, code.factsOf([...seeds], whole));
    }
    items[name] = it;
  }
  // M5 for a kind of plain data: whether its values, as the module's items build them, are plain data or class
  // instances. A kind has no code of its own, so its part is that of every item that accepts or hands it back.
  for (const [name, it] of Object.entries(items)) {
    if (it.kind !== 'kind' && it.kind !== 'stored rows') continue;
    const tag = JSON.stringify(`${moduleId}.${it.kind === 'stored rows' ? listing.entries[name].rowKind : name}`);
    const by = Object.values(items).filter((x) => x.instances && JSON.stringify([x.accepts, x.handsBack]).includes(`"name":${tag}`));
    it.instances = [...new Set(by.flatMap((x) => x.instances))].sort();
  }
  // Where each item was read from, kept out of sight (a symbol, not enumerable: no form or comparison shows it), so that
  // comparing two items can ask the checker about the declarations themselves (notice.mjs, compareItem and makeConfirm).
  const meta = {};
  for (const [name, e] of Object.entries(listing.entries)) {
    meta[name] = { kind: e.kind, ...(e.rowKind ? { rowKind: e.rowKind } : {}) };
    if (e.kind === 'operation') {
      const op = name.slice(3);
      const table = Object.entries(listing.entries).find(([, t]) => t.kind === 'operation table' && t.handsBack?.names?.includes(op));
      if (table) meta[name].table = table[0];
    }
  }
  const side = { tree, moduleId, items, meta };
  if (!SIDES.has(tree)) SIDES.set(tree, new Map());
  SIDES.get(tree).set(moduleId, side);
  for (const [name, it] of Object.entries(items)) Object.defineProperty(it, MEANS_SIDE, { value: { side, name } });
  return { module: moduleId, items, listing };
}
