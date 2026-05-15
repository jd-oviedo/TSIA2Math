You are helping me author items for TSIA2Math, an adaptive practice platform 
for the Texas TSIA2 math placement exam. Generate THREE high-quality test 
items matching the specifications below.

## Items to Generate

All three items target the same content area: "Develop a function to model a situation."

Generate one item at each proficiency level:

1. item_id: QR_B_005 — Basic level
2. item_id: QR_P_005 — Proficient level  
3. item_id: QR_A_005 — Advanced level

Use a DIFFERENT context theme for each item. Choose from: everyday_finance, 
cooking_recipes, sports_recreation, science_application, shopping_retail, 
travel_distance, health_nutrition, construction_measurement, or other 
realistic contexts. Vary the contexts across the three items.

## Proficiency Level Anchors (from official TSIA2 descriptors)

BASIC: Your performance suggests that you can demonstrate one or more of
the following skills: ordering values of percents, decimals, and fractions;
calculating an average rate of change; identifying decimal equivalents
of common fractions; and estimating the value of the square root of
a non-perfect square number between two integers. However, your
performance also suggests that you need to develop many other
important skills, such as applying a simple given ratio to calculate
a value. 

PROFICIENT: Your performance suggests that you can demonstrate one or more of
the following skills: identifying an expression that represents a rate of
change; applying a simple given ratio to calculate a value; determining
sale price given a percent discount; and creating a two-variable
expression to represent a situation. However, your performance also
suggests that you need to develop other important skills, such as
expressing a percent algebraically. 

ADVANCED: Your performance suggests that you can demonstrate one or more
of the following skills: applying multiple ratios; expressing a percent
algebraically; evaluating and comparing multiple rates of change;
evaluating and estimating the product of two square roots of
non-perfect squares; and analyzing a multistep problem and creating
a linear equation to represent it. 

## Quality Requirements

1. Each item must require the proficiency-level skill — a student lacking 
   that skill should be unable to solve it.
2. Four multiple choice options (A, B, C, D).
3. Each distractor must capture a specific, NAMED student error documented 
   in distractor_logic. No random wrong answers.
4. Context should be realistic and culturally neutral.
5. Mathematical accuracy is critical. Show the full solution path in the 
   explanation.
6. Vary the contexts across the three items.

## Output Format

Output ONLY a valid JSON array containing the three items. Start with `[` 
and end with `]`. Items separated by commas. No prose before or after the 
JSON. Use this exact schema for each item — do not omit fields, use null 
where a value doesn't apply:

{
  "item_id": "",
  "version": 1,
  "status": "draft",
  "category": "Quantitative Reasoning",
  "category_code": "QR",
  "proficiency_level": "",
  "subtopic": "writing functions",
  "skills_targeted": [],
  "question_text": "",
  "question_format": "multiple_choice",
  "answer_choices": {
    "A": "",
    "B": "",
    "C": "",
    "D": ""
  },
  "correct_answer": "",
  "explanation": "",
  "distractor_logic": {
    "B": "",
    "C": "",
    "D": ""
  },
  "difficulty_level": "",
  "difficulty_b": null,
  "discrimination_a": null,
  "guessing_c": null,
  "content_context": "",
  "context_tags": [],
  "estimated_time_seconds": 0,
  "requires_calculator": false,
  "contains_image": false,
  "image_url": null,
  "exposure_max": 0.20,
  "times_administered": 0,
  "times_correct": 0,
  "dif_flag": null,
  "fairness_review_status": "pending",
  "fairness_review_date": null,
  "fairness_review_notes": null,
  "author": "jd-oviedo",
  "created_at": "2026-05-13",
  "last_modified": "2026-05-13",
  "review_notes": null
}
