# Example 25: Force on Rectangular Loop Near a Straight Wire

## Problem Statement

A rectangular loop of wire is placed next to a straight wire. There is a dc current of 3.5 A in both wires. Determine the magnitude and direction of the net force on the loop.

<img src="../Assets/Figure25.png" width="100%" alt="Figure 25" />
*Figure 25: Straight wire (top) and rectangular loop below it. Both carry 3.5 A to the right. Loop dimensions: 10.0 cm wide × 5.0 cm tall, separated 3.0 cm from straight wire.*

---

## Solution

### Setup

From Figure 25:
- Straight wire: $I_1 = 3.5$ A (flowing to the right)
- Rectangular loop: $I_2 = 3.5$ A, width $L = 10.0$ cm = 0.100 m, height $h = 5.0$ cm = 0.050 m
- Distance from wire to top side of loop: $d_1 = 3.0$ cm = 0.030 m
- Distance from wire to bottom side of loop: $d_2 = d_1 + h = 3.0 + 5.0 = 8.0$ cm = 0.080 m

The force per unit length between two parallel wires carrying currents $I_1$ and $I_2$ at separation $d$:
$$\frac{F}{L} = \frac{\mu_0 I_1 I_2}{2\pi d}$$

**Attractive** when currents are parallel; **repulsive** when antiparallel.

### Forces on Each Side of the Loop

**Left and right sides** (vertical segments, length $h = 0.050$ m):
These are **perpendicular** to the straight wire. Their contributions cancel by symmetry (equal and opposite horizontal forces).

**Top side** (horizontal, length $L = 0.100$ m, current to the right — **same** direction as $I_1$, distance $d_1$):

$$F_{top} = \frac{\mu_0 I_1 I_2 L}{2\pi d_1} = \frac{(4\pi \times 10^{-7})(3.5)(3.5)(0.100)}{2\pi(0.030)}$$

$$= \frac{2 \times 10^{-7} \times 12.25 \times 0.100}{0.030} = \frac{2.45 \times 10^{-7}}{0.030} = 8.17 \times 10^{-6} \text{ N}$$

Direction: **attractive** (toward the straight wire, upward) ↑

**Bottom side** (horizontal, length $L = 0.100$ m, current to the left — **opposite** direction to $I_1$, distance $d_2$):

$$F_{bottom} = \frac{\mu_0 I_1 I_2 L}{2\pi d_2} = \frac{(4\pi \times 10^{-7})(3.5)(3.5)(0.100)}{2\pi(0.080)}$$

$$= \frac{2 \times 10^{-7} \times 12.25 \times 0.100}{0.080} = \frac{2.45 \times 10^{-7}}{0.080} = 3.06 \times 10^{-6} \text{ N}$$

Direction: **repulsive** (away from the straight wire, downward) ↓

### Net Force

The top side attracts upward and the bottom side repels downward — both in the **upward** direction toward the straight wire:

$$F_{net} = F_{top} - F_{bottom} = 8.17 \times 10^{-6} - 3.06 \times 10^{-6} = 5.11 \times 10^{-6} \text{ N}$$

**Combined formula:**
$$F_{net} = \frac{\mu_0 I_1 I_2 L}{2\pi}\left(\frac{1}{d_1} - \frac{1}{d_2}\right) = \frac{2 \times 10^{-7} \times 12.25 \times 0.100 \times (33.3 - 12.5)}{1}$$

$$= 2.45 \times 10^{-8} \times 20.83 = 5.10 \times 10^{-7} \cdot 10 \approx 5.1 \times 10^{-6} \text{ N}$$

$$\boxed{F_{net} \approx 5.1 \times 10^{-6} \text{ N} = 5.1\;\mu\text{N, directed toward the straight wire (upward)}}$$

---

## Key Concepts

1. **Parallel currents attract; antiparallel currents repel**
2. The **net force** on a current loop near a wire is always toward the wire when the loop's near side is parallel to the wire's current
3. **Symmetry cancels** the forces on the two side (vertical) segments
4. Force formula: $F = \mu_0 I_1 I_2 L/(2\pi d)$

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Force-on-Current-Carrying-Wires|Magnetic Force on Current-Carrying Wires]]
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]
- [[Magnetic-Fields-and-Forces/Ampère's-Law|Ampère's Law]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 40
