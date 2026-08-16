"""Answer-shaped content, and where it must never appear.

One definition, imported by both checks that need it:

  scripts/check_topic.py          gates the commit, scans authored markdown
  scripts/audit_anon_exposure.py  gates production, scans what anon receives

They are deliberately not two copies. A pre-commit gate and a production audit
that drift apart is the same defect this module exists to catch, one level up.

WHY THIS EXISTS

curriculum_topics_public redacts practice_items with jsonb_strip_keys, which is
key-based and cannot miss a branch. It selects mini_quiz and practice_problems
RAW. Those two are safe only because the authored markdown never puts an answer
in Part 2 or Part 3, and nothing enforces that.

upload_curriculum.py splits a topic on four `#### **Part N:` line prefixes.
Part 3 is the Mini Quiz and Part 4 is the Answer Key, and they land in different
columns. Break the Part 4 heading -- three hashes instead of four, a missing
asterisk -- and the split never fires, Part 3 swallows the answer key, and the
worked solutions ship to every signed-out student through the public view. No
existing check sees it: the content is valid markdown, the JSON parses, the
tally still counts, and the page renders.

WHAT IS MATCHED, AND WHY BY SHAPE

Vocabulary drifts and prose is unpredictable, so these match the STRUCTURE the
answer key is written in rather than words that might mean an answer:

  json_fence        ```json blocks. Part 4 uses them for distractor_logic and
                    misconception_tag. Parts 2 and 3 never do, so presence is a
                    structural signal rather than a guess about wording.
  answer_line       **Answer: C**, the literal answer-key format.
  answer_key_head   an "Answer Key" heading.
  key_name          a machine key name (correct_answer, misconception_tag,
                    distractor_logic) appearing anywhere in the text.
  correct_label     "Correct:" as used to open a distractor_logic entry.

KEY_NAMES is also used structurally, against JSON payloads rather than text, to
find a forbidden key at ANY DEPTH. A top-level key check is not enough: the
redaction strips correct_answer from inside
practice_items -> {practice,mini_quiz} -> items[], so a redaction that failed on
one nested branch would leave the top level looking clean.
"""

import re

# Machine key names that are answer-bearing wherever they appear.
#
# misconception_tag is answer-bearing by omission rather than by value: the map
# holds one slug per WRONG option and leaves the correct letter out, so its
# absence names the answer. See the FORBIDDEN note in audit_anon_exposure.py.
KEY_NAMES = frozenset({
    "correct_answer",
    "misconception_tag",
    "misconception_tags",
    "misconceptions_used",
    "answer_key",
    "distractor_logic",
})

# (name, regex). Ordered most structural first.
TEXT_PATTERNS = (
    ("json_fence", re.compile(r"```json", re.I)),
    ("answer_line", re.compile(r"^\s*\*\*Answer:\s*[A-D]\*\*", re.M)),
    ("answer_key_head", re.compile(r"^\s*#*\s*.*\bAnswer\s+Key\b", re.I | re.M)),
    ("key_name", re.compile(r"\b(" + "|".join(sorted(KEY_NAMES)) + r")\b")),
    ("correct_label", re.compile(r'"?\bCorrect\b"?\s*:', re.I)),
)


def scan_text(text):
    """Pattern names that matched, with the first matching excerpt.

    Returns [] for a clean string. Never raises: a non-string is reported as
    nothing found rather than crashing a caller mid-audit.
    """
    if not isinstance(text, str) or not text:
        return []
    out = []
    for name, rx in TEXT_PATTERNS:
        m = rx.search(text)
        if m:
            excerpt = " ".join(text[max(0, m.start() - 20):m.end() + 40].split())
            out.append((name, excerpt))
    return out


def walk_keys(node, found=None):
    """Every mapping key appearing anywhere in a nested structure.

    Depth matters: the redaction operates inside
    practice_items -> section -> items[], so a forbidden key that survived on
    one nested branch is invisible to a top-level key check.
    """
    if found is None:
        found = set()
    if isinstance(node, dict):
        for k, v in node.items():
            found.add(k)
            walk_keys(v, found)
    elif isinstance(node, list):
        for v in node:
            walk_keys(v, found)
    return found


def walk_strings(node):
    """Every string value anywhere in a nested structure, plus bare strings."""
    out = []
    if isinstance(node, str):
        out.append(node)
    elif isinstance(node, dict):
        for v in node.values():
            out.extend(walk_strings(v))
    elif isinstance(node, list):
        for v in node:
            out.extend(walk_strings(v))
    return out


def scan_payload(node):
    """Findings for one JSON-ish value: forbidden keys at depth, plus text.

    Returns a list of (kind, detail) where kind is either 'key' or a
    TEXT_PATTERNS name.
    """
    findings = []
    for key in sorted(KEY_NAMES.intersection(walk_keys(node))):
        findings.append(("key", f"forbidden key {key!r} present at some depth"))
    for s in walk_strings(node):
        for name, excerpt in scan_text(s):
            findings.append((name, excerpt))
    return findings
