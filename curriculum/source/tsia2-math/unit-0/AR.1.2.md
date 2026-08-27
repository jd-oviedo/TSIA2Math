---
topic_name: "Recognizing if a relation is a function"
unit_number: 0
sequence_in_unit: 12
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "AR"
keywords: ["function", "relation", "ordered pairs", "vertical line test", "input", "output", "one-to-one", "mapping diagram"]
---

# AR.1.2 - Recognizing If a Relation Is a Function

**Topic ID:** AR.1.2  
**Unit:** 0  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### The Vending Machine Rule

You press B4 and a bag of chips comes out. You press B4 again tomorrow and a bag of chips comes out.

If pressing B4 gave you chips on Monday and gum on Tuesday, you would say the machine is **broken**. Not interesting, not random, broken. You expect one button to mean one thing.

That expectation is the definition of a function.

$$\textbf{Each input has exactly one output.}$$

That is the whole rule. Everything in this topic is an application of it, and every wrong answer in this topic comes from quietly replacing it with a different rule that sounds similar.

The previous topic gave you the definition and the notation. This one is about **testing** a relation you have been handed, which turns out to be where the errors actually live.

---

##### Repeated Outputs Are Fine. Repeated Inputs Are Fatal.

Read that heading twice, because it is the entire topic.

Two different buttons can both dispense chips. B4 gives chips and C2 gives chips, and the machine is working perfectly. What breaks the machine is **one** button giving two different things.

$$\{(1,5),\ (2,5),\ (3,5)\}$$

This **is** a function. Every input has exactly one output. The output happens to be $5$ every time, which is allowed and not even unusual: the rule "always give me $5$" is a perfectly good function.

$$\{(1,2),\ (1,3),\ (2,4)\}$$

This is **not** a function. The input $1$ is paired with $2$ and also with $3$. One button, two products.

**So the test is: look only at the input values.** Cover the outputs with your hand if you have to. If any input appears twice with different outputs, it is not a function. If every input appears once, it is.

---

##### Three Rules That Sound Right and Are Wrong

These three are responsible for most of the lost points, so name them now.

**Wrong rule 1: "each output must come from exactly one input."**

That is the definition **backwards**. It is a real property, and it has its own name, but it is not what makes something a function. $\{(1,5),(2,5)\}$ violates this backwards rule and is still a function.

**Wrong rule 2: "different inputs must give different outputs."**

This is called being **one-to-one**, and it is a stricter, separate condition. Every one-to-one relation is a function, but plenty of functions are not one-to-one. Squaring is the standard example: $-2$ and $2$ both give $4$, and squaring is absolutely a function.

**Wrong rule 3: "one repeat is not a big deal."**

It is. A relation with twenty inputs where nineteen behave and one has two outputs is **not a function**. There is no partial credit and no "mostly." One violation ends it, the same way one broken button means the machine needs fixing.

---

##### Worked Examples on Ordered Pairs

**Example 1:** Is $\{(1,3),(2,5),(3,7),(2,9)\}$ a function?

Step 1: List the inputs only.
- $1, 2, 3, 2$

Step 2: Look for a repeat. The input $2$ appears twice.

Step 3: Check whether the outputs differ. $(2,5)$ and $(2,9)$ give $5$ and $9$.

Step 4: Same input, two different outputs. **Not a function.**

Notice the outputs $3, 5, 7, 9$ are all different, so a student checking outputs instead of inputs sees nothing wrong and answers "yes." Checking the wrong column is the single most common failure here.

**Example 2:** Is $\{(2,5),(4,7),(6,5),(8,9)\}$ a function?

Step 1: Inputs are $2, 4, 6, 8$. All different.

Step 2: **It is a function.** Done.

The output $5$ appears twice, which is allowed and does not need mentioning. Do not talk yourself out of a correct answer because something looks repetitive.

---

##### Tables and Mapping Diagrams

Same rule, different clothing.

**A table** lists inputs down one column. Scan that column for repeats.

**A mapping diagram** draws arrows from inputs to outputs. The test becomes visual and very clean:

$$\textbf{Exactly one arrow leaves each input.}$$

Two arrows leaving one input means not a function. Two arrows **arriving** at one output is fine. Arrows are allowed to converge; they are not allowed to fork.

**Example 3:** A diagram sends $a \to 1$, $b \to 2$, $c \to 1$.

One arrow leaves $a$, one leaves $b$, one leaves $c$. **It is a function.** Two arrows arrive at $1$, which is convergence, not forking.

---

##### The Vertical Line Test

