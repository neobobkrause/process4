// A stand-in for the tool's writer of uses files (design part 2, section 7, "Who uses what"), used only by the tool's
// own tests, the proof's replay among them, until the writer is in the tool. It writes each module's
// process/modules/<module>.uses.json in the writer's form from the module's code and tests, with the reader's checker:
// - a use: a name, a member read or filled, a member taken apart, a kind named in a comment, that the checker resolves
//   to a declaration in an interface file of an earlier module, recorded as the listing's item that holds it; an
//   operation or table named through a carrier (build text 2b, section 5) as `op:<name>` or `table:<name>` of the
//   module that lists it;
// - a place outside the standard (with its rule): a file of another module that is not one of its interface files (S5);
//   a program of another module started, or a file of another module named by a literal path (S6, S5); a value of
//   unknown kind (`any`) used as an object or called (R1), which may refer to any earlier module; an import of a
//   computed name (S2), likewise;
// - an order fault: a use of a later module.
// Places name the file, its side (code or test), the line, the function it is in, and for a test its case's name.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadTree } from '../lib/notice/model.mjs';
import { ts, loadReader, makeProgram, standardOptions, forEachNode } from '../lib/notice/ts.mjs';
import { makeLister } from '../lib/notice/listing.mjs';
import { carrierOf } from '../lib/notice/carriers.mjs';
import { usesFilePath } from '../lib/usesfile.mjs';

const TEST_CALLS = new Set(['test', 'it', 'describe', 'suite']);
const STARTS = new Set(['spawn', 'spawnSync', 'fork', 'exec', 'execFile', 'execSync', 'execFileSync', 'Worker']);

const made = new Map();
/**
 * A product's files (path -> text or JSON, as helpers.mjs writes them) with each module's uses file added, written by
 * the stand-in from those files: the files a product holds once every module's job has pushed.
 */
