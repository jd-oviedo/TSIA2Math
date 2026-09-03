---
topic_name: "Set notation foundations (union, intersection, complement)"
unit_number: 5
sequence_in_unit: 13
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "PR"
keywords: ["set notation", "union", "intersection", "complement", "universal set", "inclusion-exclusion", "Venn diagram"]
---

# PR.3.5 - Set Notation Foundations (Union, Intersection, Complement)

**Topic ID:** PR.3.5  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Distinguish union, $\cup$, from intersection, $\cap$, and apply the correct symbol to a counting problem.
- Calculate the size of a union using $n(A) + n(B) - n(A \cap B)$, subtracting the overlap exactly once.
- Calculate "neither" as the complement of a union, and extend the union formula to three overlapping sets.

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

You have been counting overlapping groups since the first survey problem you ever saw. This topic gives that counting a notation, and the notation is worth having because it makes the overlap impossible to forget.

Two questions, in this order:

1. **Which symbol am I looking at, and does it mean "or" or "and"?** $\cup$ and $\cap$ look alike and mean opposite things.
2. **Is anything being counted twice?** Anything in both sets gets counted once by each set, so it lands in the total twice unless you take it out.

**The confusion this topic exists to prevent is adding two group sizes and calling it the union.** That answer is always too big, by exactly the size of the overlap, and it is the most common wrong answer in every problem below.

---

##### The Three Symbols

| Notation | Read it as | Means |
|---|---|---|
| $A \cup B$ | A **union** B | in $A$, or in $B$, or in both |
| $A \cap B$ | A **intersection** B | in $A$ **and** in $B$ |
| $A'$ | A **complement** | everything in the universal set that is **not** in $A$ |

A memory hook worth having: $\cup$ opens upward like a cup that holds everything, and $\cap$ is the narrow bit where two things overlap. **Union is the bigger one.** If your union is smaller than one of the sets, you have read the wrong symbol.

Two more pieces of notation appear in the problems below:

- $x \in A$ means $x$ is an **element of** $A$, and $x \notin A$ means it is not.
- $n(A)$ means **the number of elements in** $A$. It is a count, not a set.

Sets themselves are written in two ways. **Roster form** lists the members, as in $A = \{1, 2, 3, 4, 5\}$. **Set-builder form** states a rule, as in $\{x \mid x > 3\}$, where the bar is read "such that".

---

##### Counting a Union

**Example 1:** $A = \{1, 2, 3, 4, 5\}$ and $B = \{4, 5, 6, 7\}$. Find $n(A \cup B)$.

Step 1: List the union. Everything in either set, each element once.
- $\{1, 2, 3, 4, 5, 6, 7\}$, so $n(A \cup B) = 7$

Step 2: Check against the counts. $n(A) = 5$ and $n(B) = 4$, which add to $9$.

Step 3: Find the overlap. $A \cap B = \{4, 5\}$, so $n(A \cap B) = 2$.

And $9 - 2 = 7$, which matches. That relationship is the formula:

$$n(A \cup B) = n(A) + n(B) - n(A \cap B)$$

**The elements $4$ and $5$ were counted twice**, once as members of $A$ and once as members of $B$. Subtracting the overlap once puts each of them back to a single count.

---

##### When You Cannot List the Elements

Most problems give counts rather than members, and then the formula is the only route.

**Example 2:** In a group, $18$ people play a sport, $14$ play an instrument, and $8$ do both. How many play a sport or an instrument?

Step 1: Add the two group sizes.
- $18 + 14 = 32$

Step 2: Subtract the overlap once.
- $32 - 8 = 24$

The $8$ people who do both were counted in the $18$ **and** in the $14$. They are $8$ people, not $16$, so one of those counts has to go.

The two ways to get Step 2 wrong are worth seeing side by side:

- **Not subtracting at all** leaves $32$, which counts the eight twice.
- **Subtracting twice** gives $18 + 14 - 16 = 16$, which removes them entirely and forgets they belong in the answer at all.

**Subtract the overlap exactly once.** They are in the union; they are just not in it twice.

---

##### The Complement, and "Neither"

The **universal set** $U$ is everything under discussion. The complement $A'$ is everything in $U$ that is not in $A$, so

