import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkCmd, listingCmd, notifyCmd } from '../lib/notify.mjs';
import { loadTree } from '../lib/notice/model.mjs';
import { analyse, notice, noticeText } from '../lib/notice/notice.mjs';
import { check, commentsOnly } from '../lib/notice/check.mjs';
import { block, parseBlock } from '../lib/github.mjs';
import { NOTICE_LIMIT, NOTICE_MARK, cutReason, noticeParts, noticeReasons, writeNotice } from '../lib/noticecomments.mjs';
import { JOB_MARK, RECORD_MARK } from '../lib/round.mjs';
import { create, mark } from '../lib/state.mjs';
import { Fail, git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo, write } from './helpers.mjs';

// GitHub that fails on any reach: listing and check read the checkout only.
const untouchable = new Proxy({}, { get: (_, k) => () => { throw new Error(`reached GitHub: ${String(k)}`); } });

const DATES = (bound = '1 to 31', extra = '') => `/**
 * @typedef {Object} Day
 * @property {number} n
 * @bound n: whole number, ${bound}
 */
/**
 * @param {string} text
 * @returns {Day}
 */
export function parseDay(text) { return { n: Number(text) }; }
/**
 * @param {Day} d
 * @returns {string}
 */
export function formatDay(d) { return String(d.n)${extra}; }
`;
const ORDERS = `import { parseDay } from '../dates/index.mjs';
/**
 * @param {string} t
 * @returns {number}
 */
export function orderDay(t) { return parseDay(t).n; }
`;
const entry = (name, uses = [], over = {}) => ({ name, files: [`src/${name}/`], tests: [`test/${name}/`], public: [`src/${name}/index.mjs`], uses, ...over });
const productFiles = () => ({
  'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
  'process/modules/order.txt': 'dates\norders\nreport\n',
  'process/modules/dates.json': entry('dates'),
  'process/modules/orders.json': entry('orders', ['dates']),
  'process/modules/report.json': entry('report', ['dates']),
  'src/dates/index.mjs': DATES(),
  'src/orders/index.mjs': ORDERS,
  'src/report/index.mjs': `import { formatDay } from '../dates/index.mjs';\n/** @param {number} n @returns {string} */\nexport const show = (n) => formatDay({ n });\n`,
  'test/orders/index.test.mjs': `import { orderDay } from '../../src/orders/index.mjs';\norderDay('3');\n`,
});

// A merged pull request whose merge commit is real: a branch with `files`, merged into main with --no-ff.
function mergedPR(root, gh, files, n = 7) {
  git(['checkout', '-q', '-b', `job/dates/${n}`], { cwd: root });
  commit(root, files, 'the job');
  git(['checkout', '-q', 'main'], { cwd: root });
  git(['merge', '-q', '--no-ff', '-m', `Merge pull request #${n}`, `job/dates/${n}`], { cwd: root });
  const sha = git(['rev-parse', 'HEAD'], { cwd: root });
  gh.s.prs.push({ number: n, state: 'closed', merged_at: '2026-11-20T10:00:00Z', merge_commit_sha: sha, head: { ref: `job/dates/${n}`, sha: 'h'.repeat(40) }, base: { ref: 'main' } });
  return sha;
}

const waitingWork = (gh) => gh.s.comments.map((c) => parseBlock(c.body, mark('waiting-work'))).find(Boolean)?.data;
// The notice comments on pull request n, in the order written.
const noticeComments = (gh, n) => gh.s.comments.filter((c) => c.on === n).map((c) => parseBlock(c.body, NOTICE_MARK)?.data).filter(Boolean);

