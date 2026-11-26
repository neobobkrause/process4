// The readers of a rewrite of many uses files (usescmd.mjs, writeUsesFiles), each a process of its own, so that a push
// that rewrites every module's uses file reads them on several cores at once (civicsmith ARCH #28: such a push took an
// hour). Reads, on standard input, { root, commit, shares, out }: the product written out, the commit it is, the
// modules to read in each reader, and the folder each module's uses file is written into as <module>.json. Started
// without `share`, it starts one reader per share and waits for them all; a reader reads its share one module after
// another, its programs sharing what they read of the files (notice/ts.mjs, whileFilesStay). A module a reader did not
// write is read again by the caller, so a reader's failure changes nothing that is written.
import { spawn } from 'node:child_process';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadTree } from './notice/model.mjs';
import { whileFilesStay } from './notice/ts.mjs';
import { usesData } from './usescmd.mjs';

const SELF = fileURLToPath(import.meta.url);

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const job = JSON.parse(readFileSync(0, 'utf8'));
  if (job.share) {
    const tree = loadTree(job.root);
    whileFilesStay(() => {
      for (const id of job.share) {
        const file = join(job.out, `${id}.json`);
        writeFileSync(`${file}.part`, JSON.stringify(usesData(tree, id, job.commit)));
        renameSync(`${file}.part`, file);
      }
    });
  } else {
    const codes = await Promise.all(job.shares.map((share) => new Promise((done) => {
      const c = spawn(process.execPath, [...process.execArgv, SELF], { stdio: ['pipe', 'ignore', 'inherit'] });
      c.on('error', () => done(1));
      c.on('exit', (code) => done(code ?? 1));
      c.stdin.end(JSON.stringify({ root: job.root, commit: job.commit, out: job.out, share }));
    })));
    process.exitCode = codes.some((c) => c !== 0) ? 1 : 0;
  }
}
