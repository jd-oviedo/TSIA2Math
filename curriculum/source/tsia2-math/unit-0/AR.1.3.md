---
topic_name: "Domain and range"
unit_number: 0
sequence_in_unit: 13
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["domain", "range", "input", "output", "set notation", "interval", "endpoints", "piecewise"]
---

# AR.1.3 - Domain and Range

**Topic ID:** AR.1.3  
**Unit:** 0  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Buttons and Products

Back to the vending machine. It has a row of buttons you are allowed to press, and a shelf of products it is able to dispense.

The **domain** is the set of buttons. The **range** is the set of products.

$$\textbf{Domain} = \text{all the inputs} \qquad \textbf{Range} = \text{all the outputs}$$

That is the whole definition. The difficulty is never understanding it. The difficulty is keeping the two straight for ninety seconds under time pressure, which is why the very first thing to do is install a memory hook.

**The hook:** **D** comes before **R**. **x** comes before **y**. **Domain** goes with **x**, **range** goes with **y**, and both pairs are in alphabetical order.

Say it once now and you will have it: D before R, x before y.

---

##### Reading Them Off Ordered Pairs

**Example 1:** Find the domain and range of $\{(0,4),(1,6),(2,4),(3,8)\}$.

Step 1: The domain is the first coordinates.
- $0, 1, 2, 3$

Step 2: The range is the second coordinates.
- $4, 6, 4, 8$

Step 3: **Write each as a set, listing every value exactly once.**
- Domain: $\{0, 1, 2, 3\}$
- Range: $\{4, 6, 8\}$

Notice the $4$ appeared twice in step 2 and appears once in step 3. **A set does not repeat itself.** Writing $\{4, 6, 4, 8\}$ is not a different set with more in it; it is the same set written badly. List each distinct value once, and by convention put them in increasing order.

The mirror mistake is worth naming too. That repeated output does **not** mean you should throw away one of the inputs. The pair $(2,4)$ is a real pair and $2$ belongs in the domain. Repeated outputs never remove inputs.

---

##### Reading Them Off a Graph

Two different questions, two different directions of looking.

**Domain: how far does the graph extend left to right?** Squash the graph flat onto the $x$-axis and see what stretch it covers.

**Range: how far does it extend down to up?** Squash it onto the $y$-axis instead.

**Example 2:** A graph is a line segment running from $(-2, 1)$ to $(4, 7)$, with both endpoints included.

Step 1: Domain. The leftmost $x$ is $-2$ and the rightmost is $4$.
- $-2 \le x \le 4$

Step 2: Range. The lowest $y$ is $1$ and the highest is $7$.
- $1 \le y \le 7$

**The interval is the answer, not the two endpoints.** Writing the range as $\{1, 7\}$ claims the function only ever outputs those two numbers, when in truth it produces every value in between. The endpoints are the fence; the range is the whole field.

---

##### Included or Excluded: The Boundary

When a graph stops, it either includes its final point or it does not.

- A **filled** dot, or a described endpoint that is "included," means that value belongs. Use $\le$.
- An **open** dot, or an endpoint that is "excluded," means the graph approaches it without reaching it. Use $<$.

A segment from $(1,3)$ to $(5,11)$ with the left endpoint included and the right excluded has domain $1 \le x < 5$.

One symbol, and it is worth the second it takes to check. The value $5$ either is or is not a legal input, and $\le$ and $<$ say opposite things about it.

---

##### Computing a Range: You Have to Actually Apply the Rule

This is where most real points are lost.

When a problem gives you a **rule** and a **domain**, the range is not sitting there waiting to be read. You have to put each input through the rule.

**Example 3:** $f(x) = 2x + 1$ with domain $\{0, 1, 2, 3\}$. Find the range.

Step 1: Substitute each input.
- $f(0) = 1$
- $f(1) = 3$
- $f(2) = 5$
- $f(3) = 7$

