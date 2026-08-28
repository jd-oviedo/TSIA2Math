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
  * Part 5 (extra practice), where a topic has one: every item banded and
    drawable, no duplicate item numbers, its own answer-letter spread

The two gated sections keep the fixed shape and Part 5 does not have one, which
is the whole point of the split. See SECTION_NAMES in upload_curriculum.py.

Exits non-zero if any ERROR fires. WARN is advisory and does not fail the run.

    python3 scripts/lint_curriculum_source.py                       # whole course
    python3 scripts/lint_curriculum_source.py --unit 1
    python3 scripts/lint_curriculum_source.py --topics QR.2.2,QR.2.3
    python3 scripts/lint_curriculum_source.py --json
    python3 scripts/lint_curriculum_source.py --check-baseline

`--check-baseline` compares the measured per-file attribution against
`scripts/curriculum_lint_baseline.json` and fails on any difference.

It compares **per file**, not on the totals, and that is the whole point. The
pre-existing findings have summed to `6 errors, 10 warnings` through three
successive rounds, and the attribution recorded alongside that total was wrong in
all three: it read "all in unit-1", then `unit-0/QR.3.8` plus `unit-1/QR.3.1`,
while the findings were in six other unit-1 files the entire time. Every
reconciliation against the total passed. A total-only guard would have passed
too. Only the file-level comparison can fail here.

Regenerate the baseline with `--json` and only when a change is intended:

    python3 scripts/lint_curriculum_source.py --json > scripts/curriculum_lint_baseline.json
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
BASELINE = ROOT / 'scripts' / 'curriculum_lint_baseline.json'

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

# What a non-interactive section actually costs, per section.
#
# The message used to be one string ending "it loses its mastery gate", which is
# true of the two gated sections and false of extra_practice -- that one is
# never gated and never rendered to a student. Its cost is different and worse:
# isPrintable() in app/lib/worksheet-select.ts requires multiple_choice with a
# populated choice map, so a free-response item in Part 5 is silently not a
# candidate. It is authored, it is stored, and no worksheet can ever draw it.
NOT_INTERACTIVE_COST = {
    'practice': 'it loses its mastery gate',
    'mini_quiz': 'it loses its mastery gate',
    'extra_practice': 'so at least one item is not multiple choice or has no '
                      'parsed answer; isPrintable() drops those, and an item a '
                      'worksheet can never draw is authoring nobody can use',
}

# The smallest Part 5 worth having.
#
# Not a house shape the way 10+4 is -- Part 5 has no fixed size, that is the
# point of it. This is a floor with one job: a pool of one or two items makes
# the spread and band checks below vacuous, so a Part 5 that small is more
# likely a half-finished edit than a decision.
EXTRA_PRACTICE_MIN = 4

# Ceiling on any one correct letter's share of a pool.
#
# Applied to the two gated sections together and to extra_practice separately,
# never to all three pooled. They are read by different code in different
# orders: PracticeQuiz.tsx renders the gated items A-D with no shuffling, and
# renderChoices() in worksheet-source.ts does the same on a printed sheet. A
# single pooled number would let a well-spread Part 2 mask a Part 5 that is all
# C, which is exactly the sheet a teacher notices.
ANSWER_SHARE_MAX = 0.45

GATED_SECTIONS = ('practice', 'mini_quiz')


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


def check_answer_spread(sections, add):
    """
    Correct answers must not bunch on one letter, per pool.

    THE GATED POOL IS SCORED EXACTLY AS IT WAS. Its numbers are the ones
    scripts/curriculum_lint_baseline.json records, and folding a new section
    into the same count would move the recorded warning totals on any topic that
    grew a Part 5 -- which reads as attribution drift rather than as content.
    Extra practice is scored as its own pool, on its own line.
    """
    pools = [('gated', [i for name in GATED_SECTIONS
                        for i in sections[name]['items']])]
    extra = sections.get('extra_practice')
    if extra:
        pools.append(('extra practice', extra['items']))

    for label, items in pools:
        letters = Counter(i['correct_answer'] for i in items if i['correct_answer'])
        total = sum(letters.values())
        if not total:
            continue
        where = '' if label == 'gated' else f'{label}: '
        top, count = letters.most_common(1)[0]
        if count > total * ANSWER_SHARE_MAX:
            add('WARN', f'{where}correct answers skewed: {count}/{total} are {top} '
                        f'({dict(sorted(letters.items()))})')
        missing = {'A', 'B', 'C', 'D'} - set(letters)
        if missing:
            add('WARN', f'{where}no item has correct answer {sorted(missing)}')


