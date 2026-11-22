// The check, run inside one module's own tests and on that module only (design part 2, section 6; build text 1b,
// command 18). Ported from the notice's proof (proof: tool/lib/check.mjs), keeping only three parts:
//   declared uses: the module's declared uses against the imports of its source and its tests;
//     and against the order: a declared use of a module that is not before this one disagrees;
//   (a) a structured comment that disagrees with the module's own code;
//   (b) the module's code that disagrees with a provider's stated interface.
// The proof's 23 refusals of rules of form (rules 2, 3, 4, 5, 11, 14, 19, 20, 22, 28, 29, 30, 31, 34, 35, 36, 38, 40,
// 44, 45, 46, 47, 49) are not taken. Where the reader cannot tell, the check says so and never refuses.
// Also: the comments-only verification of a module's first step.
import fs from 'node:fs';
import path from 'node:path';
import { ts, loadReader, makeProgram, tagText, NODE_DESCRIPTION } from './ts.mjs';
import { carrierOf } from './carriers.mjs';
import { makeLister } from './listing.mjs';
import { makeUsage } from './usage.mjs';

/**
 * Complaints that mean "I cannot tell", never a disagreement. Decided here:
 * - a module from outside the product that the reader has no description of (Node's own modules: no type
 *   descriptions are installed, by design, since TypeScript is the only development dependency);
 * - Node's own global names (process, Buffer) for the same reason.
 */
const CANNOT_TELL = new Map([
  [2307, 'a module from outside the product that the reader has no description of'],
  [7016, 'a module from outside the product that the reader has no description of'],
  [2580, "Node's own global names, which the reader has no description of"],
  [2591, "Node's own global names, which the reader has no description of"],
  [2867, "Node's own global names, which the reader has no description of"],
  [2868, "Node's own global names, which the reader has no description of"],
]);

/** The reader's complaints that a kind is not stated (its codes 7000 to 7099): "I cannot tell". */
const isUnstatedKind = (code) => code >= 7000 && code < 7100;

function where(d, root) {
  if (!d.file) return '(no file)';
  const { line } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
  return `${path.relative(root, d.file.fileName)}:${line + 1}`;
}

function nodeAt(sf, pos) {
  let found = sf;
  const visit = (n) => {
    if (n.getStart(sf) <= pos && pos < n.end) {
      found = n;
      ts.forEachChild(n, visit);
    }
  };
  ts.forEachChild(sf, visit);
  return found;
}

function isInsideComment(sf, pos) {
  for (const r of [...(ts.getLeadingCommentRanges(sf.text, 0) ?? [])]) if (pos >= r.pos && pos < r.end) return true;
  // a position inside /** ... */ anywhere
  const before = sf.text.lastIndexOf('/*', pos), close = sf.text.lastIndexOf('*/', pos);
  return before >= 0 && before > close;
}

const POSSIBLY_UNDEFINED = new Set([2532, 2533, 18047, 18048, 18049]);
const MEMBERSHIP = new Set(['includes', 'indexOf', 'lastIndexOf', 'has']);
/** The assertions whose first argument deliberately exercises an error condition (design part 2, section 6). */
const ERROR_ASSERTIONS = new Set(['throws', 'rejects', 'doesNotThrow', 'doesNotReject']);

function walk(n, f) { f(n); ts.forEachChild(n, (c) => walk(c, f)); }

/**
 * The character spans of the first argument of each deliberate error assertion (assert.throws, assert.rejects and
 * their kin) in a test file. A test may pass a wrong-typed value on purpose there to show that the error condition is
 * properly identified and communicated (design part 2, section 6). That is not one of the two approved refusals, so a
 * reader's complaint inside such a span is "cannot tell", never a disagreement (fault D, the owner's decision of 19 Nov
 * 2026). Decided here: the signal is the enclosing assertion, the one place the test marks the value as deliberate.
 */
function errorAssertionSpans(sf) {
  const spans = [];
  walk(sf, (n) => {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ERROR_ASSERTIONS.has(n.expression.name.text)) {
      const a0 = n.arguments[0];
      if (a0) spans.push([a0.getStart(sf), a0.end]);
    }
  });
  return spans;
}
function within(node, outer) { return node.pos >= outer.pos && node.end <= outer.end; }

/**
 * @param tree the product
 * @param moduleId the module whose own tests run this check
 * @param opts { files: paths relative to the product (only these files' disagreements), analysis: a reading of the
 *   whole product already made (program, listings, uses), to reuse }
 */
