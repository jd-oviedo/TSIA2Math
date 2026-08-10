#!/usr/bin/env python3
"""
Upsert the built question_bank.json into the Supabase questions table.
Run from repo root: python3 upload_to_supabase.py
Requires: pip install supabase --break-system-packages

Reads public/data/question_bank.json, which is a build artifact -- regenerate
it with `python3 scripts/build_bank.py` after changing anything under
data/items/. Uploading a stale artifact is the easiest way to silently revert
item content, so the script refuses to run if the artifact is older than the
newest source file.

Items now carry `misconception_tag`, a per-option map of taxonomy slugs that
is answer-bearing by omission (the correct option is absent, so the missing
letter is the answer). The column has to exist before this runs -- upsert
sends whole objects, so an unknown column fails the whole batch, not just that
field. Apply sql/questions_misconception_tag.sql first; the preflight below
checks for it and says so if it is missing.
"""
import json, os, sys
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    print("Installing supabase...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "supabase", "--break-system-packages", "-q"])
    from supabase import create_client

SRC = Path("public/data/question_bank.json")

# Read from .env.local
env = {}
for line in Path(".env.local").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip()

url = env.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    sys.exit(1)

print(f"Connecting to {url}")
client = create_client(url, key)

# --- preflight: is the artifact current? ----------------------------------
# build_bank.py writes SRC from data/items/**. An artifact older than its
# sources means someone edited items and did not rebuild, and upserting it
# would quietly roll those edits back in production.
sources = sorted(Path("data/items").rglob("*.json"))
if sources and SRC.exists():
    newest = max(p.stat().st_mtime for p in sources)
    if SRC.stat().st_mtime < newest:
        stale = [p for p in sources if p.stat().st_mtime > SRC.stat().st_mtime]
        print(f"ERROR: {SRC} is older than {len(stale)} source file(s), e.g. {stale[0]}")
        print("       Run: python3 scripts/build_bank.py")
        sys.exit(1)

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

items = data if isinstance(data, list) else data.get("items", [])
print(f"Loaded {len(items)} items from {SRC}")

# --- preflight: does the target table have every column we are sending? ----
# upsert sends whole objects, so one unknown column fails the entire batch
# with a PostgREST 42703 and no rows written. Checked up front so the failure
# names the migration instead of a raw column error mid-upload.
tagged = sum(1 for i in items if i.get("misconception_tag"))
if tagged:
    probe = client.table("questions").select("misconception_tag").limit(1).execute()
    if getattr(probe, "error", None):
        print(f"ERROR: {tagged} items carry misconception_tag, but the questions table")
        print("       has no such column. Apply sql/questions_misconception_tag.sql in")
        print("       the Supabase SQL editor first, then re-run this script.")
        sys.exit(1)
    print(f"Preflight OK: misconception_tag present on questions ({tagged} tagged items to upload)")

BATCH = 50
updated = 0
for i in range(0, len(items), BATCH):
    batch = items[i:i+BATCH]
    res = client.table("questions").upsert(batch, on_conflict="item_id").execute()
    updated += len(batch)
    print(f"  Upserted {updated}/{len(items)}...")

print(f"Done. {len(items)} items upserted into Supabase.")
