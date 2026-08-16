"""Pre-commit checks for one curriculum topic source file.

Run before committing a topic, not after:

    python3 scripts/check_topic.py curriculum/source/tsia2-math/unit-4/AR.4.8.md

Checks, in order of how expensive the failure is to find later:

  1. DUPLICATE-VALUED CHOICES. Two answer choices that are the same number make
     an item unanswerable: a student who does the mathematics correctly and
     writes the unreduced form is marked wrong for a formatting choice. This
     check exists because three items in one batch shipped or nearly shipped
     with it, and in every case the item READ correctly -- the stem, the
     arithmetic and the distractor procedures were all right, and only the
     values disagreed. It is not detectable by reading.

     Choices are compared by value, not by string, because the pairs that
     caused this were things like x/2 against 4x/8, and 4x/16 against 2x/8.
     A literal comparison sees four different strings.

     THE ONE EXCEPTION, and the test for it. An equal-valued distractor is
     permitted only when BOTH of these hold:

       (a) the FORM itself is the topic's named assessed skill, not an
           incidental tidying step, and
       (b) the slug names precisely the error the student made.

     AR.4.8 is "Simplifying and operating with radical expressions". Form is
     the skill, and `largest_perfect_square_not_extracted` names exactly what
     a student choosing 2 root 12 over 4 root 3 did. Both hold, so its three
     instances are allowlisted below.

     AR.4.6 Q3 failed the test on both counts and was fixed rather than
     allowlisted: that topic is about combining rational expressions, where
     reducing is incidental rather than the assessed skill, and the choice was
     tagged `numerators_not_rescaled`, describing an error the student had not
     made. "The stem said reduce completely" is NOT the test. Plenty of stems
     say that.

     A stem carrying an allowlisted distractor must also state the required
     form explicitly, so a student marked wrong for the unsimplified form was
     told plainly what was being asked, and the item must still hold two
     genuinely wrong distractors so real mathematical discrimination survives.

  2. Answer-letter tally against the house A:3 B:4 C:4 D:3.
  3. Misconception slugs against the topic's pre-assigned set in the taxonomy.
  4. Currency convention: no bare or escaped dollar signs inside JSON string
     fields, where a single backslash before $ is an invalid escape and will
     not parse. Spell it as a word there; \\$ belongs in markdown prose only.
  5. Em dashes, which the house style does not use.
  6. ANSWER LEAK INTO THE QUESTION SECTIONS. Parts 2 and 3 ship to signed-out
     students raw, through curriculum_topics_public, which redacts
     practice_items but selects practice_problems and mini_quiz unchanged.
     Nothing but authoring convention keeps an answer out of them.

     The split is by line prefix -- `#### **Part 4:` -- so a heading with
     three hashes or a missing asterisk does not fail, it silently stops
     splitting, and Part 3 swallows the answer key. Every other check still
     passes: the markdown is valid, the JSON parses, the tally counts, the page
     renders. The worked solutions just become public.

     Checked structurally: all four headings present exactly once, in the
     uploader's own terms, then Parts 2 and 3 scanned for answer shapes. See
     scripts/answer_shapes.py, which both this and the production audit import
     so the commit gate and the audit cannot drift apart.

Exit code is non-zero if anything fails, so it can gate a commit.
"""
import json
import re
import sys
from collections import Counter
from fractions import Fraction as F
from math import sqrt as _msqrt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import answer_shapes  # noqa: E402  (after the path insert, by necessity)


def _sqrt(v):
    if v < 0:
        raise ValueError('negative radicand')
    return _msqrt(v)

REPO = Path(__file__).resolve().parent.parent
TAXONOMY = REPO / 'data' / 'docs' / 'misconception_taxonomy.json'
XS = [F(n) for n in (-7, -5, -3, -2, 2, 3, 5, 7, 11, 13)]

