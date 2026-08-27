---
topic_name: "Probability of an event and its complement"
unit_number: 5
sequence_in_unit: 10
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Basic"
related_strand: "PR"
keywords: ["complement", "probability", "not", "at least one", "sample space", "percent", "certainty"]
---

# PR.3.2 - Probability of an Event and Its Complement

**Topic ID:** PR.3.2  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

Something either happens or it does not. There is no third option, and that single fact is the whole of this topic.

The **complement** of an event is everything else: all the outcomes where the event does not occur. Every problem here asks you two questions, in this order:

1. **Which one am I being asked for, the event or its complement?** The word "not" is doing all the work, and it is easy to read past.
2. **Do the two add to $1$?** They must. If they do not, something is wrong.

**The confusion this topic exists to prevent is computing correctly and then handing back the wrong one of the two.** That is not a mathematics error. It is a reading error that survives perfect arithmetic, which is exactly what makes it expensive.

---

##### Everything Adds to One

If an event has probability $P(E)$, then

$$P(\text{not } E) = 1 - P(E)$$

and rearranged,

$$P(E) + P(\text{not } E) = 1$$

Both statements say the same thing: certainty is $1$, and the two possibilities divide it between them.

**Example 1:** The probability that it rains tomorrow is $\frac{3}{10}$. Find the probability that it does not rain.

Step 1: Identify what you were given. That is $P(\text{rain})$.

Step 2: Subtract from $1$. Write $1$ over the same denominator.

- $1 - \frac{3}{10} = \frac{10}{10} - \frac{3}{10} = \frac{7}{10}$

Step 3: Check. $\frac{3}{10} + \frac{7}{10} = \frac{10}{10} = 1$. Correct.

Step 3 takes four seconds and catches almost every error in this topic. **Add your answer to the number you started with. If it is not $1$, stop.**

---

##### The Two Ways This Goes Wrong

There are two failures worth naming before you meet them.

**Subtracting twice.** A student writes $1 - 2 \times \frac{3}{10} = \frac{4}{10}$, doubling the event before subtracting. The check catches it instantly: $\frac{3}{10} + \frac{4}{10} = \frac{7}{10}$, which is not $1$.

**Assuming the answer is a half.** Because there are two possibilities, it is tempting to think each gets half. **Two outcomes does not mean two equal outcomes.** A weather forecast of $\frac{3}{10}$ rain does not make dry weather a coin flip. $\frac{1}{2}$ is the right answer only when the event genuinely has probability $\frac{1}{2}$, and then only by coincidence.

---

##### Running It Backward

The relationship works in both directions, and items exploit that.

**Example 2:** The probability that a train is **not** late is $\frac{3}{8}$. Find the probability that it **is** late.

You were handed the complement and asked for the event. The subtraction is identical.

- $1 - \frac{3}{8} = \frac{8}{8} - \frac{3}{8} = \frac{5}{8}$

Check: $\frac{3}{8} + \frac{5}{8} = 1$. Correct.

The trap here is not arithmetic. It is answering with $\frac{3}{8}$, the number printed in the stem, because it is already a probability and it is already on the page. **The number in the stem is the answer to a question nobody asked.**

---

##### Counting the Sample Space First

When the stem gives you objects instead of a probability, count before you subtract.

**Example 3:** A bag holds $20$ marbles, $7$ of which are red. Find the probability of drawing a marble that is not red.

Two routes, and both are correct.

The long way: count the non-red marbles, $20 - 7 = 13$, giving $\frac{13}{20}$.

The complement way: $1 - \frac{7}{20} = \frac{20}{20} - \frac{7}{20} = \frac{13}{20}$.

Same answer, as it must be. Use whichever is faster for the numbers in front of you.

**Example 4:** A spinner has $10$ equal sections numbered $1$ through $10$. Find the probability of landing on a number that is not a multiple of $4$.

Step 1: List the multiples of $4$ in range. They are $4$ and $8$, so there are $2$.

