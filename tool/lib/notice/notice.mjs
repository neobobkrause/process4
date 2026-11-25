// The notice (design part 2, section 7; build text 1b, command 11; build text 5, sections 5 and 6): given the product
// before and after a change to one module, which of its items changed, and who is told and why.
//
// What changed: each item's means (means.mjs), worked out on both sides with the same tool and settings, and compared;
// every item whose means differs, or that is removed, is a changed item. Where only what it accepts differs, and the
// type checker confirms that the new item accepts more (rule 52, rule 7 for the tool), it tells no one. A new item tells
// no one. An item's first means, at the module's conversion (a merged job whose block's kind is `conversion`), tells
// no one. An unknown kind becoming known tells no one (the owner's decision 2 of 25 November and its union case,
// decision 1B). Added to these: the items whose meaning ARCH names in the work it placed, and the pull request declares
// (`named`): a name or a declaration may add a changed item, never remove one.
//
// Who is told (build text 5, section 6): a lookup in the later modules' uses files, with no user's code read. Each
// module whose uses file names a changed item or a member of a changed type (by its provider and name, whatever the
// route), or holds a marked copy of one; and, on any change to the provider's files whether or not an item changed,
// each module with a place outside the standard whose `mayRefer` names the provider, each module with an order fault
// naming it (an earlier module, whose file is read too), and each later module with no uses file yet that imports it
// (its files' imports, read as text: usesfile.mjs). Each is told once, with the reasons of build text 5, section 5.
import fs from 'node:fs';
import path from 'node:path';
import { loadTree } from './model.mjs';
import { ts, loadReader, makeStandardProgram, readerVersion } from './ts.mjs';
import { makeLister } from './listing.mjs';
import { moduleMeans, meansSideOf, MEANS_SIDE } from './means.mjs';
import { same, standsIn, render } from './canon.mjs';
import { importedModules, readUses } from '../usesfile.mjs';

/** A module's uses file on one side, its lists made lists (build text 2c), or null where it has none (or none that reads). */
function usesOf(tree, module) {
  const d = tree.byId.has(module) ? readUses(tree.root, module, { cfg: tree.cfg }) : null;
  if (!d || typeof d !== 'object') return null;
  const list = (x) => (Array.isArray(x) ? x.filter((y) => y && typeof y === 'object') : []);
  return {
    uses: list(d.uses).filter((u) => typeof u.provider === 'string' && typeof u.item === 'string').map((u) => ({ ...u, where: list(u.where) })),
    outside: list(d.outside), orderFaults: list(d.orderFaults), copies: list(d.copies),
  };
}

/** A reason keeps the first six places it names, and says how many more there are, so a notice keeps a size. */
export const PLACES_SHOWN = 6;

/** How each changed item was found (design part 2, section 7), in words. */
export const FOUND = { means: 'its means', named: "ARCH's placed work", declared: "the pull request's declaration" };

/**
 * An unknown kind becoming known tells no one (design part 2, section 7, "What counts as a change"): where the reader
 * read "anything" before and a kind is stated after, the running code is the same; only what the reader knows changed.
 * `known(before, after)` is the canonical form before with each "anything" replaced by the kind stated at the same place
 * after, so that only the other differences are judged. Places are matched by field name, and lists item by item (the
 * members of a union only where both have as many).
 */
export function known(b, a) {
  if (b && typeof b === 'object' && !Array.isArray(b) && b.k === 'any' && a && typeof a === 'object' && !Array.isArray(a) && a.k !== undefined && a.k !== 'any') return a;
  if (Array.isArray(b) && Array.isArray(a)) return b.map((x, i) => (i < a.length ? known(x, a[i]) : x));
  if (!b || !a || typeof b !== 'object' || typeof a !== 'object' || Array.isArray(a)) return b;
  if (b.k === 'union' && a.k === 'union' && b.of?.length !== a.of?.length) return b;
  const out = {};
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? known(v, a[k]) : v;
  return out;
}