Step 2: Collect the outputs into a set.
- Range: $\{1, 3, 5, 7\}$

The tempting shortcut is to glance at the domain, see it runs $0$ to $3$, and write the range as $\{0, 3\}$ or $\{0,1,2,3\}$. Both skip the only step that mattered. **The domain's numbers tell you nothing about the range until the rule has touched them.**

**Example 4:** $f(x) = x^2$ with domain $\{-2, -1, 0, 1, 2\}$. Find the range.

Step 1: Substitute.
- $f(-2) = 4$, $f(-1) = 1$, $f(0) = 0$, $f(1) = 1$, $f(2) = 4$

Step 2: The outputs are $4, 1, 0, 1, 4$. Collect them as a set, each value once.
- Range: $\{0, 1, 4\}$

Five inputs, three outputs. That is completely normal. The range can be smaller than the domain, and here it is, because squaring sends $-2$ and $2$ to the same place.

---

##### A Value Being an Output Says Nothing About the Domain

A quiet trap, and a favourite of test writers.

A function has domain $\{1, 2, 3\}$ and produces the output $4$ somewhere. Is $4$ in the domain?

**No.** The domain is $\{1, 2, 3\}$, and $4$ is not among them. The number $4$ shows up in this function's life as an **output**, which is a completely different job.

Domain membership is about which values you are allowed to feed in. A number appearing on the output side has not been granted entry on the input side. They are two separate lists that happen to be written in the same numerals.

---

##### Pieces and Jumps

A graph in two separate pieces has a range in two separate pieces, and joining them up is a real error.

**Example 5:** For $0 \le x < 3$ a graph's output rises from $1$ up to just under $4$. For $3 \le x \le 5$ its output runs from $6$ to $8$.

Step 1: The first piece contributes outputs from $1$ up to but not including $4$.
- $1 \le y < 4$

Step 2: The second piece contributes outputs from $6$ to $8$, both included.
- $6 \le y \le 8$

Step 3: The range is both pieces together.
- $1 \le y < 4$ together with $6 \le y \le 8$

**Nothing between $4$ and $6$ is ever produced.** Writing the range as $1 \le y \le 8$ claims the function outputs $5$, and it never does. Look for the gap and preserve it.

Note the boundaries too. The first piece stops short of $4$, so the strict $<$ stays strict. Rounding that up to $\le$ smuggles in a value the graph does not reach.

---

##### Shifting

If a graph slides sideways, the **domain** moves. If it slides up or down, the **range** moves.

A function with domain $2 \le x \le 6$, shifted $3$ units to the **right**, has domain $5 \le x \le 9$. Every allowed input moved three to the right, so add $3$ to both bounds.

The horizontal move touches the domain and leaves the range alone. Applying a sideways shift to the range instead is a clean way to lose a point on a question you understood.

---

##### The Four Traps

1. **Swapping the two.** D before R, x before y. Check it every single time.
2. **Repeating values in a set.** List each distinct value once. And a repeated output never removes an input.
3. **Reporting endpoints instead of the interval.** The range of a segment is everything between the extremes, not just the extremes.
4. **Reading the range off the domain.** Given a rule, substitute. The range must be computed.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. What is the domain of the relation $\{(1,5),(2,7),(3,9),(2,4)\}$?
   - A) $\{5, 7, 9, 4\}$
   - B) $\{1, 2, 3\}$
   - C) $\{1, 2, 3, 2\}$
   - D) $\{1, 2, 3, 4, 5, 7, 9\}$

2. What is the range of the relation $\{(0,4),(1,6),(2,4),(3,8)\}$?
   - A) $\{4, 6, 8\}$
   - B) $\{0, 1, 2, 3\}$
   - C) $\{4, 6, 4, 8\}$
   - D) $\{4, 8\}$