Step 2: Subtract.
- $1 - \frac{2}{10} = \frac{8}{10} = \frac{4}{5}$

Step 1 is the risk. Miscount the favourable outcomes by one, and everything after it is right and the answer is still wrong. Including $12$ because it is a multiple of $4$, when the spinner stops at $10$, would give $3$ and an answer of $\frac{7}{10}$. **The sample space is what the problem says it is.**

---

##### Fractions, Decimals, and Percents

The complement rule does not care which representation you are in, as long as "everything" is written the same way.

| Certainty is | The rule reads |
|---|---|
| $1$ | $P(\text{not } E) = 1 - P(E)$ |
| $100\%$ | $P(\text{not } E) = 100\% - P(E)$ |
| $1.00$ | $P(\text{not } E) = 1.00 - P(E)$ |

**Example 5:** The probability that a component passes inspection is $35\%$. Find the probability that it fails.

- $100\% - 35\% = 65\%$

Check: $35\% + 65\% = 100\%$. Correct.

Subtracting a percent from $1$ instead of from $100\%$ gives a nonsense answer, and mixing representations mid-problem is the commonest way to produce one. **Pick a representation, and write "everything" in it before you subtract.**

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Read the question again after you have the number.**

You will do the arithmetic correctly. The subtraction here is not hard, and it will not be what costs you. What costs you is finishing with $\frac{13}{20}$ in front of you, looking back at four options, and picking $\frac{7}{20}$ because it is familiar from the stem.

This error is invisible from the inside. Every step you took was right. That is exactly why it needs a mechanical defence rather than care:

**Say the answer as a sentence.** Not "thirteen twentieths", but *"the probability the marble is **not** red is thirteen twentieths."* If the sentence does not contain the word the question contained, you have the wrong one of the two.

The item is built so that the event's probability is always among the choices. It is there for the student who computed everything correctly and read nothing twice.

---

##### When "Not" Is the Shorter Path

Sometimes the complement is not the question but the method.

**Example 6:** A class of $40$ students travels to school by exactly one means. $6$ walk and $10$ cycle. Find the probability that a randomly chosen student neither walks nor cycles.

You could count every other means of travel, but you were not told what they are. So use the complement.

Step 1: Combine the two named groups.
- $6 + 10 = 16$

Step 2: Subtract from the whole class.
- $40 - 16 = 24$

Step 3: Divide.
- $\frac{24}{40} = \frac{3}{5}$

Step 1 is what gets dropped. A student who subtracts only the walkers gets $\frac{34}{40}$, which is a **partial complement**: they excluded some of the event and not all of it. **When the event has more than one part, all its parts leave together.**

---

##### Backward to a Count

**Example 7:** A bag holds $40$ marbles. The probability of drawing a marble that is **not** blue is $\frac{7}{10}$. How many marbles are blue?

Step 1: Get the probability of the event you actually want.
- $P(\text{blue}) = 1 - \frac{7}{10} = \frac{3}{10}$

Step 2: Apply it to the total.
- $\frac{3}{10} \times 40 = 12$

Check: $12$ blue out of $40$ is $\frac{12}{40} = \frac{3}{10}$, so not-blue is $\frac{28}{40} = \frac{7}{10}$. Correct.

Two things can go wrong, and both produce a whole number that looks like an answer. Skipping Step 1 gives $28$, the count of the marbles that are **not** blue. Reading the $7$ as a count gives $7$. **A probability is not a count until you multiply it by the total.**

---

##### The Five Traps

1. **Answering the event when the question said "not".** Say your answer as a full sentence and check the word against the stem.
2. **Assuming the complement is a half.** Two possibilities are not two equal possibilities.
3. **Subtracting twice.** Adding your answer to the original must give exactly $1$.
4. **Miscounting the sample space.** Count the favourable outcomes against the range the problem actually states.
5. **Taking a partial complement.** If the event has several parts, remove all of them before subtracting.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. The probability that it rains tomorrow is $\frac{3}{10}$. What is the probability that it does not rain?
   - A) $\frac{3}{10}$
   - B) $\frac{1}{2}$
   - C) $\frac{7}{10}$
   - D) $\frac{2}{5}$