/**
 * Rule 52, and what counts as a change (design part 2, section 7): the questions put to the type checker about one item,
 * before and after. One program reads the module's interface files on both sides and, written only in memory, a file
 * that names each item's declaration on each side and asks:
 * - **the same**: whether its two declarations, or the same part of each (what it accepts, what it hands back), are
 *   identical by the checker's own identity relation (TypeScript's "subsequent variable declarations must have the same
 *   type"). A kind's name given or dropped, a type parameter renamed, a handle kind renamed with the same members, are
 *   the same; anything the checker can tell apart is not.
 * - **accepts more**: whether everything the old accepted, the new accepts, and what it hands back is the same. For a
 *   function, method, class member or class with one signature and no type parameter, the old argument list is assigned
 *   to the new (`Parameters`, `ConstructorParameters`), and what it hands back (`ReturnType`, `InstanceType`) is asked
 *   to be the same; for an operation, its request and its answer the same way; for a kind on the accepting side, the
 *   old kind is assigned to the new; for a generic or overloaded item, the new is assigned to the old as a whole, which
 *   only confirms what the written forms already show as accepting more.
 *   The checker relates a method's parameters both ways and lets "anything" through (its documented unsound points):
 *   where either side's accepted part holds a method, a class's object or "anything", nothing is confirmed.
 * Never confirmed: what the checker does not prove. Asked once per pair of sides and module, for every item whose
 * written forms differ, in one program.
 */
const CONFIRMS = new WeakMap();
let confirmFiles = 0;
export function makeConfirm(treeB, treeA, moduleId) {
  if (!CONFIRMS.has(treeB)) CONFIRMS.set(treeB, new WeakMap());
  const byA = CONFIRMS.get(treeB);
  if (!byA.has(treeA)) byA.set(treeA, new Map());
  const byM = byA.get(treeA);
  if (!byM.has(moduleId)) byM.set(moduleId, buildConfirm(treeB, treeA, moduleId));
  return byM.get(moduleId);
}

const NOT_FOUND = 'the item cannot be found to ask the type checker';
const UNSOUND = "what it accepts holds a method, a class's object or \"anything\", which the type checker relates both ways: it cannot prove it";

