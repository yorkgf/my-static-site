# Example 1: Sphere with Velocity-Dependent Air Resistance

## Problem Statement

A small sphere of mass $m$ is launched straight upward from the top of a high cliff, as shown in Figure 1, with an initial speed $v_0$ at time $t = 0$. The air exerts a resistive force $\vec{F}_r$ on the sphere that varies with velocity $v$ according to the equation $\vec{F}_r = -b\vec{v}$, where $b$ is a positive constant. The sphere reaches its maximum height in the air at time $t_h$ and then falls back toward the ground, which is a long distance below the sphere's launch point at the top of the cliff. In the following questions, the positive direction is taken to be upward.

<img src="../Assets/Figure1.jpeg" width="300%" alt="Figure 1" />
*Figure 1: Sphere launched upward from a cliff with air resistance*

---

## Part (a)

### (i) Derive an equation for the velocity $v$ of the sphere as a function of time $t$

**Solution Approach:**

Using Newton's second law during ascent (upward motion):

$$\sum F = ma$$
$$-mg - bv = m\frac{dv}{dt}$$

Separating variables:
$$\frac{dv}{mg + bv} = -\frac{dt}{m}$$

Integrating from $t=0$ ($v=v_0$) to time $t$:

$$\int_{v_0}^{v} \frac{dv'}{mg + bv'} = -\int_{0}^{t} \frac{dt'}{m}$$

$$\frac{1}{b}\ln\left(\frac{mg + bv}{mg + bv_0}\right) = -\frac{t}{m}$$

Solving for $v$:

$$v(t) = \left(v_0 + \frac{mg}{b}\right)e^{-\frac{bt}{m}} - \frac{mg}{b}$$

Or equivalently:

$$v(t) = v_0 e^{-\frac{bt}{m}} - \frac{mg}{b}\left(1 - e^{-\frac{bt}{m}}\right)$$

### (ii) Sketch a graph of the sphere's acceleration as a function of $t$

**Key features to include:**
- At $t = 0$: $a = -g - \frac{bv_0}{m}$ (most negative value)
- At $t = t_h$ (maximum height): $v = 0$, so $a = -g$
- As $t \to \infty$ (terminal velocity during descent): $a \to 0$
- The acceleration curve transitions smoothly from negative values to zero

---

## Related Concepts
- [[Differential Equations in Mechanics]]
- Newton's Second Law
- Terminal Velocity
- Drag Forces

## Source
AP Physics C - Mechanics (Free Response Question)
