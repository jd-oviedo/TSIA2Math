#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit_distractor_logic.py -- READ-ONLY. Reports distractor_logic entries whose
prose disagrees with the option it is attached to. Writes nothing, ever.

Two defect shapes, reported separately because they need different fixes:

  A. RESOLVE-TO-WRONG-CHOICE -- the prose's terminal value is another option's
     value, so a student following the reasoning exactly would pick a different
     letter. This is the AR_A_010 shape (fixed 2026-08-13, PR #72).

  B. TAG-VS-PROSE -- the misconception_tag names an error the prose does not
     describe. This is the GR_A_034 option A shape (parked).

Every hit is a decision, not a fix. Nothing here is auto-correctable: deciding
whether the prose or the option is wrong needs a human who knows the item.

    python3 scripts/audit_distractor_logic.py            # full report
    python3 scripts/audit_distractor_logic.py --strand QR
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ITEMS = ROOT / "data" / "items"

# ---------------------------------------------------------------- normalising

def strip_math(s):
    """LaTeX/unicode -> a plain string we can hunt numbers in."""
    s = s.replace("\u2212", "-").replace("\u2013", "-").replace("\u00d7", "*")
    s = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"(\1)/(\2)", s)
    s = re.sub(r"\\sqrt\{([^{}]*)\}", r"sqrt(\1)", s)
    s = re.sub(r"\\[a-zA-Z]+", " ", s)
    return s.replace("$", " ").replace("{", " ").replace("}", " ")

NUM = r"-?\d[\d,]*(?:\.\d+)?"
UNITS = {"cm", "m", "mm", "km", "ft", "feet", "foot", "yd", "yds", "yard", "yards",
         "in", "inch", "inches", "mi", "mile", "miles", "s", "sec", "min", "hr",
         "h", "kg", "g", "lb", "lbs", "oz", "l", "ml", "liter", "liters", "gal",
         "%", "°", "cm²", "cm³", "m²", "m³", "ft²", "ft³", "in²", "in³", "°f",
         "°c", "mph", "km/h", "ft/s", "m/s"}

def to_number(text):
    """A single numeric value for a whole answer choice, or None.

    Deliberately strict: only fires when the choice is essentially one number
    (optionally with a unit or a simple fraction). Choices that are prose or
    algebra return None and are skipped entirely rather than guessed at.
    """
    t = strip_math(text).strip()
    m = re.fullmatch(r"\(?\s*(" + NUM + r")\s*\)?\s*/\s*\(?\s*(" + NUM + r")\s*\)?", t)
    if m:
        try:
            return Fraction(int(m.group(1).replace(",", "")), int(m.group(2).replace(",", "")))
        except (ValueError, ZeroDivisionError):
            return None
    # a lone number, optionally followed by a UNIT. Anything else with letters
    # in it is algebra ("0.25r", "9x") and has no single numeric value, so it is
    # rejected rather than silently read as its coefficient.
    m = re.fullmatch(r"\(?\s*(" + NUM + r")\s*\)?\s*([a-zA-Z°%³²/]*)\.?", t)
    if m and (not m.group(2) or m.group(2).lower() in UNITS):
        try:
            return Fraction(m.group(1).replace(",", ""))
        except (ValueError, ZeroDivisionError):
            return None
    return None

# Verbs that introduce what the student ENDS UP with. The terminal value is the
# thing after the last of these, not merely the last number in the sentence --
# distractor prose routinely quotes correct intermediate values along the way.
LANDS = (r"(?:report(?:s|ing)?|write(?:s|ing)?|writ(?:es|ing)|giv(?:es|ing)|"
         r"yield(?:s|ing)?|get(?:s|ting)?|arriv\w*\s+at|answer(?:s|ing)?|"
         r"comput(?:es|ing)|conclud\w*|obtain(?:s|ing)?|select(?:s|ing)?|choos\w*)")

# A value may be a fraction -- strip_math turns \frac{a}{b} into (a)/(b) -- so
# fractions must be matched BEFORE bare numbers, or "(-1)/(2)" reads as "2" and
# every rationalised distractor looks like a mismatch.
FRAC = r"\(?\s*(" + NUM + r")\s*\)?\s*/\s*\(?\s*(" + NUM + r")\s*\)?"
VAL = r"(?:" + FRAC + r"|" + NUM + r")"

def _parse(text):
    m = re.fullmatch(FRAC, text.strip())
    try:
        if m:
            return Fraction(int(m.group(1).replace(",", "")), int(m.group(2).replace(",", "")))
        return Fraction(text.strip().replace(",", ""))
    except (ValueError, ZeroDivisionError):
        return None

