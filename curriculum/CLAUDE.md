# Curriculum content and figure authoring rules

Read this fully before authoring or editing any curriculum item or figure.
Save location: curriculum/CLAUDE.md. Claude Code and Cowork load it automatically
when working under curriculum/. When a task and this file disagree, this file wins.
When this file and the code disagree, verify against the code and fix this file.

## 0. Session start, every time

1. Phase 0 is read-only investigation. Report findings, then wait for approval
   before writing a single line of content or code.
2. Read the audit inputs under reports/ (section 9) so you know which items are
   already flagged and what the owner decided.
3. Write your own outputs to reports/ as the FIRST action and append per topic.
   Never hold results in memory for a single final write. A spend cap or timeout
   kills the last step, and that is exactly the step that held the results once.
4. Work on a branch: git checkout main && git pull && git checkout -b feat/<name>.
   Never push to main. Open a PR. Never self-merge. The owner reviews and merges.

## 1. Two content systems, never crossed

- CAT diagnostic item bank: data/, figure_type / figure_props. Separate system,
  already figure-audited (PR #65). Do not read or touch it for curriculum work.
- Curriculum: curriculum/source/tsia2-math/unit-*/<TOPIC>.md plus
  curriculum/figures/. This file governs curriculum only.
- Items never move between the two pools.

## 2. Topic markdown format (exact, the parser depends on it)

Sections, in this order, each opened by a heading of this exact shape:

    #### **Part 2: Practice Problems**      -> section "practice"      (10 items)
    #### **Part 3: Mini Quiz** (...)         -> section "mini_quiz"     (4 items)
    #### **Part 4: Answer Key**
    #### **Part 5: Extra Practice**          -> section "extra_practice" (growth)

Difficulty bands appear as their own line between items: **Basic Level**,
**Proficient Level**, **Advanced Level**. Numbering runs continuously across
bands within a section (1..10), it never restarts per band.

Practice and Extra Practice item shape:

    1. Stem text on one line, math in $...$.
       - A) $5$
       - B) $3$
       - C) $4$
       - D) $2$

Mini Quiz item shape (different, keep it that way):

    **Item 1**

    Stem text on its own line.

    - A) $2$
    - B) $5$
    - C) $3$
    - D) $1$

Figures sit after the stem and before the choices, as two lines:

    <!-- figure: pr-1-1-p5-dotplot-siblings -->
    ![Alt text describing exactly what the figure draws](data:image/svg+xml;base64,...)

Answer key placement (splitter gotcha): the "Extra Practice - Answer Key" worked
solutions go inside Part 4 directly after "Mini Quiz - Answer Key" with NO ---
divider between them. The Part 5 heading and its items go at the end of the
file after a --- divider. A stray divider inside Part 4 lands inside the wrong
item. Precedent: unit-3/GR.2.6.md.

## 3. Figure pipeline

- Specs live under curriculum/figures/. Types available: data_table (pictograph
  tables), coordinate_plane (bar, box, line via plots, scatter), dot_plot.
- Bake with the real step: node scripts/make_figure.mjs --inject. Never
  hand-write base64. A hand-written data URI is a fabricated artifact.
- Every new or changed spec must pass: node scripts/make_figure.mjs --verify <spec>
- The alt text must describe exactly what the figure draws, values included.
  The audit compares alt text and spec JSON against the stem.

## 4. The figure-must-match-text gate (non-negotiable)

A figure added to an item must depict exactly the quantities the stem states.
If the stem says a 3 by 4 by 5 prism, the figure shows 3, 4, 5 and nothing else.
A figure that contradicts its stem is worse than no figure: it breaks a working
item. Before landing any authored figure, check it against the "Figure must
show" quantities recorded for that item in reports/figure_audit_review.html
and reports/figure_audit_c2_queue.csv. Whether a text-only item even needs a
figure is the owner's call per item, never the agent's.

## 5. Print and palette constraints for figures

- The printed worksheet stays light. No dark fills, no color fields. Dark ink
  costs toner and muddies on classroom copiers. Do not add color variety.
- WorksheetSheet.tsx and print-styles.ts are byte-stable and disclaimer-locked.
  Never touch them from authoring work.
- Orange #F0A33E is fill, CTA, rule, or marker only. Never text.
- Strand tints are chips only, never fills. Single source: app/lib/strands.ts.

## 6. Variety rules for data-display topics

The samey-worksheet problem is a content problem, not a rendering problem:
24 questions hanging off 6 pictures. Rules for any topic whose items read
bar, line, pictograph, dot plot, box plot, or table displays:

