#!/usr/bin/env python3
"""
Every Part 5 gate, shown failing on faulted input. READ-ONLY.

    python3 scripts/faultproof_extra_practice_lint.py

A check that has never been observed failing is a check nobody knows the shape
of. Each case below takes the real GR.2.6 -- which is the one topic that has a
Part 5 -- breaks exactly one thing about it, runs the REAL gate over the result,
and requires the expected message to appear. The clean control runs first and
must produce nothing at all, so a case that "passes" because the whole file
stopped parsing is not mistaken for a working check.

The faulted copy keeps the filename GR.2.6.md on purpose. check_topic.py scopes
topic_specific misconception slugs by the file stem, so a temp file called
anything else fails four slug checks that have nothing to do with the fault
under test, and every case would go green for the wrong reason.

Nothing is written inside the repo: each variant lands in a temp directory and
is deleted.
"""
import io
import re
import shutil
import sys
import tempfile
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
sys.path.insert(0, str(ROOT / 'curriculum' / 'migrations'))

import check_topic  # noqa: E402
from lint_curriculum_source import lint_file, load_slugs  # noqa: E402

SOURCE = ROOT / 'curriculum' / 'source' / 'tsia2-math' / 'unit-3' / 'GR.2.6.md'
APPROVED, UNAPPROVED = load_slugs()


def run_gates(text):
    """(lint findings, check_topic output) for one variant of the topic."""
    tmp = Path(tempfile.mkdtemp(prefix='faultproof-'))
    try:
        path = tmp / 'GR.2.6.md'
        path.write_text(text, encoding='utf-8')
        try:
            findings = lint_file(path, APPROVED, UNAPPROVED)
        except Exception as exc:                      # a parse blow-up is a result
            findings = [('ERROR', f'lint_file raised: {exc}')]
        buffer = io.StringIO()
        try:
            with redirect_stdout(buffer):
                check_topic.main(str(path))
        except Exception as exc:
            buffer.write(f'check_topic raised: {exc}')
        return findings, buffer.getvalue()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ─── the faults ──────────────────────────────────────────────────────────────
#
# Each returns a mutated copy of the source. They mutate Part 5 and its answer
# key only -- a fault planted in Part 2 would prove nothing new, those gates
# have been in place all along.

def part5(text):
    """(before, part5_body, index) -- the Part 5 block, for surgery."""
    at = text.index('#### **Part 5: Extra Practice**')
    return text[:at], text[at:]


def fault_too_small(text):
    """Drop Part 5 down to two items, under EXTRA_PRACTICE_MIN."""
    head, body = part5(text)
    cut = body.index('**Proficient Level**')
    return head + body[:cut].rstrip() + '\n'


def fault_unbanded(text):
    """Strip the band headings out of Part 5, so no item carries a level."""
    head, body = part5(text)
    return head + re.sub(r'^\*\*(Basic|Proficient|Advanced) Level\*\*\n\n', '',
                         body, flags=re.M)


def fault_unknown_band(text):
    """Invent a band. The worksheet filter offers Basic/Proficient/Advanced only."""
    head, body = part5(text)
    return head + body.replace('**Proficient Level**', '**Medium Level**', 1)


def fault_duplicate_number(text):
    """Author two Part 5 items as number 3. Both resolve to one question."""
    head, body = part5(text)
    return head + body.replace('\n4. A square pyramid has a base edge of $6$',
                               '\n3. A square pyramid has a base edge of $6$', 1)


def fault_free_response(text):
    """Strip one Part 5 item's choices. isPrintable() drops it silently."""
    head, body = part5(text)
    return head + re.sub(r'(\n6\. A solid is a cube[^\n]*\n)(?:   - [A-D]\)[^\n]*\n)+',
                         r'\1', body)


def fault_letter_skew(text):
    """
    Move the two Part 5 answers that are A onto C, giving C three of six.

    SCOPED TO THE EXTRA-PRACTICE KEY BLOCK, and the first version of this
    function was not -- it rewrote Part 2's answers instead, because practice
    keys carry the same `**1.` header shape and come first in the file. Both
    skew cases reported MISSED against a fault that had never been planted where
    the check looks. Worth keeping the note: a fault proof that mutates the
    wrong section reports the gate as broken and sends you to fix working code.
    """
    at = text.index('##### Extra Practice - Answer Key')
    head, block = text[:at], text[at:]
    return head + re.sub(r'^\*\*Answer: A\*\*', '**Answer: C**', block, flags=re.M)