# Distractor prose almost always ends by contrasting the student's answer with
# the right one -- "reporting 12 instead of 6". Everything after the contrast
# is the CORRECT value, so reading the last number in the sentence reliably
# picks the wrong one. Cut the tail at the first contrastive marker.
CONTRAST = re.compile(
    r"\b(instead of|rather than|when it should|should (?:be|have)|"
    r"but the correct|the correct (?:answer|value|result)|not\s+(?=[-\d(]))",
    re.I)

# Arithmetic the prose spells out, e.g. "(1 - 0.2 - 0.2)" or "(100% - 15% - 15%)".
EXPR = re.compile(r"\(\s*[-+]?[\d.,]+(?:\s*%?\s*[-+*/]\s*[-+]?[\d.,]+\s*%?)+\s*\)")

def _eval_expr(text):
    """Evaluate a spelled-out arithmetic expression, or None. Digits and the
    four operators only -- never arbitrary input."""
    body = text.strip()[1:-1].replace("%", "").replace(",", "")
    if not re.fullmatch(r"[-+*/.\d\s]+", body):
        return None
    try:
        return Fraction(str(eval(body, {"__builtins__": {}}, {})))  # noqa: S307
    except Exception:
        return None

def terminal_value(prose):
    """The value the student is said to end up with, or None if not stated."""
    t = strip_math(prose)
    tail = t
    hits = list(re.finditer(LANDS, t, re.I))
    if hits:
        tail = t[hits[-1].end():]
    cut = CONTRAST.search(tail)
    if cut:
        tail = tail[:cut.start()]
    if not tail.strip():
        return None
    eq = list(re.finditer(r"=\s*\$?\s*(" + VAL + r")", tail))
    if eq:
        return _parse(eq[-1].group(1))
    ex = list(EXPR.finditer(tail))
    if ex:
        got = _eval_expr(ex[-1].group(0))
        if got is not None:
            return got
    bare = list(re.finditer(VAL, tail))
    if not bare:
        return None
    return _parse(bare[-1].group(0))

def mentions(prose, value):
    """Does the option's own value appear anywhere in its prose?

    The decisive precision filter. Distractor prose is written contrastively
    ("reporting 12 instead of 6"), so the position of the student's value in the
    sentence is unpredictable -- but if that value is present at all, the prose
    is almost certainly describing the right option. Only a total absence is
    worth a human's attention.
    """
    if value is None:
        return False
    t = strip_math(prose)
    for m in re.finditer(VAL, t):
        got = _parse(m.group(0))
        if got is not None and (got == value or got == -value):
            return True
    return False

# ------------------------------------------------------------------ heuristics

STOP = {"the", "a", "an", "of", "to", "as", "is", "in", "and", "or", "not", "for",
        "value", "values", "term", "terms", "used", "using", "instead", "then"}

# Slug token -> words whose presence in prose counts as evidence for that token.
# Slug token -> words whose presence in prose counts as evidence for that token.
# Deliberately limited to concrete actions with reliable vocabulary. Abstract
# tokens ("sign", "negative", "squares") are omitted on purpose: prose expresses
# them too many ways -- "uses +b instead of -b" is a sign error with no word for
# it -- and testing them produced far more noise than signal.
EVIDENCE = {
    "omits": ["omit", "ignor", "drop", "leaves out", "left out", "without",
              "fails to include", "only", "alone", "skip", "forget", "neglect",
              "missing", "excludes"],
    "omit": ["omit", "ignor", "drop", "without", "only", "alone", "skip", "missing"],
    "drops": ["drop", "omit", "ignor", "loses", "lost", "without", "missing"],
    "reversed": ["revers", "invert", "swap", "flip", "backward", "wrong order",
                 "opposite", "switch"],
    "inverts": ["invert", "revers", "swap", "flip", "upside", "reciprocal"],
    "swap": ["swap", "revers", "invert", "exchang", "interchang", "switch",
             "mixes up", "mistakes the", "uses the .* as the"],
    "unweighted": ["unweight", "simple mean", "ignor", "without weight", "equal weight"],
    "rounds": ["round", "approximat", "estimat", "nearest", "truncat"],
    "halves": ["half", "halv", "divide by 2", "divides by two", "÷ 2"],
    "doubles": ["double", "twice", "two times", "× 2", "multiplies by 2"],
}

def slug_evidence_missing(slug, prose):
    """Return the slug tokens with no supporting language anywhere in the prose.

    Only tokens listed in EVIDENCE are testable; unknown tokens are skipped, so
    the check is conservative by construction and cannot invent a mismatch from
    vocabulary it does not model.
    """
    low = prose.lower()
    missing = []
    for tok in slug.split("_"):
        if tok in STOP or tok not in EVIDENCE:
            continue
        if not any(re.search(w, low) for w in EVIDENCE[tok]):
            missing.append(tok)
    return missing

