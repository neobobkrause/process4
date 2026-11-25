// The canonical form of a kind: a plain tree that two readings can compare field by field.
//
// Decided here (not settled by the method):
// - A kind of plain data is written out in full wherever it appears, so a change to it shows in every entry that
//   accepts or hands it back.
// - A kind whose members include operations (a "handle", such as the object a factory hands out) is written by
//   its name only; each of its members is an entry of its own. So a change to one method tells the users of that
//   method, not every user of the factory.
// - A kind that still mentions a type parameter (generic code, such as the door) is written as TypeScript prints it.
// - A kind written by its name in the product keeps its name beside its shape (the means, design part 2, section 7: "its
//   stated types, expanded through every type they name", names kept, since a user may write the name); a cycle is cut
//   at a name. A user that writes a name uses the kind's own entry, so where two forms differ only in a name, the
//   comparison asks the checker, which finds them the same (notice.mjs, makeConfirm). A kind joined with & to a plain
//   value (a named kind for a meaningful value, `number & {...}`) keeps every part. A field stated read-only says so.
import { ts } from './ts.mjs';

const P = (n) => ({ k: 'prim', n });

export function makeCanon(checker, tree) {
  const isProductDecl = (d) => d && !d.getSourceFile().isDeclarationFile && tree.moduleOfFile(d.getSourceFile().fileName);

  /** The named kind a type was written as, if it was declared in the product. */
  function productAlias(t) {
    for (const sym of [t.aliasSymbol, t.symbol]) {
      if (!sym || sym.name.startsWith('__')) continue;
      const d = sym.declarations?.[0];
      if (d && isProductDecl(d) && (ts.isJSDocTypedefTag(d) || ts.isTypeAliasDeclaration(d) || ts.isJSDocCallbackTag(d))) {
        return { sym, decl: d, module: tree.moduleOfFile(d.getSourceFile().fileName), name: sym.name };
      }
    }
    return null;
  }

  function isHandle(t) {
    if (!(t.flags & ts.TypeFlags.Object) || checker.isArrayType(t) || checker.isTupleType(t)) return false;
    if (t.getCallSignatures().length) return false;
    return checker.getPropertiesOfType(t).some((p) => {
      const pt = checker.getNonNullableType(checker.getTypeOfSymbol(p));
      return pt.getCallSignatures().length > 0;
    });
  }

  function isGeneric(t) {
    return !!(t.flags & (ts.TypeFlags.TypeParameter | ts.TypeFlags.IndexedAccess | ts.TypeFlags.Conditional |
      ts.TypeFlags.Substitution | ts.TypeFlags.Index));
  }

  /**
   * @param t the type
   * @param ctx { kinds: Map of data kinds written out (module.name -> declaration), stack: types being written }
   * @param top true when writing the named kind itself (so a handle is opened, not named)
   */
  function canon(t, ctx, top = false) {
    const f = t.flags;
    if (f & ts.TypeFlags.Any) return { k: 'any' };
    if (f & ts.TypeFlags.Unknown) return P('unknown');
    if (f & ts.TypeFlags.String) return P('string');
    if (f & ts.TypeFlags.Number) return P('number');
    if (f & ts.TypeFlags.Boolean && !(f & ts.TypeFlags.Union)) return P('boolean');
    if (f & ts.TypeFlags.BigInt) return P('bigint');
    if (f & ts.TypeFlags.ESSymbolLike) return P('symbol');
    if (f & ts.TypeFlags.Undefined) return P('undefined');
    if (f & ts.TypeFlags.Null) return P('null');
    if (f & ts.TypeFlags.Void) return P('void');
    if (f & ts.TypeFlags.Never) return P('never');
    if (f & ts.TypeFlags.StringLiteral) return { k: 'lit', v: t.value };
    if (f & ts.TypeFlags.NumberLiteral) return { k: 'lit', v: t.value };
    if (f & ts.TypeFlags.BooleanLiteral) return { k: 'lit', v: checker.typeToString(t) === 'true' };
    if (f & ts.TypeFlags.TemplateLiteral) return { k: 'text', t: checker.typeToString(t) };
    if (isGeneric(t)) return { k: 'generic', t: checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation) };
    if (f & ts.TypeFlags.Union) {
      let of = t.types.map((m) => canon(m, ctx));
      const hasT = of.some((x) => x.k === 'lit' && x.v === true);
      const hasF = of.some((x) => x.k === 'lit' && x.v === false);
      if (hasT && hasF) of = [...of.filter((x) => !(x.k === 'lit' && typeof x.v === 'boolean')), P('boolean')];
      const seen = new Map();
      for (const x of of) seen.set(JSON.stringify(x), x);
      of = [...seen.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map((e) => e[1]);
      if (of.length === 1) return of[0];
      const alias = productAlias(t);
      return alias ? { k: 'union', of, name: `${alias.module}.${alias.name}` } : { k: 'union', of };
    }
    if (f & ts.TypeFlags.Intersection && t.types.some((m) => !(m.flags & ts.TypeFlags.Object))) {
      const of = t.types.map((m) => canon(m, ctx)).map((x) => [JSON.stringify(x), x]).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map((e) => e[1]);
      const alias = productAlias(t);
      return alias ? { k: 'and', of, name: `${alias.module}.${alias.name}` } : { k: 'and', of };
    }
    if (f & (ts.TypeFlags.Object | ts.TypeFlags.Intersection)) return canonObject(t, ctx, top);
    return { k: 'other', t: checker.typeToString(t) };
  }

  function canonObject(t, ctx, top) {
    if (ctx.stack.includes(t)) return { k: 'cycle', t: checker.typeToString(t) };
    if (ctx.stack.length > 14) return { k: 'deep', t: checker.typeToString(t) };
    const alias = productAlias(t);
    if (alias && !top && isHandle(t)) return { k: 'handle', name: `${alias.module}.${alias.name}` };
    if (alias && !isHandle(t)) ctx.kinds.set(`${alias.module}.${alias.name}`, alias.decl);
    ctx.stack.push(t);
    const named = (r) => (alias && !isHandle(t) && r && typeof r === 'object' && !r.name ? { ...r, name: `${alias.module}.${alias.name}` } : r);
    try {
      return named(objectShape(t, ctx));
    } finally {
      ctx.stack.pop();
    }
  }

  /** Whether a member is stated read-only: `readonly`, a mapped Readonly, or @readonly in its comment. */
  function readOnly(p) {
    if ((ts.getCheckFlags?.(p) ?? 0) & ts.CheckFlags.Readonly) return true;
    if (ts.getDeclarationModifierFlagsFromSymbol(p) & ts.ModifierFlags.Readonly) return true;
    return (p.declarations ?? []).some((d) => ts.getJSDocTags(d).some((tg) => tg.tagName.text === 'readonly'));
  }

  function objectShape(t, ctx) {
    // Iteration 2: a kind written as parts joined with & keeps the bound lines of its parts.
    if (t.flags & ts.TypeFlags.Intersection) for (const part of t.types) { const a = productAlias(part); if (a && !isHandle(part)) ctx.kinds.set(`${a.module}.${a.name}`, a.decl); }
    if (checker.isArrayType(t)) {
      const ro = t.symbol?.name === 'ReadonlyArray';
      return { k: 'arr', ro, of: canon(checker.getTypeArguments(t)[0], ctx) };
    }
    if (checker.isTupleType(t)) {
      const flags = t.target.elementFlags;
      return {
        k: 'tuple',
        ro: !!t.target.readonly,
        items: checker.getTypeArguments(t).map((a, i) => ({ opt: !!(flags[i] & ts.ElementFlags.Optional), rest: !!(flags[i] & ts.ElementFlags.Variable), t: canon(a, ctx) })),
      };
    }
    const sym = t.symbol;
    const d = sym?.declarations?.[0];
    if (sym && d && d.getSourceFile().isDeclarationFile && !sym.name.startsWith('__')) {
      // A kind from the language's own library (Promise, Date, Map...): its name and its arguments.
      const args = (t.typeArguments ?? checker.getTypeArguments?.(t) ?? []).map((a) => canon(a, ctx));
      return { k: 'ref', name: sym.name, args };
    }
    const calls = t.getCallSignatures();
    const props = checker.getPropertiesOfType(t);
    if (calls.length && !props.length) return calls.length === 1 ? canonSig(calls[0], ctx) : { k: 'overloads', of: calls.map((s) => canonSig(s, ctx)) };
    const out = { k: 'obj', props: {} };
    for (const p of [...props].sort((a, b) => (a.name < b.name ? -1 : 1))) {
      notePrimitiveKind(p.declarations?.[0], ctx);
      const opt = !!(p.flags & ts.SymbolFlags.Optional);
      let pt = checker.getTypeOfSymbol(p);
      if (opt) pt = removeOptionalMark(pt, p);
      out.props[p.name] = readOnly(p) ? { opt, ro: true, t: canon(pt, ctx) } : { opt, t: canon(pt, ctx) };
    }
    const idx = checker.getIndexInfosOfType(t);
    if (idx.length) out.index = idx.map((i) => ({ key: canon(i.keyType, ctx), t: canon(i.type, ctx) }));
    if (calls.length) out.calls = calls.map((s) => canonSig(s, ctx));
    return out;
  }

  /**
   * Iteration 3 (rule 16): a field or parameter written with a product kind that is just a number or text (the
   * reader keeps no name for it) carries that kind's bound lines.
   */
  function notePrimitiveKind(decl, ctx) {
    if (!decl) return;
    let typeNode = decl.typeExpression?.type ?? decl.type;
    if (!typeNode && ts.isParameter(decl)) typeNode = ts.getJSDocParameterTags(decl)[0]?.typeExpression?.type;
    noteKindsIn(typeNode, ctx);
  }
  function noteKindsIn(typeNode, ctx) {
    if (!typeNode) return;
    const refs = [];
    const collect = (n) => { if (ts.isTypeReferenceNode(n)) refs.push(n.typeName); ts.forEachChild(n, collect); };
    collect(typeNode);
    for (const ref of refs) {
      let sym = checker.getSymbolAtLocation(ts.isQualifiedName(ref) ? ref.right : ref);
      if (sym && sym.flags & ts.SymbolFlags.Alias) { try { sym = checker.getAliasedSymbol(sym); } catch { continue; } }
      const d = sym?.declarations?.[0];
      if (d && isProductDecl(d) && (ts.isJSDocTypedefTag(d) || ts.isTypeAliasDeclaration(d))) {
        const declared = checker.getDeclaredTypeOfSymbol(sym);
        if (!(declared.flags & ts.TypeFlags.Object)) ctx.kinds.set(`${tree.moduleOfFile(d.getSourceFile().fileName)}.${sym.name}`, d);
      }
    }
  }

  function removeUndefined(t) {
    if (!(t.flags & ts.TypeFlags.Union)) return t;
    const rest = t.types.filter((m) => !(m.flags & ts.TypeFlags.Undefined));
    if (rest.length === t.types.length) return t;
    if (rest.length === 1) return rest[0];
    return { ...t, types: rest, __synthetic: true, flags: t.flags };
  }

  /**
   * An optional member's kind without the mark of its being optional. Under the standard's exactOptionalPropertyTypes,
   * `a?: number` and `a?: number | undefined` are different kinds (the second accepts a stated undefined): the checker
   * marks the first with its own "missing" undefined, which is removed; a stated undefined is kept. Where the setting is
   * off, an optional member's undefined is that mark, and is removed, unless its declaration states undefined (then kept:
   * a change may be reported where none is, never missed).
   */
  function removeOptionalMark(t, p) {
    if (!(t.flags & ts.TypeFlags.Union)) return t;
    const missing = t.types.filter((m) => m.debugIntrinsicName === 'missing');
    if (missing.length) {
      const rest = t.types.filter((m) => !missing.includes(m));
      return rest.length === 1 ? rest[0] : { ...t, types: rest, __synthetic: true, flags: t.flags };
    }
    const d = p.declarations?.[0];
    const node = d && (d.typeExpression?.type ?? d.type);
    let stated = null;
    try { stated = node ? checker.getTypeFromTypeNode(node) : null; } catch { stated = null; }
    const hasUndefined = (x) => !!x && (x.flags & ts.TypeFlags.Undefined || (x.flags & ts.TypeFlags.Union && x.types.some((m) => m.flags & ts.TypeFlags.Undefined)));
    return hasUndefined(stated) ? t : removeUndefined(t);
  }

  function paramOptional(p) {
    const d = p.valueDeclaration;
    if (!d) return false;
    if (ts.isParameter(d)) {
      if (d.questionToken || d.initializer || d.dotDotDotToken) return true;
      for (const tag of ts.getJSDocParameterTags(d)) if (tag.isBracketed || (tag.typeExpression && ts.isJSDocOptionalType(tag.typeExpression.type))) return true;
      return checker.isOptionalParameter(d);
    }
    return false;
  }

  function canonSig(sig, ctx, retCtx = ctx) {
    const params = sig.getParameters().map((p) => {
      notePrimitiveKind(p.valueDeclaration, ctx);
      const opt = paramOptional(p);
      const rest = !!(p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken);
      let pt = checker.getTypeOfSymbol(p);
      if (opt && !rest) pt = removeUndefined(pt);
      // Iteration 4: a rest parameter accepts its elements one by one: it is written as its element's kind.
      if (rest && checker.isArrayType(pt)) pt = checker.getTypeArguments(pt)[0];
      return { opt, rest, t: canon(pt, ctx) };
    });
    // Iteration 4 (rule 25): a number or text kind written as what is handed back carries its bound lines.
    const rd = sig.declaration;
    if (rd) noteKindsIn(rd.type ?? ts.getJSDocReturnType(rd), retCtx);
    const out = { k: 'fn', params, ret: canon(sig.getReturnType(), retCtx) };
    // a type parameter's constraint in the tool's own (ordered) form, so the same constraint printed in another order
    // is the same (iteration 4)
    if (sig.typeParameters?.length) out.tparams = sig.typeParameters.map((tp) => checker.typeToString(tp) + ' extends ' + (tp.getConstraint() ? JSON.stringify(canon(tp.getConstraint(), { kinds: new Map(), stack: [] })) : 'unknown'));
    return out;
  }

  return { canon, canonSig, isHandle, productAlias, removeUndefined };
}

