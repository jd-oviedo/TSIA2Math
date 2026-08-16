#!/usr/bin/env python3
"""The PR.3.3 / PR.3.4 boundary, as an executable predicate rather than a reading.

    python3 scripts/check_joint_conditional_boundary.py            # check
    python3 scripts/check_joint_conditional_boundary.py --prove    # fault proofs

PR.3.3 asks for a JOINT probability across a multi-stage experiment. PR.3.4 asks
for a CONDITIONAL probability on a single already-observed population. The
distinction is load-bearing: `joint_reported_as_conditional` is only a
misconception because the item asked for a conditional and the student produced a
joint, so an item that cannot be assigned a side is a defect and not a judgement
call. A student cannot be expected to distinguish joint from conditional if the
item cannot.

WHY THIS FILE EXISTS RATHER THAN A PARAGRAPH SAYING THE BOUNDARY HOLDS
----------------------------------------------------------------------
The first version of this classifier was written, run once, agreed with the
content, and was believed. It flagged four items; all four were corrections to
the RULE, not to the content, which is the failure shape the handoff calls "a
harness that reports a result about itself". A classifier that has only ever been
amended toward agreement has never been shown able to disagree.

So `--prove` injects three faults into the real files and requires each to be
caught, and every injection asserts it landed IN THE EXTRACTED STEM LIST before
the classification is trusted. Presence in the file is not presence in the
scanned region.

THE TWO PREDICATES, and what is deliberately NOT in them
--------------------------------------------------------
`both` is NOT a joint marker. "18 own both" is set membership in one observed
population; "both are red" is the outcome of two draws. The first version keyed on
the word and misread PR.3.4 P10 as ambiguous. Only a STAGE establishes the joint
side: a repeated trial, or independent events combined.
"""
import re
import sys
from pathlib import Path

SRC = 'curriculum/source/tsia2-math/unit-5/{}.md'

# A multi-stage experiment: something is performed more than once, or independent
# events are combined. Never the bare word "both".
STAGES = re.compile(
    r'\band then\b|without replacement|put back|with replacement|at least one|'
    r'\b(two|three)\b\s+independent\s+(events|attempts)|all three occur|'
    r'\b(two|three)\b[^.?]*\b(drawn|rolled|dice|balls|marbles|cards|pens|items|chips)\b|'
    r'\bsecond\b|\bis flipped and\b|\bis spun and\b', re.I)

# A condition imposed on an already-observed population.
COND = re.compile(r'\bgiven that\b|\bamong (the|those)\b|\bof (the|those) who\b', re.I)

EXPECTED = {'PR.3.3': 'joint', 'PR.3.4': 'conditional'}


def stems(text):
    """Every item stem, practice and quiz, in the order a student meets them."""
    part2 = text.split('Part 2: Practice')[1].split('Part 4')[0]
    out = [('P' + m.group(1), m.group(2).strip())
           for m in re.finditer(r'^\s*(\d{1,2})\.\s+(.*?)$', part2, re.M)
           if 'A)' not in m.group(2)]
    quiz = part2.split('Part 3: Mini Quiz')[1]
    out += [('Q' + m.group(1), m.group(2).strip())
            for m in re.finditer(r'\*\*Item (\d)\*\*\s*\n+(?:.*\n)*?\s*([^\n\-|].*?\?)\s*\n', quiz)]
    return out


def side(stem):
    c, j = bool(COND.search(stem)), bool(STAGES.search(stem))
    if c and j:
        return 'AMBIGUOUS'        # satisfies both -> the item cannot say which it wants
    if c:
        return 'conditional'
    if j:
        return 'joint'
    return 'UNCLASSIFIED'         # satisfies neither -> no side can be assigned


def classify(topic, text):
    """Returns (rows, offside). offside is every item not on the topic's side."""
    rows = [(tag, side(s), s) for tag, s in stems(text)]
    return rows, [(t, sd) for t, sd, _ in rows if sd != EXPECTED[topic]]


def check(verbose=True):
    ok = True
    for topic in EXPECTED:
        rows, bad = classify(topic, Path(SRC.format(topic)).read_text())
        if verbose:
            print(f'{topic}: {len(rows)} stems, expected {EXPECTED[topic]:<11} '
                  f'off-side/ambiguous: {bad or "none"}')
        ok &= not bad and len(rows) == 14
    return ok


# --------------------------------------------------------------------------
# Fault proofs. Each injection is asserted present in the EXTRACTED STEMS, not
# merely in the file, before its classification is trusted.
# --------------------------------------------------------------------------
FAULTS = [
    # (label, topic, original stem substring, replacement, what must be caught)
    ('satisfies BOTH predicates (two-way table framed as a sequential draw)',
     'PR.3.4',
     'What is the probability that a student passed, given that they studied?',
     'Two students are drawn without replacement. What is the probability that '
     'the second one passed, given that they studied?',
     'AMBIGUOUS'),
    ('satisfies NEITHER predicate (no condition, no stage)',
     'PR.3.4',
     'What is the probability that a student failed, given that they did not study?',
     'What is the total number of students in the table?',
     'UNCLASSIFIED'),
    ('a real conditional stem minimally edited into PR.3.3 framing',
     'PR.3.4',
     'What is the probability that a student takes the bus, given that they are a junior?',
     'Two students are drawn without replacement. What is the probability that both take the bus?',
     'joint'),
]


def prove():
    print('CONTROL (unmodified files, must pass or every fault below proves nothing)')
    clean = check()
    print(f'  [{"PASS" if clean else "PROOF FAILED"}] control: boundary holds on the real files\n')
    if not clean:
        return False

    print('FAULT INJECTIONS (the classifier must flag each one)')
    ok = True
    for label, topic, old, new, expect in FAULTS:
        text = Path(SRC.format(topic)).read_text()
        assert old in text, f'{label}: target absent from the file, injection would be a no-op'
        # The injection must land where the classifier actually reads.
        assert any(old == s for _, s in stems(text)), \
            f'{label}: target is in the file but is NOT an extracted stem'
        faulted = text.replace(old, new, 1)
        extracted = [s for _, s in stems(faulted)]
        assert new in extracted, f'{label}: faulted stem did not survive extraction'
        assert old not in extracted, f'{label}: original stem still present, replace was a no-op'

        rows, bad = classify(topic, faulted)
        got = next(sd for tag, sd, s in rows if s == new)
        caught = bool(bad) and got == expect
        ok &= caught
        print(f'  [{"PASS" if caught else "PROOF FAILED"}] {label}')
        print(f'        classified {got}, expected {expect}; flagged off-side: {bad or "NONE"}')

    print(f'\nRESULT: {"the classifier can fail, and does" if ok else "A CONTROL CAME BACK CLEAN"}')
    return ok


if __name__ == '__main__':
    if '--prove' in sys.argv:
        sys.exit(0 if prove() else 1)
    good = check()
    print('\nBOUNDARY HOLDS: every item sits on exactly one side, and no item on '
          'either\nside satisfies the other side\'s predicate.' if good
          else '\nBOUNDARY DOES NOT HOLD')
    sys.exit(0 if good else 1)