# --------------------------------------------------------------------- the run

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strand", help="limit to one strand (QR/AR/GR/PR)")
    args = ap.parse_args()

    wrong_choice, tag_mismatch, dup_slug, shared_bad = [], [], [], []
    scanned = comparable = 0

    for path in sorted(ITEMS.rglob("*.json")):
        try:
            items = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(items, list):
            continue
        for it in items:
            iid = it.get("item_id") or "?"
            strand = it.get("primary_strand")
            if args.strand and strand != args.strand:
                continue
            choices = it.get("answer_choices") or {}
            logic = it.get("distractor_logic") or {}
            tags = it.get("misconception_tag") or {}
            correct = it.get("correct_answer")
            vals = {k: to_number(v) for k, v in choices.items()}

            seen_slug = defaultdict(list)
            for L, sl in tags.items():
                if isinstance(sl, str):
                    seen_slug[sl].append(L)
            for sl, ls in seen_slug.items():
                if len(ls) > 1:
                    dup_slug.append((strand, iid, "/".join(sorted(ls)),
                                     f"slug '{sl}' is on {len(ls)} options at once — a wrong "
                                     f"pick on any of them records the same misconception"))
                    # The GR_A_034 shape: a slug shared across options where at
                    # least one of those options' prose shows no sign of it. The
                    # sharing alone is often deliberate; sharing PLUS an option
                    # the slug does not describe is the actual defect.
                    off = [L for L in ls
                           if isinstance(logic.get(L), str)
                           and slug_evidence_missing(sl, logic[L])]
                    if off and len(off) < len(ls):
                        shared_bad.append((
                            strand, iid, "/".join(sorted(off)),
                            f"slug '{sl}' shared with {'/'.join(sorted(set(ls)-set(off)))}, "
                            f"but this option's prose shows no sign of it"))

            for letter, prose in logic.items():
                if letter == correct or not isinstance(prose, str):
                    continue
                scanned += 1

                # --- A. does the stated result land on a DIFFERENT option? ---
                own = vals.get(letter)
                if own is not None:
                    got = terminal_value(prose)
                    if got is not None:
                        comparable += 1
                        if got != own and not mentions(prose, own):
                            elsewhere = [k for k, v in vals.items()
                                         if v is not None and v == got and k != letter]
                            if elsewhere:
                                wrong_choice.append((
                                    strand, iid, letter,
                                    f"prose ends at {got} = choice {'/'.join(sorted(elsewhere))}"
                                    f", but is attached to {letter} ({own})"))

                # --- B. does the tag describe what the prose says? ---
                slug = tags.get(letter)
                if isinstance(slug, str):
                    missing = slug_evidence_missing(slug, prose)
                    if missing:
                        tag_mismatch.append((
                            strand, iid, letter,
                            f"tag '{slug}' — prose shows no sign of "
                            f"{'/'.join(missing)}"))

    def dump(title, rows, note):
        print("\n" + "=" * 100)
        print(f"{title} — {len(rows)} hit(s)")
        print(note)
        if not rows:
            print("  none")
            return
        by = defaultdict(list)
        for r in rows:
            by[r[0]].append(r)
        for st in sorted(by, key=lambda x: (x is None, x)):
            print(f"\n  {st}: {len(by[st])}")
            for _, iid, letter, why in sorted(by[st], key=lambda r: (r[1], r[2])):
                print(f"    {iid}  choice {letter}  —  {why}")

    print(f"Scanned {scanned} distractor_logic entries "
          f"({comparable} had both a numeric choice and a stated terminal value, "
          f"so were mechanically comparable).")
    dump("A. RESOLVE-TO-WRONG-CHOICE", wrong_choice,
         "   The prose's terminal value belongs to another option (the AR_A_010 shape).")
    dump("B. SHARED SLUG THAT DOES NOT FIT ONE OF ITS OPTIONS  [the GR_A_034 shape]", shared_bad,
         "   A slug on 2+ options of one item where at least one of those options'\n"
         "   prose shows no sign of the action the slug names. The narrowest,\n"
         "   highest-value category — this is exactly GR_A_034 A vs C.")
    dump("C. ONE SLUG ON SEVERAL OPTIONS (all fit) — systemic, already tracked as issue 2", dup_slug,
         "   Exact, not heuristic. The options become indistinguishable in the\n"
         "   misconception aggregate — this is what surfaced GR_A_034 A vs C.")
    dump("D. TAG-VS-PROSE MISMATCH, single option (heuristic — expect false positives)", tag_mismatch,
         "   misconception_tag names an action the prose never uses any word for.\n"
         "   Lexical only: it cannot tell a real mismatch from a wording gap.")
    print("\nRead-only: nothing was modified. Every hit is its own decision.")

if __name__ == "__main__":
    main()