test('commands that do not read code never load the language reader', () => {
  const p4 = new URL('../p4.mjs', import.meta.url).href;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import { createRequire } from 'node:module';
    const { main } = await import(${JSON.stringify(p4)});
    main(['--help'], { log: () => {} });
    main(['state', 'read', '--help'], { log: () => {} });
    const req = createRequire(import.meta.url);
    console.log(Object.keys(req.cache).some((k) => k.includes('typescript')) ? 'loaded' : 'not loaded');
  `], { encoding: 'utf8' });
  assert.equal(r.stdout.trim(), 'not loaded', r.stderr);
});

test('the module list is read from the Process4 forms: the longest matching path owns a file', () => {
  const root = mkdtempSync(join(tmpdir(), 'p4-model-'));
  write(root, {
    ...productFiles(),
    'process/modules/order.txt': 'dates\norders\nreport\nlate\n',
    'process/modules/late.json': entry('late', [], { files: ['src/dates/late/'], public: ['src/dates/late/'] }),
    'src/dates/late/x.mjs': 'export const x = 1;\n',
    'src/dates/notes.txt': 'not code\n',
  });
  const t = loadTree(root);
  assert.deepEqual(t.modules.map((m) => m.id), ['dates', 'orders', 'report', 'late']);
  assert.deepEqual(t.byId.get('dates').files.map((f) => f.slice(root.length + 1)), ['src/dates/index.mjs']);
  assert.deepEqual(t.byId.get('late').public.map((f) => f.slice(root.length + 1)), ['src/dates/late/x.mjs']);
  assert.deepEqual(t.byId.get('orders').tests.map((f) => f.slice(root.length + 1)), ['test/orders/index.test.mjs']);
  assert.equal(t.moduleOfFile(join(root, 'src/dates/late/x.mjs')), 'late');
  assert.equal(t.moduleOfFile(join(root, 'README.md')), null);
});

test('listing prints a module\'s listing at HEAD or at a named commit, and writes nothing to GitHub', () => {
  const root = makeRepo(productFiles());
  const first = git(['rev-parse', 'HEAD'], { cwd: root });
  commit(root, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, untouchable);
  assert.equal(listingCmd(ctx, 'dates', { _: [] }), 0);
  const now = out.join('\n');
  assert.match(now, /^Listing of dates\n {2}kind Day {3}\[src\/dates\/index\.mjs:2\]\n {6}accepts: \{ n: number \}\n {6}hands back: \{ n: number \}\n {6}bound: n: whole number, 1 to 30\n/);
  assert.match(now, /\n {2}function formatDay {3}\[src\/dates\/index\.mjs:15\]\n {6}accepts: \(arg0: \{ n: number \}\)\n {6}hands back: string\n {6}bound: n: whole number, 1 to 30\n/);
  out.length = 0;
  listingCmd(ctx, 'dates', { _: [], at: first });
  assert.match(out.join('\n'), /bound: n: whole number, 1 to 31/);
  assert.throws(() => listingCmd(ctx, 'dates', { _: [], at: 'nosuch' }), /nosuch is not a commit/);
  assert.throws(() => listingCmd(ctx, 'nobody', { _: [] }), /no module is named nobody/);
  assert.equal(git(['status', '--porcelain'], { cwd: root }), '');
});

test('notify tells the users of a changed entry: their reasons on the merged pull request, waiting work naming the notice, once per provider and user', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { issue, records } = create(gh, 'o/product', ['waiting-work'], () => {});
  gh.editComment('o/product', records['waiting-work'].id, `<!-- ${mark('waiting-work')} -->\n\`\`\`json\n{"work":[{"module":"report","kind":"walk-flaw","flaw":"t1-1-I-1-1","link":"x"}]}\n\`\`\`\n`);
  assert.ok(issue);
  const sha = mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, new RegExp(`before ${git(['rev-parse', `${sha}^1`], { cwd: root }).slice(0, 10)} \\(first parent\\), after ${sha.slice(0, 10)}`));
  assert.match(text, /Notice for a change to dates \(TypeScript 5\.6\.3\)/);
  assert.match(text, /dates parseDay: bound changed -> tells users/);
  assert.match(text, /TOLD orders\n {6}uses dates Day \(bound changed\) at src\/orders\/index\.mjs:6\n {6}uses dates parseDay \(bound changed\) at src\/orders\/index\.mjs:1, src\/orders\/index\.mjs:6\n/);
  assert.match(text, /TOLD report\n {6}uses dates Day \(bound changed\) at src\/report\/index\.mjs:3\n {6}uses dates formatDay \(bound changed\) at src\/report\/index\.mjs:1, src\/report\/index\.mjs:3\n/);
  const work = waitingWork(gh).work;
  assert.equal(work.length, 3);
  assert.equal(work[0].kind, 'walk-flaw');
  // The waiting-work entry only names the notice; its reasons are on the merged pull request.
  const orders = work.find((w) => w.module === 'orders');
  assert.deepEqual(orders, { module: 'orders', kind: 'notice', from: 'dates', merged: 7 });
  const notices = noticeComments(gh, 7);
  assert.deepEqual(notices.map((d) => [d.from, d.merged, d.part, Object.keys(d.users)]), [['dates', 7, 1, ['orders', 'report']]]);
  assert.match(text, /the notice from dates is written on pull request 7 \(1 comment\(s\)\)/);
  const uses = noticeReasons(gh, 'o/product', orders);
  const day = uses.find((u) => u.entry === 'Day');
  assert.deepEqual(day, { module: 'dates', entry: 'Day', changes: ['bound changed'], lines: ['src/orders/index.mjs:6'], through: null,
    before: { bounds: ['n: whole number, 1 to 31'] }, after: { bounds: ['n: whole number, 1 to 30'] } });
  assert.deepEqual(uses.map((u) => u.entry).sort(), ['Day', 'parseDay']);
  // Run again for the same merge: its own entries and its own comments are rewritten, not doubled.
  const count = gh.s.comments.length;
  notifyCmd(ctx, 7);
  assert.equal(waitingWork(gh).work.length, 3);
  assert.equal(gh.s.comments.length, count);
  assert.deepEqual(noticeComments(gh, 7), notices);
});

test('notify adds a notice to a told user\'s open job block, once, and the rest to waiting work', () => {
  // The owner's decision of 24 Nov 2026, item 2: a notice reaches a running job at once.
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  // orders has an open told job into the tranche, blocked; report has only a pull request into main, which is no job's.
  gh.s.prs.push({ number: 20, state: 'open', head: { ref: 'job/orders.1', sha: 'h'.repeat(40) }, base: { ref: 'tranche' } });
  gh.s.prs.push({ number: 21, state: 'open', head: { ref: 'job/report.1', sha: 'h'.repeat(40) }, base: { ref: 'main' } });
  const old = { module: 'dates', entry: 'old' };
  gh.addComment('o/product', 20, block(JOB_MARK, { module: 'orders', work: ['notice from dates (pull request 3)'], kind: 'told', uses: [old] }, 'words kept'));
  gh.addComment('o/product', 20, block(RECORD_MARK, { blocked: { by: 'dates', why: 'waits' } }));
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const jobBlock = () => parseBlock(gh.s.comments.find((c) => c.on === 20 && parseBlock(c.body, JOB_MARK)).body, JOB_MARK);
  const b = jobBlock();
  assert.equal(b.data.kind, 'told');
  assert.deepEqual(b.data.work, ['notice from dates (pull request 3)', 'notice from dates (pull request 7)']);
  assert.deepEqual(b.data.uses[0], old);
  assert.deepEqual(b.data.uses.slice(1).map((u) => u.entry).sort(), ['Day', 'parseDay']);
  assert.equal(b.data.notice_seq, 1);
  assert.deepEqual(b.data.notices, [{ from: 'dates', merged: 7 }]);
  assert.equal(b.words, 'words kept');
  assert.match(out.join('\n'), /message the job of orders \(pull request 20\): a notice from dates reached it/);
  assert.deepEqual(waitingWork(gh).work.map((w) => [w.module, w.from, w.merged]), [['report', 'dates', 7]]);
  // Only the user with no open job has its reasons on the merged pull request.
  assert.deepEqual(noticeComments(gh, 7).map((d) => Object.keys(d.users)), [['report']]);
  // A second run for the same merge adds nothing to the block.
  out.length = 0;
  notifyCmd(ctx, 7);
  assert.deepEqual(jobBlock().data, b.data);
  assert.match(out.join('\n'), /the job of orders \(pull request 20\) holds the notice from dates \(pull request 7\) already/);
  assert.doesNotMatch(out.join('\n'), /message the job/);
  assert.equal(waitingWork(gh).work.length, 1);
});

