#!/usr/bin/env python3
"""
Upload curriculum markdown files to Supabase.
Usage:
  python3 curriculum/migrations/upload_curriculum.py --course tsia2-math --dry-run
  python3 curriculum/migrations/upload_curriculum.py --course tsia2-math
"""

import os
import json
import re
import argparse
from pathlib import Path
from datetime import datetime


def connect():
    """
    Build the Supabase admin client, reading .env.local for credentials.

    Deliberately a function rather than module-level setup. The parsing half of
    this file -- parse_markdown_curriculum, build_practice_items and friends --
    is the single source of truth for what a curriculum item *is*, and
    scripts/verify_templates.py imports it to anchor templates against the
    authored items. Constructing a client (or calling exit()) at import time
    made that import require credentials and the supabase package to be
    installed, so a verifier that never touches the network could not run in CI.

    Nothing here is imported or evaluated until an actual upload is about to
    happen; --dry-run never calls this and so needs no credentials either.
    """
    from dotenv import load_dotenv

    env_path = Path(__file__).parent.parent.parent / '.env.local'
    print(f"Looking for .env.local at: {env_path}")
    print(f"File exists: {env_path.exists()}")
    load_dotenv(env_path)

    try:
        from supabase import create_client
    except ImportError:
        print("Error: supabase not installed. Run: pip install supabase python-frontmatter")
        exit(1)

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    print(f"SUPABASE_URL found: {bool(url)}")
    print(f"SUPABASE_SERVICE_ROLE_KEY found: {bool(key)}")

    if not url or not key:
        print("\nError: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables required.")
        print("Check that .env.local exists in the repo root and has both keys set.")
        exit(1)

    return create_client(url, key)


# ─── The question sections, in one place ─────────────────────────────────────
#
# Three sections of gradable items now, not two, and the third is optional.
#
#   practice        Part 2. Ten items, gated at 7 of 10 on the student page.
#   mini_quiz       Part 3. Four items, gated at 3 of 4.
#   extra_practice  Part 5. A worksheet-only pool of any size, NOT gated.
#
# The split matters more than the addition. `practice_items.practice` was doing
# two jobs at once -- it is what a student works through AND the pool a
# worksheet draws from -- and those two have opposite pressures. The house 10+4
# shape is a pedagogical decision about how much a student is asked to do; the
# worksheet pool wants to be as deep as anyone will author. While they were the
# same array, deepening the pool for teachers raised the mastery bar for
# students: requiredCorrect() is a RATIO of the section's live item count
# (app/lib/topic-completion.ts:133), so a topic grown to 20 practice items
# demands 14 correct where it used to demand 7, and every student sitting at 7
# is silently re-locked mid-topic.
#
# extra_practice exists so that pressure has somewhere to go. Nothing on the
# student path reads it: sectionShape() in app/lib/curriculum-progress.ts is
# called by name on `.practice` and `.mini_quiz`, and the two student-facing API
# schemas (curriculumPracticeBodySchema, gumuStartSchema) keep their
# `z.enum(["practice", "mini_quiz"])` deliberately, so an answer cannot even be
# submitted against an extra-practice item. The gates are blind to this section
# by construction rather than by remembering to exclude it.
SECTION_NAMES = ('practice', 'mini_quiz', 'extra_practice')

# Sections omitted from practice_items entirely when they parse to nothing.
#
# NOT emitted-but-empty, and the difference is the whole reason this is a
# constant. An empty `extra_practice` key on all 97 topics would rewrite every
# stored practice_items object for zero content change, which
# scripts/diff_live_curriculum.py would then report as 97 topics drifting from
# production. A topic with no Part 5 uploads byte-identically to what it does
# today.
OPTIONAL_SECTIONS = ('extra_practice',)

# The line prefixes parse_markdown_curriculum switches section on.
#
# A table rather than a chain of elifs because scripts/check_topic.py carries
# the same list (UPLOADER_PARTS) in order to reproduce this split exactly, and a
# fifth branch bolted onto a chain is how the two come apart.
PART_PREFIXES = (
    # Not a "Part". It is the block above Part 1, and it is in this table for
    # the same reason the Parts are: the uploader's split is line-prefix based,
    # so anything that is not listed here is swallowed into whichever section
    # is currently open -- or, for a block that precedes Part 1, dropped on the
    # floor because no section is open yet. That is exactly where the three
    # objective bullets were going until this entry existed.
    ('#### **Learning Objectives**', 'objectives'),
    ('#### **Part 1:', 'guided_notes'),
    ('#### **Part 2:', 'practice_problems'),
    ('#### **Part 3:', 'mini_quiz'),
    ('#### **Part 4:', 'answer_key'),
    ('#### **Part 5:', 'extra_practice'),
)


