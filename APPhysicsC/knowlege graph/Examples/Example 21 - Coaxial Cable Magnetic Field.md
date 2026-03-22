# Example 21: Coaxial Cable Magnetic Field

## Problem Statement

A coaxial cable consists of a solid inner conductor of radius $R_1$, surrounded by a concentric cylindrical tube of inner radius $R_2$ and outer radius $R_3$. The conductors carry equal and opposite currents $I_0$ distributed uniformly across their cross sections. Determine the magnetic field at a distance $R$ from the axis for:
- (a) $R < R_1$
- (b) $R_1 < R < R_2$
- (c) $R_2 < R < R_3$
- (d) $R > R_3$
- (e) Let $I_0 = 1.50$ A, $R_1 = 1.00$ cm, $R_2 = 2.00$ cm, $R_3 = 2.50$ cm. Graph $B$ from $R = 0$ to $R = 3.00$ cm.

<img src="../Assets/Figure21.png" width="100%" alt="Figure 21" />
*Figure 21: Coaxial cable cross-section — solid inner conductor radius R₁, hollow outer conductor with inner radius R₂ and outer radius R₃.*

---

## Solution

Apply **Ampère's Law** with a circular Amperian loop of radius $R$ centered on the axis:

$$\oint \vec{B} \cdot d\vec{\ell} = \mu_0 I_{enc} \implies B(2\pi R) = \mu_0 I_{enc}$$

By symmetry, $\vec{B}$ is tangential and uniform on any coaxial circle.

**Current densities:**
- Inner conductor: $J_{inner} = \dfrac{I_0}{\pi R_1^2}$ (into page, say $-z$)
- Outer conductor: $J_{outer} = \dfrac{I_0}{\pi(R_3^2 - R_2^2)}$ (out of page, $+z$)

### (a) $R < R_1$ — Inside Inner Conductor

$$I_{enc} = J_{inner} \cdot \pi R^2 = \frac{I_0}{\pi R_1^2} \cdot \pi R^2 = I_0 \frac{R^2}{R_1^2}$$

$$\boxed{B = \frac{\mu_0 I_0}{2\pi R_1^2} R} \quad (R < R_1)$$

The field increases **linearly** from zero at the axis.

### (b) $R_1 < R < R_2$ — Between the Conductors

All of the inner conductor is enclosed; none of the outer conductor:

$$I_{enc} = I_0$$

$$\boxed{B = \frac{\mu_0 I_0}{2\pi R}} \quad (R_1 < R < R_2)$$

The field decreases as $1/R$.

### (c) $R_2 < R < R_3$ — Inside Outer Conductor

The inner conductor contributes $+I_0$. The outer conductor (opposite current $-I_0$) contributes only the fraction up to radius $R$:

$$I_{enc,outer} = -I_0 \cdot \frac{\pi(R^2 - R_2^2)}{\pi(R_3^2 - R_2^2)} = -I_0 \frac{R^2 - R_2^2}{R_3^2 - R_2^2}$$

$$I_{enc} = I_0 - I_0 \frac{R^2 - R_2^2}{R_3^2 - R_2^2} = I_0 \left(1 - \frac{R^2 - R_2^2}{R_3^2 - R_2^2}\right) = I_0 \frac{R_3^2 - R^2}{R_3^2 - R_2^2}$$

$$\boxed{B = \frac{\mu_0 I_0}{2\pi R} \cdot \frac{R_3^2 - R^2}{R_3^2 - R_2^2}} \quad (R_2 < R < R_3)$$

### (d) $R > R_3$ — Outside Both Conductors

The net enclosed current is $I_0 + (-I_0) = 0$:

$$\boxed{B = 0} \quad (R > R_3)$$

This is the key advantage of coaxial cable — no external magnetic field.

### (e) Numerical Evaluation

With $I_0 = 1.50$ A, $R_1 = 1.00$ cm, $R_2 = 2.00$ cm, $R_3 = 2.50$ cm:

**At $R = R_1 = 1.00$ cm** (peak of inner region / start of $1/R$ region):
$$B_{max,inner} = \frac{\mu_0 I_0}{2\pi R_1} = \frac{(4\pi \times 10^{-7})(1.50)}{2\pi(0.0100)} = 30.0 \; \mu\text{T}$$

**Key values for graph:**

| $R$ (cm) | Region | $B$ ($\mu$T) |
|-----------|--------|--------------|
| 0 | Inner | 0 |
| 0.50 | Inner | 15.0 |
| 1.00 | Transition | 30.0 |
| 1.50 | Between | 20.0 |
| 2.00 | Transition | 15.0 |
| 2.25 | Outer | ~5.8 |
| 2.50 | Transition | 0 |
| 3.00 | Outside | 0 |

The graph shows: linear increase → $1/R$ decrease → drops to zero → remains zero.

---

## Key Concepts

1. **Ampère's Law** is the key tool: $B = \mu_0 I_{enc}/(2\pi R)$
2. **Linear** field inside a uniform conductor; **$1/R$** field between conductors
3. **Zero external field**: the coaxial design cancels all external B field
4. **Shielding**: this is why coaxial cables are used in electronics — no external electromagnetic interference

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Ampère's-Law|Ampère's Law]]
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 45