3. A graph is a line segment running from $(-2, 1)$ to $(4, 7)$, with both endpoints included. What is the domain?
   - A) $1 \le y \le 7$
   - B) $-2 \le x \le 4$
   - C) $\{-2, 4\}$
   - D) $-2 < x < 4$

4. For that same line segment from $(-2, 1)$ to $(4, 7)$ with both endpoints included, what is the range?
   - A) $-2 \le y \le 4$
   - B) $-2 \le x \le 4$
   - C) $\{1, 7\}$
   - D) $1 \le y \le 7$

**Proficient Level** (these require an extra step)

5. The function $f(x) = 2x + 1$ has domain $\{0, 1, 2, 3\}$. What is its range?
   - A) $\{0, 3\}$
   - B) $\{0, 1, 2, 3\}$
   - C) $\{1, 7\}$
   - D) $\{1, 3, 5, 7\}$

6. The function $f(x) = x^2$ has domain $\{-2, -1, 0, 1, 2\}$. What is its range?
   - A) $\{-2, -1, 0, 1, 2\}$
   - B) $\{4, 1, 0, 1, 4\}$
   - C) $\{0, 1, 4\}$
   - D) $\{0, 4\}$

7. The function $f(x) = x^2$ has domain $\{-2, -1, 0, 1, 2\}$. A student argues that the domain should be shortened to $\{-2, -1, 0\}$ because the inputs $1$ and $2$ produce outputs that have already appeared. What is the correct domain?
   - A) $\{-2, -1, 0\}$, because each output should be produced only once.
   - B) $\{-2, -1, 0, 1, 2\}$, because a repeated output never removes an input.
   - C) $\{0, 1, 4\}$, because those are the values the function actually produces.
   - D) $\{-2, 2\}$, because only the extreme inputs need to be listed.

**Advanced Level** (these need multiple steps or reverse thinking)

8. A graph has two pieces. For $0 \le x < 3$ its output rises from $1$ up to but not including $4$. For $3 \le x \le 5$ its output runs from $6$ to $8$, both included. What is the range?
   - A) $1 \le y \le 4$ together with $6 \le y \le 8$
   - B) $1 \le y \le 8$
   - C) $0 \le x \le 5$
   - D) $1 \le y < 4$ together with $6 \le y \le 8$

9. A function has domain $2 \le x \le 6$. Its graph is then shifted $3$ units to the right. What is the domain of the shifted function?
   - A) $5 \le x \le 9$
   - B) $2 \le x \le 6$
   - C) $-1 \le x \le 3$
   - D) $5 \le y \le 9$

10. A function has domain $\{1, 2, 3\}$, and the value $4$ appears among its outputs. A student concludes that $4$ must therefore belong to the domain. Is the student correct?
    - A) Yes, because the domain and range of a function always contain the same values.
    - B) Yes, because $4$ appears somewhere among the function's pairs.
    - C) No, because appearing as an output says nothing about belonging to the input set.
    - D) No, because the domain must be written without repeating any value.

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

What is the domain of the relation $\{(4,1),(5,3),(6,3)\}$?

- A) $\{1, 3\}$
- B) $\{4, 5, 6\}$
- C) $\{4, 5, 6, 1, 3\}$
- D) $\{4, 6\}$

**Item 2**

What is the range of the relation $\{(1,2),(2,5),(3,2),(4,7)\}$?

- A) $\{2, 5, 2, 7\}$
- B) $\{1, 2, 3, 4\}$
- C) $\{2, 5, 7\}$
- D) $\{2, 7\}$

**Proficient Level**

**Item 3**

The function $f(x) = 3x - 2$ has domain $\{1, 2, 3\}$. What is its range?

- A) $\{1, 3\}$
- B) $\{1, 2, 3\}$
- C) $\{1, 7\}$
- D) $\{1, 4, 7\}$

**Item 4**

A graph is a line segment running from $(1, 3)$ to $(5, 11)$, with the left endpoint included and the right endpoint excluded. What is the domain?

