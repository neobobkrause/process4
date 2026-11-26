// A job's test record (design part 2, section 6; build text 5, section 5):
// one comment on the pull request, hidden mark <!-- process4-test-record -->, written by `p4 test` in the session that
// ran the tests (the job's, or ARCH's for a pull request that is not a job's), rewritten in place. GitHub's required
// run `module-tests` only reads it, with the job block and the job's record; `ready` and `merge` read them too.
//
// Its form:
// { "commit": "<the head commit the tests ran at>", "notice_seq": <the job block's notice_seq then, 0 if none>,
//   "scope": "whole module" | "related" | "nothing", "why": "<the scope's ground>", "modules": ["<module run>", ...],
//   "files": ["<test file>", ...],
//   "passed": <n>, "failed": <n>, "result": "pass" | "fail", "fails_total": <fail results across every run on this
//   pull request>, "written": "<UTC, 2026-11-24T20:00Z>" }
// `modules` names each module whose tests ran: with scope "whole module", each module whose whole tests ran on the
// merged result of the head into the base, which `notify` reads (a merge does not tell a module whose code or tests it
// changed where its record ran that module's whole tests on the merged result: design part 2, section 7).
import { parseBlock } from './github.mjs';

export const TEST_MARK = 'process4-test-record';

/** The test record among a pull request's comments: { data, id } or null. */
export function testRecordOf(comments) {
  for (const c of comments || []) {
    const b = parseBlock(c.body, TEST_MARK);
    if (b) return { data: b.data, id: c.id };
  }
  return null;
}

/** The job block's notice count: how many notices have reached the job while it was open (0 if none). */
export const noticeSeq = (block) => Number(block?.notice_seq ?? 0) || 0;

/**
 * The notices a job has dealt with without running its tests (design part 2, section 7, "What a told module does"):
 * where it found that the notices that reached it need no change, it records that in its own record, the job's record
 * (`push --notice-nothing` or `close --nothing-to-change`: `notice_needs_no_change` { notice_seq, why }, the count of
 * notices it answers, read from the job block when it recorded), and its recorded pass stands for the notices up to that
 * count, never for a later one. Only the job's session writes the job's record, and only ARCH's the job block (design
 * part 4, sections 4 and 11): the count is read from the job's record, never from the block. The count, 0 if none.
 */
export const noticesNeedingNoChange = (block, jobRecord = null) => {
  const x = Number(jobRecord?.notice_needs_no_change?.notice_seq) || 0;
  return x <= noticeSeq(block) ? x : 0;
};

/**
 * Whether a notice reached the job after the record's tests ran, and the job has not recorded that it needs no change:
 * the job block counts more notices than both. `jobRecord` is the job's record's data (`<!-- process4-job-record -->`).
 */
export const noticeAfterTests = (record, block, jobRecord = null) => Math.max(Number(record?.notice_seq) || 0, noticesNeedingNoChange(block, jobRecord)) < noticeSeq(block);

/**
 * Whether a pull request needs its test record: the one rule of `ready`, `results` and the required run's verdict
 * (build text 1, section 5; build text 1b, commands 4 and 14; build text 5, section 5). None is needed only where the
 * scope is nothing, every notice that reached the job is one its record says needs no change, and, for a told job, its
 * record says it found nothing to change (`nothing_to_change`, which stands in for its test record). `scope` is
 * decideScope's answer made with no related list (`related: false`), so a told job that changed running code always
 * needs its test record, even where its related list would be empty. Returns { needed, why }.
 */
export function recordNeed(scope, block, jobRecord = null) {
  if (scope.scope !== 'nothing') return { needed: true, why: `scope ${scope.scope}, because ${scope.why}` };
  if (noticeAfterTests(null, block, jobRecord)) return { needed: true, why: `scope nothing, but ${noticeSeq(block)} notice(s) reached the job, and its record says ${noticesNeedingNoChange(block, jobRecord)} need no change` };
  if (block?.kind === 'told' && !jobRecord?.nothing_to_change) return { needed: true, why: 'scope nothing, but a told job needs its test record, or its record that it found nothing to change (close --nothing-to-change)' };
  const said = block?.kind === 'told' ? `; the told job recorded that it found nothing to change (${jobRecord.nothing_to_change})`
    : noticeSeq(block) ? '; the job recorded that the notices that reached it need no change' : '';
  return { needed: false, why: `scope nothing, because ${scope.why}${said}` };
}

/**
 * Whether a record stands for a pull request's head: a pass at that commit, or at an earlier commit from which the head
 * differs only in the module's uses file (design part 2, section 6), made after every notice the job block holds that
 * the job has not recorded as needing no change. Returns { ok, why }. `record` is the record's data or null; `block` the
 * job block's data or null; `jobRecord` the job's record's data or null; `usesOnly(from, to)` says whether two commits
 * differ only in the module's uses file.
 */
export function recordStands(record, headSha, block = null, { usesOnly = () => false, jobRecord = null } = {}) {
  if (!record) return { ok: false, why: `no test record; run p4 test` };
  const at = record.commit === headSha ? null : usesOnly(record.commit, headSha) ? record.commit : undefined;
  if (at === undefined) return { ok: false, why: `the test record is for ${String(record.commit).slice(0, 10)}, not the head ${String(headSha).slice(0, 10)}; run p4 test` };
  if (noticeAfterTests(record, block, jobRecord)) return { ok: false, why: `a notice reached the job after its tests ran (notice ${noticeSeq(block)}, tests at ${Number(record.notice_seq) || 0}); deal with it and run p4 test` };
  if (record.result !== 'pass') return { ok: false, why: `the test record for ${String(record.commit).slice(0, 10)} is a fail (${record.failed} failed); fix and run p4 test` };
  return { ok: true, why: `pass recorded for ${String(at ?? headSha).slice(0, 10)}${at ? `, from which the head ${String(headSha).slice(0, 10)} differs only in the module's uses file` : ''}: ${record.passed} passed, scope ${record.scope}` };
}