function buildConfirm(treeB, treeA, moduleId) {
  const answers = new Map();
  const asked = new Map(); // item -> the way it was asked
  const ways = (item) => asked.get(item);
  const sides = () => [meansSideOf(treeB, moduleId) ?? (treeB.byId.has(moduleId) ? (moduleMeans(treeB, moduleId), meansSideOf(treeB, moduleId)) : null),
    meansSideOf(treeA, moduleId) ?? (treeA.byId.has(moduleId) ? (moduleMeans(treeA, moduleId), meansSideOf(treeA, moduleId)) : null)];
  const q = (s) => JSON.stringify(s);
  const generic = (c) => !!c && /"k":"generic"|"tparams"/.test(JSON.stringify(c));
  /** The type of an item's declaration on one side (S, the side's module), and of its parts, as the checker writes them. */
  function exprsOf(name, meta, simple, S) {
    let whole = null;
    const m = /^([^.#:]+)([.#])(.+)$/.exec(name);
    if (name.startsWith('op:')) whole = meta.table ? `${S}.${meta.table}[${q(name.slice(3))}]` : null;
    else if (name.startsWith('table:')) whole = meta.rowKind ? `${S}.${meta.rowKind}` : null;
    else if (name.includes(':')) whole = null; // a name two interface files export for two things
    else if (m) {
      const [, owner, sep, member] = m;
      if (member.startsWith('#') || member.startsWith('__')) whole = null;
      else if (meta.kind === 'class member') whole = sep === '.' ? `(typeof ${S}.${owner})[${q(member)}]` : `${S}.${owner}[${q(member)}]`;
      else whole = `${S}.${owner}[${q(member)}]`;
    } else whole = ['function', 'value', 'class'].includes(meta.kind) ? `typeof ${S}.${name}` : `${S}.${name}`;
    if (!whole) return null;
    if (meta.kind === 'operation') return { whole, accepts: `${whole}['req']`, handsBack: `${whole}['res']`, way: 'parts' };
    if (meta.kind === 'class' && simple) return { whole, accepts: `ConstructorParameters<${whole}>`, handsBack: `InstanceType<${whole}>`, way: 'parts' };
    if (['function', 'method', 'class member'].includes(meta.kind) && simple) {
      return { whole, accepts: `Parameters<NonNullable<${whole}>>`, handsBack: `ReturnType<NonNullable<${whole}>>`, way: 'parts' };
    }
    const isKind = ['kind', 'handle kind', 'operation table', 'stored rows'].includes(meta.kind);
    return { whole, accepts: whole, handsBack: whole, way: isKind ? 'in' : 'out' };
  }
  /** Asks the checker about the given items, in one program. */
  function ask(names) {
    const [sb, sa] = sides();
    const n = `${process.pid}-${confirmFiles++}`;
    let text = `import type * as B from './.p4-confirm-${n}-b.mjs';\nimport type * as A from './.p4-confirm-${n}-a.mjs';\n`;
    const questions = [];
    const add = (item, what, body) => { questions.push({ item, what, start: text.length, end: text.length + body.length }); text += `${body}\n`; };
    const ways = new Map();
    for (const name of names) {
      const ib = sb?.items[name], ia = sa?.items[name];
      // asked part by part only where both sides have one signature and no type parameter
      const simple = [ib, ia].every((it) => it?.accepts?.k === 'params' && !generic(it.accepts) && !generic(it.handsBack) && it.handsBack?.k !== 'overloads');
      const eb = ib && exprsOf(name, sb.meta[name] ?? {}, simple, 'B'), ea = ia && exprsOf(name, sa.meta[name] ?? {}, simple, 'A');
      answers.set(name, { same: { accepts: false, handsBack: false }, more: { confirmed: false, why: NOT_FOUND } });
      if (!eb || !ea || eb.way !== ea.way) continue;
      const k = ways.size;
      ways.set(name, { k, way: eb.way });
      asked.set(name, eb.way);
      // the same: identical, and each assignable to the other (the identity relation takes a stated undefined and the
      // mark of an optional member for one; assignability under exactOptionalPropertyTypes does not)
      for (const part of ['accepts', 'handsBack']) {
        add(name, part, `declare var q${k}_${part}: ${eb[part]};\ndeclare var q${k}_${part}: ${ea[part]};\n`
          + `declare const q${k}_${part}_b: ${eb[part]};\nconst q${k}_${part}_ba: ${ea[part]} = q${k}_${part}_b;\n`
          + `declare const q${k}_${part}_a: ${ea[part]};\nconst q${k}_${part}_ab: ${eb[part]} = q${k}_${part}_a;`);
      }
      // the old accepted part handed to the new; for a generic or overloaded item, the new item handed to the old
      if (eb.way === 'out') add(name, 'more', `declare const q${k}_o: ${ea.whole};\nconst q${k}_n: ${eb.whole} = q${k}_o;`);
      else add(name, 'more', `declare const q${k}_o: ${eb.accepts};\nconst q${k}_n: ${ea.accepts} = q${k}_o;`);
    }
    if (!questions.length) return;
    text += 'export {};\n';
    const dir = treeA.root;
    const barrel = (tree) => (tree.byId.get(moduleId)?.public ?? []).map((f) => `export * from ${q(f)};`).join('\n') || 'export {};';
    const file = path.join(dir, `.p4-confirm-${n}.mts`);
    const virtual = new Map([[path.join(dir, `.p4-confirm-${n}-b.mts`), barrel(treeB)], [path.join(dir, `.p4-confirm-${n}-a.mts`), barrel(treeA)], [file, text]]);
    const program = makeStandardProgram([...(treeB.byId.get(moduleId)?.public ?? []), ...(treeA.byId.get(moduleId)?.public ?? [])], undefined, virtual);
    const checker = program.getTypeChecker();
    const sf = program.getSourceFile(file);
    const diags = [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)];
    const failed = (x) => diags.some((d) => d.start !== undefined && d.start >= x.start && d.start < x.end);
    const declared = new Map();
    for (const st of sf.statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) declared.set(d.name.text, checker.getTypeAtLocation(d.name));
    }
    for (const x of questions) if (x.what !== 'more') answers.get(x.item).same[x.what] = !failed(x);
    for (const x of questions.filter((y) => y.what === 'more')) {
      const r = answers.get(x.item);
      const { k, way } = ways.get(x.item);
      const no = failed(x);
      if (no || [declared.get(`q${k}_o`), declared.get(`q${k}_n`)].some((t) => !t || unproven(checker, t))) {
        r.more = { confirmed: false, why: !no ? UNSOUND : way === 'out' ? 'the type checker does not find the new item assignable to the old'
          : way === 'in' ? 'the type checker does not find the old kind assignable to the new' : 'the type checker does not find that the new item accepts everything the old did' };
      } else if (way === 'parts' && !r.same.handsBack) r.more = { confirmed: false, why: 'the type checker does not find the new item assignable to the old: what it hands back is not the same' };
      else r.more = { confirmed: true };
    }
  }
  const answer = (item) => {
    if (!answers.has(item)) {
      const [sb, sa] = sides();
      // every item on both sides whose written forms differ, asked at once
      const differ = sb && sa ? Object.keys(sa.items).filter((n) => sb.items[n] && !answers.has(n)
        && (!same(known(sb.items[n].accepts, sa.items[n].accepts) ?? null, sa.items[n].accepts ?? null) || !same(known(sb.items[n].handsBack, sa.items[n].handsBack) ?? null, sa.items[n].handsBack ?? null))) : [];
      ask([...new Set([item, ...differ])]);
    }
    return answers.get(item) ?? { same: { accepts: false, handsBack: false }, more: { confirmed: false, why: NOT_FOUND } };
  };
  const confirm = (item) => answer(item).more;
  confirm.same = (item, part) => answer(item).same[part];
  // Where the written forms cannot show that an item accepts more, only a question part by part, or about a kind handed
  // in, says so: a generic or overloaded item handed to the old as a whole may hand back otherwise for some calls.
  confirm.acceptsMore = (item) => answer(item).more.confirmed && ways(item) !== 'out';
  return confirm;
}

