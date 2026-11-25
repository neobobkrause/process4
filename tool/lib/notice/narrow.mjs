// The narrowing of decision 2 (the owner's decision 3B of 25 Nov 2026; design part 2, section 7; build text 5, section 6).
// A user the tool cannot follow fully is told of a changed function, method, value or class member only where:
//  (a) its own files, before or after the change, name that entry: an identifier or property name equal to the entry's
//      name (for a member, the member's name; for an entry named with its file, the name after the file), read over the
//      whole text, comments and strings too; or
//  (b) it reaches the provider in a way the scan cannot read: an import or require the scan cannot follow anywhere in
//      what its files reach; the provider's whole exports taken (`import * as`, `import('...')`, `require('...')` of a
//      provider file); a file of another module in what it reaches that re-exports (`export ... from`) or carries
//      (build text 2b, section 5) and itself reaches the provider; or another module in what it reaches that hands the
//      changed entry on as a value or takes the provider's whole exports.
// Any other changed entry (a kind, a handle kind, a class, an operation, a table, a table of operations) tells it as
// before. Accepted misses (the design accepts a missed user, part 2, section 7): a function handed in as a callback from
// a module the user does not reach, and a name built from pieces.
import fs from 'node:fs';
import { makeReach } from './staged.mjs';

/** The kinds of entry the narrowing applies to; any other tells a user that is not followed fully as before. */
export const NARROWED = new Set(['function', 'value', 'method', 'class member']);

const IDENT = /[A-Za-z_$][\w$]*/g;
// The provider's whole exports taken: a namespace import, or a literal import()/require() of one of its files.
const WHOLE = [/\bimport\s*\*\s*as\s+[\w$]+\s*from\s*(['"])([^'"\n]+)\1/g, /\bimport\s*\(\s*(['"])([^'"\n]+)\1\s*\)/g, /\brequire\s*\(\s*(['"])([^'"\n]+)\1\s*\)/g];
const REEXPORT_FROM = /\bexport\s*(?:\*(?:\s*as\s+[\w$]+)?|\{[^}]*\})\s*from\b/;

/** The names a changed entry is matched by: the entry's name, or for a member the member's name; before and after. */
export function namesOf(e) {
  const all = [e.entry, ...(e.names ?? []), ...(e.to ? [e.to] : [])];
  return [...new Set(all.map((n) => n.replace(/^.*:/, '').split(/[.#]/).pop()))];
}
export const kindOf = (e) => e.before?.kind ?? e.after?.kind;

/**
 * @param usesOf (module) => its uses before the change (usage.mjs), where read; with amend (the default), a
 *   user is told too where a module in its reach hands the changed entry on as a value, or takes the provider's whole
 *   exports, so that the user may hold the entry under another name.
 */
export function makeNarrow(treeB, treeA, { usesOf = () => undefined, amend = true } = {}) {
  const sides = [treeB, treeA].map((tree) => ({ tree, reach: makeReach(tree) }));
  const tokens = new Map(); // user -> Set of names in its files
  const opaque = new Map(); // `${user}|${provider}` -> why, or null
  const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };

  function namesIn(user) {
    if (!tokens.has(user)) {
      const set = new Set();
      for (const { tree } of sides) for (const f of tree.byId.get(user)?.files ?? []) for (const m of read(f).match(IDENT) ?? []) set.add(m);
      tokens.set(user, set);
    }
    return tokens.get(user);
  }

  /** Why the user reaches the provider in a way the scan cannot read, or null. */
  function opaqueWhy(user, provider) {
    const key = `${user}|${provider}`;
    if (opaque.has(key)) return opaque.get(key);
    let why = null;
    for (const { tree, reach } of sides) {
      const mod = tree.byId.get(user);
      if (!mod || why) continue;
      const isP = (f) => tree.moduleOfFile(f) === provider;
      const c = reach.closure(mod.files);
      if (c.unresolved) { why = 'reaches an import the scan cannot follow'; break; }
      for (const f of mod.files) {
        const text = read(f);
        for (const re of WHOLE) {
          re.lastIndex = 0;
          for (let m; !why && (m = re.exec(text));) { const r = reach.resolve(m[2], f); if (typeof r === 'string' && isP(r)) why = `takes the whole of ${provider} at ${f}`; }
        }
      }
      if (why) break;
      for (const g of c.files) {
        const o = tree.moduleOfFile(g);
        if (o === user || o === provider) continue;
        const s = reach.scan(g);
        if (!s.carrier && !REEXPORT_FROM.test(read(g))) continue;
        if ([...reach.closure([g]).files].some(isP)) { why = `reaches ${provider} through ${o ?? 'a file of no module'} (${s.carrier ? 'a carrier' : 'a re-export'})`; break; }
      }
    }
    opaque.set(key, why);
    return why;
  }

  /**
   * The changed entries of provider `m` that tell a user not followed fully, of those that tell users at all, with why.
   */
  function telling(user, m, entries) {
    const out = [];
    for (const e of entries) {
      if (!NARROWED.has(kindOf(e))) { out.push(e.entry); continue; }
      if (namesOf(e).some((n) => namesIn(user).has(n))) { out.push(e.entry); continue; }
      if (opaqueWhy(user, m)) { out.push(e.entry); continue; }
      if (amend && passedOn(user, m, e)) out.push(e.entry);
    }
    return out;
  }

  /** Amendment: a module in the user's reach (not the user, not the provider) hands the entry on as a value or takes the provider whole. */
  const wholeIn = new Map();
  function takesWhole(q, provider, tree, reach) {
    const key = `${q}|${provider}`;
    if (!wholeIn.has(key)) {
      let found = false;
      for (const f of tree.byId.get(q)?.files ?? []) {
        const text = read(f);
        for (const re of WHOLE) { re.lastIndex = 0; for (let mm; !found && (mm = re.exec(text));) { const r = reach.resolve(mm[2], f); if (typeof r === 'string' && tree.moduleOfFile(r) === provider) found = true; } }
      }
      wholeIn.set(key, found);
    }
    return wholeIn.get(key);
  }
  function passedOn(user, provider, e) {
    for (const { tree, reach } of sides) {
      const mod = tree.byId.get(user);
      if (!mod) continue;
      const others = new Set([...reach.closure(mod.files).files].map((f) => tree.moduleOfFile(f)).filter((o) => o && o !== user && o !== provider));
      for (const q of others) {
        if (takesWhole(q, provider, tree, reach)) return `${q} takes the whole of ${provider}`;
        const u = usesOf(q)?.uses.get(provider)?.get(e.entry);
        if (u?.asValue) return `${q} hands ${e.entry} on as a value`;
      }
    }
    return null;
  }

  return { telling, namesIn, opaqueWhy };
}
