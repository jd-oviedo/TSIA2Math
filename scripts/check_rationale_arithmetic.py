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
    # The sentence's own full stop lands inside the run, because `.` is legal in
    # a decimal: "$\frac{8300}{100} = 83$." reduces to "... = 83 .". Trailing
    # dots and spaces are punctuation; a real decimal ends in a digit.
    s = re.sub(r'[\s.]+$', '', s)
    s = re.sub(r'^[\s.]+', '', s)
    return s.strip()

# An arithmetic run: digits, operators, brackets, spaces. Nothing else. It may
# open with brackets, so the run is anchored on `(` or a digit -- anchoring on a
# digit alone truncates "(8300 - 25(80)) / 75" to "8300 - 25(80)) / 75", which
# then fails to evaluate on an unmatched bracket. That is a coverage gap that
# looks like a parse error, and it is exactly what this check exists to surface.
RUN = r'-?\(*\s*[\d][\d\s\+\-\*/\(\)\.]*'
# A chain: run = run = run ... Written as a chain rather than a single equality
# because the house style simplifies in steps, and "(8300 - 25(80)) / 75 =
# 6300 / 75 = 84" compared pairwise against its first right-hand side reads as a
# mismatch when every step of it is true.
# The lookbehind keeps function application out. `f(5) = 3(5) - 4 = 11` would
# otherwise open a run at the `(` of `f(5)`, read it as the arithmetic value 5,
# and report a mismatch against 11 on a line that is perfectly correct. That
# false-positive class accounted for all 257 mismatches in the first course-wide
# scan, across function notation, P(A) and similar.
CHAIN = re.compile(rf'(?<![A-Za-z])({RUN}(?:=\s*{RUN})+)')