- A topic's items should spread across at least 12 distinct displays, and no
  single display may be referenced by more than 3 items in that topic.
- Rotate contexts (rainfall, quiz scores, steps walked, tickets, plant heights,
  cookies sold, and so on). Do not reuse pizzas, books, pets, sports, temperature.
- Vary structure within a type: pictograph key (each icon = 2, 5, or 10),
  category count (4 vs 6), axis baseline, and bar orientation where the
  pipeline allows it.
- Stay inside the topic's named display types. A "bar, line, and pictograph"
  topic does not get dot plots or box plots; save those for topics that name them.
- Contextual pictograph icons (pizza slice, book, paw) are a future pipeline
  feature, not available yet. Stars are the only pictograph glyph today.

## 7. Mini quiz is a mastery gate, not practice

- Mini quiz has exactly 4 items and gates topic mastery at ceil(gradable * 3/4).
  Adding items to mini_quiz raises the bar for every student. Do not grow it.
- Part 5 Extra Practice is where a topic's item pool grows. Author there.
- Do not let mini_quiz items appear in any shuffled practice pool, and do not
  add practice items to the quiz denominator.

## 8. Content rules

- All math in $...$ LaTeX. Display math $$...$$ on its own paragraph. No raw
  Unicode math symbols. No double-dollar inline.
- Currency in markdown is bare \$40. Never $\$40$ (an escaped dollar inside
  math delimiters breaks remark-math pairing). Note the item-bank JSON spells
  currency as words instead; that is a different surface.
- Multi-word prose inside math is split: \text{exercise} \text{ and } \text{diet},
  never \text{exercise and diet} (trips the prose-in-math lint).
- No em dashes anywhere: content, comments, commit messages, this file.
- Every misconception slug must exist in data/docs/misconception_taxonomy.json.
  Do not invent slugs.
- Each distractor traces to one named misconception. Correct-answer
  distractor_logic entries begin with "Correct:".
- Answer-letter distribution is capped at 40 percent per letter within a pool.
- No College Board or ACCUPLACER affiliation claims. Print output carries the
  verbatim disclaimer: "Not affiliated with or endorsed by College Board or
  ACCUPLACER. TSIA2 is a trademark of its respective owner. Practice materials only."

## 9. Audit inputs (reports/, untracked, keep them)

- reports/figure_audit_reconciled.csv: every item keyed (topic_id, section,
  item_number) with both reviewers' calls and the reconciled verdict.
- reports/figure_audit_c2_queue.csv: missing-figure candidates by kind with the
  exact quantities a figure must show.
- reports/figure_audit_disputes.csv: the 24 items the two reviewers split on.
- reports/figure_audit_review.html: the full review copy with every question and
  its figure. The owner's marked-up decisions (keep as text / add figure / fix
  wording) are the authority for what gets built. Build only what was ticked
  "add figure" or "fix wording". Never author a figure for an item the owner
  did not tick.
- Known broken items (C1): QR.3.6 practice #9 ("Using the same drone data",
  borrows values from item 8, must be made self-contained) and PR.4.1
  mini_quiz #3 ("Three scatterplots are shown", no figure attached). Fix first.

## 10. Verification before any PR (all must pass, none may be skipped)

    python3 scripts/lint_curriculum_source.py --topics <each touched topic>   # 0 errors 0 warnings
    python3 scripts/lint_curriculum_source.py                                # whole repo: baseline is 5 errors / 10 warnings, all QR.1.1; must be unchanged
    node scripts/make_figure.mjs --verify <each new or changed spec>         # 0 failures
    npm test
    npm run test:offline                                                     # includes extra-practice gate and answer-key parity
    python3 scripts/faultproof_extra_practice_lint.py                        # 12/12

A check that cannot fail is not a check. If you add a verification, prove it
can go red before you trust it green. Verification runs against local or
branch data only, never production.

## 11. Publish step (owner runs, never the agent)

Merging a content PR lands markdown in the repo only. The app reads Supabase.
Nothing appears in the worksheet generator or student pages until the owner runs:

    git checkout main && git pull
    python3 scripts/diff_live_curriculum.py --course tsia2-math               # confirm only the touched topics differ
    python3 curriculum/migrations/upload_curriculum.py --course tsia2-math --dry-run
    python3 curriculum/migrations/upload_curriculum.py --course tsia2-math

The agent never runs upload_curriculum.py, never runs SQL, never reads or writes
production, and never receives a service-role key. End every content PR by
reminding the owner that the publish step is still required.