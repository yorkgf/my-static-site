# Example 33: Conducting Rod on Rails Driven by EMF Source

## Problem Statement

Suppose a conducting rod (mass $m$, resistance $R$) rests on two frictionless and resistanceless parallel rails a distance $\ell$ apart in a uniform magnetic field $\vec{B}$ (perpendicular to the rails and rod) as in Figure 29–53. At $t = 0$, the rod is at rest and a source of emf is connected to the points a and b. Determine the speed of the rod as a function of time if:
(a) The source puts out a **constant current** $I$
(b) The source puts out a **constant emf** $\mathcal{E}_0$
(c) Does the rod reach a terminal speed in either case? If so, what is it?

<img src="../Assets/Figure33.png" width="100%" alt="Figure 33" />
*Figure 33: Same rail-rod setup with an external EMF source connected at points a and b.*

---

## Solution

### Part (a): Constant Current Source

The magnetic force on the rod carrying current $I$:
$$F = BI\ell = \text{constant}$$

Newton's second law (rod starts from rest):
$$m\frac{dv}{dt} = BI\ell$$

Integrating:
$$\boxed{v(t) = \frac{BI\ell}{m}\,t \quad \text{(linear growth — no terminal speed)}}$$

The rod accelerates **indefinitely** at constant acceleration $a = BI\ell/m$.

**Why no terminal speed?** The back-EMF ($\mathcal{E}_{back} = Bv\ell$) grows with speed, but the current source maintains $I$ = constant regardless — it simply increases its terminal voltage to compensate. No equilibrium is reached.

### Part (b): Constant EMF Source $\mathcal{E}_0$

Now the current is determined by the circuit: the source provides $\mathcal{E}_0$, but as the rod accelerates, it generates a back-EMF $\mathcal{E}_{back} = Bv\ell$ that opposes the current.

Net driving EMF: $\mathcal{E}_{net} = \mathcal{E}_0 - Bv\ell$

Current: $i = \dfrac{\mathcal{E}_0 - Bv\ell}{R}$

Force: $F = Bi\ell = \dfrac{B\ell(\mathcal{E}_0 - Bv\ell)}{R}$

Newton's second law:
$$m\frac{dv}{dt} = \frac{B\ell}{R}(\mathcal{E}_0 - Bv\ell)$$

Define terminal velocity $v_T$: when $dv/dt = 0$:
$$0 = \mathcal{E}_0 - Bv_T\ell \implies \boxed{v_T = \frac{\mathcal{E}_0}{B\ell}}$$

The ODE $\dfrac{dv}{dt} = \dfrac{B^2\ell^2}{mR}(v_T - v)$ has solution:

$$v_T - v = (v_T - 0)e^{-t/\tau} = v_T e^{-t/\tau}$$

$$\boxed{v(t) = v_T\!\left(1 - e^{-t/\tau}\right) = \frac{\mathcal{E}_0}{B\ell}\!\left(1 - e^{-t/\tau}\right)}$$

where $\tau = \dfrac{mR}{B^2\ell^2}$ is the same time constant as in [[Example 32 - Conducting Rod on Rails Motor Braking]].

### Part (c): Terminal Speeds

| Case | Terminal Speed | Reached? |
|------|---------------|----------|
| (a) Constant current $I$ | None | No — rod accelerates forever |
| (b) Constant EMF $\mathcal{E}_0$ | $v_T = \mathcal{E}_0/(B\ell)$ | Yes — exponential approach |

**Physical interpretation for (b)**:
At terminal speed, the back-EMF exactly equals the source EMF: $Bv_T\ell = \mathcal{E}_0$. Net current → 0, net force → 0. The system is a **linear motor**!

### Comparison with Example 32

| Situation | Physics | Result |
|-----------|---------|--------|
| Ex. 32: rod decelerates | Moving rod generates braking EMF | $v = v_0 e^{-t/\tau}$ (exponential decay) |
| Ex. 33a: constant $I$ | External force with no back-EMF feedback | $v = (BI\ell/m)t$ (linear growth) |
| Ex. 33b: constant $\mathcal{E}_0$ | Back-EMF feedback reduces drive | $v = v_T(1 - e^{-t/\tau})$ (exponential rise) |

---

## Key Concepts

1. **Back-EMF**: moving conductor in B generates EMF opposing the driving source
2. **Terminal velocity**: only reached with constant EMF source (not constant current)
3. **Time constant**: $\tau = mR/(B^2\ell^2)$ — same in both braking and driving scenarios
4. **Linear motor principle**: constant EMF → rod reaches $v_T = \mathcal{E}_0/(B\ell)$

---

## Related Concepts
- [[Electromagnetic-Induction/Faraday's-Law|Faraday's Law]]
- [[Electromagnetic-Induction/Inductance|Inductance]]
- [[Electric-Circuits/DC-Circuits|DC Circuits]]
- [[Example 32 - Conducting Rod on Rails Motor Braking]]

## Related Units
- [[Electromagnetic-Induction/index|Electromagnetic Induction]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 29, Problem 53 (variant)
