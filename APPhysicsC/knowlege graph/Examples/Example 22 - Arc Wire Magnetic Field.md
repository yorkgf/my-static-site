# Example 22: Wire with Two Arcs — Magnetic Field at Center

## Problem Statement

A wire, in a plane, has the shape shown: two arcs of a circle connected by radial lengths of wire. Determine $\vec{B}$ at point C in terms of $R_1$, $R_2$, $\theta$, and the current $I$.

<img src="../Assets/Figure22.png" width="100%" alt="Figure 22" />
*Figure 22: Two circular arcs (radii R₁ and R₂, subtending angle θ at point C) connected by radial wire segments.*

---

## Solution

### Key Observation: Radial Segments Contribute Zero Field

For any segment of wire directed radially toward or away from point C, the element $d\vec{\ell}$ is **parallel** (or antiparallel) to the unit vector $\hat{r}$ from the element to C.

By the Biot-Savart Law:
$$d\vec{B} = \frac{\mu_0 I}{4\pi} \frac{d\vec{\ell} \times \hat{r}}{r^2}$$

Since $d\vec{\ell} \parallel \hat{r}$, the cross product $d\vec{\ell} \times \hat{r} = 0$.

**The radial wire segments produce no magnetic field at C.** Only the two circular arcs contribute.

### Field from a Circular Arc

For a circular arc of radius $R$ subtending angle $\theta$ (in radians) at center C, carrying current $I$, each element satisfies $d\ell = R\,d\varphi$ and $r = R$, with $d\vec{\ell} \perp \hat{r}$:

$$B_{arc} = \int_0^\theta \frac{\mu_0 I}{4\pi R^2} R\,d\varphi = \frac{\mu_0 I \theta}{4\pi R}$$

### Directions at Point C

From Figure 22, analyzing the current flow:
- **Inner arc** (radius $R_1$, current flowing counterclockwise as viewed): By the right-hand rule, the field at C points **into the page** (away from viewer), with magnitude:
$$B_1 = \frac{\mu_0 I \theta}{4\pi R_1}$$

- **Outer arc** (radius $R_2$, current flowing clockwise): The field at C points **out of the page** (toward viewer), with magnitude:
$$B_2 = \frac{\mu_0 I \theta}{4\pi R_2}$$

Since $R_1 < R_2$, we have $B_1 > B_2$.

### Net Field at C

The two contributions are in **opposite** directions. Taking "into the page" as positive:

$$B_{net} = B_1 - B_2 = \frac{\mu_0 I \theta}{4\pi R_1} - \frac{\mu_0 I \theta}{4\pi R_2}$$

$$\boxed{\vec{B}_C = \frac{\mu_0 I \theta}{4\pi}\left(\frac{1}{R_1} - \frac{1}{R_2}\right) \text{, directed into the page}}$$

### Physical Check

- If $R_1 \to R_2$: $B \to 0$ ✓ (the two arcs cancel)
- If $R_2 \to \infty$: $B \to \mu_0 I\theta/(4\pi R_1)$ ✓ (just the inner arc, as expected for a full loop when $\theta = 2\pi$: $B = \mu_0 I/(2R_1)$)

---

## Key Concepts

1. **Biot-Savart Law** for a circular arc: $B = \mu_0 I\theta/(4\pi R)$
2. **Radial segments** contribute zero field at the center
3. **Superposition**: fields from arcs in opposite directions subtract
4. For a **full circle** ($\theta = 2\pi$): $B = \mu_0 I/(2R)$ — the standard result

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]
- [[Magnetic-Fields-and-Forces/Ampère's-Law|Ampère's Law]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 46
