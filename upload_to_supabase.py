#!/usr/bin/env python3
"""
One-time script: upsert migrated question_bank.json into Supabase questions table.
Run from repo root: python3 upload_to_supabase.py
Requires: pip install supabase --break-system-packages
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

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

items = data if isinstance(data, list) else data.get("items", [])
print(f"Loaded {len(items)} items from {SRC}")

BATCH = 50
updated = 0
for i in range(0, len(items), BATCH):
    batch = items[i:i+BATCH]
    res = client.table("questions").upsert(batch, on_conflict="item_id").execute()
    updated += len(batch)
    print(f"  Upserted {updated}/{len(items)}...")

print(f"Done. {len(items)} items upserted into Supabase.")