- A) $1 \le x < 5$
- B) $1 \le x \le 5$
- C) $3 \le y < 11$
- D) $\{1, 5\}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What is the domain of the relation $\{(1,5),(2,7),(3,9),(2,4)\}$?**

Step 1: The domain is the set of first coordinates.
- $1, 2, 3, 2$

Step 2: Write them as a set, each distinct value once.
- $\{1, 2, 3\}$

**Answer: B** ($\{1, 2, 3\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: domain_range_swap (collects the second coordinates, which are the outputs and therefore the range)",
  "B": "Correct: collects the first coordinates and lists each distinct value once",
  "C": "Student makes misconception: set_listed_as_multiset (copies the first coordinates verbatim, repeating the 2 that appears in two pairs, when a set lists each element once)",
  "D": "Student makes misconception: output_value_assumed_in_domain (pools every number appearing anywhere in the pairs into the domain, treating output values as inputs)"
},
"misconception_tag": {
  "A": "domain_range_swap",
  "C": "set_listed_as_multiset",
  "D": "output_value_assumed_in_domain"
}
```

---

**2. What is the range of the relation $\{(0,4),(1,6),(2,4),(3,8)\}$?**

Step 1: The range is the set of second coordinates.
- $4, 6, 4, 8$

Step 2: Write them as a set, each distinct value once.
- $\{4, 6, 8\}$

**Answer: A** ($\{4, 6, 8\}$)

```json
"distractor_logic": {
  "A": "Correct: collects the second coordinates and lists the repeated 4 only once",
  "B": "Student makes misconception: domain_range_swap (collects the first coordinates, which are the inputs and therefore the domain)",
  "C": "Student makes misconception: set_listed_as_multiset (copies the second coordinates verbatim, repeating the 4 that two pairs produce)",
  "D": "Student makes misconception: range_as_endpoints_only (reports the smallest and largest outputs and omits the 6 that lies between them)"
},
"misconception_tag": {
  "B": "domain_range_swap",
  "C": "set_listed_as_multiset",
  "D": "range_as_endpoints_only"
}
```

---

**3. A graph is a line segment running from $(-2, 1)$ to $(4, 7)$, with both endpoints included. What is the domain?**

Step 1: The domain is how far the graph reaches left to right, so read the $x$ coordinates.
- Leftmost $x$ is $-2$, rightmost is $4$

Step 2: Both endpoints are included, so use $\le$ at both ends.
- $-2 \le x \le 4$

**Answer: B** ($-2 \le x \le 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: domain_range_swap (reads the vertical extent from the y coordinates, which gives the range)",
  "B": "Correct: reads the horizontal extent from the x coordinates and closes both ends because both endpoints are included",
  "C": "Student makes misconception: range_as_endpoints_only (lists the two extreme x values instead of the continuous interval between them, claiming the segment has only two legal inputs)",
  "D": "Student makes misconception: piecewise_boundary_openness_error (uses strict inequalities at both ends, excluding endpoints the problem states are included)"
},
"misconception_tag": {
  "A": "domain_range_swap",
  "C": "range_as_endpoints_only",
  "D": "piecewise_boundary_openness_error"
}
```

---

**4. For that same line segment from $(-2, 1)$ to $(4, 7)$ with both endpoints included, what is the range?**

Step 1: The range is how far the graph reaches bottom to top, so read the $y$ coordinates.
- Lowest $y$ is $1$, highest is $7$

Step 2: Both endpoints are included.
- $1 \le y \le 7$

**Answer: D** ($1 \le y \le 7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_read_from_domain_endpoints (labels the answer as y but takes the bounds from the x coordinates of the endpoints)",
  "B": "Student makes misconception: domain_range_swap (reports the horizontal extent, which is the domain)",
  "C": "Student makes misconception: range_as_endpoints_only (lists the two extreme outputs instead of the interval between them, when the segment produces every value from 1 to 7)",
  "D": "Correct: reads the vertical extent from the y coordinates and closes both ends"
},
"misconception_tag": {
  "A": "range_read_from_domain_endpoints",
  "B": "domain_range_swap",
  "C": "range_as_endpoints_only"
}
```

---

**Proficient Level**

**5. The function $f(x) = 2x + 1$ has domain $\{0, 1, 2, 3\}$. What is its range?**

Step 1: Substitute each input into the rule.
- $f(0) = 2(0) + 1 = 1$
- $f(1) = 2(1) + 1 = 3$
- $f(2) = 2(2) + 1 = 5$
- $f(3) = 2(3) + 1 = 7$

Step 2: Collect the outputs.
- $\{1, 3, 5, 7\}$

**Answer: D** ($\{1, 3, 5, 7\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_read_from_domain_endpoints (reads the first and last values of the domain and reports them as the range without substituting either)",
  "B": "Student makes misconception: domain_range_swap (reports the given domain as the range, never applying the rule to it)",
  "C": "Student makes misconception: range_as_endpoints_only (computes the smallest and largest outputs and omits the 3 and 5 produced in between)",
  "D": "Correct: substitutes all four inputs into the rule and collects the outputs"
},
"misconception_tag": {
  "A": "range_read_from_domain_endpoints",
  "B": "domain_range_swap",
  "C": "range_as_endpoints_only"
}
```

---

**6. The function $f(x) = x^2$ has domain $\{-2, -1, 0, 1, 2\}$. What is its range?**

Step 1: Substitute each input.
- $f(-2) = 4$, $f(-1) = 1$, $f(0) = 0$, $f(1) = 1$, $f(2) = 4$

Step 2: The outputs are $4, 1, 0, 1, 4$. Collect them as a set, each value once.
- $\{0, 1, 4\}$

Step 3: Five inputs give three outputs, which is fine. Squaring sends $-2$ and $2$ to the same place.

**Answer: C** ($\{0, 1, 4\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: domain_range_swap (reports the given domain as the range without applying the squaring rule)",
  "B": "Student makes misconception: set_listed_as_multiset (lists all five outputs including the duplicated 1 and 4, when a set names each value once)",
  "C": "Correct: substitutes every input and lists the three distinct outputs once each",
  "D": "Student makes misconception: range_as_endpoints_only (reports the smallest and largest outputs and drops the 1 that lies between them)"
},
"misconception_tag": {
  "A": "domain_range_swap",
  "B": "set_listed_as_multiset",
  "D": "range_as_endpoints_only"
}
```

---

**7. A student argues the domain of $f(x) = x^2$ should be shortened because inputs $1$ and $2$ produce outputs that already appeared. What is the correct domain?**

Step 1: The domain is the set of values the function is allowed to take in. It was given as $\{-2, -1, 0, 1, 2\}$.

Step 2: The inputs $1$ and $2$ are legal inputs and the function produces a value for each. Nothing about them is invalid.

Step 3: Their outputs duplicating $1$ and $4$ affects only how the **range** is written, where each value is listed once. It does not remove anything from the domain.

**Answer: B** (the domain is unchanged)

```json
"distractor_logic": {
  "A": "Student makes misconception: repeated_output_excludes_input (removes inputs whose outputs duplicate ones already produced, treating a repeated output as disqualifying the input)",
  "B": "Correct: the domain keeps every legal input, and duplication among outputs affects only how the range set is written",
  "C": "Student makes misconception: domain_range_swap (reports the set of outputs when asked for the set of inputs)",
  "D": "Student makes misconception: range_as_endpoints_only (keeps only the extreme values of the set instead of every element it contains)"
},
"misconception_tag": {
  "A": "repeated_output_excludes_input",
  "C": "domain_range_swap",
  "D": "range_as_endpoints_only"
}
```

---

**Advanced Level**

**8. A graph has two pieces. For $0 \le x < 3$ its output rises from $1$ up to but not including $4$. For $3 \le x \le 5$ its output runs from $6$ to $8$. What is the range?**

Step 1: The first piece contributes outputs from $1$ up to but not including $4$.
- $1 \le y < 4$

Step 2: The second piece contributes outputs from $6$ to $8$, both included.
- $6 \le y \le 8$

Step 3: The range is both pieces together, and the gap between them stays open.
- $1 \le y < 4$ together with $6 \le y \le 8$

Step 4: Check. Is $5$ ever produced? The first piece stops below $4$ and the second starts at $6$, so no. The gap is real.

**Answer: D** ($1 \le y < 4$ together with $6 \le y \le 8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: piecewise_boundary_openness_error (keeps the two pieces separate but closes the boundary at 4, including a value the first piece only approaches)",
  "B": "Student makes misconception: jump_discontinuity_ignored (joins the two pieces into one interval, claiming outputs such as 5 that the graph never produces)",
  "C": "Student makes misconception: domain_range_swap (reports the horizontal extent of the graph, which is the domain)",
  "D": "Correct: keeps both pieces separate and preserves the strict boundary at 4, so no value between 4 and 6 is claimed"
},
"misconception_tag": {
  "A": "piecewise_boundary_openness_error",
  "B": "jump_discontinuity_ignored",
  "C": "domain_range_swap"
}
```

---

**9. A function has domain $2 \le x \le 6$. Its graph is shifted $3$ units to the right. What is the domain of the shifted function?**

Step 1: A sideways shift moves the inputs, so it is the domain that changes.

Step 2: Shifting right means every allowed input increases by $3$. Add $3$ to both bounds.
- $2 + 3 = 5$
- $6 + 3 = 9$

Step 3: The new domain is $5 \le x \le 9$.

Step 4: Check the width. The original interval was $4$ wide and the new one runs $5$ to $9$, also $4$ wide. A shift moves an interval without stretching it.

**Answer: A** ($5 \le x \le 9$)

```json
"distractor_logic": {
  "A": "Correct: adds 3 to both bounds because a rightward shift raises every allowed input by 3",
  "B": "Student makes misconception: shift_applied_to_wrong_axis (applies the horizontal shift to the range and leaves the domain untouched, when a sideways move is exactly what changes the inputs)",
  "C": "Student makes misconception: misreads_direction_of_change (subtracts 3 from both bounds, shifting the interval left when the problem shifts it right)",
  "D": "Student makes misconception: domain_range_swap (computes the shifted bounds correctly but labels them as a range in y when the question asks for the domain)"
},
"misconception_tag": {
  "B": "shift_applied_to_wrong_axis",
  "C": "misreads_direction_of_change",
  "D": "domain_range_swap"
}
```

---

**10. A function has domain $\{1, 2, 3\}$, and the value $4$ appears among its outputs. Is $4$ in the domain?**

Step 1: The domain was stated: $\{1, 2, 3\}$. The value $4$ is not one of those.

Step 2: The value $4$ appears in this function as an **output**, which is a different role entirely.

Step 3: Domain membership is about which values may be fed in. Producing a number does not grant that number entry on the input side.

**Answer: C** (no)

```json
"distractor_logic": {
  "A": "Student makes misconception: domain_range_swap (asserts the two sets always coincide, which erases the distinction between inputs and outputs)",
  "B": "Student makes misconception: output_value_assumed_in_domain (treats a value as belonging to the domain because it appears somewhere among the pairs, conflating a shared numeral with membership in the input set)",
  "C": "Correct: the domain is the stated input set, and appearing on the output side is a separate role that confers no membership",
  "D": "Student makes misconception: set_listed_as_multiset (reaches the right verdict from an irrelevant rule about repetition rather than from what the domain is)"
},
"misconception_tag": {
  "A": "domain_range_swap",
  "B": "output_value_assumed_in_domain",
  "D": "set_listed_as_multiset"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: What is the domain of the relation $\{(4,1),(5,3),(6,3)\}$?**

Step 1: The domain is the first coordinates.
- $4, 5, 6$

Step 2: All three are distinct, so the set is $\{4, 5, 6\}$.

**Answer: B** ($\{4, 5, 6\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: domain_range_swap (collects the second coordinates, which are the outputs and therefore the range)",
  "B": "Correct: collects the first coordinates, which are the inputs",
  "C": "Student makes misconception: output_value_assumed_in_domain (pools every number appearing in the pairs into the domain, treating output values as inputs)",
  "D": "Student makes misconception: range_as_endpoints_only (reports the smallest and largest inputs and omits the 5 between them)"
},
"misconception_tag": {
  "A": "domain_range_swap",
  "C": "output_value_assumed_in_domain",
  "D": "range_as_endpoints_only"
}
```

---

**Item 2: What is the range of the relation $\{(1,2),(2,5),(3,2),(4,7)\}$?**

Step 1: The range is the second coordinates.
- $2, 5, 2, 7$

Step 2: List each distinct value once.
- $\{2, 5, 7\}$

**Answer: C** ($\{2, 5, 7\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: set_listed_as_multiset (copies the second coordinates verbatim, repeating the 2 that two pairs produce)",
  "B": "Student makes misconception: domain_range_swap (collects the first coordinates, which give the domain)",
  "C": "Correct: collects the second coordinates and lists the repeated 2 only once",
  "D": "Student makes misconception: range_as_endpoints_only (reports the smallest and largest outputs and omits the 5 between them)"
},
"misconception_tag": {
  "A": "set_listed_as_multiset",
  "B": "domain_range_swap",
  "D": "range_as_endpoints_only"
}
```

---

**Item 3: The function $f(x) = 3x - 2$ has domain $\{1, 2, 3\}$. What is its range?**

Step 1: Substitute each input.
- $f(1) = 3(1) - 2 = 1$
- $f(2) = 3(2) - 2 = 4$
- $f(3) = 3(3) - 2 = 7$

Step 2: Collect the outputs.
- $\{1, 4, 7\}$

**Answer: D** ($\{1, 4, 7\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_read_from_domain_endpoints (reads the first and last values of the domain and reports them as the range without substituting either)",
  "B": "Student makes misconception: domain_range_swap (reports the given domain as the range, never applying the rule)",
  "C": "Student makes misconception: range_as_endpoints_only (computes the smallest and largest outputs and omits the 4 produced between them)",
  "D": "Correct: substitutes all three inputs into the rule and collects the outputs"
},
"misconception_tag": {
  "A": "range_read_from_domain_endpoints",
  "B": "domain_range_swap",
  "C": "range_as_endpoints_only"
}
```

---

**Item 4: A graph is a line segment from $(1, 3)$ to $(5, 11)$, with the left endpoint included and the right endpoint excluded. What is the domain?**

Step 1: The domain is the horizontal extent, from $x = 1$ to $x = 5$.

Step 2: The left endpoint is included, so use $\le$ there. The right is excluded, so use $<$.
- $1 \le x < 5$

**Answer: A** ($1 \le x < 5$)

```json
"distractor_logic": {
  "A": "Correct: reads the horizontal extent and matches each inequality symbol to whether that endpoint is included",
  "B": "Student makes misconception: piecewise_boundary_openness_error (closes the right boundary, admitting an input of 5 that the segment never reaches)",
  "C": "Student makes misconception: domain_range_swap (reads the vertical extent from the y coordinates, which gives the range)",
  "D": "Student makes misconception: range_as_endpoints_only (lists the two extreme x values instead of the continuous interval between them)"
},
"misconception_tag": {
  "B": "piecewise_boundary_openness_error",
  "C": "domain_range_swap",
  "D": "range_as_endpoints_only"
}
```
