import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { stateWrite } from '../lib/commands.mjs';
import { walkOpen, walkClose, walkWrite, walkRead, walkText, walkAreas } from '../lib/walk.mjs';
import { parseBlock } from '../lib/github.mjs';
import { mark } from '../lib/state.mjs';
import { git } from '../lib/util.mjs';
import { config, ctxFor, fakeGitHub, makeRepo } from './helpers.mjs';

// orders uses pricing uses dates, as their uses files say. orders names areas (a screen and a journey), the others
// name none.
const usesFile = (module, providers) => ({ module, providers, uses: [], outside: [], orderFaults: [], copies: [] });
function product(over = {}) {
  const root = makeRepo({
    'process.json': config({ walks_folder: 'lanes/ux/walks/' }),
    'process/modules/order.txt': 'dates\npricing\norders\n',
    'process/modules/dates.json': { name: 'dates', files: ['src/dates/'], tests: ['test/dates/'] },
    'process/modules/pricing.json': { name: 'pricing', files: ['src/pricing/'], tests: ['test/pricing/'] },
    'process/modules/orders.json': { name: 'orders', files: ['src/orders/'], tests: ['test/orders/'] },
    'process/modules/pricing.uses.json': usesFile('pricing', ['dates']),
    'process/modules/orders.uses.json': usesFile('orders', ['pricing']),
    'process/modules/dates.md': '- **R1** [met] a day is 1 to 31.\n',
    'process/modules/pricing.md': '- **R1** [met] a price is whole pence.\n',
    'process/modules/orders.md': '- **R1** [met] the basket shows the total. (screen: Checkout / basket)\n- **R2** [met] a buyer can check out. (journey: Buy a thing step 2)\n',
    'test/orders/walk/internal/basket.test.mjs': 'requirement: orders 1\nfollows: screen Checkout / basket / total\nexpects: the total is shown\n',
    'test/orders/walk/external/buy.test.mjs': 'requirement: orders 2\nfollows: journey Buy a thing / step 2\nexpects: the order is placed\n',
    ...over,
  });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  const c = ctxFor(root, gh);
  stateWrite(c.ctx, undefined, { _: [], create: true });
  c.out.length = 0;
  return { root, gh, ...c };
}
const record = (gh, key) => parseBlock(gh.s.comments.find((cm) => cm.body.startsWith(`<!-- ${mark(key)} -->`)).body, mark(key)).data;
const writeRound = (ctx, root, data) => { const f = join(root, 'round.json'); writeFileSync(f, JSON.stringify(data)); stateWrite(ctx, 'round', { _: [], from: f }); };

test('walk open creates the walk issue and records its number in the round record', () => {
  const t = product();
  writeRound(t.ctx, t.root, { tranche: 't1', round: 2, modules: [{ module: 'orders', state: 'open' }], walks: [] });
  t.out.length = 0;
  assert.equal(walkOpen(t.ctx, 'internal'), 0);
  const issue = t.gh.s.issues.find((i) => i.labels.includes('process4-walk'));
  assert.ok(issue, 'a walk issue was created');
  assert.match(issue.title, /t1 \/ round 2 \/ internal/);
  const round = record(t.gh, 'round');
  assert.equal(round.walks[0].kind, 'internal');
  assert.equal(round.walks[0].issue, issue.number);
  // a second open of the same kind reuses it
  t.out.length = 0;
  walkOpen(t.ctx, 'internal');
  assert.ok(t.out.some((l) => /there already/.test(l)));
  assert.equal(t.gh.s.issues.filter((i) => i.labels.includes('process4-walk')).length, 1);
});

test('walk write writes a walking session comment and rewrites it in place', () => {
  const t = product();
  writeRound(t.ctx, t.root, { tranche: 't1', round: 1, modules: [], walks: [{ kind: 'internal', issue: 0, sessions: [] }] });
  walkOpen(t.ctx, 'internal');
  const issue = record(t.gh, 'round').walks[0].issue;
  const f = join(t.root, 'c.txt');
  writeFileSync(f, 'walk: t1 / 1 / internal\narea: Checkout | walked to the end | flaws: 0\n');
  t.out.length = 0;
  assert.equal(walkWrite(t.ctx, issue, { _: [], session: 1, from: f }), 0);
  let mine = t.gh.s.comments.filter((c) => c.on === issue && c.body.startsWith('<!-- process4-walk-session: 1 -->'));
  assert.equal(mine.length, 1);
  assert.match(mine[0].body, /walked to the end/);
  // rewrite in place: same one comment, new body
  writeFileSync(f, 'walk: t1 / 1 / internal\narea: Checkout | walked to the end | flaws: 1\n\nflaw: t1-1-I-1-1\nkind: does not match the Screens document\n');
  walkWrite(t.ctx, issue, { _: [], session: 1, from: f });
  mine = t.gh.s.comments.filter((c) => c.on === issue && c.body.startsWith('<!-- process4-walk-session: 1 -->'));
  assert.equal(mine.length, 1, 'still one comment');
  assert.match(mine[0].body, /flaws: 1/);
});

