# Mini-quiz difficulty band manifest

The sanctioned band for every in-scope mini-quiz item, and the practice item each band
is anchored to. This is the record Phase 3B applies from, so that what lands in Part 3
of each topic can be checked against a committed source rather than against a chat log.

## What this is for

`build_practice_items()` in `curriculum/migrations/upload_curriculum.py` runs ONE level
scan over both question sections, so a `**Basic Level**` heading placed in Part 3 is
honoured with no parser change and the item carries a real band. Before that was used,
`app/lib/worksheet-select.ts` also dropped the mini quiz by SECTION whenever a difficulty
filter was on, which made banding inert; that half shipped in PR #220.

Applying a band adds no item and removes none. Counts stay 10 practice + 4 quiz, stems,
choices, correct answers and the `interactive` flag are all untouched. The only stored
fields that change are the four `mini_quiz` level values and the additive heading text
inside `mini_quiz.raw`.

## Why this file is not a topic

It sits at the top of `curriculum/source/tsia2-math/` rather than inside a `unit-*`
directory, and every tool that walks the course requires that parent:
`upload_curriculum.py` and `diff_live_curriculum.py` glob `unit-*/[AGPQ][R]*.md`,
`lint_curriculum_source.py` globs the same, and `check_katex_render.mjs` filters
`readdirSync(SOURCE)` to entries starting `unit-`. So this file is uploaded by nothing
and linted by nothing. Keep it here.

## Scope

94 topics. The three exclusions, and why each one is out:

| Topic | Why it is excluded |
|---|---|
| `AR.2.1` | Banded and merged in Phase 2 (PR #220). Already live in source. |
| `QR.3.5` | The one templated topic. `sql/instance_level.sql` is unrun on production and its verification asserts that every mini-quiz instance has a null level, which banding would falsify. |
| `QR.1.1` | Deferred to its own rehab session. Its practice ladder is 12 items on a 5/5/2 split with 9 free-response, so only 3 practice items are printable and its quiz bands would rest on a weaker anchor than any other topic. |

The legacy QR head (`QR.2.1`, `QR.1.2`, `QR.1.3`, `QR.1.4`) IS banded here. Its
answer-key balance defect is a separate track: nothing in this pass touches an answer
key, a choice or a correct answer.

## Checksum

Filtered worksheet depth summed across the 94 in-scope topics. "Before" is practice
items only, which is all a difficulty filter can draw today. "After" adds the banded
quiz items.

| Filter state | Before | After | Gain |
|---|---:|---:|---:|
| all three bands | 940 | 1316 | +376 |
| Basic only | 376 | 595 | +219 |
| Proficient only | 282 | 395 | +113 |
| Advanced only | 282 | 326 | +44 |

Course-wide quiz split: **219 Basic, 113 Proficient, 44 Advanced** across 376 items.

Mini quizzes are end-of-topic checks and genuinely skew easy. No item was moved up a
band to flatten that, so 52 of these topics get no Advanced quiz item and 12 get no
Proficient one. Five topics come out entirely Basic and therefore gain nothing on a
Proficient or Advanced filter: `GR.2.5`, `GR.2.6`, `GR.2.7`, `GR.4.2`, `PR.2.5`.

## Unit 0: Foundations

14 topics, 56 quiz items, 30B 19P 7A.

### AR.1.1 - Definition of a function and function notation

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | If $f(x) = 5x - 2$, what is $f(3)$? | **Basic** | P1 | Evaluate a linear rule at a positive input, the task of practice 1 (f(6) for 4x-3). |
| 2 | A function $f$ is defined so that $f(6) = 1$. Which statement correctly interprets this? | **Basic** | P2 | Read what f(6)=1 asserts, the interpretation task of practice 2. |
| 3 | If $g(x) = x^{2} + 2x$, what is $g(-3)$? | **Proficient** | P5 | Substitute a NEGATIVE input into a quadratic, which is what lifts practice 5 (g(-2) for t^2-3t+1) above the band below it. |
| 4 | If $h(n) = 4n - 1$, for which value of $n$ does $h(n) = 19$? | **Proficient** | P6 | Run the rule backwards to recover the input, the exact demand of practice 6 (h(n)=13). |

### AR.1.2 - Recognizing if a relation is a function

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which statement correctly describes the relation $\{(2,4),(3,6),(2,8)\}$? | **Basic** | P1 | A repeated INPUT in a listed pair set, the disqualifier practice 1 tests. |
| 2 | A table records that input $1$ gives output $5$, input $2$ gives output $5$, and input $3$ gives output $5$. Does this table represent a function? | **Basic** | P2 | Repeated outputs across distinct inputs, still a function, as in practice 2. |
| 3 | Every vertical line drawn through a certain graph meets it at exactly one point, except one vertical line that meets it at three points. Is the relation a function? | **Proficient** | P6 | The vertical line test with one line meeting the graph three times, the exception structure of practice 6. |
| 4 | Which of these relations is a function? | **Basic** | P7 | Pick the function among four relations. One concept, no one-to-one distinction, so it sits below practice 7 rather than beside it. |

### AR.1.3 - Domain and range

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the domain of the relation $\{(4,1),(5,3),(6,3)\}$? | **Basic** | P1 | Read the domain straight off a listed pair set, practice 1. |
| 2 | What is the range of the relation $\{(1,2),(2,5),(3,2),(4,7)\}$? | **Basic** | P2 | Read the range off a listed pair set, practice 2. |
| 3 | The function $f(x) = 3x - 2$ has domain $\{1, 2, 3\}$. What is its range? | **Proficient** | P5 | Push a given domain through a rule to get the range, practice 5 exactly. |
| 4 | A graph is a line segment running from $(1, 3)$ to $(5, 11)$, with the left endpoint included and the right endpoint excluded. What is the domain? | **Proficient** | P3 | A segment with one endpoint EXCLUDED. Practice 3 is the closed-interval version at Basic; the open endpoint is the step up, short of the piecewise Advanced items. |

### AR.1.4 - Distinguishing function types (linear, quadratic, exponential, etc.)

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which of the following is an exponential function? | **Basic** | P1 | Identify an exponential from four expressions, practice 1 verbatim. |
| 2 | A table shows $x$ values $1, 2, 3, 4$ with $y$ values $4, 7, 10, 13$. Which family does this function belong to? | **Basic** | P3 | Constant first differences in a table means linear, practice 3. |
| 3 | A table shows $x$ values $0, 1, 2, 3$ with $y$ values $3, 12, 48, 192$. Which family does this function belong to? | **Basic** | P4 | A constant ratio in a table means exponential, practice 4. |
| 4 | In the function $f(x) = 2 \cdot 3^x$, what does the $3$ represent? | **Proficient** | P7 | Interpret what the BASE means rather than classify the family, the shift practice 7 makes. |

### GR.1.1 - Identifying common units of measurement

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A nurse needs to record a patient's body temperature. Which unit is most appropriate? | **Basic** | P1-P3 | Choose an appropriate unit for a familiar quantity, practices 1 to 3. |
| 2 | Which unit is most appropriate for expressing the distance of a long road race, about $26$ miles? | **Basic** | P1-P3 | Choose an appropriate unit for a large distance, same task. |
| 3 | A bag of flour has a mass of $3$ kilograms. How many grams is that? | **Proficient** | P7 | A single-step metric conversion, practice 7 (4 m to cm). |
| 4 | A tile floor measures $6$ yards by $4$ yards. Tile is sold by the square foot. How many square feet of tile are needed? ($1$ yard $= 3$ feet.) | **Advanced** | P10 | Area plus a SQUARED unit conversion, the two-stage demand of practice 10 (a lot in yards costed in square feet). |

### GR.1.2 - Identifying and defining types of angles (supplementary, complementary, vertical)

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Two angles are supplementary. One angle measures $125$ degrees. What is the measure of the other angle? | **Basic** | P2 | Supplementary pair, one angle given, practice 2. |
| 2 | Two lines intersect. One of the angles formed measures $76$ degrees. What is the measure of the angle directly opposite it? | **Basic** | P3 | Vertical angles, one given, practice 3. |
| 3 | Two vertical angles measure $(x + 40)$ degrees and $3x$ degrees. What is the value of $x$? | **Proficient** | P6 | Vertical angles as two expressions, solve for x, practice 6. |
| 4 | Angle P and angle Q are complementary. Angle Q measures $54$ degrees. Angle R is supplementary to angle P. What is the measure of angle R? | **Proficient** | P7 | Chained relationship across three angles, practice 7 exactly. |

### GR.1.3 - Reading and interpreting measurement scales

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A ruler is labelled at $2$ cm and $3$ cm, with $10$ equal spaces between the two labels. What does each space represent? | **Basic** | P1 | Divide a labelled interval by its number of spaces, practice 1. |
| 2 | A thermometer is labelled at $60$ degrees and $70$ degrees, with $5$ equal spaces between the two labels. The mercury sits $2$ spaces above the $60$ degree mark. What is the temperature? | **Basic** | P2-P4 | Read a pointer a whole number of spaces above a label, practice 2 and 4. |
| 3 | A gauge is labelled at $0$ and $12$. There are $3$ marks between the two labels, dividing the interval into equal spaces. What does each space represent? | **Proficient** | P7 | Stated as MARKS rather than spaces, so 3 marks make 4 intervals. That trap is what practice 7 is for. |
| 4 | A dial is labelled every $20$ units from $0$ to $100$, with $4$ equal spaces between each pair of labels. The needle sits $3$ spaces past the $40$ label. What is the reading? | **Advanced** | P8 | Two levels of scale at once, the label interval then its subdivision, as in practice 8. |

### PR.1.1 - Sorting and counting data

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A coach recorded the number of goals scored in $7$ games: $2, 0, 3, 2, 1, 2, 0$. How many games had exactly $2$ goals? | **Basic** | P1-P4 | Count exact occurrences of one value, practice 1 and 4. |
| 2 | A list of $9$ ages is: $19, 22, 25, 22, 31, 19, 40, 25, 19$. How many distinct values appear more than once? | **Proficient** | P7 | Count DISTINCT values that repeat, a two-pass question, practice 7 verbatim. |
| 3 | A survey of $10$ households recorded the number of cars owned: $1, 2, 0, 3, 1, 1, 2, 0, 4, 1$. How many households own at least $2$ cars? | **Proficient** | P5 | A threshold count (at least 2) rather than an exact match, which is the sweep practice 5 asks for. |
| 4 | A student claims to have arranged these values in ascending order: $8, 13, 21, 17, 25$. Which statement correctly identifies the error? | **Advanced** | P8 | Find the error in a claimed ascending order, practice 8 exactly. |

### PR.1.2 - Constructing simple graphs and tables

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Nine students answered a yes or no question with these responses: yes, no, yes, yes, no, yes, no, yes, yes. In a frequency table, what frequency should be recorded for yes? | **Basic** | P1-P4 | Tally one category out of a raw response list, practice 1 and 4. |
| 2 | A frequency table records A $6$, B $4$, and C $3$, and states a total of $14$. What is the actual sum of the recorded frequencies? | **Basic** | P2 | Sum the recorded frequencies and compare with the stated total, practice 2. |
| 3 | Eighteen students were surveyed about how they travel to school. A table shows Walk $5$ and Bus $7$, and leaves the Car row blank. What frequency belongs in the Car row? | **Proficient** | P5 | Recover a blank row from the survey total, practice 5. |
| 4 | A student builds a grouped frequency table using the intervals $0$ to $10$, $10$ to $20$, and $20$ to $30$. What is the structural problem with these intervals? | **Proficient** | P6 | Name the structural fault in overlapping interval boundaries, practice 6 exactly. |

### QR.1.5 - Operations with rational numbers (signed numbers, fractions, decimals)

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the value of $-9 - (-4)$? | **Basic** | P1-P2 | One operation on signed integers, the tier of practice 1 and 2. |
| 2 | What is the value of $\frac{7}{10} - \frac{1}{5}$, written in simplest form? | **Proficient** | P6 | Subtract fractions with unlike denominators and simplify, practice 6. |
| 3 | What is the value of $0.6 \times 0.05$? | **Basic** | P4 | Multiply two decimals, practice 4 exactly. |
| 4 | A diver descends $12.5$ feet from the surface, then rises $4.75$ feet, then descends another $6.25$ feet. Taking sea level as $0$ and descent as negative, what is the diver's final position? | **Advanced** | P8-P10 | A three-step signed word problem with a stated sign convention, the shape of practice 8 and 10. |

### QR.1.6 - Rounding to a given place value

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is $6{,}249$ rounded to the nearest hundred? | **Basic** | P1 | Round an integer to the nearest hundred, practice 1. |
| 2 | What is $0.0857$ rounded to the nearest hundredth? | **Basic** | P2 | Round a decimal to the nearest hundredth, practice 2. |
| 3 | What is $7{,}981$ rounded to the nearest hundred? | **Proficient** | P5, P1 | Rounding that CASCADES into the next place (7,981 to 8,000), which is what separates practice 5 from practice 1. |
| 4 | A truck's odometer reads $87{,}462$ miles. A logbook records this figure rounded to the nearest thousand miles, and an insurance form records the same figure rounded to the nearest ten thousand miles. What is the difference between the two recorded figures? | **Advanced** | P10 | Round the same figure to two different places and compare, practice 10 exactly. |

### QR.1.7 - Order of operations

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the value of $7 + 2 \times 5$? | **Basic** | P1 | One multiplication before one addition, practice 1. |
| 2 | What is the value of $(9 - 4)^2$? | **Basic** | P2-P4 | A grouping and a power, each a Basic skill in practice 2 and 4, with no nesting. |
| 3 | What is the value of $18 \div 3 + 2 \times 4$? | **Proficient** | P5 | Three operations, two of them multiplicative, resolved before the addition. The Basic items are all two-operation; this is the practice 5 tier. |
| 4 | A phone plan costs \$35 per month plus \$0.10 per text message, and a \$15 account credit is subtracted from the total. What is the bill for a month with $120$ text messages? | **Advanced** | P9 | A multi-step cost model with a fixed charge, a per-unit rate and a subtraction, practice 9 exactly. |

### QR.1.8 - Absolute value

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the value of $\|-12\|$? | **Basic** | P1 | Absolute value of a single negative, practice 1. |
| 2 | What is the value of $\|4 - 11\|$? | **Basic** | P2 | Absolute value of a difference, practice 2. |
| 3 | What are all the solutions to $\|x + 2\| = 7$? | **Proficient** | P6 | An absolute value EQUATION with a shift, two solutions, practice 6. |
| 4 | Which of the following describes all solutions to $\|x\| > 3$? | **Advanced** | P9 | An absolute value INEQUALITY described as a solution set, practice 9. |

### QR.3.8 - Distributive property

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which expression is equivalent to $5(x + 3)$? | **Basic** | P1 | Distribute a positive factor over a sum, practice 1. |
| 2 | Which expression is equivalent to $-4(x - 2)$? | **Basic** | P2 | Distribute a negative factor over a difference, practice 2. |
| 3 | Which expression is $20x + 30$ factored completely? | **Basic** | P4 | Factor out the greatest common factor from a two-term expression, practice 4. |
| 4 | Which expression is equivalent to $2(3x - 1) + 5x$? | **Proficient** | P6 | Distribute and then combine like terms, the added step in practice 6. |

## Unit 1: Quantitative Reasoning

13 topics, 52 quiz items, 32B 15P 5A.

### QR.1.2 - Ordering values across forms (fractions, decimals, percents)

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 0P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which of the following equals $\frac{3}{8}$? | **Basic** | P1-P2 | Recognise one equivalent form of a fraction, the single conversion of practice 1 and 2. |
| 2 | Order from least to greatest: $\frac{2}{5}$, $0.35$, $38\%$ | **Basic** | P4, P5 | Order three values across three forms, practice 4. The spread here needs two decimals, not the three-decimal precision that lifts practice 5. |
| 3 | Which is larger, $\frac{7}{10}$ or $68\%$? | **Basic** | P3 | Compare two values in two forms, practice 3 exactly. |
| 4 | A notebook costs \$8. One store takes $\frac{1}{5}$ off. Another store takes $18\%$ off. Which store is cheaper, and what is the price there? | **Advanced** | P9 | Two discounts expressed in different forms, compared, then the resulting price, practice 9 exactly. |

### QR.1.3 - Decimal equivalents of common fractions

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Convert $\frac{1}{5}$ to a decimal. | **Basic** | P1-P2 | Convert a common fraction to a decimal, practice 1 and 2. |
| 2 | Convert $0.8$ to a fraction in lowest terms. | **Basic** | P4 | Convert a terminating decimal to a fraction in lowest terms, practice 4. |
| 3 | Which fraction has a repeating decimal form? | **Advanced** | P10 | Decide which fraction REPEATS, the terminating-versus-repeating rule of practice 10. |
| 4 | Which is larger, $\frac{7}{8}$ or $0.85$? | **Proficient** | P7, P9 | Compare a fraction with a decimal, the largest-value judgement of practice 7, without the real-world wrapper practice 9 adds. |

### QR.1.4 - Estimating square roots of non-perfect squares

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Between which two consecutive integers does $\sqrt{35}$ fall? | **Basic** | P1-P4 | Bracket a radical between consecutive integers, practice 1 and 4. |
| 2 | Which is the best estimate of $\sqrt{90}$? | **Basic** | P3 | Choose the best estimate of a radical, practice 3. |
| 3 | Which is larger, $\sqrt{26}$ or $5.1$? | **Proficient** | P5 | Compare a radical with a decimal, practice 5 exactly. |
| 4 | Between which two consecutive integers does $\sqrt{150}$ fall? | **Basic** | P1-P4 | The same bracketing skill as practice 1 and 4 with a larger radicand. Bigger numbers, identical method. |

### QR.2.1 - Applying a simple ratio to calculate a value

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A recipe uses $2$ cups of rice for every $3$ cups of water. If you use $6$ cups of rice, how much water do you need? | **Basic** | P1 | One part of a ratio given, find the other, practice 1. |
| 2 | The ratio of boys to girls in a club is $3:5$. If the club has $40$ members, how many are girls? | **Proficient** | P5 | The TOTAL given rather than one part, which is what lifts practice 5. |
| 3 | A car travels $150$ miles on $5$ gallons of gas. At the same rate, how far can it travel on $8$ gallons? | **Advanced** | P9 | Derive a unit rate and then scale it, the structure practice 9 is banded on. |
| 4 | In a photo, the ratio of width to height is $4:3$. If the width is $24$ inches, what is the height? | **Basic** | P1-P3 | One part given, find the other, practice 1 and 3. |

### QR.2.2 - Multi-step proportion problems

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A pump moves $9$ gallons every $2$ minutes. At this rate, how many gallons does it move in $30$ minutes? | **Basic** | P1 | One rate, scaled once, practice 1 exactly. |
| 2 | Three kilograms of rice cost \$7.50. At the same rate, what do $8$ kilograms cost? | **Basic** | P2 | Cost per unit, scaled once, practice 2 exactly. |
| 3 | Two runners leave the same point at the same time, running in the same direction, one at $6$ miles per hour and one at $10$ miles per hour. How far apart are they after $45$ minutes? | **Proficient** | P6 | Two rates and a separation gap over time, practice 6 exactly. |
| 4 | A class has boys and girls in a $4:7$ ratio. There are $12$ more girls than boys. How many students are in the class in total? | **Advanced** | P10 | A ratio given by the DIFFERENCE between the parts rather than a total, practice 10 exactly. |

### QR.2.3 - Percents and percent change

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 0P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is $40\%$ of $85$? | **Basic** | P1 | A percent of a number, practice 1. |
| 2 | A bicycle priced at \$250 is discounted by $12\%$. What is the sale price? | **Basic** | P2 | One discount applied to a price, practice 2. |
| 3 | A value rises from $80$ to $92$. What is the percent increase? | **Basic** | P3 | Percent increase between two values, practice 3 exactly. |
| 4 | A jacket's price is increased by $10\%$ and then decreased by $10\%$. Compared with the original price, the final price is: | **Advanced** | P8 | An increase and a matching decrease, and what that does to the original, practice 8 exactly. |

### QR.2.4 - Percents in algebraic contexts

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | After a $15\%$ discount, a lamp costs \$68. What was the original price? | **Basic** | P1 | Recover the pre-discount price, practice 1 exactly. |
| 2 | $40\%$ of a number is $26$. What is the number? | **Basic** | P2 | Recover the whole from a percent of it, practice 2 exactly. |
| 3 | A $50$-liter solution is $12\%$ salt. How many liters of pure water must be added to dilute it to $10\%$ salt? | **Proficient** | P5 | Change a solution's concentration by adding one pure component, the practice 5 structure (that one concentrates, this one dilutes). |
| 4 | A store discounts an item by $25\%$. By what percent must the store then mark up the sale price to return to the original price? | **Proficient** | P6 | The markup that undoes a discount, practice 6 exactly. |

### QR.2.5 - Rates and unit rates

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A car uses $9$ gallons of gas to travel $216$ miles. What is its fuel economy in miles per gallon? | **Basic** | P1 | A single unit rate from a distance and a volume, practice 1. |
| 2 | A $15$-ounce jar of sauce costs \$5.40. What is the price per ounce? | **Basic** | P2 | A single unit price, practice 2. |
| 3 | Pump A fills a tank in $10$ hours. Pump B fills the same tank in $15$ hours. Working together, how long do they take? | **Proficient** | P6 | Combined work rates, practice 6 exactly. |
| 4 | Two cars are $240$ miles apart and drive toward each other, one at $45$ miles per hour and the other at $35$ miles per hour. How far does the slower car travel before they meet? | **Proficient** | P7 | Closing speeds over a fixed separation, practice 7 exactly. |

### QR.2.6 - Unit conversion within a system

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | How many inches are in $5$ yards? | **Basic** | P1 | One conversion inside the customary system, practice 1. |
| 2 | Convert $3.25$ kilograms to grams. | **Basic** | P2-P3 | One metric conversion, practice 2 and 3. |
| 3 | Posts are placed every $5$ feet along a straight $60$-foot rail, with a post at each end. How many posts are needed? | **Basic** | P4 | The fencepost count, where posts exceed intervals by one. Practice 4 bands this shape Basic. |
| 4 | A tub fills at $9$ liters per minute while draining at $4$ liters per minute. How long does it take to reach $60$ liters? | **Proficient** | P5 | A net rate from a fill and a drain, practice 5 exactly. |

### QR.2.7 - Unit conversion between systems

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Convert $6$ inches to centimeters, given that $1$ inch $= 2.54$ centimeters. | **Basic** | P1 | One linear conversion with the factor supplied, practice 1. |
| 2 | Convert $40$ degrees Celsius to Fahrenheit, using $F = \frac{9}{5}C + 32$. | **Basic** | P4 | Substitution into a supplied formula, practice 4. |
| 3 | A tabletop has an area of $5$ square meters. What is its area in square feet, given that $1$ meter $\approx 3.28$ feet? | **Proficient** | P5 | An AREA conversion, where the factor is squared, practice 5. |
| 4 | Convert $20$ pounds to kilograms, given that $1$ kilogram $\approx 2.2$ pounds. | **Basic** | P3 | The conversion runs the other way and needs division, but practice 3 already bands that direction Basic. |

### QR.2.8 - Direct variation

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | If $y$ varies directly with $x$, and $y = 21$ when $x = 7$, what is the constant of variation? | **Basic** | P1 | Find the constant of variation, practice 1. |
| 2 | If $y$ varies directly with $x$, and $y = 24$ when $x = 6$, what is $y$ when $x = 10$? | **Basic** | P2 | Find a second value through the constant, practice 2. |
| 3 | Which equation represents a direct variation? | **Basic** | P4 | Recognise the form of a direct variation, practice 4. |
| 4 | Six machines can fill an order in $8$ hours. Working at the same rate each, how long would $12$ machines take? | **Proficient** | P7 | More machines finishing sooner is INVERSE, not direct, which is the trap practice 7 sets. |

### QR.3.1 - Translating verbal descriptions to algebraic expressions

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which expression represents "$7$ less than three times a number $n$"? | **Basic** | P1 | A two-operation phrase with no inner grouping, practice 1. |
| 2 | A tutor charges a \$20 booking fee plus \$35 per hour. Which expression represents the total cost for $h$ hours? | **Basic** | P4 | A fixed fee plus a per-unit rate as an expression, practice 4. |
| 3 | Which expression represents "twice the sum of a number $n$ and $6$"? | **Proficient** | P5 | A parenthesised SUM multiplied as a whole, the grouping that defines practice 5. |
| 4 | A car rental costs \$45 plus \$0.20 per mile. What is the cost of renting the car and driving $150$ miles? | **Proficient** | P6 | Evaluate a fee-plus-rate model at a given input rather than express it, practice 6. |

### QR.4.1 - Proportional relationship problems in context

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A recipe that serves $6$ people uses $4$ cups of flour. How much flour is needed to serve $15$ people? | **Basic** | P1 | One proportion scaled once, practice 1. |
| 2 | A plumber charges a \$60 call-out fee plus \$40 per hour. What is the cost of a $3$-hour job? | **Basic** | P2 | A base fee plus a per-hour rate, practice 2. |
| 3 | A phone plan charges \$0.10 per text for the first $100$ texts and \$0.05 per text after that. What is the cost of sending $250$ texts? | **Proficient** | P6 | A TIERED rate with a threshold, practice 6 exactly. |
| 4 | A machine makes $180$ parts in $4$ hours. At the same rate, how long does it take to make $495$ parts? | **Proficient** | P7 | Invert a production rate to find a time, practice 7 exactly. |

## Unit 2: Algebraic Foundations

14 topics, 56 quiz items, 33B 18P 5A.

### AR.2.2 - Solving one-variable linear inequalities

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Solve $4x - 3 < 13$. | **Basic** | P1 | A two-step inequality with a positive coefficient, practice 1. |
| 2 | Solve $-5x \le 20$. | **Basic** | P2-P4 | Dividing by a negative, so the sign flips. Practice 2 and 4 band that flip Basic. |
| 3 | Solve $7 - 3x > 1$. | **Proficient** | P5 | The variable term is negative on the left, so it must be moved before the flip, practice 5 exactly. |
| 4 | A student has \$60 and tickets cost \$9 each. How many tickets can the student buy? | **Proficient** | P7 | A budget constraint answered as a whole number of items, practice 7 exactly. |

### AR.2.3 - Evaluating linear functions for a given value

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 0P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | If $f(x) = 5x + 6$, what is $f(4)$? | **Basic** | P1 | Evaluate a linear rule at a positive input, practice 1. |
| 2 | If $g(x) = 2x - 9$, what is $g(-3)$? | **Basic** | P4 | Evaluate at a NEGATIVE input, which practice 4 bands Basic. |
| 3 | If $C(m) = 18m + 25$, what is $C(5)$? | **Basic** | P3 | Evaluate a named cost function, practice 3. |
| 4 | If $f(x) = 4x + 11$ and $f(a) = 51$, what is $a$? | **Advanced** | P9 | Run the rule backwards from an output to its input, practice 9 exactly. |

### AR.2.4 - Solving systems of linear equations

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Solve the system $y = x + 4$ and $y = 2x + 1$. | **Basic** | P1 | Both equations already solved for y, so substitution is immediate, practice 1. |
| 2 | Solve the system $x + y = 12$ and $x - y = 2$. | **Basic** | P2 | Elimination on a sum and difference pair, practice 2. |
| 3 | Solve the system $y = 2x + 3$ and $y = 2x - 1$. | **Advanced** | P8 | Equal slopes and different intercepts, so the system has NO solution, practice 8 exactly. |
| 4 | Is $(3, 1)$ a solution of the system $2x + y = 7$ and $x - y = 3$? | **Proficient** | P6 | Verify a candidate pair against both equations, practice 6 exactly. |

### AR.2.5 - Linear inequalities in two variables (graphing solution regions)

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 0P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Is $(1, 5)$ a solution of $y > 3x + 1$? | **Basic** | P1 | Test one point against one inequality, practice 1. |
| 2 | Should the boundary of $y < 2x - 5$ be drawn solid or dashed? | **Basic** | P2 | Strict or inclusive decides solid or dashed, practice 2. |
| 3 | For the inequality $y \ge -x + 4$, which region is shaded? | **Basic** | P3 | Name the shaded side from the inequality symbol, practice 3. |
| 4 | Rewrite $-3y \le 6x - 9$ with $y$ alone. | **Advanced** | P8 | Isolating y across a NEGATIVE coefficient, so the symbol flips, practice 8. |

### AR.2.6 - Slope, slope-intercept form, and writing equations of lines

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the slope of the line through $(1, 2)$ and $(5, 14)$? | **Basic** | P1 | Slope from two points, practice 1. |
| 2 | What are the slope and y-intercept of $y = 6x - 2$? | **Basic** | P2 | Read slope and intercept off slope-intercept form, practice 2. |
| 3 | What is the equation of the line through $(3, 8)$ with slope $2$? | **Proficient** | P5 | Build the equation from a point and a slope, practice 5 exactly. |
| 4 | What is the equation of the vertical line through $(-5, 1)$? | **Advanced** | P8 | A VERTICAL line, which has no slope and is not a function of x, practice 8 exactly. |

### AR.2.7 - Parallel and perpendicular lines

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the slope of a line parallel to $y = -7x + 2$? | **Basic** | P1 | The slope of a parallel line is the same slope, practice 1. |
| 2 | What is the slope of a line perpendicular to $y = -4x + 1$? | **Basic** | P2 | The slope of a perpendicular line is the negative reciprocal, practice 2. |
| 3 | What is the relationship between $y = 5x + 2$ and $y = 5x + 2$? | **Proficient** | P6 | Two identical lines, so the answer is the same-line category rather than parallel, the classification practice 6 asks for. |
| 4 | What is the equation of the line through $(2, 9)$ parallel to $y = -3x + 1$? | **Proficient** | P7 | Build the equation of a parallel line through a given point, practice 7 exactly. |

### AR.2.8 - Literal equations (solving for a variable in a formula)

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Solve $V = lwh$ for $h$. | **Basic** | P1-P2 | One division undoes a bare product, practice 1 and 2. |
| 2 | Solve $y = mx + b$ for $b$. | **Basic** | P3 | One subtraction isolates the constant term, easier than practice 3 which solves the same formula for x. |
| 3 | Solve $A = \frac{1}{2}bh$ for $b$. | **Proficient** | P6 | Clear a fraction and then divide, practice 6 exactly. |
| 4 | Solve $px + qx = r$ for $x$. | **Proficient** | P7 | The target variable appears twice and must be factored out, practice 7 exactly. |

### QR.3.2 - Identifying expressions that represent rates of change

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | For the relationship $y = 9x + 4$, what is the rate of change? | **Basic** | P1-P3 | Read the coefficient off a linear rule, practice 1 to 3. |
| 2 | A pool drains so that $V = 500 - 12t$, where $t$ is minutes. What is the rate of change? | **Basic** | P4 | A DECREASING rate, read as negative, practice 4 exactly. |
| 3 | A relationship contains the points $(1, 7)$ and $(4, 19)$. What is the rate of change? | **Proficient** | P7 | Compute the rate from two points. Every Basic item reads it off an equation; deriving it starts at practice 7. |
| 4 | Store P sells flour at $4$ kilograms for \$10. Store Q sells flour at $6$ kilograms for \$14.40. Which store has the lower rate per kilogram? | **Proficient** | P5 | Compare two unit rates from paired quantities, practice 5 exactly. |

### QR.3.3 - Creating a two-variable expression from a situation

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Pencils cost \$0.50 each and erasers cost \$0.75 each. Which expression represents the cost of $p$ pencils and $e$ erasers? | **Basic** | P1-P2 | Two unit costs combined into one expression, practice 1 and 2. |
| 2 | Tickets cost \$15 per adult and \$9 per student, and every order carries a \$5 booking fee. Which expression represents the total for $a$ adults and $s$ students? | **Basic** | P3 | Two unit costs plus a flat fee, practice 3 exactly. |
| 3 | A hall has $4$ times as many chairs as tables. If $t$ represents tables and $c$ represents chairs, which equation is correct? | **Basic** | P4 | A multiplier relating two quantities, practice 4 exactly. |
| 4 | Using $C = 7x + 4y + 20$, what is the value of $C$ when $x = 3$ and $y = 6$? | **Proficient** | P7 | Evaluate a two-variable model at given values rather than build it, practice 7 exactly. |

### QR.3.4 - Interpreting slope/intercept meaning in context

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A repair bill is $C = 20h + 75$ dollars, where $h$ is hours. What does the $20$ represent? | **Basic** | P1 | Interpret the coefficient as a per-unit rate, practice 1. |
| 2 | For the same bill $C = 20h + 75$, what does the $75$ represent? | **Basic** | P2 | Interpret the constant as a fixed starting amount, practice 2. |
| 3 | Pages remaining in a book are modelled by $P = 500 - 25w$, where $w$ is weeks. What does the $-25$ represent? | **Basic** | P3 | Interpret a NEGATIVE coefficient as a decrease, practice 3 exactly. |
| 4 | A tank holds $30$ liters and fills at $4$ liters per minute. Written as $V = mt + b$, what are $m$ and $b$? | **Proficient** | P7 | Go the other way, from a described situation to m and b, practice 7 exactly. |

### QR.3.6 - Average rate of change

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A relationship contains the points $(2, 5)$ and $(8, 29)$. What is the average rate of change? | **Basic** | P1 | Average rate between two given points, practice 1. |
| 2 | A pool falls from $200$ liters to $80$ liters over $6$ minutes. What is the average rate of change? | **Basic** | P4 | A decreasing quantity over a stated interval, practice 4. |
| 3 | A function has $f(1) = 3$, $f(4) = 15$ and $f(9) = 25$. What is the average rate of change from $x = 4$ to $x = 9$? | **Proficient** | P5 | Three values supplied and only two of them wanted, so the interval must be selected first, practice 5. |
| 4 | A city's population was $400$ in $1980$, $700$ in $1990$ and $1{,}500$ in $2000$. What is the average rate of change per year from $1980$ to $2000$? | **Proficient** | P7 | Rate across a span that skips an intermediate reading, practice 7 exactly. |

### QR.3.7 - Comparing multiple rates of change

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Plan A costs $C = 30 + 10m$ and Plan B costs $C = 60 + 5m$, where $m$ is months. Which plan has the greater rate of change? | **Basic** | P1 | Compare two coefficients directly, practice 1 verbatim. |
| 2 | Plan A costs $C = 30 + 10m$ and Plan B costs $C = 60 + 5m$, where $m$ is months. At what month do the two plans cost the same, and what is that cost? | **Proficient** | P5 | Solve for the month where the two models meet, practice 5 verbatim. |
| 3 | Plan A costs $C = 30 + 10m$ and Plan B costs $C = 60 + 5m$, where $m$ is months. How much faster does Plan A's cost rise than Plan B's? | **Basic** | P4 | Difference of the two rates, practice 4 verbatim. |
| 4 | Bike shop R rents at \$8 per hour with a \$12 deposit. Bike shop S rents at \$11 per hour with no deposit. For a $5$-hour rental, which is cheaper and by how much? | **Advanced** | P10 | A new pair of models, evaluated at a point, compared, and the gap reported, practice 10 exactly. |

### QR.4.2 - Multi-step problems combining proportional and linear reasoning

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A taxi charges \$4 plus \$1.75 per mile. What does a $12$-mile ride cost? | **Basic** | P1 | A fee plus a per-mile rate, evaluated, practice 1. |
| 2 | A bill of \$148 is made up of a \$28 fee plus \$20 per month. How many months does it cover? | **Basic** | P2 | Recover the number of periods from a total, practice 2. |
| 3 | A subscription costs \$9 per month plus a one-time \$15 setup fee. What does a three-year subscription cost? | **Proficient** | P5 | A term given in YEARS against a monthly rate, so the units convert first, practice 5 exactly. |
| 4 | A car travels $28$ miles per gallon and gas costs \$3.25 per gallon. A $420$-mile trip also incurs \$18 in parking. What is the total cost? | **Proficient** | P7 | Fuel economy, a price per gallon and a separate fixed cost, practice 7 exactly. |

### QR.4.3 - Analyzing a multistep problem and creating a linear equation

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A pool holds $400$ liters and drains $25$ liters per minute. Which equation gives the volume $V$ after $t$ minutes? | **Basic** | P1 | A starting amount and a stated drain rate, practice 1. |
| 2 | A tree is $80$ cm tall and grows $6$ cm per month. Which equation gives the height $h$ after $m$ months? | **Basic** | P2 | A starting amount and a stated growth rate, practice 2. |
| 3 | A phone is worth \$400 and falls to \$160 over $4$ years, linearly. Which equation gives its value $V$ after $t$ years? | **Basic** | P3 | The rate is not stated and must come from two endpoints, which practice 3 bands Basic. |
| 4 | An account holds \$900 after $2$ months and grows \$120 per month. Which equation gives the balance $B$ after $m$ months from the start? | **Proficient** | P5 | The value given is not the starting value, so the intercept must be worked backwards, practice 5 exactly. |

## Unit 3: Geometry and Measurement

16 topics, 64 quiz items, 46B 13P 5A.

### GR.2.1 - Perimeter of polygons and multi-sided figures

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A rectangle has a length of $12$ m and a width of $7$ m. What is the perimeter? | **Basic** | P1 | Perimeter of a rectangle from its two dimensions, practice 1. |
| 2 | A regular hexagon has a side length of $5$ yd. What is the perimeter of the hexagon? | **Basic** | P3 | Perimeter of a regular polygon from one side, practice 3. |
| 3 | A square has a perimeter of $52$ in. What is the length of one side? | **Proficient** | P6 | Run it backwards, from perimeter to one side, practice 6. |
| 4 | An irregular pentagon has a perimeter of $55$ ft. Four of the five sides measure $8$ ft, $12$ ft, $9$ ft, and $11$ ft. What is the length of the fifth side? | **Proficient** | P5 | A total with four of five sides given, so the fifth is recovered by subtraction, the reverse direction practice 5 bands here. |

### GR.2.2 - Circumference of a circle

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A circle has a radius of $8$. What is its circumference? | **Basic** | P1 | Circumference from a radius, practice 1. |
| 2 | A circle has a diameter of $20$. What is its circumference? | **Basic** | P2 | Circumference from a diameter, practice 2. |
| 3 | A circle has a circumference of $43.96$. What is its diameter? | **Basic** | P3 | Circumference back to a diameter, one step shorter than practice 3 which recovers the radius. |
| 4 | A half-circle has a radius of $4$. What is the length of its curved edge alone? | **Proficient** | P5, P6 | Half a circumference as an arc, without the straight edge practice 5 adds, and the arc-length idea of practice 6. |

### GR.2.3 - Area of 2D figures

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A triangle has a base of $8$ and a height of $5$. What is its area? | **Basic** | P2 | Area of a triangle, practice 2. |
| 2 | A rectangle measures $7$ by $9$. What is its area? | **Basic** | P1 | Area of a rectangle, practice 1. |
| 3 | A circle has a radius of $4$. What is its area? | **Basic** | P4 | Area of a circle, practice 4. |
| 4 | A trapezoid has bases of $12$ and $8$ and a height of $5$. What is its area? | **Proficient** | P5 | The trapezoid formula, with two bases to average, practice 5 exactly. |

### GR.2.4 - Inverse measurement problems

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 0P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A square has an area of $64$. What is the length of one side? | **Basic** | P1 | Area of a square back to its side, practice 1. |
| 2 | A rectangle has an area of $72$ and a width of $8$. What is its length? | **Basic** | P2 | Area and one dimension back to the other, practice 2. |
| 3 | A triangle has an area of $30$ and a base of $12$. What is its height? | **Basic** | P3 | Triangle area back to a height, practice 3. |
| 4 | A circle has an area of $78.5$. What is its circumference? | **Advanced** | P10 | TWO inversions in sequence, area to radius to circumference, practice 10 exactly. |

### GR.2.5 - Surface area of 3D figures

Practice ladder 4B / 3P / 3A. Proposed quiz split **4B 0P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A cube has an edge of $5$. What is its surface area? | **Basic** | P2 | Surface area of a cube, practice 2. |
| 2 | A rectangular prism measures $6$ by $4$ by $2$. What is its surface area? | **Basic** | P1 | Surface area of a rectangular prism, practice 1. |
| 3 | A cylinder has a radius of $3$ and a height of $5$. What is its total surface area? | **Basic** | P3 | Total surface area of a closed cylinder, practice 3. |
| 4 | A square pyramid has a base edge of $4$ and a slant height of $6$. What is its surface area? | **Basic** | P4 | Surface area of a square pyramid from a base edge and a slant height, practice 4. |

### GR.2.6 - Volume of 3D figures

Practice ladder 4B / 3P / 3A. Proposed quiz split **4B 0P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A rectangular prism measures $5$ by $3$ by $2$. What is its volume? | **Basic** | P1 | Volume of a rectangular prism, practice 1. |
| 2 | A cylinder has a radius of $2$ and a height of $6$. What is its volume? | **Basic** | P2 | Volume of a cylinder, practice 2. |
| 3 | A cone has a radius of $6$ and a height of $5$. What is its volume? | **Basic** | P3 | Volume of a cone, practice 3. |
| 4 | A sphere has a radius of $3$. What is its volume? | **Basic** | P4 | Volume of a sphere, practice 4. |

### GR.2.7 - Expressing measurement with algebraic expressions

Practice ladder 4B / 3P / 3A. Proposed quiz split **4B 0P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A rectangle has a length of $x + 4$ and a width of $3$. What is its perimeter? | **Basic** | P1 | Perimeter with one dimension as a binomial, practice 1 exactly. |
| 2 | A rectangle has a length of $x + 4$ and a width of $3$. What is its area? | **Basic** | P2 | Area with one dimension as a binomial, practice 2 exactly. |
| 3 | A square has a side of $x + 3$. What is its area? | **Basic** | P4 | A binomial squared, which practice 4 bands Basic. |
| 4 | A triangle has a base of $4x$ and a height of $5$. What is its area? | **Basic** | P3 | Triangle area with a monomial base, practice 3 exactly. |

### GR.3.1 - Pythagorean theorem

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A right triangle has legs of length $9$ and $12$. What is the length of the hypotenuse? | **Basic** | P1-P3 | Two legs to the hypotenuse, practice 1 and 3. |
| 2 | A right triangle has a hypotenuse of length $20$ and one leg of length $12$. What is the length of the other leg? | **Basic** | P2-P4 | Hypotenuse and one leg to the other leg, practice 2 and 4. |
| 3 | A right triangle has a hypotenuse of length $26$ and one leg of length $24$. What is the perimeter of the triangle? | **Proficient** | P7 | Recover the missing leg AND then sum all three sides, one step beyond practice 7, which is given both legs. |
| 4 | In a right triangle, one leg is $7$ longer than the other, and the hypotenuse is $13$. What is the length of the longer leg? | **Advanced** | beyond P8 | The two legs are related algebraically rather than given, so the theorem becomes an equation to solve. |

### GR.3.2 - Special right triangles

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A $45$-$45$-$90$ triangle has legs of $7$. What is the length of its hypotenuse? | **Basic** | P1 | The 45-45-90 leg to hypotenuse ratio, practice 1. |
| 2 | A $30$-$60$-$90$ triangle has a short leg of $5$. What is the length of its hypotenuse? | **Basic** | P3 | The 30-60-90 short leg to hypotenuse ratio, practice 3. |
| 3 | A $30$-$60$-$90$ triangle has a hypotenuse of $16$. What is the length of its long leg? | **Proficient** | P5 | Hypotenuse to LONG leg, which is two ratio steps. Practice 5 stops at the short leg. |
| 4 | A square has a diagonal of $6\sqrt{2}$. What is the length of its side? | **Basic** | P2 | A square's diagonal in root-2 form back to its side, the arithmetic practice 2 bands Basic, only worded as a square. |

### GR.3.3 - Basic trigonometric ratios

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A right triangle has the side opposite $\theta$ equal to $6$, the side adjacent to $\theta$ equal to $8$, and a hypotenuse of $10$. What is $\sin\theta$? | **Basic** | P1 | Read sine off three given sides, practice 1. |
| 2 | A right triangle has the side opposite $\theta$ equal to $6$, the side adjacent to $\theta$ equal to $8$, and a hypotenuse of $10$. What is $\tan\theta$? | **Basic** | P3 | Read tangent off the same three sides, practice 3. |
| 3 | A right triangle has a hypotenuse of $30$, and $\cos\theta = 0.8$. What is the length of the side adjacent to $\theta$? | **Proficient** | P5 | Use a given ratio and the hypotenuse to recover a side, practice 5 exactly. |
| 4 | A right triangle has legs of $9$ and $12$. What is the cosine of the angle opposite the leg of $9$? | **Advanced** | P8 | The hypotenuse is missing and must be built first, then the correct side named as adjacent, practice 8 exactly. |

### GR.3.4 - Applications of right triangle relationships

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A $26$ ft ladder leans against a wall with its foot $10$ ft from the base. How high up the wall does it reach? | **Basic** | P2 | A ladder problem solved with the Pythagorean theorem, practice 2 exactly. |
| 2 | From a point $75$ ft from the base of a building, the angle of elevation to the roof is $50^\circ$. How tall is the building? Use $\tan 50^\circ = 1.192$ and $\cos 50^\circ = 0.643$. | **Basic** | P3 | One tangent application from a distance and an elevation angle, practice 3 exactly. |
| 3 | A weather balloon is at an altitude of $150$ m. It rises until, from a point $200$ m away horizontally, its angle of elevation is $45^\circ$. How far did it rise? Use $\tan 45^\circ = 1$ and $\cos 45^\circ = 0.707$. | **Proficient** | P5 | A CHANGE in height between two positions, so two heights are needed, practice 5 exactly. |
| 4 | A ramp rises at $25^\circ$ over a horizontal run of $16$ ft. What is the area of its triangular side panel? Use $\tan 25^\circ = 0.466$. | **Proficient** | P7 | Trigonometry to find a height and then an area from it, practice 7 exactly. |

### GR.4.1 - Transformations: translations, rotations, reflections, dilations

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | The point $(-1, -1)$ is translated using the rule $(x, y) \to (x - 2, y + 6)$. What are the coordinates of the image? | **Basic** | P1 | Apply a translation rule to one point, practice 1. |
| 2 | The point $(6, -1)$ is rotated $270^{\circ}$ counterclockwise about the origin. What are the coordinates of the image? | **Proficient** | P5-P6 | A rotation about the origin, which practice 5 and 6 band Proficient. |
| 3 | The point $(-4, 7)$ is reflected over the y-axis. What are the coordinates of the image? | **Basic** | P3 | Reflect one point over the y-axis, practice 3. |
| 4 | The point $(2, 3)$ is first rotated $90^{\circ}$ counterclockwise about the origin, and then the image is reflected over the y-axis. What are the coordinates of the final image? | **Advanced** | P8-P9 | TWO transformations in sequence, practice 8 and 9. |

### GR.4.2 - Using transformations to investigate congruence and similarity

Practice ladder 4B / 3P / 3A. Proposed quiz split **4B 0P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A figure is reflected across the $x$-axis. Which statement about the image is true? | **Basic** | P1 | What a rigid motion preserves, practice 1. |
| 2 | A triangle is dilated by a scale factor of $4$. How do the image's side lengths compare with the original's? | **Basic** | P2 | What a dilation does to side lengths, practice 2. |
| 3 | Triangle $ABC$ has vertices $(3,1)$, $(5,1)$ and $(3,4)$. Its image has vertices $(3,-1)$, $(5,-1)$ and $(3,-4)$. Which transformation was applied? | **Basic** | P3 | Name the single transformation from before and after coordinates, practice 3 exactly. |
| 4 | A rectangle with an area of $12$ is dilated by a scale factor of $3$. What is the area of the image? | **Basic** | P4 | Area under a dilation, so the factor squares, practice 4 exactly. |

### GR.4.3 - Properties of similar polygons

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Two similar rectangles have corresponding sides of $5$ and $15$. What is the scale factor from the smaller to the larger? | **Basic** | P1 | Scale factor from a pair of corresponding sides, practice 1. |
| 2 | Two similar polygons have a scale factor of $5$ from the smaller to the larger. The smaller has a perimeter of $8$. What is the perimeter of the larger? | **Basic** | P3 | Perimeter scales by the factor, practice 3 exactly. |
| 3 | Two similar polygons have a scale factor of $5$ from the smaller to the larger. The smaller has an area of $8$. What is the area of the larger? | **Basic** | P4 | Area scales by the factor squared, practice 4 exactly. |
| 4 | Two similar triangles have areas of $9$ and $64$. What is the ratio of their corresponding sides, smaller to larger? | **Proficient** | P6 | Run it backwards, area ratio to side ratio, which needs a square root, practice 6 exactly. |

### GR.4.4 - Symmetry of plane figures

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | How many lines of symmetry does a square have? | **Basic** | P1 | Count lines of symmetry in a regular figure, practice 1. |
| 2 | What is the order of rotational symmetry of an equilateral triangle? | **Basic** | P2 | Order of rotational symmetry of a regular figure, practice 2. |
| 3 | Which of these regular polygons has point symmetry? | **Proficient** | P5 | Point symmetry, which is a different property from the two above, practice 5. |
| 4 | The smallest angle of rotation that maps a regular polygon onto itself is $30^\circ$. How many sides does it have? | **Advanced** | P8 | Run it backwards, from the smallest rotation angle to the number of sides, practice 8 exactly. |

### GR.4.5 - Equation of a circle

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What are the centre and radius of the circle $(x + 1)^{2} + (y - 4)^{2} = 9$? | **Basic** | P1 | Read centre and radius off standard form, practice 1. |
| 2 | What is the equation of the circle with centre $(-3, 5)$ and radius $2$? | **Basic** | P2 | Build standard form from a centre and a radius, practice 2. |
| 3 | A circle has centre $(2, 1)$ and passes through $(5, 5)$. What is its radius? | **Basic** | P4 | Radius as the distance from centre to a point on the circle, practice 4 exactly. |
| 4 | What is the centre of the circle $x^{2} + y^{2} + 4x - 10y + 4 = 0$? | **Proficient** | P6 | GENERAL form, so the square must be completed before the centre is readable, practice 6 exactly. |

## Unit 4: Functions and Modelling

20 topics, 80 quiz items, 44B 26P 10A.

### AR.1.5 - Domain restrictions of rational and radical functions

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which value must be excluded from the domain of $\frac{8}{x - 12}$? | **Basic** | P1 | One linear denominator, one excluded value, practice 1. |
| 2 | What is the domain of $\sqrt{x - 9}$? | **Basic** | P3 | A radicand that must be non-negative, practice 3. |
| 3 | Which value is **not** in the domain of $\frac{x - 6}{x + 2}$? | **Basic** | P2 | The same single-denominator exclusion as practice 2, only phrased as not in the domain. |
| 4 | What is the domain of $\sqrt{20 - 4x}$? | **Proficient** | P5 | The radicand has a coefficient on x, so isolating it divides by a negative and reverses the inequality, practice 5 exactly. |

### AR.3.1 - Identifying factors of a simple quadratic expression

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which expression is the factored form of $x^{2} + 6x + 8$? | **Basic** | P1 | A monic trinomial with both signs positive, practice 1. |
| 2 | Which expression is the factored form of $x^{2} + 10x + 21$? | **Basic** | P2 | A monic trinomial with both signs positive, practice 2. |
| 3 | Which binomial is a factor of $x^{2} - 2x - 8$? | **Proficient** | P6 | A NEGATIVE constant term, so the factors have opposite signs, practice 6 exactly. |
| 4 | Which expression is the complete factored form of $2x^{2} + 14x + 20$? | **Advanced** | P8 | A common factor must come out before the trinomial factors, practice 8 exactly. |

### AR.3.2 - Factoring quadratics

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which expression is the factored form of $x^{2} - 81$? | **Basic** | P1-P4 | A plain difference of squares, practice 1 and 4. |
| 2 | Which expression is the factored form of $x^{2} + 16x + 64$? | **Basic** | P2 | A perfect square trinomial, practice 2. |
| 3 | Which expression is the factored form of $2x^{2} + 11x + 5$? | **Basic** | P3 | A leading coefficient of 2 on a trinomial, which practice 3 bands Basic. |
| 4 | Which expression is the factored form of $25x^{2} - 4$? | **Proficient** | P6 | A difference of squares where BOTH terms carry coefficients, practice 6 exactly. |

### AR.3.3 - Solving quadratic equations by factoring

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What are the solutions of $(x + 2)(x - 9) = 0$? | **Basic** | P1 | Already factored, so the zero product property applies directly, practice 1. |
| 2 | What is the solution of $x^{2} - 10x + 25 = 0$? | **Proficient** | P6 | A perfect square trinomial giving a repeated root, practice 6 exactly. |
| 3 | What are the solutions of $x^{2} + 3x = 10$? | **Basic** | P3 | Must be rearranged to equal zero before factoring, practice 3 exactly. |
| 4 | What are the solutions of $2x^{2} - 7x + 3 = 0$? | **Proficient** | P5 | A leading coefficient of 2, practice 5 exactly. |

### AR.3.4 - Solving quadratic equations using the quadratic formula

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What are the solutions of $x^{2} - 3x - 10 = 0$? | **Basic** | P3 | Rational roots from a monic quadratic, practice 3. |
| 2 | What are the solutions of $x^{2} + 4x + 3 = 0$? | **Basic** | P2 | Rational roots from a monic quadratic, practice 2. |
| 3 | Which statement about $x^{2} + x + 4 = 0$ is true? | **Proficient** | P7 | A negative discriminant, so the question is about the NUMBER of real solutions, practice 7 exactly. |
| 4 | What are the solutions of $x^{2} - 8x + 5 = 0$? | **Advanced** | P9-P10 | An irrational discriminant, so the answer stays in radical form, practice 9 and 10. |

### AR.3.5 - Identifying the maximum or minimum of a quadratic

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Does $f(x) = -4x^{2} + 3x + 1$ have a maximum or a minimum? | **Basic** | P2 | The sign of the leading coefficient decides maximum or minimum, practice 2. |
| 2 | What is the vertex of $f(x) = (x + 6)^{2} - 2$? | **Basic** | P3 | Read the vertex off vertex form, practice 3. |
| 3 | What is the minimum value of $f(x) = x^{2} - 10x + 21$? | **Proficient** | P5 | STANDARD form, so the vertex must be found before the minimum is readable, practice 5 exactly. |
| 4 | Which statement about $f(x) = 5(x - 1)^{2} + 3$ is true? | **Advanced** | P9 | Vertex form with a leading coefficient, judged as a statement rather than a value, practice 9 exactly. |

### AR.3.6 - Identifying a quadratic equation that corresponds to a given graph

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which equation represents the parabola shown? [figure: An upward-opening parabola on a coordinate plane. It crosses the x-axis at -2 and at 1, both marked, and crosses the y-axis at -2.] | **Basic** | P3 | Read the roots off the graph and build factored form, practice 3. |
| 2 | The graph of $y = x^{2}$ is shifted 5 units right and 3 units up. Which equation represents the new graph? | **Proficient** | P5 | A translation of the parent parabola, practice 5 exactly. |
| 3 | Which equation represents the parabola shown? [figure: A downward-opening parabola on a coordinate plane. It crosses the x-axis at 1 and at 5, both marked, its highest point is at (3, 4), and it crosses the y-axis at -5.] | **Basic** | P2-P3 | Read the roots off the graph, downward opening, practice 2 and 3. |
| 4 | A parabola crosses the x-axis at $x = -3$ and $x = 1$ and passes through the point $(0, -6)$. Which equation represents this parabola? | **Proficient** | P7 | Roots plus a third point, so the leading coefficient must be solved for, practice 7 exactly. |

### AR.3.7 - Vertex form and graphing parabolas

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | For the parabola $y = -4(x + 1)^{2} + 9$, what is the vertex and the axis of symmetry? | **Basic** | P1-P2 | Read vertex and axis of symmetry off vertex form, practice 1 and 2. |
| 2 | A parabola opens downward, has its highest point at $(2, 5)$, and crosses the y-axis at $1$. Which equation represents this parabola? | **Proficient** | P7 | A turning point plus one more point, so the leading coefficient is solved for, practice 7 exactly. |
| 3 | Which equation is $y = x^{2} + 10x + 7$ written in vertex form? | **Proficient** | P5-P6 | Complete the square with a leading coefficient of 1, practice 5 and 6. |
| 4 | Which equation is $y = 2x^{2} - 8x + 3$ written in vertex form? | **Advanced** | P8 | The leading coefficient must be factored out BEFORE completing the square, practice 8 exactly. |

### AR.4.1 - Simplifying polynomial expressions

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Simplify the expression $6m + 9 - 4m$. | **Basic** | P2-P3 | Combine like terms in one variable, practice 2 and 3. |
| 2 | Simplify the expression $4p^{2} + 2p^{2} + 5p$. | **Basic** | P4 | Combine like squared terms, practice 4 exactly. |
| 3 | Simplify the expression $7x^{2} + 3x - (2x^{2} - 5x)$. | **Proficient** | P6 | Distribute a leading minus across a group, practice 6 exactly. |
| 4 | Which expression is equivalent to $4(3x - 2) - 3(x - 4)$? | **Advanced** | P9 | Two distributions, one of them negative, then combine, practice 9 exactly. |

### AR.4.10 - Exponent properties for exponential expressions

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the value of $\dfrac{7^{5}}{7^{3}}$? | **Basic** | P1 | The quotient rule on a common base, practice 1. |
| 2 | What is the value of $2^{5}$? | **Basic** | P3 | A bare power evaluated, the same kind of direct evaluation practice 3 bands Basic. |
| 3 | What is the value of $(5^{2})^{2}$? | **Basic** | P4 | Power of a power, practice 4 exactly. |
| 4 | What is the value of $3^{-2}$? | **Proficient** | P5 | A NEGATIVE exponent, which is the first genuinely new rule in the ladder, practice 5 exactly. |

### AR.4.11 - Evaluating exponential functions

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | If $f(x) = 2 \cdot 3^{x}$, what is $f(4)$? | **Basic** | P1-P4 | Evaluate at a positive integer input, practice 1 to 4. |
| 2 | If $f(x) = 5 \cdot 2^{x}$, what is $f(3)$? | **Basic** | P1-P4 | Evaluate at a positive integer input, practice 1 to 4. |
| 3 | If $f(x) = 3 \cdot 5^{x}$, what is $f(2)$? | **Basic** | P2 | Evaluate at a positive integer input, practice 2 with the coefficient and base swapped. |
| 4 | If $f(x) = 8 \cdot 3^{x}$, what is $f(0)$? | **Proficient** | P5 | Input ZERO, so the power collapses to 1 and only the coefficient survives, practice 5 exactly. |

### AR.4.12 - Exponential growth and decay models

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A quantity increases by $9\%$ each period. What is the growth factor? | **Proficient** | P5 | Turn a percent into a growth FACTOR, practice 5 exactly. |
| 2 | An item worth \$400 loses $25\%$ of its value each year. What is it worth after 2 years? | **Advanced** | P9 | Carry a decay through two periods to a number, practice 9 exactly. |
| 3 | A quantity of $A$ grows by $6\%$ each year. Which equation models it after $t$ years? | **Basic** | P1 | Write the model from a stated growth percent, practice 1 exactly. |
| 4 | An account holds \$2,000 and earns $4\%$ compounded annually. Which expression gives the balance after 3 years? | **Proficient** | P6 | Build a compound interest expression over several years, practice 6 exactly. |

### AR.4.2 - Multiplying polynomials including FOIL

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is $(5x^{4})(3x^{6})$? | **Basic** | P1 | Product of two monomials, practice 1. |
| 2 | What is $(x + 7)(x - 2)$? | **Basic** | P3 | FOIL on two monic binomials, practice 3. |
| 3 | What is $(x - 5)^{2}$? | **Basic** | P4 | A binomial squared with no leading coefficient, which practice 4 bands Basic. |
| 4 | What is $(3x + 1)(2x - 7)$? | **Proficient** | P7 | BOTH binomials carry leading coefficients, practice 7 exactly. |

### AR.4.3 - Adding and subtracting polynomials

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is $(2x + 7) + (5x - 3)$? | **Basic** | P1 | Add two binomials, practice 1. |
| 2 | What is $(8x^{2} - 3x) - (2x^{2} - 9x)$? | **Basic** | P4 | Subtract a binomial, practice 4 exactly. |
| 3 | What is $(x^{2} + 6x - 4) - (3x^{2} - 6x + 4)$? | **Proficient** | P6 | Subtract a TRINOMIAL, so every sign flips, practice 6 exactly. |
| 4 | What is $(5x^{2} + x - 3) + (-2x^{2} - 4x + 3)$? | **Proficient** | P8 | Addition, but the second polynomial is wholly negative and one term cancels to zero, the vanishing-term feature of practice 8. |

### AR.4.4 - Exponent rules for algebraic monomials

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Simplify $x^{6} \cdot x^{7}$. | **Basic** | P1 | Product rule on a common base, practice 1. |
| 2 | Simplify $(x^{5})^{4}$. | **Basic** | P3 | Power of a power, practice 3. |
| 3 | Simplify $(2x^{3})^{5}$. | **Basic** | P4 | A coefficient raised along with the variable, practice 4 exactly. |
| 4 | Simplify $\dfrac{10x^{2}}{5x^{6}}$ and write the result without a negative exponent. | **Proficient** | P7 | The quotient leaves a negative exponent that must be rewritten, practice 7 exactly. |

### AR.4.5 - Simplifying rational expressions

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Simplify $\dfrac{10x^{4}}{5x^{2}}$. | **Basic** | P1 | Monomial over monomial, practice 1. |
| 2 | Simplify $\dfrac{x^{2} - 16}{x - 4}$. | **Basic** | P2-P4 | A difference of squares cancelling one factor, practice 2 and 4. |
| 3 | Simplify $\dfrac{x^{2} + 3x}{x^{2} - 9}$. | **Advanced** | P10 | BOTH numerator and denominator factor, practice 10 exactly. |
| 4 | The expression $\dfrac{x - 7}{(x - 7)(x + 1)}$ simplifies to $\dfrac{1}{x + 1}$. Which values must be excluded from the domain of the original expression? | **Proficient** | P6 | The excluded values of the ORIGINAL expression, including the one the cancellation hides, practice 6 exactly. |

### AR.4.6 - Combining rational expressions using common denominators

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Simplify $\dfrac{4}{y} + \dfrac{9}{y}$. | **Basic** | P1 | Like denominators, single variable, practice 1. |
| 2 | Simplify $\dfrac{7}{x - 2} - \dfrac{3}{x - 2}$. | **Proficient** | P5 | A BINOMIAL denominator, practice 5 exactly. |
| 3 | Simplify $\dfrac{3x}{8} + \dfrac{x}{8}$ and reduce completely. | **Advanced** | P10 | Adding like terms and then reducing the result, the reduce-completely step practice 10 is banded on. |
| 4 | Simplify $\dfrac{x + 6}{4} - \dfrac{x - 2}{4}$. | **Proficient** | P6 | Subtracting a binomial NUMERATOR over a common denominator, practice 6 exactly. |

### AR.4.7 - Evaluating rational functions for a single value

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | If $f(x) = \dfrac{x + 9}{x + 2}$, what is $f(4)$? | **Basic** | P4 | Substitute into a linear over linear rule, practice 4. |
| 2 | If $f(x) = \dfrac{18}{x}$, what is $f(6)$? | **Basic** | P2 | Substitute into a constant over x rule, practice 2. |
| 3 | If $f(x) = \dfrac{4x}{x - 1}$, what is $f(2)$? | **Basic** | P1-P3 | Substitute into a monomial over binomial rule, practice 1 and 3. |
| 4 | If $f(x) = \dfrac{x + 3}{x + 9}$, what is $f(3)$? | **Proficient** | P6 | The result is an unreduced fraction that must be simplified, practice 6 exactly. |

### AR.4.8 - Simplifying and operating with radical expressions

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Which expression is $\sqrt{27}$ in simplest radical form? | **Basic** | P1 | Extract a perfect square factor from a radicand, practice 1, 2 and 4. |
| 2 | Simplify $4\sqrt{7} + 3\sqrt{7}$. | **Basic** | P3 | Add like radicals, practice 3. |
| 3 | Simplify $\sqrt{3} \times \sqrt{12}$ and write the result in simplest radical form. | **Proficient** | P6 | Multiply two radicals and simplify, practice 6 exactly. |
| 4 | Rationalise the denominator of $\dfrac{10}{\sqrt{2}}$. | **Advanced** | P10, P7 | Rationalising that leaves a coefficient needing reduction, practice 10, rather than the clean cancel of practice 7. |

### AR.4.9 - Solving radical equations

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Solve $\sqrt{x + 2} = 5$. | **Basic** | P1 | Square both sides once, practice 1. |
| 2 | Solve $\sqrt{x - 4} = 6$. | **Basic** | P2 | Square both sides once, practice 2. |
| 3 | Solve $\sqrt{x + 6} = x$. | **Proficient** | P6 | The variable appears on BOTH sides, so squaring makes a quadratic and the roots need checking, practice 6 exactly. |
| 4 | Solve $\sqrt{x} - 2 = 3$. | **Advanced** | P10 | The radical must be ISOLATED before squaring, practice 10 exactly. |

## Unit 5: Probability and Statistics

17 topics, 68 quiz items, 34B 22P 12A.

### PR.1.3 - Reading bar graphs, line graphs, and pictographs

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 0P 2A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | How many visits were recorded on Wednesday? [figure: A bar graph of library visits by day. Day runs along the bottom and Visits up the side, from 0 to 60 marked every 10. There are five bars: Monday 30, Tuesday 50, Wednesday 20, Thursday 40, and Friday 10. Tuesday is the tallest bar and Friday is the shortest.] | **Basic** | P1 | Read one bar against the value axis, practice 1. |
| 2 | A sign in the library says there were $160$ visits that week. Is that correct? [figure: A bar graph of library visits by day. Day runs along the bottom and Visits up the side, from 0 to 60 marked every 10. There are five bars: Monday 30, Tuesday 50, Wednesday 20, Thursday 40, and Friday 10. Tuesday is the tallest bar and Friday is the shortest.] | **Advanced** | P8 | Sum every category and test a stated total, practice 8 exactly. |
| 3 | How many pizzas were sold on Monday? [figure: A pictograph of pizzas sold by day. Each star stands for 4 pizzas. Monday shows 3 stars, which is 12 pizzas. Tuesday shows 5 stars, which is 20 pizzas. Wednesday shows 2 stars, which is 8 pizzas. Thursday shows 4 stars, which is 16 pizzas.] | **Basic** | P4 | Read one pictograph row through its key, practice 4. |
| 4 | On how many of the four days were at least $12$ pizzas sold? [figure: A pictograph of pizzas sold by day. Each star stands for 4 pizzas. Monday shows 3 stars, which is 12 pizzas. Tuesday shows 5 stars, which is 20 pizzas. Wednesday shows 2 stars, which is 8 pizzas. Thursday shows 4 stars, which is 16 pizzas.] | **Advanced** | P9 | A threshold count across all categories, practice 9 exactly. |

### PR.1.4 - Reading and interpreting tables and two-way tables

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | How many Poetry books were checked out? [figure: A table of books checked out by genre. Fiction 34, Mystery 18, Poetry 21, Drama 27.] | **Basic** | P1 | Read one cell of a one-way table, practice 1. |
| 2 | How many students walk to school in total? [figure: A two-way table of how students travel to school, by grade. Grade 9: 18 take the bus, 12 walk, 30 in total. Grade 10: 9 take the bus, 21 walk, 30 in total. The column totals are 27 bus, 33 walk, and 60 students altogether.] | **Proficient** | P5 | Total a COLUMN of a two-way table across both rows, practice 5 exactly. |
| 3 | How many more candidates passed in the morning session than in the evening session? [figure: A two-way table of test results by session. Morning: 30 passed, 10 failed, 40 in total. Evening: 15 passed, 45 failed, 60 in total. The column totals are 45 passed, 55 failed, and 100 candidates altogether.] | **Proficient** | P6 | Difference between two cells of a two-way table, practice 6 exactly. |
| 4 | Which day had the second-fewest visits, and how many were there? [figure: A table of museum visitors by day. Monday 45, Tuesday 38, Wednesday 52, Thursday 41, Friday 67.] | **Basic** | P2 | Rank the rows and report the second one, practice 2 exactly. |

### PR.1.5 - Classifying data and choosing appropriate representations

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 2P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A café records the number of cups of coffee sold each day. Which type of variable is "cups sold"? | **Basic** | P3 | Classify a count as discrete numerical, practice 3 exactly. |
| 2 | A class records each student's favourite sport and wants to show how many chose each one. Which display is appropriate? | **Proficient** | P5 | Choose a display for a categorical frequency, practice 5 exactly. |
| 3 | A nurse records each patient's exact temperature in degrees. Which type of variable is "temperature"? | **Basic** | P2 | Classify a measurement as continuous numerical, practice 2 exactly. |
| 4 | A student measures the daily high temperature for $30$ days and wants to show how much it **varies** over the month. Which approach is appropriate? | **Proficient** | P7 | Choose a display for VARIABILITY rather than for frequency, practice 7 exactly. |

### PR.2.1 - Calculating mean, median, mode, and range

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A dataset contains the values $4$, $9$, $6$, $12$, and $9$. What is the mean? | **Basic** | P1 | Mean of five values, practice 1. |
| 2 | Six game scores were $15$, $8$, $22$, $8$, $19$, and $11$. What is the median score? | **Proficient** | P5 | Median of an EVEN count, so the two middle values are averaged, practice 5. |
| 3 | The low temperatures one week, in degrees Celsius, were $-4$, $9$, $-1$, $12$, $5$, and $-7$. What is the range of these temperatures? | **Basic** | P4 | Range as maximum minus minimum, practice 4, with negatives in the list. |
| 4 | Consider the dataset $10$, $12$, $13$, $14$, $15$. If the value $15$ is changed to $95$, which measure of center is least affected, and why? | **Advanced** | P8-P10 | Which measure of centre resists an outlier, and why, the robustness reasoning of practice 8 to 10. |

### PR.2.2 - Calculating weighted mean

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 0P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A grade is $70\%$ coursework, $20\%$ project, and $10\%$ attendance. A student scores $58$ on coursework, $78$ on the project, and $98$ on attendance. What is the grade? | **Basic** | P2 | Percent weights that already total 100, practice 2. |
| 2 | A grade is $45\%$ writing, $35\%$ reading, and $20\%$ speaking. A student scores $58$ on writing, $78$ on reading, and $98$ on speaking. What is the grade? | **Basic** | P2 | Percent weights that already total 100, practice 2. |
| 3 | A grade is $50\%$ exams, $30\%$ labs, and $20\%$ homework. A student scores $96$ on exams, $60$ on labs, and $90$ on homework. What is the grade? | **Basic** | P2 | Percent weights that already total 100, practice 2. |
| 4 | Coursework is worth $75\%$ of a grade and a student has $84$. The final exam is worth the other $25\%$. What score does the student need on the final exam to finish with exactly $87$ overall? | **Advanced** | P8 | Run the weighted mean BACKWARDS to the score still needed, practice 8 exactly. |

### PR.2.3 - Inverse problems: finding a missing data value given the mean or range

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Four numbers have a mean of $21$. Three of them are $16$, $20$, and $24$. What is the fourth number? | **Basic** | P1-P3 | Recover a missing value from a mean, practice 1 and 3. |
| 2 | A data set contains $55$, $68$, $61$, and one more value, which is the largest in the set. The range of the set is $25$. What is the missing value? | **Proficient** | P5 | Recover a missing value from the RANGE rather than the mean, practice 5 exactly. |
| 3 | Five numbers have a mean of $36$. Four of them are $33$, $41$, $29$, and $37$. What is the fifth number? | **Basic** | P2-P4 | Recover a missing value from a mean, practice 2 and 4. |
| 4 | A student has quiz scores of $15$, $18$, and $12$. One quiz remains, and every quiz is scored from $0$ to $20$. What is the lowest score on the last quiz that gives a mean of at least $16$ across all four quizzes? | **Advanced** | P9 | The minimum score still needed, bounded by the scale's maximum, practice 9 exactly. |

### PR.2.4 - Comparing distributions using measures of center and spread

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 1P 2A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Set F is $5, 8, 11, 14, 22$. What is the range? | **Basic** | P1 | Range of one set, practice 1. |
| 2 | Set G is $20, 22, 24, 25, 89$. Which number better represents a typical value, and why? | **Advanced** | P8 | Which measure represents a typical value when an outlier is present, practice 8 exactly. |
| 3 | Set H and Set J both have a median of $50$. Set H has a mean of $50$ and Set J has a mean of $62$. What follows? | **Advanced** | P10 | Infer distribution SHAPE from the gap between mean and median, practice 10 exactly. |
| 4 | Team X has a median of $30$ and an interquartile range of $16$. Team Y has a median of $30$ and an interquartile range of $8$. Which team is more consistent? | **Proficient** | P6 | Compare two spreads by interquartile range rather than by range, practice 6 exactly. |

### PR.2.5 - Box and whisker plots

Practice ladder 4B / 3P / 3A. Proposed quiz split **4B 0P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the median wait time? [figure: A box plot on a number line of wait times in minutes running from 0 to 50, marked every 5. The left whisker runs from the minimum of 5 to the box at 12. The box runs from the lower quartile 12 to the upper quartile 30, with the median line inside it at 20. The right whisker runs from 30 out to the maximum of 45.] | **Basic** | P1 | Read the median line off a box plot, practice 1. |
| 2 | What is the interquartile range? [figure: A box plot on a number line of wait times in minutes running from 0 to 50, marked every 5. The left whisker runs from the minimum of 5 to the box at 12. The box runs from the lower quartile 12 to the upper quartile 30, with the median line inside it at 20. The right whisker runs from 30 out to the maximum of 45.] | **Basic** | P2 | Interquartile range as the width of the box, practice 2. |
| 3 | What is the range? [figure: A box plot on a number line of wait times in minutes running from 0 to 50, marked every 5. The left whisker runs from the minimum of 5 to the box at 12. The box runs from the lower quartile 12 to the upper quartile 30, with the median line inside it at 20. The right whisker runs from 30 out to the maximum of 45.] | **Basic** | P3 | Range as whisker to whisker, practice 3. |
| 4 | Which value best describes a typical wait time? [figure: A box plot on a number line of wait times in minutes running from 0 to 50, marked every 5. The left whisker runs from the minimum of 5 to the box at 12. The box runs from the lower quartile 12 to the upper quartile 30, with the median line inside it at 20. The right whisker runs from 30 out to the maximum of 45.] | **Basic** | P4 | Which of the five summary values is typical, practice 4. |

### PR.3.1 - Calculating simple probability of a single random event

Practice ladder 4B / 3P / 3A. Proposed quiz split **2B 1P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A jar holds $12$ candies: $5$ lemon, $4$ cherry, and $3$ grape. If one candy is taken at random, what is the probability that it is cherry? | **Basic** | P1-P2 | One favourable colour over the total, practice 1 and 2. |
| 2 | A set of $20$ cards is numbered $1$ through $20$. One card is drawn at random. What is the probability of drawing a multiple of $4$? | **Proficient** | P5-P6 | A NUMBER PROPERTY defines the favourable set, so it must be counted first, practice 5 and 6. |
| 3 | A bag contains $9$ tiles: $2$ blue and $7$ yellow. What is the probability of drawing a tile that is NOT yellow? | **Basic** | P4 | A two-colour bag, so not yellow is simply the other colour, practice 4. |
| 4 | A bag has $5$ red and $7$ green marbles. If $3$ green marbles are removed from the bag, what is the new probability of drawing a green marble? | **Advanced** | P10 | The sample space CHANGES before the draw, practice 10 exactly. |

### PR.3.2 - Probability of an event and its complement

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | The probability that a randomly selected student forgot their homework is $\frac{1}{6}$. What is the probability that a randomly selected student did not forget their homework? | **Basic** | P1 | One minus a stated fraction, practice 1, 2 and 4. |
| 2 | A drawer holds $24$ socks, and $9$ of them are black. If one sock is drawn at random, what is the probability that it is not black? | **Proficient** | P5 | The probability must be built from counts before it is complemented, practice 5 exactly. |
| 3 | The probability that a flight departs on time is $45\%$. What is the probability that it does not depart on time? | **Proficient** | P7 | A PERCENT complement rather than a fraction, practice 7 exactly. |
| 4 | A group of $50$ people each chose exactly one drink. $8$ chose tea and $12$ chose coffee. What is the probability that a randomly chosen person chose neither tea nor coffee? | **Advanced** | P9 | Two named categories excluded from a whole, so the complement covers everything else, practice 9 exactly. |

### PR.3.3 - Compound probability (independent and dependent events)

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Two fair six-sided dice are rolled. What is the probability that both show a $6$? | **Basic** | P1 | Two independent events, multiply, practice 1. |
| 2 | A drawer holds $8$ pens, $3$ of which are red. Two pens are drawn without replacement. What is the probability that both are red? | **Proficient** | P5 | WITHOUT replacement, so the second probability shifts, practice 5 exactly. |
| 3 | Three independent events have probabilities $\frac{3}{4}$, $\frac{3}{5}$, and $\frac{1}{2}$. What is the probability that all three occur? | **Proficient** | P7 | Three independent probabilities multiplied, practice 7 exactly. |
| 4 | A crate holds $10$ items, $3$ of which are defective. Two items are drawn without replacement. What is the probability that at least one is defective? | **Advanced** | P9 | AT LEAST one, which is answered through the complement, over dependent draws, practice 9. |

### PR.3.4 - Conditional probability

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | What is the probability that a day had rain, given that it was a weekend day? Of the $20$ weekend days, $9$ had rain and $11$ were dry. Of the $80$ weekdays, $27$ had rain and $53$ were dry. In all, $36$ days had rain, $64$ were dry, and there are $100$ days. | **Basic** | P1-P3 | Condition on the stated group and read within it, practice 1 and 3. |
| 2 | What is the probability that a day was a weekday, given that it had rain? Of the $20$ weekend days, $9$ had rain and $11$ were dry. Of the $80$ weekdays, $27$ had rain and $53$ were dry. In all, $36$ days had rain, $64$ were dry, and there are $100$ days. | **Proficient** | P6 | The condition is REVERSED, so the denominator becomes the other total, practice 6 exactly. |
| 3 | What is the probability that a candidate passed, given that they sat the morning session? Of the $40$ candidates who sat the morning session, $30$ passed and $10$ failed. Of the $60$ who sat the evening session, $15$ passed and $45$ failed. In all, $45$ passed, $55$ failed, and there are $100$ candidates. | **Basic** | P1-P3 | Condition on the stated group and read within it, practice 1 and 3. |
| 4 | What is the probability that a candidate failed, given that they sat the evening session? Of the $40$ candidates who sat the morning session, $30$ passed and $10$ failed. Of the $60$ who sat the evening session, $15$ passed and $45$ failed. In all, $45$ passed, $55$ failed, and there are $100$ candidates. | **Basic** | P2-P4 | The failure count within a stated group, practice 2 and 4. |

### PR.3.5 - Set notation foundations (union, intersection, complement)

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | Two sets satisfy $n(A) = 15$, $n(B) = 12$, and $n(A \cap B) = 5$. What is $n(A \cup B)$? | **Basic** | P1-P2 | Inclusion and exclusion on two sets, practice 1 and 2. |
| 2 | The sets from Item 1 sit inside a universal set with $n(U) = 40$. How many elements are in neither set? | **Proficient** | P6 | The complement of a union inside a universal set, practice 6 exactly. |
| 3 | Three sets satisfy $n(A) = 25$, $n(B) = 20$, $n(C) = 18$, $n(A \cap B) = 9$, $n(A \cap C) = 8$, $n(B \cap C) = 7$, and $n(A \cap B \cap C) = 4$. What is $n(A \cup B \cup C)$? | **Proficient** | P5 | Inclusion and exclusion on THREE sets, practice 5 exactly. |
| 4 | In a group of $36$ people, $22$ like tea, $18$ like coffee, and $5$ like neither. How many like both? | **Advanced** | P8 | Run it backwards, from the neither count to the intersection, practice 8 exactly. |

### PR.4.1 - Identifying linear relationships in scatterplots (positive, negative, none)

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 2P 1A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A data set is given as the points $(1, 20)$, $(2, 17)$, $(3, 15)$, $(4, 12)$, and $(5, 9)$. Which best describes the linear association between $x$ and $y$? | **Basic** | P4 | Read the direction of association off listed points, practice 4 exactly. |
| 2 | Two scatterplots use the same axes: study hours across the bottom and test score up the side. In Plot 1 the points lie very close to a straight upward line. In Plot 2 the points also trend upward but are widely scattered around the line. Both associations are positive. Which plot shows the stronger linear association? | **Proficient** | P5-P6 | Compare the STRENGTH of two associations, the tight-versus-loose judgement of practice 5 and 6. |
| 3 | Three scatterplots are shown. Plot 1 shows a loose upward cloud. Plot 2 shows points clustered tightly along a downward line. Plot 3 shows a moderately scattered upward pattern. Which plot shows the strongest linear association? | **Proficient** | P7 | Rank three plots by direction and strength together, the practice 7 tier. |
| 4 | A scatterplot has years of experience across the bottom and annual salary up the side. The points rise steeply at first and then flatten out as experience increases, forming a curve that bends as it climbs. Which best describes the relationship? | **Advanced** | P8-P10 | A curved pattern, so the answer is that a linear description does not fit, practice 8 and 10. |

### PR.4.2 - Fitting a linear model to scatterplot data

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A line passes through $(3, 8)$ and $(7, 20)$. What is the slope? | **Basic** | P1 | Slope from two points, practice 1. |
| 2 | A line has a slope of $3$ and passes through $(3, 8)$. What is the $y$-intercept? | **Basic** | P2 | Intercept from a slope and a point, practice 2. |
| 3 | Use the model $y = 3x - 1$ to predict $y$ when $x = 6$. | **Basic** | P4 | Predict from a given model, practice 4. |
| 4 | A data set has the points $(1, 4)$, $(2, 7)$ and $(3, 10)$. Two models are proposed: $y = 3x + 1$ and $y = 4x$. Which fits better, and why? | **Proficient** | P7 | Judge which of two candidate models fits the data, practice 7 exactly. |

### PR.4.3 - Calculating percent change from data over time

Practice ladder 4B / 3P / 3A. Proposed quiz split **3B 1P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A price rises from \$60 to \$75. What is the percent increase? | **Basic** | P1-P4 | Percent increase between two values, practice 1 and 4. |
| 2 | A count falls from $120$ to $96$. What is the percent decrease? | **Basic** | P2 | Percent decrease between two values, practice 2. |
| 3 | A value rises $10\%$ one year and $10\%$ the next. What is the total percent increase? | **Proficient** | P5 | SUCCESSIVE percent changes, which do not simply add, practice 5 exactly. |
| 4 | A reading goes from $40$ to $50$. Is that an increase or a decrease, and by what percent? | **Basic** | P3 | Name the direction and then the percent, practice 3 exactly. |

### PR.4.4 - Drawing conclusions and making predictions from data

Practice ladder 4B / 3P / 3A. Proposed quiz split **1B 3P 0A**.

| # | Stem | Band | Anchor | Why |
|---|---|---|---|---|
| 1 | A survey of $40$ shoppers at one store found that $70\%$ prefer self-checkout. Which conclusion is directly supported? | **Basic** | P3-P4 | What a single sample statistic does and does not support, practice 3 and 4. |
| 2 | A study found that people who own more books score higher on vocabulary tests. Which conclusion is supported? | **Proficient** | P6 | An observational association, so causation is not supported, practice 6 exactly. |
| 3 | A model fitted to plants aged $1$ to $8$ weeks predicts $\text{height} = 2w + 3$. Which use of the model is appropriate? | **Proficient** | P5 | The model's fitted RANGE bounds its appropriate use, practice 5 exactly. |
| 4 | A chart shows a moderate negative association between screen time and hours of sleep for $60$ teenagers. Which conclusion is supported? | **Proficient** | P7 | What a moderate association does and does not support, practice 7 exactly. |

