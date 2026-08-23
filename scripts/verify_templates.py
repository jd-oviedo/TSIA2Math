#!/usr/bin/env python3
"""Verify parameterized item templates with SymPy.

The bank's rule for hand-authored items is that every wrong-answer choice must
be independently verified as numerically reachable via its stated misconception.
This applies that rule one level up -- to the formula rather than to the
instance -- by re-deriving each answer symbolically and checking it across the
whole parameter range instead of at one point.

Two pools, one harness:

  --source curriculum   (default) templates authored in the topic markdown,
                        checked against the items `build_practice_items()`
                        actually produces. This is Phase B's live pool.
  --source bank         the 15 parked CAT-bank templates in data/templates/.
                        Kept working so README's "all 15 pass" stays
                        reproducible; see the status section there.

Per template, for every parameter set:

  distinct     all four choices are pairwise distinct as expressions
  correct      SymPy simplifies the question's own unsimplified structure and
               gets the correct choice's formula -- the answer is derived from
               the question, not trusted because it was typed in
  derivations  each distractor's misconception, transcribed as an unsimplified
               procedure, simplifies to the stored distractor formula
  latex        rendered choices obey house LaTeX conventions

Plus, once per template, the anchor: the canonical parameters reproduce the
source item byte for byte. What "the source item" means differs by pool, and
for curriculum it is deliberately narrow -- stem, all four choices,
correct_answer and the whole misconception_tag map, but *not* the worked
solution. A teacher-facing solution is shown canonically alongside a note that
the student saw a rolled variant, so it is not part of correctness and does not
gate a template. See "The anchor for curriculum-scoped templates" in
data/templates/README.md.

And once per pool: mandatory sign-error coverage, and (curriculum only) the
cross-pool exposure rule -- a rolled curriculum question must never render a
stem a student could meet in the CAT diagnostic.

Usage:
    python3 scripts/verify_templates.py                      # curriculum, report only
    python3 scripts/verify_templates.py --source bank        # the parked 15
    python3 scripts/verify_templates.py --show 'practice 1'  # dump rolled instances
    python3 scripts/verify_templates.py --source bank --write
"""

from __future__ import annotations

import argparse
import functools
import hashlib
import itertools
import json
import pathlib
import random
import re
import sys

from sympy import Poly, Symbol, expand, latex, sympify

REPO = pathlib.Path(__file__).resolve().parent.parent
TEMPLATES = REPO / "data" / "templates"
ITEMS = REPO / "data" / "items"
CURRICULUM = REPO / "curriculum" / "source" / "tsia2-math"

sys.path.insert(0, str(REPO / "curriculum" / "migrations"))

LETTERS = ("A", "B", "C", "D")

# Enumerate the whole grid rather than sampling when it is this small or less.
# Exhaustive beats random whenever it is affordable: a collision that exists for
# exactly one parameter set is precisely the kind a sample of 200 can miss.
FULL_ENUMERATION_CAP = 200_000

IDENT = re.compile(r"[A-Za-z_]\w*")
MATH_SPAN = re.compile(r"\$[^$]*\$")

# Raw Unicode math symbols, and the LaTeX each one should have been written as.
#
# These render. That is the problem: a stem carrying a literal U+2264 looks
# correct in a terminal and in a diff, sits inside a math span KaTeX is happy to
# typeset around, and reaches a worksheet in whatever glyph the print font
# happens to have for it -- which is not the glyph the rest of the mathematics is
# set in, and on some printers is not a glyph at all.
#
# Kept as a mapping rather than a character class so the failure can name the
# replacement. An author who is told "raw Unicode" goes looking; an author who is
# told "use \le" fixes it.
UNICODE_MATH = {
    "\u2264": r"\le", "\u2265": r"\ge", "\u2260": r"\ne", "\u2248": r"\approx",
    "\u00d7": r"\times", "\u00f7": r"\div", "\u2212": "-", "\u00b1": r"\pm",
    "\u221a": r"\sqrt{}", "\u221e": r"\infty", "\u03c0": r"\pi",
    "\u22c5": r"\cdot", "\u00b7": r"\cdot", "\u2192": r"\to",
    "\u00b0": r"^\circ", "\u00b2": "^2", "\u00b3": "^3",
    "\u00bd": r"\frac{1}{2}", "\u00bc": r"\frac{1}{4}", "\u00be": r"\frac{3}{4}",
}