For a graph, you cannot list pairs, so use this instead.

$$\textbf{If any vertical line crosses the graph more than once, it is not a function.}$$

The reason is exactly the rule you already know. A vertical line is a single $x$ value, so if it hits the graph twice, that one input has two outputs.

**Example 4:** Is a circle centred at the origin a function?

Draw a vertical line through the middle of it. It enters at the bottom of the circle and exits at the top, crossing twice. One $x$ value, two $y$ values. **Not a function.**

Two ways this test gets mangled.

**"Some vertical line meets it once, so it passes."** The test is about **every** vertical line. Finding one well-behaved line proves nothing. A circle has exactly two vertical lines that touch it once, at the far left and far right, and it is still not a function.

**"A horizontal line meets it twice, so it fails."** The horizontal line test is a real test, but it tests something else, namely whether the relation is one-to-one. For "is it a function," the line is **vertical**. Vertical for the function test.

---

##### A Relation From Real Life

**Example 5:** Pair each student in a class with the month they were born.

Is this a function? Each student has exactly one birth month, so yes. Many students may share March, which is convergence and is fine.

Now reverse it: pair each **month** with the students born in it. Is that a function? March may point to four different students, so one input has four outputs. **Not a function.**

Same two sets of data, opposite answers, and the only thing that changed is which side is the input. **Decide what the input is before you test anything**, because the question is meaningless until you do.

---

##### The Four Traps

1. **Checking outputs instead of inputs.** Cover the output column. Repeats there are legal.
2. **Using the one-to-one condition.** Different inputs are allowed to share an output.
3. **Applying the rule backwards.** "Each output has one input" is a different property entirely.
4. **Excusing a single violation.** One input with two outputs disqualifies the whole relation.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Which statement correctly describes the relation $\{(1,3),(2,5),(3,7),(2,9)\}$?
   - A) It is not a function, because the input $2$ has two different outputs.
   - B) It is a function, because only one of the four inputs repeats.
   - C) It is a function, because all four outputs are different from one another.
   - D) It is a function, because each output comes from exactly one input.

2. A table records that input $2$ gives output $7$, input $4$ gives output $7$, and input $6$ gives output $7$. Does this table represent a function?
   - A) No, because different inputs must give different outputs.
   - B) No, because the same output appears for three different inputs.
   - C) No, because a function must pair each output with only one input.
   - D) Yes, because each input has exactly one output.

3. The graph of a relation is a circle centred at the origin. Is the relation a function?
   - A) No, because a horizontal line meets the circle at two points.
   - B) Yes, because a vertical line can be drawn that meets the circle at exactly one point.
   - C) No, because a vertical line can be drawn that meets the circle at two points.
   - D) Yes, because the circle behaves correctly at most of its points.

4. A mapping diagram sends $a \to 1$, $b \to 2$, and $c \to 1$. Is this relation a function?
   - A) Yes, because exactly one arrow leaves each of $a$, $b$ and $c$.
   - B) No, because the output $1$ receives arrows from two different inputs.
   - C) No, because a function must be one-to-one.
   - D) No, because $c$ should be excluded for producing an output already used.

**Proficient Level** (these require an extra step)

5. Which statement correctly describes the relation $\{(2,5),(4,7),(6,5),(8,9)\}$?
   - A) It is not a function, because the pair $(6,5)$ repeats an output already produced.
   - B) It is not a function, because the output $5$ appears twice.
   - C) It is not a function, because it is not one-to-one.
   - D) It is a function, and the repeated output $5$ does not affect that.

6. Every vertical line drawn through a certain graph meets it exactly once, except the vertical line at $x = 3$, which meets it twice. Is the relation a function?
   - A) Yes, because every other vertical line meets the graph only once.
   - B) No, because one input having two outputs is enough to disqualify the relation.
   - C) Yes, because the test fails only if every vertical line meets the graph more than once.
   - D) No, because a horizontal line must also meet the graph only once.

7. Which of these relations is a function but is **not** one-to-one?
   - A) $\{(1,4),(2,5),(3,6)\}$
   - B) $\{(1,4),(1,5),(1,6)\}$
   - C) $\{(1,4),(2,4),(3,4)\}$
   - D) $\{(4,1),(4,2),(5,3)\}$

**Advanced Level** (these need multiple steps or reverse thinking)

8. In the relation $\{(1,3),(2,5),(k,7),(4,9)\}$, which value of $k$ leaves the relation a function?
   - A) $k = 4$
   - B) $k = 1$
   - C) $k = 2$
   - D) $k = 3$

