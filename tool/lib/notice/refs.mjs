// Who uses what (design part 2, section 7): every reference of one module's code and tests to another module's items,
// read under the coding standard (build text 2, section 10: S1 to S13, R1 to R22 with R19 in place of R9, and the type
// checker's settings), and every place that breaks the standard, with its rule. One program: the module's files, with
// the strict settings and the host description of ts.mjs's makeStandardProgram; the providers' interface files are what
// the module reaches. The uses file (usesfile.mjs) is written from what this returns. Nothing here refuses anything.
//
// A reference is found three ways (every-reference §1):
//   by name: an import, a namespace member, a type in a comment, `extends`, a member read, call or write;
//   by channel: a file, program or worker reached by a path the tool evaluates, a name carried through a door's table,
//     a module named in mock.module, a marked copy;
//   by type: the result of a call, each side of a conversion (an argument, a return, an initializer or assignment with
//     a stated kind, a cast, a field of an object written in place), a value handed to a reflective read, and the
//     members the language calls by itself (toString, valueOf, then, toJSON, Symbol.iterator, Symbol.hasInstance).
// Each is named by the provider's listing (listing.mjs) and attributed to the item that holds its declaration.
// A use of a kind, a handle kind or a class also says what it does with the value (`value`): wherever a value of such a
// kind stands, in code or tests, the place is a read of one named member of it, the whole value, or neither (the value
// goes on under a name of the module's own, or into an expression judged where it stands); anything the walk cannot
// prove to be a member or neither is the whole value.
import fs from 'node:fs';
import { isBuiltin } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ts, loadReader, makeStandardProgram, forEachNode, lineOf, tagsOf, tagText } from './ts.mjs';
import { makeLister } from './listing.mjs';
import { carrierOf } from './carriers.mjs';
import { isTestCall } from './check.mjs';
import { handCopies, makeResolver, readFacilities, readUses, sideOf, UNRESOLVED_WAIT } from '../usesfile.mjs';
import { underPath } from '../util.mjs';

let HOST_FACILITIES = null;
/** The tool's classification of Node's facilities (facilities-build.mjs): name -> 'in' | 'out'. */
export function hostFacilities() {
  if (!HOST_FACILITIES) {
    const d = JSON.parse(fs.readFileSync(fileURLToPath(new URL('./facilities.json', import.meta.url)), 'utf8'));
    HOST_FACILITIES = new Map([...d.in.map((n) => [n, 'in']), ...(d.tests ?? []).map((n) => [n, 'tests']), ...d.out.map((n) => [n, 'out'])]);
  }
  return HOST_FACILITIES;
}

/** The host whose facilities the tool describes (notice/facilities.json pins Node): the package of a host facility. */
export const HOST = 'node';
const TOOL_ROOT = fileURLToPath(new URL('../../', import.meta.url));
/** The package a specifier names (`pg`, `@scope/x` from `@scope/x/sub`); a name of Node's own modules is the host's. */
export function packageName(spec) {
  if (/^node:/.test(spec)) return HOST;
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}
/** workerd, the other host a product runs on: its facilities are described by this package's declarations. */
export const WORKERD = 'workerd';
const WORKERD_TYPES = '@cloudflare/workers-types';
/** A specifier that names a module of the host: Node's own (`node:fs`, `fs`) or workerd's (`cloudflare:sockets`). */
export const isHostModule = (spec) => /^(node|cloudflare):/.test(spec) || isBuiltin(spec);
/** A declaration in the language's own library (TypeScript's lib files), not in a description of Node or workerd. */
const isLanguageFile = (f) => /\/typescript\/lib\/lib\.[^/]*\.d\.ts$/.test(f.split(path.sep).join('/'));
/**
 * Whether a facility the tool reads is Node's or workerd's, not the language's: its package is the host, and its
 * declaration is not in the language's library. A use of one the tool's classification leaves out is a note on a host
 * facility the tool does not know (build text 2c, "The uses file"): `uses` prints it; the uses file does not keep it.
 */
export function isHostFacility(sym, pkg = packageOf(sym)) {
  if (pkg === WORKERD) return true;
  if (pkg !== HOST) return false;
  const f = sym?.declarations?.[0]?.getSourceFile().fileName ?? '';
  return !!f && !isLanguageFile(f);
}
/**
 * The package that gives a facility, by where its declaration is (build text 2c, "Facilities": the tool classifies the
 * host's, ARCH the packages'): the language's library and the tool's own description of the host (both under the
 * tool's folder) and @types/node, the host (`node`); @cloudflare/workers-types, `workerd`; under any other node_modules
 * folder, that package, from the path after the last node_modules/ (`@a/b` for a scoped one; its @types package for one
 * without its own types). A declaration in the product's own files, or none at all (a member a kind operator such as
 * Record makes), is no facility: null.
 */
export function packageOf(sym) {
  const f = (sym?.declarations?.[0]?.getSourceFile().fileName ?? '').split(path.sep).join('/');
  if (!f) return null;
  if (f.startsWith(TOOL_ROOT.split(path.sep).join('/'))) return HOST;
  const at = f.lastIndexOf('/node_modules/');
  if (at < 0) return null;
  let name = packageName(f.slice(at + '/node_modules/'.length));
  if (name === WORKERD_TYPES) return WORKERD;
  if (name.startsWith('@types/')) { name = name.slice(7); name = name.includes('__') ? `@${name.replace('__', '/')}` : name; }
  return name === 'node' ? HOST : name;
}

/**
 * A facility's qualified name, as the tool's classification and the facility list name it: the host's by its qualified
 * declaration, a module's name without its quotes (node:fs.readFileSync); a package's as `package:Export.member`
 * (pg:Client.query), the path to the package's file left out, so the name is the same on every machine. A member of an
 * unnamed kind is named by the declaration the kind is written in (console.log, node:crypto.createHash.update).
 * Shared by refs.mjs and facilities-build.mjs, so a use and the classification name a facility alike.
 */
export function qualifiedName(checker, sym, pkg = packageOf(sym)) {
  const fq = (s) => checker.getFullyQualifiedName(s);
  let name = fq(sym);
  if (/^__type\./.test(name)) {
    const trail = [sym.name];
    for (let p = sym.declarations?.[0]?.parent; p; p = p.parent) {
      if (ts.isTypeNode(p) || ts.isParameter(p) || ts.isTypeParameterDeclaration(p)) continue;
      const s = p.symbol ?? (p.name && checker.getSymbolAtLocation(p.name));
      if (!s) break;
      const n = fq(s);
      if (/^__type(\.|$)/.test(n)) { trail.unshift(s.name); continue; }
      name = `${n}.${trail.join('.')}`;
      break;
    }
  }
  name = name.replace(/^global\./, '');
  if (pkg && pkg !== HOST) name = `${pkg}:${name.replace(/^"[^"]*"\.?/, '')}`;
  return name;
}

/** Every module earlier than the one read: "may refer to any of them". */
export const ANY = '*';
/** The checker's codes for a name of Node's (or Bun's) it has no description of: "Cannot find name 'process'. Do you
 * need to install type definitions for node?". */
const HOST_NAMES = new Set([2580, 2591, 2867, 2868]);
/** "Module '"x"' has no exported member 'y'" (with or without a suggestion). */
const NO_EXPORT = new Set([2305, 2614, 2724]);
/** "Property 'y' does not exist on type 'X'" (with or without a suggestion). */
const NO_MEMBER = new Set([2339, 2551]);