$$n(A') = n(U) - n(A)$$

The word **neither** is a complement of a union, and that is the sentence worth memorising.

**Example 3:** In a group of $35$ people, $18$ play a sport, $14$ play an instrument, and $8$ do both. How many play neither?

Step 1: Find the union first. From Example 2, $n(S \cup I) = 24$.

Step 2: Subtract from the universal set.
- $35 - 24 = 11$

Step 1 cannot be skipped. Going straight to $35 - (18 + 14) = 3$ subtracts the eight twice, once inside each group, and produces a number too small. **"Neither" needs the union, and the union needs the overlap removed.**

Notice also that $8$ is on the page and is not the answer. It is the count of people who do **both**, which is the opposite question.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Say the symbol out loud as a word before you compute.**

$\cup$ and $\cap$ differ by which way a small curve points, and you will read them at speed under time pressure. Every problem in this topic offers you both answers: the union and the intersection are always both computable from the same three numbers, so both will be sitting in the options.

In Example 2, $24$ and $8$ are both correct answers to questions about that group. Only one of them was asked.

**The defence is verbal, not visual.** Do not look harder at the symbol. Say "union, meaning or" or "intersection, meaning and", then write the word next to your work. If the word is "or", your answer must be larger than either group. If the word is "and", it must be smaller than both.

That size check catches the swap every time, and it costs four seconds.

---

##### Three Sets

With three sets, every pair overlaps and the middle overlaps all three. The formula extends:

$$n(A \cup B \cup C) = n(A) + n(B) + n(C) - n(A \cap B) - n(A \cap C) - n(B \cap C) + n(A \cap B \cap C)$$

**Example 4:** $n(A) = 20$, $n(B) = 18$, $n(C) = 15$, the pairwise overlaps are $8$, $7$, and $6$, and $3$ elements are in all three. Find $n(A \cup B \cup C)$.

Step 1: Add the three sets.
- $20 + 18 + 15 = 53$

Step 2: Subtract the three pairwise overlaps.
- $53 - 8 - 7 - 6 = 32$

Step 3: Add the triple overlap back.
- $32 + 3 = 35$

Step 3 looks like a correction to a correction, and it is. Those $3$ elements were counted three times in Step 1, then removed three times in Step 2, once by each pair. That leaves them at zero, and they do belong in the union, so they come back once.

**Stopping at Step 2 gives $32$**, which is the answer that omits the very elements sitting in the middle of the diagram.

---

##### Working Backward

**Example 5:** In a class of $40$, $25$ study French, $18$ study German, and $7$ study neither. How many study both?

Step 1: If $7$ study neither, the union has everyone else.
- $40 - 7 = 33$

Step 2: Put that into the formula and solve for the overlap.
- $33 = 25 + 18 - n(\text{both})$
- $n(\text{both}) = 43 - 33 = 10$

Step 1 is what gets skipped. Going straight to $25 + 18 - 40 = 3$ uses the whole class as the union, which is only correct when nobody is outside both groups. Here seven people are. **The union is the class minus the ones in neither.**

---

##### The Five Traps

1. **Adding without subtracting the overlap.** The union is always smaller than the sum of the parts unless the overlap is zero.
2. **Subtracting the overlap twice.** It comes out once, not once per set.
3. **Swapping union and intersection.** Say the symbol as a word, then check the size of your answer against it.
4. **Forgetting to add the triple overlap back.** With three sets, the middle is removed three times and has to return once.
5. **Reporting the union when the question said "neither".** Neither is the complement of the union, so subtract from the universal set at the end.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. $A = \{1, 2, 3, 4, 5\}$ and $B = \{4, 5, 6, 7\}$. What is $n(A \cup B)$?
   - A) $7$
   - B) $9$
   - C) $2$
   - D) $5$

2. In a group, $18$ people play a sport, $14$ play an instrument, and $8$ do both. How many play a sport or an instrument?
   - A) $32$
   - B) $16$
   - C) $24$
   - D) $8$

3. In a group of $35$ people, $18$ play a sport, $14$ play an instrument, and $8$ do both. How many play neither?
   - A) $8$
   - B) $11$
   - C) $24$
   - D) $3$

4. The universal set is $U = \{1, 2, 3, \ldots, 20\}$. Set $A$ contains the even numbers in $U$, and set $B$ contains the multiples of $5$ in $U$. What is $n((A \cup B)')$?
   - A) $12$
   - B) $6$
   - C) $2$
   - D) $8$

**Proficient Level** (these require an extra step)

5. Three sets satisfy $n(A) = 20$, $n(B) = 18$, $n(C) = 15$, $n(A \cap B) = 8$, $n(A \cap C) = 7$, $n(B \cap C) = 6$, and $n(A \cap B \cap C) = 3$. What is $n(A \cup B \cup C)$?
   - A) $32$
   - B) $35$
   - C) $53$
   - D) $14$

6. Two sets satisfy $n(A) = 24$, $n(B) = 16$, and $n(A \cup B) = 32$. They sit inside a universal set with $n(U) = 50$. What is $n(A \cap B)$?
   - A) $8$
   - B) $32$
   - C) $40$
   - D) $18$

7. The universal set is $U = \{1, 2, 3, \ldots, 24\}$. Let $A = \{x \mid x \text{ is a multiple of } 4\}$ and $B = \{x \mid x \text{ is a multiple of } 6\}$, both within $U$. What is $n(A' \cap B')$?
   - A) $8$
   - B) $14$
   - C) $16$
   - D) $2$

**Advanced Level** (these need multiple steps or reverse thinking)

8. In a class of $40$ students, $25$ study French, $18$ study German, and $7$ study neither language. How many study both?
   - A) $3$
   - B) $10$
   - C) $7$
   - D) $33$

9. Within a universal set of $60$ people, $n(A) = 22$, $n(B) = 20$, $n(C) = 16$, $n(A \cap B) = 10$, $n(A \cap C) = 8$, $n(B \cap C) = 6$, and $n(A \cap B \cap C) = 4$. How many people are in none of the three sets?
   - A) $38$
   - B) $26$
   - C) $2$
   - D) $22$

