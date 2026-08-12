---
topic_name: "Definition of a function and function notation"
unit_number: 0
sequence_in_unit: 11
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "AR"
keywords: ["function", "function notation", "input", "output", "evaluating functions", "domain", "range"]
---

# AR.1.1 - Definition of a Function and Function Notation

**Topic ID:** AR.1.1  
**Unit:** 0  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### A Vending Machine Never Argues

Press B4 on a vending machine and you get a bag of pretzels. Press B4 again tomorrow and you get a bag of pretzels. You would be alarmed if B4 gave you pretzels once and a bottle of water the next time. A machine that unpredictable is broken.

That reliability is the whole idea behind a function. One button, one result, every time.

A **function** is a rule that takes an input and produces **exactly one** output.

Notice what the rule does not say. It does not say every button has to give something different. Two buttons can both dispense pretzels and the machine is still working fine. What breaks a function is one input giving two different outputs.

---

##### Inputs, Outputs, and Pairs

A rule can be written as a list of pairs, with the input first and the output second.

$$(3, 7) \quad \text{means input } 3 \text{ produces output } 7$$

Take this list: $(1, 4), (2, 9), (3, 4)$.

- Input $1$ gives $4$.
- Input $2$ gives $9$.
- Input $3$ gives $4$.

Is this a function? Yes. Every input appears once. The fact that $4$ shows up as an output twice does not matter at all, any more than two buttons dispensing pretzels matters.

Now take this list: $(1, 4), (2, 9), (1, 6)$.

Input $1$ appears twice, once giving $4$ and once giving $6$. That is the broken vending machine, and it is **not** a function.

**The test, in one sentence:** scan the inputs only. If any input appears twice with two different outputs, it is not a function.

Repeated **outputs** are legal. Repeated **inputs** are fatal. Students mix these up constantly, so say it out loud before you move on.

---

##### Reading $f(x)$ Out Loud

Function notation looks like this:

$$f(x) = 3x + 2$$

Say it as "**f of x** equals three x plus two." The letter $f$ is the name of the rule. The $x$ in parentheses is the input the rule is waiting for.

So $f(5)$ means "the output of the rule $f$ when the input is $5$." Nothing more mysterious than that.

Three ways to say the same fact, and you should be comfortable with all three:

- $f(5) = 17$
- When the input is $5$, the output is $17$.
- The pair $(5, 17)$ belongs to $f$.

If a question gives you $f(9) = 4$, the $9$ went in and the $4$ came out. Never the reverse. The number inside the parentheses is always the input.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**The parentheses in $f(5)$ do not mean multiplication.**

Everywhere else in algebra, a symbol next to parentheses means multiply. $3(5)$ is $15$. $x(x+1)$ is a product. So when a student meets $f(5)$, the trained reflex says "multiply $f$ by $5$."

That reflex is wrong here, and it is the single most common error on this topic. $f$ is not a number. It is the **name of a rule**. You cannot multiply by a name.

The other version of the same error reads $f(5)$ as a fraction, $f$ divided by $5$. Also wrong, and for the same reason.

$$f(5) \text{ means: run the rule } f \text{ with } 5 \text{ as the input}$$

Here is the tell. If $f(5)$ meant "$f$ times $5$," then the question "what is $f(5)$?" could not be answered without knowing what number $f$ is. But the question is always answerable, because the rule is always given. That is your proof that $f$ was never a number.

---

##### Evaluating a Function

To evaluate a function, replace the input letter with the given value everywhere it appears, then compute.

**Example 1:** If $f(x) = 3x - 4$, find $f(5)$.

Step 1: Replace every $x$ with $5$.
- $f(5) = 3(5) - 4$

Step 2: Multiply first, following order of operations.
- $3(5) = 15$

Step 3: Finish the subtraction.
- $15 - 4 = 11$

So $f(5) = 11$.

