# Atwood Machine

The Atwood machine is a classic physics device consisting of two masses connected by a light string passing over a frictionless pulley. It is used to study uniformly accelerated motion and Newton's laws.

## Basic Setup

Two masses $m_1$ and $m_2$ (with $m_2 > m_1$) connected by a light, inextensible string over an ideal pulley:
- $m_2$ accelerates downward
- $m_1$ accelerates upward
- Both have the **same magnitude of acceleration**

## Derivation of Acceleration

For mass $m_1$ (upward positive):
$$T - m_1 g = m_1 a$$

For mass $m_2$ (downward positive):
$$m_2 g - T = m_2 a$$

Adding the equations to eliminate $T$:
$$m_2 g - m_1 g = m_1 a + m_2 a$$

$$a = \frac{(m_2 - m_1)g}{m_1 + m_2}$$

## Tension in the String

Substituting acceleration back into either equation:

From mass $m_1$:
$$T = m_1 g + m_1 a = m_1 g + m_1 \cdot \frac{(m_2 - m_1)g}{m_1 + m_2}$$

$$T = m_1 g \left(1 + \frac{m_2 - m_1}{m_1 + m_2}\right) = m_1 g \cdot \frac{2m_2}{m_1 + m_2}$$

$$T = \frac{2m_1 m_2 g}{m_1 + m_2}$$

## Special Cases

### Equal Masses ($m_1 = m_2 = m$)
$$a = 0, \quad T = mg$$
System remains in equilibrium (or moves with constant velocity)

### $m_2 \gg m_1$
$$a \approx g, \quad T \approx 2m_1 g$$
The lighter mass accelerates upward at nearly $g$

## Modified Atwood Machine

When one mass is on a horizontal surface or incline:

### Mass on Horizontal Surface with Friction
For $m_1$ on horizontal surface with friction coefficient $\mu_k$:

$$a = \frac{m_2 g - \mu_k m_1 g}{m_1 + m_2}$$

### Mass on Inclined Plane
For $m_1$ on incline with angle $\theta$:

$$a = \frac{m_2 g - m_1 g\sin\theta}{m_1 + m_2}$$
(assuming no friction)

With friction:
$$a = \frac{m_2 g - m_1 g\sin\theta - \mu_k m_1 g\cos\theta}{m_1 + m_2}$$

## Variable Mass Systems

When mass changes with time (e.g., leaking bucket), acceleration becomes time-dependent:

$$a(t) = \frac{(M_{bucket}(t) - M_{counter})g}{M_{bucket}(t) + M_{counter}}$$

This requires solving differential equations or analyzing graphs of acceleration vs. time.

## Experimental Uses

1. **Measuring $g$**: By timing the motion and using $h = \frac{1}{2}at^2$
2. **Verifying Newton's Second Law**: Testing $F = ma$ relationship
3. **Studying friction**: Adding friction to one side
4. **Variable mass studies**: Leaking sand, burning fuel, etc.

## Worked Examples

- [[Example 5 - Atwood Machine with Leaking Bucket]] - Variable mass system with time-dependent mass

## Related Concepts
- [[Unit 2 Force and Translational Dynamics Index]]
- [[Differential Equations in Mechanics]]
- [[Friction Forces]]

## Source
AP Physics C - Mechanics