// The owner's decision B of 25 Nov 2026, items 2 and 3 (notify 1350 and 1356 on civicsmith).
test('no repeats: a told user whose job of any state already names the notice is skipped; nothing is written for it', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  // orders' job carried the notice and merged; report's job named it and was closed.
  gh.s.prs.push({ number: 20, state: 'closed', merged_at: '2026-11-20T11:00:00Z', head: { ref: 'job/orders.1', sha: 'h'.repeat(40) }, base: { ref: 'tranche' } });
  gh.s.prs.push({ number: 21, state: 'closed', head: { ref: 'job/report.1', sha: 'h'.repeat(40) }, base: { ref: 'tranche' } });
  const held = { module: 'orders', work: ['notice from dates (pull request 7)'], kind: 'told', notice_seq: 1, notices: [{ from: 'dates', merged: 7 }] };
  gh.addComment('o/product', 20, block(JOB_MARK, held));
  // report's job was opened from waiting work before `open` wrote `notices`: its work line alone names the notice.
  gh.addComment('o/product', 21, block(JOB_MARK, { module: 'report', work: ['notice from dates (pull request 7)'], kind: 'told' }));
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, /the job of orders \(pull request 20, merged\) holds the notice from dates \(pull request 7\) already/);
  assert.match(text, /the job of report \(pull request 21, closed\) holds the notice from dates \(pull request 7\) already/);
  assert.equal(waitingWork(gh).work, undefined);
  assert.deepEqual(noticeComments(gh, 7), []);
  assert.deepEqual(parseBlock(gh.s.comments.find((c) => c.on === 20).body, JOB_MARK).data, held);
});

test('a job merged while its block took the notice did not carry it: the block is put back and the notice waits', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  gh.s.prs.push({ number: 20, state: 'open', head: { ref: 'job/orders.1', sha: 'h'.repeat(40) }, base: { ref: 'tranche' } });
  const before = block(JOB_MARK, { module: 'orders', work: ['R1'], kind: 'ordinary' });
  const c = gh.addComment('o/product', 20, before);
  // The job is merged at the moment its block is written.
  const edit = gh.editComment;
  gh.editComment = (slug, id, body) => { if (id === c.id) Object.assign(gh.getPR(slug, 20), { state: 'closed', merged_at: '2026-11-20T11:00:00Z' }); return edit(slug, id, body); };
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  assert.equal(gh.s.comments.find((x) => x.id === c.id).body, before);
  assert.match(out.join('\n'), /the job of orders \(pull request 20\) merged while the notice from dates was written; it waits for its next job/);
  assert.deepEqual(waitingWork(gh).work.map((w) => w.module), ['orders', 'report']);
  assert.deepEqual(Object.keys(noticeComments(gh, 7)[0].users), ['orders', 'report']);
});

test('a job block stays under one comment\'s size: reasons without their words, or one reason that says the whole module runs', () => {
  // The reasons orders is told, read from a first run with no open job.
  const reasonsOf = () => {
    const root = makeRepo(productFiles());
    const gh = fakeGitHub();
    create(gh, 'o/product', ['waiting-work'], () => {});
    mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
    notifyCmd(ctxFor(root, gh).ctx, 7);
    return noticeReasons(gh, 'o/product', { module: 'orders', kind: 'notice', from: 'dates', merged: 7 });
  };
  const reasons = reasonsOf();
  const tooMany = { module: 'dates', notFollowed: [`the notice from dates (pull request 7) has ${reasons.length} reasons, too many for the job block; the whole module's tests run`], through: null };
  // A job block already holding `k` characters of earlier uses, and what it is with the notice's `uses` added.
  const data = (k) => ({ module: 'orders', work: ['R1'], kind: 'ordinary', uses: [{ module: 'dates', entry: 'old', note: 'x'.repeat(k) }] });
  const withNotice = (k, uses) => block(JOB_MARK, { ...data(k), work: ['R1', 'notice from dates (pull request 7)'], uses: [...data(k).uses, ...uses], notice_seq: 1, notices: [{ from: 'dates', merged: 7 }] }).length;
  const fill = (uses) => NOTICE_LIMIT - 10 - (withNotice(0, uses) - 0);
  const run = (k) => {
    const root = makeRepo(productFiles());
    const gh = fakeGitHub();
    create(gh, 'o/product', ['waiting-work'], () => {});
    gh.s.prs.push({ number: 20, state: 'open', head: { ref: 'job/orders.1', sha: 'h'.repeat(40) }, base: { ref: 'tranche' } });
    gh.addComment('o/product', 20, block(JOB_MARK, data(k)));
    mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
    const { ctx, out } = ctxFor(root, gh);
    notifyCmd(ctx, 7);
    const body = gh.s.comments.find((x) => x.on === 20).body;
    assert.ok(body.length < NOTICE_LIMIT);
    assert.match(out.join('\n'), /message the job of orders \(pull request 20\): a notice from dates reached it \(its reasons shortened to fit the job block\)/);
    return parseBlock(body, JOB_MARK).data.uses.slice(1);
  };
  // Room for the reasons without their before and after, not with them.
  const k1 = fill(reasons.map(cutReason));
  assert.ok(withNotice(k1, reasons) >= NOTICE_LIMIT);
  assert.deepEqual(run(k1), reasons.map(cutReason));
  assert.ok(run(k1).every((r) => r.cut && r.before === undefined && r.lines.length));
  // Room only for one reason: the job's related tests err to its whole module.
  const k2 = fill([tooMany]);
  assert.ok(withNotice(k2, reasons.map(cutReason)) >= NOTICE_LIMIT);
  assert.deepEqual(run(k2), [tooMany]);
});

test('notify on a merge that changes no module\'s files says so before reading any code', () => {
  // civicsmith, 23 Nov 2026: such a merge read the whole product twice and ran out of memory.
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  mergedPR(root, gh, { 'process/notes.md': 'a note\n' });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, /The merge changed no module's files\.\nThe listing before and after is the same\. Nobody is told\./);
  assert.doesNotMatch(text, /Notice for a change|TypeScript/);
  assert.equal(gh.s.comments.length, 0);
});

test('notify on a merge that changes no listing tells nobody and writes nothing', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 31', " + ''") });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  assert.match(out.join('\n'), /Notice for a change to dates[^\n]*\nThe listing before and after is the same\. Nobody is told\./);
  assert.equal(gh.s.comments.length, 0);
  gh.s.prs.push({ number: 9, state: 'closed', merged_at: null, head: { ref: 'x' }, base: { ref: 'main' } });
  assert.throws(() => notifyCmd(ctx, 9), /pull request 9 is not merged/);
});