Two wrong paths worth naming. A student who stops at $15$ has forgotten the $-4$ and reported the variable part alone. A student who computes $3(5 - 4) = 3$ has subtracted before multiplying, which is not what the rule says. The rule is $3x$ minus $4$, not $3$ times the quantity $x$ minus $4$. There are no parentheses around $x - 4$ in the original, so do not invent any.

---

##### Negative Inputs

Nothing changes about the method, but the signs demand real care.

**Example 2:** If $g(t) = t^{2} - 3t + 1$, find $g(-2)$.

Step 1: Substitute $-2$ for every $t$, and write the parentheses in.
- $g(-2) = (-2)^{2} - 3(-2) + 1$

Step 2: Handle the square. A negative squared is positive.
- $(-2)^{2} = 4$

Step 3: Handle the middle term. Negative three times negative two is positive six.
- $-3(-2) = +6$

Step 4: Add it all up.
- $4 + 6 + 1 = 11$

So $g(-2) = 11$.

Step 3 is where the points go missing. The term is $-3t$, so with $t = -2$ you are multiplying two negatives, and the result is positive. A student who writes $4 - 6 + 1 = -1$ kept the minus sign that the multiplication was supposed to cancel.

**Write the parentheses.** Substituting $-2$ into $t^{2}$ and writing $-2^{2}$ gives $-4$, because the exponent binds tighter than the minus sign. Writing $(-2)^{2}$ gives $4$, which is what you actually want. Those parentheses are worth a point every time.

---

##### Running the Rule Backward

Sometimes you are handed the output and asked for the input. The notation looks the same, but now you have an equation to solve.

**Example 3:** If $h(n) = 2n + 5$, for which value of $n$ does $h(n) = 13$?

Step 1: Set the rule equal to the given output.
- $2n + 5 = 13$

Step 2: Undo the addition first. Subtract $5$ from both sides.
- $2n = 8$

Step 3: Undo the multiplication. Divide both sides by $2$.
- $n = 4$

Step 4: Check by running it forward. $h(4) = 2(4) + 5 = 13$. Match.

Step 4 is not optional decoration. It converts a guess into a certainty, and it takes ten seconds.

The trap here is order. A student who divides $13$ by $2$ first is dividing before removing the constant, and gets $6.5$. Another writes $13 - 5 = 8$ and stops, reporting $8$ when $8$ was only the middle of the work. Read the question again before you answer: it asked for $n$.

---

##### Two Inputs Can Share an Output

Because repeated outputs are allowed, a question can ask you to find a **second** input that produces the same output as a first.

**Example 4:** If $f(x) = x^{2}$, and $f(k) = f(3)$, what is a value of $k$ other than $3$?

$f(3) = 9$, so you need $k^{2} = 9$. Both $3$ and $-3$ square to $9$, so $k = -3$.

This is legal and it is not a broken function. Input $3$ and input $-3$ both give output $9$. Two buttons, same snack.

---

##### Domain and Range

Two vocabulary words that show up in the answer choices.

- The **domain** is the set of all inputs the function accepts.
- The **range** is the set of all outputs it produces.

For the function given by $(1, 4), (2, 9), (3, 4)$:

- Domain: $1, 2, 3$
- Range: $4, 9$

The range lists $4$ once. A set records which values appear, not how many times.

---

##### The Five Traps

Know what is hunting you before you practice.

1. **Reading $f(5)$ as multiplication.** $f$ is a name, not a number. $f(5)$ means run the rule on $5$.
2. **Swapping input and output.** In $f(9) = 4$, the input is $9$ and the output is $4$. The number in the parentheses always went in.
3. **Testing outputs instead of inputs.** Repeated outputs are fine. A repeated input with two different outputs is what disqualifies a function.
4. **Forgetting the constant.** In $f(x) = 3x - 4$, $f(5)$ is $11$, not $15$. Finish the rule.
5. **Dividing before isolating.** To solve $2n + 5 = 13$, subtract the $5$ first. Dividing first gives $6.5$ and it is wrong.