2. The probability that a randomly chosen light bulb is defective is $\frac{1}{5}$. What is the probability that it is not defective?
   - A) $\frac{4}{5}$
   - B) $\frac{1}{5}$
   - C) $\frac{1}{2}$
   - D) $\frac{3}{5}$

3. The probability that a train is **not** late is $\frac{3}{8}$. What is the probability that it is late?
   - A) $\frac{1}{2}$
   - B) $\frac{5}{8}$
   - C) $\frac{3}{8}$
   - D) $\frac{1}{4}$

4. The probability that a seed germinates is $\frac{2}{5}$. What is the probability that it does not germinate?
   - A) $\frac{2}{5}$
   - B) $\frac{1}{5}$
   - C) $\frac{1}{2}$
   - D) $\frac{3}{5}$

**Proficient Level** (these require an extra step)

5. A bag holds $20$ marbles, and $7$ of them are red. If one marble is drawn at random, what is the probability that it is not red?
   - A) $\frac{7}{20}$
   - B) $\frac{13}{20}$
   - C) $\frac{7}{10}$
   - D) $\frac{1}{2}$

6. A spinner has $10$ equal sections numbered $1$ through $10$. What is the probability that one spin lands on a number that is not a multiple of $4$?
   - A) $\frac{1}{5}$
   - B) $\frac{9}{10}$
   - C) $\frac{4}{5}$
   - D) $\frac{3}{5}$

7. The probability that a component passes inspection is $35\%$. What is the probability that it fails inspection?
   - A) $65\%$
   - B) $35\%$
   - C) $30\%$
   - D) $50\%$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A set of $25$ cards is numbered $1$ through $25$. One card is drawn at random. What is the probability that the number on it is not a multiple of $5$?
   - A) $\frac{1}{5}$
   - B) $\frac{21}{25}$
   - C) $\frac{22}{25}$
   - D) $\frac{4}{5}$

9. A class of $40$ students each travels to school by exactly one means. $6$ walk and $10$ cycle. What is the probability that a randomly chosen student neither walks nor cycles?
   - A) $\frac{2}{5}$
   - B) $\frac{3}{5}$
   - C) $\frac{17}{20}$
   - D) $\frac{1}{2}$

10. A bag holds $40$ marbles. The probability of drawing a marble that is **not** blue is $\frac{7}{10}$. How many marbles in the bag are blue?
    - A) $28$
    - B) $20$
    - C) $12$
    - D) $7$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

The probability that a randomly selected student forgot their homework is $\frac{1}{6}$. What is the probability that a randomly selected student did not forget their homework?

- A) $\frac{5}{6}$
- B) $\frac{1}{6}$
- C) $\frac{1}{2}$
- D) $\frac{2}{3}$

**Proficient Level**

**Item 2**

A drawer holds $24$ socks, and $9$ of them are black. If one sock is drawn at random, what is the probability that it is not black?

- A) $\frac{3}{8}$
- B) $\frac{1}{2}$
- C) $\frac{2}{3}$
- D) $\frac{5}{8}$

**Item 3**

The probability that a flight departs on time is $45\%$. What is the probability that it does not depart on time?

- A) $45\%$
- B) $55\%$
- C) $10\%$
- D) $50\%$

**Advanced Level**

**Item 4**

A group of $50$ people each chose exactly one drink. $8$ chose tea and $12$ chose coffee. What is the probability that a randomly chosen person chose neither tea nor coffee?

- A) $\frac{2}{5}$
- B) $\frac{21}{25}$
- C) $\frac{3}{5}$
- D) $\frac{1}{2}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. The probability that it rains tomorrow is $\frac{3}{10}$. What is the probability that it does not rain?**

Step 1: The stem gives $P(\text{rain})$, and the question asks for its complement.

Step 2: Subtract from $1$.
- $1 - \frac{3}{10} = \frac{10}{10} - \frac{3}{10} = \frac{7}{10}$

