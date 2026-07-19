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
from dotenv import load_dotenv

# Load environment variables from .env.local
env_path = Path(__file__).parent.parent.parent / '.env.local'
print(f"Looking for .env.local at: {env_path}")
print(f"File exists: {env_path.exists()}")

load_dotenv(env_path)

try:
    from supabase import create_client
except ImportError:
    print("Error: supabase not installed. Run: pip install supabase python-frontmatter")
    exit(1)

# Supabase credentials (from env vars)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"SUPABASE_URL found: {bool(SUPABASE_URL)}")
print(f"SUPABASE_SERVICE_ROLE_KEY found: {bool(SUPABASE_SERVICE_ROLE_KEY)}")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("\nError: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables required.")
    print("Check that .env.local exists in the repo root and has both keys set.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def parse_markdown_curriculum(filepath):
    """
    Parse curriculum markdown file into structured components.
    Expects format: frontmatter + Part 1/2/3/4 sections.
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
        if line.startswith('#### **Part 1:'):
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = 'guided_notes'
            current_content = []
        elif line.startswith('#### **Part 2:'):
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = 'practice_problems'
            current_content = []
        elif line.startswith('#### **Part 3:'):
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = 'mini_quiz'
            current_content = []
        elif line.startswith('#### **Part 4:'):
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = 'answer_key'
            current_content = []
        else:
            if current_section:
                current_content.append(line)
    
    if current_section:
        sections[current_section] = '\n'.join(current_content).strip()
    
    return {
        'metadata': metadata,
        'guided_notes': sections.get('guided_notes', ''),
        'practice_problems': sections.get('practice_problems', ''),
        'mini_quiz': sections.get('mini_quiz', ''),
        'answer_key': sections.get('answer_key', '')
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
    Parse Part 4 into per-item correct answers and misconception tags.

    Both come from the same walk on purpose. They are two halves of one fact --
    which option is right, and what each wrong option means -- and parsing them
    separately would let them drift apart on a content edit.

    Returns {section: {item_number: {'correct': 'A'|None, 'tags': {...}}}}.
    """
    result = {'practice': {}, 'mini_quiz': {}}
    if not answer_key:
        return result

    # The tag block is a bare json fragment, not a whole object, so it is read
    # with a key-value regex rather than json.loads.
    tag_block = re.compile(r'"misconception_tag":\s*\{(.*?)\}', re.S)
    pair = re.compile(r'"([A-Z])":\s*"([a-z0-9_]+)"')

    # Part 4 holds both sections back to back under their own headings.
    split = re.split(r'^#####\s*Mini Quiz', answer_key, maxsplit=1, flags=re.M)
    sections = [('practice', split[0], PRACTICE_KEY_RE)]
    if len(split) > 1:
        sections.append(('mini_quiz', split[1], QUIZ_KEY_RE))

    for name, text, header_re in sections:
        for number, body in _split_items(text, header_re):
            answer = ANSWER_RE.search(body)
            tags = {}
            found = tag_block.search(body)
            if found:
                tags = dict(pair.findall(found.group(1)))
            result[name][number] = {
                # Free-response items answer in prose ("**Answer: 0.8**"), so a
                # missing letter here is expected, not an error.
                'correct': answer.group(1) if answer else None,
                'tags': tags,
            }

    return result


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
    return {
        section: {num: entry['tags'] for num, entry in items.items() if entry['tags']}
        for section, items in parsed.items()
    }


def build_practice_items(practice_problems, mini_quiz, answer_key):
    """
    Parse both question sections into structured, gradeable items.

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

    Returns:
        {"practice":  {"interactive": bool, "items": [...]},
         "mini_quiz": {"interactive": bool, "items": [...]}}
    """
    key = parse_answer_key(answer_key)
    sections = {}

    for name, source, header_re in (
        ('practice', practice_problems, PRACTICE_STEM_RE),
        ('mini_quiz', mini_quiz, QUIZ_STEM_RE),
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
    
    # Find all .md files
    md_files = sorted(source_dir.glob('unit-*/[QAG]*.md'))
    
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
                'guided_notes': parsed['guided_notes'],
                'practice_problems': {'raw': parsed['practice_problems']},
                'mini_quiz': {'raw': parsed['mini_quiz']},
                'answer_key': {'raw': parsed['answer_key']},
                'estimated_time_minutes': parsed['metadata'].get('estimated_time_minutes', 45),
                'difficulty_band': parsed['metadata'].get('difficulty_band', 'Basic'),
                'related_strand': parsed['metadata'].get('related_strand', ''),
                'keywords': parsed['metadata'].get('keywords', []),
            }

            record['misconceptions_used'] = extract_misconceptions(
                parsed['practice_problems'],
                parsed['mini_quiz'],
                parsed['answer_key'],
            )
            record['misconception_tags'] = extract_misconception_tags(
                parsed['answer_key'],
            )
            record['practice_items'] = build_practice_items(
                parsed['practice_problems'],
                parsed['mini_quiz'],
                parsed['answer_key'],
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