When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. If $f(x) = 4x - 3$, what is $f(6)$?
   - A) $24$
   - B) $-21$
   - C) $21$
   - D) $12$

2. A function $f$ is defined so that $f(9) = 4$. Which statement correctly interprets this?
   - A) When the input is $4$, the output is $9$.
   - B) When the input is $9$, the output is $4$.
   - C) The function multiplies $9$ by $4$.
   - D) $f$ is equal to $9$ divided by $4$.

3. Which list of ordered pairs represents a function?
   - A) $(1, 3), (2, 5), (1, 7), (4, 9)$
   - B) $(4, 1), (4, 2), (6, 3), (8, 5)$
   - C) $(0, 2), (1, 4), (0, 6), (3, 8)$
   - D) $(1, 3), (2, 3), (3, 3), (4, 3)$

4. If $g(x) = x^{2} + 1$, what is $g(3)$?
   - A) $10$
   - B) $7$
   - C) $9$
   - D) $16$

**Proficient Level** (these require an extra step)

5. If $g(t) = t^{2} - 3t + 1$, what is $g(-2)$?
   - A) $10$
   - B) $3$
   - C) $11$
   - D) $-1$

6. If $h(n) = 2n + 5$, for which value of $n$ does $h(n) = 13$?
   - A) $6.5$
   - B) $9$
   - C) $8$
   - D) $4$

7. A phone plan charges $C(g) = 8g + 25$ dollars when $g$ gigabytes are used. A customer's bill is \$65. How many gigabytes were used?
   - A) $11.25$
   - B) $5$
   - C) $8.125$
   - D) $40$

**Advanced Level** (these need multiple steps or reverse thinking)

8. Let $f(x) = x^{2} - 6x + 5$. If $f(k) = f(2)$, what is a value of $k$ other than $2$?
   - A) $4$
   - B) $3$
   - C) $-2$
   - D) $5$

9. If $f(x) = 2x - 1$, what is $f(5) - f(2)$?
   - A) $-6$
   - B) $4$
   - C) $6$
   - D) $9$

10. Let $f(x) = x^{2} - 4$. For which values of $x$ is $f(x) > 0$?
    - A) $-2 < x < 2$
    - B) $x < -2$ or $x > 2$
    - C) $x > 2$ only
    - D) $x > 4$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

If $f(x) = 5x - 2$, what is $f(3)$?

- A) $15$
- B) $5$
- C) $13$
- D) $-13$

**Item 2**

A function $f$ is defined so that $f(6) = 1$. Which statement correctly interprets this?

- A) When the input is $6$, the output is $1$.
- B) When the input is $1$, the output is $6$.
- C) The function multiplies $6$ by $1$.
- D) $f$ is equal to $6$ divided by $1$.

**Item 3**

If $g(x) = x^{2} + 2x$, what is $g(-3)$?

- A) $15$
- B) $-12$
- C) $9$
- D) $3$

**Item 4**

If $h(n) = 4n - 1$, for which value of $n$ does $h(n) = 19$?

- A) $4.5$
- B) $5$
- C) $4.75$
- D) $20$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. If $f(x) = 4x - 3$, what is $f(6)$?**

Step 1: Replace every $x$ with $6$.
- $f(6) = 4(6) - 3$

Step 2: Multiply before subtracting.
- $4(6) = 24$

Step 3: Finish.
- $24 - 3 = 21$