test('read in stages: a merge that changes a module\'s insides but not its listing reads no later module', () => {
  const inside = { 'src/dates/index.mjs': DATES('1 to 31', " + ''") };
  const before = mkdtempSync(join(tmpdir(), 'p4-stage-')), after = mkdtempSync(join(tmpdir(), 'p4-stage-'));
  write(before, productFiles());
  write(after, { ...productFiles(), ...inside });
  const r = notice(before, after, 'dates');
  assert.equal(r.summary, 'The listing before and after is the same. Nobody is told.');
  assert.deepEqual([r.usersRead, r.told, r.notTold], [[], [], []]);
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  mergedPR(root, gh, inside);
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  assert.match(out.join('\n'), /Nobody is told\./);
  assert.doesNotMatch(out.join('\n'), /TOLD|not told/);
});

test('read in stages: a later module with no import path to the changed module is neither read nor told; one that reaches it is read', () => {
  const files = productFiles();
  files['process/modules/order.txt'] = 'dates\norders\nreport\nchain\nloner\nloose\n';
  files['process/modules/chain.json'] = entry('chain', ['orders']);
  files['process/modules/loner.json'] = entry('loner');
  files['process/modules/loose.json'] = entry('loose');
  // chain reaches dates only through orders' file; loner has a kind of its own named Day, of the same shape, and no
  // path to dates; loose imports a name the scan cannot follow.
  files['src/chain/index.mjs'] = "import { orderDay } from '../orders/index.mjs';\n/** @returns {number} */\nexport const first = () => orderDay('1');\n";
  files['src/loner/index.mjs'] = '/**\n * @typedef {Object} Day\n * @property {number} n\n */\n/** @param {Day} d @returns {number} */\nexport const n = (d) => d.n;\n';
  files['src/loose/index.mjs'] = 'export const load = (/** @type {string} */ p) => import(p);\n';
  const change = { 'src/dates/index.mjs': DATES('1 to 30') };
  const before = mkdtempSync(join(tmpdir(), 'p4-stage-')), after = mkdtempSync(join(tmpdir(), 'p4-stage-'));
  write(before, files);
  write(after, { ...files, ...change });
  const r = notice(before, after, 'dates');
  assert.deepEqual(r.usersRead, ['orders', 'report', 'chain', 'loose']);
  assert.deepEqual(r.told.map((t) => t.user), ['orders', 'report']);
  const root = makeRepo(files);
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  mergedPR(root, gh, change);
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, /TOLD orders\n[\s\S]*TOLD report\n/);
  assert.doesNotMatch(text, /chain|loner|loose/);
  assert.deepEqual(waitingWork(gh).work.map((w) => w.module), ['orders', 'report']);
});

test('notify that runs out of memory reading the product says so plainly, tells nobody, and fails', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx } = ctxFor(root, gh);
  process.env.P4_READ_HEAP_MB = '16';
  try {
    assert.throws(() => notifyCmd(ctx, 7), (e) => e instanceof Fail && e.message === 'could not read the product within this machine\'s memory; nobody is told; the notice for pull request 7 is owed');
  } finally {
    delete process.env.P4_READ_HEAP_MB;
  }
  assert.equal(waitingWork(gh).work, undefined);
  assert.deepEqual(noticeComments(gh, 7), []);
});

test('a notice comment GitHub will not write fails with GitHub\'s own words; nobody is told and the notice is owed', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const add = gh.addComment;
  gh.addComment = (slug, n, body) => {
    if (n === 7) throw new Fail('GitHub refused: gh: Validation Failed (HTTP 422) body is too long (maximum is 65536 characters)');
    return add(slug, n, body);
  };
  const { ctx } = ctxFor(root, gh);
  assert.throws(() => notifyCmd(ctx, 7), (e) => e instanceof Fail
    && e.message === 'could not write the notice from dates on pull request 7: GitHub refused: gh: Validation Failed (HTTP 422) body is too long (maximum is 65536 characters); nobody is told; the notice for pull request 7 is owed');
  assert.equal(waitingWork(gh).work, undefined);
});

test('a notice too large for one comment is written in parts, each under the limit, and read back whole', () => {
  const reason = (i, size) => ({ module: 'dates', entry: `e${i}`, changes: ['hands back differently'], lines: [`src/x.mjs:${i}`], through: null,
    before: { handsBack: 'x'.repeat(size) }, after: { handsBack: 'y'.repeat(size) } });
  // Three users: a small one, one whose reasons need several parts, and one with a reason too large for any part.
  const users = [
    ['orders', [reason(1, 100)]],
    ['report', Array.from({ length: 40 }, (_, i) => reason(i, 2000))],
    ['idle', [reason(99, 40000), reason(100, 10)]],
  ];
  const parts = noticeParts('dates', 7, users);
  assert.ok(parts.length >= 3);
  assert.deepEqual(parts.map((p) => p.part), parts.map((_, i) => i + 1));
  for (const p of parts) assert.ok(block(NOTICE_MARK, p).length < NOTICE_LIMIT);
  // Written as comments on the merged pull request and read back for each module: every reason, in order.
  const gh = fakeGitHub();
  writeNotice(gh, 'o/product', 7, 'dates', users);
  assert.equal(noticeComments(gh, 7).length, parts.length);
  const read = (module) => noticeReasons(gh, 'o/product', { module, kind: 'notice', from: 'dates', merged: 7 });
  assert.deepEqual(read('orders'), users[0][1]);
  assert.deepEqual(read('report'), users[1][1]);
  // The reason too large on its own keeps its entry, changes and lines, which choose the related tests, but not its words.
  const [big, small] = read('idle');
  assert.deepEqual(big, { module: 'dates', entry: 'e99', changes: ['hands back differently'], lines: ['src/x.mjs:99'], through: null, cut: 'its before and after are left out: too large for one comment' });
  assert.deepEqual(small, users[2][1][1]);
  // A second writing of a smaller notice rewrites its own comments, adds none, and empties a part it no longer needs.
  const count = gh.s.comments.length;
  writeNotice(gh, 'o/product', 7, 'dates', [users[0]]);
  assert.equal(gh.s.comments.length, count);
  assert.deepEqual(read('orders'), users[0][1]);
  assert.throws(() => read('report'), /has no reasons for report on its pull request; run notify 7 again, then open/);
  // Another merge's or another provider's notice is not read.
  assert.throws(() => noticeReasons(gh, 'o/product', { module: 'orders', kind: 'notice', from: 'orders', merged: 7 }), /no reasons/);
  // An older waiting entry that still carries its reasons is used as is.
  assert.deepEqual(noticeReasons(gh, 'o/product', { module: 'orders', kind: 'notice', from: 'dates', merged: 9, uses: [{ module: 'dates', entry: 'old' }] }), [{ module: 'dates', entry: 'old' }]);
});

