# Example 32: Conducting Rod on Rails — Magnetic Braking

## Problem Statement

A conducting rod rests on two long frictionless parallel rails in a magnetic field $\vec{B}$ (perpendicular to the rails and rod) as in Figure 29–53.
(a) If the rails are horizontal and the rod is given an initial push, will the rod travel at constant speed even though a magnetic field is present?
(b) Suppose at $t = 0$, when the rod has speed $v = v_0$, the two rails are connected electrically by a wire from point a to point b. Assuming the rod has resistance $R$ and the rails have negligible resistance, determine the speed of the rod as a function of time. Discuss your answer.

<img src="../Assets/Figure32.png" width="100%" alt="Figure 32" />
*Figure 32: Conducting rod on frictionless parallel rails separated by length ℓ, in uniform field B (out of page). At t = 0 the rails are connected by a wire (resistance R).*

---

## Solution

### Part (a): Open-Circuit Situation

**Before** the rails are connected, the circuit is open — there is no conducting path for current to flow.

When the rod moves at speed $v$, an EMF $\mathcal{E} = Bv\ell$ is induced. However, with an open circuit, **no current flows** ($I = 0$). Since $\vec{F}_{mag} = I\ell\vec{B}$ and $I = 0$:

$$\vec{F}_{mag} = 0$$

**Yes, the rod travels at constant speed** (no friction, no magnetic braking force). The rod behaves as if the field were absent. Energy is not dissipated because no current flows.

### Part (b): Closed Circuit — Exponential Deceleration

At $t = 0$: rails connected, rod speed $= v_0$.

**EMF induced** as rod moves with speed $v(t)$:
$$\mathcal{E} = B\ell v$$

**Current** (rod resistance $R$, rail resistance negligible):
$$I = \frac{\mathcal{E}}{R} = \frac{B\ell v}{R}$$

**Braking force** (by Lenz's law, opposing motion):
$$F_{brake} = -B I \ell = -\frac{B^2\ell^2}{R} v$$

**Newton's second law**:
$$m\frac{dv}{dt} = -\frac{B^2\ell^2}{R}v$$

This is a first-order linear ODE. Separating variables:
$$\frac{dv}{v} = -\frac{B^2\ell^2}{mR}\,dt$$

Integrating with initial condition $v(0) = v_0$:

$$\boxed{v(t) = v_0 \exp\!\left(-\frac{B^2\ell^2}{mR}\,t\right) = v_0 e^{-t/\tau}}$$

where the **time constant** is:
$$\tau = \frac{mR}{B^2\ell^2}$$

### Discussion

1. **Exponential decay**: the rod slows down asymptotically — it never fully stops in finite time
2. **Kinetic energy dissipated**: all initial kinetic energy $\frac{1}{2}mv_0^2$ is converted to heat in resistance $R$
3. **Time constant** $\tau = mR/(B^2\ell^2)$: larger mass or resistance → slower decay; stronger field or longer rod → faster decay
4. **Magnetic damping**: This is the principle behind eddy current brakes used in trains and roller coasters

### Energy Verification

Total energy dissipated:
$$E = \int_0^\infty I^2 R\,dt = \int_0^\infty \frac{(Bv\ell)^2}{R}\,dt = \frac{B^2\ell^2 v_0^2}{R}\int_0^\infty e^{-2t/\tau}\,dt = \frac{B^2\ell^2 v_0^2}{R}\cdot\frac{\tau}{2} = \frac{1}{2}mv_0^2 \checkmark$$

---

## Key Concepts

1. **Open circuit → no braking**: without closed circuit, induced EMF does no work
2. **Closed circuit → exponential decay**: $v(t) = v_0 e^{-t/\tau}$
3. **Lenz's law**: induced current always creates force opposing the rod's motion
4. **Energy conservation**: kinetic energy converts to Joule heat

---

## Related Concepts
- [[Electromagnetic-Induction/Faraday's-Law|Faraday's Law]]
- [[Electromagnetic-Induction/Magnetic-Flux|Magnetic Flux]]
- [[Electric-Circuits/DC-Circuits|DC Circuits]]

## Related Units
- [[Electromagnetic-Induction/index|Electromagnetic Induction]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 29, Problem 53