**Answer: C** ($21$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (computes the variable part 4 times 6 to get 24 and reports it, never subtracting the 3)",
  "B": "Student makes misconception: subtracts_in_wrong_order (computes 24 correctly but then subtracts it from 3 rather than subtracting 3 from it, producing -21)",
  "C": "Correct: substitutes 6 for x, multiplies 4 by 6 to get 24, then subtracts 3 to reach 21",
  "D": "Student makes misconception: order_of_operations_violated (subtracts inside first, computing 4 times the quantity 6 minus 3, which is 4 times 3 or 12)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "subtracts_in_wrong_order",
  "D": "order_of_operations_violated"
}
```

---

**2. A function $f$ is defined so that $f(9) = 4$. Which statement correctly interprets this?**

Step 1: Identify what sits inside the parentheses. That is always the input.
- The input is $9$.

Step 2: Identify what the notation is set equal to. That is the output.
- The output is $4$.

Step 3: State it plainly. When the input is $9$, the output is $4$.

**Answer: B** (When the input is $9$, the output is $4$.)

```json
"distractor_logic": {
  "A": "Student makes misconception: input_output_reversed (exchanges the two roles, reading the 4 as what went in and the 9 as what came out)",
  "B": "Correct: reads the 9 inside the parentheses as the input and the 4 on the right of the equals sign as the output",
  "C": "Student makes misconception: function_notation_as_multiplication (reads the parentheses as a multiplication sign, so f(9) = 4 becomes a claim that 9 is being multiplied by 4)",
  "D": "Student makes misconception: function_notation_as_fraction (reads f(9) as f divided by 9, treating the function name as a numeric quantity in a fraction)"
},
"misconception_tag": {
  "A": "input_output_reversed",
  "C": "function_notation_as_multiplication",
  "D": "function_notation_as_fraction"
}
```

---

**3. Which list of ordered pairs represents a function?**

Step 1: Recall the test. Scan the **inputs** only, which are the first numbers in each pair. An input that appears twice with two different outputs breaks the function.

Step 2: Check each list.
- A) Inputs are $1, 2, 1, 4$. Input $1$ appears twice, giving $3$ once and $7$ once. Not a function.
- B) Inputs are $4, 4, 6, 8$. Input $4$ appears twice, giving $1$ once and $2$ once. Not a function.
- C) Inputs are $0, 1, 0, 3$. Input $0$ appears twice, giving $2$ once and $6$ once. Not a function.
- D) Inputs are $1, 2, 3, 4$. Every input appears exactly once. This is a function.

Step 3: Confirm the thing that looks suspicious about D. Every output is $3$. Repeated outputs are allowed, so this changes nothing.

**Answer: D** ($(1, 3), (2, 3), (3, 3), (4, 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: input_output_reversed (applies the one-output test to the wrong column, sees the outputs 3, 5, 7, 9 are all different and calls it a function, missing that input 1 is repeated)",
  "B": "Student makes misconception: input_output_reversed (scans the second coordinates 1, 2, 3, 5, finds them all distinct and accepts the list, overlooking that input 4 appears twice)",
  "C": "Student makes misconception: input_output_reversed (checks the outputs 2, 4, 6, 8 for repeats instead of the inputs, so the repeated input 0 goes unnoticed)",
  "D": "Correct: every input appears exactly once, and the repeated output 3 does not disqualify it"
},
"misconception_tag": {
  "A": "input_output_reversed",
  "B": "input_output_reversed",
  "C": "input_output_reversed"
}
```

---

**4. If $g(x) = x^{2} + 1$, what is $g(3)$?**

Step 1: Substitute $3$ for $x$.
- $g(3) = 3^{2} + 1$

Step 2: Apply the exponent before adding.
- $3^{2} = 9$

Step 3: Add the constant.
- $9 + 1 = 10$

**Answer: A** ($10$)

```json
"distractor_logic": {
  "A": "Correct: squares the input to get 9, then adds 1 to reach 10",
  "B": "Student makes misconception: squaring_confused_with_doubling (reads the exponent as a multiplier and computes 2 times 3 plus 1, producing 7)",
  "C": "Student makes misconception: omits_constant_term (squares the input correctly to get 9 and reports it without adding the 1)",
  "D": "Student makes misconception: order_of_operations_violated (adds before squaring, computing the quantity 3 plus 1 and then squaring it to get 16)"
},
"misconception_tag": {
  "B": "squaring_confused_with_doubling",
  "C": "omits_constant_term",
  "D": "order_of_operations_violated"
}
```

