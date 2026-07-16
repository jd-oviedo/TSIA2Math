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
            
            if dry_run:
                print(f"[DRY RUN] Would upsert {topic_id}")
                print(f"  Data keys: {list(record.keys())}")
                found = record['misconceptions_used']
                print(f"  misconceptions_used ({len(found)}):")
                for name in found:
                    print(f"    - {name}")
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