export function check(tree, moduleId, opts = {}) {
  loadReader();
  const mod = tree.byId.get(moduleId);
  if (!mod) throw new Error(`no such module: ${moduleId}`);
  const program = opts.analysis?.program ?? makeProgram([...mod.files, ...mod.uses.flatMap((u) => tree.byId.get(u)?.public ?? [])]);
  const checker = program.getTypeChecker();
  const refusals = [];
  const cannotTell = [];
  const moduleOfDecl = (decl) => tree.moduleOfFile(decl.getSourceFile().fileName);
  const rel = (f) => path.relative(tree.root, f).split(path.sep).join('/');
  const only = opts.files ? new Set(opts.files.map((f) => f.replace(/^\.\//, ''))) : null;
  const guardedGet = (node) => {
    let top = node;
    while (top.parent && !ts.isStatement(top)) top = top.parent;
    const gets = [];
    walk(top, (m) => { if (ts.isCallExpression(m) && ts.isPropertyAccessExpression(m.expression) && m.expression.name.text === 'get' && m.arguments.length === 1) gets.push(`${m.expression.expression.getText()}.has(${m.arguments[0].getText()})`); });
    // a variable set from X.get(K) and used here
    walk(top, (m) => {
      if (!ts.isIdentifier(m)) return;
      const d = checker.getSymbolAtLocation(m)?.declarations?.[0];
      if (d && ts.isVariableDeclaration(d) && d.initializer && ts.isCallExpression(d.initializer) && ts.isPropertyAccessExpression(d.initializer.expression) && d.initializer.expression.name.text === 'get' && d.initializer.arguments.length === 1) gets.push(`${d.initializer.expression.expression.getText()}.has(${d.initializer.arguments[0].getText()})`);
    });
    if (!gets.length) return false;
    // set when missing, just before: if (!X.has(K)) X.set(K, ...);
    const block = top.parent;
    if (block && (ts.isBlock(block) || ts.isSourceFile(block))) {
      for (const st of block.statements) {
        if (st === top) break;
        if (ts.isIfStatement(st) && /^!/.test(st.expression.getText().trim())) {
          const cond = st.expression.getText().replace(/\s+/g, '');
          for (const g of gets) {
            const [x, k] = g.replace(/\s+/g, '').split('.has(');
            if (cond.includes(`!${x}.has(${k}`) && st.thenStatement.getText().replace(/\s+/g, '').includes(`${x}.set(${k.replace(/\)$/, '')}`)) return true;
          }
        }
      }
    }
    for (let a = node.parent; a; a = a.parent) {
      const cond = ts.isIfStatement(a) || ts.isWhileStatement(a) ? a.expression : ts.isConditionalExpression(a) ? a.condition : ts.isBinaryExpression(a) && a.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ? a.left : null;
      if (cond && gets.some((g) => cond.getText().replace(/\s+/g, '').includes(g.replace(/\s+/g, '')))) return true;
      if (ts.isFunctionLike(a)) break;
    }
    return false;
  };

  for (const f of mod.files) {
    if (only && !only.has(rel(f))) continue;
    const sf = program.getSourceFile(f);
    if (!sf) continue;
    const isTest = mod.tests.includes(f);
    // In a test file, the first argument of a deliberate error assertion may carry a wrong-typed value on purpose.
    const errorSpans = isTest ? errorAssertionSpans(sf) : null;

    // Calls by a name the reader cannot read: "cannot tell" for the call and for the uses of its answer.
    const unreadCalls = [];
    walk(sf, (n) => { if (ts.isCallExpression(n)) { const c = carrierOf(checker, n); if (c?.kind === 'op' && c.names === null) unreadCalls.push(n); } });
    const fromUnread = (node, depth = 0) => {
      if (!unreadCalls.length || depth > 4) return false;
      if (unreadCalls.some((c) => within(node, c))) return true;
      let e = node;
      // a complaint about a field (status.state) names the field: start from the whole expression
      while (e.parent && (ts.isPropertyAccessExpression(e.parent) || ts.isElementAccessExpression(e.parent)) && e.parent.expression !== e) e = e.parent;
      while (e && (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e) || ts.isCallExpression(e) || ts.isAwaitExpression(e) || ts.isParenthesizedExpression(e))) e = e.expression;
      if (!e || !ts.isIdentifier(e)) return false;
      const s = checker.getSymbolAtLocation(e);
      const d = s?.declarations?.[0];
      if (!d) return false;
      const vd = ts.isBindingElement(d) ? d.parent?.parent : d;
      if (vd && ts.isVariableDeclaration(vd) && vd.initializer) return unreadCalls.some((c) => within(c, vd.initializer)) || fromUnread(vd.initializer, depth + 1);
      return false;
    };

    for (const d of [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)]) {
      const text = ts.flattenDiagnosticMessageText(d.messageText, ' ');
      const at = where(d, tree.root);
      const node = nodeAt(sf, d.start ?? 0);
      // A deliberate wrong-typed value inside a test's error assertion: not one of the two approved refusals (fault D).
      if (errorSpans && errorSpans.some(([s, e]) => (d.start ?? 0) >= s && (d.start ?? 0) < e)) {
        cannotTell.push({ at, code: d.code, why: 'a value deliberately exercised in an error assertion (assert.throws/rejects)', text });
        continue;
      }
      // A missing name of a closed set of names is a real disagreement, though the reader files it with the unstated kinds.
      // Iteration 4: a complaint of the comment parser inside a comment; Node names the reader is not told of;
      // filter(Boolean), which removes the missing values the reader still sees.
      if (d.code === 1003 && ts.getTokenAtPosition && isInsideComment(sf, d.start ?? 0)) { cannotTell.push({ at, code: d.code, why: 'the comment parser stumbled inside a comment', text }); continue; }
      if ((d.code === 2304 || d.code === 2552) && /'(crypto|fetch|performance|Buffer|AbortController|AbortSignal|Blob|Response|Request|Headers|FormData|WebSocket|global|globalThis|require|module|exports|__dirname|__filename|setImmediate|clearImmediate)'/.test(text)) { cannotTell.push({ at, code: d.code, why: "a Node name the reader is not told of", text }); continue; }
      if ([2322, 2345, 2532, 18048].includes(d.code)) { let st = node; while (st.parent && !ts.isStatement(st)) st = st.parent; if (/\.filter\(\s*Boolean\s*\)/.test(st.getText())) { cannotTell.push({ at, code: d.code, why: 'filter(Boolean), which the reader does not understand', text }); continue; } }
      if (isUnstatedKind(d.code) && !(d.code === 7053 && /Property '[^']+' does not exist on type/.test(text))) {
        cannotTell.push({ at, code: d.code, why: 'a kind that no comment states', text });
        continue;
      }
      if (CANNOT_TELL.has(d.code) && !(d.code === 2307 && /['"]\.\.?\//.test(text))) {
        cannotTell.push({ at, code: d.code, why: CANNOT_TELL.get(d.code), text });
        continue;
      }
      let expr = node;
      while (expr.parent && !ts.isStatement(expr.parent) && !ts.isCallExpression(expr)) expr = expr.parent;
      if (fromUnread(node) || (ts.isCallExpression(expr) && unreadCalls.includes(expr))) {
        cannotTell.push({ at, code: d.code, why: 'a call by a name the reader cannot read, or the use of its answer', text });
        continue;
      }
      // Iteration 3: Map.has(k) guarding Map.get(k) is "cannot tell", whatever module the value's kind comes from.
      if (guardedGet(node)) {
        cannotTell.push({ at, code: d.code, why: 'a get guarded by has, which the reader cannot see', text });
        continue;
      }
      // Iteration 7 (tool change 34): a property missing from something the tool's own description of Node describes
      if ([2339, 2551].includes(d.code) && ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
        const rt = checker.getTypeAtLocation(node.parent.expression);
        if ([rt.symbol, rt.aliasSymbol].some((s) => (s?.declarations ?? []).some((x) => x.getSourceFile().fileName === NODE_DESCRIPTION))) { cannotTell.push({ at, code: d.code, why: "a part of Node the tool's description of Node leaves out", text }); continue; }
      }
      // Iteration 6: a property added to an error object (err.code = '...'), Node's own way.
      if (d.code === 2339 && ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
        const rt = checker.getTypeAtLocation(node.parent.expression);
        if ((rt.symbol?.declarations ?? []).some((x) => x.getSourceFile().isDeclarationFile) && /Error$/.test(rt.symbol?.name ?? '')) { cannotTell.push({ at, code: d.code, why: 'a property added to an error object', text }); continue; }
      }
      // Asking a list or set whether it holds a value wider than its own kind: the reader types it too narrowly.
      const call = node.parent?.parent && ts.isCallExpression(node.parent.parent) ? node.parent.parent : node.parent && ts.isCallExpression(node.parent) ? node.parent : null;
      if (d.code === 2345 && call && ts.isPropertyAccessExpression(call.expression) && MEMBERSHIP.has(call.expression.name.text)) {
        cannotTell.push({ at, code: d.code, why: 'a membership question the reader types too narrowly', text });
        continue;
      }
      // Which kind of disagreement: does the statement name, or hold a value of, anything declared in another module?
      let stmt = node;
      while (stmt.parent && !ts.isStatement(stmt) && !ts.isSourceFile(stmt.parent) && !ts.isJSDoc(stmt)) stmt = stmt.parent;
      const others = new Set();
      const noteDecls = (decls) => { for (const decl of decls ?? []) { const m = moduleOfDecl(decl); if (m && m !== moduleId) others.add(m); } };
      walk(stmt, (n) => {
        if (!ts.isIdentifier(n)) return;
        let s = checker.getSymbolAtLocation(n);
        if (s && s.flags & ts.SymbolFlags.Alias) { try { s = checker.getAliasedSymbol(s); } catch { s = undefined; } }
        noteDecls(s?.declarations);
        const t = checker.getTypeAtLocation(n);
        noteDecls(t.aliasSymbol?.declarations); noteDecls(t.symbol?.declarations);
        for (const u of t.flags & ts.TypeFlags.Union ? t.types : []) { noteDecls(u.aliasSymbol?.declarations); noteDecls(u.symbol?.declarations); }
      });
      for (const r of d.relatedInformation ?? []) { const m = r.file && tree.moduleOfFile(r.file.fileName); if (m && m !== moduleId) others.add(m); }
      // Iteration 5: "possibly missing" about a value the language's own library hands back (pop, shift, find, at,
      // Map.get), or one taken from such a call, is "cannot tell".
      if (POSSIBLY_UNDEFINED.has(d.code)) {
        const fromLib = (x, depth = 0) => {
          while (ts.isParenthesizedExpression(x) || ts.isNonNullExpression(x)) x = x.expression;
          if (ts.isCallExpression(x)) { let sg; try { sg = checker.getResolvedSignature(x); } catch {} return !!sg?.declaration?.getSourceFile().isDeclarationFile; }
          if (ts.isPropertyAccessExpression(x) && depth < 4) return fromLib(x.expression, depth + 1);
          if (ts.isIdentifier(x) && depth < 4) { const dcl = checker.getSymbolAtLocation(x)?.declarations?.[0]; if (dcl && ts.isVariableDeclaration(dcl) && dcl.initializer) return fromLib(dcl.initializer, depth + 1); }
          return false;
        };
        const target = ts.isPropertyAccessExpression(node.parent) && node.parent.name === node ? node.parent.expression : node;
        if (fromLib(target)) { cannotTell.push({ at, code: d.code, why: "a value the language's own library may hand back missing", text }); continue; }
      }
      // "Possibly undefined" about a value that comes only from the module's own code: the reader cannot tell.
      if (POSSIBLY_UNDEFINED.has(d.code) && !others.size) {
        cannotTell.push({ at, code: d.code, why: "a value of the module's own that may be missing, guarded where the reader cannot see", text });
        continue;
      }
      refusals.push({
        at, code: d.code, text,
        kind: others.size ? `(b) code disagrees with the stated interface of ${[...others].join(', ')}` : `(a) a comment disagrees with ${isTest ? "this module's tests" : "this module's code"}`,
      });
    }
  }

  declaredUses(tree, mod, program, opts, refusals, cannotTell, only, rel);
  return { module: moduleId, refused: refusals.length > 0, refusals, cannotTell };
}

/** The product files a file imports: import and export from, import() of a written name, @import and import('...') in
 * comments. A name the tool cannot read is "cannot tell". */
function importsOf(sf, cannot) {
  const out = [];
  const spec = (node, s) => { if (s && (ts.isStringLiteral(s) || ts.isNoSubstitutionTemplateLiteral(s))) out.push({ node, spec: s.text }); };
  const visit = (n) => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier) spec(n, n.moduleSpecifier);
    else if (ts.isJSDocImportTag?.(n)) spec(n, n.moduleSpecifier);
    else if (ts.isImportTypeNode(n) && ts.isLiteralTypeNode(n.argument)) spec(n, n.argument.literal);
    else if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const a0 = n.arguments[0];
      if (a0 && (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0))) spec(n, a0); else cannot(n);
    }
    for (const d of n.jsDoc ?? []) visit(d);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

/**
 * Declared uses against imports (design part 2, section 6: "a check that the module's declared uses match its
 * imports", reading its tests as well as its source). An import of another module's file that the entry does not
 * declare disagrees. A declared use of a module that is not before this one in the order disagrees. A declared use that neither an import nor a call by name through a carrier makes disagrees,
 * unless the module calls by names, or names tables, the reader cannot read, or reads values of unknown kind: then the
 * reader cannot tell.
 */
function declaredUses(tree, mod, program, opts, refusals, cannotTell, only, rel) {
  const imported = new Map();
  const entryFile = `${tree.cfg.process_folder.replace(/\/?$/, '/')}modules/${mod.id}.json`;
  for (const f of mod.files) {
    const sf = program.getSourceFile(f) ?? ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    const at = (node) => `${rel(f)}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`;
    for (const { node, spec } of importsOf(sf, (node) => cannotTell.push({ at: at(node), code: 'import', why: 'an import of a name the tool cannot read', text: node.getText(sf).slice(0, 60) }))) {
      if (!spec.startsWith('.') && !spec.startsWith('/')) continue; // from outside the product
      const other = tree.moduleOfFile(path.resolve(path.dirname(f), spec));
      if (!other || other === mod.id) continue;
      if (!imported.has(other)) imported.set(other, []);
      imported.get(other).push({ at: at(node), file: rel(f) });
    }
  }
  // A module may use only modules before it (design part 2, section 1). A declared use of a module at the same or a
  // later place in the order disagrees (the owner's decision of 22 Nov 2026), so declaring a later module is no way
  // to make an import of it pass. The job cannot settle that in its own files: it goes to ARCH (part 2, section 3).
  const notBefore = (id) => { const o = tree.byId.get(id); return o && o.index >= mod.index ? o : null; };
  for (const u of mod.uses) {
    const o = notBefore(u);
    if (!o) continue;
    refusals.push({ at: entryFile, code: 'uses', text: `declares ${u} in uses, but ${u} is ${o.index === mod.index ? 'this module itself' : 'later in the order'} (line ${o.index + 1} of the order file; ${mod.id} is line ${mod.index + 1}): a module may use only modules before it; if the use is needed, it is ARCH's to settle`, kind: 'a declared use of a module that is not before this one' });
  }
  for (const [other, places] of imported) {
    if (mod.uses.includes(other)) continue;
    const later = notBefore(other) ? `; ${other} is later in the order, so declaring it would not settle this` : '';
    for (const p of places) {
      if (only && !only.has(p.file)) continue;
      refusals.push({ at: p.at, code: 'uses', text: `imports ${other}, which ${entryFile} does not declare in uses${later}`, kind: 'declared uses disagree with the imports' });
    }
  }
  const missing = mod.uses.filter((u) => !imported.has(u));
  if (!missing.length) return;
  // Calls by name through a carrier make a use without an import: read them as the notice does.
  let u = opts.analysis?.uses?.get(mod.id);
  if (!u) {
    const lister = makeLister(program, tree);
    const listings = new Map(tree.modules.filter((m) => m.public.length && m.public.every((f) => program.getSourceFile(f))).map((m) => [m.id, lister.list(m)]));
    u = makeUsage(program, tree, listings).usesOf(mod);
  }
  for (const p of missing) {
    if (u.uses.has(p)) continue;
    if (u.unreadOps.length || u.unreadTables.length || u.anything.length) {
      cannotTell.push({ at: entryFile, code: 'uses', why: 'calls by names, tables or values of unknown kind the reader cannot read may make this use', text: `declares ${p}; no import of it` });
      continue;
    }
    refusals.push({ at: entryFile, code: 'uses', text: `declares ${p} in uses, but neither its source nor its tests import it or call it by name`, kind: 'declared uses disagree with the imports' });
  }
}

// ---- comments-only verification ----

/** A file's running code as a tree with comments and grouping parentheses left out. */
const isBoundTestStatement = (st) => ts.isExpressionStatement(st) && isTestCall(st.expression) && /^bound\s/.test(testName(st.expression) ?? '');

/** A file's running code; with withoutBoundTests, its top-level tests named for a bound are left out. */
function shape(file, withoutBoundTests = false) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
  if (!withoutBoundTests) return shapeOfNode(sf);
  return sf.statements.filter((st) => !isBoundTestStatement(st)).map((st) => shapeOfNode(st)).join('');
}

