---
title: "Lesson 6.2: Polynomial Division (Long & Synthetic)"
module: "Module 6: Polynomials and Factoring"
source: canvas_export
canvas_item_id: 22410997
date_archived: "2026-07-29"
---

# **Lesson 6.2: Polynomial Division**

## **Why Should You Care About Polynomial Division?**

Polynomial division is essential for breaking down complex expressions into simpler parts, just like dividing numbers. It’s used in **engineering, economics, coding, and physics**—whether you're calculating rates of change, optimizing profits, or solving equations in computer science.

By the end of this lesson, you’ll be able to **divide polynomials using long division and synthetic division** with confidence.

---

## **1. Understanding Polynomial Division**

Dividing polynomials follows a process similar to dividing numbers. There are **two main methods**:

1. **Long Division** – A step-by-step method that works for all polynomials.
2. **Synthetic Division** – A shortcut method used when dividing by a **linear binomial** (e.g., $x - c$).

### **Key Vocabulary**

* **Dividend**: The polynomial being divided.
* **Divisor**: The polynomial dividing the dividend.
* **Quotient**: The result of the division.
* **Remainder**: The leftover part after division.

---

## **2. Polynomial Long Division**

This method is similar to long division with numbers.

#### **Example 1: Divide $x^3 + 2x^2 - 5x - 6$ by $x - 2$**

📌 **Step 1: Set up the division**

$\frac{x^3 + 2x^2 - 5x - 6}{x - 2}$

📌 **Step 2: Divide the first term**

* Divide $x^3$ by $x$, which gives **$x^2$**.

📌 **Step 3: Multiply**

* Multiply $x^2$ by $(x - 2)$: $x^3 - 2x^2$
* Subtract: $(x^3 + 2x^2 - 5x - 6) - (x^3 - 2x^2) = 4x^2 - 5x - 6$

📌 **Step 4: Repeat the process**

* Divide $4x^2$ by $x$, which gives **$4x$**.
* Multiply $4x$ by $(x - 2)$: $4x^2 - 8x$
* Subtract: $(4x^2 - 5x - 6) - (4x^2 - 8x) = 3x - 6$

📌 **Step 5: Continue until remainder is found**

* Divide $3x$ by $x$, which gives **$3$**.
* Multiply $3$ by $(x - 2)$: $3x - 6$
* Subtract: $(3x - 6) - (3x - 6) = 0$

✅ **Final Answer:**

$x^2 + 4x + 3$

---

## **3. Synthetic Division**

A faster alternative to long division, synthetic division works **only when dividing by a binomial in the form $x - c$**.

#### **Example 2: Divide $x^3 + 2x^2 - 5x - 6$ by $x - 2$ using synthetic division**

📌 **Step 1: Set up synthetic division**

1. Write the **coefficients** of the dividend: $[1, 2, -5, -6]$
2. Write the **root of the divisor** $x - 2$, which is **$2$**, outside the synthetic division setup:

```
 2 |  1   2   -5   -6
```

📌 **Step 2: Perform synthetic division**

1. Bring down the first coefficient **(1)**.
2. Multiply by $2$, write the result below the next coefficient:

```
 2 |  1   2   -5   -6  
      ↓   2    8    6  
    ----------------  
      1   4    3    0
```

📌 **Step 3: Interpret the result**

* The numbers at the bottom row represent the coefficients of the quotient.
* The **quotient** is **$x^2 + 4x + 3$**.
* The **remainder** is $0$, meaning $x - 2$ is a perfect factor.

✅ **Final Answer:**

$x^2 + 4x + 3$

---

## **4. Real-World Applications of Polynomial Division**

### **(A) Engineering & Physics 🚀**

Engineers use polynomial division to simplify equations related to motion, circuits, and forces.

### **(B) Business & Economics 💰**

Businesses use polynomial division to calculate trends and make economic predictions.

### **(C) Computer Science 💻**

Polynomial division is used in algorithms, cryptography, and machine learning models.

---

## **5. Key Steps for Success 🎯**

✅ **Long Division:** Divide, multiply, subtract, bring down the next term, and repeat.  
✅ **Synthetic Division:** Works only when dividing by **$x - c$**.  
✅ **Quotient & Remainder:** The remainder is what’s left after division.  
✅ **Real-World Applications:** Used in **physics, business, and coding**.

---

## **Final Thoughts**

Mastering polynomial division gives you the ability to **simplify complex equations, analyze real-world problems, and solve higher-level math challenges**. Keep practicing, and soon **polynomial division will be second nature to you!** 🚀
