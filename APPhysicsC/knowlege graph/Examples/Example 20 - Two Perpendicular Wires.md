# Example 20: Two Perpendicular Wires

## Problem Statement

Two long wires are oriented so that they are perpendicular to each other. At their closest, they are 20.0 cm apart. What is the magnitude of the magnetic field at a point midway between them if the top wire carries a current of 18.0 A and the bottom one carries 12.0 A?

<img src="../Assets/Figure20.jpeg" width="100%" alt="Figure 20" />
*Figure 20: Perpendicular wires — top wire (I_T = 18.0 A) pointing out of page, bottom wire (I_B = 12.0 A) pointing in +x direction. Point B = ? is midway at 10.0 cm from each.*

---

## Solution

### Setup

From Figure 20, the geometry is:
- **Top wire**: current $I_T = 18.0$ A directed **out of the page** (+z direction), located 10.0 cm above the midpoint P
- **Bottom wire**: current $I_B = 12.0$ A directed **to the right** (+x direction), located 10.0 cm below point P
- **Point P**: midway between the two wires

Since the wires are perpendicular to each other, their magnetic fields at P will be in **perpendicular directions** — they do not simply add or cancel.

### Field from the Top Wire (current out of page)

Using Ampère's law, the magnetic field from an infinite straight wire at distance $r$:

$$B = \frac{\mu_0 I}{2\pi r}$$

For the top wire at point P (10.0 cm directly below it, in the $-\hat{y}$ direction from the wire):

$$B_T = \frac{\mu_0 I_T}{2\pi r} = \frac{(4\pi \times 10^{-7})(18.0)}{2\pi (0.100)} = \frac{2 \times 10^{-7} \times 18.0}{0.100} = 36.0 \; \mu\text{T}$$

**Direction**: Using the right-hand rule, for current in $+\hat{z}$ at a point directly below ($-\hat{y}$):

$$\hat{B}_T = \hat{z} \times (-\hat{y}) = -(\hat{z} \times \hat{y}) = -(-\hat{x}) = +\hat{x}$$

So $\vec{B}_T = 36.0 \; \mu\text{T} \; \hat{x}$ (pointing to the right).

### Field from the Bottom Wire (current to the right)

For the bottom wire ($+\hat{x}$ direction) at point P (10.0 cm directly above it, in $+\hat{y}$):

$$B_B = \frac{\mu_0 I_B}{2\pi r} = \frac{(4\pi \times 10^{-7})(12.0)}{2\pi(0.100)} = 24.0 \; \mu\text{T}$$

**Direction**: For current in $+\hat{x}$ and field point directly above ($+\hat{y}$):

$$\hat{B}_B = \hat{x} \times \hat{y} = +\hat{z}$$

So $\vec{B}_B = 24.0 \; \mu\text{T} \; \hat{z}$ (pointing out of the page).

### Total Magnetic Field

The two fields are **orthogonal** (x and z directions):

$$\vec{B}_{total} = \vec{B}_T + \vec{B}_B = 36.0 \; \hat{x} + 24.0 \; \hat{z} \quad (\mu\text{T})$$

$$|\vec{B}_{total}| = \sqrt{B_T^2 + B_B^2} = \sqrt{(36.0)^2 + (24.0)^2} \; \mu\text{T}$$

$$= \sqrt{1296 + 576} \; \mu\text{T} = \sqrt{1872} \; \mu\text{T}$$

$$\boxed{|\vec{B}_{total}| = 43.3 \; \mu\text{T}}$$

The field makes an angle with the horizontal:

$$\theta = \arctan\!\left(\frac{B_B}{B_T}\right) = \arctan\!\left(\frac{24.0}{36.0}\right) = \arctan(0.667) = 33.7°$$

above the horizontal (in the xz-plane).

---

## Key Concepts

1. **Superposition principle**: the total field is the vector sum of individual contributions.
2. **Perpendicular wires** produce fields in perpendicular directions at the midpoint — neither parallel addition nor cancellation applies.
3. **Right-hand rule** determines the direction of B from each wire.
4. **Magnitude**: $B = \mu_0 I / (2\pi r)$ for a long straight wire.

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]
- [[Magnetic-Fields-and-Forces/Ampère's-Law|Ampère's Law]]
- [[Magnetic-Fields-and-Forces/Magnetic-Force-on-Moving-Charges|Magnetic Force on Moving Charges]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]
- [[Unit-2-Force-and-Translational-Dynamics-Index|Unit 2 Index]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 42
