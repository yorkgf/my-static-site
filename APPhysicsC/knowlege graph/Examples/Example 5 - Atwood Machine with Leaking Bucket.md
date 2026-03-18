# Example 5: Atwood Machine with Leaking Bucket

## Problem Statement

A group of students set up the Atwood machine shown in the figure, which consists of a light string passing over a pulley whose mass and friction are negligible. A counterweight of constant mass is connected to the right end of the string. A bucket full of water is connected to the left end of the string. The counterweight has a mass less than that of the full bucket, but greater than that of the empty bucket. At time $t = 0$ s the system is released from rest with the bucket full. At the same time, water begins to flow out of the bucket through a hole on the side near the bottom.

<img src="../Assets/Figure5.jpeg" width="300%" alt="Figure 5" />
*Figure 5: Atwood machine with leaking bucket*

The graph below shows the acceleration of the counterweight above its initial position as a function of time between time $t = 0$ s and $t = 1.2$ s, where positive acceleration represents upward acceleration for the counterweight. The bucket and counterweight continue moving long after this time.

*(Graph shows acceleration vs time with a linear decrease from positive to negative)*

---

## Part (a)

**Question:** At what time is the mass of the bucket and water equal to the mass of the counterweight? Explain your reasoning.

**Solution:**

When the masses are equal ($m_{bucket} = m_{counterweight}$), the net force on the system is zero, so the acceleration is zero.

From the graph, acceleration $a = 0$ at approximately $t = 0.5$ s.

**Answer:** $\boxed{t \approx 0.5 \text{ s}}$ (or approximately $0.4-0.6$ s based on graph reading)

**Reasoning:** When the bucket mass equals the counterweight mass, the system is momentarily in equilibrium with zero acceleration.

---

## Part (b)

**Question:** At what time does the counterweight reach its maximum height? Justify your answer.

**Solution:**

The counterweight reaches maximum height when its velocity becomes zero (momentarily at rest before falling back down).

From the graph, acceleration is positive (upward) initially, then becomes negative (downward) after $t \approx 0.5$ s.

- For $t < 0.5$ s: $a > 0$, so velocity is increasing (counterweight moving upward, speeding up)
- At $t = 0.5$ s: $a = 0$, velocity is maximum
- For $t > 0.5$ s: $a < 0$, counterweight is decelerating while still moving upward
- Maximum height occurs when velocity reaches zero

Since the acceleration is linear in time (from graph), and velocity is the integral of acceleration, we need to find when the area under the acceleration curve equals zero (equal positive and negative areas).

**Answer:** $\boxed{t > 1.2 \text{ s}}$ (or approximately $1.0$ s based on graph analysis)

**Justification:** The counterweight continues moving upward until its velocity becomes zero. Since the acceleration remains negative (but decreasing in magnitude), the counterweight keeps moving upward while slowing down, reaching maximum height some time after $t = 1.2$ s when the accumulated negative area equals the positive area from $0$ to $0.5$ s.

---

## Part (c)

**Question:** The students model the velocity of the counterweight using the function $v(t) = 1.2t - 1.5t^2$ for the time interval $0$ s $< t < 1.2$ s. Is it plausible that this function could correctly model the velocity during this interval? Why or why not?

**Solution:**

**Analysis:**
- At $t = 0$: $v(0) = 0$ ✓ (matches initial condition)
- Derivative: $a(t) = \frac{dv}{dt} = 1.2 - 3.0t$
- At $t = 0$: $a(0) = 1.2$ m/s² ✓ (matches positive initial acceleration)
- At $t = 0.4$ s: $a(0.4) = 1.2 - 1.2 = 0$ ✓ (zero acceleration when masses equal)

**Answer:** $\boxed{\text{Yes, it is plausible.}}$

**Reasoning:** 
1. Initial velocity is zero, matching the released-from-rest condition
2. Initial acceleration is positive, consistent with the bucket being heavier initially
3. Acceleration becomes zero at $t = 0.4$ s, when the bucket mass equals the counterweight mass
4. The model predicts acceleration becomes negative for $t > 0.4$ s, consistent with the bucket becoming lighter than the counterweight

---

## Part (d)

**Question:** Explain why this function does NOT correctly model the velocity of the counterweight over a long period of time, assuming that the system is able to move for a long time.

**Solution:**

**Answer:** The model predicts physically unrealistic behavior for long times.

**Explanation:**
The velocity function $v(t) = 1.2t - 1.5t^2$ is a downward-opening parabola that becomes increasingly negative as $t$ increases (for $t > 0.8$ s). This would mean:

1. **Unbounded speed:** As $t \to \infty$, $v(t) \to -\infty$, implying infinite speed
2. **No terminal velocity:** In reality, as the bucket empties, the system approaches a constant acceleration of $g$ (free fall), not ever-increasing speed
3. **No equilibrium state:** Eventually, the empty bucket would accelerate downward at nearly $g$, not continue with quadratic growth in velocity

Physically, once the bucket is empty, both masses become constant and the system settles into constant acceleration motion.

---

## Part (e)

**Question:** The students are told that the counterweight's mass is $15$ kg and the mass of the bucket with water in it is approximately given by the equation $M(t) = (1.28t^2 - 9.34t + 18.65)$ kg for $t \leq 3.5$ s. Explain how the students could use this information along with the velocity function $v(t) = 1.2t - 1.5t^2$ to calculate the total mechanical energy of the system at time $t = 1.2$ s.

**Solution:**

**Step 1: Calculate masses at $t = 1.2$ s**
$$M(1.2) = 1.28(1.2)^2 - 9.34(1.2) + 18.65$$
$$M(1.2) = 1.28(1.44) - 11.208 + 18.65$$
$$M(1.2) = 1.843 - 11.208 + 18.65 = 9.285 \text{ kg}$$

**Step 2: Calculate velocity at $t = 1.2$ s**
$$v(1.2) = 1.2(1.2) - 1.5(1.2)^2 = 1.44 - 2.16 = -0.72 \text{ m/s}$$

(Negative means counterweight is moving downward at $t = 1.2$ s)

**Step 3: Calculate speeds of both objects**
Both objects have speed $|v| = 0.72$ m/s (magnitudes equal)

**Step 4: Calculate kinetic energy**
$$K = \frac{1}{2}M_{bucket}v^2 + \frac{1}{2}M_{counterweight}v^2$$
$$K = \frac{1}{2}(9.285)(0.72)^2 + \frac{1}{2}(15)(0.72)^2$$

**Step 5: Calculate potential energy**
Students need the initial heights and the displacement:
$$\Delta y = \int_0^{1.2} v(t) \, dt = \int_0^{1.2} (1.2t - 1.5t^2) \, dt$$
$$\Delta y = \left[0.6t^2 - 0.5t^3\right]_0^{1.2}$$
$$\Delta y = 0.6(1.44) - 0.5(1.728) = 0.864 - 0.864 = 0$$

At $t = 1.2$ s, the counterweight is at the same height as at $t = 0$.

**Step 6: Total mechanical energy**
$$E = K + U = \text{(calculated from steps 4 and 5)}$$

---

## Related Concepts
- [[Atwood Machine]]
- Variable Mass Systems
- [[Conservation of Energy]]
- Graph Analysis

## Source
AP Physics C - Mechanics (Free Response Question)