Step 3: Check. $\frac{3}{10} + \frac{7}{10} = 1$. Correct.

**Answer: C** ($\frac{7}{10}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (hands back the 3 over 10 printed in the stem, which is the probability that it does rain, after doing no work at all)",
  "B": "Student makes misconception: complement_assumed_half (reasons that rain either happens or does not, so each possibility gets one half, treating two outcomes as two equal outcomes)",
  "C": "Correct: 1 - 3/10 = 7/10, and 3/10 + 7/10 = 1 confirms it",
  "D": "Student makes misconception: event_probability_subtracted_twice (doubles the event before subtracting, computing 1 - 6/10 = 4/10, which is 2/5; adding back gives 3/10 + 4/10 = 7/10 rather than 1)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "complement_assumed_half",
  "D": "event_probability_subtracted_twice"
}
```

---

**2. The probability that a randomly chosen light bulb is defective is $\frac{1}{5}$. What is the probability that it is not defective?**

Step 1: Subtract from $1$.
- $1 - \frac{1}{5} = \frac{5}{5} - \frac{1}{5} = \frac{4}{5}$

Step 2: Check. $\frac{1}{5} + \frac{4}{5} = 1$. Correct.

**Answer: A** ($\frac{4}{5}$)

```json
"distractor_logic": {
  "A": "Correct: 1 - 1/5 = 4/5, and 1/5 + 4/5 = 1 confirms it",
  "B": "Student makes misconception: reports_event_not_complement (returns the 1 over 5 given in the stem, which is the probability the bulb IS defective)",
  "C": "Student makes misconception: complement_assumed_half (splits certainty evenly between defective and not defective because there are two possibilities)",
  "D": "Student makes misconception: event_probability_subtracted_twice (computes 1 - 2/5 = 3/5; adding back gives 1/5 + 3/5 = 4/5 rather than 1)"
},
"misconception_tag": {
  "B": "reports_event_not_complement",
  "C": "complement_assumed_half",
  "D": "event_probability_subtracted_twice"
}
```

---

**3. The probability that a train is not late is $\frac{3}{8}$. What is the probability that it is late?**

Step 1: The stem gives the complement, and the question asks for the event. The subtraction is the same either way.

Step 2: Subtract from $1$.
- $1 - \frac{3}{8} = \frac{8}{8} - \frac{3}{8} = \frac{5}{8}$

Step 3: Check. $\frac{3}{8} + \frac{5}{8} = 1$. Correct.

**Answer: B** ($\frac{5}{8}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: complement_assumed_half (treats late and not late as equally likely because they are the only two possibilities)",
  "B": "Correct: 1 - 3/8 = 5/8, and 3/8 + 5/8 = 1 confirms it",
  "C": "Student makes misconception: reports_event_not_complement (returns the 3 over 8 printed in the stem, which is the probability the train is NOT late, the opposite of what was asked)",
  "D": "Student makes misconception: event_probability_subtracted_twice (computes 1 - 6/8 = 2/8, which is 1/4; adding back gives 3/8 + 1/4 = 5/8 rather than 1)"
},
"misconception_tag": {
  "A": "complement_assumed_half",
  "C": "reports_event_not_complement",
  "D": "event_probability_subtracted_twice"
}
```

---

**4. The probability that a seed germinates is $\frac{2}{5}$. What is the probability that it does not germinate?**

Step 1: Subtract from $1$.
- $1 - \frac{2}{5} = \frac{5}{5} - \frac{2}{5} = \frac{3}{5}$

Step 2: Check. $\frac{2}{5} + \frac{3}{5} = 1$. Correct.

