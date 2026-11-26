// The notice (design part 2, section 7; build text 1b, command 11; build text 5, sections 5 and 6): given the product
// before and after a change to one module, which of its items changed, and who is told and why.
//
// What changed: each item's means (means.mjs), worked out on both sides with the same tool and settings, and compared;
// every item whose means differs, or that is removed, is a changed item. Any difference in what it accepts tells,
// accepting more included (the owner's decision of 25 November, "Who a change tells", item 3); the words `accepts more`
// and `cannot stand in` only say which. A constant's value is in its means. A new item tells no one, unless it changes
// what a name already used resolves to (resolvesAnew). Describing an item (a part read as any value, with no stated type
// or a stated `unknown`, now stated narrower) is no change where the item's code is unchanged or the merge is the
// module's conversion (a merged job whose block's kind is `conversion`); at a conversion every other change tells as
// always. Added to these: the items whose meaning ARCH names in the work it placed, and the pull request declares
// (`named`): a name or a declaration may add a changed item, never remove one; and taken off: an item the tool found
// changed that the pull request records as keeping its domain and range (`sameAs`, push --same), and with it what takes
// in a change only through it. A later module's item whose means take in a changed error or channel of a provider's
// item, as its uses file's `takesIn` records, is a changed item of that module too, and so on through the modules after
// it (takenIn).
//
// Who is told (design part 2, section 7, "Who is told"): a lookup in the later modules' uses files, with no user's code
// read. Each module whose uses file names a changed item or a member of a changed type (by its provider and name,
// whatever the route), or holds a marked copy of one, or reads a kind an earlier module relabelled as its own from a
// changed kind (an S4 place that lists what it `relabels`); where a kind, handle kind or class changed member by member,
// only the uses that change reaches (a member added: the whole value's; one removed, changed or made optional: its
// readers' too), and an item whose means differ only inside such kinds is told through them; a change of meaning alone
// is not told to a module that only hands the value back to a later module that is told; and, on any change to the
// provider's files whether or not an item changed, each module with a place outside the standard whose `mayRefer` names
// the provider, or a test that replaces or mocks one of its members (a use of type `mock`), each module with an order
// fault naming it (an earlier module: from its uses file or, with none, from its imports), and each later module with no
// uses file yet that imports it, directly or through a module that re-exports it, names a path into it, or whose files
// the tool cannot follow (read as text: usesfile.mjs, reachedModules and reExportsReached). A module with no uses file
// yet is the one case where a told module's own files are read: as text, for what they import, never by the reader.
// At the provider's conversion, neither a place outside the standard nor a module with no uses file is told for any
// change (hearsAny). Each is told once, with the reasons of build text 5, section 5. A package's or the host's version
// change tells the modules whose uses files name it (versionNotices).
import fs from 'node:fs';
import path from 'node:path';
import { loadTree } from './model.mjs';
import { loadReader, makeStandardProgram, readerVersion } from './ts.mjs';
import { moduleMeans, meansSideOf, MEANS_SIDE } from './means.mjs';
import { same, standsIn, render } from './canon.mjs';
import { importedModules, reachedModules, reExportsReached, readFacilities, readUses } from '../usesfile.mjs';

/** A module's uses file on one side, its lists made lists (build text 2c), or null where it has none (or none that reads). */
function usesOf(tree, module) {
  const d = tree.byId.has(module) ? readUses(tree.root, module, { cfg: tree.cfg }) : null;
  if (!d || typeof d !== 'object') return null;
  const list = (x) => (Array.isArray(x) ? x.filter((y) => y && typeof y === 'object') : []);
  return {
    uses: list(d.uses).filter((u) => typeof u.provider === 'string' && typeof u.item === 'string').map((u) => ({ ...u, where: list(u.where) })),
    outside: list(d.outside), orderFaults: list(d.orderFaults), copies: list(d.copies),
    takesIn: list(d.takesIn).filter((t) => ['item', 'provider', 'providerItem', 'part'].every((k) => typeof t[k] === 'string')),
    packages: list(d.packages).filter((x) => typeof x.package === 'string'),
  };
}

/** A reason keeps the first six places it names, and says how many more there are, so a notice keeps a size. */
export const PLACES_SHOWN = 6;

/** How each changed item was found (design part 2, section 7), in words. */
export const FOUND = { means: 'its means', named: "ARCH's placed work", declared: "the pull request's declaration" };

/** A part the type checker reads as any value: no stated type (`any`), or one stated that admits every value (`unknown`). */
const admitsAll = (c) => !!c && typeof c === 'object' && !Array.isArray(c) && (c.k === 'any' || (c.k === 'prim' && c.n === 'unknown'));

/**
 * Describing an item is not a change (design part 2, section 7, "Not a change"): where the reader read any value before
 * (no stated type, or a stated `unknown`) and a narrower kind is stated after, and the item's code is unchanged or the
 * change is its module's conversion, only what the reader knows changed (describedBy). `known(before, after)` is the
 * canonical form before with each such part replaced by the kind stated at the same place after, so that only the other
 * differences are judged. Places are matched by field name, and lists item by item (the members of a union only where
 * both have as many). Worked out once for each pair of parts: a part kept once (canon.mjs) gives one part.
 */
const KNOWN = new WeakMap(); // part before -> part after -> known
export function known(b, a) {
  if (!b || !a || typeof b !== 'object' || typeof a !== 'object') return knownOf(b, a);
  if (!KNOWN.has(b)) KNOWN.set(b, new WeakMap());
  const byA = KNOWN.get(b);
  if (!byA.has(a)) byA.set(a, knownOf(b, a));
  return byA.get(a);
}
function knownOf(b, a) {
  if (admitsAll(b) && a && typeof a === 'object' && !Array.isArray(a) && a.k !== undefined && !admitsAll(a)) return a;
  if (Array.isArray(b) && Array.isArray(a)) return b.map((x, i) => (i < a.length ? known(x, a[i]) : x));
  if (!b || !a || typeof b !== 'object' || typeof a !== 'object' || Array.isArray(a)) return b;
  if (b.k === 'union' && a.k === 'union' && b.of?.length !== a.of?.length) return b;
  const out = {};
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? known(v, a[k]) : v;
  return out;
}

/**
 * How an item's parts before are read against its parts after: through `known` where the change describes it (its code,
 * comments left out, unchanged, as `code` of means.mjs says; an item with no code of its own, a kind, has none to
 * change; or the change is the module's conversion), else as they are, so that a part stated after where the code also
 * changed is a change.
 */
export const describedBy = (b, a, conversion = false) => (conversion || b.code === a.code ? known : (x) => x);

/**
 * What counts as a change (design part 2, section 7): whether an item's two declarations, before and after, or the same
 * part of each (what it accepts, what it hands back), are identical by the type checker's own identity relation
 * (TypeScript's "subsequent variable declarations must have the same type"), each assignable to the other. A kind's name
 * given or dropped, a type parameter renamed, a handle kind renamed with the same members, are the same; anything the
 * checker can tell apart is not. One program reads the module's interface files on both sides and, written only in
 * memory, a file that names each item's declaration on each side. Asked once per pair of sides and module, for every
 * item whose written forms differ.
 */
