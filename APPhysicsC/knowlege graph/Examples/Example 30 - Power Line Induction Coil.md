# Example 30: Power Line Induction — Farmer's Coil

## Problem Statement

A power line carrying a sinusoidally varying current with frequency $f = 60$ Hz and peak value $I_0 = 125$ A runs at a height of 7.0 m across a farmer's land. The farmer constructs a vertical 2.0-m-high, 2000-turn rectangular wire coil below the power line to harvest the induced voltage. The farmer needs a peak voltage $V_0 = 170$ V at $f = 60$ Hz to power 120-V electrical equipment. Estimate the length $\ell$ of the coil needed. Would this be stealing?

<img src="../Assets/Figure30.png" width="100%" alt="Figure 30" />
*Figure 30: Power line at height 7.0 m carrying I₀ = 125 A at 60 Hz. Rectangular coil (2000 turns, height 2.0 m, length ℓ) sits at ground level.*

---

## Solution

### Setup

- Power line: $I(t) = I_0\sin(2\pi f t)$, height $h_0 = 7.0$ m
- Farmer's coil: $N = 2000$ turns, height $h = 2.0$ m (spans from ground $y=0$ to $y = 2.0$ m), length $\ell$
- Distance from power line to top of coil: $7.0 - 2.0 = 5.0$ m
- Distance from power line to bottom of coil: $7.0$ m

### Magnetic Flux Through One Turn

The field from the power line at height $y$ from the ground (distance $7.0 - y$ from wire):

$$B(y,t) = \frac{\mu_0 I(t)}{2\pi(7.0 - y)}$$

Flux through one turn (width $\ell$, integrating vertically from $y = 0$ to $y = 2.0$ m):

$$\Phi_1 = \int_0^{2.0} B(y,t) \cdot \ell \, dy = \frac{\mu_0 I(t) \ell}{2\pi} \int_0^{2.0} \frac{dy}{7.0 - y}$$

$$= \frac{\mu_0 I(t) \ell}{2\pi} \Big[-\ln(7.0-y)\Big]_0^{2.0}$$

$$= \frac{\mu_0 I(t) \ell}{2\pi} \left[\ln(7.0) - \ln(5.0)\right] = \frac{\mu_0 I(t) \ell}{2\pi} \ln\!\left(\frac{7.0}{5.0}\right)$$

$$= \frac{\mu_0 I(t) \ell}{2\pi} \ln(1.4)$$

### Total Flux (N turns)

$$\Phi_{total} = N \Phi_1 = \frac{N\mu_0 \ell \ln(1.4)}{2\pi} \cdot I_0\sin(2\pi ft)$$

### Induced EMF

By Faraday's law:
$$\mathcal{E} = -\frac{d\Phi_{total}}{dt} = -\frac{N\mu_0\ell\ln(1.4)}{2\pi} \cdot I_0 \cdot 2\pi f \cos(2\pi ft)$$

$$\mathcal{E}(t) = -N\mu_0 I_0 f\,\ell\,\ln(1.4)\cos(2\pi ft)$$

Peak (amplitude) of EMF:
$$V_0 = N\mu_0 I_0 f\,\ell\,\ln(1.4)$$

### Solving for Coil Length

$$\ell = \frac{V_0}{N\mu_0 I_0 f \ln(1.4)}$$

$$\ln(1.4) = 0.3365$$

$$\ell = \frac{170}{(2000)(4\pi\times10^{-7})(125)(60)(0.3365)}$$

Compute denominator step by step:
$$= 2000 \times 4\pi\times10^{-7} \times 125 \times 60 \times 0.3365$$
$$= 2000 \times 1.2566\times10^{-6} \times 7500 \times 0.3365$$
$$= 2000 \times 1.2566\times10^{-6} \times 2524$$
$$= 2000 \times 3.172\times10^{-3}$$
$$= 6.343$$

$$\boxed{\ell = \frac{170}{6.343} \approx 26.8 \text{ m}}$$

### Would It Be Stealing?

**Yes**, harvesting power from a power line using electromagnetic induction without authorization constitutes theft of electricity in most jurisdictions. The induced current is ultimately powered by the utility company's generators. Even though the farmer doesn't physically tap into the line, extracting usable power from the field reduces (by a tiny amount) the energy delivered through the line — and it is done without compensation.

Interestingly, the 170 V / 120 V AC equipment would require only 120 V rms, with peak $V_0 = 120\sqrt{2} \approx 170$ V — so the farmer correctly wants a 170-V peak coil to run standard American electrical equipment.

---

## Key Concepts

1. **Faraday's Law**: $\mathcal{E} = -d\Phi/dt$ — changing current in nearby wire induces EMF
2. **Flux integration**: non-uniform $B$ requires integration over the coil area
3. **Peak EMF**: $V_0 = N\mu_0 I_0 f\,\ell\,\ln(b_1/b_2)$ where $b_1, b_2$ are distances to coil edges
4. **Sinusoidal drive**: $\cos(2\pi ft)$ phase shifts the induced EMF by 90° relative to the source current

---

## Related Concepts
- [[Electromagnetic-Induction/Faraday's-Law|Faraday's Law]]
- [[Electromagnetic-Induction/Magnetic-Flux|Magnetic Flux]]
- [[Electromagnetic-Induction/Inductance|Inductance]]

## Related Units
- [[Electromagnetic-Induction/index|Electromagnetic Induction]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 29, Problem 51