/**
 * Whether the checker's answer about a type cannot be relied on: it holds "anything", a member written as a method, or a
 * class's object (whose methods are methods), each of which the checker relates both ways.
 */
function unproven(checker, t, seen = new Set(), depth = 0) {
  if (!t || seen.has(t) || depth > 12) return false;
  seen.add(t);
  const f = t.flags;
  if (f & ts.TypeFlags.Any) return true;
  if (f & (ts.TypeFlags.Union | ts.TypeFlags.Intersection)) return t.types.some((m) => unproven(checker, m, seen, depth + 1));
  if (!(f & ts.TypeFlags.Object)) return false;
  if (((t.objectFlags & ts.ObjectFlags.Reference ? t.target?.objectFlags : 0) | t.objectFlags) & ts.ObjectFlags.Class) return true;
  for (const a of t.objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(t) : []) if (unproven(checker, a, seen, depth + 1)) return true;
  // a list, or a kind of the language's own library (Promise, Map...): its arguments only, not the library's own methods
  const lib = (t.symbol?.declarations ?? []).some((d) => d.getSourceFile().isDeclarationFile);
  if (checker.isArrayType(t) || checker.isTupleType(t) || (lib && !t.symbol?.name?.startsWith('__'))) return false;
  for (const s of [...t.getCallSignatures(), ...t.getConstructSignatures()]) {
    if (s.declaration && (ts.isMethodSignature(s.declaration) || ts.isMethodDeclaration(s.declaration))) return true;
    for (const p of s.getParameters()) if (unproven(checker, checker.getTypeOfSymbol(p), seen, depth + 1)) return true;
    if (unproven(checker, s.getReturnType(), seen, depth + 1)) return true;
  }
  for (const p of checker.getPropertiesOfType(t)) {
    if ((p.declarations ?? []).some((d) => ts.isMethodSignature(d) || ts.isMethodDeclaration(d))) return true;
    if (unproven(checker, checker.getTypeOfSymbol(p), seen, depth + 1)) return true;
  }
  for (const i of checker.getIndexInfosOfType(t)) if (unproven(checker, i.type, seen, depth + 1)) return true;
  return false;
}

/** The means of an item for people: each part, its kinds written out. */
export function describe(it) {
  if (!it) return null;
  const d = { kind: it.kind };
  if (it.accepts !== undefined) d.accepts = render(it.accepts);
  if (it.handsBack !== undefined) d.handsBack = render(it.handsBack);
  if (it.optional) d.optional = true;
  if (it.bounds?.length) d.bounds = it.bounds;
  for (const k of ['throws', 'instances', 'writesArguments', 'channels', 'typeErrors']) if (it[k]?.length) d[k] = it[k];
  if (it.needsThis) d.needsThis = true;
  return d;
}

const show = (x) => (Array.isArray(x) ? (x.length ? x.join(', ') : 'none') : x === undefined || x === null ? 'nothing' : typeof x === 'boolean' ? (x ? 'yes' : 'no') : String(x));

