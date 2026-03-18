# Differential Equation for Simple Harmonic Motion

In AP Physics C, you need to master deriving the **differential equation for simple harmonic motion (SHM)** from Newton's second law. This is a key difference from AP Physics 1.

## Derivation of the Differential Equation

Take a mass on a spring as example:

1. Spring force: $F = -kx$
2. Newton's second law: $ma = -kx$
3. Acceleration: $a = \frac{d^2x}{dt^2}$

We get the standard differential equation:

$$\frac{d^2x}{dt^2} = -\frac{k}{m}x$$

Or written as:

$$\frac{d^2x}{dt^2} + \omega^2 x = 0$$

Where $\omega = \sqrt{\frac{k}{m}}$ is the **angular frequency**.

## General Solution

The general solution is:

$$x(t) = A\cos(\omega t + \phi)$$

Or equivalently $x(t) = A\sin(\omega t + \phi')$.

Where:
- $A$ = **amplitude** (maximum displacement)
- $\phi$ = **phase constant** (determined by initial conditions)

## Velocity and Acceleration

$$v(t) = \frac{dx}{dt} = -A\omega \sin(\omega t + \phi)$$

$$a(t) = \frac{d^2x}{dt^2} = -A\omega^2 \cos(\omega t + \phi) = -\omega^2 x$$

## Example Problem

**Example:** A mass $m = 0.5$ kg is attached to a spring with spring constant $k = 200$ N/m. Find the period of oscillation.

**Solution:**
$$\omega = \sqrt{\frac{k}{m}} = \sqrt{\frac{200}{0.5}} = \sqrt{400} = 20 \text{ rad/s}$$
$$T = \frac{2\pi}{\omega} = \frac{2\pi}{20} = 0.314 \text{ s}$$

## Other Systems with Linear Restoring Force

Any system with a force law of the form $F = -kr$ exhibits SHM. Examples include:

### Ball in Tunnel Through Planet
A ball dropped through a tunnel drilled through a uniform planet experiences a linear restoring force:
$$F = -\frac{4\pi G\rho m}{3} \cdot r$$

This leads to SHM with period $T = \sqrt{\frac{3\pi}{G\rho}}$, independent of the planet's radius!

See: [[Example 7 - Ball in Tunnel Through Planet]]

## Related Concepts
- [[Simple Harmonic Motion]] - Displacement, velocity, acceleration, and energy relationships
- [[Resonance]]
- [[Physical Pendulum]]
- [[Example 7 - Ball in Tunnel Through Planet]]