# The slug whose presence *is* sign-error coverage. In the bank this was a
# hand-set boolean somebody had to remember; here it is derivable from the
# misconception_tag map and cannot be set wrong.
#
# Deliberately just this one. drops_negative_sign is also a sign error, but the
# coverage this pool is required to carry is the minus distributed across a
# group -- Part 1's "The Mistake That Costs the Most Points" -- and counting the
# looser slug too would let the requirement be satisfied by an item that never
# puts a group on the page.
SIGN_ERROR_SLUG = "drops_negative_on_group"


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


def excluded(tpl, vals):
    """Parameter sets struck out by hand, each for a recorded reason.

    Distinct from a constraint: a constraint is a property of the mathematics,
    while an exclusion is a judgment about a specific instance -- practice 1's
    (3,5) is excluded because it renders a diagnostic question, not because
    anything about it is wrong.
    """
    for combo in tpl.get("exclude_parameter_sets", []):
        if all(vals.get(k) == v for k, v in combo.items()):
            return True
    return False


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
        if passes(tpl, vals) and not excluded(tpl, vals):
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
# formulas and printing
# --------------------------------------------------------------------------


@functools.lru_cache(maxsize=None)
def _parsed(formula, variables):
    """Parse a formula once, not once per parameter set.

    A template's formulas are fixed strings evaluated at every point in its
    range, so parsing inside the loop re-does identical work tens of thousands
    of times over a pool this size.
    """
    return sympify(formula, locals={v: Symbol(v) for v in variables})


def check_formula_vocabulary(tpl):
    """Every name in every formula must be a parameter, a derived value, or a variable.

    sympify happily invents a Symbol for a typo, which would then substitute to
    nothing and quietly evaluate to something wrong. This makes a misspelled
    parameter a loud failure instead.
    """
    known = set(tpl["variables"])
    known |= {p["name"] for p in tpl["parameters"]}
    known |= {d["name"] for d in tpl.get("derived_parameters", [])}
    fields = [tpl["unsimplified_expression"]]
    fields += list(tpl["choice_formulas"].values())
    fields += list(tpl["choice_derivations"].values())
    fields += [d["formula"] for d in tpl.get("derived_parameters", [])]
    for f in fields:
        for name in IDENT.findall(f):
            if name not in known:
                raise TemplateError(f"unknown name {name!r} in formula {f!r}")


def ev(tpl, formula, vals):
    # xreplace, not subs: every key here is a plain Symbol and every value an
    # integer, which is exactly the structural case xreplace handles, and it
    # skips the sympification and ordering work subs does for the general one.
    sub = {Symbol(k): v for k, v in vals.items()}
    return expand(_parsed(formula, tuple(tpl["variables"])).xreplace(sub))


def same(a, b):
    """Exact equality for the polynomials this harness deals in.

    `simplify()` is the general tool and the wrong one here: every expression in
    both pools is a polynomial in the declared variables -- `house_latex` asserts
    exactly that via `Poly` -- so `expand` is already a normal form and equality
    is decidable by subtraction. It is also the difference between the pool
    verifying in seconds and in hours, at 26,186 parameter sets times roughly ten
    comparisons each.
    """
    return expand(a - b) == 0


