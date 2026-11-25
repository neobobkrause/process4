// The notice's reasons on the merged pull request, and the one rule that fits reasons into a comment (build text 1b,
// command 11; build text 5, section 5). For the told users with no open job, notify writes each changed module's
// notice as comments on the merged pull request, each one JSON block under NOTICE_LIMIT characters; a waiting-work
// entry only names the notice ({ module, kind: 'notice', from, merged }); open --module copies that module's reasons
// from these comments into its job block's `uses`.
import { block, parseBlock } from './github.mjs';
import { fail } from './util.mjs';

export const NOTICE_MARK = 'process4-notice';
/** The most characters one notice comment, or one job block, holds; GitHub takes 65,536. */
export const NOTICE_LIMIT = 60000;

const bodyOf = (data) => block(NOTICE_MARK, data);

/** A reason without its before and after (the words of what changed); its entry, changes and lines, which choose the related tests, are kept. */
export const cutReason = (r) => {
  if (r.notFollowed || (r.before === undefined && r.after === undefined)) return r;
  const { before, after, ...rest } = r;
  return { ...rest, cut: 'its before and after are left out: too large for one comment' };
};

/**
 * Reasons cut to fit one comment: the one rule for a notice comment and for a job block. The tool refuses nothing for
 * size (design part 6, section 5), so this never fails. It tries, in order: `held` and the reasons whole; the reasons
 * without their before and after; in their place one "not followed" reason, `whole()`, which runs the told module's
 * whole tests (design part 2, section 7, the three points; build text 1b, command 11); that one with `held` cut too.
 * It returns the first that `fits`; where none does, `whole(held.length)` alone, leaving `held` out.
 * @param held reasons the comment holds already, kept ahead of the new ones (a job block's earlier `uses`)
 * @param fits (reasons) => whether the comment holds them
 * @param whole (dropped) => the one "not followed" reason; `dropped` counts the held reasons left out, if any
 */
export function fitReasons({ held = [], reasons, fits, whole }) {
  const one = whole();
  const steps = [[...held, ...reasons], [...held, ...reasons.map(cutReason)], [...held, one], [...held.map(cutReason), one]];
  return steps.find(fits) ?? [whole(held.length)];
}

/**
 * One notice in parts: { from, merged, part, users: { <module>: reasons } }, each part's comment under NOTICE_LIMIT.
 * Users are kept whole where they fit; a user whose reasons do not fit one part goes on across parts, reason by reason.
 * A single reason too large for a part on its own is cut by fitReasons: first without its before and after; where
 * still too large, one "not followed" reason in its place, so that the told module's whole tests run.
 * @param users [module, reasons][] in the notice's order
 */
export function noticeParts(from, merged, users) {
  const parts = [];
  let cur = null;
  const start = () => { cur = { from, merged, part: parts.length + 1, users: {} }; parts.push(cur); };
  const withAdded = (module, reasons) => ({ ...cur, users: { ...cur.users, [module]: [...(cur.users[module] ?? []), ...reasons] } });
  const fits = (module, reasons) => bodyOf(withAdded(module, reasons)).length < NOTICE_LIMIT;
  const add = (module, reasons) => { cur.users[module] = withAdded(module, reasons).users[module]; };
  const tryAdd = (module, reasons) => fits(module, reasons) && (add(module, reasons), true);
  start();
  for (const [module, reasons] of users) {
    if (tryAdd(module, reasons)) continue;
    if (Object.keys(cur.users).length) { start(); if (tryAdd(module, reasons)) continue; }
    for (const r of reasons) {
      if (tryAdd(module, [r])) continue;
      if (Object.keys(cur.users).length) start();
      add(module, fitReasons({
        reasons: [r],
        fits: (rs) => fits(module, rs),
        whole: () => ({ module: r.module ?? from, notFollowed: [`a reason of ${module} in the notice from ${from} (pull request ${merged}) is too large for one comment even without its before and after; the whole module's tests run`], through: r.through ?? null }),
      }));
    }
  }
  if (!Object.keys(cur.users).length && parts.length > 1) parts.pop();
  return parts;
}

/** The notice comments on pull request n: { id, data } of each, every notice's. */
const noticeComments = (gh, slug, n) => gh.comments(slug, n).map((c) => ({ id: c.id, data: parseBlock(c.body, NOTICE_MARK)?.data })).filter((c) => c.data);

/**
 * Writes one changed module's notice on the merged pull request n. A second run for the same merge rewrites its own
 * comments, in order, and adds one only where the notice now needs more parts; a part it no longer needs is emptied.
 * A comment GitHub will not write fails with GitHub's own words; nobody is told and the notice is owed.
 * @param users [module, reasons][]
 * @returns the number of comments written
 */
export function writeNotice(gh, slug, n, from, users) {
  const parts = noticeParts(from, n, users);
  const had = noticeComments(gh, slug, n).filter((c) => c.data.from === from && Number(c.data.merged) === n).sort((a, b) => a.data.part - b.data.part);
  const emptied = had.slice(parts.length).map((c, i) => ({ from, merged: n, part: parts.length + i + 1, users: {} }));
  try {
    [...parts, ...emptied].forEach((data, i) => {
      if (had[i]) gh.editComment(slug, had[i].id, bodyOf(data)); else gh.addComment(slug, n, bodyOf(data));
    });
  } catch (e) {
    fail(`could not write the notice from ${from} on pull request ${n}: ${e.message}; nobody is told; the notice for pull request ${n} is owed`);
  }
  return parts.length;
}

/**
 * A waiting notice's reasons for its module: from the entry itself where it carries `uses` (the older form of a
 * waiting-work entry), otherwise from the notice comments on its merged pull request, in part order. `comments` caches
 * each pull request's comments. A notice with no reasons there for the module fails plainly: running notify again
 * writes them.
 */
export function noticeReasons(gh, slug, w, comments = new Map()) {
  if (Array.isArray(w.uses)) return w.uses;
  const n = Number(w.merged);
  if (!comments.has(n)) comments.set(n, noticeComments(gh, slug, n));
  const parts = comments.get(n).filter((c) => c.data.from === w.from && Number(c.data.merged) === n).sort((a, b) => a.data.part - b.data.part);
  const mine = parts.filter((c) => Array.isArray(c.data.users?.[w.module]));
  if (!mine.length) fail(`the notice from ${w.from} (pull request ${n}) has no reasons for ${w.module} on its pull request; run notify ${n} again, then open`);
  return mine.flatMap((c) => c.data.users[w.module]);
}
