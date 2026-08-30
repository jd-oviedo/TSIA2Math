#!/usr/bin/env python3
"""
Pre-upload drift check for curriculum topics.

`upload_curriculum.py` has no per-topic filter: it globs the whole course and
upserts every source file it finds, so a round that authors N topics rewrites
every row already live. That is only safe if the rows it rewrites are unchanged.

This script proves that rather than assuming it. For every topic_id that is both
live in Supabase and present in the local source tree, it builds the record the
uploader *would* write and diffs it field by field against the live row. Exits
non-zero if any field differs, so it can gate an upload.

Usage:
  python3 scripts/diff_live_curriculum.py --course tsia2-math
  python3 scripts/diff_live_curriculum.py --course tsia2-math --only QR.1.1,QR.2.1
"""

import argparse
import os
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / 'curriculum' / 'migrations'))

from upload_curriculum import (  # noqa: E402
    parse_markdown_curriculum,
    extract_misconceptions,
    extract_misconception_tags,
    build_practice_items,
)

# The 15 fields upload_curriculum.py writes. Anything the uploader does not set
# (id, created_at, is_placeholder, ...) is deliberately not compared: the upsert
# leaves those columns alone, so a difference there is not drift this run causes.
UPLOADER_FIELDS = [
    'course_id', 'topic_id', 'topic_name', 'unit_number', 'sequence_in_unit',
    'assessment_layer', 'guided_notes', 'practice_problems', 'mini_quiz',
    'answer_key', 'estimated_time_minutes', 'difficulty_band', 'related_strand',
    'keywords', 'misconceptions_used', 'misconception_tags', 'practice_items',
]


def build_record(md_file, course_id):
    """Rebuild the uploader's payload for one source file. Mirrors upload_course_curriculum."""
    unit_number = int(md_file.parent.name.split('-')[1])
    topic_id = md_file.stem
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
    # Part 5 is passed through here for the same reason every other field is:
    # this function has to rebuild what the uploader would send, exactly. Omit
    # it and the comparison inverts -- once a topic with a Part 5 is uploaded,
    # production carries an extra_practice section that this rebuild does not,
    # and the topic reports as drifted forever with nothing to fix.
    record['misconceptions_used'] = extract_misconceptions(
        parsed['practice_problems'], parsed['mini_quiz'],
        parsed['extra_practice'], parsed['answer_key'])
    record['misconception_tags'] = extract_misconception_tags(parsed['answer_key'])
    record['practice_items'] = build_practice_items(
        parsed['practice_problems'], parsed['mini_quiz'], parsed['answer_key'],
        parsed['extra_practice'])
    return record


def connect():
    from dotenv import load_dotenv
    load_dotenv(REPO / '.env.local')
    from supabase import create_client
    url, key = os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        print('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local')
        sys.exit(2)
    return create_client(url, key)


def show(value, limit=160):
    """One-line preview of a field value, long strings truncated with their length."""
    text = repr(value)
    return text if len(text) <= limit else f'{text[:limit]}... (len {len(text)})'


def main():
    ap = argparse.ArgumentParser(description='Diff live curriculum rows against local source')
    ap.add_argument('--course', required=True)
    ap.add_argument('--only', help='Comma-separated topic_ids to restrict the check to')
    args = ap.parse_args()

    source_dir = REPO / 'curriculum' / 'source' / args.course
    local = {f.stem: f for f in sorted(source_dir.glob('unit-*/[AGPQ][R]*.md'))}

    sb = connect()
    rows = sb.table('curriculum_topics').select('*').eq('course_id', args.course).execute().data
    live = {r['topic_id']: r for r in rows}

    only = {t.strip() for t in args.only.split(',')} if args.only else None
    overlap = sorted(set(local) & set(live))
    if only:
        overlap = [t for t in overlap if t in only]

    new_topics = sorted(set(local) - set(live))
    print(f'Live rows: {len(live)}   Local source files: {len(local)}')
    print(f'Topics both live and local (these get rewritten): {len(overlap)}')
    if new_topics:
        print(f'New topics this upload would insert ({len(new_topics)}): {", ".join(new_topics)}')
    print()

    drifted = 0
    for topic_id in overlap:
        record = build_record(local[topic_id], args.course)
        diffs = []
        for field in UPLOADER_FIELDS:
            want, got = record[field], live[topic_id].get(field)
            if want != got:
                diffs.append((field, got, want))
        if diffs:
            drifted += 1
            print(f'✗ {topic_id}: {len(diffs)} field(s) differ')
            for field, got, want in diffs:
                print(f'    {field}')
                print(f'      live  : {show(got)}')
                print(f'      upload: {show(want)}')
        else:
            print(f'✓ {topic_id}: all {len(UPLOADER_FIELDS)} uploader-written fields match')

    print()
    if drifted:
        print(f'DIRTY: {drifted} of {len(overlap)} live rows would be changed by this upload.')
        return 1
    print(f'CLEAN: all {len(overlap)} live rows would be rewritten byte for byte identical.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
