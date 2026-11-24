// A job's test record (the owner's decision of 24 Nov 2026, "the update plan as laid out"; build text 5, section 5):
// one comment on the pull request, hidden mark <!-- process4-test-record -->, written by `p4 test` in the session that
// ran the tests (the job's, or ARCH's for a pull request that is not a job's), rewritten in place. GitHub's required
// run `module-tests` only reads it; `ready` and `merge` read it too.
//
// Its form:
// { "commit": "<the head commit the tests ran at>", "notice_seq": <the job block's notice_seq then, 0 if none>,
//   "scope": "whole module" | "related" | "nothing", "why": "<the scope's ground>", "files": ["<test file>", ...],
//   "passed": <n>, "failed": <n>, "result": "pass" | "fail", "fails_total": <fail results across every run on this
//   pull request>, "written": "<UTC, 2026-11-24T20:00Z>" }
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
 * Whether a record stands for a pull request's head: a pass at that commit, made after every notice the job block
 * holds. Returns { ok, why }. `record` is the record's data or null; `block` the job block's data or null.
 */
export function recordStands(record, headSha, block = null) {
  if (!record) return { ok: false, why: `no test record; run p4 test` };
  if (record.commit !== headSha) return { ok: false, why: `the test record is for ${String(record.commit).slice(0, 10)}, not the head ${String(headSha).slice(0, 10)}; run p4 test` };
  if ((Number(record.notice_seq) || 0) < noticeSeq(block)) return { ok: false, why: `a notice reached the job after its tests ran (notice ${noticeSeq(block)}, tests at ${Number(record.notice_seq) || 0}); deal with it and run p4 test` };
  if (record.result !== 'pass') return { ok: false, why: `the test record for ${String(headSha).slice(0, 10)} is a fail (${record.failed} failed); fix and run p4 test` };
  return { ok: true, why: `pass recorded for ${String(headSha).slice(0, 10)}: ${record.passed} passed, scope ${record.scope}` };
}
