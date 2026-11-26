// The related list (design part 2, section 7, "Which tests relate"; build text 5, section 7): the test files of a told
// module that relate to its job, chosen by whole file, made with the reader on the merged result of the job's pull
// request. The places are those the told module's uses file names for the changed items its notices name (and the
// places the notices carry, where the uses file no longer names them). Reads files; runs nothing.
//
// A piece is a function, a method, or the top-level code of one file, among the files under the module's `files`
// and `tests`; a place belongs to the innermost piece that holds its line. Piece A calls piece B when A's code holds
// a call the reader resolves to B's declaration. A test file reaches B when a chain of calls leads from any of its
// pieces to B. Decided here, beyond the text: a function written in place inside a piece (a callback handed to a
// call) is reached from that piece, and importing a file reaches that file's top-level code, which runs on import.
import fs from 'node:fs';
import path from 'node:path';
import { loadTree } from './model.mjs';
import { ts, loadReader, makeProgram, options, forEachNode } from './ts.mjs';
import { fileSpecifier, git } from '../util.mjs';
import { readUses } from '../usesfile.mjs';
import { CODE, hunkRuns, tokensOf } from './running.mjs';

const WALK = /(^|\/)walk\/(internal|external)\//;
const isTestFile = (rel) => /\.test\.[^/]*$/.test(rel) && !WALK.test(rel);

export const RULES = {
  place: 'holds a place its uses file names for a changed item',
  reachesPlace: 'reaches a piece that holds a place its uses file names for a changed item',
  reachesChanged: 'reaches a piece with a line this pull request changed',
  changed: 'added or changed by this pull request',
  step1: 'lost the thread, step 1',
  step2: 'lost the thread, step 2: an import the reader cannot resolve',
  step3: 'the whole module',
};

/**
 * Hunks of `git diff -U0` per file (new-side paths): [{ os, oc, ns, nc, runs }]. `runs` is false for a hunk whose change
 * is comments or layout only (running.mjs): such a line is not a changed line. Every hunk is kept, for mapLine.
 */
function hunks(gitRoot, base, after) {
  const out = new Map();
  let file = null;
  for (const l of git(['diff', '-U0', '--no-renames', '--no-color', base, after], { cwd: gitRoot }).split('\n')) {
    if (l.startsWith('+++ ')) { file = l === '+++ /dev/null' ? null : l.slice(6); if (file && !out.has(file)) out.set(file, []); continue; }
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(l);
    if (m && file) out.get(file).push({ os: +m[1], oc: m[2] === undefined ? 1 : +m[2], ns: +m[3], nc: m[4] === undefined ? 1 : +m[4] });
  }
  for (const [f, hs] of out) {
    const at = (c) => { const r = git(['show', `${c}:${f}`], { cwd: gitRoot, allowFail: true }); return r.code === 0 ? tokensOf(f, r.stdout) : null; };
    const was = CODE.test(f) ? at(base) : null, now = was ? at(after) : null;
    for (const h of hs) h.runs = hunkRuns(f, was, now, h);
  }
  return out;
}

/** The lines of the merged result a hunk changed, comments and layout aside; a deletion counts as the line where it was. */
const changedLines = (hs) => hs.filter((h) => h.runs).flatMap((h) => (h.nc ? Array.from({ length: h.nc }, (_, i) => h.ns + i) : [Math.max(h.ns, 1)]));

/** A line of the base, where it stands in the merged result (a changed line: where its hunk now starts). */
function mapLine(hs, line) {
  let shift = 0;
  for (const h of hs) {
    const oEnd = h.oc ? h.os + h.oc - 1 : h.os;
    if (h.oc && line >= h.os && line <= oEnd) return Math.max(h.ns, 1);
    if (line > oEnd) shift += h.nc - h.oc;
  }
  return line + shift;
}

const isPiece = (n) => (ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n)
  || ts.isConstructorDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n)) && !!n.body;

/**
 * @param o.dir the merged result, written out (process.json at its top)
 * @param o.gitRoot a repository holding the commits `base` and `after`
 * @param o.base the base of the pull request (the merge's first parent)
 * @param o.after the merged result's commit
 * @param o.module the told module
 * @param o.uses the job block's `uses`
 * @returns {{ whole: boolean, files: { file: string, reasons: string[] }[], leftOut: string[] }}
 */
