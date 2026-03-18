# Example 17: Springs in Series and Parallel

## Problem Statement

A mass $m$ is connected to two springs, with spring constants $k_1$ and $k_2$, in two different ways as shown in Figure 17.

<img src="../Assets/Figure17.jpeg" width="300%" alt="Figure 17" />
*Figure 17: Springs in series (a) and parallel (b) configurations*

**Show that:**
- The period for the configuration shown in part (a) is given by: $T = 2\pi\sqrt{m\left(\frac{1}{k_1} + \frac{1}{k_2}\right)}$
- The period for the configuration shown in part (b) is given by: $T = 2\pi\sqrt{\frac{m}{k_1 + k_2}}$

---

## Part (a): Springs in Series

### Setup

In configuration (a), the springs are connected end-to-end (in series). When the mass is displaced by $x$:
- Spring 1 stretches by $x_1$
- Spring 2 stretches by $x_2$
- Total displacement: $x = x_1 + x_2$

### Finding the Effective Spring Constant

**Key insight:** In series, both springs experience the **same force** (tension), but different extensions.

$$F = k_1 x_1 = k_2 x_2$$

From this:
$$x_1 = \frac{F}{k_1}, \quad x_2 = \frac{F}{k_2}$$

Total extension:
$$x = x_1 + x_2 = F\left(\frac{1}{k_1} + \frac{1}{k_2}\right)$$

The effective spring constant $k_{eff}$ is defined by $F = k_{eff} x$:

$$\frac{1}{k_{eff}} = \frac{1}{k_1} + \frac{1}{k_2}$$

$$k_{eff} = \frac{k_1 k_2}{k_1 + k_2}$$

### Period of Oscillation

For a mass-spring system:
$$T = 2\pi\sqrt{\frac{m}{k_{eff}}} = 2\pi\sqrt{m \cdot \frac{1}{k_{eff}}}$$

Substituting:
$$\boxed{T = 2\pi\sqrt{m\left(\frac{1}{k_1} + \frac{1}{k_2}\right)}}$$

**Physical interpretation:** Springs in series are "softer" than either individual spring. The effective spring constant is less than both $k_1$ and $k_2$, resulting in a longer period.

---

## Part (b): Springs in Parallel

### Setup

In configuration (b), the springs are connected side-by-side (in parallel), both attached to the mass and to fixed walls. When the mass is displaced by $x$:
- Both springs stretch by the same amount $x$
- Spring 1 exerts force $F_1 = k_1 x$
- Spring 2 exerts force $F_2 = k_2 x$

### Finding the Effective Spring Constant

**Key insight:** In parallel, both springs have the **same extension**, but exert different forces. The total force is the sum.

$$F_{total} = F_1 + F_2 = k_1 x + k_2 x = (k_1 + k_2)x$$

The effective spring constant:
$$k_{eff} = k_1 + k_2$$

### Period of Oscillation

$$T = 2\pi\sqrt{\frac{m}{k_{eff}}} = 2\pi\sqrt{\frac{m}{k_1 + k_2}}$$

$$\boxed{T = 2\pi\sqrt{\frac{m}{k_1 + k_2}}}$$

**Physical interpretation:** Springs in parallel are "stiffer" than either individual spring. The effective spring constant is the sum, resulting in a shorter period.

---

## Comparison and Summary

| Configuration | Effective $k$ | Period | Relative Stiffness |
|---------------|---------------|--------|-------------------|
| Series (a) | $k_{eff} = \frac{k_1 k_2}{k_1 + k_2}$ | $T = 2\pi\sqrt{m(\frac{1}{k_1} + \frac{1}{k_2})}$ | Softer |
| Parallel (b) | $k_{eff} = k_1 + k_2$ | $T = 2\pi\sqrt{\frac{m}{k_1 + k_2}}$ | Stiffer |

### Special Case: Identical Springs ($k_1 = k_2 = k$)

**Series:**
$$k_{eff} = \frac{k \cdot k}{k + k} = \frac{k}{2}$$
$$T = 2\pi\sqrt{\frac{2m}{k}} = \sqrt{2} \cdot T_0$$

where $T_0 = 2\pi\sqrt{m/k}$ is the period with a single spring.

**Parallel:**
$$k_{eff} = k + k = 2k$$
$$T = 2\pi\sqrt{\frac{m}{2k}} = \frac{T_0}{\sqrt{2}}$$

---

## Analogies with Electrical Circuits

There's a useful analogy between springs and electrical components:

| Springs | Electrical | Formula |
|---------|------------|---------|
| Series | Parallel capacitors | $\frac{1}{k_{eff}} = \frac{1}{k_1} + \frac{1}{k_2}$ |
| Parallel | Series capacitors | $k_{eff} = k_1 + k_2$ |

Or alternatively:
- Springs in series $\leftrightarrow$ Resistors in series (add reciprocals)
- Springs in parallel $\leftrightarrow$ Resistors in parallel (add directly)

---

## Key Concepts

1. **Series Springs:** Same force, different extensions → add reciprocals of $k$
2. **Parallel Springs:** Same extension, different forces → add $k$ directly
3. **Effective Spring Constant:** Allows treating multiple springs as a single equivalent spring
4. **Period Formula:** $T = 2\pi\sqrt{m/k_{eff}}$ applies to both configurations

---

## Related Concepts
- [[Differential Equation for SHM]]
- Springs and Hooke's Law
- Simple Harmonic Motion
- Equivalent Systems

## Related Units
- [[Unit 7 Oscillations Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