def fault_answer_leak(text):
    """Write an answer line into Part 5, which reaches anon through the view."""
    head, body = part5(text)
    return head + body.replace(
        '2. A cylinder has a radius of $4$ and a height of $6$. What is its volume?',
        '2. A cylinder has a radius of $4$ and a height of $6$. What is its volume?\n\n'
        '**Answer: B**', 1)


def fault_duplicate_values(text):
    """Two Part 5 choices equal by value. A student cannot pick between them."""
    head, body = part5(text)
    return head + body.replace('   - D) $82$', '   - D) $42$', 1)


def fault_repeated_heading(text):
    """A second Part 5 heading. The uploader keeps only the last block."""
    return text + '\n\n#### **Part 5: Extra Practice**\n\nstrays here\n'


def fault_extra_key_after_part5(text):
    """
    Move the extra-practice answer key BELOW its questions.

    This is the `maxsplit=1` trap the investigation found, in its new clothes:
    the key block has to stay inside Part 4, and an author who files it under
    Part 5 instead gets six items with no correct answer at all.
    """
    start = text.index('##### Extra Practice - Answer Key')
    end = text.index('#### **Part 5: Extra Practice**')
    return text[:start] + text[end:] + '\n\n' + text[start:end]


CASES = (
    ('pool below the floor',        fault_too_small,        'extra practice has 2 item(s)'),
    ('no difficulty bands',         fault_unbanded,         'carry no difficulty band'),
    ('invented difficulty band',    fault_unknown_band,     "unknown difficulty band(s) ['Medium']"),
    ('duplicate item number',       fault_duplicate_number, 'extra_practice item 3 is authored 2 times'),
    ('free-response item',          fault_free_response,    'extra_practice section is not interactive'),
    ('answers bunched on C',        fault_letter_skew,      'extra practice: correct answers skewed'),
    ('answer key filed under Part 5', fault_extra_key_after_part5,
     'no correct answer found in the answer key'),
)

# check_topic owns these three: the two it can see that the linter cannot, and
# the spread rule, which it fails the commit on where the linter only warns.
CHECK_TOPIC_CASES = (
    ('answers bunched on C',   fault_letter_skew,      'EXTRA SPREAD'),
    ('answer written into Part 5', fault_answer_leak,  'ANSWER IN PART 5'),
    ('two choices of equal value', fault_duplicate_values, 'DUPLICATE VALUES  GR.2.6 X1'),
    ('Part 5 heading twice',   fault_repeated_heading, "'#### **Part 5:' appears 2 times"),
)


def main():
    source = SOURCE.read_text(encoding='utf-8')
    failures = 0

    # ── the control ──
    print('CONTROL  GR.2.6 exactly as authored')
    findings, output = run_gates(source)
    errors = [m for level, m in findings if level == 'ERROR']
    warns = [m for level, m in findings if level == 'WARN']
    clean = not errors and not warns and 'PASS' in output
    print(f'  lint: {len(errors)} error(s), {len(warns)} warning(s)')
    for m in errors + warns:
        print(f'    ! {m}')
    print(f'  check_topic: {"PASS" if "PASS" in output else "FAIL"}')
    for line in output.splitlines():
        if 'FAIL' in line:
            print(f'   {line.strip()}')
    if not clean:
        failures += 1
        print('  FAULTPROOF FAILED: the control is not clean, so nothing below is '
              'evidence about the fault it names')
    print()

    # ── the linter's own gates ──
    print('FAULTS  lint_curriculum_source.py')
    for label, mutate, expect in CASES:
        findings, _ = run_gates(mutate(source))
        messages = [m for _, m in findings]
        hit = any(expect in m for m in messages)
        if not hit:
            failures += 1
        print(f'  {"caught" if hit else "MISSED"}  {label}')
        print(f'          expected: {expect!r}')
        if hit:
            print(f'          reported: {next(m for m in messages if expect in m)[:110]}')
        else:
            print(f'          reported instead: {messages[:3] or "nothing at all"}')

    # ── check_topic's gates ──
    print('\nFAULTS  check_topic.py')
    for label, mutate, expect in CHECK_TOPIC_CASES:
        _, output = run_gates(mutate(source))
        hit = expect in output
        if not hit:
            failures += 1
        print(f'  {"caught" if hit else "MISSED"}  {label}')
        print(f'          expected: {expect!r}')
        line = next((l.strip() for l in output.splitlines() if expect in l), None)
        print(f'          reported: {line[:110] if line else "nothing at all"}')

    total = 1 + len(CASES) + len(CHECK_TOPIC_CASES)
    print(f'\n{total} case(s), {failures} failure(s)')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
