// The notice (design part 2, section 7; build text 2b, section 6; build text 5, sections 5 and 6): given the product
// before and after a change to one module, who is told and why. Ported from the notice's proof (proof:
// tool/lib/notice.mjs), which ran design 7; this is design 8 (proof: notes/iteration-8-design.md):
// - rule 52: "accepts more" tells nobody only when TypeScript's own type checker, reading the old and the new
//   interface in one program, confirms it; otherwise, or where the entry cannot be found, it is "cannot stand in";
// - the proof's telling, on "accepts more", of a user that hands a function on as a value is not taken;
// - the proof's "bound test changed" is not taken;
// - "not followed fully" has exactly the four causes of build text 5, section 6; the proof's telling of every user
//   of a module without interface comments whose change is not the comments-only first step (its rule 21) is a fifth
//   cause and is not taken;
// - each reason carries module, entry, changes, the whole list of lines, through, and before and after.
import { loadTree } from './model.mjs';
import { ts, loadReader, makeProgram, readerVersion, tagsOf, tagText } from './ts.mjs';
import { makeLister, hasInterfaceComments } from './listing.mjs';
import { makeUsage } from './usage.mjs';
import { same, standsIn, render } from './canon.mjs';
import { commentsOnly } from './check.mjs';
import { stagedReader } from './staged.mjs';

/** Reads a whole product once: every module's listing and every module's uses, from one program. */
export function analyse(root) {
  loadReader();
  const tree = typeof root === 'string' ? loadTree(root) : root;
  const program = makeProgram(tree.allFiles);
  const lister = makeLister(program, tree);
  const listings = new Map(tree.modules.map((m) => [m.id, lister.list(m)]));
  const usage = makeUsage(program, tree, listings);
  const uses = new Map(tree.modules.map((m) => [m.id, usage.usesOf(m)]));
  return { tree, program, listings, uses };
}

/**
 * The places a "not followed fully" reason names: the first six, then "and N more" as one more place (the owner's
 * decision of 24 Nov 2026). Such a user runs its whole module's tests, so the places choose nothing; they only explain,
 * and a reason without bound made a waiting-work record too large to write, losing the notice.
 */
export const PLACES_SHOWN = 6;
export const firstPlaces = (places) => (places.length > PLACES_SHOWN ? [...places.slice(0, PLACES_SHOWN), `and ${places.length - PLACES_SHOWN} more`] : [...places]);

/** Telling changes: those that tell the users of the entry. */
const TELLS = new Set(['removed', 'cannot stand in', 'hands back differently', 'bound changed', 'declaration changed (not classified)', 'parameters moved']);

/** Rewrites handle names in a canonical form, for kinds renamed with their shape unchanged. */
function renameHandles(c, map) {
  if (!map.size) return c;
  return JSON.parse(JSON.stringify(c), (k, v) => (v && v.k === 'handle' && map.has(v.name) ? { ...v, name: map.get(v.name) } : v));
}

