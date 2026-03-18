# Example 3: Stone Dropped into Water with Drag Force

## Problem Statement

A student is holding a stone of mass $m$ at rest at a height $h = h_0$ above the surface of a deep pool of water, as shown in the figure. The student drops the stone into the water. Resistive forces as the stone falls in the air are negligible. As the stone falls through the water, the water exerts a resistive force $F_W$ on the stone. The magnitude of the force the water exerts on the stone is modeled by $F_W = B + kv$, where $B$ and $k$ are positive constants and $v$ is the speed of the stone.

<img src="../Assets/Figure3.jpeg" width="300%" alt="Figure 3" />
*Figure 3: Stone dropped from height into water*

---

## Motion Timeline

The following times describe the motion of the stone after it is released from rest:

- **At time $t = 0$**: The student releases the stone from rest
- **At time $t_1$**: The stone is at height $\frac{1}{2}h_0$ above the surface of the water
- **At time $t_2$**: The stone reaches the surface of the water, which is at height $h = 0$, traveling with speed $v_2$, where $v_2$ is greater than the terminal velocity of the stone in water
- **At time $t_3$**: The stone reaches its terminal velocity in the water

---

## Part (a)

**Question:** Derive an expression for the speed of the stone $v_2$ at the instant it reaches the surface of the water. Express your answer in terms of $m$, $h_0$, and physical constants, as appropriate.

**Solution:**

During free fall (air resistance negligible), mechanical energy is conserved:

$$mgh_0 = \frac{1}{2}mv_2^2$$

Solving for $v_2$:

$$v_2 = \sqrt{2gh_0}$$

---

## Part (b)

**Question:** Derive, but do NOT solve, a differential equation that could be used to find the speed $v$ of the stone as a function of time $t$ for times $t > t_2$. Express your answer in terms of $m$, $B$, $k$, $v$, $t$, and physical constants, as appropriate.

**Solution:**

For $t > t_2$ (stone in water), applying Newton's second law (taking downward as positive):

$$\sum F = ma$$
$$mg - F_W = m\frac{dv}{dt}$$
$$mg - (B + kv) = m\frac{dv}{dt}$$

Therefore, the differential equation is:

$$\boxed{m\frac{dv}{dt} = mg - B - kv}$$

Or equivalently:
$$\frac{dv}{dt} = g - \frac{B}{m} - \frac{k}{m}v$$

---

## Part (c)

**Question:** Calculate the value of speed $v_3$ of the stone at time $t_3$. Express your answer in terms of $m$, $B$, $k$, and physical constants, as appropriate.

**Solution:**

At terminal velocity ($t = t_3$), acceleration is zero:

$$\frac{dv}{dt} = 0$$

From the differential equation in part (b):

$$0 = mg - B - kv_3$$

Solving for $v_3$:

$$\boxed{v_3 = \frac{mg - B}{k}}$$

**Note:** This requires $mg > B$ for the stone to sink. If $mg < B$, the stone would float.

---

## Part (d)

**Question:** On the axes, sketch a graph of the speed $v$ of the stone as a function of time $t$ between times $t = 0$ and $t = t_3$. Explicitly label any intercepts, asymptotes, maxima, or minima with numerical values or algebraic expressions, as appropriate.

**Key Features of the Graph:**

| Feature | Description |
|---------|-------------|
| $t = 0$ to $t = t_2$ | Linear increase (constant acceleration $g$): $v = gt$ |
| $t = t_2$ | Speed $v_2 = \sqrt{2gh_0}$ (maximum speed) |
| $t > t_2$ | Exponential decay toward terminal velocity |
| Asymptote | $v = v_3 = \frac{mg - B}{k}$ (horizontal asymptote) |
| Initial slope at $t_2$ | $\frac{dv}{dt}\big|_{t_2} = g - \frac{B}{m} - \frac{k}{m}v_2$ (negative since $v_2 > v_3$) |

The speed decreases from $v_2$ and asymptotically approaches $v_3$.

---

## Related Concepts
- [[Conservation of Energy]]
- Terminal Velocity
- Drag Forces
- Free Fall
- [[Differential Equations in Mechanics]]

## Source
AP Physics C - Mechanics (Free Response Question)