const SAMES = new WeakMap();
let sameFiles = 0;
export function makeSame(treeB, treeA, moduleId) {
  if (!SAMES.has(treeB)) SAMES.set(treeB, new WeakMap());
  const byA = SAMES.get(treeB);
  if (!byA.has(treeA)) byA.set(treeA, new Map());
  const byM = byA.get(treeA);
  if (!byM.has(moduleId)) byM.set(moduleId, buildSame(treeB, treeA, moduleId));
  return byM.get(moduleId);
}

function buildSame(treeB, treeA, moduleId) {
  const answers = new Map();
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
    if (meta.kind === 'operation') return { accepts: `${whole}['req']`, handsBack: `${whole}['res']`, way: 'parts' };
    if (meta.kind === 'class' && simple) return { accepts: `ConstructorParameters<${whole}>`, handsBack: `InstanceType<${whole}>`, way: 'parts' };
    if (['function', 'method', 'class member'].includes(meta.kind) && simple) {
      return { accepts: `Parameters<NonNullable<${whole}>>`, handsBack: `ReturnType<NonNullable<${whole}>>`, way: 'parts' };
    }
    const isKind = ['kind', 'handle kind', 'operation table', 'stored rows'].includes(meta.kind);
    return { accepts: whole, handsBack: whole, way: isKind ? 'in' : 'out' };
  }
  /** Asks the checker about the given items, in one program. */
  function ask(names) {
    const [sb, sa] = sides();
    const n = `${process.pid}-${sameFiles++}`;
    let text = `import type * as B from './.p4-same-${n}-b.mjs';\nimport type * as A from './.p4-same-${n}-a.mjs';\n`;
    const questions = [];
    const add = (item, what, body) => { questions.push({ item, what, start: text.length, end: text.length + body.length }); text += `${body}\n`; };
    let k = 0;
    for (const name of names) {
      const ib = sb?.items[name], ia = sa?.items[name];
      // asked part by part only where both sides have one signature and no type parameter
      const simple = [ib, ia].every((it) => it?.accepts?.k === 'params' && !generic(it.accepts) && !generic(it.handsBack) && it.handsBack?.k !== 'overloads');
      const eb = ib && exprsOf(name, sb.meta[name] ?? {}, simple, 'B'), ea = ia && exprsOf(name, sa.meta[name] ?? {}, simple, 'A');
      answers.set(name, { accepts: false, handsBack: false });
      if (!eb || !ea || eb.way !== ea.way) continue;
      k++;
      // the same: identical, and each assignable to the other (the identity relation takes a stated undefined and the
      // mark of an optional member for one; assignability under exactOptionalPropertyTypes does not)
      for (const part of ['accepts', 'handsBack']) {
        add(name, part, `declare var q${k}_${part}: ${eb[part]};\ndeclare var q${k}_${part}: ${ea[part]};\n`
          + `declare const q${k}_${part}_b: ${eb[part]};\nconst q${k}_${part}_ba: ${ea[part]} = q${k}_${part}_b;\n`
          + `declare const q${k}_${part}_a: ${ea[part]};\nconst q${k}_${part}_ab: ${eb[part]} = q${k}_${part}_a;`);
      }
    }
    if (!questions.length) return;
    text += 'export {};\n';
    const dir = treeA.root;
    const barrel = (tree) => (tree.byId.get(moduleId)?.public ?? []).map((f) => `export * from ${q(f)};`).join('\n') || 'export {};';
    const file = path.join(dir, `.p4-same-${n}.mts`);
    const virtual = new Map([[path.join(dir, `.p4-same-${n}-b.mts`), barrel(treeB)], [path.join(dir, `.p4-same-${n}-a.mts`), barrel(treeA)], [file, text]]);
    const program = makeStandardProgram([...(treeB.byId.get(moduleId)?.public ?? []), ...(treeA.byId.get(moduleId)?.public ?? [])], undefined, virtual);
    const sf = program.getSourceFile(file);
    const diags = [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)];
    const failed = (x) => diags.some((d) => d.start !== undefined && d.start >= x.start && d.start < x.end);
    for (const x of questions) answers.get(x.item)[x.what] = !failed(x);
  }
  return (item, part) => {
    if (!answers.has(item)) {
      const [sb, sa] = sides();
      // every item on both sides whose written forms differ, asked at once
      const differ = sb && sa ? Object.keys(sa.items).filter((n) => sb.items[n] && !answers.has(n)
        && (!same(sb.items[n].accepts ?? null, sa.items[n].accepts ?? null) || !same(sb.items[n].handsBack ?? null, sa.items[n].handsBack ?? null))) : [];
      ask([...new Set([item, ...differ])]);
    }
    return answers.get(item)?.[part] ?? false;
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
  if (it.value !== undefined) d.value = it.value;
  if (it.message) d.message = it.message;
  return d;
}

const show = (x) => (Array.isArray(x) ? (x.length ? x.join(', ') : 'none') : x === undefined || x === null ? 'nothing' : typeof x === 'boolean' ? (x ? 'yes' : 'no') : String(x));

/** The checker's question about one item, where both sides' means say where they were read from (moduleMeans). */
function askerOf(b, a) {
  const sb = b?.[MEANS_SIDE], sa = a?.[MEANS_SIDE];
  if (!sb || !sa || sb.name !== sa.name || sb.side.moduleId !== sa.side.moduleId || sb.side.tree === sa.side.tree) return null;
  const isSame = makeSame(sb.side.tree, sa.side.tree, sb.side.moduleId);
  return (part) => isSame(sb.name, part);
}

/**
 * Compares the means of one item before and after: the parts that differ, each with its word, and the one-line why.
 * Any difference tells, accepting more included (the owner's decision, "Who a change tells", item 3); the words
 * `accepts more` and `cannot stand in` only say which, as the written forms show it. Returns null where nothing differs.
 * @param conversion whether the change is the module's conversion (describedBy)
 */