10. Within a universal set of $50$ elements, $n(A) = 28$, $n(B) = 20$, and $n(A \cap B) = 12$. What is $n((A \cap B)')$?
    - A) $12$
    - B) $14$
    - C) $38$
    - D) $36$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Two sets satisfy $n(A) = 15$, $n(B) = 12$, and $n(A \cap B) = 5$. What is $n(A \cup B)$?

- A) $27$
- B) $22$
- C) $17$
- D) $5$

**Proficient Level**

**Item 2**

The sets from Item 1 sit inside a universal set with $n(U) = 40$. How many elements are in neither set?

- A) $22$
- B) $5$
- C) $13$
- D) $18$

**Item 3**

Three sets satisfy $n(A) = 25$, $n(B) = 20$, $n(C) = 18$, $n(A \cap B) = 9$, $n(A \cap C) = 8$, $n(B \cap C) = 7$, and $n(A \cap B \cap C) = 4$. What is $n(A \cup B \cup C)$?

- A) $43$
- B) $39$
- C) $63$
- D) $19$

**Advanced Level**

**Item 4**

In a group of $36$ people, $22$ like tea, $18$ like coffee, and $5$ like neither. How many like both?

- A) $31$
- B) $4$
- C) $9$
- D) $5$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. $A = \{1, 2, 3, 4, 5\}$ and $B = \{4, 5, 6, 7\}$. What is $n(A \cup B)$?**

Step 1: $n(A) = 5$ and $n(B) = 4$.

Step 2: The overlap is $A \cap B = \{4, 5\}$, so $n(A \cap B) = 2$.

Step 3: Apply the formula.
- $5 + 4 - 2 = 7$

Check by listing: $\{1, 2, 3, 4, 5, 6, 7\}$ has $7$ elements.

**Answer: A** ($7$)

```json
"distractor_logic": {
  "A": "Correct: 5 + 4 - 2 = 7, confirmed by listing the union as 1 through 7",
  "B": "Student makes misconception: overlap_not_subtracted (adds the two counts, computing 5 + 4 = 9, which counts the elements 4 and 5 twice)",
  "C": "Student makes misconception: union_intersection_swapped (reports the size of the intersection, which is 2, having read the union symbol as intersection)",
  "D": "Student makes misconception: overlap_subtracted_twice (removes the overlap once for each set, computing 5 + 4 - 2 - 2 = 5, which drops 4 and 5 from the union entirely)"
},
"misconception_tag": {
  "B": "overlap_not_subtracted",
  "C": "union_intersection_swapped",
  "D": "overlap_subtracted_twice"
}
```

---

**2. In a group, $18$ people play a sport, $14$ play an instrument, and $8$ do both. How many play a sport or an instrument?**

Step 1: Add the groups.
- $18 + 14 = 32$

Step 2: Subtract the overlap once.
- $32 - 8 = 24$

**Answer: C** ($24$)

```json
"distractor_logic": {
  "A": "Student makes misconception: overlap_not_subtracted (reports 18 + 14 = 32, counting the 8 people who do both once in each group)",
  "B": "Student makes misconception: overlap_subtracted_twice (removes the overlap once per group, computing 18 + 14 - 16 = 16, which leaves those 8 people out of the union altogether)",
  "C": "Correct: 18 + 14 - 8 = 24",
  "D": "Student makes misconception: union_intersection_swapped (reports the 8 who do both, answering the intersection question rather than the union one)"
},
"misconception_tag": {
  "A": "overlap_not_subtracted",
  "B": "overlap_subtracted_twice",
  "D": "union_intersection_swapped"
}
```

---

**3. In a group of $35$ people, $18$ play a sport, $14$ play an instrument, and $8$ do both. How many play neither?**

Step 1: Find the union.
- $18 + 14 - 8 = 24$

Step 2: "Neither" is the complement of the union, so subtract from the group.
- $35 - 24 = 11$

**Answer: B** ($11$)

```json
"distractor_logic": {
  "A": "Student makes misconception: neither_reported_as_both (reports the 8 who do both, which is the opposite of the group being asked about)",
  "B": "Correct: the union is 18 + 14 - 8 = 24, so neither is 35 - 24 = 11",
  "C": "Student makes misconception: reports_event_not_complement (computes the union correctly as 24 and reports it without subtracting from the group of 35)",
  "D": "Student makes misconception: overlap_not_subtracted (subtracts both group sizes from the total without restoring the overlap, computing 35 - 32 = 3)"
},
"misconception_tag": {
  "A": "neither_reported_as_both",
  "C": "reports_event_not_complement",
  "D": "overlap_not_subtracted"
}
```

---