def parse_objectives(block):
    """The Learning Objectives block as a list of bullet strings.

    Mirrored byte for byte by parseObjectives() in lib/curriculum-fixture.ts;
    scripts/verify_fixture_parity.mjs is what keeps the pair honest.

    Requiring the '- ' prefix -- hyphen AND space -- is what does the filtering
    here, and it is deliberate that there is no separate exclusion list. The
    block ends with a '---' horizontal rule and is padded with blank lines; a
    bare `startswith('-')` would take the rule in as an objective reading '--',
    and a blank line contributes nothing either way. Both fall out of the same
    condition, so there is no second rule to keep in sync with the TS side.

    Math spans are passed through RAW. `$\\sqrt{2}$` stays `$\\sqrt{2}$`: the
    stored value is markdown, exactly as guided_notes is, and rendering is the
    reader's job downstream. Rendering here would bake one renderer's output
    into the database and put this parser out of step with every other section.
    """
    out = []
    for line in block.split('\n'):
        t = line.strip()
        if t.startswith('- '):
            out.append(t[2:].strip())
    return out


def parse_markdown_curriculum(filepath):
    """
    Parse curriculum markdown file into structured components.
    Expects format: frontmatter + Part 1/2/3/4 sections, and optionally Part 5.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split frontmatter from body
    if content.startswith('---'):
        parts = content.split('---', 2)
        frontmatter_str = parts[1]
        body = parts[2] if len(parts) > 2 else ''
    else:
        frontmatter_str = ''
        body = content
    
    # Parse frontmatter (simple YAML-like)
    metadata = {}
    for line in frontmatter_str.strip().split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip()
            # Simple type conversion
            if val.startswith('[') and val.endswith(']'):
                try:
                    metadata[key] = json.loads(val)
                except json.JSONDecodeError:
                    metadata[key] = [
                        item.strip().strip('"\'')
                        for item in val[1:-1].split(',')
                        if item.strip()
                    ]
            elif val.lower() in ('true', 'false'):
                metadata[key] = val.lower() == 'true'
            elif val.isdigit():
                metadata[key] = int(val)
            else:
                metadata[key] = val.strip('"\'')
    
    # Extract sections by heading
    sections = {}
    current_section = None
    current_content = []

    for line in body.split('\n'):
        opened = None
        for prefix, name in PART_PREFIXES:
            if line.startswith(prefix):
                opened = name
                break
        if opened:
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = opened
            current_content = []
        elif current_section:
            current_content.append(line)

    if current_section:
        sections[current_section] = '\n'.join(current_content).strip()

    # Part 5 defaults to '' like every other section, which is what makes it
    # optional: 96 of 97 topics have no Part 5, and an empty string parses to an
    # empty item list that build_practice_items then omits entirely. See the
    # note on OPTIONAL_SECTIONS.
    return {
        'metadata': metadata,
        # Serialized here rather than left raw like the sections below it: every
        # other key is a markdown blob whose consumers each parse it their own
        # way, whereas this one has a single settled shape (a list of strings)
        # and the TS fixture has to produce the identical list from the identical
        # block. Parsing at the one place both sides can be compared is what
        # makes that provable.
        'objectives': parse_objectives(sections.get('objectives', '')),
        'guided_notes': sections.get('guided_notes', ''),
        'practice_problems': sections.get('practice_problems', ''),
        'mini_quiz': sections.get('mini_quiz', ''),
        'answer_key': sections.get('answer_key', ''),
        'extra_practice': sections.get('extra_practice', ''),
    }

def extract_misconceptions(*texts):
    """
    Extract unique canonical misconception names from distractor_logic entries.

    Every wrong-answer entry reads "Student makes misconception: <name> (<case>)",
    so only the snake_case name is captured and the parenthetical case is left
    out on purpose: the case is per-problem, the name is what aggregates across
    topics for the teacher dashboard. Correct entries open with "Correct:" and
    never match. Pass every section that might carry distractor_logic: today the
    blocks sit in the answer key, since parts 2 and 3 are student-facing and must
    not leak the reasoning.
    """
    misconceptions = set()
    pattern = r'Student makes misconception:\s*([a-z0-9_]+)'

    for text in texts:
        for match in re.findall(pattern, text or ''):
            name = match.strip()
            if name:
                misconceptions.add(name)

    return sorted(misconceptions)

# A choice line. Practice indents them ("   - A) $4$ cups"), the mini quiz
# does not ("- A) $9$ cups"), so leading whitespace is optional.
CHOICE_RE = re.compile(r'^[ \t]*-[ \t]*([A-D])\)[ \t]*(.+?)[ \t]*$', re.M)

# Item headers differ per section and per part, which is why each parser below
# passes its own splitter rather than sharing one.
PRACTICE_STEM_RE = re.compile(r'^(\d+)\.[ \t]+', re.M)      # Part 2: "1. A recipe..."
QUIZ_STEM_RE = re.compile(r'^\*\*Item (\d+)\*\*', re.M)     # Part 3: "**Item 1**"
PRACTICE_KEY_RE = re.compile(r'^\*\*(\d+)\.', re.M)         # Part 4: "**1. A recipe...**"
QUIZ_KEY_RE = re.compile(r'^\*\*Item (\d+):', re.M)         # Part 4: "**Item 1: ...**"

LEVEL_RE = re.compile(r'^\*\*(\w+) Level\*\*', re.M)
ANSWER_RE = re.compile(r'^\*\*Answer:\s*([A-D])\*\*', re.M)
JSON_BLOCK_RE = re.compile(r'```json\n.*?\n```', re.S)

# ─── Part 4's internal boundaries ────────────────────────────────────────────
#
# Part 4 holds one answer-key block per question section, back to back, each
# under its own `#####` heading. Only the FIRST block has no heading of its own:
# practice is identified by position, everything after it by heading.
#
# THIS REPLACES A `maxsplit=1` SPLIT, and the reason is a measured failure. The
# old form was
#
#     split = re.split(r'^#####\s*Mini Quiz', answer_key, maxsplit=1, flags=re.M)
#
# which is correct for exactly two sections and quietly wrong for three: a
# practice-style key (`**11. ...**`) landing after the Mini Quiz heading was
# handed to QUIZ_KEY_RE, which matches `**Item 11:` and so matched nothing, and
# those items came back with `correct: None`. Ten items lost their answers with
# the split reporting success. validate_practice_items() catches the
# consequence; nothing caught the cause.
#
# Keyed on the heading each section actually opens with, and ordered by where
# those headings appear in the file rather than by the order of this tuple, so
# authoring order is not a second thing to keep in step.
ANSWER_KEY_BOUNDARIES = (
    (re.compile(r'^#####\s*Mini Quiz', re.M), 'mini_quiz'),
    (re.compile(r'^#####\s*Extra Practice', re.M), 'extra_practice'),
)

# Which header regex reads the item numbers inside each block.
#
# extra_practice reuses PRACTICE_KEY_RE because an extra-practice key is
# authored exactly like a practice key (`**1. A cube ...**`) -- it is the same
# kind of item and only the section it belongs to differs.
KEY_HEADER_RES = {
    'practice': PRACTICE_KEY_RE,
    'mini_quiz': QUIZ_KEY_RE,
    'extra_practice': PRACTICE_KEY_RE,
}


def split_answer_key_sections(answer_key, boundaries, header_res):
    """
    [(section_name, text, header_re)] for Part 4, in document order.

    Shared by parse_answer_key() and extract_worked_solutions() so the two walks
    cannot disagree about where a section starts. They still pass their own
    `boundaries` and `header_res`, because extract_worked_solutions mirrors the
    TypeScript splitAnswerKey() and that one matches 3-6 hashes and whole header
    lines -- see the PORTS note above TS_MINI_QUIZ_HEADING.

    A section whose heading is absent contributes nothing rather than an empty
    block. That is what makes Part 5 optional for the 96 topics without one.
    """
    text = answer_key or ''
    found = sorted(
        (m.start(), name)
        for heading_re, name in boundaries
        if (m := heading_re.search(text))
    )

    first = found[0][0] if found else len(text)
    out = [('practice', text[:first], header_res['practice'])]
    for i, (start, name) in enumerate(found):
        end = found[i + 1][0] if i + 1 < len(found) else len(text)
        out.append((name, text[start:end], header_res[name]))
    return out


def _split_items(text, header_re):
    """
    Split a section into (item_number, body) pairs on a header regex.

    Each body runs from the end of its own header to the start of the next, so
    everything belonging to an item -- stem, choices, worked solution -- stays
    with it.
    """
    matches = list(header_re.finditer(text or ''))
    items = []
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        items.append((m.group(1), text[m.end():end]))
    return items


def _parse_stem_and_choices(body):
    """
    Split an item body into its stem and its A-D choices.

    Returns (stem, {letter: text}). An item with no choice lines is
    free-response and comes back with an empty dict -- that is a real content
    shape (QR.1.1), not a parse failure.
    """
    choices = dict(CHOICE_RE.findall(body))
    first = CHOICE_RE.search(body)
    stem = body[:first.start()] if first else body
    # Strip the section rule and collapse the stem onto one line.
    stem = stem.replace('---', ' ').strip()
    stem = re.sub(r'\s*\n\s*', ' ', stem).strip()
    return stem, choices


def parse_answer_key(answer_key):
    """
    Parse Part 4 into per-item correct answers, misconception tags and prose.

    All three come from the same walk on purpose. They are three parts of one
    fact -- which option is right, what each wrong option means, and how to say
    that to a teacher -- and parsing them separately would let them drift apart
    on a content edit.

    That is not hypothetical for the prose: `distractor_logic` and
    `misconception_tag` are two sibling blocks in the same fence, carrying the
    same option letters, and an edit that retags an option without rewording its
    explanation (or the reverse) is exactly the kind of change a second
    independent parser would silently disagree about.

    Returns {section: {item_number: {'correct': 'A'|None,
                                     'tags':  {letter: slug},
                                     'prose': {letter: raw string}}}}.
    """
    result = {name: {} for name in SECTION_NAMES}
    if not answer_key:
        return result

    # The tag block is a bare json fragment, not a whole object, so it is read
    # with a key-value regex rather than json.loads.
    tag_block = re.compile(r'"misconception_tag":\s*\{(.*?)\}', re.S)
    pair = re.compile(r'"([A-Z])":\s*"([a-z0-9_]+)"')

    # The prose block is read the same way and for the same reason, but the
    # value pattern is deliberately NOT the slug pattern above.
    #
    # A prose value is a free-text sentence: it contains spaces, commas, digits,
    # parentheses and capital letters, and `[a-z0-9_]+` would match none of them.
    # It can also contain an escaped quote in principle, so the value is matched
    # as "anything that is not an unescaped quote" rather than [^"]*, which would
    # stop dead at the first \" and truncate the sentence.
    prose_block = re.compile(r'"distractor_logic":\s*\{(.*?)\n\s*\}', re.S)
    prose_pair = re.compile(r'"([A-D])":\s*"((?:[^"\\]|\\.)*)"', re.S)

    # Part 4 holds its sections back to back under their own headings.
    sections = split_answer_key_sections(
        answer_key, ANSWER_KEY_BOUNDARIES, KEY_HEADER_RES)

    for name, text, header_re in sections:
        for number, body in _split_items(text, header_re):
            answer = ANSWER_RE.search(body)
            tags = {}
            found = tag_block.search(body)
            if found:
                tags = dict(pair.findall(found.group(1)))

            prose = {}
            found_prose = prose_block.search(body)
            if found_prose:
                prose = {
                    letter: _unescape_json_string(raw)
                    for letter, raw in prose_pair.findall(found_prose.group(1))
                }

            result[name][number] = {
                # Free-response items answer in prose ("**Answer: 0.8**"), so a
                # missing letter here is expected, not an error.
                'correct': answer.group(1) if answer else None,
                'tags': tags,
                'prose': prose,
            }

    return result


def _unescape_json_string(raw):
    """
    Turn the raw bytes between two json quotes back into the authored string.

    The prose is lifted out with a regex rather than json.loads, because the
    authored block is a bare fragment (`"distractor_logic": { ... }`) and not a
    parseable object -- the same reason the tag block above is read this way. A
    regex hands back the source text with its escapes still in it, so `\\"`
    would be stored as a backslash followed by a quote and rendered to the
    teacher that way.

    Measured across all 97 files: zero entries currently contain an escaped
    quote and zero span multiple lines, so today this function is the identity
    on every input it sees. It exists so that the first authored quotation mark
    does not ship a visible backslash into a teacher's answer key.

    ONE PASS, not a chain of .replace() calls. Replacing `\\"` and then `\\\\`
    in sequence decodes an escaped backslash followed by a quote twice over --
    the pair is consumed by the first pass and the quote it was protecting is
    then read as a delimiter. Scanning each escape exactly once cannot do that.
    """
    return re.sub(
        r'\\(.)',
        lambda m: {'"': '"', '\\': '\\', 'n': '\n', 't': '\t',
                   'r': '\r', '/': '/'}.get(m.group(1), m.group(0)),
        raw,
    )


def drop_empty_optional(by_section):
    """Strip optional sections that came back empty, from any section->... map.

    The same rule build_practice_items applies, applied to the three other
    columns derived from Part 4, and for the same reason: a topic with no Part 5
    must upload byte-identically to what it uploads today. Emitting
    `"extra_practice": {}` on all 97 topics would rewrite worked_solutions,
    distractor_prose and misconception_tags for zero content change, and
    scripts/diff_live_curriculum.py would report the whole course as drifting.

    Every consumer already reads these with optional chaining -- see
    resolveForKey in app/lib/worksheet-source.ts -- so absent and empty are the
    same thing to a caller, and only absent is free.
    """
    return {name: value for name, value in by_section.items()
            if value or name not in OPTIONAL_SECTIONS}


def extract_misconception_tags(answer_key):
    """
    Per-option misconception slugs, keyed section -> item -> option -> slug.

    Where extract_misconceptions() returns a flat topic-level list ("which
    misconceptions does this topic cover"), this is the addressable map a
    caller needs at answer time: the Socratic AI route knows the topic, the
    item, and which option the student picked, and needs the slug for exactly
    that combination.

    Correct options carry no tag and are absent from the map by design -- which
    means this column is answer-bearing (the missing letter is the correct one)
    and must never be sent to the browser.
    """
    parsed = parse_answer_key(answer_key)
    return drop_empty_optional({
        section: {num: entry['tags'] for num, entry in items.items() if entry['tags']}
        for section, items in parsed.items()
    })


def extract_distractor_prose(answer_key):
    """
    Per-option teacher-facing prose, keyed section -> item -> option -> string.

    The sibling of extract_misconception_tags, from the same walk, with one
    deliberate difference: this keeps ALL FOUR letters, including the correct
    one.

    misconception_tags omits correct options because it is a tag index and a
    correct option has no misconception to name. That reasoning does not carry
    over here. The correct option's entry reads "Correct: subtracts 9 from both
    sides to isolate x, giving 5, which checks against the original equation" --
    a one-line statement of why the right answer is right, which is exactly what
    an answer key wants beside the longer worked solution. Dropping it would be
    a content decision taken in a parser.

    It does mean this column names the correct answer in plain prose rather than
    leaking it by omission the way the tag map does. Both are answer-bearing;
    this one is just honest about it.

    STORED RAW. The "Student makes misconception: <slug> (" wrapper stays on.
    Stripping it is a render-time concern -- extractDistractorProse() in
    lib/curriculum-utils.ts -- so the database keeps what the author wrote and
    the presentation layer keeps the presentation.
    """
    parsed = parse_answer_key(answer_key)
    return drop_empty_optional({
        section: {num: entry['prose'] for num, entry in items.items() if entry['prose']}
        for section, items in parsed.items()
    })


# ─── Worked solutions ────────────────────────────────────────────────────────
#
# The four constants below are PORTS, not new parsing rules. Each mirrors a
# constant in lib/curriculum-utils.ts so that extract_worked_solutions() lands
# on the same per-item text splitAnswerKey() derives at render time.
#
# They are separate from PRACTICE_KEY_RE / QUIZ_KEY_RE above rather than reusing
# them, and the difference is not cosmetic. The existing constants match only
# the header's PREFIX (`**1.`), so _split_items() starts each body immediately
# after it and the item's own stem text lands at the head of the body. The
# TypeScript versions match the WHOLE header line, so the stem becomes
# `label_html` and never appears in the solution. Reusing the existing pair here
# would prepend every item's question to its own worked solution -- which would
# look almost right, which is the problem.
#
# scripts/verify_answer_key_parity.mjs runs both implementations over real
# topics and fails if they ever stop agreeing.

# Mirrors stripAuthoringBlocks(). The trailing \n? is significant: without it
# every removed fence leaves a blank line behind and the two sides disagree on
# interior whitespace.
AUTHORING_BLOCK_RE = re.compile(r'```json\n.*?\n```\n?', re.S)

# Mirrors MINI_QUIZ_HEADING / EXTRA_PRACTICE_HEADING. 3-6 hashes, not the
# exactly-5 that parse_answer_key() splits on above -- matching the TypeScript
# is the point.
TS_MINI_QUIZ_HEADING = re.compile(r'^#{3,6}\s*Mini Quiz', re.M)
TS_EXTRA_PRACTICE_HEADING = re.compile(r'^#{3,6}\s*Extra Practice', re.M)

TS_ANSWER_KEY_BOUNDARIES = (
    (TS_MINI_QUIZ_HEADING, 'mini_quiz'),
    (TS_EXTRA_PRACTICE_HEADING, 'extra_practice'),
)

# Mirror PRACTICE_KEY_RE / QUIZ_KEY_RE. Whole line, so the body starts after it.
TS_PRACTICE_KEY_RE = re.compile(r'^\*\*(\d+)\.[ \t]*(.*)$', re.M)
TS_QUIZ_KEY_RE = re.compile(r'^\*\*Item (\d+):[ \t]*(.*)$', re.M)

TS_KEY_HEADER_RES = {
    'practice': TS_PRACTICE_KEY_RE,
    'mini_quiz': TS_QUIZ_KEY_RE,
    'extra_practice': TS_PRACTICE_KEY_RE,
}

# Mirrors STRAY_HEADING_RE. Level banners and sub-headings sit between items, so
# they fall at the tail of the previous item's body and read as part of its
# solution.
TS_STRAY_HEADING_RE = re.compile(r'^(?:#{1,6}\s.*|\*\*\w+ Level\*\*)\s*$', re.M)


def extract_worked_solutions(answer_key):
    """
    Per-item worked solution markdown, keyed section -> item_number -> string.

    Splits Part 4 once, at upload, into the pieces splitAnswerKey() currently
    derives on every request. The stored column becomes authoritative and the
    TypeScript split stays as the fallback for rows written before this existed
    -- see sql/curriculum_prose_columns.sql for why neither can be deleted.

    The "**Answer: X**" line is KEPT. It is part of the authored solution and
    the teacher reading a worked solution wants to see where it lands; the
    correct letter is separately available on practice_items for anything that
    needs it as data rather than as prose.

    Returns markdown, not HTML. Rendering stays in the TypeScript pipeline where
    KaTeX and the table-scroll rehype plugin already live -- a second renderer
    in Python would have to agree with that one, which is exactly the trap
    sql/curriculum_item_instances.sql describes.
    """
    result = {name: {} for name in SECTION_NAMES}
    if not answer_key:
        return drop_empty_optional(result)

    text = AUTHORING_BLOCK_RE.sub('', answer_key or '')
    if not text.strip():
        return drop_empty_optional(result)

    # The same boundary walk parse_answer_key() uses, with the TypeScript's own
    # regexes. Before Part 5 existed the two-way split could be written inline;
    # with three sections the arithmetic of "where does this block end" is worth
    # having in exactly one place, because splitAnswerKey() in
    # lib/curriculum-utils.ts has to agree with it line for line and
    # scripts/verify_answer_key_parity.mjs fails the build when it does not.
    for name, section_text, header_re in split_answer_key_sections(
            text, TS_ANSWER_KEY_BOUNDARIES, TS_KEY_HEADER_RES):
        matches = list(header_re.finditer(section_text))
        for i, m in enumerate(matches):
            start = m.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(section_text)
            body = TS_STRAY_HEADING_RE.sub('', section_text[start:end]).strip()
            if body:
                result[name][m.group(1)] = body

    return drop_empty_optional(result)


def build_practice_items(practice_problems, mini_quiz, answer_key,
                         extra_practice=''):
    """
    Parse the question sections into structured, gradeable items.

    Parsing happens here, at migration time, rather than in the page component:
    a render-time parser fails silently in front of a student on content it did
    not expect, while this fails on a named file before anything ships.

    Every item carries a `format`. Items with no A-D choices are free-response
    (QR.1.1's practice section is mostly these) and cannot be graded as multiple
    choice, so each section also carries `interactive`: true only when every one
    of its items is multiple choice AND has a known correct answer. The page
    uses that flag to decide between the quiz component and the existing static
    markdown, so a mixed section degrades on its own rather than by hardcoding
    a topic id.

    `extra_practice` is Part 5 and is optional. When a topic has none, the key
    is absent from the result rather than present and empty -- see
    OPTIONAL_SECTIONS for why that distinction is load-bearing.

    Returns:
        {"practice":  {"interactive": bool, "items": [...]},
         "mini_quiz": {"interactive": bool, "items": [...]},
         "extra_practice": {...}}   # only when Part 5 is authored
    """
    key = parse_answer_key(answer_key)
    sections = {}

    for name, source, header_re in (
        ('practice', practice_problems, PRACTICE_STEM_RE),
        ('mini_quiz', mini_quiz, QUIZ_STEM_RE),
        # Part 5 numbers its items 1..N in its own namespace, exactly as Part 2
        # does, so it takes the same stem regex. The namespaces do not collide:
        # every reference to an item is (section, item_number), on the worksheet
        # ref, in curriculum_attempts and in gumu_sessions alike.
        ('extra_practice', extra_practice, PRACTICE_STEM_RE),
    ):
        # Choice lines start with "- A)" and would never match the stem regex,
        # but fenced json in a question section would confuse the split, so
        # drop it defensively.
        text = JSON_BLOCK_RE.sub('', source or '')

        # Level headings ("**Basic Level**") sit between items, so record where
        # each starts and label items by position.
        levels = [(m.start(), m.group(1)) for m in LEVEL_RE.finditer(text)]

        items = []
        for match, (number, body) in zip(header_re.finditer(text),
                                         _split_items(text, header_re)):
            stem, choices = _parse_stem_and_choices(body)
            entry = key.get(name, {}).get(number, {})
            level = None
            for pos, label in levels:
                if pos < match.start():
                    level = label

            items.append({
                'item_number': int(number),
                'format': 'multiple_choice' if choices else 'free_response',
                'stem': stem,
                'choices': choices,
                'correct_answer': entry.get('correct') if choices else None,
                'misconception_tag': entry.get('tags', {}),
                'level': level,
            })

        # An optional section that parsed to nothing is absent, not empty. The
        # 96 topics with no Part 5 keep the practice_items object they have.
        if not items and name in OPTIONAL_SECTIONS:
            continue

        interactive = bool(items) and all(
            i['format'] == 'multiple_choice' and i['correct_answer'] for i in items
        )
        sections[name] = {'interactive': interactive, 'items': items}

    return sections

def validate_practice_items(sections):
    """
    Content-integrity checks on parsed items. Returns a list of warnings.

    The important one is the cross-check: the correct answer is recorded twice,
    independently -- once as "**Answer: X**" prose, and once by omission from
    the misconception_tag map, which tags exactly the wrong options. If those
    two disagree, one of them is wrong and grading cannot be trusted, so the
    disagreement is surfaced rather than silently resolved in favour of either.
    """
    warnings = []

    for name, section in sections.items():
        for item in section['items']:
            n = item['item_number']
            where = f"{name} item {n}"

            if item['format'] == 'free_response':
                continue

            letters = set(item['choices'])
            if letters != {'A', 'B', 'C', 'D'}:
                warnings.append(f"{where}: choices are {sorted(letters)}, expected A-D")

            if not item['stem']:
                warnings.append(f"{where}: empty stem")

            correct = item['correct_answer']
            if not correct:
                warnings.append(f"{where}: no correct answer found in the answer key")
                continue
            if correct not in letters:
                warnings.append(f"{where}: correct answer {correct} is not among its choices")

            tags = item['misconception_tag']
            if tags:
                untagged = letters - set(tags)
                if correct in tags:
                    warnings.append(
                        f"{where}: correct answer {correct} carries a misconception tag")
                if untagged != {correct}:
                    warnings.append(
                        f"{where}: answer key says {correct} but tags leave "
                        f"{sorted(untagged)} untagged")

    return warnings


def require_estimated_time(topic_id, metadata):
    """
    estimated_time_minutes, or raise.

    This used to be `metadata.get('estimated_time_minutes', 45)`. 45 is a legal
    authored value that 24 of the 97 topics genuinely use, so a topic that lost
    the frontmatter key uploaded as 45 and was indistinguishable from the ones
    that mean it. Nothing downstream could tell them apart, and the database
    reported 100% coverage either way.

    Same shape as the `sequence_in_unit` defaults-to-0 defect: a default that is
    also a legal value, so absence of the input cannot be detected after the
    fact. It has to be caught where the input is read.

    Raising rather than defaulting is safe because coverage is 97/97 today, so
    no current upload changes. check_topic.py carries the same rule at commit
    time, which is where an author actually finds out.
    """
    raw = metadata.get('estimated_time_minutes')
    if raw is None:
        raise ValueError(
            f"{topic_id}: frontmatter has no `estimated_time_minutes`. It used to "
            f"default to 45, which is a real value 24 topics use, so the mistake "
            f"was invisible. Add the key.")
    if not isinstance(raw, int) or isinstance(raw, bool) or raw < 1:
        raise ValueError(
            f"{topic_id}: `estimated_time_minutes` is {raw!r}; expected a positive "
            f"integer number of minutes")
    return raw


def upload_course_curriculum(course_id, dry_run=False):
    """
    Upload all markdown files for a course to Supabase.

    Returns the number of topics that failed, so the caller can exit non-zero:
    a per-file error must not be reported as an overall success.
    """
    source_dir = Path(__file__).parent.parent / 'source' / course_id

    if not source_dir.exists():
        print(f"Error: Source directory not found: {source_dir}")
        exit(1)

    # Connected only for a real upload. A dry run parses and validates every
    # file and needs no credentials, which is what makes it usable in CI.
    supabase = connect() if not dry_run else None

    # Find all .md files.
    #
    # The character class is the four strand prefixes, and P is in it: the
    # earlier [QAG] silently matched nothing for the PR strand, so a PR topic
    # file produced no row, no warning and no error -- the run reported success
    # having skipped it. Anything not strand-prefixed (a README, notes) is still
    # left out, which is why this is a class rather than a bare *.md.
    md_files = sorted(source_dir.glob('unit-*/[AGPQ][R]*.md'))
    
    print(f"Found {len(md_files)} curriculum files for {course_id}")
    
    if len(md_files) == 0:
        print("No markdown files found. Check the directory structure.")
        return 1

    failures = 0

    for md_file in md_files:
        unit_folder = md_file.parent.name  # e.g., "unit-1"
        unit_number = int(unit_folder.split('-')[1])
        topic_id = md_file.stem  # e.g., "QR.1.1"
        
        print(f"\nProcessing {topic_id}...", end=" ")
        
        try:
            parsed = parse_markdown_curriculum(md_file)
            
            record = {
                'course_id': course_id,
                'topic_id': topic_id,
                'topic_name': parsed['metadata'].get('topic_name', topic_id),
                'unit_number': unit_number,
                'sequence_in_unit': parsed['metadata'].get('sequence_in_unit', 0),
                'assessment_layer': parsed['metadata'].get('assessment_layer', 'CRC'),
                'objectives': parsed['objectives'],
                'guided_notes': parsed['guided_notes'],
                'practice_problems': {'raw': parsed['practice_problems']},
                'mini_quiz': {'raw': parsed['mini_quiz']},
                'answer_key': {'raw': parsed['answer_key']},
                # Part 5's RAW MARKDOWN IS DELIBERATELY NOT STORED, and there is
                # no `extra_practice` column. The three raw columns above exist
                # because a student page renders them: practice_problems and
                # mini_quiz are the fallback for a topic whose section is not
                # interactive, and answer_key is the teacher's worked solutions.
                # Nothing renders Part 5 -- it reaches a worksheet only as parsed
                # items through practice_items, and its answer key already
                # travels inside answer_key's blob with the rest of Part 4.
                #
                # This is what makes the whole change require ZERO DDL: a third
                # key inside the existing practice_items jsonb, and nothing else.
                # A new column would need a migration run against production,
                # which is a hand-off rather than a merge.
                'estimated_time_minutes': require_estimated_time(topic_id, parsed['metadata']),
                'difficulty_band': parsed['metadata'].get('difficulty_band', 'Basic'),
                'related_strand': parsed['metadata'].get('related_strand', ''),
                'keywords': parsed['metadata'].get('keywords', []),
            }

            record['misconceptions_used'] = extract_misconceptions(
                parsed['practice_problems'],
                parsed['mini_quiz'],
                parsed['extra_practice'],
                parsed['answer_key'],
            )
            record['misconception_tags'] = extract_misconception_tags(
                parsed['answer_key'],
            )
            # Both read the same Part 4 the two lines above do. Kept as separate
            # columns rather than folded into practice_items because they are
            # teacher-only: practice_items is projected to students through
            # curriculum_topics_public, and these two are deliberately not.
            record['distractor_prose'] = extract_distractor_prose(
                parsed['answer_key'],
            )
            record['worked_solutions'] = extract_worked_solutions(
                parsed['answer_key'],
            )
            record['practice_items'] = build_practice_items(
                parsed['practice_problems'],
                parsed['mini_quiz'],
                parsed['answer_key'],
                parsed['extra_practice'],
            )

            for warning in validate_practice_items(record['practice_items']):
                print(f"\n  ! {topic_id}: {warning}", end="")

            if dry_run:
                print(f"[DRY RUN] Would upsert {topic_id}")
                print(f"  Data keys: {list(record.keys())}")
                found = record['misconceptions_used']
                print(f"  misconceptions_used ({len(found)}):")
                for name in found:
                    print(f"    - {name}")
                for name, section in record['practice_items'].items():
                    items = section['items']
                    mc = sum(1 for i in items if i['format'] == 'multiple_choice')
                    print(f"  {name}: {len(items)} items "
                          f"({mc} multiple choice, {len(items) - mc} free response), "
                          f"interactive={section['interactive']}")
                    for i in items:
                        if i['format'] == 'free_response':
                            print(f"    {i['item_number']:2}. [free response] {i['stem'][:60]}")
                        else:
                            print(f"    {i['item_number']:2}. [{i['correct_answer']}] "
                                  f"{i['stem'][:60]}")
                tagged = record['misconception_tags']
                n_tags = sum(len(o) for s in tagged.values() for o in s.values())
                print(f"  misconception_tags ({n_tags} across "
                      f"{sum(len(s) for s in tagged.values())} items):")
                for section, items in tagged.items():
                    for item, options in sorted(items.items(), key=lambda kv: int(kv[0])):
                        pairs = ', '.join(f"{k}={v}" for k, v in sorted(options.items()))
                        print(f"    - {section} {item}: {pairs}")
            else:
                # on_conflict must name the (course_id, topic_id) unique
                # constraint. Without it PostgREST resolves against the primary
                # key alone, so re-running turns into a plain insert and any
                # topic already in the table fails on the unique index instead
                # of updating.
                supabase.table('curriculum_topics').upsert(
                    record, on_conflict='course_id,topic_id'
                ).execute()
                print(f"✓ Uploaded")
        
        except Exception as e:
            failures += 1
            print(f"✗ Error: {str(e)}")

    return failures

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Upload curriculum to Supabase')
    parser.add_argument('--course', required=True, help='Course ID (e.g., tsia2-math)')
    parser.add_argument('--dry-run', action='store_true', help='Dry run mode')
    
    args = parser.parse_args()
    failures = upload_course_curriculum(args.course, dry_run=args.dry_run)

    if failures:
        print(f"\n✗ Failed: {failures} topic(s) did not upload")
        exit(1)

    print("\n✓ Done")