export function relatedList({ dir, gitRoot, base, after, module, uses = [] }) {
  loadReader();
  const tree = loadTree(dir);
  const mod = tree.byId.get(module);
  if (!mod) throw new Error(`no module is named ${module}`);
  const rel = (f) => path.relative(tree.root, f).split(path.sep).join('/');
  const tests = mod.tests.map(rel).filter(isTestFile).sort();
  const reasons = new Map(tests.map((t) => [t, new Set()]));
  const give = (t, r) => reasons.get(t)?.add(r);
  const result = () => {
    const files = tests.filter((t) => reasons.get(t).size).map((t) => ({ file: t, reasons: [...reasons.get(t)] }));
    return { whole: files.length === tests.length && tests.length > 0, files, leftOut: tests.filter((t) => !reasons.get(t).size) };
  };

  // The whole module: where the module has no uses file yet, or a reason says its whole tests run (a module told with
  // no uses file, a notice too large for the job block), or a reason names no item the tool can look up.
  const usesFile = readUses(tree.root, module, { cfg: tree.cfg });
  const whole = !usesFile || typeof usesFile !== 'object' ? [`${module} has no uses file yet`]
    : uses.filter((u) => u.noUsesFile || u.whole || !(u.item || u.outside || u.orderFault)).map((u) => (u.noUsesFile || u.whole ? String(u.noUsesFile || u.whole) : `a reason from ${u.module ?? 'a provider'} that names no item`));
  if (whole.length) {
    for (const t of tests) for (const w of whole) give(t, `${RULES.step3}: ${w}`);
    return result();
  }

  const diff = hunks(gitRoot, base, after);
  const own = new Set(mod.files.map(rel));
  for (const t of tests) if ((diff.get(t) ?? []).some((h) => h.runs)) give(t, RULES.changed);

  const program = makeProgram(mod.files);
  const checker = program.getTypeChecker();
  const sfs = mod.files.map((f) => program.getSourceFile(f)).filter(Boolean);
  const lineOf = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

  // Pieces: one top for each file, and each function-like node with a body.
  const tops = new Map(); // rel file -> top piece
  const pieces = []; // { id, file, node, start, end }
  const byNode = new Map();
  for (const sf of sfs) {
    const f = rel(sf.fileName);
    const top = { id: f, file: f, node: sf, start: 1, end: lineOf(sf, sf.end), top: true };
    tops.set(f, top); pieces.push(top); byNode.set(sf, top);
    const visit = (n) => {
      if (isPiece(n)) { const p = { id: `${f}:${lineOf(sf, n.getStart(sf))}`, file: f, node: n, start: lineOf(sf, n.getStart(sf)), end: lineOf(sf, n.end) }; pieces.push(p); byNode.set(n, p); }
    };
    forEachNode(sf, visit);
  }
  const pieceOfNode = (n) => { for (let p = n; p; p = p.parent) if (byNode.has(p)) return byNode.get(p); return null; };
  const pieceAt = (f, line) => {
    let best = tops.get(f) ?? null;
    for (const p of pieces) if (!p.top && p.file === f && p.start <= line && line <= p.end && (best.top || p.end - p.start < best.end - best.start)) best = p;
    return best;
  };

  // Calls: A -> B. Also a piece -> each piece written inside it, and a file's top -> the top of each file it imports.
  const edges = new Map(pieces.map((p) => [p, new Set()]));
  const resolveImport = (spec, from) => ts.resolveModuleName(fileSpecifier(spec), from, options(), ts.sys).resolvedModule?.resolvedFileName ?? null;
  const imports = new Map(); // rel file -> rel files of the module it imports (or null where unresolved)
  const unresolved = new Map(); // rel file -> [spec]
  const declPiece = (d) => {
    if (!d || !own.has(rel(d.getSourceFile().fileName))) return null;
    if (byNode.has(d)) return byNode.get(d);
    const init = (ts.isVariableDeclaration(d) || ts.isPropertyAssignment(d)) ? d.initializer : null;
    if (init && byNode.has(init)) return byNode.get(init);
    if (ts.isClassDeclaration(d) || ts.isClassExpression(d)) { const c = d.members.find((m) => ts.isConstructorDeclaration(m) && m.body); return c ? byNode.get(c) : tops.get(rel(d.getSourceFile().fileName)); }
    return null;
  };
  const namedAsValue = new Map(); // piece -> where it is named other than in a resolved call
  const noteValue = (p, where) => { if (p && !p.top) { if (!namedAsValue.has(p)) namedAsValue.set(p, where); } };
  for (const sf of sfs) {
    const f = rel(sf.fileName);
    imports.set(f, new Set());
    const addImport = (spec, node) => {
      if (!spec.startsWith('.') && !spec.startsWith('/')) return; // from outside the product
      const target = resolveImport(spec, sf.fileName);
      if (!target || !fs.existsSync(target)) { if (!unresolved.has(f)) unresolved.set(f, []); unresolved.get(f).push(`${spec} at ${f}:${lineOf(sf, node.getStart(sf))}`); return; }
      const t = rel(target);
      imports.get(f).add(t);
      if (tops.has(t)) edges.get(tops.get(f)).add(tops.get(t));
    };
    const visit = (n) => {
      if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) addImport(n.moduleSpecifier.text, n);
      if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const a0 = n.arguments[0];
        if (a0 && (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0))) addImport(a0.text, n);
        else { if (!unresolved.has(f)) unresolved.set(f, []); unresolved.get(f).push(`import() of a computed name at ${f}:${lineOf(sf, n.getStart(sf))}`); }
      }
      // A function written in place (a callback handed to a call, or run at once) is reached from the piece around it.
      // One that is declared, or kept in a variable, a class or an object, is reached only by calls (or step 1).
      if (isPiece(n) && !isNamedPiece(n)) { const outer = pieceOfNode(n.parent); if (outer) edges.get(outer).add(byNode.get(n)); }
      if ((ts.isCallExpression(n) && n.expression.kind !== ts.SyntaxKind.ImportKeyword) || ts.isNewExpression(n)) {
        let sig;
        try { sig = checker.getResolvedSignature(n); } catch { sig = undefined; }
        let target = declPiece(sig?.declaration);
        if (!target) {
          let s = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(n.expression) ? n.expression.name : n.expression);
          if (s && s.flags & ts.SymbolFlags.Alias) { try { s = checker.getAliasedSymbol(s); } catch { s = undefined; } }
          target = declPiece(s?.valueDeclaration ?? s?.declarations?.[0]);
        }
        const from = pieceOfNode(n);
        if (target && from) edges.get(from).add(target);
      }
      // Kept in a table: a function written as a member of an object.
      if ((ts.isMethodDeclaration(n) && ts.isObjectLiteralExpression(n.parent)) || (ts.isPropertyAssignment(n) && n.initializer && byNode.has(n.initializer))) {
        noteValue(byNode.get(ts.isMethodDeclaration(n) ? n : n.initializer), `kept in an object at ${f}:${lineOf(sf, n.getStart(sf))}`);
      }
      // Named other than in a call the reader resolves: handed on as a value, kept in a variable or a table.
      if (ts.isIdentifier(n) && !isCallee(n) && !isDeclName(n) && !isImportExportName(n)) {
        let s = ts.isShorthandPropertyAssignment(n.parent) ? checker.getShorthandAssignmentValueSymbol(n.parent) : checker.getSymbolAtLocation(n);
        if (s && s.flags & ts.SymbolFlags.Alias) { try { s = checker.getAliasedSymbol(s); } catch { s = undefined; } }
        for (const d of s?.declarations ?? []) noteValue(declPiece(d), `named at ${f}:${lineOf(sf, n.getStart(sf))}`);
      }
    };
    forEachNode(sf, (n) => { visit(n); });
  }

  // Targets: pieces holding a place the uses file names for a changed item (as written for the merged result); where it
  // names none for a reason, the places the reason carries (read in the base, carried to the merged result); and pieces
  // holding a line this pull request changed.
  const placeTargets = new Set(), changedTargets = new Set();
  const named = (c, used) => used === c || used.startsWith(`${c}.`) || used.startsWith(`${c}#`);
  const target = (file, line) => { if (!own.has(file)) return; const p = pieceAt(file, line); if (p) placeTargets.add(p); };
  for (const u of uses) {
    const items = u.item ? [u.item] : [];
    const now = items.length ? (Array.isArray(usesFile.uses) ? usesFile.uses : []).filter((x) => x && x.provider === u.module && typeof x.item === 'string' && items.some((c) => named(c, x.item))).flatMap((x) => (Array.isArray(x.where) ? x.where : [])) : [];
    if (now.length) { for (const w of now) target(w.file, Number(w.line) || 1); continue; }
    // a place of a reason, `<file>:<line> <function or test>`
    for (const at of u.places ?? []) {
      const m = /^(\S+?):(\d+)(?:\s|$)/.exec(String(at));
      if (m) target(m[1], mapLine(diff.get(m[1]) ?? [], Number(m[2])));
    }
  }
  // A changed test file is in the list for itself; its own changed lines are not counted again.
  for (const [f, hs] of diff) if (own.has(f) && !tests.includes(f)) for (const line of changedLines(hs)) { const p = pieceAt(f, line); if (p) changedTargets.add(p); }

  // Who reaches them: the pieces from which a chain of calls leads to a target.
  const back = new Map(pieces.map((p) => [p, new Set()]));
  for (const [a, bs] of edges) for (const b of bs) back.get(b).add(a);
  const reaching = (targets) => {
    const seen = new Set(targets);
    const q = [...targets];
    while (q.length) for (const a of back.get(q.pop())) if (!seen.has(a)) { seen.add(a); q.push(a); }
    return seen;
  };
  const rp = reaching(placeTargets), rc = reaching(changedTargets);
  for (const t of tests) {
    const mine = pieces.filter((p) => p.file === t);
    if (mine.some((p) => placeTargets.has(p))) give(t, RULES.place);
    else if (mine.some((p) => rp.has(p))) give(t, RULES.reachesPlace);
    if (mine.some((p) => rc.has(p))) give(t, RULES.reachesChanged);
  }

  // Step 1: a piece the list needs (a target, or one that reaches it) named other than in a resolved call: every
  // test file whose imports, followed from file to file, lead to its file counts as reaching it.
  const closure = (f) => {
    const seen = new Set([f]);
    const q = [f];
    while (q.length) for (const g of imports.get(q.pop()) ?? []) if (!seen.has(g)) { seen.add(g); q.push(g); }
    return seen;
  };
  const leads = new Map(tests.map((t) => [t, closure(t)]));
  for (const p of new Set([...rp, ...rc])) {
    const where = namedAsValue.get(p);
    if (!where) continue;
    for (const t of tests) if (leads.get(t).has(p.file) && !pieces.some((x) => x.file === t && (rp.has(x) || rc.has(x)))) give(t, `${RULES.step1}: its imports lead to ${p.file}, whose piece at line ${p.start} is ${where}`);
  }
  // Step 2: a test file with an import the reader cannot resolve.
  for (const t of tests) if (unresolved.has(t)) give(t, `${RULES.step2}: ${unresolved.get(t).join(', ')}`);
  return result();
}

