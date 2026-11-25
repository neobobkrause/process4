// The notice's reasons on the merged pull request (the owner's decision B of 25 Nov 2026). The waiting-work record held
// every told user's reasons, and on civicsmith an early provider's notice made it larger than GitHub takes for one
// comment, so the notice was lost. Now notify writes each changed module's notice, for the told users with no open job,
// as comments on the merged pull request, each one JSON block under NOTICE_LIMIT characters; a waiting-work entry only
// names the notice ({ module, kind: 'notice', from, merged }); open --module copies that module's reasons from these
// comments into its job block's `uses`.
import { block, parseBlock } from './github.mjs';
import { fail } from './util.mjs';

export const NOTICE_MARK = 'process4-notice';
/** The most characters one notice comment holds; GitHub takes 65,536. */
export const NOTICE_LIMIT = 60000;

const bodyOf = (data) => block(NOTICE_MARK, data);

/** A reason without its before and after (the words of what changed); its entry, changes and lines, which choose the related tests, are kept. */
export const cutReason = (r) => {
  if (r.notFollowed || (r.before === undefined && r.after === undefined)) return r;
  const { before, after, ...rest } = r;
  return { ...rest, cut: 'its before and after are left out: too large for one comment' };
};
const fits = (data) => bodyOf(data).length < NOTICE_LIMIT;

/**
 * One notice in parts: { from, merged, part, users: { <module>: reasons } }, each part's comment under NOTICE_LIMIT.
 * Users are kept whole where they fit; a user whose reasons do not fit one part goes on across parts, reason by reason.
 * A single reason too large for a part on its own loses its before and after (the words of what changed); its entry,
 * changes and lines, which choose the related tests, are kept.
 * @param users [module, reasons][] in the notice's order
 */
export function noticeParts(from, merged, users) {
  const parts = [];
  let cur = null;
  const start = () => { cur = { from, merged, part: parts.length + 1, users: {} }; parts.push(cur); };
  const tryAdd = (module, reasons) => {
    const had = cur.users[module];
    cur.users[module] = [...(had ?? []), ...reasons];
    if (fits(cur)) return true;
    if (had) cur.users[module] = had; else delete cur.users[module];
    return false;
  };
  start();
  for (const [module, reasons] of users) {
    if (tryAdd(module, reasons)) continue;
    if (Object.keys(cur.users).length) { start(); if (tryAdd(module, reasons)) continue; }
    for (const r of reasons) {
      if (tryAdd(module, [r])) continue;
      if (Object.keys(cur.users).length) start();
      if (tryAdd(module, [r])) continue;
      if (!tryAdd(module, [cutReason(r)])) fail(`a reason of ${module} in the notice from ${from} is too large for one comment even without its before and after; the notice for pull request ${merged} is owed`);
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
 * A waiting notice's reasons for its module: from the entry itself where it carries `uses` (written before the notice
 * comments), otherwise from the notice comments on its merged pull request, in part order. `comments` caches each pull
 * request's comments. A notice with no reasons there for the module fails plainly: running notify again writes them.
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