/** Compares two listings of one module, entry by entry. */
export function diffListings(moduleId, before, after) {
  const b = before.entries, a = after.entries;
  const out = [];
  // Kinds renamed with their shape unchanged: one kind gone, one new, the same shape.
  const gone = Object.keys(b).filter((n) => !(n in a));
  const fresh = Object.keys(a).filter((n) => !(n in b));
  const renamed = new Map(); // old name -> new name
  const handleMap = new Map();
  for (const g of gone) {
    const eb = b[g];
    if (!['kind', 'handle kind'].includes(eb.kind)) continue;
    const match = fresh.find((f) => a[f].kind === eb.kind && !renamed.has(f) && [...renamed.values()].indexOf(f) < 0 &&
      (eb.kind === 'kind' ? same(eb.accepts ?? eb.handsBack, a[f].accepts ?? a[f].handsBack) : same(eb.handsBack, a[f].handsBack)));
    if (match) { renamed.set(g, match); if (eb.kind === 'handle kind') handleMap.set(`${moduleId}.${g}`, `${moduleId}.${match}`); }
  }
  const renamedTo = new Set(renamed.values());
  const memberOfRenamed = (n) => [...renamed.entries()].find(([o]) => n.startsWith(o + '.'));
  // Iteration 7 (rule 50): each member of a renamed kind is compared with the member of the same name in the new kind.
  const pairedMember = new Map(); // old member name -> new member name
  for (const n of Object.keys(b)) { const m = memberOfRenamed(n); if (m && !(n in a) && a[`${m[1]}${n.slice(m[0].length)}`]) pairedMember.set(n, `${m[1]}${n.slice(m[0].length)}`); }
  for (const name of [...new Set([...Object.keys(b), ...Object.keys(a)])].sort()) {
    const eb = b[name];
    let ea = a[name];
    if (!ea && pairedMember.has(name)) ea = a[pairedMember.get(name)];
    if (renamed.has(name)) {
      out.push({ entry: name, changes: ['kind renamed, shape unchanged'], to: renamed.get(name), tells: 'users that name it' });
      continue;
    }
    if (renamedTo.has(name)) continue;
    if (!ea) {
      out.push({ entry: name, changes: ['removed'], before: describe(eb), tells: 'users' });
      continue;
    }
    if (!eb) {
      const r = [...renamed.entries()].find(([, n]) => name.startsWith(n + '.'));
      if (r && b[`${r[0]}${name.slice(r[1].length)}`]) continue;
      out.push({ entry: name, changes: ['new entry'], after: describe(ea), tells: 'nobody' });
      continue;
    }
    if (eb.handsBack?.k === 'names' && ea.handsBack?.k === 'names') {
      const lost = eb.handsBack.names.filter((n) => !ea.handsBack.names.includes(n));
      const gained = ea.handsBack.names.filter((n) => !eb.handsBack.names.includes(n));
      if (lost.length || gained.length) {
        out.push({ entry: name, changes: [lost.length ? 'removed' : 'new entry'], lost, gained, tells: lost.length ? 'users' : 'nobody', before: describe(eb), after: describe(ea) });
      }
      continue;
    }
    // Iteration 5 (rule 33): an added overload that keeps every old signature only accepts more.
    const sigPairs = (e) => e.accepts?.k === 'overloads' ? e.accepts.of.map((p, i) => JSON.stringify([p, e.handsBack.of[i]])) : e.accepts?.k === 'params' ? [JSON.stringify([e.accepts, e.handsBack])] : null;
    const pb = sigPairs(eb), pa = sigPairs(ea);
    if (pb && pa && (eb.accepts?.k === 'overloads' || ea.accepts?.k === 'overloads') && pb.every((x, i) => pa[i] === x) && same(eb.bounds, ea.bounds) && same(eb.throws ?? [], ea.throws ?? [])) {
      if (pa.length > pb.length) out.push({ entry: name, changes: ['accepts more'], tells: 'nobody', before: describe(eb), after: describe(ea), names: [name, name] });
      continue;
    }
    const changes = [];
    const ba = renameHandles(eb.accepts, handleMap), bh = renameHandles(eb.handsBack, handleMap);
    if (!same(ba, ea.accepts)) changes.push(standsIn(ba, ea.accepts) ? 'accepts more' : 'cannot stand in');
    if (!same(bh, ea.handsBack)) changes.push('hands back differently');
    if (!same(eb.bounds, ea.bounds)) changes.push('bound changed');
    // Iteration 2: the kinds of error raised, and a message's channel, are part of what is handed back.
    if ((!same(eb.throws ?? [], ea.throws ?? []) || (eb.channel ?? '') !== (ea.channel ?? '')) && !changes.includes('hands back differently')) changes.push('hands back differently');
    // Iteration 7 (rule 48): a parameter's name found at another place: the parameters have moved.
    if (eb.paramNames && ea.paramNames && eb.paramNames.some((n, i) => n !== '_' && ea.paramNames.includes(n) && ea.paramNames.indexOf(n) !== i)) changes.push('parameters moved');
    // Iteration 3 (rule 12): a member that may now be missing hands back differently.
    if (ea.optional && !eb.optional && !changes.includes('hands back differently')) changes.push('hands back differently');
    // Iteration 4 (rule 18): silent only when the entry is shown unchanged. A declaration that differs where the tool's
    // own comparison found nothing tells.
    if (!changes.length && eb.decl !== undefined && ea.decl !== undefined) {
      let bd = eb.decl;
      for (const [o, n] of renamed) bd = bd.replace(new RegExp(`\\b${o}\\b`, 'g'), n);
      if (bd !== ea.decl) changes.push('declaration changed (not classified)');
    }
    if (!changes.length) continue;
    const names = [name, pairedMember.get(name) ?? name];
    if (pairedMember.has(name)) out.push({ entry: pairedMember.get(name), changes, tells: changes.some((c) => TELLS.has(c)) ? 'users' : 'nobody', before: describe(eb), after: describe(ea), names });
    out.push({
      entry: name,
      changes,
      tells: changes.some((c) => TELLS.has(c)) ? 'users' : 'nobody',
      before: describe(eb),
      after: describe(ea),
      names,
    });
  }
  return out;
}


