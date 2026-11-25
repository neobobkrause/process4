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
import { loadTree } from './model.mjs';
import { ts, loadReader, makeStandardProgram, readerVersion, tagsOf, tagText } from './ts.mjs';
import { makeLister } from './listing.mjs';
import { moduleMeans } from './means.mjs';
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
      program = makeStandardProgram([...(treeB.byId.get(moduleId)?.public ?? []), ...(treeA.byId.get(moduleId)?.public ?? [])]);
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
