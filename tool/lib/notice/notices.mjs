// The reading of notify (command 11), run in a process of its own: running out of memory ends V8 at once, beyond any
// catch, so notify reads the product here and says plainly when this process could not finish. Reads, on standard
// input, { dirB, dirA, mods, named, sameAs, out }: the product written out before and after the merge; the modules to
// read that were there before, each { module, filesChanged, conversion }; the items whose meaning ARCH named or the pull
// request declared; those it records as keeping their domain and range; and the file to write the notices into.
//
// The notices are written into that file one JSON line at a time (noticeLines), never as one text: a notice of an early
// provider can tell a hundred modules, each reason carrying the changed item's parts before and after, and one text of
// them all passes the language's longest string (civicsmith, 26 Nov 2026: "RangeError: Invalid string length"). Each
// changed item's before and after are written once, on its own line; a reason that carries them names that line.
import { closeSync, openSync, readFileSync, readSync, writeSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadTree } from './model.mjs';
import { notice } from './notice.mjs';
import { Fail } from '../util.mjs';

/**
 * One notice as JSON lines: { notice } (the report, its changed items and told modules written as null), then { changed } for
 * each changed item, then { told } for each told module, whose reasons carry `ba: <index of the changed item>` where
 * their before and after are that item's own (written there as null).
 */
export function* noticeLines(report) {
  const { changed, told } = report;
  yield JSON.stringify({ notice: { ...report, changed: null, told: null } });
  const index = new Map();
  for (const [i, c] of changed.entries()) {
    if (c.before !== undefined && !index.has(c.before)) index.set(c.before, i);
    yield JSON.stringify({ changed: c });
  }
  for (const t of told) {
    const reasons = t.reasons.map((r) => {
      const i = r.before === undefined ? undefined : index.get(r.before);
      // in their places, so that the reason read back is written as it was
      return i === undefined || changed[i].after !== r.after ? r : { ...r, before: null, after: null, ba: i };
    });
    yield JSON.stringify({ told: { ...t, reasons } });
  }
}

/** Reads a file of JSON lines a part at a time, so that no text of the whole file is made; calls `each` with each line's value. */
export function readLines(file, each, size = 1 << 24) {
  const fd = openSync(file, 'r');
  try {
    const chunk = Buffer.alloc(size);
    let held = [];
    for (let n; (n = readSync(fd, chunk, 0, chunk.length, null)) > 0;) {
      let start = 0;
      for (let nl = chunk.indexOf(10, 0); nl !== -1 && nl < n; nl = chunk.indexOf(10, start)) {
        const line = held.length ? Buffer.concat([...held, chunk.subarray(start, nl)]) : chunk.subarray(start, nl);
        held = [];
        if (line.length) each(JSON.parse(line.toString('utf8')));
        start = nl + 1;
      }
      if (start < n) held.push(Buffer.from(chunk.subarray(start, n)));
    }
    if (held.length) each(JSON.parse(Buffer.concat(held).toString('utf8')));
  } finally {
    closeSync(fd);
  }
}

/**
 * The notices written by noticeLines, read back: each report as notice() returned it, its reasons' before and after
 * the changed item's own (one object each, not a copy for each told module).
 */
export function readNoticeLines(file) {
  const reports = [];
  let r = null;
  readLines(file, (x) => {
    if (x.notice) { r = Object.assign(x.notice, { changed: [], told: [] }); reports.push(r); return; }
    if (x.changed) { r.changed.push(x.changed); return; }
    const reasons = x.told.reasons.map((y) => {
      if (y.ba === undefined) return y;
      const { ba, ...rest } = y;
      rest.before = r.changed[ba].before;
      rest.after = r.changed[ba].after;
      return rest;
    });
    r.told.push({ ...x.told, reasons });
  });
  return reports;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { dirB, dirA, mods, named = [], sameAs = [], out } = JSON.parse(readFileSync(0, 'utf8'));
  try {
    const treeB = loadTree(dirB), treeA = loadTree(dirA);
    const fd = openSync(out, 'w');
    try {
      for (const m of mods) {
        const report = notice(treeB, treeA, m.module, {
          named: named.filter((n) => n.module === m.module || !n.module), filesChanged: m.filesChanged, conversion: m.conversion,
          sameAs: sameAs.filter((x) => x.module === m.module || !x.module),
        });
        for (const line of noticeLines(report)) writeSync(fd, `${line}\n`);
      }
    } finally {
      closeSync(fd);
    }
  } catch (e) {
    if (!(e instanceof Fail)) throw e;
    process.stderr.write(`p4-fail: ${e.message}\n`);
    process.exitCode = 2;
  }
}
