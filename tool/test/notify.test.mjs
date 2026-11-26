import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkCmd, listingCmd, notifyCmd } from '../lib/notify.mjs';
import { loadTree } from '../lib/notice/model.mjs';
import { notice, noticeText } from '../lib/notice/notice.mjs';
import { noticeLines, readLines, readNoticeLines } from '../lib/notice/notices.mjs';
import { moduleMeans } from '../lib/notice/means.mjs';
import { check } from '../lib/notice/check.mjs';
import { block, parseBlock } from '../lib/github.mjs';
import { NOTICE_LIMIT, NOTICE_MARK, cutReason, noticeParts, noticeReasons, writeNotice } from '../lib/noticecomments.mjs';
import { JOB_MARK, MEANING_MARK, RECORD_MARK } from '../lib/round.mjs';
import { create, mark } from '../lib/state.mjs';
import { Fail, git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo, write } from './helpers.mjs';
import { withUsesFiles } from './usesfiles.mjs';

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
// The product's files, with no uses file yet (the check's tests, which change code the files would describe).
const baseFiles = () => ({
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
// The product, with each module's uses file as its last job left it (the tool's writer).
const productFiles = () => withUsesFiles(baseFiles());

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
  // The rest of each item's means, worked out from its code, is printed with it.
  commit(root, { 'src/dates/index.mjs': DATES('1 to 30').replace('return String(d.n);', "if (d.n < 1) throw new RangeError('n'); console.error(d.n); return String(d.n);") });
  out.length = 0;
  listingCmd(ctx, 'dates', { _: [] });
  assert.match(out.join('\n'), /function formatDay[^\n]*\n(?: {6}[^\n]*\n)* {6}errors that can leave it: RangeError\n {6}channels, settings and files: writes standard error/);
});

test('notify tells the users of a changed item, found in their uses files: their reasons on the merged pull request, waiting work naming the notice, once per provider and user', () => {
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
  assert.match(text, /Notice for a change to dates \(TypeScript 5\.6\.3\)\n3 items changed in a way that tells; 2 module\(s\) told\./);
  assert.match(text, /dates parseDay: bound changed \[found by its means\] -> tells its users\n {6}means: bound changed: n: whole number, 1 to 31 -> n: whole number, 1 to 30/);
  assert.match(text, /TOLD orders\n {6}uses dates Day \(bound changed; found by its means\) at src\/orders\/index\.mjs:6 orderDay\n {6}uses dates parseDay \(bound changed; found by its means\) at src\/orders\/index\.mjs:1 \(top level\), src\/orders\/index\.mjs:6 orderDay\n/);
  assert.match(text, /TOLD report\n {6}uses dates Day \(bound changed; found by its means\) at src\/report\/index\.mjs:3 show\n {6}uses dates formatDay \(bound changed; found by its means\) at src\/report\/index\.mjs:1 \(top level\), src\/report\/index\.mjs:3 show/);
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
  const day = uses.find((u) => u.item === 'Day');
  // The reason of build text 5, section 5.
  assert.deepEqual(day, { module: 'dates', item: 'Day', found: 'means', changes: ['bound changed'], why: null, route: 'direct',
    places: ['src/orders/index.mjs:6 orderDay'], before: { bounds: ['n: whole number, 1 to 31'] }, after: { bounds: ['n: whole number, 1 to 30'] } });
  assert.deepEqual(uses.map((u) => u.item).sort(), ['Day', 'parseDay']);
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
  const old = { module: 'dates', item: 'old' };
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
  assert.deepEqual(b.data.uses.slice(1).map((u) => u.item).sort(), ['Day', 'parseDay']);
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
  const tooMany = { module: 'dates', whole: `the notice from dates (pull request 7) has ${reasons.length} reasons, too many for the job block; the whole module's tests run` };
  // A job block already holding `k` characters of earlier uses, and what it is with the notice's `uses` added.
  const data = (k) => ({ module: 'orders', work: ['R1'], kind: 'ordinary', uses: [{ module: 'dates', item: 'old', note: 'x'.repeat(k) }] });
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
  assert.ok(run(k1).every((r) => r.cut && r.before === undefined && r.places.length));
  // Room only for one reason: the job's related tests err to its whole module.
  const k2 = fill([tooMany]);
  assert.ok(withNotice(k2, reasons.map(cutReason)) >= NOTICE_LIMIT);
  assert.deepEqual(run(k2), [tooMany]);
});

test('a job block too full even for one reason still takes the notice at once: its earlier uses give way', () => {
  // Design part 2, section 7: a notice reaches an open job at once; part 6, section 5: nothing is refused for size.
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  gh.s.prs.push({ number: 20, state: 'open', head: { ref: 'job/orders.1', sha: 'h'.repeat(40) }, base: { ref: 'tranche' } });
  // Earlier uses that fill the block, with no before and after to leave out.
  const old = Array.from({ length: 3 }, (_, i) => ({ module: 'dates', item: `old${i}`, note: 'x'.repeat(NOTICE_LIMIT / 3) }));
  gh.addComment('o/product', 20, block(JOB_MARK, { module: 'orders', work: ['R1'], kind: 'ordinary', uses: old }));
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const body = gh.s.comments.find((x) => x.on === 20).body;
  assert.ok(body.length < NOTICE_LIMIT);
  const b = parseBlock(body, JOB_MARK).data;
  assert.deepEqual(b.work, ['R1', 'notice from dates (pull request 7)']);
  assert.equal(b.notice_seq, 1);
  assert.deepEqual(b.notices, [{ from: 'dates', merged: 7 }]);
  assert.equal(b.uses.length, 1);
  assert.match(b.uses[0].whole, /^the notice from dates \(pull request 7\) has \d+ reasons, too many for the job block, which is full: its 3 earlier reason\(s\) are left out; the whole module's tests run$/);
  assert.match(out.join('\n'), /message the job of orders \(pull request 20\): a notice from dates reached it \(its reasons shortened to fit the job block\)/);
  // It did not wait for orders' next job.
  assert.doesNotMatch(out.join('\n'), /waits for its next job/);
  assert.deepEqual(waitingWork(gh).work.map((w) => w.module), ['report']);
});

test('notify on a merge that changes no module\'s files says so before reading any code', () => {
  // civicsmith, 23 Nov 2026: such a merge read the whole product twice and ran out of memory.
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  mergedPR(root, gh, { 'process/notes.md': 'a note\n' });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, /The merge changed no module's files\.\nNo item changed\. Nobody is told\./);
  assert.doesNotMatch(text, /Notice for a change|TypeScript/);
  assert.equal(gh.s.comments.length, 0);
});

test('notify on a merge that changes no item\'s means tells nobody, reads no uses file, and writes nothing', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  // formatDay's code changes; its stated kinds, bounds and the facts worked out from its code do not.
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 31', " + ''") });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  assert.match(out.join('\n'), /Notice for a change to dates[^\n]*\nNo item's means changed; nobody is told\./);
  assert.doesNotMatch(out.join('\n'), /TOLD/);
  assert.equal(gh.s.comments.length, 0);
  gh.s.prs.push({ number: 9, state: 'closed', merged_at: null, head: { ref: 'x' }, base: { ref: 'main' } });
  assert.throws(() => notifyCmd(ctx, 9), /pull request 9 is not merged/);
});

