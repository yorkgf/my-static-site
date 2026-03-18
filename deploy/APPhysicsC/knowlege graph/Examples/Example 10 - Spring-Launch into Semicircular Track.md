# Example 10: Spring-Launch into Semicircular Track

## Problem Statement

A block of mass $m$ is placed on top of an ideal spring of spring constant $k$. The block is pushed against the spring, compressing the spring a distance $\Delta x$. The block is released from rest, leaves the spring at the position shown in the figure, travels upward, and enters a semicircular track of radius $R$ that has negligible friction. The block enters the track at point A, maintains contact with the track, and exits horizontally at point B, a distance $3R$ above the point the block was released. The block then falls to the ground and lands a horizontal distance $D$ from the end of the track.

<img src="../Assets/Figure10.jpeg" width="300%" alt="Figure 10" />
*Figure 10: Block launched by spring into semicircular track*

---

## Part (b)

### (i) Derive an expression for the speed $v$ of the block at point B

**Solution:**

Using conservation of mechanical energy from release to point B:

**Initial energy (at release):**
$$E_i = \frac{1}{2}k(\Delta x)^2$$
(Gravitational potential energy reference: $U = 0$ at release point)

**Final energy (at point B):**
$$E_f = \frac{1}{2}mv^2 + mg(3R)$$

Setting $E_i = E_f$:
$$\frac{1}{2}k(\Delta x)^2 = \frac{1}{2}mv^2 + 3mgR$$

Solving for $v$:
$$\frac{1}{2}mv^2 = \frac{1}{2}k(\Delta x)^2 - 3mgR$$

$$\boxed{v = \sqrt{\frac{k(\Delta x)^2}{m} - 6gR}}$$

Or equivalently:
$$v = \sqrt{\frac{k(\Delta x)^2 - 6mgR}{m}}$$

### (ii) Derive an expression for the magnitude of the net force $F$ on the block at point B

**Solution:**

At point B (top of the semicircular track), the forces on the block are:
- Gravity: $mg$ (downward)
- Normal force from track: $N$ (downward, since block is at top of loop)

For circular motion, the net force toward the center (downward) provides centripetal acceleration:
$$F_{net} = mg + N = \frac{mv^2}{R}$$

The net force magnitude is:
$$\boxed{F_{net} = \frac{mv^2}{R} = \frac{k(\Delta x)^2 - 6mgR}{R}}$$

Or:
$$F_{net} = \frac{k(\Delta x)^2}{R} - 6mg$$

---

## Part (c)

**Question:** Derive an expression for the minimum value of $\Delta x_{min}$ required in order for the block to maintain contact with the track through point B.

**Solution:**

The block maintains contact with the track when $N \geq 0$. The minimum condition is $N = 0$ (block just barely stays on track).

At point B with $N = 0$:
$$mg = \frac{mv_{min}^2}{R}$$

$$v_{min}^2 = gR$$

Using energy conservation with this minimum speed:
$$\frac{1}{2}k(\Delta x_{min})^2 = \frac{1}{2}mv_{min}^2 + 3mgR$$

$$\frac{1}{2}k(\Delta x_{min})^2 = \frac{1}{2}m(gR) + 3mgR$$

$$\frac{1}{2}k(\Delta x_{min})^2 = \frac{mgR}{2} + 3mgR = \frac{7mgR}{2}$$

Solving for $\Delta x_{min}$:

$$\boxed{\Delta x_{min} = \sqrt{\frac{7mgR}{k}}}$$

**Physical interpretation:** If the spring is compressed less than this value, the block will not have enough speed at the top and will lose contact with the track before reaching point B.

---

## Part (d)

**Question:** Calculate the distance $D$ that the block travels horizontally from point B to the ground.

**Solution:**

From point B, the block is moving horizontally with speed $v$ (from part b) at height $3R$ above the ground.

**Vertical motion:**
$$y = y_0 + v_{0y}t + \frac{1}{2}a_y t^2$$

Taking downward as positive, starting from $y = 0$:
$$3R = 0 + \frac{1}{2}gt^2$$

$$t = \sqrt{\frac{6R}{g}}$$

**Horizontal motion:**
$$D = v \cdot t = v\sqrt{\frac{6R}{g}}$$

Substituting $v = \sqrt{\frac{k(\Delta x)^2}{m} - 6gR}$:

$$\boxed{D = \sqrt{\left(\frac{k(\Delta x)^2}{m} - 6gR\right)\frac{6R}{g}}}$$

Or:
$$D = \sqrt{\frac{6Rk(\Delta x)^2}{mg} - 36R^2}$$

**For the special case of minimum compression** ($\Delta x = \Delta x_{min} = \sqrt{7mgR/k}$):

$$v_{min} = \sqrt{gR}$$

$$D = \sqrt{gR} \cdot \sqrt{\frac{6R}{g}} = \sqrt{6R^2} = R\sqrt{6}$$

---

## Summary of Key Results

| Quantity | Expression |
|----------|------------|
| Speed at B | $v = \sqrt{\frac{k(\Delta x)^2}{m} - 6gR}$ |
| Net force at B | $F_{net} = \frac{k(\Delta x)^2}{R} - 6mg$ |
| Minimum compression | $\Delta x_{min} = \sqrt{\frac{7mgR}{k}}$ |
| Horizontal distance | $D = \sqrt{\frac{6Rk(\Delta x)^2}{mg} - 36R^2}$ |

---

## Key Concepts

1. **Energy Conservation:** Mechanical energy is conserved (no friction)
2. **Circular Motion:** At the top of the loop, minimum speed requires $v \geq \sqrt{gR}$
3. **Projectile Motion:** After leaving the track, the block follows a parabolic trajectory
4. **Critical Condition:** Losing contact means normal force becomes zero

---

## Related Concepts
- [[Conservation of Energy]]
- Circular Motion and Centripetal Force
- Projectile Motion
- Springs and Elastic Potential Energy

## Related Units
- [[Unit 2 Force and Translational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]

## Source
AP Physics C - Mechanics (Free Response Question)
