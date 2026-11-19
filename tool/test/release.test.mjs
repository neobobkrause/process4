import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { releasePrepare, releasePublish } from '../lib/release.mjs';
import { Fail } from '../lib/util.mjs';
import { ctxFor, fakeGitHub, makeRepo, write } from './helpers.mjs';

function setup() {
  const root = makeRepo();
  write(root, { 'notes.md': 'What changed: everything.\n', 'dist/app.js': 'console.log(1)\n', 'dist/app2.js': 'x\n' });
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  return { root, gh, ctx, out };
}

test('release prepare makes an unpublished draft release at main with the notes, and prints its address', () => {
  const { root, gh, ctx, out } = setup();
  assert.equal(releasePrepare(ctx, '1.2.0', { notes: join(root, 'notes.md') }), 0);
  const rel = gh.s.releases[0];
  assert.equal(rel.tag_name, '1.2.0');
  assert.equal(rel.name, '1.2.0');
  assert.equal(rel.target_commitish, 'main');
  assert.equal(rel.draft, true);
  assert.equal(rel.prerelease, false);
  assert.match(rel.body, /everything/);
  assert.ok(out.join('\n').includes(rel.html_url));
  assert.match(out.join('\n'), /unpublished, awaiting the owner's approval/);
});

test('release prepare --development makes a published pre-release with its tag', () => {
  const { root, gh, ctx, out } = setup();
  releasePrepare(ctx, '1.2.0-dev', { notes: join(root, 'notes.md'), development: true });
  const rel = gh.s.releases[0];
  assert.equal(rel.draft, false);
  assert.equal(rel.prerelease, true);
  assert.equal(rel.tag_name, '1.2.0-dev');
  assert.match(out.join('\n'), /development release 1\.2\.0-dev \(a published pre-release/);
});

test('release prepare attaches each --file as an asset named after the file', () => {
  const { root, gh, ctx, out } = setup();
  releasePrepare(ctx, '2.0.0', { notes: join(root, 'notes.md'), file: [join(root, 'dist/app.js'), join(root, 'dist/app2.js')] });
  assert.deepEqual(gh.s.releases[0].assets.map((a) => a.name).sort(), ['app.js', 'app2.js']);
  assert.match(out.join('\n'), /attached app\.js/);
  assert.match(out.join('\n'), /attached app2\.js/);
});

test('release prepare takes a single --file too', () => {
  const { root, gh, ctx } = setup();
  releasePrepare(ctx, '2.1.0', { notes: join(root, 'notes.md'), file: join(root, 'dist/app.js') });
  assert.deepEqual(gh.s.releases[0].assets.map((a) => a.name), ['app.js']);
});

test('release prepare needs a version, an existing notes file, and existing asset files', () => {
  const { root, ctx } = setup();
  assert.throws(() => releasePrepare(ctx, undefined, { notes: join(root, 'notes.md') }), Fail);
  assert.throws(() => releasePrepare(ctx, '  ', { notes: join(root, 'notes.md') }), Fail);
  assert.throws(() => releasePrepare(ctx, '1.0.0', {}), Fail);
  assert.throws(() => releasePrepare(ctx, '1.0.0', { notes: join(root, 'nope.md') }), Fail);
  assert.throws(() => releasePrepare(ctx, '1.0.0', { notes: join(root, 'notes.md'), file: join(root, 'dist/missing.js') }), Fail);
});

test('release publish sets the release live and prints the approval words back, unjudged', () => {
  const { root, gh } = setup();
  releasePrepare(ctxFor(root, gh).ctx, '1.0.0', { notes: join(root, 'notes.md') });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(releasePublish(ctx, '1.0.0', { approval: 'Decision: publish 1.0.0 — 20 Nov 2026' }), 0);
  assert.equal(gh.s.releases[0].draft, false);
  assert.ok(out.join('\n').includes('published release 1.0.0'));
  assert.match(out.join('\n'), /recorded not judged: Decision: publish 1\.0\.0 — 20 Nov 2026/);
});

test('release publish needs the approval words and an existing release of that version', () => {
  const { root, gh, ctx } = setup();
  assert.throws(() => releasePublish(ctx, '1.0.0', {}), Fail);
  releasePrepare(ctx, '1.0.0', { notes: join(root, 'notes.md') });
  assert.throws(() => releasePublish(ctx, '9.9.9', { approval: 'ok' }), Fail);
  assert.throws(() => releasePublish(ctx, undefined, { approval: 'ok' }), Fail);
});