test('who is told is a lookup in the later modules\' uses files: a module whose file names no changed item is not told, whatever it imports', () => {
  const files = { ...productFiles(), 'process/modules/order.txt': 'dates\norders\nreport\nchain\nloner\n',
    'process/modules/chain.json': entry('chain', ['orders']), 'process/modules/loner.json': entry('loner', ['dates']) };
  // chain uses orders only; loner imports dates and uses only an item the change leaves as it was.
  files['src/chain/index.mjs'] = "import { orderDay } from '../orders/index.mjs';\n/** @returns {number} */\nexport const first = () => orderDay('1');\n";
  files['src/loner/index.mjs'] = "import { parseDay } from '../dates/index.mjs';\n/** @returns {unknown} */\nexport const p = () => parseDay;\n";
  const withUses = withUsesFiles(files);
  const before = mkdtempSync(join(tmpdir(), 'p4-look-')), after = mkdtempSync(join(tmpdir(), 'p4-look-'));
  write(before, withUses);
  // only formatDay changes: its code may now throw
  write(after, { ...withUses, 'src/dates/index.mjs': DATES('1 to 31').replace('return String(d.n);', "if (d.n < 0) throw new RangeError('n'); return String(d.n);") });
  const r = notice(before, after, 'dates');
  // report's show takes in formatDay's errors (its uses file's takesIn): a changed item of report too, which no one uses
  assert.deepEqual(r.changed.map((c) => `${c.module} ${c.item}: ${c.changes}`), ['dates formatDay: errors that can leave it changed', 'report show: errors that can leave it changed']);
  assert.match(r.changed[0].words, /^errors that can leave it changed: none -> RangeError$/);
  assert.deepEqual(r.told.map((t) => t.user), ['report']);
});

test('a module named through a middle module is told; a place outside the standard is told of every change of a module it may refer to; an order fault naming it too', () => {
  const files = withUsesFiles({ ...productFiles(), 'process/modules/order.txt': 'dates\norders\nreport\nfar\nloose\nlate\n',
    'process/modules/far.json': entry('far', ['orders']), 'process/modules/loose.json': entry('loose'), 'process/modules/late.json': entry('late'),
    'src/far/index.mjs': 'export const f = 1;\n', 'src/loose/index.mjs': 'export const l = 1;\n', 'src/late/index.mjs': 'export const z = 1;\n' });
  // far reads Day through orders (its uses file records the route); loose has a place outside the standard that may
  // refer to any earlier module; late's file records an order fault naming dates.
  files['process/modules/far.uses.json'] = { module: 'far', providers: ['dates', 'orders'], uses: [
    { provider: 'orders', item: 'orderDay', itemKind: 'function', type: 'call', route: 'direct', standard: true, where: [{ file: 'src/far/index.mjs', side: 'code', line: 3 }] },
    { provider: 'dates', item: 'Day', itemKind: 'kind', type: 'read', route: { via: 'orders', item: 'orderDay' }, standard: true, where: [{ file: 'test/far/index.test.mjs', side: 'test', line: 9, test: 'far > reads a day' }] }],
  outside: [], orderFaults: [], copies: [] };
  files['process/modules/loose.uses.json'] = { module: 'loose', providers: [], uses: [], outside: [{ rule: 'R1', file: 'src/loose/index.mjs', side: 'code', line: 1, mayRefer: ['*'] }], orderFaults: [], copies: [] };
  files['process/modules/late.uses.json'] = { module: 'late', providers: [], uses: [], outside: [], orderFaults: [{ provider: 'dates', file: 'src/late/index.mjs', line: 1 }], copies: [] };
  const before = mkdtempSync(join(tmpdir(), 'p4-route-')), after = mkdtempSync(join(tmpdir(), 'p4-route-'));
  write(before, files);
  write(after, { ...files, 'src/dates/index.mjs': DATES('1 to 30') });
  const r = notice(before, after, 'dates');
  assert.deepEqual(r.told.map((t) => t.user), ['orders', 'report', 'far', 'loose', 'late']);
  const far = r.told.find((t) => t.user === 'far').reasons;
  assert.deepEqual(far.map((x) => [x.item, x.places, x.route]), [['Day', ['test/far/index.test.mjs:9 far > reads a day'], { via: 'orders', item: 'orderDay' }]]);
  assert.match(noticeText(r), /TOLD far\n {6}uses dates Day \(bound changed; found by its means\) at test\/far\/index\.test\.mjs:9 far > reads a day/);
  const loose = r.told.find((t) => t.user === 'loose').reasons;
  assert.deepEqual(loose.map((x) => [x.module, x.items, x.found, x.outside]), [['dates', ['Day', 'formatDay', 'parseDay'], 'any change', 'R1 src/loose/index.mjs:1']]);
  assert.deepEqual(r.told.find((t) => t.user === 'late').reasons.map((x) => [x.found, x.orderFault]), [['any change', 'order src/late/index.mjs:1']]);
  // A change to dates' files that changes no item's means (a new item) tells only the place outside the standard and the order fault, which
  // hear of any change until converted.
  write(after, { ...files, 'src/dates/index.mjs': `${DATES()}\n/** @returns {number} */\nexport function today() { return 1; }\n` });
  const n = notice(before, after, 'dates');
  assert.deepEqual([n.changed, n.fresh, n.told.map((t) => t.user)], [[], ['today'], ['loose', 'late']]);
  assert.match(n.told[0].reasons[0].why, /^its files changed, though no item's means did; a place outside the coding standard that may refer to any earlier module$/);
  // A change that only names an item's meaning, with no file changed, tells no place outside the standard of it.
  const m = notice(before, before, 'dates', { filesChanged: false, named: [{ item: 'parseDay', line: 'a; b', found: 'named' }] });
  assert.deepEqual(m.told.map((t) => t.user), ['orders']);
});

test('an order fault is a use of a later module: the earlier module that holds it hears of any change to that module\'s files', () => {
  const files = productFiles();
  // orders (before report in the order) refers to report: an order fault in its uses file.
  files['process/modules/orders.uses.json'] = { ...files['process/modules/orders.uses.json'], orderFaults: [{ provider: 'report', file: 'test/orders/index.test.mjs', side: 'test', line: 2 }] };
  const before = mkdtempSync(join(tmpdir(), 'p4-fault-')), after = mkdtempSync(join(tmpdir(), 'p4-fault-'));
  write(before, files);
  // report's code changes; no item's means does
  write(after, { ...files, 'src/report/index.mjs': `${files['src/report/index.mjs']}// a note\nconst unused = 1;\n` });
  const r = notice(before, after, 'report');
  assert.deepEqual(r.changed, []);
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons.map((x) => [x.found, x.orderFault])]), [['orders', [['any change', 'order test/orders/index.test.mjs:2']]]]);
  // A change that names a meaning but changes no file tells it nothing.
  assert.deepEqual(notice(before, before, 'report', { filesChanged: false }).told, []);
});