export function compareItem(b, a, { conversion = false } = {}) {
  const parts = [];
  const whys = [];
  const differ = (word, x, y, text = (u) => show(u)) => { parts.push(word); whys.push(`${word}: ${text(x)} -> ${text(y)}`); };
  if (b.kind !== a.kind) differ('kind changed', b.kind, a.kind);
  // What it accepts and hands back before, with each "anything" that is a stated kind after read as that kind, where
  // that only describes it.
  const k = describedBy(b, a, conversion);
  const ba = k(b.accepts, a.accepts), bh = k(b.handsBack, a.handsBack);
  // Iteration 5 (rule 33): an added overload that keeps every old signature accepts more.
  const sigPairs = (accepts, handsBack) => (accepts?.k === 'overloads' ? accepts.of.map((p, i) => JSON.stringify([p, handsBack?.of?.[i]])) : accepts?.k === 'params' ? [JSON.stringify([accepts, handsBack])] : null);
  const pb = sigPairs(ba, bh), pa = sigPairs(a.accepts, a.handsBack);
  // Where the written forms differ, the type checker is asked about the declarations themselves (makeSame): a part it
  // finds the same is unchanged (a kind's name given or dropped, a type parameter renamed).
  const isSame = askerOf(b, a);
  if (pb && pa && (ba?.k === 'overloads' || a.accepts?.k === 'overloads') && pb.length < pa.length && pb.every((x, i) => pa[i] === x)) differ('accepts more', render(ba), render(a.accepts));
  else {
    if (!same(ba ?? null, a.accepts ?? null) && !isSame?.('accepts')) differ(standsIn(ba ?? null, a.accepts ?? null) ? 'accepts more' : 'cannot stand in', ba, a.accepts, (u) => (u ? render(u) : 'nothing'));
    if (!same(bh ?? null, a.handsBack ?? null) && !isSame?.('handsBack')) differ('hands back differently', bh, a.handsBack, (u) => (u ? render(u) : 'nothing'));
  }
  // A message's channel (`@message stdin`) is part of what it hands back (build text 2b).
  if ((b.message ?? null) !== (a.message ?? null)) {
    if (parts.includes('hands back differently')) whys.push(`message channel: ${show(b.message)} -> ${show(a.message)}`);
    else differ('hands back differently', b.message, a.message, (u) => (u ? `a message on ${u}` : 'no message'));
  }
  if (!!a.optional && !b.optional) differ('may now be missing', false, true);
  if (!same(b.bounds ?? [], a.bounds ?? [])) differ('bound changed', b.bounds ?? [], a.bounds ?? []);
  if (!same(b.throws ?? [], a.throws ?? [])) differ('errors that can leave it changed', b.throws ?? [], a.throws ?? []);
  if (!same(b.instances ?? [], a.instances ?? [])) differ('plain data or instance changed', b.instances ?? [], a.instances ?? []);
  if (!!b.needsThis !== !!a.needsThis) differ(a.needsThis ? 'now needs its object as this' : 'no longer needs its object as this', !!b.needsThis, !!a.needsThis);
  if (!same(b.writesArguments ?? [], a.writesArguments ?? [])) differ('arguments written into changed', b.writesArguments ?? [], a.writesArguments ?? []);
  if (!same(b.channels ?? [], a.channels ?? [])) differ('channels, settings or files changed', b.channels ?? [], a.channels ?? []);
  // A constant's value is in its range: where what its type shows is the same, its code (its value and what makes it)
  // decides.
  if (a.kind === 'value' && b.kind === 'value' && b.code !== a.code && same(bh ?? null, a.handsBack ?? null)) differ('value changed', b.value, a.value);
  // A type error in the item's code counts as a change: a new one, or, while it has one, any change to its code (the
  // stated kinds then do not bind the code) (build text 2b, section 6). An error gone is none: stating a type where the
  // checker read any value takes away its "implicitly has an 'any' type", and the errors the code had before and still
  // has, its code the same, are no new error (civicsmith, 26 Nov 2026: such a conversion told every module importing it).
  const had = new Set(b.typeErrors ?? []);
  if (a.typeErrors?.length && (a.typeErrors.some((e) => !had.has(e)) || b.code !== a.code)) differ('type error in its code', b.typeErrors ?? [], a.typeErrors);
  return parts.length ? { parts, why: whys.join('; ') } : null;
}

/** The parts of the means (describe's fields) that each word of a change names (compareItem; build text 2b, section 6). */
const PARTS_OF = {
  'kind changed': ['kind'], 'accepts more': ['accepts'], 'cannot stand in': ['accepts'], 'hands back differently': ['handsBack', 'message', 'value'],
  'may now be missing': ['optional'], 'bound changed': ['bounds'], 'errors that can leave it changed': ['throws'],
  'plain data or instance changed': ['instances'], 'now needs its object as this': ['needsThis'], 'no longer needs its object as this': ['needsThis'],
  'arguments written into changed': ['writesArguments'], 'channels, settings or files changed': ['channels'], 'value changed': ['value'],
  'type error in its code': ['typeErrors'],
};

/**
 * The parts of the means that differ, for the reason a told job reads (before and after), each as it was and is: the
 * parts its words (`changes`) name, as build text 5, section 5 has both. A part that differs in no way that is a change
 * is not among them: one only described (what was read as any value now stated; design part 2, section 7, "Not a
 * change"), or a type error gone.
 * @param words the words of the change (compareItem's `parts`)
 */
export function partsThatDiffer(b, a, words) {
  const db = describe(b) ?? {}, da = describe(a) ?? {};
  const named = new Set(words.flatMap((w) => PARTS_OF[w] ?? []));
  const before = {}, after = {};
  for (const k of new Set([...Object.keys(db), ...Object.keys(da)])) {
    if (!named.has(k) || JSON.stringify(db[k]) === JSON.stringify(da[k])) continue;
    before[k] = db[k] ?? null;
    after[k] = da[k] ?? null;
  }
  return { before, after };
}

/** Whether a used item is reached by a changed one: the same item, or a member or field of it (Amount.cents, Rooms.find of Rooms). */
const matches = (changed, used) => used === changed || used.startsWith(`${changed}.`) || used.startsWith(`${changed}#`);

/** Uses of an item that call it (by its name, or by an operation's written-out name), take what a call hands back, or only name it. */
const CALLED = new Set(['call', 'operation by name', 'receive', 'import', 'type named', 're-export']);

/** The items whose change can be member by member: a kind of plain data, a handle kind, a class (its instances). */
const MEMBERED = new Set(['kind', 'handle kind', 'class']);
const sameOr = (x, y) => same(x ?? null, y ?? null);

/**
 * For a changed kind of plain data, handle kind or class, which of its members were added, removed, changed, or made
 * optional, where the change is member by member; null where it is not: its kind, what it is used for (accepts, hands
 * back or both), a class's constructor, an index signature, a call signature, its bound lines, or any other part of its
 * means changed. A handle kind's members are items of their own: here only their names count. A class's members here
 * are its instances' (its static members are items of their own).
 */
