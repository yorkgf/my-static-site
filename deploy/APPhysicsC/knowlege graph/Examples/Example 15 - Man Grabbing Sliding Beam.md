# Example 15: Man Grabbing Sliding Beam (Conservation of Angular Momentum)

## Problem Statement

A 260-kg beam 2.7 m in length slides broadside down the ice with a speed of 18 m/s. A 65-kg man at rest grabs one end as it goes past and hangs on as both he and the beam go spinning down the ice. Assume frictionless motion.

<img src="../Assets/Figure15.jpeg" width="300%" alt="Figure 15" />
*Figure 15: Man grabbing a sliding beam*

Determine:
- **(a)** How fast does the center of mass of the system move after the collision?
- **(b)** With what angular velocity does the system rotate about its CM?

---

## Part (a): Speed of the Center of Mass

**Analysis:**

Since there are no external horizontal forces (frictionless ice), linear momentum is conserved.

**Before collision:**
- Beam: $M = 260$ kg, $v_0 = 18$ m/s
- Man: $m = 65$ kg, $v = 0$ (at rest)

**After collision:**
- Combined system moves with velocity $v_{CM}$

**Conservation of linear momentum:**
$$p_{initial} = p_{final}$$

$$Mv_0 + m(0) = (M + m)v_{CM}$$

$$v_{CM} = \frac{Mv_0}{M + m}$$

**Numerical calculation:**
$$v_{CM} = \frac{260 \times 18}{260 + 65} = \frac{4680}{325} = 14.4 \text{ m/s}$$

$$\boxed{v_{CM} = 14.4 \text{ m/s}}$$

**Physical interpretation:** The CM slows down because the man was at rest and the beam has to "drag" him along, sharing its momentum.

---

## Part (b): Angular Velocity About the CM

**Analysis:**

Since there are no external torques about the CM (frictionless surface, and gravity acts through the CM), angular momentum about the CM is conserved.

**Step 1: Find the location of the CM after collision**

Let the origin be at the man (who grabs one end of the beam). The beam extends from $x = 0$ to $x = L = 2.7$ m.

The CM of the beam alone is at $x_{beam} = L/2 = 1.35$ m.

The CM of the combined system:
$$x_{CM} = \frac{m(0) + M(L/2)}{m + M} = \frac{260 \times 1.35}{325} = \frac{351}{325} = 1.08 \text{ m}$$

So the CM is located 1.08 m from the man (and 1.35 - 1.08 = 0.27 m from the beam's center).

**Step 2: Calculate initial angular momentum about the final CM**

Before the collision, the beam is moving with velocity $v_0 = 18$ m/s. The angular momentum of the beam about the final CM is:

$$L_{initial} = I_{beam} \omega_{beam} + \text{orbital angular momentum}$$

Actually, it's easier to use: $L = r \times p$ for each mass element.

For a point on the beam at position $x$ (measured from the man), its distance from the CM is $(x - x_{CM})$. The velocity is $v_0$ to the right.

Angular momentum of a small mass element $dm$:
$$dL = (x - x_{CM}) \cdot dm \cdot v_0$$

Integrating over the beam:
$$L_{initial} = \int_0^L (x - x_{CM}) \cdot \frac{M}{L}dx \cdot v_0$$

$$L_{initial} = \frac{Mv_0}{L} \left[\frac{x^2}{2} - x_{CM}x\right]_0^L$$

$$L_{initial} = \frac{Mv_0}{L} \left(\frac{L^2}{2} - x_{CM}L\right)$$

$$L_{initial} = Mv_0\left(\frac{L}{2} - x_{CM}\right)$$

Substituting:
$$L_{initial} = 260 \times 18 \times (1.35 - 1.08)$$

$$L_{initial} = 4680 \times 0.27 = 1263.6 \text{ kg·m}^2/\text{s}$$

**Alternative calculation using parallel axis theorem:**

Angular momentum = $I_{CM} \cdot 0$ (no rotation initially) + $Mv_0 \cdot d$ (orbital angular momentum about the CM)

where $d$ is the distance from the beam's CM to the system's CM.

$$d = \frac{L}{2} - x_{CM} = 1.35 - 1.08 = 0.27 \text{ m}$$

Wait, actually the beam's CM is at 1.35 m from the man, and the system's CM is at 1.08 m from the man. So the beam's CM is 0.27 m from the system's CM.

The man is at $x = 0$, so he is 1.08 m from the system's CM.

Initial angular momentum about the system's CM:
- From the beam: $L_{beam} = M v_0 \cdot (1.35 - 1.08) = 260 \times 18 \times 0.27$
- From the man: $L_{man} = m \cdot 0 \cdot 1.08 = 0$ (he's at rest)

$$L_{initial} = 1263.6 \text{ kg·m}^2/\text{s}$$

**Step 3: Calculate final moment of inertia about the CM**

After the collision, the system rotates about its CM.

Moment of inertia of the beam about the system's CM (using parallel axis theorem):
$$I_{beam} = I_{cm,beam} + Md^2 = \frac{1}{12}ML^2 + M(0.27)^2$$

$$I_{beam} = \frac{1}{12}(260)(2.7)^2 + 260(0.27)^2$$

$$I_{beam} = \frac{260 \times 7.29}{12} + 260 \times 0.0729$$

$$I_{beam} = 158.0 + 18.95 = 176.95 \text{ kg·m}^2$$

Moment of inertia of the man (treated as a point mass):
$$I_{man} = m(1.08)^2 = 65 \times 1.1664 = 75.82 \text{ kg·m}^2$$

Total moment of inertia:
$$I_{total} = 176.95 + 75.82 = 252.77 \text{ kg·m}^2$$

**Step 4: Conservation of angular momentum**

$$L_{initial} = L_{final}$$

$$1263.6 = I_{total} \cdot \omega$$

$$\omega = \frac{1263.6}{252.77} = 5.0 \text{ rad/s}$$

$$\boxed{\omega \approx 5.0 \text{ rad/s}}$$

---

## Summary of Results

| Quantity | Value |
|----------|-------|
| Speed of CM | $v_{CM} = 14.4$ m/s |
| Angular velocity | $\omega = 5.0$ rad/s |

---

## Key Concepts

1. **Conservation of Linear Momentum:** No external horizontal forces → $p$ conserved
2. **Conservation of Angular Momentum:** No external torques about CM → $L$ conserved
3. **Center of Mass:** The CM of the combined system shifts toward the more massive object
4. **Parallel Axis Theorem:** Used to calculate moment of inertia about the new CM

---

## Related Concepts
- [[Conservation of Angular Momentum]]
- [[Center of Mass]]
- [[Moment of Inertia]]
- Parallel Axis Theorem

## Related Units
- [[Unit 5 Torque and Rotational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