/** The names (without 'bound ') of top-level tests named for a bound that are in the after file and not the before. */
function addedBoundTests(before, after) {
  const names = (file) => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS).statements
    .filter(isBoundTestStatement).map((st) => st.expression.arguments[0].text.replace(/^bound\s+/, '').replace(/\s+/g, ' ').trim());
  const b = new Set(names(before));
  return names(after).filter((n) => !b.has(n));
}

/** Names of calls that name a test or a group of tests. */
const TEST_CALLS = new Set(['test', 'it', 'describe', 'suite']);
/** Is this a call that names a test or a group of tests (test, it, describe, or t.test)? */
export const isTestCall = (n) => ts.isCallExpression(n) && (ts.isIdentifier(n.expression) ? TEST_CALLS.has(n.expression.text) : ts.isPropertyAccessExpression(n.expression) && TEST_CALLS.has(n.expression.name.text));
const testName = (n) => { const a0 = n.arguments[0]; return a0 && (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0)) ? a0.text : null; };


function shapeOfNode(root) {
  const out = [];
  const visit = (n) => {
    if (ts.isParenthesizedExpression(n)) return visit(n.expression);
    if (n.kind >= ts.SyntaxKind.FirstJSDocNode && n.kind <= ts.SyntaxKind.LastJSDocNode) return;
    let leaf = '';
    if (ts.isIdentifier(n) || ts.isPrivateIdentifier(n)) leaf = n.text;
    else if (ts.isStringLiteral(n) || ts.isNumericLiteral(n) || ts.isBigIntLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isRegularExpressionLiteral(n)) leaf = n.text;
    else if (n.kind === ts.SyntaxKind.TemplateHead || n.kind === ts.SyntaxKind.TemplateMiddle || n.kind === ts.SyntaxKind.TemplateTail) leaf = n.text;
    const chain = n.flags & ts.NodeFlags.OptionalChain ? '?' : '';
    out.push(`(${n.kind}${chain}${leaf ? ':' + JSON.stringify(leaf) : ''}`);
    ts.forEachChild(n, visit);
    // Tokens such as operators are not children in the tree: keep them.
    if (ts.isBinaryExpression(n)) out.push(`op${n.operatorToken.kind}`);
    if (ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) out.push(`op${n.operator}`);
    if (ts.isVariableDeclarationList(n)) out.push(`decl${n.flags & ts.NodeFlags.BlockScoped}`);
    out.push(')');
  };
  visit(root);
  return out.join('');
}