def house_latex(expr, variables):
    """Render a polynomial in house style, with the term order pinned here.

    SymPy's printer orders by its own internal sort, which writes `-x + 1` as
    `1 - x`. That is the same expression and the wrong string, and since the
    anchor is byte for byte it would fail practice 10 on its *correct* answer.
    So ordering is imposed rather than inherited: descending total degree, then
    the order the variables were declared in. House style otherwise means `8x`
    not `8 x`, `10xy` not `10 x y`, and a bare `x` for a coefficient of 1.
    """
    e = expand(expr)
    syms = [Symbol(v) for v in variables]
    if not syms:
        return f"${latex(e)}$"
    try:
        terms = Poly(e, *syms).terms()
    except Exception as exc:
        raise TemplateError(f"{e} is not polynomial in {variables}: {exc}") from exc

    terms = sorted(terms, key=lambda t: (-sum(t[0]), tuple(-d for d in t[0])))
    out = ""
    for mono, coeff in terms:
        # RAISE, DO NOT TRUNCATE. `int(coeff)` on its own puts a silently wrong
        # answer choice in front of a student, and it is the one defect found on
        # this branch that no other check can see: same() compares expressions,
        # so the mathematics all passes while the printed string is wrong.
        #
        # Measured before this guard existed, with a variable declared:
        #
        #   13/2       ->  $6$        -1/2       ->  $0$
        #   3*x/2      ->  $x$        x/2 + 5/2  ->  $2$
        #
        # The last is the worst: int(1/2) is 0, the `c == 0` skip below then
        # drops the term, and the x vanishes from the choice entirely.
        #
        # Only this branch truncates. With `variables` empty the function has
        # already returned through plain latex(), which renders a rational
        # correctly -- that is why a topic whose answers are numbers rather than
        # expressions (PR.2.1's $7.5$) is unaffected, and must stay that way.
        if coeff != int(coeff):
            raise TemplateError(
                f"non-integer coefficient {coeff} in {e}, which house_latex "
                f"would truncate to {int(coeff)}. Declare no variables on a "
                f"template whose formulas can produce a fractional coefficient, "
                f"or constrain the range so they cannot."
            )
        c = int(coeff)
        if c == 0:
            continue
        body = "".join(
            v if d == 1 else f"{v}^{{{d}}}"
            for v, d in zip(variables, mono)
            if d
        )
        piece = body if body and abs(c) == 1 else f"{abs(c)}{body}"
        if not out:
            out += ("-" if c < 0 else "") + piece
        else:
            out += (" - " if c < 0 else " + ") + piece
    return f"${out or '0'}$"


def render_instance(tpl, vals):
    """One rolled instance, rendered exactly the way the harness renders it.

    Extracted from verify() rather than written beside it. The upload script
    materialises every parameter set into curriculum_item_instances, and those
    rows are what a student actually reads, so they have to come out of the same
    two calls the verification pass makes -- `ev` then `house_latex` per letter,
    `render` for the stem. A second spelling of that here, however faithful on
    the day it was written, is a renderer that can drift away from the evidence
    the templates table carries.
    """
    return {
        "stem": render(tpl, tpl["stem_template"], vals),
        "choices": {
            L: house_latex(ev(tpl, tpl["choice_formulas"][L], vals), tpl["variables"])
            for L in LETTERS
        },
        "correct_answer": tpl["correct_answer"],
    }