9. A graph is made of two pieces. The first covers $x$ values from $0$ to $3$ and the second covers $x$ values from $3$ to $6$. At $x = 3$ both pieces include a point, and those two points have different $y$ values. Is the relation a function?
   - A) Yes, because each piece on its own passes the test.
   - B) No, because $x = 3$ is paired with two different outputs.
   - C) Yes, because a vertical line meets the graph twice at only the single value $x = 3$.
   - D) No, because the two pieces produce some of the same output values.

10. One relation pairs each student in a class with the month they were born. A second relation pairs each birth month with the students born in that month. Which relation is guaranteed to be a function?
    - A) Only the second, because each month is a single distinct value.
    - B) Only the first, because each student has exactly one birth month even though a month may be shared.
    - C) Both, because every student and every month appears somewhere in the pairing.
    - D) Neither, because several students share a birth month, so no output is unique.

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Which statement correctly describes the relation $\{(2,4),(3,6),(2,8)\}$?

- A) It is not a function, because the input $2$ has two different outputs.
- B) It is a function, because all three outputs are different from one another.
- C) It is a function, because only one input repeats.
- D) It is a function, because each output comes from exactly one input.

**Item 2**

A table records that input $1$ gives output $5$, input $2$ gives output $5$, and input $3$ gives output $5$. Does this table represent a function?

- A) No, because the same output is used three times.
- B) Yes, because each input has exactly one output.
- C) No, because different inputs must give different outputs.
- D) No, because the second and third pairs repeat an output already produced.

**Proficient Level**

**Item 3**

Every vertical line drawn through a certain graph meets it at exactly one point, except one vertical line that meets it at three points. Is the relation a function?

- A) No, because a horizontal line also meets the graph more than once.
- B) Yes, because every other vertical line meets the graph once.
- C) Yes, because the test fails only if every vertical line meets the graph more than once.
- D) No, because that one input is paired with three outputs.

**Basic Level**

**Item 4**

Which of these relations is a function?

- A) $\{(5,1),(5,2),(6,3)\}$
- B) $\{(1,7),(1,8),(2,9)\}$
- C) $\{(1,7),(2,7),(3,8)\}$
- D) $\{(0,4),(4,0),(0,9)\}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Which statement correctly describes the relation $\{(1,3),(2,5),(3,7),(2,9)\}$?**

Step 1: List the inputs only.
- $1, 2, 3, 2$

Step 2: The input $2$ appears twice.

Step 3: Check its outputs. $(2,5)$ and $(2,9)$ give $5$ and $9$, which differ.

Step 4: One input, two outputs. Not a function.

**Answer: A** (not a function, because input $2$ has two outputs)

```json
"distractor_logic": {
  "A": "Correct: finds the input 2 paired with both 5 and 9, which is exactly what disqualifies a relation",
  "B": "Student makes misconception: single_violation_dismissed (treats one repeated input among four as too minor to matter, when a single violation ends it)",
  "C": "Student makes misconception: outputs_checked_not_inputs (scans the output column, finds 3, 5, 7 and 9 all distinct, and never checks the inputs where the repeat actually is)",
  "D": "Student makes misconception: function_rule_converse_applied (uses the definition backwards, asking whether each output has one input rather than whether each input has one output)"
},
"misconception_tag": {
  "B": "single_violation_dismissed",
  "C": "outputs_checked_not_inputs",
  "D": "function_rule_converse_applied"
}
```

---

**2. A table records that input $2$ gives output $7$, input $4$ gives output $7$, and input $6$ gives output $7$. Does this table represent a function?**

Step 1: List the inputs.
- $2, 4, 6$

Step 2: No input repeats, so every input has exactly one output.

Step 3: The output $7$ repeating is allowed. Convergence is legal; forking is not.

**Answer: D** (yes)

```json
"distractor_logic": {
  "A": "Student makes misconception: injectivity_used_as_function_test (applies the one-to-one condition as though it were the definition of a function)",
  "B": "Student makes misconception: outputs_checked_not_inputs (treats the repetition in the output column as the disqualifying feature, when only repetition among inputs disqualifies)",
  "C": "Student makes misconception: function_rule_converse_applied (requires each output to have exactly one input, which is the definition reversed)",
  "D": "Correct: every input appears once, and a shared output does not violate the definition"
},
"misconception_tag": {
  "A": "injectivity_used_as_function_test",
  "B": "outputs_checked_not_inputs",
  "C": "function_rule_converse_applied"
}
```