export function memberChanges(b, a, conversion = false) {
  if (!b || !a || b.kind !== a.kind || !MEMBERED.has(a.kind) || (b.message ?? null) !== (a.message ?? null)) return null;
  for (const k of ['bounds', 'throws', 'instances', 'writesArguments', 'channels', 'typeErrors']) if (!same(b[k] ?? [], a[k] ?? [])) return null;
  if (!!b.needsThis !== !!a.needsThis || !!b.optional !== !!a.optional || (a.typeErrors?.length && b.code !== a.code)) return null;
  const out = { added: [], removed: [], changed: [], optional: [] };
  if (a.kind === 'handle kind') {
    const nb = b.handsBack?.names ?? [], na = a.handsBack?.names ?? [];
    if (b.handsBack?.k !== 'names' || a.handsBack?.k !== 'names') return null;
    out.added = na.filter((x) => !nb.includes(x));
    out.removed = nb.filter((x) => !na.includes(x));
    return out.added.length || out.removed.length ? out : null;
  }
  let sb, sa;
  const known = describedBy(b, a, conversion);
  if (a.kind === 'kind') {
    if ((b.accepts == null) !== (a.accepts == null) || (b.handsBack == null) !== (a.handsBack == null)) return null;
    sb = b.handsBack != null ? known(b.handsBack, a.handsBack) : known(b.accepts, a.accepts);
    sa = a.handsBack ?? a.accepts;
  } else {
    if (!sameOr(known(b.accepts, a.accepts), a.accepts)) return null;
    sb = known(b.handsBack, a.handsBack);
    sa = a.handsBack;
  }
  if (sb?.k !== 'obj' || sa?.k !== 'obj' || sb.name !== sa.name || !sameOr(sb.index, sa.index) || !sameOr(sb.calls, sa.calls)) return null;
  for (const name of [...new Set([...Object.keys(sb.props), ...Object.keys(sa.props)])].sort()) {
    const pb = sb.props[name], pa = sa.props[name];
    if (!pb) out.added.push(name);
    else if (!pa) out.removed.push(name);
    else if (!same(pb, pa)) (pa.opt && !pb.opt ? out.optional : out.changed).push(name);
  }
  // a difference no member shows is the kind's as a whole
  return out.added.length || out.removed.length || out.changed.length || out.optional.length ? out : null;
}

/**
 * A canonical form with each kind named in `names` written by its name only, so that what differs inside it is left out.
 * Worked out once for each part (a part kept once, canon.mjs, gives one part).
 */
const BY_NAME = new WeakMap(); // names -> part -> the part by name
function byName(c, names) {
  if (!c || typeof c !== 'object') return c;
  if (!BY_NAME.has(names)) BY_NAME.set(names, new WeakMap());
  const done = BY_NAME.get(names);
  if (!done.has(c)) done.set(c, byNameOf(c, names));
  return done.get(c);
}
function byNameOf(c, names) {
  if (Array.isArray(c)) return c.map((x) => byName(x, names));
  if (typeof c.name === 'string' && names.has(c.name) && ['obj', 'union', 'and'].includes(c.k)) return { k: 'named', name: c.name };
  return Object.fromEntries(Object.entries(c).map(([k, v]) => [k, byName(v, names)]));
}

/**
 * Whether an item's means differ only inside kinds of its module that changed member by member (`names`, each
 * `<module>.<item>`): what it accepts and hands back are the same once each such kind is written by its name, and every
 * other part is the same. Its users then use those kinds' values, each use judged by the kind's own change.
 */
function onlyInside(b, a, names, conversion = false) {
  if (!names.size || b.kind !== a.kind || (b.message ?? null) !== (a.message ?? null)) return false;
  for (const k of ['bounds', 'throws', 'instances', 'writesArguments', 'channels', 'typeErrors']) if (!same(b[k] ?? [], a[k] ?? [])) return false;
  if (!!b.needsThis !== !!a.needsThis || !!b.optional !== !!a.optional || (a.typeErrors?.length && b.code !== a.code)) return false;
  if (a.kind === 'value' && b.code !== a.code) return false;
  const known = describedBy(b, a, conversion);
  return same(byName(known(b.accepts, a.accepts) ?? null, names), byName(a.accepts ?? null, names))
    && same(byName(known(b.handsBack, a.handsBack) ?? null, names), byName(a.handsBack ?? null, names));
}

/**
 * Which of a member-level changed item's members a use reaches (build text 5, section 6): a use of the item itself by
 * its whole value (or a use written before the uses file said, which reads as whole) is reached by any change of a
 * member; a read of one member, and a use of a member that is an item of its own (`Rooms.find`, a class's `Quote#total`),
 * only by a change of that member (removed, changed or made optional); a use that only names the item, or holds its
 * value under a name, by none. A class's static members (`Quote.make`) are items of their own, not its instances'.
 */
