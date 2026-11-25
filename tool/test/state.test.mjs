import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { stateRead, stateWrite } from '../lib/commands.mjs';
import { parseBlock } from '../lib/github.mjs';
import { LABEL, PRODUCT_RECORDS, laneRefusal, mark, noteEnded, parseRecordFile } from '../lib/state.mjs';
import { Fail } from '../lib/util.mjs';
import { ctxFor, fakeGitHub, makeRepo, productFiles } from './helpers.mjs';

const file = (root, name, text) => { const p = join(root, name); writeFileSync(p, text); return p; };

test('--create makes the label, the issue and each empty record once, and locks it', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(stateWrite(ctx, undefined, { _: [], create: true }), 0);
  assert.equal(stateWrite(ctx, undefined, { _: [], create: true }), 0);
  assert.equal(gh.s.issues.length, 1);
  assert.deepEqual(gh.s.issues[0].labels, [LABEL]);
  assert.equal(gh.s.comments.length, PRODUCT_RECORDS.length);
  assert.ok(gh.s.calls.some((c) => c[0] === 'lock'));
  assert.match(out.join('\n'), /is there already/);
});

test('a record is rewritten in place and read back; a handover keeps its plain words', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  stateWrite(ctx, undefined, { _: [], create: true });
  const n = gh.s.comments.length;
  stateWrite(ctx, 'wakes', { _: [], from: file(root, 'w.json', '{"root_last_woke":"2026-11-20T10:00Z"}') });
  stateWrite(ctx, 'handover-arch', { _: [], from: file(root, 'h.txt', '{"role":"arch"}\n\nRound 2 is open; orders waits.') });
  assert.equal(gh.s.comments.length, n);
  const h = parseBlock(gh.s.comments.find((c) => c.body.startsWith(`<!-- ${mark('handover-arch')} -->`)).body, mark('handover-arch'));
  assert.deepEqual(h, { data: { role: 'arch' }, words: 'Round 2 is open; orders waits.' });
  stateRead(ctx, 'wakes', { _: [] });
  assert.match(out.join('\n'), /root_last_woke/);
});

test('a record whose comment is gone is made afresh', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  stateWrite(ctx, undefined, { _: [], create: true });
  gh.s.comments = gh.s.comments.filter((c) => !c.body.includes(mark('stop')));
  stateWrite(ctx, 'stop', { _: [], from: file(root, 's.json', '{"stopped":false}') });
  assert.equal(gh.s.comments.filter((c) => c.body.includes(mark('stop'))).length, 1);
});

test('a record GitHub will not write fails with GitHub\'s own words (build text 5, section 1)', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  stateWrite(ctx, undefined, { _: [], create: true });
  const words = 'gh: Validation Failed (HTTP 422) body is too long (maximum is 65536 characters)';
  // The rewrite is refused while the record's comment is still there: it stays as it was, and GitHub's words are said.
  gh.editComment = () => null;
  gh.refusal = () => words;
  assert.throws(() => stateWrite(ctx, 'stop', { _: [], from: file(root, 's.json', '{"stopped":false}') }),
    (e) => e instanceof Fail && e.message === `GitHub would not rewrite the stop record; it stays as it was. GitHub said: ${words}`);
  // A record made afresh that GitHub will not take says GitHub's words too.
  gh.s.comments = gh.s.comments.filter((c) => !c.body.includes(mark('stop')));
  gh.addComment = () => { throw new Fail(`GitHub refused: ${words}`); };
  assert.throws(() => stateWrite(ctx, 'stop', { _: [], from: file(root, 's.json', '{"stopped":false}') }),
    (e) => e instanceof Fail && e.message === `GitHub would not write the stop record: GitHub refused: ${words}`);
});

test('no record of another name is written', () => {
  const root = makeRepo(productFiles());
  const { ctx } = ctxFor(root, fakeGitHub());
  assert.throws(() => stateWrite(ctx, 'ledger', { _: [], from: 'x' }), /no record is named ledger/);
});

