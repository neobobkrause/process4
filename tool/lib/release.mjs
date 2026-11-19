// Stage 6: the release commands (build text 1b, commands 7 and 8; design part 3, section 6).
// A public release is prepared unpublished and published only on the owner's approval, typed in the
// session; a development release is a published pre-release made in one act and needs no approval.
import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fail } from './util.mjs';

// --file may be absent, one, or repeated; keep only the strings given.
const fileList = (v) => [].concat(v ?? []).filter((x) => typeof x === 'string');

// 7. release prepare <version> --notes <file> [--file <built file>]...
export function releasePrepare(ctx, version, a) {
  if (typeof version !== 'string' || !version.trim()) fail('name the version, e.g. release prepare 1.2.0 --notes <file>');
  if (typeof a.notes !== 'string' || !existsSync(a.notes)) fail('say --notes <file>');
  const assets = fileList(a.file);
  for (const f of assets) if (!existsSync(f)) fail(`--file ${f} does not exist`);
  const development = a.development === true || a.development === 'true';
  const rel = ctx.gh.createRelease(ctx.slug, {
    tag_name: version,
    target_commitish: 'main',
    name: version,
    body: readFileSync(a.notes, 'utf8'),
    draft: !development,
    prerelease: development,
  });
  for (const f of assets) { ctx.gh.uploadReleaseAsset(ctx.slug, rel, f); ctx.log(`attached ${basename(f)}`); }
  ctx.log(development
    ? `development release ${version} (a published pre-release with its tag): ${rel.html_url}`
    : `prepared release ${version} (unpublished, awaiting the owner's approval): ${rel.html_url}`);
  return 0;
}

// 8. release publish <version> --approval "<the owner's words>"
export function releasePublish(ctx, version, a) {
  if (typeof version !== 'string' || !version.trim()) fail('name the version, e.g. release publish 1.2.0 --approval "<the owner\'s words>"');
  if (typeof a.approval !== 'string' || !a.approval.trim()) fail('say --approval "<the owner\'s words>"');
  const rel = ctx.gh.releaseByTag(ctx.slug, version);
  if (!rel) fail(`there is no prepared release tagged ${version}`);
  const done = ctx.gh.updateRelease(ctx.slug, rel.id, { draft: false });
  ctx.log(`published release ${version}: ${done?.html_url || rel.html_url}`);
  // The owner's words are printed back and not judged by the tool (build text 1b, command 8).
  ctx.log(`the owner's approval, recorded not judged: ${a.approval}`);
  return 0;
}