**Answer: D** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (returns the 2 over 5 from the stem, which is the probability the seed DOES germinate)",
  "B": "Student makes misconception: event_probability_subtracted_twice (computes 1 - 4/5 = 1/5; adding back gives 2/5 + 1/5 = 3/5 rather than 1)",
  "C": "Student makes misconception: complement_assumed_half (assumes germinating and not germinating are equally likely because there are two outcomes)",
  "D": "Correct: 1 - 2/5 = 3/5, and 2/5 + 3/5 = 1 confirms it"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "event_probability_subtracted_twice",
  "C": "complement_assumed_half"
}
```

---

**Proficient Level**

**5. A bag holds $20$ marbles, and $7$ of them are red. If one marble is drawn at random, what is the probability that it is not red?**

Step 1: The probability of red is $\frac{7}{20}$.

Step 2: Subtract from $1$.
- $1 - \frac{7}{20} = \frac{20}{20} - \frac{7}{20} = \frac{13}{20}$

Step 3: Check by counting directly. Non-red marbles: $20 - 7 = 13$, giving $\frac{13}{20}$. The two routes agree.

**Answer: B** ($\frac{13}{20}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the probability of drawing a red marble, 7 over 20, and reports it despite the question asking for not red)",
  "B": "Correct: 1 - 7/20 = 13/20, confirmed by counting 20 - 7 = 13 non-red marbles directly",
  "C": "Student makes misconception: event_set_miscounted (counts 6 red marbles rather than 7, giving 20 - 6 = 14 non-red and an answer of 14 over 20, which is 7/10)",
  "D": "Student makes misconception: complement_assumed_half (reasons that a marble is either red or not red, so the probability must be one half)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "C": "event_set_miscounted",
  "D": "complement_assumed_half"
}
```

---

**6. A spinner has $10$ equal sections numbered $1$ through $10$. What is the probability that one spin lands on a number that is not a multiple of $4$?**

Step 1: List the multiples of $4$ from $1$ to $10$. They are $4$ and $8$, so there are $2$.

Step 2: Subtract from $1$.
- $1 - \frac{2}{10} = \frac{8}{10} = \frac{4}{5}$

Step 3: Check. $\frac{2}{10} + \frac{8}{10} = 1$. Correct.

**Answer: C** ($\frac{4}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (reports the probability of landing ON a multiple of 4, 2 over 10, which is 1/5, the event rather than its complement)",
  "B": "Student makes misconception: event_set_miscounted (counts only 1 multiple of 4 in range, giving 10 - 1 = 9 and an answer of 9 over 10)",
  "C": "Correct: the multiples of 4 in range are 4 and 8, so 1 - 2/10 = 8/10 = 4/5",
  "D": "Student makes misconception: event_probability_subtracted_twice (doubles the event before subtracting, computing 1 - 4/10 = 6/10, which is 3/5)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "event_set_miscounted",
  "D": "event_probability_subtracted_twice"
}
```

---

**7. The probability that a component passes inspection is $35\%$. What is the probability that it fails inspection?**

Step 1: The stem is in percent, so certainty is $100\%$.

Step 2: Subtract.
- $100 - 35 = 65$, so the answer is $65\%$

Step 3: Check. $35 + 65 = 100$. Correct.

**Answer: A** ($65\%$)

```json
"distractor_logic": {
  "A": "Correct: 100 - 35 = 65, so the failure probability is 65 percent, confirmed because 35 + 65 = 100",
  "B": "Student makes misconception: reports_event_not_complement (returns the 35 percent from the stem, which is the probability the component PASSES)",
  "C": "Student makes misconception: event_probability_subtracted_twice (doubles the event before subtracting, computing 100 - 70 = 30; adding back gives 35 + 30 = 65 rather than 100)",
  "D": "Student makes misconception: complement_assumed_half (assumes pass and fail split certainty evenly at 50 percent each)"
},
"misconception_tag": {
  "B": "reports_event_not_complement",
  "C": "event_probability_subtracted_twice",
  "D": "complement_assumed_half"
}
```

---

**Advanced Level**

**8. A set of $25$ cards is numbered $1$ through $25$. One card is drawn at random. What is the probability that the number on it is not a multiple of $5$?**

Step 1: Count the multiples of $5$ from $1$ to $25$. They are $5$, $10$, $15$, $20$, and $25$, so there are $5$.

Step 2: Subtract from $1$.
- $1 - \frac{5}{25} = \frac{25}{25} - \frac{5}{25} = \frac{20}{25} = \frac{4}{5}$

Step 3: Check. $\frac{5}{25} + \frac{20}{25} = 1$. Correct.

Note that $25$ is itself a multiple of $5$. Stopping the count at $20$ is the commonest slip here.

**Answer: D** ($\frac{4}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (reports the probability of drawing a multiple of 5, 5 over 25, which is 1/5, the event rather than its complement)",
  "B": "Student makes misconception: event_set_miscounted (stops counting at 20 and misses that 25 is itself a multiple of 5, using 4 favourable outcomes to get 21 over 25)",
  "C": "Student makes misconception: partial_complement_taken (removes only 3 of the 5 multiples from the sample space, leaving 22 over 25)",
  "D": "Correct: there are 5 multiples of 5 in range, so 1 - 5/25 = 20/25 = 4/5"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "event_set_miscounted",
  "C": "partial_complement_taken"
}
```

