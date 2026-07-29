#!/usr/bin/env python3
"""Verify parameterized item templates with SymPy.

The bank's rule for hand-authored items is that every wrong-answer choice must
be independently verified as numerically reachable via its stated misconception.
This applies that rule one level up -- to the formula rather than to the
instance -- by re-deriving each answer symbolically and checking it across the
whole parameter range instead of at one point.

Per template, for every sampled parameter set:

  distinct     all four choices are pairwise distinct as expressions
  correct      SymPy simplifies the question's own unsimplified structure and
               gets the stored correct_answer_formula -- the answer is derived
               from the question, not trusted because it was typed in
  derivations  each distractor's misconception, transcribed as an unsimplified
               procedure, simplifies to the stored distractor formula
  latex        rendered choices obey house LaTeX conventions

Plus, once per template: the canonical parameters reproduce the source item's
question, explanation and all four choices byte for byte. And once per pool:
the mandatory sign-error distractor coverage is present.

A template that passes everything is marked verification_status: "passed" (only
with --write). Anything less is left alone -- a template that mostly works is
not a verified template.

Usage:
    python3 scripts/verify_templates.py                 # verify, report, no writes
    python3 scripts/verify_templates.py --write         # also record pass/fail
    python3 scripts/verify_templates.py --samples 500   # deeper sampling
    python3 scripts/verify_templates.py --show QR_A_075 # dump rolled instances
"""

from __future__ import annotations

import argparse
import itertools
import json
import pathlib
import random
import re
import sys

from sympy import Symbol, expand, latex, simplify, sympify

REPO = pathlib.Path(__file__).resolve().parent.parent
TEMPLATES = REPO / "data" / "templates"
ITEMS = REPO / "data" / "items"

X, Y = Symbol("x"), Symbol("y")
SYMS = {"x": X, "y": Y}
LETTERS = ("A", "B", "C", "D")

# Enumerate the whole grid rather than sampling when it is this small or less.
# Exhaustive beats random whenever it is affordable: a collision that exists for
# exactly one parameter set is precisely the kind a sample of 200 can miss.
FULL_ENUMERATION_CAP = 200_000

IDENT = re.compile(r"[A-Za-z_]\w*")


class TemplateError(Exception):
    """A template is malformed, as opposed to mathematically wrong."""


# --------------------------------------------------------------------------
# parameter space
# --------------------------------------------------------------------------


def param_values(p):
    vals = [
        v
        for v in range(p["min"], p["max"] + 1, p.get("step", 1))
        if v not in p.get("exclude", [])
    ]
    if not vals:
        raise TemplateError(f"parameter {p['name']} has an empty range")
    return vals


def derive(tpl, vals):
    """Add derived parameters. Order matters: a derived value may use an earlier one."""
    out = dict(vals)
    for d in tpl.get("derived_parameters", []):
        out[d["name"]] = int(sympify(d["formula"]).subs(out))
    return out


def passes(tpl, vals):
    """Evaluate the template's constraints.

    Constraints are human-authored booleans over parameter values, and the
    values are substituted before evaluation, so this is plain integer
    arithmetic in an empty namespace -- not sympify, and not reachable from
    anything a student or a model supplies. There is no runtime LLM anywhere in
    this pipeline; the strings evaluated here were written by hand and live in
    version control.
    """
    for c in tpl.get("constraints", []):
        try:
            if not eval(c, {"__builtins__": {}}, dict(vals)):  # noqa: S307
                return False
        except Exception as exc:  # a broken constraint must not read as "excluded"
            raise TemplateError(f"constraint {c!r} failed to evaluate: {exc}") from exc
    return True