/** The checker's questions about one item, where both sides' means say where they were read from (moduleMeans). */
function askerOf(b, a) {
  const sb = b?.[MEANS_SIDE], sa = a?.[MEANS_SIDE];
  if (!sb || !sa || sb.name !== sa.name || sb.side.moduleId !== sa.side.moduleId || sb.side.tree === sa.side.tree) return null;
  const confirm = makeConfirm(sb.side.tree, sa.side.tree, sb.side.moduleId);
  return { same: (part) => confirm.same(sb.name, part), acceptsMore: () => confirm.acceptsMore(sb.name) };
}

/**
 * Compares the means of one item before and after: the parts that differ, each with its word, and the one-line why.
 * Returns null where nothing differs.
 */
export function compareItem(b, a) {
  const parts = [];
  const whys = [];
  const differ = (word, x, y, text = (u) => show(u)) => { parts.push(word); whys.push(`${word}: ${text(x)} -> ${text(y)}`); };
  if (b.kind !== a.kind) differ('kind changed', b.kind, a.kind);
  // What it accepts and hands back before, with each "anything" that is a stated kind after read as that kind.
  const ba = known(b.accepts, a.accepts), bh = known(b.handsBack, a.handsBack);
  // Iteration 5 (rule 33): an added overload that keeps every old signature only accepts more.
  const sigPairs = (accepts, handsBack) => (accepts?.k === 'overloads' ? accepts.of.map((p, i) => JSON.stringify([p, handsBack?.of?.[i]])) : accepts?.k === 'params' ? [JSON.stringify([accepts, handsBack])] : null);
  const pb = sigPairs(ba, bh), pa = sigPairs(a.accepts, a.handsBack);
  // Where the written forms differ, the type checker is asked about the declarations themselves (makeConfirm): a part
  // it finds the same is unchanged (a kind's name given or dropped, a type parameter renamed); one it confirms accepts
  // more, where the written forms cannot show it (a function handed in that is handed less), accepts more.
  const ask = askerOf(b, a);
  if (pb && pa && (ba?.k === 'overloads' || a.accepts?.k === 'overloads') && pb.length < pa.length && pb.every((x, i) => pa[i] === x)) differ('accepts more', render(ba), render(a.accepts));
  else {
    if (!same(ba ?? null, a.accepts ?? null) && !ask?.same('accepts')) differ(standsIn(ba ?? null, a.accepts ?? null) || ask?.acceptsMore() ? 'accepts more' : 'cannot stand in', ba, a.accepts, (u) => (u ? render(u) : 'nothing'));
    if (!same(bh ?? null, a.handsBack ?? null) && !ask?.same('handsBack')) differ('hands back differently', bh, a.handsBack, (u) => (u ? render(u) : 'nothing'));
  }
  if (!!a.optional && !b.optional) differ('may now be missing', false, true);
  if (!same(b.bounds ?? [], a.bounds ?? [])) differ('bound changed', b.bounds ?? [], a.bounds ?? []);
  if (!same(b.throws ?? [], a.throws ?? [])) differ('errors that can leave it changed', b.throws ?? [], a.throws ?? []);
  if (!same(b.instances ?? [], a.instances ?? [])) differ('plain data or instance changed', b.instances ?? [], a.instances ?? []);
  if (!!b.needsThis !== !!a.needsThis) differ(a.needsThis ? 'now needs its object as this' : 'no longer needs its object as this', !!b.needsThis, !!a.needsThis);
  if (!same(b.writesArguments ?? [], a.writesArguments ?? [])) differ('arguments written into changed', b.writesArguments ?? [], a.writesArguments ?? []);
  if (!same(b.channels ?? [], a.channels ?? [])) differ('channels, settings or files changed', b.channels ?? [], a.channels ?? []);
  // A type error in the item's code counts as a change: a new one, or, while it has one, any change to its code (the
  // stated kinds then do not bind the code).
  if (a.typeErrors?.length && (!same(b.typeErrors ?? [], a.typeErrors) || b.code !== a.code)) differ('type error in its code', b.typeErrors ?? [], a.typeErrors);
  return parts.length ? { parts, why: whys.join('; ') } : null;
}