// ---- comparing two canonical forms ----

export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Can `nu` stand in for `old` in what it accepts? True when everything the old one accepted is still accepted
 * the same way: nothing removed or renamed, nothing newly required, nothing newly refused.
 */
export function standsIn(old, nu) {
  if (old == null) return true; // nothing was accepted before: anything accepted now is more (iteration 2)
  if (nu == null) return false; // nothing is accepted now: something was removed
  if (same(old, nu)) return true;
  if (nu.k === 'any' || (nu.k === 'prim' && nu.n === 'unknown')) return true;
  if (old.k === 'union') return old.of.every((m) => standsIn(m, nu));
  if (nu.k === 'union') return nu.of.some((m) => standsIn(old, m));
  if (old.k === 'lit' && nu.k === 'prim') return typeof old.v === nu.n;
  if (old.k === 'lit' && nu.k === 'text') return typeof old.v === 'string';
  if (old.k !== nu.k) return false;
  switch (old.k) {
    case 'obj': {
      for (const [name, op] of Object.entries(old.props)) {
        const np = nu.props[name];
        if (!np) return false; // removed or renamed
        if (op.opt && !np.opt) return false; // newly required
        if (op.ro && !np.ro) return false; // a read-only field made writable: the provider may now change it
        if (!standsIn(op.t, np.t)) return false;
      }
      for (const [name, np] of Object.entries(nu.props)) if (!old.props[name] && !np.opt) return false; // newly required
      if (old.index && !nu.index) return false;
      if (old.index && nu.index && !standsIn({ k: 'union', of: old.index.map((i) => i.t) }, { k: 'union', of: nu.index.map((i) => i.t) })) return false;
      if (old.calls || nu.calls) return same(old.calls, nu.calls);
      return true;
    }
    case 'arr':
      if (old.ro && !nu.ro) return false; // a read-only list made writable: the provider may now change it (iteration 4)
      return standsIn(old.of, nu.of);
    case 'tuple':
    case 'params': {
      const oi = old.items, ni = nu.items;
      if (JSON.stringify(old.tparams ?? null) !== JSON.stringify(nu.tparams ?? null)) return false; // iteration 4
      for (let i = 0; i < oi.length; i++) {
        if (!ni[i]) return false; // removed
        if (!!oi[i].rest !== !!ni[i].rest) return false; // a list turned into a rest parameter, or back (iteration 4)
        if (oi[i].opt && !ni[i].opt) return false;
        if (!standsIn(oi[i].t, ni[i].t)) return false;
      }
      for (let i = oi.length; i < ni.length; i++) if (!ni[i].opt && !ni[i].rest) return false; // newly required
      return true;
    }
    case 'promise':
      return standsIn(old.of, nu.of);
    default:
      // functions handed in, handles, library kinds, generics: only the same thing stands in
      return same(old, nu);
  }
}