**4. The universal set is $U = \{1, 2, 3, \ldots, 20\}$. Set $A$ contains the even numbers in $U$, and set $B$ contains the multiples of $5$ in $U$. What is $n((A \cup B)')$?**

Step 1: Count each set. The evens are $2, 4, \ldots, 20$, so $n(A) = 10$. The multiples of $5$ are $5, 10, 15, 20$, so $n(B) = 4$.

Step 2: The overlap is the multiples of $10$, which are $10$ and $20$, so $n(A \cap B) = 2$.

Step 3: The union.
- $10 + 4 - 2 = 12$

Step 4: The complement of the union.
- $20 - 12 = 8$

**Answer: D** ($8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the union correctly as 12 and reports it without taking the complement)",
  "B": "Student makes misconception: overlap_not_subtracted (uses 10 + 4 = 14 as the union, giving 20 - 14 = 6)",
  "C": "Student makes misconception: neither_reported_as_both (reports the 2 elements in both sets rather than the ones in neither)",
  "D": "Correct: the union is 10 + 4 - 2 = 12, so the complement is 20 - 12 = 8"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "overlap_not_subtracted",
  "C": "neither_reported_as_both"
}
```

---

**Proficient Level**

**5. Three sets satisfy $n(A) = 20$, $n(B) = 18$, $n(C) = 15$, $n(A \cap B) = 8$, $n(A \cap C) = 7$, $n(B \cap C) = 6$, and $n(A \cap B \cap C) = 3$. What is $n(A \cup B \cup C)$?**

Step 1: Add the three sets.
- $20 + 18 + 15 = 53$

Step 2: Subtract the three pairwise overlaps.
- $53 - 8 - 7 - 6 = 32$

Step 3: Add the triple overlap back.
- $32 + 3 = 35$

**Answer: B** ($35$)

```json
"distractor_logic": {
  "A": "Student makes misconception: triple_overlap_not_added_back (stops after subtracting the pairwise overlaps, reporting 32 and leaving out the 3 elements common to all three sets)",
  "B": "Correct: 53 - 8 - 7 - 6 + 3 = 35",
  "C": "Student makes misconception: overlap_not_subtracted (adds the three set sizes and stops, reporting 53)",
  "D": "Student makes misconception: overlap_subtracted_twice (removes each pairwise overlap twice, computing 53 - 16 - 14 - 12 + 3 = 14)"
},
"misconception_tag": {
  "A": "triple_overlap_not_added_back",
  "C": "overlap_not_subtracted",
  "D": "overlap_subtracted_twice"
}
```

---

**6. Two sets satisfy $n(A) = 24$, $n(B) = 16$, and $n(A \cup B) = 32$. They sit inside a universal set with $n(U) = 50$. What is $n(A \cap B)$?**

Step 1: Write the formula with the unknown in it.
- $32 = 24 + 16 - n(A \cap B)$

Step 2: Solve.
- $n(A \cap B) = 40 - 32 = 8$

**Answer: A** ($8$)

```json
"distractor_logic": {
  "A": "Correct: 24 + 16 - 32 = 8",
  "B": "Student makes misconception: union_intersection_swapped (reports the given union of 32 as though it were the intersection)",
  "C": "Student makes misconception: overlap_not_subtracted (adds the two sets and reports 24 + 16 = 40, never using the given union)",
  "D": "Student makes misconception: complement_misidentified (takes the complement of the union rather than solving for the intersection, computing 50 - 32 = 18)"
},
"misconception_tag": {
  "B": "union_intersection_swapped",
  "C": "overlap_not_subtracted",
  "D": "complement_misidentified"
}
```

---

**7. The universal set is $U = \{1, 2, 3, \ldots, 24\}$. Let $A = \{x \mid x \text{ is a multiple of } 4\}$ and $B = \{x \mid x \text{ is a multiple of } 6\}$, both within $U$. What is $n(A' \cap B')$?**

Step 1: Count the sets. Multiples of $4$ up to $24$ are $4, 8, 12, 16, 20, 24$, so $n(A) = 6$. Multiples of $6$ are $6, 12, 18, 24$, so $n(B) = 4$.

Step 2: The overlap is the multiples of $12$, which are $12$ and $24$, so $n(A \cap B) = 2$.

Step 3: The union.
- $6 + 4 - 2 = 8$

Step 4: Being in neither set is the complement of the union.
- $24 - 8 = 16$

**Answer: C** ($16$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the union correctly as 8 and reports it, when the question asks for the elements in neither set)",
  "B": "Student makes misconception: overlap_not_subtracted (uses 6 + 4 = 10 as the union, giving 24 - 10 = 14)",
  "C": "Correct: the union is 6 + 4 - 2 = 8, so the elements in neither set number 24 - 8 = 16",
  "D": "Student makes misconception: union_intersection_swapped (reports the 2 elements in both sets, reading the intersection of complements as the intersection of the sets)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "overlap_not_subtracted",
  "D": "union_intersection_swapped"
}
```

---

**Advanced Level**

**8. In a class of $40$ students, $25$ study French, $18$ study German, and $7$ study neither language. How many study both?**

Step 1: The seven who study neither are outside the union, so the union holds everyone else.
- $40 - 7 = 33$

Step 2: Put that into the formula and solve for the overlap.
- $33 = 25 + 18 - n(\text{both})$
- $n(\text{both}) = 43 - 33 = 10$

**Answer: B** ($10$)

