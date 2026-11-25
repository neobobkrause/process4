// The notice (design part 2, section 7; build text 1b, command 11; build text 5, sections 5 and 6): given the product
// before and after a change to one module, which of its items changed, and who is told and why.
//
// What changed: each item's means (means.mjs), worked out on both sides with the same tool and settings, and compared;
// every item whose means differs, or that is removed, is a changed item. Where only what it accepts differs, and the
// type checker confirms that the new item accepts more (rule 52, rule 7 for the tool), it tells no one. A new item tells
// no one. An item's first means, at the module's conversion (no uses file before, one after), tells no one. An unknown
// kind becoming known tells no one (the owner's decision 2 of 25 November and its union case, decision 1B). Added to
// these: the items whose meaning ARCH names in the work it placed, and the job declares in its pull request (`named`):
// a name or a declaration may add a changed item, never remove one.
//
// Who is told: a lookup in the later modules' uses files, with no user's code read. Each module whose uses file names a
// changed item (by its provider and name, whatever the route through a middle module), each module with a place
// outside the standard that may refer to the changed module, and each module with an order fault naming it; a module
// with no uses file yet, of every change of an earlier module it imports (the import scan, imports.mjs). Each is told
// once, with one reason for each changed item it uses: the item, how it was found, the one-line why, and the places
// from its uses file (its first six and how many more).
import fs from 'node:fs';
import { loadTree } from './model.mjs';
import { ts, loadReader, makeProgram, readerVersion, standardOptions, tagsOf, tagText } from './ts.mjs';
import { makeLister } from './listing.mjs';
import { moduleMeans } from './means.mjs';
import { same, standsIn, render } from './canon.mjs';
import { makeFollow } from './imports.mjs';
import { hasUsesFile, readUsesFile } from '../usesfile.mjs';

/** A reason keeps the first six places it names, and says how many more there are, so a notice keeps a size. */
export const PLACES_SHOWN = 6;

/** How each changed item was found (design part 2, section 7). */
export const FOUND = { means: 'its means', named: "ARCH's placed work", declared: "the job's declaration" };

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
 * Rule 52. One program reads the interface files of the module before and after; for an item found to accept more, the
 * type checker is asked: for a function, method, class or value, is the new one assignable to the old; for what a user
 * hands in (a kind on the accepting side, an operation's request, a table's rows), is the old one assignable to the new.
 */