const PROTOCOL = ['then', 'toJSON', 'valueOf', 'toString', 'constructor'];
const PRIMITIVE = ['toString', 'valueOf'];
const ERROR_ASSERTIONS = new Set(['throws', 'rejects', 'doesNotThrow', 'doesNotReject']);
const HOOKS = new Set(['before', 'after', 'beforeEach', 'afterEach']);
/** Facilities that are never on a facility list (study-references §1.5), each with the rule it breaks. */
const NEVER = new Map([
  ['SymbolConstructor.for', 'S8'], ['SymbolConstructor.keyFor', 'S8'], ['eval', 'S9'], ['Function', 'S9'],
  ['FunctionConstructor', 'S9'], ['Object.constructor', 'S9'], ['"node:vm"', 'S9'], ['"node:module".register', 'S2'],
  ['"node:module".registerHooks', 'S2'], ['ErrorConstructor.prepareStackTrace', 'R14'], ['ErrorConstructor.stackTraceLimit', 'R14'],
  ['"node:inspector"', 'R14'], ['BufferConstructor.allocUnsafe', 'R14'], ['BufferConstructor.allocUnsafeSlow', 'R14'],
]);
const REGEXP_STATIC = /^RegExpConstructor\.(\$\d|\$_|input|lastMatch|lastParen|leftContext|rightContext|\$&|\$\+|\$`|\$')$/;
/**
 * The rule a facility that is never on any list breaks (study-references.md 1.5), or null: by its qualified name, a
 * module's name with or without its quotes. The tool's classification (facilities-build.mjs) leaves these out.
 */
export function neverRule(name) {
  const q = name.replace(/^(node:[^.]+)/, '"$1"');
  for (const n of [name, q]) {
    if (NEVER.has(n)) return NEVER.get(n);
    if (REGEXP_STATIC.test(n)) return 'S8';
    const k = [...NEVER.keys()].find((x) => n.startsWith(`${x}.`));
    if (k) return NEVER.get(k);
  }
  return null;
}
/** Named process-wide channels (S8). */
const CHANNELS = new Set(['"node:diagnostics_channel".channel', '"node:worker_threads".BroadcastChannel', '"node:worker_threads".setEnvironmentData', '"node:worker_threads".getEnvironmentData', 'NodeProcess.on', 'NodeProcess.once', 'NodeProcess.emit']);
/** Activity a module's evaluation must not start (R21), and what a test may not rely on (R22). */
const STARTS = /^(setTimeout|setInterval|setImmediate|NodeProcess\.on|NodeProcess\.once|"node:worker_threads"\.Worker|"node:child_process"\..*|"node:fs"\..*|"node:fs\/promises"\..*|fetch|.*\.listen|.*\.on)$/;
const TIMERS = new Set(['setTimeout', 'setInterval', 'setImmediate']);
const REFLECT_WRITES = new Set(['ObjectConstructor.assign', 'ObjectConstructor.defineProperty', 'ObjectConstructor.defineProperties', 'ObjectConstructor.setPrototypeOf', 'Reflect.set', 'Reflect.defineProperty', 'Reflect.setPrototypeOf', 'Reflect.deleteProperty']);
const REFLECT_READS = new Set(['ObjectConstructor.keys', 'ObjectConstructor.values', 'ObjectConstructor.entries', 'ObjectConstructor.assign', 'JSON.stringify', 'structuredClone', 'StringConstructor', 'ObjectConstructor.fromEntries']);
const WIDENS = new Set(['ObjectConstructor.values', 'ObjectConstructor.entries', 'ObjectConstructor.assign']);
/** Host facilities whose arguments name files, programs, workers or modules (S2, S5, S6), and which arguments. */
const FS = /^"node:fs(\/promises)?"\.(\w+)$/;
const TWO_PATHS = new Set(['renameSync', 'copyFileSync', 'rename', 'copyFile', 'cp', 'cpSync', 'linkSync', 'symlinkSync']);
const PROGRAMS = /^"node:child_process"\.(spawn|spawnSync|execFile|execFileSync|fork|exec|execSync)$/;
const WILD = '\u0000';
/** An item's kind in the uses file's words (build text 2c): the listing's kinds of plain data are types. */
const itemKind = (k) => (k === 'kind' ? 'type' : k === 'handle kind' ? 'handle type' : k ?? 'item');
/** The items whose uses say what of the value they use (build text 2c, the uses file's `value`): kinds of plain data,
 * handle kinds and classes. */
const KIND_ITEMS = new Set(['type', 'handle type', 'class']);
/** Uses of such an item that name it or hold its value under a name, using no member of it: each use of the value is
 * listed apart, where the value stands (the value's walk below). */
const NAMING = new Set(['import', 'type named', 're-export', 'receive', 'construct']);
/** Members of a list, a map, a set or a promise that hand on its contents, without using them, to where they are
 * read apart: the result of the access, or a function written in place whose parameters take them. */
const HOLDER_MEMBERS = new Set(['length', 'size', 'at', 'get', 'has', 'keys', 'values', 'entries', 'slice', 'pop', 'shift', 'reverse', 'toReversed']);
const CALLBACK_MEMBERS = new Set(['map', 'filter', 'find', 'findLast', 'findIndex', 'findLastIndex', 'some', 'every', 'forEach', 'flatMap', 'reduce', 'reduceRight', 'then', 'catch', 'finally', 'sort', 'toSorted']);

/**
 * @param tree the product (model.mjs)
 * @param moduleId the module read
 * @param opts { facilities: the facility list (default: the product's, usesfile.mjs readFacilities) }
 * @returns {{ module, providers, uses, outside, orderFaults, copies, marked, candidates, facilities }}
 */
export function readReferences(tree, moduleId, opts = {}) {
  loadReader();
  const mod = tree.byId.get(moduleId);
  if (!mod) throw new Error(`no such module: ${moduleId}`);
  const facilityList = opts.facilities !== undefined ? opts.facilities : readFacilities(tree);
  const rel = (f) => path.relative(tree.root, f).split(path.sep).join('/');
  const indexOf = (id) => tree.byId.get(id)?.index ?? Infinity;
  const text = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };

  // The program: the module's files; the interface files of every module that answers an operation or owns a table,
  // so that a name carried through a door finds its module; then the interface files of every module reached.
  const tableFiles = tree.modules.filter((m) => m.id !== mod.id).flatMap((m) => m.public.filter((f) => /@(optable|storedrows)\b/.test(text(f))));
  let program = makeStandardProgram([...mod.files, ...tableFiles]);
  const reached = new Set();
  for (const sf of program.getSourceFiles()) { const m = sf.isDeclarationFile ? null : tree.moduleOfFile(sf.fileName); if (m && m !== mod.id) reached.add(m); }
  const extra = [...reached].flatMap((m) => tree.byId.get(m).public).filter((f) => !program.getSourceFile(f));
  if (extra.length) program = makeStandardProgram([...mod.files, ...tableFiles, ...extra], program);
  const checker = program.getTypeChecker();
  const files = mod.files.map((f) => program.getSourceFile(f)).filter(Boolean);
  // The checker's complaints, read before anything is written out (listing.mjs writes declarations out).
  const complaints = new Map(files.map((sf) => [sf, [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)]]));

  // ---- the providers' listings: an item is named as its module's listing names it ----
  const lister = makeLister(program, tree);
  const listings = new Map();
  const listingOf = (m) => { if (!listings.has(m)) listings.set(m, lister.list(tree.byId.get(m))); return listings.get(m); };
  const entries = new Map();
  /** The item a declaration of another product module belongs to: the smallest listed range that holds it. */
  function entryOf(decl) {
    if (entries.has(decl)) return entries.get(decl);
    let out = null;
    const sf = decl.getSourceFile();
    const m = tree.moduleOfFile(sf.fileName);
    if (m && m !== mod.id && ts.isSourceFile(decl)) {
      // the module object itself (import * as W, import()): named by its members where they are read
      out = { module: m, item: '*', kind: 'module', listed: tree.byId.get(m).public.includes(sf.fileName), decl };
    } else if (m && m !== mod.id) {
      const l = sf.isDeclarationFile ? null : listingOf(m);
      // located by its name, so a kind is not mistaken for its last member; a kind written in place, by its start
      const at = decl.name ? decl.name.end - 1 : decl.getStart(sf);
      let best = null;
      for (const r of l?.ranges ?? []) if (r.file === sf.fileName && r.start <= at && at < r.end && (!best || r.end - r.start < best.end - best.start)) best = r;
      if (best) out = { module: m, item: best.entry, kind: itemKind(l.entries[best.entry]?.kind), listed: true, decl };
      else out = { module: m, item: `${rel(sf.fileName)}:${nameOf(decl)}`, kind: sf.isDeclarationFile ? 'declaration file' : 'not in the interface', listed: false, decl };
    }
    entries.set(decl, out);
    return out;
  }
  const nameOf = (d) => (d.name && (ts.isIdentifier(d.name) || ts.isStringLiteral(d.name) || ts.isPrivateIdentifier(d.name)) ? d.name.text : d.name?.getText?.() ?? (ts.isSourceFile(d) ? '*' : '(unnamed)'));
  const isHostFile = (sf) => sf.isDeclarationFile && !tree.moduleOfFile(sf.fileName);
  const resolve = (sym) => { if (sym && sym.flags & ts.SymbolFlags.Alias) { try { return checker.getAliasedSymbol(sym); } catch { return undefined; } } return sym; };

  // ---- places: file, side, line; for code the function it is in, for tests each test case's full name ----
  const testIndexes = new Map();
  function testIndex(sf) {
    if (testIndexes.has(sf)) return testIndexes.get(sf);
    const calls = new Map();
    const idx = { calls, leaves: [] };
    testIndexes.set(sf, idx);
    const unnamed = [];
    forEachNode(sf, (n) => {
      if (!isTestCall(n) || HOOKS.has(calleeName(n))) return;
      const a0 = n.arguments[0];
      let parent = null;
      for (let p = n.parent; p; p = p.parent) if (calls.has(p)) { parent = calls.get(p); break; }
      const written = a0 && (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0)) ? a0.text : null;
      if (written === null) unnamed.push(n);
      const name = written ?? `<name not written out, line ${lineOf(n)}>`;
      calls.set(n, { node: n, name, full: parent ? `${parent.full} > ${name}` : name, suite: /^(describe|suite)$/.test(calleeName(n)), parent });
    });
    idx.leaves = [...calls.values()].filter((c) => !c.suite);
    // S12: a test's name is written out, so a place can name it
    for (const n of unnamed) place('S12', n, { what: 'a test whose name is not written out', mayRefer: [], waitsOn: 'this module: a written-out name' });
    return idx;
  }
  const calleeName = (call) => (ts.isIdentifier(call.expression) ? call.expression.text : ts.isPropertyAccessExpression(call.expression) ? call.expression.name.text : '');
  const isNamedFunction = (p) => ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p)
    || ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && p.parent && (ts.isVariableDeclaration(p.parent) || ts.isPropertyAssignment(p.parent)));
  // Every reference, in the module's test files, to each function declared there: who calls a helper.
  let helperRefs = null;
  function refsToHelpers() {
    if (helperRefs) return helperRefs;
    helperRefs = new Map();
    for (const sf of files) {
      if (!mod.tests.includes(sf.fileName)) continue;
      forEachNode(sf, (n) => {
        if (!ts.isIdentifier(n)) return;
        const s = resolve(checker.getSymbolAtLocation(n));
        const d = s?.valueDeclaration;
        if (!d || d.name === n || !mod.tests.includes(d.getSourceFile().fileName)) return;
        if (!helperRefs.has(s)) helperRefs.set(s, []);
        helperRefs.get(s).push(n);
      });
    }
    return helperRefs;
  }
  const fnTests = new Map();
  function testsOfFunction(fn) {
    if (fnTests.has(fn)) return fnTests.get(fn);
    fnTests.set(fn, []);
    const holder = ts.isFunctionDeclaration(fn) || ts.isMethodDeclaration(fn) ? fn : fn.parent;
    const sym = holder?.name ? checker.getSymbolAtLocation(holder.name) : undefined;
    const out = new Set();
    for (const r of (sym && refsToHelpers().get(sym)) ?? []) for (const t of testsAt(r)) out.add(t);
    fnTests.set(fn, [...out]);
    return fnTests.get(fn);
  }
  function testsAt(node) {
    const sf = node.getSourceFile();
    const idx = testIndex(sf);
    for (let p = node.parent; p; p = p.parent) {
      const t = idx.calls.get(p);
      if (t) return t.suite ? idx.leaves.filter((l) => { for (let q = l.parent; q; q = q.parent) if (q === t) return true; return false; }).map((l) => l.full) : [t.full];
      if (isNamedFunction(p)) {
        let inTest = false;
        for (let q = p.parent; q; q = q.parent) if (idx.calls.has(q)) { inTest = true; break; }
        if (!inTest) return testsOfFunction(p);
      }
    }
    return idx.leaves.map((l) => l.full);
  }
  function enclosing(node) {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isFunctionDeclaration(p) && p.name) return p.name.text;
      if ((ts.isMethodDeclaration(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p)) && p.name) {
        const cls = p.parent && (ts.isClassDeclaration(p.parent) || ts.isClassExpression(p.parent)) && p.parent.name ? `${p.parent.name.text}.` : '';
        return `${cls}${p.name.getText()}`;
      }
      if (ts.isConstructorDeclaration(p)) return `${p.parent?.name?.text ?? 'class'}.constructor`;
      if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && p.parent) {
        if (ts.isVariableDeclaration(p.parent) && ts.isIdentifier(p.parent.name)) return p.parent.name.text;
        if (ts.isPropertyAssignment(p.parent)) return p.parent.name.getText();
      }
    }
    return '(top level)';
  }
  /** The places of one node: one for code; one for each test case that holds it or calls a helper that does. */
  function wheres(node) {
    const sf = node.getSourceFile();
    const file = rel(sf.fileName);
    const line = lineOf(node);
    if (!mod.tests.includes(sf.fileName)) return [{ file, side: 'code', line, in: enclosing(node) }];
    const tests = testsAt(node);
    return tests.length ? tests.map((test) => ({ file, side: 'test', line, test })) : [{ file, side: 'test', line, in: enclosing(node) }];
  }

  // ---- what is collected ----
  const uses = new Map();
  const orderFaults = new Map();
  const outside = new Map();
  const copies = new Map();
  const inventory = new Map(); // facility -> the package that gives it (the host: node)
  const routeKey = (r) => (r === 'direct' ? 'direct' : `${r.via}:${r.item}`);
  /**
   * @param mark for a use of a kind, a handle kind or a class (KIND_ITEMS): `{ value: 'member', member }` (it reads or
   *   writes that one member), `{ value: 'whole' }` or `{ value: 'handed back' }` (the value itself), `{ value: 'none' }`
   *   (it names the kind or holds the value under a name whose every use is listed apart); by default by its type
   */
  function addUse(e, node, type, route = 'direct', mark = undefined) {
    if (!e || e.module === mod.id) return;
    if (!e.listed && e.kind === 'not in the interface') {
      place('S5', node, { what: `refers to ${e.item}, which is not in ${e.module}'s interface files`, mayRefer: [e.module], waitsOn: `${e.module}: the item in its interface files` });
    }
    for (const w of wheres(node)) addUseAt(e, w, type, route, mark);
  }
  /** One use at one place; a use of a later module is an order fault (design part 2, section 1). */
  function addUseAt(e, w, type, route = 'direct', mark = undefined) {
    if (!e || e.module === mod.id) return;
    if (route !== 'direct' && (route.via === e.module || route.via === mod.id)) route = 'direct';
    if (indexOf(e.module) > mod.index) {
      const k = `${e.module}|${e.item}|${type}|${w.file}|${w.line}|${w.test ?? ''}`;
      if (!orderFaults.has(k)) orderFaults.set(k, { provider: e.module, item: e.item, itemKind: e.kind, type, ...w });
      return;
    }
    const m = KIND_ITEMS.has(e.kind) && e.listed ? mark ?? { value: NAMING.has(type) ? 'none' : 'whole' } : null;
    const k = `${e.module}|${e.item}|${type}|${routeKey(route)}|${m ? `${m.value}|${m.member ?? ''}` : ''}`;
    if (!uses.has(k)) uses.set(k, { provider: e.module, item: e.item, itemKind: e.kind, type, route, standard: e.listed, ...(m ? { value: m.value, ...(m.member !== undefined ? { member: m.member } : {}) } : {}), where: new Map() });
    uses.get(k).where.set(`${w.file}|${w.line}|${w.test ?? w.in}`, w);
  }
  /** A place outside the standard. mayRefer: the modules it may refer to ([] none, [ANY] every earlier module). */
  // `unknownHost`: a note that stands only because the tool's description or classification of Node or workerd lacks
  // a facility the code uses; printed by `uses`, never kept in the uses file (usescmd.mjs).
  // An R14 place refers to no product module (R14 is only about facilities of Node, workerd, the language or a
  // package): none, unless it says otherwise (a name the tool could not resolve, which may be the product's own).
  function place(rule, node, { what, mayRefer = rule === 'R14' ? [] : [ANY], waitsOn = 'this module', item, relabels, unknownHost = false } = {}) {
    const sf = node.getSourceFile();
    const file = rel(sf.fileName);
    const line = lineOf(node);
    const k = `${rule}|${file}|${line}|${what}`;
    const side = mod.tests.includes(sf.fileName) ? 'test' : 'code';
    const mayR = [...new Set(mayRefer)].filter((m) => m !== mod.id);
    const old = outside.get(k);
    if (old) { old.mayRefer = [...new Set([...old.mayRefer, ...mayR])]; return; }
    outside.set(k, { rule, file, side, line, what, ...(item ? { item } : {}), ...(relabels ? { relabels } : {}), mayRefer: mayR.includes(ANY) ? [ANY] : mayR, waitsOn, tests: side === 'test' ? testsAt(node) : [], ...(unknownHost ? { unknownHost } : {}) });
  }
  const modulesOf = (decls) => [...new Set(decls.map((d) => entryOf(d)?.module).filter(Boolean))];

  // ---- kinds ----
  const isObj = (t) => !!(t.flags & ts.TypeFlags.Object);
  /** The declarations of other product modules a kind is made of: its name, its parts, its items, its signatures. */
  function kindDecls(t, depth = 0, out = [], seen = new Set()) {
    if (!t || depth > 3 || seen.has(t)) return out;
    seen.add(t);
    for (const s of [t.aliasSymbol, t.symbol]) for (const d of s?.declarations ?? []) if (entryOf(d)) out.push(d);
    if (t.flags & ts.TypeFlags.UnionOrIntersection) for (const u of t.types) kindDecls(u, depth + 1, out, seen);
    if (isObj(t) && t.objectFlags & ts.ObjectFlags.Reference) for (const a of checker.getTypeArguments(t) ?? []) kindDecls(a, depth + 1, out, seen);
    for (const a of t.aliasTypeArguments ?? []) kindDecls(a, depth + 1, out, seen);
    if (isObj(t) && depth < 2) for (const sig of [...t.getCallSignatures(), ...t.getConstructSignatures()]) {
      kindDecls(checker.getReturnTypeOfSignature(sig), depth + 1, out, seen);
      for (const p of sig.getParameters()) kindDecls(checker.getTypeOfSymbol(p), depth + 1, out, seen);
    }
    return out;
  }
  const hasFlag = (flag) => function has(t, depth = 0) {
    if (!t || depth > 3) return false;
    if (t.flags & flag) return true;
    if (t.flags & ts.TypeFlags.UnionOrIntersection) return t.types.some((u) => has(u, depth + 1));
    if (isObj(t) && t.objectFlags & ts.ObjectFlags.Reference) return (checker.getTypeArguments(t) ?? []).some((a) => has(a, depth + 1));
    return false;
  };
  const hasAny = hasFlag(ts.TypeFlags.Any);
  const hasUnknown = hasFlag(ts.TypeFlags.Unknown);
  const typeAt = (n) => { try { return checker.getTypeAtLocation(n); } catch { return undefined; } };
  const isOwnKind = (t) => [t.aliasSymbol, t.symbol].some((s) => (s?.declarations ?? []).some((d) => tree.moduleOfFile(d.getSourceFile().fileName) === mod.id && !d.getSourceFile().isDeclarationFile));
  const hostDeclared = (t) => [t.aliasSymbol, t.symbol].some((s) => (s?.declarations ?? []).some((d) => isHostFile(d.getSourceFile())));
  const productKind = (t) => kindDecls(t).length > 0 || isOwnKind(t);

  // ---- the host's facilities (R14): every use named by its qualified declaration ----
  function facilityName(sym) {
    if (!sym) return null;
    let s = sym;
    const d = s.declarations?.[0];
    // a member written `typeof f` stands for f itself
    if (d && ts.isPropertySignature(d) && d.type && ts.isTypeQueryNode(d.type)) { const q = resolve(checker.getSymbolAtLocation(d.type.exprName)); if (q) s = q; }
    return qualifiedName(checker, s);
  }
  /** A facility as the facility list names it: a module's name without its quotes (node:fs.readFileSync). */
  const listName = (name) => name.replace(/^"([^"]+)"/, '$1');
  /** Whether a facility stays in the process ('in') or reaches out ('out'): by the tool's classification of the host's
   * facilities (facilities.json beside this file), else by the product's facility list (its packages); null where neither
   * classifies it (build text 2c, "Facilities"). */
  const reachOf = (name) => hostFacilities().get(listName(name)) ?? facilityList?.reach?.get(listName(name)) ?? null;
  const boundaryModules = facilityList?.boundary ?? new Set();
  const isBoundaryModule = boundaryModules.has(mod.id);
  function facility(node, sym, { write = false } = {}) {
    // the product's own member (of a kind the product writes, or one a kind operator makes) is no facility
    const pkg = packageOf(sym);
    if (!pkg) return null;
    let name = facilityName(sym);
    if (!name) return null;
    // the clock: Date() called, or new Date() with no argument (ECMA-262 21.4.2.1)
    const par = node.parent;
    if (name === 'Date' && par && par.expression === node && (ts.isCallExpression(par) || (ts.isNewExpression(par) && !(par.arguments?.length)))) name = 'Date()';
    const shown = listName(name);
    inventory.set(shown, pkg);
    const never = neverRule(name);
    if (never) place(never, node, { what: `uses ${shown}, which no product may use`, waitsOn: 'this module' });
    else if (write) place('R14', node, { what: `writes ${shown}, a member ${pkg === HOST || pkg === WORKERD ? 'the host' : pkg} declares` });
    else if (reachOf(name) === 'tests') { if (!mod.tests.includes(node.getSourceFile().fileName)) place('R14', node, { what: `uses ${shown}, the test runner's, outside the module's tests`, waitsOn: 'this module' }); }
    // the host's facilities are the tool's to classify, a package's are ARCH's (build text 2c, "Facilities")
    else if (!reachOf(name) && (pkg === HOST || pkg === WORKERD)) place('R14', node, { what: `uses ${shown}, a facility of the host the tool's classification leaves out`, waitsOn: 'this module', unknownHost: isHostFacility(sym, pkg) });
    else if (!reachOf(name)) place('R14', node, { what: `uses ${shown}, a facility of ${pkg} the facility list does not name`, waitsOn: 'ARCH: the facility list' });
    else if (reachOf(name) === 'out' && !isBoundaryModule) place('R14', node, { what: `uses ${shown}, which reaches out, outside a boundary module`, waitsOn: 'ARCH: a boundary module for it' });
    return name;
  }
  const calleeFacility = (call) => {
    const e = ts.isCallExpression(call) || ts.isNewExpression(call) ? call.expression : null;
    if (!e) return null;
    let s = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    s = resolve(s);
    const d = s?.declarations?.[0];
    return d && isHostFile(d.getSourceFile()) ? facilityName(s) : null;
  };

  // ---- evaluating a path, URL or name the tool can work out exactly (S5, S6; study-references §1.6) ----
  const fileUrl = (f) => pathToFileURL(f).href;
  function evaluate(e, file, depth = 0) {
    if (!e || depth > 8) return null;
    const cross = (parts) => {
      let acc = [''];
      for (const p of parts) { if (!p) return null; acc = acc.flatMap((a) => p.map((b) => a + b)); if (acc.length > 32) return null; }
      return acc;
    };
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression?.(e) || ts.isNonNullExpression(e)) return evaluate(e.expression, file, depth + 1);
    if (ts.isTemplateExpression(e)) return cross([[e.head.text], ...e.templateSpans.flatMap((s) => [evaluate(s.expression, file, depth + 1), [s.literal.text]])]);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) return cross([evaluate(e.left, file, depth + 1), evaluate(e.right, file, depth + 1)]);
    if (ts.isConditionalExpression(e)) { const a = evaluate(e.whenTrue, file, depth + 1), b = evaluate(e.whenFalse, file, depth + 1); return a && b ? [...a, ...b] : null; }
    if (ts.isPropertyAccessExpression(e)) {
      if (ts.isMetaProperty(e.expression) && e.expression.keywordToken === ts.SyntaxKind.ImportKeyword) {
        if (e.name.text === 'url') return [fileUrl(file)];
        if (e.name.text === 'dirname') return [path.dirname(file)];
        if (e.name.text === 'filename') return [file];
        return null;
      }
      if (ts.isIdentifier(e.expression) && e.expression.text === 'process' && e.name.text === 'execPath') return ['<node>'];
      if (e.name.text === 'href') return evaluate(e.expression, file, depth + 1);
      if (e.name.text === 'pathname') { const v = evaluate(e.expression, file, depth + 1); return v && v.map((x) => (x.startsWith('file://') ? fileURLToPath(x.replace(/\u0000/g, '%00')).replace(/%00/g, WILD) : x)); }
      return null;
    }
    if (ts.isIdentifier(e)) {
      if (e.text === '__dirname') return [path.dirname(file)];
      if (e.text === '__filename') return [file];
      const s = resolve(checker.getSymbolAtLocation(e));
      const d = s?.valueDeclaration;
      if (d && ts.isVariableDeclaration(d) && d.initializer && d.parent && d.parent.flags & ts.NodeFlags.Const && !d.getSourceFile().isDeclarationFile) return evaluate(d.initializer, d.getSourceFile().fileName, depth + 1);
      return literalUnion(typeAt(e));
    }
    if (ts.isCallExpression(e)) {
      const f = calleeFacility(e);
      const args = e.arguments.map((a) => evaluate(a, file, depth + 1));
      const one = (fn) => (args[0] ? args[0].map(fn) : null);
      if (f === '"node:path".join' || f === '"node:path".resolve') return combinePaths(args, f.endsWith('resolve'));
      if (f === '"node:path".dirname') return one((x) => path.posix.dirname(x));
      if (f === '"node:path".basename') return args[0] ? one((x) => path.posix.basename(x)) : [WILD];
      if (f === '"node:path".normalize') return one((x) => path.posix.normalize(x));
      if (f === '"node:url".fileURLToPath') return args[0]?.every((x) => x.startsWith('file://')) ? one((x) => fileURLToPath(x.replace(/\u0000/g, '%00')).replace(/%00/g, WILD)) : null;
      if (f === '"node:url".pathToFileURL') return args[0]?.every((x) => x.startsWith('/')) ? one((x) => fileUrl(x)) : null;
      if (f === 'ImportMeta.resolve' && e.arguments[0] && ts.isStringLiteral(e.arguments[0])) {
        const target = resolver.resolve(e.arguments[0].text, file);
        return target ? [fileUrl(target)] : null;
      }
      if (f === 'StringConstructor' || (ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'toString' && !e.arguments.length)) return evaluate(ts.isPropertyAccessExpression(e.expression) && !e.arguments.length ? e.expression.expression : e.arguments[0], file, depth + 1);
      // a function of the module's own with no arguments whose body hands back one expression
      const s = resolve(checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e.expression) ? e.expression.name : e.expression));
      const d = s?.valueDeclaration;
      const fn = d && (ts.isFunctionDeclaration(d) ? d : ts.isVariableDeclaration(d) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) ? d.initializer : null);
      if (fn && !e.arguments.length && tree.moduleOfFile(fn.getSourceFile().fileName) === mod.id) {
        const body = fn.body && ts.isBlock(fn.body) ? (fn.body.statements.length === 1 && ts.isReturnStatement(fn.body.statements[0]) ? fn.body.statements[0].expression : null) : fn.body;
        return body ? evaluate(body, fn.getSourceFile().fileName, depth + 1) : null;
      }
      return null;
    }
    if (ts.isNewExpression(e) && calleeFacility(e) === 'URL') {
      const [a, b] = (e.arguments ?? []).map((x) => evaluate(x, file, depth + 1));
      if (!a || (e.arguments.length > 1 && !b)) return null;
      const out = [];
      for (const x of a) for (const y of b ?? [null]) {
        try { out.push(new URL(x.replaceAll(WILD, '%00'), y ?? undefined).href.replaceAll('%00', WILD)); } catch { return null; }
      }
      return out;
    }
    return null;
  }
  function literalUnion(t) {
    if (!t) return null;
    const parts = t.flags & ts.TypeFlags.Union ? t.types : [t];
    return parts.every((p) => p.flags & ts.TypeFlags.StringLiteral) ? parts.map((p) => p.value) : null;
  }
  function combinePaths(args, isResolve) {
    let acc = [''];
    for (const a of args) {
      if (!a) return null;
      acc = acc.flatMap((x) => a.map((y) => (isResolve && y.startsWith('/') ? y : x ? path.posix.join(x, y) : y)));
      if (acc.length > 32) return null;
    }
    return acc.map((x) => path.posix.normalize(x));
  }
  /** The modules whose folders a path in the product names: its owner, or every module under a folder it names. */
  function ownersOfPath(abs) {
    const r = path.relative(tree.root, abs).split(path.sep).join('/');
    if (r.startsWith('..') || path.isAbsolute(r)) return null; // outside the product
    const cut = r.indexOf(WILD);
    const fixed = cut < 0 ? r : r.slice(0, cut).replace(/[^/]*$/, '');
    const owners = new Set();
    let best = null, len = -1;
    for (const m of tree.modules) for (const p of [...(m.entry.files ?? []), ...(m.entry.tests ?? [])]) {
      if ((underPath(fixed, p) || fixed === p.replace(/\/$/, '')) && p.length > len) { best = m.id; len = p.length; }
      if (fixed === '' || underPath(p, fixed.endsWith('/') ? fixed : `${fixed}/`)) owners.add(m.id);
    }
    if (best) owners.add(best);
    return owners;
  }
  /** What a path argument names: 'own', 'outside', or the other modules; 'cwd' for a relative one; null if not worked out. */
  function classifyPath(values) {
    if (!values) return { unknown: true };
    const others = new Set();
    let cwd = false;
    for (const v of values) {
      if (v === '<node>') continue;
      let p = v;
      if (v.startsWith('file://')) p = fileURLToPath(v.replaceAll(WILD, '%00')).replaceAll('%00', WILD);
      else if (/^[a-z][a-z+.-]*:/i.test(v)) continue; // another scheme: not a file
      if (!p.startsWith('/')) {
        cwd = true;
        const o = ownersOfPath(path.join(tree.root, p));
        for (const m of o ?? []) others.add(m);
        continue;
      }
      for (const m of ownersOfPath(p) ?? []) others.add(m);
    }
    others.delete(mod.id);
    return { cwd, others: [...others] };
  }
  /** A path, program or worker argument: a place unless it names only the module's own folders or outside the product. */
  function pathArgument(rule, arg, node, what) {
    if (!arg) return;
    if (isReaderResult(arg)) return;
    const c = classifyPath(evaluate(arg, arg.getSourceFile().fileName));
    if (c.unknown) {
      const fromCaller = isBoundaryModule && fromExportParam(arg);
      place(fromCaller ? 'R15' : rule, node, { what: fromCaller ? `${what} taken from a caller of an export of this boundary module` : `${what} that the tool cannot work out`, waitsOn: 'this module: a path anchored to its own folder, or the owner\'s reader' });
    } else if (c.cwd) place(rule, node, { what: `${what} relative to the working directory`, mayRefer: c.others.length ? c.others : [ANY], waitsOn: 'this module: a path anchored to its own folder' });
    else if (c.others.length) place(rule, node, { what: `${what} into ${c.others.join(', ')}'s folder`, mayRefer: c.others, waitsOn: `${c.others.join(', ')}: an exported reader or accessor` });
  }
  /** The result of another module's exported function: an owner's reader (a reference, found by name). */
  function isReaderResult(e) {
    while (ts.isParenthesizedExpression(e) || ts.isAwaitExpression(e)) e = e.expression;
    if (!ts.isCallExpression(e)) return false;
    const s = resolve(checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e.expression) ? e.expression.name : e.expression));
    return (s?.declarations ?? []).some((d) => entryOf(d)?.listed);
  }
  function fromExportParam(e) {
    const ids = [];
    forEachNode(e, (n) => { if (ts.isIdentifier(n)) ids.push(n); });
    return ids.some((id) => { const d = checker.getSymbolAtLocation(id)?.valueDeclaration; return d && ts.isParameter(d); });
  }

  // ---- origins: whether a value comes from the module's own channel (R2), and through which middle module (route) ----
  function ownChannel(e, depth = 0) {
    if (!e || depth > 6) return false;
    while (ts.isParenthesizedExpression(e) || ts.isAwaitExpression(e) || ts.isNonNullExpression(e)) e = e.expression;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e) || ts.isNumericLiteral(e) || ts.isObjectLiteralExpression(e) || ts.isArrayLiteralExpression(e)) return true;
    if (ts.isCallExpression(e)) {
      const f = calleeFacility(e);
      if (f === 'JSON.parse') return ownChannel(e.arguments[0], depth + 1);
      if (f && FS.test(f)) { const c = classifyPath(evaluate(e.arguments[0], e.getSourceFile().fileName)); return !c.unknown && !c.cwd && !c.others.length; }
      // rows of a shared table the module itself owns (@storedrows), named through the store's carrier
      const c = carrierOf(checker, e);
      if (c?.kind === 'table' && c.names?.length) return c.names.every((t) => ownTables().has(t));
      // a list's own methods hand back what the list holds
      if (ts.isPropertyAccessExpression(e.expression) && checker.isArrayType(typeAt(e.expression.expression) ?? { flags: 0 })) return ownChannel(e.expression.expression, depth + 1);
      return false;
    }
    if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) return ownChannel(e.expression, depth + 1);
    if (ts.isIdentifier(e)) {
      const d = checker.getSymbolAtLocation(e)?.valueDeclaration;
      if (d && ts.isVariableDeclaration(d) && d.initializer && d.parent.flags & ts.NodeFlags.Const) return ownChannel(d.initializer, depth + 1);
      if (d && ts.isParameter(d)) {
        const fn = d.parent;
        // the unknown parameter of the module's own exported validator
        if (isExported(fn) && tree.moduleOfFile(fn.getSourceFile().fileName) === mod.id) return true;
        // the parameter of the module's own guard (`v is T`, R3): its origin is judged at each call
        const sig = ts.isFunctionLike(fn) && tree.moduleOfFile(fn.getSourceFile().fileName) === mod.id ? checker.getSignatureFromDeclaration(fn) : undefined;
        if (sig && checker.getTypePredicateOfSignature(sig)) return true;
        // an element handed to a callback of a list's own method (rows.map((r) => ...))
        const call = fn.parent;
        if (call && ts.isCallExpression(call) && call.arguments.includes(fn) && ts.isPropertyAccessExpression(call.expression) && checker.isArrayType(typeAt(call.expression.expression) ?? { flags: 0 })) return ownChannel(call.expression.expression, depth + 1);
      }
    }
    return false;
  }
  let ownTableNames = null;
  const ownTables = () => (ownTableNames ??= new Set(mod.public.some((f) => program.getSourceFile(f)) ? Object.keys(listingOf(mod.id).entries).filter((k) => k.startsWith('table:')).map((k) => k.slice(6)) : []));
  function isExported(fn) {
    let n = fn;
    if ((ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && n.parent && ts.isVariableDeclaration(n.parent)) n = n.parent.parent?.parent;
    return !!n && !!(ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Export);
  }
  function viaOf(e, provider, depth = 0) {
    if (!e || depth > 6) return 'direct';
    while (ts.isParenthesizedExpression(e) || ts.isAwaitExpression(e) || ts.isNonNullExpression(e)) e = e.expression;
    const from = (sym) => {
      for (const d of resolve(sym)?.declarations ?? []) { const x = entryOf(d); if (x && x.module !== provider) return { via: x.module, item: x.item }; }
      return null;
    };
    if (ts.isCallExpression(e) || ts.isNewExpression(e)) {
      const callee = ts.isPropertyAccessExpression(e.expression) ? e.expression.name : e.expression;
      return from(checker.getSymbolAtLocation(callee)) ?? (ts.isPropertyAccessExpression(e.expression) ? viaOf(e.expression.expression, provider, depth + 1) : 'direct');
    }
    if (ts.isPropertyAccessExpression(e)) return from(checker.getSymbolAtLocation(e.name)) ?? viaOf(e.expression, provider, depth + 1);
    if (ts.isElementAccessExpression(e)) return viaOf(e.expression, provider, depth + 1);
    if (ts.isIdentifier(e)) {
      const sym = checker.getSymbolAtLocation(e);
      if (sym && sym.flags & ts.SymbolFlags.Alias) {
        // a name imported through a middle module that hands it on (a re-export)
        const spec = sym.declarations?.[0];
        let imp = spec; while (imp && !ts.isImportDeclaration(imp)) imp = imp.parent;
        const file = imp && checker.getSymbolAtLocation(imp.moduleSpecifier)?.valueDeclaration?.getSourceFile?.().fileName;
        const q = file && tree.moduleOfFile(file);
        if (q && q !== provider && q !== mod.id) return { via: q, item: spec.propertyName?.text ?? spec.name?.text ?? '*' };
        return from(sym) ?? 'direct';
      }
      const d = sym?.valueDeclaration;
      if (d && ts.isVariableDeclaration(d) && d.initializer) return viaOf(d.initializer, provider, depth + 1);
      if (d && ts.isBindingElement(d)) { let h = d.parent; while (h && !ts.isVariableDeclaration(h)) h = h.parent; if (h?.initializer) return viaOf(h.initializer, provider, depth + 1); }
    }
    return 'direct';
  }

  // ---- conversions (R5, R6, R7, R11, R15, R16, R17): the tool relates both kinds itself, member by member ----
  /** A value written in place, which no other module holds; an object written with another module's value spread
   * into it is not (its hidden members come along, R17). */
  const isFresh = (e) => {
    while (e && ts.isParenthesizedExpression(e)) e = e.expression;
    if (e && ts.isObjectLiteralExpression(e)) return !e.properties.some((p) => ts.isSpreadAssignment(p) && !isFresh(p.expression) && productKind(typeAt(p.expression) ?? { flags: 0 }));
    return !!e && (ts.isArrayLiteralExpression(e) || ts.isArrowFunction(e) || ts.isFunctionExpression(e));
  };
  const assignable = (a, b) => { try { return checker.isTypeAssignableTo(a, b); } catch { return true; } };
  const readonlyProp = (p) => !!(p.checkFlags & 8) || (p.declarations ?? []).some((d) => (ts.getCombinedModifierFlags(d) & ts.ModifierFlags.Readonly) || ts.getJSDocReadonlyTag?.(d));
  const isMethod = (p) => (p.declarations ?? []).some((d) => ts.isMethodSignature(d) || ts.isMethodDeclaration(d));
  const isReadonlyArray = (t) => ['ReadonlyArray'].includes(t.symbol?.name) || !!(checker.isTupleType(t) && t.target?.readonly);
  /**
   * One conversion (the sites are in process/research/uses-metadata-25nov/conversion-sites.md): the source side is used
   * as `source` says (handed on, stored, or converted), the target side as a conversion; then, unless only checked
   * (satisfies), the tool's own relation member by member, over each member of a union.
   */
  function relate(S, T, e, node, how, { source = 'conversion', check = true } = {}) {
    if (!S || !T || S === T) return;
    const sd = kindDecls(S), td = kindDecls(T);
    // a union is involved by its members, whether the product names it (an alias) or spells it out
    const ownIn = (t) => isOwnKind(t) || !!(t.flags & ts.TypeFlags.Union && t.types.some(isOwnKind));
    const involved = sd.length || td.length || ownIn(S) || ownIn(T);
    if (!involved) return;
    // R11: both sides of the conversion
    const route = viaOf(e, null);
    const mark = fnMark(S, T, e);
    for (const d of sd) addUse(entryOf(d), node, source, route.via === entryOf(d).module ? 'direct' : route, mark(entryOf(d)));
    for (const d of td) addUse(entryOf(d), node, 'conversion', 'direct', mark(entryOf(d)));
    // a value handed to a slot of kind unknown, object, {} or any: every member it has is read
    if (T.flags & (ts.TypeFlags.Unknown | ts.TypeFlags.Any) || (isObj(T) && !checker.getPropertiesOfType(T).length && !T.getCallSignatures().length)) {
      for (const p of isObj(S) ? checker.getPropertiesOfType(S) : []) for (const d of p.declarations ?? []) addUse(entryOf(d), node, 'read', route);
    }
    // S4: a value of another module's kind given a kind this module writes itself, a copy of it under another name
    // (never `@typedef {Amount} Price`, which is the provider's kind): the copy's readers read the provider's kind
    // through it, so the place names both (`relabels`), and they hear of its changes too (notice.mjs)
    const ownAlias = isObj(T) && T.aliasSymbol && (T.aliasSymbol.declarations ?? []).some((d) => tree.moduleOfFile(d.getSourceFile().fileName) === mod.id && !d.getSourceFile().isDeclarationFile) ? T.aliasSymbol : null;
    const original = ownAlias && isObj(S) ? [S.aliasSymbol, S.symbol].flatMap((x) => x?.declarations ?? []).map(entryOf).find((x) => x?.listed && KIND_ITEMS.has(x.kind)) : null;
    if (original) {
      place('S4', node, { what: `${how}: ${original.module}'s ${original.item} relabelled as this module's own kind ${ownAlias.name}`, mayRefer: [original.module],
        waitsOn: `this module: ${ownAlias.name} written as ${original.module}'s kind`, item: ownAlias.name, relabels: { provider: original.module, item: original.item } });
    }
    // a union is converted member by member: each of its kinds to the kind of the target it stands in for
    const ss = S.flags & ts.TypeFlags.Union ? S.types : [S];
    const tt = T.flags & ts.TypeFlags.Union ? T.types.filter(isObj) : [T];
    // R15: a value the host declares, given a kind the product declares. Judged by the kind of the target the value
    // stands in for, never by the target's name: a union written as a product's alias or spelled out, by any route (an
    // argument, a member, `| undefined` of an optional member), reads alike; a host kind inside it (a list) is no relabelling.
    for (const s of ss) {
      if (!isObj(s) || !hostDeclared(s) || kindDecls(s).length) continue;
      const fits = tt.filter((x) => assignable(s, x));
      const into = fits.length ? fits : tt.length === 1 ? tt : [];
      if (into.length && !into.some(hostDeclared) && into.some((x) => kindDecls(x).length || isOwnKind(x))) {
        place('R15', node, { what: `${how}: gives ${checker.typeToString(s)}, which the host declares, a kind the product declares`, mayRefer: [ANY] });
        break;
      }
    }
    if (!check) return;
    for (const s of ss) {
      const t = tt.length === 1 ? tt[0] : tt.find((x) => assignable(s, x));
      if (t) structure(s, t, ss.length > 1 ? null : e, node, how, 0);
    }
  }
  function structure(S, T, e, node, how, depth) {
    if (depth > 2 || !isObj(S) || !isObj(T) || S === T) return;
    const fresh = depth === 0 && isFresh(e);
    // R7: a function with more parameters than the one expected
    const ss = S.getCallSignatures(), tsigs = T.getCallSignatures();
    // a generic signature is related by the checker's own instantiation (R20 keeps generic kinds to those it relates)
    if (ss.some((x) => x.typeParameters?.length) || tsigs.some((x) => x.typeParameters?.length)) return;
    if (ss.length && tsigs.length) {
      const sp = ss[0].getParameters().length, tp = Math.max(...tsigs.map((x) => x.getParameters().length));
      const restT = tsigs.some((x) => x.getParameters().some((p) => p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken));
      if (sp > tp && !restT) place('R7', node, { what: `${how}: a function of ${sp} parameters where ${tp} are expected`, mayRefer: [ANY] });
      // R5: parameters taken contravariantly
      const ps = ss[0].getParameters(), pt = tsigs[0].getParameters();
      for (let i = 0; i < Math.min(ps.length, pt.length); i++) {
        const a = checker.getTypeOfSymbol(pt[i]), b = checker.getTypeOfSymbol(ps[i]);
        if (!assignable(a, b) && (kindDecls(a).length || kindDecls(b).length)) place('R5', node, { what: `${how}: parameter ${i + 1} accepts ${checker.typeToString(b)} where ${checker.typeToString(a)} may be handed in`, mayRefer: [ANY] });
      }
      return;
    }
    // R6: writable list elements are invariant
    if (checker.isArrayType(S) && checker.isArrayType(T) && !isReadonlyArray(T)) {
      const a = checker.getTypeArguments(S)[0], b = checker.getTypeArguments(T)[0];
      if (a && b && a !== b && !(assignable(a, b) && assignable(b, a)) && !fresh) place('R6', node, { what: `${how}: a list of ${checker.typeToString(a)} given the writable kind ${checker.typeToString(T)}`, mayRefer: [ANY] });
      return;
    }
    if (checker.isArrayType(S) || checker.isArrayType(T) || checker.isTupleType(S)) return;
    // R17: no conversion to a kind with an index signature from one without, and no protocol member dropped
    if (checker.getIndexInfosOfType(T).length && !checker.getIndexInfosOfType(S).length && !fresh && checker.getPropertiesOfType(S).length && productKind(S)) {
      place('R17', node, { what: `${how}: ${checker.typeToString(S)} given a kind with an index signature`, mayRefer: [ANY] });
    }
    for (const p of checker.getPropertiesOfType(S)) {
      const protocol = PROTOCOL.includes(p.name) || p.escapedName.startsWith('__@');
      if (protocol && !checker.getPropertyOfType(T, p.name) && (p.declarations ?? []).some((d) => entryOf(d) || tree.moduleOfFile(d.getSourceFile().fileName) === mod.id)) {
        place('R17', node, { what: `${how}: drops ${p.name}, which the language calls by itself`, mayRefer: [ANY] });
      }
    }
    for (const tp of checker.getPropertiesOfType(T)) {
      const sp = checker.getPropertyOfType(S, tp.name);
      if (!sp) {
        // R6: no widening into an optional member the source may hold
        if (tp.flags & ts.SymbolFlags.Optional && !fresh) place('R6', node, { what: `${how}: optional member ${tp.name} that ${checker.typeToString(S)} may hold under another kind`, mayRefer: [ANY] });
        continue;
      }
      const a = checker.getTypeOfSymbol(sp), b = checker.getTypeOfSymbol(tp);
      if (isMethod(tp) || isMethod(sp)) { structure(a, b, null, node, `${how}, member ${tp.name}`, depth + 1); continue; }
      if (!readonlyProp(tp)) {
        if (readonlyProp(sp) && !fresh) place('R6', node, { what: `${how}: member ${tp.name} is read-only in ${checker.typeToString(S)} and writable in ${checker.typeToString(T)}`, mayRefer: [ANY] });
        else if (a !== b && !fresh && assignable(a, b) && !assignable(b, a) && (kindDecls(a).length || kindDecls(b).length)) place('R6', node, { what: `${how}: writable member ${tp.name} of ${checker.typeToString(a)} given ${checker.typeToString(b)}`, mayRefer: [ANY] });
      }
      if (a.getCallSignatures().length && b.getCallSignatures().length) structure(a, b, null, node, `${how}, member ${tp.name}`, depth + 1);
      else if (!fresh) structure(a, b, null, node, `${how}, member ${tp.name}`, depth + 1);
    }
  }
  /** The conversion of an expression to the kind expected where it stands. */
  function conversionAt(e, how, source = 'conversion') {
    let T;
    try { T = checker.getContextualType(e); } catch { T = undefined; }
    if (!T) return;
    relate(typeAt(e), T, e, e, how, { source });
  }

  // ---- implicitly invoked members (R11) ----
  function implicit(t, names, node) {
    if (!t) return;
    for (const u of t.flags & ts.TypeFlags.Union ? t.types : [t]) {
      if (!isObj(u)) continue;
      for (const p of checker.getPropertiesOfType(u)) {
        if (!names.some((n) => (n.startsWith('__@') ? p.escapedName.startsWith(n) : p.name === n))) continue;
        for (const d of p.declarations ?? []) addUse(entryOf(d), node, names.includes('__@iterator') ? 'iterate' : 'implicit member');
      }
    }
  }

  // ---- kinds held by a value: what of the value a place uses (a member, the whole value, or neither) ----
  const callableOnly = (t) => isObj(t) && (t.getCallSignatures().length > 0 || t.getConstructSignatures().length > 0) && !checker.getPropertiesOfType(t).some((p) => p.name !== 'prototype');
  /** The top of a kind's own declaration: a typedef, a type alias, a class, or the kind written in place as its whole body. */
  const isKindDecl = (d) => ts.isJSDocTypedefTag(d) || ts.isTypeAliasDeclaration(d) || ts.isClassDeclaration(d) || ts.isClassExpression(d) || ts.isInterfaceDeclaration(d)
    || (ts.isJSDocTypeLiteral(d) && !!d.parent && ts.isJSDocTypedefTag(d.parent))
    || (ts.isTypeLiteralNode(d) && !!d.parent && (ts.isTypeAliasDeclaration(d.parent) || (ts.isJSDocTypeExpression(d.parent) && !!d.parent.parent && ts.isJSDocTypedefTag(d.parent.parent))));
  /** The listed kind, handle kind or class of another module that a type is itself, or null. */
  function kindOfType(t) {
    if (!t || !(t.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection)) || (isObj(t) && callableOnly(t))) return null;
    for (const s of [t.aliasSymbol, t.symbol]) for (const d of s?.declarations ?? []) {
      if (!isKindDecl(d)) continue;
      const e = entryOf(d);
      if (e && e.listed && KIND_ITEMS.has(e.kind)) return e;
    }
    return null;
  }
  /**
   * The listed kinds of other modules a value of type t holds: each as the value itself (`self`, with its types: a
   * union's or an intersection's part, or a read-only or other mapped form of it, whose members are the value's), or
   * inside it (`inner`: in a list, a map, a promise, or a member of an object of no listed kind). A listed kind's own
   * members are its own (a change to a kind inside it changes it).
   */
  function heldKinds(t, out = new Map(), self = true, depth = 0, seen = new Map()) {
    const bit = self ? 1 : 2;
    if (!t || depth > 6 || (seen.get(t) ?? 0) & bit) return out;
    seen.set(t, (seen.get(t) ?? 0) | bit);
    const k = kindOfType(t);
    if (k) {
      const key = `${k.module}|${k.item}`;
      if (!out.has(key)) out.set(key, { e: k, self: false, inner: false, types: [] });
      const o = out.get(key);
      if (self) { o.self = true; o.types.push(t); } else o.inner = true;
      // the kinds a generic kind is given (Box<Quote>) are inside it, not among its own members
      for (const a of [...(t.aliasTypeArguments ?? []), ...(isObj(t) && t.objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(t) ?? [] : [])]) heldKinds(a, out, false, depth + 1, seen);
      return out;
    }
    if (t.flags & ts.TypeFlags.UnionOrIntersection) { for (const u of t.types) heldKinds(u, out, self, depth + 1, seen); return out; }
    if (!isObj(t) || callableOnly(t)) return out;
    // Readonly<K>, Partial<K>, Pick<K, …>: K's own members; Record<…, K>: K inside
    const mapped = !!(t.objectFlags & ts.ObjectFlags.Mapped) && t.aliasSymbol?.name !== 'Record';
    for (const a of t.aliasTypeArguments ?? []) heldKinds(a, out, self && mapped, depth + 1, seen);
    if (t.objectFlags & ts.ObjectFlags.Reference) for (const a of checker.getTypeArguments(t) ?? []) heldKinds(a, out, false, depth + 1, seen);
    if (!hostDeclared(t) && !mapped) for (const p of checker.getPropertiesOfType(t)) heldKinds(checker.getTypeOfSymbol(p), out, false, depth + 1, seen);
    for (const i of checker.getIndexInfosOfType(t)) heldKinds(i.type, out, false, depth + 1, seen);
    return out;
  }
  /** Is `name` a member of the kind as held (one of its own types)? */
  const memberOf = (h, name) => h.types.some((t) => !!checker.getPropertyOfType(t, name));
  /**
   * The use of a kind's member named on a value (`v.name`, `{ name } = v`): for each listed kind the value is itself, a
   * read of that member where it is one of the kind's, the whole value where it is not (a member the kind may come to
   * have). A member of a kind written inside a kind's member (`v.lines[0].price`) is a use of the whole kind.
   */
  function memberMark(baseType, name, e) {
    for (const h of heldKinds(baseType).values()) if (h.self && h.e.module === e.module && h.e.item === e.item) return memberOf(h, name) ? { value: 'member', member: name } : { value: 'whole' };
    return { value: 'whole' };
  }

  /** A function of the module's own, written in place or named, whose parameters are all it reads of what it is handed. */
  function isOwnFunction(e) {
    while (e && ts.isParenthesizedExpression(e)) e = e.expression;
    if (!e) return false;
    let d = e;
    if (ts.isIdentifier(e) || ts.isPropertyAccessExpression(e)) {
      const s = resolve(checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e));
      d = s?.valueDeclaration;
      if (d && ts.isVariableDeclaration(d)) d = d.initializer;
      while (d && ts.isParenthesizedExpression(d)) d = d.expression;
    }
    if (!d || !(ts.isArrowFunction(d) || ts.isFunctionExpression(d) || ts.isMethodDeclaration(d) || ts.isFunctionDeclaration(d)) || !mod.files.includes(d.getSourceFile().fileName)) return false;
    let args = false;
    forEachNode(d, (x) => { if (ts.isIdentifier(x) && x.text === 'arguments') args = true; });
    return !args;
  }
  /**
   * A function of the module's own given where a function is expected (a callback written in place, a method of an
   * object written in place, a function of its own named): what it is handed lands in its parameters, each use of them
   * judged where it stands, and what it hands back is judged at its returns; so a kind its parameters take as expected
   * is not used whole here (`none`). A parameter stated wider than what it is handed, or any other function handed on,
   * uses the kind whole (the default).
   */
  function fnMark(S, T, e) {
    if (!e || !isObj(S) || !isObj(T) || !callableOnly(S) || !callableOnly(T) || !isOwnFunction(e)) return () => undefined;
    const ss = S.getCallSignatures()[0], tsig = T.getCallSignatures()[0];
    if (!ss || !tsig) return () => undefined;
    const sp = ss.getParameters(), tp = tsig.getParameters();
    const rest = sp.length && sp[sp.length - 1].valueDeclaration && ts.isParameter(sp[sp.length - 1].valueDeclaration) && sp[sp.length - 1].valueDeclaration.dotDotDotToken;
    return (en) => {
      if (!en || !KIND_ITEMS.has(en.kind)) return undefined;
      const key = `${en.module}|${en.item}`;
      for (let i = 0; i < tp.length; i++) {
        if (!heldKinds(checker.getTypeOfSymbol(tp[i])).has(key)) continue;
        const own = i < sp.length ? sp[i] : rest ? sp[sp.length - 1] : null;
        if (own && !heldKinds(checker.getTypeOfSymbol(own)).has(key)) return { value: 'whole' };
      }
      return { value: 'none' };
    };
  }

  // ---- the walk ----
  const resolver = makeResolver(tree);
  // The bindings assigned anywhere in the module (R19), each by the checker's symbol: `=` and the compound and logical
  // assignments, `++`/`--` (not `!x`, `-x`, which only read), and the targets of an assignment or a for-of/for-in that
  // takes a value apart (`[x] = …`, `({ x } = …)`, `for (x of …)`)
  const assignedNames = new Set();
  const addTarget = (e) => {
    while (e && ts.isParenthesizedExpression(e)) e = e.expression;
    if (!e) return;
    if (ts.isIdentifier(e)) { const s = checker.getSymbolAtLocation(e); if (s) assignedNames.add(s); }
    else if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken) addTarget(e.left);
    else if (ts.isSpreadElement(e) || ts.isSpreadAssignment(e)) addTarget(e.expression);
    else if (ts.isArrayLiteralExpression(e)) e.elements.forEach(addTarget);
    else if (ts.isObjectLiteralExpression(e)) for (const p of e.properties) {
      if (ts.isPropertyAssignment(p)) addTarget(p.initializer);
      else if (ts.isShorthandPropertyAssignment(p)) { const s = checker.getShorthandAssignmentValueSymbol(p); if (s) assignedNames.add(s); }
      else if (ts.isSpreadAssignment(p)) addTarget(p.expression);
    }
  };
  for (const sf of files) forEachNode(sf, (n) => {
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment) addTarget(n.left);
    if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(n.operator)) addTarget(n.operand);
    if ((ts.isForOfStatement(n) || ts.isForInStatement(n)) && !ts.isVariableDeclarationList(n.initializer)) addTarget(n.initializer);
  });
  const isJSDocNode = (n) => n.kind >= ts.SyntaxKind.FirstJSDocNode && n.kind <= ts.SyntaxKind.LastJSDocNode;
  const inType = (n) => { for (let p = n; p; p = p.parent) { if (isJSDocNode(p) || ts.isTypeNode(p) && !ts.isExpressionWithTypeArguments(p)) return true; if (ts.isStatement(p) || ts.isSourceFile(p)) return false; } return false; };
  const isAssignTarget = (e) => { const p = e.parent; return !!p && ((ts.isBinaryExpression(p) && p.left === e && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) || ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(p.operator)) || ts.isDeleteExpression(p)); };
  function refType(id) {
    for (let p = id.parent; p; p = p.parent) {
      if (ts.isJSDocAugmentsTag?.(p) || ts.isJSDocImplementsTag?.(p) || ts.isHeritageClause(p)) return 'extends';
      if (isJSDocNode(p) || ts.isTypeNode(p) && !ts.isExpressionWithTypeArguments(p)) return 'type named';
      if (ts.isExportDeclaration(p)) return 're-export';
      if (ts.isImportDeclaration(p) || ts.isImportEqualsDeclaration(p)) return 'import';
      if (ts.isStatement(p)) break;
    }
    let e = id;
    while (e.parent && ts.isPropertyAccessExpression(e.parent) && e.parent.name === e) e = e.parent;
    const p = e.parent;
    if (p && ts.isCallExpression(p) && p.expression === e) return 'call';
    if (p && ts.isTaggedTemplateExpression(p) && p.tag === e) return 'call';
    if (p && ts.isNewExpression(p) && p.expression === e) return 'construct';
    if (isAssignTarget(e)) return 'write';
    return 'read';
  }
  /** Is this identifier the name a declaration of the module itself declares? */
  const isDeclName = (id) => { const p = id.parent; return !!p && (ts.isDeclaration?.(p) ?? false) && p.name === id && !ts.isImportSpecifier(p) && !ts.isExportSpecifier(p) && !ts.isImportClause(p) && !ts.isNamespaceImport(p); };

  for (const sf of files) {
    const fileName = sf.fileName;
    const isTest = mod.tests.includes(fileName);
    if (isTest) testIndex(sf);
    const errorSpans = [];
    if (isTest) forEachNode(sf, (n) => { if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ERROR_ASSERTIONS.has(n.expression.name.text) && n.arguments[0]) errorSpans.push([n.arguments[0].getStart(sf), n.arguments[0].end]); });
    const inErrorAssertion = (pos) => errorSpans.some(([s, e]) => pos >= s && pos < e);

    // R10: comments that silence the checker
    for (const m of sf.text.matchAll(/@ts-(ignore|expect-error|nocheck)\b/g)) {
      const node = nodeAtPos(sf, m.index);
      if (node) place('R10', node, { what: `@ts-${m[1]} silences the checker` });
    }
    // S11: a generated file names its generator and inputs
    const head = sf.text.split('\n').slice(0, 10).join('\n');
    const gen = /@generated\b(.*)/.exec(head);
    if (gen) {
      const named = [...gen[1].matchAll(/([\w./-]+\.\w+)/g)].map((x) => x[1]);
      if (!named.length) place('S11', sf.statements[0] ?? sf, { what: 'a generated file that does not name its generator and inputs' });
      for (const n of named) for (const m of ownersOfPath(path.join(tree.root, n)) ?? []) if (m !== mod.id) addUse({ module: m, item: n, kind: 'file', listed: false }, sf.statements[0] ?? sf, 'file');
    }
    // The checker's complaints: code that does not keep the standard's settings (S4), with the modules whose kinds they involve.
    for (const d of complaints.get(sf) ?? []) {
      if (d.start === undefined || inErrorAssertion(d.start)) continue;
      const node = nodeAtPos(sf, d.start) ?? sf;
      const msg = ts.flattenDiagnosticMessageText(d.messageText, ' ');
      if (d.code === 2307 || d.code === 7016) {
        const m = /'([^']+)'/.exec(msg)?.[1] ?? '';
        if (m.startsWith('.') || resolver.isOwn(m)) place('S1', node, { what: `an import the tool cannot resolve: ${m}`, mayRefer: modulesOfSpec(m, fileName) });
        else { inventory.set(m, packageName(m)); place('R14', node, { what: `uses ${m}, which the tool has no description of`, waitsOn: UNRESOLVED_WAIT, unknownHost: isHostModule(m), mayRefer: isHostModule(m) ? [] : [ANY] }); }
        continue;
      }
      let stmt = node; while (stmt.parent && !ts.isStatement(stmt) && !ts.isSourceFile(stmt.parent)) stmt = stmt.parent;
      const involved = new Set();
      let untyped = false;
      forEachNode(stmt, (n) => {
        if (!ts.isIdentifier(n)) return;
        const s = resolve(checker.getSymbolAtLocation(n));
        for (const x of s?.declarations ?? []) { const en = entryOf(x); if (en) involved.add(en.module); }
        const t = typeAt(n);
        if (t && (hasAny(t) || hasUnknown(t))) untyped = true;
        for (const x of kindDecls(t)) involved.add(entryOf(x).module);
      });
      for (const r of d.relatedInformation ?? []) { const m = r.file && tree.moduleOfFile(r.file.fileName); if (m && m !== mod.id) involved.add(m); }
      place('S4', node, { what: `the checker: ${msg}`.slice(0, 300), mayRefer: untyped ? [ANY] : [...involved], waitsOn: 'this module: code the checker accepts under the standard\'s settings', unknownHost: hostGap(d, msg, node) });
    }

    /** A name (S1 to S3, R11, R14): what an identifier in code or in a comment resolves to. */
    const nameUse = (n) => {
      if (isDeclName(n)) return;
      let sym = checker.getSymbolAtLocation(n);
      if (!sym && n.parent && ts.isShorthandPropertyAssignment(n.parent)) sym = checker.getShorthandAssignmentValueSymbol(n.parent);
      const target = resolve(sym);
      if (!target) return;
      const decls = target.declarations ?? [];
      const host = decls.length && decls.every((d) => isHostFile(d.getSourceFile()));
      const kind = refType(n);
      if (host) {
        if (kind !== 'type' && kind !== 'import') facility(n, target, { write: kind === 'write' && ts.isPropertyAccessExpression(n.parent) && n.parent.name === n });
        return;
      }
      for (const d of decls) {
        const e = entryOf(d);
        if (!e) continue;
        if (d.getSourceFile().isDeclarationFile) place('R10', n, { what: `refers to ${e.item}, declared in a declaration file the checker does not check`, mayRefer: [e.module] });
        const base = ts.isPropertyAccessExpression(n.parent) && n.parent.name === n ? n.parent.expression : null;
        // a member of a kind of plain data is the kind's item: named on a value of the kind, a read of that member
        const holder = base ?? (n.parent && ts.isBindingElement(n.parent) && n.parent.propertyName === n ? n.parent.parent : null);
        const mark = e.kind === 'type' && !isKindDecl(d) ? (holder ? memberMark(typeAt(holder), n.text, e) : { value: 'whole' }) : undefined;
        // a test that writes over a provider's member (not a field of a value of its kind of plain data) replaces it: a mock
        addUse(e, n, isTest && kind === 'write' && e.kind !== 'type' ? 'mock' : kind, base ? viaOf(base, e.module) : kind === 'import' || kind === 'type' ? 'direct' : viaOf(n, e.module), mark);
      }
    };

    forEachNode(sf, (n) => {
      if (ts.isIdentifier(n)) nameUse(n);
      // an import that names nothing (import '…'), and export * from '…': the module object is used
      if ((ts.isImportDeclaration(n) && !n.importClause) || (ts.isExportDeclaration(n) && !n.exportClause)) {
        if (n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) loadOf(n.moduleSpecifier.text, n, 'import');
      }
      // S3: a computed member of another module's module object, or of a value of a product kind
      if (ts.isElementAccessExpression(n)) {
        const s = resolve(checker.getSymbolAtLocation(n.expression));
        const ns = (s?.declarations ?? []).find((d) => ts.isSourceFile(d));
        const lit = ts.isStringLiteral(n.argumentExpression) || ts.isNumericLiteral(n.argumentExpression) ? [n.argumentExpression.text] : literalUnion(typeAt(n.argumentExpression));
        if (ns && !lit) { const m = tree.moduleOfFile(ns.fileName); if (m && m !== mod.id) place('S3', n, { what: `a computed member of ${m}'s module object`, mayRefer: [m] }); }
        else if (ns && lit) {
          // W[k] with k a written-out name or a choice of them: a use of each member it may name (S3)
          const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(n.expression) ? resolve(checker.getSymbolAtLocation(n.expression)) : s);
          for (const name of lit) for (const x of exports.filter((y) => y.name === name)) for (const d of resolve(x)?.declarations ?? []) addUse(entryOf(d), n, 'namespace member', 'direct');
        }
        else if (!lit && productKind(typeAt(n.expression) ?? {})) {
          const t = typeAt(n.expression);
          if (t && !checker.getIndexInfosOfType(t).length && !checker.isArrayType(t) && !checker.isTupleType(t)) place('S3', n, { what: 'a member named by a value the tool cannot read', mayRefer: [ANY] });
        }
      }
      // destructuring: each member taken apart is read
      if (ts.isObjectBindingPattern(n)) {
        const t = typeAt(n);
        let h = n.parent; while (h && !ts.isVariableDeclaration(h) && !ts.isParameter(h)) h = h.parent;
        for (const el of n.elements) {
          const nm = el.propertyName ?? el.name;
          if (!t || !ts.isIdentifier(nm)) continue;
          const p = checker.getPropertyOfType(t, nm.text);
          for (const d of p?.declarations ?? []) { const e = entryOf(d); if (e) addUse(e, nm, 'read', h && ts.isVariableDeclaration(h) ? viaOf(h.initializer, e.module) : 'direct', e.kind === 'type' ? memberMark(t, nm.text, e) : undefined); }
          if (t && ts.isIdentifier(nm) && p && (p.declarations ?? []).every((d) => isHostFile(d.getSourceFile()))) facility(nm, p);
        }
      }

      // ---- R1: no value of kind any ----
      if ((ts.isIdentifier(n) && !inType(n) && !isDeclNameOrImport(n)) || ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n) || ts.isCallExpression(n) || ts.isNewExpression(n)) {
        // a member's name (`x.name`) or a renamed key taken apart (`{ prefix: p }`) is no value; the value is the whole or the binding
        const keyName = ts.isIdentifier(n) && n.parent && ((ts.isPropertyAccessExpression(n.parent) && n.parent.name === n) || (ts.isBindingElement(n.parent) && n.parent.propertyName === n));
        if (!keyName && !inErrorAssertion(n.getStart(sf))) {
          const t = typeAt(n);
          if (t && hasAny(t)) place('R1', n, { what: `a value of kind ${checker.typeToString(t).slice(0, 80)}` });
        }
      }
      // ---- R2: structure given to a value of kind unknown that is not from the module's own channel ----
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression)) {
        // the kind at the read, as narrowed there: by instanceof (S4) to a class, or by another module's exported check, it is
        // that class's or that module's value; narrowed by hand (`in`, a guard of this module) the place is the narrowing (below)
        const t = typeAt(n.expression);
        if (t && hasUnknown(t) && !isAssignTarget(n) && !ownChannel(n.expression)) place('R2', n, { what: `reads ${n.name.text} of a value of kind unknown that is not from this module's own channel`, waitsOn: 'the owner of the data: its reader' });
      }
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.InKeyword) {
        const t = typeAt(n.right);
        if (t && ts.isIdentifier(n.right) && hasUnknown(checker.getTypeOfSymbol(checker.getSymbolAtLocation(n.right) ?? { flags: 0 }) ?? t) && !ownChannel(n.right)) place('R2', n, { what: 'narrows a value of kind unknown that is not from this module\'s own channel', waitsOn: 'the owner of the data: its reader' });
      }
      // a hand-written guard of this module (`v is T`, R3) gives its argument a shape: a place where that is not its own channel
      if (ts.isCallExpression(n)) {
        const sig = checker.getResolvedSignature(n);
        const pred = sig && checker.getTypePredicateOfSignature(sig);
        const arg = pred && typeof pred.parameterIndex === 'number' ? n.arguments[pred.parameterIndex] : undefined;
        const decl = sig?.getDeclaration();
        const own = decl && !decl.getSourceFile().isDeclarationFile && tree.moduleOfFile(decl.getSourceFile().fileName) === mod.id;
        const t = arg && typeAt(arg);
        if (own && t && hasUnknown(t) && !ownChannel(arg)) place('R2', n, { what: `a guard of this module gives a value of kind unknown that is not from this module's own channel the kind ${checker.typeToString(pred.type).slice(0, 80)}`, waitsOn: 'the owner of the data: its reader' });
      }

      // ---- R19: narrowing only of a const or a parameter never assigned ----
      if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) && !isAssignTarget(n) && !inType(n) && !(n.parent && ts.isCallExpression(n.parent) && n.parent.expression === n)) {
        const holder = typeAt(n.expression);
        const name = ts.isPropertyAccessExpression(n) ? n.name.text : ts.isStringLiteral(n.argumentExpression) ? n.argumentExpression.text : null;
        const prop = holder && name !== null ? checker.getPropertyOfType(checker.getApparentType(holder), name) : undefined;
        const declared = prop ? checker.getTypeOfSymbol(prop) : undefined;
        const flow = typeAt(n);
        if (declared && flow && declared !== flow && !(declared.flags & ts.TypeFlags.Any) && narrower(flow, declared)) {
          place('R19', n, { what: `relies on a narrowed member ${name}`, mayRefer: productKind(declared) ? [ANY] : [], waitsOn: 'this module: a const copy before narrowing' });
        }
      }
      if (ts.isIdentifier(n) && !inType(n) && !isAssignTarget(n) && !isDeclName(n)) {
        const s = checker.getSymbolAtLocation(n);
        const d = s?.valueDeclaration;
        const unstable = d && ((ts.isVariableDeclaration(d) && d.parent && !(d.parent.flags & ts.NodeFlags.Const) && ts.isVariableDeclarationList(d.parent)) || (ts.isParameter(d) && assignedNames.has(s)));
        if (unstable && tree.moduleOfFile(d.getSourceFile().fileName) === mod.id) {
          const declared = checker.getTypeOfSymbol(s), flow = typeAt(n);
          if (flow && declared !== flow && !(declared.flags & ts.TypeFlags.Any) && narrower(flow, declared)) place('R19', n, { what: ts.isParameter(d) ? `relies on the narrowed parameter ${n.text}, which is assigned` : `relies on the narrowed variable ${n.text}, which is not a const${assignedNames.has(s) ? ' and is assigned' : ''}`, mayRefer: productKind(declared) ? [ANY] : [], waitsOn: 'this module: a const copy before narrowing' });
        }
      }

      // ---- calls ----
      if (ts.isCallExpression(n) || ts.isNewExpression(n)) call(n, isTest);
      // the result of a call is a value of its kind (R11), received through the module it came from
      if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && !inErrorAssertion(n.getStart(sf))) {
        const t = typeAt(n);
        for (const d of kindDecls(t)) { const e = entryOf(d); addUse(e, n, 'receive', viaOf(n, e.module)); }
      }
      // ---- conversions: every site where the checker relates one type to another (conversion-sites.md) ----
      if (!inErrorAssertion(n.getStart(sf))) conversions(n);
      // a cast (R16; R2 where the value is of kind unknown)
      if (ts.isParenthesizedExpression(n) && ts.getJSDocTypeTag(n)) cast(n);
      // a class built on another module's class: its overrides (R5); the kinds it says it implements
      if ((ts.isClassDeclaration(n) || ts.isClassExpression(n))) overrides(n);
      // a value of another module's kind thrown, and another module's error class caught
      if (ts.isThrowStatement(n) && n.expression) for (const d of kindDecls(typeAt(n.expression))) addUse(entryOf(d), n.expression, 'throw', viaOf(n.expression, entryOf(d).module));
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && ts.isIdentifier(n.left)) {
        const d = checker.getSymbolAtLocation(n.left)?.valueDeclaration;
        if (d && ts.isVariableDeclaration(d) && d.parent && ts.isCatchClause(d.parent)) for (const x of resolve(checker.getSymbolAtLocation(ts.isPropertyAccessExpression(n.right) ? n.right.name : n.right))?.declarations ?? []) addUse(entryOf(x), n.right, 'catch');
      }
      // ---- implicitly invoked members ----
      if (ts.isTemplateSpan(n)) implicit(typeAt(n.expression), [...PRIMITIVE, '__@toPrimitive'], n.expression);
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) for (const side of [n.left, n.right]) implicit(typeAt(side), [...PRIMITIVE, '__@toPrimitive'], side);
      if (ts.isAwaitExpression(n)) implicit(typeAt(n.expression), ['then'], n);
      if (ts.isForOfStatement(n)) implicit(typeAt(n.expression), ['__@iterator', '__@asyncIterator'], n.expression);
      if (ts.isSpreadElement(n)) implicit(typeAt(n.expression), ['__@iterator'], n.expression);
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) implicit(typeAt(n.right), ['__@hasInstance'], n.right);
      // ---- comments: kinds outside K (R20), overloads (R10) ----
      if (isJSDocNode(n) && ts.isJSDoc(n)) for (const tag of n.tags ?? []) if (tag.tagName.text === 'overload') place('R10', tag, { what: 'an @overload signature, a claim the checker does not hold to the code', mayRefer: [] });
      if ((ts.isConditionalTypeNode(n) || ts.isMappedTypeNode(n) || ts.isIndexedAccessTypeNode(n) || ts.isTemplateLiteralTypeNode(n) || ts.isInferTypeNode(n))) {
        const ids = []; forEachNode(n, (x) => { if (ts.isIdentifier(x)) ids.push(x); });
        place('R20', n, { what: `a kind outside the kinds the standard allows (${ts.SyntaxKind[n.kind]})`, mayRefer: modulesOf(ids.flatMap((x) => resolve(checker.getSymbolAtLocation(x))?.declarations ?? [])) });
      }
      // ---- S8: shared mutable state ----
      if (isAssignTarget(n) && ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && ['globalThis', 'global', 'window', 'self'].includes(n.expression.text)) place('S8', n, { what: `writes ${n.getText()}, shared by every module` });
      if (isAssignTarget(n) && (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n))) {
        const t = typeAt(n.expression);
        const owners = t ? modulesOf(kindDecls(t)) : [];
        if (owners.length && ts.isIdentifier(n.expression) && (checker.getSymbolAtLocation(n.expression)?.flags ?? 0) & ts.SymbolFlags.Alias) place('S8', n, { what: `writes a member of ${owners.join(', ')}'s exported object`, mayRefer: owners });
      }
      if (ts.isVariableStatement(n) && n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) && !(n.declarationList.flags & ts.NodeFlags.Const) && mod.public.includes(fileName)) {
        place('S8', n, { what: `exports ${n.declarationList.declarations.map((d) => d.name.getText()).join(', ')} as a variable another module may see change`, mayRefer: [], item: n.declarationList.declarations[0]?.name.getText() });
      }
      // ---- R12: environment only through its owner ----
      if (ts.isPropertyAccessExpression(n) && n.name.text === 'env' && ts.isIdentifier(n.expression) && n.expression.text === 'process' && !isAssignTarget(n.parent)) {
        const p = n.parent;
        const name = p && ts.isPropertyAccessExpression(p) && p.expression === n ? p.name.text : p && ts.isElementAccessExpression(p) && ts.isStringLiteral(p.argumentExpression) ? p.argumentExpression.text : null;
        // The environment reaches out: only a boundary module owns a setting (R12, R14), so a setting read elsewhere may
        // be any earlier boundary module's.
        const owners = [...boundaryModules].filter((m) => m !== mod.id && indexOf(m) < mod.index);
        if (!isBoundaryModule) place('R12', n, { what: name ? `reads the setting ${name} from the environment` : 'reads the environment', mayRefer: owners.length ? owners : [ANY], waitsOn: owners.length === 1 ? `${owners[0]}: an accessor for ${name ?? 'the setting'}` : 'the owner of the setting: an accessor' });
      }
      // ---- R22: in tests, no real clock or timer, no fixed port ----
      if (isTest && (ts.isCallExpression(n) || ts.isNewExpression(n))) {
        const f = calleeFacility(n);
        if (f && (/^(DateConstructor\.now|performance\.now|NodeProcess\.hrtime)/.test(f) || (f === 'DateConstructor' && ts.isNewExpression(n) && !(n.arguments?.length)))) place('R22', n, { what: `reads the clock (${f}) in a test`, mayRefer: [] });
        if (f && TIMERS.has(f)) place('R22', n, { what: `a real timer (${f}) in a test; the runner's mock timers instead`, mayRefer: [] });
        if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'listen' && n.arguments[0] && ts.isNumericLiteral(n.arguments[0]) && n.arguments[0].text !== '0') place('R22', n, { what: `listens on the fixed port ${n.arguments[0].text}`, mayRefer: [] });
      }
      // ---- R21: a module's evaluation starts nothing ----
      if (!isTest && (ts.isCallExpression(n) || ts.isNewExpression(n)) && atTopLevel(n)) {
        const f = calleeFacility(n);
        if (f && (STARTS.test(f) || reachOf(f) === 'out')) place('R21', n, { what: `starts ${f} when the module is loaded`, mayRefer: [] });
      }
    }, { jsDoc: true });

    // ---- S4 (i), R3, R4: what this module's own interface files state ----
    if (mod.public.includes(fileName)) ownInterface(sf);
    // ---- what each value of another module's kind is used for ----
    forEachNode(sf, (n) => { if (isValueAt(n)) valueUse(n); if (ts.isObjectBindingPattern(n) || ts.isObjectLiteralExpression(n)) restUse(n); if (ts.isIdentifier(n) && n.text === 'arguments') argumentsUse(n); });
  }

  /**
   * Is this node a value whose use the walk below judges: a name read as a value, or an expression a value comes out of
   * (a member, an element, a call, a construction, an await, brackets, a choice, an assignment or logical expression)?
   */
  function isValueAt(n) {
    if (inType(n)) return false;
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      if (!p) return false;
      if (ts.isShorthandPropertyAssignment(p) && p.name === n) return !isPatternTarget(p.parent);
      if (isDeclName(n) || isAssignTarget(n)) return false;
      if ((ts.isPropertyAccessExpression(p) || ts.isQualifiedName(p)) && p.name === n) return false;
      if ((ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p) || ts.isPropertyDeclaration(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p) || ts.isEnumMember(p)) && p.name === n) return false;
      if (ts.isBindingElement(p) && p.propertyName === n) return false;
      if (ts.isLabeledStatement(p) || ts.isBreakOrContinueStatement(p) || ts.isMetaProperty(p)) return false;
      if ((ts.isForOfStatement(p) || ts.isForInStatement(p)) && p.initializer === n) return false;
      for (let q = p; q; q = q.parent) { if (ts.isImportDeclaration(q) || ts.isImportEqualsDeclaration(q)) return false; if (ts.isStatement(q)) break; }
      return !isPatternTarget(p);
    }
    if (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) return !isAssignTarget(n) && !isPatternTarget(n.parent);
    return ts.isCallExpression(n) || ts.isNewExpression(n) || ts.isTaggedTemplateExpression(n) || ts.isAwaitExpression(n) || ts.isParenthesizedExpression(n)
      || ts.isNonNullExpression(n) || ts.isConditionalExpression(n) || ts.isBinaryExpression(n) || ts.isAsExpression?.(n) || ts.isSatisfiesExpression?.(n);
  }
  /** Is this node inside the left side of an assignment that takes a value apart ({ a, b } = v, [a, b] = v)? */
  function isPatternTarget(n) {
    for (let x = n; x; x = x.parent) {
      const p = x.parent;
      if (!p) return false;
      if (ts.isBinaryExpression(p) && p.left === x && (ts.isObjectLiteralExpression(x) || ts.isArrayLiteralExpression(x)) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken) return true;
      if ((ts.isForOfStatement(p) || ts.isForInStatement(p)) && p.initializer === x && (ts.isObjectLiteralExpression(x) || ts.isArrayLiteralExpression(x))) return true;
      if (!(ts.isObjectLiteralExpression(p) || ts.isArrayLiteralExpression(p) || ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p) || ts.isSpreadAssignment(p) || ts.isSpreadElement(p) || (ts.isBinaryExpression(p) && p.left === x))) return false;
    }
    return false;
  }
  /** A name of the module's own that holds a value under a type holding every kind of `held`, and hands it nowhere else. */
  function ownName(id, held) {
    if (!ts.isIdentifier(id)) return false;
    const s = checker.getSymbolAtLocation(id);
    const d = s?.valueDeclaration;
    if (!d || d.getSourceFile() !== id.getSourceFile() || !(ts.isVariableDeclaration(d) || ts.isParameter(d) || ts.isBindingElement(d))) return false;
    let st = d; while (st && !ts.isVariableStatement(st) && !ts.isStatement(st)) st = st.parent;
    if (st && ts.isVariableStatement(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return false;
    const has = heldKinds(checker.getTypeOfSymbol(s));
    return [...held.keys()].every((k) => has.has(k));
  }
  function nullish(x) { while (ts.isParenthesizedExpression(x)) x = x.expression; return x.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined') || ts.isVoidExpression(x); }
  function inPlaceFn(x) { return ts.isArrowFunction(x) || ts.isFunctionExpression(x); }
  /** The function a return or a body hands its value back from, where it is an export of this module's interface code. */
  function exportedFn(fn) {
    if (!fn || !mod.public.includes(fn.getSourceFile().fileName) || mod.tests.includes(fn.getSourceFile().fileName)) return false;
    return (ts.isFunctionDeclaration(fn) || inPlaceFn(fn)) && isExported(fn);
  }
  function enclosingFn(n) { for (let p = n.parent; p; p = p.parent) if (ts.isFunctionLike(p)) return p; return null; }

  /**
   * What a place does with a value of another module's kind (B1): a read or write of one named member of the kind it
   * is (`member`); nothing that depends on its members, the value going on to where it is judged apart (`none`: a name of
   * the module's own, brackets, an await, a choice, a test of it, an element taken out of a list); or the value as a
   * whole: handed to a function, handed back, stored, spread, compared, iterated, written into text, thrown, and every
   * place the walk cannot prove is one of the others. The walk writes `member` and `whole` (`none` needs no entry: the
   * value's other places are its uses; a use that names the kind or takes its value is `none` by its type, NAMING); a
   * value handed back from an export of the module's interface code is `handed back`, which is whole.
   */
  function valueUse(n) {
    const t = typeAt(n);
    if (!t) return;
    const held = heldKinds(t);
    if (!held.size) return;
    const p = n.parent;
    if (!p) return;
    const whole = (type, value = 'whole') => { for (const h of held.values()) addUse(h.e, n, type, viaOf(n, h.e.module), { value }); };
    const passOn = (into) => {
      const holdsAll = (x) => { const ph = heldKinds(typeAt(x)); return [...held.keys()].every((k) => ph.has(k)); };
      return holdsAll(into) ? undefined : whole('read');
    };
    // brackets, an await, a choice, a fallback: the value goes on as the expression around it, judged there
    if ((ts.isParenthesizedExpression(p) && !ts.getJSDocTypeTag(p)) || ts.isNonNullExpression(p) || ts.isAwaitExpression(p) || ts.isSatisfiesExpression?.(p)) return passOn(p);
    if (ts.isConditionalExpression(p)) return p.condition === n ? undefined : passOn(p);
    if (ts.isBinaryExpression(p)) {
      const op = p.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return p.left === n ? undefined : passOn(p);
      if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) return passOn(p);
      if (op === ts.SyntaxKind.CommaToken) return p.left === n ? undefined : passOn(p);
      if ([ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(op)) return nullish(p.left === n ? p.right : p.left) ? undefined : whole('read');
      if (p.right === n && [ts.SyntaxKind.EqualsToken, ts.SyntaxKind.QuestionQuestionEqualsToken, ts.SyntaxKind.BarBarEqualsToken, ts.SyntaxKind.AmpersandAmpersandEqualsToken].includes(op)) {
        if (ownName(p.left, held)) return undefined;
        // taken apart by plain names into names (takenApart reads each member); a rest, a computed or quoted name, or a
        // pattern inside the pattern is the whole value
        const plain = (x) => ts.isShorthandPropertyAssignment(x) || (ts.isPropertyAssignment(x) && ts.isIdentifier(x.name) && !ts.isObjectLiteralExpression(x.initializer) && !ts.isArrayLiteralExpression(x.initializer));
        if (ts.isObjectLiteralExpression(p.left) && p.left.properties.every(plain)) return [...held.values()].some((h) => !h.self) ? whole('read') : undefined;
        if (ts.isArrayLiteralExpression(p.left) && [...held.values()].every((h) => !h.self)) return undefined;
        return whole('store');
      }
      if (op === ts.SyntaxKind.InKeyword && p.right === n && ts.isStringLiteral(p.left)) {
        for (const h of held.values()) addUse(h.e, n, 'read', viaOf(n, h.e.module), h.self && !h.inner && memberOf(h, p.left.text) ? { value: 'member', member: p.left.text } : { value: 'whole' });
        return undefined;
      }
      return whole('read');
    }
    // a test of it
    if ((ts.isPrefixUnaryExpression(p) && p.operator === ts.SyntaxKind.ExclamationToken) || ts.isTypeOfExpression(p) || ts.isVoidExpression(p) || ts.isExpressionStatement(p)) return undefined;
    if ((ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p)) && p.expression === n) return undefined;
    if (ts.isForStatement(p) && p.condition === n) return undefined;
    // a member of it
    if (ts.isPropertyAccessExpression(p) && p.expression === n) {
      const name = p.name.text;
      const type = isAssignTarget(p) ? 'write' : ts.isCallExpression(p.parent) && p.parent.expression === p ? 'call' : 'read';
      // inside the value: a member of an object of no listed kind, or a member of a list, a map or a promise that hands
      // its contents on, leaves them to where the result, or the parameter of a function written in place, is judged
      const prop = checker.getPropertyOfType(checker.getApparentType(t), name);
      const productMember = !!prop && (prop.declarations ?? []).length > 0 && (prop.declarations ?? []).every((d) => !isHostFile(d.getSourceFile()));
      const call = ts.isCallExpression(p.parent) && p.parent.expression === p ? p.parent : null;
      const fns = call ? call.arguments.filter((a) => { const at = typeAt(a); return !!at && isObj(at) && at.getCallSignatures().length > 0; }) : [];
      const handsOn = productMember || HOLDER_MEMBERS.has(name) || (CALLBACK_MEMBERS.has(name) && !!call && fns.length > 0 && fns.every(inPlaceFn));
      for (const h of held.values()) {
        const member = h.self && memberOf(h, name);
        if (member) addUse(h.e, n, type, viaOf(n, h.e.module), { value: 'member', member: name });
        if ((h.self && !member) || (h.inner && !handsOn)) addUse(h.e, n, 'read', viaOf(n, h.e.module), { value: 'whole' });
      }
      return undefined;
    }
    if (ts.isElementAccessExpression(p) && p.expression === n) {
      const key = ts.isStringLiteral(p.argumentExpression) || ts.isNoSubstitutionTemplateLiteral(p.argumentExpression) ? p.argumentExpression.text : null;
      for (const h of held.values()) {
        if (h.self && key !== null && memberOf(h, key) && !h.inner) addUse(h.e, n, isAssignTarget(p) ? 'write' : 'read', viaOf(n, h.e.module), { value: 'member', member: key });
        else if (h.self) addUse(h.e, n, 'read', viaOf(n, h.e.module), { value: 'whole' });
      }
      return undefined;
    }
    // held under a name of the module's own, or taken apart: each use of the name is judged where it stands
    if (ts.isVariableDeclaration(p) && p.initializer === n) {
      if (ts.isIdentifier(p.name)) return ownName(p.name, held) ? undefined : whole('store');
      if (ts.isObjectBindingPattern(p.name)) return undefined; // its members are read where taken apart; a rest is the whole (restUse)
      if (ts.isArrayBindingPattern(p.name) && [...held.values()].every((h) => !h.self)) return undefined;
      return whole('read');
    }
    if ((ts.isForOfStatement(p)) && p.expression === n) {
      if ([...held.values()].some((h) => h.self)) return whole('iterate');
      const init = p.initializer;
      if (ts.isVariableDeclarationList(init) && init.declarations.length === 1) {
        const nm = init.declarations[0].name;
        if (ts.isIdentifier(nm) || ts.isObjectBindingPattern(nm) || ts.isArrayBindingPattern(nm)) return undefined;
      }
      if (ts.isIdentifier(init) && ownName(init, held)) return undefined;
      return whole('iterate');
    }
    // handed back from a function: from an export of the module's interface code, to the later modules that call it
    if ((ts.isReturnStatement(p) && p.expression === n) || (ts.isArrowFunction(p) && p.body === n)) {
      return whole('pass on', exportedFn(ts.isArrowFunction(p) ? p : enclosingFn(p)) ? 'handed back' : 'whole');
    }
    if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && (p.arguments ?? []).includes(n)) return whole('pass on');
    if (ts.isTaggedTemplateExpression(p) || ts.isTemplateSpan(p) || ts.isYieldExpression(p) || ts.isExportAssignment(p) || ts.isExportSpecifier(p)) return whole('pass on');
    if (ts.isThrowStatement(p)) return whole('throw');
    if (ts.isSpreadElement(p) || ts.isForInStatement(p)) return whole('iterate');
    if (ts.isSpreadAssignment(p) || ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p) || ts.isArrayLiteralExpression(p) || ts.isPropertyDeclaration(p) || ts.isParameter(p) || ts.isBindingElement(p)) return whole('store');
    return whole('read');
  }
  /** A rest taken apart from a value ({ a, ...rest } = v): every other member of it, those it may come to have too. */
  function restUse(n) {
    // a rest, or a member named by a computed or quoted name (the members read are those taken by plain names)
    const rest = ts.isObjectBindingPattern(n) ? n.elements.find((e) => e.dotDotDotToken || !ts.isIdentifier(e.propertyName ?? e.name)) : isPatternTarget(n) ? n.properties.find((x) => ts.isSpreadAssignment(x)) : null;
    if (!rest) return;
    let source;
    if (ts.isObjectBindingPattern(n)) source = typeAt(n);
    else { let x = n; while (x.parent && !(ts.isBinaryExpression(x.parent) && x.parent.left === x)) x = x.parent; source = x.parent ? typeAt(x.parent.right) : undefined; }
    for (const h of heldKinds(source).values()) addUse(h.e, rest, 'read', 'direct', { value: 'whole' });
  }
  /** `arguments` in a function: every value handed to it, as a whole. */
  function argumentsUse(n) {
    if (!inType(n) && !isDeclName(n) && !(n.parent && ts.isPropertyAccessExpression(n.parent) && n.parent.name === n)) {
      let fn = enclosingFn(n);
      while (fn && ts.isArrowFunction(fn)) fn = enclosingFn(fn);
      for (const prm of fn?.parameters ?? []) for (const h of heldKinds(typeAt(prm)).values()) addUse(h.e, n, 'read', 'direct', { value: 'whole' });
    }
  }

  /** The type of the parameter that takes argument i of a call (the element of a rest parameter). */
  function paramTypeAt(sig, i) {
    const ps = sig?.getParameters() ?? [];
    if (!ps.length) return undefined;
    const last = ps[ps.length - 1];
    const rest = last.valueDeclaration && ts.isParameter(last.valueDeclaration) && last.valueDeclaration.dotDotDotToken;
    if (i < ps.length - (rest ? 1 : 0)) return checker.getTypeOfSymbol(ps[i]);
    if (!rest) return undefined;
    const t = checker.getTypeOfSymbol(last);
    return checker.isArrayType(t) ? checker.getTypeArguments(t)[0] : undefined;
  }
  function elementOf(t) { return t && (checker.isArrayType(t) || checker.isTupleType(t)) ? checker.getTypeArguments(t)[0] : t ? checker.getIndexTypeOfType?.(t, ts.IndexKind.Number) : undefined; }
  function statedType(decl) { return ts.getJSDocType(decl) || decl.type || (ts.isVariableDeclaration(decl) && decl.parent?.parent && ts.getJSDocType(decl.parent.parent)); }
  function signatureOf(call) { try { return checker.getResolvedSignature(call); } catch { return undefined; } }
  /**
   * Every site where a value passes from one type to another (process/research/uses-metadata-25nov/conversion-sites.md):
   * arguments (spread, tagged templates, decorators and a stated this included), returns and arrow bodies, yield,
   * initializers, parameter and destructuring defaults and class fields with a stated type, assignments and
   * destructuring assignments, members and elements of literals written in place, spread into them, for-of variables
   * with a stated type, and satisfies; casts and class members are cast() and overrides().
   */
  function conversions(n) {
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const sig = signatureOf(n);
      (n.arguments ?? []).forEach((a, i) => {
        if (ts.isSpreadElement(a)) { const t = paramTypeAt(sig, i); if (t) relate(elementOf(typeAt(a.expression)), t, null, a, 'a spread argument', { source: 'pass on' }); }
        else conversionAt(a, 'an argument', 'pass on');
      });
      // a receiver handed to a function that states its this
      const thisParam = sig?.thisParameter;
      if (thisParam && ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) relate(typeAt(n.expression.expression), checker.getTypeOfSymbol(thisParam), n.expression.expression, n, 'a receiver', { source: 'pass on' });
    }
    if (ts.isTaggedTemplateExpression(n) && ts.isTemplateExpression(n.template)) {
      const sig = signatureOf(n);
      n.template.templateSpans.forEach((sp, i) => { const t = paramTypeAt(sig, i + 1); if (t) relate(typeAt(sp.expression), t, sp.expression, sp.expression, 'a tagged template\'s value', { source: 'pass on' }); });
    }
    if (ts.isDecorator(n)) {
      const t = paramTypeAt(signatureOf(n), 0);
      const target = n.parent && (n.parent.name ?? n.parent);
      // the value decorated: a class itself (its constructor and static side), or a member
      const sym = target && checker.getSymbolAtLocation(target);
      if (t && target) relate(sym ? checker.getTypeOfSymbol(sym) : typeAt(target), t, null, n, 'a decorated declaration', { source: 'pass on' });
    }
    if (ts.isReturnStatement(n) && n.expression) conversionAt(n.expression, 'a value handed back', 'pass on');
    if (ts.isArrowFunction(n) && !ts.isBlock(n.body)) conversionAt(n.body, 'a value handed back', 'pass on');
    if (ts.isYieldExpression(n) && n.expression) conversionAt(n.expression, 'a value yielded', 'pass on');
    if (ts.isExportAssignment(n)) conversionAt(n.expression, 'the default export', 'pass on');
    // initializers with a stated type: variables (for-of ones from what is iterated), parameters' defaults, class fields
    if (ts.isVariableDeclaration(n) && statedType(n)) {
      if (n.initializer) relate(typeAt(n.initializer), typeAt(n.name), n.initializer, n, 'a value given a stated type');
      else if (n.parent?.parent && ts.isForOfStatement(n.parent.parent)) relate(elementOf(typeAt(n.parent.parent.expression)), typeAt(n.name), null, n, 'a for-of variable with a stated type', { source: 'store' });
    }
    if (ts.isParameter(n) && n.initializer && statedType(n)) relate(typeAt(n.initializer), checker.getTypeOfSymbol(checker.getSymbolAtLocation(n.name) ?? { flags: 0 }) ?? typeAt(n.name), n.initializer, n, 'a parameter\'s default');
    if (ts.isPropertyDeclaration(n) && n.initializer) { const sy = n.symbol ?? checker.getSymbolAtLocation(n.name); if (sy) relate(typeAt(n.initializer), checker.getTypeOfSymbol(sy), n.initializer, n, 'a class field', { source: 'store' }); }
    if (ts.isBindingElement(n) && n.initializer) relate(typeAt(n.initializer), typeAt(n.name), n.initializer, n, 'a default of a value taken apart', { source: 'store' });
    // assignments: =, the logical assignments, and assignments that take a value apart
    if (ts.isBinaryExpression(n) && [ts.SyntaxKind.EqualsToken, ts.SyntaxKind.QuestionQuestionEqualsToken, ts.SyntaxKind.BarBarEqualsToken, ts.SyntaxKind.AmpersandAmpersandEqualsToken].includes(n.operatorToken.kind)) {
      if (ts.isObjectLiteralExpression(n.left) || ts.isArrayLiteralExpression(n.left)) takenApart(n.left, typeAt(n.right), n);
      else {
        // a member's declared kind; a member an index signature gives (`fields.other`) has no symbol of its own (the
        // checker answers the signature, whose kind it gives as any): its kind is the signature's, read at the target
        const s0 = ts.isPropertyAccessExpression(n.left) ? checker.getSymbolAtLocation(n.left.name) : checker.getSymbolAtLocation(n.left);
        const s = s0 && !(s0.flags & ts.SymbolFlags.Signature) ? s0 : undefined;
        relate(typeAt(n.right), s ? checker.getTypeOfSymbol(s) : typeAt(n.left), n.right, n, 'an assignment', { source: 'store' });
      }
    }
    // members and elements of a literal written in place, and what is spread into it
    if (ts.isObjectLiteralExpression(n.parent ?? n) && n.parent !== n) {
      const ct = (() => { try { return checker.getContextualType(n.parent); } catch { return undefined; } })();
      if (ct && !(ts.isBinaryExpression(n.parent.parent) && n.parent.parent.left === n.parent)) {
        if (ts.isPropertyAssignment(n)) conversionAt(n.initializer, `field ${n.name.getText()}`, 'store');
        if (ts.isShorthandPropertyAssignment(n)) { const p = checker.getPropertyOfType(ct, n.name.text); const vs = checker.getShorthandAssignmentValueSymbol(n); if (p && vs) relate(checker.getTypeOfSymbol(vs), checker.getTypeOfSymbol(p), n.name, n, `field ${n.name.text}`, { source: 'store' }); }
        if (ts.isMethodDeclaration(n) && n.name) { const p = checker.getPropertyOfType(ct, n.name.getText()); if (p) relate(typeAt(n), checker.getTypeOfSymbol(p), n, n, `method ${n.name.getText()}`); }
        if (ts.isSpreadAssignment(n)) relate(typeAt(n.expression), ct, n.expression, n, 'a value spread into an object', { source: 'store' });
      }
    }
    if (ts.isArrayLiteralExpression(n.parent ?? n) && n.parent !== n && !(ts.isBinaryExpression(n.parent.parent) && n.parent.parent.left === n.parent)) {
      if (ts.isSpreadElement(n)) { let ct; try { ct = checker.getContextualType(n.parent); } catch { ct = undefined; } const et = elementOf(ct); if (et) relate(elementOf(typeAt(n.expression)), et, null, n, 'a list spread into a list', { source: 'store' }); }
      else if (!ts.isOmittedExpression(n)) conversionAt(n, 'an element of a list', 'store');
    }
    // satisfies: checked, the value keeps its own type
    if (ts.isParenthesizedExpression(n)) {
      const tag = ts.getJSDocSatisfiesTag?.(n);
      if (tag?.typeExpression) relate(typeAt(n.expression), checker.getTypeFromTypeNode(tag.typeExpression.type), n.expression, n, 'satisfies', { check: false });
    }
  }
  /** An assignment that takes a value apart ({ a, b: x } = v, [a, b] = v): each target receives a member of the value. */
  function takenApart(pattern, S, node) {
    if (!S) return;
    if (ts.isObjectLiteralExpression(pattern)) for (const p of pattern.properties) {
      const name = ts.isShorthandPropertyAssignment(p) || ts.isPropertyAssignment(p) ? p.name.getText() : null;
      if (!name) continue;
      const m = checker.getPropertyOfType(S, name);
      if (!m) continue;
      const target = ts.isShorthandPropertyAssignment(p) ? p.name : p.initializer;
      const ts_ = ts.isShorthandPropertyAssignment(p) ? checker.getShorthandAssignmentValueSymbol(p) : checker.getSymbolAtLocation(target);
      const T = ts_ ? checker.getTypeOfSymbol(ts_) : typeAt(target);
      for (const d of m.declarations ?? []) { const e = entryOf(d); addUse(e, p, 'read', 'direct', e?.kind === 'type' ? memberMark(S, name, e) : undefined); }
      relate(checker.getTypeOfSymbol(m), T, null, p, `member ${name} taken apart`, { source: 'store' });
    }
    else pattern.elements.forEach((el) => {
      if (ts.isOmittedExpression(el) || ts.isSpreadElement(el)) return;
      const s = checker.getSymbolAtLocation(el);
      relate(elementOf(S), s ? checker.getTypeOfSymbol(s) : typeAt(el), null, el, 'an element taken apart', { source: 'store' });
    });
  }
  function narrower(flow, declared) {
    if (assignable(flow, declared) && !assignable(declared, flow)) return true;
    return false;
  }
  function isDeclNameOrImport(n) {
    if (isDeclName(n)) return true;
    for (let p = n.parent; p; p = p.parent) { if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) return true; if (ts.isStatement(p)) return false; }
    return false;
  }
  function atTopLevel(n) {
    for (let p = n.parent; p; p = p.parent) { if (ts.isFunctionLike(p) || ts.isClassLike(p)) return false; if (ts.isSourceFile(p)) return true; }
    return true;
  }
  function modulesOfSpec(spec, from) {
    const target = resolver.resolve(spec, from);
    const o = target ? ownersOfPath(target) : null;
    return o && o.size ? [...o] : [ANY];
  }
  /**
   * Whether a checker's complaint stands only because the tool's description of Node or workerd lacks what the code
   * uses: one of Node's global names (TypeScript's own codes for them); a member a host module does not export; a
   * member of a kind Node's or workerd's description declares.
   */
  function hostGap(d, msg, node) {
    if (HOST_NAMES.has(d.code)) return true;
    if (NO_EXPORT.has(d.code)) { const m = /'"([^"]+)"'/.exec(msg)?.[1]; return !!m && isHostModule(m); }
    if (NO_MEMBER.has(d.code) && node?.parent && ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
      const t = typeAt(node.parent.expression);
      return [t?.aliasSymbol, t?.symbol].some((s) => !!s && isHostFacility(s));
    }
    return false;
  }
  function nodeAtPos(sf, pos) {
    let found = null;
    for (let n = sf; n;) {
      let next = null;
      ts.forEachChild(n, (c) => { if (c.getFullStart() <= pos && pos < c.end) { next = c; return true; } });
      if (next) found = next;
      n = next;
    }
    return found ?? sf.statements[0] ?? null;
  }

  function call(n, isTest) {
    const f = calleeFacility(n);
    const file = n.getSourceFile().fileName;
    const args = n.arguments ?? [];
    // S2: loading only of a written-out name
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const a0 = args[0];
      if (!a0 || !(ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0))) place('S2', n, { what: 'an import of a name the tool cannot read' });
      else loadOf(a0.text, n, 'import');
      return;
    }
    const s = resolve(checker.getSymbolAtLocation(ts.isPropertyAccessExpression(n.expression) ? n.expression.name : n.expression));
    const requireLike = (ts.isIdentifier(n.expression) && n.expression.text === 'require') || (s?.valueDeclaration && ts.isVariableDeclaration(s.valueDeclaration) && s.valueDeclaration.initializer && ts.isCallExpression(s.valueDeclaration.initializer) && calleeFacility(s.valueDeclaration.initializer) === '"node:module".createRequire');
    if (ts.isCallExpression(n) && requireLike) {
      const a0 = args[0];
      if (!a0 || !(ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0))) place('S2', n, { what: 'a require of a name the tool cannot read' });
      else loadOf(a0.text, n, 'import');
      return;
    }
    if (f === '"node:module".createRequire') {
      const v = evaluate(args[0], file);
      if (!v || !v.every((x) => x === fileUrl(file) || x === file)) place('S2', n, { what: 'createRequire from somewhere other than this file' });
    }
    if (f === 'ImportMeta.resolve' && !(args[0] && ts.isStringLiteral(args[0]))) place('S2', n, { what: 'import.meta.resolve of a name the tool cannot read' });
    // S9: code from text
    if (f && TIMERS.has(f) && args[0] && (ts.isStringLiteral(args[0]) || ts.isTemplateExpression(args[0]))) place('S9', n, { what: `${f} of a text` });
    // S5, S6: files, programs and workers by a path the tool works out
    const fsm = f && FS.exec(f);
    if (fsm) {
      pathArgument('S5', args[0], n, `${fsm[2]} of a path`);
      if (TWO_PATHS.has(fsm[2])) pathArgument('S5', args[1], n, `${fsm[2]} to a path`);
    }
    const prog = f && PROGRAMS.exec(f);
    if (prog) {
      const v = evaluate(args[0], file);
      if (/^exec(Sync)?$/.test(prog[1])) {
        if (!v) place('S6', n, { what: `${prog[1]} of a command the tool cannot work out` });
        else for (const cmd of v) checkTokens(cmd.split(/\s+/), n, prog[1]);
      } else {
        if (v && !v.every((x) => x === '<node>' || !/[/]/.test(x))) pathArgument('S6', args[0], n, `${prog[1]} of a program`);
        else if (!v) place('S6', n, { what: `${prog[1]} of a program the tool cannot work out` });
        if (prog[1] === 'fork') pathArgument('S6', args[0], n, 'fork of a script');
        const list = args[1];
        if (list && ts.isArrayLiteralExpression(list)) {
          for (const el of list.elements) {
            if (ts.isSpreadElement(el)) { place('S6', el, { what: `${prog[1]}: arguments the tool cannot work out` }); continue; }
            const ev = evaluate(el, file);
            if (!ev) place('S6', el, { what: `${prog[1]}: an argument the tool cannot work out` });
            else checkTokens(ev, el, prog[1]);
          }
        } else if (list && !(ts.isObjectLiteralExpression(list))) place('S6', list, { what: `${prog[1]}: arguments the tool cannot work out` });
        const opt = args.find((a) => ts.isObjectLiteralExpression(a));
        const cwd = opt?.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === 'cwd');
        if (cwd) pathArgument('S6', cwd.initializer, n, `${prog[1]} in a folder`);
      }
    }
    if (f === '"node:worker_threads".Worker') pathArgument('S6', args[0], n, 'a worker of a script');
    // S8: named process-wide channels, unless the name is the owner's
    if (f && CHANNELS.has(f)) {
      const a0 = args[0];
      const named = a0 && ts.isIdentifier(a0) && (resolve(checker.getSymbolAtLocation(a0))?.declarations ?? []).some((d) => entryOf(d));
      const builtinEvent = f.startsWith('NodeProcess.') && a0 && ts.isStringLiteral(a0) && ['exit', 'beforeExit', 'uncaughtException', 'unhandledRejection', 'warning', 'SIGINT', 'SIGTERM', 'message'].includes(a0.text);
      if (!named && !builtinEvent) place('S8', n, { what: `a process-wide channel by a name of its own (${f})` });
    }
    // R8: no reflective writes onto another module's value; R11: a reflective read reads every member; R17 width
    if (f && (REFLECT_WRITES.has(f) || REFLECT_READS.has(f) || WIDENS.has(f))) {
      const target = args[0];
      if (REFLECT_WRITES.has(f) && target) {
        const owners = modulesOf(kindDecls(typeAt(target)));
        if (owners.length && !isFresh(target)) place('R8', n, { what: `${f} writes onto a value of ${owners.join(', ')}'s kind`, mayRefer: owners, waitsOn: `this module, or ${owners.join(', ')}: a setter` });
      }
      for (const a of f === 'ObjectConstructor.assign' ? args.slice(1) : args.slice(0, 1)) {
        const t = typeAt(a);
        for (const u of t && isObj(t) ? checker.getPropertiesOfType(t) : []) for (const d of u.declarations ?? []) addUse(entryOf(d), a, 'read', viaOf(a, entryOf(d)?.module));
        if (WIDENS.has(f) && t && isObj(t) && productKind(t) && !checker.getIndexInfosOfType(t).length && !isFresh(a)) place('R17', a, { what: `${f} reads every member of ${checker.typeToString(t)}, those its kind hides as well`, mayRefer: [ANY] });
      }
      if (f === 'JSON.stringify' && args[0]) implicit(typeAt(args[0]), ['toJSON'], args[0]);
    }
    // R18: a receiver handed to call, apply or bind is a conversion to the method's class
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ['call', 'apply', 'bind'].includes(n.expression.name.text) && f && /^(Function|CallableFunction|NewableFunction)\./.test(f)) receiver(n.expression.expression, args[0], n);
    if (f === 'Reflect.apply' && args.length >= 2) receiver(args[0], args[1], n);
    // calls by name through a door (S7): the module that answers each name
    if (ts.isCallExpression(n)) {
      const c = carrierOf(checker, n);
      if (c?.names === null) place('S7', n, { what: `a call by a name the tool cannot read through ${c.member}`, waitsOn: 'this module: a written-out name through the declared table' });
      else if (c) for (const name of c.names) {
        const key = `${c.kind}:${name}`;
        if (mod.public.some((f2) => program.getSourceFile(f2)) && listingOf(mod.id).entries[key]) continue; // its own table
        const owner = [...tree.modules].filter((m) => m.id !== mod.id && m.public.some((f2) => program.getSourceFile(f2))).find((m) => listingOf(m.id).entries[key]);
        if (owner) addUse({ module: owner.id, item: key, kind: itemKind(listingOf(owner.id).entries[key].kind), listed: true }, n, c.kind === 'op' ? 'operation by name' : 'table');
        else place('S7', n, { what: `a call by the name ${name}, which no module's table answers`, waitsOn: 'ARCH: the module that answers it' });
      }
    }
    // S12: modules replaced in tests only by a written-out name; methods only on a module's own binding
    if (isTest && ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ts.isPropertyAccessExpression(n.expression.expression) && n.expression.expression.name.text === 'mock' || (isTest && f && /^NodeMock\.(module|method)$/.test(f))) {
      const which = ts.isPropertyAccessExpression(n.expression) ? n.expression.name.text : '';
      if (which === 'module') {
        const a0 = args[0];
        if (!a0 || !ts.isStringLiteral(a0)) place('S12', n, { what: 'mock.module of a name the tool cannot read' });
        else loadOf(a0.text, n, 'mock');
      }
      if (which === 'method') {
        const a0 = args[0], a1 = args[1];
        const bound = a0 && ts.isIdentifier(a0) && (checker.getSymbolAtLocation(a0)?.flags ?? 0) & ts.SymbolFlags.Alias;
        if (!bound || !a1 || !ts.isStringLiteral(a1)) place('S12', n, { what: 'mock.method other than on an import, by a written-out name' });
        // the provider's member it replaces: a use of type mock (design part 2, section 7, point 3 of who is told)
        else { const t = typeAt(a0); const prop = t && checker.getPropertyOfType(t, a1.text); for (const d of prop?.declarations ?? []) { const en = entryOf(d); if (en) addUse(en, n, 'mock'); } }
      }
    }
  }
  function checkTokens(tokens, node, what) {
    for (const tok of tokens) {
      if (tok === '<node>' || !/[/]|\.(m?js|cjs|json)$/.test(tok) || /^-/.test(tok) && !tok.includes('=')) continue;
      const value = tok.includes('=') ? tok.slice(tok.indexOf('=') + 1) : tok;
      const c = classifyPath([value]);
      if (c.cwd) place('S6', node, { what: `${what}: ${value} relative to the working directory`, mayRefer: c.others.length ? c.others : [ANY], waitsOn: 'this module: a path anchored to its own folder' });
      else if (c.others.length) place('S6', node, { what: `${what}: a path into ${c.others.join(', ')}'s folder`, mayRefer: c.others, waitsOn: `${c.others.join(', ')}: an exported starter for its program` });
    }
  }
  /** A module named by a written-out specifier (import(), require(), mock.module): its module object is used. */
  function loadOf(spec, node, type) {
    const target = resolver.resolve(spec, node.getSourceFile().fileName);
    if (!target) return;
    const m = tree.moduleOfFile(target);
    if (!m || m === mod.id) return;
    const sf = program.getSourceFile(target);
    const listed = !!sf && tree.byId.get(m).public.includes(target);
    addUse({ module: m, item: listed ? '*' : rel(target), kind: listed ? 'module' : 'file', listed }, node, type);
  }
  function receiver(fnExpr, recv, node) {
    const s = resolve(checker.getSymbolAtLocation(ts.isPropertyAccessExpression(fnExpr) ? fnExpr.name : fnExpr));
    const d = s?.valueDeclaration;
    if (!d || isHostFile(d.getSourceFile())) return;
    const cls = d.parent && ts.isClassLike(d.parent) ? d.parent : null;
    if (cls) {
      const inst = checker.getTypeAtLocation(cls);
      if (recv && !assignable(typeAt(recv), inst)) place('R18', node, { what: `hands a receiver of kind ${checker.typeToString(typeAt(recv))} to a method of ${cls.name?.text ?? 'a class'}`, mayRefer: [ANY] });
      return;
    }
    let usesThis = false;
    const body = d.body ?? (ts.isVariableDeclaration(d) ? d.initializer : null);
    if (body) forEachNode(body, (x) => { if (x.kind === ts.SyntaxKind.ThisKeyword) usesThis = true; if (x !== body && (ts.isFunctionDeclaration(x) || ts.isFunctionExpression(x))) return false; });
    if (usesThis && !tagsOf(d, 'this').length) place('R18', node, { what: 'hands a receiver to a function that reads this and states no kind for it', mayRefer: [ANY] });
  }
  function cast(n) {
    const S = typeAt(n.expression), T = typeAt(n);
    if (!S || !T) return;
    relate(S, T, n.expression, n, 'a cast');
    if (hasUnknown(S) || (S.flags & ts.TypeFlags.Any)) {
      if (!ownChannel(n.expression)) place('R2', n, { what: `gives a value of kind ${checker.typeToString(S)} the kind ${checker.typeToString(T)}: decoding a value not from this module's own channel`, waitsOn: 'the owner of the data: its reader' });
      return;
    }
    if (!assignable(S, T)) place('R16', n, { what: `a cast from ${checker.typeToString(S)} down to ${checker.typeToString(T)}`, mayRefer: [ANY] });
  }
  /**
   * A class's members against the class it extends, its own side and its static side (R5 for overrides), and the class
   * against each kind its comment says it implements (@implements), member by member.
   */
  function overrides(cls) {
    const isStatic = (m) => !!(ts.getCombinedModifierFlags(m) & ts.ModifierFlags.Static);
    for (const h of cls.heritageClauses ?? []) if (h.token === ts.SyntaxKind.ExtendsKeyword) for (const t of h.types) {
      const base = typeAt(t);
      const baseStatic = typeAt(t.expression);
      if (!base) continue;
      for (const m of cls.members) {
        if (!m.name || !(ts.isMethodDeclaration(m) || ts.isPropertyDeclaration(m) || ts.isGetAccessor(m) || ts.isSetAccessor(m))) continue;
        const bp = checker.getPropertyOfType(isStatic(m) ? baseStatic : base, m.name.getText());
        if (!bp) continue;
        for (const d of bp.declarations ?? []) addUse(entryOf(d), m.name, 'extends');
        const own = checker.getSymbolAtLocation(m.name);
        if (own) structure(checker.getTypeOfSymbol(own), checker.getTypeOfSymbol(bp), null, m, `the override ${m.name.getText()}`, 0);
      }
    }
    for (const tag of ts.getJSDocImplementsTags?.(cls) ?? []) {
      const T = tag.class ? typeAt(tag.class) : undefined;
      if (T) relate(checker.getTypeAtLocation(cls.name ?? cls), T, null, cls.name ?? cls, 'a class and a kind it implements');
    }
  }
  function ownInterface(sf) {
    const fileSym = checker.getSymbolAtLocation(sf);
    for (const exp of fileSym ? checker.getExportsOfModule(fileSym) : []) {
      const sym = resolve(exp);
      const d = sym?.declarations?.[0];
      if (!d || d.getSourceFile() !== sf) continue;
      const name = exp.name;
      const fn = ts.isFunctionDeclaration(d) ? d : ts.isVariableDeclaration(d) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) ? d.initializer : null;
      const t = checker.getTypeOfSymbol(sym);
      // S4 (i): every export states the kinds of its parameters and of its result
      if (fn) {
        const host = ts.isVariableDeclaration(d) ? d : null;
        const whole = host && (ts.getJSDocType(host) || (host.parent?.parent && ts.getJSDocType(host.parent.parent)));
        const missing = whole ? [] : [...fn.parameters.filter((p) => !ts.getJSDocType(p) && !p.type && !p.initializer).map((p) => `parameter ${p.name.getText()}`), ...(ts.getJSDocReturnType(fn) || fn.type || ts.getJSDocType(fn) ? [] : ['its result'])];
        if (missing.length) place('S4', d, { what: `the export ${name} states no kind for ${missing.join(', ')}`, mayRefer: modulesOf(kindDecls(t)), waitsOn: 'this module: stated kinds', item: name });
      }
      // R4: nothing untyped handed out
      for (const sig of t.getCallSignatures()) {
        const r = checker.getReturnTypeOfSignature(sig);
        if (hasAny(r) || hasUnknown(r)) place('R4', d, { what: `the export ${name} hands out a value of kind ${checker.typeToString(r)}`, mayRefer: [], waitsOn: 'this module: a stated kind for what it hands out', item: name });
        for (const p of sig.getParameters()) for (const cs of checker.getTypeOfSymbol(p).getCallSignatures()) for (const cp of cs.getParameters()) {
          const ct = checker.getTypeOfSymbol(cp);
          if (hasAny(ct) || hasUnknown(ct)) place('R4', d, { what: `the export ${name} hands a callback a value of kind ${checker.typeToString(ct)}`, mayRefer: [], waitsOn: 'this module: a stated kind for what it hands out', item: name });
        }
      }
      if (!t.getCallSignatures().length && (sym.flags & ts.SymbolFlags.Variable) && (t.flags & ts.TypeFlags.Any || t.flags & ts.TypeFlags.Unknown)) place('R4', d, { what: `the export ${name} is of kind ${checker.typeToString(t)}`, mayRefer: [], item: name });
    }
  }
  // R3: a guard written in any of the module's files narrows only to the module's own kind, from a value of no product kind
  for (const sf of files) forEachNode(sf, (n) => {
    if (!ts.isFunctionLike(n) || !n.parameters) return;
    let sig; try { sig = checker.getSignatureFromDeclaration(n); } catch { sig = undefined; }
    const pred = sig && checker.getTypePredicateOfSignature(sig);
    if (!pred?.type) return;
    const param = sig.getParameters()[pred.parameterIndex ?? 0];
    const from = param ? checker.getTypeOfSymbol(param) : undefined;
    if (!isOwnKind(pred.type) || (from && productKind(from) && !hasUnknown(from))) place('R3', n, { what: `a guard to ${checker.typeToString(pred.type)} from ${from ? checker.typeToString(from) : 'a value'}`, mayRefer: modulesOf([...kindDecls(pred.type), ...(from ? kindDecls(from) : [])]), waitsOn: 'this module, or the provider: its class or guard' });
  });

  // ---- copies (S13): marked copies are references; a literal exactly equal to an earlier module's export is listed ----
  readCopies({ tree, mod, files, checker, wheres, addUse, addUseAt, place, copies, indexOf });
  // S10: configuration in the module's folders names code only of its own
  for (const f of otherFiles(tree, mod)) {
    if (!/(^|\/)(package\.json|wrangler\.jsonc?)$/.test(f)) continue;
    let cfgText = text(path.join(tree.root, f));
    try {
      const data = JSON.parse(cfgText.replace(/^\s*\/\/.*$/gm, ''));
      walkJson(data, '', (v, ptr) => {
        if (typeof v !== 'string' || !/^\.{1,2}\//.test(v)) return;
        const o = ownersOfPath(path.resolve(path.join(tree.root, path.dirname(f)), v));
        const others = [...(o ?? [])].filter((m) => m !== mod.id);
        if (others.length) outside.set(`S10|${f}|${ptr}`, { rule: 'S10', file: f, side: sideOf(mod.entry, f) ?? 'code', line: lineIn(cfgText, JSON.stringify(v)), what: `${f}${ptr} names ${v}, in ${others.join(', ')}'s folder`, mayRefer: others, waitsOn: 'ARCH: the configuration to its owner', tests: [] });
      });
    } catch { /* not JSON */ }
  }

  // ---- the result ----
  const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
  const order = (a, b) => indexOf(a.provider) - indexOf(b.provider) || cmp(a.item, b.item) || cmp(a.type, b.type) || cmp(a.value ?? '', b.value ?? '') || cmp(a.member ?? '', b.member ?? '');
  const byPlace = (a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) || a.line - b.line || String(a.test ?? a.in ?? '').localeCompare(String(b.test ?? b.in ?? ''));
  const usesOut = [...uses.values()].map((u) => ({ ...u, where: [...u.where.values()].sort(byPlace) })).sort(order);
  const providers = [...new Set(usesOut.map((u) => u.provider))].sort((a, b) => indexOf(a) - indexOf(b));
  return {
    module: mod.id,
    providers,
    uses: usesOut,
    outside: [...outside.values()].sort((a, b) => byPlace(a, b) || a.rule.localeCompare(b.rule) || a.what.localeCompare(b.what)),
    orderFaults: [...orderFaults.values()].sort((a, b) => order(a, b) || byPlace(a, b)),
    // the uses file keeps the hand-written copies in JSON files (build text 2c); the marked copies are uses, and the
    // candidates (written-out values equal to an earlier module's) are for the conversion to judge
    copies: [...copies].filter(([k]) => k.startsWith('hand|')).map(([, v]) => v),
    marked: [...copies].filter(([k, v]) => !k.startsWith('hand|') && v.marked).map(([, v]) => v).sort((a, b) => byPlace(a, b) || String(a.provider).localeCompare(String(b.provider))),
    candidates: [...copies].filter(([k, v]) => !k.startsWith('hand|') && !v.marked).map(([, v]) => v).sort((a, b) => byPlace(a, b) || String(a.provider).localeCompare(String(b.provider))),
    facilities: [...inventory.keys()].sort(),
    packages: [...inventory].map(([facility, p]) => ({ package: p, facility })).sort((a, b) => a.package.localeCompare(b.package) || a.facility.localeCompare(b.facility)),
  };
}