```json
"distractor_logic": {
  "A": "Student makes misconception: overlap_not_subtracted (treats the whole class as the union, computing 25 + 18 - 40 = 3 and never accounting for the 7 who study neither)",
  "B": "Correct: the union is 40 - 7 = 33, so the overlap is 25 + 18 - 33 = 10",
  "C": "Student makes misconception: neither_reported_as_both (reports the 7 who study neither as the number who study both)",
  "D": "Student makes misconception: union_intersection_swapped (computes the union correctly as 33 and reports it as the intersection)"
},
"misconception_tag": {
  "A": "overlap_not_subtracted",
  "C": "neither_reported_as_both",
  "D": "union_intersection_swapped"
}
```

---

**9. Within a universal set of $60$ people, $n(A) = 22$, $n(B) = 20$, $n(C) = 16$, $n(A \cap B) = 10$, $n(A \cap C) = 8$, $n(B \cap C) = 6$, and $n(A \cap B \cap C) = 4$. How many people are in none of the three sets?**

Step 1: Add the three sets.
- $22 + 20 + 16 = 58$

Step 2: Subtract the pairwise overlaps and add the triple back.
- $58 - 10 - 8 - 6 + 4 = 38$

Step 3: "None" is the complement of the union.
- $60 - 38 = 22$

**Answer: D** ($22$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the union correctly as 38 and reports it without subtracting from the universal set of 60)",
  "B": "Student makes misconception: triple_overlap_not_added_back (omits the final plus 4, taking the union as 58 - 10 - 8 - 6 = 34, and reports 60 - 34 = 26)",
  "C": "Student makes misconception: overlap_not_subtracted (uses 58 as the union with no overlaps removed, reporting 60 - 58 = 2)",
  "D": "Correct: the union is 58 - 10 - 8 - 6 + 4 = 38, so the number in none of the sets is 60 - 38 = 22"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "triple_overlap_not_added_back",
  "C": "overlap_not_subtracted"
}
```

---

**10. Within a universal set of $50$ elements, $n(A) = 28$, $n(B) = 20$, and $n(A \cap B) = 12$. What is $n((A \cap B)')$?**

Step 1: Read the notation carefully. The complement is being taken of the **intersection**, not of the union.

Step 2: The intersection is given directly: $n(A \cap B) = 12$.

Step 3: Subtract from the universal set.
- $50 - 12 = 38$

The union is a distraction here. It can be computed, $28 + 20 - 12 = 36$, and it is not needed.

**Answer: C** ($38$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (reports the intersection of 12 without taking its complement)",
  "B": "Student makes misconception: complement_misidentified (takes the complement of the union instead of the intersection, computing the union as 28 + 20 - 12 = 36 and reporting 50 - 36 = 14)",
  "C": "Correct: the intersection is 12, so its complement within the universal set is 50 - 12 = 38",
  "D": "Student makes misconception: union_intersection_swapped (computes the union as 28 + 20 - 12 = 36 and reports it, having read the intersection symbol as union)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "complement_misidentified",
  "D": "union_intersection_swapped"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Two sets satisfy $n(A) = 15$, $n(B) = 12$, and $n(A \cap B) = 5$. What is $n(A \cup B)$?**

Step 1: Add the sets.
- $15 + 12 = 27$

Step 2: Subtract the overlap once.
- $27 - 5 = 22$

**Answer: B** ($22$)

```json
"distractor_logic": {
  "A": "Student makes misconception: overlap_not_subtracted (reports 15 + 12 = 27, counting the 5 shared elements twice)",
  "B": "Correct: 15 + 12 - 5 = 22",
  "C": "Student makes misconception: overlap_subtracted_twice (removes the overlap once per set, computing 15 + 12 - 10 = 17)",
  "D": "Student makes misconception: union_intersection_swapped (reports the intersection of 5 instead of the union)"
},
"misconception_tag": {
  "A": "overlap_not_subtracted",
  "C": "overlap_subtracted_twice",
  "D": "union_intersection_swapped"
}
```

---

**Item 2: The sets from Item 1 sit inside a universal set with $n(U) = 40$. How many elements are in neither set?**

Step 1: The union, from Item 1, is $22$.

Step 2: Subtract from the universal set.
- $40 - 22 = 18$

**Answer: D** ($18$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (reports the union of 22 without subtracting it from the universal set)",
  "B": "Student makes misconception: neither_reported_as_both (reports the 5 elements in both sets rather than the ones in neither)",
  "C": "Student makes misconception: overlap_not_subtracted (uses 15 + 12 = 27 as the union, reporting 40 - 27 = 13)",
  "D": "Correct: the union is 22, so the elements in neither set number 40 - 22 = 18"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "neither_reported_as_both",
  "C": "overlap_not_subtracted"
}
```

---

**Item 3: Three sets satisfy $n(A) = 25$, $n(B) = 20$, $n(C) = 18$, $n(A \cap B) = 9$, $n(A \cap C) = 8$, $n(B \cap C) = 7$, and $n(A \cap B \cap C) = 4$. What is $n(A \cup B \cup C)$?**

Step 1: Add the three sets.
- $25 + 20 + 18 = 63$

Step 2: Subtract the pairwise overlaps.
- $63 - 9 - 8 - 7 = 39$

Step 3: Add the triple overlap back.
- $39 + 4 = 43$

**Answer: A** ($43$)