---

**9. A class of $40$ students each travels to school by exactly one means. $6$ walk and $10$ cycle. What is the probability that a randomly chosen student neither walks nor cycles?**

Step 1: Combine both named groups. They are the event to be excluded.
- $6 + 10 = 16$

Step 2: Subtract from the whole class.
- $40 - 16 = 24$

Step 3: Divide.
- $\frac{24}{40} = \frac{3}{5}$

Check: $\frac{16}{40} + \frac{24}{40} = 1$. Correct.

**Answer: B** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the probability that a student DOES walk or cycle, 16 over 40, which is 2/5, and reports it despite the question asking for neither)",
  "B": "Correct: 6 + 10 = 16 students are excluded, leaving 40 - 16 = 24, so the probability is 24 over 40, which is 3/5",
  "C": "Student makes misconception: partial_complement_taken (removes only the 6 walkers and forgets the cyclists, computing 40 - 6 = 34 for an answer of 34 over 40, which is 17/20)",
  "D": "Student makes misconception: complement_assumed_half (assumes the class splits evenly between the named groups and everyone else)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "C": "partial_complement_taken",
  "D": "complement_assumed_half"
}
```

---

**10. A bag holds $40$ marbles. The probability of drawing a marble that is not blue is $\frac{7}{10}$. How many marbles in the bag are blue?**

Step 1: The stem gives the complement. Convert it to the probability of the event.
- $P(\text{blue}) = 1 - \frac{7}{10} = \frac{3}{10}$

Step 2: A probability is not a count. Multiply by the total.
- $\frac{3}{10} \times 40 = 12$

Step 3: Check. $12$ blue out of $40$ is $\frac{12}{40} = \frac{3}{10}$, so not blue is $\frac{28}{40} = \frac{7}{10}$. Correct.

**Answer: C** ($12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (multiplies the given 7 over 10 by 40 to get 28, which is the count of marbles that are NOT blue, the group the question did not ask about)",
  "B": "Student makes misconception: complement_assumed_half (takes half of the 40 marbles on the reasoning that a marble is either blue or not blue)",
  "C": "Correct: P(blue) = 1 - 7/10 = 3/10, and 3/10 of 40 is 12, confirmed because 28 of the other 40 gives 7/10",
  "D": "Student makes misconception: event_set_miscounted (reads the 7 in the given fraction as a count of marbles rather than part of a probability, never involving the total of 40 at all)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "complement_assumed_half",
  "D": "event_set_miscounted"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: The probability that a randomly selected student forgot their homework is $\frac{1}{6}$. What is the probability that a randomly selected student did not forget their homework?**

Step 1: Subtract from $1$.
- $1 - \frac{1}{6} = \frac{6}{6} - \frac{1}{6} = \frac{5}{6}$

Step 2: Check. $\frac{1}{6} + \frac{5}{6} = 1$. Correct.

**Answer: A** ($\frac{5}{6}$)

```json
"distractor_logic": {
  "A": "Correct: 1 - 1/6 = 5/6, and 1/6 + 5/6 = 1 confirms it",
  "B": "Student makes misconception: reports_event_not_complement (returns the 1 over 6 from the stem, which is the probability the student DID forget)",
  "C": "Student makes misconception: complement_assumed_half (splits certainty evenly because there are two possibilities)",
  "D": "Student makes misconception: event_probability_subtracted_twice (computes 1 - 2/6 = 4/6, which is 2/3; adding back gives 1/6 + 2/3 = 5/6 rather than 1)"
},
"misconception_tag": {
  "B": "reports_event_not_complement",
  "C": "complement_assumed_half",
  "D": "event_probability_subtracted_twice"
}
```

---

**Item 2: A drawer holds $24$ socks, and $9$ of them are black. If one sock is drawn at random, what is the probability that it is not black?**

Step 1: The probability of black is $\frac{9}{24}$.

Step 2: Subtract from $1$.
- $1 - \frac{9}{24} = \frac{24}{24} - \frac{9}{24} = \frac{15}{24} = \frac{5}{8}$

Step 3: Check by counting. Non-black socks: $24 - 9 = 15$, giving $\frac{15}{24}$. The routes agree.

**Answer: D** ($\frac{5}{8}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (reports the probability of drawing a black sock, 9 over 24, which is 3/8)",
  "B": "Student makes misconception: complement_assumed_half (assumes black and not black are equally likely because they are the only two possibilities)",
  "C": "Student makes misconception: event_set_miscounted (counts 8 black socks rather than 9, giving 24 - 8 = 16 and an answer of 16 over 24, which is 2/3)",
  "D": "Correct: 1 - 9/24 = 15/24 = 5/8, confirmed by counting 24 - 9 = 15 non-black socks"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "complement_assumed_half",
  "C": "event_set_miscounted"
}
```