// ---- copies (S13) ----

/** The literal values an earlier module's interface files export, read from their text: `export const X = <literal>`
 * and the members of an object written out there. */
function exportedLiterals(tree, m) {
  const out = [];
  const names = new Set();
  for (const f of m.public) {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    // Read once per run for each file and text: every module's reading asks for every other module's (civicsmith ARCH #28).
    const had = LITERALS.get(f);
    const got = had?.id === m.id && had.text === text ? had : (() => { const r = { id: m.id, text, ...literalsIn(f, text, m.id) }; if (LITERALS.size >= 20000) LITERALS.clear(); LITERALS.set(f, r); return r; })();
    if (!got.ok) continue;
    for (const l of got.literals) out.push({ ...l });
    for (const n of got.names) names.add(n);
  }
  return { literals: out, names };
}
const LITERALS = new Map(); // file -> { id, text, ok, literals, names }
function literalsIn(f, text, id) {
  const out = [];
  const names = [];
  let sf;
  try { sf = ts.createSourceFile(f, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS); } catch { return { ok: false, literals: [], names: [] }; }
  for (const st of sf.statements) {
    const exported = st.modifiers?.some((x) => x.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause)) for (const e of st.exportClause.elements) names.push(e.name.text);
    for (const d of st.jsDoc ?? []) for (const t of d.tags ?? []) if ((ts.isJSDocTypedefTag(t) || ts.isJSDocCallbackTag(t)) && t.name) names.push(t.name.getText());
    if (!exported) continue;
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) names.push(st.name.text);
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (!ts.isIdentifier(d.name)) continue;
      names.push(d.name.text);
      const walk = (e, item, depth) => {
        while (e && (ts.isParenthesizedExpression(e) || ts.isAsExpression?.(e))) e = e.expression;
        if (e && ts.isCallExpression(e) && /^Object\.freeze$/.test(e.expression.getText()) && e.arguments[0]) e = e.arguments[0];
        const v = folded(e);
        if (v !== undefined) { out.push({ provider: id, item, value: v }); return; }
        if (e && ts.isObjectLiteralExpression(e) && depth < 3) for (const p of e.properties) if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) walk(p.initializer, `${item}.${p.name.text}`, depth + 1);
      };
      walk(d.initializer, d.name.text, 0);
    }
  }
  return { ok: true, literals: out, names };
}
/** A constant expression's value: a literal, or + of literals (constant folding); undefined otherwise. */
function folded(e) {
  if (!e) return undefined;
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
  if (ts.isNumericLiteral(e)) return Number(e.text);
  if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand)) return -Number(e.operand.text);
  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const a = folded(e.left), b = folded(e.right);
    return a === undefined || b === undefined ? undefined : a + b;
  }
  return undefined;
}
/** Worth comparing: a text of at least four characters with a letter, or a number of at least 100 (coincidences aside). */
const significant = (v) => (typeof v === 'string' ? v.length >= 4 && /[A-Za-z]/.test(v) : typeof v === 'number' && Math.abs(v) >= 100);
const keyOf = (v) => `${typeof v}:${v}`;

