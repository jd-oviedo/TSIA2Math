#!/usr/bin/env python3
"""
lint_curriculum_source.py -- READ-ONLY. Structural and house-style checks on
curriculum markdown, run before an upload.

The uploader's validate_practice_items() already cross-checks the answer letter
against the misconception_tag map. This covers the rest of the house rules,
which until now were checked by eye and are exactly the ones that have shipped
bugs before:

  * currency written as a bare `$` (breaks remark-math delimiter matching, the
    QR.1.2 / QR.2.1 / QR.3.5 defect) or as `$\\$28$` inside math
  * LaTeX commands sitting outside a `$...$` span, so they render literally
  * raw Unicode math symbols instead of LaTeX
  * em dashes
  * misconception slugs not in the approved taxonomy
  * the 10 (4 Basic / 3 Proficient / 3 Advanced) + 4 quiz shape
  * correct-answer letters bunched on one option -- PracticeQuiz.tsx does not
    shuffle, so a topic that is all A is a real defect

Exits non-zero if any ERROR fires. WARN is advisory and does not fail the run.

    python3 scripts/lint_curriculum_source.py                       # whole course
    python3 scripts/lint_curriculum_source.py --unit 1
    python3 scripts/lint_curriculum_source.py --topics QR.2.2,QR.2.3
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'curriculum' / 'migrations'))

from upload_curriculum import (  # noqa: E402
    parse_markdown_curriculum,
    build_practice_items,
    validate_practice_items,
    extract_misconceptions,
)

TAXONOMY = ROOT / 'data' / 'docs' / 'misconception_taxonomy.json'

# A fenced json block. Stripped before prose checks: distractor_logic is prose
# and IS checked, but the check for unwrapped LaTeX would misfire on json.
FENCE_RE = re.compile(r'```json\n.*?\n```', re.S)
# Both delimiters must be unescaped to open a span: `\$40 ... \$65` is correctly
# escaped currency, not math, and matching from inside the escape reported every
# properly written price as a defect. `\$` is allowed in the body so the
# escaped-currency-inside-math check below still has something to catch.
MATH_SPAN = re.compile(r'(?<!\\)\$(?:[^$\n]|\\\$)*(?<!\\)\$')
# Display math. remark-math supports it and it renders fine; it just has to come
# out before the inline-span checks, which would otherwise read `$$` as an empty
# span and treat the formula between as bare prose.
DISPLAY_MATH = re.compile(r'\$\$.*?\$\$', re.S)

LATEX_CMDS = [r'\\frac', r'\\sqrt', r'\\times', r'\\div', r'\\leq', r'\\geq',
              r'\\neq', r'\\approx', r'\\cdot', r'\\pi\b', r'\\le\b', r'\\ge\b']
LATEX_RE = re.compile('|'.join(LATEX_CMDS))

# Raw Unicode that should have been LaTeX.
UNICODE_MATH = {
    '\u00d7': r'\times', '\u00f7': r'\div', '\u2264': r'\leq', '\u2265': r'\geq',
    '\u2260': r'\neq', '\u2248': r'\approx', '\u221a': r'\sqrt', '\u03c0': r'\pi',
    '\u2212': '-', '\u00b2': '^2', '\u00b3': '^3', '\u215b': r'\frac',
    '\u00bd': r'\frac{1}{2}', '\u00bc': r'\frac{1}{4}', '\u00be': r'\frac{3}{4}',
}

EXPECTED_LEVELS = {'Basic': 4, 'Proficient': 3, 'Advanced': 3}


def load_slugs():
    data = json.loads(TAXONOMY.read_text())
    return {s['slug'] for s in data['slugs']}, {
        s['slug'] for s in data['slugs'] if s.get('status') != 'approved'}


# Three or more consecutive lowercase English words. Inside a math span this
# means prose was swallowed by a mis-paired delimiter, which is what unescaped
# currency actually looks like once remark-math has matched it: in
# "divides $12 by 3 to find a unit rate of $4", the scanner pairs the two bare
# dollars and typesets "12 by 3 to find a unit rate of " as math.
PROSE_IN_MATH = re.compile(r'[a-z]{2,}\s+[a-z]{2,}\s+[a-z]{2,}')


def check_currency(text, add, where=''):
    """
    Currency must be `\\$28`, and must never sit inside math delimiters.

    `$\\$28$` breaks remark-math: the escaped dollar is still a delimiter to the
    scanner, so the span closes in the wrong place. A bare `$28` is the mirror
    defect, pairing with the next dollar downstream.

    Checked by delimiter pairing rather than by looking for `$` before a digit,
    because `$4$` is the ordinary way to write the number four.
    """
    label = f'{where} ' if where else ''
    for i, line in enumerate(text.split('\n'), 1):
        for span in MATH_SPAN.finditer(line):
            body = span.group()[1:-1]
            if '\\$' in body:
                add('ERROR', f'{label}line {i}: escaped currency inside math '
                             f'delimiters: {span.group()[:60]}')
            elif PROSE_IN_MATH.search(body):
                add('ERROR', f'{label}line {i}: prose swallowed into a math span, '
                             f'almost always an unescaped `\\$`: {span.group()[:70]}')

        # An odd count of unescaped dollars leaves one delimiter unpaired, so
        # the span runs on into whatever follows.
        if len(re.findall(r'(?<!\\)\$', line)) % 2:
            add('ERROR', f'{label}line {i}: odd number of unescaped `$`, '
                         f'delimiters do not pair: {line.strip()[:70]}')


def check_unwrapped_latex(text, add):
    stripped = MATH_SPAN.sub(' ', text)
    for m in LATEX_RE.finditer(stripped):
        line = stripped[:m.start()].count('\n') + 1
        add('ERROR', f'line ~{line}: LaTeX `{m.group()}` outside a $...$ span')


def check_unicode(text, add):
    for ch, latex in UNICODE_MATH.items():
        if ch in text:
            n = text.count(ch)
            add('ERROR', f'raw Unicode {ch!r} x{n}, use {latex} in math')


def lint_file(path, approved, unapproved):
    findings = []

    def add(level, msg):
        findings.append((level, msg))

    raw = path.read_text(encoding='utf-8')

    if '\u2014' in raw:
        add('ERROR', f'em dash x{raw.count(chr(0x2014))}')

    # Blank out display math positionally so line numbers survive.
    prose = DISPLAY_MATH.sub(lambda m: re.sub(r'[^\n]', ' ', m.group()),
                             FENCE_RE.sub('', raw))
    check_currency(prose, add)
    check_unwrapped_latex(prose, add)
    check_unicode(raw, add)

    # distractor_logic prose renders through the same pipeline, and is where the
    # known QR.1.2 / QR.2.1 / QR.3.5 currency defect actually lives.
    for fence in FENCE_RE.findall(raw):
        check_currency(fence, add, where='distractor_logic')

    parsed = parse_markdown_curriculum(path)
    meta = parsed['metadata']
    for key in ('topic_name', 'sequence_in_unit', 'assessment_layer',
                'estimated_time_minutes', 'difficulty_band', 'related_strand', 'keywords'):
        if key not in meta:
            add('ERROR', f'frontmatter missing `{key}`')

    sections = build_practice_items(
        parsed['practice_problems'], parsed['mini_quiz'], parsed['answer_key'])

    for warning in validate_practice_items(sections):
        add('ERROR', warning)

    practice, quiz = sections['practice'], sections['mini_quiz']
    if len(practice['items']) != 10:
        add('ERROR', f"practice has {len(practice['items'])} items, expected 10")
    if len(quiz['items']) != 4:
        add('ERROR', f"mini quiz has {len(quiz['items'])} items, expected 4")

    levels = Counter(i['level'] for i in practice['items'])
    for label, want in EXPECTED_LEVELS.items():
        if levels.get(label, 0) != want:
            add('ERROR', f'{label} level has {levels.get(label, 0)} items, expected {want}')

    for name, section in sections.items():
        if not section['interactive']:
            add('ERROR', f'{name} section is not interactive, it loses its mastery gate')

    # Slugs must come from the approved vocabulary. Never invent one.
    for slug in extract_misconceptions(parsed['practice_problems'],
                                       parsed['mini_quiz'], parsed['answer_key']):
        if slug not in approved:
            add('ERROR', f'misconception slug `{slug}` is not in the taxonomy')
        elif slug in unapproved:
            add('ERROR', f'misconception slug `{slug}` is in the taxonomy but not approved')

    # PracticeQuiz.tsx renders A-D in fixed order with no shuffling.
    letters = Counter(i['correct_answer'] for section in sections.values()
                      for i in section['items'] if i['correct_answer'])
    total = sum(letters.values())
    if total:
        top, count = letters.most_common(1)[0]
        if count > total * 0.45:
            add('WARN', f'correct answers skewed: {count}/{total} are {top} '
                        f'({dict(sorted(letters.items()))})')
        missing = {'A', 'B', 'C', 'D'} - set(letters)
        if missing:
            add('WARN', f'no item has correct answer {sorted(missing)}')

    return findings


def main():
    ap = argparse.ArgumentParser(description='Lint curriculum markdown source')
    ap.add_argument('--course', default='tsia2-math')
    ap.add_argument('--unit', help='restrict to one unit number')
    ap.add_argument('--topics', help='comma-separated topic_ids')
    args = ap.parse_args()

    source = ROOT / 'curriculum' / 'source' / args.course
    pattern = f'unit-{args.unit}/[AGPQ][R]*.md' if args.unit else 'unit-*/[AGPQ][R]*.md'
    files = sorted(source.glob(pattern))
    if args.topics:
        wanted = {t.strip() for t in args.topics.split(',')}
        files = [f for f in files if f.stem in wanted]

    if not files:
        print('No files matched.')
        return 1

    approved, unapproved = load_slugs()
    errors = warns = 0

    for path in files:
        findings = lint_file(path, approved, unapproved)
        errs = [f for f in findings if f[0] == 'ERROR']
        warnings = [f for f in findings if f[0] == 'WARN']
        errors += len(errs)
        warns += len(warnings)
        if findings:
            print(f'\n{path.parent.name}/{path.stem}')
            for level, msg in findings:
                print(f'  {level}: {msg}')
        else:
            print(f'✓ {path.parent.name}/{path.stem}')

    print(f'\n{len(files)} file(s): {errors} error(s), {warns} warning(s)')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
