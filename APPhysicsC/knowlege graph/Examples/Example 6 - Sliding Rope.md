# Example 6: Sliding Rope on Frictionless Table

## Problem Statement

A uniform rope of length $L$ and mass $M$ is placed on a frictionless table, with one end of the rope hanging slightly over the edge. The rope is released from rest, and at some time later there is a length $y$ of rope hanging over the edge, as shown in Figure 6.

<img src="../Assets/Figure6.jpeg" width="300%" alt="Figure 6" />
*Figure 6: Rope sliding off a frictionless table*

---

## Part (b)

**Question:** Determine an expression for the force of gravity on the hanging part of the rope as a function of $y$.

**Solution:**

The rope has uniform linear mass density:
$$\lambda = \frac{M}{L}$$

Mass of hanging part (length $y$):
$$m_{hang} = \lambda y = \frac{My}{L}$$

Force of gravity on hanging part:
$$\boxed{F_g = m_{hang} \cdot g = \frac{Mgy}{L}}$$

The direction is downward.

---

## Part (c)

**Question:** Derive an expression for the work done by gravity on the rope as a function of $y$, assuming $y$ is initially zero.

**Solution:**

As the rope slides, the hanging length increases from $0$ to $y$. The gravitational force at any intermediate position $y'$ is:
$$F_g(y') = \frac{Mgy'}{L}$$

Work done by gravity:
$$W = \int_0^y F_g(y') \, dy' = \int_0^y \frac{Mgy'}{L} \, dy'$$

$$W = \frac{Mg}{L} \cdot \frac{y^2}{2} = \frac{Mgy^2}{2L}$$

$$\boxed{W = \frac{Mgy^2}{2L}}$$

**Alternative approach using center of mass:**
The center of mass of the hanging portion moves down by $\frac{y}{2}$ (since the hanging portion grows from 0 to $y$, and its CM is at $\frac{y}{2}$ below the table).

Actually, more carefully: when length $y$ is hanging, the CM of that hanging portion is at distance $\frac{y}{2}$ below the table surface. The work equals the change in potential energy:
$$W = -\Delta U = Mg \cdot \frac{y^2}{2L}$$

---

## Part (d)

**Question:** Derive an expression for the speed $v$ of the rope as a function of $y$.

**Solution:**

Using the work-energy theorem:
$$W = \Delta K = \frac{1}{2}Mv^2 - 0$$

(The entire rope moves with the same speed $v$)

From part (c):
$$\frac{Mgy^2}{2L} = \frac{1}{2}Mv^2$$

Solving for $v$:
$$\boxed{v = y\sqrt{\frac{g}{L}}}$$

Or equivalently:
$$v = \sqrt{\frac{gy^2}{L}}$$

**Physical interpretation:** The speed is directly proportional to the hanging length $y$. When $y = L$ (entire rope hanging), $v = \sqrt{gL}$.

---

## Key Insights

1. **Variable driving force:** The gravitational force increases linearly with $y$, making this a variable acceleration problem.

2. **Energy approach:** The work-energy theorem provides a simpler solution than using Newton's second law with variable mass distribution.

3. **Center of mass:** The CM of the entire rope descends as more rope hangs over the edge, converting gravitational potential energy to kinetic energy.

4. **Comparison to free fall:** Unlike free fall where $v \propto \sqrt{h}$, here $v \propto y$ (linear in hanging length).

---

## Alternative Solution Using Newton's Second Law (not required, but illustrative)

For the entire rope (mass $M$):
$$F_{net} = Ma$$
$$\frac{Mgy}{L} = Ma$$

$$a = \frac{gy}{L}$$

Since $a = \frac{dv}{dt} = \frac{dv}{dy} \cdot \frac{dy}{dt} = v\frac{dv}{dy}$:

$$v\frac{dv}{dy} = \frac{gy}{L}$$

Separating variables and integrating:
$$\int_0^v v' \, dv' = \int_0^y \frac{gy'}{L} \, dy'$$

$$\frac{v^2}{2} = \frac{gy^2}{2L}$$

$$v = y\sqrt{\frac{g}{L}}$$

This confirms the result from the energy method.

---

## Related Concepts
- [[Conservation of Energy]]
- Work-Energy Theorem
- Variable Mass Systems
- Center of Mass

## Related Units
- [[Unit 2 Force and Translational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]

## Source
AP Physics C - Mechanics (Free Response Question)