function walkJson(v, ptr, f) {
  f(v, ptr);
  if (Array.isArray(v)) v.forEach((x, i) => walkJson(x, `${ptr}/${i}`, f));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walkJson(x, `${ptr}/${k.replace(/~/g, '~0').replace(/\//g, '~1')}`, f);
}
const lineIn = (text, needle) => { const i = text.indexOf(needle); return i < 0 ? 1 : text.slice(0, i).split('\n').length; };

/** The module's files that are not code: data, configuration and text under its paths. */
function otherFiles(tree, mod) {
  const out = [];
  const code = new Set(mod.files.map((f) => path.relative(tree.root, f).split(path.sep).join('/')));
  const seen = new Set();
  const walk = (rel) => {
    const abs = path.join(tree.root, rel);
    let st; try { st = fs.statSync(abs); } catch { return; }
    if (st.isDirectory()) { for (const e of fs.readdirSync(abs)) if (e !== 'node_modules' && e !== '.git') walk(rel ? `${rel.replace(/\/$/, '')}/${e}` : e); return; }
    if (!st.isFile() || code.has(rel) || seen.has(rel) || st.size > 1 << 20) return;
    seen.add(rel);
    if (tree.moduleOfFile(abs) === mod.id || tree.moduleOfFile(abs) === null && sideOf(mod.entry, rel)) out.push(rel);
  };
  for (const p of [...(mod.entry.files ?? []), ...(mod.entry.tests ?? [])]) walk(p.replace(/\/$/, ''));
  return out.filter((r) => { const o = ownerPath(tree, r); return o === mod.id; });
}
function ownerPath(tree, rel) {
  let best = null, len = -1;
  for (const m of tree.modules) for (const p of [...(m.entry.files ?? []), ...(m.entry.tests ?? [])]) if (underPath(rel, p) && p.length > len) { best = m.id; len = p.length; }
  return best;
}

