#!/usr/bin/env node
// needs.json for the converted proof (precision-26nov, step 2), from the proof's recorded needs and each later module's
// own tests run before and after each change on both copies (tests.mjs):
// - a user whose tests pass before a change and fail after it, on the converted copy, needs telling, unless the same
//   break on the original copy was not counted there either (a break carried only through a middle module that itself
//   breaks, which the proof does not count: the middle module is told, and its own change tells the rest);
// - each recorded need is kept, unless DROPPED below says why the converted code makes it disappear.
//
//   node process/research/precision-26nov/needs.mjs <tests-orig.json> <tests-conv.json>
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const [origRuns, convRuns] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const expected = JSON.parse(fs.readFileSync(path.join(HERE, '..', '..', '..', 'tool/test/fixtures/notice-proof/expected.json'), 'utf8')).changes;

/** Recorded needs the converted code makes disappear: change -> user -> why. */
const DROPPED = JSON.parse(fs.readFileSync(path.join(HERE, 'needs-dropped.json'), 'utf8'));

const out = {};
const report = { added: [], dropped: [], brokenNotRecorded: [], recordedNotBroken: 0 };
for (const [id, e] of Object.entries(expected)) {
  const o = origRuns[id], c = convRuns[id];
  if (!o || !c) throw new Error(`no test runs for ${id}`);
  const recorded = e.needs;
  // breaks on the original that the proof does not count as needs
  const uncounted = o.breaks.filter((u) => !recorded.includes(u));
  const needs = new Set();
  const why = {};
  for (const u of recorded) {
    if (DROPPED[id]?.[u]) { report.dropped.push(`${id} ${u}: ${DROPPED[id][u]}`); continue; }
    needs.add(u);
    why[u] = c.breaks.includes(u) ? 'recorded; its tests break' : o.breaks.includes(u) ? 'recorded; its tests break on the original, not on the converted copy' : 'recorded';
  }
  for (const u of c.breaks) {
    if (needs.has(u) || DROPPED[id]?.[u]) continue;
    if (uncounted.includes(u)) { report.brokenNotRecorded.push(`${id} ${u}: breaks on both copies; not counted on the original either`); continue; }
    needs.add(u);
    why[u] = 'its tests break on the converted copy (not on the original)';
    report.added.push(`${id} ${u}`);
  }
  for (const u of recorded) if (needs.has(u) && !c.breaks.includes(u)) report.recordedNotBroken++;
  out[id] = { provider: e.provider ?? c.provider, needs: [...needs], why, recorded, breaksOriginal: o.breaks, breaksConverted: c.breaks };
}
const about = [
  'The users of each recorded change of the converted proof that truly needed telling (precision-26nov). Built by needs.mjs from the proof\'s recorded needs (tool/test/fixtures/notice-proof/expected.json) and each later module\'s own tests, run before and after each change on both copies (tests.mjs).',
  'A user whose tests pass before and fail after a change on the converted copy needs telling; a recorded need is kept unless needs-dropped.json says why the converted code makes it disappear; a break the original does not count either (carried through a middle module that itself breaks) is not counted.',
];
fs.writeFileSync(path.join(HERE, 'needs.json'), `${JSON.stringify({ about, report, changes: out }, null, 1)}\n`);
const total = Object.values(out).reduce((s, x) => s + x.needs.length, 0);
console.log(`needs: ${total} (recorded ${Object.values(expected).reduce((s, x) => s + x.needs.length, 0)})`);
console.log(`added (break on the converted copy only): ${report.added.length}`); for (const x of report.added) console.log(`  ${x}`);
console.log(`dropped: ${report.dropped.length}`); for (const x of report.dropped) console.log(`  ${x}`);
console.log(`breaks not counted on either copy: ${report.brokenNotRecorded.length}`); for (const x of report.brokenNotRecorded) console.log(`  ${x}`);
console.log(`recorded needs kept whose tests do not break on the converted copy: ${report.recordedNotBroken}`);