test('notify runs once for each module the merge changed, in module order', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  mergedPR(root, gh, {
    'src/orders/index.mjs': ORDERS.replace('@returns {number}', '@returns {number} the day').replace('parseDay(t).n', 'parseDay(t).n + 0'),
    'src/dates/index.mjs': DATES('1 to 30'),
  });
  const { ctx, out } = ctxFor(root, gh);
  notifyCmd(ctx, 7);
  const text = out.join('\n');
  assert.ok(text.indexOf('Notice for a change to dates') < text.indexOf('Notice for a change to orders'));
  assert.match(text, /Notice for a change to orders[^\n]*\nThe listing before and after is the same\. Nobody is told\./);
});

test('rule 52: accepting more tells nobody only where the type checker confirms it', () => {
  const p = (opt, ret) => `/**
 * @typedef {Object} Thing
 * @property {() => ${ret}} size
 */
/**
 * @param {{ name: string${opt} }} o
 * @returns {Thing}
 */
export function make(o) { return { size: () => ${ret === 'number' ? 1 : "'1'"} }; }
`;
  const files = (opt, ret) => ({
    'process.json': config(),
    'process/modules/order.txt': 'p\nu\n',
    'process/modules/p.json': entry('p'),
    'process/modules/u.json': entry('u', ['p']),
    'src/p/index.mjs': p(opt, ret),
    'src/u/index.mjs': "import { make } from '../p/index.mjs';\nexport const one = () => make({ name: 'a' });\n",
  });
  const before = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  const more = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  const hidden = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  write(before, files('', 'number'));
  write(more, files('; size?: number', 'number'));
  write(hidden, files('; size?: number', 'string'));
  const a = notice(before, more, 'p');
  assert.deepEqual(a.entries.map((e) => `${e.entry}: ${e.changes}`), ['make: accepts more']);
  assert.deepEqual(a.told, []);
  // The tool's own comparison sees only "accepts more" for make (Thing is written by name); the checker does not
  // confirm it, since what make hands back changed: it is "cannot stand in", and u, which calls make, is told.
  const b = notice(before, hidden, 'p');
  const mk = b.entries.find((e) => e.entry === 'make');
  assert.deepEqual(mk.changes, ['cannot stand in']);
  assert.match(mk.notConfirmed, /not find the new entry assignable to the old/);
  assert.deepEqual(b.told.map((t) => t.user), ['u']);
  assert.deepEqual(b.told[0].reasons.map((r) => `${r.entry}: ${r.changes}`), ['make: cannot stand in']);
});

test('an unknown kind becoming known tells no one; any other difference in the same entry still tells', () => {
  // The owner's decision B of 25 Nov 2026: where the reader inferred "anything" before and a comment now states a kind,
  // the running code is the same; nothing changed for a user, here or "through" a later module that passes it on.
  const root = mkdtempSync(join(tmpdir(), 'p4-known-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-known-'));
  const RAW = '\nexport function raw(x) { return x; }\n';
  const STATED = '\n/**\n * @param {string} x\n * @returns {string}\n */\nexport function raw(x) { return x; }\n';
  const files = productFiles();
  files['src/dates/index.mjs'] = DATES() + RAW;
  files['src/orders/index.mjs'] = `import { raw } from '../dates/index.mjs';\n${ORDERS.split('\n').slice(1).join('\n')}\nexport const shown = () => raw('a');\n`.replace('export function orderDay', "import { parseDay } from '../dates/index.mjs';\nexport function orderDay");
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': DATES() + STATED });
  const r = notice(root, after, 'dates');
  assert.deepEqual([r.entries, r.told, r.changedModules], [[], [], []]);
  assert.equal(r.summary, 'The listing before and after is the same. Nobody is told.');
  // A stated parameter that is a union keeps its parameter list's brackets in the printed declaration, so the
  // declaration backstop lines it up with the one before and finds only "anything" stated (civicsmith notify 1356).
  write(after, { ...files, 'src/dates/index.mjs': DATES() + '\n/**\n * @param {{n: number}|undefined} x\n * @returns {number|null}\n */\nexport function raw(x) { if (!x) return null; return x.n; }\n' });
  write(root, { ...files, 'src/dates/index.mjs': DATES() + '\nexport function raw(x) { if (!x) return null; return x.n; }\n' });
  const u = notice(root, after, 'dates');
  assert.deepEqual([u.entries, u.told], [[], []]);
  write(root, files);
  // With another change in the same entry (a parameter newly required), that change still tells its users.
  write(after, { ...files, 'src/dates/index.mjs': DATES() + STATED.replace(' * @returns', ' * @param {number} y\n * @returns').replace('raw(x)', 'raw(x, y)') });
  const m = notice(root, after, 'dates');
  assert.deepEqual(m.entries.filter((e) => e.module === 'dates').map((e) => `${e.entry}: ${e.changes}`), ['raw: cannot stand in']);
  assert.ok(m.told.some((t) => t.user === 'orders' && t.reasons.some((x) => x.entry === 'raw')));
});

test('a notice prints the kinds of error raised where they differ, so the reason a change tells is visible', () => {
  // civicsmith notify 1356: a first @throws told every user, and the printout showed only the kinds, "anything" -> string.
  const root = mkdtempSync(join(tmpdir(), 'p4-raises-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-raises-'));
  const files = productFiles();
  files['src/orders/index.mjs'] = `${ORDERS}\nimport { raw } from '../dates/index.mjs';\nexport const shown = () => raw('a');\n`;
  write(root, { ...files, 'src/dates/index.mjs': `${DATES()}\n/** @param {string} x @returns {string} */\nexport function raw(x) { if (!x) throw new TypeError('x'); return x; }\n` });
  write(after, { ...files, 'src/dates/index.mjs': `${DATES()}\n/**\n * @param {string} x\n * @returns {string}\n * @throws {TypeError} when x is empty\n */\nexport function raw(x) { if (!x) throw new TypeError('x'); return x; }\n` });
  const r = notice(root, after, 'dates');
  assert.deepEqual(r.entries.map((e) => `${e.entry}: ${e.changes}`), ['raw: hands back differently']);
  assert.match(noticeText(r), /raises before: \[\]\n {6}raises after: {2}\["TypeError"\]/);
});