def sample_sets(tpl, n_random, seed):
    """Parameter sets to check, and a one-word description of how they were chosen.

    Always includes the canonical instance and the range boundaries. Boundary
    values are where collisions actually live -- a formula that only breaks when
    a coefficient is at its minimum is invisible to uniform sampling.
    """
    names = [p["name"] for p in tpl["parameters"]]
    ranges = [param_values(p) for p in tpl["parameters"]]
    grid = 1
    for r in ranges:
        grid *= len(r)

    seen, out = set(), []

    def add(combo):
        if combo in seen:
            return
        seen.add(combo)
        vals = derive(tpl, dict(zip(names, combo)))
        if passes(tpl, vals):
            out.append(vals)

    if grid <= FULL_ENUMERATION_CAP:
        for combo in itertools.product(*ranges):
            add(combo)
        return out, f"exhaustive ({grid} grid points)"

    add(tuple(tpl["canonical_parameters"][n] for n in names))
    for combo in itertools.product(*[(r[0], r[-1]) for r in ranges]):
        add(combo)
    for i, r in enumerate(ranges):
        for edge in (r[0], r[len(r) // 2], r[-1]):
            combo = tuple(
                edge if j == i else tpl["canonical_parameters"][names[j]]
                for j in range(len(names))
            )
            add(combo)

    rng = random.Random(seed)
    tries = 0
    target = len(out) + n_random
    while len(out) < target and tries < n_random * 200:
        tries += 1
        add(tuple(rng.choice(r) for r in ranges))
    return out, f"boundaries + {n_random} random (seed {seed})"


# --------------------------------------------------------------------------
# formulas
# --------------------------------------------------------------------------


def check_formula_vocabulary(tpl):
    """Every name in every formula must be a parameter, a derived value, x or y.

    sympify happily invents a Symbol for a typo, which would then substitute to
    nothing and quietly evaluate to something wrong. This makes a misspelled
    parameter a loud failure instead.
    """
    known = {"x", "y"}
    known |= {p["name"] for p in tpl["parameters"]}
    known |= {d["name"] for d in tpl.get("derived_parameters", [])}
    fields = [tpl["unsimplified_expression"], tpl["correct_answer_formula"]]
    fields += list(tpl["distractor_formulas"].values())
    fields += list(tpl["distractor_derivations"].values())
    fields += [d["formula"] for d in tpl.get("derived_parameters", [])]
    for f in fields:
        for name in IDENT.findall(f):
            if name not in known:
                raise TemplateError(f"unknown name {name!r} in formula {f!r}")


def ev(formula, vals):
    return expand(sympify(formula, locals=SYMS).subs(vals))


def render(tpl, text, vals):
    disp = {k: str(v) for k, v in vals.items()}
    for d in tpl.get("derived_parameters", []):
        # A coefficient of 1 is written as a bare `x`, never `1x`.
        if d.get("render") == "coefficient":
            v = vals[d["name"]]
            disp[d["name"]] = "" if v == 1 else "-" if v == -1 else str(v)
    for name in sorted(disp, key=len, reverse=True):
        text = text.replace("{" + name + "}", disp[name])
    left = re.findall(r"\{(\w+)\}", text)
    if left:
        raise TemplateError(f"unresolved placeholders {left} in {text!r}")
    return text


def house_latex(expr):
    """sympy.latex() in the bank's house style.

    SymPy writes `8 x`, `10 x y`, `- x`; the bank writes `8x`, `10xy`, `-x`.
    Only spacing differs, so close the gap between a coefficient or a variable
    and the variable that follows it, and drop the space after a leading minus.
    Spaces around binary operators are left alone.
    """
    s = latex(expr)
    s = re.sub(r"(?<=[0-9}a-zA-Z]) (?=[a-zA-Z])", "", s)
    s = re.sub(r"^- ", "-", s)
    return f"${s}$"


def latex_problems(text):
    """House LaTeX conventions, checked on rendered output rather than assumed."""
    bad = []
    if "$$" in text:
        bad.append("double dollar signs")
    if text.count("$") % 2:
        bad.append("unbalanced $ delimiters")
    if "—" in text or "–" in text:
        bad.append("em/en dash")
    if re.search(r"\d\s*/\s*\d", text):
        bad.append("slash fraction (house style is \\frac{}{})")
    if re.search(r"(?<![\\$])\$\d", text) and "\\$" not in text:
        pass  # bare currency would need escaping; QR.3.5 has none, kept for reuse
    if re.search(r"\b1[a-z]\b", text):
        bad.append("coefficient written as 1x")
    return bad


# --------------------------------------------------------------------------
# checks
# --------------------------------------------------------------------------


def verify(tpl, src, n_random, seed):
    """Return (failures, stats). A failure names the parameter set that broke it."""
    check_formula_vocabulary(tpl)
    fails = []
    correct_letter = src["correct_answer"]

    # The template must still be the item it came from.
    can = derive(tpl, tpl["canonical_parameters"])
    if not passes(tpl, can):
        fails.append(("canonical", can, "canonical parameters violate the constraints"))
    q = render(tpl, tpl["question_template"], can)
    if q != src["question_text"]:
        fails.append(("canonical", can, f"question drifted\n      got  {q}\n      want {src['question_text']}"))
    e = render(tpl, tpl["explanation_template"], can)
    if e != src["explanation"]:
        fails.append(("canonical", can, f"explanation drifted\n      got  {e!r}\n      want {src['explanation']!r}"))
    for L in LETTERS:
        got = house_latex(ev(tpl["distractor_formulas"][L], can))
        if got != src["answer_choices"][L]:
            fails.append(("canonical", can, f"choice {L} drifted: got {got} want {src['answer_choices'][L]}"))

    # The correct letter's entry must agree with correct_answer_formula, or the
    # two could disagree and the item would grade against a different answer
    # than the one it displays.
    if simplify(
        sympify(tpl["distractor_formulas"][correct_letter], locals=SYMS)
        - sympify(tpl["correct_answer_formula"], locals=SYMS)
    ) != 0:
        fails.append(("schema", {}, f"distractor_formulas[{correct_letter}] != correct_answer_formula"))
    stated = set(tpl["distractor_derivations"])
    expected = set(LETTERS) - {correct_letter}
    if stated != expected:
        fails.append(("schema", {}, f"derivations cover {sorted(stated)}, expected {sorted(expected)}"))

    sets, mode = sample_sets(tpl, n_random, seed)
    if not sets:
        fails.append(("schema", {}, "no parameter set satisfies the constraints"))

    for vals in sets:
        choices = {L: ev(tpl["distractor_formulas"][L], vals) for L in LETTERS}

        for p, r in itertools.combinations(LETTERS, 2):
            if simplify(choices[p] - choices[r]) == 0:
                fails.append(("distinct", vals, f"{p} and {r} are both {house_latex(choices[p])}"))

        rederived = ev(tpl["unsimplified_expression"], vals)
        if simplify(rederived - choices[correct_letter]) != 0:
            fails.append((
                "correct", vals,
                f"question simplifies to {house_latex(rederived)}, "
                f"stored answer is {house_latex(choices[correct_letter])}",
            ))

        for L, procedure in tpl["distractor_derivations"].items():
            got = ev(procedure, vals)
            if simplify(got - choices[L]) != 0:
                fails.append((
                    "derivation", vals,
                    f"{L}: misconception produces {house_latex(got)}, "
                    f"stored distractor is {house_latex(choices[L])}",
                ))

        text = render(tpl, tpl["question_template"], vals)
        text += " " + render(tpl, tpl["explanation_template"], vals)
        text += " " + " ".join(house_latex(choices[L]) for L in LETTERS)
        for problem in latex_problems(text):
            fails.append(("latex", vals, problem))

    return fails, {"mode": mode, "sets": len(sets)}


def show(tpl, src, count, seed):
    sets, _ = sample_sets(tpl, count, seed)
    rng = random.Random(seed)
    picks = [derive(tpl, tpl["canonical_parameters"])]
    picks += rng.sample(sets, min(count, len(sets)))
    for vals in picks:
        tag = " (canonical)" if vals == derive(tpl, tpl["canonical_parameters"]) else ""
        print(f"\n  {tpl['item_id']}{tag}  { {k: v for k, v in vals.items()} }")
        print("   ", render(tpl, tpl["question_template"], vals))
        for L in LETTERS:
            mark = "*" if L == src["correct_answer"] else " "
            print(f"    {mark}{L}: {house_latex(ev(tpl['distractor_formulas'][L], vals))}")
        for line in render(tpl, tpl["explanation_template"], vals).split("\n"):
            print(f"      | {line}")


# --------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--topic", default="QR.3.5")
    ap.add_argument("--samples", type=int, default=200,
                    help="random samples per template when the grid is too large to enumerate")
    ap.add_argument("--seed", type=int, default=20260729)
    ap.add_argument("--write", action="store_true",
                    help="record verification_status in the template file")
    ap.add_argument("--show", metavar="ITEM_ID", help="print rolled instances for review")
    args = ap.parse_args()

    tpl_path = TEMPLATES / f"{args.topic}.json"
    templates = json.loads(tpl_path.read_text())
    strand = args.topic.split(".")[0]
    sources = {i["item_id"]: i for i in json.loads((ITEMS / strand / f"{args.topic}.json").read_text())}

    if args.show:
        tpl = next(t for t in templates if t["item_id"] == args.show)
        show(tpl, sources[args.show], 4, args.seed)
        return 0

    print(f"Verifying {len(templates)} templates for {args.topic}\n")
    results, total_sets = {}, 0

    for tpl in templates:
        item_id = tpl["item_id"]
        src = sources.get(item_id)
        if src is None:
            print(f"  {item_id}  FAIL -- no source item with this id")
            results[item_id] = False
            continue
        try:
            fails, stats = verify(tpl, src, args.samples, args.seed)
        except TemplateError as exc:
            print(f"  {item_id}  FAIL -- malformed template: {exc}")
            results[item_id] = False
            continue

        total_sets += stats["sets"]
        results[item_id] = not fails
        status = "pass" if not fails else f"FAIL ({len(fails)})"
        print(f"  {item_id}  {status:<12} {stats['sets']:>6} sets, {stats['mode']}")
        for kind, vals, detail in fails[:10]:
            shown = {k: v for k, v in vals.items()} if vals else ""
            print(f"      [{kind}] {shown}")
            print(f"        {detail}")
        if len(fails) > 10:
            print(f"      ... and {len(fails) - 10} more")

    # Pool-level rule: the topic's mandatory sign-error coverage must survive
    # templating. Asserting it here makes it enforceable rather than a claim in
    # a document that nothing checks.
    covered = [t["item_id"] for t in templates
               if t.get("sign_error_coverage") and results.get(t["item_id"])]
    print()
    if covered:
        print(f"  sign-error coverage: {', '.join(covered)}")
    else:
        print("  sign-error coverage: MISSING -- no passing template carries it")
        results["__pool__"] = False

    passed = sum(1 for v in results.values() if v)
    print(f"\n{passed}/{len(templates)} templates passed, {total_sets} parameter sets checked")

    if args.write:
        for tpl in templates:
            tpl["verification_status"] = "passed" if results.get(tpl["item_id"]) else "failed"
        tpl_path.write_text(json.dumps(templates, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote verification_status to {tpl_path.relative_to(REPO)}")

    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
