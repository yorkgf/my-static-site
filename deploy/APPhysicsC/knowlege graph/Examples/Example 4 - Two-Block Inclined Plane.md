# Example 4: Two-Block System on Inclined Plane

## Problem Statement

Students set up a system of two blocks and an inclined plane, as shown in the figure. Block 1 of mass $M_1$ is on a surface that is inclined at an angle $\theta$ to the horizontal. The friction between block 1 and the surface is negligible. A string is attached to block 1, extends over an ideal pulley, and is then attached to block 2 of mass $M_2$.

<img src="../Assets/Figure4.jpeg" width="300%" alt="Figure 4" />
*Figure 4: Two-block system on inclined plane*

---

## Part (a)

**Question:** In an initial setup, $M_1 = 3M$ and $M_2 = M$. Calculate the value of $\theta$ that would allow the system to remain in equilibrium.

**Solution:**

For equilibrium, net force on each block must be zero.

For block 1 (on incline):
- Tension $T$ up the incline
- Component of gravity down the incline: $M_1 g \sin\theta = 3Mg\sin\theta$

For block 2 (hanging):
- Tension $T$ upward
- Weight $M_2 g = Mg$ downward

Equilibrium conditions:
$$T = 3Mg\sin\theta \quad \text{(Block 1)}$$
$$T = Mg \quad \text{(Block 2)}$$

Setting equal:
$$3Mg\sin\theta = Mg$$
$$\sin\theta = \frac{1}{3}$$

$$\boxed{\theta = \sin^{-1}\left(\frac{1}{3}\right) \approx 19.5°}$$

---

## Part (b)

**Question:** The original inclined plane is now replaced with one that has a rough surface. The coefficients of static and kinetic friction between block 1 and the surface are $\mu_s$ and $\mu_k$, respectively. Block 1 is again chosen so that $M_1 = M$. Derive an expression for the maximum value of $M_2$ that would allow this system to remain in equilibrium.

**Solution:**

With friction, the system can remain in equilibrium over a range of $M_2$ values.

Forces on block 1 ($M_1 = M$):
- Normal force: $N = Mg\cos\theta$
- Maximum static friction (down the incline, opposing potential motion): $f_{s,max} = \mu_s N = \mu_s Mg\cos\theta$
- Component of gravity down the incline: $Mg\sin\theta$

For maximum $M_2$, friction acts down the incline (helping gravity hold block 1):

$$T = Mg\sin\theta + \mu_s Mg\cos\theta$$

For block 2:
$$T = M_2 g$$

Setting equal:
$$M_2 g = Mg\sin\theta + \mu_s Mg\cos\theta$$

$$\boxed{M_{2,max} = M(\sin\theta + \mu_s\cos\theta)}$$

---

## Part (c)

Block 2 of mass $M_2$ is now chosen such that block 1 will accelerate up the inclined plane.

### (i) Derive an expression for the magnitude of the acceleration of block 1

**Solution:**

When block 1 accelerates up the incline, kinetic friction acts down the incline.

For block 1 (up the incline = positive):
$$T - Mg\sin\theta - \mu_k Mg\cos\theta = Ma$$

For block 2 (downward = positive):
$$M_2 g - T = M_2 a$$

Adding equations to eliminate $T$:
$$M_2 g - Mg\sin\theta - \mu_k Mg\cos\theta = (M + M_2)a$$

Solving for $a$:

$$\boxed{a = \frac{M_2 g - Mg\sin\theta - \mu_k Mg\cos\theta}{M + M_2}}$$

Or:
$$a = \frac{g(M_2 - M\sin\theta - \mu_k M\cos\theta)}{M + M_2}$$

### (ii) Derive an expression for the tension in the string

**Solution:**

Using the equation for block 2:
$$T = M_2 g - M_2 a = M_2(g - a)$$

Substituting the expression for $a$:

$$T = M_2 g - M_2 \cdot \frac{M_2 g - Mg\sin\theta - \mu_k Mg\cos\theta}{M + M_2}$$

$$T = M_2 g \left(1 - \frac{M_2 - M\sin\theta - \mu_k M\cos\theta}{M + M_2}\right)$$

$$T = M_2 g \cdot \frac{M + M_2 - M_2 + M\sin\theta + \mu_k M\cos\theta}{M + M_2}$$

$$\boxed{T = \frac{M_2 g(M + M\sin\theta + \mu_k M\cos\theta)}{M + M_2}}$$

Or:
$$T = \frac{M M_2 g(1 + \sin\theta + \mu_k\cos\theta)}{M + M_2}$$

---

## Related Concepts
- [[Friction Forces]]
- Inclined Planes
- Connected Systems
- [[Atwood Machine]]

## Source
AP Physics C - Mechanics (Free Response Question)
