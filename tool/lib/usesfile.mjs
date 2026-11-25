// A module's uses file, process/modules/<module>.uses.json (design part 2, section 7, "Who uses what"): read only.
// The tool writes it from the module's code and tests at every push of the module's job; this file holds only the
// reader that notify, merge, related and walk share. A minimal reader, written for the notice's lookup before the
// writer was built beside it; the writer's module is expected to take this file over and keep `readUsesFile` and
// `usesFilePath` as they are named here.
//
// The form read: { module, written: { commit, tool }, providers: [<module>], uses: [ { provider, item, itemKind, type,
// route, standard, where: [ { file, side, line, in?, test? } ] } ], outside: [ { rule, file, side, line, mayRefer,
// waitsOn?, tests? } ], orderFaults: [], copies: [] }.
import fs from 'node:fs';
import path from 'node:path';

/** The uses file's path in the product, relative to its top. */
export const usesFilePath = (cfg, module) => `${cfg.process_folder.replace(/\/?$/, '/')}modules/${module}.uses.json`;

/**
 * A module's uses file in a product folder (a working tree, or a commit written out), or null where it has none. A
 * file that cannot be read as the form is reported as `unreadable`, never thrown: the module is then treated as one with
 * no uses file (told of every change of an earlier module it imports; its whole tests run).
 * @param tree a product (notice/model.mjs loadTree), or { root, cfg }
 */
export function readUsesFile(tree, module) {
  const file = path.join(tree.root, usesFilePath(tree.cfg, module));
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  let data;
  try { data = JSON.parse(text); } catch (e) { return { module, unreadable: `not JSON: ${e.message}` }; }
  if (!data || typeof data !== 'object' || !Array.isArray(data.uses ?? [])) return { module, unreadable: 'not the form of a uses file' };
  return {
    module,
    providers: Array.isArray(data.providers) ? data.providers.map(String) : [],
    uses: (data.uses ?? []).filter((u) => u && typeof u.provider === 'string' && typeof u.item === 'string').map((u) => ({ ...u, where: Array.isArray(u.where) ? u.where : [] })),
    outside: Array.isArray(data.outside) ? data.outside.filter((o) => o && typeof o === 'object') : [],
    orderFaults: Array.isArray(data.orderFaults) ? data.orderFaults : [],
    written: data.written ?? null,
  };
}

/** Whether a module's uses file can be read: a file that is missing or unreadable counts as none. */
export const hasUsesFile = (u) => !!u && !u.unreadable;

/**
 * The modules a uses file says the module may use: the providers it names, those its uses name, and those a place
 * outside the standard may refer to (`mayRefer`; where it names none, or `*`, every earlier module, given as '*').
 */
export function providersOf(u) {
  const out = new Set([...(u.providers ?? []), ...(u.uses ?? []).map((x) => x.provider)]);
  for (const o of u.outside ?? []) {
    const may = Array.isArray(o.mayRefer) ? o.mayRefer : [];
    if (!may.length || may.includes('*')) out.add('*');
    for (const m of may) if (m !== '*') out.add(String(m));
  }
  return out;
}