test('not followed fully: a declared provider with no use found tells the user on any change that tells users; a new entry tells it nothing', () => {
  const root = mkdtempSync(join(tmpdir(), 'p4-nf-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-nf-'));
  const files = productFiles();
  files['process/modules/order.txt'] = 'dates\norders\nreport\nidle\n';
  files['process/modules/idle.json'] = entry('idle', ['dates']);
  files['src/idle/index.mjs'] = 'export const idle = 1;\n';
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': `${DATES('1 to 30')}\n/** @returns {number} */\nexport function today() { return 1; }\n` });
  const r = notice(root, after, 'dates');
  assert.deepEqual(r.entries.map((e) => `${e.entry}: ${e.changes}`), ['Day: bound changed', 'formatDay: bound changed', 'parseDay: bound changed', 'today: new entry']);
  assert.deepEqual(r.told.find((t) => t.user === 'idle').reasons, [{ module: 'dates', notFollowed: ['declares dates but no use of it is found in its code'], through: null }]);
  // A change that tells nobody (here a new entry alone) tells a user that is not followed fully nothing either: a notice
  // for nothing (the owner's decision B of 25 Nov 2026).
  write(after, { ...files, 'src/dates/index.mjs': `${DATES()}\n/** @returns {number} */\nexport function today() { return 1; }\n` });
  const n = notice(root, after, 'dates');
  assert.deepEqual(n.entries.map((e) => `${e.entry}: ${e.changes}`), ['today: new entry']);
  assert.deepEqual(n.told, []);
});