---

**Proficient Level**

**5. If $g(t) = t^{2} - 3t + 1$, what is $g(-2)$?**

Step 1: Substitute $-2$ for every $t$, keeping the parentheses.
- $g(-2) = (-2)^{2} - 3(-2) + 1$

Step 2: Square first. A negative squared is positive.
- $(-2)^{2} = 4$

Step 3: The middle term multiplies two negatives, so it turns positive.
- $-3(-2) = +6$

Step 4: Combine.
- $4 + 6 + 1 = 11$

**Answer: C** ($11$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (handles both variable terms correctly to reach 4 plus 6 but never adds the trailing 1, stopping at 10)",
  "B": "Student makes misconception: squaring_confused_with_doubling (reads t squared as 2t and computes 2 times -2, giving -4, then -4 plus 6 plus 1 for 3)",
  "C": "Correct: squares -2 to get 4, multiplies -3 by -2 to get +6, then adds 1 for a total of 11",
  "D": "Student makes misconception: sign_error_on_constant (keeps the minus sign on the middle term after substituting, computing 4 minus 6 plus 1 to get -1 instead of recognising that -3 times -2 is positive)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "squaring_confused_with_doubling",
  "D": "sign_error_on_constant"
}
```

---

**6. If $h(n) = 2n + 5$, for which value of $n$ does $h(n) = 13$?**

Step 1: Set the rule equal to the output.
- $2n + 5 = 13$

Step 2: Subtract $5$ from both sides, removing the constant first.
- $2n = 8$

Step 3: Divide both sides by $2$.
- $n = 4$

Step 4: Check forward. $h(4) = 2(4) + 5 = 8 + 5 = 13$. Match.

**Answer: D** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (divides the output 13 by 2 without first removing the 5, producing 6.5)",
  "B": "Student makes misconception: adds_instead_of_subtracts (adds the 5 to 13 instead of subtracting it, then divides 18 by 2 to get 9)",
  "C": "Student makes misconception: answers_intermediate_value (computes 13 minus 5 to get 8, which is the value of 2n rather than n, and reports it without dividing)",
  "D": "Correct: subtracts 5 from both sides to get 2n = 8, then divides by 2 to reach n = 4"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "adds_instead_of_subtracts",
  "C": "answers_intermediate_value"
}
```

---

**7. A phone plan charges $C(g) = 8g + 25$ dollars when $g$ gigabytes are used. A customer's bill is \$65. How many gigabytes were used?**

Step 1: The bill is the output, so set the rule equal to $65$.
- $8g + 25 = 65$

Step 2: Subtract the flat \$25 from both sides.
- $8g = 40$

Step 3: Divide by $8$.
- $g = 5$

Step 4: Check forward. $8(5) + 25 = 40 + 25 = 65$. Match.

