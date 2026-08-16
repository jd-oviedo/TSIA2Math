#!/usr/bin/env python3
"""Pass 3 of the distractor ledger: recompute every arithmetic claim written in
rationale prose, and ASSERT THE COVERAGE rather than infer it from a clean exit.

    python3 scripts/check_rationale_arithmetic.py curriculum/source/tsia2-math/unit-5/PR.3.2.md

Why coverage is asserted here instead of assumed
------------------------------------------------
The first two versions of this check were a list of narrow regexes, one per
phrasing that happened to appear in the topic being written. Both reported "all
claims recompute correctly" while silently skipping whole shapes:

  * on PR.2.3 it parsed 47 of 56 claims, skipping every "21 times 4 = 84" and
    "(30 + 20) / 2 = 25" -- the topic's two dominant forms
  * each miss was found by hand, and the fix was to add another regex, which
    only moved the blind spot to the next unseen phrasing

A checker that processes a subset of its input and exits zero is indistinguishable
from one that processed all of it. So this version does not enumerate phrasings.
It normalises the prose into arithmetic, finds everything SHAPED like a claim, and
fails when a claim-shaped string cannot be evaluated. Adding a new phrasing to the
house style now breaks the check loudly instead of quietly reducing its coverage.

A claim is an arithmetic run -- at least two numbers and at least one operator --
sitting immediately left of an `=` and a number. `x = 92` is not a claim (no
operator, nothing to verify). `2300 / 25 = 92` is.
"""
import json
import re
import sys
from fractions import Fraction as F
from pathlib import Path

# Prose spellings that are arithmetic. Applied before anything is parsed, so the
# parser never has to know they exist.
#
# ORDER MATTERS. The first rule handles "7700 over 100, giving 77", where the
# preceding `=` binds to 7700 alone and NOT to the quotient. Left to the generic
# "over" rule, "sum = 7700 over 100, giving 77" reads as a single chain claiming
# sum == 7700/100, which is false for every correct item in the course. It is
# rewritten into two standalone claims, repeating the numerator, and terminated
# with `;` so neither chains into its neighbour.
WORD_FORMS = [
    (r'(\d+)\s+over\s+(\d+)\s*,?\s*(?:giving|which is)\s+(-?\d+)', r'\1 ; \1 / \2 = \3 ;'),
    (r',?\s+which is\s+', ' = '),
    # NB: no generic "giving" -> "=" rule. "multiplies the mean by 3, giving
    # 48 - 45 = 3" would chain the unrelated 3 from "by 3" into the claim and
    # report a false mismatch. Leaving "giving" as a word ends the arithmetic run
    # and lets "48 - 45 = 3" stand as its own claim, which is what it is.
    (r'\s+times\s+', ' * '),
    (r'\s+over\s+', ' / '),
    (r'\s+plus\s+', ' + '),
    (r'\s+minus\s+', ' - '),
]


def balance(run):
    """Drop brackets the run does not close.

    Rationales are written as English parentheticals, so an arithmetic run at the
    end of one absorbs the sentence's own closing bracket: "giving 48 - 45 = 3)".
    That is a punctuation artefact, not a malformed claim, and treating it as a
    parse failure buries the real gaps under noise.
    """
    depth = 0
    out = []
    for ch in run:
        if ch == '(':
            depth += 1
        elif ch == ')':
            if depth == 0:
                continue
            depth -= 1
        out.append(ch)
    s = ''.join(out)
    while depth > 0 and '(' in s:                # unclosed opener, drop the tail
        s = s[:s.rfind('(')]
        depth -= 1
    return s.strip()

# An arithmetic run: digits, operators, brackets, spaces. Nothing else. It may
# open with brackets, so the run is anchored on `(` or a digit -- anchoring on a
# digit alone truncates "(8300 - 25(80)) / 75" to "8300 - 25(80)) / 75", which
# then fails to evaluate on an unmatched bracket. That is a coverage gap that
# looks like a parse error, and it is exactly what this check exists to surface.
RUN = r'\(*\s*[\d][\d\s\+\-\*/\(\)\.]*'
# A chain: run = run = run ... Written as a chain rather than a single equality
# because the house style simplifies in steps, and "(8300 - 25(80)) / 75 =
# 6300 / 75 = 84" compared pairwise against its first right-hand side reads as a
# mismatch when every step of it is true.
CHAIN = re.compile(rf'({RUN}(?:=\s*{RUN})+)')


def normalise(prose):
    s = prose
    for pat, rep in WORD_FORMS:
        s = re.sub(pat, rep, s)
    # implicit multiplication: 50(70) -> 50*(70)
    s = re.sub(r'(\d)\s*\(', r'\1*(', s)
    return s


def is_claim(run):
    """At least two numbers and at least one operator."""
    return len(re.findall(r'\d+(?:\.\d+)?', run)) >= 2 and re.search(r'[\+\-\*/]', run)


def main(path):
    text = Path(path).read_text()
    encountered = parsed = 0
    failures = []

    for m in re.finditer(r'```json\s*(.*?)```', text, re.S):
        try:
            obj = json.loads('{' + m.group(1).strip().rstrip(',') + '}')
        except Exception as e:                                    # noqa: BLE001
            failures.append(f'unparseable json block: {e}')
            continue
        for letter, prose in (obj.get('distractor_logic') or {}).items():
            s = normalise(prose)
            for chain in CHAIN.findall(s):
                parts = [balance(p) for p in chain.split('=')]
                if any(not p for p in parts):
                    continue
                # A chain is a claim only if some segment actually computes
                # something. "x = 92" and bare restatements verify nothing.
                if not any(is_claim(p) for p in parts):
                    continue
                encountered += 1
                values, broke = [], None
                for p in parts:
                    try:
                        values.append(F(eval(p, {'__builtins__': {}}, {})))  # noqa: S307
                    except Exception as e:                        # noqa: BLE001
                        broke = f'{p!r} ({e})'
                        break
                if broke:
                    failures.append(
                        f'{letter}: UNPARSED claim-shaped string {broke} in {chain.strip()!r}. '
                        f'Coverage gap, not a content error.')
                    continue
                parsed += 1
                if len(set(values)) != 1:
                    failures.append(
                        f'{letter}: {chain.strip()} does not hold, segments evaluate to '
                        f'{[str(v) for v in values]}')

    print(f'{path}')
    print(f'  claim-shaped strings encountered: {encountered}')
    print(f'  successfully parsed and checked:  {parsed}')
    if encountered:
        print(f'  coverage: {parsed / encountered:.0%}')
    if failures:
        print(f'  FAILURES: {len(failures)}')
        for f in failures:
            print(f'    {f}')
        return 1
    if parsed < encountered:
        print('  FAIL: some claim-shaped strings went unparsed')
        return 1
    print('  all claims recompute correctly, and none went unparsed')
    return 0


if __name__ == '__main__':
    sys.exit(max(main(p) for p in sys.argv[1:]))