function isNamedPiece(n) {
  if (ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isConstructorDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n)) return true;
  let p = n.parent;
  while (p && ts.isParenthesizedExpression(p)) p = p.parent;
  return !!p && (ts.isVariableDeclaration(p) || ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isBinaryExpression(p) || ts.isExportAssignment(p));
}
function isCallee(n) {
  let e = n;
  if (e.parent && ts.isPropertyAccessExpression(e.parent) && e.parent.name === e) e = e.parent;
  return !!e.parent && (ts.isCallExpression(e.parent) || ts.isNewExpression(e.parent)) && e.parent.expression === e;
}
function isDeclName(n) {
  const p = n.parent;
  return !!p && p.name === n && (ts.isFunctionDeclaration(p) || ts.isVariableDeclaration(p) || ts.isMethodDeclaration(p) || ts.isPropertyAssignment(p)
    || ts.isClassDeclaration(p) || ts.isParameter(p) || ts.isPropertyDeclaration(p) || ts.isFunctionExpression(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p));
}
function isImportExportName(n) {
  for (let p = n.parent; p; p = p.parent) {
    if (ts.isImportDeclaration(p) || ts.isExportSpecifier(p) || ts.isExportDeclaration(p)) return true;
    if (p.kind >= ts.SyntaxKind.FirstJSDocNode && p.kind <= ts.SyntaxKind.LastJSDocNode) return true;
    if (ts.isStatement(p)) return false;
  }
  return false;
}
