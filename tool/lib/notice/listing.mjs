// The listing: a module's items and their stated kinds, written out from its interface files with the reader's checker,
// with the bound lines its comments mark (build text 2b, section 6). It is the first part of each item's means (M1 to
// M3 and M9, design part 2, section 7), which means.mjs completes from the code; and the bound lines, whose change is a
// change of the interface (design part 2, section 7, rule 3 for the tool).
import fs from 'node:fs';
import path from 'node:path';
import { ts, tagsOf, tagText, lineOf, docsOf, forEachNode } from './ts.mjs';
import { makeCanon } from './canon.mjs';

/** Does the module carry interface comments at all? (Mechanical: any JSDoc tag that states a kind.) */
export function hasInterfaceComments(mod) {
  return mod.src.some((f) => /@(param|returns?|type|typedef|property|template|import)\s*[{\s]/.test(fs.readFileSync(f, 'utf8')));
}

const newCtx = () => ({ kinds: new Map(), stack: [] });

/** Bound lines of a kind, split among its members: "member: ..." or "member.x ..." belongs to that member. */
function boundsFor(lines, member, memberNames) {
  // Iteration 6 (rule 41): a line belongs to one member only when written "member.<rest>"; any other line belongs to
  // every member, so a new member's name cannot capture a line.
  return lines.filter((l) => {
    const m = /^([A-Za-z_$][\w$]*)\./.exec(l);
    if (m && memberNames.includes(m[1])) return m[1] === member;
    return true;
  });
}

/** A class member's own bound lines: on its declaration, or on the statement of a field set by assignment (this.x = ...). */
function memberOwnBounds(md) {
  if (!md) return [];
  let host = md;
  if (ts.isPropertyAccessExpression(host) && host.parent && ts.isBinaryExpression(host.parent) && host.parent.left === host) host = host.parent;
  if (ts.isBinaryExpression(host) && host.parent && ts.isExpressionStatement(host.parent)) host = host.parent;
  return tagsOf(host, 'bound').map(tagText);
}

/**
 * @param program the program the listings are read from
 * @param tree the product
 */
export function makeLister(program, tree) {
  const checker = program.getTypeChecker();
  const C = makeCanon(checker, tree);

  /**
   * The bound lines of every kind of plain data written out inside an entry. Decided: they are listed as written,
   * without the kind's name, so that renaming a kind does not look like a changed bound.
   */
  function nestedBounds(kctx) {
    const out = [];
    for (const [, decl] of [...kctx.kinds.entries()].sort()) for (const tag of tagsOf(decl, 'bound')) out.push(tagText(tag));
    return out;
  }

  function rangeOf(node, kind) {
    const sf = node.getSourceFile();
    if (kind === 'jsdoc') return { file: sf.fileName, start: node.pos, end: node.end };
    const own = docsOf(node);
    return { file: sf.fileName, start: own.length ? own[0].pos : node.getStart(sf), end: node.end };
  }

  /** @param mod the module to list */
  function list(mod) {
    const entries = {};
    const ranges = [];
    const kindsIn = { accepts: new Map(), handsBack: new Map() }; // data kind key -> entries mentioning it
    const note = (side, kctx, entryName) => { for (const k of kctx.kinds.keys()) { if (!kindsIn[side].has(k)) kindsIn[side].set(k, []); kindsIn[side].get(k).push(entryName); } };
    const dataKinds = [];
    const exportsOf = (file) => {
      const sf = program.getSourceFile(file);
      const modSym = sf && checker.getSymbolAtLocation(sf);
      return modSym ? checker.getExportsOfModule(modSym) : [];
    };
    const resolved = (exp) => (exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp);
    // A name that two interface files export for two different things is two entries, each named with its file
    // (`<file>:<name>`); otherwise the second would hide the first.
    const things = new Map();
    for (const file of mod.public) for (const exp of exportsOf(file)) {
      if (!things.has(exp.name)) things.set(exp.name, new Set());
      things.get(exp.name).add(resolved(exp));
    }
    for (const file of mod.public) {
      for (const exp of exportsOf(file)) {
        const sym = resolved(exp);
        const decl = sym.declarations?.[0];
        if (!decl) continue;
        const where = `${path.relative(tree.root, decl.getSourceFile().fileName)}:${lineOf(decl)}`;
        const name = things.get(exp.name).size > 1 ? `${path.relative(tree.root, file)}:${exp.name}` : exp.name;
        if (entries[name]) continue; // the same thing exported again from a second file stays one entry
        if (sym.flags & ts.SymbolFlags.TypeAlias) {
          const t = checker.getDeclaredTypeOfSymbol(sym);
          const bounds = tagsOf(decl, 'bound').map(tagText);
          ranges.push({ entry: name, ...rangeOf(decl, 'jsdoc') });
          if (tagsOf(decl, 'optable').length) {
            const props = checker.getPropertiesOfType(t);
            const names = props.map((p) => p.name).sort();
            entries[name] = { kind: 'operation table', handsBack: { k: 'names', names }, bounds: [], where };
            for (const p of props) {
              const pt = checker.getTypeOfSymbol(p);
              const req = checker.getPropertyOfType(pt, 'req');
              const res = checker.getPropertyOfType(pt, 'res');
              const a = newCtx(), h = newCtx();
              const e = `op:${p.name}`;
              entries[e] = {
                kind: 'operation',
                accepts: req ? C.canon(checker.getTypeOfSymbol(req), a) : null,
                handsBack: res ? C.canon(checker.getTypeOfSymbol(res), h) : null,
                bounds: [...boundsFor(bounds, p.name, names), ...nestedBounds(a), ...nestedBounds(h)],
                where: p.declarations?.[0] ? `${path.relative(tree.root, p.declarations[0].getSourceFile().fileName)}:${lineOf(p.declarations[0])}` : where,
              };
              note('accepts', a, e); note('handsBack', h, e);
              if (p.declarations?.[0]) ranges.push({ entry: e, ...rangeOf(p.declarations[0], 'jsdoc') });
            }
          } else if (C.isHandle(t)) {
            const props = checker.getPropertiesOfType(t);
            const names = props.map((p) => p.name).sort();
            entries[name] = { kind: 'handle kind', handsBack: { k: 'names', names }, bounds: [], where };
            for (const p of props) {
              const e = `${name}.${p.name}`;
              const mt = checker.getNonNullableType(checker.getTypeOfSymbol(p));
              const sigs = mt.getCallSignatures();
              const a = newCtx(), h = newCtx();
              let accepts = null, handsBack;
              if (sigs.length) {
                const c = C.canonSig(sigs[0], a, h);
                accepts = { k: 'params', items: c.params, ...(c.tparams ? { tparams: c.tparams } : {}) };
                handsBack = c.ret;
              } else handsBack = C.canon(mt, h);
              entries[e] = { kind: 'method', accepts, handsBack, bounds: [...boundsFor(bounds, p.name, names), ...nestedBounds(a), ...nestedBounds(h)], where };
              // Iteration 3 (rule 12): a member that may be missing says so.
              const raw = checker.getTypeOfSymbol(p);
              if (p.flags & ts.SymbolFlags.Optional || (raw.flags & ts.TypeFlags.Union && raw.types.some((x) => x.flags & ts.TypeFlags.Undefined))) entries[e].optional = true;
              note('accepts', a, e); note('handsBack', h, e);
              if (p.declarations?.[0]) ranges.push({ entry: e, ...rangeOf(p.declarations[0], 'jsdoc') });
            }
          } else {
            const k = newCtx();
            const shape = C.canon(t, k, true);
            k.kinds.delete(`${mod.id}.${exp.name}`);
            entries[name] = { kind: 'kind', shape, bounds: [...bounds, ...nestedBounds(k)], where };
            dataKinds.push(name);
            // Iteration 2: the rows of a shared table, owned by this module.
            for (const tag of tagsOf(decl, 'storedrows')) {
              const table = tagText(tag).split(/\s+/)[0];
              entries[`table:${table}`] = { kind: 'stored rows', accepts: shape, handsBack: shape, side: 'both', bounds: [...bounds, ...nestedBounds(k)], where, rowKind: name };
            }
          }
          continue;
        }
        // functions and values
        const t = checker.getTypeOfSymbol(sym);
        const sigs = t.getCallSignatures();
        const host = ts.isVariableDeclaration(decl) ? decl.parent.parent : decl;
        ranges.push({ entry: name, ...rangeOf(host) });
        const ownBounds = tagsOf(decl, 'bound').map(tagText);
        const a = newCtx(), h = newCtx();
        const ctors = t.getConstructSignatures();
        if (ctors.length) {
          // Iteration 3 (rule 17): an exported class lists what its constructor accepts, and what it builds.
          const c = C.canonSig(ctors[0], a, h);
          entries[name] = { kind: 'class', accepts: { k: 'params', items: c.params }, handsBack: c.ret, bounds: [...ownBounds, ...nestedBounds(a), ...nestedBounds(h)], where };
          // Iteration 5 (rule 27): each member of the class, static or not, is an entry of its own.
          const members = [
            ...checker.getPropertiesOfType(t).filter((p) => p.name !== 'prototype').map((p) => [`${name}.${p.name}`, p]),
            ...checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(sym)).map((p) => [`${name}#${p.name}`, p]),
          ];
          for (const [e, p] of members) {
            const mt = checker.getTypeOfSymbol(p);
            const msigs = mt.getCallSignatures();
            const ma = newCtx(), mh = newCtx();
            // The member's own bound lines, as a class's and a function's are listed (design part 2, section 7, rule 3
            // for the tool): a changed one tells its users.
            const memberBounds = memberOwnBounds(p.declarations?.[0]);
            if (msigs.length) { const mc = C.canonSig(msigs[0], ma, mh); entries[e] = { kind: 'class member', accepts: { k: 'params', items: mc.params }, handsBack: mc.ret, bounds: [...memberBounds, ...nestedBounds(ma), ...nestedBounds(mh)], where }; }
            else entries[e] = { kind: 'class member', accepts: null, handsBack: C.canon(mt, mh), bounds: [...memberBounds, ...nestedBounds(mh)], where };
            const md = p.declarations?.[0];
            if (md) ranges.push({ entry: e, ...rangeOf(md) });
          }
        } else if (sigs.length && checker.getPropertiesOfType(t).length === 0) {
          const c = C.canonSig(sigs[0], a, h);
          entries[name] = {
            kind: 'function',
            accepts: { k: 'params', items: c.params, ...(c.tparams ? { tparams: c.tparams } : {}) },
            handsBack: c.ret,
            bounds: [...ownBounds, ...nestedBounds(a), ...nestedBounds(h)],
            where,
          };
          // Iteration 4: every overload is listed.
          if (sigs.length > 1) {
            const all = sigs.map((sg) => C.canonSig(sg, a, h));
            entries[name].accepts = { k: 'overloads', of: all.map((c2) => ({ k: 'params', items: c2.params })) };
            entries[name].handsBack = { k: 'overloads', of: all.map((c2) => c2.ret) };
          }
        } else {
          // A constant's value is in its range (design part 2, section 7): its kind is kept as the reader reads it, a
          // lone literal as that literal, and its value as written (its code decides a change: notice.mjs, compareItem).
          const init = ts.isVariableDeclaration(decl) ? decl.initializer : null;
          const value = init ? init.getText().replace(/\s+/g, ' ').slice(0, 120) : undefined;
          entries[name] = { kind: 'value', accepts: null, handsBack: C.canon(t, h), bounds: [...ownBounds, ...nestedBounds(h)], where, ...(value !== undefined ? { value } : {}) };
        }
        note('accepts', a, name); note('handsBack', h, name);
      }
    }
    // A kind of plain data is accepted, handed back or both, according to where the module's own entries use it.
    for (const name of dataKinds) {
      const key = `${mod.id}.${name}`;
      const inA = kindsIn.accepts.has(key), inH = kindsIn.handsBack.has(key);
      const side = inA && !inH ? 'accepts' : !inA && inH ? 'handsBack' : 'both';
      const e = entries[name];
      e.side = side;
      e.accepts = side === 'handsBack' ? null : e.shape;
      e.handsBack = side === 'accepts' ? null : e.shape;
      delete e.shape;
    }
    // Bounds written where an object of a listed kind is built belong to that member (iteration 6, rule 37), and a
    // method or handler that only hands its call straight on to another listed entry takes that entry's bounds, which
    // limit what the caller can accept just as much (iteration 6, rule 43).
    const entryOfDecl = (d) => {
      if (!d) return null;
      const f = d.getSourceFile().fileName, at = (d.name ?? d).end - 1;
      let best = null;
      for (const r of ranges) if (r.file === f && r.start <= at && at < r.end && (!best || r.end - r.start < best.end - best.start)) best = r;
      return best?.entry ?? null;
    };
    const delegations = [];
    for (const f of mod.src) {
      const sf = program.getSourceFile(f);
      if (!sf) continue;
      forEachNode(sf, (n) => {
        if (!ts.isObjectLiteralExpression(n)) return;
        const ct = checker.getContextualType(n);
        if (!ct) return;
        for (const prop of n.properties) {
          if (!prop.name || !(ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))) continue;
          const ps = checker.getPropertyOfType(ct, prop.name.text);
          const target = entryOfDecl(ps?.declarations?.[0]);
          if (!target || !entries[target]) continue;
          // the comment of the method, or, for a shorthand member ({ quote }), of the variable it names
          let doc = prop;
          if (ts.isShorthandPropertyAssignment(prop)) { const vd = checker.getShorthandAssignmentValueSymbol(prop)?.declarations?.[0]; if (vd) doc = vd; }
          const bnds = tagsOf(doc, 'bound').map(tagText);
          if (bnds.length) entries[target].bounds = [...new Set([...(entries[target].bounds ?? []), ...bnds])].sort();
          const fn = ts.isMethodDeclaration(prop) ? prop : ts.isPropertyAssignment(prop) && (ts.isArrowFunction(prop.initializer) || ts.isFunctionExpression(prop.initializer)) ? prop.initializer : null;
          let body = fn?.body;
          if (body && ts.isBlock(body) && body.statements.length === 1 && ts.isReturnStatement(body.statements[0])) body = body.statements[0].expression;
          while (body && (ts.isParenthesizedExpression(body) || ts.isAwaitExpression(body))) body = body.expression;
          if (!body || !ts.isCallExpression(body)) continue;
          // does the method only hand its call straight on, (req) => bookings.open(req)?
          const params = new Set((fn?.parameters ?? []).map((p) => (ts.isIdentifier(p.name) ? p.name.text : '')));
          const fromParam = (x) => { while (ts.isPropertyAccessExpression(x)) x = x.expression; return ts.isIdentifier(x) && params.has(x.text); };
          if (!body.arguments.every(fromParam)) continue;
          const callee = ts.isPropertyAccessExpression(body.expression) ? body.expression.name : body.expression;
          let sym = checker.getSymbolAtLocation(callee);
          if (sym && sym.flags & ts.SymbolFlags.Alias) { try { sym = checker.getAliasedSymbol(sym); } catch { sym = undefined; } }
          // a local function of the module (such as quote inside createBookings) stands for the member it fills
          const d = sym?.declarations?.[0];
          let from = entryOfDecl(d);
          if (!from && d && ts.isVariableDeclaration(d)) from = Object.keys(entries).find((x) => x.endsWith(`.${sym.name}`) && entries[x].kind === 'method') ?? null;
          if (from && from !== target) delegations.push([target, from]);
        }
      });
    }
    for (let round = 0; round < 3; round++) for (const [to, from] of delegations) {
      const inb = entries[from]?.bounds ?? [];
      if (inb.length) entries[to].bounds = [...new Set([...(entries[to].bounds ?? []), ...inb])];
    }
    for (const e of Object.values(entries)) e.bounds = [...new Set(e.bounds)].sort();
    const sorted = Object.fromEntries(Object.keys(entries).sort().map((k) => [k, entries[k]]));
    return { module: mod.id, hasInterfaceComments: hasInterfaceComments(mod), entries: sorted, ranges };
  }

  return { list, checker, canonApi: C };
}
