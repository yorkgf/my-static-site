# Example 9: Potential Energy and Turning Points

## Problem Statement

A particle moves where its potential energy is given by:
$$U(r) = U_0\left[\left(\frac{2}{r^2}\right) - \left(\frac{1}{r}\right)\right]$$
where $r$ is the radial distance and $U_0$ is a positive constant with units of energy.

**(a)** Plot $U(r)$ versus $r$. Where does the curve cross the $U(r) = 0$ axis? At what value of $r$ does the minimum value of $U(r)$ occur?

**(b)** Suppose that the particle has an energy of $E = -0.050U_0$. Mark on your graph the approximate turning points of the motion of the particle. What is the maximum kinetic energy of the particle, and for what value of $r$ does this occur?

---

## Part (a): Analysis of Potential Energy Function

### Finding Where $U(r) = 0$

Set $U(r) = 0$:
$$U_0\left(\frac{2}{r^2} - \frac{1}{r}\right) = 0$$

$$\frac{2}{r^2} = \frac{1}{r}$$

$$2 = r$$

$$\boxed{r = 2 \text{ (in whatever units $r$ is measured)}}$$

The curve crosses the $U(r) = 0$ axis at $\boxed{r = 2}$.

### Finding the Minimum of $U(r)$

Take the derivative and set equal to zero:
$$\frac{dU}{dr} = U_0\left(-\frac{4}{r^3} + \frac{1}{r^2}\right) = 0$$

$$-\frac{4}{r^3} + \frac{1}{r^2} = 0$$

$$\frac{1}{r^2} = \frac{4}{r^3}$$

$$r = 4$$

$$\boxed{r = 4 \text{ (location of minimum potential energy)}}$$

### Value at Minimum

$$U(4) = U_0\left(\frac{2}{16} - \frac{1}{4}\right) = U_0\left(\frac{1}{8} - \frac{1}{4}\right) = U_0\left(-\frac{1}{8}\right)$$

$$\boxed{U_{min} = -\frac{U_0}{8} = -0.125U_0}$$

### Behavior Analysis

| Region | Behavior |
|--------|----------|
| $r \to 0^+$ | $U \to +\infty$ (dominated by $2/r^2$ term) |
| $r = 2$ | $U = 0$ |
| $r = 4$ | $U = -0.125U_0$ (minimum) |
| $r \to \infty$ | $U \to 0^-$ (from negative side) |

The potential has a **Lennard-Jones-like** shape with repulsion at small $r$ and weak attraction at large $r$.

---

## Part (b): Motion with $E = -0.050U_0$

### Finding Turning Points

Turning points occur where $E = U(r)$, i.e., where kinetic energy is zero.

$$-0.050U_0 = U_0\left(\frac{2}{r^2} - \frac{1}{r}\right)$$

$$-0.050 = \frac{2}{r^2} - \frac{1}{r}$$

Multiply by $r^2$:
$$-0.050r^2 = 2 - r$$

$$0.050r^2 - r + 2 = 0$$

Multiply by 20:
$$r^2 - 20r + 40 = 0$$

Using the quadratic formula:
$$r = \frac{20 \pm \sqrt{400 - 160}}{2} = \frac{20 \pm \sqrt{240}}{2} = \frac{20 \pm 15.49}{2}$$

$$r_1 = \frac{20 - 15.49}{2} = \frac{4.51}{2} = 2.26$$

$$r_2 = \frac{20 + 15.49}{2} = \frac{35.49}{2} = 17.7$$

$$\boxed{r_{inner} \approx 2.3 \text{ and } r_{outer} \approx 18}$$

(Using significant figures appropriate to the given energy value)

### Physical Interpretation

- For $r < r_{inner}$: $U(r) > E$, so this region is **forbidden**
- For $r_{inner} < r < r_{outer}$: $U(r) < E$, so motion is **allowed**
- For $r > r_{outer}$: $U(r) > E$, so this region is **forbidden**

The particle oscillates between the inner and outer turning points.

### Maximum Kinetic Energy

Kinetic energy is maximum where potential energy is minimum:
$$K_{max} = E - U_{min}$$

$$K_{max} = (-0.050U_0) - (-0.125U_0)$$

$$K_{max} = -0.050U_0 + 0.125U_0 = 0.075U_0$$

$$\boxed{K_{max} = 0.075U_0 \text{ at } r = 4}$$

---

## Summary and Key Results

| Quantity | Value |
|----------|-------|
| Zero of $U(r)$ | $r = 2$ |
| Minimum of $U(r)$ | $r = 4$, $U_{min} = -0.125U_0$ |
| Inner turning point ($E = -0.050U_0$) | $r \approx 2.3$ |
| Outer turning point ($E = -0.050U_0$) | $r \approx 18$ |
| Maximum kinetic energy | $K_{max} = 0.075U_0$ at $r = 4$ |

---

## Physical Interpretation

This potential is similar to the **Lennard-Jones potential** used to model interatomic forces:
- The $2/r^2$ term represents short-range repulsion (like Pauli exclusion)
- The $-1/r$ term represents long-range attraction (like van der Waals forces)

The particle with $E = -0.050U_0$ is in a **bound state**, oscillating between two turning points, similar to a planet in orbit or an electron in an atom (classically).

---

## Key Concepts

1. **Turning Points:** Locations where $E = U(r)$ and $K = 0$; the particle reverses direction
2. **Classically Forbidden Regions:** Where $E < U(r)$, kinetic energy would be negative (impossible)
3. **Bound States:** When $E < 0$ (for potentials that go to zero at infinity), the particle is trapped
4. **Energy Conservation:** $E = K + U = \text{constant}$

---

## Related Concepts
- [[Conservation of Energy]]
- [[Universal Gravitation]]
- Effective Potential in Orbital Mechanics
- Lennard-Jones Potential
- [[Example 11 - Lennard-Jones Potential]] - Similar potential energy analysis for intermolecular forces

## Related Units
- [[Unit 2 Force and Translational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
