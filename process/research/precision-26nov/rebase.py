#!/usr/bin/env python3
"""Rebases the notice proof's recorded changes onto the converted product (precision-26nov, step 1).

For each change, and each file its overlay writes: the change's diff against the original product file (as it stood
before the change, its setups applied) is applied to the converted file (its converted setups applied), by
`git merge-file`. A file that conversion left alone is taken as the change wrote it. A change whose converted overlay
is already written by hand (listed in HAND) is left as it is. The report lists each file merged with conflicts, each
new file, and each hand-kept change.

Usage: python3 rebase.py [--only <id>...]   (run from anywhere; paths are relative to this file)
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
ORIG = os.path.join(ROOT, 'tool', 'test', 'fixtures', 'notice-proof')
CONV = os.path.join(HERE, 'converted-proof')
HAND = set(json.load(open(os.path.join(HERE, 'hand.json')))) if os.path.exists(os.path.join(HERE, 'hand.json')) else set()


def changes(base):
    out = {}
    for series in sorted(os.listdir(os.path.join(base, 'changes'))):
        for cid in sorted(os.listdir(os.path.join(base, 'changes', series))):
            d = os.path.join(base, 'changes', series, cid)
            if os.path.isdir(d):
                out[cid] = (series, d)
    return out


def files_of(d):
    root = os.path.join(d, 'files')
    out = []
    for dp, _, fs in os.walk(root):
        for f in fs:
            out.append(os.path.relpath(os.path.join(dp, f), root))
    return sorted(out)


def copy_dir(a, b):
    for dp, _, fs in os.walk(a):
        for f in fs:
            src = os.path.join(dp, f)
            dst = os.path.join(b, os.path.relpath(src, a))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(src, dst)


def apply(change_dir, tree):
    if os.path.isdir(os.path.join(change_dir, 'files')):
        copy_dir(os.path.join(change_dir, 'files'), tree)
    cj = json.load(open(os.path.join(change_dir, 'change.json')))
    for rel in cj.get('delete', []):
        p = os.path.join(tree, rel)
        if os.path.exists(p):
            os.remove(p)


def before_tree(base, cid, series, cj, into):
    shutil.copytree(os.path.join(base, 'product'), into)
    allc = changes(base)
    for pre in cj.get('before', []):
        s, i = pre.split('/') if '/' in pre else (series, pre)
        apply(allc[i][1], into)


def main():
    only = sys.argv[sys.argv.index('--only') + 1:] if '--only' in sys.argv else None
    orig = changes(ORIG)
    report = {'conflicts': [], 'new': [], 'untouched': [], 'merged': [], 'hand': []}
    # setups first: a change's converted setups must exist before it is rebased
    order, seen = [], set()

    def visit(c):
        if c in seen:
            return
        seen.add(c)
        for pre in json.load(open(os.path.join(orig[c][1], 'change.json'))).get('before', []):
            visit(pre.split('/')[-1])
        order.append(c)
    for c in sorted(orig, key=lambda c: (orig[c][0] != 'setups', c)):
        visit(c)
    for cid in order:
        if only and cid not in only:
            continue
        series, d = orig[cid]
        out = os.path.join(CONV, 'changes', series, cid)
        cj = json.load(open(os.path.join(d, 'change.json')))
        if cid in HAND:
            report['hand'].append(cid)
            continue
        if os.path.exists(out):
            shutil.rmtree(out)
        os.makedirs(out)
        shutil.copyfile(os.path.join(d, 'change.json'), os.path.join(out, 'change.json'))
        with tempfile.TemporaryDirectory() as tmp:
            ob, cb = os.path.join(tmp, 'ob'), os.path.join(tmp, 'cb')
            before_tree(ORIG, cid, series, cj, ob)
            before_tree(CONV, cid, series, cj, cb)
            for rel in files_of(d):
                theirs = os.path.join(d, 'files', rel)
                base, mine = os.path.join(ob, rel), os.path.join(cb, rel)
                dst = os.path.join(out, 'files', rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                if not os.path.exists(base) or not os.path.exists(mine):
                    shutil.copyfile(theirs, dst)
                    report['new'].append(f'{cid} {rel}')
                    continue
                if open(base, 'rb').read() == open(mine, 'rb').read():
                    shutil.copyfile(theirs, dst)
                    report['untouched'].append(f'{cid} {rel}')
                    continue
                r = subprocess.run(['git', 'merge-file', '-p', '-L', 'converted', '-L', 'original', '-L', 'change', mine, base, theirs],
                                   capture_output=True)
                open(dst, 'wb').write(r.stdout)
                (report['conflicts'] if r.returncode else report['merged']).append(f'{cid} {rel}' + (f' ({r.returncode})' if r.returncode else ''))
    for k, v in report.items():
        print(f'{k}: {len(v)}')
        if k in ('conflicts', 'new', 'hand'):
            for x in v:
                print('  ', x)


if __name__ == '__main__':
    main()