```json
"distractor_logic": {
  "A": "Correct: 63 - 9 - 8 - 7 + 4 = 43",
  "B": "Student makes misconception: triple_overlap_not_added_back (stops after the pairwise subtractions at 39, leaving out the 4 elements common to all three sets)",
  "C": "Student makes misconception: overlap_not_subtracted (adds the three set sizes and stops, reporting 63)",
  "D": "Student makes misconception: overlap_subtracted_twice (removes each pairwise overlap twice, computing 63 - 18 - 16 - 14 + 4 = 19)"
},
"misconception_tag": {
  "B": "triple_overlap_not_added_back",
  "C": "overlap_not_subtracted",
  "D": "overlap_subtracted_twice"
}
```

---

**Item 4: In a group of $36$ people, $22$ like tea, $18$ like coffee, and $5$ like neither. How many like both?**

Step 1: The five who like neither are outside the union.
- $36 - 5 = 31$

Step 2: Solve the formula for the overlap.
- $31 = 22 + 18 - n(\text{both})$
- $n(\text{both}) = 40 - 31 = 9$

**Answer: C** ($9$)

```json
"distractor_logic": {
  "A": "Student makes misconception: union_intersection_swapped (computes the union correctly as 36 - 5 = 31 and reports it as the number who like both)",
  "B": "Student makes misconception: overlap_not_subtracted (treats the whole group as the union, computing 22 + 18 - 36 = 4 and ignoring the 5 who like neither)",
  "C": "Correct: the union is 36 - 5 = 31, so the overlap is 22 + 18 - 31 = 9",
  "D": "Student makes misconception: neither_reported_as_both (reports the 5 who like neither as the number who like both)"
},
"misconception_tag": {
  "A": "union_intersection_swapped",
  "B": "overlap_not_subtracted",
  "D": "neither_reported_as_both"
}
```

##### Extra Practice - Answer Key

**1. Set A has $12$ elements, Set B has $9$ elements, and their intersection has $4$ elements. What is $|A \cup B|$?**

Step 1: Add the two set sizes.
- $12 + 9 = 21$

Step 2: Subtract the intersection, since its elements were counted in both sets.
- $21 - 4 = 17$

**Answer: B** ($17$)

```json
"distractor_logic": {
  "A": "Student makes misconception: overlap_not_subtracted (adds the two set sizes, 12 and 9, without subtracting the shared 4 elements)",
  "B": "Correct: adds 12 and 9, then subtracts the intersection of 4, for a union of 17",
  "C": "Student makes misconception: union_intersection_swapped (reports the intersection, 4, instead of the union that was asked for)",
  "D": "Student makes misconception: off_by_one_count (miscounts the subtraction, computing $21 - 4$ as 13)"
},
"misconception_tag": {
  "A": "overlap_not_subtracted",
  "C": "union_intersection_swapped",
  "D": "off_by_one_count"
}
```

---

**2. Set X has $15$ elements, Set Y has $8$ elements, and $|X \cup Y| = 19$. What is $|X \cap Y|$?**

Step 1: Rearrange the union formula.
- $|X \cap Y| = |X| + |Y| - |X \cup Y|$

Step 2: Substitute and solve.
- $15 + 8 - 19 = 4$

**Answer: D** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: union_intersection_swapped (reports the given union, 19, instead of solving for the intersection)",
  "B": "Student makes misconception: off_by_one_count (miscounts $15 + 8$ as 24 instead of 23, giving $24 - 19 = 5$)",
  "C": "Student makes misconception: overlap_not_subtracted (adds all three numbers, 15 plus 8 plus 19, instead of subtracting the union)",
  "D": "Correct: $15 + 8 - 19 = 4$"
},
"misconception_tag": {
  "A": "union_intersection_swapped",
  "B": "off_by_one_count",
  "C": "overlap_not_subtracted"
}
```

---

**3. Out of $50$ people, $30$ like tea and $22$ like coffee, with $12$ liking both. How many people like NEITHER tea nor coffee?**

Step 1: Find how many like at least one drink.
- $30 + 22 - 12 = 40$

Step 2: Subtract from the total.
- $50 - 40 = 10$

**Answer: A** ($10$)

```json
"distractor_logic": {
  "A": "Correct: 40 people like at least one drink, so 10 like neither",
  "B": "Student makes misconception: overlap_not_subtracted (subtracts both set sizes from the total without adding back the shared 12, computing $50 - 30 - 22 = -2$)",
  "C": "Student makes misconception: union_intersection_swapped (reports the number who like both, 12, as though that were the number who like neither)",
  "D": "Student makes misconception: reports_event_not_complement (reports the number who like at least one drink, 40, instead of the number who like neither)"
},
"misconception_tag": {
  "B": "overlap_not_subtracted",
  "C": "union_intersection_swapped",
  "D": "reports_event_not_complement"
}
```

---

**4. Set $P = \{2, 4, 6, 8, 10\}$ and Set $Q = \{4, 8, 12, 16\}$. What is $P \cap Q$?**

Step 1: Find the elements that appear in both sets.
- $4$ and $8$ appear in both.

**Answer: C** ($\{4, 8\}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: union_intersection_swapped (reports the union, every element from either set, instead of the intersection)",
  "B": "Student makes misconception: union_intersection_swapped (reports the elements found only in P, confusing set difference with intersection)",
  "C": "Correct: 4 and 8 are the only elements appearing in both P and Q",
  "D": "Student makes misconception: union_intersection_swapped (reports the elements found only in Q, confusing set difference with intersection)"
},
"misconception_tag": {
  "A": "union_intersection_swapped",
  "B": "union_intersection_swapped",
  "D": "union_intersection_swapped"
}
```

