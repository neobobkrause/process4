// The recorded changes of the notice's proof, replayed (build text 1, section 6): for each of the 150 changes, who
// the tool tells and, briefly, why; whose check refuses after it; and whether it is a comments-only first step, against
// the answers recorded for design 8 in fixtures/notice-proof/expected.json. An answer changes only on purpose, with
// the reason written in that file (the proof's rule 54).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { SERIES, answer, listChanges, readChange } from './notice-replay.mjs';

const expected = JSON.parse(readFileSync(new URL('./fixtures/notice-proof/expected.json', import.meta.url), 'utf8')).changes;

test('every recorded change has an expected answer, and every expected answer a change', () => {
  const ids = SERIES.flatMap((s) => listChanges(s));
  assert.equal(ids.length, 150);
  assert.deepEqual(ids.slice().sort(), Object.keys(expected).sort());
});

for (const series of SERIES) {
  test(`the recorded changes of ${series} are answered as recorded`, () => {
    const wrong = [];
    for (const id of listChanges(series)) {
      const e = expected[id];
      const a = answer(readChange(series, id));
      const got = { told: a.told, refuses: a.refuses, firstCommentsStep: a.firstCommentsStep };
      const want = { told: e.told, refuses: e.refuses, firstCommentsStep: !!e.firstCommentsStep };
      try { assert.deepEqual(got, want); } catch { wrong.push(`${id}: got ${JSON.stringify(got)}, recorded ${JSON.stringify(want)}`); }
    }
    assert.deepEqual(wrong, []);
  });
}
