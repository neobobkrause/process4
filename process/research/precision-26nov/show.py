#!/usr/bin/env python3
"""Shows, for one change (or every one), each overlaid file's diff on the original proof and on the converted copy,
and says where the lines they add and remove differ (a rebase to review by hand).

Usage: python3 show.py <change id>... | --all [--brief]
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rebase import ORIG, CONV, changes, files_of, before_tree  # noqa: E402


def diff(a, b):
    r = subprocess.run(['diff', '-u', a if os.path.exists(a) else '/dev/null', b], capture_output=True, text=True)
    return r.stdout


def changed_lines(d):
    return sorted(l for l in d.splitlines() if l[:1] in '+-' and not l.startswith(('+++', '---')))


def main():
    brief = '--brief' in sys.argv
    ids = [a for a in sys.argv[1:] if not a.startswith('--')]
    orig, conv = changes(ORIG), changes(CONV)
    if '--all' in sys.argv:
        ids = sorted(conv)
    for cid in ids:
        series, d = orig[cid]
        cd = conv[cid][1]
        cj = json.load(open(os.path.join(d, 'change.json')))
        with tempfile.TemporaryDirectory() as tmp:
            ob, cb = os.path.join(tmp, 'ob'), os.path.join(tmp, 'cb')
            before_tree(ORIG, cid, series, cj, ob)
            before_tree(CONV, cid, series, cj, cb)
            for rel in sorted(set(files_of(d)) | set(files_of(cd))):
                do = diff(os.path.join(ob, rel), os.path.join(d, 'files', rel))
                dc = diff(os.path.join(cb, rel), os.path.join(cd, 'files', rel))
                same = changed_lines(do) == changed_lines(dc)
                if brief:
                    if not same:
                        print(f'{cid} {rel}: differs')
                    continue
                print(f'===== {cid} {rel}: {"same lines" if same else "LINES DIFFER"}')
                if not same:
                    print('--- original change'); print(do)
                    print('--- converted change'); print(dc)


if __name__ == '__main__':
    main()