---

**3. The graph of a relation is a circle centred at the origin. Is the relation a function?**

Step 1: Apply the vertical line test.

Step 2: A vertical line through the middle of the circle enters at the bottom and exits at the top, crossing at two points.

Step 3: That single $x$ value is paired with two $y$ values. Not a function.

**Answer: C** (no, a vertical line meets it twice)

```json
"distractor_logic": {
  "A": "Student makes misconception: injectivity_used_as_function_test (runs the horizontal line test, which decides whether a relation is one-to-one rather than whether it is a function)",
  "B": "Student makes misconception: vertical_line_test_misapplied (treats the existence of one well-behaved vertical line as a pass, when the test requires every vertical line to meet the graph at most once)",
  "C": "Correct: applies the vertical line test and finds a line that crosses the circle twice, giving one input two outputs",
  "D": "Student makes misconception: single_violation_dismissed (excuses the failing region because the rest of the circle behaves)"
},
"misconception_tag": {
  "A": "injectivity_used_as_function_test",
  "B": "vertical_line_test_misapplied",
  "D": "single_violation_dismissed"
}
```

---

**4. A mapping diagram sends $a \to 1$, $b \to 2$, and $c \to 1$. Is this relation a function?**

Step 1: Count the arrows leaving each input. One leaves $a$, one leaves $b$, one leaves $c$.

Step 2: No input forks, so each input has exactly one output.

Step 3: Two arrows arrive at $1$. Arrows converging on an output is allowed.

**Answer: A** (yes)

```json
"distractor_logic": {
  "A": "Correct: exactly one arrow leaves each input, which is the mapping-diagram form of the definition",
  "B": "Student makes misconception: outputs_checked_not_inputs (counts arrows arriving at an output rather than arrows leaving an input, reading convergence as a fault)",
  "C": "Student makes misconception: injectivity_used_as_function_test (requires the relation to be one-to-one, a stricter separate condition)",
  "D": "Student makes misconception: repeated_output_excludes_input (drops an input because its output duplicates one already produced, treating a repeated output as disqualifying)"
},
"misconception_tag": {
  "B": "outputs_checked_not_inputs",
  "C": "injectivity_used_as_function_test",
  "D": "repeated_output_excludes_input"
}
```

---

**Proficient Level**

**5. Which statement correctly describes the relation $\{(2,5),(4,7),(6,5),(8,9)\}$?**

Step 1: List the inputs.
- $2, 4, 6, 8$

Step 2: All four are different, so every input has exactly one output. It is a function.

Step 3: The output $5$ appears at both $(2,5)$ and $(6,5)$. That is convergence and it changes nothing.

**Answer: D** (a function; the repeated output does not matter)

```json
"distractor_logic": {
  "A": "Student makes misconception: repeated_output_excludes_input (wants to remove a valid pair because its output was already produced by another input)",
  "B": "Student makes misconception: outputs_checked_not_inputs (finds the repeat in the output column and reads it as disqualifying)",
  "C": "Student makes misconception: injectivity_used_as_function_test (correctly observes the relation is not one-to-one but treats that as failing the function test)",
  "D": "Correct: all four inputs are distinct, and a repeated output never affects whether a relation is a function"
},
"misconception_tag": {
  "A": "repeated_output_excludes_input",
  "B": "outputs_checked_not_inputs",
  "C": "injectivity_used_as_function_test"
}
```

---

**6. Every vertical line drawn through a certain graph meets it exactly once, except the vertical line at $x = 3$, which meets it twice. Is the relation a function?**

Step 1: The vertical line at $x = 3$ meets the graph twice, so the input $3$ is paired with two outputs.

Step 2: The definition demands **exactly one** output for **every** input. One failure is a failure.

**Answer: B** (no)

```json
"distractor_logic": {
  "A": "Student makes misconception: single_violation_dismissed (concludes the relation is a function because all but one input behave)",
  "B": "Correct: a single input with two outputs disqualifies the relation regardless of how the rest behaves",
  "C": "Student makes misconception: vertical_line_test_misapplied (invents a version of the test in which every vertical line must fail before the graph fails)",
  "D": "Student makes misconception: injectivity_used_as_function_test (brings in the horizontal line condition, which decides one-to-one rather than function)"
},
"misconception_tag": {
  "A": "single_violation_dismissed",
  "C": "vertical_line_test_misapplied",
  "D": "injectivity_used_as_function_test"
}
```

---

**7. Which of these relations is a function but is not one-to-one?**

Step 1: The relation must pass the function test, so no input may repeat.

