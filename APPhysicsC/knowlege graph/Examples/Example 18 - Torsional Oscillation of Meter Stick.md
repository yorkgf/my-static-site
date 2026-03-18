# Example 18: Torsional Oscillation of a Meter Stick

## Problem Statement

A meter stick is hung at its center from a thin wire. It is twisted and oscillates with a period of 5.0 s. The meter stick is sawed off to a length of 70.0 cm and is again balanced at its center and set in oscillation. With what period does it oscillate?

<img src="../Assets/Figure18.jpeg" width="300%" alt="Figure 18" />
*Figure 18: (a) Full meter stick oscillating; (b) Shortened stick oscillating*

---

## Solution

### Understanding the Problem

This is a **torsional pendulum** problem. The meter stick oscillates by twisting about a vertical axis through its center, with the wire providing a restoring torque.

For a torsional pendulum:
$$\tau = -\kappa\theta$$

where $\kappa$ is the torsional constant of the wire.

The equation of motion is:
$$I\frac{d^2\theta}{dt^2} = -\kappa\theta$$

This gives angular SHM with period:
$$T = 2\pi\sqrt{\frac{I}{\kappa}}$$

### Key Insight

The torsional constant $\kappa$ depends only on the wire, not on the object attached. So $\kappa$ remains the same when we shorten the stick.

### Moment of Inertia

For a thin rod of mass $M$ and length $L$, rotating about its center (perpendicular to the rod):
$$I = \frac{1}{12}ML^2$$

Since the stick is uniform and we keep the same material:
- Mass is proportional to length: $M \propto L$
- So if we cut the stick to $L' = \frac{7}{10}L$, the new mass is $M' = \frac{7}{10}M$

**Original moment of inertia:**
$$I_1 = \frac{1}{12}M(1.00)^2$$

**New moment of inertia:**
$$I_2 = \frac{1}{12}M'(0.70)^2 = \frac{1}{12}\left(\frac{7}{10}M\right)\left(\frac{7}{10}\right)^2(1.00)^2$$

$$I_2 = \frac{1}{12}M(1.00)^2 \times \frac{7}{10} \times \frac{49}{100}$$

Wait, let me be more careful. Let $L_0 = 1.00$ m and $L_1 = 0.70$ m.

Mass of shortened stick:
$$M_1 = M_0 \times \frac{L_1}{L_0} = M_0 \times \frac{0.70}{1.00} = 0.70M_0$$

New moment of inertia:
$$I_1 = \frac{1}{12}M_1L_1^2 = \frac{1}{12}(0.70M_0)(0.70)^2 = \frac{1}{12}M_0(0.70)^3$$

Original moment of inertia:
$$I_0 = \frac{1}{12}M_0(1.00)^2 = \frac{1}{12}M_0$$

So:
$$\frac{I_1}{I_0} = \frac{(0.70)^3}{1} = 0.343$$

Actually, let's be more careful about the scaling:

$$I \propto ML^2$$

Since $M \propto L$ (same linear density):
$$I \propto L \cdot L^2 = L^3$$

So:
$$\frac{I_1}{I_0} = \left(\frac{L_1}{L_0}\right)^3 = (0.70)^3 = 0.343$$

### Finding the New Period

For the original stick:
$$T_0 = 2\pi\sqrt{\frac{I_0}{\kappa}} = 5.0 \text{ s}$$

For the shortened stick:
$$T_1 = 2\pi\sqrt{\frac{I_1}{\kappa}} = 2\pi\sqrt{\frac{I_0 \cdot 0.343}{\kappa}}$$

$$T_1 = T_0 \sqrt{0.343} = 5.0 \times \sqrt{0.343}$$

$$T_1 = 5.0 \times 0.586 = 2.93 \text{ s}$$

Or more precisely:
$$\sqrt{0.343} = \sqrt{\frac{343}{1000}} = \frac{\sqrt{343}}{\sqrt{1000}} \approx \frac{18.52}{31.62} \approx 0.586$$

Actually, $(0.7)^3 = 0.343$ and $\sqrt{0.343} = 0.7^{1.5} = 0.7\sqrt{0.7}$.

$$\sqrt{0.7} \approx 0.837$$
$$T_1 = 5.0 \times 0.7 \times 0.837 = 5.0 \times 0.586 = 2.93 \text{ s}$$

Or we can write:
$$T_1 = T_0 \left(\frac{L_1}{L_0}\right)^{3/2} = 5.0 \times (0.70)^{1.5}$$

$$(0.70)^{1.5} = 0.7 \times \sqrt{0.7} = 0.7 \times 0.8367 = 0.586$$

$$T_1 = 5.0 \times 0.586 = 2.93 \text{ s}$$

$$\boxed{T_1 \approx 2.9 \text{ s}}$$

Or with more significant figures:
$$\boxed{T_1 = 2.93 \text{ s} \approx 2.9 \text{ s}}$$

---

## General Formula

For a torsional pendulum with a uniform rod of length $L$:

$$T \propto L^{3/2}$$

This is because:
- $I \propto L^3$ (since $M \propto L$ and $I \propto ML^2$)
- $T \propto \sqrt{I} \propto \sqrt{L^3} = L^{3/2}$

---

## Key Concepts

1. **Torsional Pendulum:** Oscillation due to twisting of a suspension wire
2. **Restoring Torque:** $\tau = -\kappa\theta$, where $\kappa$ is the torsional constant
3. **Period Formula:** $T = 2\pi\sqrt{I/\kappa}$
4. **Moment of Inertia of a Rod:** $I = \frac{1}{12}ML^2$ about its center
5. **Scaling:** For uniform rods, $I \propto L^3$, so $T \propto L^{3/2}$

---

## Related Concepts
- [[Physical Pendulum]]
- [[Moment of Inertia]]
- Simple Harmonic Motion
- Torsional Oscillator

## Related Units
- [[Unit 7 Oscillations Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