/** The parts of the means that differ, for the reason a told job reads (before and after). */
function partsThatDiffer(b, a) {
  const db = describe(b) ?? {}, da = describe(a) ?? {};
  const before = {}, after = {};
  for (const k of new Set([...Object.keys(db), ...Object.keys(da)])) {
    if (JSON.stringify(db[k]) === JSON.stringify(da[k])) continue;
    before[k] = db[k] ?? null;
    after[k] = da[k] ?? null;
  }
  return { before, after };
}

/** Whether a used item is reached by a changed one: the same item, or a member or field of it (Amount.cents, Rooms.find of Rooms). */
const matches = (changed, used) => used === changed || used.startsWith(`${changed}.`) || used.startsWith(`${changed}#`);

/** A place of a uses file in a reason's form: `<file>:<line>`, then its function or, in a test, its test case's name. */
export const placeText = (w) => `${w.file}${w.line ? `:${w.line}` : ''}${w.test ? ` ${w.test}` : w.in ? ` ${w.in}` : ''}${w.pointer ? ` ${w.pointer}` : ''}`;

/** A reason's places: the first six, then `and N more`, so a notice is never lost for its size (build text 5, section 5). */
function firstPlaces(where) {
  const seen = new Map();
  for (const w of where) seen.set(`${w.file}|${w.line ?? ''}|${w.test ?? ''}|${w.pointer ?? ''}`, w);
  const all = [...seen.values()].sort((x, y) => (x.file < y.file ? -1 : x.file > y.file ? 1 : (x.line ?? 0) - (y.line ?? 0)));
  return [...all.slice(0, PLACES_SHOWN).map(placeText), ...(all.length > PLACES_SHOWN ? [`and ${all.length - PLACES_SHOWN} more`] : [])];
}

/**
 * The changed items of one module between two sides.
 * @param named [{ module?, item, line, found: 'named' | 'declared' }]: the items whose meaning ARCH named or the pull
 *   request declared; one with no module (a pull request that is not a job's) belongs to this module where it has the item
 * @param conversion true where the merged pull request is the module's conversion: its first means tell no one
 */
export function changedItems(treeB, treeA, moduleId, { named = [], conversion = false } = {}) {
  const mb = treeB.byId.has(moduleId) ? moduleMeans(treeB, moduleId) : { items: {} };
  const ma = treeA.byId.has(moduleId) ? moduleMeans(treeA, moduleId) : { items: {} };
  const confirm = makeConfirm(treeB, treeA, moduleId);
  const out = [];
  const fresh = [];
  for (const item of [...new Set([...Object.keys(mb.items), ...Object.keys(ma.items)])].sort()) {
    const b = mb.items[item], a = ma.items[item];
    if (!a) { out.push({ module: moduleId, item, found: 'means', changes: ['removed'], tells: !conversion, why: null, before: describe(b), after: null }); continue; }
    if (!b) { fresh.push(item); continue; }
    const c = compareItem(b, a);
    if (!c) continue;
    let tells = true, notConfirmed;
    // Accepting more tells no one, where the type checker confirms it (rule 52).
    if (c.parts.every((p) => p === 'accepts more')) {
      const r = confirm(item);
      if (r.confirmed) tells = false;
      else { c.parts = ['cannot stand in']; notConfirmed = r.why; }
    }
    if (conversion) tells = false;
    out.push({ module: moduleId, item, found: 'means', changes: c.parts, tells, why: null, words: c.why, ...(notConfirmed ? { notConfirmed } : {}), ...partsThatDiffer(b, a) });
  }
  const mine = named.filter((n) => (n.module ? n.module === moduleId : !!(ma.items[n.item] ?? mb.items[n.item])));
  for (const n of mine) {
    const had = out.find((x) => x.item === n.item);
    if (had) {
      if (!had.changes.includes('meaning changed')) had.changes.push('meaning changed');
      had.why = had.why ? `${had.why}; ${n.line}` : n.line;
      had.namedBy = [...new Set([...(had.namedBy ?? []), n.found])];
      had.tells = true;
    } else out.push({ module: moduleId, item: n.item, found: n.found, changes: ['meaning changed'], tells: true, why: n.line, before: { meaning: n.line.split(';')[0].trim() }, after: { meaning: n.line.split(';').slice(1).join(';').trim() } });
  }
  return { module: moduleId, changed: out, fresh, conversion };
}

/**
 * The notice for one change.
 * @param before the product before the change (a folder, or loadTree's product)
 * @param after the product after it
 * @param provider the module that changed
 * @param o.named the items whose meaning ARCH named or the pull request declared
 * @param o.filesChanged whether the merge changed the provider's files (a change that only names an item's meaning does not)
 * @param o.conversion whether the merged pull request is the provider's conversion
 */