---

**5. In a survey of $80$ students, $50$ take Math, $35$ take Science, and $15$ take both. How many students take Math OR Science?**

Step 1: Add the two groups.
- $50 + 35 = 85$

Step 2: Subtract the overlap, counted twice.
- $85 - 15 = 70$

**Answer: D** ($70$)

```json
"distractor_logic": {
  "A": "Student makes misconception: overlap_not_subtracted (adds 50 and 35 without subtracting the 15 counted in both)",
  "B": "Student makes misconception: union_intersection_swapped (reports the intersection, 15, instead of the union that was asked for)",
  "C": "Student makes misconception: reports_event_not_complement (reports the number who take neither subject, 80 minus 70 equals 10, instead of the union)",
  "D": "Correct: adds 50 and 35, then subtracts the overlap of 15, for a union of 70"
},
"misconception_tag": {
  "A": "overlap_not_subtracted",
  "B": "union_intersection_swapped",
  "C": "reports_event_not_complement"
}
```

---

**6. A universal set has $60$ elements. Set A has $25$ elements and Set B has $20$ elements, with $8$ elements in both. How many elements are in NEITHER A nor B?**

Step 1: Find how many elements are in A or B.
- $25 + 20 - 8 = 37$

Step 2: Subtract from the universal set.
- $60 - 37 = 23$

**Answer: B** ($23$)

```json
"distractor_logic": {
  "A": "Student makes misconception: overlap_not_subtracted (subtracts both set sizes from the total without adding back the shared 8, computing $60 - 25 - 20 = 15$)",
  "B": "Correct: 37 elements are in A or B, so 23 are in neither",
  "C": "Student makes misconception: neither_reported_as_both (reports the 8 elements in both sets as though that were the count in neither)",
  "D": "Student makes misconception: reports_event_not_complement (reports the number in A or B, 37, instead of the number in neither)"
},
"misconception_tag": {
  "A": "overlap_not_subtracted",
  "C": "neither_reported_as_both",
  "D": "reports_event_not_complement"
}
```

---

**7. Of $120$ shoppers, $70$ bought fruit, $55$ bought vegetables, and $x$ bought both. If $95$ shoppers bought fruit or vegetables (or both), what is $x$?**

Step 1: Set up the union formula.
- $70 + 55 - x = 95$

Step 2: Solve for $x$.
- $125 - x = 95$, so $x = 30$

**Answer: C** ($30$)

```json
"distractor_logic": {
  "A": "Student makes misconception: union_intersection_swapped (reports the given union, 95, instead of solving for the overlap)",
  "B": "Student makes misconception: overlap_not_subtracted (uses the total number of shoppers, 120, instead of the given union of 95, computing $70 + 55 - 120 = 5$)",
  "C": "Correct: solves $70 + 55 - x = 95$ for $x = 30$",
  "D": "Student makes misconception: off_by_one_count (miscounts $70 + 55$ as 124 instead of 125, giving $124 - 95 = 29$)"
},
"misconception_tag": {
  "A": "union_intersection_swapped",
  "B": "overlap_not_subtracted",
  "D": "off_by_one_count"
}
```

---

**8. In a class, $18$ students play soccer, $15$ play basketball, and $12$ play tennis. $6$ play soccer and basketball, $5$ play soccer and tennis, $4$ play basketball and tennis, and $2$ play all three. How many students play at least one of the three sports?**

Step 1: Add the three individual counts.
- $18 + 15 + 12 = 45$

Step 2: Subtract each pairwise overlap.
- $45 - 6 - 5 - 4 = 30$

Step 3: Add back the triple overlap, since it was subtracted three times in step 2 but only belongs once.
- $30 + 2 = 32$

**Answer: A** ($32$)

```json
"distractor_logic": {
  "A": "Correct: 45 minus the three pairwise overlaps, 30, plus the triple overlap added back once, gives 32",
  "B": "Student makes misconception: triple_overlap_not_added_back (subtracts the three pairwise overlaps but never adds the triple overlap of 2 back in, stopping at 30)",
  "C": "Student makes misconception: overlap_not_subtracted (adds the three sport counts without subtracting any of the overlaps at all)",
  "D": "Student makes misconception: overlap_not_subtracted (subtracts only two of the three pairwise overlaps before adding back the triple overlap, reaching 36)"
},
"misconception_tag": {
  "B": "triple_overlap_not_added_back",
  "C": "overlap_not_subtracted",
  "D": "overlap_not_subtracted"
}
```

---

**9. Of $200$ survey respondents, $110$ like pizza, $90$ like pasta, and $40$ like both. How many respondents like NEITHER, and what percentage is that?**

Step 1: Find how many like at least one food.
- $110 + 90 - 40 = 160$

Step 2: Subtract from the total.
- $200 - 160 = 40$

