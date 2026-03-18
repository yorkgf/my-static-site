# Example 11: Lennard-Jones Potential

## Problem Statement

The potential energy of the two atoms in a diatomic (two-atom) molecule can be approximated as the **Lennard-Jones potential**:

$$U(r) = -\frac{a}{r^6} + \frac{b}{r^{12}}$$

where $r$ is the distance between the two atoms and $a$ and $b$ are positive constants.

---

## Part (a)

**Question:** At what values of $r$ is $U(r)$ a minimum? A maximum?

**Solution:**

To find extrema, take the derivative and set equal to zero:

$$\frac{dU}{dr} = \frac{6a}{r^7} - \frac{12b}{r^{13}} = 0$$

$$\frac{6a}{r^7} = \frac{12b}{r^{13}}$$

$$6a \cdot r^{13} = 12b \cdot r^7$$

$$6a \cdot r^6 = 12b$$

$$r^6 = \frac{2b}{a}$$

$$\boxed{r_{min} = \left(\frac{2b}{a}\right)^{1/6}}$$

To verify this is a minimum (not maximum), check the second derivative:

$$\frac{d^2U}{dr^2} = -\frac{42a}{r^8} + \frac{156b}{r^{14}}$$

At $r = (2b/a)^{1/6}$:

$$\frac{d^2U}{dr^2} = -\frac{42a}{(2b/a)^{8/6}} + \frac{156b}{(2b/a)^{14/6}} > 0$$

Since the second derivative is positive, this is indeed a **minimum**.

**Maximum:** As $r \to 0$, $U \to +\infty$, and as $r \to \infty$, $U \to 0$ from below. There is no finite maximum, but the local behavior shows:
- As $r \to 0$: $U \to +\infty$ (repulsive at very short distances)
- At $r = r_{min}$: $U = U_{min}$ (equilibrium separation)
- As $r \to \infty$: $U \to 0^-$ (attractive at long distances)

---

## Part (b)

**Question:** At what values of $r$ is $U(r) = 0$?

**Solution:**

Set $U(r) = 0$:
$$-\frac{a}{r^6} + \frac{b}{r^{12}} = 0$$

$$\frac{b}{r^{12}} = \frac{a}{r^6}$$

$$b = a \cdot r^6$$

$$\boxed{r_0 = \left(\frac{b}{a}\right)^{1/6}}$$

At this separation, the potential energy is zero (this is the point where the atoms are far enough that the attractive and repulsive forces balance in terms of energy).

**Note:** $r_0 < r_{min}$ since $r_{min} = (2b/a)^{1/6} = 2^{1/6} \cdot (b/a)^{1/6} \approx 1.12 \cdot r_0$.

---

## Part (c)

**Question:** Plot $U(r)$ as a function of $r$ from $r = 0$ to $r$ at a value large enough for all the features in (a) and (b) to show.

**Key Features to Include:**

| Feature | $r$ value | $U$ value |
|---------|-----------|-----------|
| $r \to 0^+$ | Approaches 0 | $U \to +\infty$ (steep repulsion) |
| Zero crossing | $r_0 = (b/a)^{1/6}$ | $U = 0$ |
| Minimum | $r_{min} = (2b/a)^{1/6}$ | $U_{min} = -\frac{a^2}{4b}$ |
| $r \to \infty$ | Approaches $\infty$ | $U \to 0^-$ (weak attraction) |

**Shape of curve:**
- Very steep positive slope near $r = 0$ (repulsive wall)
- Crosses zero at $r = r_0$
- Reaches minimum at $r = r_{min}$
- Asymptotically approaches zero from below as $r \to \infty$

---

## Part (d)

**Question:** Describe the motion of one atom with respect to the second atom when $E < 0$, and when $E > 0$.

**Solution:**

### Case 1: $E < 0$ (Bound State)

When total energy is negative, the atom is in a **bound state**:

- The atom oscillates between two turning points $r_{inner}$ and $r_{outer}$
- At turning points: $E = U(r)$, so $K = 0$ (momentarily at rest)
- Between turning points: $K = E - U(r) > 0$ (moving)
- The motion is periodic (simple harmonic for small oscillations near $r_{min}$)
- This represents a **stable molecule**