export function withUsesFiles(files) {
  const key = JSON.stringify(files);
  if (!made.has(key)) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-uses-standin-'));
    try {
      for (const [p, text] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
        fs.writeFileSync(path.join(dir, p), typeof text === 'string' ? text : `${JSON.stringify(text, null, 2)}\n`);
      }
      const cfg = loadTree(dir).cfg;
      made.set(key, Object.fromEntries(Object.entries(writeUsesFiles(dir)).map(([m, d]) => [usesFilePath(cfg, m), d])));
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  return { ...files, ...made.get(key) };
}

/** Writes every module's uses file in a product folder; returns them by module. */
export function writeUsesFiles(root) {
  loadReader();
  const tree = loadTree(root);
  const program = makeProgram(tree.allFiles, undefined, standardOptions());
  const checker = program.getTypeChecker();
  const lister = makeLister(program, tree);
  const listings = new Map(tree.modules.map((m) => [m.id, lister.list(m)]));
  const rel = (f) => path.relative(tree.root, f).split(path.sep).join('/');
  const entryOf = (moduleId, d) => {
    const f = d.getSourceFile().fileName, at = (d.name ?? d).end - 1;
    let best = null;
    for (const r of listings.get(moduleId)?.ranges ?? []) if (r.file === f && r.start <= at && at < r.end && (!best || r.end - r.start < best.end - best.start)) best = r;
    return best?.entry ?? null;
  };
  const out = {};
  for (const mod of tree.modules) {
    const uses = new Map(); // provider|item -> use
    const outside = [];
    const orderFaults = [];
    const seenOutside = new Set();
    const placeOf = (sf, n) => {
      const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
      const isTest = mod.tests.includes(sf.fileName);
      const w = { file: rel(sf.fileName), side: isTest ? 'test' : 'code', line };
      const names = [];
      let fn = null;
      for (let p = n.parent; p; p = p.parent) {
        if (!fn && (ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p)) && p.name) fn = p.name.getText(sf);
        if (ts.isCallExpression(p) && (ts.isIdentifier(p.expression) ? TEST_CALLS.has(p.expression.text) : ts.isPropertyAccessExpression(p.expression) && TEST_CALLS.has(p.expression.name.text))) {
          const a0 = p.arguments[0];
          if (a0 && (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0))) names.unshift(a0.text);
        }
      }
      if (fn) w.in = fn;
      if (isTest && names.length) w.test = names.join(' > ');
      return w;
    };
    const addUse = (provider, item, itemKind, type, w) => {
      const k = `${provider}|${item}`;
      if (!uses.has(k)) uses.set(k, { provider, item, itemKind, type, route: 'direct', standard: true, where: [] });
      const u = uses.get(k);
      if (!u.where.some((x) => x.file === w.file && x.line === w.line)) u.where.push(w);
    };
    const addOutside = (rule, w, mayRefer) => {
      const k = `${rule}|${w.file}|${w.line}|${mayRefer.join(',')}`;
      if (seenOutside.has(k)) return;
      seenOutside.add(k);
      outside.push({ rule, ...w, mayRefer, ...(w.test ? { tests: [w.test] } : {}) });
    };
    /** A declaration of another module reached from a place: a use, a place outside the standard, or an order fault. */
    const reached = (d, sf, n, type) => {
      if (!d || d.getSourceFile().isDeclarationFile) return;
      const owner = tree.moduleOfFile(d.getSourceFile().fileName);
      if (!owner || owner === mod.id) return;
      const o = tree.byId.get(owner);
      const w = placeOf(sf, n);
      if (o.index > mod.index) { orderFaults.push({ provider: owner, ...w }); return; }
      if (!o.public.includes(d.getSourceFile().fileName)) { addOutside('S5', w, [owner]); return; }
      const item = entryOf(owner, d);
      if (item) addUse(owner, item, listings.get(owner).entries[item]?.kind ?? null, type, w);
    };
    const resolve = (sym) => {
      if (sym && sym.flags & ts.SymbolFlags.Alias) { try { return checker.getAliasedSymbol(sym); } catch { return sym; } }
      return sym;
    };
    /**
     * A value handed where another module's kind is expected (an argument, a field of an object written in place): a use
     * of that kind, and of each member of a kind of handle, which the value fills.
     */
    const expected = (e, sf, given) => {
      let t = given;
      if (!t) try { t = checker.getContextualType(e); } catch { t = undefined; }
      if (!t) return;
      t = checker.getNonNullableType(t);
      for (const sym of [t.aliasSymbol, t.symbol]) {
        const d = sym?.declarations?.[0];
        if (!d || d.getSourceFile().isDeclarationFile) continue;
        const owner = tree.moduleOfFile(d.getSourceFile().fileName);
        if (!owner || owner === mod.id || tree.byId.get(owner).index > mod.index || !tree.byId.get(owner).public.includes(d.getSourceFile().fileName)) continue;
        const item = entryOf(owner, d);
        const l = listings.get(owner);
        if (!item || !['kind', 'handle kind'].includes(l.entries[item]?.kind)) continue;
        const w = placeOf(sf, e);
        addUse(owner, item, l.entries[item].kind, 'fills', w);
        if (l.entries[item].kind === 'handle kind') for (const m of l.entries[item].handsBack?.names ?? []) if (l.entries[`${item}.${m}`]) addUse(owner, `${item}.${m}`, 'method', 'fills', w);
        return;
      }
    };
    const ownerOfPath = (sf, text) => {
      if (!/^\.\.?\//.test(text)) return null;
      const abs = path.resolve(path.dirname(sf.fileName), text);
      const m = tree.moduleOfFile(abs);
      return m && m !== mod.id && fs.existsSync(abs) ? m : null;
    };
    for (const f of mod.files) {
      const sf = program.getSourceFile(f);
      if (!sf) continue;
      forEachNode(sf, (n) => {
        if (ts.isIdentifier(n)) {
          const p = n.parent;
          if (p && ts.isPropertyAccessExpression(p) && p.name === n) {
            reached(resolve(checker.getSymbolAtLocation(n))?.declarations?.[0], sf, n, 'read');
            return;
          }
          if (p && (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p)) && p.name === n && ts.isObjectLiteralExpression(p.parent)) {
            const ct = checker.getContextualType(p.parent);
            const ps = ct && checker.getPropertyOfType(ct, n.text);
            reached(ps?.declarations?.[0], sf, n, 'fills');
            if (ts.isShorthandPropertyAssignment(p)) reached(resolve(checker.getShorthandAssignmentValueSymbol(p))?.declarations?.[0], sf, n, 'read');
            return;
          }
          if (p && ts.isBindingElement(p) && (p.propertyName ?? p.name) === n && ts.isObjectBindingPattern(p.parent)) {
            const t = checker.getTypeAtLocation(p.parent);
            const ps = checker.getPropertyOfType(t, n.text);
            reached(ps?.declarations?.[0], sf, n, 'read');
            return;
          }
          // an import names the item; the places of its use are where the code uses it
          if (p && (ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p) || ts.isJSDocImportTag?.(p) || (p.parent && ts.isJSDocImportTag?.(p.parent)) || (p.parent?.parent && ts.isJSDocImportTag?.(p.parent.parent)))) return;
          const sym = resolve(checker.getSymbolAtLocation(n));
          for (const d of sym?.declarations ?? []) reached(d, sf, n, ts.isCallExpression(p) && p.expression === n ? 'call' : 'read');
          return;
        }
        if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && n.arguments) for (const a of n.arguments) expected(a, sf);
        if ((ts.isPropertyAssignment(n) && n.initializer) && ts.isObjectLiteralExpression(n.parent)) expected(n.initializer, sf);
        if (ts.isShorthandPropertyAssignment(n) && ts.isObjectLiteralExpression(n.parent)) {
          const ct = checker.getContextualType(n.parent);
          const ps = ct && checker.getPropertyOfType(ct, n.name.text);
          if (ps) expected(n.name, sf, checker.getTypeOfSymbol(ps));
        }
        if (ts.isCallExpression(n)) {
          let c;
          try { c = carrierOf(checker, n); } catch { c = undefined; }
          if (c) {
            if (c.names === null) addOutside('S7', placeOf(sf, n), ['*']);
            for (const name of c.names ?? []) {
              const key = `${c.kind === 'op' ? 'op' : 'table'}:${name}`;
              for (const m of tree.modules) if (m.index < mod.index && listings.get(m.id).entries[key]) addUse(m.id, key, listings.get(m.id).entries[key].kind, 'by-name', placeOf(sf, n));
            }
          }
          if (n.expression.kind === ts.SyntaxKind.ImportKeyword && !(n.arguments[0] && ts.isStringLiteral(n.arguments[0]))) addOutside('S2', placeOf(sf, n), ['*']);
          if (n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteral(n.arguments[0])) {
            const o = ownerOfPath(sf, n.arguments[0].text);
            if (o && !tree.byId.get(o).public.includes(path.resolve(path.dirname(sf.fileName), n.arguments[0].text))) addOutside('S5', placeOf(sf, n), [o]);
          }
          // a program of another module started directly (S6)
          const callee = ts.isIdentifier(n.expression) ? n.expression.text : ts.isPropertyAccessExpression(n.expression) ? n.expression.name.text : '';
          if (STARTS.has(callee)) {
            const refs = new Set();
            for (const a of n.arguments) forEachNode(a, (x) => { if (ts.isIdentifier(x)) { const d = resolve(checker.getSymbolAtLocation(x))?.declarations?.[0]; const o = d && tree.moduleOfFile(d.getSourceFile().fileName); if (o && o !== mod.id) refs.add(o); } });
            if (refs.size) addOutside('S6', placeOf(sf, n), [...refs]);
          }
          // another module's channel given a kind by a cast where it is decoded (R2)
          if (ts.isPropertyAccessExpression(n.expression) && n.expression.getText(sf) === 'JSON.parse') {
            let host = n.parent;
            while (host && ts.isParenthesizedExpression(host)) host = host.parent;
            const decl = host && ts.isVariableDeclaration(host) ? host : null;
            const tt = decl && ts.getJSDocType(decl.parent?.parent ?? decl);
            if (tt) forEachNode(tt, (x) => { if (ts.isIdentifier(x)) { const d = resolve(checker.getSymbolAtLocation(x))?.declarations?.[0]; const o = d && tree.moduleOfFile(d.getSourceFile().fileName); if (o && o !== mod.id) addOutside('R2', placeOf(sf, n), [o]); } });
          }
        }
        // a file of another module named by a literal path (S5)
        if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && !(n.parent && (ts.isImportDeclaration(n.parent) || ts.isExportDeclaration(n.parent) || ts.isLiteralTypeNode(n.parent) || ts.isJSDocImportTag?.(n.parent)))) {
          const o = ownerOfPath(sf, n.text);
          const isImport = n.parent && ts.isCallExpression(n.parent) && n.parent.expression.kind === ts.SyntaxKind.ImportKeyword;
          if (o && !isImport) addOutside('S5', placeOf(sf, n), [o]);
        }
        // a value of unknown kind used as an object or called (R1): it may be any earlier module's
        if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) && ts.isIdentifier(n.expression)) {
          const t = checker.getTypeAtLocation(n.expression);
          const d = checker.getSymbolAtLocation(n.expression)?.declarations?.[0];
          if (t.flags & ts.TypeFlags.Any && d && tree.moduleOfFile(d.getSourceFile().fileName) === mod.id && (ts.isParameter(d) || ts.isVariableDeclaration(d))) addOutside('R1', placeOf(sf, n), ['*']);
        }
        return true;
      }, { jsDoc: true });
    }
    const usesList = [...uses.values()].sort((a, b) => (a.provider + a.item < b.provider + b.item ? -1 : 1));
    const data = {
      module: mod.id,
      written: { commit: 'stand-in', tool: 'test/usesfile-standin.mjs' },
      providers: [...new Set(usesList.map((u) => u.provider))].sort((a, b) => tree.byId.get(a).index - tree.byId.get(b).index),
      uses: usesList,
      outside,
      orderFaults,
      copies: [],
    };
    const file = path.join(tree.root, usesFilePath(tree.cfg, mod.id));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    out[mod.id] = data;
  }
  return out;
}