test('a module with no uses file yet is told of every change of an earlier module it imports, and its whole tests run', () => {
  const files = withUsesFiles({ ...productFiles(), 'process/modules/order.txt': 'dates\norders\nreport\nold\nalone\n',
    'process/modules/old.json': entry('old'), 'process/modules/alone.json': entry('alone'),
    'src/old/index.mjs': "import { formatDay } from '../dates/index.mjs';\nexport const f = formatDay;\n", 'src/alone/index.mjs': 'export const a = 1;\n' });
  delete files['process/modules/old.uses.json'];
  delete files['process/modules/alone.uses.json'];
  // A file that cannot be read counts as none.
  files['process/modules/alone.uses.json'] = 'not json';
  const before = mkdtempSync(join(tmpdir(), 'p4-nofile-')), after = mkdtempSync(join(tmpdir(), 'p4-nofile-'));
  write(before, files);
  write(after, { ...files, 'src/dates/index.mjs': DATES('1 to 30') });
  const r = notice(before, after, 'dates');
  assert.deepEqual(r.told.map((t) => t.user), ['orders', 'report', 'old']);
  assert.deepEqual(r.told.find((t) => t.user === 'old').reasons, [{ module: 'dates', items: ['Day', 'formatDay', 'parseDay'], found: 'any change', changes: [],
    why: 'Day, formatDay, parseDay changed; old has no uses file yet and imports dates', noUsesFile: 'old has no uses file yet: its whole tests run' }]);
  // Any change to dates' files tells it, whether or not an item changed.
  write(after, { ...files, 'src/dates/index.mjs': DATES('1 to 31', " + ''") });
  assert.deepEqual(notice(before, after, 'dates').told.map((t) => t.user), ['old']);
});