test('walk read prints the comments and a single flaw', () => {
  const t = product();
  writeRound(t.ctx, t.root, { tranche: 't1', round: 1, modules: [], walks: [{ kind: 'internal', issue: 0, sessions: [] }] });
  walkOpen(t.ctx, 'internal');
  const issue = record(t.gh, 'round').walks[0].issue;
  const f = join(t.root, 'c.txt');
  writeFileSync(f, 'walk: t1 / 1 / internal\nflaw: t1-1-I-1-1\nkind: does not match the Screens document\narea: Checkout\nobservation: t1-1-I-1-O1\narea: Checkout\n');
  walkWrite(t.ctx, issue, { _: [], session: 1, from: f });
  t.out.length = 0;
  walkRead(t.ctx, issue);
  assert.ok(t.out.join('\n').includes('does not match the Screens document'));
  t.out.length = 0;
  walkRead(t.ctx, issue, 't1-1-I-1-1');
  const printed = t.out.join('\n');
  assert.match(printed, /flaw: t1-1-I-1-1/);
  assert.match(printed, /kind: does not match/);
  assert.doesNotMatch(printed, /observation:/);
});

test('walk close closes the walk issue', () => {
  const t = product();
  writeRound(t.ctx, t.root, { tranche: 't1', round: 1, modules: [], walks: [{ kind: 'internal', issue: 0, sessions: [] }] });
  walkOpen(t.ctx, 'internal');
  const issue = record(t.gh, 'round').walks[0].issue;
  assert.equal(walkClose(t.ctx, issue), 0);
  assert.equal(t.gh.s.issues.find((i) => i.number === issue).state, 'closed');
});

test('walk areas lists the changed modules\' screen pages and journeys', () => {
  const t = product();
  writeRound(t.ctx, t.root, { tranche: 't1', round: 2, modules: [{ module: 'orders', state: 'open' }], walks: [] });
  t.out.length = 0;
  walkAreas(t.ctx);
  const out = t.out.join('\n');
  assert.match(out, /internal areas[\s\S]*Checkout <- orders \(requirement\), orders \(step header\)/);
  assert.match(out, /external areas[\s\S]*Buy a thing <- orders \(requirement\), orders \(step header\)/);
});

test('walk areas follows a changed module that names none up to its users', () => {
  const t = product();
  // pricing (names no area) changed; its user orders names areas -> inherited.
  writeRound(t.ctx, t.root, { tranche: 't1', round: 3, modules: [{ module: 'pricing', state: 'open' }], walks: [] });
  t.out.length = 0;
  walkAreas(t.ctx);
  const out = t.out.join('\n');
  assert.match(out, /Checkout <- orders/);
  assert.match(out, /Buy a thing <- orders/);
});

test('walk areas adds a module a notice was sent to (waiting work)', () => {
  const t = product();
  writeRound(t.ctx, t.root, { tranche: 't1', round: 4, modules: [], walks: [] });
  const f = join(t.root, 'ww.json');
  writeFileSync(f, JSON.stringify({ work: [{ module: 'orders', kind: 'notice', from: 'pricing' }] }));
  stateWrite(t.ctx, 'waiting-work', { _: [], from: f });
  t.out.length = 0;
  walkAreas(t.ctx);
  assert.match(t.out.join('\n'), /Checkout <- orders/);
});

test('walk text fills the walking-session template, leaving no placeholders', () => {
  const t = product();
  writeRound(t.ctx, t.root, {
    tranche: 't1', round: 2,
    walks: [{ kind: 'external', issue: 77, sessions: [{ number: 1, session: 'session_X', live: true, copy: { name: 'walk-ext-1', address: 'https://ext1.example' } }] }],
  });
  t.out.length = 0;
  assert.equal(walkText(t.ctx, 1), 0);
  const text = t.out.join('\n');
  assert.match(text, /You are walking session 1 for o\/product/);
  assert.match(text, /the external walk/);
  assert.match(text, /The walk issue is 77/);
  assert.match(text, /Your copy is walk-ext-1 at https:\/\/ext1\.example\./);
  assert.match(text, /lanes\/ux\/walks\//);
  // no angle-bracket placeholders remain (apart from the explained <copy> and <commit id> prose of the fetch line)
  assert.doesNotMatch(text, /<number>|<product>|<tranche>|<round>|<walk issue>|<the internal walk|<External walk:|<the Screens document/);
});

test('walk text for an internal session drops the external-copy clause', () => {
  const t = product();
  writeRound(t.ctx, t.root, {
    tranche: 't1', round: 2,
    walks: [{ kind: 'internal', issue: 55, sessions: [{ number: 2, session: 'session_Y', live: true, copy: null }] }],
  });
  t.out.length = 0;
  walkText(t.ctx, 2);
  const text = t.out.join('\n');
  assert.match(text, /the internal walk/);
  assert.doesNotMatch(text, /Your copy is/);
  assert.match(text, /the Screens document/);
});