/**
 * Did a change to one module touch comments only? Compares each file's running code with comments and grouping
 * parentheses left out (a parenthesis added around a value to attach a kind to it changes nothing that runs).
 */
export function commentsOnly(beforeTree, afterTree, moduleId) {
  const mb = beforeTree.byId.get(moduleId), ma = afterTree.byId.get(moduleId);
  const boundLinesAfter = new Set();
  for (const f of ma.src) {
    const sf = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    walk(sf, (n) => { for (const doc of n.jsDoc ?? []) for (const tag of doc.tags ?? []) if (tag.tagName.text === 'bound') boundLinesAfter.add(tagText(tag)); });
  }
  const rel = (m, t) => m.files.map((f) => path.relative(t.root, f)).sort();
  const fb = rel(mb, beforeTree), fa = rel(ma, afterTree);
  const files = [];
  let ok = JSON.stringify(fb) === JSON.stringify(fa);
  for (const f of new Set([...fb, ...fa])) {
    const pb = path.join(beforeTree.root, f), pa = path.join(afterTree.root, f);
    if (!fs.existsSync(pb) || !fs.existsSync(pa)) { files.push({ file: f, same: false, why: 'file added or removed' }); ok = false; continue; }
    const isTest = ma.tests.includes(pa);
    // Iteration 3: in a test file, tests named for a bound that this step adds are allowed (rule 4 needs them);
    // everything else that runs must be unchanged.
    const added = isTest ? addedBoundTests(pb, pa) : [];
    const same = isTest ? shape(pb, true) === shape(pa, true) && added.every((t) => boundLinesAfter.has(t)) : shape(pb) === shape(pa);
    const textSame = fs.readFileSync(pb, 'utf8') === fs.readFileSync(pa, 'utf8');
    files.push({ file: f, same, textChanged: !textSame, ...(added.length ? { addedBoundTests: added } : {}) });
    if (!same) ok = false;
  }
  return { module: moduleId, same: ok, files };
}
