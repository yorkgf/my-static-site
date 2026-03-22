# Example 27: Helmholtz Coils

## Problem Statement

Two circular coils, each of radius $R$ and carrying the same current $I$ in the same direction, are separated by a distance equal to $R$ (their radius). This is the **Helmholtz coil** configuration. Find the magnetic field at the midpoint between the two coils, and discuss the uniformity of the field.

<img src="../Assets/Figure27.png" width="100%" alt="Figure 27" />
*Figure 27: Helmholtz coil configuration — two coils of radius R, separated by distance R, each carrying current I in the same direction.*

---

## Solution

### On-Axis Field of a Single Circular Coil

For a single circular coil (radius $R$, current $I$), the magnetic field at distance $x$ along its axis:

$$B_{coil}(x) = \frac{\mu_0 I R^2}{2(R^2 + x^2)^{3/2}}$$

### Field at the Midpoint

Place the two coils symmetrically: one at $x = -R/2$ and one at $x = +R/2$. The midpoint is at $x = 0$.

Each coil contributes equally. The distance from each coil center to the midpoint is $R/2$.

$$B_{mid} = 2 \times \frac{\mu_0 I R^2}{2\left(R^2 + \left(\frac{R}{2}\right)^2\right)^{3/2}}$$

$$= \frac{\mu_0 I R^2}{\left(R^2 + \frac{R^2}{4}\right)^{3/2}} = \frac{\mu_0 I R^2}{\left(\frac{5R^2}{4}\right)^{3/2}}$$

$$= \frac{\mu_0 I R^2}{\left(\frac{5}{4}\right)^{3/2} R^3} = \frac{\mu_0 I}{\left(\frac{5}{4}\right)^{3/2} R}$$

Since $\left(\frac{5}{4}\right)^{3/2} = \frac{5^{3/2}}{4^{3/2}} = \frac{5\sqrt{5}}{8}$:

$$\boxed{B_{mid} = \frac{8\mu_0 I}{5^{3/2} R} = \frac{8\mu_0 I}{5\sqrt{5}\,R} \approx \frac{0.7155\,\mu_0 I}{R}}$$

### Why Helmholtz Coils Produce Uniform Fields

The key to field uniformity is that the first and second derivatives of $B$ vanish at the midpoint.

For two coils at $x = \pm d/2$ (separation $d = R$):

$$B(x) = \frac{\mu_0 I R^2}{2}\left[\frac{1}{\left(R^2+(x-d/2)^2\right)^{3/2}} + \frac{1}{\left(R^2+(x+d/2)^2\right)^{3/2}}\right]$$

**First derivative**: By symmetry, $dB/dx = 0$ at $x = 0$ for **any** separation.

**Second derivative** $d^2B/dx^2 = 0$ at $x = 0$ when $d = R$:

This is the unique property of the Helmholtz geometry. Setting $d = R$ simultaneously zeros both the first and second derivatives, creating a region of nearly uniform field near the center.

**Third and higher derivatives**: $d^3B/dx^3 = 0$ by symmetry (odd derivative). The first nonzero higher-order term is $d^4B/dx^4 \neq 0$.

### Numerical Example

For $N$ turns per coil, $R = 0.10$ m, $I = 2.0$ A:
$$B_{mid} = N \cdot \frac{8\mu_0 I}{5\sqrt{5}\,R} = N \cdot \frac{8(4\pi\times10^{-7})(2.0)}{5\sqrt{5}\,(0.10)}$$
$$= N \cdot \frac{2.011\times10^{-5}}{1.118} = N \times 1.799\times10^{-5} \approx N \times 18.0 \;\mu\text{T}$$

---

## Key Concepts

1. **Helmholtz condition**: separation = radius ($d = R$) produces maximum uniformity
2. **Field magnitude**: $B = 8\mu_0 I/(5\sqrt{5}R) \approx 0.715\,\mu_0 I/R$
3. **Uniformity**: both $dB/dx$ and $d^2B/dx^2$ vanish at center — no linear or quadratic variation
4. **Applications**: NMR spectrometers, particle beam steering, calibration of sensors

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]
- [[Magnetic-Fields-and-Forces/Magnetic-Moments|Magnetic Moments]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28 (Helmholtz coil configuration)
