#!/usr/bin/env python3
"""Prove the curriculum answer key never reaches a non-teacher's page.

Companion to scripts/audit_anon_exposure.py. That one asks what the anon key can
read straight off PostgREST; this one asks what the rendered page hands to a
visitor who is not a teacher. Same class of question, one layer up.

Worth pinning because the gate is spread across four places that all have to
keep agreeing, in app/course/.../topic/[topicId]/topic-data.ts:

  requireTeacher() resolves before the topic is read
  a non-teacher reads curriculum_topics_public, a view with no answer_key column
  the answer_key column is only in the select for a teacher
  answerKeyRaw and answerKey collapse to empty for a non-teacher, so
  solutionsFor() returns undefined and the reveal link is never rendered

Any one of those quietly changing would leak worked solutions to every student,
and none of it is covered by a type or a build. A reviewer adding answer_key to
the public view, or dropping the `teacher ?` from the select, would ship green.

Three checks, run anonymously against a live server:

  MARKERS  Is any answer-key chrome in the payload? "Reveal solution",
           "Teacher view", a rendered "Answer: B", a raw correct_answer or
           misconception_tag key. A fixed list, so it is fast and blunt.

  CONTENT  Is any sentence that exists ONLY in the answer key present in the
           payload? Derived per topic from the database rather than hardcoded:
           candidate phrases are taken from answer_key and then filtered to
           those absent from guided_notes, practice_problems and mini_quiz, so
           a phrase the student is supposed to see cannot produce a false
           positive. This is the load-bearing check -- it survives the markup
           being rewritten, because it tests for the solution text itself.

  VIEW     Does curriculum_topics_public still refuse to carry answer_key, and
           are correct_answer and misconception_tag still stripped out of its
           practice_items? Catches the leak at the source, before any page is
           involved, and fires even with no server running.

What this cannot check: that a real teacher DOES see the answer key. That needs
a signed-in teacher session, and a cookie in a script is a worse idea than the
coverage is worth. The positive path is exercised every time a teacher opens a
topic.

Usage:
  scripts/audit_teacher_gate.py                        # localhost:3000
  scripts/audit_teacher_gate.py --base-url https://... # a deployed target
  scripts/audit_teacher_gate.py --view-only            # no server needed

Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment or
.env.local: the service role is used only to learn what the answer keys say, so
the script knows what a leak would look like.
"""

import argparse
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

# Answer-key chrome and raw field names. None of these may appear in a page
# served to a non-teacher.
MARKERS = (
    'Reveal solution',
    'Teacher view',
    'distractor_logic',
    'correct_answer',
    'misconception_tag',
)

# The rendered form of "**Answer: B**", which only ever appears in Part 4.
ANSWER_LINE = re.compile(r'Answer:\s*[A-D]\b')

ROUTES = ('lesson', 'practice', 'quiz')

# A phrase has to be this long to be worth testing. Short fragments collide with
# ordinary prose and produce noise.
MIN_PHRASE = 45


def load_env():
    env = Path(__file__).resolve().parent.parent / '.env.local'
    if env.exists():
        for line in env.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"\''))