Step 2: It must also fail the one-to-one test, so some output must be shared by two inputs.

Step 3: Check $\{(1,4),(2,4),(3,4)\}$. Inputs $1, 2, 3$ are all distinct, so it is a function. The output $4$ is shared by all three inputs, so it is not one-to-one. Both conditions met.

**Answer: C** ($\{(1,4),(2,4),(3,4)\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: injectivity_used_as_function_test (selects the relation that is one-to-one, treating that property as what the question asked to find rather than what it asked to exclude)",
  "B": "Student makes misconception: function_rule_converse_applied (accepts a relation where the input 1 has three outputs, because each output arises from only one input)",
  "C": "Correct: distinct inputs make it a function, and the single shared output makes it not one-to-one",
  "D": "Student makes misconception: outputs_checked_not_inputs (sees the outputs 1, 2 and 3 all distinct and judges the relation a function, missing that the input 4 repeats)"
},
"misconception_tag": {
  "A": "injectivity_used_as_function_test",
  "B": "function_rule_converse_applied",
  "D": "outputs_checked_not_inputs"
}
```

---

**Advanced Level**

**8. In the relation $\{(1,3),(2,5),(k,7),(4,9)\}$, which value of $k$ leaves the relation a function?**

Step 1: The existing inputs are $1$, $2$ and $4$.

Step 2: If $k$ equals any of those, that input gains a second output, because the pair $(k,7)$ has output $7$ while $1$, $2$ and $4$ already give $3$, $5$ and $9$.

Step 3: So $k$ must avoid $1$, $2$ and $4$. Of the choices, only $3$ does.

Step 4: Check. $\{(1,3),(2,5),(3,7),(4,9)\}$ has inputs $1, 2, 3, 4$, all distinct.

**Answer: D** ($k = 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: function_rule_converse_applied (verifies only that each output arises from a single input, which holds for every choice and so decides nothing)",
  "B": "Student makes misconception: outputs_checked_not_inputs (checks that the output 7 does not already appear, finds it does not, and concludes any value of k is safe)",
  "C": "Student makes misconception: single_violation_dismissed (notices that k equal to 2 would repeat an input but judges one repeat acceptable among four pairs)",
  "D": "Correct: 3 is the only choice that is not already an input, so every input keeps exactly one output"
},
"misconception_tag": {
  "A": "function_rule_converse_applied",
  "B": "outputs_checked_not_inputs",
  "C": "single_violation_dismissed"
}
```

---

**9. A graph is made of two pieces meeting at $x = 3$, where both pieces include a point and those points have different $y$ values. Is the relation a function?**

Step 1: At $x = 3$ the graph contains two points with different $y$ values.

Step 2: That is one input paired with two outputs, which is precisely what the definition forbids.

Step 3: A vertical line at $x = 3$ meets the graph twice, confirming it.

**Answer: B** (no)

```json
"distractor_logic": {
  "A": "Student makes misconception: single_violation_dismissed (judges the relation a function because each piece behaves in isolation, ignoring the one input where they overlap)",
  "B": "Correct: the shared boundary gives the input 3 two different outputs, which disqualifies the relation",
  "C": "Student makes misconception: vertical_line_test_misapplied (treats a double crossing as acceptable when it happens at only one x value, when a single such crossing is what the test looks for)",
  "D": "Student makes misconception: outputs_checked_not_inputs (reaches the right verdict from the wrong column, citing shared output values rather than the shared input at the seam)"
},
"misconception_tag": {
  "A": "single_violation_dismissed",
  "C": "vertical_line_test_misapplied",
  "D": "outputs_checked_not_inputs"
}
```

---

**10. One relation pairs each student with their birth month. A second pairs each birth month with the students born in it. Which relation is guaranteed to be a function?**

Step 1: Take the first relation. The input is a student, and each student has exactly one birth month. Every input has exactly one output, so it is a function.

Step 2: Several students may share March, which means several inputs converge on one output. That is allowed.

Step 3: Take the second relation. The input is now a month, and March may point to four different students. One input, four outputs. Not a function.

**Answer: B** (only the first)

```json
"distractor_logic": {
  "A": "Student makes misconception: function_rule_converse_applied (tests the pairing in the wrong direction, judging by whether each month is a single distinct value rather than by how many students it points to)",
  "B": "Correct: each student has exactly one birth month, and students sharing a month is convergence on an output, which the definition permits",
  "C": "Student makes misconception: single_violation_dismissed (accepts the month-to-student relation despite months that point to several students, treating full coverage as sufficient)",
  "D": "Student makes misconception: injectivity_used_as_function_test (rejects both because outputs are shared, applying the one-to-one condition as the definition)"
},
"misconception_tag": {
  "A": "function_rule_converse_applied",
  "C": "single_violation_dismissed",
  "D": "injectivity_used_as_function_test"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Which statement correctly describes the relation $\{(2,4),(3,6),(2,8)\}$?**

Step 1: The inputs are $2, 3, 2$.

Step 2: The input $2$ appears twice, giving $4$ and $8$.

Step 3: Not a function.

**Answer: A** (not a function, because input $2$ has two outputs)

```json
"distractor_logic": {
  "A": "Correct: the input 2 is paired with both 4 and 8, which disqualifies the relation",
  "B": "Student makes misconception: outputs_checked_not_inputs (scans the output column, finds 4, 6 and 8 all distinct, and never checks the inputs)",
  "C": "Student makes misconception: single_violation_dismissed (treats a single repeated input as too minor to disqualify the relation)",
  "D": "Student makes misconception: function_rule_converse_applied (uses the definition backwards, checking whether each output has one input)"
},
"misconception_tag": {
  "B": "outputs_checked_not_inputs",
  "C": "single_violation_dismissed",
  "D": "function_rule_converse_applied"
}
```

---

**Item 2: A table records that input $1$ gives $5$, input $2$ gives $5$, and input $3$ gives $5$. Does this table represent a function?**

Step 1: The inputs $1$, $2$ and $3$ are all distinct.

Step 2: Each has exactly one output, so it is a function. The constant output is allowed.

**Answer: B** (yes)

```json
"distractor_logic": {
  "A": "Student makes misconception: outputs_checked_not_inputs (reads repetition in the output column as the disqualifying feature)",
  "B": "Correct: every input appears once, and a constant output is a perfectly ordinary function",
  "C": "Student makes misconception: injectivity_used_as_function_test (applies the one-to-one condition as though it were the definition of a function)",
  "D": "Student makes misconception: repeated_output_excludes_input (wants to drop inputs whose outputs duplicate one already produced)"
},
"misconception_tag": {
  "A": "outputs_checked_not_inputs",
  "C": "injectivity_used_as_function_test",
  "D": "repeated_output_excludes_input"
}
```

---

**Item 3: Every vertical line through a graph meets it at exactly one point, except one that meets it at three points. Is the relation a function?**

Step 1: That one vertical line marks a single input paired with three outputs.

Step 2: One violation disqualifies the relation.

**Answer: D** (no)

```json
"distractor_logic": {
  "A": "Student makes misconception: injectivity_used_as_function_test (cites the horizontal line condition, which decides one-to-one rather than function)",
  "B": "Student makes misconception: single_violation_dismissed (concludes the relation is a function because all but one input behave)",
  "C": "Student makes misconception: vertical_line_test_misapplied (invents a version of the test requiring every vertical line to fail before the graph fails)",
  "D": "Correct: one input with three outputs disqualifies the relation no matter how the rest behaves"
},
"misconception_tag": {
  "A": "injectivity_used_as_function_test",
  "B": "single_violation_dismissed",
  "C": "vertical_line_test_misapplied"
}
```

---

**Item 4: Which of these relations is a function?**

Step 1: Check the inputs of each option for repeats.
- $\{(1,7),(2,7),(3,8)\}$ has inputs $1, 2, 3$, all distinct
- $\{(1,7),(1,8),(2,9)\}$ has the input $1$ twice
- $\{(5,1),(5,2),(6,3)\}$ has the input $5$ twice
- $\{(0,4),(4,0),(0,9)\}$ has the input $0$ twice

Step 2: Only the first has no repeated input. The shared output $7$ in it is allowed.

**Answer: C** ($\{(1,7),(2,7),(3,8)\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: single_violation_dismissed (accepts the relation because only one of its two inputs repeats)",
  "B": "Student makes misconception: function_rule_converse_applied (accepts a relation whose input 1 has two outputs because each output arises from only one input)",
  "C": "Correct: inputs 1, 2 and 3 are distinct, and the output 7 being shared by two of them is permitted",
  "D": "Student makes misconception: outputs_checked_not_inputs (sees outputs 4, 0 and 9 all distinct and judges it a function, missing that the input 0 repeats)"
},
"misconception_tag": {
  "A": "single_violation_dismissed",
  "B": "function_rule_converse_applied",
  "D": "outputs_checked_not_inputs"
}
```
