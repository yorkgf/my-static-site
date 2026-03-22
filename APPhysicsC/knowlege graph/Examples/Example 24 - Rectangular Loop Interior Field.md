# Example 24: Magnetic Field Inside a Rectangular Current Loop

## Problem Statement

A single rectangular loop of wire, with sides $a$ and $b$, carries a dc current $I$. An $xy$ coordinate system has its origin at the lower left corner of the rectangle with the $x$ axis parallel to side $b$ and the $y$ axis parallel to side $a$. Determine the magnetic field $B$ at all points $(x, y)$ within the loop.

<img src="../Assets/Figure24.png" width="100%" alt="Figure 24" />
*Figure 24: Rectangular current loop with sides a (height) and b (width). Origin at lower-left, current flows counterclockwise.*

---

## Solution

### Strategy: Biot-Savart for Finite Wire Segments

For a **finite straight wire** of length carrying current $I$, the field at perpendicular distance $d$ from the wire, where the wire subtends angles $\theta_1$ and $\theta_2$ from the perpendicular at the field point, is:

$$B_{wire} = \frac{\mu_0 I}{4\pi d}(\sin\theta_1 + \sin\theta_2)$$

where $\theta_1$ and $\theta_2$ are measured from the perpendicular to the wire's endpoints (both positive when on opposite sides, as in an interior point).

Equivalently, for a wire from $x = -a$ to $x = b$ at distance $d$:
$$B = \frac{\mu_0 I}{4\pi d}\left(\frac{b}{\sqrt{b^2+d^2}} + \frac{a}{\sqrt{a^2+d^2}}\right)$$

### All Four Wire Contributions at Interior Point $(x, y)$

By the right-hand rule, all four wires create fields pointing **into the page** (−z direction) at any interior point when the current circulates counterclockwise.

**Bottom wire** (along $y = 0$, current in $+\hat{x}$, perpendicular distance $d = y$):
$$B_1 = \frac{\mu_0 I}{4\pi y}\left(\frac{x}{\sqrt{x^2+y^2}} + \frac{b-x}{\sqrt{(b-x)^2+y^2}}\right)$$

**Top wire** (along $y = a$, current in $-\hat{x}$, perpendicular distance $d = a-y$):
$$B_2 = \frac{\mu_0 I}{4\pi(a-y)}\left(\frac{x}{\sqrt{x^2+(a-y)^2}} + \frac{b-x}{\sqrt{(b-x)^2+(a-y)^2}}\right)$$

**Right wire** (along $x = b$, current in $+\hat{y}$, perpendicular distance $d = b-x$):
$$B_3 = \frac{\mu_0 I}{4\pi(b-x)}\left(\frac{y}{\sqrt{y^2+(b-x)^2}} + \frac{a-y}{\sqrt{(a-y)^2+(b-x)^2}}\right)$$

**Left wire** (along $x = 0$, current in $-\hat{y}$, perpendicular distance $d = x$):
$$B_4 = \frac{\mu_0 I}{4\pi x}\left(\frac{y}{\sqrt{y^2+x^2}} + \frac{a-y}{\sqrt{(a-y)^2+x^2}}\right)$$

### Total Field

$$\boxed{B(x,y) = B_1 + B_2 + B_3 + B_4 \quad \text{(directed into page, i.e., } -\hat{z}\text{)}}$$

where all four terms are given above.

### Special Case: Center of Square Loop ($a = b$, $x = y = a/2$)

By symmetry all four wires contribute equally:
$$B_1 = B_2 = B_3 = B_4 = \frac{\mu_0 I}{4\pi (a/2)} \cdot 2 \cdot \frac{a/2}{\sqrt{(a/2)^2+(a/2)^2}} = \frac{\mu_0 I}{2\pi a} \cdot \frac{1}{\sqrt{2}}$$

$$B_{center} = 4 \cdot \frac{\mu_0 I}{\pi a \sqrt{2}} \cdot \frac{1}{2}... = \frac{2\sqrt{2}\,\mu_0 I}{\pi a}$$

Let me simplify for the square center:
$$B_1 = \frac{\mu_0 I}{4\pi (a/2)}\cdot\frac{2(a/2)}{\sqrt{2}(a/2)} = \frac{\mu_0 I}{4\pi(a/2)} \cdot \sqrt{2} = \frac{\mu_0 I\sqrt{2}}{2\pi a}$$

$$B_{total} = 4B_1 = \frac{2\sqrt{2}\,\mu_0 I}{\pi a}$$

---

## Key Concepts

1. **Biot-Savart for finite wire**: $B = \frac{\mu_0 I}{4\pi d}(\sin\theta_1 + \sin\theta_2)$
2. **All four sides** contribute additively inside the loop (same direction by Lenz reasoning)
3. The field is **not uniform** — it's strongest near the wire corners and weaker at the center
4. At the **center of a square** ($a = b$): $B = 2\sqrt{2}\,\mu_0 I/(\pi a)$

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]
- [[Magnetic-Fields-and-Forces/Ampère's-Law|Ampère's Law]]
- [[Magnetic-Fields-and-Forces/Magnetic-Force-on-Current-Carrying-Wires|Magnetic Force on Current-Carrying Wires]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 55
