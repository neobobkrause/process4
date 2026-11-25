// The recorded changes of the notice's proof, replayed (build text 1, section 6): for each of the 150 changes, who the
// tool tells and, briefly, why, and whose check refuses after it, against the answers recorded under the owner's
// decision C in fixtures/notice-proof/expected.json. An answer changes only on purpose, with the reason written in that
// file (the proof's rule 54).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { SERIES, answer, listChanges, readChange } from './notice-replay.mjs';

const recorded = JSON.parse(readFileSync(new URL('./fixtures/notice-proof/expected.json', import.meta.url), 'utf8'));
const expected = recorded.changes;

test('every recorded change has an expected answer, and every expected answer a change; the totals are the answers\'', () => {
  const ids = SERIES.flatMap((s) => listChanges(s));
  assert.equal(ids.length, 150);
  assert.deepEqual(ids.slice().sort(), Object.keys(expected).sort());
  const t = { needed: 0, told: 0, toldWithoutNeed: 0, neededAndMissed: 0 };
  for (const e of Object.values(expected)) {
    const told = Object.keys(e.told);
    t.needed += e.needs.length;
    t.told += told.length;
    t.toldWithoutNeed += told.filter((u) => !e.needs.includes(u)).length;
    t.neededAndMissed += e.needs.filter((u) => !told.includes(u)).length;
  }
  assert.deepEqual(t, recorded.totals);
});

for (const series of SERIES) {
  test(`the recorded changes of ${series} are answered as recorded`, () => {
    const wrong = [];
    for (const id of listChanges(series)) {
      const e = expected[id];
      const a = answer(readChange(series, id));
      const got = { told: a.told, refuses: a.refuses };
      const want = { told: e.told, refuses: e.refuses };
      try { assert.deepEqual(got, want); } catch { wrong.push(`${id}: got ${JSON.stringify(got)}, recorded ${JSON.stringify(want)}`); }
    }
    assert.deepEqual(wrong, []);
  });
}