def source_fingerprint(src):
    """Hash of the anchor fields on the parsed source item. Curriculum-scoped.

    Exactly the fields anchor_failures() checks and nothing else: `stem`, all four
    `choices`, `correct_answer`, and the whole `misconception_tag` map. Not the
    worked solution -- it is a slice of the Part 4 markdown rather than a field,
    it is teacher-only, and its substitution checks are sign-sensitive, so
    anchoring it would need the sign-repair logic this schema keeps out on
    purpose. See "The anchor for curriculum-scoped templates" in
    data/templates/README.md.

    Stored on the template row so a source item reworded after verification is
    detectable at read time. Without it a template goes on rolling variants of a
    question that no longer exists, and nothing anywhere notices.

    The runtime recomputes this from curriculum_topics.practice_items and compares,
    which makes the serialisation a cross-language contract, not an internal
    detail: sorted keys, no whitespace, unicode left literal. JSON.stringify over
    the same object with sorted keys produces the same bytes, and
    scripts/verify_gumu_leakcheck.ts asserts that equality on all 14 items rather
    than trusting it -- a hash that disagrees across languages would report every
    template as stale and silently disable rolling everywhere.
    """
    payload = {
        "stem": src["stem"],
        "choices": src["choices"],
        "correct_answer": src["correct_answer"],
        "misconception_tag": src["misconception_tag"],
    }
    canonical = json.dumps(
        payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


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
    if re.search(r"\b1[a-z]\b", text):
        bad.append("coefficient written as 1x")
    for glyph, latex_form in UNICODE_MATH.items():
        if glyph in text:
            bad.append(f"raw Unicode math symbol {glyph!r}, write it as {latex_form}")
    return bad


def normalized_stem(tpl, text):
    """A stem with its variable letters neutralised, for cross-pool comparison.

    Only the inside of `$...$` is touched. Practice 7's stem is mostly prose
    ("...the number of gigabytes used"), and rewriting single letters out there
    would invent matches between questions that have nothing to do with each
    other.
    """
    order = {v: f"V{i + 1}" for i, v in enumerate(tpl["variables"])}

    def sub_math(m):
        s = m.group(0)
        for v, tag in order.items():
            s = re.sub(rf"(?<![A-Za-z]){re.escape(v)}(?![A-Za-z])", tag, s)
        return s

    return MATH_SPAN.sub(sub_math, text)


# --------------------------------------------------------------------------
# adapters -- each pool normalises to the same template/source shape
# --------------------------------------------------------------------------


def _split_parts(md):
    return re.split(r"^#### \*\*Part \d+: ", md, flags=re.M)


TEMPLATE_BLOCK = re.compile(r"```json\n(.*?)\n```", re.S)


def _template_blocks(answer_key, header_re):
    """Pull the `template` key out of each item's fenced block in Part 4.

    The block is a bare JSON fragment (`"distractor_logic": {...},
    "misconception_tag": {...}`), so it parses once wrapped in braces. A
    template is authored as a third sibling key in that same block rather than
    in a file of its own, so a content edit and its template are never more than
    a few lines apart and cannot be moved independently.
    """
    import upload_curriculum as uc

    out = {}
    for number, body in uc._split_items(answer_key, header_re):
        found = TEMPLATE_BLOCK.search(body)
        if not found:
            continue
        try:
            block = json.loads("{" + found.group(1) + "}")
        except json.JSONDecodeError as exc:
            raise TemplateError(f"item {number}: fenced block is not JSON: {exc}") from exc
        if "template" in block:
            out[int(number)] = block["template"]
    return out


def load_curriculum(topic, unit):
    """Return [(template, source)] plus every item that has no template yet."""
    import upload_curriculum as uc

    path = CURRICULUM / unit / f"{topic}.md"
    if not path.exists():
        raise SystemExit(f"no curriculum source at {path.relative_to(REPO)}")
    md = path.read_text()
    parts = _split_parts(md)
    if len(parts) < 5:
        raise SystemExit(f"{path.name}: expected 4 numbered parts, found {len(parts) - 1}")
    sections = uc.build_practice_items(parts[2], parts[3], parts[4])

    key_split = re.split(r"^#####\s*Mini Quiz", parts[4], maxsplit=1, flags=re.M)
    blocks = {
        "practice": _template_blocks(key_split[0], uc.PRACTICE_KEY_RE),
        "mini_quiz": _template_blocks(key_split[1], uc.QUIZ_KEY_RE) if len(key_split) > 1 else {},
    }

    pairs, untemplated = [], []
    for name in ("practice", "mini_quiz"):
        for item in sections[name]["items"]:
            n = item["item_number"]
            key = f"{name} {n}"
            if item["format"] != "multiple_choice":
                continue
            raw = blocks[name].get(n)
            if raw is None:
                untemplated.append(key)
                continue
            tpl = dict(raw)
            tpl["key"] = key
            tpl.setdefault("variables", [])
            tpl.setdefault("constraints", [])
            tpl["choice_formulas"] = tpl.get("choice_formulas", {})
            tpl["choice_derivations"] = tpl.get("choice_derivations", {})
            src = {
                "key": key,
                "stem": item["stem"],
                "choices": item["choices"],
                "correct_answer": item["correct_answer"],
                "misconception_tag": item["misconception_tag"],
            }
            pairs.append((tpl, src))
    return pairs, untemplated


def load_bank(topic):
    """The parked CAT-bank pool, normalised onto the same shape."""
    raw = json.loads((TEMPLATES / f"{topic}.json").read_text())
    strand = topic.split(".")[0]
    sources = {
        i["item_id"]: i
        for i in json.loads((ITEMS / strand / f"{topic}.json").read_text())
    }
    pairs, missing = [], []
    for t in raw:
        item_id = t["item_id"]
        src = sources.get(item_id)
        if src is None:
            missing.append(item_id)
            continue
        tpl = dict(t)
        tpl["key"] = item_id
        tpl["variables"] = ["x", "y"]
        tpl["stem_template"] = t["question_template"]
        tpl["choice_formulas"] = t["distractor_formulas"]
        tpl["choice_derivations"] = t["distractor_derivations"]
        pairs.append((tpl, {
            "key": item_id,
            "stem": src["question_text"],
            "choices": src["answer_choices"],
            "correct_answer": src["correct_answer"],
            "explanation": src["explanation"],
            "misconception_tag": None,
        }))
    return pairs, missing


# --------------------------------------------------------------------------
# checks
# --------------------------------------------------------------------------


def anchor_failures(tpl, src):
    """The template, at its canonical parameters, must still *be* the source item."""
    fails = []
    can = derive(tpl, tpl["canonical_parameters"])
    if not passes(tpl, can):
        fails.append(("anchor", can, "canonical parameters violate the constraints"))
    if excluded(tpl, can):
        fails.append(("anchor", can, "canonical parameters are in exclude_parameter_sets"))

    got = render(tpl, tpl["stem_template"], can)
    if got != src["stem"]:
        fails.append(("anchor", can, f"stem drifted\n        got  {got}\n        want {src['stem']}"))

    for L in LETTERS:
        if L not in tpl["choice_formulas"]:
            fails.append(("schema", {}, f"no formula for choice {L}"))
            continue
        shown = house_latex(ev(tpl, tpl["choice_formulas"][L], can), tpl["variables"])
        if shown != src["choices"].get(L):
            fails.append(("anchor", can,
                          f"choice {L} drifted: got {shown} want {src['choices'].get(L)}"))

    # Curriculum only. The slug is the misconception's identity -- rewording an
    # explanation renames nothing, but reassigning a letter renames everything --
    # so the whole map is anchored, not just the letters the template mentions.
    if src["misconception_tag"] is not None:
        want = src["misconception_tag"]
        have = tpl.get("misconception_tag")
        if have is None:
            fails.append(("schema", {}, "template does not restate misconception_tag"))
        elif have != want:
            fails.append(("anchor", {}, f"misconception_tag drifted: got {have} want {want}"))
        if tpl.get("correct_answer") != src["correct_answer"]:
            fails.append(("anchor", {},
                          f"correct_answer drifted: got {tpl.get('correct_answer')!r} "
                          f"want {src['correct_answer']!r}"))
    elif "explanation" in src and "explanation_template" in tpl:
        e = render(tpl, tpl["explanation_template"], can)
        if e != src["explanation"]:
            fails.append(("anchor", can, f"explanation drifted\n        got  {e!r}\n        want {src['explanation']!r}"))
    return fails


def verify(tpl, src, n_random, seed):
    """Return (failures, stats). A failure names the parameter set that broke it."""
    check_formula_vocabulary(tpl)
    fails = list(anchor_failures(tpl, src))
    correct_letter = src["correct_answer"]

    # Bank only: the answer it grades against and the answer it displays are
    # stored separately, so they can disagree. Curriculum templates have no
    # second copy -- the correct letter's formula is the only answer there is.
    if "correct_answer_formula" in tpl:
        vs = tuple(tpl["variables"])
        if not same(_parsed(tpl["choice_formulas"][correct_letter], vs),
                    _parsed(tpl["correct_answer_formula"], vs)):
            fails.append(("schema", {},
                          f"distractor_formulas[{correct_letter}] != correct_answer_formula"))

    stated = set(tpl["choice_derivations"])
    expected = set(LETTERS) - {correct_letter}
    if stated != expected:
        fails.append(("schema", {}, f"derivations cover {sorted(stated)}, expected {sorted(expected)}"))

    sets, mode = sample_sets(tpl, n_random, seed)
    if not sets:
        fails.append(("schema", {}, "no parameter set satisfies the constraints"))

    for vals in sets:
        choices = {L: ev(tpl, tpl["choice_formulas"][L], vals) for L in LETTERS}

        for p, r in itertools.combinations(LETTERS, 2):
            if same(choices[p], choices[r]):
                fails.append(("distinct", vals,
                              f"{p} and {r} are both {house_latex(choices[p], tpl['variables'])}"))

        rederived = ev(tpl, tpl["unsimplified_expression"], vals)
        if not same(rederived, choices[correct_letter]):
            fails.append((
                "correct", vals,
                f"question simplifies to {house_latex(rederived, tpl['variables'])}, "
                f"stored answer is {house_latex(choices[correct_letter], tpl['variables'])}",
            ))

        for L, procedure in tpl["choice_derivations"].items():
            got = ev(tpl, procedure, vals)
            if not same(got, choices[L]):
                fails.append((
                    "derivation", vals,
                    f"{L}: misconception produces {house_latex(got, tpl['variables'])}, "
                    f"stored distractor is {house_latex(choices[L], tpl['variables'])}",
                ))

        text = render(tpl, tpl["stem_template"], vals)
        text += " " + " ".join(house_latex(choices[L], tpl["variables"]) for L in LETTERS)
        for problem in latex_problems(text):
            fails.append(("latex", vals, problem))

    return fails, {"mode": mode, "sets": len(sets)}


def cross_pool(pairs, topic, n_random, seed):
    """Standing exposure rule: a rolled curriculum stem must not be a bank stem.

    Two different questions, deliberately:

      FAIL  the roll renders a stem a student can actually meet in the
            diagnostic -- a bank item at its *canonical* parameters, which is
            what the bank serves, since the 15 bank templates are parked and
            nothing rolls them.
      WARN  the roll renders a stem some *roll* of a bank template could
            produce. Harmless today for the same reason, and a breach the day
            the bank is unparked. Practice 1 and QR_B_090 are the same template
            under a variable rename -- same shape, same 2..9 range, same
            constraint -- so this is a real overlap that the canonical check
            alone reports as two parameter sets.

    The comparison is on the rendered stem, not the expanded expression. An
    earlier pass compared polynomials and flagged 12 of 14, which measures the
    wrong thing: `6k - (3k - 3) + 7` and `5x + 3 - 2x + 7` expand alike but are
    not the same question. What breaches exposure control is a student
    recognising the question.
    """
    path = TEMPLATES / f"{topic}.json"
    if not path.exists():
        return [], [], "no bank pool for this topic -- cross-pool check skipped"

    bank = json.loads(path.read_text())
    canonical, every_roll = {}, {}
    for t in bank:
        b = dict(t)
        b["variables"] = ["x", "y"]
        b["stem_template"] = t["question_template"]
        can = derive(b, b["canonical_parameters"])
        canonical[normalized_stem(b, render(b, b["stem_template"], can))] = t["item_id"]
        rolls, _ = sample_sets(b, n_random, seed)
        for vals in rolls:
            every_roll.setdefault(
                normalized_stem(b, render(b, b["stem_template"], vals)), t["item_id"])

    fails, warns = [], []
    for tpl, _src in pairs:
        rolls, _ = sample_sets(tpl, n_random, seed)
        hits, overlaps = [], {}
        for vals in rolls:
            stem = normalized_stem(tpl, render(tpl, tpl["stem_template"], vals))
            if stem in canonical:
                hits.append((vals, canonical[stem]))
            elif stem in every_roll:
                overlaps.setdefault(every_roll[stem], 0)
                overlaps[every_roll[stem]] += 1
        for vals, item_id in hits:
            fails.append((tpl["key"], vals, item_id))
        for item_id, n in sorted(overlaps.items()):
            warns.append((tpl["key"], item_id, n, len(rolls)))
    return fails, warns, None


def show(tpl, src, count, seed):
    sets, _ = sample_sets(tpl, count, seed)
    rng = random.Random(seed)
    canonical = derive(tpl, tpl["canonical_parameters"])
    picks = [canonical] + rng.sample(sets, min(count, len(sets)))
    for vals in picks:
        tag = " (canonical)" if vals == canonical else ""
        print(f"\n  {tpl['key']}{tag}  {dict(vals)}")
        print("   ", render(tpl, tpl["stem_template"], vals))
        for L in LETTERS:
            mark = "*" if L == src["correct_answer"] else " "
            slug = (src["misconception_tag"] or {}).get(L, "")
            shown = house_latex(ev(tpl, tpl["choice_formulas"][L], vals), tpl["variables"])
            print(f"    {mark}{L}: {shown:<24} {slug}")


# --------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source", choices=("curriculum", "bank"), default="curriculum")
    ap.add_argument("--topic", default="QR.3.5")
    ap.add_argument("--unit", default="unit-1", help="curriculum source unit directory")
    ap.add_argument("--samples", type=int, default=200,
                    help="random samples per template when the grid is too large to enumerate")
    ap.add_argument("--seed", type=int, default=20260729)
    ap.add_argument("--write", action="store_true",
                    help="record verification_status (bank pool only)")
    ap.add_argument("--show", metavar="KEY", help="print rolled instances for review")
    args = ap.parse_args()

    if args.source == "curriculum":
        pairs, pending = load_curriculum(args.topic, args.unit)
        pending_label = "no template yet"
        pending_summary = "gradeable items have no template"
    else:
        pairs, pending = load_bank(args.topic)
        pending_label = "no source item with this id"
        pending_summary = "templates have no source item"

    if args.show:
        match = [(t, s) for t, s in pairs if t["key"] == args.show]
        if not match:
            raise SystemExit(f"no template keyed {args.show!r} in the {args.source} pool")
        show(*match[0], 4, args.seed)
        return 0

    print(f"Verifying {len(pairs)} {args.source} templates for {args.topic}\n")
    results, total_sets = {}, 0

    for tpl, src in pairs:
        key = tpl["key"]
        try:
            fails, stats = verify(tpl, src, args.samples, args.seed)
        except TemplateError as exc:
            print(f"  {key:<14} FAIL -- malformed template: {exc}")
            results[key] = False
            continue

        total_sets += stats["sets"]
        results[key] = not fails
        status = "pass" if not fails else f"FAIL ({len(fails)})"
        print(f"  {key:<14} {status:<12} {stats['sets']:>6} sets, {stats['mode']}")
        for kind, vals, detail in fails[:10]:
            print(f"      [{kind}] {dict(vals) if vals else ''}")
            print(f"        {detail}")
        if len(fails) > 10:
            print(f"      ... and {len(fails) - 10} more")

    for key in pending:
        print(f"  {key:<14} MISSING      {pending_label}")

    print()
    # A gradeable item with no template is a failure, not a note. An empty or
    # half-filled pool is the one state that otherwise reports as success --
    # nothing ran, so nothing failed -- and that is exactly the state a CI job
    # must not sail through once the pool is expected to be populated.
    ok = not pending

    # Pool rule: the topic's mandatory sign-error coverage must survive
    # templating. Derived from the tag map for curriculum; still a declared
    # boolean for the bank, which has no per-option slugs to derive it from.
    if args.source == "curriculum":
        covered = [t["key"] for t, s in pairs
                   if results.get(t["key"])
                   and SIGN_ERROR_SLUG in (s["misconception_tag"] or {}).values()]
    else:
        covered = [t["key"] for t, _ in pairs
                   if t.get("sign_error_coverage") and results.get(t["key"])]
    if covered:
        print(f"  sign-error coverage: {', '.join(covered)}")
    elif pairs:
        print("  sign-error coverage: MISSING -- no passing template carries it")
        ok = False

    if args.source == "curriculum" and pairs:
        xfails, xwarns, skipped = cross_pool(pairs, args.topic, args.samples, args.seed)
        if skipped:
            print(f"  cross-pool: {skipped}")
        else:
            for key, vals, item_id in xfails:
                print(f"  cross-pool: FAIL {key} at {dict(vals)} renders {item_id}")
                ok = False
            for key, item_id, n, total in xwarns:
                print(f"  cross-pool: warn {key} shares {n}/{total} rolls with {item_id}'s "
                      f"range (harmless while the bank is parked)")
            if not xfails:
                print(f"  cross-pool: no roll renders a servable bank stem "
                      f"({len(pairs)} templates checked)")

    passed = sum(1 for v in results.values() if v)
    print(f"\n{passed}/{len(pairs)} templates passed, {total_sets} parameter sets checked")
    if pending:
        print(f"FAIL: {len(pending)} of {len(pairs) + len(pending)} {pending_summary}: "
              f"{', '.join(pending)}")

    if args.write:
        if args.source != "bank":
            raise SystemExit("--write records status in the bank pool's json; "
                             "curriculum templates live in the topic markdown")
        raw = json.loads((TEMPLATES / f"{args.topic}.json").read_text())
        for t in raw:
            t["verification_status"] = "passed" if results.get(t["item_id"]) else "failed"
        (TEMPLATES / f"{args.topic}.json").write_text(
            json.dumps(raw, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote verification_status to data/templates/{args.topic}.json")

    return 0 if ok and all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