function reaches(c, u) {
  const m = c.members;
  const hit = (name) => m.removed.includes(name) || m.changed.includes(name) || m.optional.includes(name);
  if (u.item === c.item) {
    const v = u.value ?? 'whole';
    if (v === 'none') return false;
    if (v === 'member') return typeof u.member === 'string' ? hit(u.member) : true;
    return true;
  }
  const sep = u.item[c.item.length], name = u.item.slice(c.item.length + 1).split(/[.#]/)[0];
  if (c.kind === 'class' && sep !== '#') return false;
  return hit(name);
}

/** A member-level change in a reason's form: each list that is not empty. */
const membersText = (m) => Object.fromEntries(['added', 'removed', 'changed', 'optional', 'through'].filter((k) => m[k]?.length).map((k) => [k, m[k]]));

/**
 * A change of meaning alone (named by ARCH or declared, its means the same) is not told to a module that only hands the
 * value on (build text 5, section 6): one whose every use of the item is a name or a value held under a name (`none`)
 * or the value handed back from an export of its interface code (`handed back`), at least one handed back, with no
 * marked copy of it; and only where a later module that gets the value through it is itself told of the item. Its own
 * code and tests then neither read, compare, format, store nor assert the value: each of those is a use of the value.
 * Decided from the last module to the first: a module whose later receivers are all left untold stays told.
 */
function passedOn(report, telling, hitsOf, indexOf) {
  const meaningOnly = telling.filter((c) => c.found !== 'means' && c.changes.length === 1 && c.changes[0] === 'meaning changed');
  if (!meaningOnly.length) return;
  const toldFor = new Map(); // `${module}|${item}` -> Map(user -> reason)
  for (const t of report.told) for (const r of t.reasons) if (r.item && hitsOf.has(r)) {
    const k = `${r.module}|${r.item}`;
    if (!toldFor.has(k)) toldFor.set(k, new Map());
    toldFor.get(k).set(t.user, r);
  }
  const dropped = new Set();
  for (const c of meaningOnly) {
    const users = toldFor.get(`${c.module}|${c.item}`);
    if (!users) continue;
    for (const user of [...users.keys()].sort((x, y) => indexOf(y) - indexOf(x))) {
      const h = hitsOf.get(users.get(user));
      const handsOn = !h.marked && h.hits.length > 0 && h.hits.every((u) => u.value === 'none' || u.value === 'handed back') && h.hits.some((u) => u.value === 'handed back');
      if (!handsOn) continue;
      const toldLater = [...users.entries()].some(([v, r]) => v !== user && indexOf(v) > indexOf(user) && !dropped.has(r)
        && hitsOf.get(r).hits.some((u) => u.route && u.route !== 'direct' && u.route.via === user));
      if (toldLater) dropped.add(users.get(user));
    }
  }
  if (!dropped.size) return;
  for (const t of report.told) t.reasons = t.reasons.filter((r) => !dropped.has(r));
  report.told = report.told.filter((t) => t.reasons.length);
}

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
 * @param conversion true where the merged pull request is the module's conversion: describing tells no one even where
 *   the item's code changed; every other change tells
 * @param sameAs [{ module?, item, why }]: the items the pull request records as keeping their domain and range (push
 *   --same); each, where the tool found it changed by its means alone, tells no one
 */
export function changedItems(treeB, treeA, moduleId, { named = [], conversion = false, sameAs = [] } = {}) {
  const mb = treeB.byId.has(moduleId) ? moduleMeans(treeB, moduleId) : { items: {} };
  const ma = treeA.byId.has(moduleId) ? moduleMeans(treeA, moduleId) : { items: {} };
  const out = [];
  const fresh = [];
  for (const item of [...new Set([...Object.keys(mb.items), ...Object.keys(ma.items)])].sort()) {
    const b = mb.items[item], a = ma.items[item];
    // At the module's conversion only describing is no change (compareItem reads it through `known`); an item removed, a
    // constant's value changed, a bound, errors or a type error, and every other difference tell as always.
    if (!a) { out.push({ module: moduleId, item, found: 'means', changes: ['removed'], tells: true, why: null, before: describe(b), after: null }); continue; }
    if (!b) { fresh.push(item); continue; }
    const c = compareItem(b, a, { conversion });
    if (!c) continue;
    out.push({ module: moduleId, item, found: 'means', changes: c.parts, tells: true, why: null, words: c.why, ...partsThatDiffer(b, a, c.parts) });
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
  // The insides only (design part 2, section 7): an item the tool found changed whose domain and range the job records
  // as the same tells no one; one ARCH named or the pull request declared still tells.
  for (const x of sameAs.filter((y) => !y.module || y.module === moduleId)) {
    const c = out.find((y) => y.item === x.item && y.found === 'means' && !y.namedBy);
    if (c) { c.tells = false; c.same = x.why; }
  }
  // Member by member (build text 5, section 6): a kind, handle kind or class whose change is its members' says which;
  // a member, or an item of another kind, whose means differ only inside such kinds is told through them.
  const byMeans = (c) => c.found === 'means' && !c.namedBy && c.tells && !c.changes.includes('removed') && mb.items[c.item] && ma.items[c.item];
  const level = out.filter((c) => byMeans(c) && memberChanges(mb.items[c.item], ma.items[c.item], conversion));
  const names = new Set(level.map((c) => `${moduleId}.${c.item}`));
  for (const c of level) {
    const b = mb.items[c.item], a = ma.items[c.item];
    const m = memberChanges(b, a, conversion);
    const others = new Set([...names].filter((x) => x !== `${moduleId}.${c.item}`));
    const shape = (it) => (it.kind === 'handle kind' ? null : it.kind === 'kind' ? (it.handsBack ?? it.accepts) : it.handsBack);
    const sb = shape(b) && describedBy(b, a, conversion)(shape(b), shape(a)), sa = shape(a);
    m.through = m.changed.filter((x) => others.size && same(byName(sb.props[x], others), byName(sa.props[x], others)));
    m.changed = m.changed.filter((x) => !m.through.includes(x));
    c.kind = a.kind;
    c.members = m;
  }
  // A handle kind is written by its name only: a change to one of its methods, an item of its own, is a change of that
  // member of the handle, which its whole value's users hear of too.
  for (const c of out) {
    const h = /^([^.#]+)\.(.+)$/.exec(c.item);
    if (h && c.tells && c.found === 'means' && (ma.items[h[1]] ?? mb.items[h[1]])?.kind === 'handle kind') c.handle = { item: h[1], member: h[2] };
  }
  for (const c of out) {
    if (!byMeans(c) || c.members) continue;
    const b = mb.items[c.item], a = ma.items[c.item];
    if (onlyInside(b, a, names, conversion)) {
      const text = JSON.stringify([b.accepts, b.handsBack, a.accepts, a.handsBack]);
      c.through = [...names].filter((x) => text.includes(JSON.stringify(x))).map((x) => x.slice(moduleId.length + 1));
    }
  }
  return { module: moduleId, changed: out, fresh, conversion };
}

/** The parts of an item's means that a later module's item takes in (its uses file's `takesIn`), by the words of a change. */
const TAKEN = { 'errors that can leave it changed': 'errors', 'channels, settings or files changed': 'channels' };

/**
 * Through a middle module (design part 2, section 7, "What changes"): where a later module's item takes in a changed part
 * of a provider's item (an error that can pass through it, a channel it reaches), as that module's uses file records,
 * that item is a changed item of that module too, and so on through the modules after it. A lookup: no code is read.
 * @param changed the changed items that tell
 * @param files [{ id, files: [its uses file before and after, as read] }] in module order
 * @returns the changed items found so, each { module, item, found: 'means', changes, tells, takesIn: [{ module, item, part }] }
 */
export function takenIn(changed, files, indexOf) {
  const out = new Map(); // `${module}|${item}` -> changed item
  const queue = changed.filter((c) => c.changes.some((w) => TAKEN[w]));
  const seen = new Set(queue.map((c) => `${c.module}|${c.item}`));
  while (queue.length) {
    const c = queue.shift();
    const parts = c.changes.map((w) => TAKEN[w]).filter(Boolean);
    for (const { id, files: fs2 } of files) {
      if (indexOf(id) <= indexOf(c.module)) continue;
      for (const t of fs2.flatMap((f) => f.takesIn)) {
        if (t.provider !== c.module || t.providerItem !== c.item || !parts.includes(t.part)) continue;
        const k = `${id}|${t.item}`;
        const word = Object.keys(TAKEN).find((w) => TAKEN[w] === t.part);
        let d = out.get(k);
        if (!d) {
          if (seen.has(k)) continue;
          d = { module: id, item: t.item, found: 'means', changes: [], tells: true, why: null, takesIn: [] };
          out.set(k, d);
          seen.add(k);
          queue.push(d);
        }
        if (!d.changes.includes(word)) { d.changes.push(word); if (!queue.includes(d)) queue.push(d); }
        if (!d.takesIn.some((x) => x.module === c.module && x.item === c.item && x.part === t.part)) d.takesIn.push({ module: c.module, item: c.item, part: t.part });
        d.words = d.takesIn.map((x) => `takes in the ${x.part} of ${x.module} ${x.item}, which changed`).join('; ');
      }
    }
  }
  return [...out.values()];
}

/** Whether a place of a uses file is an `export * from` statement: the provider's own export list, read at that line. */
function starExportAt(trees, w) {
  for (const t of trees) {
    let text;
    try { text = fs.readFileSync(path.join(t.root, w.file), 'utf8'); } catch { continue; }
    const line = text.split('\n')[(Number(w.line) || 1) - 1] ?? '';
    return /^\s*export\s*\*/.test(line);
  }
  return false;
}

/**
 * A new item that changes what a name already used resolves to (design part 2, section 7, "Not a change"): two items of
 * one name now reach a module through its re-exports, or one name is now answered by two modules. Worked out by lookup
 * in the uses files and the providers' own export lists, with no user's code read:
 * - a call by name through the gathered tables of operations (`op:<name>`, a use of type `operation by name` or `table`):
 *   where the provider now answers a name a use resolves to another module, that module's item is a changed item
 *   (`<provider> now answers the same name`), told to the users of that name;
 * - a name a module hands on by `export * from` the provider (its uses file's use of the provider's module object,
 *   `*`, at a line of its export list that is `export *`; and so on through each module that hands that module on so):
 *   where the provider now has an item of a name some uses file reaches through that module, the name may now be
 *   answered twice, or by the provider in place of another, so that name, in that module, is a changed item
 *   (`<provider> <name> now reaches it through a re-export`), told to each use of it through that module.
 * @returns changed items, each { module, item, found: 'means', changes, tells: true, words, resolves? }
 */
export function resolvesAnew(B, A, provider, fresh, order) {
  if (!fresh.length) return [];
  const files = new Map(order.map((id) => [id, [usesOf(B, id), usesOf(A, id)].filter(Boolean)]));
  const allUses = [...files.entries()].flatMap(([user, fs2]) => fs2.flatMap((f) => f.uses.map((u) => ({ ...u, user }))));
  const out = new Map();
  const add = (c) => { const k = `${c.module}|${c.item}`; if (!out.has(k)) out.set(k, c); };
  for (const n of fresh.filter((x) => /^[a-z]+:/.test(x))) {
    for (const u of allUses) {
      if (u.item !== n || u.provider === provider || !['operation by name', 'table'].includes(u.type)) continue;
      add({ module: u.provider, item: n, found: 'means', changes: [`${provider} now answers the same name`], tells: true, why: null,
        words: `${provider} now answers the ${n.startsWith('op:') ? `operation ${n.slice(3)}` : `name ${n}`} too` });
    }
  }
  // The modules that hand the provider's names on by `export *`, and those that hand those on so, in turn.
  const trees = [A, B];
  const handsOn = new Map(); // module -> the module it hands on, nearest the provider
  const todo = [provider];
  while (todo.length) {
    const p = todo.shift();
    for (const [m, fs2] of files) {
      if (m === provider || handsOn.has(m)) continue;
      const star = fs2.flatMap((f) => f.uses).some((u) => u.provider === p && u.item === '*' && u.type === 'import' && u.where.some((w) => starExportAt(trees, w)));
      if (star) { handsOn.set(m, p); todo.push(m); }
    }
  }
  const plain = fresh.filter((x) => !/[.#:]/.test(x));
  for (const [m] of handsOn) {
    for (const n of plain) {
      const through = allUses.filter((u) => u.user !== m && u.user !== provider && matches(n, u.item) && (u.provider === m || (u.route && u.route !== 'direct' && u.route.via === m)));
      if (!through.length) continue;
      add({ module: m, item: n, found: 'means', changes: [`${provider} ${n} now reaches it through a re-export`], tells: true, why: null, resolves: { via: m },
        words: `${m} hands on every name of ${provider} by export *, and ${provider} now has an item ${n}: what ${n} through ${m} resolves to may change` });
    }
  }
  return [...out.values()];
}

/**
 * The notice for one change.
 * @param before the product before the change (a folder, or loadTree's product)
 * @param after the product after it
 * @param provider the module that changed
 * @param o.named the items whose meaning ARCH named or the pull request declared
 * @param o.filesChanged whether the merge changed the provider's files (a change that only names an item's meaning does not)
 * @param o.conversion whether the merged pull request is the provider's conversion
 * @param o.sameAs the items the pull request records as keeping their domain and range (changedItems)
 */
export function notice(before, after, provider, { named = [], filesChanged = true, conversion = false, sameAs = [] } = {}) {
  loadReader();
  const treeOf = (x) => (typeof x === 'string' ? loadTree(x) : x);
  const B = treeOf(before), A = treeOf(after);
  if (!A.byId.has(provider)) throw new Error(`no such module: ${provider}`);
  const report = { provider, reader: `TypeScript ${readerVersion()}`, conversion, changed: [], fresh: [], told: [], summary: '' };
  const mine = changedItems(B, A, provider, { named, conversion, sameAs });
  report.fresh = mine.fresh;
  report.changed.push(...mine.changed);
  const order = [...new Set([...A.modules.map((m) => m.id), ...B.modules.map((m) => m.id)])];
  const indexOf = (id) => A.byId.get(id)?.index ?? B.byId.get(id)?.index ?? -1;
  // A new item that changes what a name already used resolves to: a lookup in the uses files and the providers' own
  // export lists, with no user's code read.
  report.changed.push(...resolvesAnew(B, A, provider, mine.fresh, order));
  report.changed.push(...takenIn(report.changed.filter((c) => c.tells), order.map((id) => ({ id, files: [usesOf(B, id), usesOf(A, id)].filter(Boolean) })), indexOf));
  const telling = report.changed.filter((c) => c.tells);
  // The modules whose changed items are told; and the provider, whose files changed, for those that hear of any change.
  const byModule = new Map();
  for (const c of telling) { if (!byModule.has(c.module)) byModule.set(c.module, []); byModule.get(c.module).push(c); }
  if (filesChanged && !byModule.has(provider)) byModule.set(provider, []);
  const itemsOf = (m) => byModule.get(m).map((c) => c.item);
  const anyChange = (m) => (itemsOf(m).length ? `${itemsOf(m).join(', ')} changed` : `its files changed, though no item's means did`);
  const hitsOf = new Map();
  // A conversion's merge tells no place outside the standard and no module with no uses file of any change to the
  // provider's files (point 3) while no item of the provider changed: its statement that it changes no behaviour stands
  // there as a `same` record stands for an item. A conversion that changes an item tells as any merge. Points 1 and 2
  // still tell; so do mocks and order faults.
  const hearsAny = filesChanged && !(conversion && !itemsOf(provider).length);
  // A kind a module wrote as a copy of an earlier module's kind (S4, a place listing what it `relabels`): a module that
  // reads the copy reads the original through it, and hears of the original's changes (build text 5, section 6, "by
  // any route"), until the copy is written as the original's kind.
  const relabelled = new Map(); // `${module}|${its kind}` -> [{ provider, item }]
  for (const id of order) {
    for (const f of [usesOf(B, id), usesOf(A, id)].filter(Boolean)) {
      for (const o of f.outside) {
        if (o.rule !== 'S4' || typeof o.item !== 'string' || typeof o.relabels?.provider !== 'string' || typeof o.relabels?.item !== 'string') continue;
        const k = `${id}|${o.item}`;
        if (!relabelled.has(k)) relabelled.set(k, []);
        if (!relabelled.get(k).some((r) => r.provider === o.relabels.provider && r.item === o.relabels.item)) relabelled.get(k).push(o.relabels);
      }
    }
  }
  for (const user of order) {
    const before = [...byModule.keys()].filter((m) => indexOf(m) < indexOf(user));
    // An order fault is a use of a later module: the module that holds it may come before the changed one.
    const faultable = [...byModule.keys()].filter((m) => m !== user);
    if (!before.length && !faultable.length) continue;
    const files = [usesOf(B, user), usesOf(A, user)].filter(Boolean);
    const reasons = [];
    if (!files.length) {
      // No uses file yet (before the module's conversion): told of any change to the files of an earlier module it
      // imports, directly or through a module that re-exports it, reads by path or whose program it starts, whether or
      // not an item changed; and, where the tool cannot tell which modules its files reach, of any change to every
      // earlier module (design part 2, section 7, point 3). Its files are read as text, for what they import.
      const trees = [A, B].filter((t) => t.byId.has(user));
      const reached = trees.map((t) => reachedModules(t, t.byId.get(user)));
      const viaReExport = trees.map((t) => reExportsReached(t, t.byId.get(user), (id) => usesOf(t, id)));
      const how = (m) => [...new Set([...reached.flatMap((r) => r.reached.get(m) ?? []),
        ...viaReExport.flatMap((r) => (r.get(m) ?? []).map((x) => `imports through ${x}, which re-exports`))])];
      const cannot = reached.flatMap((r) => r.cannot);
      const noUsesFile = `${user} has no uses file yet: its whole tests run`;
      for (const m of before.filter((x) => (x === provider ? hearsAny : true) && (how(x).length || cannot.length))) {
        const why = how(m).length ? `${user} has no uses file yet and ${how(m).join(' and ')} ${m}` : `${user} has no uses file yet, and the tool cannot tell which modules it reaches (${cannot[0].why} at ${cannot[0].at})`;
        reasons.push({ module: m, items: itemsOf(m), found: 'any change', changes: [], why: `${anyChange(m)}; ${why}`, noUsesFile });
      }
      // An order fault read from its imports: a later module it imports, directly or through a module that re-exports
      // it, whose files changed (design part 2, section 7, point 3: each earlier module with an order fault naming it).
      for (const m of faultable.filter((x) => indexOf(x) > indexOf(user) && (x === provider ? filesChanged : byModule.get(x).length))) {
        if (!how(m).length) continue;
        const at = trees.flatMap((t) => importedModules(t, t.byId.get(user)).imported.get(m) ?? []);
        const places = [...new Set(at.map((x) => x.at))];
        reasons.push({ module: m, items: itemsOf(m), found: 'any change', changes: [], orderFault: `imports ${places[0] ?? m}`,
          why: `${anyChange(m)}; ${user} has no uses file yet and ${how(m).join(' and ')} ${m}, a later module: an order fault names ${m}`,
          places: firstPlaces(at.map((x) => { const [file, line] = x.at.split(':'); return { file, line: Number(line) }; })), noUsesFile });
      }
    } else {
      // The file before and after the change, read as one: each entry once.
      const once = (list) => [...new Map(list.map((x) => [JSON.stringify(x), x])).values()];
      const uses = files.flatMap((f) => f.uses);
      const copies = once(files.flatMap((f) => f.copies));
      const outside = once(files.flatMap((f) => f.outside));
      const faults = once(files.flatMap((f) => f.orderFaults));
      // A test that replaces or mocks a member of the provider hears of any change to the provider's files, whether or
      // not an item changed (design part 2, section 7, point 3).
      if (filesChanged && before.includes(provider)) {
        const mocks = uses.filter((u) => u.provider === provider && u.type === 'mock');
        if (mocks.length) {
          reasons.push({ module: provider, items: itemsOf(provider), found: 'any change', changes: [], mock: [...new Set(mocks.map((u) => u.item))].join(', '),
            why: `${anyChange(provider)}; a test of ${user} replaces or mocks ${[...new Set(mocks.map((u) => u.item))].join(', ')} of ${provider}`,
            places: firstPlaces(mocks.flatMap((u) => u.where)) });
        }
      }
      // A file written with what each use does with a value (build text 2c, `value`); an older one reads as whole.
      const marks = uses.some((u) => typeof u.value === 'string');
      for (const m of before) {
        for (const c of byModule.get(m)) {
          // An item whose means differ only inside kinds that changed member by member is told through those kinds where
          // the user only calls it or names it: the values a call hands back or takes are of a stated kind, each use of
          // them listed where it stands. Any other use of it (its value read, handed on, converted, called through a
          // table) still tells, and so does a file older than those marks.
          // A name that may now resolve otherwise through a module's `export *` (resolvesAnew): each use of it through
          // that module, whichever module it resolved to before.
          if (c.resolves) {
            const via = uses.filter((u) => matches(c.item, u.item) && (u.provider === m || (u.route && u.route !== 'direct' && u.route.via === m)));
            if (!via.length) continue;
            const reason = { module: m, item: c.item, found: c.found, changes: [...c.changes], why: null, route: 'direct', places: firstPlaces(via.flatMap((h) => h.where)) };
            hitsOf.set(reason, { hits: via, marked: 0, user });
            reasons.push(reason);
            continue;
          }
          const hits = uses.filter((u) => u.provider === m && ((matches(c.item, u.item) && (!c.members || reaches(c, u)) && !(c.through && marks && CALLED.has(u.type)))
            || (c.handle && u.item === c.handle.item && (u.value === 'member' ? u.member === c.handle.member : u.value !== 'none'))));
          const marked = copies.filter((x) => x.provider === m && typeof x.item === 'string' && matches(c.item, x.item));
          // the copy's readers: any use of it, whatever member, is a use of the original changed
          const through = hits.length || marked.length ? [] : uses.filter((u) => u.provider !== m && indexOf(u.provider) < indexOf(user)
            && (relabelled.get(`${u.provider}|${u.item.split(/[.#]/)[0]}`) ?? []).some((r) => r.provider === m && (matches(c.item, r.item) || matches(r.item, c.item))));
          if (through.length) {
            const reason = { module: m, item: c.item, found: c.found, ...(c.namedBy ? { namedBy: c.namedBy } : {}), changes: [...c.changes], why: c.why ?? null,
              route: { via: through[0].provider, item: through[0].item.split(/[.#]/)[0] }, copy: `${through[0].provider} ${through[0].item.split(/[.#]/)[0]}`,
              places: firstPlaces(through.flatMap((h) => h.where)), ...(c.before !== undefined ? { before: c.before, after: c.after } : {}) };
            hitsOf.set(reason, { hits: through, marked: 0, user });
            reasons.push(reason);
            continue;
          }
          if (!hits.length && !marked.length) continue;
          const route = hits.some((h) => h.route === 'direct' || !h.route) || !hits.length ? 'direct' : hits[0].route;
          const reason = { module: m, item: c.item, found: c.found, ...(c.namedBy ? { namedBy: c.namedBy } : {}), changes: [...c.changes], why: c.why ?? null, route,
            ...(c.members ? { members: membersText(c.members) } : {}),
            places: firstPlaces([...hits.flatMap((h) => h.where), ...marked.map((x) => ({ file: x.file, line: x.line, pointer: x.pointer }))]),
            ...(c.before !== undefined ? { before: c.before, after: c.after } : {}) };
          hitsOf.set(reason, { hits, marked: marked.length, user });
          reasons.push(reason);
        }
        // A place outside the standard hears of any change to the files of a module it may refer to, until a job
        // converts it; where it cannot say which (`*`, or no `mayRefer`), of every earlier module (design part 2, section
        // 7, rule 2 for the tool). One whose `mayRefer` is empty refers to no other module.
        if (m === provider ? hearsAny : true) {
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
  passedOn(report, telling, hitsOf, indexOf);
  report.summary = telling.length ? `${telling.length} item${telling.length === 1 ? '' : 's'} changed in a way that tells; ${report.told.length} module(s) told.`
    : `${report.changed.length ? 'No changed item tells anyone (each one the pull request records as keeping its domain and range)' : conversion ? `${provider}'s conversion: no item's means changed, describing aside` : 'No item\'s means changed'}; ${report.told.length ? `${report.told.length} module(s) that hear of any change told.` : 'nobody is told.'}`;
  return report;
}

const DEPENDENCY_LISTS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
/**
 * The version of each package a product names, read from its files: every package.json's dependency lists and every
 * package-lock.json's packages (outside node_modules); and the host's, from the facility list's `versions`.
 * Returns Map(package -> its versions, as one text).
 */
export function packageVersions(tree) {
  const seen = new Map();
  const add = (name, where, v) => { if (!seen.has(name)) seen.set(name, []); seen.get(name).push(`${where} ${JSON.stringify(v)}`); };
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries.sort((x, y) => (x.name < y.name ? -1 : 1))) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { walk(f); continue; }
      if (e.name !== 'package.json' && e.name !== 'package-lock.json') continue;
      let d;
      try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
      const where = path.relative(tree.root, f).split(path.sep).join('/');
      if (e.name === 'package.json') for (const k of DEPENDENCY_LISTS) for (const [n, v] of Object.entries(d?.[k] ?? {})) add(n, `${where} ${k}`, v);
      else for (const [k, v] of Object.entries(d?.packages ?? {})) { const at = k.lastIndexOf('node_modules/'); if (at >= 0) add(k.slice(at + 13), `${where} ${k}`, v?.version ?? null); }
    }
  };
  walk(tree.root);
  const out = new Map([...seen].map(([n, v]) => [n, v.sort().join('; ')]));
  for (const [host, v] of Object.entries(readFacilities(tree)?.versions ?? {})) out.set(host, `the facility list's versions ${JSON.stringify(v)}`);
  return out;
}

/**
 * Point 4 of who is told (design part 2, section 7): on a change to a package's version, each module whose uses file
 * names the package; on a change to the host's version (the facility list's `versions`), each module that uses a
 * facility of it. One notice for each package that changed; one with no version before is not changed. A lookup in the
 * uses files: no code is read.
 * @returns [{ package, was, now, told: [{ user, reasons }] }]
 */
export function versionNotices(before, after) {
  const treeOf = (x) => (typeof x === 'string' ? loadTree(x) : x);
  const B = treeOf(before), A = treeOf(after);
  const vb = packageVersions(B), va = packageVersions(A);
  // A version written for the first time (the facility list's first creation, a package first named) changes no one's
  // host or package: it tells no one.
  const changed = [...vb.keys()].filter((p) => vb.get(p) !== va.get(p)).sort();
  if (!changed.length) return [];
  const order = [...new Set([...A.modules.map((m) => m.id), ...B.modules.map((m) => m.id)])];
  const files = new Map(order.map((id) => [id, [usesOf(B, id), usesOf(A, id)].filter(Boolean)]));
  return changed.map((p) => {
    const told = [];
    for (const user of order) {
      // A module with no uses file yet cannot say which packages it uses: it is told of every version change (design
      // part 2, section 7, "Who is told", point 4).
      if (!files.get(user).length) {
        told.push({ user, reasons: [{ module: `package ${p}`, package: p, found: 'any change', changes: [], why: `${p}'s version changed (${vb.get(p) ?? 'none'} -> ${va.get(p) ?? 'none'}); ${user} has no uses file yet`, places: [] }] });
        continue;
      }
      const facilities = [...new Set(files.get(user).flatMap((f) => f.packages).filter((x) => x.package === p).map((x) => x.facility))].sort();
      if (!facilities.length) continue;
      told.push({ user, reasons: [{ module: `package ${p}`, package: p, found: 'any change', changes: [], why: `${p}'s version changed (${vb.get(p) ?? 'none'} -> ${va.get(p) ?? 'none'}); ${user} uses ${facilities.slice(0, PLACES_SHOWN).join(', ')}${facilities.length > PLACES_SHOWN ? ` and ${facilities.length - PLACES_SHOWN} more` : ''}`, places: [] }] });
    }
    return { package: p, was: vb.get(p) ?? null, now: va.get(p) ?? null, told };
  });
}

/** Writes a notice for people (build text 2b, section 6). */
export function noticeText(r) {
  const L = [`Notice for a change to ${r.provider} (${r.reader})`, r.summary];
  for (const c of r.changed) {
    L.push(`  ${c.module} ${c.item}: ${c.changes.join(', ')} [found by ${[c.found, ...(c.namedBy ?? [])].map((f) => FOUND[f] ?? f).join(', ')}] -> tells ${!c.tells ? 'no one' : c.through ? `its users through ${c.through.join(', ')}` : c.members ? 'the users its members reach' : 'its users'}`);
    if (c.words) L.push(`      means: ${c.words}`);
    if (c.members) L.push(`      members: ${Object.entries(membersText(c.members)).map(([k, v]) => `${k} ${v.join(', ')}`).join('; ')}`);
    if (c.why) L.push(`      meaning: ${c.why}`);
    if (c.same) L.push(`      the same domain and range, as the pull request records: ${c.same}`);
  }
  for (const t of r.told) {
    L.push(`  TOLD ${t.user}`);
    for (const x of t.reasons) {
      const at = (x.places ?? []).join(', ');
      if (x.item) L.push(`      uses ${x.module} ${x.item}${x.copy ? ` through ${x.copy}, a copy of it` : ''} (${x.changes.join(', ')}; found by ${[x.found, ...(x.namedBy ?? [])].map((f) => FOUND[f] ?? f).join(', ')}) at ${at || 'no place named'}`);
      else L.push(`      ${x.outside ? `outside the standard, ${x.outside}` : x.orderFault ? `order fault, ${x.orderFault}` : x.mock ? `a mock of ${x.mock}` : x.package ? `package ${x.package}` : 'no uses file'}: ${x.why}`);
    }
  }
  return L.join('\n');
}
