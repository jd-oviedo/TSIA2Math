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
