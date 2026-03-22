# Example 28: Current-Carrying Wires Suspended by Strings

## Problem Statement

Two long straight aluminum wires, each of diameter 0.42 mm, carry the same current but in opposite directions. They are suspended by 0.50-m-long strings from a common point as shown. If the suspension strings make an angle of 3.0° with the vertical and are hanging freely, what is the current in the wires?

<img src="../Assets/Figure28.png" width="100%" alt="Figure 28" />
*Figure 28: Two parallel wires (opposite currents I₁ and I₂) suspended from a common point by 0.50-m strings making 3.0° with vertical.*

---

## Solution

### Setup

- String length: $L = 0.50$ m
- Angle from vertical: $\theta = 3.0°$
- Wire diameter: $d_{wire} = 0.42$ mm, so radius $= 0.21$ mm
- Aluminum density: $\rho_{Al} = 2.70 \times 10^3$ kg/m$^3$
- Since opposite currents, the **magnetic force is repulsive** (wires push apart)

### Wire Separation

The two wires are separated by:
$$d = 2L\sin\theta = 2(0.50)\sin(3.0°) = 1.00 \times 0.05234 = 0.05234 \text{ m}$$

### Force Balance

For a long wire in equilibrium, consider forces per unit length:

**Weight per unit length** of aluminum wire:
$$\lambda g = \rho_{Al} \cdot A \cdot g = \rho_{Al} \cdot \pi r^2 \cdot g$$
$$= (2.70 \times 10^3) \cdot \pi (0.21 \times 10^{-3})^2 \cdot 9.80$$
$$= (2.70 \times 10^3) \cdot (1.385 \times 10^{-7}) \cdot 9.80$$
$$= 3.669 \times 10^{-3} \text{ N/m}$$

**Magnetic repulsion per unit length** between two parallel wires carrying opposite currents $I$ at separation $d$:
$$\frac{F_{mag}}{L} = \frac{\mu_0 I^2}{2\pi d}$$

**Equilibrium condition** (the string angle balances gravity against magnetic repulsion — note that for a long wire, the string is attached at the top and the weight per unit length determines the angle):

$$\tan\theta = \frac{F_{mag}/L}{\lambda g} = \frac{\mu_0 I^2/(2\pi d)}{\rho_{Al}\pi r^2 g}$$

Note: the wire length cancels, confirming this ratio is independent of wire length.

### Solving for Current

$$I^2 = \frac{2\pi d \cdot \rho_{Al} \pi r^2 g \cdot \tan\theta}{\mu_0}$$

$$I^2 = \frac{2\pi (0.05234)(2.70\times10^3)(\pi)(0.21\times10^{-3})^2(9.80)\tan(3.0°)}{4\pi\times10^{-7}}$$

Compute numerator:
$$2\pi \times 0.05234 \times 2.70\times10^3 \times 1.385\times10^{-7} \times 9.80 \times 0.05241$$

Step by step:
$$= 2\pi \times 0.05234 \times 3.669\times10^{-3} \times 0.05241$$
$$= 2\pi \times 0.05234 \times 1.924\times10^{-4}$$
$$= 2\pi \times 1.007\times10^{-5}$$
$$= 6.327\times10^{-5}$$

$$I^2 = \frac{6.327\times10^{-5}}{4\pi\times10^{-7}} = \frac{6.327\times10^{-5}}{1.2566\times10^{-6}} = 50.3$$

$$\boxed{I = \sqrt{50.3} \approx 7.1 \text{ A}}$$

### Physical Interpretation

The 3° angle represents a balance between the downward gravitational pull (from the wire's own weight) and the horizontal magnetic repulsion between opposite currents. The geometry ensures the wire length cancels — only mass per unit length and magnetic force per unit length matter.

---

## Key Concepts

1. **Opposite currents repel** — the wires push apart
2. **Force per unit length**: $F/L = \mu_0 I^2/(2\pi d)$ for parallel wires
3. **Wire length cancels** in the equilibrium — only mass per unit length and force per unit length matter
4. **String geometry** gives separation: $d = 2L\sin\theta$

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Force-on-Current-Carrying-Wires|Magnetic Force on Current-Carrying Wires]]
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]
- [[Magnetic-Fields-and-Forces/Ampère's-Law|Ampère's Law]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 66