**Answer: B** ($5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_instead_of_subtracts (adds the 25 flat fee to the 65 bill instead of subtracting it, then divides 90 by 8 to get 11.25)",
  "B": "Correct: subtracts the 25 flat fee to get 8g = 40, then divides by 8 to reach 5 gigabytes",
  "C": "Student makes misconception: omits_constant_term (divides the whole 65 bill by the 8 dollar rate without removing the flat fee, producing 8.125)",
  "D": "Student makes misconception: answers_intermediate_value (computes 65 minus 25 to get 40, the amount spent on data, and reports it as a number of gigabytes without dividing by the rate)"
},
"misconception_tag": {
  "A": "adds_instead_of_subtracts",
  "C": "omits_constant_term",
  "D": "answers_intermediate_value"
}
```

---

**Advanced Level**

**8. Let $f(x) = x^{2} - 6x + 5$. If $f(k) = f(2)$, what is a value of $k$ other than $2$?**

Step 1: Find the output you have to match.
- $f(2) = (2)^{2} - 6(2) + 5 = 4 - 12 + 5 = -3$

Step 2: Set the rule equal to that output.
- $k^{2} - 6k + 5 = -3$

Step 3: Move everything to one side.
- $k^{2} - 6k + 8 = 0$

Step 4: Factor and solve.
- $(k - 2)(k - 4) = 0$, so $k = 2$ or $k = 4$

Step 5: The question excludes $2$, so $k = 4$.

Step 6: Check. $f(4) = 16 - 24 + 5 = -3$, which equals $f(2)$. Match.

**Answer: A** ($4$)

```json
"distractor_logic": {
  "A": "Correct: evaluates f(2) as -3, solves k squared minus 6k plus 8 = 0 for k = 2 or 4, and reports the value other than 2",
  "B": "Student makes misconception: symmetric_partner_misidentified (locates the axis of symmetry at x = 3, which is the midpoint between the two inputs, and reports the axis itself instead of the partner input)",
  "C": "Student makes misconception: symmetric_partner_misidentified (assumes the second input must be the negative of the first and reports -2 without testing it, though f(-2) is 21, not -3)",
  "D": "Student makes misconception: symmetric_partner_misidentified (solves f(k) = 0 instead of f(k) = f(2), finding the roots 1 and 5 and reporting 5)"
},
"misconception_tag": {
  "B": "symmetric_partner_misidentified",
  "C": "symmetric_partner_misidentified",
  "D": "symmetric_partner_misidentified"
}
```

---

**9. If $f(x) = 2x - 1$, what is $f(5) - f(2)$?**

Step 1: Evaluate each piece separately.
- $f(5) = 2(5) - 1 = 10 - 1 = 9$
- $f(2) = 2(2) - 1 = 4 - 1 = 3$

Step 2: Subtract in the order written.
- $9 - 3 = 6$

**Answer: C** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: subtracts_in_wrong_order (computes both values correctly but reverses the subtraction, taking 3 minus 9 to get -6)",
  "B": "Student makes misconception: drops_negative_on_group (writes 2 times 5 minus 1 minus 2 times 2 minus 1 without keeping the second function value grouped, so the minus reaches only the 4 and not the -1, giving 10 minus 1 minus 4 minus 1 or 4)",
  "C": "Correct: evaluates f(5) as 9 and f(2) as 3, then subtracts to reach 6",
  "D": "Student makes misconception: answers_intermediate_value (evaluates f(5) as 9 and reports it without subtracting f(2))"
},
"misconception_tag": {
  "A": "subtracts_in_wrong_order",
  "B": "drops_negative_on_group",
  "D": "answers_intermediate_value"
}
```

---

**10. Let $f(x) = x^{2} - 4$. For which values of $x$ is $f(x) > 0$?**

Step 1: Write what the question asks as an inequality.
- $x^{2} - 4 > 0$

Step 2: Isolate the squared term.
- $x^{2} > 4$

Step 3: Ask which numbers square to more than $4$. Test a value from each region.
- $x = 3$: $9 > 4$. True.
- $x = 0$: $0 > 4$. False.
- $x = -3$: $9 > 4$. True.

Step 4: Both far regions work, because squaring a large negative gives a large positive.
- $x < -2$ or $x > 2$