/**
 * Whether, after the change, a function the user hands in may be handed more arguments than before (design part 2,
 * section 7, rule 52): a function stated where the user supplies the value (`mine`: what an item accepts, and inside it
 * what a function the user hands in hands back; flipped at each function's parameters) whose parameter list grows, by a
 * parameter or a rest. The type checker lets a function with fewer parameters stand where more are expected, so it
 * confirms the old accepted kind assignable to the new; but a user's function whose further parameter is optional, of
 * another kind, was accepted before and is not now, and is handed the new argument where it runs. Never "accepts more".
 * Handed fewer or narrower arguments is not this. Each alternative of a union or of overloads is set against the old
 * ones; a function against the old functions at the same place, by its most parameters.
 */
export function handsMoreArguments(old, nu, mine = true) {
  if (!old || !nu || typeof old !== 'object' || typeof nu !== 'object') return false;
  const alts = (c) => (['union', 'and', 'overloads'].includes(c.k) ? c.of.flatMap(alts) : [c]);
  const arity = (f) => (f.params.some((p) => p.rest) ? Infinity : f.params.length);
  const olds = alts(old);
  for (const n of alts(nu)) {
    const like = olds.filter((o) => o.k === n.k);
    if (n.k === 'fn' && mine && like.length && arity(n) > Math.max(...like.map(arity))) return true;
    for (const o of like) {
      switch (n.k) {
        case 'params': case 'tuple':
          for (let i = 0; i < Math.min(o.items.length, n.items.length); i++) if (handsMoreArguments(o.items[i].t, n.items[i].t, mine)) return true;
          break;
        case 'fn':
          for (let i = 0; i < Math.min(o.params.length, n.params.length); i++) if (handsMoreArguments(o.params[i].t, n.params[i].t, !mine)) return true;
          if (handsMoreArguments(o.ret, n.ret, mine)) return true;
          break;
        case 'obj':
          for (const [name, np] of Object.entries(n.props)) if (o.props[name] && handsMoreArguments(o.props[name].t, np.t, mine)) return true;
          for (const ni of n.index ?? []) for (const oi of o.index ?? []) if (handsMoreArguments(oi.t, ni.t, mine)) return true;
          if (n.calls && o.calls && handsMoreArguments({ k: 'overloads', of: o.calls }, { k: 'overloads', of: n.calls }, mine)) return true;
          break;
        case 'arr': case 'promise':
          if (handsMoreArguments(o.of, n.of, mine)) return true;
          break;
        default:
      }
    }
  }
  return false;
}