export function notice(before, after, provider, { named = [], filesChanged = true, conversion = false } = {}) {
  loadReader();
  const treeOf = (x) => (typeof x === 'string' ? loadTree(x) : x);
  const B = treeOf(before), A = treeOf(after);
  if (!A.byId.has(provider)) throw new Error(`no such module: ${provider}`);
  const report = { provider, reader: `TypeScript ${readerVersion()}`, conversion, changed: [], fresh: [], told: [], summary: '' };
  const mine = changedItems(B, A, provider, { named, conversion });
  report.fresh = mine.fresh;
  report.changed.push(...mine.changed);
  // A new operation whose name another module already answers: that module's operation now answers differently
  // (iteration 2 of the proof), so its users are told.
  const newOps = mine.fresh.filter((n) => n.startsWith('op:'));
  if (newOps.length && !conversion) {
    // only a module whose own code marks a table of operations can answer one (build text 2b, section 5)
    const answers = (m) => m.src.some((f) => { try { return /@optable\b/.test(fs.readFileSync(f, 'utf8')); } catch { return false; } });
    for (const m of A.modules) {
      if (m.id === provider || !answers(m)) continue;
      const l = makeLister(makeStandardProgram(m.src), A).list(m);
      for (const op of newOps) if (l.entries[op]) report.changed.push({ module: m.id, item: op, found: 'means', changes: [`${provider} now answers the same name`], tells: true, why: null, words: `${provider} now answers the operation ${op.slice(3)} too` });
    }
  }
  const telling = report.changed.filter((c) => c.tells);
  // The modules whose changed items are told; and the provider, whose files changed, for those that hear of any change.
  const byModule = new Map();
  for (const c of telling) { if (!byModule.has(c.module)) byModule.set(c.module, []); byModule.get(c.module).push(c); }
  if (filesChanged && !byModule.has(provider)) byModule.set(provider, []);
  const order = [...new Set([...A.modules.map((m) => m.id), ...B.modules.map((m) => m.id)])];
  const indexOf = (id) => A.byId.get(id)?.index ?? B.byId.get(id)?.index ?? -1;
  const itemsOf = (m) => byModule.get(m).map((c) => c.item);
  const anyChange = (m) => (itemsOf(m).length ? `${itemsOf(m).join(', ')} changed` : `its files changed, though no item's means did`);
  for (const user of order) {
    const before = [...byModule.keys()].filter((m) => indexOf(m) < indexOf(user));
    // An order fault is a use of a later module: the module that holds it may come before the changed one.
    const faultable = [...byModule.keys()].filter((m) => m !== user);
    if (!before.length && !faultable.length) continue;
    const files = [usesOf(B, user), usesOf(A, user)].filter(Boolean);
    const reasons = [];
    if (!files.length) {
      // No uses file yet (before the module's conversion): told of any change to the files of an earlier module it
      // imports, whether or not an item changed.
      const imported = new Set([A, B].flatMap((t) => (t.byId.has(user) ? [...importedModules(t, t.byId.get(user)).imported.keys()] : [])));
      for (const m of before.filter((x) => imported.has(x) && (x === provider ? filesChanged : true))) {
        reasons.push({ module: m, items: itemsOf(m), found: 'any change', changes: [], why: `${anyChange(m)}; ${user} has no uses file yet and imports ${m}`,
          noUsesFile: `${user} has no uses file yet: its whole tests run` });
      }
    } else {
      // The file before and after the change, read as one: each entry once.
      const once = (list) => [...new Map(list.map((x) => [JSON.stringify(x), x])).values()];
      const uses = files.flatMap((f) => f.uses);
      const copies = once(files.flatMap((f) => f.copies));
      const outside = once(files.flatMap((f) => f.outside));
      const faults = once(files.flatMap((f) => f.orderFaults));
      for (const m of before) {
        for (const c of byModule.get(m)) {
          const hits = uses.filter((u) => u.provider === m && matches(c.item, u.item));
          const marked = copies.filter((x) => x.provider === m && typeof x.item === 'string' && matches(c.item, x.item));
          if (!hits.length && !marked.length) continue;
          const route = hits.some((h) => h.route === 'direct' || !h.route) || !hits.length ? 'direct' : hits[0].route;
          reasons.push({ module: m, item: c.item, found: c.found, ...(c.namedBy ? { namedBy: c.namedBy } : {}), changes: [...c.changes], why: c.why ?? null, route,
            places: firstPlaces([...hits.flatMap((h) => h.where), ...marked.map((x) => ({ file: x.file, line: x.line, pointer: x.pointer }))]),
            ...(c.before !== undefined ? { before: c.before, after: c.after } : {}) });
        }
        // A place outside the standard hears of any change to the files of a module it may refer to, until a job
        // converts it; where it cannot say which (`*`, or no `mayRefer`), of every earlier module (design part 2, section
        // 7, rule 2 for the tool). One whose `mayRefer` is empty refers to no other module.
        if (m === provider ? filesChanged : true) {
          for (const o of outside) {
            const may = Array.isArray(o.mayRefer) ? o.mayRefer.map(String) : ['*'];
            if (!may.includes('*') && !may.includes(m)) continue;
            reasons.push({ module: m, items: itemsOf(m), found: 'any change', changes: [], outside: `${o.rule ?? 'outside'} ${o.file}:${o.line ?? ''}`,
              why: `${anyChange(m)}; a place outside the coding standard that may refer to ${may.includes('*') ? 'any earlier module' : may.join(', ')}`,
              places: firstPlaces([{ file: o.file, line: o.line, ...(o.tests?.length ? { test: o.tests.join('; ') } : {}) }]) });
          }
        }
      }
      // An order fault is a place outside the standard: the module that holds it hears of any change to the files of the
      // module it names, whether or not an item changed, until it is converted (design part 2, section 7).
      for (const m of faultable) {
        if (!(m === provider ? filesChanged : byModule.get(m).length)) continue;
        for (const f of faults) {
          const names = typeof f === 'string' ? [f] : [f.provider, f.module, ...(Array.isArray(f.mayRefer) ? f.mayRefer : [])].filter(Boolean);
          if (!names.includes(m)) continue;
          reasons.push({ module: m, items: itemsOf(m), found: 'any change', changes: [], orderFault: `${f.rule ?? 'order'} ${f.file ?? ''}:${f.line ?? ''}`,
            why: `${anyChange(m)}; an order fault names ${m}`, places: f.file ? firstPlaces([{ file: f.file, line: f.line }]) : [] });
        }
      }
    }
    if (reasons.length) report.told.push({ user, reasons });
  }
  report.summary = telling.length ? `${telling.length} item${telling.length === 1 ? '' : 's'} changed in a way that tells; ${report.told.length} module(s) told.`
    : `${conversion ? `${provider}'s conversion: its first means tell no one` : report.changed.length ? 'No changed item tells anyone (each only accepts more, as the type checker confirms)' : 'No item\'s means changed'}; ${report.told.length ? `${report.told.length} module(s) that hear of any change told.` : 'nobody is told.'}`;
  return report;
}

/** Writes a notice for people (build text 2b, section 6). */
export function noticeText(r) {
  const L = [`Notice for a change to ${r.provider} (${r.reader})`, r.summary];
  for (const c of r.changed) {
    L.push(`  ${c.module} ${c.item}: ${c.changes.join(', ')} [found by ${[c.found, ...(c.namedBy ?? [])].map((f) => FOUND[f] ?? f).join(', ')}] -> tells ${c.tells ? 'its users' : 'no one'}`);
    if (c.words) L.push(`      means: ${c.words}`);
    if (c.why) L.push(`      meaning: ${c.why}`);
    if (c.notConfirmed) L.push(`      accepts more, not confirmed: ${c.notConfirmed}`);
  }
  for (const t of r.told) {
    L.push(`  TOLD ${t.user}`);
    for (const x of t.reasons) {
      const at = (x.places ?? []).join(', ');
      if (x.item) L.push(`      uses ${x.module} ${x.item} (${x.changes.join(', ')}; found by ${[x.found, ...(x.namedBy ?? [])].map((f) => FOUND[f] ?? f).join(', ')}) at ${at || 'no place named'}`);
      else L.push(`      ${x.outside ? `outside the standard, ${x.outside}` : x.orderFault ? `order fault, ${x.orderFault}` : 'no uses file'}: ${x.why}`);
    }
  }
  return L.join('\n');
}
