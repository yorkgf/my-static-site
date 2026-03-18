# Physical Pendulum

A **physical pendulum** is a rigid body that oscillates about a fixed pivot point. This is a topic specific to AP Physics C (AP Physics 1 only covers the simple pendulum).

## Equation of Motion

From the rotational form of Newton's second law $\tau = I\alpha$:

$$-mgd\sin\theta = I\frac{d^2\theta}{dt^2}$$

Where:
- $m$ = mass of the rigid body
- $d$ = distance from pivot to center of mass
- $I$ = moment of inertia about the pivot axis
- $\theta$ = angular displacement from equilibrium

## Small Angle Approximation

For small angles, $\sin\theta \approx \theta$:

$$\frac{d^2\theta}{dt^2} + \frac{mgd}{I}\theta = 0$$

This is the differential equation for **simple harmonic motion** with angular frequency $\omega = \sqrt{\frac{mgd}{I}}$. The **period** is:

$$T = 2\pi\sqrt{\frac{I}{mgd}}$$

## Comparison with Simple Pendulum

A simple pendulum is a special case of the physical pendulum: $I = md^2$. Substituting gives $T = 2\pi\sqrt{\frac{d}{g}}$, which matches the familiar formula.

## Example Problem

**Example:** A uniform rod of length $L = 1$ m oscillates about one end. Find the period for small angle oscillations.

**Solution:**
Moment of inertia of a uniform rod about one end: $I = \frac{1}{3}mL^2$
Distance from pivot to center of mass: $d = L/2$

$$T = 2\pi\sqrt{\frac{I}{mgd}} = 2\pi\sqrt{\frac{\frac{1}{3}mL^2}{mg(L/2)}} = 2\pi\sqrt{\frac{2L}{3g}}$$
$$= 2\pi\sqrt{\frac{2 \times 1}{3 \times 9.8}} \approx 1.64 \text{ s}$$

## Related Concepts
- [[Simple Harmonic Motion]]
- [[Differential Equation for SHM]]
- [[Moment of Inertia]]
- [[Example 18 - Torsional Oscillation of Meter Stick]] - Similar oscillation period analysis with moment of inertia
- [[Example 18 - Torsional Oscillation of Meter Stick]] - Similar oscillation period analysis with moment of inertia