/**
 * The handle kinds and classes of a module whose values a user may supply (`<module>.<name>`), from its items' means:
 * a handle stated where the user supplies the value, as handsMoreArguments reads it; and, to a fixpoint, inside the
 * methods of such a handle, which the provider calls and the user writes, with the sides flipped. Their methods are
 * functions the user hands in.
 */
export function handlesHandedIn(items, moduleId) {
  const out = new Set();
  const walk = (c, mine) => {
    if (!c || typeof c !== 'object') return;
    if (Array.isArray(c)) { for (const x of c) walk(x, mine); return; }
    if (c.k === 'handle' && mine) out.add(c.name);
    if (c.k === 'fn') { for (const p of c.params) walk(p.t, !mine); walk(c.ret, mine); return; }
    for (const v of Object.values(c)) if (v && typeof v === 'object') walk(v, mine);
  };
  const ownerOf = (name) => /^([^.#:]+)[.#]/.exec(name)?.[1];
  let size = -1;
  while (out.size !== size) {
    size = out.size;
    for (const [name, it] of Object.entries(items)) {
      const params = it?.accepts?.k === 'params' ? it.accepts.items : [];
      walk(it?.accepts, true);
      walk(it?.handsBack, false);
      if (ownerOf(name) && out.has(`${moduleId}.${ownerOf(name)}`)) walk({ k: 'fn', params, ret: it?.handsBack ?? null }, true);
    }
  }
  return out;
}

// ---- writing a canonical form for people ----

export function render(c) {
  if (c == null) return '-';
  switch (c.k) {
    case 'any': return 'anything';
    case 'prim': return c.n;
    case 'lit': return JSON.stringify(c.v);
    case 'text': return c.t;
    case 'generic': return c.t;
    case 'other': return c.t;
    case 'cycle': return `(${c.t} again)`;
    case 'deep': return `(${c.t})`;
    case 'union': return c.of.map(render).join(' | ');
    case 'and': return c.of.map(wrap).join(' & ');
    case 'arr': return `${c.ro ? 'readonly ' : ''}${wrap(c.of)}[]`;
    case 'tuple': return `${c.ro ? 'readonly ' : ''}[${c.items.map((i) => `${i.rest ? '...' : ''}${render(i.t)}${i.opt ? '?' : ''}`).join(', ')}]`;
    case 'params': return `(${c.items.map((i, n) => `${i.rest ? '...' : ''}${i.name ?? 'arg' + n}${i.opt ? '?' : ''}: ${render(i.t)}`).join(', ')})`;
    case 'handle': return `handle ${c.name}`;
    case 'ref': return c.args?.length ? `${c.name}<${c.args.map(render).join(', ')}>` : c.name;
    case 'fn': return `${c.tparams ? `<${c.tparams.join(', ')}>` : ''}(${c.params.map((p, i) => `${p.rest ? '...' : ''}arg${i}${p.opt ? '?' : ''}: ${render(p.t)}`).join(', ')}) => ${render(c.ret)}`;
    case 'overloads': return c.of.map(render).join(' & ');
    case 'names': return `names: ${c.names.join(', ')}`;
    case 'obj': {
      const parts = Object.entries(c.props).map(([n, p]) => `${p.ro ? 'readonly ' : ''}${n}${p.opt ? '?' : ''}: ${render(p.t)}`);
      if (c.index) parts.push(...c.index.map((i) => `[key: ${render(i.key)}]: ${render(i.t)}`));
      if (c.calls) parts.push(...c.calls.map(render));
      return `{ ${parts.join('; ')} }`;
    }
    default: return JSON.stringify(c);
  }
}
const wrap = (c) => (c.k === 'union' || c.k === 'and' || c.k === 'fn' ? `(${render(c)})` : render(c));
