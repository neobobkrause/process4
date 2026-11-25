#!/usr/bin/env python3
"""Hand resolution of the rebase's conflicts (precision-26nov, step 1): each entry names a change, a file of its
overlay, and the text that replaces each conflict block of the merged file, in order; or edits (old -> new) applied
to the merged file after. Run after rebase.py; the changes it resolves are listed in hand.json, so that rebase.py
leaves them alone from then on.

Usage: python3 resolve.py   (applies every entry of resolutions.py whose file still holds conflict markers)
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from rebase import CONV, changes  # noqa: E402
from resolutions import R  # noqa: E402

BLOCK = re.compile(r'<<<<<<< converted\n.*?>>>>>>> change\n', re.S)


def main():
    conv = changes(CONV)
    hand = set(json.load(open(os.path.join(HERE, 'hand.json')))) if os.path.exists(os.path.join(HERE, 'hand.json')) else set()
    for cid, rel, blocks, edits in R:
        p = os.path.join(conv[cid][1], 'files', rel)
        s = open(p).read()
        n = len(BLOCK.findall(s))
        if blocks is not None:
            if n != len(blocks):
                if cid in hand and n == 0:
                    continue
                raise SystemExit(f'{cid} {rel}: {n} conflict blocks, {len(blocks)} resolutions')
            it = iter(blocks)
            s = BLOCK.sub(lambda m: next(it), s)
        for a, b in edits or []:
            if s.count(a) != 1:
                if cid in hand and a not in s:
                    continue
                raise SystemExit(f'{cid} {rel}: edit not found once: {a[:80]!r}')
            s = s.replace(a, b)
        if '<<<<<<<' in s or '>>>>>>>' in s:
            raise SystemExit(f'{cid} {rel}: markers left')
        open(p, 'w').write(s)
        hand.add(cid)
    json.dump(sorted(hand), open(os.path.join(HERE, 'hand.json'), 'w'), indent=1)
    print(f'{len(hand)} changes resolved by hand')


if __name__ == '__main__':
    main()