**Answer: B** ($x < -2$ or $x > 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (solves x squared greater than 4 and reports the interval between the boundaries instead of outside them, which is the solution set of the opposite inequality)",
  "B": "Correct: reduces to x squared greater than 4 and recognises that both x greater than 2 and x less than -2 satisfy it",
  "C": "Student makes misconception: drops_negative_sign (takes the square root of 4 as 2 only, keeping the positive branch and discarding the negative one)",
  "D": "Student makes misconception: forgets_square_root (reads x squared greater than 4 as x greater than 4, reporting the boundary without taking the root)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "C": "drops_negative_sign",
  "D": "forgets_square_root"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: If $f(x) = 5x - 2$, what is $f(3)$?**

Step 1: Substitute $3$ for $x$.
- $f(3) = 5(3) - 2$

Step 2: Multiply, then subtract.
- $15 - 2 = 13$

**Answer: C** ($13$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (computes 5 times 3 to get 15 and reports it without subtracting the 2)",
  "B": "Student makes misconception: order_of_operations_violated (subtracts inside first, computing 5 times the quantity 3 minus 2, which is 5 times 1 or 5)",
  "C": "Correct: multiplies 5 by 3 to get 15, then subtracts 2 to reach 13",
  "D": "Student makes misconception: subtracts_in_wrong_order (reaches 15 but subtracts it from 2 instead of subtracting 2 from it, producing -13)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "order_of_operations_violated",
  "D": "subtracts_in_wrong_order"
}
```

---

**Item 2: A function $f$ is defined so that $f(6) = 1$. Which statement correctly interprets this?**

Step 1: The number inside the parentheses is the input, so the input is $6$.

Step 2: The value the notation equals is the output, so the output is $1$.

**Answer: A** (When the input is $6$, the output is $1$.)

```json
"distractor_logic": {
  "A": "Correct: reads the 6 inside the parentheses as the input and the 1 as the output",
  "B": "Student makes misconception: input_output_reversed (swaps the roles, treating the 1 as what went in and the 6 as what came out)",
  "C": "Student makes misconception: function_notation_as_multiplication (reads the parentheses as multiplication, turning the statement into a claim about 6 times 1)",
  "D": "Student makes misconception: function_notation_as_fraction (reads f(6) as f divided by 6, treating the function name as a number)"
},
"misconception_tag": {
  "B": "input_output_reversed",
  "C": "function_notation_as_multiplication",
  "D": "function_notation_as_fraction"
}
```

---

**Item 3: If $g(x) = x^{2} + 2x$, what is $g(-3)$?**

Step 1: Substitute $-3$ for every $x$, with parentheses.
- $g(-3) = (-3)^{2} + 2(-3)$

Step 2: Square first. A negative squared is positive.
- $(-3)^{2} = 9$

Step 3: The second term is positive two times negative three.
- $2(-3) = -6$

Step 4: Combine.
- $9 - 6 = 3$

**Answer: D** ($3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (squares correctly to 9 but treats the second term as positive 6, adding instead of subtracting to get 15)",
  "B": "Student makes misconception: squaring_confused_with_doubling (reads x squared as 2x, so both terms become 2 times -3 and the total is -6 plus -6, or -12)",
  "C": "Student makes misconception: omits_second_component (squares -3 to get 9 and stops, never evaluating the 2x term)",
  "D": "Correct: squares -3 to get 9, evaluates 2 times -3 as -6, and combines them to reach 3"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "squaring_confused_with_doubling",
  "C": "omits_second_component"
}
```

---

**Item 4: If $h(n) = 4n - 1$, for which value of $n$ does $h(n) = 19$?**

Step 1: Set the rule equal to the output.
- $4n - 1 = 19$

Step 2: Add $1$ to both sides. The constant is being subtracted, so undo it by adding.
- $4n = 20$

Step 3: Divide by $4$.
- $n = 5$

Step 4: Check forward. $h(5) = 4(5) - 1 = 20 - 1 = 19$. Match.

**Answer: B** ($5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (subtracts the 1 instead of adding it when moving it across the equals sign, then divides 18 by 4 to get 4.5)",
  "B": "Correct: adds 1 to both sides to get 4n = 20, then divides by 4 to reach n = 5",
  "C": "Student makes misconception: omits_constant_term (divides the output 19 by 4 without first dealing with the -1, producing 4.75)",
  "D": "Student makes misconception: answers_intermediate_value (computes 19 plus 1 to get 20, the value of 4n, and reports it without dividing)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "C": "omits_constant_term",
  "D": "answers_intermediate_value"
}
```