# Guided-notes examples and worked solutions write their arithmetic as LaTeX
# inside `$...$`, so it has to be reduced to plain arithmetic before any of the
# prose rules apply. These are the only constructs the house style uses for
# computation; anything else in a math span carries no digits and produces no
# claim.
def delatex(s):
    s = s.replace('\\left', '').replace('\\right', '')
    s = s.replace('\\times', '*').replace('\\cdot', '*').replace('\\div', '/')
    # A digit against a fraction is a MIXED NUMBER: 1\\frac{7}{8} is 1 + 7/8.
    # Reduced as implicit multiplication it becomes 7/8, and every mixed number
    # in the course reads as a mismatch.
    s = re.sub(r'(\d)\s*\\d?frac\{([^{}]*)\}\{([^{}]*)\}', r'(\1 + (\2)/(\3))', s)
    # \frac{a}{b} -> ((a)/(b)), innermost first so nesting resolves
    for _ in range(4):
        new = re.sub(r'\\d?frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s)
        if new == s:
            break
        s = new
    s = re.sub(r'\\text\{[^{}]*\}', ' ', s)
    s = re.sub(r'\\[a-zA-Z]+', ' ', s)       # any other command carries no value
    return s.replace('$', ' ').replace('\\%', ' ')


def normalise(prose):
    s = delatex(prose)
    # LaTeX thousands separator: 13{,}500 is one number.
    s = s.replace('{,}', '')
    # Exponents. b^{2} - 4ac and 2^{6} both carry real values.
    s = re.sub(r'\^\{(-?\d+)\}', r'**(\1)', s)
    s = re.sub(r'\^(-?\d+)', r'**(\1)', s)
    # Thousands separators: 13,500 is one number, not "13" followed by "500".
    # Left alone it truncates the run and reports "150 * 90 = 13".
    s = re.sub(r'(?<=\d),(?=\d\d\d\b)', '', s)
    # Function application is not arithmetic. f(5), g(x), P(A) all carry a
    # parenthesised argument that reads as a value: "f(5) = 3(5) - 4 = 11"
    # otherwise claims 5 == 11. The argument is removed before any run is matched.
    # A digit before the bracket is real implicit multiplication and is preserved.
    for _ in range(3):
        # Only a SHORT, purely symbolic argument counts as function application.
        # An unbounded [^()]* also matched the rationale's own parenthetical --
        # 'weights_swapped (attaches the 3 to the 60 ...)' reads as d(...) -- and
        # deleted the entire body, silently dropping PR.2.2 from 85 checked claims
        # to 53. Caught by the fault proof, not by reading the code.
        new_s = re.sub(r'(?<![\d)])([A-Za-z])\s*\(\s*[A-Za-z0-9\-]{1,4}(?:\s*,\s*[A-Za-z0-9\-]{1,4})?\s*\)', r'\1', s)
        if new_s == s:
            break
        s = new_s
    for pat, rep in WORD_FORMS:
        s = re.sub(pat, rep, s)
    # implicit multiplication: 50(70) -> 50*(70), and (3.14)(9) -> (3.14)*(9)
    s = re.sub(r'(\d)\s*\(', r'\1*(', s)
    s = re.sub(r'\)\s*\(', r')*(', s)
    return s


def is_claim(run):
    """At least two numbers and at least one operator."""
    return len(re.findall(r'\d+(?:\.\d+)?', run)) >= 2 and re.search(r'[\+\-\*/]', run)


def main(path):
    text = Path(path).read_text()
    encountered = parsed = unmodelled = 0
    failures = []
    per_region = {}

    # Two regions, and BOTH are checked. An earlier version read only the json
    # fences, which left the guided-notes worked examples and the Part 4 worked
    # solutions entirely unverified -- 44 of PR.2.3's 100 claim-shaped strings,
    # and precisely the arithmetic a student actually reads. Rationale prose is
    # authoring metadata; a worked solution is the lesson.
    regions = []
    for m in re.finditer(r'```json\s*(.*?)```', text, re.S):
        try:
            obj = json.loads('{' + m.group(1).strip().rstrip(',') + '}')
        except Exception as e:                                    # noqa: BLE001
            failures.append(f'unparseable json block: {e}')
            continue
        for letter, prose in (obj.get('distractor_logic') or {}).items():
            regions.append(('distractor_logic', letter, prose))

    # Everything that is not an authoring fence: guided notes, worked examples,
    # worked solutions. Line by line, so a failure can be located.
    body = re.sub(r'```json\s*.*?```', '', text, flags=re.S)
    # Each math span is its own region. Scanning a whole LINE merges independent
    # spans: "$40 - 30 = 10$ and $10 / 4$" chains into one false claim. A claim
    # never spans two `$...$` groups.
    for i, line in enumerate(body.split('\n'), 1):
        if not line.strip():
            continue
        spans = re.findall(r'\$\$[^$]*\$\$|\$[^$]+\$', line)
        for sp in spans:
            regions.append(('prose', f'line {i}', sp))
        if not spans:
            regions.append(('prose', f'line {i}', line))

    for region, letter, prose in regions:
        per_region.setdefault(region, [0, 0])
        s = normalise(prose)
        if '...' in prose or '\\approx' in prose or '\\overline' in prose:
            # Rounded or repeating decimals are not modelled. Counted and
            # reported rather than skipped, so the gap stays visible.
            unmodelled += 1
            continue
        for chain in CHAIN.findall(s):
            parts = [balance(p) for p in chain.split('=')]
            if any(not p for p in parts):
                continue
            # A chain is a claim only if some segment actually computes
            # something. "x = 92" and bare restatements verify nothing.
            if not any(is_claim(p) for p in parts):
                continue
            encountered += 1
            per_region[region][0] += 1
            values, broke = [], None
            for p in parts:
                try:
                    values.append(F(eval(p, {'__builtins__': {}}, {})))  # noqa: S307
                except Exception as e:                        # noqa: BLE001
                    broke = f'{p!r} ({e})'
                    break
            if broke:
                failures.append(
                    f'[{region} {letter}] UNPARSED claim-shaped string {broke} in '
                    f'{chain.strip()!r}. Coverage gap, not a content error.')
                continue
            parsed += 1
            per_region[region][1] += 1
            # Decimals are written to the precision the lesson shows, so exact
            # Fraction equality reports 2 * 3.14 * 20 == 125.6 as a mismatch:
            # the left side is an exact binary float and the right is a decimal
            # literal. Compare within the precision actually printed.
            def agree(vals):
                lo, hi = min(vals), max(vals)
                if lo == hi:
                    return True
                scale = max(abs(lo), abs(hi), F(1))
                return abs(hi - lo) <= scale * F(1, 10 ** 6)

            if not agree(values):
                failures.append(
                    f'[{region} {letter}] {chain.strip()} does not hold, segments '
                    f'evaluate to {[str(v) for v in values]}')

    print(f'{path}')
    print(f'  claim-shaped strings encountered: {encountered}')
    print(f'  successfully parsed and checked:  {parsed}')
    if encountered:
        print(f'  coverage: {parsed / encountered:.0%}')
    if unmodelled:
        print(f'  spans excluded, notation not modelled: {unmodelled}')
    for region in sorted(per_region):
        enc, par = per_region[region]
        print(f'    {region:<18} {par}/{enc}')
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