---

**Item 3: The probability that a flight departs on time is $45\%$. What is the probability that it does not depart on time?**

Step 1: The stem is in percent, so certainty is $100\%$.

Step 2: Subtract.
- $100 - 45 = 55$, so the answer is $55\%$

Step 3: Check. $45 + 55 = 100$. Correct.

**Answer: B** ($55\%$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (returns the 45 percent from the stem, which is the probability the flight IS on time)",
  "B": "Correct: 100 - 45 = 55, so the answer is 55 percent, confirmed because 45 + 55 = 100",
  "C": "Student makes misconception: event_probability_subtracted_twice (doubles the event before subtracting, computing 100 - 90 = 10; adding back gives 45 + 10 = 55 rather than 100)",
  "D": "Student makes misconception: complement_assumed_half (assumes on time and delayed split certainty evenly at 50 percent each)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "C": "event_probability_subtracted_twice",
  "D": "complement_assumed_half"
}
```

---

**Item 4: A group of $50$ people each chose exactly one drink. $8$ chose tea and $12$ chose coffee. What is the probability that a randomly chosen person chose neither tea nor coffee?**

Step 1: Combine both named groups.
- $8 + 12 = 20$

Step 2: Subtract from the total.
- $50 - 20 = 30$

Step 3: Divide.
- $\frac{30}{50} = \frac{3}{5}$

Check: $\frac{20}{50} + \frac{30}{50} = 1$. Correct.

**Answer: C** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the probability that a person DID choose tea or coffee, 20 over 50, which is 2/5)",
  "B": "Student makes misconception: partial_complement_taken (removes only the 8 tea drinkers and forgets the coffee drinkers, computing 50 - 8 = 42 for an answer of 42 over 50, which is 21/25)",
  "C": "Correct: 8 + 12 = 20 people are excluded, leaving 50 - 20 = 30, so the probability is 30 over 50, which is 3/5",
  "D": "Student makes misconception: complement_assumed_half (assumes the group splits evenly between the named drinks and everything else)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "partial_complement_taken",
  "D": "complement_assumed_half"
}
```