export function makeConfirm(treeB, treeA, moduleId) {
  let program = null;
  let checker = null;
  const exportsOf = (tree) => {
    const out = new Map();
    for (const f of tree.byId.get(moduleId)?.public ?? []) {
      const sf = program.getSourceFile(f);
      const ms = sf && checker.getSymbolAtLocation(sf);
      if (!ms) continue;
      for (const exp of checker.getExportsOfModule(ms)) {
        if (out.has(exp.name)) continue;
        out.set(exp.name, exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp);
      }
    }
    return out;
  };
  const marked = (sym, tag) => (sym.declarations ?? []).some((d) => tagsOf(d, tag).length);
  /** The type to ask about for an item, and which way to ask: 'out' (new to old) or 'in' (old to new). */
  function typeOf(tree, item) {
    const ex = exportsOf(tree);
    const aliasType = (sym) => checker.getDeclaredTypeOfSymbol(sym);
    if (item.startsWith('op:')) {
      const name = item.slice(3);
      for (const sym of ex.values()) {
        if (!(sym.flags & ts.SymbolFlags.TypeAlias) || !marked(sym, 'optable')) continue;
        const p = checker.getPropertyOfType(aliasType(sym), name);
        const req = p && checker.getPropertyOfType(checker.getTypeOfSymbol(p), 'req');
        if (req) return { t: checker.getTypeOfSymbol(req), way: 'in' };
      }
      return null;
    }
    if (item.startsWith('table:')) {
      const table = item.slice(6);
      for (const sym of ex.values()) {
        if (sym.flags & ts.SymbolFlags.TypeAlias && (sym.declarations ?? []).some((d) => tagsOf(d, 'storedrows').some((t) => tagText(t).split(/\s+/)[0] === table))) return { t: aliasType(sym), way: 'in' };
      }
      return null;
    }
    const m = /^([^.#]+)([.#])(.+)$/.exec(item);
    if (m) {
      const owner = ex.get(m[1]);
      if (!owner) return null;
      let host;
      if (owner.flags & ts.SymbolFlags.TypeAlias) host = aliasType(owner);
      else if (m[2] === '.') host = checker.getTypeOfSymbol(owner);
      else host = checker.getDeclaredTypeOfSymbol(owner);
      const p = checker.getPropertyOfType(host, m[3]);
      return p ? { t: checker.getTypeOfSymbol(p), way: 'out' } : null;
    }
    const sym = ex.get(item);
    if (!sym) return null;
    if (sym.flags & ts.SymbolFlags.TypeAlias) return { t: aliasType(sym), way: 'in' };
    return { t: checker.getTypeOfSymbol(sym), way: 'out' };
  }
  return function confirm(item) {
    if (!program) {
      program = makeProgram([...(treeB.byId.get(moduleId)?.public ?? []), ...(treeA.byId.get(moduleId)?.public ?? [])], undefined, standardOptions());
      checker = program.getTypeChecker();
    }
    const o = typeOf(treeB, item);
    const n = typeOf(treeA, item);
    if (!o || !n || o.way !== n.way) return { confirmed: false, why: 'the item cannot be found to ask the type checker' };
    const ok = o.way === 'out' ? checker.isTypeAssignableTo(n.t, o.t) : checker.isTypeAssignableTo(o.t, n.t);
    return ok ? { confirmed: true } : { confirmed: false, why: o.way === 'out' ? 'the type checker does not find the new item assignable to the old' : 'the type checker does not find the old kind assignable to the new' };
  };
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
  if (pb && pa && (ba?.k === 'overloads' || a.accepts?.k === 'overloads') && pb.length < pa.length && pb.every((x, i) => pa[i] === x)) differ('accepts more', render(ba), render(a.accepts));
  else {
    if (!same(ba ?? null, a.accepts ?? null)) differ(standsIn(ba ?? null, a.accepts ?? null) ? 'accepts more' : 'cannot stand in', ba, a.accepts, (u) => (u ? render(u) : 'nothing'));
    if (!same(bh ?? null, a.handsBack ?? null)) differ('hands back differently', bh, a.handsBack, (u) => (u ? render(u) : 'nothing'));
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

/** A place of a uses file in its printed form: file:line, and for a test its case's name. */
export const placeText = (w) => `${w.file}${w.line ? `:${w.line}` : ''}${w.test ? ` (test "${w.test}")` : ''}`;

/** The first places of a reason, and how many more. */
function firstPlaces(where) {
  const seen = new Map();
  for (const w of where) seen.set(`${w.file}|${w.line}|${w.test ?? ''}`, w);
  const all = [...seen.values()].sort((x, y) => (x.file < y.file ? -1 : x.file > y.file ? 1 : (x.line ?? 0) - (y.line ?? 0)));
  return { places: all.slice(0, PLACES_SHOWN), ...(all.length > PLACES_SHOWN ? { more: all.length - PLACES_SHOWN } : {}) };
}

/**
 * The changed items of one module between two sides.
 * @param named [{ item, was, is, found: 'named' | 'declared' }] the items whose meaning ARCH named or the job declared
 */
export function changedItems(treeB, treeA, moduleId, named = []) {
  const mb = treeB.byId.has(moduleId) ? moduleMeans(treeB, moduleId) : { items: {} };
  const ma = treeA.byId.has(moduleId) ? moduleMeans(treeA, moduleId) : { items: {} };
  // The first means, at the module's conversion: no uses file before, one after.
  const firstMeans = treeB.byId.has(moduleId) && !hasUsesFile(readUsesFile(treeB, moduleId)) && hasUsesFile(readUsesFile(treeA, moduleId));
  const confirm = makeConfirm(treeB, treeA, moduleId);
  const out = [];
  const fresh = [];
  for (const item of [...new Set([...Object.keys(mb.items), ...Object.keys(ma.items)])].sort()) {
    const b = mb.items[item], a = ma.items[item];
    if (!a) { out.push({ module: moduleId, item, found: ['means'], changes: ['removed'], tells: true, why: `removed (was ${b.kind})`, before: describe(b), after: null }); continue; }
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
    if (firstMeans) tells = false;
    out.push({ module: moduleId, item, found: ['means'], changes: c.parts, tells, why: c.why, ...(notConfirmed ? { notConfirmed } : {}), ...partsThatDiffer(b, a) });
  }
  for (const n of named) {
    const had = out.find((x) => x.item === n.item);
    const words = `meaning: ${n.was || '(not said)'} -> ${n.is || '(not said)'}`;
    if (had) {
      if (!had.found.includes(n.found)) had.found.push(n.found);
      if (!had.changes.includes('meaning changed')) had.changes.push('meaning changed');
      had.why = `${had.why}; ${words}`;
      had.tells = true;
    } else out.push({ module: moduleId, item: n.item, found: [n.found], changes: ['meaning changed'], tells: true, why: words, before: { meaning: n.was ?? null }, after: { meaning: n.is ?? null } });
  }
  return { module: moduleId, changed: out, fresh, firstMeans, meansAfter: ma };
}

/**
 * The notice for one change.
 * @param before the product before the change (a folder, or loadTree's product)
 * @param after the product after it
 * @param provider the module that changed
 * @param named the items whose meaning ARCH named or the job declared: [{ module?, item, was, is, found }]
 */
export function notice(before, after, provider, { named = [] } = {}) {
  loadReader();
  const treeOf = (x) => (typeof x === 'string' ? loadTree(x) : x);
  const B = treeOf(before), A = treeOf(after);
  if (!A.byId.has(provider)) throw new Error(`no such module: ${provider}`);
  const report = { provider, reader: `TypeScript ${readerVersion()}`, firstMeans: false, changed: [], fresh: [], told: [], summary: '' };
  const mine = changedItems(B, A, provider, named.filter((n) => (n.module ?? provider) === provider));
  report.firstMeans = mine.firstMeans;
  report.fresh = mine.fresh;
  report.changed.push(...mine.changed);
  // A new operation whose name another module already answers: that module's operation now answers differently
  // (iteration 2 of the proof), so its users are told.
  const newOps = mine.fresh.filter((n) => n.startsWith('op:'));
  if (newOps.length) {
    // only a module whose own code marks a table of operations can answer one (build text 2b, section 5)
    const answers = (m) => m.src.some((f) => { try { return /@optable\b/.test(fs.readFileSync(f, 'utf8')); } catch { return false; } });
    for (const m of A.modules) {
      if (m.id === provider || !answers(m)) continue;
      const l = makeLister(makeProgram(m.src, undefined, standardOptions()), A).list(m);
      for (const op of newOps) if (l.entries[op]) report.changed.push({ module: m.id, item: op, found: ['means'], changes: [`${provider} now answers the same name`], tells: true, why: `${provider} now answers the operation ${op.slice(3)} too` });
    }
  }
  const telling = report.changed.filter((c) => c.tells);
  if (!telling.length) {
    report.summary = report.firstMeans ? `${provider}'s first means (its conversion): no item tells anyone.`
      : report.changed.length ? 'No changed item tells anyone (each only accepts more, as the type checker confirms).' : 'No item\'s means changed. Nobody is told.';
    return report;
  }
  // Who is told: the later modules' uses files, before and after the change, read as one.
  const byModule = new Map();
  for (const c of telling) { if (!byModule.has(c.module)) byModule.set(c.module, []); byModule.get(c.module).push(c); }
  const order = [...new Set([...A.modules.map((m) => m.id), ...B.modules.map((m) => m.id)])];
  const indexOf = (id) => A.byId.get(id)?.index ?? B.byId.get(id)?.index ?? -1;
  const follows = { A: null, B: null };
  for (const user of order) {
    const changedBefore = [...byModule.keys()].filter((m) => indexOf(m) < indexOf(user));
    if (!changedBefore.length) continue;
    const ub = readUsesFile(B, user), ua = readUsesFile(A, user);
    const files = [ub, ua].filter(hasUsesFile);
    const reasons = [];
    if (!files.length) {
      // No uses file yet (before the module's conversion): told of every change of an earlier module it imports.
      follows.A ??= makeFollow(A); follows.B ??= makeFollow(B);
      const imported = new Set([...follows.A.importedModules(user), ...follows.B.importedModules(user)]);
      for (const m of changedBefore.filter((x) => imported.has(x))) {
        const items = byModule.get(m).map((c) => c.item);
        reasons.push({ module: m, items, found: ['no uses file'], why: `${user} has no uses file yet${[ub, ua].find((u) => u?.unreadable) ? ` (it cannot be read: ${[ub, ua].find((u) => u?.unreadable).unreadable})` : ''} and imports ${m}: told of every change of it`, whole: `${user} has no uses file yet: its whole tests run` });
      }
    } else {
      // The file before and after the change, read as one: each entry once.
      const once = (list) => [...new Map(list.map((x) => [JSON.stringify(x), x])).values()];
      const uses = files.flatMap((f) => f.uses);
      const outside = once(files.flatMap((f) => f.outside));
      const faults = once(files.flatMap((f) => f.orderFaults));
      for (const m of changedBefore) {
        for (const c of byModule.get(m)) {
          const hits = uses.filter((u) => u.provider === m && matches(c.item, u.item));
          if (!hits.length) continue;
          reasons.push({ module: m, item: c.item, found: c.found.map((f) => FOUND[f] ?? f), changes: [...c.changes], why: c.why, ...firstPlaces(hits.flatMap((h) => h.where)), ...(c.before !== undefined ? { before: c.before, after: c.after } : {}) });
        }
        // A place outside the standard is told of every change of the modules it may refer to; where it cannot say
        // which, of every earlier module (design part 2, section 7, rule 2 for the tool).
        for (const o of outside) {
          const may = Array.isArray(o.mayRefer) ? o.mayRefer.map(String) : [];
          if (may.length && !may.includes('*') && !may.includes(m)) continue;
          const items = byModule.get(m).map((c) => c.item);
          reasons.push({ module: m, items, found: ['a place outside the standard'], outside: `${o.rule ?? 'outside the standard'} at ${placeText(o)}`,
            why: `a place outside the coding standard (${o.rule ?? 'no rule named'}) that may refer to ${may.length && !may.includes('*') ? may.join(', ') : 'any earlier module'}: told of every change of ${m}`,
            ...firstPlaces([{ file: o.file, line: o.line, side: o.side, ...(o.tests?.length ? { test: o.tests.join('; ') } : {}) }]) });
        }
        // An order fault naming the changed module.
        for (const f of faults) {
          const names = typeof f === 'string' ? [f] : [f.provider, f.module, f.uses, ...(Array.isArray(f.mayRefer) ? f.mayRefer : [])].filter(Boolean);
          if (!names.includes(m)) continue;
          reasons.push({ module: m, items: byModule.get(m).map((c) => c.item), found: ['an order fault'], why: `an order fault names ${m}: told of every change of it`, ...(f.file ? firstPlaces([{ file: f.file, line: f.line, side: f.side }]) : { places: [] }) });
        }
      }
    }
    if (reasons.length) report.told.push({ user, reasons });
  }
  report.summary = `${telling.length} item${telling.length === 1 ? '' : 's'} changed in a way that tells; ${report.told.length} module(s) told.`;
  return report;
}

/** Writes a notice for people (build text 2b, section 6). */
export function noticeText(r) {
  const L = [`Notice for a change to ${r.provider} (${r.reader})`, r.summary];
  for (const c of r.changed) {
    L.push(`  ${c.module} ${c.item}: ${c.changes.join(', ')} [found by ${c.found.map((f) => FOUND[f] ?? f).join(', ')}] -> tells ${c.tells ? 'its users' : 'no one'}`);
    if (c.why) L.push(`      why: ${c.why}`);
    if (c.notConfirmed) L.push(`      accepts more, not confirmed: ${c.notConfirmed}`);
  }
  for (const t of r.told) {
    L.push(`  TOLD ${t.user}`);
    for (const x of t.reasons) {
      const at = [...(x.places ?? []).map(placeText), ...(x.more ? [`and ${x.more} more`] : [])].join(', ');
      if (x.whole) L.push(`      ${x.module} ${x.items.join(', ')}: ${x.why}`);
      else if (x.outside) L.push(`      ${x.module} ${x.items.join(', ')}: ${x.why}, at ${at}`);
      else if (x.items) L.push(`      ${x.module} ${x.items.join(', ')}: ${x.why}${at ? `, at ${at}` : ''}`);
      else L.push(`      uses ${x.module} ${x.item} (${x.changes.join(', ')}; found by ${x.found.join(', ')}) at ${at || 'no place named'}`);
    }
  }
  return L.join('\n');
}
