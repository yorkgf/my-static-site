# Example 2: Box with Time-Varying Applied Force and Friction

## Problem Statement

A box of mass $M$ is sliding in a straight line on a rough, horizontal surface, as shown in the figure. The box has an initial velocity of $v_0$ in the positive direction, and the coefficient of kinetic friction between the box and the surface is $\mu_k$. Starting at time $t = 0$, the box is subject to a time-varying, horizontal applied force $F_a$ exerted in the positive direction. The applied force varies with time according to the equation $F_a(t) = F_0 e^{-Bt}$, where $F_0$ and $B$ are positive constants.

<img src="../Assets/Figure2.jpeg" width="300%" alt="Figure 2" />
*Figure 2: Box on rough surface with applied force*

---

## Part (a)

**Question:** If the rough surface could extend as far as necessary, would the box come to a complete stop in a finite amount of time? **Justify** your answer using qualitative reasoning beyond equations, though you may refer to the given equation for $F_a(t)$.

**Analysis:**
- The applied force $F_a(t) = F_0 e^{-Bt}$ decays exponentially with time
- Kinetic friction force: $f_k = \mu_k Mg$ (constant, opposing motion)
- Initially, if $F_0 > \mu_k Mg$, the box accelerates
- As $F_a$ decreases, eventually $F_a < \mu_k Mg$ and the box decelerates
- As $t \to \infty$, $F_a \to 0$, leaving only friction acting on the box

**Answer:** Yes, the box will come to a complete stop in finite time. Once $F_a$ becomes small enough, the net force is dominated by friction which will bring the box to rest. Since friction continues to act even after $F_a$ becomes negligible, the box will stop.

---

## Part (b)

**Question:** **Derive** an equation for the velocity $v$ of the box as a function of time $t$ by solving a differential equation. Express your equation for $v(t)$ in terms of $B$, $F_0$, $M$, $t$, $v_0$, $\mu_k$, and physical constants, as appropriate.

**Solution:**

Newton's second law:

$$\sum F = ma$$
$$F_0 e^{-Bt} - \mu_k Mg = M\frac{dv}{dt}$$

Separating variables:
$$dv = \left(\frac{F_0}{M}e^{-Bt} - \mu_k g\right)dt$$

Integrating from $t = 0$ to $t$:

$$v(t) - v_0 = \int_0^t \left(\frac{F_0}{M}e^{-Bt'} - \mu_k g\right)dt'$$

$$v(t) = v_0 + \frac{F_0}{M}\left(-\frac{1}{B}\right)\left[e^{-Bt}\right]_0^t - \mu_k gt$$

$$v(t) = v_0 + \frac{F_0}{MB}\left(1 - e^{-Bt}\right) - \mu_k gt$$

---

## Part (c)

**Question:** **Justify** if the equation for the velocity that you derived in part (b) is either consistent or not consistent with your reasoning in part (a).

**Analysis:**
The equation contains a term $-\mu_k gt$ which decreases linearly with time. Eventually, this term will dominate, causing $v(t)$ to become zero and then negative (if the box were allowed to reverse). This is consistent with part (a) - the box will stop due to the cumulative effect of friction.

---

## Related Concepts
- [[Friction Forces]]
- [[Differential Equations in Mechanics]]

## Source
AP Physics C - Mechanics (Free Response Question)