function readCopies({ tree, mod, files, checker, wheres, addUse, addUseAt, place, copies, indexOf }) {
  const lits = new Map();
  const exportsOf = new Map();
  for (const m of tree.modules) {
    if (m.id === mod.id) continue;
    const { literals, names } = exportedLiterals(tree, m);
    exportsOf.set(m.id, { literals, names });
    if (m.index > mod.index) continue;
    for (const l of literals) if (significant(l.value)) { const k = keyOf(l.value); if (!lits.has(k)) lits.set(k, []); lits.get(k).push(l); }
  }
  const valueOf = (provider, item) => exportsOf.get(provider)?.literals.find((l) => l.item === item)?.value;
  /** A marked copy: its module and item, from `@copyof m:item` or a name `copyOf_<m>_<item>`. */
  function parseMark(text) {
    const m = /^([a-z0-9-]+):(\S+)$/.exec(text.trim());
    return m ? { provider: m[1], item: m[2] } : null;
  }
  function parseName(id) {
    if (!id.startsWith('copyOf_')) return null;
    const rest = id.slice(7);
    const cand = tree.modules.filter((m) => m.id !== mod.id).map((m) => ({ m, key: `${m.id.replace(/-/g, '_')}_` })).filter((x) => rest.startsWith(x.key)).sort((a, b) => b.key.length - a.key.length)[0];
    if (!cand) return { provider: null, item: rest };
    const raw = rest.slice(cand.key.length);
    const ex = exportsOf.get(cand.m.id);
    let item = raw;
    if (!ex.names.has(raw)) {
      const parts = raw.split('_');
      for (let i = 1; i < parts.length; i++) { const top = parts.slice(0, i).join('_'); if (ex.names.has(top)) { item = `${top}.${parts.slice(i).join('_')}`; break; } }
      if (item === raw) { const hit = ex.literals.find((l) => l.item.endsWith(`.${raw}`)); if (hit) item = hit.item; }
    }
    return { provider: cand.m.id, item };
  }
  const topItem = (provider, item) => { const ex = exportsOf.get(provider); if (!ex) return null; if (ex.names.has(item)) return item; const top = item.split('.')[0]; return ex.names.has(top) ? top : null; };
  function marked(provider, item, node, mark, value) {
    if (!provider || !tree.byId.has(provider)) { place('S13', node, { what: `marks a copy of ${mark}, which names no module`, waitsOn: 'this module: the mark' }); return; }
    const top = topItem(provider, item);
    if (!top) { place('S13', node, { what: `marks a copy of ${provider}:${item}, which ${provider} does not export`, mayRefer: [provider], waitsOn: `${provider}: the item it marks` }); return; }
    addUse({ module: provider, item: top, kind: 'copy of', listed: true }, node, 'marked copy');
    if (indexOf(provider) > mod.index) return;
    const theirs = valueOf(provider, item);
    for (const w of wheres(node)) {
      const c = { provider, item, file: w.file, side: w.side, line: w.line, ...(w.test ? { test: w.test } : {}), marked: mark };
      if (value !== undefined) c.value = value;
      if (value !== undefined && theirs !== undefined && value !== theirs) c.differs = { here: value, provider: theirs };
      copies.set(`${c.file}|${c.line}|${c.test ?? ''}|${provider}|${item}`, c);
    }
  }
  const tagged = (n, name) => { for (let p = n; p && !ts.isSourceFile(p); p = p.parent) { const t = ts.getJSDocTags(p).filter((x) => x.tagName.text === name); if (t.length) return t; if (ts.isStatement(p)) break; } return []; };
  for (const sf of files) {
    forEachNode(sf, (n) => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text.startsWith('copyOf_')) {
        const pm = parseName(n.name.text);
        marked(pm?.provider, pm?.item, n, n.name.text, folded(n.initializer));
        return;
      }
      if ((ts.isVariableDeclaration(n) || ts.isParenthesizedExpression(n)) && ts.getJSDocTags(n.parent && ts.isVariableDeclarationList(n.parent) ? n.parent.parent : n).some((t) => t.tagName.text === 'copyof') || (ts.isParenthesizedExpression(n) && ts.getJSDocTags(n).some((t) => t.tagName.text === 'copyof'))) {
        const holder = ts.isVariableDeclaration(n) ? n.parent.parent : n;
        for (const t of ts.getJSDocTags(holder).filter((x) => x.tagName.text === 'copyof')) {
          const text = tagText(t);
          const pm = parseMark(text);
          marked(pm?.provider, pm?.item, n, `@copyof ${text}`, folded(ts.isVariableDeclaration(n) ? n.initializer : n.expression));
        }
        return;
      }
      // a literal exactly equal to an earlier module's exported value, unmarked: listed
      const lit = ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isNumericLiteral(n) || (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken && !(n.parent && ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.PlusToken));
      if (!lit) return;
      if (ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.PlusToken && folded(n.parent) !== undefined) return;
      const v = folded(n);
      if (v === undefined || !significant(v) || !lits.has(keyOf(v))) return;
      if (!isValuePosition(n) || copyMarked(n) || tagged(n, 'notcopy').length) return;
      // a literal at a place whose expected kind is the provider's own literal kind is a reference, found by its kind
      let ct; try { ct = checker.getContextualType(n); } catch { ct = undefined; }
      const kindOwners = new Set();
      for (const u of ct ? (ct.flags & ts.TypeFlags.Union ? ct.types : [ct]) : []) for (const s of [ct.aliasSymbol, u.aliasSymbol, u.symbol]) for (const d of s?.declarations ?? []) { const m = tree.moduleOfFile(d.getSourceFile().fileName); if (m) kindOwners.add(m); }
      for (const l of lits.get(keyOf(v))) {
        if (kindOwners.has(l.provider)) continue;
        for (const w of wheres(n)) {
          const c = { provider: l.provider, item: l.item, file: w.file, side: w.side, line: w.line, ...(w.test ? { test: w.test } : {}) };
          copies.set(`${c.file}|${c.line}|${c.test ?? ''}|${c.provider}|${c.item}`, c);
        }
      }
    }, { jsDoc: true });
  }
  // Data and text files: copies marked in a comment; JSON values exactly equal to an earlier module's; and the
  // hand-written entries for copies in data files, kept as they are and read as uses.
  const dataUse = (provider, item, file, line) => {
    const side = sideOf(mod.entry, file) ?? 'code';
    addUseAt({ module: provider, item: topItem(provider, item) ?? item, kind: 'copy of', listed: !!topItem(provider, item) }, { file, side, line }, 'marked copy');
  };
  const hand = handCopies(readUses(tree.root, mod.id, { cfg: tree.cfg }));
  const handAt = new Set(hand.map((h) => `${h.file}|${h.pointer}`));
  for (const h of hand) {
    let line = 1;
    try { const body = fs.readFileSync(path.join(tree.root, h.file), 'utf8'); const last = h.pointer.split('/').pop(); if (last) line = lineIn(body, JSON.stringify(last.replace(/~1/g, '/').replace(/~0/g, '~'))); } catch { /* the file is gone: the entry is kept as written */ }
    if (tree.byId.has(h.provider)) dataUse(h.provider, h.item, h.file, line);
    copies.set(`hand|${h.file}|${h.pointer}|${h.provider}|${h.item}`, h);
  }
  for (const f of otherFiles(tree, mod)) {
    const abs = path.join(tree.root, f);
    let body; try { body = fs.readFileSync(abs, 'utf8'); } catch { continue; }
    if (body.slice(0, 1024).includes('\u0000')) continue;
    const side = sideOf(mod.entry, f) ?? 'code';
    for (const m of body.matchAll(/@copyof\s+([a-z0-9-]+):([^\s*>]+)/g)) {
      const line = body.slice(0, m.index).split('\n').length;
      if (!tree.byId.has(m[1])) continue;
      dataUse(m[1], m[2], f, line);
      copies.set(`${f}|${line}|${m[1]}|${m[2]}`, { provider: m[1], item: m[2], file: f, side, line, marked: `@copyof ${m[1]}:${m[2]}` });
    }
    if (!f.endsWith('.json')) continue;
    let data; try { data = JSON.parse(body); } catch { continue; }
    walkJson(data, '', (v, ptr) => {
      if (!significant(v) || !lits.has(keyOf(v)) || handAt.has(`${f}|${ptr}`)) return;
      for (const l of lits.get(keyOf(v))) copies.set(`${f}|${ptr}|${l.provider}|${l.item}`, { provider: l.provider, item: l.item, file: f, side, line: lineIn(body, JSON.stringify(v)), pointer: ptr });
    });
  }
}
function copyMarked(n) {
  for (let p = n.parent; p && !ts.isStatement(p); p = p.parent) {
    if (ts.isVariableDeclaration(p) && ts.isIdentifier(p.name) && p.name.text.startsWith('copyOf_')) return true;
    if (ts.isParenthesizedExpression(p) && ts.getJSDocTags(p).some((t) => t.tagName.text === 'copyof')) return true;
  }
  return false;
}
/** A literal used as a value: not a module's name, a member's name, a test's name or a key. */
function isValuePosition(n) {
  const p = n.parent;
  if (!p) return false;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference?.(p) || ts.isLiteralTypeNode(p)) return false;
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isPropertySignature(p)) && p.name === n) return false;
  if (ts.isElementAccessExpression(p) && p.argumentExpression === n) return false;
  if (ts.isCallExpression(p) && (p.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(p.expression) && p.expression.text === 'require'))) return false;
  if (ts.isCallExpression(p) && isTestCall(p) && p.arguments[0] === n) return false;
  for (let q = p; q; q = q.parent) if (q.kind >= ts.SyntaxKind.FirstJSDocNode && q.kind <= ts.SyntaxKind.LastJSDocNode) return false;
  return true;
}