def check_extra_practice(sections, add):
    """
    Part 5's own rules. Nothing here runs on a topic without one.

    Deliberately NOT a fixed count. The whole reason this section exists is that
    the pool should grow as far as anyone will author, so pinning it to a number
    would rebuild the ceiling one section over. What it is pinned to is the two
    properties an item needs in order to be reachable at all.
    """
    section = sections.get('extra_practice')
    if not section:
        return

    items = section['items']
    if len(items) < EXTRA_PRACTICE_MIN:
        add('ERROR', f'extra practice has {len(items)} item(s); a pool this small '
                     f'is more likely an unfinished edit than a decision, so the '
                     f'floor is {EXTRA_PRACTICE_MIN}')

    # A BAND ON EVERY ITEM, and this is the check with real history behind it.
    #
    # passesLevel() in app/lib/worksheet-select.ts refuses a null level under any
    # active filter. That is what kept all 388 mini_quiz items out of every
    # band-filtered draw until the course was banded topic by topic: the items
    # existed, the badge counted them, and a teacher who ticked Basic could not
    # draw one. An unbanded Part 5 item repeats that exactly -- present in the
    # pool, invisible the moment anyone filters.
    unbanded = [i['item_number'] for i in items if not i['level']]
    if unbanded:
        add('ERROR', f'extra practice item(s) {unbanded} carry no difficulty band; '
                     f'passesLevel() refuses a null level, so a filtered draw can '
                     f'never reach them. Add a `**Basic Level**` style heading '
                     f'above them in Part 5')

    banded = Counter(i['level'] for i in items if i['level'])
    unknown = sorted(set(banded) - set(EXPECTED_LEVELS))
    if unknown:
        add('ERROR', f'extra practice uses unknown difficulty band(s) {unknown}; '
                     f'the bands are {sorted(EXPECTED_LEVELS)}')


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
        parsed['practice_problems'], parsed['mini_quiz'], parsed['answer_key'],
        parsed['extra_practice'])

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
            add('ERROR', f'{name} section is not interactive, '
                         f'{NOT_INTERACTIVE_COST[name]}')

    # An item_number appearing twice in one section, in ANY section.
    #
    # Every reference to an item is (section, item_number) -- the worksheet ref,
    # curriculum_attempts, gumu_sessions -- and loadStaticItems in
    # worksheet-source.ts builds its lookup as a Map on exactly that key. A
    # repeated number does not fail anywhere: the second item overwrites the
    # first in that map, so both candidates resolve to the same question and the
    # worksheet prints it twice, which selectItems' no-duplicates rule cannot
    # see because it is deduplicating refs and the refs really are distinct.
    for name, section in sections.items():
        numbers = Counter(i['item_number'] for i in section['items'])
        for number, seen in sorted(numbers.items()):
            if seen > 1:
                add('ERROR', f'{name} item {number} is authored {seen} times; '
                             f'item numbers address a question and must be unique '
                             f'within a section')

    # Slugs must come from the approved vocabulary. Never invent one.
    for slug in extract_misconceptions(parsed['practice_problems'],
                                       parsed['mini_quiz'],
                                       parsed['extra_practice'],
                                       parsed['answer_key']):
        if slug not in approved:
            add('ERROR', f'misconception slug `{slug}` is not in the taxonomy')
        elif slug in unapproved:
            add('ERROR', f'misconception slug `{slug}` is in the taxonomy but not approved')

    check_answer_spread(sections, add)
    check_extra_practice(sections, add)

    return findings


def compare_baseline(measured, baseline):
    """Per-file drift between a measured attribution and the recorded one.

    Returns a list of human-readable difference lines, empty when they agree.
    Only files carrying findings are recorded, so adding a clean topic is not
    drift, while the first finding in a new topic is.
    """
    diffs = []
    for name in sorted(set(measured) | set(baseline)):
        got = measured.get(name)
        want = baseline.get(name)
        if got == want:
            continue
        if want is None:
            diffs.append(f'  NEW      {name}: {got["errors"]} error(s), '
                         f'{got["warnings"]} warning(s)')
        elif got is None:
            diffs.append(f'  CLEARED  {name}: was {want["errors"]} error(s), '
                         f'{want["warnings"]} warning(s)')
        else:
            diffs.append(f'  CHANGED  {name}: {want["errors"]}E/{want["warnings"]}W '
                         f'-> {got["errors"]}E/{got["warnings"]}W')
    return diffs


def main():
    ap = argparse.ArgumentParser(description='Lint curriculum markdown source')
    ap.add_argument('--course', default='tsia2-math')
    ap.add_argument('--unit', help='restrict to one unit number')
    ap.add_argument('--topics', help='comma-separated topic_ids')
    ap.add_argument('--json', action='store_true',
                    help='emit the per-file attribution as JSON')
    ap.add_argument('--check-baseline', action='store_true',
                    help=f'fail if attribution differs from {BASELINE.name}')
    args = ap.parse_args()

    # A filtered run cannot see the files it skipped, so it would report every
    # one of them as CLEARED. Refuse rather than emit a confident wrong answer.
    if args.check_baseline and (args.unit or args.topics):
        print('--check-baseline needs the whole course; drop --unit/--topics.')
        return 2

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
    quiet = args.json or args.check_baseline
    measured = {}

    for path in files:
        findings = lint_file(path, approved, unapproved)
        errs = [f for f in findings if f[0] == 'ERROR']
        warnings = [f for f in findings if f[0] == 'WARN']
        errors += len(errs)
        warns += len(warnings)
        name = f'{path.parent.name}/{path.stem}'
        if findings:
            measured[name] = {'errors': len(errs), 'warnings': len(warnings)}
        if quiet:
            continue
        if findings:
            print(f'\n{name}')
            for level, msg in findings:
                print(f'  {level}: {msg}')
        else:
            print(f'✓ {name}')

    if args.json:
        print(json.dumps({
            'files_linted': len(files),
            'totals': {'errors': errors, 'warnings': warns},
            'files': measured,
        }, indent=2))
        return 0

    if args.check_baseline:
        if not BASELINE.exists():
            print(f'No baseline at {BASELINE}. Generate it with --json.')
            return 2
        recorded = json.loads(BASELINE.read_text())
        diffs = compare_baseline(measured, recorded.get('files', {}))
        want = recorded.get('totals', {})
        print(f'measured  {errors} error(s), {warns} warning(s) '
              f'across {len(measured)} file(s) with findings')
        print(f'baseline  {want.get("errors")} error(s), '
              f'{want.get("warnings")} warning(s) '
              f'across {len(recorded.get("files", {}))} file(s) with findings')
        if diffs:
            print('\nattribution drift:')
            print('\n'.join(diffs))
            return 1
        print('\nattribution matches the baseline, file by file.')
        return 0

    print(f'\n{len(files)} file(s): {errors} error(s), {warns} warning(s)')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