def admin_client():
    load_env()
    url, key = os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        print('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
        sys.exit(2)
    from supabase import create_client
    return create_client(url, key)


def secret_phrases(row):
    """
    Sentences that exist in this topic's answer key and nowhere a student looks.

    The answer key restates each question as its header, so a naive sample would
    pick up stems that are legitimately student-facing. Everything present in
    guided_notes, practice_problems or mini_quiz is therefore removed, which
    leaves only worked-solution prose.
    """
    key = ((row.get('answer_key') or {}).get('raw') or '')
    # The fenced json blocks are stripped before render, so they are covered by
    # the MARKERS check rather than here.
    key = re.sub(r'```json\n.*?\n```', '', key, flags=re.S)

    student_facing = ' '.join([
        row.get('guided_notes') or '',
        ((row.get('practice_problems') or {}).get('raw') or ''),
        ((row.get('mini_quiz') or {}).get('raw') or ''),
    ])
    # Compared with markdown emphasis removed, so "**Answer**" and "Answer"
    # are not treated as different strings.
    plain = lambda s: re.sub(r'[*_`]', '', s)
    student_facing = plain(student_facing)

    out = []
    for raw_line in key.split('\n'):
        line = plain(raw_line).strip().lstrip('-').strip()
        if len(line) < MIN_PHRASE:
            continue
        if line in student_facing or line[:MIN_PHRASE] in student_facing:
            continue
        out.append(line)
    return out


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'audit-teacher-gate'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')
    except Exception as e:
        return None, str(e)


def check_view(sb, course_id):
    """The public view must not carry answer_key, or answers inside practice_items."""
    failures = 0

    try:
        sb.table('curriculum_topics_public').select('answer_key').limit(1).execute()
        print('  VIEW  LEAK    curriculum_topics_public exposes an answer_key column')
        failures += 1
    except Exception as e:
        if 'does not exist' in str(e):
            print('  VIEW  ok      curriculum_topics_public has no answer_key column')
        else:
            print(f'  VIEW  ERROR   unexpected response probing answer_key: {str(e)[:90]}')
            failures += 1

    rows = (sb.table('curriculum_topics_public')
            .select('topic_id, practice_items')
            .eq('course_id', course_id).execute().data)
    bad = []
    for row in rows:
        for section in (row.get('practice_items') or {}).values():
            if not isinstance(section, dict):
                continue
            for item in section.get('items', []):
                if 'correct_answer' in item or 'misconception_tag' in item:
                    bad.append(row['topic_id'])
                    break
    if bad:
        print(f'  VIEW  LEAK    answers inside practice_items for: {", ".join(sorted(set(bad)))}')
        failures += 1
    else:
        print(f'  VIEW  ok      practice_items redacted across {len(rows)} topic(s)')

    return failures


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default='http://localhost:3000')
    ap.add_argument('--course', default='tsia2-math')
    ap.add_argument('--limit', type=int, default=0, help='check only the first N topics')
    ap.add_argument('--view-only', action='store_true', help='skip the HTTP checks')
    args = ap.parse_args()

    sb = admin_client()

    print(f'Teacher-gate audit, course {args.course}\n')
    failures = check_view(sb, args.course)

    if args.view_only:
        print('\nPASS - view checks only' if not failures else '\nFAIL')
        return 1 if failures else 0

    rows = (sb.table('curriculum_topics')
            .select('topic_id, unit_number, is_placeholder, answer_key, '
                    'guided_notes, practice_problems, mini_quiz')
            .eq('course_id', args.course).eq('is_placeholder', False)
            .order('unit_number').order('sequence_in_unit').execute().data)
    if args.limit:
        rows = rows[:args.limit]

    test, subject = args.course.split('-', 1)
    print(f'\nAnonymous fetches against {args.base_url}, {len(rows)} topic(s) x {len(ROUTES)} routes\n')
    print(f'  {"topic":9} {"route":9} {"http":5} {"markers":8} {"answer-line":12} {"solution text":14}')

    for row in rows:
        phrases = secret_phrases(row)
        for route in ROUTES:
            url = (f'{args.base_url}/course/{test}/{subject}/unit/{row["unit_number"]}'
                   f'/topic/{row["topic_id"]}/{route}')
            status, body = fetch(url)
            if status != 200:
                print(f'  {row["topic_id"]:9} {route:9} {str(status):5} '
                      f'{"-":8} {"-":12} could not fetch')
                failures += 1
                continue

            hit_markers = [m for m in MARKERS if m in body]
            hit_answer = bool(ANSWER_LINE.search(body))
            hit_text = [p for p in phrases if p[:MIN_PHRASE] in body]

            bad = bool(hit_markers or hit_answer or hit_text)
            failures += 1 if bad else 0
            print(f'  {row["topic_id"]:9} {route:9} {status:<5} '
                  f'{("LEAK " + str(len(hit_markers))) if hit_markers else "clean":8} '
                  f'{"LEAK" if hit_answer else "clean":12} '
                  f'{("LEAK " + str(len(hit_text))) if hit_text else f"clean/{len(phrases)}":14}')
            for m in hit_markers:
                print(f'      ! marker present: {m}')
            if hit_answer:
                print(f'      ! rendered answer line: '
                      f'{ANSWER_LINE.search(body).group(0)}')
            for p in hit_text[:3]:
                print(f'      ! solution text present: {p[:80]}')

    print()
    if failures:
        print(f'FAIL - {failures} check(s) failed. The answer key is reaching non-teachers.')
    else:
        print('PASS - no answer-key chrome, answer letter or solution text in any '
              'anonymous payload, and the public view carries no answers.')
        print('       Not covered: that a real teacher does see it. That needs a '
              'signed-in session.')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
