#!/usr/bin/env python3
"""Report what the public anon key can read and write on every exposed relation.

Written because curriculum_topics shipped readable -- and writable -- by the
anon key for the entire life of the curriculum feature, and the only reason it
was ever caught was somebody running a curl by hand. The application layer
redacted correctly the whole time: topic-data.ts stripped every answer before
render and gated answer_key behind requireTeacher(). None of that mattered,
because the table underneath answered to anyone holding a key that ships in the
browser bundle by design. No test could see it, because no test talks to
PostgREST as a stranger. This one does.

Three checks per relation:

  READ    Does the anon key get rows back? This is the load-bearing check.
          Zero rows means either no grant (42501) or RLS with no policy, and
          both are safe.

  GRANT   Does anon hold UPDATE/DELETE? Probed with a self-contradictory
          filter (col is null AND col is not null) so the statement is
          authorised, planned, and matches nothing -- the grant is revealed
          without a row being touched. Note this cannot use an empty PATCH
          body: PostgREST answers those 204 without executing anything, which
          reads as a grant on every table in the database.

  COLUMNS For relations that are meant to be public, are any answer-bearing
          column names present, and does the column list still match what was
          pinned in EXPECTED_COLUMNS?

          NOTE, corrected 2026-08-16. This check was written to read anon's own
          OpenAPI spec, and its docstring called that the load-bearing half
          because it fires even when a relation returns no rows. It no longer
          runs: the project answers GET /rest/v1/ with 401 "Only the
          `service_role` API key can be used for this endpoint", so
          spec_columns() returns None for anon on every call and has been doing
          so silently apart from a stderr warning. Found while pinning
          questions_public.

          What actually runs is the observed-key path: the columns present on
          the rows anon really receives. That is a true reading of what anon can
          see, and it is what the EXPECTED_COLUMNS comparison uses.

          KNOWN GAP, accepted deliberately. The observed-key path cannot
          distinguish "this relation has no columns" from "this relation
          returned no rows" -- both look like an empty column list, because the
          columns are read off a row and there is no row to read. So a pinned
          relation that went empty would report an unreadable column list rather
          than naming which columns went missing. It fails the audit either way,
          which is why this is a gap in precision and not in safety. Closing it
          would mean probing each expected column with select=<col>&limit=1,
          where 200 means present and 400 means absent. Not done: both public
          views are far from zero rows (86 and 1124 as of 2026-08-16), so the
          gap is theoretical today. Revisit if a pinned relation can legitimately
          be empty.

  CONTENT For those same relations, does any answer-SHAPE appear in the payload
          anon receives? Column names are not enough: mini_quiz and
          practice_problems are served raw, so an answer pasted into the
          authored markdown is invisible to a column check. Every row is
          fetched and scanned, and forbidden keys are sought at any depth.
          See scripts/answer_shapes.py.

A GRANT with no READ is reported but does not fail the audit: with RLS enabled
and no policy the statement is authorised and still affects zero rows. It is
worth seeing, because RLS is the only thing standing on it.

Usage: scripts/audit_anon_exposure.py
Reads NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
SUPABASE_SERVICE_ROLE_KEY from the environment or .env.local.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import answer_shapes  # noqa: E402  (after the path insert, by necessity)

ROOT = Path(__file__).resolve().parent.parent

# Relations a stranger is allowed to read. Anything else returning rows fails.
# Keep this short and justify every addition.
PUBLIC_BY_DESIGN = {"questions_public", "curriculum_topics_public"}

# Column names that must never appear in an anon-readable payload.
#
# `misconception_tag` is answer-bearing the same way `correct_answer` is, but
# by omission rather than by value: the map holds one slug per wrong option and
# leaves the correct letter out, so its absence names the answer. That holds for
# the CAT bank column (questions.misconception_tag) exactly as it does for the
# curriculum one -- see the header of curriculum/migrations/upload_curriculum.py.
FORBIDDEN = {
    "correct_answer",
    "misconception_tag",
    "misconception_tags",
    "misconceptions_used",
    "answer_key",
    "distractor_logic",
    "explanation",
    "rationale",
}

# The exact column list each public view is expected to expose, in order.
#
# Asserted in BOTH directions, which is the point. An added answer-bearing
# column is the obvious risk and the FORBIDDEN check above already covers it.
# The direction that check misses is a column silently going AWAY:
# topic-data.ts selects is_placeholder on the anonymous path, so a rebuild that
# drops it makes PostgREST reject the select, loadTopic falls to notFound(), and
# every topic page 404s for every signed-out student while this audit reports
# nothing wrong.
#
# That is issue #84. It was found by someone reading a file. This is what turns
# the next occurrence into a failing check.
EXPECTED_COLUMNS = {
    "curriculum_topics_public": [
        "id", "course_id", "topic_id", "topic_name", "unit_number",
        "sequence_in_unit", "estimated_time_minutes", "difficulty_band",
        "assessment_layer", "related_strand", "keywords", "prerequisites",
        "guided_notes", "practice_items", "practice_problems", "mini_quiz",
        "created_at", "updated_at", "is_placeholder",
    ],
    # Captured from production 2026-08-16, not transcribed from
    # sql/questions_lockdown.sql. The premise of issue #84 is that checked-in
    # DDL is not trustworthy until proven otherwise, and that applies to the CAT
    # side too: this list is the key set observed on all 1124 live rows read
    # through the anon key, which agreed on a single distinct key tuple.
    #
    # Independently probed as absent from this view: correct_answer,
    # misconception_tag, explanation, rationale, distractor_logic (all HTTP 400).
    "questions_public": [
        "item_id", "status", "question_text", "answer_choices", "primary_strand",
        "topic_id", "proficiency_level", "assessment_layer", "difficulty_level",
        "calculator_type", "requires_calculator", "contains_image", "image_url",
        "category", "objective_text", "figure_type", "figure_props",
    ],
}

# Fields served to anon WITHOUT redaction, and therefore safe only by authoring
# convention. practice_items is protected by jsonb_strip_keys and is scanned
# too, because a redaction that failed on a nested branch is exactly the thing
# a top-level column check cannot see.
CONTENT_SCAN_FIELDS = {
    "curriculum_topics_public": ("mini_quiz", "practice_problems", "practice_items"),
}


def load_env() -> None:
    env = ROOT / ".env.local"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


def request(url: str, key: str, method: str = "GET", headers=None, body=None):
    """Returns (status, headers, text). Never raises on an HTTP error status."""
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    for name, value in (headers or {}).items():
        req.add_header(name, value)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, dict(resp.headers), resp.read().decode()
    except urllib.error.HTTPError as err:
        return err.code, dict(err.headers), err.read().decode()
    except urllib.error.URLError as err:
        return 0, {}, str(err)


def row_count(url: str, key: str, relation: str):
    """Rows anon can see, or None when the request was refused outright."""
    status, headers, _ = request(
        f"{url}/rest/v1/{relation}?select=*",
        key,
        headers={"Prefer": "count=exact", "Range": "0-0"},
    )
    rng = headers.get("Content-Range") or headers.get("content-range")
    if status >= 400 or not rng or "/" not in rng:
        return None
    total = rng.rsplit("/", 1)[1]
    return int(total) if total.isdigit() else None


def write_grants(url: str, key: str, relation: str, column: str):
    """UPDATE/DELETE grants anon holds, probed against a zero-row filter."""
    if not column:
        return []
    # Self-contradictory and therefore guaranteed to match nothing, while
    # still naming a real column so PostgREST plans and runs the statement.
    where = f"{column}=is.null&{column}=not.is.null"
    held = []
    for method, body in (("PATCH", {column: None}), ("DELETE", None)):
        status, _, _ = request(
            f"{url}/rest/v1/{relation}?{where}", key, method=method, body=body
        )
        if status in (200, 204):
            held.append(method.replace("PATCH", "UPDATE"))
    return held


def fetch_all(url: str, key: str, relation: str, page: int = 1000):
    """Every row anon can read, paged. Returns (rows, error) with one of them None.

    EVERY row, not a sample. The previous column check sampled `limit=1`, which
    cannot see a leak on row 57 of 86 -- and a leak arrives one authored topic at
    a time, so the sampled row is the least likely place to find it.
    """
    rows, offset = [], 0
    while True:
        status, _, text = request(
            f"{url}/rest/v1/{relation}?select=*",
            key,
            headers={"Range-Unit": "items", "Range": f"{offset}-{offset + page - 1}"},
        )
        if status >= 400 or status == 0:
            return None, f"HTTP {status}"
        try:
            batch = json.loads(text)
        except json.JSONDecodeError:
            return None, "response was not JSON"
        if not isinstance(batch, list):
            return None, f"expected a list, got {type(batch).__name__}"
        rows.extend(batch)
        if len(batch) < page:
            return rows, None
        offset += page


def content_findings(rows, fields):
    """(findings, rows_scanned, fields_scanned) for answer shapes in the payload.

    Scans the named fields when a relation declares them, and every field
    otherwise, so a relation added to CONTENT_SCAN_FIELDS-less config is still
    covered rather than silently skipped.
    """
    findings, rows_scanned, fields_scanned = [], 0, 0
    for row in rows:
        if not isinstance(row, dict):
            continue
        rows_scanned += 1
        targets = [f for f in fields if f in row] if fields else list(row)
        for field in targets:
            fields_scanned += 1
            for kind, detail in answer_shapes.scan_payload(row[field]):
                ident = row.get("topic_id") or row.get("id") or "?"
                findings.append(f"{ident}.{field}: {kind} - {detail[:70]}")
    return findings, rows_scanned, fields_scanned


def spec_columns(url: str, key: str):
    """Columns each relation declares in the OpenAPI spec for this key.

    Read with the anon key, this is what a stranger is told the relation has,
    independent of whether any row currently comes back. A public view that
    gains an answer-bearing column shows up here immediately; the sampled-row
    check does not fire until that view returns a row containing it.
    """
    status, _, text = request(f"{url}/rest/v1/", key)
    if status != 200:
        return None
    try:
        definitions = json.loads(text).get("definitions", {})
    except json.JSONDecodeError:
        return None
    return {name: set(body.get("properties", {})) for name, body in definitions.items()}


def main() -> int:
    load_env()
    try:
        url = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
        anon = os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
        service = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    except KeyError as err:
        print(f"Missing environment variable: {err}", file=sys.stderr)
        return 2

    # The service role's OpenAPI spec is the full relation list. The anon spec
    # shows only what anon can already see, which is the thing being audited.
    status, _, text = request(f"{url}/rest/v1/", service)
    if status != 200:
        print(f"Could not enumerate relations (HTTP {status})", file=sys.stderr)
        return 2
    definitions = json.loads(text).get("definitions", {})
    if not definitions:
        print("No relations found", file=sys.stderr)
        return 2

    # What anon is told each relation contains. None means the spec could not
    # be read, which is reported rather than silently skipped -- a column check
    # that quietly stops running is worse than no column check.
    anon_spec = spec_columns(url, anon)
    if anon_spec is None:
        print("NOTE: the anon OpenAPI spec is not readable (the project restricts "
              "GET /rest/v1/ to service_role), so column checks read the columns "
              "actually present on anon's rows. Pinned relations still fail if "
              "their column list cannot be read; see the COLUMNS note above.",
              file=sys.stderr)

    print(f"{'RELATION':<26} {'ANON ROWS':<10} {'ANON GRANTS':<16} {'VERDICT':<8} DETAIL")
    print("-" * 100)

    failures = 0
    notes = 0

    for relation in sorted(definitions):
        columns = list(definitions[relation].get("properties", {}))
        rows = row_count(url, anon, relation)
        grants = write_grants(url, anon, relation, columns[0] if columns else "")

        readable = rows is not None and rows > 0
        verdict, detail = "OK", ""

        # Column check for the public views. Deliberately NOT gated on
        # `readable`: a view that declares an answer-bearing column is a
        # regression whether or not it happens to return rows right now.
        if relation in PUBLIC_BY_DESIGN:
            declared = sorted(FORBIDDEN.intersection(anon_spec.get(relation, set()))) \
                if anon_spec else []

            # Every row, and every answer-bearing shape inside it.
            content, scanned_rows, scanned_fields, fetch_err = [], 0, 0, None
            all_rows = []
            if readable:
                all_rows, fetch_err = fetch_all(url, anon, relation)
                if all_rows is not None:
                    content, scanned_rows, scanned_fields = content_findings(
                        all_rows, CONTENT_SCAN_FIELDS.get(relation)
                    )

            sampled = sorted(FORBIDDEN.intersection(all_rows[0])) \
                if all_rows else []

            # The column list, both directions. Prefer the anon spec; fall back
            # to observed keys so a spec that could not be read does not silently
            # disable the check.
            col_problems = []
            expected = EXPECTED_COLUMNS.get(relation)
            if expected:
                actual = set(anon_spec.get(relation, set())) if anon_spec else \
                    (set(all_rows[0]) if all_rows else set())
                if actual:
                    missing = [c for c in expected if c not in actual]
                    added = sorted(actual - set(expected))
                    if missing:
                        col_problems.append("columns MISSING: " + ", ".join(missing))
                    if added:
                        col_problems.append("columns ADDED: " + ", ".join(added))
                else:
                    col_problems.append("column list could not be read")

            # A content check that scanned nothing must never read as a pass.
            scan_broken = None
            if readable and rows:
                if fetch_err or all_rows is None:
                    scan_broken = f"could not fetch rows to scan ({fetch_err})"
                elif scanned_rows == 0:
                    scan_broken = f"scanned 0 of {rows} rows"
                elif scanned_rows < rows:
                    scan_broken = f"scanned only {scanned_rows} of {rows} rows"
                elif scanned_fields == 0:
                    scan_broken = f"scanned {scanned_rows} rows but 0 fields"

            if declared or sampled or content or col_problems or scan_broken:
                verdict = "LEAK"
                where = []
                if declared:
                    where.append("declared in anon spec: " + ", ".join(declared))
                if sampled:
                    where.append("present in row: " + ", ".join(sampled))
                if content:
                    where.append(f"answer shapes in {len(content)} field(s): "
                                 + "; ".join(content[:3])
                                 + (" ..." if len(content) > 3 else ""))
                if col_problems:
                    where.append("; ".join(col_problems))
                if scan_broken:
                    where.append("CONTENT CHECK DID NOT RUN: " + scan_broken)
                detail = "; ".join(where)
            elif readable:
                cols_note = (f"{len(expected)} columns as expected" if expected
                             else "no column list pinned")
                detail = (f"public by design, redacted ({rows} rows); "
                          f"content clean across {scanned_rows} rows / "
                          f"{scanned_fields} fields; {cols_note}")
        elif readable:
            verdict = "LEAK"
            detail = f"{rows} rows readable with no login"

        if grants:
            held = "+".join(grants)
            if readable:
                verdict = "LEAK"
                detail = f"{detail}; anon holds {held} on readable rows".lstrip("; ")
            else:
                # Authorised but inert: RLS has no policy, so it affects nothing.
                notes += 1
                detail = detail or f"grant present ({held}), held off by RLS only"

        if verdict == "LEAK":
            failures += 1

        shown = "denied" if rows is None else str(rows)
        print(
            f"{relation:<26} {shown:<10} {'+'.join(grants) or 'none':<16} "
            f"{verdict:<8} {detail}"
        )

    print()
    if failures:
        print(f"FAIL - {failures} relation(s) exposed to the anon key. See LEAK rows.")
    else:
        print("PASS - nothing readable by the anon key beyond the redacted public views.")
    if notes:
        print(
            f"NOTE - {notes} relation(s) grant anon UPDATE/DELETE with nothing readable. "
            "Inert while RLS has no policy; disabling RLS on any of them would expose it."
        )
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