test('a second live session for a lane is refused', () => {
  const live = { lanes: [{ name: 'ux', session: 's1', live: true }] };
  assert.equal(laneRefusal(live, { lanes: [{ name: 'ux', session: 's1', live: true }] }), null);
  assert.equal(laneRefusal(live, { lanes: [{ name: 'ux', session: 's1', live: false }] }), null);
  assert.match(laneRefusal(live, { lanes: [{ name: 'ux', session: 's2', live: true }] }), /second live session/);
  assert.equal(laneRefusal({ lanes: [{ name: 'ux', session: 's1', live: false }] }, { lanes: [{ name: 'ux', session: 's2', live: true }] }), null);
  // the claim written before the start names no session; the address is filled in once, then a second is refused
  const claim = { lanes: [{ name: 'ux', session: null, live: true }] };
  assert.equal(laneRefusal(claim, { lanes: [{ name: 'ux', session: 's2', live: true }] }), null);
  assert.match(laneRefusal({ lanes: [{ name: 'ux', session: 's2', live: true }] }, { lanes: [{ name: 'ux', session: 's3', live: true }] }), /second live session/);
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  stateWrite(ctx, 'lanes', { _: [], create: true, from: file(root, 'l1.json', JSON.stringify(live)) });
  assert.throws(() => stateWrite(ctx, 'lanes', { _: [], from: file(root, 'l2.json', '{"lanes":[{"name":"ux","session":"s2","live":true}]}') }), /second live/);
});

test('what ends each kind of standing note', () => {
  const notes = [
    { kind: 'held-merge', pull_request: 4, written: '2026-11-20T10:20Z' },
    { kind: 'held-merge', pull_request: 5, written: '2026-11-20T10:20Z', ended: 'approved' },
    { kind: 'module-first', module: 'orders', written: '2026-11-20T10:25Z' },
    { kind: 'slot-number', number: 10, written: '2026-11-20T10:30Z' },
    { kind: 'slot-number', number: 6, written: '2026-11-20T10:40Z' },
    { kind: 'full-external-walk', tranche: 't1', written: '2026-11-20T10:35Z' },
  ];
  const ctx = {
    mergedJobs: [{ module: 'orders', merged_at: '2026-11-20T10:26Z' }],
    round: { walks: [{ kind: 'external', full: true, outcome: 'with flaws' }] },
  };
  assert.deepEqual(notes.map((n) => noteEnded(n, notes, ctx)), [false, true, true, true, false, true]);
  assert.deepEqual(notes.map((n) => noteEnded(n, notes, {})), [false, true, false, true, false, false]);
});

test('state write standing-notes leaves out each ended note', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  gh.s.prs.push({ number: 9, state: 'closed', merged_at: '2026-11-20T10:30:05Z', head: { ref: 'job/orders/1' }, base: { ref: 'tranche' } });
  stateWrite(ctx, undefined, { _: [], create: true });
  const notes = { notes: [{ kind: 'module-first', module: 'orders', written: '2026-11-20T10:25Z' }, { kind: 'held-merge', pull_request: 4, written: '2026-11-20T10:20Z' }] };
  stateWrite(ctx, 'standing-notes', { _: [], from: file(root, 'n.json', JSON.stringify(notes)) });
  const body = gh.s.comments.find((c) => c.body.includes(mark('standing-notes'))).body;
  assert.deepEqual(parseBlock(body, mark('standing-notes')).data.notes.map((n) => n.kind), ['held-merge']);
});

test('a record file must begin with JSON', () => {
  assert.deepEqual(parseRecordFile('{"a":"}"}\n\nwords {here}'), { data: { a: '}' }, words: 'words {here}' });
  assert.deepEqual(parseRecordFile(''), { data: {}, words: '' });
  assert.throws(() => parseRecordFile('plain words'), /must begin with one JSON value/);
});