export function describe(e) {
  if (!e) return null;
  const d = { kind: e.kind };
  if (e.accepts !== undefined && e.accepts !== null) d.accepts = render(e.accepts);
  if (e.handsBack !== undefined && e.handsBack !== null) d.handsBack = render(e.handsBack);
  if (e.bounds?.length) d.bounds = e.bounds;
  if (e.side) d.side = e.side;
  if (e.throws?.length) d.throws = e.throws;
  if (e.channel) d.channel = e.channel;
  if (e.optional) d.optional = true;
  return d;
}

/**
 * Rule 52. One program reads the interface files of both products; for each entry the comparison found to accept
 * more, the type checker is asked: for a function, method, class or value, is the new one assignable to the old; for
 * what a user hands in (a kind on the accepting side, an operation's request, a table's rows), is the old one
 * assignable to the new. Made once for a notice, when first needed; read in stages (perModule), once for each module
 * asked about, from that module's interface files alone.
 */
export function makeConfirm(B, A, { perModule = false } = {}) {
  let program = null;
  let checker = null;
  let forModule = null;
  const exportsOf = (tree, moduleId) => {
    const mod = tree.byId.get(moduleId);
    const out = new Map();
    for (const f of mod?.public ?? []) {
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
  /** The type to ask about for an entry, and which way to ask: 'out' (new to old) or 'in' (old to new). */
  function typeOf(tree, moduleId, entry) {
    const ex = exportsOf(tree, moduleId);
    const aliasType = (sym) => checker.getDeclaredTypeOfSymbol(sym);
    if (entry.startsWith('op:')) {
      const name = entry.slice(3);
      for (const sym of ex.values()) {
        if (!(sym.flags & ts.SymbolFlags.TypeAlias) || !marked(sym, 'optable')) continue;
        const p = checker.getPropertyOfType(aliasType(sym), name);
        const req = p && checker.getPropertyOfType(checker.getTypeOfSymbol(p), 'req');
        if (req) return { t: checker.getTypeOfSymbol(req), way: 'in' };
      }
      return null;
    }
    if (entry.startsWith('table:')) {
      const table = entry.slice(6);
      for (const sym of ex.values()) {
        if (sym.flags & ts.SymbolFlags.TypeAlias && (sym.declarations ?? []).some((d) => tagsOf(d, 'storedrows').some((t) => tagText(t).split(/\s+/)[0] === table))) return { t: aliasType(sym), way: 'in' };
      }
      return null;
    }
    const m = /^([^.#]+)([.#])(.+)$/.exec(entry);
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
    const sym = ex.get(entry);
    if (!sym) return null;
    if (sym.flags & ts.SymbolFlags.TypeAlias) return { t: aliasType(sym), way: 'in' };
    return { t: checker.getTypeOfSymbol(sym), way: 'out' };
  }
  function confirm(moduleId, beforeName, afterName) {
    if (perModule ? forModule !== moduleId : !program) {
      // Read in stages, only the interface files of the module asked about, before and after.
      const publicOf = (T) => (perModule ? T.tree.byId.get(moduleId)?.public ?? [] : T.tree.modules.flatMap((m) => m.public));
      program = makeProgram([...publicOf(B), ...publicOf(A)]);
      checker = program.getTypeChecker();
      forModule = moduleId;
    }
    const o = typeOf(B.tree, moduleId, beforeName);
    const n = typeOf(A.tree, moduleId, afterName);
    if (!o || !n || o.way !== n.way) return { confirmed: false, why: 'the entry cannot be found to ask the type checker' };
    const ok = o.way === 'out' ? checker.isTypeAssignableTo(n.t, o.t) : checker.isTypeAssignableTo(o.t, n.t);
    return ok ? { confirmed: true } : { confirmed: false, why: o.way === 'out' ? 'the type checker does not find the new entry assignable to the old' : 'the type checker does not find the old kind assignable to the new' };
  }
  /** Lets go of the program, once a module's entries are asked about (read in stages). */
  confirm.release = () => { if (perModule) { program = null; checker = null; forModule = null; } };
  return confirm;
}

/** The parts of an entry that differ, from the notice's own entry (build text 5, section 5). */
function partsThatDiffer(e) {
  if (e.changes.includes('kind renamed, shape unchanged')) return { before: { name: e.entry }, after: { name: e.to } };
  if (!e.before || !e.after) return { before: e.before ?? null, after: e.after ?? null };
  const before = {}, after = {};
  for (const k of new Set([...Object.keys(e.before), ...Object.keys(e.after)])) {
    if (JSON.stringify(e.before[k]) === JSON.stringify(e.after[k])) continue;
    before[k] = e.before[k] ?? null;
    after[k] = e.after[k] ?? null;
  }
  return { before, after };
}

/**
 * The notice for one change.
 * @param before the product before the change: a folder or a product (loadTree), read in stages (staged.mjs); or an
 *   analysis made by analyse(), the whole product read at once
 * @param after the product after it, of the same form
 * @param provider the module that changed
 * @param confirm rule 52's checker; with analyses, shared between notices of the same two products
 */
export function notice(before, after, provider, confirm) {
  if (before?.listings && after?.listings) return noticeWith(wholeReading(before, after, confirm ?? makeConfirm(before, after)), provider);
  const treeOf = (x) => (typeof x === 'string' ? loadTree(x) : x);
  const tb = treeOf(before), ta = treeOf(after);
  if (!ta.byId.has(provider)) throw new Error(`no such module: ${provider}`);
  const R = stagedReader(tb, ta, provider, makeConfirm({ tree: tb }, { tree: ta }, { perModule: true }), (id, b, a) => diffListings(id, b, a).length > 0);
  try {
    return noticeWith(R, provider);
  } finally {
    R.release();
    R.confirm.release();
  }
}

/** The whole product read at once (analyse()): every module's listing and uses are at hand. */
function wholeReading(B, A, confirm) {
  const of = (s) => (s === 'B' ? B : A);
  return {
    B, A, staged: false, confirm,
    listing: (s, id) => of(s).listings.get(id),
    prepare() {},
    mayChangeThrough: () => true,
    isCandidate: () => true,
    uses: (s, id) => of(s).uses.get(id),
    opListings: (s) => of(s).listings,
  };
}

/**
 * The notice for one change, from a reading R: R.listing(side, module), R.uses(side, module), R.confirm; for a reading
 * in stages, R.prepare() reads what may matter once the provider's listing has changed, R.mayChangeThrough(module) and
 * R.isCandidate(module) say which later modules it read (a module it did not read cannot use the provider).
 */
function noticeWith(R, provider) {
  const B = R.B, A = R.A;
  const order = A.tree.modules.map((m) => m.id);
  const pIndex = order.indexOf(provider);
  if (pIndex < 0) throw new Error(`no such module: ${provider}`);
  // usersRead: the later modules whose uses were read (with the whole product read at once, every one).
  const report = { provider, reader: `TypeScript ${readerVersion()}`, firstCommentsStep: false, changedModules: [], entries: [], told: [], notTold: [], usersRead: [] };

  // The first job on a module without interface comments: a comments-only step sends no notice.
  const pb = B.tree.byId.get(provider);
  if (pb && !hasInterfaceComments(pb)) {
    const co = commentsOnly(B.tree, A.tree, provider);
    if (co.same) {
      report.firstCommentsStep = true;
      report.summary = `${provider} had no interface comments; this change only adds comments (running code unchanged in ${co.files.length} file(s)). No notice; the listing after it is the "before" for the job's real change.`;
      return report;
    }
  }

  // Every module from the provider on: its listing before and after. Those after the provider whose own files did
  // not change but whose listing did are changed "through" it: they pass on a kind of the provider.
  const changed = new Map(); // module -> diff
  const compare = (id) => {
    const lbm = R.listing('B', id), lam = R.listing('A', id);
    if (!lbm || !lam) return;
    const d = diffListings(id, lbm, lam);
    // Rule 52: "accepts more" only where the type checker confirms it.
    for (const e of d) {
      const k = e.changes.indexOf('accepts more');
      if (k < 0) continue;
      const c = R.confirm(id, ...(e.names ?? [e.entry, e.entry]));
      if (c.confirmed) continue;
      e.changes.splice(k, 1, ...(e.changes.includes('cannot stand in') ? [] : ['cannot stand in']));
      e.tells = 'users';
      e.notConfirmed = c.why;
    }
    if (d.length) {
      changed.set(id, d);
      report.changedModules.push({ module: id, through: id === provider ? null : provider });
      for (const e of d) report.entries.push({ module: id, ...e });
    }
  };
  compare(provider);
  R.confirm.release?.();
  // Read in stages, the same listing tells nobody, and no user is read.
  if (R.staged && !changed.has(provider)) {
    report.interfaceChanged = false;
    report.summary = 'The listing before and after is the same. Nobody is told.';
    return report;
  }
  R.prepare();
  report.usersRead = order.slice(pIndex + 1).filter((id) => R.isCandidate(id));
  for (let i = pIndex + 1; i < order.length; i++) if (R.mayChangeThrough(order[i])) compare(order[i]);
  // Iteration 2: a new operation whose name another module already answers tells the users of that operation.
  const answering = R.opListings('A');
  for (const [id, diff] of [...changed]) {
    for (const e of diff) {
      if (!e.entry.startsWith('op:') || !e.changes.includes('new entry')) continue;
      for (const [other, l] of answering) {
        if (other === id || !l.entries[e.entry]) continue;
        if (!changed.has(other)) { changed.set(other, []); report.changedModules.push({ module: other, through: provider }); }
        const x = { entry: e.entry, changes: [`${id} now answers the same name`], tells: 'users', before: describe(R.listing('B', other)?.entries[e.entry]), after: describe(l.entries[e.entry]) };
        changed.get(other).push(x);
        report.entries.push({ module: other, ...x });
      }
    }
  }
  for (const e of report.entries) { delete e.names; }
  report.interfaceChanged = changed.has(provider);

  // Who is told: every later module, declared or not. A module the staged reading did not read cannot use any module
  // that changed: it is neither told nor named.
  for (let i = pIndex + 1; i < order.length; i++) {
    const user = order[i];
    if (!R.isCandidate(user)) continue;
    const mod = A.tree.byId.get(user);
    const ub = R.uses('B', user), ua = R.uses('A', user);
    const reasons = [];
    for (const [m, diff] of changed) {
      if (A.tree.byId.get(m).index >= mod.index) continue;
      const declared = mod.uses.includes(m);
      const useB = ub?.uses.get(m), useA = ua?.uses.get(m);
      // Uses are read from the user's code as it stood before the change; uses found against the provider after the
      // change are added, so a by-name call to a new name is seen too.
      const useOf = (entry) => useB?.get(entry) ?? useA?.get(entry);
      const through = m === provider ? null : provider;
      for (const e of diff) {
        const u = useOf(e.entry);
        if (!u || e.tells === 'nobody') continue;
        if (e.tells === 'users that name it' && !u.named) continue;
        reasons.push({ module: m, entry: e.entry, changes: [...e.changes], lines: [...u.lines], through, ...partsThatDiffer(e) });
      }
      // Not followed fully (build text 5, section 6): for a provider U declares, any of four causes. Such a user
      // counts as using everything of the provider, and is told on any change to its listing.
      if (declared) {
        const why = [];
        if (!useB?.size && !useA?.size) why.push(`declares ${m} but no use of it is found in its code`);
        if (ub?.anything.length) why.push(`reads or calls values of unknown kind: ${firstPlaces(ub.anything).join('; ')}`);
        if (ub?.unreadOps.length && Object.keys(R.listing('A', m).entries).some((n) => n.startsWith('op:'))) why.push(`calls by a name the tool cannot read at ${firstPlaces(ub.unreadOps).join(', ')}`);
        if (ub?.unreadTables.length && Object.keys(R.listing('A', m).entries).some((n) => n.startsWith('table:'))) why.push(`names a table the tool cannot read at ${firstPlaces(ub.unreadTables).join(', ')}`);
        if (why.length) reasons.push({ module: m, notFollowed: why, through });
      }
    }
    if (reasons.length) report.told.push({ user, reasons, undeclared: (ub?.undeclared ?? []).filter((p) => changed.has(p)) });
    else if (mod.uses.some((u) => changed.has(u)) || [...changed.keys()].some((m) => ub?.uses.has(m))) report.notTold.push({ user, why: 'uses none of the entries that changed in a way that tells' });
  }
  const tellingEntries = report.entries.filter((e) => e.tells !== 'nobody');
  report.summary = !changed.size
    ? 'The listing before and after is the same. Nobody is told.'
    : `${changed.size} module(s) changed their listing; ${tellingEntries.length} entr${tellingEntries.length === 1 ? 'y' : 'ies'} changed in a way that tells; ${report.told.length} user(s) told.`;
  return report;
}

/** Writes a notice for people (build text 2b, section 6). */
export function noticeText(r) {
  const L = [`Notice for a change to ${r.provider} (${r.reader})`, r.summary];
  if (r.firstCommentsStep) return L.join('\n');
  for (const e of r.entries) {
    L.push(`  ${e.module} ${e.entry}: ${e.changes.join(', ')}${e.to ? ` (now ${e.to})` : ''} -> tells ${e.tells}`);
    if (e.notConfirmed) L.push(`      accepts more, not confirmed: ${e.notConfirmed}`);
    if (e.before?.accepts !== e.after?.accepts && (e.before?.accepts || e.after?.accepts)) L.push(`      accepts before: ${e.before?.accepts ?? '-'}\n      accepts after:  ${e.after?.accepts ?? '-'}`);
    if (e.before?.handsBack !== e.after?.handsBack && (e.before?.handsBack || e.after?.handsBack)) L.push(`      hands back before: ${e.before?.handsBack ?? '-'}\n      hands back after:  ${e.after?.handsBack ?? '-'}`);
    if (JSON.stringify(e.before?.bounds) !== JSON.stringify(e.after?.bounds) && e.changes.includes('bound changed')) L.push(`      bounds before: ${JSON.stringify(e.before?.bounds ?? [])}\n      bounds after:  ${JSON.stringify(e.after?.bounds ?? [])}`);
  }
  for (const t of r.told) {
    L.push(`  TOLD ${t.user}`);
    for (const x of t.reasons) {
      if (x.notFollowed) L.push(`      not followed fully for ${x.module}: ${x.notFollowed.join('; ')}`);
      else L.push(`      uses ${x.module} ${x.entry} (${x.changes.join(', ')})${x.through ? ` [${x.module} changed through ${x.through}]` : ''} at ${x.lines.join(', ')}`);
    }
    if (t.undeclared.length) L.push(`      note: uses ${t.undeclared.join(', ')} without declaring it`);
  }
  for (const n of r.notTold) L.push(`  not told: ${n.user} (${n.why})`);
  return L.join('\n');
}