test('a conversion\'s merge tells no one, even where it changed an item; nothing is read or written', () => {
  // describing: pad's parameter, read as any value, is stated, and its code changes too
  const RAW = '\nexport function pad(x) { return x; }\n';
  const STATED = '\n/** @param {string} x @returns {string} */\nexport function pad(x) { return `${x}`; }\n';
  const files = withUsesFiles({ ...baseFiles(), 'src/dates/index.mjs': DATES() + RAW, 'src/orders/index.mjs': `${ORDERS}import { pad } from '../dates/index.mjs';\n/** @returns {unknown} */\nexport const p = () => pad('a');\n` });
  for (const after of [DATES() + STATED, DATES('1 to 30') + STATED]) {
    // the second also changes a bound line: still a conversion, so still no one is told
    const root = makeRepo(files);
    const gh = fakeGitHub();
    create(gh, 'o/product', ['waiting-work'], () => {});
    mergedPR(root, gh, { 'src/dates/index.mjs': after });
    gh.addComment('o/product', 7, block(JOB_MARK, { module: 'dates', work: ['conversion'], kind: 'conversion' }));
    const { ctx, out } = ctxFor(root, gh);
    const wrote = JSON.stringify(gh.s.comments);
    assert.equal(notifyCmd(ctx, 7), 0);
    const text = out.join('\n');
    assert.match(text, /a conversion's merge tells no one\. Nobody is told\./);
    assert.doesNotMatch(text, /TOLD/);
    assert.doesNotMatch(text, /tells its users/);
    assert.equal(JSON.stringify(gh.s.comments), wrote);
  }
  // the same change merged by an ordinary job tells orders
  const root = makeRepo(files);
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') + STATED });
  gh.addComment('o/product', 7, block(JOB_MARK, { module: 'dates', work: ['R1'], kind: 'ordinary' }));
  const two = ctxFor(root, gh);
  assert.equal(notifyCmd(two.ctx, 7), 0);
  assert.match(two.out.join('\n'), /TOLD orders/);
});

test('the means worked out from the code: errors, a class instance, this, arguments written into, channels, and a type error', () => {
  const P = (body) => `/**
 * @typedef {Object} Box
 * @property {number} v
 */
/**
 * @typedef {Object} Boxes
 * @property {(b: Box) => number} put
 * @property {(n: number) => Box} make
 * @property {(n: number) => boolean} ok
 */
${body}
`;
  const base = `/** @returns {Boxes} */
export function createBoxes() {
  /** @type {Box[]} */
  const all = [];
  return {
    put(b) { all.push(b); return all.length; },
    make(n) { return { v: n }; },
    ok(n) { return n > 0; },
  };
}`;
  const files = withUsesFiles({ ...productFiles(), 'src/dates/index.mjs': `${DATES()}${P(base)}`,
    'src/orders/index.mjs': `${ORDERS}import { createBoxes } from '../dates/index.mjs';\nconst boxes = createBoxes();\n/** @returns {number} */\nexport const one = () => boxes.put(boxes.make(1)) + (boxes.ok(1) ? 1 : 0);\n` });
  const before = mkdtempSync(join(tmpdir(), 'p4-means-')), after = mkdtempSync(join(tmpdir(), 'p4-means-'));
  write(before, files);
  const changed = (body) => {
    write(after, { ...files, 'src/dates/index.mjs': `${DATES()}${P(body)}` });
    return Object.fromEntries(notice(before, after, 'dates').changed.filter((c) => c.module === 'dates').map((c) => [c.item, c.changes.join(', ')]));
  };
  assert.deepEqual(changed(base.replace('ok(n) { return n > 0; }', "ok(n) { if (n > 99) throw new RangeError('big'); return n > 0; }")), { 'Boxes.ok': 'errors that can leave it changed' });
  assert.deepEqual(changed(base.replace('ok(n) { return n > 0; }', 'ok(n) { return this.make(n).v > 0; }')), { 'Boxes.ok': 'now needs its object as this' });
  assert.deepEqual(changed(base.replace('put(b) { all.push(b);', 'put(b) { b.v += 1; all.push(b);')), { 'Boxes.put': 'arguments written into changed' });
  assert.deepEqual(changed(base.replace('ok(n) { return n > 0; }', "ok(n) { console.error('asked'); return n > 0; }")), { 'Boxes.ok': 'channels, settings or files changed' });
  // A class instance where plain data was: every item that hands back a Box, and the kind Box itself.
  const inst = changed(`class BoxImpl {\n  /** @type {number} */\n  #v;\n  /** @param {number} n */\n  constructor(n) { this.#v = n; }\n  get v() { return this.#v; }\n}\n${base.replace('make(n) { return { v: n }; }', '/** @param {number} n */ make(n) { return new BoxImpl(n); }')}`);
  assert.equal(inst.Box, 'plain data or instance changed');
  assert.equal(inst['Boxes.make'], 'plain data or instance changed');
  // A type error in the item's code counts as a change.
  assert.deepEqual(changed(base.replace('ok(n) { return n > 0; }', "ok(n) { return n > 0 ? 'yes' : false; }")), { 'Boxes.ok': 'type error in its code' });
});

test('a change of meaning ARCH names in the job block, or the pull request declares in its meaning comment, is a changed item; it adds, never removes', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  // Its code changes formatDay in no way the means show.
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 31', " + ''") });
  // The merged job is dates': ARCH named formatDay in its block; the job declared parseDay in its meaning comment.
  gh.addComment('o/product', 7, block(JOB_MARK, { module: 'dates', work: ['R1'], kind: 'ordinary', meaning: [{ item: 'formatDay', line: 'the day of the month; the day of the year' }] }));
  gh.addComment('o/product', 7, block(MEANING_MARK, { meaning: [{ item: 'parseDay', line: 'a day of the month; a day of the year' }] }));
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, /ARCH's placed work names a change of meaning: dates formatDay \(the day of the month; the day of the year\)/);
  assert.match(text, /the pull request declares a change of meaning: dates parseDay/);
  assert.match(text, /dates formatDay: meaning changed \[found by ARCH's placed work\] -> tells its users\n {6}meaning: the day of the month; the day of the year/);
  assert.match(text, /dates parseDay: meaning changed \[found by the pull request's declaration\]/);
  assert.deepEqual(waitingWork(gh).work.map((w) => w.module), ['orders', 'report']);
  const r = noticeReasons(gh, 'o/product', { module: 'report', kind: 'notice', from: 'dates', merged: 7 });
  assert.deepEqual(r.map((x) => [x.item, x.found, x.why]), [['formatDay', 'named', 'the day of the month; the day of the year']]);
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

// civicsmith, 26 Nov 2026: the notices of a conversion of an early provider, written as one text, passed the language's
// longest string ("RangeError: Invalid string length"): each told module's reasons carried the changed item's whole
// before and after. They now come back as JSON lines, each item's before and after once.
test('the reading\'s notices come back as JSON lines, each changed item\'s before and after once, and read back as they were', () => {
  const big = { accepts: `(arg0: { ${'f: string; '.repeat(2000)}})`, bounds: ['n: whole number, 1 to 31'] };
  const after = { accepts: big.accepts, bounds: ['n: whole number, 1 to 30'] };
  const c = { module: 'dates', item: 'parseDay', found: 'means', changes: ['bound changed'], tells: true, why: null, words: 'bound changed', before: big, after };
  const named = { module: 'dates', item: 'formatDay', found: 'named', changes: ['meaning changed'], tells: true, why: 'w; v', before: { meaning: 'w' }, after: { meaning: 'v' } };
  const reason = (x, user) => ({ module: 'dates', item: x.item, found: x.found, changes: x.changes, why: x.why, route: 'direct', places: [`src/${user}/index.mjs:3`], before: x.before, after: x.after });
  const users = ['orders', 'report', 'late', 'later'];
  const report = { provider: 'dates', reader: 'TypeScript 5.6.3', conversion: true, changed: [c, named], fresh: [], summary: 's',
    told: [...users.map((u) => ({ user: u, reasons: [reason(c, u), reason(named, u)] })),
      // a reason whose before and after are its own (not the changed item's) is written as it is
      { user: 'own', reasons: [{ ...reason(c, 'own'), before: { bounds: ['x'] }, after: { bounds: ['y'] } }] },
      { user: 'none', reasons: [{ module: 'dates', items: ['parseDay'], found: 'any change', changes: [], why: 'none has no uses file yet and imports dates', noUsesFile: 'n' }] }] };
  const lines = [...noticeLines(report)];
  assert.equal(lines.length, 1 + 2 + users.length + 2);
  // the large means is written once, on the changed item's line
  assert.equal(lines.filter((l) => l.includes('f: string; f: string')).length, 1);
  assert.ok(Math.max(...lines.map((l) => l.length)) < 2 * JSON.stringify(c).length);
  const file = join(mkdtempSync(join(tmpdir(), 'p4-lines-')), 'notices.jsonl');
  writeFileSync(file, lines.map((l) => `${l}\n`).join(''));
  const [back] = readNoticeLines(file);
  // the same report, written the same, key order included
  assert.equal(JSON.stringify(back), JSON.stringify(report));
  assert.deepEqual(back, report);
  // each reason holds the changed item's own before and after, not a copy for each told module
  assert.ok(back.told.slice(0, users.length).every((t) => t.reasons[0].before === back.changed[0].before && t.reasons[1].after === back.changed[1].after));
  // two notices in one file (a merge that changed two modules), read in order
  writeFileSync(file, [...noticeLines(report), ...noticeLines({ ...report, provider: 'orders', told: [] })].map((l) => `${l}\n`).join(''));
  assert.deepEqual(readNoticeLines(file).map((r) => [r.provider, r.told.length]), [['dates', 6], ['orders', 0]]);
});

test('JSON lines are read a part at a time, a line across parts and characters of more than one byte included', () => {
  const values = [{ a: 'é→'.repeat(50) }, { b: [1, 2, 3] }, { c: 'x' }, { d: '日本'.repeat(9) }];
  const file = join(mkdtempSync(join(tmpdir(), 'p4-lines-')), 'x.jsonl');
  writeFileSync(file, `${values.map((v) => JSON.stringify(v)).join('\n')}\n\n`);
  for (const size of [1, 5, 7, 64, 1 << 16]) {
    const got = [];
    readLines(file, (v) => got.push(v), size);
    assert.deepEqual(got, values, `part size ${size}`);
  }
  writeFileSync(file, values.map((v) => JSON.stringify(v)).join('\n'));
  const got = [];
  readLines(file, (v) => got.push(v), 3);
  assert.deepEqual(got, values);
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
  const reason = (i, size) => ({ module: 'dates', item: `e${i}`, found: ['its means'], changes: ['hands back differently'], why: 'w', places: [{ file: 'src/x.mjs', side: 'code', line: i }],
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
  // The reason too large on its own keeps its item, changes and places, which choose the related tests, but not its words.
  const [big, small] = read('idle');
  assert.deepEqual(big, { module: 'dates', item: 'e99', found: ['its means'], changes: ['hands back differently'], why: 'w', places: [{ file: 'src/x.mjs', side: 'code', line: 99 }], cut: 'its before and after are left out: too large for one comment' });
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
  assert.deepEqual(noticeReasons(gh, 'o/product', { module: 'orders', kind: 'notice', from: 'dates', merged: 9, uses: [{ module: 'dates', item: 'old' }] }), [{ module: 'dates', item: 'old' }]);
});

test('one user\'s reason too large for a comment even without its words is cut to one reason that runs the whole module, not refused', () => {
  // Design part 6, section 5: the tool refuses nothing for size. A reason whose places alone pass one comment.
  const huge = { module: 'dates', item: 'e1', changes: ['hands back differently'], places: Array.from({ length: 6000 }, (_, i) => ({ file: `src/orders/a-long-file-name-${i}.mjs`, side: 'code', line: i })), before: { handsBack: 'x' }, after: { handsBack: 'y' } };
  const small = { module: 'dates', item: 'e2', changes: ['removed'], places: [{ file: 'src/orders/index.mjs', side: 'code', line: 1 }] };
  const users = [['orders', [huge, small]], ['report', [small]]];
  const parts = noticeParts('dates', 7, users);
  for (const p of parts) assert.ok(block(NOTICE_MARK, p).length < NOTICE_LIMIT);
  const gh = fakeGitHub();
  writeNotice(gh, 'o/product', 7, 'dates', users);
  const read = (module) => noticeReasons(gh, 'o/product', { module, kind: 'notice', from: 'dates', merged: 7 });
  const [cut, kept] = read('orders');
  assert.deepEqual(cut, { module: 'dates', whole: 'a reason of orders in the notice from dates (pull request 7) is too large for one comment even without its before and after; the whole module\'s tests run' });
  assert.deepEqual(kept, small);
  assert.deepEqual(read('report'), [small]);
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
  assert.match(text, /Notice for a change to orders[^\n]*\nNo item's means changed; nobody is told\./);
});

test('accepting more tells its users (the owner\'s decision, "Who a change tells", item 3)', () => {
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
  const files = (opt, ret) => withUsesFiles({
    'process.json': config(),
    'process/modules/order.txt': 'p\nu\n',
    'process/modules/p.json': entry('p'),
    'process/modules/u.json': entry('u', ['p']),
    'src/p/index.mjs': p(opt, ret),
    'src/u/index.mjs': "import { make } from '../p/index.mjs';\n/** @returns {void} */\nexport function one() { make({ name: 'a' }); }\n",
  });
  const before = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  const more = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  const hidden = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  write(before, files('', 'number'));
  write(more, { ...files('', 'number'), 'src/p/index.mjs': p('; size?: number', 'number') });
  write(hidden, { ...files('', 'number'), 'src/p/index.mjs': p('; size?: number', 'string') });
  const a = notice(before, more, 'p');
  assert.deepEqual(a.changed.map((e) => `${e.item}: ${e.changes}: ${e.tells}`), ['make: accepts more: true']);
  assert.deepEqual(a.told.map((t) => t.user), ['u']);
  assert.deepEqual(a.told[0].reasons.map((r) => `${r.item}: ${r.changes}`), ['make: accepts more']);
  // What make hands back changed too, though its written form (a handle kind, by name) did not: Thing.size tells its own users.
  const b = notice(before, hidden, 'p');
  assert.deepEqual(b.changed.map((e) => `${e.item}: ${e.changes}: ${e.tells}`), ['Thing.size: hands back differently: true', 'make: accepts more: true']);
  assert.deepEqual(b.told.map((t) => t.user), ['u']);
});

test('an unknown kind becoming known tells no one; any other difference in the same item still tells', () => {
  // The owner's decision B of 25 Nov 2026, carried by decision C: where the reader read "anything" before and a comment
  // now states a kind, the running code is the same; nothing changed for a user.
  const root = mkdtempSync(join(tmpdir(), 'p4-known-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-known-'));
  const RAW = '\nexport function raw(x) { return x; }\n';
  const STATED = '\n/**\n * @param {string} x\n * @returns {string}\n */\nexport function raw(x) { return x; }\n';
  const plain = productFiles();
  plain['src/dates/index.mjs'] = DATES() + RAW;
  plain['src/orders/index.mjs'] = `import { raw } from '../dates/index.mjs';\n${ORDERS.split('\n').slice(1).join('\n')}\nexport const shown = () => raw('a');\n`.replace('export function orderDay', "import { parseDay } from '../dates/index.mjs';\nexport function orderDay");
  const files = withUsesFiles(plain);
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': DATES() + STATED });
  // No item changed; orders, whose code reads raw's answer as a value of unknown kind before the change (R1, a place
  // outside the standard), hears of any change to dates' files until it is converted, and only so.
  const only = (rep) => rep.told.every((t) => t.reasons.every((x) => x.outside));
  const r = notice(root, after, 'dates');
  assert.deepEqual(r.changed, []);
  assert.ok(only(r), JSON.stringify(r.told));
  // A stated parameter that is a union, the same.
  write(after, { ...files, 'src/dates/index.mjs': DATES() + '\n/**\n * @param {{n: number}|undefined} x\n * @returns {number|null}\n */\nexport function raw(x) { if (!x) return null; return x.n; }\n' });
  write(root, { ...files, 'src/dates/index.mjs': DATES() + '\nexport function raw(x) { if (!x) return null; return x.n; }\n' });
  const u = notice(root, after, 'dates');
  assert.deepEqual(u.changed, []);
  assert.ok(only(u), JSON.stringify(u.told));
  write(root, files);
  // With another change in the same item (a parameter newly required), that change still tells its users.
  write(after, { ...files, 'src/dates/index.mjs': DATES() + STATED.replace(' * @returns', ' * @param {number} y\n * @returns').replace('raw(x)', 'raw(x, y)') });
  const m = notice(root, after, 'dates');
  // Its code changed too, so what was "anything" and is now stated is no longer only described: it is a change as well.
  assert.deepEqual(m.changed.map((e) => `${e.item}: ${e.changes}`), ['raw: cannot stand in,hands back differently']);
  assert.ok(m.told.some((t) => t.user === 'orders' && t.reasons.some((x) => x.item === 'raw')));
});

test('a comment alone is not a change: an error the code already raised, newly stated, tells no one; one the code newly raises tells', () => {
  // civicsmith notify 1356: a first @throws told every user. The errors that can leave an item are worked out from its code.
  const root = mkdtempSync(join(tmpdir(), 'p4-raises-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-raises-'));
  const files = withUsesFiles({ ...productFiles(), 'src/orders/index.mjs': `${ORDERS}\nimport { raw } from '../dates/index.mjs';\nexport const shown = () => raw('a');\n`,
    'src/dates/index.mjs': `${DATES()}\n/** @param {string} x @returns {string} */\nexport function raw(x) { if (!x) throw new TypeError('x'); return x; }\n` });
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': `${DATES()}\n/**\n * @param {string} x\n * @returns {string}\n * @throws {TypeError} when x is empty\n */\nexport function raw(x) { if (!x) throw new TypeError('x'); return x; }\n` });
  assert.deepEqual(notice(root, after, 'dates').changed, []);
  write(after, { ...files, 'src/dates/index.mjs': `${DATES()}\n/** @param {string} x @returns {string} */\nexport function raw(x) { if (!x) throw Object.assign(new TypeError('x'), { code: 'EMPTY' }); return x; }\n` });
  const r = notice(root, after, 'dates');
  // orders' shown takes in raw's errors: a changed item of orders too
  assert.deepEqual(r.changed.map((e) => `${e.module} ${e.item}: ${e.changes}`), ['dates raw: errors that can leave it changed', 'orders shown: errors that can leave it changed']);
  assert.match(noticeText(r), /means: errors that can leave it changed: TypeError -> TypeError code EMPTY/);
  assert.deepEqual(r.told.map((t) => t.user), ['orders']);
});

test('a name two interface files export for two things is two items, each told to its own users (civicsmith test-support)', () => {
  const gen = (ret) => `/** @param {string} s @returns {${ret}} */\nexport function generate(s) { return ${ret === 'number' ? 's.length' : 's'}; }\n`;
  const files = (a, b) => ({
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nua\nub\n',
    'process/modules/p.json': entry('p', [], { public: ['src/p/a.mjs', 'src/p/b.mjs', 'src/p/index.mjs'] }),
    'process/modules/ua.json': entry('ua', ['p']),
    'process/modules/ub.json': entry('ub', ['p']),
    'src/p/a.mjs': a, 'src/p/b.mjs': b,
    // The same thing exported again from a second file stays one item.
    'src/p/index.mjs': "export { generate as make } from './a.mjs';\nexport { generate as make2 } from './a.mjs';\n",
    'src/ua/index.mjs': "import { generate } from '../p/a.mjs';\n/** @returns {string} */\nexport const one = () => generate('x');\n",
    'src/ub/index.mjs': "import { generate } from '../p/b.mjs';\n/** @returns {string} */\nexport const two = () => String(generate('x'));\n",
  });
  const root = mkdtempSync(join(tmpdir(), 'p4-same-'));
  const both = withUsesFiles(files(gen('string'), gen('string')));
  write(root, both);
  assert.deepEqual(Object.keys(moduleMeans(loadTree(root), 'p').items).sort(), ['make', 'make2', 'src/p/a.mjs:generate', 'src/p/b.mjs:generate']);
  const after = mkdtempSync(join(tmpdir(), 'p4-same-'));
  write(after, { ...both, 'src/p/a.mjs': gen('number') });
  const r = notice(root, after, 'p');
  assert.deepEqual(r.changed.map((e) => e.item).sort(), ['make', 'make2', 'src/p/a.mjs:generate']);
  assert.deepEqual(r.told.map((t) => t.user), ['ua']);
});

test('check prints each disagreement with file and line, and exits 1', () => {
  const files = baseFiles();
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
  // orders has no uses file yet: its declared uses are its imports, and report is later in the order.
  assert.match(text, /src\/orders\/index\.mjs:2 a use of a module that is not before this one: imports report, which is later in the order \(line 3 of the order file; orders is line 2\)/);
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

test('check: a use of a later module disagrees, from the uses file or, without one, from the imports; a place outside the standard that may refer to one is "cannot tell"', () => {
  // orders (line 2) reaches report (line 3) from a test file.
  const files = baseFiles();
  files['test/orders/index.test.mjs'] = `import { orderDay } from '../../src/orders/index.mjs';\nimport { show } from '../../src/report/index.mjs';\norderDay('3');\nshow(1);\n`;
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  // No uses file yet: its imports.
  assert.throws(() => checkCmd(ctx, 'orders', { _: [] }), /1 disagreement/);
  assert.match(out.join('\n'), /test\/orders\/index\.test\.mjs:2 a use of a module that is not before this one: imports report, which is later in the order \(line 3 of the order file; orders is line 2\): a module may use only modules before it/);
  // With its uses file, as the tool writes it: the order fault at its place; a place outside the standard that may
  // refer to report is "cannot tell"; a provider the order now puts after it disagrees as well.
  out.length = 0;
  commit(root, { 'process/modules/orders.uses.json': JSON.stringify({ module: 'orders', providers: ['dates'], uses: [],
    outside: [{ rule: 'S5', file: 'test/orders/index.test.mjs', side: 'test', line: 4, what: 'readFileSync of a path into report\'s folder', mayRefer: ['report'], waitsOn: 'report: an exported reader or accessor', tests: [] }],
    orderFaults: [{ provider: 'report', item: 'show', itemKind: 'function', type: 'call', file: 'test/orders/index.test.mjs', side: 'test', line: 4 }], copies: [] }) });
  assert.throws(() => checkCmd(ctx, 'orders', { _: [] }), /1 disagreement/);
  assert.match(out.join('\n'), /test\/orders\/index\.test\.mjs:4 a use of a module that is not before this one: uses report show \(call\), and report is later in the order/);
  assert.match(out.join('\n'), /cannot tell, not refused: test\/orders\/index\.test\.mjs:4 a place outside the coding standard \(S5\) that may refer to report, later in the order/);
  out.length = 0;
  commit(root, { 'process/modules/order.txt': 'orders\ndates\nreport\n' });
  assert.throws(() => checkCmd(ctx, 'orders', { _: [] }), /2 disagreement/);
  assert.match(out.join('\n'), /process\/modules\/orders\.uses\.json a use of a module that is not before this one: its uses file names dates, which is later in the order/);
  // An earlier module's use of an earlier one is untouched.
  out.length = 0;
  checkCmd(ctx, 'report', { _: [] });
  assert.doesNotMatch(out.join('\n'), /not before this one/);
});

test('check: what the reader cannot tell is said, never refused; rules of form are not taken', () => {
  const files = baseFiles();
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  assert.equal(checkCmd(ctx, 'report', { _: [] }), 0);
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
  const files = baseFiles();
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
  const files = baseFiles();
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
  const files = baseFiles();
  files['src/report/index.mjs'] = `import { formatDay } from '../dates/index.mjs';\n/** @param {number} n @returns {string} */\nexport const show = (n) => formatDay({ n });\nexport const big = ${terms};\n`;
  const root = makeRepo(files);
  const tree = loadTree(root);
  assert.equal(check(tree, 'report').refused, false);
  assert.ok(moduleMeans(tree, 'report').items.big);
  // Inside one function, the reader itself (TypeScript) follows such an expression by recursion: where it runs out of
  // stack, that file is "cannot tell", never a crash or a refusal.
  commit(root, { 'src/report/index.mjs': `${files['src/report/index.mjs']}export function many() { return show(1) + ${terms}; }\n` });
  const r = check(loadTree(root), 'report');
  assert.equal(r.refused, false);
  assert.match(r.cannotTell.find((c) => c.code === 'stack')?.why ?? '', /^the reader ran out of stack on this file/);
});

test('check, for a module with no uses file yet, reads require() of a written path and imports by the product\'s own package name, as imports', () => {
  const files = baseFiles();
  files['package.json'] = { name: 'shop', type: 'module' };
  // report's test reaches orders (earlier) by require and by the product's own name.
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
  // orders is earlier than report: both uses stand.
  assert.deepEqual(r.refusals, []);
  assert.ok(r.cannotTell.some((c) => c.at === 'test/report/index.test.mjs:6' && c.why === 'an import of a name the tool cannot read'));
  // From orders (line 2), an import of report (line 3) by the own name is refused as a later module.
  commit(root, { 'test/orders/index.test.mjs': `import { orderDay } from '../../src/orders/index.mjs';\nimport 'shop/src/report/index.mjs';\norderDay('3');\n` });
  r = check(loadTree(root), 'orders');
  assert.deepEqual(r.refusals.map((x) => `${x.at} ${x.text}`), ["test/orders/index.test.mjs:2 imports report, which is later in the order (line 3 of the order file; orders is line 2): a module may use only modules before it; if the use is needed, it is ARCH's to settle"]);
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
  const files = baseFiles();
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

test('a class member\'s own bound is in its means, and a changed one tells its users', () => {
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
  const files = withUsesFiles({ ...productFiles(), 'src/dates/index.mjs': cal('1 to 31'),
    'src/orders/index.mjs': `${ORDERS}import { Cal } from '../dates/index.mjs';\n/** @returns {number} */\nexport const first = () => new Cal().day(1) + Cal.max(2);\n` });
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': cal('1 to 30') });
  const l = moduleMeans(loadTree(root), 'dates').items;
  assert.deepEqual(l['Cal#day'].bounds, ['n: whole number, 1 to 31']);
  assert.deepEqual(l['Cal.max'].bounds, ['at most 1 to 31']);
  const r = notice(root, after, 'dates');
  assert.deepEqual(r.changed.map((e) => `${e.item}: ${e.changes}`), ['Cal#day: bound changed', 'Cal.max: bound changed']);
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons.map((x) => `${x.item}: ${x.changes}`)]), [['orders', ['Cal#day: bound changed', 'Cal.max: bound changed']]]);
});

test('a reason names its first six places and how many more, so the notice keeps a size; the related list reads them all from the uses file', () => {
  const root = mkdtempSync(join(tmpdir(), 'p4-six-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-six-'));
  const files = withUsesFiles({ ...productFiles(), 'src/orders/index.mjs': `${ORDERS}${Array.from({ length: 9 }, (_, i) => `export const v${i} = () => parseDay('${i}');\n`).join('')}` });
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': DATES('1 to 30') });
  const r = notice(root, after, 'dates');
  const p = r.told.find((t) => t.user === 'orders').reasons.find((x) => x.item === 'parseDay');
  // eleven places: the import, orderDay and the nine v<i>
  assert.deepEqual(p.places, ['src/orders/index.mjs:1 (top level)', 'src/orders/index.mjs:6 orderDay', 'src/orders/index.mjs:7 v0', 'src/orders/index.mjs:8 v1', 'src/orders/index.mjs:9 v2', 'src/orders/index.mjs:10 v3', 'and 5 more']);
  assert.match(noticeText(r), /uses dates parseDay \(bound changed; found by its means\) at src\/orders\/index\.mjs:1 \(top level\), [^\n]*src\/orders\/index\.mjs:10 v3, and 5 more/);
});

// ---- who is told, member by member (build text 5, section 6) ----

const KIND_P = ({ quote = '@property {number} total\n * @property {string} note', bound = '', counter = 'get(): number', box = '', total = '1', got = '1' } = {}) => `/**
 * @typedef {Object} Quote
 * ${quote}${bound ? `\n * @bound ${bound}` : ''}
 */
/** @returns {Quote} */
export function quote() { return /** @type {Quote} */ ({ total: ${total}, note: 'n' }); }
/** @typedef {{ ${counter} }} Counter */
/** @returns {Counter} */
export function counter() { return /** @type {Counter} */ ({ get: () => ${got} }); }
export class Box {
  constructor() { /** @type {number} */ this.w = 1; }
  /** @returns {number} */
  area() { return this.w; }${box}
}
`;
const KIND_USERS = {
  rd: "import { quote } from '../p/index.mjs';\n/** @returns {number} */\nexport const t = () => quote().total;\n",
  nt: "import { quote } from '../p/index.mjs';\n/** @returns {string} */\nexport const n = () => quote().note;\n",
  wh: "import { quote } from '../p/index.mjs';\n/** @returns {string} */\nexport const j = () => JSON.stringify(quote());\n",
  rf: "import { quote } from '../p/index.mjs';\n/** @returns {() => import('../p/index.mjs').Quote} */\nexport const f = () => quote;\n",
  c1: "import { counter } from '../p/index.mjs';\n/** @returns {number} */\nexport const g = () => counter().get();\n",
  c2: "import { counter } from '../p/index.mjs';\n/** @param {object} x @returns {object} */\nconst keep = (x) => x;\n/** @returns {string} */\nexport const k = () => typeof keep(counter());\n",
  b1: "import { Box } from '../p/index.mjs';\n/** @returns {number} */\nexport const a = () => new Box().area();\n",
  b2: "import { Box } from '../p/index.mjs';\n/** @returns {string} */\nexport const s = () => JSON.stringify(new Box());\n",
};
const kindProduct = (p = KIND_P()) => ({
  'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
  'process/modules/order.txt': `p\n${Object.keys(KIND_USERS).join('\n')}\n`,
  'process/modules/p.json': entry('p'),
  ...Object.fromEntries(Object.keys(KIND_USERS).map((m) => [`process/modules/${m}.json`, entry(m, ['p'])])),
  'src/p/index.mjs': p,
  ...Object.fromEntries(Object.entries(KIND_USERS).map(([m, text]) => [`src/${m}/index.mjs`, text])),
});
/** The notice for p's change to `after`, each told user with its reasons that name an item. */
function kindNotice(after, { files = withUsesFiles(kindProduct()), named = [] } = {}) {
  const b = mkdtempSync(join(tmpdir(), 'p4-member-')), a = mkdtempSync(join(tmpdir(), 'p4-member-'));
  write(b, files);
  write(a, { ...files, 'src/p/index.mjs': after });
  const r = notice(b, a, 'p', { named });
  return { r, told: Object.fromEntries(r.told.map((t) => [t.user, t.reasons.filter((x) => x.item).map((x) => x.item)]).filter(([, x]) => x.length)) };
}

test('a member added to a kind tells only its whole-value users; one removed, changed or made optional, its readers too; a change to the kind as a whole, every user', () => {
  // added: wh writes the whole value as text; rd and nt read one member each, which is as it was
  let n = kindNotice(KIND_P({ quote: '@property {number} total\n * @property {string} note\n * @property {number} extra' }));
  const q = n.r.changed.find((c) => c.item === 'Quote');
  assert.deepEqual(q.members, { added: ['extra'], removed: [], changed: [], optional: [], through: [] });
  // quote hands back Quote, and differs only inside it: its callers are told through Quote
  assert.deepEqual(n.r.changed.find((c) => c.item === 'quote').through, ['Quote']);
  assert.match(noticeText(n.r), /p quote: hands back differently \[found by its means\] -> tells its users through Quote/);
  assert.match(noticeText(n.r), /p Quote: [^\n]*-> tells the users its members reach\n[^\n]*\n {6}members: added extra/);
  // rf hands quote itself on: what it hands back is not listed where it is used, so rf hears of quote, and of Quote whole
  assert.deepEqual(n.told, { wh: ['Quote'], rf: ['Quote', 'quote'] });
  assert.deepEqual(n.r.told.find((t) => t.user === 'wh').reasons[0].members, { added: ['extra'] });
  // removed: its readers, and the whole value's users
  n = kindNotice(KIND_P({ quote: '@property {number} total' }));
  assert.deepEqual(n.told, { nt: ['Quote'], wh: ['Quote'], rf: ['Quote', 'quote'] });
  // made optional
  n = kindNotice(KIND_P({ quote: '@property {number} total\n * @property {string} [note]' }));
  assert.deepEqual(n.r.changed.find((c) => c.item === 'Quote').members.optional, ['note']);
  assert.deepEqual(n.told, { nt: ['Quote'], wh: ['Quote'], rf: ['Quote', 'quote'] });
  // changed
  n = kindNotice(KIND_P({ quote: '@property {string} total\n * @property {string} note', total: "'1'" }));
  assert.deepEqual(n.told, { rd: ['Quote'], wh: ['Quote'], rf: ['Quote', 'quote'] });
  // a bound line of the kind: not member by member, so every user of it and of quote, as before
  n = kindNotice(KIND_P({ bound: 'total: whole cents, 0 or more' }));
  assert.equal(n.r.changed.find((c) => c.item === 'Quote').members, undefined);
  assert.deepEqual(n.told, { rd: ['Quote', 'quote'], nt: ['Quote', 'quote'], wh: ['Quote', 'quote'], rf: ['Quote', 'quote'] });
});

test('a method added to a handle kind, or to a class, tells only the users of the whole value', () => {
  let n = kindNotice(KIND_P({ counter: 'get(): number, reset(): void' }));
  assert.deepEqual(n.r.changed.find((c) => c.item === 'Counter').members.added, ['reset']);
  assert.deepEqual(n.told, { c2: ['Counter'] });
  n = kindNotice(KIND_P({ box: '\n  /** @returns {number} */\n  scale() { return 2; }' }));
  assert.deepEqual(n.r.changed.find((c) => c.item === 'Box').members.added, ['scale']);
  assert.deepEqual(n.told, { b2: ['Box'] });
  // a method changed (an item of its own): its callers, and the users of the handle's whole value
  n = kindNotice(KIND_P({ counter: 'get(): string', got: "'1'" }));
  assert.deepEqual(n.told, { c1: ['Counter.get'], c2: ['Counter.get'] });
});

test('a uses file written before it said what each use does with the value reads as whole: its module is told as before', () => {
  const files = withUsesFiles(kindProduct());
  const old = { ...files['process/modules/rd.uses.json'] };
  old.uses = old.uses.map(({ value, member, ...u }) => u);
  const n = kindNotice(KIND_P({ quote: '@property {number} total\n * @property {string} note\n * @property {number} extra' }), { files: { ...files, 'process/modules/rd.uses.json': old } });
  assert.deepEqual(n.told, { rd: ['Quote', 'quote'], wh: ['Quote'], rf: ['Quote', 'quote'] });
});

test('a member of a kind that changed only inside another kind that changed member by member reaches only the whole value\'s uses', () => {
  const P = (extra) => `/** @typedef {{ total: number${extra} }} Quote */
/** @typedef {{ quote: Quote, n: number }} Order */
/** @returns {Order} */
export function order() { return { quote: /** @type {Quote} */ ({ total: 1 }), n: 1 }; }
`;
  const files = withUsesFiles({
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\no1\no2\n',
    'process/modules/p.json': entry('p'), 'process/modules/o1.json': entry('o1', ['p']), 'process/modules/o2.json': entry('o2', ['p']),
    'src/p/index.mjs': P(''),
    'src/o1/index.mjs': "import { order } from '../p/index.mjs';\n/** @returns {number} */\nexport const t = () => order().quote.total;\n",
    'src/o2/index.mjs': "import { order } from '../p/index.mjs';\n/** @returns {string} */\nexport const j = () => JSON.stringify(order());\n",
  });
  const n = kindNotice(P(', extra?: number'), { files });
  assert.deepEqual(n.r.changed.find((c) => c.item === 'Order').members, { added: [], removed: [], changed: [], optional: [], through: ['quote'] });
  assert.deepEqual(n.r.changed.find((c) => c.item === 'order').through, ['Order', 'Quote']);
  // o1 reads Order's quote and Quote's total, neither changed; o2 writes the whole Order as text
  assert.deepEqual(n.told, { o2: ['Order'] });
});

test('a change of meaning alone is not told to a module that only hands the value back to a later module that is told', () => {
  const base = {
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nmid\nlast\n',
    'process/modules/p.json': entry('p'), 'process/modules/mid.json': entry('mid', ['p']), 'process/modules/last.json': entry('last', ['mid', 'p']),
    'src/p/index.mjs': '/** @typedef {{ cents: number }} Price */\n/** @returns {Price} */\nexport function price() { return { cents: 1 }; }\n',
    'src/mid/index.mjs': "import { price } from '../p/index.mjs';\n/** @returns {import('../p/index.mjs').Price} */\nexport function cost() { const p = price(); if (!p) throw new Error('none'); return p; }\n",
    'src/last/index.mjs': "import { cost } from '../mid/index.mjs';\n/** @returns {number} */\nexport const c = () => cost().cents;\n",
  };
  const named = [{ item: 'Price', line: 'in cents; in euros', found: 'named' }];
  const told = (files) => kindNotice(files['src/p/index.mjs'], { files: withUsesFiles(files), named }).told;
  // mid only hands Price back from its export; last, which gets it through mid, reads it and is told
  assert.deepEqual(told(base), { last: ['Price'] });
  // no later module told of it through mid: mid is told
  assert.deepEqual(told({ ...base, 'src/last/index.mjs': 'export const c = 1;\n' }), { mid: ['Price'] });
  // mid reads it, or its tests assert it: told
  assert.deepEqual(told({ ...base, 'src/mid/index.mjs': `${base['src/mid/index.mjs']}/** @returns {string} */\nexport const show = () => String(price().cents);\n` }), { mid: ['Price'], last: ['Price'] });
  assert.deepEqual(told({ ...base, 'test/mid/index.test.mjs': "import assert from 'node:assert/strict';\nimport { cost } from '../../src/mid/index.mjs';\nassert.deepEqual(cost(), { cents: 1 });\n" }), { mid: ['Price'], last: ['Price'] });
  // a change of its means as well as its meaning is told to every user of it, as before
  const n = kindNotice('/** @typedef {{ cents: number, euros: number }} Price */\n/** @returns {Price} */\nexport function price() { return { cents: 1, euros: 0 }; }\n', { files: withUsesFiles(base), named });
  assert.deepEqual(Object.keys(n.told), ['mid', 'last']);
});

test('a kind relabelled as a middle module\'s own (S4) is a place there, and its readers hear of the original\'s changes through it', () => {
  const P = (field) => `/** @typedef {{ ${field}: number }} Amount */\n/** @param {number} n @returns {Amount} */\nexport function amount(n) { return { ${field}: n }; }\n`;
  const mid = (price) => `import { amount } from '../p/index.mjs';\n/** ${price} */\n/** @returns {Price} */\nexport function quote() { return amount(5); }\n`;
  const files = (price) => withUsesFiles({
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nmid\nlast\n',
    'process/modules/p.json': entry('p'), 'process/modules/mid.json': entry('mid', ['p']), 'process/modules/last.json': entry('last', ['mid']),
    'src/p/index.mjs': P('cents'),
    'src/mid/index.mjs': mid(price),
    'src/last/index.mjs': "import { quote } from '../mid/index.mjs';\n/** @returns {string} */\nexport const show = () => String(quote().cents);\n",
  });
  // mid hands an Amount back as Price, its own copy of the kind: an S4 place that names both kinds
  const copy = files('@typedef {{ cents: number }} Price');
  const place = copy['process/modules/mid.uses.json'].outside.find((o) => o.rule === 'S4');
  assert.deepEqual([place.item, place.relabels, place.mayRefer], ['Price', { provider: 'p', item: 'Amount' }, ['p']]);
  // last names only mid's Price; it reads p's Amount through it, and hears of Amount's change
  assert.ok(!copy['process/modules/last.uses.json'].uses.some((u) => u.provider === 'p'));
  let n = kindNotice(P('minor'), { files: copy });
  const through = n.r.told.find((t) => t.user === 'last').reasons.find((x) => x.item === 'Amount');
  assert.deepEqual([through.copy, through.route], ['mid Price', { via: 'mid', item: 'Price' }]);
  assert.match(noticeText(n.r), /uses p Amount through mid Price, a copy of it/);
  assert.ok(n.r.told.find((t) => t.user === 'mid').reasons.some((x) => x.outside?.startsWith('S4')));
  // Price kept to S4, written as the provider's kind: no place, and last names Amount itself
  const kept = files("@typedef {import('../p/index.mjs').Amount} Price");
  assert.ok(!kept['process/modules/mid.uses.json'].outside.some((o) => o.rule === 'S4' && o.relabels));
  n = kindNotice(P('minor'), { files: kept });
  assert.ok(n.told.last?.includes('Amount'));
  assert.equal(n.r.told.find((t) => t.user === 'last').reasons.find((x) => x.item === 'Amount').copy, undefined);
});

test('a user that builds a value of a handle kind, a test implementing it without naming it, hears of a change to any of its members', () => {
  const P = (ret, bound) => `/**\n * @typedef {Object} Clock\n * @property {() => ${ret}} now${bound ? `\n * @bound now: ${bound}` : ''}\n */\n/** @param {Clock} clock @returns {string} */\nexport function stamp(clock) { return String(clock.now()); }\n`;
  const files = withUsesFiles({
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nu\nh\n',
    'process/modules/p.json': entry('p'), 'process/modules/u.json': entry('u', ['p']), 'process/modules/h.json': entry('h', ['p']),
    'src/p/index.mjs': P('string', 'an instant'),
    'src/u/index.mjs': "import { stamp } from '../p/index.mjs';\n/** @returns {string} */\nexport const at = () => stamp({ now: () => 'x' });\n",
    'test/u/index.test.mjs': "import { stamp } from '../../src/p/index.mjs';\nstamp({ now: () => '2026-11-26T09:30:00.000Z' });\n",
    'src/h/index.mjs': "import { stamp } from '../p/index.mjs';\n/** @returns {number} */\nexport const n = () => stamp.length;\n",
  });
  // u converts its own values to Clock (it refers to both kinds, build text 2c): a use of the whole value
  assert.ok(files['process/modules/u.uses.json'].uses.some((u) => u.item === 'Clock' && u.type === 'conversion' && u.value === 'whole'));
  // Clock.now's bound line changed (X03): u is told; h, which only calls stamp, hears of stamp only where stamp changed
  assert.deepEqual(kindNotice(P('string', 'a day'), { files }).told, { u: ['Clock.now'] });
  // what it hands back changed
  assert.deepEqual(kindNotice(P('number', 'an instant'), { files }).told.u, ['Clock.now']);
});