# Reviewed equal-valued pairs that meet the exception in the module docstring.
# Listed individually rather than waived by topic, so a NEW duplicate in one of
# these same topics still fails. A check that always reports the same known hits
# trains people to skim it.
ALLOWED_DUPLICATES = {
    ('AR.4.8', 'P1', 'B|C'): 'simplest-radical-form item; C is 2 root 12, the '
                             'partially-extracted form, tagged largest_perfect_square_not_extracted',
    ('AR.4.8', 'P2', 'B|C'): 'simplest-radical-form item; B is 2 root 18, the '
                             'partially-extracted form, tagged largest_perfect_square_not_extracted',
    ('AR.4.8', 'P9', 'B|C'): 'simplest-radical-form item; C is root 60, the '
                             'unextracted product, tagged largest_perfect_square_not_extracted',
}


# ─── LaTeX to a value signature ──────────────────────────────────────────────
#
# Only the shapes that actually appear in answer choices are handled. Anything
# else returns None and is reported as unparsed rather than silently passing,
# because a check that quietly skips what it cannot read is not a check.

def latex_to_expr(s):
    t = s.strip().strip('$').strip()
    t = t.replace('\\dfrac', '\\frac').replace('\\left', '').replace('\\right', '')
    t = t.replace('\\cdot', '*').replace('\\times', '*')
    # \frac{a}{b} -> ((a)/(b)), innermost first
    for _ in range(4):
        m = re.search(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', t)
        if not m:
            break
        t = t[:m.start()] + f'(({m.group(1)})/({m.group(2)}))' + t[m.end():]
    # \sqrt{n} -> sqrt(n). Radicals are the whole subject of AR.4.8, so a
    # checker that skips them is blind exactly where it is most needed.
    # A placeholder, not the literal word: the implicit-multiplication rules
    # below would otherwise rewrite "sqrt(" as "sqrt*(" and break the parse.
    t = re.sub(r'\\sqrt\{([^{}]*)\}', 'RADIX((\\1))', t)
    t = re.sub(r'\\sqrt(\d+)', 'RADIX(\\1)', t)
    if '\\frac' in t or '\\sqrt' in t or '\\neq' in t or '\\geq' in t or '\\leq' in t:
        return None
    t = re.sub(r'\^\{([^{}]*)\}', r'**(\1)', t)
    t = re.sub(r'\^(-?\d+)', r'**(\1)', t)
    t = t.replace('{', '(').replace('}', ')')
    # implicit multiplication: 4x -> 4*x, )( -> )*(, 2( -> 2*(, x( -> x*(
    t = re.sub(r'(\d)\s*([a-z(])', r'\1*\2', t)
    t = re.sub(r'(?<!RADIX)([a-z)])\s*\(', r'\1*(', t)
    t = re.sub(r'\)\s*([a-z0-9])', r')*\1', t)
    # A coefficient sitting against a radical, 4RADIX(3), needs its implicit
    # multiplication too; the rules above only see lowercase identifiers.
    t = re.sub(r'([0-9)])\s*RADIX', r'\1*RADIX', t)
    if re.search(r'[^0-9xyab+\-*/(). ]', t.replace('RADIX', '')):
        return None
    return t.replace('RADIX', 'sqrt')


def signature(choice):
    expr = latex_to_expr(choice)
    if expr is None:
        return None
    # Radicals force float arithmetic, so signatures are rounded. 12 places is
    # far beyond any difference between two genuinely distinct answer choices
    # and far inside float noise for values of this size.
    use_float = 'sqrt' in expr
    env = {'sqrt': _sqrt}
    sig = []
    for x in XS:
        try:
            v = eval(expr, {'__builtins__': {}},
                     {**env, 'x': float(x) if use_float else x,
                      'y': float(x) if use_float else x,
                      'a': float(x) if use_float else x,
                      'b': float(x) if use_float else x})
            sig.append(round(float(v), 12) if use_float else F(v))
        except (ZeroDivisionError, SyntaxError, NameError, TypeError, ValueError):
            return None
    return tuple(sig)


# ─── Parsing the source ──────────────────────────────────────────────────────

def sections(text):
    out = {}
    for n in ('Part 1', 'Part 2', 'Part 3', 'Part 4'):
        m = re.search(r'^#### \*\*' + n + r'.*?$(.*?)(?=^#### |\Z)', text, re.S | re.M)
        out[n] = m.group(1) if m else ''
    return out


# The uploader's own split, reproduced exactly.
#
# upload_curriculum.py:100-138 walks the file line by line and switches section
# on `line.startswith(prefix)`. This check reproduces that rather than reusing
# sections() above, which is regex-based and forgiving in different places. A
# gate that parses the file more leniently than the uploader does cannot see the
# case where the uploader's split is the thing that broke, which is precisely
# the case here.
UPLOADER_PARTS = (
    ('Part 1', '#### **Part 1:', 'guided_notes'),
    ('Part 2', '#### **Part 2:', 'practice_problems'),
    ('Part 3', '#### **Part 3:', 'mini_quiz'),
    ('Part 4', '#### **Part 4:', 'answer_key'),
)

# Columns curriculum_topics_public serves to anon without redaction.
ANON_RAW_PARTS = ('Part 2', 'Part 3')


def uploader_sections(text):
    """(sections, heading_counts) exactly as upload_curriculum.py would split.

    heading_counts is returned alongside so a heading that is missing, or
    present twice, is reported as the structural fault it is rather than
    showing up only as a downstream content hit.
    """
    counts = {name: 0 for name, _, _ in UPLOADER_PARTS}
    out = {name: [] for name, _, _ in UPLOADER_PARTS}
    current = None
    for line in text.split('\n'):
        switched = False
        for name, prefix, _ in UPLOADER_PARTS:
            if line.startswith(prefix):
                counts[name] += 1
                current = name
                switched = True
                break
        if not switched and current:
            out[current].append(line)
    return {k: '\n'.join(v).strip() for k, v in out.items()}, counts


def items_with_choices(block, header_re):
    """[(label, [choice strings])] for one question section."""
    parts = re.split(header_re, block, flags=re.M)
    out = []
    for i in range(1, len(parts), 2):
        num, body = parts[i], parts[i + 1]
        choices = re.findall(r'^\s*-\s*([A-D])\)\s*(.+?)\s*$', body, re.M)
        if choices:
            out.append((num, dict(choices)))
    return out


def main(path):
    text = Path(path).read_text()
    topic_id = Path(path).stem
    sec = sections(text)
    failures, notes = [], []

    # ── 1. duplicate-valued choices ──
    all_items = (
        [(f'P{n}', c) for n, c in items_with_choices(sec['Part 2'], r'^(\d+)\.\s')]
        + [(f'Q{n}', c) for n, c in items_with_choices(sec['Part 3'], r'^\*\*Item (\d+)\*\*')]
    )
    unparsed = 0
    for label, choices in all_items:
        sigs = {}
        for letter, raw in choices.items():
            s = signature(raw)
            if s is None:
                # Not machine-evaluable (an equation, a set, prose). Fall back to
                # normalised text, which still catches a choice repeated verbatim
                # -- the cheapest form of this defect and the easiest to make.
                unparsed += 1
                s = ('text', re.sub(r'\s+', '', raw))
            sigs.setdefault(s, []).append(letter)
        for letters in sigs.values():
            if len(letters) > 1:
                key = (topic_id, label, '|'.join(sorted(letters)))
                if key in ALLOWED_DUPLICATES:
                    notes.append(f"allowed duplicate {label} "
                                 f"{'/'.join(sorted(letters))}: {ALLOWED_DUPLICATES[key]}")
                    continue
                failures.append(
                    f"DUPLICATE VALUES  {topic_id} {label}: choices "
                    f"{' and '.join(sorted(letters))} are the same number "
                    f"({', '.join(choices[l] for l in sorted(letters))})")
    notes.append(f"{len(all_items)} items scanned for duplicate values "
                 f"({unparsed} choices not machine-comparable, review by eye)")

    # ── 2. tally ──
    tally = Counter(re.findall(r'^\*\*Answer:\s*([A-D])\*\*', text, re.M))
    want = {'A': 3, 'B': 4, 'C': 4, 'D': 3}
    if dict(tally) != want:
        failures.append(f"TALLY  {topic_id}: {dict(sorted(tally.items()))}, expected {want}")
    else:
        notes.append(f"tally {dict(sorted(tally.items()))}")

    # ── 3. slugs against the pre-assigned set ──
    tax = json.loads(TAXONOMY.read_text())
    allowed = {s['slug'] for s in tax['slugs'] if topic_id in (s.get('topics') or [])}
    used = Counter(re.findall(r'misconception:\s*([a-z0-9_]+)', text))
    outside = sorted(set(used) - allowed)
    if outside:
        failures.append(f"SLUGS OUTSIDE SET  {topic_id}: {outside} (allowed: {sorted(allowed)})")
    unused = sorted(allowed - set(used))
    if unused:
        notes.append(f"pre-assigned slugs not used: {unused}")
    notes.append(f"{len(used)}/{len(allowed)} slugs used, {sum(used.values())} uses")

    # ── 4. currency inside JSON string fields ──
    for block in re.findall(r'```json\s*(.*?)```', text, re.S):
        for line in block.split('\n'):
            if re.search(r'"[^"]*\\?\$[^"]*"', line):
                failures.append(f"CURRENCY  {topic_id}: dollar sign inside a JSON string, "
                                f"spell it as a word: {line.strip()[:90]}")

    # ── 5. em dashes ──
    if '\u2014' in text:
        failures.append(f"EM DASH  {topic_id}: {text.count(chr(8212))} found")

    # \u2500\u2500 6. answer leak into the anon-visible question sections \u2500\u2500
    up_sec, counts = uploader_sections(text)

    # Structural first. A broken heading is the cause; the content hit below is
    # only the symptom, and reporting the symptom alone sends the next reader
    # hunting for an answer they did not write.
    for name, prefix, column in UPLOADER_PARTS:
        if counts[name] == 0:
            failures.append(
                f"PART HEADING  {topic_id}: no line starts with '{prefix}', so "
                f"upload_curriculum.py never opens {column}. Content that belongs "
                f"there folds into the previous section.")
        elif counts[name] > 1:
            failures.append(
                f"PART HEADING  {topic_id}: '{prefix}' appears {counts[name]} times; "
                f"the uploader switches section on each, so {column} keeps only "
                f"the last block.")

    scanned = 0
    for part in ANON_RAW_PARTS:
        body = up_sec.get(part, '')
        if not body:
            continue
        scanned += 1
        for kind, excerpt in answer_shapes.scan_text(body):
            failures.append(
                f"ANSWER IN {part.upper()}  {topic_id}: {kind} found in a section "
                f"served raw to signed-out students: {excerpt[:100]}")

    # A content check that quietly scanned nothing must not read as a pass.
    if scanned < len(ANON_RAW_PARTS):
        failures.append(
            f"ANSWER SCAN  {topic_id}: scanned {scanned} of {len(ANON_RAW_PARTS)} "
            f"anon-visible sections; the missing one is empty or never opened, so "
            f"this check did not run on it.")
    else:
        notes.append(f"{scanned} anon-visible section(s) scanned for answer shapes")

    print(f"── {topic_id} ──")
    for n in notes:
        print(f"   {n}")
    for f in failures:
        print(f"   FAIL  {f}")
    print(f"   {'PASS' if not failures else str(len(failures)) + ' FAILURE(S)'}")
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(max(main(p) for p in sys.argv[1:]))