**Example:** If $E = -0.5|U_{min}|$, the atom oscillates between two radii where $U(r) = -0.5|U_{min}|$.

### Case 2: $E > 0$ (Unbound State / Scattering)

When total energy is positive:

- The atom approaches from $r = \infty$, slows down as it climbs the potential hill
- If $E > 0$, the atom has enough energy to overcome the attractive potential
- The atom reaches a distance of closest approach (where $E = U(r)$, $K = 0$)
- The atom then moves back out to $r = \infty$
- This is **scattering** - the atoms do not form a bound molecule
- The atom comes in from infinity and returns to infinity

**Physical interpretation:**
- $E < 0$: Temperature is low enough that atoms stick together (bonded)
- $E > 0$: Temperature is too high, atoms collide and bounce off

---

## Part (e)

**Question:** Let $F$ be the force one atom exerts on the other. For what values of $r$ is $F > 0$, $F < 0$, $F = 0$?

**Solution:**

Force is related to potential by:
$$F = -\frac{dU}{dr}$$

From part (a):
$$\frac{dU}{dr} = \frac{6a}{r^7} - \frac{12b}{r^{13}}$$

So:
$$F = -\frac{6a}{r^7} + \frac{12b}{r^{13}}$$

### $F = 0$ (Equilibrium):
$$-\frac{6a}{r^7} + \frac{12b}{r^{13}} = 0$$

This occurs at:
$$\boxed{r = r_{min} = \left(\frac{2b}{a}\right)^{1/6}}$$

This is the equilibrium separation where the net force is zero.

### $F > 0$ (Repulsive):
$$-\frac{6a}{r^7} + \frac{12b}{r^{13}} > 0$$

$$\frac{12b}{r^{13}} > \frac{6a}{r^7}$$

$$r^6 < \frac{2b}{a}$$

$$\boxed{r < r_{min} = \left(\frac{2b}{a}\right)^{1/6}}$$

For $r < r_{min}$, the force is **repulsive** (positive, pushing atoms apart).

### $F < 0$ (Attractive):

By similar analysis:
$$\boxed{r > r_{min} = \left(\frac{2b}{a}\right)^{1/6}}$$

For $r > r_{min}$, the force is **attractive** (negative, pulling atoms together).

---

## Part (f)

**Question:** Determine $F$ as a function of $r$.

**Solution:**

$$\boxed{F(r) = -\frac{6a}{r^7} + \frac{12b}{r^{13}} = \frac{6}{r^7}\left(\frac{2b}{r^6} - a\right)}$$

Or equivalently:
$$F(r) = \frac{12b}{r^{13}} - \frac{6a}{r^7}$$

This can also be written as:
$$F(r) = \frac{6a}{r^7}\left[\left(\frac{r_{min}}{r}\right)^6 - 1\right]$$

where $r_{min} = (2b/a)^{1/6}$.

---

## Summary Table

| Region | Force Type | Behavior |
|--------|------------|----------|
| $r < r_{min}$ | Repulsive ($F > 0$) | Atoms push apart |
| $r = r_{min}$ | Zero ($F = 0$) | Equilibrium |
| $r > r_{min}$ | Attractive ($F < 0$) | Atoms pull together |
| $r \to \infty$ | Weak attraction | Van der Waals force |

---

## Physical Significance

The Lennard-Jones potential models:
- **Short-range repulsion:** Electron cloud overlap (Pauli exclusion principle) at small $r$
- **Long-range attraction:** Van der Waals (dispersion) forces at large $r$
- **Equilibrium separation:** The bond length of the diatomic molecule
- **Dissociation energy:** $|U_{min}|$ is the energy required to break the bond

---

## Related Concepts
- [[Example 9 - Potential Energy and Turning Points]] - Similar potential energy analysis
- [[Conservation of Energy]]
- Equilibrium and Stability
- Intermolecular Forces

## Related Units
- [[Unit 2 Force and Translational Dynamics Index]]
- [[Unit 9 - Potential Energy and Turning Points|Unit 9]]

## Source
AP Physics C - Mechanics (Textbook Problem)