test('check prints each disagreement with file and line, and exits 1', () => {
  const files = productFiles();
  files['src/orders/index.mjs'] = `import { parseDay } from '../dates/index.mjs';
import { show } from '../report/index.mjs';
/**
 * @param {string} t
 * @returns {string}
 */
export function orderDay(t) { return parseDay(t).n; }
export const bad = () => parseDay(3);
export const s = show;
/** @returns {number} */
export const word = () => 'a';
`;
  files['test/orders/index.test.mjs'] = `import { orderDay } from '../../src/orders/index.mjs';\n/** @type {boolean} */\nexport const x = orderDay('3');\n`;
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  assert.throws(() => checkCmd(ctx, 'orders', { _: [] }), /disagreement\(s\) in orders/);
  const text = out.join('\n');
  assert.match(text, /src\/orders\/index\.mjs:2 declared uses disagree with the imports: imports report, which process\/modules\/orders\.json does not declare in uses/);
  // A value dates states, handed back where orders' own @returns receives it: the receiving side is orders' own (a).
  assert.match(text, /src\/orders\/index\.mjs:7 \(a\) a comment disagrees with this module's code: Type 'number' is not assignable to type 'string'/);
  assert.match(text, /src\/orders\/index\.mjs:8 \(b\) code disagrees with the stated interface of dates: Argument of type 'number'/);
  assert.match(text, /src\/orders\/index\.mjs:11 \(a\) a comment disagrees with this module's code: Type 'string' is not assignable to type 'number'/);
  // --files: only the files named.
  out.length = 0;
  assert.throws(() => checkCmd(ctx, 'orders', { _: [], files: 'test/orders/index.test.mjs' }), /1 disagreement/);
  assert.match(out.join('\n'), /test\/orders\/index\.test\.mjs:3 \(a\) a comment disagrees with this module's tests/);
  assert.doesNotMatch(out.join('\n'), /src\/orders\/index\.mjs/);
});

test('check: a declared use of a later module disagrees, in source or in tests, and declaring it settles nothing', () => {
  // orders (line 2) reaches report (line 3) from a test file, and declares it: the declaration is what disagrees.
  const files = productFiles();
  files['process/modules/orders.json'] = entry('orders', ['dates', 'report']);
  files['test/orders/index.test.mjs'] = `import { orderDay } from '../../src/orders/index.mjs';\nimport { show } from '../../src/report/index.mjs';\norderDay('3');\nshow(1);\n`;
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  assert.throws(() => checkCmd(ctx, 'orders', { _: [] }), /1 disagreement/);
  assert.match(out.join('\n'), /process\/modules\/orders\.json a declared use of a module that is not before this one: declares report in uses, but report is later in the order \(line 3 of the order file; orders is line 2\): a module may use only modules before it/);
  // Undeclared, the import itself disagrees, and the line says that declaring it would not settle it.
  out.length = 0;
  commit(root, { 'process/modules/orders.json': JSON.stringify(entry('orders', ['dates'])) });
  assert.throws(() => checkCmd(ctx, 'orders', { _: [] }), /1 disagreement/);
  assert.match(out.join('\n'), /test\/orders\/index\.test\.mjs:2 declared uses disagree with the imports: imports report, which process\/modules\/orders\.json does not declare in uses; report is later in the order, so declaring it would not settle this/);
  // A declared use of an earlier module is untouched.
  out.length = 0;
  checkCmd(ctx, 'report', { _: [] });
  assert.doesNotMatch(out.join('\n'), /not before this one/);
});

test('check: a declared use with no import seen is "cannot tell"; what the reader cannot tell is said, never refused; rules of form are not taken', () => {
  const files = productFiles();
  files['process/modules/report.json'] = entry('report', ['dates', 'orders']);
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  // It may be made by a path (a file read, a program run), which the check does not read (the owner's decision of 24 Nov).
  assert.equal(checkCmd(ctx, 'report', { _: [] }), 0);
  assert.match(out.join('\n'), /cannot tell, not refused: process\/modules\/report\.json declares orders but no import of it is seen; a use by path is not read/);
  // An import of a provider's private file (the proof's rule 28), `this` in a plain handle (rule 49), a throw of an
  // unstated kind (rule 29): none refused. A computed import(): cannot tell.
  commit(root, {
    'src/dates/inner.mjs': 'export const z = 1;\n',
    'src/orders/index.mjs': `import { parseDay } from '../dates/index.mjs';
import { z } from '../dates/inner.mjs';
/** @typedef {{ n: number, get: () => number }} Box */
/** @type {Box} */
export const box = { n: z, get() { return this.n; } };
/**
 * @param {string} t
 * @returns {number}
 * @throws {RangeError}
 */
export function orderDay(t) { if (!t) throw new TypeError('no'); return parseDay(t).n; }
export const later = (/** @type {string} */ name) => import(name);
`,
  });
  out.length = 0;
  assert.equal(checkCmd(ctx, 'orders', { _: [] }), 0);
  assert.match(out.join('\n'), /Check of orders: no disagreement found/);
  assert.match(out.join('\n'), /cannot tell, not refused: src\/orders\/index\.mjs:12 an import of a name the tool cannot read/);
});

test('check refuses only what a structured comment states: on plain code the reader cannot tell', () => {
  const files = productFiles();
  // report: plain JavaScript with no comments, whose usual ways the reader complains about.
  files['src/report/index.mjs'] = `import { formatDay } from '../dates/index.mjs';
export function rec(name) { const r = { name, tags: [] }; r.when = Date.now(); return r; }
export const settings = { mode: 'fast' };
settings.mode = 7;
export function pad(text, width = 10) { return String(text).padStart(width); }
export const show = (n) => formatDay({ n });
`;
  files['test/report/index.test.mjs'] = `import { rec, settings, pad } from '../../src/report/index.mjs';
rec('a').tags.push('x');
settings.timeout = 1;
pad('a', '3');
`;
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  assert.equal(checkCmd(ctx, 'report', { _: [] }), 0);
  const plain = out.filter((l) => /plain code: no structured comment states what this contradicts/.test(l));
  assert.deepEqual(plain.map((l) => l.match(/not refused: (\S+)/)[1]), ['src/report/index.mjs:2', 'src/report/index.mjs:4', 'test/report/index.test.mjs:2', 'test/report/index.test.mjs:3', 'test/report/index.test.mjs:4']);
  // A comment of its own that its code contradicts is still refused (a); so is its code against a provider's stated
  // interface (b), here the field n of dates' Day.
  commit(root, { 'src/report/index.mjs': `${files['src/report/index.mjs']}/** @param {string} label */
export function title(label) { return label; }
export const t = title(3);
export const bad = () => formatDay({ n: 'x' });
` });
  out.length = 0;
  assert.throws(() => checkCmd(ctx, 'report', { _: [] }), /2 disagreement/);
  assert.match(out.join('\n'), /src\/report\/index\.mjs:9 \(a\) a comment disagrees with this module's code: Argument of type 'number' is not assignable to parameter of type 'string'/);
  assert.match(out.join('\n'), /src\/report\/index\.mjs:10 \(b\) code disagrees with the stated interface of dates: Type 'string' is not assignable to type 'number'/);
});

test('language_reader.exclude: a file it names is no module\'s and is never read; without the field nothing is left out', () => {
  const files = productFiles();
  // A vendored copy inside dates, whose own comment disagrees with its code.
  files['src/dates/vendor/lib.mjs'] = '/** @type {number} */\nexport const v = "a";\n';
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  assert.throws(() => checkCmd(ctx, 'dates', { _: [] }), /1 disagreement/);
  assert.match(out.join('\n'), /src\/dates\/vendor\/lib\.mjs:2 \(a\) a comment disagrees with this module's code/);
  const reader = (exclude) => commit(root, { 'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'], exclude } }) });
  reader(['**/vendor/**', 'dist/*.mjs']);
  const t = loadTree(root);
  assert.deepEqual(t.byId.get('dates').files.map((f) => f.slice(root.length + 1)), ['src/dates/index.mjs']);
  assert.equal(t.moduleOfFile(join(root, 'src/dates/vendor/lib.mjs')), null);
  out.length = 0;
  assert.equal(checkCmd(ctx, 'dates', { _: [] }), 0);
  assert.doesNotMatch(out.join('\n'), /vendor/);
  // An empty list leaves out nothing.
  reader([]);
  assert.equal(loadTree(root).byId.get('dates').files.length, 2);
});

test('a very long expression (20,000 terms) does not run the tool out of stack', () => {
  const terms = Array.from({ length: 20000 }, (_, i) => `'s${i}'`).join(' +\n  ');
  const files = productFiles();
  files['src/report/index.mjs'] = `import { formatDay } from '../dates/index.mjs';\n/** @param {number} n @returns {string} */\nexport const show = (n) => formatDay({ n });\nexport const big = ${terms};\n`;
  const root = makeRepo(files);
  const tree = loadTree(root);
  assert.equal(check(tree, 'report').refused, false);
  assert.ok(analyse(tree).listings.get('report').entries.big);
  assert.equal(commentsOnly(tree, tree, 'report').same, true);
  // Inside one function, the reader itself (TypeScript) follows such an expression by recursion: where it runs out of
  // stack, that file is "cannot tell", never a crash or a refusal.
  commit(root, { 'src/report/index.mjs': `${files['src/report/index.mjs']}export function many() { return show(1) + ${terms}; }\n` });
  const r = check(loadTree(root), 'report');
  assert.equal(r.refused, false);
  assert.match(r.cannotTell.find((c) => c.code === 'stack')?.why ?? '', /^the reader ran out of stack on this file/);
});

test('check reads require() of a written path and imports by the product\'s own package name, as imports', () => {
  const files = productFiles();
  files['package.json'] = { name: 'shop', type: 'module' };
  // report declares dates only; its test reaches orders by require and by the product's own name.
  files['test/report/index.test.mjs'] = `import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { orderDay } = require('../../src/orders/index.mjs');
import { o2 } from 'shop/src/orders/index.mjs';
const which = 'x';
require(which);
orderDay('3');
`;
  const root = makeRepo(files);
  let r = check(loadTree(root), 'report');
  assert.deepEqual(r.refusals.map((x) => `${x.at} ${x.text}`), [
    'test/report/index.test.mjs:3 imports orders, which process/modules/report.json does not declare in uses',
    'test/report/index.test.mjs:4 imports orders, which process/modules/report.json does not declare in uses',
  ]);
  assert.ok(r.cannotTell.some((c) => c.at === 'test/report/index.test.mjs:6' && c.why === 'an import of a name the tool cannot read'));
  // Declared, both settle; orders is earlier than report.
  commit(root, { 'process/modules/report.json': JSON.stringify(entry('report', ['dates', 'orders'])) });
  r = check(loadTree(root), 'report');
  assert.deepEqual(r.refusals, []);
  assert.ok(!r.cannotTell.some((c) => /declares orders/.test(c.why)));
  // From orders (line 2), an import of report (line 3) by the own name is refused as a later module.
  commit(root, { 'test/orders/index.test.mjs': `import { orderDay } from '../../src/orders/index.mjs';\nimport 'shop/src/report/index.mjs';\norderDay('3');\n` });
  r = check(loadTree(root), 'orders');
  assert.deepEqual(r.refusals.map((x) => `${x.at} ${x.text}`), ['test/orders/index.test.mjs:2 imports report, which process/modules/orders.json does not declare in uses; report is later in the order, so declaring it would not settle this']);
  // With the package's exports, the own name is followed as the reader resolves it; a name it cannot follow is
  // "cannot tell".
  commit(root, {
    'package.json': JSON.stringify({ name: 'shop', type: 'module', exports: { './report': './src/report/index.mjs' } }),
    'test/orders/index.test.mjs': `import { orderDay } from '../../src/orders/index.mjs';\nimport 'shop/report';\nimport 'shop/nowhere';\norderDay('3');\n`,
  });
  r = check(loadTree(root), 'orders');
  assert.deepEqual(r.refusals.map((x) => x.at), ['test/orders/index.test.mjs:2']);
  assert.ok(r.cannotTell.some((c) => c.at === 'test/orders/index.test.mjs:3' && /own package name that the tool cannot follow/.test(c.why)));
});

test('check: in a value that cannot be assigned, only the receiving side\'s comment counts (refusal b)', () => {
  // dates states its function deliver; orders' assemble states nothing of its options; report hands deliver to it.
  const files = productFiles();
  files['src/dates/index.mjs'] = `${DATES()}
/**
 * @param {string} what
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deliver(what) { return { ok: !!what }; }
`;
  files['src/orders/index.mjs'] = `${ORDERS}export function assemble(ctx, { deliver = null } = {}) { return { ctx, deliver }; }\n`;
  files['process/modules/report.json'] = entry('report', ['dates', 'orders']);
  files['src/report/index.mjs'] = `import { deliver } from '../dates/index.mjs';\nimport { assemble } from '../orders/index.mjs';\nexport const store = assemble(1, { deliver });\n`;
  const root = makeRepo(files);
  let r = check(loadTree(root), 'report');
  assert.deepEqual(r.refusals, []);
  assert.deepEqual(r.cannotTell.filter((c) => c.at === 'src/report/index.mjs:3').map((c) => c.why), ['plain code: no structured comment states what this contradicts']);
  // Once orders states the option, the refusal names orders, whose comment the value contradicts.
  commit(root, { 'src/orders/index.mjs': `${ORDERS}/**
 * @param {number} ctx
 * @param {{ deliver?: null }} [opts]
 */
export function assemble(ctx, { deliver = null } = {}) { return { ctx, deliver }; }
` });
  r = check(loadTree(root), 'report');
  assert.deepEqual(r.refusals.map((x) => `${x.at} ${x.kind}`), ['src/report/index.mjs:3 (b) code disagrees with the stated interface of orders']);
  // Its own stated answer, contradicted by a value a provider states, is (a): the answer is what receives it.
  commit(root, { 'src/report/index.mjs': `import { parseDay } from '../dates/index.mjs';\nimport { assemble } from '../orders/index.mjs';\n/** @returns {string} */\nexport const day = () => parseDay('1').n;\nexport const s = assemble;\n` });
  r = check(loadTree(root), 'report');
  assert.deepEqual(r.refusals.map((x) => `${x.at} ${x.kind}`), ["src/report/index.mjs:4 (a) a comment disagrees with this module's code"]);
  // A function of dates handed to map: map hands its index into the function's stated parameter, so that parameter is
  // the receiving side, and dates is named.
  commit(root, {
    'src/dates/index.mjs': `${DATES()}\n/**\n * @param {string} text\n * @param {'short' | 'long'} [form]\n * @returns {string}\n */\nexport function label(text, form) { return form ? text : text; }\n`,
    'src/report/index.mjs': `import { label } from '../dates/index.mjs';\nexport const labels = ['a', 'b'].map(label);\n`,
  });
  r = check(loadTree(root), 'report');
  assert.deepEqual(r.refusals.map((x) => `${x.at} ${x.kind}`), ['src/report/index.mjs:2 (b) code disagrees with the stated interface of dates']);
});

test('a class member\'s own bound is in its listing, and a changed one tells its users', () => {
  const root = mkdtempSync(join(tmpdir(), 'p4-cb-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-cb-'));
  const cal = (bound) => `${DATES()}
export class Cal {
  /**
   * @param {number} n
   * @returns {number}
   * @bound n: whole number, ${bound}
   */
  day(n) { return n; }
  /**
   * @param {number} n
   * @returns {number}
   * @bound at most ${bound}
   */
  static max(n) { return n; }
}
`;
  const files = productFiles();
  files['src/dates/index.mjs'] = cal('1 to 31');
  files['src/orders/index.mjs'] = `${ORDERS}import { Cal } from '../dates/index.mjs';\n/** @returns {number} */\nexport const first = () => new Cal().day(1) + Cal.max(2);\n`;
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': cal('1 to 30') });
  const l = analyse(root).listings.get('dates').entries;
  assert.deepEqual(l['Cal#day'].bounds, ['n: whole number, 1 to 31']);
  assert.deepEqual(l['Cal.max'].bounds, ['at most 1 to 31']);
  const r = notice(root, after, 'dates');
  assert.deepEqual(r.entries.map((e) => `${e.entry}: ${e.changes}`), ['Cal#day: bound changed', 'Cal.max: bound changed']);
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons.map((x) => `${x.entry}: ${x.changes}`)]), [['orders', ['Cal#day: bound changed', 'Cal.max: bound changed']]]);
});

test('not followed fully: a reason names its first six places and how many more, so the notice keeps a size', () => {
  const root = mkdtempSync(join(tmpdir(), 'p4-nf6-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-nf6-'));
  const files = productFiles();
  files['process/modules/order.txt'] = 'dates\norders\nreport\nidle\n';
  files['process/modules/idle.json'] = entry('idle', ['dates']);
  files['src/idle/index.mjs'] = Array.from({ length: 9 }, (_, i) => `export const v${i} = JSON.parse('{}').f${i};\n`).join('');
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': DATES('1 to 30') });
  const r = notice(root, after, 'dates');
  const nf = r.told.find((t) => t.user === 'idle').reasons[0].notFollowed;
  const places = Array.from({ length: 6 }, (_, i) => `src/idle/index.mjs:${i + 1} JSON.parse('{}')`).join('; ');
  assert.deepEqual(nf, ['declares dates but no use of it is found in its code', `reads or calls values of unknown kind: ${places}; and 3 more`]);
});