Step 3: Convert to a percentage of the full 200 respondents.
- $\frac{40}{200} = 20\%$

**Answer: B** ($40$ respondents, $20\%$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (reports the number who like at least one food, 160, and its percentage, 80 percent, instead of neither)",
  "B": "Correct: 40 respondents like neither food, which is 40 out of 200, or 20 percent",
  "C": "Student makes misconception: outcome_total_miscounted (finds the correct count of 40 but divides by 100 instead of the actual 200 respondents surveyed)",
  "D": "Student makes misconception: overlap_not_subtracted (subtracts both food counts from the total without adding back the overlap, computing $200 - 110 - 90 = 0$)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "C": "outcome_total_miscounted",
  "D": "overlap_not_subtracted"
}
```

---

**10. In a survey, $|A| = 25$, $|B| = 20$, $|C| = 18$. $|A \cap B| = 8$, $|A \cap C| = 6$, $|B \cap C| = 5$, and the number in all three is unknown. If $|A \cup B \cup C| = 47$, how many elements are in all three sets?**

Step 1: Set up the inclusion-exclusion formula, letting $x$ be the triple overlap.
- $25 + 20 + 18 - 8 - 6 - 5 + x = 47$

Step 2: Simplify the known part.
- $44 + x = 47$

Step 3: Solve for $x$.
- $x = 3$

**Answer: D** ($3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: triple_overlap_not_added_back (stops at the known total, 44, without solving for and adding the triple overlap)",
  "B": "Student makes misconception: overlap_not_subtracted (ignores the three pairwise overlaps entirely, computing $47 - (25+20+18) = -16$ and reporting its absolute value)",
  "C": "Student makes misconception: off_by_one_count (miscounts the known total as 45 instead of 44, giving $47 - 45 = 2$)",
  "D": "Correct: solves $44 + x = 47$ for $x = 3$"
},
"misconception_tag": {
  "A": "triple_overlap_not_added_back",
  "B": "overlap_not_subtracted",
  "C": "off_by_one_count"
}
```

---

#### **Part 5: Extra Practice**

More of the same skill, for a worksheet rather than for the mastery gate. These items are drawn by the worksheet generator and are not part of the 9-of-12 practice gate or the 3-of-4 quiz gate. Worked solutions for them sit at the end of Part 4.

**Basic Level**

1. Set A has $12$ elements, Set B has $9$ elements, and their intersection has $4$ elements. What is $|A \cup B|$?
   - A) $21$
   - B) $17$
   - C) $4$
   - D) $13$

2. Set X has $15$ elements, Set Y has $8$ elements, and $|X \cup Y| = 19$. What is $|X \cap Y|$?
   - A) $19$
   - B) $5$
   - C) $23$
   - D) $4$

3. Out of $50$ people, $30$ like tea and $22$ like coffee, with $12$ liking both. How many people like NEITHER tea nor coffee?
   - A) $10$
   - B) $-2$
   - C) $12$
   - D) $40$

4. Set $P = \{2, 4, 6, 8, 10\}$ and Set $Q = \{4, 8, 12, 16\}$. What is $P \cap Q$?
   - A) $\{2, 4, 6, 8, 10, 12, 16\}$
   - B) $\{2, 6, 10\}$
   - C) $\{4, 8\}$
   - D) $\{12, 16\}$

**Proficient Level** (these require an extra step)

5. In a survey of $80$ students, $50$ take Math, $35$ take Science, and $15$ take both. How many students take Math OR Science?
   - A) $85$
   - B) $15$
   - C) $10$
   - D) $70$

6. A universal set has $60$ elements. Set A has $25$ elements and Set B has $20$ elements, with $8$ elements in both. How many elements are in NEITHER A nor B?
   - A) $15$
   - B) $23$
   - C) $8$
   - D) $37$

7. Of $120$ shoppers, $70$ bought fruit, $55$ bought vegetables, and $x$ bought both. If $95$ shoppers bought fruit or vegetables (or both), what is $x$?
   - A) $95$
   - B) $5$
   - C) $30$
   - D) $29$

**Advanced Level** (these need multiple steps or reverse thinking)

8. In a class, $18$ students play soccer, $15$ play basketball, and $12$ play tennis. $6$ play soccer and basketball, $5$ play soccer and tennis, $4$ play basketball and tennis, and $2$ play all three. How many students play at least one of the three sports?
   - A) $32$
   - B) $30$
   - C) $45$
   - D) $36$

9. Of $200$ survey respondents, $110$ like pizza, $90$ like pasta, and $40$ like both. How many respondents like NEITHER, and what percentage is that?
   - A) $160$ respondents, or $80\%$.
   - B) $40$ respondents, or $20\%$.
   - C) $40$ respondents, or $40\%$.
   - D) $0$ respondents, or $0\%$.

10. In a survey, $|A| = 25$, $|B| = 20$, $|C| = 18$. $|A \cap B| = 8$, $|A \cap C| = 6$, $|B \cap C| = 5$, and the number in all three is unknown. If $|A \cup B \cup C| = 47$, how many elements are in all three sets?
    - A) $44$
    - B) $16$
    - C) $2$
    - D) $3$
